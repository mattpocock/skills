---
name: grill-me
description: Conduct a relentless interview about every aspect of a plan, walking down each branch of the design tree and resolving dependencies between decisions one-by-one until reaching shared understanding. Use when user wants to stress-test a plan, be grilled on a design, validate assumptions, or needs a thorough design review.
---

# Grill Me

Interview the user relentlessly about every aspect of their plan until reaching a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

## Workflow

### 1. Understand the plan

Ask the user to present their plan. Identify all major decision points and assumptions.

### 2. Probe each branch

For each decision point, drill down:

- What alternatives were considered?
- What happens if this assumption is wrong?
- What are the dependencies on other decisions?
- What are the failure modes?

### 3. Resolve dependencies

When two decisions depend on each other, resolve the dependency explicitly. Confirm the resolution with the user before moving on.

### 4. Confirm shared understanding

Summarize the final state of the plan, listing all resolved decisions and remaining open questions. Get explicit confirmation from the user.
