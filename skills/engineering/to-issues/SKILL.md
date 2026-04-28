---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues using tracer-bullet vertical slices. Backend-agnostic — pairs with `/github` (or another backlog skill) to publish. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets). Produce canonical artifacts; hand off to a backend skill (`/github` by default) to publish.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue identifier as an argument and a backend is reachable, ask the backend skill to fetch the parent issue (with comments).

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Before exploring, follow [../grill-with-docs/DOMAIN-AWARENESS.md](../grill-with-docs/DOMAIN-AWARENESS.md). Issue titles and bodies should use the project's `CONTEXT.md` vocabulary.

### 3. Draft vertical slices

Break the plan into **tracer bullet** slices. Each is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be **HITL** or **AFK**. HITL slices require human interaction (an architectural decision, a design review). AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Produce artifacts

For each approved slice, produce an artifact with:

- **title** — short descriptive name
- **type** — `AFK` or `HITL`. Maps to state: AFK → `ready-for-agent`, HITL → `ready-for-human` (the state vocabulary lives in `/triage`)
- **category** — `enhancement` by default, or `bug` if the parent was a bug
- **blocked-by** — references to other slices in this batch (by their position in the list)
- **body** — formatted per the templates below

**AFK slices** use the AGENT-BRIEF format from [../triage/AGENT-BRIEF.md](../triage/AGENT-BRIEF.md). The agent brief is the contract the AFK agent will work from.

**HITL slices** use the simpler template below — they require human judgment, so a procedural acceptance list is enough.

<hitl-template>
## Parent

#<parent-issue-id> (if the source was an existing issue, otherwise omit)

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Why this needs a human

Brief reason this can't be delegated to an AFK agent (e.g. requires architectural decision, design review, judgment call).

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by <slice-ref> (if any)

Or "None - can start immediately" if no blockers.
</hitl-template>

### 6. Hand off

Present the artifact list to the user and end with a handoff hint:

> Artifacts ready. Invoke `/github` (or your configured backend equivalent) to publish — it will create issues in dependency order, apply state and category labels, and substitute real identifiers into the "Blocked by" references.

Do not call `gh` directly. The backend skill owns publishing.

Do NOT close or modify any parent issue.
