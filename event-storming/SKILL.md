---
name: event-storming
description: Guide a structured event storming session to capture domain events, commands, aggregates, and bounded contexts, then produce a local event-storming.md artefact. Use when user wants to run an event storming session, capture domain knowledge, model a business process, or kick off a new feature discovery.
---

# Event Storming

Facilitate a collaborative domain modelling session. The output is `event-storming.md` — a structured artefact used as context for subsequent skills (`grill-me`, `write-a-prd`, `ubiquitous-language`).

## Process

### 1. Set the scope

Ask: "What business process or domain area are we modelling?" and "What is the starting trigger and ending outcome?"

### 2. Discover Domain Events

Ask the user to brainstorm **Domain Events** — things that happened in the past (orange stickies). Probe until the timeline feels complete:

- "What happens first? What happens next?"
- "What can go wrong? What are the alternative paths?"
- "What triggers a notification, a state change, a side effect?"

List them in chronological order.

### 3. Add Commands

For each Domain Event, ask: "What user action or system command caused this event?" (blue stickies)

Format: `Command → Domain Event`

### 4. Identify Aggregates

Group commands + events around the entities that own them (yellow stickies):

- "Who is responsible for handling this command?"
- "What data must be consistent together?"

### 5. Draw Bounded Context boundaries

Look for natural seams in the aggregate map:

- Where does the language change? Where does ownership change?
- "Would Team A and Team B use different words for this concept?"

Name each Bounded Context.

### 6. Surface Policies and Read Models

- **Policies** (lilac): "Whenever [event], then [command]" — automation rules between contexts
- **Read Models** (green): What information does an actor need to decide which command to issue?

### 7. Write `event-storming.md`

Produce the artefact at the root of the repo (or in a `docs/` folder if it exists):

<artefact-template>

# Event Storming — [Domain / Feature Name]

## Bounded Contexts

| Context | Aggregates | Owning Team |
|---------|-----------|-------------|
| ...     | ...        | ...         |

## Event Timeline

### [Bounded Context Name]

| Command | Domain Event | Aggregate | Policy / Read Model |
|---------|-------------|-----------|---------------------|
| ...     | ...          | ...       | ...                 |

## Alternative Paths & Edge Cases

- [Describe failure modes, timeouts, compensating events]

## Open Questions

- [ ] [Unresolved decisions surfaced during the session]

</artefact-template>

After writing the file, print its path and say: "Ready to feed this into `grill-me` or `write-a-prd`."
