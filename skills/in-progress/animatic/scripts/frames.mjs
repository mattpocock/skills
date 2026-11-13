// Generated frames: a storyboard "frame" spec -> one HTML page on the kit.
// The spec carries the content; this file carries the markup, the real line
// numbers, the syntax colours and the one lit thing. See FRAMES.md.

import fs from "node:fs";
import path from "node:path";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lights = `<div class="lights"><i></i><i></i><i></i></div>`;
const TYPES = ["title", "code", "terminal", "diagram", "list", "page"];

// Text a viewer reads that is not code: STYLE.md caps it at 50 characters.
const prose = (warns, where, s) => {
  if (String(s ?? "").length > 50) warns.push(`${where}: "${String(s).slice(0, 40)}..." is ${String(s).length} characters; the frame cap is 50`);
  return esc(s);
};

// 1-based index or matching text -> index into items, or -1.
const pick = (items, lit, text) => {
  if (lit === undefined || lit === null) return -1;
  if (typeof lit === "number") return lit - 1;
  return items.findIndex((it) => text(it).includes(String(lit)));
};
const hidden = (spec, i) => (spec.show !== undefined && i >= spec.show ? ` style="visibility:hidden"` : "");

// ---------------------------------------------------------------- code

// A unified diff (`git diff`, or a host's PR diff) -> rows for one file, numbered by
// the new file. A removed line sits at the number of the line after it.
const parseDiff = (text, file) => {
  const rows = [];
  let inFile = false;
  let n = 0;
  let hunk = 0;
  for (const line of text.split("\n")) {
    if (line.startsWith("diff --git ")) {
      const m = line.match(/ b\/(.+)$/);
      inFile = !!m && (m[1] === file || m[1].endsWith("/" + file));
      continue;
    }
    if (!inFile) continue;
    const h = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (h) {
      n = Number(h[1]);
      hunk++;
      continue;
    }
    if (!hunk || line.startsWith("\\")) continue;
    const c = line[0];
    if (c === "+") rows.push({ kind: "add", n: n++, text: line.slice(1), hunk });
    else if (c === "-") rows.push({ kind: "del", n: null, at: n, text: line.slice(1), hunk });
    else if (c === " " || line === "") rows.push({ kind: "ctx", n: n++, text: line.slice(1), hunk });
  }
  return rows;
};

// "12-30" | "12-30,44-50" | [[12,30],[44,50]] -> [[12,30],[44,50]]
const ranges = (r) => {
  if (r === undefined) return null;
  const list = Array.isArray(r) ? r : String(r).split(",");
  return list.map((x) => (Array.isArray(x) ? x : String(x).split("-").map(Number))).map(([a, b]) => [a, b ?? a]);
};

let highlighter;
const highlight = async (lines, lang, home) => {
  try {
    if (!highlighter) {
      const shiki = await import(path.join(home, "node_modules", "shiki", "dist", "index.mjs"));
      highlighter = await shiki.createHighlighter({ themes: ["vitesse-dark"], langs: [] });
    }
    try {
      await highlighter.loadLanguage(lang);
    } catch {
      lang = "text";
    }
    const { tokens } = highlighter.codeToTokens(lines.join("\n"), { lang, theme: "vitesse-dark" });
    return tokens.map((toks) =>
      toks.map((t) => `<span style="color:${t.color}${t.fontStyle & 1 ? ";font-style:italic" : ""}">${esc(t.content)}</span>`).join(""),
    );
  } catch {
    return lines.map(esc);
  }
};

const LANGS = { yml: "yaml", mjs: "js", cjs: "js", mts: "ts", cts: "ts", md: "markdown", sh: "bash", zsh: "bash", py: "python", rb: "ruby", rs: "rust" };

const code = async (spec, dir, home, warns) => {
  if (!spec.path) throw new Error(`a code frame needs "path" (the file's path in the repo)`);
  let rows;
  if (spec.diff) {
    rows = parseDiff(fs.readFileSync(path.resolve(dir, spec.diff), "utf8"), spec.path);
    if (!rows.length) throw new Error(`no hunks for ${spec.path} in ${spec.diff}`);
  } else if (spec.src) {
    rows = fs.readFileSync(path.resolve(dir, spec.src), "utf8").replace(/\n$/, "").split("\n").map((text, i) => ({ kind: "ctx", n: i + 1, text }));
  } else throw new Error(`a code frame needs "diff" (a saved diff) or "src" (a saved copy of the file)`);
  const want = ranges(spec.lines);
  if (want) rows = rows.filter((r) => want.some(([a, b]) => (r.n ?? r.at) >= a && (r.n ?? r.at) <= b));
  if (!rows.length) throw new Error(`lines ${spec.lines} select nothing in ${spec.path}`);
  const ext = path.extname(spec.path).slice(1).toLowerCase();
  const html = await highlight(rows.map((r) => r.text), spec.lang ?? LANGS[ext] ?? (ext || "text"), home);
  const lit = spec.lit === undefined || spec.lit === null ? -1
    : typeof spec.lit === "number" ? rows.findIndex((r) => r.n === spec.lit)
    : rows.findIndex((r) => r.text.includes(String(spec.lit)));
  if (spec.lit !== undefined && spec.lit !== null && lit < 0) warns.push(`lit ${JSON.stringify(spec.lit)} is not a shown line of ${spec.path}`);
  const out = [];
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    // A gap in the numbering, or a new hunk, is a fold: the excerpt keeps real numbers.
    if (prev && (r.hunk !== prev.hunk || (r.n ?? r.at) - (prev.n ?? prev.at - 1) > 1)) out.push(`<span class="l fold" data-n=""> </span>`);
    const cls = ["l", r.kind === "add" ? "add" : r.kind === "del" ? "del" : "", i === lit ? "here" : ""].filter(Boolean).join(" ");
    out.push(`<span class="${cls}" data-n="${r.n ?? "−"}">${html[i] || " "}</span>`);
  });
  const tree = (spec.tree ?? []).map((p) => {
    const tag = p[0] === "+" ? " added" : p[0] === "~" ? " modified" : "";
    const name = tag ? p.slice(1) : p;
    return `<li class="${tag.trim()}${name === spec.path ? " active" : ""}">${esc(name)}</li>`;
  }).join("");
  return `<div class="frame frame--full"><div class="window">
<div class="titlebar">${lights}<span class="title">${esc(spec.title ?? spec.path)}</span></div>
<div class="panes">${tree ? `<nav class="sidebar"><div class="sidebar-heading">Explorer</div><ul class="tree">${tree}</ul></nav>` : ""}
<div class="main"><div class="tabs"><div class="tab active">${esc(path.basename(spec.path))}</div></div>
<div class="code gen${lit >= 0 ? " code--spotlight" : ""}" data-fit="rows">${out.join("")}</div></div></div></div></div>`;
};

// ---------------------------------------------------------------- the rest

const TONES = ["ok", "bad", "warn", "info", "faint", "cyan", "yellow", "magenta"];

const terminal = (spec, warns) => {
  const lines = spec.lines ?? [];
  const text = (l) => (typeof l === "string" ? l : l.text ?? "");
  const lit = pick(lines, spec.lit, text);
  if (spec.lit !== undefined && spec.lit !== null && lit < 0) warns.push(`lit ${JSON.stringify(spec.lit)} is not a terminal line`);
  const rows = lines.map((l, i) => {
    const t = text(l);
    const tone = typeof l === "object" && TONES.includes(l.tone) ? ` ${l.tone}` : "";
    const here = i === lit ? " here" : "";
    if (t === "") return `<span class="blank${here}"${hidden(spec, i)}></span>`;
    if (t.startsWith("$ ")) return `<span class="cmd${here}"${hidden(spec, i)}>${esc(t.slice(2))}</span>`;
    return `<span class="out${tone}${here}"${hidden(spec, i)}>${esc(t)}</span>`;
  });
  return `<div class="frame frame--inset"><div class="window">
<div class="titlebar">${lights}<span class="title">${esc(spec.title ?? "Terminal")}</span></div>
<div class="terminal gen${lit >= 0 ? " spotlight" : ""}" data-fit="rows" data-trim="top">${rows.join("")}</div></div></div>`;
};

const title = (spec, warns) => `<div class="frame frame--center"><div class="gen-wrap" data-fit="scale"><div class="card">
${spec.kicker ? `<div class="kicker">${esc(spec.kicker)}</div>` : ""}
<h1 class="headline">${String(spec.headline ?? "").split("\n").map((l) => prose(warns, "headline", l)).join("<br>")}<span class="rule"></span></h1>
${spec.sub ? `<p class="subhead">${esc(spec.sub)}</p>` : ""}</div></div></div>`;

const diagram = (spec, warns) => {
  const nodes = (spec.nodes ?? []).map((n) => (typeof n === "string" ? { title: n } : n));
  const lit = pick(nodes, spec.lit, (n) => n.title ?? "");
  if (spec.lit !== undefined && spec.lit !== null && lit < 0) warns.push(`lit ${JSON.stringify(spec.lit)} is not a node`);
  const labels = spec.arrows === false ? null : spec.arrows ?? [];
  const parts = [];
  nodes.forEach((n, i) => {
    if (i && labels) parts.push(`<div class="arrow"${hidden(spec, i)}><span>&rarr;</span>${labels[i - 1] ? `<span class="label">${esc(labels[i - 1])}</span>` : ""}</div>`);
    const cls = i === lit ? " lit" : lit >= 0 ? " muted" : "";
    parts.push(`<div class="node${cls}"${hidden(spec, i)}><div class="node-title">${prose(warns, "node", n.title)}</div>${n.sub ? `<div class="node-sub">${prose(warns, "node sub", n.sub)}</div>` : ""}</div>`);
  });
  return `<div class="frame frame--center"><div class="gen-wrap" data-fit="scale">
${spec.title ? `<div class="overline">${prose(warns, "title", spec.title)}</div>` : ""}
<div class="diagram gen" style="margin-top:56px">${parts.join("")}</div>
${spec.note ? `<div class="annotation" style="margin-top:72px">${prose(warns, "note", spec.note)}</div>` : ""}</div></div>`;
};

const TAGS = { "+": "add", "~": "mod", "-": "del", added: "add", modified: "mod", removed: "del", deleted: "del" };
const list = (spec, warns) => {
  const items = (spec.items ?? []).map((it) => (typeof it === "string" ? { text: it } : it));
  const lit = pick(items, spec.lit, (it) => it.text ?? "");
  if (spec.lit !== undefined && spec.lit !== null && lit < 0) warns.push(`lit ${JSON.stringify(spec.lit)} is not an item`);
  const anyTag = items.some((it) => it.tag);
  const lis = items.map((it, i) => {
    const tag = anyTag ? `<span class="tag ${TAGS[it.tag] ?? ""}">${esc(it.tag && it.tag.length === 1 ? (it.tag === "-" ? "−" : it.tag) : it.tag ? { add: "+", mod: "~", del: "−" }[TAGS[it.tag]] : "")}</span>` : "";
    return `<li class="${i === lit ? "lit" : ""}"${hidden(spec, i)}>${tag}<span class="text">${prose(warns, "item", it.text)}</span>${it.sub ? `<span class="sub">${prose(warns, "item sub", it.sub)}</span>` : ""}</li>`;
  });
  return `<div class="frame frame--center"><div class="gen-wrap" data-fit="scale">
${spec.title ? `<div class="overline">${prose(warns, "title", spec.title)}</div>` : ""}
<ol class="biglist${spec.mono ? " mono" : ""}${lit >= 0 ? " spotlight" : ""}">${lis.join("")}</ol></div></div>`;
};

// A light docs page. Paragraphs, "## " headings and `inline code`; lit is a
// phrase on the page, set in .spot.
const page = (spec, warns) => {
  let spotted = false;
  const inline = (s) => {
    let h = esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
    if (spec.lit && !spotted && h.includes(esc(spec.lit))) {
      h = h.replace(esc(spec.lit), `<span class="spot">${esc(spec.lit)}</span>`);
      spotted = true;
    }
    return h;
  };
  const body = (spec.body ?? []).map((p, i) => (p.startsWith("## ") ? `<h2${hidden(spec, i)}>${inline(p.slice(3))}</h2>` : `<p${hidden(spec, i)}>${inline(p)}</p>`)).join("");
  const h1 = inline(spec.heading ?? "");
  if (spec.lit && !spotted) warns.push(`lit ${JSON.stringify(spec.lit)} is not on the page`);
  const [host, ...rest] = String(spec.url ?? "").replace(/^https?:\/\//, "").split("/");
  return `<div class="frame frame--full"><div class="window">
<div class="browserbar">${lights}<div class="nav-buttons"><span>&lsaquo;</span><span>&rsaquo;</span><span>&circlearrowright;</span></div>
<div class="urlbar"><span><span class="host">${esc(host)}</span>${rest.length ? "/" + esc(rest.join("/")) : ""}</span></div></div>
<div class="page" data-fit="rows" data-trim="bottom">${h1 ? `<h1>${h1}</h1>` : ""}${body}</div></div></div>`;
};

// spec -> { html, warns }. css is house.css, inlined so a page needs no file.
export const frameHtml = async (spec, { dir, home, css }) => {
  const warns = [];
  if (!TYPES.includes(spec.type)) throw new Error(`frame type "${spec.type}" is not one of ${TYPES.join(", ")}`);
  if (spec.show === 0) warns.push(`"show": 0 leaves the frame empty; show the first item`);
  const body =
    spec.type === "code" ? await code(spec, dir, home, warns)
    : spec.type === "terminal" ? terminal(spec, warns)
    : spec.type === "title" ? title(spec, warns)
    : spec.type === "diagram" ? diagram(spec, warns)
    : spec.type === "list" ? list(spec, warns)
    : page(spec, warns);
  return { html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`, warns };
};

// Runs in the page before capture. Rows that do not fit are folded away,
// farthest from the lit row first (a terminal drops its oldest lines), and a
// centred block that does not fit shrinks, never below the 28px floor.
export const fitInPage = () => {
  const fixes = [];
  const over = (el) => el.scrollHeight > el.clientHeight + 2;
  for (const box of document.querySelectorAll('[data-fit="rows"]')) {
    const trim = box.dataset.trim;
    let dropped = 0;
    for (let guard = 0; over(box) && guard < 2000; guard++) {
      const all = [...box.children];
      const lit = box.querySelector(".here");
      const li = lit ? all.indexOf(lit) : -1;
      const can = all.filter((r) => !r.classList.contains("fold") && r !== lit);
      if (!can.length) break;
      let victim;
      if (trim === "top") victim = can[0];
      else if (trim === "bottom" || li < 0) victim = can[can.length - 1];
      else victim = can.reduce((a, b) => (Math.abs(all.indexOf(b) - li) > Math.abs(all.indexOf(a) - li) ? b : a));
      const near = [victim.previousElementSibling, victim.nextElementSibling].some((s) => s && s.classList.contains("fold"));
      if (near || trim === "bottom") victim.remove();
      else {
        const fold = document.createElement("span");
        fold.className = box.classList.contains("code") ? "l fold" : "fold";
        fold.dataset.n = "";
        fold.textContent = " ";
        victim.replaceWith(fold);
      }
      dropped++;
    }
    if (dropped) fixes.push(`folded ${dropped} line${dropped > 1 ? "s" : ""} to fit`);
  }
  const frame = document.querySelector(".frame");
  const warns = [];
  // A centred block is sized to its box: grown until it fills the frame, or
  // shrunk (never below the 28px floor) until it fits.
  for (const box of document.querySelectorAll('[data-fit="scale"]')) {
    let smallest = Infinity;
    for (const el of box.querySelectorAll("*")) if ([...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) smallest = Math.min(smallest, parseFloat(getComputedStyle(el).fontSize));
    const floor = Math.min(1, 28 / smallest);
    const tooBig = () => frame.scrollHeight > frame.clientHeight + 2 || [...box.querySelectorAll(".diagram, .biglist")].some((el) => el.scrollWidth > el.clientWidth + 2);
    // The content's own extent, whatever its wrappers' widths.
    const extent = () => {
      const rs = [...box.querySelectorAll(".card, .node, .arrow, li, .overline, .annotation")].map((el) => el.getBoundingClientRect()).filter((r) => r.width);
      const l = Math.min(...rs.map((r) => r.left)), r = Math.max(...rs.map((r) => r.right));
      const t = Math.min(...rs.map((r) => r.top)), b = Math.max(...rs.map((r) => r.bottom));
      return { w: r - l, h: b - t };
    };
    const W = frame.clientWidth - 192;
    const H = frame.clientHeight - 192;
    // First tighten the boxes (no text shrinks), then shrink to the floor,
    // and only then wrap a diagram onto a second row.
    if (tooBig()) {
      box.classList.add("tight");
      fixes.push("tightened to fit");
    }
    const { w, h } = extent();
    let z = Math.min(2.2, (W * 0.9) / w, (H * 0.85) / h);
    z = Math.max(floor, Math.floor(z * 20) / 20);
    box.style.zoom = String(z);
    while (tooBig() && z - 0.05 >= floor - 1e-9) {
      z -= 0.05;
      box.style.zoom = String(z);
    }
    if (z > 1) fixes.push(`grown to ${Math.round(z * 100)}% to fill the frame`);
    if (z < 1) fixes.push(`shrunk to ${Math.round(z * 100)}% to fit`);
    if (tooBig()) {
      box.classList.add("wrap");
      fixes.push("wrapped onto two rows to fit");
    }
    const span = extent().w;
    if (span < frame.clientWidth / 2) warns.push(`content spans ${Math.round((span / frame.clientWidth) * 100)}% of the width; a frame is at least half filled`);
  }
  return { fixes, warns };
};
