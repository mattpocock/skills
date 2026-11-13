# The frame kit: your own pages

A generated frame ([`FRAMES.md`](../FRAMES.md)) covers most moments. Write a page of your own only for a screen its types cannot show: a Claude Code session, two panes side by side, a squiggle under an error, the user's own style. Its storyboard entry takes `"html"`, and a Reveal of it is the next entry with no frame (the same page held) or a copy of the page with one thing changed.

```
house.css         the contract: fonts, colours, sizes, every class below
editor.html       a code editor: file tree, tabs, a diff, a squiggle, an error
terminal.html     a shell: a test run that fails
claude-code.html  a Claude Code session: prompt, reply, tool calls, input box
browser.html      dark chrome, a light docs page
title-card.html   a title card: kicker, headline, one supporting line
diagram.html      boxes, arrows, one lit box, an aside
```

**The stylesheet is the contract. The markup is free.** The `.html` files are examples to start from: copy the one nearest your moment, throw away the half it does not need, and add what the moment really shows: a real screen has a sidebar open, a diff, two panes or an error.

## Class index

Read this for a name. Open `house.css` only for a value.

```
FRAME     .frame            outermost element: exactly 1920x1080, overflow CUT
          .frame--center    one centred thing (title card, diagram), 96px gutter
          .frame--full      one window filling the frame, no padding
          .frame--inset     one window floating on the ground, 64px padding
WINDOW    .window           a window (border + shadow inside .frame--inset)
          .titlebar .title  its top bar and title text
          .lights           the three window buttons: <div class="lights"><i></i><i></i><i></i></div>
          .panes            sidebar + main side by side
          .sidebar          left panel; .sidebar-heading its caps label
          .tree             a file tree <ul>; <li> takes .dir .indent .indent-2
                            .active .added .modified
          .main             the main pane beside a sidebar
          .tabs .tab        editor tabs; .tab.active, .tab .dot (unsaved)
          .statusbar        bottom bar; .spacer pushes right, .bad .good colour
CODE      .code             code block (a <div>, never <pre>), 30px, numbered;
                            fits about 16 lines in a full-window editor
          .code--lg         code at 34px; fits about 12 lines
          .l.fold           skipped lines (⋯, no number); give the next line
                            style="counter-set: line N" to number it N
          .l                one code line (numbered); .l.here the line to look at
          .code--spotlight  on the BLOCK: dims every .l except .l.here
          .l.add .l.del     diff lines, green / red; .l.del takes no number (−)
          .l.bare           a line with no number (wrap, inline error)
          .squiggle         red wavy underline on the wrong thing
          .diagnostic       inline editor error text
TOKENS    .t-com .t-punc .t-key .t-storage .t-op .t-str .t-num .t-fn .t-type
          .t-class .t-prop .t-var .t-const .t-tag .t-attr   (vitesse-dark)
TERMINAL  .terminal         terminal body (never <pre>), 30px
          .cmd              a command line; "$ " is generated
          .out              an output line
          .blank            an empty line
          .ok .bad .warn .info .cyan .yellow .magenta .faint   word colours
          .caret            the block cursor (usable anywhere)
CLAUDE    .terminal.cc      a Claude Code session; each line one element:
 CODE     .you              a prompt the user typed ("> ", raised plate)
          .say              the agent's reply ("● ")
          .tool             a collapsed tool call ("● " green); name in <b>
          .result           its one-line result ("└ ")
          .spin             the working line ("✻ …"), orange
          .input .hint      the input box ("> ") and the line under it
          code              inline code in a reply, blue
BROWSER   .browserbar       the bar above a page; .nav-buttons, .urlbar
                            (.lock .host inside it)
          .page             the LIGHT page inside; styles h1 h2 p code,
                            .lede (bigger first paragraph), .signature (code box)
CARD      .card             a plain title plate
          .kicker           small grey caps above the headline
          .headline         104px title; .rule the short accent bar under it
          .subhead          the supporting line
DIAGRAM   .diagram          a centred row of nodes and arrows
          .node             a box; .node-title .node-sub inside;
                            .node.lit the one box, .node.muted pulled back
          .arrow            an arrow glyph; .label an italic word on it
          .annotation       an italic aside in the soft accent
SHARED    .caption          a strip along the bottom (a label, never the line)
          .spot             prose words to look at (the inline twin of .here)
          .overline         a small caps heading above a diagram or panes
          .split            two panes side by side, 2px rule between
```

## Writing a frame

1. Copy `house.css` into the frames folder once, and each example you start from beside it. Pages link `./house.css` relative to themselves.
2. Keep `class="frame"` as the outermost element. It pins the page to 1920x1080 and CUTS whatever does not fit, so overflow shows in the PNG instead of hiding. `build` warns on every cut box, and on a page that lights more than one thing.
3. Fill it with real content (STYLE.md, "The frames").
4. **One line of code or output is one element on one source line.** `.l`, `.cmd` and `.out` keep their whitespace, so a line break inside one is a line break in the frame.
5. **Highlighting is hand-written**: wrap each token in a `t-` span. Nothing runs at capture time.

## Sizes

The type floor is STYLE.md's (28px, code 30px). Chrome (title bars, tabs, the file tree) sits below it on purpose, because nobody reads it.
