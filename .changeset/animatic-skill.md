---
"mattpocock-skills": patch
---

Add `animatic` and `setup-animatic`, two in-progress skills for narrated videos of still frames.

`animatic` (model-invoked) builds one with a single command: frames generated from the storyboard (code straight from a diff, real line numbers, auto-fit) rendered to PNG with Playwright, each line voiced (a failed or empty line is retried), stitched with ffmpeg into a constant-30fps H.264 MP4 that plays in any player, and verified frame by frame. It ships a style guide for pacing (Reveals and Cuts, lines written for the ear), a plain frame kit and a recipe for pull request animatics. It reads its tools from `docs/agents/animatic.md` and falls back to keyless defaults (the machine's built-in voice, else Kokoro). It reads PRs and posts the MP4 through the repo's issue-tracker doc, and calls no tracker CLI of its own.

`setup-animatic` (user-invoked) interviews the user in rounds about the voice, renderer, style and stitcher, tests each choice on the machine (a voiced sample line, a one-moment build), and writes `docs/agents/animatic.md`. API keys stay in environment variables; the config names the variable only.
