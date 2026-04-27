# Xquik REST API Endpoints

Base URL: `https://xquik.com/api/v1`

All requests require the `x-api-key` header. All responses are JSON. HTTPS only.

## Table of Contents

- [Account](#account)
- [API Keys](#api-keys)
- [Monitors](#monitors)
- [Events](#events)
- [Webhooks](#webhooks)
- [Draws](#draws)
- [Extractions](#extractions)
- [X API (Direct Lookups)](#x-api-direct-lookups)
- [X Media (Download)](#x-media-download)
- [Trends](#trends)
- [Radar](#radar)
- [Compose](#compose)
- [Drafts](#drafts)
- [Tweet Style Cache](#tweet-style-cache)
- [Account Identity](#account-identity)
- [Subscribe](#subscribe)
- [X Accounts (Connected)](#x-accounts-connected)
- [X Write](#x-write)
- [Credits](#credits)
- [Support](#support)

---

## Account

### Get Account

```
GET /account
```

Returns subscription status, monitor allocation, and current period usage.

**Response:**
```json
{
  "plan": "active",
  "monitorsAllowed": 1,
  "monitorsUsed": 0,
  "currentPeriod": {
    "start": "2026-02-01T00:00:00.000Z",
    "end": "2026-03-01T00:00:00.000Z",
    "usagePercent": 45
  }
}
```

### Update Account

```
PATCH /account
```

Update account locale. Session auth only (not API key).

**Body:** `{ "locale": "en" | "tr" | "es" }`

---

## API Keys

Session auth only. These endpoints do not accept API key auth.

### Create API Key

```
POST /api-keys
```

**Body:** `{ "name": "My Key" }` (optional)

**Response:** Returns `fullKey` (shown only once), `prefix`, `name`, `id`, `createdAt`.

### List API Keys

```
GET /api-keys
```

Returns all keys with `id`, `name`, `prefix`, `isActive`, `createdAt`, `lastUsedAt`. Full key is never exposed.

### Revoke API Key

```
DELETE /api-keys/{id}
```

Permanent and irreversible. The key stops working immediately.

---

## Monitors

### Create Monitor

```
POST /monitors
```

**Body:**
```json
{
  "username": "elonmusk",
  "eventTypes": ["tweet.new", "tweet.reply", "tweet.quote"]
}
```

**Response:**
```json
{
  "id": "7",
  "username": "elonmusk",
  "xUserId": "44196397",
  "eventTypes": ["tweet.new", "tweet.reply", "tweet.quote"],
  "createdAt": "2026-02-24T10:30:00.000Z"
}
```

Event types: `tweet.new`, `tweet.quote`, `tweet.reply`, `tweet.retweet`, `webhook.test`.

Returns `409 monitor_already_exists` if the username is already monitored.

### List Monitors

```
GET /monitors
```

Returns all monitors (up to 200, no pagination). Response includes `monitors` array and `total` count.

### Get Monitor

```
GET /monitors/{id}
```

### Update Monitor

```
PATCH /monitors/{id}
```

**Body:** `{ "eventTypes": [...], "isActive": true|false }` (both optional)

### Delete Monitor

```
DELETE /monitors/{id}
```

Stops tracking and deletes all associated data.

---

## Events

### List Events

```
GET /events
```

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `monitorId` | string | Filter by monitor ID |
| `eventType` | string | Filter by event type |
| `limit` | number | Results per page (1-100, default 50) |
| `after` | string | Cursor for next page |

**Response:**
```json
{
  "events": [
    {
      "id": "9010",
      "type": "tweet.new",
      "monitorId": "7",
      "username": "elonmusk",
      "occurredAt": "2026-02-24T16:45:00.000Z",
      "data": {
        "tweetId": "1893556789012345678",
        "text": "Hello world",
        "metrics": { "likes": 3200, "retweets": 890, "replies": 245 }
      }
    }
  ],
  "hasMore": true,
  "nextCursor": "MjAyNi0wMi0yNFQxNjozMDowMC4wMDBa..."
}
```

### Get Event

```
GET /events/{id}
```

Returns a single event with full details.

---

## Webhooks

### Create Webhook

```
POST /webhooks
```

**Body:**
```json
{
  "url": "https://your-server.com/webhook",
  "eventTypes": ["tweet.new", "tweet.reply"]
}
```

**Response** includes a `secret` field (shown only once). Store it for signature verification.

### List Webhooks

```
GET /webhooks
```

Returns all webhooks (up to 200). Secret is never exposed in list responses.

### Update Webhook

```
PATCH /webhooks/{id}
```

**Body:** `{ "url": "...", "eventTypes": [...], "isActive": true|false }` (all optional)

### Delete Webhook

```
DELETE /webhooks/{id}
```

Permanently removes the webhook. All future deliveries are stopped.

### Test Webhook

```
POST /webhooks/{id}/test
```

Sends a `webhook.test` event to the webhook endpoint, HMAC-signed with the webhook's secret. Returns success or failure status with HTTP response details.

**Payload delivered to your endpoint:**
```json
{
  "eventType": "webhook.test",
  "data": {
    "message": "Test delivery from Xquik"
  },
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

The delivery includes the `X-Xquik-Signature` header, identical to production deliveries.

Returns `400 webhook_inactive` if the webhook is disabled. Reactivate via `PATCH /webhooks/{id}` before testing.

### List Deliveries

```
GET /webhooks/{id}/deliveries
```

View delivery attempts and statuses for a webhook. Statuses: `pending`, `delivered`, `failed`, `exhausted`.

---

## Draws

### Create Draw

```
POST /draws
```

Run a giveaway draw from a tweet. Picks random winners from replies.

**Body:**
```json
{
  "tweetUrl": "https://x.com/user/status/1893456789012345678",
  "winnerCount": 3,
  "backupCount": 2,
  "uniqueAuthorsOnly": true,
  "mustRetweet": true,
  "mustFollowUsername": "burakbayir",
  "filterMinFollowers": 100,
  "filterAccountAgeDays": 30,
  "filterLanguage": "en",
  "requiredKeywords": ["giveaway"],
  "requiredHashtags": ["#contest"],
  "requiredMentions": ["@xquik"]
}
```

All filter fields are optional. Only `tweetUrl` is required.

**Response:**
```json
{
  "id": "42",
  "tweetId": "1893456789012345678",
  "tweetUrl": "https://x.com/user/status/1893456789012345678",
  "tweetText": "Like & RT to enter! Picking 3 winners tomorrow.",
  "tweetAuthorUsername": "xquik",
  "tweetLikeCount": 4200,
  "tweetRetweetCount": 1800,
  "tweetReplyCount": 1500,
  "tweetQuoteCount": 120,
  "status": "completed",
  "totalEntries": 1500,
  "validEntries": 890,
  "createdAt": "2026-02-24T10:00:00.000Z",
  "drawnAt": "2026-02-24T10:01:00.000Z"
}
```

### List Draws

```
GET /draws
```

Cursor-paginated. Returns compact draw objects.

### Get Draw

```
GET /draws/{id}
```

Returns full draw details including winners.

### Export Draw

```
GET /draws/{id}/export?format=csv&type=winners
```

Formats: `csv`, `json`, `md`, `md-document`, `pdf`, `txt`, `xlsx`. Types: `winners` (default), `entries`. Entry exports capped at 100,000 rows (PDF capped at 10,000).

---

## Extractions

### Create Extraction

```
POST /extractions
```

Run a bulk data extraction job. See `references/extractions.md` for all 23 tool types.

**Body:**
```json
{
  "toolType": "reply_extractor",
  "targetTweetId": "1893704267862470862",
  "resultsLimit": 500
}
```

`resultsLimit` (optional): Maximum results to extract. Stops early instead of fetching all data. Useful for controlling costs.

**Tweet Search Filters** (`tweet_search_extractor` only):

| Field | Type | Description |
|-------|------|-------------|
| `fromUser` | string | Author username |
| `toUser` | string | Directed to user |
| `mentioning` | string | Mentions user |
| `language` | string | Language code (e.g., `en`) |
| `sinceDate` | string | Start date (YYYY-MM-DD) |
| `untilDate` | string | End date (YYYY-MM-DD) |
| `mediaType` | string | `images`, `videos`, `gifs`, or `media` |
| `minFaves` | number | Minimum likes |
| `minRetweets` | number | Minimum retweets |
| `minReplies` | number | Minimum replies |
| `verifiedOnly` | boolean | Verified authors only |
| `replies` | string | `include`, `exclude`, or `only` |
| `retweets` | string | `include`, `exclude`, or `only` |
| `exactPhrase` | string | Exact match text |
| `excludeWords` | string | Comma-separated words to exclude |
| `advancedQuery` | string | Raw X search operators appended to query |

These filters are converted to X search operators and combined with `searchQuery`.

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "toolType": "reply_extractor",
  "status": "running"
}
```

### Estimate Extraction

```
POST /extractions/estimate
```

Preview the cost before running. Same body as create.

**Response:**
```json
{
  "allowed": true,
  "source": "replyCount",
  "estimatedResults": 150,
  "usagePercent": 45,
  "projectedPercent": 48
}
```

### List Extractions

```
GET /extractions
```

Cursor-paginated. Filter by `status` and `toolType`.

### Get Extraction

```
GET /extractions/{id}
```

Returns job details with paginated results (up to 1,000 per page).

### Export Extraction

```
GET /extractions/{id}/export?format=csv
```

Formats: `csv`, `json`, `md`, `md-document`, `pdf`, `txt`, `xlsx`. 100,000 row limit (PDF 10,000). Exports include enrichment columns not in the API response.

---

## X API (Direct Lookups)

Metered operations that count toward the monthly quota.

### Get Tweet

```
GET /x/tweets/{id}
```

Returns full tweet with engagement metrics (likes, retweets, replies, quotes, views, bookmarks), author info (username, followers, verified status, profile picture), and optional attached media (photos/videos with URLs).

### Get Article

```
GET /x/articles/{id}
```

Retrieve the full content of an X Article (long-form post) by tweet ID. Returns title, body text with block-level formatting, cover image, inline images, and engagement metrics. Metered.

**Response:**
```json
{
  "title": "Why AI Will Transform Everything",
  "coverImage": "https://pbs.twimg.com/...",
  "bodyHtml": "<p>The future of AI...</p>",
  "likeCount": 5200,
  "retweetCount": 890,
  "replyCount": 245,
  "viewCount": 150000,
  "bookmarkCount": 1200,
  "author": {
    "id": "44196397",
    "username": "elonmusk",
    "name": "Elon Musk"
  }
}
```

### Search Tweets

```
GET /x/tweets/search?q={query}
```

Search using X syntax: keywords, `#hashtags`, `from:user`, `to:user`, `"exact phrases"`, `OR`, `-exclude`.

Returns tweet info with optional engagement metrics (likeCount, retweetCount, replyCount) and optional attached media. Some fields may be omitted if unavailable.

### Get User

```
GET /x/users/{username}
```

Returns profile info. Fields `id`, `username`, `name` are always present. All other fields (`description`, `followers`, `following`, `verified`, `profilePicture`, `location`, `createdAt`, `statusesCount`) are optional and omitted when unavailable.

### Check Follower

```
GET /x/followers/check?source={username}&target={username}
```

Returns `isFollowing` and `isFollowedBy` for both directions.

### Get User Tweets

```
GET /x/users/{id}/tweets
```

Get a user's recent tweets by user ID. Metered (1 credit/tweet).

### Get User Likes

```
GET /x/users/{id}/likes
```

Get tweets liked by a user. Metered (1 credit/result).

### Get User Media

```
GET /x/users/{id}/media
```

Get a user's media tweets (tweets containing photos/videos). Metered (1 credit/result).

### Get Tweet Favoriters

```
GET /x/tweets/{id}/favoriters
```

Get users who liked a tweet. Metered (1 credit/result).

### Get Mutual Followers

```
GET /x/users/{id}/followers-you-know
```

Get mutual followers (followers you know). Metered (1 credit/result).

### Get Bookmarks

```
GET /x/bookmarks
```

Get bookmarked tweets. Requires a connected X account. Metered (1 credit/result).

**Sensitive:** Returns private data. Confirm with user before calling.

### Get Bookmark Folders

```
GET /x/bookmarks/folders
```

Get bookmark folders. Requires a connected X account. Metered (1 credit).

### Get Notifications

```
GET /x/notifications
```

Get notifications with type filter. Requires a connected X account. Metered (1 credit/result).

**Sensitive:** Returns private data. Confirm with user before calling.

### Get Home Timeline

```
GET /x/timeline
```

Get home timeline. Requires a connected X account. Metered (1 credit/result).

**Sensitive:** Returns private data. Confirm with user before calling.

---

## X Media (Download)

### Download Media

```
POST /x/media/download
```

Download images, videos, and GIFs from tweets. Single or bulk (up to 50). Returns a shareable gallery URL.

**Body:** Provide either `tweetInput` (single tweet) or `tweetIds` (bulk). Exactly 1 is required.

| Field | Type | Description |
|-------|------|-------------|
| `tweetInput` | string | Tweet URL or numeric tweet ID for a single download. Accepts `x.com` and `twitter.com` URL formats |
| `tweetIds` | string[] | Array of tweet URLs or IDs for bulk download. Maximum 50 items. Returns a single combined gallery |

**Response (single):**
```json
{
  "tweetId": "1893456789012345678",
  "galleryUrl": "https://xquik.com/gallery/abc123",
  "cacheHit": false
}
```

**Response (bulk):**
```json
{
  "galleryUrl": "https://xquik.com/gallery/def456",
  "totalTweets": 3,
  "totalMedia": 7
}
```

First download is metered (counts toward monthly quota). Subsequent requests for the same tweet return cached URLs at no cost (`cacheHit: true`). All downloads are saved to the gallery at `https://xquik.com/gallery`.

Returns `400 no_media` if the tweet has no downloadable media. Returns `400 too_many_tweets` if bulk array exceeds 50 items.

---

## Trends

### List Trends

```
GET /trends?woeid=1&count=30
```

Metered. Subscription required. Cached, refreshes every 15 minutes.

**WOEIDs:** 1 (Worldwide), 23424977 (US), 23424975 (UK), 23424969 (Turkey), 23424950 (Spain), 23424829 (Germany), 23424819 (France), 23424856 (Japan), 23424848 (India), 23424768 (Brazil), 23424775 (Canada), 23424900 (Mexico).

**Response:**
```json
{
  "trends": [
    { "name": "#AI", "description": "...", "rank": 1, "query": "#AI" }
  ],
  "total": 30,
  "woeid": 1
}
```

---

## Radar

### List Radar Items

```
GET /radar
```

Get trending topics and news from 7 sources: Google Trends, Hacker News, Polymarket, TrustMRR, Wikipedia, GitHub Trending, Reddit. Free.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `source` | string | Filter by source: `google_trends`, `hacker_news`, `polymarket`, `trustmrr`, `wikipedia`, `github`, `reddit` |
| `category` | string | Filter by category: `general`, `tech`, `dev`, `science`, `culture`, `politics`, `business`, `entertainment` |
| `limit` | number | Items per page (1-100, default 50) |
| `hours` | number | Look-back window in hours (1-72, default 6) |
| `region` | string | Region code: `US`, `GB`, `TR`, `ES`, `DE`, `FR`, `JP`, `IN`, `BR`, `CA`, `MX`, `global` (default) |

**Response:**
```json
{
  "items": [
    {
      "id": "12345",
      "title": "Claude 4.6 Released",
      "description": "Anthropic releases Claude 4.6...",
      "url": "https://example.com/article",
      "imageUrl": "https://example.com/image.png",
      "source": "hacker_news",
      "sourceId": "hn_12345",
      "category": "tech",
      "region": "global",
      "language": "en",
      "score": 450,
      "metadata": { "points": 450, "numberComments": 132, "author": "pgdev" },
      "publishedAt": "2026-03-05T10:00:00.000Z",
      "createdAt": "2026-03-05T10:05:00.000Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "NDUwfDIwMjYtMDMtMDRUMDg6MzA6MDAuMDAwWnwxMjM0NQ=="
}
```

Fields: `id`, `title`, `description?`, `url?`, `imageUrl?`, `source`, `sourceId`, `category`, `region`, `language`, `score`, `metadata`, `publishedAt`, `createdAt`. Response includes `hasMore` and `nextCursor` for pagination.

---

## Compose

### Compose Tweet

```
POST /compose
```

Compose, refine, and score tweets using X algorithm data. Free, 3-step workflow.

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step` | string | Yes | `compose`, `refine`, or `score` |
| `topic` | string | No | Tweet topic (compose, refine) |
| `goal` | string | No | `engagement`, `followers`, `authority`, `conversation` |
| `styleUsername` | string | No | Cached style username for voice matching (compose) |
| `tone` | string | No | Desired tone (refine) |
| `additionalContext` | string | No | Extra context or URLs (refine) |
| `callToAction` | string | No | Desired CTA (refine) |
| `mediaType` | string | No | `photo`, `video`, `none` (refine) |
| `draft` | string | No | Tweet text to evaluate (score) |
| `hasLink` | boolean | No | Link attached (score) |
| `hasMedia` | boolean | No | Media attached (score) |

**Response (step=compose):** Returns `contentRules`, `scorerWeights`, `followUpQuestions`, `algorithmInsights`, `engagementMultipliers`, `topPenalties`.

**Response (step=refine):** Returns `compositionGuidance`, `examplePatterns`.

**Response (step=score):** Returns `totalChecks`, `passedCount`, `topSuggestion`, `checklist[]` with `factor`, `passed`, `suggestion`.

---

## Drafts

### Create Draft

`POST /drafts`

Save a tweet draft for later.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The draft tweet text |
| `topic` | string | No | Topic the tweet is about |
| `goal` | string | No | Optimization goal: `engagement`, `followers`, `authority`, `conversation` |

**Response (201):**

```json
{
  "id": "123",
  "text": "draft text",
  "topic": "product launch",
  "goal": "engagement",
  "createdAt": "2026-02-24T10:30:00.000Z",
  "updatedAt": "2026-02-24T10:30:00.000Z"
}
```

---

### List Drafts

`GET /drafts`

List saved tweet drafts with cursor pagination.

**Query parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Results per page (max 50) |
| `afterCursor` | string | No | - | Pagination cursor from previous response |

**Response (200):**

```json
{
  "drafts": [
    {
      "id": "123",
      "text": "draft text",
      "topic": "product launch",
      "goal": "engagement",
      "createdAt": "2026-02-24T10:30:00.000Z",
      "updatedAt": "2026-02-24T10:30:00.000Z"
    }
  ],
  "afterCursor": "cursor_string",
  "hasMore": true
}
```

---

### Get Draft

`GET /drafts/{id}`

Get a specific draft by ID.

**Response (200):** Single draft object.

**Errors:** `400 invalid_id`, `404 draft_not_found`

---

### Delete Draft

`DELETE /drafts/{id}`

Delete a draft. Returns `204 No Content`.

**Errors:** `400 invalid_id`, `404 draft_not_found`

---

## Tweet Style Cache

### Analyze & Cache Style

`POST /styles`

Fetch recent tweets from an X account and cache them for style analysis. **Consumes API usage credits.**

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | X username to analyze (without @) |

**Response (201):**

```json
{
  "xUsername": "elonmusk",
  "tweetCount": 20,
  "isOwnAccount": false,
  "fetchedAt": "2026-02-24T10:30:00.000Z",
  "tweets": [
    {
      "id": "1893456789012345678",
      "text": "The future is now.",
      "authorUsername": "elonmusk",
      "createdAt": "2026-02-24T14:22:00.000Z"
    }
  ]
}
```

---

### List Cached Styles

`GET /styles`

List all cached tweet style profiles. Max 200 results, ordered by fetch date.

**Response (200):**

```json
{
  "styles": [
    {
      "xUsername": "elonmusk",
      "tweetCount": 20,
      "isOwnAccount": false,
      "fetchedAt": "2026-02-24T10:30:00.000Z"
    }
  ]
}
```

---

### Save Custom Style

`PUT /styles/{username}`

Save a custom style profile from tweet texts. Free, no usage cost. Replaces existing style if one exists with the same label.

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Style label name (1-30 characters) |
| `tweets` | object[] | Yes | Array of tweet objects (1-100). Each must have a `text` field |

**Response (200):** Style object with label, `tweetCount`, `isOwnAccount: false`, `fetchedAt`, and `tweets` array.

**Errors:** `400 invalid_input`

---

### Get Cached Style

`GET /styles/{username}`

Get a cached style profile with full tweet data.

**Response (200):** Full style object with `tweets` array.

**Errors:** `404 style_not_found`

---

### Delete Cached Style

`DELETE /styles/{username}`

Delete a cached style. Returns `204 No Content`.

**Errors:** `404 style_not_found`

---

### Compare Styles

`GET /styles/compare?username1=A&username2=B`

Compare two cached tweet style profiles side by side.

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username1` | string | Yes | First X username |
| `username2` | string | Yes | Second X username |

**Response (200):**

```json
{
  "style1": { "xUsername": "user1", "tweetCount": 20, "isOwnAccount": true, "fetchedAt": "...", "tweets": [...] },
  "style2": { "xUsername": "user2", "tweetCount": 15, "isOwnAccount": false, "fetchedAt": "...", "tweets": [...] }
}
```

**Errors:** `400 missing_params`, `404 style_not_found`

---

### Analyze Performance

`GET /styles/{username}/performance`

Get live engagement metrics for cached tweets. **Consumes API usage credits.**

**Response (200):**

```json
{
  "xUsername": "elonmusk",
  "tweetCount": 20,
  "tweets": [
    {
      "id": "1893456789012345678",
      "text": "The future is now.",
      "likeCount": 42000,
      "retweetCount": 8500,
      "replyCount": 3200,
      "quoteCount": 1100,
      "viewCount": 5000000,
      "bookmarkCount": 2400
    }
  ]
}
```

**Errors:** `404 style_not_found`

---

## Account Identity

### Set X Identity

`PUT /account/x-identity`

Link your X username to your Xquik account. Required for own-account detection in style analysis.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Your X username (without @) |

**Response (200):**

```json
{
  "success": true,
  "xUsername": "elonmusk"
}
```

**Errors:** `400 invalid_input`

---

## Subscribe

### Get Subscription Link

```
POST /subscribe
```

Returns a checkout URL for subscribing or managing the subscription. If already subscribed, returns the billing portal URL.

**Response:**
```json
{
  "url": "https://checkout.xquik.com/..."
}
```

---

## X Accounts (Connected)

Manage connected X accounts for write actions. All endpoints are free (no usage cost).

**Connecting or re-authenticating an X account is done by the user in the Xquik dashboard** at [xquik.com/dashboard/account](https://xquik.com/dashboard/account), not via this skill. The skill never handles X login credentials. The agent should direct the user to the dashboard when a new account needs to be connected or an existing session needs to be refreshed.

### List X Accounts

```
GET /x/accounts
```

Returns all connected X accounts. Response: `{ accounts: [{ id, username, displayName, isActive, createdAt }] }`.

### Get X Account

```
GET /x/accounts/{id}
```

Returns `{ id, username, displayName, isActive, createdAt }`.

### Disconnect X Account

```
DELETE /x/accounts/{id}
```

Permanently removes the account from Xquik. Returns `{ success: true }`. Before calling, confirm with the user.

---

## X Write

Write actions performed through connected X accounts. All endpoints are metered. Every request requires an `account` field (username or account ID) identifying which connected account to use.

### Create Tweet

```
POST /x/tweets
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `account` | string | Yes | Connected X username or account ID |
| `text` | string | Yes | Tweet text (280 chars, or 25,000 if `is_note_tweet` is true) |
| `reply_to_tweet_id` | string | No | Tweet ID to reply to |
| `attachment_url` | string | No | URL to attach as a card |
| `community_id` | string | No | Community ID to post into |
| `is_note_tweet` | boolean | No | Long-form note tweet (up to 25,000 chars) |
| `media_ids` | string[] | No | Media IDs from `POST /x/media` (max 4 images or 1 video) |

**Response:** `{ tweetId, success: true }`

**Errors:** `502 x_write_failed`

### Delete Tweet

```
DELETE /x/tweets/{id}
```

**Body:** `{ "account": "username" }`

**Response:** `{ success: true }`

### Like Tweet

```
POST /x/tweets/{id}/like
```

**Body:** `{ "account": "username" }`

### Unlike Tweet

```
DELETE /x/tweets/{id}/like
```

**Body:** `{ "account": "username" }`

### Retweet

```
POST /x/tweets/{id}/retweet
```

**Body:** `{ "account": "username" }`

### Follow User

```
POST /x/users/{id}/follow
```

**Body:** `{ "account": "username" }`

**Errors:** `502 x_write_failed`

### Unfollow User

```
DELETE /x/users/{id}/follow
```

**Body:** `{ "account": "username" }`

### Send DM

```
POST /x/dm/{userId}
```

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `account` | string | Yes | Connected X username or account ID |
| `text` | string | Yes | Message text |
| `media_ids` | string[] | No | Media IDs to attach |
| `reply_to_message_id` | string | No | Message ID to reply to |

### Get DM History

```
GET /x/dm/{userId}/history
```

Get DM conversation history with a user. Requires a connected X account. Metered (1 credit/result).

**Sensitive:** Returns private DM conversations. Confirm with user before calling. Do not forward to other tools without consent.

### Update Profile

```
PATCH /x/profile
```

**Body:** `{ "account": "username", "name": "...", "description": "...", "location": "...", "url": "..." }` (account required, others optional)

### Update Avatar

```
PATCH /x/profile/avatar
```

Update profile avatar. Max 700 KB, GIF/JPEG/PNG. Metered (10 credits).

**Body:** FormData with `account` (required) and `file` (required, max 700 KB).

### Update Banner

```
PATCH /x/profile/banner
```

Update profile banner. Max 2 MB, GIF/JPEG/PNG. Metered (10 credits).

**Body:** FormData with `account` (required) and `file` (required, max 2 MB).

### Upload Media

```
POST /x/media
```

**Body:** FormData with `account` (required), `file` (required), and `is_long_video` (optional boolean). Alternatively, JSON body with `account` (required) and `url` (required, direct media URL) for URL-based upload.

**Response:** Returns a media ID to pass in `media_ids` when creating a tweet.

### Create Community

```
POST /x/communities
```

**Body:** `{ "account": "username", "name": "...", "description": "..." }` (all required)

### Delete Community

```
DELETE /x/communities/{id}
```

**Body:** `{ "account": "username", "community_name": "..." }` (name required for confirmation)

### Join Community

```
POST /x/communities/{id}/join
```

**Body:** `{ "account": "username" }`

**Errors:** `409 already_member`

### Leave Community

```
DELETE /x/communities/{id}/join
```

**Body:** `{ "account": "username" }`

---

## Credits

### Get Credit Balance

```
GET /credits
```

Get credit balance, lifetime purchased/used, and auto top-up status. Free.

### Top Up Credits

```
POST /credits/topup
```

Get a checkout URL to purchase credits ($10 minimum). Free.

---

## Support

### Create Ticket

```
POST /support/tickets
```

**Body:** `{ "subject": "...", "body": "..." }`

**Response (201):** `{ id, subject, status, createdAt }`

### List Tickets

```
GET /support/tickets
```

Returns all tickets for the authenticated user.

### Get Ticket

```
GET /support/tickets/{id}
```

Returns ticket with messages.

### Update Ticket

```
PATCH /support/tickets/{id}
```

Update ticket status.

### Reply to Ticket

```
POST /support/tickets/{id}/messages
```

**Body:** `{ "body": "..." }`

Add a message to an existing ticket.

---

## Error Codes

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `invalid_input` | Request body failed validation |
| 400 | `invalid_id` | Path parameter is not a valid ID |
| 400 | `invalid_json` | Invalid JSON in request body |
| 400 | `invalid_tweet_url` | Tweet URL format is invalid |
| 400 | `invalid_tweet_id` | Tweet ID is empty or invalid |
| 400 | `invalid_username` | X username is empty or invalid |
| 400 | `invalid_tool_type` | Extraction tool type not recognized |
| 400 | `invalid_format` | Export format not `csv`, `json`, `md`, `md-document`, `pdf`, `txt`, or `xlsx` |
| 400 | `invalid_params` | Export query parameters are missing or invalid |
| 400 | `missing_query` | Required query parameter is missing |
| 400 | `missing_params` | Required query parameters are missing |
| 400 | `no_media` | Tweet has no downloadable media |
| 400 | `webhook_inactive` | Webhook is disabled (test-webhook only) |
| 401 | `unauthenticated` | Missing or invalid API key |
| 403 | `account_needs_reauth` | X account session expired, re-authenticate |
| 402 | `no_subscription` | No active subscription |
| 402 | `subscription_inactive` | Subscription is not active |
| 402 | `usage_limit_reached` | Monthly usage cap exceeded |
| 402 | `extra_usage_disabled` | Extra usage not enabled |
| 402 | `extra_usage_requires_v2` | Extra usage requires the new pricing plan |
| 402 | `frozen` | Extra usage paused, outstanding payment required |
| 402 | `overage_limit_reached` | Overage spending limit reached |
| 402 | `no_addon` | No monitor addon on subscription |
| 403 | `monitor_limit_reached` | Plan monitor limit exceeded |
| 403 | `api_key_limit_reached` | API key limit reached (100 max) |
| 404 | `not_found` | Resource does not exist |
| 404 | `user_not_found` | X user not found |
| 404 | `tweet_not_found` | Tweet not found |
| 404 | `style_not_found` | No cached style found |
| 404 | `draft_not_found` | Draft not found |
| 409 | `monitor_already_exists` | Duplicate monitor for same username |
| 422 | `login_failed` | X credential verification failed |
| 429 | - | Rate limited. Retry with backoff |
| 429 | `x_api_rate_limited` | X data source rate limited. Retry |
| 500 | `internal_error` | Server error |
| 502 | `stream_registration_failed` | Stream registration failed. Retry |
| 502 | `x_api_unavailable` | X data source temporarily unavailable |
| 502 | `x_api_unauthorized` | X data source authentication failed. Retry |
