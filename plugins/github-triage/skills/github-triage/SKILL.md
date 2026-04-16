---
name: github-triage
description: Triage GitHub issues through a label-based state machine with interactive grilling sessions. Use when user wants to triage issues, review incoming bugs or feature requests, prepare issues for an AFK agent, or manage issue workflow.
---

# GitHub Issue Triage

Triage issues in the current repo using a label-based state machine. Infer the repo from `git remote`. Use `gh` for all GitHub operations.

## Reference docs

- [AGENT-BRIEF.md](AGENT-BRIEF.md) — how to write durable agent briefs
- [OUT-OF-SCOPE.md](OUT-OF-SCOPE.md) — how the `.out-of-scope/` knowledge base works

## Labels

| Label             | Type     | Description                              |
| ----------------- | -------- | ---------------------------------------- |
| `bug`             | Category | Something is broken                      |
| `enhancement`     | Category | New feature or improvement               |
| `needs-triage`    | State    | Maintainer needs to evaluate this issue  |
| `needs-info`      | State    | Waiting on reporter for more information |
| `ready-for-agent` | State    | Fully specified, ready for AFK agent     |
| `ready-for-human` | State    | Requires human implementation            |
| `wontfix`         | State    | Will not be actioned                     |

Every issue should have exactly **one** state label and **one** category label. If an issue has conflicting state labels (e.g. both `needs-triage` and `ready-for-agent`), flag the conflict and ask the maintainer which state is correct before doing anything else. Provide a recommendation.

## State Machine

| Current State  | Can transition to | Who triggers it        | What happens                                                                                                         |
| -------------- | ----------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `unlabeled`    | `needs-triage`    | Skill (on first look)  | Issue needs maintainer evaluation. Skill applies label after presenting recommendation.                              |
| `unlabeled`    | `ready-for-agent` | Maintainer (via skill) | Issue is already well-specified and agent-suitable. Skill writes agent brief comment, applies label.                 |
| `unlabeled`    | `ready-for-human` | Maintainer (via skill) | Issue requires human implementation. Skill writes a brief comment summarizing the task, applies label.               |
| `unlabeled`    | `wontfix`         | Maintainer (via skill) | Issue is spam, duplicate, or out of scope. Skill closes with comment (and writes `.out-of-scope/` for enhancements). |
| `needs-triage` | `needs-info`      | Maintainer (via skill) | Issue is underspecified. Skill posts triage notes capturing progress so far + questions for reporter.                |
| `needs-triage` | `ready-for-agent` | Maintainer (via skill) | Grilling session complete, agent-suitable. Skill writes agent brief comment, applies label.                          |
| `needs-triage` | `ready-for-human` | Maintainer (via skill) | Grilling session complete, needs human. Skill writes a brief comment summarizing the task, applies label.            |
| `needs-triage` | `wontfix`         | Maintainer (via skill) | Maintainer decides not to action. Skill closes with comment (and writes `.out-of-scope/` for enhancements).          |
| `needs-info`   | `needs-triage`    | Skill (detects reply)  | Reporter has replied. Skill surfaces to maintainer for re-evaluation.                                                |

An issue can only move along these transitions. The maintainer can override any state directly (see Quick State Override below), but the skill should flag if the transition is unusual.

## Invocation

The maintainer invokes `/github-triage` then describes what they want in natural language. The skill interprets the request and takes the appropriate action.

Example requests:

- "Show me anything that needs my attention"
- "Let's look at #42"
- "Move #42 to ready-for-agent"
- "What's ready for agents to pick up?"
- "Are there any unlabeled issues?"

## Workflow: Show What Needs Attention

When the maintainer asks for an overview, query GitHub and present a summary grouped into three buckets:

1. **Unlabeled issues** — new, no labels at all. These have never been triaged.
2. **`needs-triage` issues** — maintainer needs to evaluate or continue evaluating.
3. **`needs-info` issues with new activity** — the reporter has commented since the last triage notes comment. Check comment timestamps to determine this.

Display counts per group. Within each group, show issues oldest first (longest-waiting gets attention first). For each issue, show: number, title, age, and a one-line summary of the issue body.

Let the maintainer pick which issue to dive into.

## Workflow: Triage a Specific Issue

### Step 1: Gather context

Before presenting anything to the maintainer:

- Read the full issue: body, all comments, all labels, who reported it, when
- If there are prior triage notes comments (from previous sessions), parse them to understand what has already been established
- Explore the codebase to build context — understand the domain, relevant interfaces, and existing behavior related to the issue
- Read `.out-of-scope/*.md` files and check if this issue matches or is similar to a previously rejected concept

### Step 2: Present a recommendation

Tell the maintainer:

- **Category recommendation:** bug or enhancement, with reasoning
- **State recommendation:** where this issue should go, with reasoning
- If it matches a prior out-of-scope rejection, surface that: "This is similar to `.out-of-scope/concept-name.md` — we rejected this before because X. Do you still feel the same way?"
- A brief summary of what you found in the codebase that's relevant

Then wait for the maintainer's direction. They may:

- Agree and ask you to apply labels → do it
- Want to flesh it out → start a grilling session
- Override with a different state → apply their choice
- Want to discuss → have a conversation

### Step 3: Bug reproduction (bugs only)

If the issue is categorized as a bug, attempt to reproduce it before starting a grilling session. This will vary by codebase, but do your best:

- Read the reporter's reproduction steps (if provided)
- Explore the codebase to understand the relevant code paths
- Try to reproduce the bug: run tests, execute commands, or trace the logic to confirm the reported behavior
- If reproduction succeeds, report what you found to the maintainer — include the specific behavior you observed and where in the code it originates
- If reproduction fails, report that too — the bug may be environment-specific, already fixed, or the report may be inaccurate
- If the report lacks enough detail to attempt reproduction, note that — this is a strong signal the issue should move to `needs-info`

The reproduction attempt informs the grilling session and the agent brief. A confirmed reproduction with a known code path makes for a much stronger brief.

### Step 4: Grilling session (if needed)

If the issue needs to be fleshed out before it's ready for an agent, interview the maintainer to build a complete specification. Follow the /grill-me pattern:

- Ask questions one at a time
- Provide a recommended answer for each question
- If a question can be answered by exploring the codebase, explore the codebase instead
- If there are prior triage notes on this issue, resume from where you left off — never re-ask questions that were already resolved
- For bugs: use the reproduction findings to ask targeted questions ("I confirmed this happens because X — should the fix be Y or Z?")

The goal is to reach a point where you can write a complete agent brief. Keep going until you have:

- A clear summary of the desired behavior
- Concrete acceptance criteria
- Key interfaces that may need to change
- A clear boundary of what's out of scope

### Step 5: Apply the outcome

Before posting any comment or applying any label, show the maintainer a **preview** of exactly what will be posted and which labels will be applied/removed. Only proceed on confirmation.

Depending on the outcome:

- **ready-for-agent** — post an agent brief comment (see [AGENT-BRIEF.md](AGENT-BRIEF.md))
- **ready-for-human** — post a comment summarizing the task, what was established during triage, and why it needs human implementation. Use the same structure as an agent brief but note the reason it can't be delegated to an agent (e.g. requires judgment calls, external system access, design decisions, or manual testing).
- **needs-info** — post triage notes with progress so far and questions for the reporter (see Needs Info Output below)
- **wontfix (bug)** — post a polite comment explaining why, then close the issue
- **wontfix (enhancement)** — write to `.out-of-scope/`, post a comment linking to it, then close the issue (see [OUT-OF-SCOPE.md](OUT-OF-SCOPE.md))
- **needs-triage** — apply the label. Optionally leave a comment if there's partial progress to capture.

## Workflow: Quick State Override

When the maintainer explicitly tells you to move an issue to a specific state (e.g. "move #42 to ready-for-agent"), trust their judgment and apply the label directly.

Still show a confirmation of what you're about to do: which labels will be added/removed, and whether you'll post a comment or close the issue. But skip the grilling session entirely.

If moving to `ready-for-agent` without a grilling session, ask the maintainer if they want to write a brief agent brief comment or skip it.

## Needs Info Output

When moving an issue to `needs-info`, post a comment that captures the grilling progress and tells the reporter what's needed:

```markdown
## Triage Notes

**What we've established so far:**

- point 1
- point 2

**What we still need from you (@reporter):**

- question 1
- question 2
```

Include everything resolved during the grilling session in "established so far" — this work should not be lost. The questions for the reporter should be specific and actionable, not vague ("please provide more info").

## Resuming Previous Sessions

When triaging an issue that already has triage notes from a previous session:

1. Read all comments to find prior triage notes
2. Parse what was already established
3. Check if the reporter has answered any outstanding questions
4. Present the maintainer with an updated picture: "Here's where we left off, and here's what the reporter has said since"
5. Continue the grilling from where it stopped — do not re-ask resolved questions
