#!/usr/bin/env python3
"""Bridge between Hermes OAuth token and gws CLI.

Refreshes the token if expired, then executes gws with the valid access token.
"""
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def get_hermes_home() -> Path:
    return Path(os.environ.get("HERMES_HOME", Path.home() / ".hermes"))


def get_token_path() -> Path:
    return get_hermes_home() / "google_token.json"


def refresh_token(token_data: dict) -> dict:
    """Refresh the access token using the refresh token."""
    import urllib.error
    import urllib.parse
    import urllib.request

    params = urllib.parse.urlencode({
        "client_id": token_data["client_id"],
        "client_secret": token_data["client_secret"],
        "refresh_token": token_data["refresh_token"],
        "grant_type": "refresh_token",
    }).encode()

    req = urllib.request.Request(token_data["token_uri"], data=params)
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"ERROR: Token refresh failed (HTTP {e.code}): {body}", file=sys.stderr)
        print("Re-run setup.py to re-authenticate.", file=sys.stderr)
        sys.exit(1)

    token_data["token"] = result["access_token"]
    token_data["expiry"] = datetime.fromtimestamp(
        datetime.now(timezone.utc).timestamp() + result["expires_in"],
        tz=timezone.utc,
    ).isoformat()

    get_token_path().write_text(json.dumps(token_data, indent=2))
    return token_data


def get_valid_token() -> str:
    """Return a valid access token, refreshing if needed."""
    token_path = get_token_path()
    if not token_path.exists():
        print("ERROR: No Google token found. Run setup.py --auth-url first.", file=sys.stderr)
        sys.exit(1)

    token_data = json.loads(token_path.read_text())

    expiry = token_data.get("expiry", "")
    if expiry:
        exp_dt = datetime.fromisoformat(expiry.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        if now >= exp_dt:
            token_data = refresh_token(token_data)

    return token_data["token"]


def main():
    """Refresh token if needed, then exec gws with remaining args."""
    if len(sys.argv) < 2:
        print("Usage: gws_bridge.py <gws args...>", file=sys.stderr)
        sys.exit(1)

    access_token = get_valid_token()
    env = os.environ.copy()
    env["GOOGLE_WORKSPACE_CLI_TOKEN"] = access_token

    result = subprocess.run(["gws"] + sys.argv[1:], env=env)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
