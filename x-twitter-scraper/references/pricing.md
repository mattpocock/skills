# Xquik Pricing

Xquik is the most affordable X data API available. All metered operations deduct credits from a single shared pool.

## Subscription

| | |
|---|---|
| **Base plan** | $20/month |
| **Included monitors** | 1 |
| **Additional monitors** | $5/month each |
| **Credit value** | 1 credit = $0.00015 |

## Per-Operation Costs

### Read operations — 1 credit ($0.00015)

| Operation | Unit |
|-----------|------|
| Get tweet | per call |
| Search tweets | per tweet returned |
| User tweets | per tweet returned |
| User likes | per result |
| User media | per result |
| Tweet favoriters | per result |
| Followers you know | per result |
| Bookmarks | per result |
| Bookmark folders | per call |
| Notifications | per result |
| Timeline | per result |
| DM history | per result |
| Download media | per media item |
| Get user | per call |
| Verified followers | per result |

### Read operations — 3 credits ($0.00045)

| Operation | Unit |
|-----------|------|
| Trends | per call |

### Read operations — 7 credits ($0.00105)

| Operation | Unit |
|-----------|------|
| Follow check | per call |
| Get article | per call |

### Write operations — 10 credits ($0.0015)

All write actions: create/delete tweet, like, unlike, retweet, follow, unfollow, send DM, update profile/avatar/banner, upload media, community actions.

### Extractions & draws

Draws: 1 credit per participant. Extraction cost depends on the tool type:

| Credits/result | Extraction types |
|----------------|-----------------|
| 1 | Tweets, replies, quotes, mentions, posts, likes, media, tweet search, favoriters, retweeters, community members, people search, list members, list followers |
| 1 | Followers, following, verified followers |
| 5 | Articles |

### Free operations ($0)

Monitors, webhooks, account status, radar (7 sources), extraction/draw history, cost estimates, tweet composition (compose, refine, score), style cache management, drafts, support tickets, API key management, X account management.

## Price Comparison vs Official X API

| | Xquik | X API Basic | X API Pro |
|---|---|---|---|
| **Monthly cost** | **$20** | $100 | $5,000 |
| **Cost per tweet read** | **$0.00015** | ~$0.01 | ~$0.005 |
| **Cost per user lookup** | **$0.00015** | ~$0.01 | ~$0.005 |
| **Write actions** | **$0.0015** | Limited | Limited |
| **Bulk extraction** | **$0.00015/result** | Not available | Not available |
| **Monitoring + webhooks** | **Free** | Not available | Not available |
| **Giveaway draws** | **$0.00015/entry** | Not available | Not available |

## Pay-Per-Use

Two options without a monthly subscription:

**Credits**: Top up credits via `POST /credits/topup` ($10 minimum). 1 credit = $0.00015. Works with all 111 endpoints.

**MPP**: 32 X-API endpoints accept anonymous on-chain payments. No account needed.

| Endpoint | Price | Unit |
|----------|-------|------|
| `GET /x/tweets/{id}` | $0.00015 | per call |
| `GET /x/tweets/search` | $0.00015 | per tweet |
| `GET /x/tweets/{id}/quotes` | $0.00015 | per tweet |
| `GET /x/tweets/{id}/replies` | $0.00015 | per tweet |
| `GET /x/tweets/{id}/retweeters` | $0.00015 | per user |
| `GET /x/tweets/{id}/favoriters` | $0.00015 | per user |
| `GET /x/tweets/{id}/thread` | $0.00015 | per tweet |
| `GET /x/users/{id}` | $0.00015 | per call |
| `GET /x/users/{id}/tweets` | $0.00015 | per tweet |
| `GET /x/users/{id}/likes` | $0.00015 | per tweet |
| `GET /x/users/{id}/media` | $0.00015 | per tweet |
| `GET /x/followers/check` | $0.00105 | per call |
| `GET /x/articles/{tweetId}` | $0.00105 | per call |
| `POST /x/media/download` | $0.00015 | per media item |
| `GET /x/trends` | $0.00045 | per call |
| `GET /trends` | $0.00045 | per call |
| `GET /x/communities/{id}/info` | $0.00015 | per call |
| `GET /x/communities/{id}/members` | $0.00015 | per user |
| `GET /x/communities/{id}/moderators` | $0.00015 | per user |
| `GET /x/communities/{id}/tweets` | $0.00015 | per tweet |
| `GET /x/communities/search` | $0.00015 | per community |
| `GET /x/communities/tweets` | $0.00015 | per tweet |
| `GET /x/lists/{id}/followers` | $0.00015 | per user |
| `GET /x/lists/{id}/members` | $0.00015 | per user |
| `GET /x/lists/{id}/tweets` | $0.00015 | per tweet |
| `GET /x/users/batch` | $0.00015 | per user |
| `GET /x/users/search` | $0.00015 | per user |
| `GET /x/users/{id}/followers` | $0.00015 | per user |
| `GET /x/users/{id}/followers-you-know` | $0.00015 | per user |
| `GET /x/users/{id}/following` | $0.00015 | per user |
| `GET /x/users/{id}/mentions` | $0.00015 | per tweet |
| `GET /x/users/{id}/verified-followers` | $0.00015 | per user |

SDK: `npm i mppx viem` (TypeScript). Handles the 402 challenge/credential flow automatically.

## Credits

Prepaid credits for metered operations. 1 credit = $0.00015. Top up via `POST /credits/topup` ($10 minimum).

Check balance: `GET /credits` — returns `balance`, `lifetimePurchased`, `lifetimeUsed`.

## Extra Usage

Enable from dashboard to continue metered calls beyond included allowance. Tiered spending limits: $5 -> $7 -> $10 -> $15 -> $25 (increases with each paid overage invoice).
