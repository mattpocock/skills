# An animatic for a pull request

The viewer is a reviewer who will read the diff after watching. The animatic is their way in: why the change exists, the shape of it, where to start reading, and what proves it works. It is a map of the diff, so leave the line-by-line to the diff itself.

## Gather

Read the PR (its title, body, author, files, base and head branches, and the issue it closes) the way the repo's issue-tracker doc (`docs/agents/issue-tracker.md`, "Read a PR") says. With no tracker doc, the user gives you the PR's branches and its description.

Save its diff as `pr.diff` in the work folder (SKILL.md step 3): with the tracker doc's diff command where it has one, or with plain git, which works on any host:

```
git fetch origin <base> <head>
git diff origin/<base>...origin/<head> > <work folder>/pr.diff
```

Code frames read `pr.diff` directly (`"diff": "pr.diff"`), so the hunks, the colours and the real line numbers come from the diff itself.

- **The why comes from the primary source**: the linked issue, the spec, or the PR body's own summary, in that order. The diff says what changed, never why.
- **The PR body is the voice.** Match how its author writes, and reuse their terms.
- **Read the diff for the files the story needs**, not all of it. A PR touching thirty files usually turns on two or three of them; `grep -n '^diff --git\|^@@' pr.diff` maps it.
- **Evidence comes from the PR as written**: the test run, the command output, the before-and-after the body already shows. Where the PR shows none, the animatic says so.

## The arc

Five chapters, in this order. Each is one idea, so each is about one Cut, with Reveals inside it.

1. **Title**: one `title` frame, the PR's number and a headline in plain words. It is also the poster: an inline player shows the first frame before anyone presses play.
2. **The problem**: what was wrong or missing before, shown on the screen where it hurt (the failing output, the config that could not express it, the diagram of the old flow).
3. **The shape**: one `diagram` or `list` of files that gains a piece per moment (`show`) until it shows the whole change. Close it on the reading order ("start with the workflow file, then the package json"), as a last Reveal of this screen that lights the files it names.
4. **The key change**: the one or two hunks the PR turns on, as `code` frames from `pr.diff`, each lit line read out.
5. **The proof, and the risk**: the evidence from the PR, then whether the change is easy to roll back. One screen, four moments at most: the risk is a Reveal on the proof screen, never a "merge danger" chapter of its own.

Those five are the whole arc. Anything else the PR body covers (what was left out, follow-up steps, a setup script, open questions) stays in the PR body, or takes one of chapter 5's four moments.

**Size.** Target 90 seconds unless the user names one: 8 to 14 moments, 4 to 5 Cuts. An animatic goes on every major PR, so it is short: the reviewer gets the map and reads the rest in the diff. A plan over 14 moments is over time: cut Reveals from chapter 4 first, then merge moments in chapter 5, and keep the voice at its own pace.

## Several PRs: a review

The user asks for a tour of several PRs ("the recent large PRs", "what landed this week"). The viewer wants the codebase's new shape, not each PR's review.

**Pick the PRs.** List the recently merged ones with plain git, where each merge or squash commit on the main branch is one PR: `git log --first-parent --shortstat --since='2 weeks ago' origin/<main>`. Take the most recent ones whose size fits the ask, and read each as in "Gather". Say which you took, and why, at hand-over.

**The arc**:

1. **Overview**: one screen naming every PR in the tour, one line each. It Reveals one PR at a time, then lights them all as the map of the video.
Save each PR's diff as `pr-<n>.diff` (for a merged one, `git diff <commit>^1 <commit>`).

2. **One chapter per PR**, in an order that builds (a PR another depends on goes first). Each chapter has three parts, each lit on its own frame:
   - the why
   - the key hunk, with real line numbers
   - the risk or the open edge
   
   Cut once into each chapter, and Reveal inside it.
3. **Reading order**: a closing screen that names the files to open first, across all the PRs, lit one at a time.

**Size.** Budget about 45 to 75 seconds per PR, plus about 30 for the overview and the close. With a target set, divide the time left after those 30 seconds by the PR count to get each chapter's budget. With too many PRs for the target, drop the smallest rather than thinning every chapter.

## Hand it over

The animatic goes on the PR as a comment with the MP4 attached, posted the way the tracker doc's "attach a file to a comment" says (SKILL.md step 6), with a one-line body: "A 90-second animatic of this PR: why, the shape, where to start reading."

- **When the user asks you to post it**, post it and give them the comment's link.
- **Otherwise**, give them the MP4's path, and the tracker doc's attach command filled in for this PR, ready to run.

The upload is how the MP4 reaches the PR; the PR's branch stays free of it. `build` warns past 10MB, the smallest common upload limit (GitHub's free plan).
