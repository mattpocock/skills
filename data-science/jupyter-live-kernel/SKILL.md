---
name: jupyter-live-kernel
description: >
  Use a live Jupyter kernel for stateful, iterative Python execution via hamelnb.
  Load this skill when the task involves exploration, iteration, or inspecting
  intermediate results — data science, ML experimentation, API exploration, or
  building up complex code step-by-step. Uses terminal to run CLI commands against
  a live Jupyter kernel. No new tools required.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [jupyter, notebook, repl, data-science, exploration, iterative]
    category: data-science
---

# Jupyter Live Kernel (hamelnb)

Gives you a **stateful Python REPL** via a live Jupyter kernel. Variables persist
across executions. Use this instead of `execute_code` when you need to build up
state incrementally, explore APIs, inspect DataFrames, or iterate on complex code.

## When to Use This vs Other Tools

| Tool | Use When |
|------|----------|
| **This skill** | Iterative exploration, state across steps, data science, ML, "let me try this and check" |
| `execute_code` | One-shot scripts needing hermes tool access (web_search, file ops). Stateless. |
| `terminal` | Shell commands, builds, installs, git, process management |

**Rule of thumb:** If you'd want a Jupyter notebook for the task, use this skill.

## Prerequisites

1. **uv** must be installed (check: `which uv`)
2. **JupyterLab** must be installed: `uv tool install jupyterlab`
3. A Jupyter server must be running (see Setup below)

## Setup

The hamelnb script location:
```
SCRIPT="$HOME/.agent-skills/hamelnb/skills/jupyter-live-kernel/scripts/jupyter_live_kernel.py"
```

If not cloned yet:
```
git clone https://github.com/hamelsmu/hamelnb.git ~/.agent-skills/hamelnb
```

### Starting JupyterLab

Check if a server is already running:
```
uv run "$SCRIPT" servers
```

If no servers found, start one:
```
jupyter-lab --no-browser --port=8888 --notebook-dir=$HOME/notebooks \
  --IdentityProvider.token='' --ServerApp.password='' > /tmp/jupyter.log 2>&1 &
sleep 3
```

Note: Token/password disabled for local agent access. The server runs headless.

### Creating a Notebook for REPL Use

If you just need a REPL (no existing notebook), create a minimal notebook file:
```
mkdir -p ~/notebooks
```
Write a minimal .ipynb JSON file with one empty code cell, then start a kernel
session via the Jupyter REST API:
```
curl -s -X POST http://127.0.0.1:8888/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"path":"scratch.ipynb","type":"notebook","name":"scratch.ipynb","kernel":{"name":"python3"}}'
```

## Core Workflow

All commands return structured JSON. Always use `--compact` to save tokens.

### 1. Discover servers and notebooks

```
uv run "$SCRIPT" servers --compact
uv run "$SCRIPT" notebooks --compact
```

### 2. Execute code (primary operation)

```
uv run "$SCRIPT" execute --path <notebook.ipynb> --code '<python code>' --compact
```

State persists across execute calls. Variables, imports, objects all survive.

Multi-line code works with $'...' quoting:
```
uv run "$SCRIPT" execute --path scratch.ipynb --code $'import os\nfiles = os.listdir(".")\nprint(f"Found {len(files)} files")' --compact
```

### 3. Inspect live variables

```
uv run "$SCRIPT" variables --path <notebook.ipynb> list --compact
uv run "$SCRIPT" variables --path <notebook.ipynb> preview --name <varname> --compact
```

### 4. Edit notebook cells

```
# View current cells
uv run "$SCRIPT" contents --path <notebook.ipynb> --compact

# Insert a new cell
uv run "$SCRIPT" edit --path <notebook.ipynb> insert \
  --at-index <N> --cell-type code --source '<code>' --compact

# Replace cell source (use cell-id from contents output)
uv run "$SCRIPT" edit --path <notebook.ipynb> replace-source \
  --cell-id <id> --source '<new code>' --compact

# Delete a cell
uv run "$SCRIPT" edit --path <notebook.ipynb> delete --cell-id <id> --compact
```

### 5. Verification (restart + run all)

Only use when the user asks for a clean verification or you need to confirm
the notebook runs top-to-bottom:

```
uv run "$SCRIPT" restart-run-all --path <notebook.ipynb> --save-outputs --compact
```

## Practical Tips from Experience

1. **First execution after server start may timeout** — the kernel needs a moment
   to initialize. If you get a timeout, just retry.

2. **The kernel Python is JupyterLab's Python** — packages must be installed in
   that environment. If you need additional packages, install them into the
   JupyterLab tool environment first.

3. **--compact flag saves significant tokens** — always use it. JSON output can
   be very verbose without it.

4. **For pure REPL use**, create a scratch.ipynb and don't bother with cell editing.
   Just use `execute` repeatedly.

5. **Argument order matters** — subcommand flags like `--path` go BEFORE the
   sub-subcommand. E.g.: `variables --path nb.ipynb list` not `variables list --path nb.ipynb`.

6. **If a session doesn't exist yet**, you need to start one via the REST API
   (see Setup section). The tool can't execute without a live kernel session.

7. **Errors are returned as JSON** with traceback — read the `ename` and `evalue`
   fields to understand what went wrong.

8. **Occasional websocket timeouts** — some operations may timeout on first try,
   especially after a kernel restart. Retry once before escalating.

## Timeout Defaults

The script has a 30-second default timeout per execution. For long-running
operations, pass `--timeout 120`. Use generous timeouts (60+) for initial
setup or heavy computation.
