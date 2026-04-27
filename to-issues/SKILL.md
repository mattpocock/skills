---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable GitHub issues using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues. Supports --no-sub-issues flag to skip native sub-issue linking.
---

# To Issues

Break a plan into independently-grabbable GitHub issues using vertical slices (tracer bullets).

## Process

### 0. Check for --no-sub-issues flag

If the `NO_SUBISSUES` environment variable is set, skip **Section 6** entirely. Issues will still be created and numbered normally, but no sub-issue native linking will be performed.

**When to use:** Set `NO_SUBISSUES=1` when sub-issue tracking is not needed or not supported by the repository.

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a GitHub issue number or URL as an argument, fetch it with `gh issue view <number>` (with comments).

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

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
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Create the GitHub issues

For each approved slice, create a GitHub issue using `gh issue create`. Use the issue body template below.

Create issues in dependency order (blockers first) so you can reference real issue numbers in the "Blocked by" field.

<issue-template>
## Parent

#<parent-issue-number> (if the source was a GitHub issue, otherwise omit this section)

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #<issue-number> (if any)

Or "None - can start immediately" if no blockers.

</issue-template>

Do NOT close or modify any parent issue.

### 6. Attach child issues as native sub-issues

After creating each child issue, attach it to the parent using the GitHub Sub-issues API.

**First, get existing sub-issues for the parent to avoid duplicates:**
```bash
EXISTING_SUBISSUES=$(gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues --jq '.[].id' 2>/dev/null || echo "")
```

**For each child issue created:**

1. **Get the child issue ID:**
   ```bash
   CHILD_ID=$(gh api repos/{owner}/{repo}/issues/{child_number} -q .id)
   ```

2. **Check if already attached:**
   ```bash
   if echo "$EXISTING_SUBISSUES" | grep -q "^${CHILD_ID}$"; then
     echo "Sub-issue #{child_number}: skipped (already attached)"
     SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
   else
   ```

3. **Attach to parent via sub-issues API:**
   ```bash
     if ! gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues -f sub_issue_id=${CHILD_ID} 2>&1; then
       EXIT_CODE=$?
       # 404 = Sub-issues not supported for this repository (silent fallback)
       if [ $EXIT_CODE -eq 404 ]; then
         echo "Skipping sub-issue attachment: Sub-issues not supported for this repository"
       else
         # Other errors - track failure but continue
         FAILED_SUBISSUES+=("#{child_number}")
       fi
     else
       echo "Sub-issue #{child_number}: attached"
       ATTACHED_COUNT=$((ATTACHED_COUNT + 1))
       # Add to existing list to handle multiple children
       EXISTING_SUBISSUES="${EXISTING_SUBISSUES}\n${CHILD_ID}"
     fi
   fi
   ```

**Initialize counters before the loop:**
```bash
ATTACHED_COUNT=0
SKIPPED_COUNT=0
FAILED_SUBISSUES=()
```

**Error handling:**
- **Exit code 0:** Success - child issue attached to parent
- **Exit code 404:** Silent fallback - Sub-issues not supported for this repository, continue gracefully
- **Other exit codes:** Log warning, track failed attachment in `FAILED_SUBISSUES` array, continue with remaining issues

**Post-attach warning:** After all attachments attempted, if `FAILED_SUBISSUES` is non-empty, display a warning listing all child issue numbers that failed to attach.

**Summary:** After all attachments attempted, display:
```
Sub-issue summary: {ATTACHED_COUNT} newly attached, {SKIPPED_COUNT} skipped (already attached)
```

**Verification:** After attaching, the child issue will appear under the parent's "Sub-issues" section in the GitHub UI.
