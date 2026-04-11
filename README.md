# Agent Skills

A collection of agent skills that extend capabilities across planning, development, and tooling.

## Planning & Design

These skills help you think through problems before writing code.

- **write-a-prd** — Create a PRD through an interactive interview, codebase exploration, and module design. Filed as a GitHub issue.

  ```
  npx skills@latest add mattpocock/skills/write-a-prd
  ```

- **prd-to-plan** — Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices.

  ```
  npx skills@latest add mattpocock/skills/prd-to-plan
  ```

- **prd-to-issues** — Break a PRD into independently-grabbable GitHub issues using vertical slices.

  ```
  npx skills@latest add mattpocock/skills/prd-to-issues
  ```

- **grill-me** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.

  ```
  npx skills@latest add mattpocock/skills/grill-me
  ```

- **design-an-interface** — Generate multiple radically different interface designs for a module using parallel sub-agents.

  ```
  npx skills@latest add mattpocock/skills/design-an-interface
  ```

- **request-refactor-plan** — Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue.

  ```
  npx skills@latest add mattpocock/skills/request-refactor-plan
  ```

## Development

These skills help you write, refactor, debug, and verify code.

- **subagent-driven-development** — Use when executing implementation plans with independent tasks. Dispatches fresh delegate_task per task with two-stage review (spec compl...

  ```
  npx skills@latest add mattpocock/skills/subagent-driven-development
  ```

- **systematic-debugging** — Use when encountering any bug, test failure, or unexpected behavior. 4-phase root cause investigation — NO fixes without understanding th...

  ```
  npx skills@latest add mattpocock/skills/systematic-debugging
  ```

- **test-driven-development** — Use when implementing any feature or bugfix, before writing implementation code. Enforces RED-GREEN-REFACTOR cycle with test-first approach.

  ```
  npx skills@latest add mattpocock/skills/test-driven-development
  ```

- **writing-plans** — Use when you have a spec or requirements for a multi-step task. Creates comprehensive implementation plans with bite-sized tasks, exact f...

  ```
  npx skills@latest add mattpocock/skills/writing-plans
  ```

- **requesting-code-review** — >

  ```
  npx skills@latest add mattpocock/skills/requesting-code-review
  ```

- **code-review** — Guidelines for performing thorough code reviews with security and quality focus

  ```
  npx skills@latest add mattpocock/skills/code-review
  ```

- **plan** — Plan mode for Hermes — inspect context, write a markdown plan into the active workspace's `.hermes/plans/` directory, and do not execute...

  ```
  npx skills@latest add mattpocock/skills/plan
  ```

- **claude-cli-dev-workflow** — Use Claude Code CLI as an external coding agent for feature work, refactors, debugging, and code review. Prefer for one-shot implementati...

  ```
  npx skills@latest add mattpocock/skills/claude-cli-dev-workflow
  ```

## GitHub & Repo Ops

These skills help you manage repos, branches, PRs, issues, and GitHub authentication.

- **github-auth** — Set up GitHub authentication for the agent using git (universally available) or the gh CLI. Covers HTTPS tokens, SSH keys, credential hel...

  ```
  npx skills@latest add mattpocock/skills/github-auth
  ```

- **github-code-review** — Review code changes by analyzing git diffs, leaving inline comments on PRs, and performing thorough pre-push review. Works with gh CLI or...

  ```
  npx skills@latest add mattpocock/skills/github-code-review
  ```

- **github-pr-workflow** — Full pull request lifecycle — create branches, commit changes, open PRs, monitor CI status, auto-fix failures, and merge. Works with gh C...

  ```
  npx skills@latest add mattpocock/skills/github-pr-workflow
  ```

- **github-repo-management** — Clone, create, fork, configure, and manage GitHub repositories. Manage remotes, secrets, releases, and workflows. Works with gh CLI or fa...

  ```
  npx skills@latest add mattpocock/skills/github-repo-management
  ```

- **github-issues** — Create, manage, triage, and close GitHub issues. Search existing issues, add labels, assign people, and link to PRs. Works with gh CLI or...

  ```
  npx skills@latest add mattpocock/skills/github-issues
  ```

- **codebase-inspection** — Inspect and analyze codebases using pygount for LOC counting, language breakdown, and code-vs-comment ratios. Use when asked to check lin...

  ```
  npx skills@latest add mattpocock/skills/codebase-inspection
  ```

## MCP & Agent Infrastructure

These skills help you connect Hermes to MCP servers and agent infrastructure.

- **native-mcp** — Built-in MCP (Model Context Protocol) client that connects to external MCP servers, discovers their tools, and registers them as native H...

  ```
  npx skills@latest add mattpocock/skills/native-mcp
  ```

- **mcporter** — Use the mcporter CLI to list, configure, auth, and call MCP servers/tools directly (HTTP or stdio), including ad-hoc servers, config edit...

  ```
  npx skills@latest add mattpocock/skills/mcporter
  ```

## Tooling & Setup

- **setup-pre-commit** — Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.

  ```
  npx skills@latest add mattpocock/skills/setup-pre-commit
  ```

- **git-guardrails-claude-code** — Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, etc.) before they execute.

  ```
  npx skills@latest add mattpocock/skills/git-guardrails-claude-code
  ```

## Writing & Knowledge

- **write-a-skill** — Create new skills with proper structure, progressive disclosure, and bundled resources.

  ```
  npx skills@latest add mattpocock/skills/write-a-skill
  ```

- **edit-article** — Edit and improve articles by restructuring sections, improving clarity, and tightening prose.

  ```
  npx skills@latest add mattpocock/skills/edit-article
  ```

- **ubiquitous-language** — Extract a DDD-style ubiquitous language glossary from the current conversation.

  ```
  npx skills@latest add mattpocock/skills/ubiquitous-language
  ```

- **obsidian-vault** — Search, create, and manage notes in an Obsidian vault with wikilinks and index notes.

  ```
  npx skills@latest add mattpocock/skills/obsidian-vault
  ```


## Additional Local Skills

The following local skills were published from ~/.hermes/skills.

### Apple

- **apple-notes** — Manage Apple Notes via the memo CLI on macOS (create, view, search, edit).

  ```
  npx skills@latest add mattpocock/skills/apple-notes
  ```

- **apple-reminders** — Manage Apple Reminders via remindctl CLI (list, add, complete, delete).

  ```
  npx skills@latest add mattpocock/skills/apple-reminders
  ```

- **findmy** — Track Apple devices and AirTags via FindMy.app on macOS using AppleScript and screen capture.

  ```
  npx skills@latest add mattpocock/skills/findmy
  ```

- **imessage** — Send and receive iMessages/SMS via the imsg CLI on macOS.

  ```
  npx skills@latest add mattpocock/skills/imessage
  ```

### Autonomous Ai Agents

- **claude-code** — Delegate coding tasks to Claude Code (Anthropic's CLI agent). Use for building features, refactoring, PR reviews, and iterative coding. R...

  ```
  npx skills@latest add mattpocock/skills/claude-code
  ```

- **codex** — Delegate coding tasks to OpenAI Codex CLI agent. Use for building features, refactoring, PR reviews, and batch issue fixing. Requires the...

  ```
  npx skills@latest add mattpocock/skills/codex
  ```

- **opencode** — Delegate coding tasks to OpenCode CLI agent for feature implementation, refactoring, PR review, and long-running autonomous sessions. Req...

  ```
  npx skills@latest add mattpocock/skills/opencode
  ```

### Creative

- **ascii-art** — Generate ASCII art using pyfiglet (571 fonts), cowsay, boxes, toilet, image-to-ascii, remote APIs (asciified, ascii.co.uk), and LLM fallb...

  ```
  npx skills@latest add mattpocock/skills/ascii-art
  ```

- **ascii-video** — "Production pipeline for ASCII art video — any format. Converts video/audio/images/generative input into colored ASCII character video ou...

  ```
  npx skills@latest add mattpocock/skills/ascii-video
  ```

- **excalidraw** — Create hand-drawn style diagrams using Excalidraw JSON format. Generate .excalidraw files for architecture diagrams, flowcharts, sequence...

  ```
  npx skills@latest add mattpocock/skills/excalidraw
  ```

- **ideation** — "Generate project ideas through creative constraints. Use when the user says 'I want to build something', 'give me a project idea', 'I'm...

  ```
  npx skills@latest add mattpocock/skills/ideation
  ```

- **manim-video** — "Production pipeline for mathematical and technical animations using Manim Community Edition. Creates 3Blue1Brown-style explainer videos,...

  ```
  npx skills@latest add mattpocock/skills/manim-video
  ```

- **p5js** — "Production pipeline for interactive and generative visual art using p5.js. Creates browser-based sketches, generative art, data visualiz...

  ```
  npx skills@latest add mattpocock/skills/p5js
  ```

- **popular-web-designs** — >

  ```
  npx skills@latest add mattpocock/skills/popular-web-designs
  ```

- **songwriting-and-ai-music** — >

  ```
  npx skills@latest add mattpocock/skills/songwriting-and-ai-music
  ```

### Data Science

- **jupyter-live-kernel** — >

  ```
  npx skills@latest add mattpocock/skills/jupyter-live-kernel
  ```

- **pypf-charts** — Generate Point & Figure stock charts in the terminal using pypf. Use this skill when the user asks to chart a stock, draw P&F charts, ana...

  ```
  npx skills@latest add mattpocock/skills/pypf-charts
  ```

### Devops

- **webhook-subscriptions** — Create and manage webhook subscriptions for event-driven agent activation. Use when the user wants external services to trigger agent run...

  ```
  npx skills@latest add mattpocock/skills/webhook-subscriptions
  ```

### Dogfood

- **dogfood** — Systematic exploratory QA testing of web applications — find bugs, capture evidence, and generate structured reports

  ```
  npx skills@latest add mattpocock/skills/dogfood
  ```

### Email

- **himalaya** — CLI to manage emails via IMAP/SMTP. Use himalaya to list, read, write, reply, forward, search, and organize emails from the terminal. Sup...

  ```
  npx skills@latest add mattpocock/skills/himalaya
  ```

### Gaming

- **minecraft-modpack-server** — Set up a modded Minecraft server from a CurseForge/Modrinth server pack zip. Covers NeoForge/Forge install, Java version, JVM tuning, fir...

  ```
  npx skills@latest add mattpocock/skills/minecraft-modpack-server
  ```

- **pokemon-player** — Play Pokemon games autonomously via headless emulation. Starts a game server, reads structured game state from RAM, makes strategic decis...

  ```
  npx skills@latest add mattpocock/skills/pokemon-player
  ```

### Hermes Agent

- **hermes-agent** — Complete guide to using and extending Hermes Agent — CLI usage, setup, configuration, spawning additional agents, gateway platforms, skil...

  ```
  npx skills@latest add mattpocock/skills/hermes-agent
  ```

### Leisure

- **find-nearby** — Find nearby places (restaurants, cafes, bars, pharmacies, etc.) using OpenStreetMap. Works with coordinates, addresses, cities, zip codes...

  ```
  npx skills@latest add mattpocock/skills/find-nearby
  ```

### Media

- **gif-search** — Search and download GIFs from Tenor using curl. No dependencies beyond curl and jq. Useful for finding reaction GIFs, creating visual con...

  ```
  npx skills@latest add mattpocock/skills/gif-search
  ```

- **heartmula** — Set up and run HeartMuLa, the open-source music generation model family (Suno-like). Generates full songs from lyrics + tags with multili...

  ```
  npx skills@latest add mattpocock/skills/heartmula
  ```

- **songsee** — Generate spectrograms and audio feature visualizations (mel, chroma, MFCC, tempogram, etc.) from audio files via CLI. Useful for audio an...

  ```
  npx skills@latest add mattpocock/skills/songsee
  ```

- **youtube-content** — >

  ```
  npx skills@latest add mattpocock/skills/youtube-content
  ```

### Mlops

- **audiocraft-audio-generation** — PyTorch library for audio generation including text-to-music (MusicGen) and text-to-sound (AudioGen). Use when you need to generate music...

  ```
  npx skills@latest add mattpocock/skills/audiocraft-audio-generation
  ```

- **axolotl** — Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support

  ```
  npx skills@latest add mattpocock/skills/axolotl
  ```

- **clip** — OpenAI's model connecting vision and language. Enables zero-shot image classification, image-text matching, and cross-modal retrieval. Tr...

  ```
  npx skills@latest add mattpocock/skills/clip
  ```

- **dspy** — Build complex AI systems with declarative programming, optimize prompts automatically, create modular RAG systems and agents with DSPy -...

  ```
  npx skills@latest add mattpocock/skills/dspy
  ```

- **evaluating-llms-harness** — Evaluates LLMs across 60+ academic benchmarks (MMLU, HumanEval, GSM8K, TruthfulQA, HellaSwag). Use when benchmarking model quality, compa...

  ```
  npx skills@latest add mattpocock/skills/evaluating-llms-harness
  ```

- **fine-tuning-with-trl** — Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward opti...

  ```
  npx skills@latest add mattpocock/skills/fine-tuning-with-trl
  ```

- **gguf-quantization** — GGUF format and llama.cpp quantization for efficient CPU/GPU inference. Use when deploying models on consumer hardware, Apple Silicon, or...

  ```
  npx skills@latest add mattpocock/skills/gguf-quantization
  ```

- **grpo-rl-training** — Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training

  ```
  npx skills@latest add mattpocock/skills/grpo-rl-training
  ```

- **guidance** — Control LLM output with regex and grammars, guarantee valid JSON/XML/code generation, enforce structured formats, and build multi-step wo...

  ```
  npx skills@latest add mattpocock/skills/guidance
  ```

- **huggingface-hub** — Hugging Face Hub CLI (hf) — search, download, and upload models and datasets, manage repos, query datasets with SQL, deploy inference end...

  ```
  npx skills@latest add mattpocock/skills/huggingface-hub
  ```

- **llama-cpp** — Runs LLM inference on CPU, Apple Silicon, and consumer GPUs without NVIDIA hardware. Use for edge deployment, M1/M2/M3 Macs, AMD/Intel GP...

  ```
  npx skills@latest add mattpocock/skills/llama-cpp
  ```

- **modal-serverless-gpu** — Serverless GPU cloud platform for running ML workloads. Use when you need on-demand GPU access without infrastructure management, deployi...

  ```
  npx skills@latest add mattpocock/skills/modal-serverless-gpu
  ```

- **obliteratus** — Remove refusal behaviors from open-weight LLMs using OBLITERATUS — mechanistic interpretability techniques (diff-in-means, SVD, whitened...

  ```
  npx skills@latest add mattpocock/skills/obliteratus
  ```

- **outlines** — Guarantee valid JSON/XML/code structure during generation, use Pydantic models for type-safe outputs, support local models (Transformers,...

  ```
  npx skills@latest add mattpocock/skills/outlines
  ```

- **peft-fine-tuning** — Parameter-efficient fine-tuning for LLMs using LoRA, QLoRA, and 25+ methods. Use when fine-tuning large models (7B-70B) with limited GPU...

  ```
  npx skills@latest add mattpocock/skills/peft-fine-tuning
  ```

- **pytorch-fsdp** — Expert guidance for Fully Sharded Data Parallel training with PyTorch FSDP - parameter sharding, mixed precision, CPU offloading, FSDP2

  ```
  npx skills@latest add mattpocock/skills/pytorch-fsdp
  ```

- **segment-anything-model** — Foundation model for image segmentation with zero-shot transfer. Use when you need to segment any object in images using points, boxes, o...

  ```
  npx skills@latest add mattpocock/skills/segment-anything-model
  ```

- **serving-llms-vllm** — Serves LLMs with high throughput using vLLM's PagedAttention and continuous batching. Use when deploying production LLM APIs, optimizing...

  ```
  npx skills@latest add mattpocock/skills/serving-llms-vllm
  ```

- **stable-diffusion-image-generation** — State-of-the-art text-to-image generation with Stable Diffusion models via HuggingFace Diffusers. Use when generating images from text pr...

  ```
  npx skills@latest add mattpocock/skills/stable-diffusion-image-generation
  ```

- **unsloth** — Expert guidance for fast fine-tuning with Unsloth - 2-5x faster training, 50-80% less memory, LoRA/QLoRA optimization

  ```
  npx skills@latest add mattpocock/skills/unsloth
  ```

- **weights-and-biases** — Track ML experiments with automatic logging, visualize training in real-time, optimize hyperparameters with sweeps, and manage model regi...

  ```
  npx skills@latest add mattpocock/skills/weights-and-biases
  ```

- **whisper** — OpenAI's general-purpose speech recognition model. Supports 99 languages, transcription, translation to English, and language identificat...

  ```
  npx skills@latest add mattpocock/skills/whisper
  ```

### Note Taking

- **obsidian** — Read, search, and create notes in the Obsidian vault.

  ```
  npx skills@latest add mattpocock/skills/obsidian
  ```

### Red Teaming

- **godmode** — "Jailbreak API-served LLMs using G0DM0D3 techniques — Parseltongue input obfuscation (33 techniques), GODMODE CLASSIC system prompt templ...

  ```
  npx skills@latest add mattpocock/skills/godmode
  ```

### Research

- **arxiv** — Search and retrieve academic papers from arXiv using their free REST API. No API key needed. Search by keyword, author, category, or ID....

  ```
  npx skills@latest add mattpocock/skills/arxiv
  ```

- **blogwatcher** — Monitor blogs and RSS/Atom feeds for updates using the blogwatcher-cli tool. Add blogs, scan for new articles, track read status, and fil...

  ```
  npx skills@latest add mattpocock/skills/blogwatcher
  ```

- **llm-wiki** — "Karpathy's LLM Wiki — build and maintain a persistent, interlinked markdown knowledge base. Ingest sources, query compiled knowledge, an...

  ```
  npx skills@latest add mattpocock/skills/llm-wiki
  ```

- **ml-paper-writing** — Write publication-ready ML/AI papers for NeurIPS, ICML, ICLR, ACL, AAAI, COLM. Use when drafting papers from research repos, structuring...

  ```
  npx skills@latest add mattpocock/skills/ml-paper-writing
  ```

- **polymarket** — Query Polymarket prediction market data — search markets, get prices, orderbooks, and price history. Read-only via public REST APIs, no A...

  ```
  npx skills@latest add mattpocock/skills/polymarket
  ```

- **research-paper-writing** — End-to-end pipeline for writing ML/AI research papers — from experiment design through analysis, drafting, revision, and submission. Cove...

  ```
  npx skills@latest add mattpocock/skills/research-paper-writing
  ```

### Smart Home

- **openhue** — Control Philips Hue lights, rooms, and scenes via the OpenHue CLI. Turn lights on/off, adjust brightness, color, color temperature, and a...

  ```
  npx skills@latest add mattpocock/skills/openhue
  ```

### Social Media

- **xitter** — Interact with X/Twitter via the x-cli terminal client using official X API credentials. Use for posting, reading timelines, searching twe...

  ```
  npx skills@latest add mattpocock/skills/xitter
  ```

### Software Development

- **publish-local-skills-to-wiki** — Copy newly created local Hermes skills into the shared skills wiki repo and update the wiki README index. Use when the user wants to publ...

  ```
  npx skills@latest add mattpocock/skills/publish-local-skills-to-wiki
  ```
