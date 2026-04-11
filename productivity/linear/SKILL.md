---
name: linear
description: Manage Linear issues, projects, and teams via the GraphQL API. Create, update, search, and organize issues. Uses API key auth (no OAuth needed). All operations via curl — no dependencies.
version: 1.0.0
author: Hermes Agent
license: MIT
prerequisites:
  env_vars: [LINEAR_API_KEY]
  commands: [curl]
metadata:
  hermes:
    tags: [Linear, Project Management, Issues, GraphQL, API, Productivity]
---

# Linear — Issue & Project Management

Manage Linear issues, projects, and teams directly via the GraphQL API using `curl`. No MCP server, no OAuth flow, no extra dependencies.

## Setup

1. Get a personal API key from **Linear Settings > API > Personal API keys**
2. Set `LINEAR_API_KEY` in your environment (via `hermes setup` or your env config)

## API Basics

- **Endpoint:** `https://api.linear.app/graphql` (POST)
- **Auth header:** `Authorization: $LINEAR_API_KEY` (no "Bearer" prefix for API keys)
- **All requests are POST** with `Content-Type: application/json`
- **Both UUIDs and short identifiers** (e.g., `ENG-123`) work for `issue(id:)`

Base curl pattern:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { id name } }"}' | python3 -m json.tool
```

## Workflow States

Linear uses `WorkflowState` objects with a `type` field. **6 state types:**

| Type | Description |
|------|-------------|
| `triage` | Incoming issues needing review |
| `backlog` | Acknowledged but not yet planned |
| `unstarted` | Planned/ready but not started |
| `started` | Actively being worked on |
| `completed` | Done |
| `canceled` | Won't do |

Each team has its own named states (e.g., "In Progress" is type `started`). To change an issue's status, you need the `stateId` (UUID) of the target state — query workflow states first.

**Priority values:** 0 = None, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low

## Common Queries

### Get current user
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { id name email } }"}' | python3 -m json.tool
```

### List teams
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ teams { nodes { id name key } } }"}' | python3 -m json.tool
```

### List workflow states for a team
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ workflowStates(filter: { team: { key: { eq: \"ENG\" } } }) { nodes { id name type } } }"}' | python3 -m json.tool
```

### List issues (first 20)
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issues(first: 20) { nodes { identifier title priority state { name type } assignee { name } team { key } url } pageInfo { hasNextPage endCursor } } }"}' | python3 -m json.tool
```

### List my assigned issues
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { assignedIssues(first: 25) { nodes { identifier title state { name type } priority url } } } }"}' | python3 -m json.tool
```

### Get a single issue (by identifier like ENG-123)
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issue(id: \"ENG-123\") { id identifier title description priority state { id name type } assignee { id name } team { key } project { name } labels { nodes { name } } comments { nodes { body user { name } createdAt } } url } }"}' | python3 -m json.tool
```

### Search issues by text
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issueSearch(query: \"bug login\", first: 10) { nodes { identifier title state { name } assignee { name } url } } }"}' | python3 -m json.tool
```

### Filter issues by state type
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issues(filter: { state: { type: { in: [\"started\"] } } }, first: 20) { nodes { identifier title state { name } assignee { name } } } }"}' | python3 -m json.tool
```

### Filter by team and assignee
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issues(filter: { team: { key: { eq: \"ENG\" } }, assignee: { email: { eq: \"user@example.com\" } } }, first: 20) { nodes { identifier title state { name } priority } } }"}' | python3 -m json.tool
```

### List projects
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ projects(first: 20) { nodes { id name description progress lead { name } teams { nodes { key } } url } } }"}' | python3 -m json.tool
```

### List team members
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { nodes { id name email active } } }"}' | python3 -m json.tool
```

### List labels
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issueLabels { nodes { id name color } } }"}' | python3 -m json.tool
```

## Common Mutations

### Create an issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier title url } } }",
    "variables": {
      "input": {
        "teamId": "TEAM_UUID",
        "title": "Fix login bug",
        "description": "Users cannot login with SSO",
        "priority": 2
      }
    }
  }' | python3 -m json.tool
```

### Update issue status
First get the target state UUID from the workflow states query above, then:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { issueUpdate(id: \"ENG-123\", input: { stateId: \"STATE_UUID\" }) { success issue { identifier state { name type } } } }"}' | python3 -m json.tool
```

### Assign an issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { issueUpdate(id: \"ENG-123\", input: { assigneeId: \"USER_UUID\" }) { success issue { identifier assignee { name } } } }"}' | python3 -m json.tool
```

### Set priority
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { issueUpdate(id: \"ENG-123\", input: { priority: 1 }) { success issue { identifier priority } } }"}' | python3 -m json.tool
```

### Add a comment
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { commentCreate(input: { issueId: \"ISSUE_UUID\", body: \"Investigated. Root cause is X.\" }) { success comment { id body } } }"}' | python3 -m json.tool
```

### Set due date
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { issueUpdate(id: \"ENG-123\", input: { dueDate: \"2026-04-01\" }) { success issue { identifier dueDate } } }"}' | python3 -m json.tool
```

### Add labels to an issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { issueUpdate(id: \"ENG-123\", input: { labelIds: [\"LABEL_UUID_1\", \"LABEL_UUID_2\"] }) { success issue { identifier labels { nodes { name } } } } }"}' | python3 -m json.tool
```

### Add issue to a project
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { issueUpdate(id: \"ENG-123\", input: { projectId: \"PROJECT_UUID\" }) { success issue { identifier project { name } } } }"}' | python3 -m json.tool
```

### Create a project
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($input: ProjectCreateInput!) { projectCreate(input: $input) { success project { id name url } } }",
    "variables": {
      "input": {
        "name": "Q2 Auth Overhaul",
        "description": "Replace legacy auth with OAuth2 and PKCE",
        "teamIds": ["TEAM_UUID"]
      }
    }
  }' | python3 -m json.tool
```

## Pagination

Linear uses Relay-style cursor pagination:

```bash
# First page
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issues(first: 20) { nodes { identifier title } pageInfo { hasNextPage endCursor } } }"}' | python3 -m json.tool

# Next page — use endCursor from previous response
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ issues(first: 20, after: \"CURSOR_FROM_PREVIOUS\") { nodes { identifier title } pageInfo { hasNextPage endCursor } } }"}' | python3 -m json.tool
```

Default page size: 50. Max: 250. Always use `first: N` to limit results.

## Filtering Reference

Comparators: `eq`, `neq`, `in`, `nin`, `lt`, `lte`, `gt`, `gte`, `contains`, `startsWith`, `containsIgnoreCase`

Combine filters with `or: [...]` for OR logic (default is AND within a filter object).

## Typical Workflow

1. **Query teams** to get team IDs and keys
2. **Query workflow states** for target team to get state UUIDs
3. **List or search issues** to find what needs work
4. **Create issues** with team ID, title, description, priority
5. **Update status** by setting `stateId` to the target workflow state
6. **Add comments** to track progress
7. **Mark complete** by setting `stateId` to the team's "completed" type state

## Rate Limits

- 5,000 requests/hour per API key
- 3,000,000 complexity points/hour
- Use `first: N` to limit results and reduce complexity cost
- Monitor `X-RateLimit-Requests-Remaining` response header

## Important Notes

- Always use `terminal` tool with `curl` for API calls — do NOT use `web_extract` or `browser`
- Always check the `errors` array in GraphQL responses — HTTP 200 can still contain errors
- If `stateId` is omitted when creating issues, Linear defaults to the first backlog state
- The `description` field supports Markdown
- Use `python3 -m json.tool` or `jq` to format JSON responses for readability
