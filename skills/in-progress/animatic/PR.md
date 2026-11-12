# An animatic for a pull request

The viewer is a reviewer who will read the diff after watching. The animatic is their way in: why the change exists, the shape of it, where to start reading, and what proves it works. It is a map of the diff, so leave the line-by-line to the diff itself.

## Gather

```
gh pr view <n> --repo <owner/repo> --json title,body,author,files,additions,deletions,closingIssuesReferences
gh pr diff <n> --repo <owner/repo>
```

- **The why comes from the primary source**: the linked issue, the spec, or the PR body's own summary, in that order. The diff says what changed, never why.
- **The PR body is the voice.** Match how its author writes, and reuse their terms.
- **Read the diff for the files the story needs**, not all of it. A PR touching thirty files usually turns on two or three of them.
- **Evidence comes from the PR as written**: the test run, the command output, the before-and-after the body already shows. Never invent output. If the PR shows none, say so in the animatic rather than mocking a green test run.

## The arc

Five chapters, in this order. Each is one idea, so each is about one Cut, with Reveals inside it.

1. **Title**: one title card, the PR's number and a headline in plain words. It is also the poster: GitHub shows the first frame before anyone presses play.
2. **The problem**: what was wrong or missing before, shown on the screen where it hurt (the failing output, the config that could not express it, the diagram of the old flow).
3. **The shape**: one diagram or file tree that gains a piece per moment until it shows the whole change. Close it on the reading order ("start with the workflow file, then the package json"), as a last Reveal of this screen that lights the files it names.
4. **The key change**: the one or two hunks the PR turns on, in an editor frame with the diff colours (`.l.add`, `.l.del`), each lit line read out.
5. **The proof, and the risk**: the evidence from the PR, then whether the change is easy to roll back. One screen, four moments at most: the risk is a Reveal on the proof screen, never a "merge danger" chapter of its own.

Those five are the whole arc. Anything else the PR body covers (what was left out, follow-up steps, a setup script, open questions) stays in the PR body, or takes one of chapter 5's four moments.

**Size.** 60 to 150 seconds: 8 to 20 moments, 4 to 6 Cuts. A reviewer gives a PR video two minutes. Hold the plan to it before you write a frame: a plan over 20 moments is over time, so cut Reveals from chapter 4 first, then merge moments in chapter 5. Never speed up the lines to fit.

## Hand it over

GitHub plays an MP4 inline in a PR description or comment, but the `gh` CLI cannot upload one. Give the user the path, and tell them to drag the file into the PR description in the browser, where GitHub uploads it and leaves a link that renders as a player. The limit is 10MB on a free plan and 100MB on a paid one; `stitch` warns past 10MB. Never commit the MP4 to the PR's branch.
