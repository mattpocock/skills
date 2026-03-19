---
name: write-a-plan
description: Create a robust implementation plan from scratch through relentless interviewing, codebase exploration, and vertical slicing. Saves to ./plans/. Use when user wants to write a plan, create an implementation plan, plan a feature, or needs to think through how to build something — without requiring a PRD first.
---

# Write a Plan

Build an implementation plan from scratch by interviewing the user, exploring the codebase, and slicing the work into tracer-bullet vertical phases. No PRD required.

## Process

### 1. Understand the goal

Ask the user: **"What do you want to build?"** Accept anything — a sentence, a paragraph, a vague idea. This is the seed.

### 2. Grill the user

Interview the user relentlessly to turn the seed into a clear picture. Walk down each branch of the decision tree, resolving ambiguities one-by-one.

<grill-rules>
- Ask ONE focused question at a time (or a small, tightly related cluster)
- If a question can be answered by exploring the codebase, explore the codebase instead of asking
- Resolve dependencies between decisions before moving forward
- Push back on hand-waving — "it should just work" is not an answer
- Cover these dimensions, in whatever order the conversation flows naturally:
  - **Users & triggers**: Who uses this? What triggers the workflow?
  - **Core behavior**: What does the happy path look like end-to-end?
  - **Data**: What data is created, read, updated, deleted?
  - **Boundaries**: What's in scope vs explicitly out of scope?
  - **Edge cases**: What happens when things go wrong?
  - **Integration points**: What existing systems does this touch?
  - **Constraints**: Performance, security, compliance, timeline?
- Stop when you can describe the full end-to-end behavior back to the user and they confirm it
</grill-rules>

### 3. Explore the codebase

If you haven't already during the interview, explore the codebase to understand architecture, patterns, and integration layers.

### 4. Gather external context

If the user referenced external tools (Linear issues, Figma designs, Notion docs), use MCP tools to pull in that context. Otherwise skip.

### 5. Identify durable architectural decisions

Before slicing, identify decisions unlikely to change: route structures, schema shape, key data models, auth approach, third-party boundaries.

### 6. Draft vertical slices

Break the work into **tracer bullet** phases — thin vertical slices through ALL layers.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- Do NOT include specific file names or implementation details likely to change
- DO include durable decisions: route paths, schema shapes, data model names
</vertical-slice-rules>

### 7. Validate the breakdown

Present the proposed phases as a numbered list. For each phase show:

- **Title**: short descriptive name
- **What it covers**: brief description of the end-to-end behavior

Ask the user:

- Does the granularity feel right?
- Should any phases be merged or split?

Iterate until approved.

### 8. Write the plan file

Create `./plans/` if it doesn't exist. Write the plan as Markdown named after the feature (e.g. `./plans/user-onboarding.md`).

<plan-template>
# Plan: <Feature Name>

> Source: conversation with user, <date>

## Context

Brief summary of what we're building and why, distilled from the interview.

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...
- (add/remove sections as appropriate)

---

## Phase 1: <Title>

### What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Phase 2: <Title>

### What to build

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->
</plan-template>
