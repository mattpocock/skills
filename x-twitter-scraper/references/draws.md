# Xquik Giveaway Draws

Run transparent, auditable giveaway draws from tweet replies with configurable filters.

## Create Draw

`POST /draws` with a `tweetUrl` (required) and optional filters:

| Field | Type | Description |
|-------|------|-------------|
| `tweetUrl` | string | **Required.** Full tweet URL: `https://x.com/user/status/ID` |
| `winnerCount` | number | Winners to select (default 1) |
| `backupCount` | number | Backup winners to select |
| `uniqueAuthorsOnly` | boolean | Count only one entry per author |
| `mustRetweet` | boolean | Require participants to have retweeted |
| `mustFollowUsername` | string | Username participants must follow |
| `filterMinFollowers` | number | Minimum follower count |
| `filterAccountAgeDays` | number | Minimum account age in days |
| `filterLanguage` | string | Language code (e.g., `"en"`) |
| `requiredKeywords` | string[] | Words that must appear in the reply |
| `requiredHashtags` | string[] | Hashtags that must appear (e.g., `["#giveaway"]`) |
| `requiredMentions` | string[] | Usernames that must be mentioned (e.g., `["@xquik"]`) |

## Complete Workflow

```javascript
// Step 1: Create draw with filters
const draw = await xquikFetch("/draws", {
  method: "POST",
  body: JSON.stringify({
    tweetUrl: "https://x.com/burakbayir/status/1893456789012345678",
    winnerCount: 3,
    backupCount: 2,
    uniqueAuthorsOnly: true,
    mustRetweet: true,
    mustFollowUsername: "burakbayir",
    filterMinFollowers: 50,
    filterAccountAgeDays: 30,
    filterLanguage: "en",
    requiredHashtags: ["#giveaway"],
  }),
});

// Step 2: Get draw details with winners
const details = await xquikFetch(`/draws/${draw.id}`);
// details.winners: [
//   { position: 1, authorUsername: "winner1", tweetId: "...", isBackup: false },
//   ...
// ]

// Step 3: Export results
const exportUrl = `${BASE}/draws/${draw.id}/export?format=csv`;
```

## Cost

1 credit ($0.00015) per participant entry.
