---
name: constrain
description: Fence a tool's API down to the small surface agents may use (its imports, the properties and methods allowed on each object it hands out, and which modules may import it), enforced by lint and import-graph rules, with a ratchet that pays down existing violations. Use when the user wants to constrain a library, framework, SDK or API, or tighten an existing fence. User-invoked.
disable-model-invocation: true
---

# Constrain

Most APIs are designed for humans: wide, flexible, full of escape hatches. Agents handle nuance badly, so "use this carefully" fails and "use only these" works. This skill builds a **fence** around one tool: the small **surface** of its API that agents may touch, checked deterministically on every run. Anything outside the surface goes red.

The surface has four kinds of entry, all first-class. The first three say **what** may be used from the tool; the last says **where** it may be used from:

- **Imports**: the tool's named exports (`useEffect` from `react`).
- **Property access** on certain objects (`process.env` outside config, `element.innerHTML`, raw `req.query`).
- **Method calls** on certain objects (`forEach` on a query result, `prisma.$queryRawUnsafe`, `Date.now` outside a clock module).
- **Import edges**: which modules may import which (only `src/db/**` imports `prisma`, `ui/` never imports `server/`, nothing imports a tool's internal paths such as `lodash/_baseGet`).

The fence is an **allowlist**. For members, one per object: for each object the tool hands out (the module itself, a client, a request, a query result), the members agents may touch. Everything else on that object is refused by default, including whatever the next version adds. For import edges, one per module: the modules it may import, so any edge outside the list is refused. A **ban** is for a one-off pattern on an otherwise open object or module.

Each rule is pass/fail per occurrence (per member use, per import edge), so a fence can land on a dirty codebase and tighten one member at a time.

The fence speaks through its **error messages**. The agent reads lint output and acts on it, so every message names what to use instead ("Read config through `config.ts`"; "Use `prisma.$queryRaw` with a tagged template"), never only what was refused.

Any language, any checker: use whatever the project already runs.

## 1. Explore

Find the project's languages, its tools (manifests, lockfiles, imports), and its lint setup (engine, config, plugins, whether type-aware linting is on, existing rules, how CI runs it). Ask the user which **one** tool to fence this run: the fence for React has nothing to do with the fence for `requests` or `sqlx`.

Look for an existing fence on that tool (its rules, its baseline, the `CLAUDE.md` line from step 7). If one exists, this run **tightens** it: the interview starts from the current allowlists and asks what comes off them.

Done when you know the tool and its version, the checker that will hold the fence, whether that checker can see types, whether a fence already exists, and how CI runs the checker.

## 2. Gather

Dispatch two subagents in parallel, each started with a fresh context window:

- **Community**: the tool's own docs warnings (React's "You Might Not Need an Effect", a library's "advanced" or "unsafe" sections), existing lint plugins and rule sets for it (including rules that ship disabled), known footguns, deprecated APIs, and migration guides.
- **Usage**: every import from the tool, and every property access and method call on the objects it hands out, with counts and file locations; and the import graph around it (which modules import the tool, which internal paths they reach into, and the edges between the project's own top-level folders). That is the surface the project already has in practice.

Done when the tool's objects are listed (the module plus each object it returns that the user cares about), and every member of each sits in one of three groups, **used**, **unused** or **flagged by the community**, each with its usage count, and the import edges into the tool are listed by importing folder.

## 3. Interview

Call the Skill tool with `grilling` and work the fence in rounds, one object or one module boundary per question. Each question proposes that object's or module's allowlist, with a recommendation:

- **Allowed**: the members agents may touch, for example "from `react`: `useState`, `useReducer`, `useContext`, `useRef`", "on a Prisma client: `findMany`, `findUnique`, `create`, `update`, `$transaction`" or "on `process`: nothing; read config through `config.ts`", or for an edge, "`ui/` may import `shared/` and `api-client/`, never `server/`".
- **Allowed in one place**: a member permitted only inside a named file or folder, for example "`useEffect` only in `src/sync/`", "`process.env` only in `src/config.ts`" or "`Date.now` only in `src/clock.ts`". This is a path-scoped override on the same rule. For a tool that only one folder should touch, the cleaner fence is an import edge: "only `src/db/**` may import `prisma`".
- **Banned pattern**: a one-off shape on an object that stays open, for example "`innerHTML` on any element" or "`useState` holding a value derived from props". Give each one a positive alternative in its message.

For each object, settle how it is identified: by **name** (`process`, `window`, `Date`) or by **type** (any `PrismaClient`, any `Request`, any array returned by a query). This picks the mechanism in step 4.

Recommend from the evidence: members the community flags start outside the surface, and members the codebase never uses start outside it at no cost. A member used hundreds of times can still come off the surface, because the ratchet carries the debt.

When tightening, ask only about members and edges still on an allowlist, and show each one's current count.

Done when every member in the three groups is inside or outside its object's surface, every importing folder has its allowed edges, every object is identified by name or by type, every banned pattern has its alternative, and the user confirms the fence.

## 4. Build the fence

Pick each entry's check from [CHECKERS.md](./CHECKERS.md), in the section for the project's language. Prefer the project's own checker, then the checker's own allowlist, then a type-aware check for any object identified by type. Use a graph tool for import edges, since per-file rules can't see the graph as a whole.

Where the checker only takes a denylist, generate it from the allowlist (every member of the object minus the allowed ones), and note in the config which allowlist it came from.

When the only check available is name-only but the object is identified by type, tell the user which aliases it will miss before writing the rule.

Every rule carries a message that names the alternative ("Read config through `config.ts`"; "`ui/` reaches the server through `api-client/`").

Each custom rule gets three fixtures: one that fails, one that passes, and one alias case that shows what the rule catches or misses. Run them with the checker's own rule tester where it has one.

Done when each decision from step 3 maps to exactly one rule entry (member or edge), and every name-only gap the user accepted is noted beside its rule.

## 5. Ratchet

The codebase will already break the fence. Record those violations as a committed **baseline** and let the **ratchet** pay them down. It ratchets on two axes, and both only move one way:

- **The baseline shrinks**: as code is touched, violations get fixed and the counts fall.
- **The fence tightens**: a later run of this skill takes members or edges off an allowlist and baselines the new violations.

Use the checker's own ratchet from [CHECKERS.md](./CHECKERS.md) where it has one. Otherwise, commit a **generic baseline script**: a baseline file of counts per rule and per file (for edges, per importer and imported module), plus a script that runs the checker and compares its counts against the file. Either way, the ratchet does three things:

- **Record**: write the baseline from the current violations.
- **Hold**: CI fails when any count rises, or when a violation appears in a file or rule the baseline doesn't list. New code is fenced from day one.
- **Shrink**: when a change lowers a count, the same change shrinks the baseline. A stale baseline fails CI, so a violation once fixed can't come back.

When tightening an existing fence, record a baseline only for the rules this run changed, and leave every other rule's baseline as it was.

Done when the checker passes on the current code with the baseline in place.

## 6. Verify

Prove the fence bites:

- In a fresh file, one of each kind goes red, and the output shows the message you wrote:
  - an import outside the allowlist;
  - a property access outside an object's allowlist;
  - a method call outside an object's allowlist;
  - an import edge outside a module's allowlist.
- An extra violation in a baselined file goes red.
- Fixing one baselined violation, then running the shrink step, shrinks the baseline. Skipping the shrink step goes red.
- Every fixture fails and passes as expected.

Revert the deliberate violations. Done when every check above was observed, not assumed.

## 7. Record

Add one line under `## Agent skills` in `CLAUDE.md` (or `AGENTS.md`) naming the fenced tool and the command that checks the fence, so an agent whose code goes red knows why. The rules are the source of truth: leave the surface itself out of the prose.
