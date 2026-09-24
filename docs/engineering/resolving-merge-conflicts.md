> **Archived.** This skill was removed from the plugin in v1.3.0 and is no longer maintained. Nothing replaces it: the agent works through a merge or rebase conflict without a dedicated skill. The page stays up for reference.

## What it does

`resolving-merge-conflicts` works through an in-progress git merge or rebase, hunk by hunk, then runs the project's own checks and finishes the operation with a commit.

It refuses to treat a conflict as a text problem. Before touching a hunk it traces each side back to its **[primary source](https://www.aihero.dev/ai-coding-dictionary/primary-source)** (the commit message, the PR, the original issue), so it is choosing between two intents rather than between two blocks of text, and it preserves both wherever they are compatible. Where they genuinely are not, it picks the side matching the merge's stated goal and names the trade-off. It invents no new behaviour to paper over a clash, and `--abort` is not an option it has: the merge is always carried to a finished commit.

## When to reach for it

Type `/resolving-merge-conflicts`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

Reach for it when git has already stopped on conflicts it could not resolve itself. It is scoped to the conflict in front of you, not to anything either side of it:

| Your situation | Skill |
| --- | --- |
| Mid-merge or mid-rebase, conflict markers in the tree | This one |
| Merge finished, something now misbehaves for reasons you can't see | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |
| Planning how to slice work so branches collide less | Neither: see the parallel-work question below |

## Primary sources over `ours` and `theirs`

The failure mode this exists to kill is resolving by flag: `--ours`, `--theirs`, or hand-deleting whichever block looks less important, so the markers go away and the build compiles. That resolution can be syntactically perfect and still silently drop a change somebody made on purpose.

You cannot preserve an intent you have not read. So the work starts in the history (commits, PRs, [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket)) and only then moves to the diff. Another step in the loop exists for the same reason: the skill finds the repo's own [automated checks](https://www.aihero.dev/ai-coding-dictionary/automated-check) and runs them before committing, because a merge is the easiest place in git to produce code that satisfies both branches and passes neither's tests.

## Common questions

**Claude Code already resolves conflicts pretty well on its own. Why does this need a skill?**

The added value is the "find the primary sources" and "run feedback loops" steps, which otherwise have to be prompted by hand every time. An unprompted agent will usually produce a plausible resolution from the diff alone and stop there. The skill's value is the two steps it will not let the agent skip: reading why each side exists, and running the checks afterwards. That is a thin margin over a good [model](https://www.aihero.dev/ai-coding-dictionary/model), and it is meant to be: at least one reader has predicted this is a whole skill that becomes a no-op as models improve.

**Should I keep parallel agents off the same files to avoid conflicts in the first place?**

Mostly no. Zoning files off between parallel tasks costs more than it saves, because agents are good enough at merge conflicts that the tradeoff is not as harsh as it looks. The one piece of discipline worth keeping is to do large refactors first. A large rename landing after ten branches have forked off it is the case that stays expensive.

One caveat from a user report on parallel worktrees: when sibling [sessions](https://www.aihero.dev/ai-coding-dictionary/session) each build a ticket in their own tree, the merge back is best done by the session that wrote the change, because it is the one that already knows the intent. Batching everybody's conflicts onto one agent at the end throws away exactly the [context](https://www.aihero.dev/ai-coding-dictionary/context) step 2 of this skill has to go and reconstruct.

**Why never `--abort`?**

Aborting throws away the resolution work and returns you to the same conflict, unchanged, the next time you try. The skill is written for the case where the merge is going to happen. If you have decided it should not happen, that is a decision to make before invoking, not a branch inside the loop.

## It's working if

- The agent quotes commit messages, PRs or issues at you while resolving, not just diff hunks.
- Every hunk ends up with both sides' behaviour, or with an explicit note naming what was dropped and why.
- Nothing appears in the result that was on neither branch.
- Typecheck, tests and format were located and run green *before* the commit, not after you noticed something broken.
- You end on a clean tree with the operation completed, including every remaining commit in a multi-commit rebase.

## Where it fits

A reach-for-it-anytime standalone with no dependencies on any other skill: it starts when git stalls and ends when the tree is clean and committed. Its only real neighbour is [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs), which takes over at the point where a merge resolved cleanly but the merged code misbehaves: a diagnosis problem, not a conflict one. It sits off the main idea-to-ship flow entirely, so [ask-matt](https://aihero.dev/skills-ask-matt) is the map for what runs before and after it.
