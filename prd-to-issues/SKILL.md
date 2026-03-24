---
name: prd-to-issues
description: Break a PRD into independently-grabbable Azure DevOps User Stories using tracer-bullet vertical slices. Use when user wants to convert a PRD to work items, create implementation tickets, or break down a PRD into User Stories.
---

# PRD to Issues

Break a PRD into independently-grabbable Azure DevOps User Stories using vertical slices (tracer bullets).

## Process

### 0. Preflight

Run `az account show` to verify the user is authenticated with the Azure CLI. If it fails, instruct them to run `az login` followed by `az extension add --name azure-devops`.

Infer the ADO org and project from the git remote by running `git remote get-url origin`:
- If the URL is `https://dev.azure.com/{org}/{project}/_git/{repo}`, extract `{org}` and `{project}`.
- If the URL is `https://{org}.visualstudio.com/{project}/_git/{repo}`, extract accordingly.
- If inference fails, ask: *"What is your ADO org URL (e.g. `https://dev.azure.com/myorg`) and project name?"*

Ask once upfront: *"What area path and iteration path should I use for the work items? (e.g. `MyProject\Team`, `MyProject\Sprint 5`)"*. Use these for all work items created this session.

### 1. Locate the PRD

Ask the user for the PRD work item ID (numeric) or full URL (e.g. `https://dev.azure.com/org/project/_workitems/edit/1234`). Extract the numeric ID from whichever form they provide.

If the PRD is not already in your context window, fetch it with `az boards work-item show --id <id> --org https://dev.azure.com/<org>`.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

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
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Create the Azure DevOps User Stories

For each approved slice, create an ADO User Story using `az boards work-item create`. Use the work item body template below.

Create items in dependency order (blockers first) so you can reference real work item IDs in the "Blocked by" field.

For each slice run: `az boards work-item create --title "<title>" --type "User Story" --description "<body>" --area "<area-path>" --iteration "<iteration-path>" --fields "System.Tags=<HITL or AFK>" --org https://dev.azure.com/<org> --project "<project>" --query id --output tsv`

Capture the returned numeric ID, then link the User Story to the parent PRD: `az boards work-item relation add --id <user-story-id> --relation-type "System.LinkTypes.Hierarchy-Reverse" --target-id <prd-item-id> --org https://dev.azure.com/<org>`

For items with dependencies, add a blocking link from the blocked item to its blocker: `az boards work-item relation add --id <blocked-item-id> --relation-type "System.LinkTypes.Dependency-Reverse" --target-id <blocker-item-id> --org https://dev.azure.com/<org>`

<work-item-template>
## Parent PRD

Work item #<prd-item-id>

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Reference specific sections of the parent PRD rather than duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #<work-item-id> (if any)

Or "None - can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 7

</work-item-template>

Do NOT modify the parent PRD work item.
