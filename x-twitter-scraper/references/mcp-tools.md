# Xquik MCP Tools Reference

The MCP server at `https://xquik.com/mcp` provides 2 structured API tools. The agent sends API requests through the server, which handles authentication and execution. All requests stay within the same first-party trust boundary as the REST API (`xquik.com/api/v1`).

## Tools

| Tool | Description | Cost |
|------|-------------|------|
| `explore` | Search the API endpoint catalog (read-only, no network calls) | Free |
| `xquik` | Execute API calls against your account | Varies by endpoint |

### `explore` — Search the API Spec

The tool provides an in-memory `spec.endpoints` array. Filter/search it to find endpoints before calling them.

```typescript
interface EndpointInfo {
  method: string;
  path: string;
  summary: string;
  category: string; // account, composition, credits, extraction, media, monitoring, support, twitter, x-accounts, x-write
  free: boolean;
  parameters?: Array<{ name: string; in: 'query' | 'path' | 'body'; required: boolean; type: string; description: string }>;
  responseShape?: string;
}

declare const spec: { endpoints: EndpointInfo[] };
```

Examples:

```javascript
// Find all free endpoints
async () => spec.endpoints.filter(e => e.free);

// Find endpoints by category
async () => spec.endpoints.filter(e => e.category === 'x-write');

// Search by keyword
async () => spec.endpoints.filter(e => e.summary.toLowerCase().includes('tweet'));
```

### `xquik` — Execute API Calls

The tool provides `xquik.request()` with auth injected automatically. Never pass API keys.

```typescript
declare const xquik: {
  request(path: string, options?: {
    method?: string;  // default: 'GET'
    body?: unknown;
    query?: Record<string, string>;
  }): Promise<unknown>;
};
declare const spec: { endpoints: EndpointInfo[] };
```

## Tool Selection Rules

Use `explore` first to find endpoints, then `xquik` to call them.

| Goal | Endpoint (via `xquik`) |
|------|------------------------|
| Single tweet by ID or URL | `GET /api/v1/x/tweets/{id}` |
| Full X Article by tweet ID | `GET /api/v1/x/articles/{id}` |
| Search tweets by keyword/hashtag | `GET /api/v1/x/tweets/search?q=...` |
| User profile, bio, follower counts | `GET /api/v1/x/users/{username}` |
| Download media from tweets | `POST /api/v1/x/media/download` |
| Check follow relationship | `GET /api/v1/x/followers/check?source=A&target=B` |
| Trending topics by region (X) | `GET /api/v1/trends?woeid=1` |
| Trending news from 7 sources | `GET /api/v1/radar` (via `xquik` tool) |
| Activity from monitored accounts | `GET /api/v1/events` |
| Budget, plan, usage percent | `GET /api/v1/account` |
| Monitor an X account | `POST /api/v1/monitors` |
| Set up webhook notifications | `POST /api/v1/webhooks` |
| Run a giveaway draw | `POST /api/v1/draws` |
| Subscribe or manage billing | `POST /api/v1/subscribe` |
| Compose/draft a tweet | `POST /api/v1/compose` (3-step: compose, refine, score) |
| Link your X username | `PUT /api/v1/account/x-identity` |
| Analyze tweet style | `POST /api/v1/styles` |
| Get cached style | `GET /api/v1/styles/{username}` |
| Compare two styles | `GET /api/v1/styles/compare` |
| Post a tweet | `POST /api/v1/x/tweets` (requires connected account) |
| Like/unlike a tweet | `POST`/`DELETE /api/v1/x/tweets/{id}/like` |
| Retweet | `POST /api/v1/x/tweets/{id}/retweet` |
| Follow/unfollow | `POST`/`DELETE /api/v1/x/users/{id}/follow` |
| Send a DM | `POST /api/v1/x/dm/{userId}` |
| Upload media | `POST /api/v1/x/media` |
| Open support ticket | `POST /api/v1/support/tickets` |
| List support tickets | `GET /api/v1/support/tickets` |
| Get user's recent tweets | `GET /api/v1/x/users/{id}/tweets` |
| Get user's liked tweets | `GET /api/v1/x/users/{id}/likes` |
| Get user's media tweets | `GET /api/v1/x/users/{id}/media` |
| Get tweet favoriters (who liked) | `GET /api/v1/x/tweets/{id}/favoriters` |
| Get mutual followers | `GET /api/v1/x/users/{id}/followers-you-know` |
| Get bookmarks | `GET /api/v1/x/bookmarks` |
| Get bookmark folders | `GET /api/v1/x/bookmarks/folders` |
| Get notifications | `GET /api/v1/x/notifications` |
| Get home timeline | `GET /api/v1/x/timeline` |
| Get DM history | `GET /api/v1/x/dm/{userId}/history` |
| Check credit balance | `GET /api/v1/credits` |
| Top up credits | `POST /api/v1/credits/topup` |

Use `POST /api/v1/extractions` ONLY for bulk data that simpler endpoints cannot provide (all followers, all replies to a tweet, community members, etc.). Always call `POST /api/v1/extractions/estimate` first.

## Workflow Patterns

| Workflow | Steps |
|----------|-------|
| **Set up real-time alerts** | `POST /monitors` -> `POST /webhooks` -> `POST /webhooks/{id}/test` |
| **Run a giveaway** | `GET /account` -> `POST /draws` |
| **Bulk extraction** | `POST /extractions/estimate` -> `POST /extractions` -> `GET /extractions/{id}` |
| **Compose optimized tweet** | `POST /compose` (step=compose -> refine -> score) |
| **Analyze tweet style** | `POST /styles` -> `GET /styles/{username}` -> `POST /compose` with `styleUsername` |
| **Post a tweet** | `GET /x/accounts` -> `POST /x/tweets` with `account` + `text` |
| **Get trending news** | `GET /radar` (free, all 7 sources, via `xquik` tool) -> `POST /compose` with trending topic |
| **Open support ticket** | `POST /support/tickets` -> `GET /support/tickets/{id}` |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Combining free and paid calls in `Promise.all` | Call free endpoints first, then paid ones separately. A 402 in Promise.all kills all results |
| Using `compose` when user wants to send a tweet | `POST /compose` is for drafting. Use `POST /x/tweets` to send |
| Using `POST /x/tweets` when user wants help writing | Use the 3-step compose flow instead |
| Falling back to web search when API call fails | Use free data already fetched (radar, styles, compose). Never discard it |
| Not checking subscription before paid calls | Always attempt the call. Handle 402 by calling `POST /subscribe` for checkout URL |
| Passing API keys in code | Auth is injected automatically. Never include keys |
| Using `explore` for API calls | `explore` is read-only spec search. Use `xquik` for actual API calls |
| Looking up follow/DM by username | Follow and DM endpoints need numeric user ID. Look up via `GET /x/users/{username}` first |

## Unsupported Operations

These are NOT available via the MCP server:

- API key management (create, list, delete)
- File export (CSV, XLSX, Markdown)
- Account locale update
- Scheduled tweets

- Direct X search (use extraction `tweet_search_extractor` for bulk search)

## Cost Reference

- **Free**: account info, compose (all steps), styles (cached lookup/save/delete/compare), drafts, radar (via `xquik` tool, all 7 sources), subscribe, API keys, X account management, support tickets, credits (balance check, top up)
- **Subscription required**: tweet search, user lookup, tweet lookup, follow check, media download (first only, cached free), extractions, draws, style analysis (X API refresh), performance analysis, trends, all write actions (tweet, like, retweet, follow, DM, profile, media upload, communities)
