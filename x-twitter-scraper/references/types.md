# Xquik TypeScript Type Definitions

Copy-pasteable TypeScript types for all Xquik API objects.

## Contents

- [Account](#account)
- [API Keys](#api-keys)
- [Credits](#credits)
- [Monitors](#monitors)
- [Events](#events)
- [Webhooks](#webhooks)
- [Draws](#draws)
- [Extractions](#extractions)
- [X API](#x-api)
- [Trends](#trends)
- [Support](#support)
- [Error](#error)
- [Request Bodies](#request-bodies)
- [MCP Output Schemas](#mcp-output-schemas)

```typescript
// ─── Account ─────────────────────────────────────────────

interface Account {
  plan: "active" | "inactive";
  pricingVersion: number;
  monitorsAllowed: number;
  monitorsUsed: number;
  currentPeriod?: {
    start: string;
    end: string;
    usagePercent: number;
  };
}

// ─── Credits ────────────────────────────────────────────

interface CreditBalance {
  balance: number;              // Current credit balance
  lifetimePurchased: number;    // Total credits purchased
  lifetimeUsed: number;         // Total credits consumed
  autoTopUp: boolean;           // Whether auto top-up is enabled
}

interface CreditTopUpResponse {
  url: string;                  // Checkout URL
}

// ─── API Keys ────────────────────────────────────────────

interface ApiKeyCreated {
  id: string;
  fullKey: string;
  prefix: string;
  name: string;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

// ─── Monitors ────────────────────────────────────────────

interface Monitor {
  id: string;
  username: string;
  xUserId: string;
  eventTypes: EventType[];
  isActive: boolean;
  createdAt: string;
}

type EventType =
  | "tweet.new"
  | "tweet.quote"
  | "tweet.reply"
  | "tweet.retweet";

// ─── Events ──────────────────────────────────────────────

interface Event {
  id: string;
  type: EventType;
  monitorId: string;
  username: string;
  occurredAt: string;
  data: EventData;
  xEventId?: string;
}

// Tweet events (tweet.new, tweet.reply, tweet.quote, tweet.retweet)
interface TweetEventData {
  tweetId: string;
  text: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  // tweet.quote only
  quotedTweetId?: string;
  quotedUsername?: string;
  // tweet.reply only
  inReplyToTweetId?: string;
  inReplyToUsername?: string;
  // tweet.retweet only
  retweetedTweetId?: string;
  retweetedUsername?: string;
}

type EventData = TweetEventData;

interface EventList {
  events: Event[];
  hasMore: boolean;
  nextCursor?: string;
}

// ─── Webhooks ────────────────────────────────────────────

interface WebhookCreated {
  id: string;
  url: string;
  eventTypes: EventType[];
  secret: string;
  createdAt: string;
}

interface Webhook {
  id: string;
  url: string;
  eventTypes: EventType[];
  isActive: boolean;
  createdAt: string;
}

interface Delivery {
  id: string;
  streamEventId: string;
  status: "pending" | "delivered" | "failed" | "exhausted";
  attempts: number;
  lastStatusCode?: number;
  lastError?: string;
  createdAt: string;
  deliveredAt?: string;
}

interface WebhookPayload {
  eventType: EventType;
  username: string;
  data: EventData;
}

// ─── Draws ───────────────────────────────────────────────

interface Draw {
  id: string;
  tweetId: string;
  tweetUrl: string;
  tweetText: string;
  tweetAuthorUsername: string;
  tweetLikeCount: number;
  tweetRetweetCount: number;
  tweetReplyCount: number;
  tweetQuoteCount: number;
  status: "pending" | "running" | "completed" | "failed";
  totalEntries: number;
  validEntries: number;
  createdAt: string;
  drawnAt?: string;
}

interface DrawListItem {
  id: string;
  tweetUrl: string;
  status: "pending" | "running" | "completed" | "failed";
  totalEntries: number;
  validEntries: number;
  createdAt: string;
  drawnAt?: string;
}

interface DrawWinner {
  position: number;
  authorUsername: string;
  tweetId: string;
  isBackup: boolean;
}

interface DrawList {
  draws: DrawListItem[];
  hasMore: boolean;
  nextCursor?: string;
}

interface CreateDrawRequest {
  tweetUrl: string;
  winnerCount?: number;
  backupCount?: number;
  uniqueAuthorsOnly?: boolean;
  mustRetweet?: boolean;
  mustFollowUsername?: string;
  filterMinFollowers?: number;
  filterAccountAgeDays?: number;
  filterLanguage?: string;
  requiredKeywords?: string[];
  requiredHashtags?: string[];
  requiredMentions?: string[];
}

// ─── Extractions ─────────────────────────────────────────

type ExtractionToolType =
  | "article_extractor"
  | "community_extractor"
  | "community_moderator_explorer"
  | "community_post_extractor"
  | "community_search"
  | "follower_explorer"
  | "following_explorer"
  | "list_follower_explorer"
  | "list_member_extractor"
  | "list_post_extractor"
  | "mention_extractor"
  | "people_search"
  | "post_extractor"
  | "quote_extractor"
  | "reply_extractor"
  | "repost_extractor"
  | "space_explorer"
  | "thread_extractor"
  | "tweet_search_extractor"
  | "verified_follower_explorer";

interface ExtractionJob {
  id: string;
  toolType: ExtractionToolType;
  status: "pending" | "running" | "completed" | "failed";
  totalResults: number;
  targetTweetId?: string;
  targetUsername?: string;
  targetUserId?: string;
  targetCommunityId?: string;
  targetListId?: string;
  targetSpaceId?: string;
  searchQuery?: string;
  resultsLimit?: number; // Max results to extract. Stops early instead of fetching all. Omit for all.
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface ExtractionResult {
  id: string;
  xUserId: string;
  xUsername?: string;
  xDisplayName?: string;
  xFollowersCount?: number;
  xVerified?: boolean;
  xProfileImageUrl?: string;
  tweetId?: string;
  tweetText?: string;
  tweetCreatedAt?: string;
  createdAt: string;
}

interface ExtractionList {
  extractions: ExtractionJob[];
  hasMore: boolean;
  nextCursor?: string;
}

interface ExtractionEstimate {
  allowed: boolean;
  source: "replyCount" | "retweetCount" | "quoteCount" | "followers" | "unknown";
  estimatedResults: number;
  usagePercent: number;
  projectedPercent: number;
  error?: string;
}

interface CreateExtractionRequest {
  toolType: ExtractionToolType;
  targetTweetId?: string;
  targetUsername?: string;
  targetCommunityId?: string;
  targetListId?: string;
  targetSpaceId?: string;
  searchQuery?: string;
  resultsLimit?: number; // Max results to extract. Stops early instead of fetching all. Omit for all.
  // Tweet search filters (tweet_search_extractor only)
  fromUser?: string;
  toUser?: string;
  mentioning?: string;
  language?: string;
  sinceDate?: string;           // YYYY-MM-DD
  untilDate?: string;           // YYYY-MM-DD
  mediaType?: 'images' | 'videos' | 'gifs' | 'media';
  minFaves?: number;
  minRetweets?: number;
  minReplies?: number;
  verifiedOnly?: boolean;
  replies?: 'include' | 'exclude' | 'only';
  retweets?: 'include' | 'exclude' | 'only';
  exactPhrase?: string;
  excludeWords?: string;
  advancedQuery?: string;
}

// ─── X API ───────────────────────────────────────────────

interface TweetMediaItem {
  mediaUrl: string;
  type: string;       // "photo" | "video" | "animated_gif"
  url: string;
}

interface Tweet {
  id: string;
  text: string;
  createdAt?: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  bookmarkCount: number;
  media?: TweetMediaItem[];
}

interface TweetAuthor {
  id: string;
  username: string;
  followers: number;
  verified: boolean;
  profilePicture?: string;
}

interface TweetSearchResult {
  id: string;
  text: string;
  createdAt: string;
  likeCount: number;    // Omitted if unavailable
  retweetCount: number; // Omitted if unavailable
  replyCount: number;   // Omitted if unavailable
  media?: TweetMediaItem[];
  author: {
    id: string;
    username: string;
    name: string;
    verified: boolean;
  };
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  description?: string;
  followers?: number;
  following?: number;
  verified?: boolean;
  profilePicture?: string;
  location?: string;
  createdAt?: string;
  statusesCount?: number;
}

interface FollowerCheck {
  sourceUsername: string;
  targetUsername: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

// ─── User Activity ──────────────────────────────────────

interface UserTweetsResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor?: string;
}

interface UserLikesResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor?: string;
}

interface UserMediaResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor?: string;
}

interface TweetFavoritersResponse {
  users: UserProfile[];
  hasMore: boolean;
  nextCursor?: string;
}

interface FollowersYouKnowResponse {
  users: UserProfile[];
  hasMore: boolean;
  nextCursor?: string;
}

// ─── Bookmarks & Timeline ───────────────────────────────

interface BookmarksResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor?: string;
}

interface BookmarkFolder {
  id: string;
  name: string;
}

interface BookmarkFoldersResponse {
  folders: BookmarkFolder[];
}

interface NotificationsResponse {
  notifications: Notification[];
  hasMore: boolean;
  nextCursor?: string;
}

interface TimelineResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor?: string;
}

interface DmHistoryResponse {
  messages: DmMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

interface DmMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  media?: TweetMediaItem[];
}

// ─── X Articles ─────────────────────────────────────────

interface Article {
  title: string;
  coverImage?: string;
  bodyHtml: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  viewCount: number;
  bookmarkCount: number;
  author: {
    id: string;
    username: string;
    name: string;
  };
}

// ─── Radar ───────────────────────────────────────────────

type RadarSource =
  | "github"
  | "google_trends"
  | "hacker_news"
  | "polymarket"
  | "reddit"
  | "trustmrr"
  | "wikipedia";

type RadarCategory =
  | "general"
  | "tech"
  | "dev"
  | "science"
  | "culture"
  | "politics"
  | "business"
  | "entertainment";

interface RadarItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  source: RadarSource;
  sourceId: string;
  category: RadarCategory;
  region: string;
  language: string;
  score: number;
  metadata: Record<string, unknown>;
  publishedAt: string;
  createdAt: string;
}

// ─── Download Media ─────────────────────────────────────

interface DownloadMediaRequest {
  tweetInput?: string;  // Tweet URL or numeric tweet ID (single mode)
  tweetIds?: string[];  // Array of tweet URLs or IDs (bulk mode, max 50). Exactly 1 of tweetInput or tweetIds required.
}

interface DownloadMediaSingleResponse {
  tweetId: string;      // Resolved tweet ID
  galleryUrl: string;   // Shareable gallery page URL
  cacheHit: boolean;    // true if served from cache (no usage consumed)
}

interface DownloadMediaBulkResponse {
  galleryUrl: string;   // Combined gallery page URL
  totalTweets: number;  // Number of tweets processed
  totalMedia: number;   // Total media items downloaded
}

// ─── Trends ──────────────────────────────────────────────

interface Trend {
  name: string;
  description?: string;
  rank?: number;
  query?: string;
}

interface TrendList {
  trends: Trend[];
  total: number;
  woeid: number;
}

// ─── Support ────────────────────────────────────────────

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SupportMessage {
  id: string;
  body: string;
  sender: string;
  createdAt: string;
}

interface CreateTicketRequest {
  subject: string;
  body: string;
}

// ─── Error ───────────────────────────────────────────────

interface ApiError {
  error: string;
  limit?: number;
}

// ─── Request Bodies ──────────────────────────────────────

interface CreateMonitorRequest {
  username: string;
  eventTypes: EventType[];
}

interface UpdateMonitorRequest {
  eventTypes?: EventType[];
  isActive?: boolean;
}

interface CreateWebhookRequest {
  url: string;
  eventTypes: EventType[];
}

interface UpdateWebhookRequest {
  url?: string;
  eventTypes?: EventType[];
  isActive?: boolean;
}

interface CreateApiKeyRequest {
  name?: string;
}

// --- Tweet Style Cache ---

interface TweetStyleCache {
  xUsername: string;
  tweetCount: number;
  isOwnAccount: boolean;
  fetchedAt: string; // ISO 8601
  tweets: CachedTweet[];
}

interface CachedTweet {
  id: string;
  text: string;
  authorUsername: string;
  createdAt: string; // ISO 8601
  media?: TweetMediaItem[];
}

interface TweetStyleSummary {
  xUsername: string;
  tweetCount: number;
  isOwnAccount: boolean;
  fetchedAt: string;
}

interface StyleComparison {
  style1: TweetStyleCache;
  style2: TweetStyleCache;
}

interface StylePerformance {
  xUsername: string;
  tweetCount: number;
  tweets: PerformanceTweet[];
}

interface PerformanceTweet {
  id: string;
  text: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  viewCount: number;
  bookmarkCount: number;
}

// --- Tweet Drafts ---

interface TweetDraft {
  id: string;
  text: string;
  topic?: string;
  goal?: "engagement" | "followers" | "authority" | "conversation";
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface TweetDraftList {
  drafts: TweetDraft[];
  afterCursor: string | null;
  hasMore: boolean;
}

// --- Account Identity ---

interface XIdentityResponse {
  success: boolean;
  xUsername: string;
}
```

## REST API vs MCP Field Naming

The REST API and MCP server use different field names for the same data. Map these when switching between interfaces:

| Type | REST API Field | MCP Field |
|------|---------------|-----------|
| **Monitor** | `username` | `xUsername` |
| **Event** | `type` | `eventType` |
| **Event** | `data` | `eventData` |
| **Event** | `monitorId` | `monitoredAccountId` |
| **UserProfile** | `followers` | `followersCount` |
| **UserProfile** | `following` | `followingCount` |
| **FollowerCheck** | `isFollowing` / `isFollowedBy` | `following` / `followedBy` |

**MCP `get-user-info` returns a subset** of the full `UserProfile` type. Fields not returned by MCP: `verified`, `location`, `createdAt`, `statusesCount`. Use the REST API `GET /x/users/{username}` for the complete profile.

## MCP Output Schemas

MCP tools return structured data with these shapes. Field names differ from the REST API (see mapping table above).

```typescript
// ─── MCP: get-user-info ─────────────────────────────────

interface McpUserInfo {
  username: string;           // X username (without @)
  name: string;               // Display name
  description: string;        // User bio text
  followersCount: number;     // Number of followers
  followingCount: number;     // Number of accounts followed
  profilePicture: string;     // Profile picture URL
  // Not returned: verified, location, createdAt, statusesCount
  // Use REST GET /x/users/{username} for the full profile
}

// ─── MCP: search-tweets ─────────────────────────────────

interface McpSearchResult {
  tweets: {
    id: string;               // Tweet ID (use with lookup-tweet for full metrics)
    text: string;             // Full tweet text
    authorUsername: string;   // X username of the tweet author
    authorName: string;       // Display name of the tweet author
    createdAt: string;        // ISO 8601 timestamp when tweet was posted
    media?: { mediaUrl: string; type: string; url: string }[];  // Attached photos/videos
    // No engagement metrics. Use lookup-tweet for those
  }[];
}

// ─── MCP: lookup-tweet ──────────────────────────────────

interface McpTweetLookup {
  tweet: {
    id: string;               // Tweet ID
    text: string;             // Tweet text
    likeCount: number;        // Number of likes
    retweetCount: number;     // Number of retweets
    replyCount: number;       // Number of replies
    quoteCount: number;       // Number of quote tweets
    viewCount: number;        // Number of views
    bookmarkCount: number;    // Number of bookmarks
    media?: { mediaUrl: string; type: string; url: string }[];  // Attached photos/videos
  };
  author?: {                  // Tweet author details
    id: string;               // Author user ID
    username: string;         // Author X username
    followers: number;        // Author follower count
    verified: boolean;        // Whether the author is verified
  };
}

// ─── MCP: check-follow ─────────────────────────────────

interface McpFollowCheck {
  following: boolean;         // Whether the source follows the target
  followedBy: boolean;        // Whether the target follows the source
}

// ─── MCP: get-events ────────────────────────────────────

interface McpEventList {
  events: {
    id: string;               // Event ID (use with get-event for full details)
    xUsername: string;        // Username of the monitored account
    eventType: string;        // Event type (tweet.new, tweet.reply, etc.)
    eventData: unknown;       // Full event payload (tweet text, author, metrics)
    monitoredAccountId: string; // ID of the monitored account
    createdAt: string;        // ISO 8601 when event was recorded
    occurredAt: string;       // ISO 8601 when event occurred on X
  }[];
  hasMore: boolean;           // Whether more results are available
  nextCursor?: string;        // Pass as afterCursor to fetch the next page
}

// ─── MCP: list-monitors ─────────────────────────────────

interface McpMonitorList {
  monitors: {
    id: string;               // Monitor ID (use with remove-monitor, get-events monitorId filter)
    xUsername: string;        // Monitored X username
    eventTypes: string[];     // Subscribed event types
    isActive: boolean;        // Whether the monitor is currently active
    createdAt: string;        // ISO 8601 timestamp
  }[];
}

// ─── MCP: add-webhook ───────────────────────────────────

interface McpWebhookCreated {
  id: string;                 // Webhook ID
  url: string;                // HTTPS endpoint URL
  eventTypes: string[];       // Event types delivered to this webhook
  isActive: boolean;          // Whether the webhook is active
  createdAt: string;          // ISO 8601 timestamp
  secret: string;             // HMAC signing secret for verifying webhook payloads. Store securely.
}

// ─── MCP: test-webhook ──────────────────────────────────

interface McpWebhookTest {
  success: boolean;
  statusCode: number;
  error?: string;
}

// ─── MCP: run-extraction ────────────────────────────────

interface McpExtractionJob {
  id: string;                 // Extraction job ID (use with get-extraction for results)
  toolType: string;           // Extraction tool type used
  status: string;             // Job status
  totalResults: number;       // Number of results extracted
}

// ─── MCP: estimate-extraction ───────────────────────────

interface McpExtractionEstimate {
  allowed?: boolean;          // Whether the extraction is allowed within budget
  estimatedResults?: number;  // Estimated number of results
  projectedPercent?: number;  // Projected usage percent after extraction
  usagePercent?: number;      // Current usage percent of monthly quota
  source?: string;            // Data source used for estimation
  error?: string;             // Error message if estimation failed
}

// ─── MCP: run-draw ──────────────────────────────────────

interface McpDrawResult {
  id: string;                 // Draw ID (use with get-draw for full details)
  tweetId: string;            // Giveaway tweet ID
  totalEntries: number;       // Total reply count before filtering
  validEntries: number;       // Valid entries after filtering
  winners: {
    position: number;         // Winner position (1-based)
    authorUsername: string;   // X username of the winner
    tweetId: string;          // Tweet ID of the winning reply
    isBackup: boolean;        // Whether this is a backup winner
  }[];
}

// ─── MCP: get-draw ──────────────────────────────────────

interface McpDrawDetails {
  draw: {
    id: string;               // Draw ID
    status: string;           // Draw status (completed, failed)
    createdAt: string;        // ISO 8601 timestamp
    drawnAt?: string;         // ISO 8601 timestamp when winners were drawn
    totalEntries: number;     // Total reply count before filtering
    validEntries: number;     // Entries remaining after filters applied
    tweetId: string;          // Giveaway tweet ID
    tweetUrl: string;         // Full URL of the giveaway tweet
    tweetText: string;        // Giveaway tweet text
    tweetAuthorUsername: string; // Username of the giveaway tweet author
    tweetLikeCount: number;   // Tweet like count at draw time
    tweetRetweetCount: number; // Tweet retweet count at draw time
    tweetReplyCount: number;  // Tweet reply count at draw time
    tweetQuoteCount: number;  // Tweet quote count at draw time
  };
  winners: {
    position: number;         // Winner position (1-based)
    authorUsername: string;   // X username of the winner
    tweetId: string;          // Tweet ID of the winning reply
    isBackup: boolean;        // Whether this is a backup winner
  }[];
}

// ─── MCP: get-account ───────────────────────────────────

interface McpAccount {
  plan: string;               // Current plan name (free or subscriber)
  monitorsAllowed: number;    // Maximum monitors allowed on current plan
  monitorsUsed: number;       // Number of active monitors
  currentPeriod?: {           // Current billing period (present only with active subscription)
    start: string;            // ISO 8601 period start date
    end: string;              // ISO 8601 period end date
    usagePercent: number;     // Percent of monthly quota consumed
  };
}

// ─── MCP: get-trends ────────────────────────────────────

interface McpTrends {
  woeid: number;
  total: number;
  trends: {
    name: string;             // Trend name or hashtag
    rank?: number;            // Trend rank position
    description?: string;     // Trend description or context
    query?: string;           // Search query to find tweets for this trend
  }[];
}

// ─── MCP: subscribe ────────────────────────────────────

interface McpSubscribe {
  status: "already_subscribed" | "checkout_created" | "payment_issue";
  url: string;                // Checkout or Customer Portal URL. Open in browser.
  message: string;            // Human-readable status message
}

// ─── MCP: compose-tweet ────────────────────────────────

interface McpComposeTweet {
  algorithmInsights: {
    name: string;             // Signal name from PhoenixScores
    polarity: "positive" | "negative"; // Whether this signal helps or hurts ranking
    description: string;      // What this signal measures
  }[];
  contentRules: {
    rule: string;             // Actionable content rule
    description: string;      // Why this rule matters based on algorithm architecture
  }[];
  engagementMultipliers: {
    action: string;           // Engagement action (e.g. reply chain, quote tweet)
    multiplier: string;       // Relative value compared to a like (e.g. "27x a like")
    source: string;           // Data source for this multiplier
  }[];
  engagementVelocity: string; // How early engagement velocity affects distribution
  followUpQuestions: string[]; // Questions for the AI to ask the user before composing
  scorerWeights: {
    signal: string;           // Signal name in the scoring model
    weight: number;           // Weight applied to predicted probability
    context: string;          // Practical meaning of this weight
  }[];
  topPenalties: string[];     // Most severe negative signals to avoid
  source: string;             // Attribution to algorithm source code
}

// ─── MCP: refine-tweet ─────────────────────────────────

interface McpRefineTweet {
  compositionGuidance: string[];  // Targeted guidance based on user preferences
  examplePatterns: {
    pattern: string;          // Tweet structure template
    description: string;      // What this pattern achieves
  }[];
}

// ─── MCP: score-tweet ──────────────────────────────────

interface McpScoreTweet {
  totalChecks: number;        // Total number of checks performed
  passedCount: number;        // Number of checks that passed
  topSuggestion: string;      // Highest-impact improvement suggestion
  checklist: {
    factor: string;           // What was checked
    passed: boolean;          // Whether the check passed
    suggestion?: string;      // Improvement suggestion (present only if failed)
  }[];
}

// ─── X Accounts (Connected) ──────────────────────────

interface ConnectedXAccount {
  id: string;                 // Unique account ID
  username: string;           // X username
  displayName?: string;       // Display name on X
  isActive: boolean;          // Whether the connection is active
  createdAt: string;          // ISO 8601 timestamp
}

// Connecting an X account is done by the user in the Xquik dashboard,
// not through this skill. The skill never handles X login credentials.

// ─── X Write ──────────────────────────────────────────

interface CreateTweetRequest {
  account: string;            // Connected X username or account ID
  text: string;               // Tweet text (280 chars, or 25,000 if is_note_tweet)
  reply_to_tweet_id?: string; // Tweet ID to reply to
  attachment_url?: string;    // URL to attach as card
  community_id?: string;      // Community ID to post into
  is_note_tweet?: boolean;    // Long-form note tweet (up to 25,000 chars)
  media_ids?: string[];       // Media IDs from POST /x/media (max 4 images or 1 video)
}

interface CreateTweetResponse {
  tweetId: string;            // ID of the newly created tweet
  success: boolean;           // Always true on success
}

interface WriteActionRequest {
  account: string;            // Connected X username or account ID
}

interface SendDmRequest {
  account: string;            // Connected X username or account ID
  text: string;               // Message text
  media_ids?: string[];       // Media IDs to attach
  reply_to_message_id?: string; // Message ID to reply to
}

interface UpdateProfileRequest {
  account: string;            // Connected X username or account ID
  name?: string;              // Display name
  description?: string;       // Bio
  location?: string;          // Location
  url?: string;               // Website URL
}

```
