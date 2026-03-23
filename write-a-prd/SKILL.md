---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then save as a local markdown document. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions. The user may also provide links to external resources — Linear issues, Figma designs, or Notion documents.

2. Gather external context. If the user provided references to external tools, use the available MCP tools to pull in rich context before continuing:

   - **Linear**: The user may provide a ticket code (e.g., `EO-1234`) or a URL. Use the Linear MCP tools to fetch issue details, comments, and status to understand requirements, acceptance criteria, and prior discussion.
   - **Figma**: The user may provide a Figma URL. Fetch design context and screenshots to understand the intended UI, component structure, and design constraints.
   - **Notion**: The user may provide a page title or a URL. Search Notion by title if no URL is given. Fetch the document to pull in specs, meeting notes, or background research.

   Use this external context alongside the user's description to form a more complete picture of the problem space. If no external references are provided, skip this step.

3. Explore the repo to verify their assertions and understand the current state of the codebase.

4. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. Refer back to any external context gathered in step 2 to avoid re-asking questions that are already answered in Linear issues, Figma designs, or Notion docs.

5. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

6. Once you have a complete understanding of the problem and solution, use the template below to write the PRD.

Ask the user where they'd like to save it. Common destinations include a local file path, a GitHub wiki page, a Notion or Confluence page, or Apple Notes. Save or deliver it appropriately for the chosen destination.

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
