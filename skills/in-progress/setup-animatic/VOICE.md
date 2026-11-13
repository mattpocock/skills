# The voice

A voice is one flag on every `animatic.mjs` command: `--engine` (with `--voice`) for an engine the script drives itself, or `--tts-command` for anything else. Test a candidate with `say` (SKILL.md step 3) before recommending it to the user by name.

## The engines the script drives

With no voice flag, the script takes the first engine the machine has, in this order:

```
say        macOS built-in            --voice Samantha, Daniel ... (say -v '?' lists them)
sapi       Windows built-in, also    --voice "Microsoft Zira Desktop" ... (the name, in full)
           from WSL via powershell.exe
espeak-ng  Linux, if installed       --voice en-gb, en-us ...
espeak     Linux, if installed
kokoro     none of the above         --voice af_heart (default), af_bella, am_michael,
                                      bf_emma, bm_george ...
```

The built-in voices are free and instant, and sound robotic. Kokoro-82M is a local model run on the CPU: free, no key, faster than real time, and the best-sounding of the five; `setup --engine kokoro` installs it (about 90MB on first use). `--engine` picks any engine in the table by name; `spd-say` cannot write a file, so it is not one.

## Any other engine: `--tts-command`

The script runs the command once per line through the shell:

- The line arrives on **stdin**, and as `{text}`, already shell-quoted. A command uses one or the other.
- `{out}` is a path **with no extension**. The command writes `{out}.wav`, `{out}.mp3`, `{out}.aiff` or whatever its tool produces; the script converts it.
- Speech is cached per line and per command string, so changing the command re-voices everything.
- A line whose command fails, writes nothing or writes an empty file (edge-tts's "No audio received") is retried 3 times with a short backoff, then the run stops and names the line. An empty file is never cached. The same holds for every engine.

For an engine with flags not shown below, read its `--help` and build the command the same way: text in, one audio file at `{out}.<ext>` out.

## Recipes

Free and online, Microsoft's neural voices with no key (`edge-tts --list-voices` lists them; `en-GB-RyanNeural`, `en-US-AriaNeural`, `en-US-AndrewNeural` are good narrators):

```
# pipx install edge-tts
--tts-command 'edge-tts --voice en-GB-RyanNeural --text {text} --write-media {out}.mp3'
```

Free and local:

```
# Piper (pipx install piper-tts; download a voice .onnx first)
--tts-command 'piper --model ~/voices/en_US-lessac-medium.onnx --output_file {out}.wav'
```

Paid and keyed. The command reads the key from the environment, so the config names the variable and never holds its value:

```
# OpenAI
--tts-command 'jq -Rs "{model:\"gpt-4o-mini-tts\",voice:\"alloy\",input:.}" | curl -sf https://api.openai.com/v1/audio/speech -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d @- -o {out}.mp3'

# ElevenLabs
--tts-command 'jq -Rs "{text:.,model_id:\"eleven_multilingual_v2\"}" | curl -sf "https://api.elevenlabs.io/v1/text-to-speech/<voice-id>" -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" -d @- -o {out}.mp3'
```

The `$` stays literal inside the single quotes, so the shell the script spawns expands it at run time, from the environment the build runs in.
