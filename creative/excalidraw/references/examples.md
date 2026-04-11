# Excalidraw Diagram Examples

Complete, copy-pasteable examples. Wrap each in the `.excalidraw` envelope before saving:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "hermes-agent",
  "elements": [ ...elements from examples below... ],
  "appState": { "viewBackgroundColor": "#ffffff" }
}
```

> **IMPORTANT:** All text labels on shapes and arrows use container binding (`containerId` + `boundElements`).
> Do NOT use the non-existent `"label"` property -- it will be silently ignored, producing blank shapes.

---

## Example 1: Two Connected Labeled Boxes

A minimal flowchart with two boxes and an arrow between them.

```json
[
  { "type": "text", "id": "title", "x": 280, "y": 30, "text": "Simple Flow", "fontSize": 28, "fontFamily": 1, "strokeColor": "#1e1e1e", "originalText": "Simple Flow", "autoResize": true },
  { "type": "rectangle", "id": "b1", "x": 100, "y": 100, "width": 200, "height": 100, "roundness": { "type": 3 }, "backgroundColor": "#a5d8ff", "fillStyle": "solid", "boundElements": [{ "id": "t_b1", "type": "text" }, { "id": "a1", "type": "arrow" }] },
  { "type": "text", "id": "t_b1", "x": 105, "y": 130, "width": 190, "height": 25, "text": "Start", "fontSize": 20, "fontFamily": 1, "strokeColor": "#1e1e1e", "textAlign": "center", "verticalAlign": "middle", "containerId": "b1", "originalText": "Start", "autoResize": true },
  { "type": "rectangle", "id": "b2", "x": 450, "y": 100, "width": 200, "height": 100, "roundness": { "type": 3 }, "backgroundColor": "#b2f2bb", "fillStyle": "solid", "boundElements": [{ "id": "t_b2", "type": "text" }, { "id": "a1", "type": "arrow" }] },
  { "type": "text", "id": "t_b2", "x": 455, "y": 130, "width": 190, "height": 25, "text": "End", "fontSize": 20, "fontFamily": 1, "strokeColor": "#1e1e1e", "textAlign": "center", "verticalAlign": "middle", "containerId": "b2", "originalText": "End", "autoResize": true },
  { "type": "arrow", "id": "a1", "x": 300, "y": 150, "width": 150, "height": 0, "points": [[0,0],[150,0]], "endArrowhead": "arrow", "startBinding": { "elementId": "b1", "fixedPoint": [1, 0.5] }, "endBinding": { "elementId": "b2", "fixedPoint": [0, 0.5] } }
]
```

---

## Example 2: Photosynthesis Process Diagram

A larger diagram with background zones, multiple nodes, and directional arrows showing inputs/outputs.

```json
[
  {"type":"text","id":"ti","x":280,"y":10,"text":"Photosynthesis","fontSize":28,"fontFamily":1,"strokeColor":"#1e1e1e","originalText":"Photosynthesis","autoResize":true},
  {"type":"text","id":"fo","x":245,"y":48,"text":"6CO2 + 6H2O --> C6H12O6 + 6O2","fontSize":16,"fontFamily":1,"strokeColor":"#757575","originalText":"6CO2 + 6H2O --> C6H12O6 + 6O2","autoResize":true},
  {"type":"rectangle","id":"lf","x":150,"y":90,"width":520,"height":380,"backgroundColor":"#d3f9d8","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#22c55e","strokeWidth":1,"opacity":35},
  {"type":"text","id":"lfl","x":170,"y":96,"text":"Inside the Leaf","fontSize":16,"fontFamily":1,"strokeColor":"#15803d","originalText":"Inside the Leaf","autoResize":true},

  {"type":"rectangle","id":"lr","x":190,"y":190,"width":160,"height":70,"backgroundColor":"#fff3bf","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#f59e0b","boundElements":[{"id":"t_lr","type":"text"},{"id":"a1","type":"arrow"},{"id":"a2","type":"arrow"},{"id":"a3","type":"arrow"},{"id":"a5","type":"arrow"}]},
  {"type":"text","id":"t_lr","x":195,"y":205,"width":150,"height":20,"text":"Light Reactions","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"lr","originalText":"Light Reactions","autoResize":true},

  {"type":"arrow","id":"a1","x":350,"y":225,"width":120,"height":0,"points":[[0,0],[120,0]],"strokeColor":"#1e1e1e","strokeWidth":2,"endArrowhead":"arrow","boundElements":[{"id":"t_a1","type":"text"}]},
  {"type":"text","id":"t_a1","x":390,"y":205,"width":40,"height":20,"text":"ATP","fontSize":14,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"a1","originalText":"ATP","autoResize":true},

  {"type":"rectangle","id":"cc","x":470,"y":190,"width":160,"height":70,"backgroundColor":"#d0bfff","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#8b5cf6","boundElements":[{"id":"t_cc","type":"text"},{"id":"a1","type":"arrow"},{"id":"a4","type":"arrow"},{"id":"a6","type":"arrow"}]},
  {"type":"text","id":"t_cc","x":475,"y":205,"width":150,"height":20,"text":"Calvin Cycle","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"cc","originalText":"Calvin Cycle","autoResize":true},

  {"type":"rectangle","id":"sl","x":10,"y":200,"width":120,"height":50,"backgroundColor":"#fff3bf","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#f59e0b","boundElements":[{"id":"t_sl","type":"text"},{"id":"a2","type":"arrow"}]},
  {"type":"text","id":"t_sl","x":15,"y":210,"width":110,"height":20,"text":"Sunlight","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"sl","originalText":"Sunlight","autoResize":true},

  {"type":"arrow","id":"a2","x":130,"y":225,"width":60,"height":0,"points":[[0,0],[60,0]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":"arrow"},

  {"type":"rectangle","id":"wa","x":200,"y":360,"width":140,"height":50,"backgroundColor":"#a5d8ff","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#4a9eed","boundElements":[{"id":"t_wa","type":"text"},{"id":"a3","type":"arrow"}]},
  {"type":"text","id":"t_wa","x":205,"y":370,"width":130,"height":20,"text":"Water (H2O)","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"wa","originalText":"Water (H2O)","autoResize":true},

  {"type":"arrow","id":"a3","x":270,"y":360,"width":0,"height":-100,"points":[[0,0],[0,-100]],"strokeColor":"#4a9eed","strokeWidth":2,"endArrowhead":"arrow"},

  {"type":"rectangle","id":"co","x":480,"y":360,"width":130,"height":50,"backgroundColor":"#ffd8a8","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#f59e0b","boundElements":[{"id":"t_co","type":"text"},{"id":"a4","type":"arrow"}]},
  {"type":"text","id":"t_co","x":485,"y":370,"width":120,"height":20,"text":"CO2","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"co","originalText":"CO2","autoResize":true},

  {"type":"arrow","id":"a4","x":545,"y":360,"width":0,"height":-100,"points":[[0,0],[0,-100]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":"arrow"},

  {"type":"rectangle","id":"ox","x":540,"y":100,"width":100,"height":40,"backgroundColor":"#ffc9c9","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#ef4444","boundElements":[{"id":"t_ox","type":"text"},{"id":"a5","type":"arrow"}]},
  {"type":"text","id":"t_ox","x":545,"y":105,"width":90,"height":20,"text":"O2","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"ox","originalText":"O2","autoResize":true},

  {"type":"arrow","id":"a5","x":310,"y":190,"width":230,"height":-50,"points":[[0,0],[230,-50]],"strokeColor":"#ef4444","strokeWidth":2,"endArrowhead":"arrow"},

  {"type":"rectangle","id":"gl","x":690,"y":195,"width":120,"height":60,"backgroundColor":"#c3fae8","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#22c55e","boundElements":[{"id":"t_gl","type":"text"},{"id":"a6","type":"arrow"}]},
  {"type":"text","id":"t_gl","x":695,"y":210,"width":110,"height":25,"text":"Glucose","fontSize":18,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"gl","originalText":"Glucose","autoResize":true},

  {"type":"arrow","id":"a6","x":630,"y":225,"width":60,"height":0,"points":[[0,0],[60,0]],"strokeColor":"#22c55e","strokeWidth":2,"endArrowhead":"arrow"},

  {"type":"ellipse","id":"sun","x":30,"y":110,"width":50,"height":50,"backgroundColor":"#fff3bf","fillStyle":"solid","strokeColor":"#f59e0b","strokeWidth":2},
  {"type":"arrow","id":"r1","x":55,"y":108,"width":0,"height":-14,"points":[[0,0],[0,-14]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":null,"startArrowhead":null},
  {"type":"arrow","id":"r2","x":55,"y":162,"width":0,"height":14,"points":[[0,0],[0,14]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":null,"startArrowhead":null},
  {"type":"arrow","id":"r3","x":28,"y":135,"width":-14,"height":0,"points":[[0,0],[-14,0]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":null,"startArrowhead":null},
  {"type":"arrow","id":"r4","x":82,"y":135,"width":14,"height":0,"points":[[0,0],[14,0]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":null,"startArrowhead":null}
]
```

---

## Example 3: Sequence Diagram (UML-style)

Demonstrates a sequence diagram with actors, dashed lifelines, and message arrows.

```json
[
  {"type":"text","id":"title","x":200,"y":15,"text":"MCP Apps -- Sequence Flow","fontSize":24,"fontFamily":1,"strokeColor":"#1e1e1e","originalText":"MCP Apps -- Sequence Flow","autoResize":true},

  {"type":"rectangle","id":"uHead","x":60,"y":60,"width":100,"height":40,"backgroundColor":"#a5d8ff","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#4a9eed","strokeWidth":2,"boundElements":[{"id":"t_uHead","type":"text"}]},
  {"type":"text","id":"t_uHead","x":65,"y":65,"width":90,"height":20,"text":"User","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"uHead","originalText":"User","autoResize":true},

  {"type":"arrow","id":"uLine","x":110,"y":100,"width":0,"height":400,"points":[[0,0],[0,400]],"strokeColor":"#b0b0b0","strokeWidth":1,"strokeStyle":"dashed","endArrowhead":null},

  {"type":"rectangle","id":"aHead","x":230,"y":60,"width":100,"height":40,"backgroundColor":"#d0bfff","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#8b5cf6","strokeWidth":2,"boundElements":[{"id":"t_aHead","type":"text"}]},
  {"type":"text","id":"t_aHead","x":235,"y":65,"width":90,"height":20,"text":"Agent","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"aHead","originalText":"Agent","autoResize":true},

  {"type":"arrow","id":"aLine","x":280,"y":100,"width":0,"height":400,"points":[[0,0],[0,400]],"strokeColor":"#b0b0b0","strokeWidth":1,"strokeStyle":"dashed","endArrowhead":null},

  {"type":"rectangle","id":"sHead","x":420,"y":60,"width":130,"height":40,"backgroundColor":"#ffd8a8","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#f59e0b","strokeWidth":2,"boundElements":[{"id":"t_sHead","type":"text"}]},
  {"type":"text","id":"t_sHead","x":425,"y":65,"width":120,"height":20,"text":"Server","fontSize":16,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"sHead","originalText":"Server","autoResize":true},

  {"type":"arrow","id":"sLine","x":485,"y":100,"width":0,"height":400,"points":[[0,0],[0,400]],"strokeColor":"#b0b0b0","strokeWidth":1,"strokeStyle":"dashed","endArrowhead":null},

  {"type":"arrow","id":"m1","x":110,"y":150,"width":170,"height":0,"points":[[0,0],[170,0]],"strokeColor":"#1e1e1e","strokeWidth":2,"endArrowhead":"arrow","boundElements":[{"id":"t_m1","type":"text"}]},
  {"type":"text","id":"t_m1","x":165,"y":130,"width":60,"height":20,"text":"request","fontSize":14,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"m1","originalText":"request","autoResize":true},

  {"type":"arrow","id":"m2","x":280,"y":200,"width":205,"height":0,"points":[[0,0],[205,0]],"strokeColor":"#8b5cf6","strokeWidth":2,"endArrowhead":"arrow","boundElements":[{"id":"t_m2","type":"text"}]},
  {"type":"text","id":"t_m2","x":352,"y":180,"width":60,"height":20,"text":"tools/call","fontSize":14,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"m2","originalText":"tools/call","autoResize":true},

  {"type":"arrow","id":"m3","x":485,"y":260,"width":-205,"height":0,"points":[[0,0],[-205,0]],"strokeColor":"#f59e0b","strokeWidth":2,"endArrowhead":"arrow","strokeStyle":"dashed","boundElements":[{"id":"t_m3","type":"text"}]},
  {"type":"text","id":"t_m3","x":352,"y":240,"width":60,"height":20,"text":"result","fontSize":14,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"m3","originalText":"result","autoResize":true},

  {"type":"arrow","id":"m4","x":280,"y":320,"width":-170,"height":0,"points":[[0,0],[-170,0]],"strokeColor":"#8b5cf6","strokeWidth":2,"endArrowhead":"arrow","strokeStyle":"dashed","boundElements":[{"id":"t_m4","type":"text"}]},
  {"type":"text","id":"t_m4","x":165,"y":300,"width":60,"height":20,"text":"response","fontSize":14,"fontFamily":1,"strokeColor":"#1e1e1e","textAlign":"center","verticalAlign":"middle","containerId":"m4","originalText":"response","autoResize":true}
]
```

---

## Common Mistakes to Avoid

- **Do NOT use `"label"` property** -- this is the #1 mistake. It is NOT part of the Excalidraw file format and will be silently ignored, producing blank shapes with no visible text. Always use container binding (`containerId` + `boundElements`) as shown in the examples above.
- **Every bound text needs both sides linked** -- the shape needs `boundElements: [{"id": "t_xxx", "type": "text"}]` AND the text needs `containerId: "shape_id"`. If either is missing, the binding won't work.
- **Include `originalText` and `autoResize: true`** on all text elements -- Excalidraw uses these for proper text reflow.
- **Include `fontFamily: 1`** on all text elements -- without it, text may not render with the expected hand-drawn font.
- **Elements overlap when y-coordinates are close** -- always check that text, boxes, and labels don't stack on top of each other
- **Arrow labels need space** -- long labels like "ATP + NADPH" overflow short arrows. Keep labels short or make arrows wider
- **Center titles relative to the diagram** -- estimate total width and center the title text over it
- **Draw decorations LAST** -- cute illustrations (sun, stars, icons) should appear at the end of the array so they're drawn on top

