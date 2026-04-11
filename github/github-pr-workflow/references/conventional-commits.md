# Conventional Commits Quick Reference

Format: `type(scope): description`

## Types

| Type | When to use | Example |
|------|------------|---------|
| `feat` | New feature or capability | `feat(auth): add OAuth2 login flow` |
| `fix` | Bug fix | `fix(api): handle null response from /users endpoint` |
| `refactor` | Code restructuring, no behavior change | `refactor(db): extract query builder into separate module` |
| `docs` | Documentation only | `docs: update API usage examples in README` |
| `test` | Adding or updating tests | `test(auth): add integration tests for token refresh` |
| `ci` | CI/CD configuration | `ci: add Python 3.12 to test matrix` |
| `chore` | Maintenance, dependencies, tooling | `chore: upgrade pytest to 8.x` |
| `perf` | Performance improvement | `perf(search): add index on users.email column` |
| `style` | Formatting, whitespace, semicolons | `style: run black formatter on src/` |
| `build` | Build system or external deps | `build: switch from setuptools to hatch` |
| `revert` | Reverts a previous commit | `revert: revert "feat(auth): add OAuth2 login flow"` |

## Scope (optional)

Short identifier for the area of the codebase: `auth`, `api`, `db`, `ui`, `cli`, etc.

## Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer:

```
feat(api)!: change authentication to use bearer tokens

BREAKING CHANGE: API endpoints now require Bearer token instead of API key header.
Migration guide: https://docs.example.com/migrate-auth
```

## Multi-line Body

Wrap at 72 characters. Use bullet points for multiple changes:

```
feat(auth): add JWT-based user authentication

- Add login/register endpoints with input validation
- Add User model with argon2 password hashing
- Add auth middleware for protected routes
- Add token refresh endpoint with rotation

Closes #42
```

## Linking Issues

In the commit body or footer:

```
Closes #42          ← closes the issue when merged
Fixes #42           ← same effect
Refs #42            ← references without closing
Co-authored-by: Name <email>
```

## Quick Decision Guide

- Added something new? → `feat`
- Something was broken and you fixed it? → `fix`
- Changed how code is organized but not what it does? → `refactor`
- Only touched tests? → `test`
- Only touched docs? → `docs`
- Updated CI/CD pipelines? → `ci`
- Updated dependencies or tooling? → `chore`
- Made something faster? → `perf`
