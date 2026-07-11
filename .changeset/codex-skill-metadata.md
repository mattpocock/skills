---
"mattpocock-skills": minor
---

Add Codex metadata alongside the existing Claude Code skill frontmatter so the repository supports both harnesses without generated copies.

- Add `agents/openai.yaml` UI metadata and default prompts to every skill while retaining Claude Code's `disable-model-invocation` and `argument-hint` fields.
- Preserve user-only invocation in both harnesses and validate that their policies stay paired.
- Add an experimental runtime-aware `codex-handoff` skill that starts a fresh Codex task from the app or Claude Code, preferring OpenAI's Claude plugin before CLI and document fallbacks.
- Add repository-wide validation for cross-harness frontmatter, Codex metadata, promoted-bucket wiring, and docs coverage.
- Document Codex as a target of the existing `~/.agents/skills` symlink installer.
- Finish the existing promotion wiring for `resolving-merge-conflicts`.
