---
name: skill-updater
description: Update an existing skill with new context, patterns, or improvements. Use when user wants to update a skill, modify a skill, add a pattern to a skill, improve an existing skill, edit a SKILL.md, tweak skill instructions, change skill behaviour, or mentions "update skill", "edit skill", "change skill", "add to skill". Do NOT use for creating new skills from scratch — use write-a-skill or skill-creator for that.
---

# Skill Updater

Lightweight, in-place updates to an existing skill's SKILL.md. For creating new skills or running evals/benchmarks, use write-a-skill or skill-creator instead.

## Process

### 1. Identify the target skill

If the user named a specific skill, locate it. Otherwise, discover all available skills and present them as a numbered list so the user can pick one.

Scan these locations:

- `~/.claude/skills/` — global installed skills
- `<cwd>/.claude/skills/` — project-local skills
- `<cwd>/skills/` — development source (if it exists)
- Plugin cache: read `~/.claude/settings.json` for `enabledPlugins`, then find SKILL.md files under `~/.claude/plugins/cache/`

For each skill found, record its name (from frontmatter), source (global / project-local / dev / plugin), and absolute path.

If listing for the user:

```
1. clean-comments (global) — /Users/you/.claude/skills/clean-comments/SKILL.md
2. tdd (dev) — /path/to/project/skills/tdd/SKILL.md
```

Ask: "Which skill do you want to update?"

### 2. Read and understand the current skill

Read the target SKILL.md in full. Also read any bundled reference files relevant to the requested change.

Before editing, tell the user:
- What the skill currently does (one sentence)
- Which section(s) the requested change affects
- Your proposed edit

Wait for confirmation. This prevents misunderstandings — the user may have a different mental model of the skill than what is actually written.

### 3. Apply the update

Make the requested changes with these constraints:

- **Preserve voice and style.** Match the existing skill's tone, formatting, and structure. Don't rewrite sections the user didn't ask to change — skills have distinct personalities and homogenising them erodes that.
- **Keep it lean.** If adding content pushes SKILL.md past 100 lines, split into a reference file rather than inlining.
- **Frontmatter hygiene.** If the change affects what the skill does or when it triggers, update the `description` field too. Stale descriptions cause misfires because the description is the only thing Claude sees when deciding which skill to load.
- **Explain the why.** New instructions should include reasoning, not just directives — models follow instructions better when they understand the purpose.
- **Imperative form.** Write "Do X" not "You should do X".

Common update types:

| Request | What to do |
|---|---|
| Add a pattern or rule | Add to the relevant section, or create a new section if none fits |
| Broaden triggers | Add new trigger phrases to the `description` frontmatter |
| Add a workflow step | Insert a numbered step in the existing sequence |
| Fix incorrect guidance | Replace the wrong content; add a brief note on why if it would help prevent regression |
| Add reference material | Create a file in `references/` and add a pointer from SKILL.md |

### 4. Confirm and report

After writing the changes, output the absolute path to the updated file:

```
Updated: /absolute/path/to/skill-name/SKILL.md
```

List any other files created or modified. Offer to read back the updated skill so the user can review it in context.
