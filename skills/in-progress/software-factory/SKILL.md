---
name: software-factory
description: Shared language for designing a software factory: the tasks it runs and the services it plugs into.
disable-model-invocation: true
---

A **software factory** is a system of agents that turns tickets, PRs and schedules into merged code, deployed on remote infrastructure the user chooses. This skill is the language for designing one. Use these terms, and only these, when discussing or whiteboarding a factory; when the user reaches for a word under _Avoid_, name the canonical term.

## Tasks and runs

**Task**:
A kind of work the factory performs, defined once and run many times: review, explore, implement, ratchet. A task may work on a ticket, a PR, or the codebase as a whole.
_Avoid_: job, workflow, action

**Trigger**:
The event that starts a run: a change in the ticket tracker or git host, a clock in the orchestrator, or another run.

**Run**:
One execution of a task on one runner, from its trigger to its finish, treated as a black box. A run triggers further runs either directly, through logic in the orchestrator, or by changing the ticket tracker or git host. A run never waits for a human: it ends, and the human's later change to the ticket tracker or git host triggers a new run.
_Avoid_: session

**Runner**:
The disposable machine a run executes on. Nothing on it survives the run, even when the machine itself is long-lived: a run's only memory of earlier runs is the ticket tracker, the git host and the orchestrator.
_Avoid_: server, host, box, compute, sandbox

## Services

**Ticket tracker**:
Where tickets live, and the factory's human interface: humans schedule work by filing tickets, talk to agents in their comments, and their changes to tickets trigger runs.
_Avoid_: issue tracker, ticket manager, project board

**Ticket source**:
Anything outside the factory that creates tickets in the ticket tracker: a feedback button, a monitor, an error tracker, an inbox.
_Avoid_: data source, trigger source, intake

**Git host**:
Where branches, PRs and reviews live.
_Avoid_: code host, forge, repo

**Orchestrator**:
The component that receives triggers, starts runs on runners, and records which runs are queued, in flight or finished.
_Avoid_: dispatcher, scheduler, control plane

**Observability platform**:
Where runners send logs, traces and status, so a human can see what happened inside each run. Optional: the product filling the runner or orchestrator slot often shows enough on its own. A run never decides on it until something writes it into the ticket tracker or git host.
_Avoid_: observability, logs, monitoring, dashboard

## Designing a factory

A design has two halves: the **services**, each a slot filled with a product, and the **tasks** whose runs move work through them.

Start from the user's problem, not the factory: untriaged tickets, PRs waiting for automated review, a stricter automated check to migrate to, bugs nobody reads. When the user names a problem or doesn't know what to build, read [EXAMPLE-TASKS.md](EXAMPLE-TASKS.md) for the tasks that solve common ones.

### Start slow

Every trigger is an accelerator. Accelerators without brakes make a slop cannon. There are three brakes:

- **Automated checks**: deterministic gates (types, lint, tests) that every run must pass.
- **Automated review**: a separate run that reads the diff cold against the codebase's standards and the ticket, when there is one.
- **Human review**: a human reads the PR before it merges; what it catches becomes new automated checks and sharper automated review.

Add one automated trigger at a time, throttled at first (one bug report in ten, a clock once a day), with human review on every PR. Open the throttle as the brakes earn trust, and cap every loop of runs at a few tries before a human.

### Fill every slot

Each service is a slot. One product can fill several slots, and one server can host several services. Three designs, side by side:

| Service                | All on GitHub                   | Linear tickets                 | Own tracker              |
| ---------------------- | ------------------------------- | ------------------------------ | ------------------------ |
| Ticket tracker         | GitHub Issues                   | Linear                         | own app                  |
| Ticket source          | feedback button                 | feedback button, monitor       | feedback button, monitor |
| Git host               | GitHub                          | GitHub                         | GitHub                   |
| Orchestrator           | GitHub Actions                  | own server + database          | own app                  |
| Runner                 | Actions runner                  | Actions, E2B, Daytona or a VPS | own app, or sandboxes    |
| Observability platform | none: Actions run pages suffice | an LLM tracing platform        | own app                  |

When the user is choosing a product for a slot, read that slot's survey to get oriented, then research the current options yourself; each survey groups the options by type and lists the questions that decide the slot:

- [TICKET-TRACKERS.md](TICKET-TRACKERS.md)
- [GIT-HOSTS.md](GIT-HOSTS.md)
- [RUNNERS.md](RUNNERS.md)
- [OBSERVABILITY-PLATFORMS.md](OBSERVABILITY-PLATFORMS.md)

Buy the services and build the tasks: the tasks carry the user's design, the services are generic. Favour an off-the-shelf ticket tracker: it is robust, people already know it, and outside users are easy to let in.

### Question every task

For each task, answer:

1. What triggers it?
2. What does it do, and which services does it read and write?
3. What does it trigger next?
4. Where does a human re-enter?
5. What stops two runs doing the same work?

For each ticket source, answer: what stops it filing the same ticket twice?

A design is finished when every slot names a product (or, for the observability platform, a deliberate none) and every task and ticket source has an answer to every question.
