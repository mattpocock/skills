[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs)

## What it does

`diagnosing-bugs` runs a disciplined diagnosis loop for hard bugs and performance regressions — building a repro, minimising it, ranking hypotheses, instrumenting, then fixing with a regression test.

It refuses to hypothesise before you have a **tight feedback loop** — one runnable command that already goes red on *this* bug. Reading code to build a theory before that command exists is the exact failure this skill prevents. No red-capable loop, no diagnosis.

## When to reach for it

Type `/diagnosing-bugs`, or the agent reaches for it automatically when a task fits — it fires on "diagnose" / "debug this", or when you report something broken, throwing, failing, or slow.

Reach for it on the hard ones: the bug that resists a first glance, the intermittent flake, the regression that crept in between two known-good states. For a quick throwaway to sanity-check a design question rather than chase a defect, use [prototype](https://aihero.dev/skills-prototype) instead.

## The tight loop is the skill

Everything else — bisection, hypothesis-testing, instrumentation — is mechanical once you have the signal. So the skill spends disproportionate effort on Phase 1: constructing a pass/fail command that drives the actual bug code path and asserts the user's exact symptom, then **tightening** it until it is fast, deterministic, and agent-runnable. A 30-second flaky loop is barely better than none; a 2-second deterministic one is a debugging superpower.

It gives you a ladder of ways to build that loop — failing test, curl script, CLI diff, headless browser, replayed trace, throwaway harness, fuzz loop, `git bisect run`, differential run — and, only as a last resort, a human-in-the-loop bash script. For non-deterministic bugs the goal isn't a clean repro but a **higher reproduction rate**: loop the trigger, parallelise, add stress until the flake is debuggable.

## It's working if

- It builds and runs a repro command *before* theorising — and pastes the invocation and its red output.
- The loop asserts the symptom you actually reported, not a nearby failure.
- Hypotheses arrive as a ranked, falsifiable list shown to you before any are tested.
- Debug instrumentation is tagged (`[DEBUG-...]`) and grepped away before it declares done.

## Where it fits

`diagnosing-bugs` is a reach-for-it-anytime standalone — you drop into it the moment something is broken, and drop out once the fix and its regression test are in. Its post-mortem hands off to [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) when the real finding is that there's no good seam to lock the bug down — the code, not the bug, is the problem. When you're unsure which skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
