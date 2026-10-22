# Observability platforms

> Surveyed 2026-10, and not guaranteed to be up to date. Use it to get oriented, then research the current options yourself: products, prices, limits and betas change fast.

Orientation for filling the observability platform slot, or deciding on a deliberate none. The types split by **what the human needs to see inside a run**: its log, its agent trace (each model call and tool call as a span), or that trace joined to the rest of the user's system. Self-hosted vs SaaS cuts across the last three types. When a run should act on what the platform sees, make the platform a ticket source: a monitor files the ticket, and a run reads it.

## How runners hook in

Every type receives data through one of five hooks. Name the hook alongside the product when filling the slot.

- **Harness OTel**: the agent harness exports OpenTelemetry itself. Claude Code and the Claude Agent SDK take `CLAUDE_CODE_ENABLE_TELEMETRY=1` plus `OTEL_*` variables, with prompts and tool output opt-in; Codex CLI takes an `[otel]` block in `config.toml`. ([Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/observability), [Claude Code](https://code.claude.com/docs/en/monitoring-usage), [Codex config](https://developers.openai.com/codex/config-advanced))
- **Platform push**: the model platform sends traces for you, as Claude Managed Agents do to an OTLP destination set in the Claude Console. ([Claude docs](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api))
- **SDK wrapper**: one call in the runner's code, such as LangSmith's `configure_claude_agent_sdk()`.
- **Hook plugin**: a Claude Code hook reads the session transcript at each Stop and ships it, as in Langfuse's Claude Code plugin.
- **Gateway**: the runner's model base URL points at a logging proxy. Zero runner code, and it sees model calls only: tool calls inside the harness stay invisible.

OpenTelemetry is the common wire: harness OTel and platform push land in any OTLP backend. The GenAI semantic conventions (`invoke_agent`, `chat`, `execute_tool` spans) are still settling, so expect span names to drift. ([OTel GenAI agent spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans))

## Type 1: None (the runner or orchestrator product shows enough)

**What it is**: the human reads each run where the runner or orchestrator already shows it: the CI run page, the sandbox dashboard, the agent's transcript saved as a run artifact. No hook to build, as self-hosted as the runner, and bundled with its cost.

**When a factory picks it**: few runs a day, one human watching, and the question is "did it fail, and what did it print?" Most factories start here, and grow out of it when they need search across runs, a token or cost rollup per run, or retention longer than the runner keeps.

**Starting points**: [GitHub Actions run logs](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization), [E2B sandbox logs and metrics](https://e2b.dev/docs), [Daytona sandbox telemetry](https://www.daytona.io/docs/en/observability/otel-collection/), [OpenAI Agents SDK traces](https://openai.github.io/openai-agents-python/tracing/). Sandbox products often forward the same data over OTLP, which is the path out to Type 2.

**Verify**: retention days per runner product; some sandboxes keep very little (Daytona: 3 days, as of 2026-10).

## Type 2: LLM and agent tracing platform

**What it is**: a backend built around the agent trace: each run as a tree of model calls and tool calls, with token cost, prompts and sessions, usually with evals and datasets on top.

**When a factory picks it**: the human asks "why did the agent do that?" across many runs; a retro run or a human compares runs; token spend needs a per-run rollup. Self-hosting an open-source one keeps transcripts in-house.

**Traits of the type**: takes harness OTel, an SDK wrapper or a hook plugin, often the platform push too. Billed by volume, and agent runs are span-heavy (one span per tool call), so budget per run rather than per request.

**Starting points**: [Langfuse](https://langfuse.com/pricing) and [Arize Phoenix](https://phoenix.arize.com) (open source, self-hostable), [LangSmith](https://www.langchain.com/pricing-langsmith), [Braintrust](https://www.braintrust.dev/pricing).

**Verify**: free-tier limits, the billing unit (trace, span, unit or GB; Braintrust moved to GB in 2026-03), which tier unlocks self-hosting, and current ownership.

## Type 3: General APM and logging backend

**What it is**: the user's existing observability stack (logs, metrics, distributed traces for every service), with an agent or LLM view added.

**When a factory picks it**: the team already pays for one; runs need joining to the app's own traces (the Agent SDK propagates `TRACEPARENT`, so a run nests inside its caller's trace); or a monitor ticket source already reads from it.

**Traits of the type**: harness OTel goes straight to the vendor's OTLP endpoint. Priced per GB, event or host, so a factory's volume is a rounding error on an existing bill and a surprise on a new one.

**Starting points**: [Datadog Agent Observability](https://www.datadoghq.com/product/llm-observability/), [Grafana Cloud](https://grafana.com/pricing/), [Honeycomb](https://www.honeycomb.io/pricing), [SigNoz](https://signoz.io/pricing/) (open source).

**Verify**: whether the agent view is GA or preview, which harnesses have a setup guide, and free-tier volumes.

## Type 4: LLM gateway with request logging

**What it is**: a proxy between the runner and the model provider that logs every request and response, with routing, keys, budgets and caching alongside.

**When a factory picks it**: the user wants per-run spend caps or one key vault for many runners, and logging comes with it; or the harness has no export of its own. It sees model calls only, so pair it with Type 2 or 3 for tool calls.

**Starting points**: [LiteLLM Proxy](https://docs.litellm.ai/docs/proxy/logging) (open source, forwards logs to Langfuse or OTel), [Portkey](https://portkey.ai/pricing).

**Verify**: per-request pricing on SaaS, and whether the product is still actively developed (Helicone went into maintenance mode after an acquisition, as of 2026-10).

## Researching further

Check each candidate against the questions that decide this slot:

1. **Does the runner or orchestrator already show enough?** Compare what the human needs (cross-run search, per-run cost, retention) with what the run page or sandbox dashboard gives. A yes here means a deliberate none.
2. **How does the agent harness export traces?** Find which of the five hooks the harness supports, then which the product accepts. Confirm tool calls arrive as spans, and whether prompts and tool output need an opt-in.
3. **Is it self-hostable?** Licence, which tier allows it, and what it runs on. Decisive when transcripts must stay in-house.
4. **What is the cost shape?** The billing unit, the free tier, and an estimate per run given one span per tool call, multiplied by runs per day.
5. **How long is retention?** Days kept on each tier, against how far back the human looks when a run goes wrong.

**Where the answers live**: the vendor's pricing page (units, tiers, retention); the vendor's integration doc for the specific harness; the harness's own monitoring docs (what it exports, which flags are beta); the OpenTelemetry GenAI semantic conventions; the product's repo for licence and release activity; the vendor's changelog or blog for ownership changes.

**What goes stale fastest**: free-tier limits and prices; beta and preview flags (Claude Code trace export, Console platform push, vendor agent views); ownership and maintenance status; billing units; retention days; GenAI span names.
