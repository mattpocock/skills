# Agent Skills

A collection of agent skills that extend capabilities across planning, development, and tooling.

## CLI Reference

| Command | Purpose |
|---|---|
| `npx skills add <source>` | Install a skill |
| `npx skills list` | List all installed skills |
| `npx skills find [query]` | Search/browse available skills |
| `npx skills remove [skill]` | Remove an installed skill |
| `npx skills check` | Check installed skills for updates |
| `npx skills update` | Update all installed skills |
| `npx skills init [name]` | Create a new SKILL.md template |

Browse available skills at [skills.sh](https://skills.sh). Common flags: `-g` (global), `-y` (skip prompts).

To list all skills available in this repo:

```
npx skills add O-Marsters-1997/skills --list
```

## Planning & Design

These skills help you think through problems before writing code.

- **write-a-prd** — Create a PRD through an interactive interview, codebase exploration, and module design. Filed as a GitHub issue.

  ```
  npx skills add O-Marsters-1997/skills --skill write-a-prd
  ```

- **prd-to-plan** — Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices.

  ```
  npx skills add O-Marsters-1997/skills --skill prd-to-plan
  ```

- **prd-to-issues** — Break a PRD into independently-grabbable GitHub issues using vertical slices.

  ```
  npx skills add O-Marsters-1997/skills --skill prd-to-issues
  ```

- **grill-me** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.

  ```
  npx skills add O-Marsters-1997/skills --skill grill-me
  ```

- **design-an-interface** — Generate multiple radically different interface designs for a module using parallel sub-agents.

  ```
  npx skills add O-Marsters-1997/skills --skill design-an-interface
  ```

- **request-refactor-plan** — Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue.

  ```
  npx skills add O-Marsters-1997/skills --skill request-refactor-plan
  ```

## Development

These skills help you write, refactor, and fix code.

- **tdd** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.

  ```
  npx skills add O-Marsters-1997/skills --skill tdd
  ```

- **triage-issue** — Investigate a bug by exploring the codebase, identify the root cause, and file a GitHub issue with a TDD-based fix plan.

  ```
  npx skills add O-Marsters-1997/skills --skill triage-issue
  ```

- **improve-codebase-architecture** — Explore a codebase for architectural improvement opportunities, focusing on deepening shallow modules and improving testability.

  ```
  npx skills add O-Marsters-1997/skills --skill improve-codebase-architecture
  ```

- **migrate-to-shoehorn** — Migrate test files from `as` type assertions to @total-typescript/shoehorn.

  ```
  npx skills add O-Marsters-1997/skills --skill migrate-to-shoehorn
  ```

- **scaffold-exercises** — Create exercise directory structures with sections, problems, solutions, and explainers.

  ```
  npx skills add O-Marsters-1997/skills --skill scaffold-exercises
  ```

## Tooling & Setup

- **setup-pre-commit** — Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.

  ```
  npx skills add O-Marsters-1997/skills --skill setup-pre-commit
  ```

- **git-guardrails-claude-code** — Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, etc.) before they execute.

  ```
  npx skills add O-Marsters-1997/skills --skill git-guardrails-claude-code
  ```

## Writing & Knowledge

- **write-a-skill** — Create new skills with proper structure, progressive disclosure, and bundled resources.

  ```
  npx skills add O-Marsters-1997/skills --skill write-a-skill
  ```

- **edit-article** — Edit and improve articles by restructuring sections, improving clarity, and tightening prose.

  ```
  npx skills add O-Marsters-1997/skills --skill edit-article
  ```

- **ubiquitous-language** — Extract a DDD-style ubiquitous language glossary from the current conversation.

  ```
  npx skills add O-Marsters-1997/skills --skill ubiquitous-language
  ```

- **obsidian-vault** — Search, create, and manage notes in an Obsidian vault with wikilinks and index notes.

  ```
  npx skills add O-Marsters-1997/skills --skill obsidian-vault
  ```
