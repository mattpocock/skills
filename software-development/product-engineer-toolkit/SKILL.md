---
name: product-engineer-toolkit
description: Tools and templates for product engineers working across discovery, build, launch, metrics, and iteration. Use when the user wants to ship better product work, define features, write PRDs, design experiments, and connect code to customer outcomes.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [product-engineering, product, discovery, metrics, experiments, launch, roadmap, prd]
    related_skills: [writing-plans, test-driven-development, requesting-code-review, systematic-debugging]
---

# Product Engineer Toolkit

This skill helps a product engineer ship the right thing, not just build the thing.

Use it for:
- turning ideas into clear product requirements
- framing problems and tradeoffs
- defining success metrics
- designing experiments
- planning launches
- writing PRDs and RFCs
- connecting engineering work to user and business outcomes
- debugging product issues from both code and customer-impact angles

## Core philosophy

A good product engineer should always know:
- what problem is being solved
- who the user is
- what success looks like
- what the smallest useful version is
- how to measure impact
- how to roll out safely
- what to do if the result is wrong

## Default workflow

1. Define the problem
- What user pain or business goal is this addressing?
- What evidence exists?
- What assumptions are being made?

2. Frame the solution space
- What are the possible approaches?
- What is the minimum viable version?
- What tradeoffs matter?

3. Specify success
- What metrics will move?
- What user behavior should change?
- What guardrails prevent regressions?

4. Build and validate
- What should be built first?
- What tests or instrumentation are needed?
- What rollout strategy is safest?

5. Measure and iterate
- Did the change work?
- What did users actually do?
- What should be improved next?

## Output types

Depending on the request, produce one or more of:
- feature brief
- PRD
- RFC
- experiment plan
- launch plan
- success metrics / KPI tree
- implementation checklist
- risk register
- rollout plan
- post-launch review
- customer feedback synthesis

## Response style

Always lead with:
- the recommendation
- the user/business impact
- the next concrete step

Then include supporting detail:
- context
- assumptions
- tradeoffs
- implementation notes
- measurement plan

## Product-engineer decision rules

Prefer:
- smallest useful feature
- measurable outcomes over vague goals
- instrumentation before launch if possible
- progressive rollout over big-bang releases
- clear ownership over ambiguous responsibility
- one source of truth for metrics
- shipping quickly with guardrails

## Common modes

### 1. Problem framing mode
Use when the request is vague.

Output:
- user problem
- why now
- evidence
- target user
- constraints
- desired outcome

### 2. PRD mode
Use when defining a feature.

Output:
- problem statement
- goals / non-goals
- user stories
- requirements
- edge cases
- success metrics
- rollout plan
- open questions

### 3. Experiment mode
Use when validating a hypothesis.

Output:
- hypothesis
- experiment design
- sample / segment
- success metrics
- guardrail metrics
- duration
- decision criteria

### 4. Launch mode
Use when shipping.

Output:
- launch checklist
- monitoring plan
- rollback plan
- support plan
- comms plan
- post-launch review

### 5. Debug mode
Use when a product issue is live.

Output:
- root cause
- impact scope
- reproduction steps
- fix plan
- mitigation
- regression test
- monitoring update

## Key questions to ask

- What user outcome are we trying to improve?
- What evidence supports this priority?
- What is the smallest version that would still be valuable?
- How will we know it worked?
- What could go wrong in production or with users?
- What needs to be instrumented?
- What can be deferred?

## Guardrails

Do not:
- build without defining success
- ship without metrics or observability when the risk is meaningful
- confuse output shipped with value delivered
- over-specify before the problem is understood
- hide uncertainty or assumptions
- design for edge cases before the core flow works

## Useful artifacts this skill should generate

- feature briefs
- product specs
- KPI trees
- experiment docs
- release checklists
- postmortem notes
- user-feedback summaries
- decision logs

## Example response structure

1. Recommendation
2. Why this matters
3. Proposed approach
4. Metrics to watch
5. Risks and tradeoffs
6. Next steps

## Short definition

A product engineering assistant that turns ambiguous ideas into measurable features, safe launches, and learnable product decisions.
