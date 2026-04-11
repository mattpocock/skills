---
name: claude-cli-dev-workflow
description: Use Claude Code CLI as an external coding agent for feature work, refactors, debugging, and code review. Prefer for one-shot implementation tasks and guided iterative development.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [Claude, CLI, Coding-Agent, Dev, Debugging, Refactor, Review]
    related_skills: [claude-code, systematic-debugging, test-driven-development, subagent-driven-development]
---

# Claude CLI Dev Workflow

Use this skill when you want to leverage the Claude Code CLI as a development assistant for writing, changing, or reviewing code from the terminal.

## When to use

Use Claude CLI for:
- feature implementation
- refactors
- debugging and root-cause analysis
- code review and cleanup
- test writing and test-driven changes
- repo exploration and documentation updates

Prefer this workflow when the task is:
- well-scoped
- mostly file/code based
- easier to express as an instruction plus constraints

## Default strategy

1. Work from the project root.
2. Give Claude a narrow, explicit goal.
3. Limit tools and turns.
4. Verify the diff and run tests yourself.
5. Iterate with a new prompt if needed.

## Recommended modes

### 1) One-shot print mode
Use for most development tasks.

```bash
claude -p "Implement X in src/...; preserve Y; add tests; keep changes minimal" \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 10
```

Good for:
- single-file or small multi-file changes
- bug fixes
- test additions
- code review of a diff
- summarizing repo state

### 2) Interactive mode
Use when the task is exploratory or needs back-and-forth.

```bash
claude
```

Good for:
- unclear requirements
- large refactors
- interactive debugging
- reviewing Claude’s reasoning between steps

### 3) Worktree mode
Use for larger tasks or parallel work that should not disturb the main checkout.

```bash
claude -w feature-name --tmux
```

Good for:
- isolated feature branches
- parallel experimentation
- long-running development sessions

## Prompt template

Use this structure for best results:

```text
Goal: <what to build or fix>
Context: <relevant architecture, files, commands, constraints>
Constraints: <minimal change, style, compatibility, no API changes, etc.>
Acceptance: <tests that should pass, expected behavior>
Do: <specific implementation instructions>
Do not: <things to avoid>
```

Example:

```bash
claude -p "Goal: fix the login bug in src/auth.py. Context: failing test is tests/test_auth.py::test_login_rejects_bad_password. Constraints: minimal change, keep existing public API. Acceptance: test passes and full suite is green. Do: inspect the failure, identify root cause, patch it, add regression test. Do not: refactor unrelated auth code." \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 12
```

## Debugging workflow

When debugging, include:
- exact error message
- failing command
- relevant stack trace
- repro steps
- any recent changes

Ask Claude to:
1. explain the root cause
2. make the smallest fix
3. add or update a regression test
4. run the targeted test
5. run the broader test set if appropriate

Example:

```bash
claude -p "Follow systematic debugging. Investigate why pytest tests/unit/test_cache.py::test_ttl fails. First identify root cause from the error and code, then make the smallest fix, add a regression test, and verify it passes." \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 12
```

## Code review workflow

Use Claude to review your current diff or a commit range.

```bash
git diff main...HEAD | claude -p "Review this diff for bugs, edge cases, security issues, and missing tests. Be specific and prioritize by severity." \
  --allowedTools "Read" \
  --max-turns 6
```

If you want a targeted review, mention the risk areas:
- auth
- concurrency
- migrations
- data loss
- performance
- backward compatibility

## Good constraints to include

- keep changes minimal
- preserve existing public APIs
- do not change unrelated files
- add regression tests
- maintain backwards compatibility
- use existing project patterns
- avoid new dependencies unless necessary

## Verification checklist

After Claude finishes:
- inspect `git diff`
- run the relevant tests
- check `git status`
- sanity-check the changed behavior manually if needed
- re-run Claude with a follow-up prompt if the result needs refinement

## Common pitfalls

- Don’t give vague prompts like “fix this project”.
- Don’t allow broad tool access unless needed.
- Don’t skip verification just because Claude sounded confident.
- Don’t use interactive mode when print mode is sufficient.
- Don’t ask Claude to do too many unrelated changes in one run.
- Don’t forget project-specific context files like `CLAUDE.md`.

## Useful follow-up prompts

- “Tighten this implementation and reduce scope.”
- “Add tests for the edge cases you identified.”
- “Explain the root cause in one paragraph.”
- “Review the diff again with a security focus.”
- “Make this match the project’s existing style.”

## Rule of thumb

If you can state the task, constraints, and acceptance criteria in a few sentences, Claude CLI is a strong fit.
If the task is highly ambiguous, use interactive mode or do more discovery first.
