# Plan: Configurable Cross-Repo Document Storage

> Source: conversation with user, 2026-03-23

## Context

Skills that produce persistent documents (PRDs, issues, test plans, RFCs, plans) currently
hardcode `~/Development/docs/` as the storage root, with no awareness of which project they
were invoked from. Two problems:

1. The docs repo is not configurable — users can't point it at their own GitHub repo.
2. All documents land in the same flat subdirectory regardless of which repo they relate to,
   making it hard to navigate and causing name collisions across projects.

The target structure is:

```
<docs-root>/
└── <github-org>/
    └── <github-repo>/
        ├── prd/
        ├── issues/
        ├── test-plans/
        ├── rfc/
        └── plans/
```

Where `<docs-root>` is a local clone of a user-configured GitHub docs repo.

---

## Architectural decisions

- **Configuration**: Two env vars read by skills at runtime:
  - `DOCS_REPO` — GitHub repo slug (e.g. `evans-sam/docs`). Required.
  - `DOCS_PATH` — Local clone path. Defaults to `~/Development/docs` if unset.
- **Current repo detection**: Skills run `git remote get-url origin` in the working directory
  and parse the result to extract `<org>/<repo>`. If not inside a git repo, skills ask the user
  to confirm or manually specify the project path segment.
- **Shared helper block**: A common instruction block (`_lib/resolve-docs-path.md`) is written
  once and included by reference in every skill. Skills are not modified individually in bulk —
  the helper is the single source of truth for this logic.
- **`./plans/` migration**: `write-a-plan` and `prd-to-plan` currently write to `./plans/`
  (project-relative). These move to `<docs-root>/<org>/<repo>/plans/` for consistency and
  cross-device access. The project-local `./plans/` path is dropped.
- **git pull before read**: Skills that read existing docs (e.g. `prd-to-issues` reading a PRD)
  should pull the docs repo first to ensure they have the latest version.

---

## Phase 1: Write the shared helper

Create `_lib/resolve-docs-path.md`. This file contains a reusable instruction block that skills
include verbatim. It defines the full procedure for:

1. Reading `DOCS_REPO` from the environment. If unset, prompt the user once:
   "What is your GitHub docs repo? (e.g. `evans-sam/docs`)" and remind them to set `DOCS_REPO`
   in their Claude Code settings so they're not asked again.
2. Resolving `DOCS_PATH` (default: `~/Development/docs`).
3. Detecting the current GitHub repo by running `git remote get-url origin` and parsing the
   org/repo slug. Handle SSH (`git@github.com:org/repo.git`) and HTTPS
   (`https://github.com/org/repo.git`) formats. If the working directory is not a git repo or
   has no remote, ask the user: "Which project is this doc for? (e.g. `evans-sam/my-app`)"
4. Computing the full doc root: `<DOCS_PATH>/<org>/<repo>/`.
5. Running `git -C <DOCS_PATH> pull` before any read operation.
6. After writing, running:
   ```bash
   git -C <DOCS_PATH> add <relative-path> \
     && git -C <DOCS_PATH> commit -m "<message>" \
     && git -C <DOCS_PATH> push
   ```

### Acceptance criteria

- [ ] `_lib/resolve-docs-path.md` exists and is self-contained
- [ ] Handles both SSH and HTTPS remote URL formats
- [ ] Falls back gracefully when `DOCS_REPO` is unset (prompt + reminder)
- [ ] Falls back gracefully when not inside a git repo (prompt for project)
- [ ] Covers the full read-pull / write-commit-push lifecycle

---

## Phase 2: Update doc-writing skills to use the helper

Update each skill to replace its hardcoded path with a reference to the helper. The change in
each skill is the same pattern:

- Remove the hardcoded `~/Development/docs/<subdir>/` path reference.
- Add a step near the top: "Before saving, follow the steps in `_lib/resolve-docs-path.md` to
  resolve `<doc-root>`."
- Replace the hardcoded save path with `<doc-root>/<subdir>/<filename>.md`.
- Replace the hardcoded git commands with the generic commit/push block from the helper.

Skills to update:

| Skill | Subdir | git commit message pattern |
|-------|--------|---------------------------|
| `write-a-prd` | `prd/` | `docs(<org>/<repo>): add PRD <filename>` |
| `prd-to-issues` | `issues/` | `docs(<org>/<repo>): add issues for <prd>` |
| `triage-issue` | `issues/` | `docs(<org>/<repo>): triage <filename>` |
| `write-a-test-plan` | `test-plans/` | `docs(<org>/<repo>): add test plan <filename>` |
| `request-refactor-plan` | `rfc/` | `docs(<org>/<repo>): add RFC <filename>` |
| `improve-codebase-architecture` | `rfc/` | `docs(<org>/<repo>): add RFC <filename>` |
| `write-a-plan` | `plans/` | `docs(<org>/<repo>): add plan <filename>` |
| `prd-to-plan` | `plans/` | `docs(<org>/<repo>): add plan <filename>` |

### Acceptance criteria

- [ ] All 8 skills reference the helper instead of hardcoded paths
- [ ] No skill contains a literal `~/Development/docs` path
- [ ] `write-a-plan` and `prd-to-plan` no longer reference `./plans/`
- [ ] All git commit messages include `<org>/<repo>` for traceability

---

## Phase 3: Update skills that read existing docs

`prd-to-issues`, `prd-to-plan`, and `write-a-test-plan` read existing docs before writing new
ones. Update these to also use the helper for the read path (with a git pull step first) rather
than prompting the user for a raw file path.

The read step becomes: resolve `<doc-root>`, pull, then list available docs in the relevant
subdir so the user can pick one by name rather than typing a full path.

### Acceptance criteria

- [ ] `prd-to-issues` lists available PRDs from `<doc-root>/prd/` for the user to select
- [ ] `prd-to-plan` lists available PRDs from `<doc-root>/prd/` for the user to select
- [ ] `write-a-test-plan` lists docs from `prd/`, `issues/`, and `plans/` for the user to select
- [ ] All three pull before listing

---

## Phase 4: Update README and docs setup instructions

Update `README.md`:

- Replace the current setup block with instructions to set `DOCS_REPO` (and optionally
  `DOCS_PATH`) as environment variables in Claude Code settings (`~/.claude/settings.json`).
- Show the one-time clone command derived from `DOCS_REPO`.
- Show the directory structure that skills will create automatically.
- Remove the hardcoded `~/Development/docs` path from all prose.

### Acceptance criteria

- [ ] README shows how to set `DOCS_REPO` in `~/.claude/settings.json`
- [ ] README shows the resulting directory structure
- [ ] No mention of `~/Development/docs` as a hardcoded value — it's presented as the default
  for `DOCS_PATH`
