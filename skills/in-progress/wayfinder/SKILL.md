---
name: wayfinder
description: Chart a route through a foggy problem — turn a loose idea into a shared map of investigation tickets on your issue tracker, and resolve them one at a time until the way to the goal is clear.
disable-model-invocation: true
---

A loose idea has arrived — too big for one agent session, and wrapped in fog: the route from here to a plan isn't visible yet. This skill charts it as a **shared map** on the repo's issue tracker, then works its tickets one at a time. The map is domain-agnostic — engineering work, course content, whatever fits the shape.

## The Map

The map is a single issue on this repo's issue tracker, labelled `wayfinder:map` — the canonical artifact. Its tickets are child issues of the map.

The map is an **index**, not a store. It lists the decisions made and points at the tickets that hold their detail; a decision lives in exactly one place — its ticket — so the map never restates it, only gists it and links.

**Where the map, its child tickets, blocking, and frontier queries physically live is tracker-specific.** Consult `docs/agents/issue-tracker.md` (the "Wayfinding operations" section) for how *this* repo expresses them. If that doc is absent, default to the local-markdown tracker.

### The map body

The whole map at low resolution, loaded once per session. Open tickets are **not** listed — they are open child issues, found by query.

```markdown
## Notes
<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far
<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->
- [<closed ticket title>](<link>) — <one-line gist of the answer>

## Fog
<!-- see "Fog of war" for what belongs here -->
```

### Tickets

Each ticket is a **child issue** of the map; the tracker's issue id is its identity. Its body is the question, sized to one 100K token agent session:

```markdown
## Question
<the decision or investigation this ticket resolves>
```

Two label families:

- `wayfinder:<type>` — one of `research`, `prototype`, `grilling`, `task` (see [Ticket Types](#ticket-types)).
- `wayfinder:claimed` — a session sets this **first**, before any work, so concurrent sessions skip it.

Blocking uses the tracker's native semantics. A ticket is **unblocked** when every ticket blocking it is closed. The **frontier** is the open, unblocked, unclaimed children — the edge of the known.

The answer isn't part of the body — it's recorded on resolution (see [Work through the map](#work-through-the-map)). Assets created while resolving a ticket are linked from the issue, not pasted in.

## Ticket Types

- **Research**: Reading documentation, third-party APIs, or local resources like knowledge bases. Creates a markdown summary as a linked asset. Use when knowledge outside the current working directory is required.
- **Prototype**: Raise the fidelity of the discussion by making a cheap, rough, concrete artifact to react to — an outline, a rough take, a stub, or UI/logic code via the /prototype skill. Links the prototype as an asset. Use when "how should it look" or "how should it behave" is the key question.
- **Grilling**: Conversation with the agent. Uses the /grilling and /domain-modeling skills. Asks one question at a time. The default case.
- **Task**: Literal manual work that must be done before the discussion can move forward — nothing to decide, prototype, or research. Moving data, signing up for a service, provisioning access. The agent automates it where it can; otherwise it hands the human a precise checklist. Resolved when the work is done; the answer records what was done and any resulting facts (credentials location, new URLs, row counts) later tickets depend on.

## Fog of war

The map is _deliberately_ incomplete: don't chart what you can't yet see. Beyond the tickets lies fog — the dim view of decisions and investigations you can tell are coming but can't yet pin down, because they hang on questions still open. Resolving a ticket clears the fog ahead of it, graduating whatever's now specifiable into fresh tickets — one at a time, until the way to the goal is clear and no tickets remain.

The map's **Fog** section is where that dim view is written down: the suspected question, the area to revisit later, the risk you're deferring. Write as loosely or as fully as the view allows; it doubles as a signpost for collaborators reading where the effort is headed.

**Fog or ticket?** The test is whether you can state the question precisely now — _not_ whether you can answer it now.

- **Ticket when** the question is already sharp — even if it's blocked and you can't act on it yet.
- **Fog when** you can't yet phrase it that sharply. Don't pre-slice fog into ticket-sized pieces: it's coarser than a ticket, and one patch may graduate into several tickets, or none, once the frontier reaches it.

Fog excludes only what's already decided (that's Decisions so far) and what's already a ticket.

## Invocation

Two modes. Either way, **every session ends with a [Handoff](#handoff)** — never resolve more than one ticket per session.

### Chart the map

User invokes with a loose idea.

1. Run a `/grilling` and `/domain-modeling` session to surface the open decisions.
2. **Create the map** (label `wayfinder:map`): Notes filled in, Decisions-so-far empty, Fog sketched.
3. **Create the tickets you can specify now** as child issues of the map — then wire blocking edges in a **second pass** (issues need ids before they can reference each other). Wiring sorts them into the frontier and the blocked; everything you can't yet specify stays in the Fog.
4. Handoff. Charting the map is one session's work; do not also resolve tickets.

### Work through the map

User invokes with a map (URL or number). A ticket is **optional** — without one, you pick the next decision, not the user.

1. Load the **map** — the low-res view, not every ticket body.
2. Choose the ticket. If the user named one, use it. Otherwise take the first frontier ticket in order. **Claim it**: set `wayfinder:claimed` and save before any work.
3. Resolve it — **zoom as needed**: fetch the full body of any related or closed ticket on demand; invoke the skills the `## Notes` block names. If in doubt, use `/grilling` and `/domain-modeling`.
4. Record the resolution: post the answer as a **resolution comment**, **close** the issue, and **append a context pointer** to the map's Decisions-so-far.
5. Add newly-surfaced tickets (create-then-wire); graduate any fog the answer has made specifiable, clearing each graduated patch from the Fog so it lives only as its new ticket. If the decision invalidates other parts of the map, update or delete those tickets.
6. Handoff.

The user may run unblocked tickets in parallel, so expect other sessions to be editing the tracker concurrently.

## Handoff

End every session with a **Next steps** block the user can copy-paste. Two cases:

**Open tickets remain.** Query the map for the currently-unblocked children, then give two copy-paste options: a bare command for one session (you pick the next ticket), and one pinned command per unblocked ticket for running them in parallel. Paste one line per fresh window — opening one, some, or all of them.

> **Next steps** — 3 tickets unblocked. Clear the context, then open fresh sessions.
>
> **One session** — resolves the next unblocked ticket:
> ```
> Invoke /wayfinder with the map <map-url>.
> ```
>
> **Parallel** — paste one line per window, up to all 3:
> ```
> Invoke /wayfinder with the map <map-url>, ticket <issue-url>.
> Invoke /wayfinder with the map <map-url>, ticket <issue-url>.
> Invoke /wayfinder with the map <map-url>, ticket <issue-url>.
> ```

**No open tickets remain.** The fog is pushed back far enough that the way to the goal is clear — the map is done. (The initial grilling may also surface no fog at all, in which case there was never a map to chart.) Recommend implementing directly, or using `/to-prd` to schedule a multi-session implementation.
