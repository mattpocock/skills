# Contributing

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short subject>
```

- Subject line: ≤72 chars, imperative mood ("add" not "added")
- Scope = plugin name (e.g. `tdd`, `write-a-prd`)
- Blank line between subject and body
- Body explains *why*, not *what*

### Types

| Type | Use for |
|------|---------|
| `feat` | New plugin or skill |
| `fix` | Correcting broken skill behavior |
| `docs` | README, CLAUDE.md, or CONTRIBUTING.md only |
| `chore` | Version bumps, config, tooling |
| `refactor` | Restructuring with no behavior change |

### Examples

```bash
git commit -m "$(cat <<'EOF'
feat(tdd): add mocking reference document

Adds guidance on when and how to use mocks vs real dependencies
in the TDD workflow.
EOF
)"
```

```bash
git commit -m "fix(qa): correct issue template formatting"
```

```bash
git commit -m "docs: update README plugin listing"
```

---

## Branching & Pushing

Branch naming: `<author>/<plugin-or-feature>`

```bash
# Create and switch to a feature branch
git checkout -b mark/tdd-updates

# Stage specific files (avoid git add . to prevent committing secrets)
git add plugins/tdd/ .claude-plugin/marketplace.json

# Push and set upstream
git push -u origin mark/tdd-updates
```

---

## Pull Requests

Target all PRs at `main`. Use the PR template (auto-populated from `.github/pull_request_template.md`).

Title format mirrors the commit subject: `feat(tdd): add mocking reference`

Before opening a PR:
- Bump `version` in `plugins/<name>/.claude-plugin/plugin.json`
- Bump `metadata.version` in `.claude-plugin/marketplace.json` if the catalog changed

Create via CLI:

```bash
gh pr create \
  --base main \
  --title "feat(tdd): <short subject>" \
  --body "$(cat .github/pull_request_template.md)"
```
