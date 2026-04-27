# Xquik MCP Server Setup

Connect AI agents and IDEs to Xquik via the Model Context Protocol. The MCP server uses the same API key as the REST API.

| Setting | Value |
|---------|-------|
| Protocol | HTTP (StreamableHTTP) |
| Endpoint | `https://xquik.com/mcp` |
| Auth header | `x-api-key` |

> **Security:** Use a scoped, revocable API key - not your primary account key. Where your platform supports environment variable interpolation (e.g., `${XQUIK_API_KEY}`), prefer that over hardcoding. Rotate keys periodically from the [dashboard](https://dashboard.xquik.com/account). Never commit API keys to version control.

## Claude.ai (Web)

Claude.ai supports MCP connectors natively via OAuth. Add Xquik as a connector from **Settings > Feature Preview > Integrations > Add More > Xquik**. The OAuth 2.1 flow handles authentication automatically. No API key needed.

## Claude Desktop

Claude Desktop only supports stdio transport, so it needs a local stdio-to-HTTP bridge. The recommended setup avoids runtime package fetches: **install the bridge globally first, then invoke the pinned binary directly.**

> **About `mcp-remote`:** [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) is an open-source stdio-to-HTTP bridge (MIT license, [source on GitHub](https://github.com/geelen/mcp-remote)) maintained by the MCP ecosystem. It translates stdio to StreamableHTTP - it does not execute arbitrary code, access your filesystem, or modify your system. Always pin the version (`@0.1.38`) and audit the package on npm before installing.

### Step 1: Install the bridge globally (one-time, audited)

```bash
npm install -g mcp-remote@0.1.38
```

### Step 2: Add to `claude_desktop_config.json`

```json
{
  "mcpServers": {
    "xquik": {
      "command": "mcp-remote",
      "args": [
        "https://xquik.com/mcp",
        "--header",
        "x-api-key:${XQUIK_API_KEY}"
      ]
    }
  }
}
```

> Set the `XQUIK_API_KEY` environment variable before launching Claude Desktop, or replace `${XQUIK_API_KEY}` with your actual API key.

> **Prefer a hosted option?** Claude.ai (web) supports Xquik natively via OAuth - see the section above. No local bridge required.

## Claude Code

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "xquik": {
      "type": "http",
      "url": "https://xquik.com/mcp",
      "headers": {
        "x-api-key": "xq_YOUR_KEY_HERE"
      }
    }
  }
}
```

## ChatGPT

3 ways to connect ChatGPT to Xquik:

### Option 1: Custom GPT (Recommended)

Create a Custom GPT and add Xquik as an Action using the OpenAPI schema at `https://docs.xquik.com/openapi.json`. Set the API key under Authentication > API Key > Header `x-api-key`.

### Option 2: Agents SDK

Use the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/mcp/) for programmatic access:

```python
from agents.mcp import MCPServerStreamableHttp

async with MCPServerStreamableHttp(
    url="https://xquik.com/mcp",
    headers={"x-api-key": "xq_YOUR_KEY_HERE"},
    params={},
) as xquik:
    # use xquik as a tool provider
    pass
```

### Option 3: Developer Mode

ChatGPT Developer Mode supports MCP connectors via OAuth. Add Xquik from **Settings > Developer Mode > MCP Tools > Add**. Enter `https://xquik.com/mcp` as the endpoint. OAuth handles authentication automatically.

## Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.xquik]
url = "https://xquik.com/mcp"
http_headers = { "x-api-key" = "xq_YOUR_KEY_HERE" }
```

## Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "xquik": {
      "url": "https://xquik.com/mcp",
      "headers": {
        "x-api-key": "xq_YOUR_KEY_HERE"
      }
    }
  }
}
```

## VS Code

Add to `.vscode/mcp.json` (project) or use **MCP: Open User Configuration** (global):

```json
{
  "servers": {
    "xquik": {
      "type": "http",
      "url": "https://xquik.com/mcp",
      "headers": {
        "x-api-key": "xq_YOUR_KEY_HERE"
      }
    }
  }
}
```

## Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "xquik": {
      "serverUrl": "https://xquik.com/mcp",
      "headers": {
        "x-api-key": "xq_YOUR_KEY_HERE"
      }
    }
  }
}
```

## OpenCode

Add to `opencode.json`:

```json
{
  "mcp": {
    "xquik": {
      "type": "remote",
      "url": "https://xquik.com/mcp",
      "headers": {
        "x-api-key": "xq_YOUR_KEY_HERE"
      }
    }
  }
}
```

## MCP Server Architecture

The MCP server (v2) at `https://xquik.com/mcp` provides 2 structured API tools:

| Tool | Description | Cost |
|------|-------------|------|
| `explore` | Search the API endpoint catalog (read-only, no network calls) | Free |
| `xquik` | Execute API calls against your account | Varies by endpoint |

The agent sends structured API requests through the MCP server, which handles authentication and execution within the same first-party infrastructure as the REST API. All 111 REST API endpoints across 10 categories are accessible: account, composition, credits, extraction, media, monitoring, support, twitter, x-accounts, and x-write.

## After Setup

### Workflow Patterns

| Workflow | Steps (via `xquik` tool) |
|----------|--------------------------|
| Set up real-time alerts | `POST /monitors` -> `POST /webhooks` -> `POST /webhooks/{id}/test` |
| Run a giveaway | `GET /account` -> `POST /draws` |
| Bulk extraction | `POST /extractions/estimate` -> `POST /extractions` -> `GET /extractions/{id}` |
| Compose optimized tweet | `POST /compose` (step=compose -> refine -> score) |
| Subscribe or manage billing | `POST /subscribe` |

### Example Prompts

Try these with your AI agent:

- "Monitor @vercel for new tweets and quote tweets"
- "How many followers does @elonmusk have?"
- "Search for tweets mentioning xquik"
- "What does this tweet say? https://x.com/elonmusk/status/1893456789012345678"
- "Does @elonmusk follow @SpaceX back?"
- "Pick 3 winners from this tweet: https://x.com/burakbayir/status/1893456789012345678"
- "How much would it cost to extract all followers of @elonmusk?"
- "What's trending in the US right now?"
- "What's trending on Hacker News today?"
- "Help me write a tweet about launching my product"
- "Set up a webhook at https://my-server.com/events for new tweets"
- "What plan am I on and how much have I used?"
