---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then submit as an Azure DevOps Feature work item. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore the repo to verify their assertions and understand the current state of the codebase.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

4. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

5. Once you have a complete understanding of the problem and solution, use the template below to write the PRD.

Before creating the work item, run `az account show` to verify Azure CLI authentication. If it fails, instruct the user to run `az login` followed by `az extension add --name azure-devops`.

Infer the ADO org and project from `git remote get-url origin`:
- `https://dev.azure.com/{org}/{project}/_git/{repo}` → extract `{org}` and `{project}`.
- `https://{org}.visualstudio.com/{project}/_git/{repo}` → extract accordingly.
- If inference fails, ask: *"What is your ADO org URL and project name?"*

Ask once: *"What area path and iteration path should I use? (e.g. `MyProject\Team`, `MyProject\Sprint 5`)"*

Submit the PRD as an Azure DevOps **Feature** work item: `az boards work-item create --title "<prd title>" --type Feature --description "<prd body>" --area "<area-path>" --iteration "<iteration-path>" --org https://dev.azure.com/<org> --project "<project>" --query id --output tsv`

Capture the returned ID and share the work item URL with the user: `https://dev.azure.com/<org>/<project>/_workitems/edit/<id>`

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
