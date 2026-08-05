[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture)

## What it does

`improve-codebase-architecture` scans a codebase for **deepening opportunities** — places where a shallow module (an interface nearly as complex as the thing it hides) could become a deep one — presents them as a self-contained visual HTML report, then grills through whichever one you pick.

It does **not** hand you a flat list of refactors. Every candidate has to pass the **deletion test** — would removing this module *concentrate* complexity behind a smaller interface, or just move it around? Only the "concentrates" cases earn a card. That filter is what stops the report from becoming generic cleanup advice.

Unless you point it at a specific area, it also scopes itself to where development is actually landing — reading the recent commits to bias toward the code you're still changing. Deepening a module pays off by making future changes to it easier, so it puts extra weight on the parts of the repo that have recently changed.

## When to reach for it

You invoke this by typing `/improve-codebase-architecture` — the agent won't reach for it on its own.

Reach for it as a periodic health check: every few days, or whenever a codebase has started to feel like it takes too much bouncing between small modules to understand one concept. It reads the existing architecture and proposes where to deepen it. If you already know the module you want to redesign and just need the vocabulary to think it through, use [codebase-design](https://aihero.dev/skills-codebase-design) instead — this skill is the survey that finds the candidates; that one is the design bench.

## Deepening opportunities

The whole skill turns on one idea: **depth**. A deep module hides a lot of functionality behind a small, stable interface; a shallow one leaks its implementation through an interface almost as wide as the code beneath it. The report hunts for shallowness — pure functions extracted only for testability while the real bugs hide in how they're called (no **locality**), modules that leak across their **seams**, concepts you can't understand without opening five files — and proposes the deepening that would fix it.

It speaks in the shared design vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and in your project's own domain language from `CONTEXT.md`, so a candidate reads as "deepen the Order intake module," never "refactor the FooBarHandler."

## The report, then the grill

The output is a browser-ready HTML file written to your OS temp directory — nothing lands in the repo. Each candidate is a card with the files involved, the friction, a plain-English solution, the benefit in terms of locality and leverage, a before/after diagram, and a `Strong` / `Worth exploring` / `Speculative` badge. It closes with the one it would tackle first.

Then it stops and asks which one you want to explore. Pick one and it runs the [grilling](https://aihero.dev/skills-grilling) loop over that design — constraints, what sits behind the seam, which tests survive — updating the domain model inline as decisions crystallise.

## Where it fits

`improve-codebase-architecture` is **periodic maintenance** — run it every few days, not as a step in a chain. Its neighbours are [codebase-design](https://aihero.dev/skills-codebase-design), which owns the depth-and-seam vocabulary every candidate is written in, [grilling](https://aihero.dev/skills-grilling), which walks the decision tree once you've chosen a candidate, and [domain-modeling](https://aihero.dev/skills-domain-modeling), which keeps `CONTEXT.md` and the ADRs current as the redesign settles. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
