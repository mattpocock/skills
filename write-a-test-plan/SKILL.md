---
name: write-a-test-plan
description: Create a comprehensive testing plan from a PRD, implementation plan, or triage document. Covers local data setup, required services, user story acceptance tests, and edge cases. Use when user wants to write a test plan, create a QA plan, plan testing for a feature, or mentions "test plan".
---

# Write a Test Plan

Generate a comprehensive testing plan by searching the conversation and project context for PRDs, implementation plans, triage documents, and issues. Output is a Markdown file in `~/Development/docs/test-plans/`.

## Process

### 1. Find source documents

Search for context in this order. Use ALL sources found, not just the first match:

- **Conversation context**: Check if a PRD, implementation plan, or triage doc has already been discussed
- **Local docs**: Ask the user where their PRDs, issues, and plans are stored. Read from the provided paths
- **Codebase**: Explore existing tests, test utilities, fixtures, and test configuration to understand current test patterns

The user may also provide links to Linear issues, Figma designs, or Notion documents for additional context.

### 2. Gather external context

If the user provided references to external tools, use the available MCP tools to pull in context:

- **Linear**: Fetch issue details, acceptance criteria, and comments for additional requirements
- **Figma**: Fetch design context and screenshots to understand UI states and interactions that need testing
- **Notion**: Fetch documents for supplementary specs, edge case notes, or QA checklists

If no external references are provided, skip this step.

### 3. Explore the codebase

Use the Agent tool with subagent_type=Explore to understand:

- **Test infrastructure**: Test runner, framework, assertion libraries, mocking tools
- **Existing test patterns**: How similar features are tested, fixture conventions, helper utilities
- **Services and dependencies**: Databases, APIs, queues, caches the feature touches
- **Seed data and factories**: Existing test data setup, factories, builders, or fixtures
- **CI/CD**: How tests are run in CI, any environment-specific configuration

### 4. Draft the test plan

Using ALL gathered context, create a comprehensive test plan using the template below. Be exhaustive — it is better to over-specify than under-specify.

For each user story from the PRD, generate:
- At least one happy-path test scenario
- At least two edge cases or boundary conditions
- Error and failure scenarios
- Permission and authorization checks (if applicable)

### 5. Quiz the user

Present the draft and ask:
- Are there edge cases I missed?
- Are the environment setup instructions accurate?
- Should any test scenarios be higher or lower priority?
- Are there flaky areas of the codebase that need special attention?

Iterate until the user approves.

### 6. Save the test plan

Ask the user where they'd like to save this — for example a local file path, a GitHub wiki page, a Notion or Confluence doc. Save or deliver it appropriately for the chosen destination.

<test-plan-template>
# Test Plan: <Feature Name>

> Source: <PRD filename, issue filename, or brief identifier>
> Date: <date created>

## Environment Setup

### Prerequisites

- Required tooling (language runtimes, CLI tools, etc.)
- Environment variables to configure
- Credentials or access needed

### Services to Run

A numbered list of every service that must be running locally:

1. **Service name** — how to start it, port, health check URL
2. ...

### Local Data Setup

Step-by-step instructions to seed the database or prepare test data:

1. Migration / schema setup commands
2. Seed data commands or fixture loading
3. Test user accounts and credentials
4. Any third-party service mocks or stubs to configure

### Test Data Specifications

Describe the specific data entities needed and their states:

| Entity | State | Purpose |
|--------|-------|---------|
| e.g. User "admin@test.com" | Active, admin role | Test admin-only flows |
| e.g. Order #1001 | Pending payment | Test payment completion |

---

## Test Scenarios

### User Story 1: <user story text from PRD>

#### Happy Path

| # | Scenario | Steps | Expected Result | Priority |
|---|----------|-------|-----------------|----------|
| 1.1 | ... | ... | ... | High |

#### Edge Cases

| # | Scenario | Steps | Expected Result | Priority |
|---|----------|-------|-----------------|----------|
| 1.2 | ... | ... | ... | Medium |

#### Error Scenarios

| # | Scenario | Steps | Expected Result | Priority |
|---|----------|-------|-----------------|----------|
| 1.3 | ... | ... | ... | High |

<!-- Repeat for each user story -->

---

## Cross-Cutting Concerns

### Authentication & Authorization

| # | Scenario | Expected Result | Priority |
|---|----------|-----------------|----------|
| ... | Unauthenticated access to protected route | 401 response | High |

### Performance & Load

| # | Scenario | Threshold | Priority |
|---|----------|-----------|----------|
| ... | Page load with large dataset | < 2s | Medium |

### Accessibility

| # | Scenario | Expected Result | Priority |
|---|----------|-----------------|----------|
| ... | Keyboard navigation through form | All inputs reachable via Tab | Medium |

### Data Integrity

| # | Scenario | Expected Result | Priority |
|---|----------|-----------------|----------|
| ... | Concurrent edits to same record | Last write wins or conflict error | High |

---

## Regression Risks

Areas of the codebase that may be affected by this change and should be smoke-tested:

- Area 1: why it might break
- Area 2: why it might break

## Notes

Any additional context, known limitations, or deferred testing decisions.

</test-plan-template>
