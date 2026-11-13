# The user's own images or speech

The storyboard does not care where a frame or a line came from. Any entry can take `"image"` (a PNG or JPEG) instead of a `"frame"`, and `"audio"` (a recorded file) instead of a `"say"`. An image can be any size: `build` fits it whole onto a 1920x1080 frame, letterboxed on the kit's ground colour, without stretching it.

## Images the user already has

1. **Look at every image** with your file-reading tool before you write a word. The line must agree with the frame, so you cannot write it from a file name.
2. **Order them as a story**, not as the folder lists them, and say so to the user if your order differs from theirs. This order starts the plan of SKILL.md step 3: write it out as the storyboard and let `build` check it against the target.
3. **Hold one image across several lines** where it has more than one thing worth reading out: give each entry the same `"image"`. That is a Reveal without an edit, and it banks the same credit (STYLE.md, "Reveals build credit"). A fixed image cannot light what a line quotes, so the line says where to look: "line four, at the top of the diff".
4. **Narrate what the image shows**, even where it undercuts the story (an error left on screen, no passing run). Name the gap to the user at hand-over rather than smoothing it over in a line.
5. **Fill a gap with a generated frame** ([`FRAMES.md`](FRAMES.md)) only when the story needs a screen they did not give you (a title card, a diagram). Use the kit for it, and match their images' palette if the kit's would clash.
6. `build` still draws the contact sheet: check the order against it.

STYLE.md's rules for the lines all hold: the radio rule, one idea per Cut, every set named in full.

## Speech that is not a command

A GUI app, a notebook, or the user's own recorded voice: produce one audio file per line yourself, or have the user do it, and give each entry `"audio"` instead of `"say"`. Keep the line's text beside it as a `"note"` field so the storyboard still reads as a script, and the plan gate still times it; the script ignores fields it does not know.

```json
{ "audio": "takes/03.wav", "note": "Here's the limiter as it was.", "image": "shots/03.png" }
```
