# Another voice

The default is Kokoro-82M, run locally on the CPU through `kokoro-js`: free, no key, no network after its first download, faster than real time. Change its voice with `--voice` on `speak` or `build`. American: `af_heart` (the default), `af_bella`, `af_nicole`, `am_michael`, `am_fenrir`, `am_puck`. British: `bf_emma`, `bf_isabella`, `bm_george`, `bm_fable`.

## The engine the user names is the engine you use

Plug it in with `--tts-command`, on `speak` or `build`. The script runs the command once per line through the shell:

- The line arrives on **stdin**, and as `{text}`, already shell-quoted. A command uses one or the other.
- `{out}` is a path **with no extension**. The command writes `{out}.wav`, `{out}.mp3`, `{out}.aiff` or whatever its tool produces; the script converts it.
- Speech is cached per line and per command string, so changing the command re-voices everything.

Pass the same `--tts-command` to `stitch` if you run it on its own, so it finds the cached speech.

Test the command on one line by hand before the whole run. If it fails, show the user the error and ask: the default is a fallback only when they say so.

## Recipes

Swap in the voice the user names. Free and local:

```
# macOS built-in
--tts-command 'say -v Samantha -o {out}.aiff {text}'

# Piper (pip install piper-tts; download a voice .onnx first)
--tts-command 'piper --model ~/voices/en_US-lessac-medium.onnx --output_file {out}.wav'

# espeak-ng (apt install espeak-ng): robotic, but it runs anywhere
--tts-command 'espeak-ng -w {out}.wav {text}'
```

Free and online (Microsoft's Edge read-aloud service, no key):

```
# pip install edge-tts
--tts-command 'edge-tts --voice en-US-AriaNeural --text {text} --write-media {out}.mp3'
```

Paid, keyed. Read the key from the environment, and never write it into a file:

```
# OpenAI
--tts-command 'jq -Rs "{model:\"gpt-4o-mini-tts\",voice:\"alloy\",input:.}" | curl -sf https://api.openai.com/v1/audio/speech -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d @- -o {out}.mp3'

# ElevenLabs
--tts-command 'jq -Rs "{text:.,model_id:\"eleven_multilingual_v2\"}" | curl -sf "https://api.elevenlabs.io/v1/text-to-speech/<voice-id>" -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" -d @- -o {out}.mp3'
```

For an engine with flags not shown here, read its `--help` and build the command the same way: text in, one audio file at `{out}.<ext>` out.

## Speech that is not a command

A GUI app, a notebook, or the user's own recorded voice: produce one audio file per line yourself, or have the user do it, and give each entry `"audio"` instead of `"say"`. Keep the line's text beside it as a `"note"` field so the storyboard still reads as a script; the script ignores fields it does not know.

```json
{ "audio": "takes/03.wav", "note": "Here's the limiter as it was.", "html": "frames/03.html" }
```
