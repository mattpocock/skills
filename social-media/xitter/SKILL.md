---
name: xitter
description: Interact with X/Twitter via the x-cli terminal client using official X API credentials. Use for posting, reading timelines, searching tweets, liking, retweeting, bookmarks, mentions, and user lookups.
version: 1.0.0
author: Siddharth Balyan + Hermes Agent
license: MIT
platforms: [linux, macos]
prerequisites:
  commands: [uv]
  env_vars: [X_API_KEY, X_API_SECRET, X_BEARER_TOKEN, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]
metadata:
  hermes:
    tags: [twitter, x, social-media, x-cli]
    homepage: https://github.com/Infatoshi/x-cli
---

# Xitter — X/Twitter via x-cli

Use `x-cli` for official X/Twitter API interactions from the terminal.

This skill is for:
- posting tweets, replies, and quote tweets
- searching tweets and reading timelines
- looking up users, followers, and following
- liking and retweeting
- checking mentions and bookmarks

This skill intentionally does not vendor a separate CLI implementation into Hermes. Install and use upstream `x-cli` instead.

## Important Cost / Access Note

X API access is not meaningfully free for most real usage. Expect to need paid or prepaid X developer access. If commands fail with permissions or quota errors, check your X developer plan first.

## Install

Install upstream `x-cli` with `uv`:

```bash
uv tool install git+https://github.com/Infatoshi/x-cli.git
```

Upgrade later with:

```bash
uv tool upgrade x-cli
```

Verify:

```bash
x-cli --help
```

## Credentials

You need these five values from the X Developer Portal:
- `X_API_KEY`
- `X_API_SECRET`
- `X_BEARER_TOKEN`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

Get them from:
- https://developer.x.com/en/portal/dashboard

### Why does X need 5 secrets?

Unfortunately, the official X API splits auth across both app-level and user-level credentials:

- `X_API_KEY` + `X_API_SECRET` identify your app
- `X_BEARER_TOKEN` is used for app-level read access
- `X_ACCESS_TOKEN` + `X_ACCESS_TOKEN_SECRET` let the CLI act as your user account for writes and authenticated actions

So yes — it is a lot of secrets for one integration, but this is the stable official API path and is still preferable to cookie/session scraping.

Setup requirements in the portal:
1. Create or open your app
2. In user authentication settings, set permissions to `Read and write`
3. Generate or regenerate the access token + access token secret after enabling write permissions
4. Save all five values carefully — missing any one of them will usually produce confusing auth or permission errors

Note: upstream `x-cli` expects the full credential set to be present, so even if you mostly care about read-only commands, it is simplest to configure all five.

## Cost / Friction Reality Check

If this setup feels heavier than it should be, that is because it is. X’s official developer flow is high-friction and often paid. This skill chooses the official API path because it is more stable and maintainable than browser-cookie/session approaches.

If the user wants the least brittle long-term setup, use this skill. If they want a zero-setup or unofficial path, that is a different trade-off and not what this skill is for.


## Where to Store Credentials

`x-cli` looks for credentials in `~/.config/x-cli/.env`.

If you already keep your X credentials in `~/.hermes/.env`, the cleanest setup is:

```bash
mkdir -p ~/.config/x-cli
ln -sf ~/.hermes/.env ~/.config/x-cli/.env
```

Or create a dedicated file:

```bash
mkdir -p ~/.config/x-cli
cat > ~/.config/x-cli/.env <<'EOF'
X_API_KEY=your_consumer_key
X_API_SECRET=your_secret_key
X_BEARER_TOKEN=your_bearer_token
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
EOF
chmod 600 ~/.config/x-cli/.env
```

## Quick Verification

```bash
x-cli user get openai
x-cli tweet search "from:NousResearch" --max 3
x-cli me mentions --max 5
```

If reads work but writes fail, regenerate the access token after confirming `Read and write` permissions.

## Common Commands

### Tweets

```bash
x-cli tweet post "hello world"
x-cli tweet get https://x.com/user/status/1234567890
x-cli tweet delete 1234567890
x-cli tweet reply 1234567890 "nice post"
x-cli tweet quote 1234567890 "worth reading"
x-cli tweet search "AI agents" --max 20
x-cli tweet metrics 1234567890
```

### Users

```bash
x-cli user get openai
x-cli user timeline openai --max 10
x-cli user followers openai --max 50
x-cli user following openai --max 50
```

### Self / Authenticated User

```bash
x-cli me mentions --max 20
x-cli me bookmarks --max 20
x-cli me bookmark 1234567890
x-cli me unbookmark 1234567890
```

### Quick Actions

```bash
x-cli like 1234567890
x-cli retweet 1234567890
```

## Output Modes

Use structured output when the agent needs to inspect fields programmatically:

```bash
x-cli -j tweet search "AI agents" --max 5
x-cli -p user get openai
x-cli -md tweet get 1234567890
x-cli -v -j tweet get 1234567890
```

Recommended defaults:
- `-j` for machine-readable output
- `-v` when you need timestamps, metrics, or metadata
- plain/default mode for quick human inspection

## Agent Workflow

1. Confirm `x-cli` is installed
2. Confirm credentials are present
3. Start with a read command (`user get`, `tweet search`, `me mentions`)
4. Use `-j` when extracting fields for later steps
5. Only perform write actions after confirming the target tweet/user and the user's intent

## Pitfalls

- **Paid API access**: many failures are plan/permission problems, not code problems.
- **403 oauth1-permissions**: regenerate the access token after enabling `Read and write`.
- **Reply restrictions**: X restricts many programmatic replies. `tweet quote` is often more reliable than `tweet reply`.
- **Rate limits**: expect per-endpoint limits and cooldown windows.
- **Credential drift**: if you rotate tokens in `~/.hermes/.env`, make sure `~/.config/x-cli/.env` still points at the current file.

## Notes

- Prefer official API workflows over cookie/session scraping.
- Use tweet URLs or IDs interchangeably — `x-cli` accepts both.
- If bookmark behavior changes upstream, check the upstream README first:
  https://github.com/Infatoshi/x-cli
