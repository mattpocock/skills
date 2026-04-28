---
name: to-prd
description: Turn the current conversation context into a PRD. Backend-agnostic — pairs with `/github` (or another backlog skill) to publish. Use when user wants to create a PRD from the current context.
---

This skill takes the current conversation context and codebase understanding and produces a PRD artifact. Do NOT interview the user — just synthesize what you already know. Hand off to a backend skill (`/github` by default) to publish.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Before exploring, follow [../grill-with-docs/DOMAIN-AWARENESS.md](../grill-with-docs/DOMAIN-AWARENESS.md). Use the project's `CONTEXT.md` vocabulary throughout the PRD.

2. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

3. Write the PRD artifact using the template below. Default state is `ready-for-agent` (state vocabulary lives in `/triage`); category is `enhancement`. Present the artifact to the user, then end with a handoff hint:

   > PRD ready. Invoke `/github` (or your configured backend equivalent) to publish — it will create the issue with category `enhancement` and state `ready-for-agent`.

   Do not call `gh` directly. The backend skill owns publishing.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
