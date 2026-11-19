---
name: setup-animatic
description: "Choose the tools the animatic skill uses in this repo (voice, renderer, style, stitcher), test each one, and record them in docs/agents/animatic.md. Run once before the first animatic, or to change a tool."
disable-model-invocation: true
---

# Setup Animatic

Pick the tool for each stage of the `animatic` pipeline, prove each one works on this machine, and record the choices in `docs/agents/animatic.md`, where the `animatic` skill reads them on every run:

```
renderer  storyboard frame -> PNG    generated frames on the kit (Playwright)
voice     line -> speech             the machine's built-in voice, or any engine
stitcher  PNG + speech -> MP4        ffmpeg
style     the look of every frame    the plain kit, or the user's own CSS
```

This skill needs the `animatic` skill installed beside it. Below, `<animatic>` is the absolute path of that skill's folder (`../animatic` from this one), and the script is `<animatic>/scripts/animatic.mjs`.

## 1. Explore

Gather the facts yourself before asking anything; the decisions are the user's, the facts are yours.

- `docs/agents/animatic.md`: does a config already exist? Then this run changes it, and its current choices are the recommended answers.
- Node 18+ and `ffmpeg` on `PATH`.
- The voices this machine has: the built-in engine (`say` on macOS, SAPI on Windows or from WSL via `powershell.exe`, `espeak-ng`), and any of `edge-tts`, `piper` or `kokoro` already installed.
- Which TTS API keys are set, by name only: `test -n "$OPENAI_API_KEY"`, `test -n "$ELEVENLABS_API_KEY"`. Never print a key's value.
- A stylesheet, brand colours or slide template in the repo, if the user mentioned one.

Done when you can fill in a recommended answer for every stage.

## 2. Interview

Work in **rounds**. A round asks every question you can ask now, numbered, each with your recommended answer, and waits for the user's answers before the next round. Word each question so "yes" accepts the recommendation:

```
❓ **Q1** - **Voice**: <the options, one line each, and what they cost>

➡️ <your recommended answer>
```

**Round 1** asks one question per stage:

1. **Voice.** The question that matters most: the built-in voices are free and instant, and robotic. Recommend, in order: a keyed API whose key is already set (ElevenLabs, OpenAI); else edge-tts with a neural voice (free, online, no key); else Kokoro (free, local, offline); the built-in voice only when the user wants zero setup. [`VOICE.md`](VOICE.md) has every engine and its recipe.
2. **Renderer.** Recommend generated frames on the kit. Another tool (mermaid-cli, Remotion stills, screenshots of a running app) is in [`RENDERER.md`](RENDERER.md).
3. **Style.** Recommend the plain kit, or the repo's own stylesheet if exploration found one (RENDERER.md, "A style of their own").
4. **Stitcher.** Recommend ffmpeg, through `build`. The alternative is the user's own editor: `build` still makes a draft MP4, and hands over `build/timeline.json` (each moment's start, length, line and frame) with the PNGs and voice files in `build/`.

**Later rounds** follow from the answers: which voice of the chosen engine, the environment variable a key lives in, the path of the stylesheet. For a voice, offer two or three candidates and voice the same sample line in each (step 3), so the user picks by ear.

When the user gives every answer up front, skip the questions: take their answers, and ask only what they left open.

Done when every stage has an answer the user gave or accepted.

## 3. Test each choice

A choice is saved only once it works. Collect the flags as you go: the voice flag (`--engine` and `--voice`, or `--tts-command`) and the style flag (`--css`). In a scratch folder outside the repo:

- **Voice**: voice one line, and give the user the file to play:
  ```
  node <animatic>/scripts/animatic.mjs say "Here's the change, and why it matters." -o voice-test.wav <flags>
  ```
  It prints the voice by name and its words per second. Then `node <animatic>/scripts/animatic.mjs setup <flags>` installs the dependencies and stores that rate for the plan gate.
- **Renderer, style and stitcher together**: build a one-moment storyboard with every flag, and read the PNG:
  ```json
  [{ "say": "This is a test of the animatic toolchain.", "frame": { "type": "title", "kicker": "Setup", "headline": "Toolchain test" } }]
  ```
  ```
  node <animatic>/scripts/animatic.mjs build storyboard.json --target 0 <flags>
  ```
  For another renderer, render one frame with its recipe and build with it as an `"image"` entry instead.

A failing test is shown to the user with its error. Fix it, or put the choice back to them; picking a fallback is their call.

Done when `say` wrote a file in the chosen voice, `setup` printed `Ready`, and the test `build` ended with `no warnings` and a PNG in the chosen style.

## 4. Write the config

Write `docs/agents/animatic.md` from [`animatic.md`](animatic.md), the seed template: the flags exactly as tested, one line per stage, and each secret's variable name. A key's value lives only in the environment; the config names the variable (`$ELEVENLABS_API_KEY`), and the command reads it from there. Show the user the file before writing it, and update an existing one in place.

Then add one line under `## Agent skills` in whichever of `CLAUDE.md` / `AGENTS.md` the repo already has (create neither):

```markdown
### Animatic

The animatic skill's voice, renderer, style and stitcher. See `docs/agents/animatic.md`.
```

Done when the config holds the tested flags and no secret value, and the pointer line is in place.
