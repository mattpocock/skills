# The canonical install block

One install story, one wording. `README.md`, `.changeset/*`, and every page under `docs/` must say **this** and nothing else. Change it here first, then propagate.

`mattpocock-skills` is listed in **Claude Code's official marketplace** — configured name `claude-plugins-official`, source repo `anthropics/claude-plugins-official` — which every Claude Code install has out of the box. There is no marketplace to add first. Official Anthropic marketplaces have auto-update enabled by default ([discover-plugins](https://code.claude.com/docs/en/discover-plugins)), so "updates arrive automatically" is a true claim, not a hope.

## Claude Code — the plugin

<canonical-block name="claude-code">

```bash
claude plugins install mattpocock-skills
```

Or, from inside a session:

```
/plugin install mattpocock-skills
```

It's in Claude Code's official marketplace, so there's nothing to add first, and updates arrive automatically.

</canonical-block>

## Codex, and other agents — skills.sh

The plugin is Claude Code only. Everywhere else, [skills.sh](https://skills.sh/mattpocock/skills) copies editable skill files into the project. Use the whole-set form on `README.md`:

<canonical-block name="skills-sh-whole-set">

```bash
npx skills@latest add mattpocock/skills
```

Pick the skills you want, and which coding agents to install them on. **The installer lets you choose which skills to take — make sure `setup-matt-pocock-skills` is one of them.**

</canonical-block>

…and the single-skill form wherever one skill is named on its own. Note that **`docs/` pages are not a consumer of this block**: ai-hero renders the install widget above the body, so a page that writes the commands out duplicates it. See [writing-docs.md](./writing-docs.md).

<canonical-block name="skills-sh-one-skill">

```bash
npx skills@latest add mattpocock/skills --skill=<name>
```

```bash
npx skills@latest update <name>
```

</canonical-block>

`skills@latest` is the pinned spelling in all three. The 24 pages under `docs/` used to carry the older bare `npx skills …`; those blocks are now deleted rather than corrected, because the site renders the install commands itself.

## The two routes are exclusive

The plugin is a managed, read-only bundle you subscribe to. skills.sh writes files you own and edit. Installing both leaves the user with every skill twice — always say "pick one".

## Not the install story

`.claude-plugin/marketplace.json` makes the repo its own single-plugin marketplace (`/plugin marketplace add mattpocock/skills`, then `/plugin install mattpocock-skills@mattpocock`). The official listing supersedes it. It is kept as a fallback for installing the repo directly — an unreleased commit, or a fork — and is **not** documented to users.
