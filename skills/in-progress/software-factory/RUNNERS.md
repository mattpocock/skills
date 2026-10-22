# Runners

> Surveyed 2026-10, and not guaranteed to be up to date. Use it to get oriented, then research the current options yourself: products, prices, limits and betas change fast.

A runner is **disposable**: every run starts on a fresh machine and leaves nothing behind. Five types fill the slot. They differ mostly in who owns the agent loop and who owns the machine:

| Type | Agent loop | Machine | Also fills |
| --- | --- | --- | --- |
| CI runner | yours, inside the CI job | CI vendor's, or yours | orchestrator, observability platform |
| MicroVM API | yours, in the orchestrator or on the runner | provider's | nothing |
| Bundled agent platform | vendor's | vendor's | part of orchestrator, observability platform |
| Bring-your-own worker | vendor's | yours | part of orchestrator, observability platform |
| Own VPS or containers | yours | yours | nothing |

Runner choice is per run: a cheap CI runner for review runs and a microVM for implementer runs is a normal design.

## CI runners

A fresh VM or pod per CI job, started by the git host's own workflow engine; the agent CLI is one step in the job. The orchestrator starts a run with a workflow trigger (issue, PR, schedule, manual dispatch), and a concurrency group keeps two runs off the same ticket. Hosted runners are disposable by construction; self-hosted runners get there through an ephemeral mode, one pod per job, deleted after. Cost is per minute.

**Pick it when** the git host is GitHub or GitLab and every trigger is a git host event or a clock: the workflow file is the orchestrator and the run page is the observability platform, so one product fills three slots.

Starting points:
- [GitHub Actions](https://docs.github.com/en/actions/reference/limits): the default for an all-GitHub factory; [pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing).
- [Claude Code GitHub Action](https://code.claude.com/docs/en/github-actions): Claude Code as a workflow step.
- [GitLab hosted runners](https://docs.gitlab.com/ci/runners/hosted_runners/linux/): an ephemeral VM per job.
- [Actions Runner Controller](https://docs.github.com/en/actions/concepts/runners/actions-runner-controller): self-hosted, one ephemeral pod per job on the user's Kubernetes.

## MicroVM APIs

An SDK call creates an isolated microVM (vendors say "sandbox") in about a second; the orchestrator execs commands into it, or starts an agent CLI inside it. Cost is per second of vCPU and RAM. The orchestrator creates one per run, kills it at the end, and sets a timeout as the backstop. Providers also sell persistence (pause/resume, snapshots, drives); a factory uses it as a cache, and keeps memory between runs in the ticket tracker, git host and orchestrator.

**Pick it when** the factory has its own orchestrator (a server, a queue) and wants many short-lived, parallel runs with no machines to manage. Compare on max run length, concurrency cap, and whether time spent waiting on the model is billed: as of 2026-10, Vercel bills only active CPU, so model-wait time is nearly free there.

Starting points: [E2B](https://e2b.dev/pricing), [Daytona](https://www.daytona.io/pricing), [Modal Sandboxes](https://modal.com/docs/guide/sandboxes), [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox/pricing).

## Bundled agent platforms

A hosted coding agent with its runner included: the vendor provisions a fresh VM or container per run, runs its own agent loop there, and pushes a branch or PR. Only the branch survives. Runs start from an @-mention or assignment in the git host or ticket tracker, a chat message, a schedule, or an HTTP call, so the platform fills much of the orchestrator; its transcript view fills the observability platform. Cost is folded into a seat or subscription, or charged per run.

**Pick it when** the user wants the fewest moving parts and is happy with that vendor's agent. Confirm its triggers cover the user's ticket tracker.

Starting points:
- [Claude Code cloud](https://code.claude.com/docs/en/claude-code-on-the-web), with [scheduled tasks](https://code.claude.com/docs/en/routines) for cron, API and GitHub event triggers.
- [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview): API-first; create a run against an environment and stream events.
- [Codex cloud](https://developers.openai.com/codex/cloud): a container per task.
- [Copilot coding agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent): assign an issue to Copilot; its runner is a GitHub Actions runner.

## Bring-your-own worker

The bundled platform keeps its agent loop and its queue of runs, but tool calls execute on a worker the user hosts. The worker polls the vendor outbound, claims a run, executes it, and exits: the same shape as a self-hosted CI runner. Disposability is the user's job: run the worker under Kubernetes or a microVM API so each run gets a fresh disk. Cost is the vendor's seat or usage plus the user's machines.

**Pick it when** the user wants a bundled agent but runs must reach a private network, keep data on the user's machines, or use custom hardware.

Starting points: [Claude Code self-hosted environments](https://code.claude.com/docs/en/self-hosted-environments), [Cursor self-hosted pool](https://cursor.com/docs/cloud-agent/self-hosted-pool), [Copilot coding agent on ARC](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment).

## Own VPS or containers

A machine the user rents or runs, with a fresh container (or machine) per run: the machine may live for months, the container lives for one run. Max run length is whatever deadline the orchestrator sets. Disposability comes from `docker run --rm`, a Kubernetes Job with `ttlSecondsAfterFinished: 0`, or a machine destroyed at the end; every cache sits on a path the next run treats as optional. Cost is flat monthly, or per second while running.

**Pick it when** runs are long, steady or heavy, cost per hour dominates, or a server already hosts the orchestrator.

Starting points: [Fly Machines](https://docs.fly.io/machines/overview) ([pricing](https://docs.fly.io/about/pricing)), [Hetzner Cloud](https://www.hetzner.com/cloud/) plus Docker, [Kubernetes Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/).

## Researching further

### The questions that decide the slot

Check each candidate against these, with the factory's runs in hand:

1. **How does the orchestrator start one?** A workflow trigger, an SDK call, an @-mention, an HTTP call, or a vendor queue that a worker claims. Does that fit the orchestrator the design already names?
2. **What is the max run length, and the concurrency cap?** Find both the default timeout and the ceiling, per plan tier, and what happens at the cap. Hold them against the design's longest run and busiest burst.
3. **What is the cost shape?** Per minute, per second of vCPU and RAM, active CPU only, per run, per seat, or flat monthly. Is time waiting on the model billed? Are model tokens inside the price or on top?
4. **How is disposability achieved?** Fresh by default, an ephemeral flag, or the orchestrator's own teardown. Which persistence features exist, and can the design keep them to caches?
5. **What can a run reach?** Private network access, outbound firewall or allowlist, how secrets reach the runner, and who else can read them.
6. **Which other slots does it fill?** Count the triggers it reads as orchestrator coverage, and its run page or transcript as observability platform coverage.

### Where the answers live

- The vendor's **limits or quotas page** and **pricing page**, over the landing page.
- The **SDK or API reference** for the create call: its timeout, lifecycle and network parameters.
- The **security or networking docs** for firewalls, allowlists and secret handling.
- The **changelog or release notes** for beta, preview and GA status, and for plan gating (Team, Enterprise).
- For CI runners, the git host's **billing docs**.

### What goes stale fastest

- **Prices and free allowances.** As of 2026-10, GitHub had announced a per-minute fee for self-hosted runners, then postponed it.
- **Beta, preview and early-access status**, and which plans unlock a feature. As of 2026-10, Claude Managed Agents and Claude Code self-hosted environments were both in beta.
- **Default timeouts and max run length** per tier.
- **Trigger integrations** on bundled platforms: which ticket trackers and chat tools start a run.
- **Startup times**, which are vendor claims; measure them if they matter.

The type traits above (who owns the loop, who owns the machine, which slots it fills) change slowly; trust them over any number here.
