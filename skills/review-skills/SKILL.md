---
name: review-skills
description: Audit all skills available in the current project context for conflicts, quality issues, and replicable patterns. Use when user wants to review skills, audit skills, check skill quality, find conflicting or overlapping skills, improve skill descriptions, check what skills are installed, or mentions "review-skills". Always use this skill when the user wants to understand the health or completeness of their skill setup.
---

# Review Skills

Audit every skill available in the current project context and produce a structured report covering conflicts, quality issues, and patterns worth spreading.

## Process

### 1. Discover skills in scope

Scan these locations only — not the current repo's `skills/` directory (those are development-only unless installed):

- `~/.claude/skills/` — global skills, available everywhere
- `<cwd>/.claude/skills/` — project-local skills installed into this project
- Plugins: read `~/.claude/settings.json` for `enabledPlugins`, then find their SKILL.md files under `~/.claude/plugins/cache/`

For each skill found, record:
- **Source**: global, project-local, or plugin
- **Path**: absolute path to SKILL.md
- **Name**: from `name` frontmatter field
- **Description**: from `description` frontmatter field
- **Body line count**: lines in SKILL.md excluding frontmatter
- **Bundled resources**: whether references/, scripts/, or assets/ exist alongside SKILL.md

Read every SKILL.md in full. Note referenced supporting files but only read them if needed to resolve an ambiguity.

### 2. Check for conflicts and overlaps

Compare all skill pairs. Flag pairs where:
- Descriptions share trigger phrases or keywords that would make selection ambiguous for an overlapping user prompt
- Names are similar enough to confuse (e.g. `clean-code` vs `clean-comments`)
- Both claim the same domain without clear differentiation

For each flagged pair, describe which user prompts would be ambiguous and suggest how to differentiate the descriptions.

### 3. Evaluate each skill against the quality rubric

For each skill, check all 15 items below. Record pass/fail and a one-line note for any failing check. The purpose of these checks is to ensure skills trigger reliably and give the model clear, actionable guidance.

<quality-rubric>
**Frontmatter**
1. `name` field exists and is kebab-case
2. `name` matches the directory name
3. `description` field exists
4. Description follows the two-part pattern: what it does + when to use it (explicit trigger phrases)
5. Description is under 1024 characters
6. Description is "pushy" — lists specific trigger phrases rather than vague capability summaries (Claude undertriggers skills, so descriptions need to be explicit)

**Size and structure**
7. Body is under 500 lines
8. If body exceeds 200 lines, large reference content is split into separate files rather than inlined
9. Steps use numbered `###` headers rather than walls of prose
10. No hardcoded absolute paths that break portability (`~` and relative paths are fine)

**Instruction quality**
11. Uses imperative form ("Do X" not "You should do X" or "Claude will X")
12. Explains the *why* behind non-obvious instructions, not just *what* to do
13. Output templates use consistent formatting (XML-style tags or fenced code blocks, not a mix)

**Resources**
14. Every file referenced by name in SKILL.md actually exists on disk
15. If references/ or scripts/ directories exist, SKILL.md mentions them so the model knows to use them
</quality-rubric>

Assign severity to each failing check:
- **Critical**: blocks correct skill usage (missing description, non-existent referenced files)
- **Major**: meaningfully degrades output quality (vague triggers, missing why, hardcoded paths)
- **Minor**: polish issues (style inconsistency, slightly verbose)

### 4. Identify replicable good patterns

Look across all skills for patterns worth adopting more broadly. Signal good work, not just problems. Patterns to watch for:

- **Interview-before-action**: skill gathers requirements from the user before producing output — makes output more accurate and reduces rework
- **GitHub issue as deliverable**: skill creates a structured GH issue — creates a durable record and fits code-review workflows
- **Progressive disclosure**: SKILL.md is lean, with detailed content in reference files — keeps context window clean
- **Vertical-slice philosophy**: work broken into thin end-to-end slices rather than layers
- **Model override for simple tasks**: `model: haiku` in frontmatter for lightweight, mechanical skills — saves tokens and latency
- **Bundled scripts for deterministic work**: scripts/ directory for code the skill always runs — avoids the model reinventing it each time

For each pattern found, note which skills use it and which other skills could benefit from adopting it, with a brief explanation of why it would help.

### 5. Produce the audit report

<report-template>
## Skills Audit Report

**Skills discovered**: [N] total — [N] global, [N] project-local, [N] plugin

---

### Conflicts & Overlaps

[For each flagged pair:]
- **[skill-a] vs [skill-b]**: [which user prompts would be ambiguous]
  - Suggestion: [how to differentiate descriptions]

_If none:_ No conflicts detected.

---

### Quality Issues

#### Critical
- **[skill-name]**: [rubric check #] — [one-line problem description]
  - Fix: [specific actionable change]

#### Major
[same format]

#### Minor
[same format]

_If none in a category:_ None.

---

### Good Patterns Worth Spreading

- **[pattern name]** — currently used in: [skill-a], [skill-b]
  - Could benefit: [skill-x], [skill-y] — [brief explanation of how it would help]

---

### Per-Skill Scorecards

**[skill-name]** ([source]) — [N] lines
- Rubric: [N]/15 checks passed
- Strengths: [1-2 bullet points]
- Top fix: [single most impactful improvement, or "No issues found"]

[repeat for each skill]
</report-template>

Keep the report factual and concise. Cross-reference rather than repeat the same finding in multiple sections. If a skill passes all checks with no overlaps, say so briefly in its scorecard and move on.
