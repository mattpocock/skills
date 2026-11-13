---
name: animatic
description: Make an animatic, a narrated video of still frames. Use when the user asks for an animatic or a narrated explainer, a video for a pull request or a tour of several, or gives feedback on one they have watched.
---

An **animatic** is a run of **moments**, each one still frame held while its one spoken line plays. One **storyboard** file drives it, and one command builds it:

```
frame   storyboard frame -> PNG    Playwright (Chromium)
voice   line -> speech             the machine's built-in voice, else Kokoro (TTS.md)
stitch  PNG + speech -> MP4        ffmpeg
```

[`scripts/animatic.mjs`](scripts/animatic.mjs) runs all three. Below, `<skill>` is the absolute path of this skill's folder. Aim for few turns: read what a step names in one go, and write the storyboard in one go.

## 1. Pin the toolchain

Run setup every time, even when the user brings every tool: the contact sheet is drawn with its Playwright. It needs Node 18+ and ffmpeg on `PATH`, takes a second once installed, and prints the voice in force.

```
node <skill>/scripts/animatic.mjs setup
```

**The user's tools win.** A tool the user names for any stage is that stage, even where the default is installed and would work. If it fails, show the error and ask; switching to the default is the user's call.

- A text-to-speech engine or voice of their own, or a different voice from the one setup picked: read [`TTS.md`](TTS.md).
- Images they already have, another renderer, or a visual style of their own: read [`IMAGES.md`](IMAGES.md).
- Their own stitcher or editor: build with the defaults for a draft, then hand them `build/timeline.json` (each moment's start, length, line and frame) with the PNGs and the voice files in `build/`.

Done when setup prints `Ready`, and each tool the user named has turned one test line or frame into a file.

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
node <skill>/scripts/animatic.mjs build storyboard.json --target 90
```

`build` checks the plan first: over the target by more than 10%, or with a line the voice would read as punctuation, it prints the plan with `WARN` lines and stops with nothing rendered or voiced. Cut moments or respell, and run it again. Then it renders and voices at once, stitches `animatic.mp4`, draws `sheet.png`, verifies the MP4 (streams, length, every frame on time and matching, the voice audible), and prints one report: the timeline, `fit` lines, and every `WARN`.

Frames and speech are cached, so a rebuild redoes only what changed, in seconds.

Done when `build` ends with `no warnings`.

## 5. Read the sheet

Read `sheet.png` (every frame numbered, its line under it, Cuts marked) against STYLE.md's "The sheet checklist". Open a single frame from `build/` at full size where the sheet leaves a doubt. Fix the storyboard and rebuild.

Done when the sheet passes the checklist and `build` ends with `no warnings`.

## 6. Hand it over

Give the user the MP4's path, its run time, the moment count and the Cut count. For a PR, tell them how to attach it (PR.md, "Hand it over").

The user gives feedback by position: "4 is too dense, 9 and 10 say the same thing". Revise by STYLE.md's "Feedback", rebuild, and report the new run time.
