---
name: publish-local-skills-to-wiki
description: Copy newly created local Hermes skills into the shared skills wiki repo and update the wiki README index. Use when the user wants to publish skills from ~/.hermes/skills into a separate GitHub skills repository.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [skills, wiki, publish, sync, github, repo-management]
    related_skills: [write-a-skill, github-repo-management, github-pr-workflow]
---

# Publish Local Skills to Wiki

Use this skill when new Hermes skills were created locally and need to be mirrored into a shared skills wiki repository.

## Goal

Take skills created under the local Hermes skill store and publish them into the wiki repo in the matching category folders, then update the wiki README so the new skills are discoverable.

## When to use

Use this workflow when:
- the user created one or more new skills locally
- the user wants them added to the shared skills wiki repo
- the wiki repo mirrors the local skill directory structure
- the README acts as the index of available skills

## Default repo assumptions

Common layout:
- local source: `~/.hermes/skills/<category>/<skill-name>/`
- wiki repo: `/home/stathis/skills/`
- wiki index: `/home/stathis/skills/README.md`

If the repo lives elsewhere, adapt the paths accordingly.

## Workflow

### 1) Inspect the local skills

Confirm the skill directory exists and contains the expected files:
- `SKILL.md`
- `templates/`
- `references/`
- `scripts/`
- `assets/`

If the user asked for a batch sync, enumerate candidate skills first and skip anything that does not have a corresponding local `~/.hermes/skills/.../SKILL.md` source.

### 2) Choose a publish set

For large local skill stores, do not blindly copy everything. Prefer a high-value batch first:
- dev workflow skills
- GitHub/repo operations
- MCP / agent infrastructure
- productivity and knowledge tools
- any new skills the user explicitly created

This keeps the wiki useful and avoids cluttering it with niche or incomplete entries.

### 3) Mirror into the wiki repo

Copy the skill folder into the matching category in the wiki repo.

Examples:
- `~/.hermes/skills/software-development/my-skill/` → `/home/stathis/skills/software-development/my-skill/`
- `~/.hermes/skills/productivity/my-skill/` → `/home/stathis/skills/productivity/my-skill/`

Prefer a direct directory copy so the wiki keeps the same structure and linked files.

Use `cp -a` or `shutil.copytree(..., dirs_exist_ok=True)` so templates, references, scripts, and assets come across together.

### 4) Update the README index

Add the new skill to the correct section in the wiki README.

Useful sections that have worked well:
- Planning & Design
- Development
- GitHub & Repo Ops
- MCP & Agent Infrastructure
- Tooling & Setup
- Writing & Knowledge
- Architecture & Strategy
- Product Engineering
- Productivity & Knowledge

For each new skill, add:
- a short description
- a copy/paste install command

Example:

```md
- **my-skill** — Short description of what it does.

  ```
  npx skills@latest add mattpocock/skills/my-skill
  ```
```

### 5) Verify the result

Check:
- the skill folder exists in the wiki repo
- linked files were copied
- README includes the new entry under the right section
- `git status` shows the intended files only
- no source skill was missed because the local path differed from the expected category

### 6) Commit or prepare PR

If the user asked to publish it, commit or prepare the change according to the repo workflow.

## Suggested command pattern

```bash
cp -a ~/.hermes/skills/<category>/<skill-name> /home/stathis/skills/<category>/
```

Then edit `/home/stathis/skills/README.md` to index the new skill.

When using the wiki repo as a publication target, verify the repo root first and treat it as the canonical public index for the mirrored skills.

## Verification checklist

- [ ] Local skill exists and is complete
- [ ] Wiki copy preserves all linked files
- [ ] README references the new skill in the right section
- [ ] Paths and category names match the repo layout
- [ ] `git status` only shows intended changes

## Common pitfalls

- Forgetting to copy bundled templates or references
- Adding the skill to the wrong README section
- Using a path that does not match the category folder
- Updating the wiki README but not mirroring the actual skill directory
- Leaving stale or partial copies in the wiki repo

## Short definition

A reliable workflow for publishing local Hermes skills into a shared wiki repo and keeping the index in sync.
