Quickstart:

```bash
npx skills add mattpocock/skills --skill=tdd
```

```bash
npx skills update tdd
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd)

## What it does

`tdd` builds a feature or fixes a bug test-first, one behaviour at a time, driving the code out through a red-green loop.

It will **not** write all the tests up front. Batching the tests first ("horizontal slicing") produces tests of _imagined_ behaviour — they check the shape of things and go numb to real changes. `tdd` instead takes vertical slices: one test, then just enough code to pass it, then the next test, each cycle informed by what the last one taught you. Tests target public interfaces only, so the implementation underneath can change without the tests moving.

## When to reach for it

Type `/tdd`, or the agent reaches for it automatically when a task fits — building a feature or fixing a bug test-first, or when you say "red-green-refactor".

Reach for it when there's a concrete behaviour to build and you want tests that survive a refactor. If the behaviour isn't pinned down yet, settle the spec first — for that, use [to-spec](https://aihero.dev/skills-to-spec). When the work is really about the shape of the interface rather than the tests, use [codebase-design](https://aihero.dev/skills-codebase-design); `tdd` calls into it for the deep-module vocabulary during planning.

## Red-green, one slice at a time

The leading idea is the **red-green loop**: write one failing test (red), add just enough code to pass it (green), then repeat for the next behaviour — each cycle informed by what the last one taught you. The very first cycle is a **tracer bullet**: one test that proves a single path works end-to-end, before you build outward from it. Because you just wrote the code, you know exactly which behaviour matters and how to verify it — you never outrun your headlights by committing to test structure you don't yet understand.

Two rules keep the tests honest. A good test reads like a specification ("user can checkout with valid cart") and exercises real code paths through the public API, so renaming an internal function never breaks it. And expected values come from an independent source of truth — a known-good literal, a worked example, the spec — never recomputed the way the code computes them, which is how a **tautological** test passes by construction and tells you nothing.

Refactoring only happens once the suite is green; never while red.

## It's working if

- It writes one test, gets it passing, and only then writes the next — not a batch of tests followed by a batch of code.
- The tests name behaviours, not internals, and would survive an internal rename.
- Expected values are literals from the spec, not figures derived the same way the code derives them.

## Where it fits

`tdd` is the red-green loop the main build chain runs to write code:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

[implement](https://aihero.dev/skills-implement) is the chain's build step, and it drives `tdd` internally to build each ticket test-first before handing off to [code-review](https://aihero.dev/skills-code-review) — so `tdd` is the engine inside that step rather than a step of its own. You can also reach for it directly, whenever there's a concrete behaviour to build without a full spec. Its other neighbour is [codebase-design](https://aihero.dev/skills-codebase-design), which it leans on to find deep-module seams worth testing at. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
