---
name: animatic
description: Make an animatic, a narrated video of still frames. Use when the user asks for an animatic or a narrated explainer, a video for a pull request or a tour of several, or gives feedback on one they have watched.
---

An **animatic** is a run of **moments**, each one still frame held while its one spoken line plays. One **storyboard** file drives it, and one command builds it:

```
frame   storyboard frame -> PNG    Playwright (Chromium)
voice   line -> speech             the configured voice, else the machine's own
stitch  PNG + speech -> MP4        ffmpeg
```

[`scripts/animatic.mjs`](scripts/animatic.mjs) runs all three. Below, `<skill>` is the absolute path of this skill's folder. Aim for few turns: read what a step names in one go, and write the storyboard in one go.

## 1. Read the toolchain

The repo's choice of tools lives in `docs/agents/animatic.md`, written by the `setup-animatic` skill. Read it. Its **Flags** go on every `animatic.mjs` command, unchanged, and its **Stages** say what runs each stage:

- **Stitcher**: the user's own editor: build as usual for a draft, then also hand over `build/timeline.json` (each moment's start, length, line and frame) with the PNGs and voice files in `build/`.
- **Renderer**: another tool for some frames: render those to PNGs with its recorded command, as `"image"` entries.

**No config** (or no repo): build with no flags, on the defaults: the machine's built-in voice (Kokoro where it has none) and the plain kit. At hand-over, say which voice spoke and that `/setup-animatic` picks a better one.

**The user's tools win.** A tool the user names in this request beats the config for this run. Its recipe is in the `setup-animatic` skill, beside this one: `../setup-animatic/VOICE.md` for a voice, `../setup-animatic/RENDERER.md` for a renderer or a style. Test it with one line or frame first (`animatic.mjs say "<a line>" <flags>` for a voice). If it fails, show the error and ask; falling back is the user's call.

Images or recorded speech the user already has: read [`OWN-MEDIA.md`](OWN-MEDIA.md).

`build` installs what it needs and measures the voice the first time it meets them, so there is no setup step.

Done when you hold the flags for this run, and each tool the user named has turned one test line or frame into a file.

## 2. Gather the source

- A pull request, or a review of several: read [`PR.md`](PR.md) now.
- Anything else: the topic, and the code, docs or notes the user points at. Save the code you will show into the work folder (step 3), so code frames read it straight from the file.

Done when you can say in one sentence why a viewer should care, and list the ideas in the order the viewer needs them.

## 3. Write the storyboard

Read [`STYLE.md`](STYLE.md) and [`FRAMES.md`](FRAMES.md) together, before you write. Every rule in STYLE.md bears on the plan, on every branch.

Work in a folder of its own, outside any repo, so nothing in it gets committed by accident: `$TMPDIR/animatic-<slug>/`, unless the user gives one.

`storyboard.json` is a JSON array, one entry per moment, in playback order, paths relative to it. Each entry has its line and its frame:

```json
[
  { "say": "This PR stops one busy customer from blocking everyone else.", "frame": { "type": "title", "kicker": "PR #214", "headline": "One limit per key" } },
  { "say": "Here's the limiter.", "frame": { "type": "code", "path": "src/limit.ts", "diff": "pr.diff" } },
  { "say": "It counted requests per IP address.", "lit": 14 }
]
```

An entry takes one of `"frame"` (FRAMES.md), `"html"` (a page of your own, for a screen no frame type shows: [`kit/README.md`](kit/README.md)) or `"image"` (a PNG you already have), or none, to hold the frame before as a Reveal. It takes one of `"say"`, `"audio"` (speech you already have) or `"seconds"` (a silent hold).

Write every `"say"` as the voice will read it, literally: respell each identifier, path, number, abbreviation and typo the way a person says it ("req dot ip", "four twenty-nine", "spelt L I M T").

Done when every moment has its line and its frame, and the plan has about one Cut per idea.

## 4. Build

The target run time is the user's, PR.md's for a PR, or 90 seconds when they say "short" or nothing.

```
node <skill>/scripts/animatic.mjs build storyboard.json --target 90 <flags>
```

`build` checks the plan first: over the target by more than 10%, or with a line the voice would read as punctuation, it prints the plan with `WARN` lines and stops with nothing rendered or voiced. Cut moments or respell, and run it again. Then it renders and voices at once, stitches `animatic.mp4` (constant 30fps H.264, so it plays in any player and survives upload), draws `sheet.png`, verifies the MP4 (streams, frame rate, length, every moment on screen from its start to its end and matching its PNG, the voice audible), and prints one report: the timeline, `fit` lines, and every `WARN`.

Frames and speech are cached, so a rebuild redoes only what changed, in seconds.

Done when `build` ends with `no warnings`.

## 5. Read the sheet

Read `sheet.png` (every frame numbered, its line under it, Cuts marked) against STYLE.md's "The sheet checklist". Open a single frame from `build/` at full size where the sheet leaves a doubt. Fix the storyboard and rebuild.

Done when the sheet passes the checklist and `build` ends with `no warnings`.

## 6. Hand it over

Give the user the MP4's path, its run time, the moment count and the Cut count.

Post it only when the user asks: attach the MP4 to a comment on the PR or issue, the way the repo's issue-tracker doc (`docs/agents/issue-tracker.md`, "attach a file to a comment") says, and give them the comment's link. With no tracker doc, or one that cannot attach, hand over the path and say so. PR.md, "Hand it over" has the comment's wording and the size limit.

The user gives feedback by position: "4 is too dense, 9 and 10 say the same thing". Revise by STYLE.md's "Feedback", rebuild, and report the new run time.
