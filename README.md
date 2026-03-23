# Agent Skills

A collection of agent skills that extend capabilities across planning, development, and tooling.

## Installation

Install all skills using the [Vercel skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills@latest add evans-sam/skills
```

Or install individual skills:

```bash
npx skills@latest add evans-sam/skills --skill write-a-plan --skill tdd
```

You can also install the CLI globally:

```bash
npm i -g skills
skills add evans-sam/skills
```

Skills are installed to `~/.claude/skills/` and available immediately in Claude Code.

## Planning & Design

These skills help you think through problems before writing code.

- **write-a-prd** — Create a PRD through an interactive interview, codebase exploration, and module design. Saves wherever you tell it — local file, GitHub wiki, Notion, Confluence, etc.
- **write-a-plan** — Create a robust implementation plan from scratch through relentless interviewing, codebase exploration, and vertical slicing. No PRD required.
- **prd-to-plan** — Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices.
- **prd-to-issues** — Break a PRD into independently-grabbable issues using vertical slices. Creates GitHub issues directly, or saves to a location of your choice.
- **write-a-test-plan** — Create a comprehensive testing plan from a PRD, implementation plan, or triage document. Covers local data setup, required services, acceptance tests, and edge cases.
- **design-an-interface** — Generate multiple radically different interface designs for a module using parallel sub-agents. Great for exploring API shapes and comparing trade-offs.
- **request-refactor-plan** — Create a detailed refactor plan with tiny commits via user interview. Saves as a local markdown RFC document.
- **grill-me** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **blueprint-scratchpad** — Start the shaping period for a feature blueprint. Fetches Linear project context and linked docs, grills the engineer on the full problem space, and produces a working scratchpad. Supports multi-session check-ins.
- **blueprint-draft** — Transform a shaping scratchpad into a formal engineering blueprint with decided language, collaborative estimation, and Linear ticket linking.
- **blueprint-publish** — Curate a working blueprint and scratchpad into a team-ready Notion page with section-by-section review before publishing.
- **ubiquitous-language** — Extract a DDD-style ubiquitous language glossary from the current conversation, flagging ambiguities and proposing canonical terms. Saves to `UBIQUITOUS_LANGUAGE.md`.

## Development

These skills help you write, refactor, and fix code.

- **tdd** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **triage-issue** — Investigate a bug by exploring the codebase, identify the root cause, and create an issue with a TDD-based fix plan. Creates a GitHub issue directly, or saves to a location of your choice.
- **improve-codebase-architecture** — Explore a codebase for architectural improvement opportunities, focusing on deepening shallow modules and improving testability.

## Tooling & Setup

- **setup-pre-commit** — Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.
- **git-guardrails-claude-code** — Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, etc.) before they execute.

## Meta

- **write-a-skill** — Create new skills with proper structure, progressive disclosure, and bundled resources.
