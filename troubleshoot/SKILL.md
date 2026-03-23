---
name: troubleshoot
description: Research and resolve operational issues (deploy failures, install errors, infra problems) by searching Slack, Notion, Linear, docs, and other connected sources for prior solutions. Use when user says "troubleshoot", "help me fix", "this is broken", pastes CLI error output, or needs help diagnosing a non-code issue like a failed deployment or environment problem.
---

# Troubleshoot

Research an operational issue across connected tools, present findings, and offer to help apply the fix.

## Process

### 1. Capture the problem

Get the error or symptom from the user. They'll typically paste:
- A CLI command and its output
- An error message or screenshot
- A description of what's broken

If the description is vague, ask ONE question: "Can you paste the error output or describe what you're seeing?"

Extract key details: error messages, service names, environment (staging/prod/local), timestamps if available.

### 2. Research across connected sources

Search for the error or related keywords across available MCP tools. **Start with Slack and Notion** — someone has likely hit this before. Defer to the user if they point you toward a specific source.

Use the Agent tool to run searches in parallel where possible:

- **Slack**: Search `i-need-halp` channel first, then broaden. Look for the error message, service name, or symptoms.
- **Notion**: Search for runbooks, incident postmortems, or setup guides related to the affected system.
- **Linear**: Search for related issues or tickets — someone may have filed this before or documented a workaround.
- **context7 / docs**: If the error involves a specific library or tool, fetch current documentation for the relevant version.

Search with the most distinctive part of the error first (error codes, unique strings), then broaden if needed.

### 3. Present findings

Summarize what you found in this format:

```
## What I found

**Most likely cause**: [one-line summary]

**Evidence**:
- [Source 1]: [what it said, with link/reference]
- [Source 2]: [what it said, with link/reference]

**Suggested fix**:
1. [Step 1]
2. [Step 2]

**Confidence**: [high/medium/low] — [why]
```

If you found conflicting information, present both options and flag the conflict.

If nothing was found, say so clearly and suggest:
- Alternative search terms to try
- People or channels that might know
- Whether this looks like a novel issue worth documenting

### 4. Offer to help apply the fix

After presenting findings, ask: "Want me to walk you through the fix, or run the commands?"

If the user agrees:
- Present each command before running it
- Wait for confirmation on anything destructive or environment-altering
- Verify the fix worked after applying it

### 5. Document for next time (optional)

If the issue was painful to find, suggest documenting the solution:
- Post a summary in `i-need-halp` on Slack
- Add to a Notion runbook
- Create a Linear ticket for a permanent fix if the root cause is systemic
