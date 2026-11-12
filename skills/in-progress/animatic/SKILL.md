---
name: animatic
description: Make an animatic, a narrated video of still frames. Use when the user asks for an animatic or a narrated explainer, a video for a pull request or a tour of several, or gives feedback on one they have watched.
---

An **animatic** is a run of **moments**, each one still frame held while its one spoken line plays. One **storyboard** file drives three stages, each with a default:

```
frame   HTML page -> PNG     Playwright (Chromium)
voice   line -> speech       the machine's built-in voice, else Kokoro (TTS.md)
stitch  PNG + speech -> MP4  ffmpeg
```

[`scripts/animatic.mjs`](scripts/animatic.mjs) runs all three. Below, `<skill>` is the absolute path of this skill's folder.

## 1. Pin the toolchain

Run setup once per machine, even when the user brings every tool: the contact sheet in step 5 is drawn with its Playwright. It needs Node 18+ and ffmpeg on `PATH`, and prints the voice it picked.

```
node <skill>/scripts/animatic.mjs setup
```

**The user's tools win.** A tool the user names for any stage is that stage, even where the default is installed and would work. If it fails, show the error and ask; switching to the default is the user's call.

- A text-to-speech engine or voice of their own, or a different voice from the one setup picked: read [`TTS.md`](TTS.md).
- Images they already have, another renderer, or a visual style of their own: read [`IMAGES.md`](IMAGES.md).
- Their own stitcher or editor: run `build` with the defaults for a draft, then hand them `build/timeline.json` (each moment's start, length, line and frame) with the PNGs and the voice files in `build/`.

Done when setup prints `Ready`, and each tool the user named has turned one test line or frame into a file.

## 2. Gather the source

- A pull request, or a review of several: read [`PR.md`](PR.md) now.
- Anything else: the topic, and the code, docs or notes the user points at.

Done when you can say in one sentence why a viewer should care, and list the ideas in the order the viewer needs them.

## 3. Plan the moments

**Read [`STYLE.md`](STYLE.md) before you plan.** Every rule in it bears on the plan, on every branch, the user's own images included.

Work in a folder of its own, outside any repo, so nothing in it gets committed by accident: `$TMPDIR/animatic-<slug>/`, unless the user gives one.

The plan is `storyboard.json` with every line written and no frames yet. It is a JSON array, one entry per moment, in playback order, with paths relative to it:

```json
[
  { "say": "This PR stops one busy customer from blocking everyone else.", "html": "frames/01.html" },
  { "say": "Here's the limiter as it was.", "html": "frames/02.html" },
  { "say": "It counted requests per IP address.", "html": "frames/02b.html" }
]
```

An entry takes exactly one of `"html"` or `"image"` (a PNG you already have), and one of `"say"`, `"audio"` (speech you already have) or `"seconds"` (a silent hold). Name each frame file now: a Reveal takes the number of the frame it develops plus a letter (`02.html`, `02b.html`, `02c.html`), and a frame held unchanged across two lines is the same `"html"` in both entries.

Check the plan against a target run time: the user's, PR.md's for a PR, or 90 seconds when they say "short" or nothing.

```
node <skill>/scripts/animatic.mjs estimate storyboard.json --target 90
```

`estimate` uses the speaking rate setup measured for this voice, and allows 10% over the target. Over that, cut moments now: a cut here costs a sentence, and a cut after `build` costs a rebuild.

**This step is a gate.** The first HTML file, the `frames/` folder and any script that generates frames all come after `estimate` prints no `WARN`. Done when it prints none and the plan has about one Cut per idea.

## 4. Write the frames

Read [`kit/README.md`](kit/README.md), then write each frame by its "Writing a frame", starting from the kit example nearest the screen.

Done when every `"html"` in the storyboard names a frame that exists.

## 5. Render and look

```
node <skill>/scripts/animatic.mjs render storyboard.json --sheet sheet.png
```

It writes `build/NN.png` per moment and one contact sheet of every frame, numbered, with its line under it. Read `sheet.png` against STYLE.md's "The sheet checklist". Fix every `WARN` line: a page error, or content cut off at the bottom or right of its box. Open a single frame's PNG at full size where the sheet leaves a doubt. After a fix, re-render with `--only 4,7 --sheet sheet.png` and read the sheet again.

Done when no `WARN` remains and the sheet passes the checklist.

## 6. Voice and stitch

First, a **literal read**: read every `"say"` exactly as the voice will, and respell each identifier, path, number, abbreviation and typo the way a person says it ("req dot ip", "four twenty-nine", "spelt L I M T").

```
node <skill>/scripts/animatic.mjs build storyboard.json -o animatic.mp4 --sheet sheet.png
```

`build` renders, redraws the sheet so it matches the video, voices, stitches, and prints the timeline. Speech is cached per line, so a revision re-voices only the lines it changed. Give it a ten-minute timeout: a long storyboard takes a while to voice.

`build` warns on any moment over 15 seconds: split that line in two, on one held or revealed frame. Done when it finishes with no such warning.

## 7. Verify the video

- `ffprobe -v error -show_entries format=duration:stream=codec_type -of compact animatic.mp4` shows one video and one audio stream, and a duration within a second of the timeline's total.
- The voice is audible: `ffmpeg -ss <a moment's start + 1> -t 3 -i animatic.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume` reads louder than -40 dB.
- Take a frame from the middle of three moments, the first, one Reveal and the last, using the starts in `build/timeline.json`: `ffmpeg -v error -ss <start + 1> -i animatic.mp4 -frames:v 1 check-<n>.png`. Read each one, and check it is the frame its line talks about.

Done when all three hold.

## 8. Hand it over

Give the user the MP4's path, its run time, the moment count and the Cut count. For a PR, tell them how to attach it (PR.md, "Hand it over").

The user gives feedback by position: "4 is too dense, 9 and 10 say the same thing". Revise by STYLE.md's "Feedback", re-run `build`, and report the new run time.
