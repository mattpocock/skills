---
"mattpocock-skills": patch
---

Add `animatic`, an in-progress model-invoked skill that makes a narrated video of still frames: HTML frames rendered to PNG with Playwright, each line voiced by the machine's built-in voice (macOS `say`, Windows SAPI, espeak-ng) or by Kokoro where there is none, stitched with ffmpeg. It ships a style guide for pacing (Reveals and Cuts, lines written for the ear), a plain frame kit, a recipe for pull request animatics, and recipes for bringing your own TTS engine, images or visual style.
