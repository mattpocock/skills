# Another voice

## The default: the machine's own voice

`speak` and `build` pick the first engine the machine already has, and `setup` prints which:

```
say        macOS built-in            --voice Samantha, Daniel ... (say -v '?' lists them)
sapi       Windows built-in, also    --voice "Microsoft Zira Desktop" ... (the name, in full)
           from WSL via powershell.exe
espeak-ng  Linux, if installed       --voice en-gb, en-us ...
espeak     Linux, if installed
kokoro     none of the above         --voice af_heart (default), af_bella, am_michael,
                                      bf_emma, bm_george ...
```

Kokoro-82M is a local model run on the CPU: free, no key, faster than real time, and the best-sounding of the five. Setup installs it (about 90MB on first use) only on a machine with no voice of its own. To use it anyway, pass `--engine kokoro` to `setup` once, then to `speak` or `build`. `--engine` picks any engine in the table by name; `spd-say` cannot write a file, so it is not one.

Pass the same voice flags (`--engine`, `--voice` or `--tts-command`) to every `build`, so it finds the cached speech.

Voices speak at different rates, so `setup` times a sample line in the voice in force and prints its name and words per second; `build` checks the plan at that rate, and every build refines it from the real run. After you switch voice or engine, run `setup` again with the same flags so the next estimate holds.

## Any other engine: `--tts-command`

An engine not in the table plugs in with `--tts-command`, on `setup`, `speak` or `build`. The script runs the command once per line through the shell:

- The line arrives on **stdin**, and as `{text}`, already shell-quoted. A command uses one or the other.
- `{out}` is a path **with no extension**. The command writes `{out}.wav`, `{out}.mp3`, `{out}.aiff` or whatever its tool produces; the script converts it.
- Speech is cached per line and per command string, so changing the command re-voices everything.

## Recipes

Swap in the voice the user names. Free and local:

```
# Piper (pip install piper-tts; download a voice .onnx first)
--tts-command 'piper --model ~/voices/en_US-lessac-medium.onnx --output_file {out}.wav'
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
