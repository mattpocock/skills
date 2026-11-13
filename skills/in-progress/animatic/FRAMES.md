# Generated frames

A storyboard entry's `"frame"` is the frame's content. `build` writes the page on the kit, colours the code, keeps each code line's real number, lights the one thing and fits the frame. You write no HTML.

## Cuts and Reveals

An entry with a `"frame"` is a **Cut**. An entry with no frame is a **Reveal**: it holds the frame before it, with its own `"lit"` and `"show"` on top.

```json
{ "say": "Five files change.", "frame": { "type": "list", "items": ["...5 items"], "show": 1 } },
{ "say": "The second is the workflow.", "show": 2 },
{ "say": "Start with the workflow.", "show": 5, "lit": 2 }
```

- **`lit`** is the one thing the line quotes: a line number for code, a 1-based position for a list, a diagram or a terminal, or a piece of text on the frame (the first line, item or node containing it). Leave it out, or set it to `null`, for an **overview**. `build` warns when it matches nothing: the frame does not show what the line says.
- **`show`** is how many items, nodes, lines or paragraphs are visible; the rest are hidden but keep their place, so the frame stays still as they appear.

## The types

**`title`**: the poster and section cards.
`{ "type": "title", "kicker": "PR #1368 · mattpocock/skills", "headline": "Publish the skills\nto npm", "sub": "one supporting line" }`

**`code`**: an editor showing real code. `path` is the file's path in the repo; give one source:
- `"diff": "pr.diff"`: a saved unified diff (`git diff`, or the tracker's diff command). Shows that file's hunks, added and removed lines coloured, numbered by the new file.
- `"src": "src/limit.ts"`: a saved copy of the file, numbered from 1.

Optional: `"lines": "40-58"` or `"12-20,44-50"` (real numbers; a gap becomes a fold), `"tree": [".github", "~package.json", "+scripts/setup.sh"]` (a sidebar; `+` added, `~` modified), `"lang"` where the extension misleads, `"title"`.

**`terminal`**: a shell. Lines starting `$ ` are commands, `""` is a blank line, and `{ "text": "...", "tone": "ok" }` colours one (`ok`, `bad`, `warn`, `info`, `faint`). Optional `"title"`.

**`diagram`**: a row of boxes and arrows.
`{ "type": "diagram", "title": "After merging", "nodes": ["npm login", { "title": "trusted publisher", "sub": "OIDC from CI" }], "arrows": ["then"], "note": "an aside" }`. `arrows` labels the arrows in order; `false` draws none.

**`list`**: a large list: an overview, the files a change touches, a reading order.
`{ "type": "list", "title": "Read in this order", "mono": true, "items": [{ "text": "release.yml", "tag": "~", "sub": "the workflow" }] }`. `tag` is `+`, `~` or `-`; `mono` sets the items as paths.

**`page`**: a light docs page in a browser.
`{ "type": "page", "url": "https://docs.example.com/limits", "heading": "Rate limits", "body": ["A paragraph with `code`.", "## A heading"], "lit": "a phrase on the page" }`

## Fitting

What does not fit is fitted, and `build` prints a `fit` line for each frame it changed:

- **Code** folds away the lines farthest from the lit line, so long code needs no `lines`. A long line wraps under its own number.
- **A terminal** drops its oldest lines.
- **A title, a diagram or a list** is sized to the frame: grown to fill it, or tightened, then shrunk to the 28px floor, then wrapped. A diagram that wrapped holds too much: split it. Content spanning under half the width warns.

A `WARN` that survives fitting names a frame that holds too much: split the moment.

Text on these frames that is not code is capped at 50 characters, and `build` warns past it.
