---
name: google-workspace
description: Gmail, Calendar, Drive, Contacts, Sheets, and Docs integration via gws CLI (googleworkspace/cli). Uses OAuth2 with automatic token refresh via bridge script. Requires gws binary.
version: 2.0.0
author: Nous Research
license: MIT
required_credential_files:
  - path: google_token.json
    description: Google OAuth2 token (created by setup script)
  - path: google_client_secret.json
    description: Google OAuth2 client credentials (downloaded from Google Cloud Console)
metadata:
  hermes:
    tags: [Google, Gmail, Calendar, Drive, Sheets, Docs, Contacts, Email, OAuth, gws]
    homepage: https://github.com/NousResearch/hermes-agent
    related_skills: [himalaya]
---

# Google Workspace

Gmail, Calendar, Drive, Contacts, Sheets, and Docs — powered by `gws` (Google's official Rust CLI). The skill provides a backward-compatible Python wrapper that handles OAuth token refresh and delegates to `gws`.

## Architecture

```
google_api.py  →  gws_bridge.py  →  gws CLI
(argparse compat)  (token refresh)    (Google APIs)
```

- `setup.py` handles OAuth2 (headless-compatible, works on CLI/Telegram/Discord)
- `gws_bridge.py` refreshes the Hermes token and injects it into `gws` via `GOOGLE_WORKSPACE_CLI_TOKEN`
- `google_api.py` provides the same CLI interface as v1 but delegates to `gws`

## References

- `references/gmail-search-syntax.md` — Gmail search operators (is:unread, from:, newer_than:, etc.)

## Scripts

- `scripts/setup.py` — OAuth2 setup (run once to authorize)
- `scripts/gws_bridge.py` — Token refresh bridge to gws CLI
- `scripts/google_api.py` — Backward-compatible API wrapper (delegates to gws)

## Prerequisites

Install `gws`:

```bash
cargo install google-workspace-cli
# or via npm (recommended, downloads prebuilt binary):
npm install -g @googleworkspace/cli
# or via Homebrew:
brew install googleworkspace-cli
```

Verify: `gws --version`

## First-Time Setup

The setup is fully non-interactive — you drive it step by step so it works
on CLI, Telegram, Discord, or any platform.

Define a shorthand first:

```bash
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
GWORKSPACE_SKILL_DIR="$HERMES_HOME/skills/productivity/google-workspace"
PYTHON_BIN="${HERMES_PYTHON:-python3}"
if [ -x "$HERMES_HOME/hermes-agent/venv/bin/python" ]; then
  PYTHON_BIN="$HERMES_HOME/hermes-agent/venv/bin/python"
fi
GSETUP="$PYTHON_BIN $GWORKSPACE_SKILL_DIR/scripts/setup.py"
```

### Step 0: Check if already set up

```bash
$GSETUP --check
```

If it prints `AUTHENTICATED`, skip to Usage — setup is already done.

### Step 1: Triage — ask the user what they need

**Question 1: "What Google services do you need? Just email, or also
Calendar/Drive/Sheets/Docs?"**

- **Email only** → Use the `himalaya` skill instead — simpler setup.
- **Calendar, Drive, Sheets, Docs (or email + these)** → Continue below.

**Partial scopes**: Users can authorize only a subset of services. The setup
script accepts partial scopes and warns about missing ones.

**Question 2: "Does your Google account use Advanced Protection?"**

- **No / Not sure** → Normal setup.
- **Yes** → Workspace admin must add the OAuth client ID to allowed apps first.

### Step 2: Create OAuth credentials (one-time, ~5 minutes)

Tell the user:

> 1. Go to https://console.cloud.google.com/apis/credentials
> 2. Create a project (or use an existing one)
> 3. Enable the APIs you need (Gmail, Calendar, Drive, Sheets, Docs, People)
> 4. Credentials → Create Credentials → OAuth 2.0 Client ID → Desktop app
> 5. Download JSON and tell me the file path

```bash
$GSETUP --client-secret /path/to/client_secret.json
```

### Step 3: Get authorization URL

```bash
$GSETUP --auth-url
```

Send the URL to the user. After authorizing, they paste back the redirect URL or code.

### Step 4: Exchange the code

```bash
$GSETUP --auth-code "THE_URL_OR_CODE_THE_USER_PASTED"
```

### Step 5: Verify

```bash
$GSETUP --check
```

Should print `AUTHENTICATED`. Token refreshes automatically from now on.

## Usage

All commands go through the API script:

```bash
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
GWORKSPACE_SKILL_DIR="$HERMES_HOME/skills/productivity/google-workspace"
PYTHON_BIN="${HERMES_PYTHON:-python3}"
if [ -x "$HERMES_HOME/hermes-agent/venv/bin/python" ]; then
  PYTHON_BIN="$HERMES_HOME/hermes-agent/venv/bin/python"
fi
GAPI="$PYTHON_BIN $GWORKSPACE_SKILL_DIR/scripts/google_api.py"
```

### Gmail

```bash
$GAPI gmail search "is:unread" --max 10
$GAPI gmail get MESSAGE_ID
$GAPI gmail send --to user@example.com --subject "Hello" --body "Message text"
$GAPI gmail send --to user@example.com --subject "Report" --body "<h1>Q4</h1>" --html
$GAPI gmail reply MESSAGE_ID --body "Thanks, that works for me."
$GAPI gmail labels
$GAPI gmail modify MESSAGE_ID --add-labels LABEL_ID
```

### Calendar

```bash
$GAPI calendar list
$GAPI calendar create --summary "Standup" --start 2026-03-01T10:00:00+01:00 --end 2026-03-01T10:30:00+01:00
$GAPI calendar create --summary "Review" --start ... --end ... --attendees "alice@co.com,bob@co.com"
$GAPI calendar delete EVENT_ID
```

### Drive

```bash
$GAPI drive search "quarterly report" --max 10
$GAPI drive search "mimeType='application/pdf'" --raw-query --max 5
```

### Contacts

```bash
$GAPI contacts list --max 20
```

### Sheets

```bash
$GAPI sheets get SHEET_ID "Sheet1!A1:D10"
$GAPI sheets update SHEET_ID "Sheet1!A1:B2" --values '[["Name","Score"],["Alice","95"]]'
$GAPI sheets append SHEET_ID "Sheet1!A:C" --values '[["new","row","data"]]'
```

### Docs

```bash
$GAPI docs get DOC_ID
```

### Direct gws access (advanced)

For operations not covered by the wrapper, use `gws_bridge.py` directly:

```bash
GBRIDGE="$PYTHON_BIN $GWORKSPACE_SKILL_DIR/scripts/gws_bridge.py"
$GBRIDGE calendar +agenda --today --format table
$GBRIDGE gmail +triage --labels --format json
$GBRIDGE drive +upload ./report.pdf
$GBRIDGE sheets +read --spreadsheet SHEET_ID --range "Sheet1!A1:D10"
```

## Output Format

All commands return JSON via `gws --format json`. Key output shapes:

- **Gmail search/triage**: Array of message summaries (sender, subject, date, snippet)
- **Gmail get/read**: Message object with headers and body text
- **Gmail send/reply**: Confirmation with message ID
- **Calendar list/agenda**: Array of event objects (summary, start, end, location)
- **Calendar create**: Confirmation with event ID and htmlLink
- **Drive search**: Array of file objects (id, name, mimeType, webViewLink)
- **Sheets get/read**: 2D array of cell values
- **Docs get**: Full document JSON (use `body.content` for text extraction)
- **Contacts list**: Array of person objects with names, emails, phones

Parse output with `jq` or read JSON directly.

## Rules

1. **Never send email or create/delete events without confirming with the user first.**
2. **Check auth before first use** — run `setup.py --check`.
3. **Use the Gmail search syntax reference** for complex queries.
4. **Calendar times must include timezone** — ISO 8601 with offset or UTC.
5. **Respect rate limits** — avoid rapid-fire sequential API calls.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `NOT_AUTHENTICATED` | Run setup Steps 2-5 |
| `REFRESH_FAILED` | Token revoked — redo Steps 3-5 |
| `gws: command not found` | Install: `npm install -g @googleworkspace/cli` |
| `HttpError 403` | Missing scope — `$GSETUP --revoke` then redo Steps 3-5 |
| `HttpError 403: Access Not Configured` | Enable API in Google Cloud Console |
| Advanced Protection blocks auth | Admin must allowlist the OAuth client ID |

## Revoking Access

```bash
$GSETUP --revoke
```
