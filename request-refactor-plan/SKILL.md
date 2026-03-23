---
name: request-refactor-plan
description: Create a detailed refactor plan with tiny commits via user interview, then save it as a local markdown RFC document. Use when user wants to plan a refactor, create a refactoring RFC, or break a refactor into safe incremental steps.
---

This skill will be invoked when the user wants to create a refactor request. You should go through the steps below. You may skip steps if you don't consider them necessary.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions. The user may also provide links to Linear issues, Figma designs, or Notion documents.

2. Gather external context. If the user provided references to external tools, use the available MCP tools to pull in context:

   - **Linear**: The user may provide a ticket code (e.g., `EO-1234`) or a URL. Fetch issue details, comments, and project context to understand the motivation, constraints, and prior discussion around the refactor.
   - **Figma**: The user may provide a Figma URL. Fetch design context if the refactor involves UI changes, to understand the target design.
   - **Notion**: The user may provide a page title or a URL. Search Notion by title if no URL is given. Fetch documents for architectural decision records, tech debt inventories, or related specs.

   Use this context to inform your understanding of the refactor scope. If no external references are provided, skip this step.

3. Explore the repo to verify their assertions and understand the current state of the codebase.

4. Ask whether they have considered other options, and present other options to them.

5. Interview the user about the implementation. Be extremely detailed and thorough. Refer back to any external context gathered in step 2 to avoid re-asking questions already answered in external sources.

6. Hammer out the exact scope of the implementation. Work out what you plan to change and what you plan not to change.

7. Look in the codebase to check for test coverage of this area of the codebase. If there is insufficient test coverage, ask the user what their plans for testing are.

8. Break the implementation into a plan of tiny commits. Remember Martin Fowler's advice to "make each refactoring step as small as possible, so that you can always see the program working."

9. Ask the user where they'd like to save this RFC — for example a local file path, a GitHub wiki page, a Notion or Confluence doc. Use the following template, then save or deliver it appropriately for the chosen destination.

<refactor-plan-template>

## Problem Statement

The problem that the developer is facing, from the developer's perspective.

## Solution

The solution to the problem, from the developer's perspective.

## Commits

A LONG, detailed implementation plan. Write the plan in plain English, breaking down the implementation into the tiniest commits possible. Each commit should leave the codebase in a working state.

## Decision Document

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

A description of the things that are out of scope for this refactor.

## Further Notes (optional)

Any further notes about the refactor.

</refactor-plan-template>
