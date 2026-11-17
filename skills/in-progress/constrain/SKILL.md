---
name: constrain
description: Fence a tool's API down to the small surface agents may use, enforced by import-level lint rules, with a ratchet that pays down existing violations. Use when the user wants to constrain a library, framework, SDK or API, or tighten an existing fence. User-invoked.
disable-model-invocation: true
---

# Constrain

Most APIs are designed for humans: wide, flexible, full of escape hatches. Agents handle nuance badly, so "use this carefully" fails and "use only these" works. This skill builds a **fence** around one tool: the small **surface** of its API that agents may touch, checked deterministically on every run. Anything outside the surface goes red.

The fence is an **allowlist** of the tool's imports and members, held by lint rules. Each rule is pass/fail per occurrence, so a fence can land on a dirty codebase and tighten one name at a time.

The fence speaks through its **error messages**. The agent reads lint output and acts on it, so every message names what to use instead ("Derive this during render, or move it to an event handler"; "Use `httpx.get` with the shared client"), never only what was refused.

Any language, any checker. Use whatever the project already runs. When it cannot express a rule, fall back to [Semgrep](https://semgrep.dev) or [ast-grep](https://ast-grep.github.io), which cover most languages with one rule format.

## 1. Explore

Find the project's languages, its tools (manifests, lockfiles, imports), and its lint setup (engine, config, plugins, existing rules, how CI runs it). Ask the user which **one** tool to fence this run: the fence for React has nothing to do with the fence for `requests` or `sqlx`.

Look for an existing fence on that tool (its rules, its baseline, the `CLAUDE.md` line from step 7). If one exists, this run **tightens** it: the interview starts from the current allowlist and asks what comes off it.

Done when you know the tool and its version, the checker that will hold the fence, whether a fence already exists, and how CI runs the checker.

## 2. Gather

Dispatch two subagents in parallel, each started with a fresh context window:

- **Community**: the tool's own docs warnings (React's "You Might Not Need an Effect", a library's "advanced" or "unsafe" sections), existing lint plugins and rule sets for it (including rules that ship disabled), known footguns, deprecated APIs, and migration guides.
- **Usage**: every member of the tool this codebase imports or calls, with counts and file locations. That is the surface the project already has in practice.

Done when every exported member of the tool (or every member in the areas the user cares about, for a very large tool) sits in one of three groups, **used**, **unused** or **flagged by the community**, each with its usage count.

## 3. Interview

Call the Skill tool with `grilling` and work the fence in rounds. Each question proposes the allowed surface for one area of the tool, with a recommendation:

- **Allowed**: the names agents may import, for example "from `react`: `useState`, `useReducer`, `useContext`, `useRef`" or "from `requests`: nothing; use `httpx`".
- **Allowed in one place**: a name permitted only inside a named file or folder, for example "`useEffect` only in `src/sync/`" or "`sqlx::query` only in `src/db/`". This is a path-scoped override on the same rule.
- **Refused shape**: a pattern built entirely from allowed names, for example "`useState` holding a value derived from props". Only these need syntax-level rules; give each one a positive alternative in its message.

Recommend from the evidence: names the community flags start outside the surface, and names the codebase never uses start outside it at no cost. A name used hundreds of times can still come off the surface, because the ratchet carries the debt.

When tightening, ask only about names still on the allowlist, and show each one's current count.

Done when every name in the three groups is inside or outside the surface, every refused shape has its alternative, and the user confirms the fence.

## 4. Build the fence

Write the import rules first: one allowlist per tool (or per entry module of the tool), using the checker's import restriction. For example:

- ESLint: `no-restricted-imports` with `allowImportNames` on the tool's path (or `allowImportNamePattern` under `patterns`).
- ruff: `flake8-tidy-imports.banned-api` (TID251) on each refused module or member.
- Go: `depguard` for packages, `forbidigo` for members.
- Rust: clippy's `disallowed-methods` and `disallowed-types` in `clippy.toml`.
- Anything else: a Semgrep or ast-grep rule matching imports of the tool outside the allowlist.

Where the checker only takes a denylist, generate it from the allowlist (every member of the tool minus the allowed ones), and note in the config which allowlist it came from.

Then, only for refused shapes, write syntax-level rules: `no-restricted-syntax` with an AST selector, a local plugin, or Semgrep / ast-grep. Each custom rule gets a failing fixture and a passing fixture, run by the checker's own rule tester where it has one.

Every rule carries a message that names the alternative.

Done when each decision from step 3 maps to exactly one rule entry.

## 5. Ratchet

The codebase will already break the fence. Record those violations as a committed **baseline** and let the **ratchet** pay them down. It ratchets on two axes, and both only move one way:

- **The baseline shrinks**: as code is touched, violations get fixed and the counts fall.
- **The fence tightens**: a later run of this skill takes names off the allowlist and baselines the new violations.

The mechanics:

- **Record**: write the baseline, per rule and per file, with counts. Use the checker's native mechanism where it exists (ESLint's `--suppress-all` writes `eslint-suppressions.json`; many linters have a baseline flag), otherwise a small baseline file plus a check script committed beside it.
- **Hold**: CI fails when any count rises, or a violation appears in a file or rule the baseline does not list. New code is fenced from day one.
- **Shrink**: when a change lowers a count, the same change shrinks the baseline (ESLint's `--prune-suppressions`, or the check script rewriting the file). A stale baseline fails CI, so the debt paid stays paid. ESLint does this by default; keep `--pass-on-unpruned-suppressions` out of CI.

When tightening an existing fence, baseline only the rules this run changed, leaving every other rule's baseline as it was (ESLint: `--suppress-rule <rule>`).

Done when the checker passes on the current code with the baseline in place.

## 6. Verify

Prove the fence bites:

- Importing a name outside the allowlist in a fresh file goes red, and the output shows the message you wrote.
- An extra violation in a baselined file goes red.
- Fixing one baselined violation, then running the shrink step, shrinks the baseline; skipping the shrink step goes red.
- Every fixture fails and passes as expected.

Revert the deliberate violations. Done when every check above was observed, not assumed.

## 7. Record

Add one line under `## Agent skills` in `CLAUDE.md` (or `AGENTS.md`) naming the fenced tool and the command that checks the fence, so an agent whose code goes red knows why. The rules are the source of truth: leave the surface itself out of the prose.
