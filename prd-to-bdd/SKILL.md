---
name: prd-to-bdd
description: Transform a Jira Epic into Gherkin .feature files with Cucumber JS/TS step definition skeletons, validating scenario language against the ubiquitous language glossary. Use when user wants to write BDD scenarios, create .feature files, translate a PRD into Gherkin, or do behaviour-driven design.
---

# PRD to BDD

Turn a Jira Epic into executable Gherkin `.feature` files, grounded in the project's ubiquitous language.

## Process

### 1. Fetch the PRD

Ask the user for the Jira issue key (e.g. `PROJ-42`). Fetch it:

```bash
jira issue view PROJ-42
```

### 2. Load the ubiquitous language

If `UBIQUITOUS_LANGUAGE.md` exists at the repo root, read it. Every term used in scenario titles, step text, and examples **must** match a canonical term from the glossary. Flag and propose corrections for any synonyms or aliases listed as "avoid".

### 3. Identify scenarios from user stories

For each user story in the PRD ("As a... I want... so that..."), derive one or more Gherkin scenarios. Cover:

- The **happy path** (primary flow)
- At least one **alternative path** (edge case, optional step)
- At least one **failure path** (invalid input, missing data, system error)

### 4. Draft and review `.feature` files

Present the scenarios to the user before writing files. Ask:

- Does the granularity feel right?
- Are the personas (`Given I am a <role>`) correct?
- Are any scenarios missing?

Iterate until the user approves.

### 5. Write `.feature` files

Create files in `features/` at the repo root. One file per bounded context or major feature area.

Tag each file's scenarios with the Epic key: `@PROJ-42`

<feature-template>

@PROJ-42
Feature: [Feature Name]
  As a [persona]
  I want [capability]
  So that [benefit]

  Background:
    Given [shared precondition if applicable]

  Scenario: [Happy path name]
    Given [initial context]
    When  [action]
    Then  [expected outcome]

  Scenario: [Alternative path name]
    Given [initial context]
    And   [additional context]
    When  [action]
    Then  [expected outcome]

  Scenario: [Failure path name]
    Given [initial context]
    When  [invalid action]
    Then  [error or fallback outcome]

</feature-template>

### 6. Generate step definition skeletons

For each `.feature` file, create a matching skeleton file in `features/step-definitions/` using **Cucumber JS/TS**:

```typescript
// features/step-definitions/<feature-name>.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('[step text]', async function () {
  // TODO: implement
  throw new Error('Pending');
});
```

Each step is `throw new Error('Pending')` — immediately RED when the suite runs.

### 7. Summary

Print:
- List of `.feature` files created
- Number of scenarios (happy / alternative / failure paths)
- Terms flagged as deviating from `UBIQUITOUS_LANGUAGE.md`
- Next step: "Run `implement-scenarios` to implement each scenario via double-loop TDD."
