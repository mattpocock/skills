---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Start with the highest-risk and most impactful decisions before drilling into lower-level details. Don't spend time on minor choices while big unknowns remain.

Ask the questions one at a time.

If my answer has gaps, contradictions, or unstated assumptions, push back and challenge me. Do not accept a weak answer — ask follow-ups until the reasoning is solid.

For every design decision, apply a security lens:
- **Threat modeling**: Identify attack surfaces, trust boundaries, and data sensitivity. Ask "how could this be abused?" for each choice.
- **Fail-secure defaults**: Challenge whether failure modes are fail-closed, not fail-open. The system should deny by default when something goes wrong.
- **Least privilege**: Question whether the design grants more access, permissions, or capabilities than strictly necessary.
- **Data flow scrutiny**: Ask where sensitive data flows, who can access it, whether it is encrypted at rest and in transit, and whether retention policies are defined.

If a question can be answered by exploring the codebase, explore the codebase instead.

Stay focused on design and planning. Do not drift into implementation details unless I explicitly ask.

Once all branches are resolved, produce a concise summary of every decision made, organized by topic. Include a dedicated **Security Considerations** section that lists identified risks, mitigations chosen, and any accepted trade-offs. This serves as the final artifact of the session.