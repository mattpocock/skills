# Grill Topics

For each topic below, provide a recommended answer based on gathered context, then ask the user to confirm, correct, or expand. No topic is silently accepted — every one must be surfaced even if the gathered context seems complete.

Cover one topic per exchange. Natural follow-ups within a topic are fine before moving on.

---

## 1. Problem Understanding

Restate the problem in your own words based on gathered context.

**Ask:**
- "Here's my understanding of the problem: [restatement]. Is that right, or am I missing something?"
- "Who experiences this problem most acutely?"

**Done when:** The user confirms the problem statement is accurate and complete.

## 2. Why Now

Understand what's driving the timeline and priority.

**Ask:**
- "What's driving the urgency on this? Is there a business event, a deadline, or a dependency?"
- "What happens if we don't do this in the current cycle?"

**Done when:** The timeline driver is documented — whether it's a hard deadline, a dependency, or a prioritization call.

## 3. Current State

Understand what exists today and what makes it painful, impossible, or inefficient.

**Ask:**
- "How does this work today? Walk me through the current flow."
- "Where does the current approach break down?"

**Done when:** The current state is documented clearly enough that someone unfamiliar could understand the pain.

## 4. Users & Roles

Identify every actor who touches this feature.

**Ask:**
- "Who interacts with this directly? (patients, physicians, advocates, admins, etc.)"
- "Are there users who should explicitly NOT see or access this?"

**Done when:** All affected roles are listed with their relationship to the feature.

## 5. Desired Outcome

Define what success looks like in concrete terms.

**Ask:**
- "When this ships and works perfectly, what's different? What can users do that they couldn't before?"
- "How will we know this is working? What metrics or signals matter?"

**Done when:** Success criteria are specific enough to verify.

## 6. Scope Boundaries

Draw the line between what's in and what's explicitly out.

**Ask:**
- "What's the smallest version of this that delivers value?"
- "What might someone reasonably expect this to include that we're choosing NOT to do?"

**Done when:** Both in-scope and out-of-scope are documented. Non-goals are scope shields, not negatives.

## 7. Initial Approach Ideas

Get the engineer's gut feeling on the technical direction.

**Ask:**
- "What's your instinct on how to solve this? High-level, not implementation details."
- "Are there existing patterns in the codebase that this is similar to?"

**Done when:** There's a rough direction documented, even if it needs validation via spikes.

## 8. Unknowns & Spikes

Surface what the engineer doesn't know yet and needs to investigate.

**Ask:**
- "What parts of this are you least sure about?"
- "Is there anything you need to spike on before you can commit to an approach?"

**Done when:** Each unknown has a homework item — what to investigate, what question it answers, and a rough timebox.

## 9. Dependencies

Identify other teams, systems, or in-flight work that affects this feature.

**Ask:**
- "Does this depend on any other team's work or any system you don't own?"
- "Is there anything in flight right now that could affect this?"

**Done when:** All external dependencies are documented with owners and status.

## 10. Phasing Context

Only surface this if the Linear project or tickets indicate this is part of a larger initiative.

**Ask:**
- "The Linear project mentions [larger initiative]. Where does this piece fit in the overall plan?"
- "What prior phases does this build on? What comes after?"

**Done when:** The relationship to the broader initiative is documented, or confirmed that this is standalone work.

---

## Known Limitations (for context gathering)

- **Google Docs:** No MCP tool available. If Google Docs links are found in Linear, ask the user to paste the content.
- **Slack private channels:** The agent may lack access. Attempt to fetch and report if access is denied.
- **Slack URL parsing:** Slack message URLs require parsing into channel + thread timestamp. Deeply nested threads may not resolve cleanly.
