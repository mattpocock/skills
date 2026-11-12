#!/usr/bin/env node
// The default animatic pipeline: HTML frames -> PNG (Playwright), lines ->
// speech (Kokoro, local), PNG + speech -> MP4 (ffmpeg).
//
//   node animatic.mjs setup
//   node animatic.mjs render <storyboard.json> [--sheet <sheet.png>] [--only 3,4]
//   node animatic.mjs speak  <storyboard.json> [--voice af_heart] [--tts-command "<cmd>"]
//   node animatic.mjs stitch <storyboard.json> [-o animatic.mp4] [--gap 0.3]
//   node animatic.mjs build  <storyboard.json> [all of the above]
//
// A storyboard is a JSON array, one entry per moment, in playback order.
// Paths are relative to the storyboard file:
//
//   { "say": "spoken line", "html": "frames/01.html" }   render + voice
//   { "say": "spoken line", "image": "shots/02.png" }    your own frame
//   { "audio": "takes/03.wav", "html": "frames/03.html" } your own speech
//   { "seconds": 2, "image": "end.png" }                  a silent hold
//
// Everything generated lands in a `build/` folder beside the storyboard.
// Dependencies live in one shared folder, $ANIMATIC_HOME (default
// ~/.cache/animatic), so every project reuses one install and one model.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const HOME = process.env.ANIMATIC_HOME ?? path.join(os.homedir(), ".cache", "animatic");
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const DEFAULT_VOICE = "af_heart";
const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

const die = (message) => {
  console.error(`animatic: ${message}`);
  process.exit(1);
};

// ---------------------------------------------------------------- arguments

const [verb, storyboardArg, ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i++) {
  const key = rest[i].replace(/^-+/, "");
  const next = rest[i + 1];
  if (next === undefined || next.startsWith("-")) flags[key] = true;
  else flags[key] = rest[++i];
}

// ---------------------------------------------------------------- deps

const deps = createRequire(path.join(HOME, "package.json"));

const load = (name) => {
  try {
    return deps(name);
  } catch {
    die(`cannot find "${name}" in ${HOME}. Run: node ${process.argv[1]} setup`);
  }
};

const have = (bin) => spawnSync(bin, ["-version"], { stdio: "ignore" }).status === 0;

const setup = () => {
  for (const bin of ["ffmpeg", "ffprobe"]) {
    if (!have(bin)) die(`${bin} is not on PATH. Install ffmpeg (brew install ffmpeg / apt install ffmpeg / winget install ffmpeg) and run setup again.`);
  }
  fs.mkdirSync(HOME, { recursive: true });
  if (!fs.existsSync(path.join(HOME, "package.json"))) {
    fs.writeFileSync(path.join(HOME, "package.json"), JSON.stringify({ name: "animatic-deps", private: true }, null, 2));
  }
  const run = (cmd, args) => {
    console.log(`$ ${cmd} ${args.join(" ")}`);
    const r = spawnSync(cmd, args, { cwd: HOME, stdio: "inherit", shell: process.platform === "win32" });
    if (r.status !== 0) die(`${cmd} failed`);
  };
  run("npm", ["install", "--no-fund", "--no-audit", "playwright", "kokoro-js"]);
  run("npx", ["playwright", "install", "chromium"]);
  console.log(`\nReady. Dependencies are in ${HOME}.`);
};

// ---------------------------------------------------------------- storyboard

const readStoryboard = () => {
  if (!storyboardArg) die(`usage: animatic.mjs ${verb} <storyboard.json>`);
  const file = path.resolve(storyboardArg);
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    die(`cannot read ${file}: ${e.message}`);
  }
  if (!Array.isArray(entries) || entries.length === 0) die("the storyboard must be a non-empty JSON array");
  const dir = path.dirname(file);
  const build = path.join(dir, "build");
  fs.mkdirSync(path.join(build, "voice"), { recursive: true });
  const at = (p) => (p === undefined ? undefined : path.resolve(dir, p));
  const moments = entries.map((e, i) => {
    const n = i + 1;
    const where = `entry ${n}`;
    if (!!e.html === !!e.image) die(`${where}: give exactly one of "html" or "image"`);
    if (e.say === undefined && e.audio === undefined && e.seconds === undefined) die(`${where}: give "say", "audio" or "seconds"`);
    const m = {
      n,
      say: e.say,
      html: at(e.html),
      image: at(e.image),
      audio: at(e.audio),
      seconds: e.seconds,
      png: e.image ? at(e.image) : path.join(build, `${String(n).padStart(2, "0")}.png`),
    };
    for (const p of [m.html, m.image, m.audio]) if (p && !fs.existsSync(p)) die(`${where}: no such file ${p}`);
    return m;
  });
  return { dir, build, moments };
};

const only = () => (flags.only ? new Set(String(flags.only).split(",").map(Number)) : null);

// ---------------------------------------------------------------- render

const render = async ({ build, moments }) => {
  const { chromium } = load("playwright");
  const browser = await chromium.launch();
  const pick = only();
  const todo = moments.filter((m) => m.html && (!pick || pick.has(m.n)));
  const warnings = [];
  try {
    for (const m of todo) {
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(pathToFileURL(m.html).href, { waitUntil: "networkidle", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      // Content cut off by an overflow:hidden box is the commonest broken frame.
      const cut = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const s = getComputedStyle(el);
          if (s.overflowX !== "hidden" && s.overflowY !== "hidden") continue;
          const name = `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : ""}`;
          if (el.scrollHeight > el.clientHeight + 4) out.push(`${name} (${el.scrollHeight - el.clientHeight}px cut at the bottom)`);
          // An ellipsis box (a file tree entry, a URL bar) clips on purpose.
          if (s.textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 4) out.push(`${name} (${el.scrollWidth - el.clientWidth}px cut at the right)`);
        }
        return out;
      });
      await page.screenshot({ path: m.png });
      await page.close();
      if (errors.length) warnings.push(`${m.n}: page error: ${errors[0]}`);
      for (const c of cut) warnings.push(`${m.n}: overflow, content cut in ${c}`);
      console.log(`rendered ${m.n} -> ${path.relative(process.cwd(), m.png)}`);
    }
    if (flags.sheet) await sheet(browser, moments, path.resolve(String(flags.sheet)));
  } finally {
    await browser.close();
  }
  for (const w of warnings) console.warn(`WARN ${w}`);
};

// A contact sheet: every frame, numbered, in order. One image to judge a run.
const sheet = async (browser, moments, out) => {
  const tiles = moments
    .map((m) => {
      const src = fs.existsSync(m.png) ? pathToFileURL(m.png).href : "";
      const line = (m.say ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return `<figure><img src="${src}"><figcaption><b>${m.n}</b> ${line}</figcaption></figure>`;
    })
    .join("");
  const html = `<!doctype html><style>
    body{margin:0;background:#222;font:16px/1.3 system-ui,sans-serif;color:#ddd}
    main{display:grid;grid-template-columns:repeat(4,480px);gap:16px;padding:16px}
    figure{margin:0} img{width:480px;height:270px;display:block;background:#000;object-fit:contain}
    figcaption{padding:6px 2px;height:3.9em;overflow:hidden} b{color:#fbbf24;margin-right:6px}
  </style><main>${tiles}</main>`;
  const tmp = path.join(path.dirname(out), ".sheet.html");
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: 4 * 480 + 5 * 16, height: 400 } });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
  fs.rmSync(tmp);
  console.log(`sheet -> ${path.relative(process.cwd(), out)}`);
};

// ---------------------------------------------------------------- speak

// Speech is cached by line + voice (or command), so a revision re-voices only
// the lines it changed.
const voiceFile = (build, m, key) => path.join(build, "voice", createHash("sha1").update(`${key}\n${m.say}`).digest("hex").slice(0, 16) + ".wav");

const speak = async ({ build, moments }) => {
  const todo = moments.filter((m) => m.say !== undefined && !m.audio);
  const command = flags["tts-command"];
  const voice = String(flags.voice ?? DEFAULT_VOICE);
  const key = command ? `cmd:${command}` : `kokoro:${voice}`;
  let tts;
  for (const m of todo) {
    m.audio = voiceFile(build, m, key);
    if (fs.existsSync(m.audio)) continue;
    if (command) {
      // Any engine: the line arrives on stdin and as {text}. {out} is a path
      // with no extension: the command writes {out}.wav, {out}.mp3, {out}.aiff,
      // whatever its tool produces, and it is converted to WAV here.
      const base = m.audio.replace(/\.wav$/, ".src");
      const quoted = (s) => `'${s.replace(/'/g, `'\\''`)}'`;
      const cmd = command.replaceAll("{out}", quoted(base)).replaceAll("{text}", quoted(m.say));
      const r = spawnSync(cmd, { input: m.say, shell: true, stdio: ["pipe", "inherit", "inherit"] });
      const written = fs.readdirSync(path.dirname(base)).filter((f) => f.startsWith(path.basename(base)));
      if (r.status !== 0 || written.length === 0) die(`entry ${m.n}: tts command wrote nothing at ${base}.*: ${cmd}`);
      const raw = path.join(path.dirname(base), written[0]);
      execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-ar", "48000", "-ac", "1", m.audio]);
      fs.rmSync(raw);
    } else {
      if (!tts) {
        const kokoroDeps = createRequire(deps.resolve("kokoro-js"));
        kokoroDeps("@huggingface/transformers").env.cacheDir = path.join(HOME, "models");
        const { KokoroTTS } = load("kokoro-js");
        console.log("loading Kokoro (the first run downloads ~90MB)...");
        tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, { dtype: "q8", device: "cpu" });
      }
      const audio = await tts.generate(m.say, { voice });
      await audio.save(m.audio);
    }
    console.log(`voiced ${m.n} (${duration(m.audio).toFixed(2)}s)`);
  }
};

// ---------------------------------------------------------------- stitch

const duration = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

const stitch = ({ dir, build, moments }) => {
  const gap = Number(flags.gap ?? 0.3);
  const out = path.resolve(String(flags.o ?? flags.out ?? path.join(dir, "animatic.mp4")));
  // speak() fills m.audio for spoken lines; when stitching alone, find the cache.
  const command = flags["tts-command"];
  const key = command ? `cmd:${command}` : `kokoro:${String(flags.voice ?? DEFAULT_VOICE)}`;
  const inputs = [];
  const filters = [];
  const timeline = [];
  let t = 0;
  moments.forEach((m, i) => {
    if (!fs.existsSync(m.png)) die(`entry ${m.n}: no frame at ${m.png}. Run render first.`);
    if (m.say !== undefined && !m.audio) m.audio = voiceFile(build, m, key);
    if (m.audio && !fs.existsSync(m.audio)) die(`entry ${m.n}: no speech yet. Run speak first.`);
    const speech = m.audio ? duration(m.audio) : 0;
    const seconds = Number((m.seconds ?? speech + gap).toFixed(3));
    const frames = Math.max(1, Math.round(seconds * FPS));
    inputs.push("-framerate", String(FPS), "-i", m.png);
    if (m.audio) inputs.push("-i", m.audio);
    else inputs.push("-f", "lavfi", "-t", String(seconds), "-i", "anullsrc=r=48000:cl=stereo");
    filters.push(
      `[${2 * i}:v]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,format=yuv420p,tpad=stop=${frames - 1}:stop_mode=clone,setpts=N/(${FPS}*TB)[v${i}]`,
      `[${2 * i + 1}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad=whole_dur=${frames / FPS},atrim=end=${frames / FPS}[a${i}]`,
    );
    timeline.push({ n: m.n, start: Number(t.toFixed(2)), seconds: frames / FPS, say: m.say ?? null, frame: m.png });
    t += frames / FPS;
  });
  filters.push(`${moments.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${moments.length}:v=1:a=1[v][a]`);
  const args = ["-y", "-hide_banner", "-v", "error", ...inputs, "-filter_complex", filters.join(";"), "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-crf", "26", "-r", String(FPS), "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out];
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) die("ffmpeg failed");
  fs.writeFileSync(path.join(build, "timeline.json"), JSON.stringify(timeline, null, 2));
  for (const s of timeline) console.log(`${String(s.n).padStart(3)}  ${s.seconds.toFixed(1).padStart(5)}s  ${(s.say ?? "(silent)").slice(0, 80)}`);
  const mb = fs.statSync(out).size / 1e6;
  console.log(`\n${moments.length} moments, ${t.toFixed(1)}s, ${mb.toFixed(1)}MB -> ${out}`);
  for (const s of timeline) if (s.say && s.seconds > 15.5) console.warn(`WARN ${s.n}: ${s.seconds.toFixed(1)}s of speech on one frame; split it into two moments`);
  if (mb > 10) console.warn("WARN over 10MB: GitHub's free-plan upload limit for videos in comments and PR bodies");
};

// ---------------------------------------------------------------- main

const verbs = {
  setup,
  render: async () => render(readStoryboard()),
  speak: async () => speak(readStoryboard()),
  stitch: async () => stitch(readStoryboard()),
  build: async () => {
    const sb = readStoryboard();
    await render(sb);
    await speak(sb);
    stitch(sb);
  },
};

if (!verbs[verb]) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").slice(1, 21).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(verb ? 1 : 0);
}
await verbs[verb]();
