# Animatic

The `animatic` skill's toolchain for this repo, chosen and tested with `setup-animatic`. Edit it by hand, or run `setup-animatic` again to change a tool.

## Flags

Pass these, unchanged, to every `animatic.mjs` command (`build`, `say`, `setup`). Speech is cached per voice flag, so a run with different flags re-voices every line.

```
--tts-command 'edge-tts --voice en-US-AndrewNeural --text {text} --write-media {out}.mp3'
```

## Stages

- **Voice**: edge-tts, `en-US-AndrewNeural` (Microsoft's neural voices, online, no key). Needs `edge-tts` on `PATH` (`pipx install edge-tts`).
- **Renderer**: generated frames on the kit (Playwright).
- **Style**: the plain kit.
- **Stitcher**: ffmpeg, through `build`.

## Secrets

None.

## Tested

2026-11-13: the voice at 2.89 words/s (from `say`); a one-moment build verified with no warnings.
