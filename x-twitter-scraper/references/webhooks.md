# Xquik Webhooks

Receive real-time event notifications at your HTTPS endpoints with HMAC-SHA256 signature verification.

## Setup

1. Create at least 1 active monitor (`POST /monitors`)
2. Register a webhook endpoint (`POST /webhooks`)
3. Save the `secret` from the response (shown only once)
4. Build a handler that verifies signatures before processing

## Webhook Payload

Every delivery is a `POST` request to your URL with a JSON body:

```json
{
  "eventType": "tweet.new",
  "username": "elonmusk",
  "data": {
    "tweetId": "1893556789012345678",
    "text": "Hello world",
    "metrics": { "likes": 3200, "retweets": 890, "replies": 245 }
  }
}
```

## Signature Verification

The `X-Xquik-Signature` header contains: `sha256=` + HMAC-SHA256(secret, raw JSON body).

### Node.js (Express)

```javascript
import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

// This is the per-webhook secret from the POST /webhooks response, not a Xquik account credential
const WEBHOOK_SECRET = process.env.XQUIK_WEBHOOK_SECRET;

function verifySignature(payload, signature, secret) {
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-xquik-signature"];
  const payload = req.body.toString();

  if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(payload);

  switch (event.eventType) {
    case "tweet.new":
      console.log(`New tweet from @${event.username}: ${event.data.text}`);
      break;
    case "tweet.reply":
      console.log(`Reply from @${event.username}: ${event.data.text}`);
      break;
    case "tweet.retweet":
      console.log(`@${event.username} retweeted`);
      break;
  }

  res.status(200).send("OK");
});
```

### Python (Flask)

```python
import hmac
import hashlib
import os
from flask import Flask, request

app = Flask(__name__)
# Per-webhook secret from POST /webhooks response, not a Xquik account credential
WEBHOOK_SECRET = os.environ["XQUIK_WEBHOOK_SECRET"]

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.route("/webhook", methods=["POST"])
def webhook():
    signature = request.headers.get("X-Xquik-Signature", "")
    payload = request.get_data()

    if not verify_signature(payload, signature, WEBHOOK_SECRET):
        return "Invalid signature", 401

    event = request.get_json()

    if event["eventType"] == "tweet.new":
        print(f"New tweet from @{event['username']}: {event['data']['text']}")

    return "OK", 200
```

### Go

```go
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

// Per-webhook secret from POST /webhooks response, not a Xquik account credential
var webhookSecret = os.Getenv("XQUIK_WEBHOOK_SECRET")

func verifySignature(payload []byte, signature, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write(payload)
    expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(expected), []byte(signature))
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
    payload, _ := io.ReadAll(r.Body)
    signature := r.Header.Get("X-Xquik-Signature")

    if !verifySignature(payload, signature, webhookSecret) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }

    var event struct {
        EventType string `json:"eventType"`
        Username  string `json:"username"`
        Data      struct {
            Text string `json:"text"`
        } `json:"data"`
    }
    json.Unmarshal(payload, &event)

    fmt.Printf("[%s] @%s: %s\n", event.EventType, event.Username, event.Data.Text)
    fmt.Fprint(w, "OK")
}
```

## Security Checklist

- **Verify before processing.** Never process unverified payloads
- **Use constant-time comparison.** `timingSafeEqual` (Node.js), `hmac.compare_digest` (Python), `hmac.Equal` (Go)
- **Use the raw request body.** Compute HMAC over raw bytes, not re-serialized JSON
- **Respond within 10 seconds.** Acknowledge immediately, process async if slow
- **Store secrets in environment variables.** Never hardcode

## Idempotency

Webhook deliveries can retry on failure, delivering the same event multiple times. Deduplicate by hashing the raw payload:

```javascript
import { createHash } from "node:crypto";

const processedPayloads = new Set(); // Use Redis/DB in production

const payloadHash = createHash("sha256").update(rawPayload).digest("hex");
if (processedPayloads.has(payloadHash)) {
  return res.status(200).send("Already processed");
}
processedPayloads.add(payloadHash);
```

## Retry Policy

Failed deliveries are retried up to 5 times with exponential backoff. Delivery statuses: `pending`, `delivered`, `failed`, `exhausted`.

Check delivery status: `GET /webhooks/{id}/deliveries`.

## Local Testing

Use [ngrok](https://ngrok.com) to expose a local server:

```bash
# Terminal 1: Start your webhook server
node server.js  # listening on :3000

# Terminal 2: Expose it
ngrok http 3000
# Use the ngrok HTTPS URL when creating the webhook
```

Or use [RequestBin](https://requestbin.com) for quick inspection without running a server.
