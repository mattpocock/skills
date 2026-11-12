---
name: animatic
description: Make an animatic, a narrated video of still frames that explains a change or an idea. Use when the user asks for an animatic, a narrated walkthrough or explainer video, or a video for a PR description.
---

An **animatic** is a run of **moments**, each one still frame and one spoken line. Played in order, each frame holds while its line is spoken. The pipeline has three stages, and each has a default:

```
frame   HTML page -> PNG     Playwright (Chromium)
voice   line -> speech       the machine's built-in voice (macOS say, Windows SAPI,
                             espeak-ng); Kokoro, a local model, where there is none
stitch  PNG + speech -> MP4  ffmpeg
```

[`scripts/animatic.mjs`](scripts/animatic.mjs) runs all three from one **storyboard** file; below, `<skill>` is the absolute path of this skill's folder. The look sits on top, in [`kit/`](kit/README.md), and the rules that make an animatic watchable are in [`STYLE.md`](STYLE.md).

## 1. Pin the toolchain

**The user's tools win.** If the user names a tool for any stage, that tool is the stage, even when the default is installed and would work. If it fails, show the error and ask; switching to the default is the user's call.

- A text-to-speech engine or voice of their own, or a different voice from the one setup picked: read [`TTS.md`](TTS.md).
- Images they already have, another renderer, or a visual style of their own: read [`IMAGES.md`](IMAGES.md).
- Their own stitcher or editor: run `build` with the defaults for a draft, then hand them `build/timeline.json` (each moment's start, length, line and frame) with the PNGs and the voice files in `build/`.

Run setup once per machine, even when the user brings every tool: the contact sheet in step 5 is drawn with Playwright. It needs Node 18+ and ffmpeg on `PATH`, installs Playwright into `~/.cache/animatic`, and prints the voice it will use: the machine's own, or Kokoro (installed then) where it has none.

```
node <skill>/scripts/animatic.mjs setup
```

Done when setup prints `Ready`, and each tool the user named has turned one test line or frame into a file.

## 2. Gather the source

- A pull request, or a review of several: read [`PR.md`](PR.md) now.
- Anything else: the topic, and the code, docs or notes the user points at.

Done when you can say in one sentence why a viewer should care, and list the ideas in the order the viewer needs them.

## 3. Plan the moments

**Read [`STYLE.md`](STYLE.md) before you plan.** Every rule in it bears on the plan. This step holds on every branch, the user's own images included.

The plan is the storyboard (step 4) with its lines written and no frames yet: every moment's `"say"`, and the frame file it will use, Reveals named `03b`, `03c`. Write it first, then check it against a target run time: the user's, PR.md's for a PR, or 90 seconds when they say "short" or nothing.

```
node <skill>/scripts/animatic.mjs estimate storyboard.json --target 90
```

`estimate` uses the speaking rate setup measured for this voice, and allows 10% over the target. Over that, cut moments now: a cut here costs a sentence, and a cut after `build` costs a rebuild.

**This step is a gate.** Until `estimate` prints no `WARN`, write no frame: no HTML, no `frames/` folder, and no script that generates either. Done when `estimate` passes and the plan has about one Cut per idea.

## 4. Write the frames and the storyboard

Work in a folder of its own, outside any repo, so nothing in it gets committed by accident: `$TMPDIR/animatic-<slug>/`, unless the user gives one. Copy `kit/house.css` into it, and the example from `kit/` nearest each screen. [`kit/README.md`](kit/README.md) holds the class index: read it rather than searching the stylesheet.

A Reveal is a copy of the page before it with one thing changed, so name the files to show it: `03.html`, `03b.html`, `03c.html`.

The storyboard is a JSON array, one entry per moment, in playback order. Paths are relative to it:

```json
[
  { "say": "This PR stops one busy customer from blocking everyone else.", "html": "frames/01.html" },
  { "say": "Here's the limiter as it was.", "html": "frames/02.html" },
  { "say": "It counted requests per IP address.", "html": "frames/02b.html" }
]
```

An entry takes exactly one of `"html"` or `"image"` (a PNG you already have), and `"say"`, `"audio"` (speech you already have), or `"seconds"` (a silent hold). Hold a frame unchanged across two lines by giving both entries the same `"html"`.

## 5. Render and look

```
node <skill>/scripts/animatic.mjs render storyboard.json --sheet sheet.png
```

It writes `build/NN.png` per moment and one contact sheet of every frame, numbered, with its line under it. Read `sheet.png` and judge it against the checklist at the end of STYLE.md. Fix every `WARN` line: a page error, or content cut off at the bottom or right of its box. Open a single frame's PNG at full size only where the sheet leaves a doubt. After a fix, re-render with `--only 4,7 --sheet sheet.png` and read the sheet again.

Done when no `WARN` remains and the sheet passes the checklist.

## 6. Voice and stitch

First read every `"say"` the way the voice will: literally. Spell out each identifier, path, number, abbreviation and typo as a person says it ("req dot ip", "four twenty-nine", "spelt L I M T").

```
node <skill>/scripts/animatic.mjs build storyboard.json -o animatic.mp4 --sheet sheet.png
```

`build` renders, redraws the sheet so it matches the video, voices and stitches in one go, and prints the timeline: each moment's length and line, then the total. It warns on any moment over 15 seconds: split that line in two, on one held or revealed frame. Speech is cached per line, so after a revision only the changed lines are voiced again. Give it a ten-minute timeout: a long storyboard takes a while to voice.

## 7. Verify the video

- `ffprobe -v error -show_entries format=duration:stream=codec_type -of compact animatic.mp4` shows one video and one audio stream, and a duration within a second of the timeline's total.
- The voice is audible: `ffmpeg -ss <a moment's start + 1> -t 3 -i animatic.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume` reads louder than -40 dB.
- Take a frame from the middle of three moments, the first, one Reveal and the last, using the starts in `build/timeline.json`: `ffmpeg -v error -ss <start + 1> -i animatic.mp4 -frames:v 1 check-<n>.png`. Read each one, and check it is the frame its line talks about.

Done when all three hold.

## 8. Hand it over

Give the user the MP4's path, its run time, the moment count and the Cut count. For a PR, tell them how to attach it (PR.md).

The user gives feedback by position: "4 is too dense, 9 and 10 say the same thing". Change the moments they name and keep the rest; STYLE.md says how to read each kind of note. Re-run `build` and report the new run time.
