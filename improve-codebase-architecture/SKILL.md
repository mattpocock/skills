---
name: improve-codebase-architecture
description: Explore a codebase to find opportunities for architectural improvement, focusing on making the codebase more testable by deepening shallow modules. Use when user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more AI-navigable.
---

# Improve Codebase Architecture

Explore a codebase like an AI would, surface architectural friction, discover opportunities for improving testability, and propose module-deepening refactors as GitHub issue RFCs.

A **deep module** (John Ousterhout, "A Philosophy of Software Design") has a small interface hiding a large implementation. Deep modules are more testable, more AI-navigable, and let you test at the boundary instead of inside.

## Process

### 1. Explore the codebase

Use the Agent tool with subagent_type=Explore to navigate the codebase naturally. Do NOT follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small files?
- Where are modules so shallow that the interface is nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called?
- Where do tightly-coupled modules create integration risk in the seams between them?
- Which parts of the codebase are untested, or hard to test?

The friction you encounter IS the signal.

### 2. Present candidates

Present a numbered list of deepening opportunities. Each candidate is a **problem area** — an isolated, bounded zone of architectural friction. Candidates are NOT solutions; identifying the interface or refactor strategy comes later, from the parallel sub-agents in Step 5.

For each candidate, show:

- **Cluster**: Which modules/concepts are involved
- **Why they're coupled**: Shared types, call patterns, co-ownership of a concept
- **Dependency category**: See [REFERENCE.md](REFERENCE.md) for the four categories
- **Test impact**: What existing tests would be replaced by boundary tests

Do NOT propose interfaces yet.

Ask the user: "Which of these would you like to explore? Select one or more and assign each a processing order number (e.g. '1, 3, 2' means process candidate 1 first, then 3, then 2). Selected candidates should each represent an isolated problem area — if two candidates overlap significantly, you may want to select only one or resolve the overlap before proceeding."

### 3. User selects candidates and assigns order

The user selects one or more candidates and specifies the order in which to process them. If only one candidate is selected, proceed directly to Step 4.

If multiple are selected, maintain a tracking table throughout the session — update it after each issue is created so it's always current:

| Order | Candidate | Issue # | URL |
|---|---|---|---|
| 1 | Candidate name | — | — |
| 2 | Candidate name | — | — |

Process each candidate in the specified order, completing Steps 4–7 fully for each before moving to the next. The user can stop the loop at any point — if they do, skip directly to Step 8 with whatever issues have been created so far. If only one issue was created in total, skip Step 8 entirely.

### 4. Frame the problem space (per candidate)

Before spawning sub-agents, write a user-facing explanation of the problem space for the current candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would need to rely on
- A rough illustrative code sketch to make the constraints concrete — this is not a proposal, just a way to ground the constraints

Show this to the user, then immediately proceed to Step 5. The user reads and thinks about the problem while the sub-agents work in parallel.

### 5. Design multiple interfaces (per candidate)

Spawn 3+ sub-agents in parallel using the Agent tool. Each must produce a **radically different** interface for the deepened module.

Prompt each sub-agent with a separate technical brief containing:
- File paths, coupling details, dependency category, what's being hidden
- A summary of interface decisions already made for earlier candidates in this session (if any), so designs avoid proposing changes to the same modules

This brief is independent of the user-facing explanation in Step 4. Give each agent a different design constraint:

- Agent 1: "Minimize the interface — aim for 1-3 entry points max"
- Agent 2: "Maximize flexibility — support many use cases and extension"
- Agent 3: "Optimize for the most common caller — make the default case trivial"
- Agent 4 (if applicable): "Design around the ports & adapters pattern for cross-boundary dependencies"

Each sub-agent outputs:

1. Interface signature (types, methods, params)
2. Usage example showing how callers use it
3. What complexity it hides internally
4. Dependency strategy (how deps are handled — see [REFERENCE.md](REFERENCE.md))
5. Trade-offs

Present designs sequentially, then compare them in prose.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated — the user wants a strong read, not just a menu.

### 6. User picks an interface (per candidate, or accepts recommendation)

### 7. Create GitHub issue (per candidate)

Create a refactor RFC as a GitHub issue using `gh issue create`. Use the template in [REFERENCE.md](REFERENCE.md). Do NOT ask the user to review before creating — just create it and share the URL.

Update the tracking table with the issue number and URL. If more candidates remain and the user wants to continue, return to Step 4 for the next one.

### 8. Isolation comparison

Once all selected candidates have issues created, fetch the full content of each using `gh issue view <number> --json title,body` — do not rely on session memory.

Then compare across all of them:

- List all issues (title + URL)
- Identify any overlapping responsibilities, shared modules, or coupling between the candidates — places where implementing one issue could conflict with or invalidate another
- Highlight specifically which issues (if any) need to be adjusted to ensure they remain properly isolated from each other

Do NOT edit the issues automatically. Surface the findings clearly and let the user decide whether to update any issues before implementation begins.
