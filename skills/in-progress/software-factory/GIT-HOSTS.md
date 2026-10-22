# Git hosts

> Surveyed 2026-10, and not guaranteed to be up to date. Use it to get oriented, then research the current options yourself: products, prices, limits and betas change fast.

## The types

### All-in-one platforms

The git host bundled with a ticket tracker, a CI system that serves as orchestrator, and hosted runners, all sharing one event stream and one permission model. One product fills git host, ticket tracker, orchestrator and runner, and its CI run pages often cover the observability platform too. Every PR, review, label and check event is both a webhook and a native trigger, so this type has the richest trigger catalogue.

**Pick it when** the factory starts small, the code already lives there, or the user wants one bill and one login. This is the "All on GitHub" design in [SKILL.md](SKILL.md). The vendors also ship their own agents, which either compete with the user's runs or slot in as one of them.

- [GitHub](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api): the default; Issues, Actions, Apps and the largest integration ecosystem.
- [GitLab](https://about.gitlab.com/pricing/): issues, merge requests, CI/CD and runners in one product, SaaS or self-managed.

### Suite git hosts

A git host sold as one module of a wider suite, where the ticket tracker is a sibling product (Jira, Azure Boards) joined by links and webhooks. Tracker events arrive on a second stream, so the orchestrator joins two event sources.

**Pick it when** the organisation already runs the suite and its humans live in Jira or Azure Boards. The factory inherits that tracker as its human interface.

- [Bitbucket Cloud](https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/): Atlassian's git host, paired with Jira and Bitbucket Pipelines.
- [Azure DevOps (Azure Repos)](https://learn.microsoft.com/en-us/azure/devops/integrate/concepts/rate-limits): Repos, Boards, Pipelines and Entra identities in one organisation, so it fills all four slots.
- [AWS CodeCommit](https://aws.amazon.com/blogs/devops/aws-codecommit-returns-to-general-availability/): a bare git host with IAM identities; pair it with an external tracker and CI.

### Self-hosted git hosts

A git host the user runs on their own infrastructure, often beside the orchestrator and runners on the same network. The operator sets the rate limits, so the ceiling is the hardware. The user owns upgrades, backups and uptime for every slot it fills.

**Pick it when** code must stay on-premises or air-gapped, the user wants zero per-seat cost, or a SaaS API budget throttles a busy factory. Forgejo and Gitea suit small teams and bundle issues plus GitHub-Actions-compatible CI; GitLab self-managed and GitHub Enterprise Server suit organisations and keep their Apps and service accounts.

- [Forgejo](https://forgejo.org/2026-10-release-v17-0/): community-governed, lightweight, with Forgejo Actions.
- [Gitea](https://about.gitea.com/): lightweight with Gitea Actions; also sold managed.
- [GitLab self-managed](https://about.gitlab.com/install/) and [GitHub Enterprise Server](https://docs.github.com/en/enterprise-server@latest): the full platforms on the user's own infrastructure.

### Review-first and decentralised git hosts

Git hosts whose review model departs from the branch-and-PR shape: per-commit patchsets with voted labels, or repositories federated across user-run nodes. Most factory tooling assumes PRs, so expect to build more of the glue. In Gerrit, an automated check run votes `Verified` from a bot account and a human votes `Code-Review`.

**Pick it when** the user's team already reviews this way, or values federation over ecosystem.

- [Gerrit](https://www.gerritcodereview.com/): patchset review with label votes; the Android and Chromium model.
- [Tangled](https://blog.tangled.org/ci/): git hosting on the AT Protocol with stacked PRs and its own CI runner.

### Agent-native git hosts

New git hosts built around agents as the main authors: high commit throughput, server-side reads in place of clones, and per-agent attribution. The whole type is early (as of 2026-10), so gates and rate limits may be unpublished: ask the vendor.

**Pick it when** the factory runs many concurrent runs against one large repository and clone time or API limits dominate. Pilot one on a mirror of a single repository, keeping GitHub as the fallback.

- [Cursor Origin](https://cursor.com/origin): from the Graphite team, with GitHub sync and signed PR, review and push webhooks.
- [GitLab next-gen SCM](https://about.gitlab.com/blog/gitlab-next-gen-scm/): rebuilt GitLab backend with clone-free agent APIs.

### Git storage for runs

Headless, API-first git repositories created by the thousand: branches, commits and diffs, with no PRs, reviews or gates. They fill half the slot, with short-lived per-repository tokens minted per run.

**Pick it when** runs need cheap per-run scratch repositories or forks (a fork per ticket, an agent's working state) and the PR still lands on a full git host from the types above.

- [Cloudflare Artifacts](https://www.cloudflare.com/product/artifacts/): git-compatible storage on Workers; fork a baseline per task.
- [Pierre code.storage](https://code.storage/docs): white-label git API with ephemeral branches.

## Researching further

Check each candidate against these questions:

1. **Triggers**: which events (PR opened, push, review submitted, label added, check finished) reach the orchestrator as webhooks, and are deliveries signed?
2. **Identity**: can a run act as a dedicated bot or app identity? That keeps runs attributable, lets an automated review run approve a PR another identity authored, and decides whether a run's own pushes trigger the next run.
3. **Gates**: are required checks, required approvals and branch protection available on the user's plan and repository visibility, and can a bot sit on a bypass list?
4. **Rate limits**: what API budget does every run on every runner share, per what unit (installation, token, user, workspace), and how does it scale?
5. **Slots filled**: which of ticket tracker, orchestrator, runner and observability platform does the same product cover?

Find the answers in primary sources: the REST API and webhook reference, the rate-limit page, the pricing and plan comparison page, the access-token or app docs, and the changelog or release notes.

The fastest to go stale: beta and preview status (the whole agent-native and git-storage types), rate-limit numbers, which plan unlocks gates, and availability after acquisitions, shutdowns and reopenings. As of 2026-10, for example, AWS CodeCommit had reopened to new customers and Bitbucket Data Center was sold only as a hybrid licence with Cloud.

## Durable gotchas

Verify each still holds before the design relies on it.

- **GitHub `GITHUB_TOKEN` ends chains.** Events caused by the built-in Actions token start no new workflow runs (except `workflow_dispatch` and `repository_dispatch`), so a run pushing with it silently stops the next run. Give runs a GitHub App identity from day one.
- **Gates often sit behind a paid plan.** As of 2026-10, GitHub rulesets on private repositories need Pro, Team or Enterprise, GitLab approval rules need Premium, and enforced Bitbucket merge checks need Premium.
- **Rate limits are per identity, and the bot's type changes them.** As of 2026-10, a GitHub App installation gets 5,000 requests/hour against 1,000 for `GITHUB_TOKEN`; Bitbucket user tokens stay at the base rate while access tokens scale; Azure DevOps raises a bot's budget with its access level.
- **Suite trackers mean two event streams.** The orchestrator joins git host and ticket tracker events itself.
