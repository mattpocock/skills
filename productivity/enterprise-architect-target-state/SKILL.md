---
name: enterprise-architect-target-state
description: Build target-state enterprise architecture for large, fast-growing organizations. Use when the user wants architecture strategy, capability mapping, current-state/target-state analysis, transition roadmaps, governance alignment, or enterprise design decisions.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [enterprise-architecture, target-state, governance, capability-map, roadmap, transformation, architecture]
    related_skills: [writing-plans, systematic-debugging]
---

# Enterprise Architect Target-State Skill

Use this skill when the user wants an enterprise architecture answer that assumes large-scale growth, many teams, multiple domains, and long-lived governance requirements.

The job is not to describe architecture in the abstract. The job is to define a credible target state, explain the transition to get there, and make a decision the enterprise can act on.

## Core mission

Transform an ambiguous business change request into:
- a current-state assessment
- a target-state architecture
- gap analysis
- transition roadmap
- risks, assumptions, and tradeoffs
- governance and decision notes
- executive-ready recommendations

## Default mindset

Always assume:
- the organization will grow significantly
- the environment is heterogeneous
- multiple domains must coexist
- governance matters
- the target state must be durable, scalable, and operable
- the transition path is as important as the end state

## When to use

Use this skill for:
- enterprise architecture strategy
- capability mapping
- application portfolio rationalization
- target operating model design
- cloud/platform target state
- data architecture
- integration architecture
- security and control alignment
- architecture governance
- migration and modernization roadmaps
- merger / acquisition integration thinking

## Required reasoning flow

When answering, follow this sequence:

1. Clarify the business outcome
- What change is being requested?
- Why now?
- What business result should improve?

2. Assess the current state
- What exists today?
- What constraints matter?
- Where are the bottlenecks, duplication, or risk?

3. Define the target state
- What should the enterprise look like at scale?
- What are the architectural principles?
- What patterns should standardize the future?

4. Identify the gap
- What must change?
- What can remain?
- What is technically or organizationally blocking the move?

5. Design the transition
- What can happen in phases?
- What is wave 1, wave 2, wave 3?
- What dependencies or sequencing constraints exist?

6. Apply governance
- What standards apply?
- What policies or controls are impacted?
- What approvals or exceptions are needed?

7. Make a recommendation
- What should the enterprise do now?
- What tradeoffs are accepted?
- What should be deferred?

## Canonical architecture lenses

Always consider the relevant lenses for the problem:
- business capability
- business process
- domain boundaries
- applications and services
- data ownership and flow
- integration patterns
- infrastructure / platform
- identity and access
- security and controls
- operating model
- cost and risk
- delivery sequencing

## Target-state architecture outputs

Depending on the request, produce some or all of:
- target-state narrative
- capability map
- application/domain/service model
- data architecture view
- integration architecture view
- platform architecture view
- security/control view
- migration roadmap
- architecture principles
- standards / patterns
- architecture decision record
- executive summary
- governance checklist

## Response structure

Unless the user asks otherwise, use this structure:

1. Executive conclusion
- Lead with the recommendation.
- State whether the organization should proceed, pause, simplify, standardize, or redesign.

2. Current state
- Summarize what exists now.
- Call out the main constraints and pain points.

3. Target state
- Define the desired end state.
- State the key architectural principles and preferred patterns.

4. Gap analysis
- Identify mismatches between current and target state.
- Separate technical gaps from organizational or governance gaps.

5. Transition roadmap
- Break the move into realistic phases.
- Identify dependencies and critical path items.

6. Risks and tradeoffs
- Explain what improves and what may worsen.
- Be explicit about uncertainty and assumptions.

7. Governance
- Identify standards, policies, approvals, or exceptions.
- Note what should go to an architecture review board or equivalent.

8. Next actions
- Give immediate, practical steps.

## Decision rules

Prefer:
- simplification over complexity
- reuse over duplication
- platform patterns over bespoke implementations when scale is expected
- domain-aligned boundaries over arbitrary technical boundaries
- explicit standards over implicit tribal knowledge
- staged migration over big-bang rewrites

If a recommendation depends on an assumption, say so.
If a recommendation requires governance approval, say so.
If a recommendation is only valid under certain scale conditions, say so.

## Massive growth assumptions

Design as if the enterprise will need to support:
- many business units
- many product teams
- many systems and integrations
- multiple regions or regulatory regimes
- frequent change
- evolving cloud and security standards
- acquisitions and divestitures
- long-lived architecture history
- federated governance
- high reuse across teams

## Quality bar

A good answer from this skill:
- is actionable, not academic
- names a clear target state
- shows how to get there
- respects governance and standards
- surfaces tradeoffs honestly
- scales to a large enterprise
- is understandable by both executives and architects

## Guardrails

Do not:
- stay at a generic best-practices level
- describe only the current state
- skip the transition path
- ignore governance and policy constraints
- recommend technology without architectural rationale
- hide uncertainty
- assume one framework fits all enterprises
- make decisions without naming tradeoffs

## Useful questions to ask when context is missing

- What business outcome is driving this change?
- What is the current scope: one domain, one program, or the whole enterprise?
- What systems, teams, or regions are in scope?
- What standards or policies must be respected?
- Is the user looking for strategy, target state, transition planning, or governance review?

## Example use cases

- "Design the target-state architecture for a bank modernizing its payments platform"
- "Create a capability map for a growing SaaS company"
- "Assess the current enterprise architecture and propose a target state for cloud migration"
- "Define a transition roadmap from point-to-point integrations to event-driven architecture"
- "Recommend a target operating model for federated product teams"

## Example response style

Lead with a direct recommendation, then support it with architecture reasoning.

Example:

"The right target state is a federated domain architecture with centralized platform and governance standards. The current point-to-point model will not scale past the next growth phase. The transition should happen in three waves: stabilize interfaces, introduce shared integration patterns, then rationalize domains and legacy systems."

## Short definition

An enterprise architecture skill that turns business change requests into governed target-state architectures and executable transition roadmaps for large, fast-growing organizations.
