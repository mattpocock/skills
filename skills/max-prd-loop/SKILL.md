---
name: max-prd-loop
description: "Autonomous PRD-driven development loop. Generate a PRD, convert to prd.json, then iteratively implement each user story via delegate_task until all pass. Each acceptance criterion is checkpointed immediately to progress.txt — context compression mid-story is harmless."
category: software-development
---

# max-prd-loop — Autonomous PRD-Driven Development

Turn a feature idea into a fully-implemented feature by autonomously iterating through user stories using `delegate_task`.

## The Complete Workflow

```
Feature idea
    ↓ Phase 1: Generate PRD
    ↓ Phase 2: Convert to prd.json
    ↓ Phase 3: Loop (delegate_task per story)
         ├─ Story 1 → implement → passes: true
         ├─ Story 2 → implement → passes: true
         └─ ... → All done → Final report
```

## State Files

| File | Purpose |
|------|---------|
| `tasks/prd-[feature].md` | Generated PRD with user stories |
| `prd.json` | Structured story list (branch, priorities, acceptance criteria) |
| `progress.txt` | Append-only iteration log — learnings accumulate across stories |

---

## Phase 1: Generate PRD

**When to start:** User describes a feature they want to build and asks to implement it, or says "run the loop", "start the PRD loop", etc.

### Step 1a: Ask Clarifying Questions

Before writing anything, ask 3-5 clarifying questions:

- **Scope** — What is in scope vs out of scope?
- **Users** — Who are the end users?
- **Success criteria** — How do we know it's done?
- **Edge cases** — What should happen when things go wrong?
- **Dependencies** — External services, APIs, or libraries needed?
- **Tech stack** — Any constraints on language, framework, or architecture?

### Step 1b: Generate PRD

After receiving answers, write the PRD to `tasks/prd-[feature-name].md`:

```markdown
# PRD: [Feature Name]

## Overview
[One paragraph summary of the feature and why it matters]

## User Stories

### US-001: [Title]
**As a** [user type]  
**I want** [feature]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] Typecheck passes
- [ ] Tests pass

**Priority:** 1

---

### US-002: ...
```

**Tips:**
- Keep acceptance criteria **verifiable** — not "works well" but "clicking X shows Y"
- Each story should be implementable in 1-4 hours
- If a story is too large, split it
- Priority: 1 = highest (do first)
- **Deduplication check (critical):** After writing all stories, scan each AC across stories. If AC-X in US-B is already satisfied by AC-Y in US-A, either merge the stories or mark AC-X as already covered. Redundant ACs waste subagent turns and blur story boundaries. Run this check before confirming prd.json with the user.
- **Max 4 criteria per story:** Stories with 3-4 criteria complete in 30-80 seconds per subagent. More than 4 criteria risks partial progress loss on context compression. Split long stories early.

---

## Phase 2: Convert to prd.json

### Step 2: Parse and Write prd.json

Read the PRD from `tasks/prd-[feature].md` and write `prd.json`:

```json
{
  "project": "[Project Name]",
  "branchName": "max/[feature-name]",
  "description": "[One-line description]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Title]",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Typecheck passes", "Tests pass"],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

Branch name convention: `max/[feature-name]` (kebab-case).

Show the user the resulting `prd.json` and ask for confirmation before starting the loop.

---

## Phase 3: Autonomous Loop

### Step 3a: Read prd.json

Find the story with the **lowest `priority`** number where `passes: false`.

If **all stories have `passes: true`**, skip to Step 3g (Final Report).

### Step 3b: Spawn Child Agent

Call `delegate_task` with:

- **goal**: Implement story `[ID]: [title]` from `prd.json`
- **context**: 
  - Story description and all acceptanceCriteria (list every criterion explicitly)
  - Project description from `prd.json`
  - Branch name from `prd.json`
  - Reference `progress.txt` for any WIP or learnings from prior attempts

**Child agent instructions:**

> ⚠️ **CRITICAL — progress files are LOCAL ONLY, never in the repo:**
> - Do NOT create `PROGRESS_LOG.md`, `progress.txt`, `NOTES.md`, or any progress file inside the repo working directory
> - All progress/log files belong on the HOST at `/root/.hermes/tasks/progress-[feature].txt`
> - This rule is absolute — no exceptions, regardless of what the repo's `.gitignore` says

1. Checkout or create branch `max/[feature-name]`
2. If `progress.txt` has a WIP entry for this story, read it first — resume from where it left off
3. Work through the acceptance criteria **one by one**
4. **After completing each criterion**, immediately append a checkpoint to `progress.txt`:
   ```
   ## [Story ID] - Criterion [N/M] Complete
   - Completed: [what this criterion required]
   - Next: [the next criterion's goal]
   - Files: [files modified]
   ```
5. Run quality checks (typecheck, lint, tests) after each criterion
6. After **all criteria pass**, commit: `feat: [ID] - [title]`
7. **Immediately after committing, write the COMPLETE record to the LOCAL progress log:**
   > LOCAL progress log path: `/root/.hermes/tasks/progress-[feature].txt`
   > (This is on the HOST filesystem, NOT inside the repo working directory.)
   > If the log already exists, append to it. DO NOT create progress files in the repo.
   ```
   ## [Date/Time] - [Story ID] — COMPLETE
   - All acceptance criteria met
   - Files changed: [list]
   - Commit: [SHA]
   - **Learnings:**
     - [Pattern or gotcha discovered, if any]
   ---
   ```
   The COMPLETE record is written by the CHILD agent, not the main agent. Omit this step and the main agent will have to write it — do NOT skip.

**Checkpoint rule — the most important part:**

> Do NOT wait until the entire story is done to write progress. Write after **every single criterion**, no matter how small. Each criterion checkpoint is the atomic unit of progress.

**When to return to the main agent — three triggers:**

```
Trigger 1 — Story complete:
  All criteria done + committed
  → Return: { status: "complete", criterion_progress: "M/M", commit_sha: "..." }

Trigger 2 — Context compression detected:
  You notice you have "forgotten" something from earlier in this session
  (e.g., you can no longer recall the original acceptance criteria, a decision
  made earlier, or what files were just modified)
  → Return: { status: "WIP", criterion_progress: "N/M", last_checkpoint: "Criterion N/M Complete" }

Trigger 3 — Unrecoverable error:
  An error prevents continuing (compile failure, dependency missing, etc.)
  → Return: { status: "failed", criterion_progress: "N/M", error: "..." }
```

**What to return — structured stop report:**

```
{
  "status": "complete" | "WIP" | "failed",
  "story_id": "US-001",
  "criterion_progress": "3/5",
  "commit_sha": "abc123..." | null,
  "learnings": ["pattern discovered", "gotcha encountered"],
  "next_action": "new_agent_continue_same_story" | "move_to_next_story"
}
```

### Step 3c: Update State — Decision Table

The main agent decides what to do based on the child's `status`:

```
status: "complete"
  → prd.json: set passes: true for this story_id
  → progress.txt: COMPLETE record already written by child agent (step 7) — no action needed
  → Loop back to Step 3a to pick next story

status: "WIP"
  → prd.json: keep passes: false (not done yet)
  → progress.txt: already has the last checkpoint — no extra action needed
  → Immediately spawn a new child agent for the SAME story
    (new agent will read progress.txt, find last checkpoint, resume from next criterion)

status: "failed"
  → prd.json: set notes: "FAILED: [error summary]"
  → progress.txt: append failure record
  → Continue to next story
```

**Final progress.txt record (for "complete" status):**
```
## [Date/Time] - [Story ID] — COMPLETE
- All acceptance criteria met
- Files changed: [list]
- Commit: [SHA]
- **Learnings:**
  - [Pattern or gotcha discovered]
---
```

### Step 3d: Loop

Go back to Step 3a. Continue until all stories have `passes: true`.

### Step 3e: Final Squash (before PR)

After all stories complete, **squash all commits into one** before creating the PR:

```bash
git reset --soft origin/[branch-name]
git add [only the actual feature files — NO progress logs, NO PROGRESS_LOG.md]
git commit -m "[conventional commit] - [one-line summary of all stories]"
git push --force
```

> Progress files created by child agents (`PROGRESS_LOG.md`, etc.) must be excluded
> from the squash commit. Only commit the feature implementation files.

### Step 3f: Create PR

After squash-push, create the PR via `gh pr create`.

### Step 3g: Final Report

When loop completes (all stories have `passes: true` or `notes: "FAILED:..."`), output:
- Total stories completed vs failed
- Commit SHAs for each story
- Key learnings from `progress.txt`

### Context Compression — How It Works

The child agent's context IS compressed at ~50% by the platform automatically. The key insight:

- The child agent **detects compression by self-checking**: "Do I still remember everything from the start of this session?"
- If the answer is NO → the agent was compressed → returns `status: "WIP"` immediately
- Progress is NEVER lost because every criterion was already written to `progress.txt` before the checkpoint
- The new child agent picks up from the last checkpoint, not from scratch

### Error Handling

- `status: "failed"` → mark story in `prd.json` with `notes: "FAILED: [error]"`, log to `progress.txt`, continue to next story
- The loop does NOT stop on failure — it logs and proceeds

---

## prd.json Example

```json
{
  "project": "Blog Like Button",
  "branchName": "max/like-button",
  "description": "Add a like button to blog posts with counter",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add like count to database",
      "description": "As a developer, I need to store like counts so posts can track popularity",
      "acceptanceCriteria": [
        "Add likes column to posts table",
        "Generate and run migration",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Implement like button UI",
      "description": "As a reader, I want to click a like button so I can show appreciation",
      "acceptanceCriteria": [
        "Like button appears on each post",
        "Clicking increments the counter",
        "Typecheck passes",
        "Unit tests pass"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    }
  ]
}
```

## Key Loop Principles

**1. Clean context per story.**
Each iteration gets a **fresh subagent** with clean context. State is passed through files (`prd.json`, `progress.txt`). The main agent orchestrates — it never gets polluted by implementation details.

**2. Progress is written immediately, not at the end.**
Each acceptance criterion is checkpointed to `progress.txt` the moment it completes — not when the whole story is done. This means context compression is harmless: at most one criterion is lost and re-done, never the entire story.

**3. Resumption is always from the last checkpoint.**
When a new subagent picks up a story (after compression or failure), it reads `progress.txt`, finds the last `Criterion N/M Complete` entry, and resumes from the next one. No guessing, no duplication.
