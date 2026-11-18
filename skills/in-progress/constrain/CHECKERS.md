# Checkers

The checks for each kind of entry, and each checker's own ratchet, by language. Read only your project's section, plus **Any language** when your checker can't express a rule.

A **name-only** check matches the identifier in the source. It misses aliases (`const { env } = process`, `const db = prisma`) and objects returned from calls, and it over-matches anything else with the same name. A **type-aware** check asks the compiler or a type checker what the object is.

## JS/TS

**Members:**

- Imports: ESLint `no-restricted-imports` with `allowImportNames`, which works under `paths` or `patterns`. `allowImportNamePattern` works under `patterns` only.
- Objects identified by name: `no-restricted-properties`. Pair `object` with `allowProperties` to make that object's allowlist. It covers both reads and calls. It's name-only.
- Banned patterns: `no-restricted-syntax` with an AST selector. It's name-only.
- Objects identified by type: a custom typescript-eslint rule. Get the type checker through `ESLintUtils.getParserServices(context)` and ask for a node's type with `services.getTypeAtLocation(node)`. This needs type-aware linting switched on.

**Import edges:**

- dependency-cruiser's `allowed` rule set is an allowlist: it reports any dependency that matches none of its rules as `not-in-allowed`. Set `allowedSeverity` to `error`, because it defaults to `warn`. Use `forbidden` rules for one-off bans.
- eslint-plugin-boundaries is the alternative when the project wants edges checked inside ESLint, where they share ESLint's suppressions.

**Ratchet:**

- ESLint:
  - Record: `--suppress-all` writes `eslint-suppressions.json`.
  - Shrink: `--prune-suppressions`.
  - Tighten: `--suppress-rule <rule>` records one rule at a time.
  - ESLint fails by default when suppressions go unused. Keep `--pass-on-unpruned-suppressions` out of CI.
- dependency-cruiser:
  - Record: `--baseline` writes `.dependency-cruiser-known-violations.json`. `depcruise-baseline` is a deprecated alias for it.
  - Hold: `--ignore-known` leaves recorded violations out of the report.
  - Shrink: `--baseline --baseline-mode shrink-only` lets the baseline only lose entries.
- The docs don't say:
  - whether ESLint fails when a file's count rises past its suppressed count;
  - how dependency-cruiser matches repeated violations.

  Step 6 tests both instead of assuming them.

## Python

**Members:**

- ruff's `flake8-tidy-imports.banned-api` (TID251) bans a module or a `module.attr` such as `os.environ`, resolved through imports.
- It can't see members of an object returned from a call. Use Semgrep for those.

**Import edges:**

- import-linter's contracts: `forbidden`, `protected`, `layers` and `independence`.

**Ratchet:**

- ruff has no baseline file, so use the generic baseline script.
- import-linter has no baseline file either. Its `ignore_imports` list does that job. Leave `unmatched_ignore_imports_alerting` at `error`, its default, so an entry that no longer matches fails and the list can only shrink.

## Go

**Members:**

- Imports: `depguard`.
- Members: `forbidigo`. With `analyze-types: true` it matches on package and type name instead of the source text, so it's type-aware. `pkg` narrows a pattern to one import path.

**Import edges:**

- `depguard` with per-path rules.
- Or go-arch-lint: `mayDependOn` in `.go-arch-lint.yml` holds an allowlist per component.

**Ratchet:**

- go-arch-lint has no baseline. Existing violations go into its config, marked `todo`, and shrink by hand.
- Otherwise, use the generic baseline script.

## Rust

**Members:**

- clippy's `disallowed-methods` and `disallowed-types` in `clippy.toml`. They match resolved paths (`std::env::var`, `sqlx::query`), so they're type-aware already.

**Import edges:**

- cargo-deny bans crates from the dependency tree, but it can't see edges between modules inside a crate. Tell the user.
- To fence modules inside a crate, either:
  - split them into workspace crates, so the manifests and cargo-deny hold the edge; or
  - match `use` paths with Semgrep or ast-grep, which is name-only.

**Ratchet:**

- Use the generic baseline script.

## Java/Kotlin

**Import edges:**

- ArchUnit.

**Ratchet:**

- ArchUnit's `FreezingArchRule` is a native ratchet. It records existing violations on the first run, fails on new ones, and shrinks its store as they are fixed.

## .NET

**Import edges:**

- NetArchTest or ArchUnitNET.

**Ratchet:**

- Use the generic baseline script.

## Any language

The fallback when the project's checker can't express a rule:

- **Semgrep:**
  - Typed metavariables constrain an object by type, for example `($X: DomSanitizer).sanitize(...)`. Type inference is shallow and per file, so it's reliable for local variables and arguments but not for class fields.
  - For a member allowlist, match `$X.$M` and exclude each allowed member with `pattern-not`.
- **ast-grep:** matches syntax only, so it's name-only.

**Ratchet:**

- Use the generic baseline script from step 5.
