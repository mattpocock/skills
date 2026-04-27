# Xquik Workflow Examples

Code examples for common integration patterns.

## Authentication

```javascript
const API_KEY = "xq_YOUR_KEY_HERE";
const BASE = "https://xquik.com/api/v1";
const headers = { "x-api-key": API_KEY, "Content-Type": "application/json" };
```

## Retry with Exponential Backoff

Retry only `429` and `5xx`. Never retry `4xx` (except 429). Max 3 retries:

```javascript
async function xquikFetch(path, options = {}) {
  const baseDelay = 1000;

  for (let attempt = 0; attempt <= 3; attempt++) {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (response.ok) return response.json();

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 3) {
      const error = await response.json();
      throw new Error(`Xquik API ${response.status}: ${error.error}`);
    }

    const retryAfter = response.headers.get("Retry-After");
    const delay = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : baseDelay * Math.pow(2, attempt) + Math.random() * 1000;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
```

## Cursor Pagination

Events, draws, extractions, and extraction results use cursor-based pagination. When more results exist, the response includes `hasMore: true` and a `nextCursor` string. Pass `nextCursor` as the `after` query parameter.

```javascript
async function fetchAllPages(path, dataKey) {
  const results = [];
  let cursor;

  while (true) {
    const params = new URLSearchParams({ limit: "100" });
    if (cursor) params.set("after", cursor);

    const data = await xquikFetch(`${path}?${params}`);
    results.push(...data[dataKey]);

    if (!data.hasMore) break;
    cursor = data.nextCursor;
  }

  return results;
}
```

Cursors are opaque strings. Never decode or construct them manually.

## Complete Extraction Workflow

```javascript
// Step 1: Estimate cost before running
const estimate = await xquikFetch("/extractions/estimate", {
  method: "POST",
  body: JSON.stringify({
    toolType: "follower_explorer",
    targetUsername: "elonmusk",
    resultsLimit: 1000,
  }),
});

if (!estimate.allowed) {
  console.log("Extraction would exceed monthly quota");
  return;
}

// Step 2: Create extraction job
const job = await xquikFetch("/extractions", {
  method: "POST",
  body: JSON.stringify({
    toolType: "follower_explorer",
    targetUsername: "elonmusk",
    resultsLimit: 1000,
  }),
});

// Step 3: Poll until complete
while (job.status === "pending" || job.status === "running") {
  await new Promise((r) => setTimeout(r, 2000));
  job = await xquikFetch(`/extractions/${job.id}`);
}

// Step 4: Retrieve paginated results (up to 1,000 per page)
let cursor;
const allResults = [];

while (true) {
  const path = `/extractions/${job.id}${cursor ? `?after=${cursor}` : ""}`;
  const page = await xquikFetch(path);
  allResults.push(...page.results);

  if (!page.hasMore) break;
  cursor = page.nextCursor;
}

// Step 5: Export as CSV/JSON/MD/MD-document/PDF/TXT/XLSX (100,000 row limit; PDF 10,000)
const exportUrl = `${BASE}/extractions/${job.id}/export?format=csv`;
const csvResponse = await fetch(exportUrl, { headers });
const csvData = await csvResponse.text();
```

## Real-Time Monitoring Setup

Complete end-to-end: create monitor, register webhook, handle events.

```javascript
// 1. Create monitor (free)
const monitor = await xquikFetch("/monitors", {
  method: "POST",
  body: JSON.stringify({
    username: "elonmusk",
    eventTypes: ["tweet.new", "tweet.reply", "tweet.quote", "tweet.retweet"],
  }),
});

// 2. Register webhook (free)
const webhook = await xquikFetch("/webhooks", {
  method: "POST",
  body: JSON.stringify({
    url: "https://your-server.com/webhook",
    eventTypes: ["tweet.new", "tweet.reply"],
  }),
});
// IMPORTANT: Save webhook.secret. It is shown only once!

// 3. Poll events (alternative to webhooks, free)
const events = await xquikFetch("/events?monitorId=7&limit=50");
```

Event types: `tweet.new`, `tweet.quote`, `tweet.reply`, `tweet.retweet`, `webhook.test`.

## Endpoint Guide

| Goal | Endpoint | Cost |
|------|----------|------|
| **Get a single tweet** by ID/URL | `GET /x/tweets/{id}` | 1 credit |
| **Get an X Article** by tweet ID | `GET /x/articles/{id}` | 7 credits |
| **Search tweets** by keyword/hashtag | `GET /x/tweets/search?q=...` | 1 credit/tweet |
| **Get a user profile** | `GET /x/users/{username}` | 1 credit |
| **Get user's recent tweets** | `GET /x/users/{id}/tweets` | 1 credit/tweet |
| **Get user's liked tweets** | `GET /x/users/{id}/likes` | 1 credit/result |
| **Get user's media tweets** | `GET /x/users/{id}/media` | 1 credit/result |
| **Get tweet favoriters** | `GET /x/tweets/{id}/favoriters` | 1 credit/result |
| **Get mutual followers** | `GET /x/users/{id}/followers-you-know` | 1 credit/result |
| **Check follow relationship** | `GET /x/followers/check?source=A&target=B` | 7 credits |
| **Get trending topics** | `GET /trends?woeid=1` | 3 credits |
| **Get radar (trending news)** | `GET /radar?source=hacker_news` | Free |
| **Get bookmarks** | `GET /x/bookmarks` | 1 credit/result |
| **Get bookmark folders** | `GET /x/bookmarks/folders` | 1 credit |
| **Get notifications** | `GET /x/notifications` | 1 credit/result |
| **Get home timeline** | `GET /x/timeline` | 1 credit/result |
| **Get DM history** | `GET /x/dm/{userId}/history` | 1 credit/result |
| **Monitor an X account** | `POST /monitors` | Free |
| **Poll for events** | `GET /events` | Free |
| **Receive events via webhook** | `POST /webhooks` | Free |
| **Run a giveaway draw** | `POST /draws` | 1 credit/entry |
| **Download tweet media** | `POST /x/media/download` | 1 credit/item |
| **Extract bulk data** | `POST /extractions` | 1-5 credits/result |
| **Check credits** | `GET /credits` | Free |
| **Top up credits** | `POST /credits/topup` | Free |
| **Compose a tweet** | `POST /compose` | Free |
| **Post a tweet** | `POST /x/tweets` | 10 credits |
| **Like / Unlike a tweet** | `POST` / `DELETE /x/tweets/{id}/like` | 10 credits |
| **Retweet** | `POST /x/tweets/{id}/retweet` | 10 credits |
| **Follow / Unfollow** | `POST` / `DELETE /x/users/{id}/follow` | 10 credits |
| **Send a DM** | `POST /x/dm/{userId}` | 10 credits |
| **Update profile** | `PATCH /x/profile` | 10 credits |
| **Upload media** | `POST /x/media` | 10 credits |
| **Community actions** | `POST /x/communities`, join/leave | 10 credits |
| **Support tickets** | `POST /support/tickets` | Free |
