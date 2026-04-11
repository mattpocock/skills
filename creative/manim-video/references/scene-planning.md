# Scene Planning Reference

## Narrative Arc Structures

### Discovery Arc (most common)
1. Hook -- pose a question or surprising result
2. Intuition -- build visual understanding
3. Formalize -- introduce the equation/algorithm
4. Reveal -- the "aha moment"
5. Extend -- implications or generalizations

### Problem-Solution Arc
1. Problem -- what's broken
2. Failed attempt -- obvious approach fails
3. Key insight -- the idea that works
4. Solution -- implement it
5. Result -- show improvement

### Comparison Arc
1. Setup -- introduce two approaches
2. Approach A -- how it works
3. Approach B -- how it works
4. Contrast -- differences
5. Verdict -- which is better

### Build-Up Arc (architecture/systems)
1. Component A -- first piece
2. Component B -- second piece
3. Connection -- how they interact
4. Scale -- add more pieces
5. Full picture -- zoom out

## Scene Transitions

### Clean Break (default)
```python
self.play(FadeOut(Group(*self.mobjects)), run_time=0.5)
self.wait(0.3)
```

### Carry-Forward
Keep one element, fade the rest. Next scene starts with it still on screen.

### Transform Bridge
End scene with a shape, start next scene by transforming it.

## Cross-Scene Consistency

```python
# Shared constants at file top
BG = "#1C1C1C"
PRIMARY = "#58C4DD"
SECONDARY = "#83C167"
ACCENT = "#FFFF00"
TITLE_SIZE = 48
BODY_SIZE = 30
LABEL_SIZE = 24
FAST = 0.8; NORMAL = 1.5; SLOW = 2.5
```

## Scene Checklist

- [ ] Background color set
- [ ] Subcaptions on every animation
- [ ] `self.wait()` after every reveal
- [ ] Text buff >= 0.5 for edge positioning
- [ ] No text overlap
- [ ] Color constants used (not hardcoded)
- [ ] Opacity layering applied
- [ ] Clean exit at scene end
- [ ] No more than 5-6 elements visible at once

## Duration Estimation

| Content | Duration |
|---------|----------|
| Title card | 3-5s |
| Concept introduction | 10-20s |
| Equation reveal | 15-25s |
| Algorithm step | 5-10s |
| Data comparison | 10-15s |
| "Aha moment" | 15-30s |
| Conclusion | 5-10s |

## Planning Template

```markdown
# [Video Title]

## Overview
- **Topic**: [Core concept]
- **Hook**: [Opening question]
- **Aha moment**: [Key insight]
- **Target audience**: [Prerequisites]
- **Length**: [seconds/minutes]
- **Resolution**: 480p (draft) / 1080p (final)

## Color Palette
- Background: #1C1C1C
- Primary: #58C4DD -- [purpose]
- Secondary: #83C167 -- [purpose]
- Accent: #FFFF00 -- [purpose]

## Arc: [Discovery / Problem-Solution / Comparison / Build-Up]

## Scene 1: [Name] (~Ns)
**Purpose**: [one sentence]
**Layout**: [FULL_CENTER / LEFT_RIGHT / GRID / PROGRESSIVE]

### Visual elements
- [Mobject: type, position, color]

### Animation sequence
1. [Animation] -- [what it reveals] (~Ns)

### Subtitle
"[text]"
```
