# Animatic

The `animatic` skill's toolchain for this repo, chosen and tested with `setup-animatic`. Edit it by hand, or run `setup-animatic` again to change a tool.

## Flags

Pass these, unchanged, to every `animatic.mjs` command (`build`, `say`, `setup`). Speech is cached per voice flag, so a run with different flags re-voices every line.

```
--tts-command 'edge-tts --voice en-GB-RyanNeural --text {text} --write-media {out}.mp3'
```

## Stages

- **Voice**: edge-tts, `en-GB-RyanNeural` (Microsoft's neural voices, online, no key). Needs `edge-tts` on `PATH` (`pipx install edge-tts`).
- **Renderer**: generated frames on the kit (Playwright).
- **Style**: the plain kit.
- **Stitcher**: ffmpeg, through `build`.

## Secrets

None. _(Or, for a keyed voice: `ELEVENLABS_API_KEY`, read from the environment by the voice command. Set it before a build; it is never written here.)_

## Tested

<date>: the voice at <rate> words/s (from `say`); a one-moment build verified with no warnings.
