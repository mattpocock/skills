---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable GitHub issues using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues. Supports --no-sub-issues flag to skip native sub-issue linking.
---

# To Issues

Break a plan into independently-grabbable GitHub issues using vertical slices (tracer bullets).

## Process

### 0. Check for --no-sub-issues flag

If the `NO_SUBISSUES` environment variable is set (e.g., `--no-sub-issues` was passed), skip Section 6 entirely. The issues will still be created as standalone issues without native sub-issue linking.

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

After creating each child issue, attach it to its parent issue using GitHub's native sub-issues API.

**For each child issue created:**

1. **Get the child issue ID:**
   ```bash
   gh api repos/{owner}/{repo}/issues/{child_number} -q .id
   ```

2. **Check if already attached:**
   ```bash
   gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues --jq '.[].id'
   ```
   This returns a list of existing sub-issue IDs for the parent.

3. **Attach to parent (only if not already present):**
   - If the child_id is already in the list of existing sub-issues, skip the POST and mark as "skipped"
   - If not in the list, proceed with the attachment call:
     ```bash
     gh api repos/{owner}/{repo}/issues/{parent_number}/sub_issues -f sub_issue_id={child_id}
     ```

   Use `-f` flag for form data (not `-d`).

4. **Handle 404 gracefully:**
   - If the sub-issues API returns 404, the repository does not support sub-issues
   - Fall back silently — the issues were created successfully as standalone issues
   - Do not report this as an error to the user

**Example workflow:**
```bash
# Create child issue
gh issue create --title "Slice 1: Implement auth" --body "..."

# Get child ID (e.g., returns 123456789)
CHILD_ID=$(gh api repos/OWNER/REPO/issues/5 -q .id)

# Track attachment results
NEWLY_ATTACHED=()
SKIPPED_ALREADY_ATTACHED=()
FAILED_SUBISSUES=()

# Check existing sub-issues for parent issue #3
EXISTING=$(gh api repos/OWNER/REPO/issues/3/sub_issues --jq '.[].id')

# Check if already attached (idempotent — skip if duplicate)
if echo "$EXISTING" | grep -q "^${CHILD_ID}$"; then
  SKIPPED_ALREADY_ATTACHED+=("Slice 1: Implement auth (parent #3)")
else
  # Attach to parent with proper error handling
  if ! gh api repos/OWNER/REPO/issues/3/sub_issues -f sub_issue_id=$CHILD_ID; then
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 404 ]; then
      # Sub-issues not supported for this repository - silent fallback
      :
    else
      # Other error - warn but continue
      FAILED_SUBISSUES+=("Slice 1: Implement auth (parent #3)")
    fi
  else
    NEWLY_ATTACHED+=("Slice 1: Implement auth (parent #3)")
  fi
fi
```

**Error handling behavior:**
- **Already attached**: Skip silently, add to `SKIPPED_ALREADY_ATTACHED` list
- **Exit code 0**: Success — issue attached, add to `NEWLY_ATTACHED` list
- **Exit code 404**: Sub-issues not supported for this repository — silent fallback, continue
- **Any other exit code**: Non-fatal error — add to `FAILED_SUBISSUES` list, continue with remaining issues

After processing all sub-issues, display a summary:
```
Sub-issue attachment summary: N newly attached, N skipped (already attached)
```

If `FAILED_SUBISSUES` is non-empty, also display a warning:
```
⚠️  Sub-issue attachment failures (N):
  - <issue-title-1> (parent #<num>)
  - <issue-title-2> (parent #<num>)
```
The skill exit code remains 0 even if some attachments failed.
