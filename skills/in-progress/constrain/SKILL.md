---
name: constrain
description: Fence a tool's API down to the small surface agents may use, enforced by types and lint rules, with a ratchet that pays down existing violations. Use when the user wants to constrain a library, framework, SDK or API. User-invoked.
disable-model-invocation: true
---

# Constrain

Most APIs are designed for humans: wide, flexible, full of escape hatches. Agents handle nuance badly, so "use this carefully" fails and "use only these" works. This skill builds a **fence** around one tool: the small **surface** of its API that agents may touch, checked deterministically on every run. Anything outside the surface goes red.

The fence is an **allowlist**. Name what is allowed; everything else is refused by default, including whatever the tool adds in its next version.

The fence speaks through its **error messages**. The agent reads checker output and acts on it, so every message names what to use instead ("Derive this during render, or move it to an event handler"; "Query through `db.ts`'s `findUser`"), never only what was refused.

Any language, any checker. Use whatever the project already runs (ESLint, Biome, ruff, clippy, golangci-lint, RuboCop, and so on). When it cannot express a rule, fall back to [Semgrep](https://semgrep.dev) or [ast-grep](https://ast-grep.github.io), which cover most languages with one rule format.

## 1. Explore

Find the project's languages, its tools (manifests, lockfiles, imports), its type checker if any, and its lint setup (engine, config, plugins, existing rules, how CI runs it). Ask the user which **one** tool to fence this run: the fence for React has nothing to do with the fence for `requests` or `sqlx`.

Done when you know the tool and its version, the checker that will hold the fence, and where project-owned rules and modules will live.

## 2. Gather

Dispatch two subagents in parallel, each started with a fresh context window:

- **Community**: the tool's own docs warnings (React's "You Might Not Need an Effect", a library's "advanced" or "unsafe" sections), existing lint plugins and rule sets for it (including rules that ship disabled), known footguns, deprecated APIs, and migration guides.
- **Usage**: every member of the tool this codebase calls, with counts and file locations. That is the surface the project already has in practice.

Done when every exported member of the tool (or every member in the groups the user cares about, for a very large tool) sits in one of three groups: **used**, **unused**, **flagged by the community**.

## 3. Interview

Call the Skill tool with `grilling` and work the fence in rounds. Each question proposes the allowed surface for one area of the tool, with a recommendation:

- **Allowed**: the members agents may use, for example "hooks: `useState`, `useReducer`, `useContext`, `useRef`" or "HTTP: `get` and `post` through `http_client.py`".
- **Allowed in one place**: a member permitted only inside a named file or folder, for example "`useEffect` only in `src/sync/`" or "raw SQL only in `src/db/migrations/`".
- **Refused shape**: a pattern the allowlist cannot express because it is built from allowed members, for example "`useState` holding a value derived from props". These are the only bans; give each one a positive alternative in its message.

Recommend from the evidence: members the community flags start outside the surface; members the codebase never uses start outside it at no cost.

Done when every member in the three groups is inside or outside the surface, every refused shape has its alternative, and the user confirms the fence.

## 4. Build the fence

Build in this order. Each layer covers what the one before it cannot.

1. **Facade** (where the language has types or module visibility). A module the project owns that re-exports only the allowed surface, with narrowed types where useful. Agents import the facade; the type checker refuses any member that is not in it. Then add one import rule: the real tool may be imported only inside the facade (`no-restricted-imports`, ruff's `banned-api`, depguard, clippy's `disallowed-methods`, Semgrep).
2. **Existing rules**: configure the tool's own lint plugin and the checker's built-in restriction rules.
3. **Custom rules**: for refused shapes nothing else covers. Write them in the project's checker as a local plugin, or in Semgrep or ast-grep.

Every rule and every facade refusal carries a message that names the alternative. Every custom rule gets a failing fixture and a passing fixture, run by the checker's own rule tester where it has one.

Done when each decision from step 3 maps to exactly one place in the facade or one rule.

## 5. Ratchet

The codebase will already break the fence. Record those violations as a committed **baseline** and let the **ratchet** pay them down: the baseline may only shrink.

- **Record**: write the baseline, per rule and per file, with counts. Use the checker's native mechanism where it exists (ESLint's `--suppress-all` writes `eslint-suppressions.json`; many linters have a baseline flag), otherwise a small baseline file plus a check script committed beside it.
- **Hold**: CI fails when any count rises or a violation appears in a file or rule the baseline does not list. New code is fenced from day one.
- **Tighten**: when a change lowers a count, the same change shrinks the baseline (ESLint's `--prune-suppressions`, or the check script rewriting the file). A stale baseline fails CI, so the debt paid stays paid. ESLint does this by default; keep `--pass-on-unpruned-suppressions` out of CI.

Done when the checker passes on the current code with the baseline in place.

## 6. Verify

Prove the fence bites:

- A deliberate violation in a fresh file goes red, and its output shows the message you wrote.
- A deliberate extra violation in a baselined file goes red.
- Fixing one baselined violation, then running the tighten step, shrinks the baseline; skipping the tighten step goes red.
- Importing the real tool outside the facade goes red.
- Every fixture fails and passes as expected.

Revert the deliberate violations. Done when every check above was observed, not assumed.

## 7. Record

Add one line under `## Agent skills` in `CLAUDE.md` (or `AGENTS.md`) naming the fenced tool, its facade, and the command that checks the fence, so an agent whose code goes red knows why. The facade and the rules are the source of truth: leave the surface itself out of the prose.
