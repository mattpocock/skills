# Xquik Python Examples

Python equivalents of the JavaScript examples in SKILL.md.

## Authentication

```python
import requests

API_KEY = "xq_YOUR_KEY_HERE"
BASE = "https://xquik.com/api/v1"
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}
```

## Retry with Exponential Backoff

```python
import time, random

def xquik_fetch(path, method="GET", json_body=None, max_retries=3):
    base_delay = 1.0

    for attempt in range(max_retries + 1):
        response = requests.request(
            method,
            f"{BASE}{path}",
            headers=HEADERS,
            json=json_body,
        )

        if response.ok:
            return response.json()

        retryable = response.status_code == 429 or response.status_code >= 500
        if not retryable or attempt == max_retries:
            error = response.json()
            raise Exception(f"Xquik API {response.status_code}: {error['error']}")

        retry_after = response.headers.get("Retry-After")
        delay = int(retry_after) if retry_after else base_delay * (2 ** attempt) + random.uniform(0, 1)
        time.sleep(delay)
```

## Extraction Workflow

```python
# Step 1: Estimate
estimate = xquik_fetch("/extractions/estimate", method="POST", json_body={
    "toolType": "reply_extractor",
    "targetTweetId": "1893704267862470862",
})

if not estimate["allowed"]:
    print(f"Would exceed quota: {estimate['projectedPercent']}%")
    exit()

# Step 2: Create job
job = xquik_fetch("/extractions", method="POST", json_body={
    "toolType": "reply_extractor",
    "targetTweetId": "1893704267862470862",
})

# Step 3: Poll until complete (large jobs may return "running")
while job["status"] in ("pending", "running"):
    time.sleep(2)
    job = xquik_fetch(f"/extractions/{job['id']}")

# Step 4: Get results
cursor = None
results = []

while True:
    path = f"/extractions/{job['id']}"
    if cursor:
        path += f"?after={cursor}"
    page = xquik_fetch(path)
    results.extend(page["results"])

    if not page["hasMore"]:
        break
    cursor = page["nextCursor"]

print(f"Extracted {len(results)} results")
```

## Giveaway Draw

```python
# Create draw with all filters
draw = xquik_fetch("/draws", method="POST", json_body={
    "tweetUrl": "https://x.com/burakbayir/status/1893456789012345678",
    "winnerCount": 3,
    "backupCount": 2,
    "uniqueAuthorsOnly": True,
    "mustRetweet": True,
    "mustFollowUsername": "burakbayir",
    "filterMinFollowers": 50,
    "filterAccountAgeDays": 30,
    "requiredKeywords": ["giveaway"],
})

# Get winners
details = xquik_fetch(f"/draws/{draw['id']}")
for winner in details["winners"]:
    role = "BACKUP" if winner["isBackup"] else "WINNER"
    print(f"{role} #{winner['position']}: @{winner['authorUsername']}")
```

## Webhook Handler (Flask)

```python
import hmac, hashlib, json, os
from flask import Flask, request

app = Flask(__name__)
# Per-webhook secret from POST /webhooks response, not a Xquik account credential
WEBHOOK_SECRET = os.environ["XQUIK_WEBHOOK_SECRET"]
processed_hashes = set()  # Use Redis/DB in production

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

EVENT_HANDLERS = {
    "tweet.new": lambda u, d: print(f"New tweet from @{u}: {d['text']}"),
    "tweet.reply": lambda u, d: print(f"Reply from @{u}: {d['text']}"),
    "tweet.quote": lambda u, d: print(f"Quote from @{u}: {d['text']}"),
    "tweet.retweet": lambda u, d: print(f"Retweet by @{u}"),
}

@app.route("/webhook", methods=["POST"])
def webhook():
    signature = request.headers.get("X-Xquik-Signature", "")
    payload = request.get_data()

    if not verify_signature(payload, signature, WEBHOOK_SECRET):
        return "Invalid signature", 401

    payload_hash = hashlib.sha256(payload).hexdigest()
    if payload_hash in processed_hashes:
        return "Already processed", 200
    processed_hashes.add(payload_hash)

    event = json.loads(payload)
    handler = EVENT_HANDLERS.get(event["eventType"])
    if handler:
        handler(event["username"], event["data"])

    return "OK", 200
```
