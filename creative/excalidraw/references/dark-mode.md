# Excalidraw Dark Mode Diagrams

To create a dark-themed diagram, use a massive dark background rectangle as the **first element** in the array. Make it large enough to cover any viewport:

```json
{
  "type": "rectangle", "id": "darkbg",
  "x": -4000, "y": -3000, "width": 10000, "height": 7500,
  "backgroundColor": "#1e1e2e", "fillStyle": "solid",
  "strokeColor": "transparent", "strokeWidth": 0
}
```

Then use the following color palettes for elements on the dark background.

## Text Colors (on dark)

| Color | Hex | Use |
|-------|-----|-----|
| White | `#e5e5e5` | Primary text, titles |
| Muted | `#a0a0a0` | Secondary text, annotations |
| NEVER | `#555` or darker | Invisible on dark bg! |

## Shape Fills (on dark)

| Color | Hex | Good For |
|-------|-----|----------|
| Dark Blue | `#1e3a5f` | Primary nodes |
| Dark Green | `#1a4d2e` | Success, output |
| Dark Purple | `#2d1b69` | Processing, special |
| Dark Orange | `#5c3d1a` | Warning, pending |
| Dark Red | `#5c1a1a` | Error, critical |
| Dark Teal | `#1a4d4d` | Storage, data |

## Stroke and Arrow Colors (on dark)

Use the standard Primary Colors from the main color palette -- they're bright enough on dark backgrounds:
- Blue `#4a9eed`, Amber `#f59e0b`, Green `#22c55e`, Red `#ef4444`, Purple `#8b5cf6`

For subtle shape borders, use `#555555`.

## Example: Dark mode labeled rectangle

Use container binding (NOT the `"label"` property, which doesn't work). On dark backgrounds, set text `strokeColor` to `"#e5e5e5"` so it's visible:

```json
[
  {
    "type": "rectangle", "id": "r1",
    "x": 100, "y": 100, "width": 200, "height": 80,
    "backgroundColor": "#1e3a5f", "fillStyle": "solid",
    "strokeColor": "#4a9eed", "strokeWidth": 2,
    "roundness": { "type": 3 },
    "boundElements": [{ "id": "t_r1", "type": "text" }]
  },
  {
    "type": "text", "id": "t_r1",
    "x": 105, "y": 120, "width": 190, "height": 25,
    "text": "Dark Node", "fontSize": 20, "fontFamily": 1,
    "strokeColor": "#e5e5e5",
    "textAlign": "center", "verticalAlign": "middle",
    "containerId": "r1", "originalText": "Dark Node", "autoResize": true
  }
]
```

Note: For standalone text elements on dark backgrounds, always set `"strokeColor": "#e5e5e5"` explicitly. The default `#1e1e1e` is invisible on dark.

