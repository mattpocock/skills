# Frames from somewhere else

The storyboard does not care where a frame came from. Any entry can take `"image"` (a PNG or JPEG) instead of a `"frame"`; `build` renders nothing for it and letterboxes it onto a 1920x1080 frame without stretching it.

## Images the user already has

1. **Look at every image** with your file-reading tool before you write a word. The line must agree with the frame, so you cannot write it from a file name.
2. **Order them as a story**, not as the folder lists them, and say so to the user if your order differs from theirs. This order starts the plan of SKILL.md step 3: write it out as the storyboard and let `build` check it against the target.
3. **Hold one image across several lines** where it has more than one thing worth reading out: give each entry the same `"image"`. That is a Reveal without an edit, and it banks the same credit (STYLE.md, "Reveals build credit"). A fixed image cannot light what a line quotes, so the line says where to look: "line four, at the top of the diff".
4. **Narrate what the image shows**, even where it undercuts the story (an error left on screen, no passing run). Name the gap to the user at hand-over rather than smoothing it over in a line.
5. **Fill a gap with a generated frame** ([`FRAMES.md`](FRAMES.md)) only when the story needs a screen they did not give you (a title card, a diagram). Use the kit for it, and match their images' palette if the kit's would clash.
6. `build` still draws the contact sheet: check the order against it.

STYLE.md's rules for the lines all hold: the radio rule, one idea per Cut, every set named in full.

## Another renderer

The user names a tool (headless Chrome, Puppeteer, Remotion stills, mermaid-cli, Excalidraw, Figma exports, a screenshot of their running app): render each frame to a PNG with that tool, at 1920x1080 where it lets you choose, and give each entry `"image"`. Two recipes:

```
# mermaid-cli, for a diagram (npm i -g @mermaid-js/mermaid-cli)
mmdc -i flow.mmd -o frames/04.png -w 1920 -H 1080 -t dark -b '#101011'

# a page of the user's running app, with the Playwright that setup installed
npx --prefix ~/.cache/animatic playwright screenshot --viewport-size=1920,1080 http://localhost:3000/orders frames/05.png
```

## A style of their own

The user has a brand, a stylesheet or a slide template: write your own pages ([`kit/README.md`](kit/README.md)) against **their** CSS instead of `house.css`, or edit the custom properties at the top of `house.css` (`--ground`, `--accent`, `--sans`, `--mono`) to their colours and fonts. Their look replaces the kit's look; the legibility rules in STYLE.md (the 28px floor, words off the frame, one lit thing) still apply, because they are about being watched, not about taste.
