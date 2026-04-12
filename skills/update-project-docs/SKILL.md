---
name: update-project-docs
model: haiku
description: Sync documentation with the codebase and generate token-lean architecture codemaps. Use when user wants to update docs, sync documentation, generate codemaps, update architecture docs, run /update-docs, or run /update-codemaps.
---

# Update Project Docs

Two workflows: **docs sync** (keep written docs up to date with source) and **codemaps** (generate token-lean architecture snapshots for AI context).

## Docs sync

See [docs-sync.md](docs-sync.md) for full steps.

**Summary:**
1. Identify sources of truth (`package.json`, `.env.example`, route files, Dockerfile)
2. Generate script reference, env variable table, contributing guide, and runbook from those sources
3. Flag docs not modified in 90+ days for review
4. Report what was updated, created, or skipped

**Rules:**
- Always generate from code, never manually edit generated sections
- Wrap generated sections with `<!-- AUTO-GENERATED -->` markers
- Preserve hand-written prose — only update generated sections
- Don't create new doc files unless explicitly requested

## Codemaps

See [codemaps.md](codemaps.md) for full steps.

**Summary:**
1. Scan project structure and entry points
2. Create/update `docs/CODEMAPS/` with `architecture.md`, `backend.md`, `frontend.md`, `data.md`, `dependencies.md`
3. If changes > 30% from previous codemaps, show diff and request approval before overwriting
4. Add freshness header to each file; save a diff report to `.reports/codemap-diff.txt`

**Tips:**
- Focus on high-level structure, not implementation details
- Keep each codemap under 1000 tokens
- Use ASCII diagrams for data flow
