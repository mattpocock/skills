#!/usr/bin/env python3
"""Google Workspace OAuth2 setup for Hermes Agent.

Fully non-interactive — designed to be driven by the agent via terminal commands.
The agent mediates between this script and the user (works on CLI, Telegram, Discord, etc.)

Commands:
  setup.py --check                          # Is auth valid? Exit 0 = yes, 1 = no
  setup.py --client-secret /path/to.json    # Store OAuth client credentials
  setup.py --auth-url                       # Print the OAuth URL for user to visit
  setup.py --auth-code CODE                 # Exchange auth code for token
  setup.py --revoke                         # Revoke and delete stored token
  setup.py --install-deps                   # Install Python dependencies only

Agent workflow:
  1. Run --check. If exit 0, auth is good — skip setup.
  2. Ask user for client_secret.json path. Run --client-secret PATH.
  3. Run --auth-url. Send the printed URL to the user.
  4. User opens URL, authorizes, gets redirected to a page with a code.
  5. User pastes the code. Agent runs --auth-code CODE.
  6. Run --check to verify. Done.
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    from hermes_constants import display_hermes_home, get_hermes_home
except ModuleNotFoundError:
    HERMES_AGENT_ROOT = Path(__file__).resolve().parents[4]
    if HERMES_AGENT_ROOT.exists():
        sys.path.insert(0, str(HERMES_AGENT_ROOT))
    from hermes_constants import display_hermes_home, get_hermes_home

HERMES_HOME = get_hermes_home()
TOKEN_PATH = HERMES_HOME / "google_token.json"
CLIENT_SECRET_PATH = HERMES_HOME / "google_client_secret.json"
PENDING_AUTH_PATH = HERMES_HOME / "google_oauth_pending.json"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents.readonly",
]

REQUIRED_PACKAGES = ["google-api-python-client", "google-auth-oauthlib", "google-auth-httplib2"]

# OAuth redirect for "out of band" manual code copy flow.
# Google deprecated OOB, so we use a localhost redirect and tell the user to
# copy the code from the browser's URL bar (or the page body).
REDIRECT_URI = "http://localhost:1"


def _load_token_payload(path: Path = TOKEN_PATH) -> dict:
    try:
        return json.loads(path.read_text())
    except Exception:
        return {}


def _missing_scopes_from_payload(payload: dict) -> list[str]:
    raw = payload.get("scopes") or payload.get("scope")
    if not raw:
        return []
    granted = {s.strip() for s in (raw.split() if isinstance(raw, str) else raw) if s.strip()}
    return sorted(scope for scope in SCOPES if scope not in granted)


def _format_missing_scopes(missing_scopes: list[str]) -> str:
    bullets = "\n".join(f"  - {scope}" for scope in missing_scopes)
    return (
        "Token is valid but missing required Google Workspace scopes:\n"
        f"{bullets}\n"
        "Run the Google Workspace setup again from this same Hermes profile to refresh consent."
    )


def install_deps():
    """Install Google API packages if missing. Returns True on success."""
    try:
        import googleapiclient  # noqa: F401
        import google_auth_oauthlib  # noqa: F401
        print("Dependencies already installed.")
        return True
    except ImportError:
        pass

    print("Installing Google API dependencies...")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--quiet"] + REQUIRED_PACKAGES,
            stdout=subprocess.DEVNULL,
        )
        print("Dependencies installed.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to install dependencies: {e}")
        print(f"Try manually: {sys.executable} -m pip install {' '.join(REQUIRED_PACKAGES)}")
        return False


def _ensure_deps():
    """Check deps are available, install if not, exit on failure."""
    try:
        import googleapiclient  # noqa: F401
        import google_auth_oauthlib  # noqa: F401
    except ImportError:
        if not install_deps():
            sys.exit(1)


def check_auth():
    """Check if stored credentials are valid. Prints status, exits 0 or 1."""
    if not TOKEN_PATH.exists():
        print(f"NOT_AUTHENTICATED: No token at {TOKEN_PATH}")
        return False

    _ensure_deps()
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    try:
        # Don't pass scopes — user may have authorized only a subset.
        # Passing scopes forces google-auth to validate them on refresh,
        # which fails with invalid_scope if the token has fewer scopes
        # than requested.
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH))
    except Exception as e:
        print(f"TOKEN_CORRUPT: {e}")
        return False

    payload = _load_token_payload(TOKEN_PATH)
    if creds.valid:
        missing_scopes = _missing_scopes_from_payload(payload)
        if missing_scopes:
            print(f"AUTHENTICATED (partial): Token valid but missing {len(missing_scopes)} scopes:")
            for s in missing_scopes:
                print(f"  - {s}")
        print(f"AUTHENTICATED: Token valid at {TOKEN_PATH}")
        return True

    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            TOKEN_PATH.write_text(creds.to_json())
            missing_scopes = _missing_scopes_from_payload(_load_token_payload(TOKEN_PATH))
            if missing_scopes:
                print(f"AUTHENTICATED (partial): Token refreshed but missing {len(missing_scopes)} scopes:")
                for s in missing_scopes:
                    print(f"  - {s}")
            print(f"AUTHENTICATED: Token refreshed at {TOKEN_PATH}")
            return True
        except Exception as e:
            print(f"REFRESH_FAILED: {e}")
            return False

    print("TOKEN_INVALID: Re-run setup.")
    return False


def store_client_secret(path: str):
    """Copy and validate client_secret.json to Hermes home."""
    src = Path(path).expanduser().resolve()
    if not src.exists():
        print(f"ERROR: File not found: {src}")
        sys.exit(1)

    try:
        data = json.loads(src.read_text())
    except json.JSONDecodeError:
        print("ERROR: File is not valid JSON.")
        sys.exit(1)

    if "installed" not in data and "web" not in data:
        print("ERROR: Not a Google OAuth client secret file (missing 'installed' key).")
        print("Download the correct file from: https://console.cloud.google.com/apis/credentials")
        sys.exit(1)

    CLIENT_SECRET_PATH.write_text(json.dumps(data, indent=2))
    print(f"OK: Client secret saved to {CLIENT_SECRET_PATH}")


def _save_pending_auth(*, state: str, code_verifier: str):
    """Persist the OAuth session bits needed for a later token exchange."""
    PENDING_AUTH_PATH.write_text(
        json.dumps(
            {
                "state": state,
                "code_verifier": code_verifier,
                "redirect_uri": REDIRECT_URI,
            },
            indent=2,
        )
    )


def _load_pending_auth() -> dict:
    """Load the pending OAuth session created by get_auth_url()."""
    if not PENDING_AUTH_PATH.exists():
        print("ERROR: No pending OAuth session found. Run --auth-url first.")
        sys.exit(1)

    try:
        data = json.loads(PENDING_AUTH_PATH.read_text())
    except Exception as e:
        print(f"ERROR: Could not read pending OAuth session: {e}")
        print("Run --auth-url again to start a fresh OAuth session.")
        sys.exit(1)

    if not data.get("state") or not data.get("code_verifier"):
        print("ERROR: Pending OAuth session is missing PKCE data.")
        print("Run --auth-url again to start a fresh OAuth session.")
        sys.exit(1)

    return data


def _extract_code_and_state(code_or_url: str) -> tuple[str, str | None]:
    """Accept either a raw auth code or the full redirect URL pasted by the user."""
    if not code_or_url.startswith("http"):
        return code_or_url, None

    from urllib.parse import parse_qs, urlparse

    parsed = urlparse(code_or_url)
    params = parse_qs(parsed.query)
    if "code" not in params:
        print("ERROR: No 'code' parameter found in URL.")
        sys.exit(1)

    state = params.get("state", [None])[0]
    return params["code"][0], state


def get_auth_url():
    """Print the OAuth authorization URL. User visits this in a browser."""
    if not CLIENT_SECRET_PATH.exists():
        print("ERROR: No client secret stored. Run --client-secret first.")
        sys.exit(1)

    _ensure_deps()
    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_secrets_file(
        str(CLIENT_SECRET_PATH),
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
        autogenerate_code_verifier=True,
    )
    auth_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
    )
    _save_pending_auth(state=state, code_verifier=flow.code_verifier)
    # Print just the URL so the agent can extract it cleanly
    print(auth_url)


def exchange_auth_code(code: str):
    """Exchange the authorization code for a token and save it."""
    if not CLIENT_SECRET_PATH.exists():
        print("ERROR: No client secret stored. Run --client-secret first.")
        sys.exit(1)

    pending_auth = _load_pending_auth()
    code, returned_state = _extract_code_and_state(code)
    if returned_state and returned_state != pending_auth["state"]:
        print("ERROR: OAuth state mismatch. Run --auth-url again to start a fresh session.")
        sys.exit(1)

    _ensure_deps()
    from google_auth_oauthlib.flow import Flow
    from urllib.parse import parse_qs, urlparse

    # Extract granted scopes from the callback URL if present
    if returned_state and "scope" in parse_qs(urlparse(code).query if isinstance(code, str) and code.startswith("http") else {}):
        granted_scopes = parse_qs(urlparse(code).query)["scope"][0].split()
    else:
        # Try to extract from code_or_url parameter
        if isinstance(code, str) and code.startswith("http"):
            params = parse_qs(urlparse(code).query)
            if "scope" in params:
                granted_scopes = params["scope"][0].split()
            else:
                granted_scopes = SCOPES
        else:
            granted_scopes = SCOPES

    flow = Flow.from_client_secrets_file(
        str(CLIENT_SECRET_PATH),
        scopes=granted_scopes,
        redirect_uri=pending_auth.get("redirect_uri", REDIRECT_URI),
        state=pending_auth["state"],
        code_verifier=pending_auth["code_verifier"],
    )

    try:
        # Accept partial scopes — user may deselect some permissions in the consent screen
        os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
        flow.fetch_token(code=code)
    except Exception as e:
        print(f"ERROR: Token exchange failed: {e}")
        print("The code may have expired. Run --auth-url to get a fresh URL.")
        sys.exit(1)

    creds = flow.credentials
    token_payload = json.loads(creds.to_json())

    # Store only the scopes actually granted by the user, not what was requested.
    # creds.to_json() writes the requested scopes, which causes refresh to fail
    # with invalid_scope if the user only authorized a subset.
    actually_granted = list(creds.granted_scopes or []) if hasattr(creds, "granted_scopes") and creds.granted_scopes else []
    if actually_granted:
        token_payload["scopes"] = actually_granted
    elif granted_scopes != SCOPES:
        # granted_scopes was extracted from the callback URL
        token_payload["scopes"] = granted_scopes

    missing_scopes = _missing_scopes_from_payload(token_payload)
    if missing_scopes:
        print(f"WARNING: Token missing some Google Workspace scopes: {', '.join(missing_scopes)}")
        print("Some services may not be available.")

    TOKEN_PATH.write_text(json.dumps(token_payload, indent=2))
    PENDING_AUTH_PATH.unlink(missing_ok=True)
    print(f"OK: Authenticated. Token saved to {TOKEN_PATH}")
    print(f"Profile-scoped token location: {display_hermes_home()}/google_token.json")


def revoke():
    """Revoke stored token and delete it."""
    if not TOKEN_PATH.exists():
        print("No token to revoke.")
        return

    _ensure_deps()
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    try:
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        import urllib.request
        urllib.request.urlopen(
            urllib.request.Request(
                f"https://oauth2.googleapis.com/revoke?token={creds.token}",
                method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        )
        print("Token revoked with Google.")
    except Exception as e:
        print(f"Remote revocation failed (token may already be invalid): {e}")

    TOKEN_PATH.unlink(missing_ok=True)
    PENDING_AUTH_PATH.unlink(missing_ok=True)
    print(f"Deleted {TOKEN_PATH}")


def main():
    parser = argparse.ArgumentParser(description="Google Workspace OAuth setup for Hermes")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--check", action="store_true", help="Check if auth is valid (exit 0=yes, 1=no)")
    group.add_argument("--client-secret", metavar="PATH", help="Store OAuth client_secret.json")
    group.add_argument("--auth-url", action="store_true", help="Print OAuth URL for user to visit")
    group.add_argument("--auth-code", metavar="CODE", help="Exchange auth code for token")
    group.add_argument("--revoke", action="store_true", help="Revoke and delete stored token")
    group.add_argument("--install-deps", action="store_true", help="Install Python dependencies")
    args = parser.parse_args()

    if args.check:
        sys.exit(0 if check_auth() else 1)
    elif args.client_secret:
        store_client_secret(args.client_secret)
    elif args.auth_url:
        get_auth_url()
    elif args.auth_code:
        exchange_auth_code(args.auth_code)
    elif args.revoke:
        revoke()
    elif args.install_deps:
        sys.exit(0 if install_deps() else 1)


if __name__ == "__main__":
    main()
