# The renderer and the style

## Another renderer

The default renders each storyboard `"frame"` on the kit with Playwright. Another tool (headless Chrome, Puppeteer, Remotion stills, mermaid-cli, Excalidraw, Figma exports, a screenshot of the user's running app) renders a frame to a PNG (1920x1080 is sharpest; `build` letterboxes any other size), and the storyboard entry takes it as `"image"`. Record the tool's command in the config's Stages, with what it is for ("diagrams: mermaid-cli"); the generated frames still cover every other screen. Two recipes:

```
# mermaid-cli, for a diagram (npm i -g @mermaid-js/mermaid-cli)
mmdc -i flow.mmd -o frames/04.png -w 1920 -H 1080 -t dark -b '#101011'

# a page of the user's running app, with the Playwright that setup installs
npx --prefix ~/.cache/animatic playwright screenshot --viewport-size=1920,1080 http://localhost:3000/orders frames/05.png
```

## A style of their own

The user has a brand, a stylesheet or a slide template. Write a stylesheet in the repo (say `docs/agents/animatic.css`) that sets the custom properties at the top of the kit's `house.css` (`<animatic>/kit/house.css`: `--ground`, `--accent`, `--sans`, `--mono` and their neighbours) to their colours and fonts, and add `--css docs/agents/animatic.css` to the config's flags. `build` layers it over `house.css` on every generated frame. Leave the kit's own files untouched, so the skill updates cleanly.

Their look replaces the kit's look. The legibility rules in the animatic skill's `STYLE.md` (the 28px floor, words off the frame, one lit thing) still apply, because they are about being watched, not about taste.
