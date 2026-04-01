---
name: prd-to-issues
description: Break a Jira Epic into independently-grabbable Jira Stories using tracer-bullet vertical slices, linking each story to the relevant Gherkin scenarios. Use when user wants to convert a PRD to issues, create implementation tickets, or break down a PRD into work items.
---

# PRD to Issues

Break a Jira Epic into independently-grabbable Stories using vertical slices (tracer bullets).

## Process

### 1. Locate the PRD

Ask the user for the Jira Epic key (e.g. `PROJ-42`).

```bash
jira issue view PROJ-42
```

### 2. Load Gherkin scenarios (if available)

If `features/` exists at the repo root, list the `.feature` files tagged with this Epic key (e.g. `@PROJ-42`). These scenarios will be referenced in each story so that stories trace back to acceptance criteria.

### 3. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 4. Draft vertical slices

Break the PRD into **tracer bullet** stories. Each story is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses
- **Scenarios covered**: which `.feature` scenario titles this slice implements (if applicable)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 6. Create the Jira Stories

For each approved slice, create a Jira Story linked to the parent Epic:

```bash
jira issue create -t Story -s "<story title>" -b "<story body>" -P PROJ-42 --no-input
```

Create stories in dependency order (blockers first) so you can reference real issue keys in the "Blocked by" field.

After creating each story, link it to its blockers:

```bash
jira issue link PROJ-XX PROJ-YY Blocks
```

Then tag the relevant `.feature` scenarios with the new story key by appending a tag (e.g. `@PROJ-XX`) alongside the Epic tag.

<issue-template>
## Parent Epic

PROJ-<epic-key>

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Reference specific sections of the parent Epic rather than duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Gherkin scenarios

Scenarios from `features/` that this story implements:

- `features/<file>.feature` — Scenario: "<scenario title>"

Or "None — no .feature file created yet" if `prd-to-bdd` has not been run.

## Blocked by

- PROJ-<key> (if any)

Or "None — can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent Epic:

- User story 3
- User story 7

</issue-template>

Do NOT close or modify the parent Epic.
