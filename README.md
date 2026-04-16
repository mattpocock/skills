# Agent Skills

A collection of agent skills that extend capabilities across planning, development, and tooling — packaged as Claude enterprise plugins.

## Installation

Install from the marketplace in your Claude organization settings, or via CLI:

```bash
/plugin install <plugin-name>@mattpocock-skills
```

## Planning & Design

- **write-a-prd** — Create a PRD through an interactive interview, codebase exploration, and module design. Filed as a GitHub issue.
- **prd-to-plan** — Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices.
- **prd-to-issues** — Break a PRD into independently-grabbable GitHub issues using vertical slices.
- **grill-me** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **design-an-interface** — Generate multiple radically different interface designs for a module using parallel sub-agents.
- **request-refactor-plan** — Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue.

## Development

- **tdd** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **triage-issue** — Investigate a bug by exploring the codebase, identify the root cause, and file a GitHub issue with a TDD-based fix plan.
- **improve-codebase-architecture** — Explore a codebase for architectural improvement opportunities, focusing on deepening shallow modules and improving testability.
- **migrate-to-shoehorn** — Migrate test files from `as` type assertions to @total-typescript/shoehorn.
- **scaffold-exercises** — Create exercise directory structures with sections, problems, solutions, and explainers.
- **qa** — Interactive QA session where user reports bugs conversationally, and the agent files GitHub issues.
- **github-triage** — Triage GitHub issues through a label-based state machine with interactive grilling sessions.

## Tooling & Setup

- **setup-pre-commit** — Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.
- **git-guardrails-claude-code** — Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, etc.) before they execute.

## Writing & Knowledge

- **write-a-skill** — Create new skills with proper structure, progressive disclosure, and bundled resources.
- **edit-article** — Edit and improve articles by restructuring sections, improving clarity, and tightening prose.
- **ubiquitous-language** — Extract a DDD-style ubiquitous language glossary from the current conversation.
- **obsidian-vault** — Search, create, and manage notes in an Obsidian vault with wikilinks and index notes.

## Repository Structure

```text
├── .claude-plugin/
│   └── marketplace.json          ← Plugin catalog
├── plugins/
│   └── <plugin-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json       ← Plugin manifest
│       └── skills/
│           └── <skill-name>/
│               └── SKILL.md
├── CLAUDE.md
├── CONTRIBUTING.md
└── README.md
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit, branch, and PR conventions.
