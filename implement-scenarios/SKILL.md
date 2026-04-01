---
name: implement-scenarios
description: Implement Gherkin scenarios using double-loop TDD — outer RED is the acceptance scenario, inner loop is unit-level red-green-refactor. Use when user wants to implement .feature files, run BDD scenarios, or bridge Gherkin acceptance tests with TDD.
---

# Implement Scenarios

Implement a `.feature` file using **double-loop TDD**. The outer loop drives from the Gherkin scenario (acceptance level); the inner loop uses unit-level TDD for each step.

```
OUTER loop
  RED:   Gherkin scenario fails (step throws "Pending")
  GREEN: All steps implemented → scenario passes
         (each step driven by INNER loop below)
  REFACTOR: Clean up after scenario is green

INNER loop (per step)
  RED:   Unit test for the behaviour behind this step → fails
  GREEN: Minimal code → unit test passes
  REFACTOR: Clean up
```

See the [tdd](../tdd/SKILL.md) skill for inner-loop guidelines.

## Process

### 1. Pick a scenario

Ask the user which `.feature` file and scenario to implement, or suggest starting with the first pending scenario:

```bash
# Run the suite to see which steps are pending
npx cucumber-js --dry-run
```

Move the Jira story to "In Progress":

```bash
jira issue move PROJ-XXX "In Progress"
```

### 2. Read the scenario

Display the scenario text and identify each step. For each `Given/When/Then`:

- What system state does it establish or verify?
- What module / public interface is responsible?
- Is there an existing unit test for this behaviour?

### 3. Outer RED — confirm the scenario fails

Run only this scenario:

```bash
npx cucumber-js features/<file>.feature --name "<scenario name>"
```

All steps should fail with `Error: Pending`. If any step already passes, note it.

### 4. Inner loop — implement each step

For each pending step, run the inner TDD loop:

```
RED:   Write a unit test that captures the behaviour this step requires → fails
GREEN: Write minimal code → unit test passes
```

Rules (same as `tdd` skill):
- One unit test at a time
- Tests verify behaviour through public interfaces only
- No speculative code

After the inner loop for a step is GREEN, wire the step definition to call the production code.

### 5. Outer GREEN — confirm the scenario passes

Re-run the scenario:

```bash
npx cucumber-js features/<file>.feature --name "<scenario name>"
```

All steps must pass. If the scenario is still red, repeat the inner loop for the failing step.

### 6. Refactor

With all lights green:
- Extract duplication across step definitions
- Deepen modules if step implementations reveal shallow ones
- Run the full suite to confirm nothing regressed

### 7. Move story to Done

When all scenarios in the feature are green:

```bash
jira issue move PROJ-XXX Done
```

### 8. Continue

Ask: "Next scenario, or are we done?"

## Checklist per scenario

```
[ ] Scenario runs (not skipped, not syntax error)
[ ] Outer RED confirmed before writing any code
[ ] Each step has a corresponding unit test (inner loop)
[ ] Outer GREEN confirmed before refactoring
[ ] Full suite still passes after refactor
[ ] Jira story updated
```
