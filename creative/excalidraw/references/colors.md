# Excalidraw Color Palette

Use these colors consistently across diagrams.

## Primary Colors (for strokes, arrows, and accents)

| Name | Hex | Use |
|------|-----|-----|
| Blue | `#4a9eed` | Primary actions, links, data series 1 |
| Amber | `#f59e0b` | Warnings, highlights, data series 2 |
| Green | `#22c55e` | Success, positive, data series 3 |
| Red | `#ef4444` | Errors, negative, data series 4 |
| Purple | `#8b5cf6` | Accents, special items, data series 5 |
| Pink | `#ec4899` | Decorative, data series 6 |
| Cyan | `#06b6d4` | Info, secondary, data series 7 |
| Lime | `#84cc16` | Extra, data series 8 |

## Pastel Fills (for shape backgrounds)

| Color | Hex | Good For |
|-------|-----|----------|
| Light Blue | `#a5d8ff` | Input, sources, primary nodes |
| Light Green | `#b2f2bb` | Success, output, completed |
| Light Orange | `#ffd8a8` | Warning, pending, external |
| Light Purple | `#d0bfff` | Processing, middleware, special |
| Light Red | `#ffc9c9` | Error, critical, alerts |
| Light Yellow | `#fff3bf` | Notes, decisions, planning |
| Light Teal | `#c3fae8` | Storage, data, memory |
| Light Pink | `#eebefa` | Analytics, metrics |

## Background Zones (use with opacity: 30-35 for layered diagrams)

| Color | Hex | Good For |
|-------|-----|----------|
| Blue zone | `#dbe4ff` | UI / frontend layer |
| Purple zone | `#e5dbff` | Logic / agent layer |
| Green zone | `#d3f9d8` | Data / tool layer |

## Text Contrast Rules

- **On white backgrounds**: minimum text color is `#757575`. Default `#1e1e1e` is best.
- **Colored text on light fills**: use dark variants (`#15803d` not `#22c55e`, `#2563eb` not `#4a9eed`)
- **White text**: only on dark backgrounds (`#9a5030` not `#c4795b`)
- **Never**: light gray (`#b0b0b0`, `#999`) on white -- unreadable
