## What it does

`codebase-design` fixes the words you use to design a module: **module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**. It defines each one precisely, bans the loose substitutes ("component", "service", "API", "boundary"), and states the handful of principles that follow from them.

It is a reference, not a process. There is no loop to run, no artifact it produces, no checkpoint where it asks you a question. Every other skill that touches design borrows its vocabulary; on its own it gives you the language and stops. That is the thing to know before you invoke it, because a skill with no process and no stopping rule will improvise one if you point a [session](https://www.aihero.dev/ai-coding-dictionary/session) at it and say "go" — see the questions below.

## When to reach for it

Type `/codebase-design`, or the agent reaches for it automatically when a design task fits.

Reach for it when you already know which code you're redesigning and you need to think about its shape: where the seam goes, how small the interface can get, whether an extraction is earning its keep. It is also what you reach for to settle an argument about what a word means.

Several skills sit close to it. Which one you want depends on what the actual problem is:

| The problem | The skill |
|---|---|
| The shape of one module — its interface, its seam, its depth | `codebase-design` |
| The *words of the domain* — "account" means three things, two people mean different things by "cancellation" | [domain-modeling](https://aihero.dev/skills-domain-modeling) |
| You don't yet know *which* module to redesign | [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) — the survey that finds candidates |
| You want the design argued with, not just named | [grilling](https://aihero.dev/skills-grilling) |
| There's a concrete behaviour to build and you want tests that survive a refactor | [tdd](https://aihero.dev/skills-tdd) |

## The vocabulary

The glossary is the skill. Every term is defined against the others, and each one comes with the word it replaces.

| Term | What it means | Don't say |
|---|---|---|
| **Module** | Anything with an interface and an implementation. Deliberately scale-agnostic — a function, a class, a package, a slice spanning tiers. | unit, component, service |
| **Interface** | Everything a caller must know to use it correctly: the type signature, plus invariants, ordering constraints, error modes, required config, performance characteristics. | API, signature |
| **Depth** | Leverage at the interface — how much behaviour a caller or a test can exercise per unit of interface they have to learn. **Deep**: a lot of behaviour behind a small interface. **Shallow**: the interface is nearly as complex as the implementation. | — |
| **Seam** | Michael Feathers' term: a place you can alter behaviour without editing in that place. It is the *location* of an interface, and where to put it is its own decision, separate from what goes behind it. | boundary |
| **Adapter** | A concrete thing satisfying an interface at a seam. Names a role, not a substance — an in-memory fake and a Postgres repo are both adapters. | — |
| **Leverage** | What callers get from depth: more capability per unit of interface learned. | — |
| **Locality** | What maintainers get from depth: change, bugs and verification concentrate in one place. Fix once, fixed everywhere. | — |

Depth is deliberately *not* defined as the ratio of implementation lines to interface lines, which is Ousterhout's own definition. That metric rewards padding the implementation. Depth-as-leverage is used instead.

## The four principles

- **Depth is a property of the interface, not the implementation.** A deep module can be built internally from small swappable parts. They just don't surface to callers. A module can have internal seams its own tests use, and one external seam at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If it reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If you want to test *past* the interface, the module is the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't cut a seam until something actually varies across it. A single-adapter seam is just indirection.

Two supporting files go further, and the skill reads them on demand rather than up front. [DEEPENING.md](https://github.com/mattpocock/skills/blob/main/skills/codebase-design/DEEPENING.md) classifies a candidate's dependencies — in-process, local-substitutable, remote-but-owned, true-external — because the category decides how the deepened module gets tested across its seam. [DESIGN-IT-TWICE.md](https://github.com/mattpocock/skills/blob/main/skills/codebase-design/DESIGN-IT-TWICE.md) spins up parallel [sub-agents](https://www.aihero.dev/ai-coding-dictionary/subagent) to produce three or more radically different interfaces for the same module, then compares them on depth, locality and seam placement.

## Common questions

**How do I actually build a deep module in TypeScript?**

This is the most-asked question about the skill and the skill does not answer it. It defines what a deep module *is*; it says nothing about how to stop a stray import from reaching past the interface. [Issue #458](https://github.com/mattpocock/skills/issues/458) put it plainly: "let's say we're happy with the interface, it hides the details, etc. But how do we enforce it? I think without linting or clear guardrails, humans and LLMs alike will start making it messy over time." Matt's answer, in that thread, was three options: wrap it in a class or IIFE and accept that the class gets enormous; make it a package in a monorepo and accept the monorepo tooling; or use a linter like [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) to forbid imports that bypass the interface. He has separately called Effect the best mechanism and dependency-cruiser the second-best. There is a `setup-ts-deep-modules` skill in the repo's `drafts/` folder that lays down a `src/packages/<name>/index.ts` convention, but it is a beta-channel skill with no docs page, and it has no lint rule shipped with it.

**I pointed a session at it and it burned 100k [tokens](https://www.aihero.dev/ai-coding-dictionary/token) redesigning things I never asked about.**

Known, and filed as [issue #449](https://github.com/mattpocock/skills/issues/449). The skill is model-invoked and describes itself as vocabulary, but nothing in it hard-stops an agent from treating it as a runnable process. Told to "resume in /codebase-design and drive the open decisions", an agent reached for the most action-shaped content it could find — the parallel sub-agents in `DESIGN-IT-TWICE.md` — re-explored code a previous session had already mapped, and ran a long way before asking anything. None of the guardrails a driver skill has (checkpoints, one question at a time, no auto-advance) are present here, because a reference has none. The workaround is to name a driver skill and let this one sit underneath it: `/grill-with-docs`, `/improve-codebase-architecture` or `/tdd` with `codebase-design` as the vocabulary. The issue is open.

**Where did `design-an-interface` go? And is there an `/interface-design` skill?**

`design-an-interface` was removed and absorbed into this skill. Nothing was lost: its "design it twice" technique — parallel sub-agents generating radically different designs, from Ousterhout — ships here as `DESIGN-IT-TWICE.md`. Separately, several people have asked for a dedicated `/interface-design` skill for the deep-module/thin-interface philosophy; that philosophy already lives here, and no separate skill is planned. If you came looking for either name, this is the page.

**Isn't this a file-structure convention — folders, barrel files, feature slices?**

No, and the skill has held that line under repeated pushback. [Issue #95](https://github.com/mattpocock/skills/issues/95) proposed a formalised fractal-tree file structure as the concrete implementation of deep modules; the reply was that the two are orthogonal — "deep modules are about the design of the interface and accessing through a strict interface, no matter what the file system looks like. It seems perfectly possible that you could have shallow modules with this approach." The same came up in #458: "I think you might be tying the concept of modules too closely to the file system. The file system can certainly be a useful hint to the shape of modules, but there's no need to use the file system in the construction of deep modules." The glossary defines **module** as scale-agnostic on purpose.

**Does `tdd` actually use this vocabulary?**

It does now. For a long time it did not. The inline deep-module notes that used to live inside `tdd` were removed in v1.0 in favour of this shared skill, but the pointer replacing them was never added — so `tdd` defined "seam" for itself and referenced nothing. The gap is closed: the pointer is now in the skill, reached when the shape of the interface is the open question rather than the tests. `tdd` still owns "seam" as the boundary you *test* at; this skill owns the module shape behind it.

**Does the design-it-twice pattern work outside Claude Code?**

Not cleanly. `DESIGN-IT-TWICE.md` says "spawn 3+ sub-agents in parallel using the Agent tool", which is Claude Code's [tool](https://www.aihero.dev/ai-coding-dictionary/tool) by Claude Code's name. The repo ships metadata for other [harnesses](https://www.aihero.dev/ai-coding-dictionary/harness), including Codex, and those may expose nothing under that name — so the parallel-design phase is less portable than the skill's metadata suggests. Tracked in [issue #564](https://github.com/mattpocock/skills/issues/564), open.

**Can I add my own concepts to the glossary — connascence, module secrets, [progressive disclosure](https://www.aihero.dev/ai-coding-dictionary/progressive-disclosure)?**

People have proposed exactly those. [Issue #180](https://github.com/mattpocock/skills/issues/180) adds Parnas's module secrets and Page-Jones's connascence as a naming layer for *what* is leaking across a seam, with a working diff attached; [issue #303](https://github.com/mattpocock/skills/issues/303) proposes progressive disclosure inside the implementation, so a module that is deep at its public interface isn't one undifferentiated slab underneath. Both are open and unmerged. The glossary as shipped is deliberately small, and the reason it stays small is stated in the skill itself: consistent language is the whole point, and a term nobody uses consistently is worse than no term.

## It's working if

- The design conversation stops producing the words "component", "service" and "boundary", and starts producing "module", "interface" and "seam".
- Someone can point at a proposed extraction and say whether it passes the deletion test, without hedging.
- A proposed seam comes with a second adapter named, not just the first one.
- Discussion of an interface covers invariants, ordering and error modes — not only the type signature.
- Invoking it does not start a session. If the agent begins reading files and proposing refactors off the back of `/codebase-design` alone, it has mistaken the reference for a driver.

## Where it fits

`codebase-design` is a **reach-for-it-anytime standalone**, and the vocabulary layer underneath the engineering skills rather than a step in any chain. Its closest neighbour is [domain-modeling](https://aihero.dev/skills-domain-modeling), the parallel reference for the *problem domain*'s words rather than the module's shape — the two are usually wanted together, since naming a deep module well needs both. [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) is the other: it surveys a codebase for deepening candidates and writes every one of them in this glossary, so it finds the module and this skill is the bench you design it on. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
