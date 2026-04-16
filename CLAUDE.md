# CLAUDE.md — mattpocock-skills (Plugin Marketplace)

## Project Overview

Claude plugin marketplace hosting agent skills for planning, development, tooling, and writing.
Originally by Matt Pocock, distributed to team members via the Claude plugin system.

- **Marketplace name:** `mattpocock-skills`

---

## Repository Structure

```
(repo root)
├── .github/
│   └── pull_request_template.md  ← Auto-populates PR body
├── .claude-plugin/
│   └── marketplace.json          ← Marketplace catalog (lists all plugins)
├── plugins/
│   └── <plugin-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json       ← Plugin manifest (name, version, description)
│       └── skills/
│           └── <skill-name>/
│               └── SKILL.md      ← Skill prompt/instructions
├── CLAUDE.md
├── CONTRIBUTING.md               ← Commit, branch, and PR conventions
└── README.md
```

---

## Common Tasks

### Adding a new skill to an existing plugin
1. Create `plugins/<plugin>/skills/<skill-name>/SKILL.md`
2. Bump `version` in `plugins/<plugin>/.claude-plugin/plugin.json`
3. Commit and push to `main`
4. Users: go to Organization settings → Plugins → "Check for updates"

### Adding a new plugin
1. Create `plugins/<plugin-name>/` following the structure above
2. Add the plugin entry to `.claude-plugin/marketplace.json`
3. Bump `metadata.version` in `.claude-plugin/marketplace.json`

### Updating a skill
1. Edit the relevant `SKILL.md`
2. Bump `version` in the plugin's `plugin.json`

---

## Versioning

- Use [semver](https://semver.org/): `MAJOR.MINOR.PATCH`
- New skill or capability → bump **minor** (`1.0.0` → `1.1.0`)
- Bug fix or prompt tweak → bump **patch** (`1.0.0` → `1.0.1`)
- Breaking change to skill interface → bump **major**
- Always bump both `plugin.json` and `marketplace.json` together

---

## Git Conventions

See [CONTRIBUTING.md](CONTRIBUTING.md) for full commit message format, branch naming, push commands, and PR instructions.

**Summary:**

- Commits: [Conventional Commits](https://www.conventionalcommits.org/) — `feat(tdd): add mocking reference`
- Branches: `<author>/<plugin-or-feature>`
- PRs target `main`; PR body is auto-populated from [.github/pull_request_template.md](.github/pull_request_template.md)
- **Do NOT** include Claude Code session URLs or tracking links in commit messages or PR bodies

---

## Existing Plugins

### Planning & Design
| Plugin | Description |
|--------|-------------|
| `write-a-prd` | PRD creation via interview, codebase exploration, and module design |
| `prd-to-plan` | PRD → multi-phase implementation plan with tracer-bullet slices |
| `prd-to-issues` | PRD → independently-grabbable GitHub issues |
| `grill-me` | Relentless design/plan interview until full shared understanding |
| `design-an-interface` | Multiple radically different interface designs via parallel agents |
| `request-refactor-plan` | Detailed refactor plan with tiny commits, filed as GitHub issue |

### Development
| Plugin | Description |
|--------|-------------|
| `tdd` | Test-driven development with red-green-refactor loop |
| `triage-issue` | Bug root cause analysis → GitHub issue with TDD fix plan |
| `improve-codebase-architecture` | Architectural improvement opportunities and module deepening |
| `migrate-to-shoehorn` | Migrate tests from `as` assertions to @total-typescript/shoehorn |
| `scaffold-exercises` | Exercise directory scaffolding for courses |
| `qa` | Conversational QA sessions that file GitHub issues |
| `github-triage` | Label-based GitHub issue triage state machine |

### Tooling & Setup
| Plugin | Description |
|--------|-------------|
| `setup-pre-commit` | Husky + lint-staged + Prettier + type checking + tests |
| `git-guardrails-claude-code` | Claude Code hooks to block dangerous git commands |

### Writing & Knowledge
| Plugin | Description |
|--------|-------------|
| `write-a-skill` | Create new agent skills with proper structure |
| `edit-article` | Edit and improve articles for clarity and structure |
| `ubiquitous-language` | DDD-style ubiquitous language glossary extraction |
| `obsidian-vault` | Obsidian vault note management with wikilinks |
