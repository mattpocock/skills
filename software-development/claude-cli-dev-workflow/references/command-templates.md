# Claude CLI command templates

Copy/paste templates for common development workflows.

## 1) Implement a feature

```bash
claude -p "Goal: implement <feature>. Context: <relevant files/architecture>. Constraints: keep changes minimal, preserve public API, follow existing patterns. Acceptance: <tests/behavior>. Do: inspect relevant files, implement the change, add tests, and verify. Do not: refactor unrelated code." \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 10
```

## 2) Fix a bug

```bash
claude -p "Follow systematic debugging. Investigate why <failing test/command> fails. First identify the root cause from the error and code, then make the smallest fix, add a regression test, and verify it passes." \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 12
```

## 3) Review a diff

```bash
git diff main...HEAD | claude -p "Review this diff for bugs, security issues, edge cases, and missing tests. Prioritize by severity and be specific." \
  --allowedTools "Read" \
  --max-turns 6
```

## 4) Refactor safely

```bash
claude -p "Refactor <module> to improve readability and maintainability. Constraints: no behavior changes, no API changes, add or update tests if needed. Acceptance: existing tests pass and the code is simpler." \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 10
```

## 5) Add tests for a change

```bash
claude -p "Add tests for <feature/bug>. Context: <test file path and relevant behavior>. Constraints: prefer the existing test style, keep tests focused. Acceptance: new tests cover the edge cases and pass." \
  --allowedTools "Read,Edit,Bash" \
  --max-turns 8
```

## 6) Explore a codebase

```bash
claude -p "Inspect the codebase and explain where <feature/behavior> is implemented, which files are most relevant, and what would need to change to modify it." \
  --allowedTools "Read,Bash" \
  --max-turns 6
```

## 7) Worktree mode for larger changes

```bash
claude -w feature-name --tmux
```

Use this when:
- you want isolation from the main checkout
- the change is large
- you may want to parallelize work later

## 8) Follow-up prompt pattern

If Claude returns something incomplete, follow up with a narrow correction:

```text
Tighten the implementation and keep only the minimal necessary changes.
Add a regression test for the specific edge case you found.
Do not touch unrelated modules.
```

## Verification after Claude finishes

Always do these yourself:

```bash
git diff --stat
git status
pytest -q   # or the project-specific test command
```

