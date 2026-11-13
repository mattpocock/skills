#!/usr/bin/env node
// The default animatic pipeline: frames -> PNG (Playwright), lines -> speech
// (the machine's built-in voice, else Kokoro), PNG + speech -> MP4 (ffmpeg,
// constant 30fps H.264, so it plays in any player and survives upload).
//
//   node animatic.mjs setup [--engine kokoro]
//   node animatic.mjs say "<one line>" [-o sample.wav]
//   node animatic.mjs build <storyboard.json> [-o animatic.mp4] [--target 90] [--sheet sheet.png]
//   node animatic.mjs estimate <storyboard.json> [--target 90]
//   node animatic.mjs render <storyboard.json> [--sheet sheet.png]
//   node animatic.mjs speak  <storyboard.json>
//   node animatic.mjs stitch <storyboard.json> [-o animatic.mp4] [--gap 0.3]
//
// Voice flags, on any verb: --engine say|sapi|espeak-ng|espeak|kokoro,
// --voice <name>, --tts-command "<cmd>". Style flag, on build and render:
// --css <file>, a stylesheet layered over kit/house.css for generated frames.
//
// `setup` installs the dependencies and measures the voice; `build` runs it
// itself when either is missing. `say` voices one line, to test a voice. A
// line that fails or comes back empty is retried 3 times, then the run stops.
//
// `build` is the one to run. It checks the plan against --target (default
// 90s; --target 0 skips it), renders and voices at once, stitches, verifies
// the MP4 and prints one report. The other verbs are its stages.
//
// A storyboard is a JSON array, one entry per moment, in playback order.
// Paths are relative to the storyboard file:
//
//   { "say": "spoken line", "frame": { "type": "code", ... } }   a generated frame (FRAMES.md)
//   { "say": "spoken line", "lit": 42 }                         a Reveal of the frame before
//   { "say": "spoken line", "html": "frames/01.html" }          your own page (kit/README.md)
//   { "say": "spoken line", "image": "shots/02.png" }           your own frame, any size (letterboxed)
//   { "audio": "takes/03.wav", "html": "frames/03.html" }        your own speech
//   { "seconds": 2, "image": "end.png" }                         a silent hold
//
// Everything generated lands in a `build/` folder beside the storyboard.
// Dependencies live in one shared folder, $ANIMATIC_HOME (default
// ~/.cache/animatic), so every project reuses one install and one model.

import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fitInPage, frameHtml } from "./frames.mjs";

const HOME = process.env.ANIMATIC_HOME ?? path.join(os.homedir(), ".cache", "animatic");
const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 1920;
const HEIGHT = 1080;
const SR = 48000;
const KOKORO_VOICE = "af_heart";
const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
const PAGES = 4;

const die = (message, code = 1) => {
  console.error(`animatic: ${message}`);
  process.exit(code);
};

// ---------------------------------------------------------------- arguments

const [verb, ...rest] = process.argv.slice(2);
const flags = {};
let storyboardArg;
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("-")) {
    storyboardArg ??= rest[i];
    continue;
  }
  const key = rest[i].replace(/^-+/, "");
  const next = rest[i + 1];
  if (next === undefined || (next.startsWith("-") && !/^-\d/.test(next))) flags[key] = true;
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
const installed = (name) => {
  try {
    deps.resolve(name);
    return true;
  } catch {
    return false;
  }
};

const have = (bin) => spawnSync(bin, ["-version"], { stdio: "ignore" }).status === 0;

const chromium = () => {
  try {
    return fs.existsSync(deps("playwright").chromium.executablePath());
  } catch {
    return false;
  }
};
const wanted = () => ["playwright", "shiki", ...(flags["tts-command"] === undefined && engineName() === "kokoro" ? ["kokoro-js"] : [])];
const ready = () => wanted().every(installed) && chromium() && readRates()[ttsKey()] !== undefined;

const setup = async ({ force = !!flags.force } = {}) => {
  for (const bin of ["ffmpeg", "ffprobe"]) {
    if (!have(bin)) die(`${bin} is not on PATH. Install ffmpeg (brew install ffmpeg / apt install ffmpeg / winget install ffmpeg) and run setup again.`);
  }
  fs.mkdirSync(HOME, { recursive: true });
  if (!fs.existsSync(path.join(HOME, "package.json"))) {
    fs.writeFileSync(path.join(HOME, "package.json"), JSON.stringify({ name: "animatic-deps", private: true }, null, 2));
  }
  const sh = (cmd, args) => {
    console.log(`$ ${cmd} ${args.join(" ")}`);
    const r = spawnSync(cmd, args, { cwd: HOME, stdio: "inherit", shell: process.platform === "win32" });
    if (r.status !== 0) die(`${cmd} failed`);
  };
  // Kokoro is installed only where it is the voice in force.
  const want = wanted();
  if (!want.every(installed) || force) sh("npm", ["install", "--no-fund", "--no-audit", ...want]);
  if (!chromium() || force) sh("npx", ["playwright", "install", "chromium"]);
  const known = readRates()[ttsKey()];
  const rate = known && !force ? known : await calibrate();
  console.log(`voice: ${voiceLabel()}, ${known && !force ? "" : "measured "}at ${rate.toFixed(2)} words/s`);
  console.log(`Ready. Dependencies are in ${HOME}.`);
};

// ---------------------------------------------------------------- storyboard

const FRAME_KEYS = ["lit", "show"];

// An entry with no frame of its own is a Reveal: it holds the frame before,
// with its own "lit" and "show". An entry with a frame is a Cut.
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
  let prev;
  const moments = entries.map((e, i) => {
    const n = i + 1;
    const where = `entry ${n}`;
    const own = [e.frame, e.html, e.image].filter((x) => x !== undefined).length;
    if (own > 1) die(`${where}: give one of "frame", "html" or "image"`);
    if (!own && !prev) die(`${where}: the first entry needs a "frame", "html" or "image"`);
    if (e.say === undefined && e.audio === undefined && e.seconds === undefined) die(`${where}: give "say", "audio" or "seconds"`);
    const base = own ? { spec: e.frame, html: at(e.html), image: at(e.image) } : { spec: prev.spec, html: prev.html, image: prev.image };
    let spec = base.spec;
    const overrides = Object.fromEntries(FRAME_KEYS.filter((k) => k in e).map((k) => [k, e[k]]));
    if (Object.keys(overrides).length) {
      if (!spec) die(`${where}: "lit" and "show" work on a generated "frame" only`);
      spec = { ...spec, ...overrides };
    }
    const m = {
      n,
      cut: !!own,
      say: e.say,
      spec,
      html: base.html,
      image: base.image,
      audio: at(e.audio),
      seconds: e.seconds,
      png: path.join(build, `${String(n).padStart(2, "0")}.png`),
    };
    for (const p of [m.html, m.image, m.audio]) if (p && !fs.existsSync(p)) die(`${where}: no such file ${p}`);
    prev = m;
    return m;
  });
  return { dir, build, moments };
};

// ---------------------------------------------------------------- lines

// What the voice would read literally: code punctuation, paths, markdown.
const lintSay = (say) => {
  if (!say) return null;
  const hit = say.match(/[`*_\\/{}[\]<>#=|~^]|[A-Za-z]\.[A-Za-z]|--\w|https?:/);
  return hit ? hit[0] : null;
};

// ---------------------------------------------------------------- render

// house.css, then the user's own stylesheet (--css) over it.
const CSS = () => {
  const house = fs.readFileSync(path.join(SKILL, "kit", "house.css"), "utf8");
  if (flags.css === undefined) return house;
  const own = path.resolve(String(flags.css));
  if (!fs.existsSync(own)) die(`--css: no such file ${own}`);
  return `${house}\n${fs.readFileSync(own, "utf8")}`;
};
const sha = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);

// Every page in one browser, a few at a time. A frame whose page has not
// changed since the last render keeps its PNG.
const render = async ({ dir, build, moments }) => {
  const css = CSS();
  const warnings = [];
  const notes = [];
  const cacheFile = path.join(build, "frames.json");
  let cache = {};
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  } catch {}
  // PNGs left from a longer storyboard would mislead a look at build/.
  for (const f of fs.readdirSync(build)) if (/^\d+\.png$/.test(f) && Number(f.slice(0, -4)) > moments.length) fs.rmSync(path.join(build, f));
  const todo = [];
  for (const m of moments) {
    if (m.image) {
      // Any size in, 1920x1080 out: fitted whole, letterboxed on the ground.
      const img = fs.readFileSync(m.image);
      const type = /\.jpe?g$/i.test(m.image) ? "jpeg" : /\.webp$/i.test(m.image) ? "webp" : /\.gif$/i.test(m.image) ? "gif" : "png";
      m.page = `<!doctype html><html><head><style>${css}</style></head><body style="margin:0"><div class="frame">` +
        `<img src="data:image/${type};base64,${img.toString("base64")}" style="width:100%;height:100%;object-fit:contain;display:block"></div></body></html>`;
      m.raw = true;
    } else if (m.spec) {
      try {
        const { html, warns } = await frameHtml(m.spec, { dir, home: HOME, css });
        m.page = html;
        for (const w of warns) warnings.push(`${m.n}: ${w}`);
      } catch (e) {
        die(`entry ${m.n}: ${e.message}`);
      }
    }
    const key = m.page ? sha(m.page) : sha(fs.readFileSync(m.html, "utf8") + css + m.html);
    if (cache[m.png]?.key === key && fs.existsSync(m.png)) {
      for (const w of cache[m.png].warnings) warnings.push(`${m.n}: ${w}`);
      for (const f of cache[m.png].fixes) notes.push(`${m.n}: ${f}`);
      continue;
    }
    todo.push({ m, key });
  }
  const { chromium } = load("playwright");
  const browser = await chromium.launch();
  try {
    const shoot = async ({ m, key }) => {
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      if (m.page) await page.setContent(m.page, { waitUntil: "load" });
      else await page.goto(pathToFileURL(m.html).href, { waitUntil: "load", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      if (m.raw) {
        await page.screenshot({ path: m.png });
        await page.close();
        cache[m.png] = { key, warnings: [], fixes: [] };
        return;
      }
      const { fixes, warns: fitWarns } = await page.evaluate(fitInPage);
      // Content cut off by an overflow:hidden box is the commonest broken frame;
      // two lit things on one frame is the commonest unclear one.
      const { cut, lit } = await page.evaluate(() => {
        const cut = [];
        for (const el of document.querySelectorAll("body *")) {
          const s = getComputedStyle(el);
          if (s.overflowX !== "hidden" && s.overflowY !== "hidden") continue;
          const name = `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : ""}`;
          if (el.scrollHeight > el.clientHeight + 4) cut.push(`${name} (${el.scrollHeight - el.clientHeight}px cut at the bottom)`);
          // An ellipsis box (a file tree entry, a URL bar) clips on purpose.
          if (s.textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 4) cut.push(`${name} (${el.scrollWidth - el.clientWidth}px cut at the right)`);
        }
        // Adjacent lit lines (one statement over three lines) are one thing.
        const shown = [...document.querySelectorAll(".here, .spot, .node.lit, li.lit")].filter((el) => getComputedStyle(el).visibility !== "hidden");
        const lit = shown.filter((el) => !shown.includes(el.previousElementSibling)).length;
        return { cut, lit };
      });
      await page.screenshot({ path: m.png });
      await page.close();
      const warns = [...fitWarns];
      if (errors.length) warns.push(`page error: ${errors[0]}`);
      for (const c of cut) warns.push(`overflow, content cut in ${c}`);
      if (lit > 1) warns.push(`${lit} things lit; light one, or split the moment`);
      cache[m.png] = { key, warnings: warns, fixes };
      for (const w of warns) warnings.push(`${m.n}: ${w}`);
      for (const f of fixes) notes.push(`${m.n}: ${f}`);
    };
    await pool(todo, PAGES, shoot);
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
    if (flags.sheet) await sheet(browser, moments, path.resolve(String(flags.sheet)));
  } finally {
    await browser.close();
  }
  console.log(`rendered ${todo.length} frame${todo.length === 1 ? "" : "s"} (${moments.length - todo.length} unchanged)`);
  return { warnings, notes };
};

// A contact sheet: every frame, numbered, in order, Cuts marked. One image
// to judge a run.
const sheet = async (browser, moments, out) => {
  const tiles = moments
    .map((m) => {
      const src = fs.existsSync(m.png) ? pathToFileURL(m.png).href : "";
      const line = (m.say ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return `<figure${m.cut ? ' class="cut"' : ""}><img src="${src}"><figcaption><b>${m.n}${m.cut ? " CUT" : ""}</b> ${line}</figcaption></figure>`;
    })
    .join("");
  const html = `<!doctype html><style>
    body{margin:0;background:#222;font:16px/1.3 system-ui,sans-serif;color:#ddd}
    main{display:grid;grid-template-columns:repeat(4,480px);gap:16px;padding:16px}
    figure{margin:0;border-top:4px solid transparent} figure.cut{border-top-color:#fbbf24}
    img{width:480px;height:270px;display:block;background:#000;object-fit:contain}
    figcaption{padding:6px 2px;height:3.9em;overflow:hidden} b{color:#fbbf24;margin-right:6px}
  </style><main>${tiles}</main>`;
  const tmp = path.join(path.dirname(out), ".sheet.html");
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: 4 * 480 + 5 * 16, height: 400 } });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
  fs.rmSync(tmp);
};

// ---------------------------------------------------------------- speak

// Speech is cached by line + voice (or command), so a revision re-voices only
// the lines it changed.
const voiceFile = (build, m, key) => path.join(build, "voice", sha(`${key}\n${m.say}`) + ".wav");

// The machine's own voice first; Kokoro only where there is none.
const isWSL = () => process.platform === "linux" && /microsoft/i.test(fs.readFileSync("/proc/version", "utf8"));
const onPath = (bin) =>
  process.platform === "win32"
    ? spawnSync("where", [bin], { stdio: "ignore" }).status === 0
    : spawnSync("sh", ["-c", `command -v ${bin}`], { stdio: "ignore" }).status === 0;

const detectEngine = () => {
  if (process.platform === "darwin" && onPath("say")) return "say";
  if (process.platform === "win32") return "sapi";
  if (isWSL() && onPath("powershell.exe")) return "sapi";
  if (onPath("espeak-ng")) return "espeak-ng";
  if (onPath("espeak")) return "espeak";
  return "kokoro";
};

const ENGINES = {
  say: "macOS built-in voice (say)",
  sapi: "Windows built-in voice (SAPI, via PowerShell)",
  "espeak-ng": "espeak-ng",
  espeak: "espeak",
  kokoro: "Kokoro, a local model (no built-in voice found)",
};

const engineName = () => {
  const e = String(flags.engine ?? detectEngine());
  if (!ENGINES[e]) die(`unknown --engine ${e}; use one of ${Object.keys(ENGINES).join(", ")}, or --tts-command`);
  return e;
};

const ttsKey = () => (flags["tts-command"] ? `cmd:${flags["tts-command"]}` : `${engineName()}:${flags.voice ?? ""}`);

const run = (cmd, args, { input, shell = false, inherit = false } = {}) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { shell, stdio: ["pipe", "ignore", inherit ? "inherit" : "pipe"] });
    let err = "";
    p.stderr?.on("data", (d) => (err += d));
    p.stdin.end(input ?? "");
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${err.slice(0, 400)}`))));
  });

const pool = async (items, size, fn) => {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
};

const toWav = (raw, wav) => run("ffmpeg", ["-y", "-v", "error", "-i", raw, "-ar", String(SR), "-ac", "1", "-c:a", "pcm_s16le", wav]);

// Windows' voice: every line in one PowerShell, straight to 48kHz mono WAV.
// Starting PowerShell costs more than speaking a line, so it starts once.
const speakSapi = async (jobs) => {
  const win = (p) => (isWSL() ? execFileSync("wslpath", ["-w", p]).toString().trim() : p);
  const list = path.join(path.dirname(jobs[0].wav), `.sapi-${process.pid}.json`);
  fs.writeFileSync(list, JSON.stringify(jobs.map((j) => ({ text: j.text, out: win(j.wav) }))));
  const q = (s) => `'${s.replace(/'/g, "''")}'`;
  const script = [
    "Add-Type -AssemblyName System.Speech",
    "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer",
    flags.voice ? `$s.SelectVoice(${q(String(flags.voice))})` : "",
    `$f = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(${SR}, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)`,
    `foreach ($j in ([IO.File]::ReadAllText(${q(win(list))}, [Text.Encoding]::UTF8) | ConvertFrom-Json)) { $s.SetOutputToWaveFile($j.out, $f); $s.Speak($j.text) }`,
    "$s.Dispose()",
  ].filter(Boolean).join("; ");
  try {
    await run(process.platform === "win32" ? "powershell" : "powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script]);
  } finally {
    fs.rmSync(list, { force: true });
  }
};

// One line through say or espeak: text in a file, audio out, then WAV.
const speakOne = async (engine, text, wav) => {
  const voice = flags.voice === undefined ? [] : ["-v", String(flags.voice)];
  const base = wav.replace(/\.wav$/, ".src");
  const txt = `${base}.txt`;
  fs.writeFileSync(txt, text);
  const raw = engine === "say" ? `${base}.aiff` : `${base}.wav`;
  try {
    if (engine === "say") await run("say", [...voice, "-o", raw, "-f", txt]);
    else await run(engine, [...voice, "-w", raw, "-f", txt]);
    await toWav(raw, wav);
  } finally {
    fs.rmSync(txt, { force: true });
    fs.rmSync(raw, { force: true });
  }
};

// Any engine: the line arrives on stdin and as {text}. {out} is a path with
// no extension: the command writes {out}.wav, {out}.mp3, whatever its tool
// produces, and it is converted to WAV here.
const speakCommand = async (command, text, wav, where) => {
  const base = wav.replace(/\.wav$/, ".src");
  const quoted = (s) => `'${s.replace(/'/g, `'\\''`)}'`;
  const cmd = command.replaceAll("{out}", quoted(base)).replaceAll("{text}", quoted(text));
  const written = () => fs.readdirSync(path.dirname(base)).filter((f) => f.startsWith(path.basename(base))).map((f) => path.join(path.dirname(base), f));
  let failed;
  try {
    await run(cmd, [], { shell: true, input: text, inherit: true });
  } catch (e) {
    failed = e;
  }
  const raw = written().find((f) => fs.statSync(f).size > 0);
  try {
    if (!raw) throw new Error(failed ? failed.message : `the command wrote nothing (or an empty file) at ${base}.*`);
    await toWav(raw, wav);
  } finally {
    for (const f of written()) fs.rmSync(f, { force: true });
  }
};

let kokoro;
const speakKokoro = async (text, wav) => {
  if (!kokoro) {
    const kokoroDeps = createRequire(deps.resolve("kokoro-js"));
    kokoroDeps("@huggingface/transformers").env.cacheDir = path.join(HOME, "models");
    const { KokoroTTS } = load("kokoro-js");
    console.log("loading Kokoro (the first run downloads ~90MB)...");
    kokoro = await KokoroTTS.from_pretrained(KOKORO_MODEL, { dtype: "q8", device: "cpu" });
  }
  const audio = await kokoro.generate(text, { voice: String(flags.voice ?? KOKORO_VOICE) });
  const tmp = wav.replace(/\.wav$/, ".src.wav");
  try {
    await audio.save(tmp);
    await toWav(tmp, wav);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
};

// A WAV with speech in it. An empty or broken one is a failed line, never a
// cached one.
const voiced = (wav) => {
  try {
    const p = pcm(wav);
    return p ? p.length > 0 : duration(wav) > 0;
  } catch {
    return false;
  }
};

const RETRIES = 3;

// Lines -> WAVs, through whichever voice is in force: built-in voices in
// parallel (SAPI in one batch), Kokoro in turn. Online voices drop lines now
// and then (edge-tts: "No audio received"), so a line that fails or comes back
// empty is retried, with a short backoff, before the run stops.
const synthAll = async (jobs) => {
  if (!jobs.length) return;
  const command = flags["tts-command"];
  const engine = command ? null : engineName();
  const errors = new Map();
  const attempt = (j) => async () => {
    try {
      if (command) await speakCommand(command, j.text, j.wav, j.where);
      else if (engine === "kokoro") await speakKokoro(j.text, j.wav);
      else await speakOne(engine, j.text, j.wav);
    } catch (e) {
      errors.set(j, e.message);
    }
  };
  let todo = jobs;
  for (let n = 0; n <= RETRIES && todo.length; n++) {
    if (n) {
      console.warn(`voice: ${todo.length} line${todo.length === 1 ? "" : "s"} failed or came back empty; retry ${n} of ${RETRIES}`);
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (n - 1)));
    }
    for (const j of todo) {
      errors.delete(j);
      fs.rmSync(j.wav, { force: true });
    }
    if (!command && engine === "sapi") {
      try {
        await speakSapi(todo);
      } catch (e) {
        for (const j of todo) errors.set(j, e.message);
      }
    } else if (!command && engine === "kokoro") for (const j of todo) await attempt(j)();
    else await pool(todo, 4, (j) => attempt(j)());
    todo = todo.filter((j) => !voiced(j.wav));
  }
  for (const j of todo) fs.rmSync(j.wav, { force: true });
  if (todo.length) {
    const j = todo[0];
    die(`${j.where}: the voice failed ${RETRIES + 1} times on "${j.text.slice(0, 80)}"${errors.get(j) ? `: ${errors.get(j)}` : ", writing no audio"}${todo.length > 1 ? ` (and ${todo.length - 1} more line${todo.length > 2 ? "s" : ""})` : ""}`);
  }
};

// The voice by name, as the user would recognise it.
const voiceLabel = () => {
  if (flags["tts-command"]) return `your command (${flags["tts-command"]})`;
  const engine = engineName();
  let name = flags.voice === undefined ? undefined : String(flags.voice);
  if (!name && engine === "sapi") {
    try {
      name = execFileSync(process.platform === "win32" ? "powershell" : "powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
        "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Voice.Name"]).toString().trim();
    } catch {}
  }
  if (!name && engine === "kokoro") name = KOKORO_VOICE;
  return `${ENGINES[engine]}, ${name ? `voice "${name}"` : "its default voice"}`;
};

// Speaking rate per voice, in words per second, so `estimate` predicts the
// voice actually in use. setup measures it once; every stitch refines it.
const RATES = path.join(HOME, "rates.json");
const DEFAULT_RATE = 2.3;
const readRates = () => {
  try {
    return JSON.parse(fs.readFileSync(RATES, "utf8"));
  } catch {
    return {};
  }
};
const saveRate = (key, rate) => {
  fs.mkdirSync(HOME, { recursive: true });
  fs.writeFileSync(RATES, JSON.stringify({ ...readRates(), [key]: Number(rate.toFixed(3)) }, null, 2));
};
const wordCount = (s) => (s ?? "").split(/\s+/).filter(Boolean).length;

// Short sentences, a number and a spelled-out identifier: the shape of real
// narration, pauses included, so the rate it gives holds for real lines.
const SAMPLE =
  "Here's the problem: the limiter counted requests per IP address, not per customer. Behind the load balancer every customer shared one address, so one busy client could block everyone else. The fix is in rate limit dot ts, where line four now keys on the API key instead. Two lines added, one removed, and the test called counts each key separately now passes.";

const calibrate = async () => {
  const wav = path.join(os.tmpdir(), `animatic-calibrate-${process.pid}.wav`);
  await synthAll([{ text: SAMPLE, wav, where: "calibration" }]);
  const rate = wordCount(SAMPLE) / duration(wav);
  fs.rmSync(wav);
  saveRate(ttsKey(), rate);
  return rate;
};

const speak = async ({ build, moments }) => {
  const key = ttsKey();
  const jobs = [];
  for (const m of moments) {
    if (m.say === undefined || m.audio) continue;
    m.audio = voiceFile(build, m, key);
    if (!voiced(m.audio)) jobs.push({ text: m.say, wav: m.audio, where: `entry ${m.n}` });
  }
  await synthAll(jobs);
  console.log(`voiced ${jobs.length} line${jobs.length === 1 ? "" : "s"} (${moments.filter((m) => m.say !== undefined).length - jobs.length} cached)`);
};

// ---------------------------------------------------------------- stitch

// A 48kHz mono 16-bit WAV's samples, or null for anything else.
const pcm = (file) => {
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") return null;
  let fmt;
  for (let off = 12; off + 8 <= b.length; ) {
    const id = b.toString("ascii", off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === "fmt ") fmt = { tag: b.readUInt16LE(off + 8), ch: b.readUInt16LE(off + 10), rate: b.readUInt32LE(off + 12), bits: b.readUInt16LE(off + 22) };
    if (id === "data") {
      if (!fmt || fmt.tag !== 1 || fmt.ch !== 1 || fmt.rate !== SR || fmt.bits !== 16) return null;
      return b.subarray(off + 8, Math.min(b.length, off + 8 + size));
    }
    off += 8 + size + (size % 2);
  }
  return null;
};

const duration = (file) => {
  const p = pcm(file);
  if (p) return p.length / 2 / SR;
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
};

const wavHeader = (bytes) => {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + bytes, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(bytes, 40);
  return h;
};

// One still per moment, held for its line, at a constant 30fps: every player
// and site plays it (a variable-rate file of one frame per moment shows
// nothing in Windows' player and is mangled on upload). Each moment lasts a
// whole number of frames, so the audio, the timeline and the video agree to
// the sample. x264 is fast here: a held still is all skipped blocks.
const FPS = 30;
const stitch = async ({ dir, build, moments }) => {
  const gap = Number(flags.gap ?? 0.3);
  const out = path.resolve(String(flags.o ?? flags.out ?? path.join(dir, "animatic.mp4")));
  const key = ttsKey();
  const chunks = [];
  const timeline = [];
  let frames = 0;
  for (const m of moments) {
    if (!fs.existsSync(m.png)) die(`entry ${m.n}: no frame at ${m.png}. Run render first.`);
    if (m.say !== undefined && !m.audio) m.audio = voiceFile(build, m, key);
    if (m.audio && !fs.existsSync(m.audio)) die(`entry ${m.n}: no speech yet. Run speak first.`);
    let samples = Buffer.alloc(0);
    if (m.audio) {
      samples = pcm(m.audio);
      if (!samples) {
        const conv = path.join(build, "voice", `in-${sha(m.audio + fs.statSync(m.audio).mtimeMs)}.wav`);
        if (!fs.existsSync(conv)) await toWav(m.audio, conv);
        samples = pcm(conv);
      }
    }
    const speech = samples.length / 2 / SR;
    let sum = 0;
    for (let k = 0; k + 1 < samples.length; k += 2) sum += samples.readInt16LE(k) ** 2;
    const db = samples.length ? 10 * Math.log10(sum / (samples.length / 2) / 32768 ** 2 + 1e-12) : null;
    const count = Math.max(2, Math.round((m.seconds ?? speech + gap) * FPS));
    const buf = Buffer.alloc(((count * SR) / FPS) * 2);
    samples.copy(buf, 0, 0, Math.min(samples.length, buf.length));
    chunks.push(buf);
    timeline.push({ n: m.n, cut: m.cut, start: Number((frames / FPS).toFixed(3)), seconds: Number((count / FPS).toFixed(3)), frames: [frames, frames + count], say: m.say ?? null, frame: m.png, db: db === null ? null : Number(db.toFixed(1)) });
    frames += count;
  }
  const t = frames / FPS;
  const audio = Buffer.concat(chunks);
  const track = path.join(build, "track.wav");
  fs.writeFileSync(track, Buffer.concat([wavHeader(audio.length), audio]));
  const list = path.join(build, "frames.ffconcat");
  const q = (p) => `'${p.replace(/'/g, "'\\''")}'`;
  // Each still read at 30fps, so its timestamps land on whole frames (a PNG's
  // default 1/25 time base would shift a Cut by a frame). The last frame
  // again after the end, so the last moment runs its full length before
  // -frames:v stops the video.
  const entry = (frame, n) => `file ${q(frame)}\noption framerate ${FPS}\nduration ${(n / FPS).toFixed(6)}\n`;
  fs.writeFileSync(list, `ffconcat version 1.0\n${timeline.map((s) => entry(s.frame, s.frames[1] - s.frames[0])).join("")}${entry(timeline.at(-1).frame, 1)}`);
  // Straight from the PNGs: each still converted to yuv420p once, then
  // repeated to 30fps; a keyframe at every moment, so a seek lands clean.
  const keys = timeline.map((s) => Math.max(0, s.frames[0] / FPS - 0.001).toFixed(4)).join(",");
  const r = spawnSync("ffmpeg", ["-y", "-hide_banner", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-i", track,
    "-map", "0:v", "-map", "1:a", "-vf", `setsar=1,format=yuv420p,fps=${FPS}`, "-frames:v", String(frames),
    "-c:v", "libx264", "-preset", "superfast", "-tune", "stillimage", "-crf", "26", "-g", String(10 * FPS), "-force_key_frames", keys,
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-ac", "1", "-t", t.toFixed(6), "-movflags", "+faststart", out], { encoding: "utf8" });
  if (r.status !== 0) die(`ffmpeg failed: ${r.stderr}`);
  fs.writeFileSync(path.join(build, "timeline.json"), JSON.stringify(timeline, null, 2));
  // The real speaking rate of this run sharpens the next estimate.
  const spoken = timeline.filter((s) => s.say);
  const speechSeconds = spoken.reduce((sum, s) => sum + s.seconds - gap, 0);
  if (speechSeconds > 20 && !moments.some((m) => m.audio && !m.audio.startsWith(path.join(build, "voice")))) {
    saveRate(key, spoken.reduce((sum, s) => sum + wordCount(s.say), 0) / speechSeconds);
  }
  return { out, timeline, total: t, frames };
};

// ---------------------------------------------------------------- verify

const ff = (args) =>
  new Promise((resolve) => {
    const p = spawn("ffmpeg", ["-hide_banner", "-nostats", ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let text = "";
    p.stdout.on("data", (d) => (text += d));
    p.stderr.on("data", (d) => (text += d));
    p.on("close", () => resolve(text));
  });

// The checks a person would make on the MP4, made here on every moment: the
// streams, rate and length; each moment's first, middle and last video frame
// matching its PNG, so it is on screen from its start to its end; and the
// voice audible.
const verify = async ({ out, timeline, total, frames }) => {
  const problems = [];
  const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,avg_frame_rate,nb_frames,pix_fmt", "-of", "json", out]).toString());
  const types = info.streams.map((s) => s.codec_type).sort().join(",");
  const video = info.streams.find((s) => s.codec_type === "video") ?? {};
  const len = Number(info.format.duration);
  if (types !== "audio,video") problems.push(`streams are ${types}, not one video and one audio`);
  if (video.avg_frame_rate !== `${FPS}/1`) problems.push(`the video runs at ${video.avg_frame_rate} fps, not a constant ${FPS}`);
  if (video.pix_fmt !== "yuv420p") problems.push(`the video is ${video.pix_fmt}, not yuv420p`);
  if (Number(video.nb_frames) !== frames) problems.push(`the video has ${video.nb_frames} frames, not ${frames}`);
  if (Math.abs(len - total) > 0.2) problems.push(`runs ${len.toFixed(1)}s against a timeline of ${total.toFixed(1)}s`);
  // One pass: pick the sampled frames out of the video and line each up with
  // its PNG. Two different dark frames still score 0.92-0.98, so a match is
  // 0.99 up.
  const samples = [];
  for (const s of timeline) {
    const [a, b] = s.frames;
    const at = { first: a, middle: Math.floor((a + b) / 2), last: b - 1 };
    const seen = new Set();
    for (const [where, n] of Object.entries(at)) if (!seen.has(n)) seen.add(n) && samples.push({ s, n, where });
  }
  const refs = path.join(path.dirname(out), `.verify-${process.pid}.ffconcat`);
  const q = (p) => `'${p.replace(/'/g, "'\\''")}'`;
  fs.writeFileSync(refs, `ffconcat version 1.0\n${samples.map((x) => `file ${q(x.s.frame)}\nduration 1\n`).join("")}`);
  const pick = samples.map((x) => `eq(n\\,${x.n})`).join("+");
  const [ssimLog, vol] = await Promise.all([
    ff(["-v", "error", "-i", out, "-f", "concat", "-safe", "0", "-i", refs, "-filter_complex",
      `[0:v]select=${pick},format=yuv420p,settb=1/${FPS},setpts=N[a];[1:v]setsar=1,format=yuv420p,settb=1/${FPS},setpts=N[b];[a][b]ssim=stats_file=-`, "-f", "null", "-"]),
    ff(["-i", out, "-map", "0:a", "-af", "volumedetect", "-f", "null", "-"]),
  ]);
  fs.rmSync(refs, { force: true });
  const ssims = [...ssimLog.matchAll(/All:([\d.]+)/g)].map((m) => Number(m[1]));
  const bad = new Set();
  samples.forEach((x, i) => {
    if (ssims[i] >= 0.99 || bad.has(x.s.n)) return;
    bad.add(x.s.n);
    problems.push(`moment ${x.s.n}: its ${x.where} frame (${(x.n / FPS).toFixed(2)}s) does not match its PNG (SSIM ${ssims[i]?.toFixed(3) ?? "none"})`);
  });
  for (const s of timeline) if (s.say && !(s.db > -40)) problems.push(`moment ${s.n}: its line is silent (${s.db} dB)`);
  const mean = Number((vol.match(/mean_volume: (-?[\d.]+)/) ?? [])[1] ?? -91);
  if (mean < -40) problems.push(`the voice is not audible (mean ${mean} dB)`);
  const summary = `1 video + 1 audio stream, ${len.toFixed(1)}s at ${video.avg_frame_rate} fps; ${timeline.length - bad.size} of ${timeline.length} moments on screen start to end and matching their PNGs (${samples.length} frames sampled, SSIM >= ${Math.min(...ssims).toFixed(3)}); voice at ${mean} dB mean`;
  return { problems, summary };
};

// ---------------------------------------------------------------- estimate

// The run time a storyboard's lines will take, before anything is rendered
// or voiced: words at the voice's measured rate, plus the gap per moment.
const plan = () => {
  if (!storyboardArg) die(`usage: animatic.mjs ${verb} <storyboard.json> [--target <seconds>]`);
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(path.resolve(storyboardArg), "utf8"));
  } catch (e) {
    die(`cannot read ${storyboardArg}: ${e.message}`);
  }
  const measured = readRates()[ttsKey()];
  const rate = measured ?? DEFAULT_RATE;
  const gap = Number(flags.gap ?? 0.3);
  const target = flags.target === undefined ? 90 : Number(flags.target);
  const rows = entries.map((e, i) => ({ n: i + 1, cut: !!(e.frame || e.html || e.image), say: e.say ?? e.note, seconds: e.seconds ?? wordCount(e.say ?? e.note) / rate + gap }));
  const total = rows.reduce((s, r) => s + r.seconds, 0);
  const warnings = [];
  for (const r of rows) if (r.seconds > 15.5) warnings.push(`${r.n}: ~${r.seconds.toFixed(1)}s on one frame; split it`);
  for (const r of rows) {
    const hit = lintSay(entries[r.n - 1].say);
    if (hit) warnings.push(`${r.n}: the voice will read "${hit}" literally; respell it as spoken`);
  }
  // Within 10% of the target is a fair plan; past it, the overrun is real.
  const over = target > 0 && total > target * 1.1;
  if (over) warnings.push(`over the ${target}s target by about ${Math.round(total - target)}s: cut moments`);
  return { rows, total, rate, measured, target, over, warnings };
};

const printPlan = (p) => {
  for (const r of p.rows) console.log(`${String(r.n).padStart(3)} ${r.cut ? "C" : " "} ~${r.seconds.toFixed(1).padStart(4)}s  ${(r.say ?? "(silent)").slice(0, 80)}`);
  console.log(`\n${p.rows.length} moments, ${p.rows.filter((r) => r.cut).length} Cuts, about ${Math.round(p.total)}s at ${p.rate.toFixed(2)} words/s (${p.measured ? "measured for this voice" : "not measured yet: run setup"})${p.target > 0 && !p.over ? `, within the ${p.target}s target` : ""}`);
  for (const w of p.warnings) console.warn(`WARN ${w}`);
};

// ---------------------------------------------------------------- build

const build = async () => {
  const t0 = Date.now();
  if (!ready()) await setup({ force: false });
  const p = plan();
  // The gate: a plan over its target, or a line the voice will garble, stops
  // here, before anything is rendered or voiced. --force runs it anyway.
  if ((p.over || p.warnings.some((w) => /literally/.test(w))) && !flags.force) {
    printPlan(p);
    die("fix the plan first (the WARN lines above); nothing was rendered or voiced", 2);
  }
  const sb = readStoryboard();
  flags.sheet ??= path.join(sb.dir, "sheet.png");
  const [{ warnings, notes }] = await Promise.all([render(sb), speak(sb)]);
  const st = await stitch(sb);
  const v = await verify(st);
  const mb = fs.statSync(st.out).size / 1e6;
  for (const s of st.timeline) console.log(`${String(s.n).padStart(3)} ${s.cut ? "C" : " "} ${s.seconds.toFixed(1).padStart(5)}s  ${(s.say ?? "(silent)").slice(0, 90)}`);
  const cuts = st.timeline.filter((s) => s.cut).length;
  console.log(`\n${st.timeline.length} moments, ${cuts} Cuts, ${st.total.toFixed(1)}s, ${mb.toFixed(1)}MB -> ${st.out}`);
  console.log(`sheet -> ${path.resolve(String(flags.sheet))}`);
  console.log(`verified: ${v.summary}`);
  for (const n of notes) console.log(`fit ${n}`);
  const late = [...warnings, ...p.warnings, ...v.problems];
  for (const s of st.timeline) if (s.say && s.seconds > 15.5) late.push(`${s.n}: ${s.seconds.toFixed(1)}s of speech on one frame; split it into two moments`);
  if (mb > 10) late.push("over 10MB: GitHub's free-plan upload limit for videos in comments and PR bodies");
  for (const w of [...new Set(late)]) console.warn(`WARN ${w}`);
  console.log(`built in ${((Date.now() - t0) / 1000).toFixed(1)}s${late.length ? "" : ", no warnings"}`);
};

// ---------------------------------------------------------------- main

const verbs = {
  setup,
  build,
  estimate: async () => printPlan(plan()),
  render: async () => {
    const { warnings, notes } = await render(readStoryboard());
    for (const n of notes) console.log(`fit ${n}`);
    for (const w of warnings) console.warn(`WARN ${w}`);
  },
  speak: async () => speak(readStoryboard()),
  say: async () => {
    if (storyboardArg === undefined) die('usage: animatic.mjs say "<one line>" [-o sample.wav]');
    const wav = path.resolve(String(flags.o ?? "sample.wav"));
    await synthAll([{ text: storyboardArg, wav, where: "say" }]);
    const seconds = duration(wav);
    const words = wordCount(storyboardArg);
    console.log(`voice: ${voiceLabel()}\n${words} words, ${seconds.toFixed(2)}s (${(words / seconds).toFixed(2)} words/s) -> ${wav}`);
  },
  stitch: async () => {
    const st = await stitch(readStoryboard());
    console.log(`${st.timeline.length} moments, ${st.total.toFixed(1)}s -> ${st.out}`);
  },
};

if (!verbs[verb]) {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").slice(1).join("\n").match(/^(\/\/.*\n)+/)[0].replace(/^\/\/ ?/gm, ""));
  process.exit(verb ? 1 : 0);
}
await verbs[verb]();
