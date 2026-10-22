# Ticket trackers

> Surveyed 2026-10, and not guaranteed to be up to date. Use it to get oriented, then research the current options yourself: products, prices, limits and betas change fast.

The ticket tracker is the factory's human interface. Each type below is a starting point: read what it is and when a factory picks it, then check the examples against the questions in [Researching further](#researching-further).

## The types

### 1. Git-host tracker

The tracker built into the git host, so tickets, branches and PRs share one product, one permission model and one identity. A factory picks it when it is small, the team already lives on the git host, or the repo is public. This is the "All on GitHub" design: the git host's CI fills the orchestrator slot with no glue. Labels are the dependable router, because statuses live on a separate board. Outside developers file where the code is; non-developers need an account, so a feedback button files through the API. Self-hosted git hosts carry their tracker with them.

- [GitHub Issues](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents): the default; assign-to-agent for Copilot, Claude and Codex.
- [GitLab Issues](https://about.gitlab.com/blog/how-to-use-a-work-item-created-trigger/): Duo Agent Platform flows triggered from work items.
- [Forgejo](https://forgejo.org/2026-10-release-v17-0/): self-hosted, Actions-compatible.

To verify: which assign-to-agent features are still in preview and which plans include them; whether a native agent reads later comments or only the ticket at assignment (as of 2026-10, Copilot reads it at assignment only).

### 2. Agent-native dev tracker

A standalone SaaS tracker for software teams that treats agents as first-class assignees, with an agent API and its own coding agent. A factory picks it when product, support or design staff schedule work, the team already lives there, or it wants polished triage and planning views. The "Linear tickets" design. Statuses and workflows are first-class, so "moved to Ready" is a clean trigger. Agents appear as app users a human delegates to, and runs can stream progress into the ticket. Native agents here are the deepest of any type, so one can partly fill the orchestrator and runner slots too.

- [Linear](https://linear.app/developers/agents): the most agent-shaped tracker.
- [Jira](https://support.atlassian.com/jira-software-cloud/docs/collaborate-on-work-items-with-ai-agents/): status-triggered agents; fits an org already on Atlassian.
- [Shortcut](https://www.shortcut.com/help/integrations/using-ai-agents): assign a story or mention an agent in a comment.
- [YouTrack](https://www.jetbrains.com/youtrack/): workflows-as-code; self-hosts.

To verify: agent API status (Linear's was a developer preview as of 2026-10); how native agent runs are metered and priced; agent seat cost; acknowledgement deadlines on agent webhooks; which plan unlocks customer-facing forms; self-hosted edition end-of-life dates.

### 3. Open-source dev tracker

A Linear-style tracker you can run on your own infrastructure, with a cloud edition beside it. A factory picks it when data stays in-house (air-gapped, regulated) or the user wants to read and patch the tracker's source while still buying it. Routing by states, labels and custom properties works much as in type 2; native agents are younger.

- [Plane](https://developers.plane.so/dev-tools/agents/overview): Linear-like; bot users per app; agents reply in comments.
- [Huly](https://github.com/hcengineering/huly-selfhost): all-in-one workspace with two-way GitHub sync; a heavy stack to operate.
- [OpenProject](https://www.openproject.org/): mature, classic project management.

To verify: agent feature status (Plane's was beta as of 2026-10); which edition carries guest roles and intake forms; licence; the self-hosted stack's operating cost.

### 4. General work tool

A work-management or docs tool whose database or task list doubles as the tracker. A factory picks it when it serves a non-engineering team already living there, or tickets are mostly content, ops or research rather than code. Forms are the strength: anyone with a link files a ticket. Routing is flexible database properties, so every factory invents its own schema. Developer context (diffs, PRs) sits a click away on the git host. SaaS only.

- [Notion](https://www.notion.com/help/custom-agents): database-as-tracker; agents fire on database changes.
- [Asana](https://asana.com/product/ai/ai-teammates): AI Teammates take assigned tasks.
- [ClickUp](https://clickup.com/brain/cloud-agents): Cloud Agents return a PR in the task thread.
- [Trello](https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/): boards and lists; webhooks plus Butler automation.

To verify: webhook latency and granularity (as of 2026-10, Notion batched content updates, arriving a minute or two late); which plan includes agents.

### 5. Repo-native tracker

Tickets stored as files in the repo (JSONL, Markdown), edited by agents through a CLI or MCP server and merged like code. A factory picks it when one developer drives agents locally and wants the plan in git, or as a run's working memory beside a real tracker. A push to the git host is the only trigger, so the orchestrator diffs files to find what changed. Identity is the git host's. Outside filing is a commit or PR, the weakest of any type, so a factory graduates to a git-host tracker once others file tickets.

- [Beads](https://github.com/steveyegge/beads): JSONL with dependency tracking, so a run picks the next unblocked ticket.
- [Backlog.md](https://github.com/MrLesk/Backlog.md): Markdown tasks with a Kanban view and MCP server.

### 6. Build-your-own

The factory's own app holds tickets in its own database, usually beside the orchestrator. The "Own tracker" design. A factory picks it when the tracker *is* the product (an internal platform, a customer-facing support factory) or no off-the-shelf model fits. Triggers become function calls; every trait in the questions below becomes code to write and maintain, which is why the skill favours buying. An [Airtable](https://airtable.com/developers/web/api/webhooks-overview) base with webhooks is a half-built middle.

## Researching further

Check each candidate against these questions. They decide the slot:

- **Triggers**: which ticket changes (created, labelled, status moved, assigned, commented, mentioned) emit a webhook or event the orchestrator can turn into a run? How fast and how granular?
- **Routing**: which labels, statuses or fields can a run read to know its kind (explore, implement, rework)?
- **Thread**: can a human answer an agent in comments, and does that reply trigger the next run?
- **Identity**: is there an API plus a bot identity, so runs act as themselves and humans tell agent from colleague? Does the bot cost a seat?
- **Native agents**: can a ticket be assigned to an agent directly? Which agents, on which plan, metered how? What does it read: the ticket at assignment, or the whole thread?
- **Outside filing**: how does a ticket source or customer create tickets: forms, email, chat, API? Which plan unlocks it?
- **Hosting**: SaaS only, or self-hosted, and under which licence?

Answers live in primary sources: the API and webhook reference (event lists, payloads, delivery and retry rules), the agent or app developer docs, the pricing page and plan comparison table, and the changelog or release notes. Prefer these over blog posts and comparison sites.

Stalest first: agent features and their preview or beta status, agent metering and credit prices, plan gating of agents and forms, rate limits, and acquisitions, shutdowns and end-of-life dates for self-hosted editions. Webhook event lists and routing models change slowly.

## Durable gotchas

Verify each still holds before relying on it:

- **GitHub's `GITHUB_TOKEN` trap**: changes made with the default `GITHUB_TOKEN` trigger no new workflow runs. A run that labels or comments on a ticket to trigger the next run acts through a GitHub App token.
- **Assignment-time context**: some native agents read the ticket only when assigned, so later context goes on the PR.
- **Agent webhooks expect a fast acknowledgement**: the orchestrator acknowledges at once and starts the run afterwards.
- **Batched webhooks in general work tools** arrive late; a factory needing prompt runs triggers on property changes or picks another type.
