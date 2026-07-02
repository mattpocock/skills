# mattpocock-skills

## 1.1.0

### Minor Changes

- [#406](https://github.com/mattpocock/skills/pull/406) [`930a450`](https://github.com/mattpocock/skills/commit/930a450089f77a49af09001d955db8452a4b867d) Thanks [@mattpocock](https://github.com/mattpocock)! - Bring the **`ask-matt`** router up to date with the full skill set. It now maps five skills it was missing: **`tdd`** (woven into the main flow as the red-green engine `implement` drives), **`diagnosing-bugs`** (a new "Something's broken" on-ramp — there was previously no route for a bug), **`domain-modeling`** and **`codebase-design`** (a new "Vocabulary underneath" section), and **`grilling`** (the shared interview primitive). `prototype` is fleshed out as a standalone and the description broadens from "user-invoked skills" to "the skills". A maintenance rule is added to `CLAUDE.md` so any future skill add/rename/remove or flow change triggers an `ask-matt` re-check, beside the existing docs-page re-sync rule.

- [#405](https://github.com/mattpocock/skills/pull/405) [`14c13c5`](https://github.com/mattpocock/skills/commit/14c13c5bf9ec1bee9926c0c1f388534f0b9ab8e8) Thanks [@mattpocock](https://github.com/mattpocock)! - Rename the in-progress **`review`** skill to **`code-review`** and promote it from `in-progress/` to the `engineering/` bucket. It now ships in the plugin, is listed in the top-level and Engineering READMEs (Model-invoked), and has a human-facing docs page at `docs/engineering/code-review.md`. The `/implement` skill and docs now point at `/code-review`.

- [#401](https://github.com/mattpocock/skills/pull/401) [`64d9f3d`](https://github.com/mattpocock/skills/commit/64d9f3d49ec04c30d60e57df39225808c2dbfae3) Thanks [@mattpocock](https://github.com/mattpocock)! - Add a fourth **Task** ticket type to the **`decision-mapping`** skill. Some blockers are neither a decision, a prototype, nor research — just literal manual work that has to happen before the discussion can move forward (moving data, signing up for a third-party service, provisioning access). The agent automates it where it can, otherwise hands the human a precise checklist, and records any resulting facts later tickets depend on.

- [`850873c`](https://github.com/mattpocock/skills/commit/850873cd73d5f81826ebf512ad35d2b1e113001f) Thanks [@mattpocock](https://github.com/mattpocock)! - Make the **`prototype`** skill model-invoked, so the agent can reach for it autonomously (and other skills can too). Its description is rewritten around the leading word _prototype_ — throwaway code that answers a design question — with one trigger per branch (state/logic sanity-check, or UI exploration).

- [#413](https://github.com/mattpocock/skills/pull/413) [`5c3c49d`](https://github.com/mattpocock/skills/commit/5c3c49df1a6c24019ea56690088810961cd3370c) Thanks [@mattpocock](https://github.com/mattpocock)! - Make **`wayfinder`** collaborative by moving the map off a local Markdown file and onto the repo's issue tracker.

  The map is now a single `wayfinder:map` issue whose tickets are its child issues — one shared URL the whole team can watch and comment on. Blocking, claiming (`wayfinder:claimed`), and the frontier query all use native tracker semantics, so a session loads the map at low resolution (Notes + one context pointer per closed ticket + Fog prose) and zooms into individual tickets on demand, instead of loading the whole map every time.

  Wayfinder stays tracker-agnostic: the per-tracker mechanics live behind a pointer in `docs/agents/issue-tracker.md`, so `setup-matt-pocock-skills` now seeds a "Wayfinding operations" section for GitHub, GitLab, and local-markdown. Absent that doc, Wayfinder defaults to local-markdown.

- [#419](https://github.com/mattpocock/skills/pull/419) [`9272935`](https://github.com/mattpocock/skills/commit/927293589bc009b2ef42db7c04e788baebbe47c7) Thanks [@mattpocock](https://github.com/mattpocock)! - Make **`wayfinder`**'s no-duplication contract explicit: the map is an **index**, not a store.

  Adopting "index" as the leading word for the map's role fixes two duplication risks. The map now states up front that a decision lives in exactly one place — its ticket — so it only ever gists and links, never restates the answer (previously this rule was implied inside an HTML comment in the map-body template). And graduating fog into a ticket now clears the graduated patch from the Fog, so a suspected question can't linger in both places at once.

- [#412](https://github.com/mattpocock/skills/pull/412) [`4027ea6`](https://github.com/mattpocock/skills/commit/4027ea6afdd329aefb6671ab9f2bc12482fb6d76) Thanks [@mattpocock](https://github.com/mattpocock)! - Rename the **`decision-mapping`** skill to **`wayfinder`**, invoked as `/wayfinder`.

  "Decision map" was jargony and inaccurate — only one of the skill's four ticket types (Grilling) is actually a decision. The reframe charts a route through a foggy problem, resolving investigation tickets one at a time until the way to the goal is clear. This makes one coherent leading-word frame (fog of war / frontier / the map) instead of mixing an invented term on top of it.

  Also a pruning pass: unified `node`→`ticket`, bound "the frontier" to the unblocked tickets, dropped the duplicated "one question at a time" (owned by `/grilling`), and trimmed intro no-ops.

### Patch Changes

- [#394](https://github.com/mattpocock/skills/pull/394) [`7a4c756`](https://github.com/mattpocock/skills/commit/7a4c7561d4d8d866a9ae6e0073648ac94785ac8a) Thanks [@mattpocock](https://github.com/mattpocock)! - Give the in-progress **`code-review`** skill an always-on Fowler smell baseline on its Standards axis. A curated ~12 high-signal "Bad Smells in Code" (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest) are inlined into `SKILL.md` as a fixed baseline alongside whatever the repo documents — not a new third axis. Two binding rules keep it safe: a documented repo standard overrides the baseline, and every smell is reported as a judgement call, never a hard violation.

- [#393](https://github.com/mattpocock/skills/pull/393) [`e81f976`](https://github.com/mattpocock/skills/commit/e81f97660af0bebfdbf2e23db6a71f7dfcb9a659) Thanks [@mattpocock](https://github.com/mattpocock)! - Reshape the `tdd` skill into reference-only. The red → green → refactor loop is anchored by leading words the model already holds, so the step-by-step Workflow was largely restating the loop and duplicating the horizontal-slicing anti-pattern. Dropped the Workflow and per-cycle checklist; folded their one durable idea — vertical slices / tracer bullets — into the Anti-patterns section and a short Rules-of-the-loop list. Introduced **seam** as the leading word for where tests go, collapsing the old Philosophy "public interfaces" prose and the Planning "confirm interface / behaviors" handshake into one rule: test only at pre-agreed seams, confirmed with the user before any test is written.

  Also dropped the refactor stage — TDD is now red → green, not red → green → refactor. Refactoring belongs to the review stage, not the implementation loop, so the refactor rule and `refactoring.md` were removed (its home is the `review` skill).

- [`43ea088`](https://github.com/mattpocock/skills/commit/43ea0884b07a3e67a5a07f025ce92aefa983177b) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the **tautological test** anti-pattern to the `tdd` skill. Tests whose assertion is recomputed the way the code computes it pass by construction and give zero confidence — distinct from the implementation-coupling anti-pattern already covered. Added as a peer at the same three sites: a Philosophy principle (expected values must come from an independent source of truth), a per-cycle checklist gate, and a BAD/GOOD example pair in `tests.md`.

- [`e00eadb`](https://github.com/mattpocock/skills/commit/e00eadb4bb32c3d5a631ead1a5ed5d6a7c5f74e2) Thanks [@mattpocock](https://github.com/mattpocock)! - Extend the **`triage`** skill to triage external pull requests, treating a PR as an issue with attached code that runs through the same roles and state machine. PRs flow inline alongside issues (gated by a per-repo setup toggle), discovery surfaces only external PRs, the bug-only "reproduce" step is generalized into a single "verify the claim" step, and a redundancy check resolves already-implemented requests to `wontfix` without polluting the out-of-scope knowledge base. `setup-matt-pocock-skills` gains the PRs-as-a-request-surface toggle for GitHub/GitLab.

## 1.0.1

### Patch Changes

- [`d20ee26`](https://github.com/mattpocock/skills/commit/d20ee2684e2a9442698ac3c1e0f2c5b68c4cf296) Thanks [@mattpocock](https://github.com/mattpocock)! - Make the **`teach`** skill reuse-first. Lessons are now built from reusable **components** in `./assets/` — stylesheets, quiz widgets, simulators, diagram helpers. Reuse is the default: the agent reads `./assets/` before authoring a lesson, builds from what's there, and extracts anything new and reusable into a component rather than inlining it.

## 1.0.0

### Major Changes

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the **`ask-matt`** skill — a user-invoked router that points you at the right skill or flow for your situation.

  **Breaking:** `ask-matt` routes over the other user-invoked skills in this repo, so it expects them to be installed.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the shared design skills and rewire existing skills onto them.

  - New **`codebase-design`** skill — the deep-module vocabulary (module, interface, depth, seam, adapter) and the principles for putting a lot of behaviour behind a small interface. The language that previously lived in `improve-codebase-architecture/LANGUAGE.md` now lives here, generalized for reuse across skills.
  - New **`domain-modeling`** skill — actively build and sharpen a project's domain model, stress-testing terms against the glossary and keeping `CONTEXT.md` and ADRs current.
  - `improve-codebase-architecture` now draws its architecture vocabulary from `/codebase-design` and its domain model from `/domain-modeling`.
  - `tdd` now leans on `/codebase-design` for interface-design guidance — its inline `deep-modules.md` / `interface-design.md` notes were removed in favour of the shared skill.
  - `grill-with-docs` now builds the domain model inline via `/domain-modeling`.

  **Breaking:** these skills now depend on the new `codebase-design` / `domain-modeling` skills, so you must install them too.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Remove the **`caveman`** and **`zoom-out`** skills.

  - `caveman` was a duplicate of another skill I was testing and was never meant to be public.
  - `zoom-out` went unused in practice, so it's been removed from the repo.

  **Breaking:** both skills have been removed.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Rename the **`diagnose`** skill to **`diagnosing-bugs`**.

  **Breaking:** invoke it as `/diagnosing-bugs` — the old `/diagnose` name no longer exists.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Replace **`write-a-skill`** with **`writing-great-skills`**.

  - Removed `write-a-skill`.
  - Added `writing-great-skills` (plus its `GLOSSARY.md`) — a reference for writing and editing skills well: the vocabulary and principles that make a skill predictable, hunting no-ops down to the sentence level.
  - Exposed `grilling` as a model-invoked skill — the reusable interview loop behind `grill-me` and `grill-with-docs`.

  **Breaking:** `write-a-skill` has been removed; use `writing-great-skills` instead.

### Minor Changes

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Add the **`resolving-merge-conflicts`** skill — a loop for resolving an in-progress git merge or rebase conflict. Standalone, with no dependencies on other skills.

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Rename the skill taxonomy from **Commands / Skills** to **User-invoked / Model-invoked** across the docs, and add `docs/invocation.md` defining the split: user-invoked skills are reachable only when you type them and exist to orchestrate; model-invoked skills can also be reached automatically when the task fits. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Patch Changes

- [`47bde84`](https://github.com/mattpocock/skills/commit/47bde84da032afb2e5058f997f3bbca47d321dbd) Thanks [@mattpocock](https://github.com/mattpocock)! - Tighten the **`review`** skill: fail-fast ref check, single-sourced rules, and no-op cuts.
