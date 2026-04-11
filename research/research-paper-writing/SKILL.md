---
name: research-paper-writing
title: Research Paper Writing Pipeline
description: End-to-end pipeline for writing ML/AI research papers — from experiment design through analysis, drafting, revision, and submission. Covers NeurIPS, ICML, ICLR, ACL, AAAI, COLM. Integrates automated experiment monitoring, statistical analysis, iterative writing, and citation verification.
version: 1.1.0
author: Orchestra Research
license: MIT
dependencies: [semanticscholar, arxiv, habanero, requests, scipy, numpy, matplotlib, SciencePlots]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [Research, Paper Writing, Experiments, ML, AI, NeurIPS, ICML, ICLR, ACL, AAAI, COLM, LaTeX, Citations, Statistical Analysis]
    category: research
    related_skills: [arxiv, ml-paper-writing, subagent-driven-development, plan]
    requires_toolsets: [terminal, files]

---

# Research Paper Writing Pipeline

End-to-end pipeline for producing publication-ready ML/AI research papers targeting **NeurIPS, ICML, ICLR, ACL, AAAI, and COLM**. This skill covers the full research lifecycle: experiment design, execution, monitoring, analysis, paper writing, review, revision, and submission.

This is **not a linear pipeline** — it is an iterative loop. Results trigger new experiments. Reviews trigger new analysis. The agent must handle these feedback loops.

```
┌─────────────────────────────────────────────────────────────┐
│                    RESEARCH PAPER PIPELINE                  │
│                                                             │
│  Phase 0: Project Setup ──► Phase 1: Literature Review      │
│       │                          │                          │
│       ▼                          ▼                          │
│  Phase 2: Experiment     Phase 5: Paper Drafting ◄──┐      │
│       Design                     │                   │      │
│       │                          ▼                   │      │
│       ▼                    Phase 6: Self-Review      │      │
│  Phase 3: Execution &           & Revision ──────────┘      │
│       Monitoring                 │                          │
│       │                          ▼                          │
│       ▼                    Phase 7: Submission               │
│  Phase 4: Analysis ─────► (feeds back to Phase 2 or 5)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## When To Use This Skill

Use this skill when:
- **Starting a new research paper** from an existing codebase or idea
- **Designing and running experiments** to support paper claims
- **Writing or revising** any section of a research paper
- **Preparing for submission** to a specific conference or workshop
- **Responding to reviews** with additional experiments or revisions
- **Converting** a paper between conference formats
- **Writing non-empirical papers** — theory, survey, benchmark, or position papers (see [Paper Types Beyond Empirical ML](#paper-types-beyond-empirical-ml))
- **Designing human evaluations** for NLP, HCI, or alignment research
- **Preparing post-acceptance deliverables** — posters, talks, code releases

## Core Philosophy

1. **Be proactive.** Deliver complete drafts, not questions. Scientists are busy — produce something concrete they can react to, then iterate.
2. **Never hallucinate citations.** AI-generated citations have ~40% error rate. Always fetch programmatically. Mark unverifiable citations as `[CITATION NEEDED]`.
3. **Paper is a story, not a collection of experiments.** Every paper needs one clear contribution stated in a single sentence. If you can't do that, the paper isn't ready.
4. **Experiments serve claims.** Every experiment must explicitly state which claim it supports. Never run experiments that don't connect to the paper's narrative.
5. **Commit early, commit often.** Every completed experiment batch, every paper draft update — commit with descriptive messages. Git log is the experiment history.

### Proactivity and Collaboration

**Default: Be proactive. Draft first, ask with the draft.**

| Confidence Level | Action |
|-----------------|--------|
| **High** (clear repo, obvious contribution) | Write full draft, deliver, iterate on feedback |
| **Medium** (some ambiguity) | Write draft with flagged uncertainties, continue |
| **Low** (major unknowns) | Ask 1-2 targeted questions via `clarify`, then draft |

| Section | Draft Autonomously? | Flag With Draft |
|---------|-------------------|-----------------|
| Abstract | Yes | "Framed contribution as X — adjust if needed" |
| Introduction | Yes | "Emphasized problem Y — correct if wrong" |
| Methods | Yes | "Included details A, B, C — add missing pieces" |
| Experiments | Yes | "Highlighted results 1, 2, 3 — reorder if needed" |
| Related Work | Yes | "Cited papers X, Y, Z — add any I missed" |

**Block for input only when**: target venue unclear, multiple contradictory framings, results seem incomplete, explicit request to review first.

---

## Phase 0: Project Setup

**Goal**: Establish the workspace, understand existing work, identify the contribution.

### Step 0.1: Explore the Repository

```bash
# Understand project structure
ls -la
find . -name "*.py" | head -30
find . -name "*.md" -o -name "*.txt" | xargs grep -l -i "result\|conclusion\|finding"
```

Look for:
- `README.md` — project overview and claims
- `results/`, `outputs/`, `experiments/` — existing findings
- `configs/` — experimental settings
- `.bib` files — existing citations
- Draft documents or notes

### Step 0.2: Organize the Workspace

Establish a consistent workspace structure:

```
workspace/
  paper/               # LaTeX source, figures, compiled PDFs
  experiments/         # Experiment runner scripts
  code/                # Core method implementation
  results/             # Raw experiment results (auto-generated)
  tasks/               # Task/benchmark definitions
  human_eval/          # Human evaluation materials (if needed)
```

### Step 0.3: Set Up Version Control

```bash
git init  # if not already
git remote add origin <repo-url>
git checkout -b paper-draft  # or main
```

**Git discipline**: Every completed experiment batch gets committed with a descriptive message. Example:
```
Add Monte Carlo constrained results (5 runs, Sonnet 4.6, policy memo task)
Add Haiku baseline comparison: autoreason vs refinement baselines at cheap model tier
```

### Step 0.4: Identify the Contribution

Before writing anything, articulate:
- **The What**: What is the single thing this paper contributes?
- **The Why**: What evidence supports it?
- **The So What**: Why should readers care?

> Propose to the scientist: "Based on my understanding, the main contribution is: [one sentence]. The key results show [Y]. Is this the framing you want?"

### Step 0.5: Create a TODO List

Use the `todo` tool to create a structured project plan:

```
Research Paper TODO:
- [ ] Define one-sentence contribution
- [ ] Literature review (related work + baselines)
- [ ] Design core experiments
- [ ] Run experiments
- [ ] Analyze results
- [ ] Write first draft
- [ ] Self-review (simulate reviewers)
- [ ] Revise based on review
- [ ] Submission prep
```

Update this throughout the project. It serves as the persistent state across sessions.

### Step 0.6: Estimate Compute Budget

Before running experiments, estimate total cost and time:

```
Compute Budget Checklist:
- [ ] API costs: (model price per token) × (estimated tokens per run) × (number of runs)
- [ ] GPU hours: (time per experiment) × (number of experiments) × (number of seeds)
- [ ] Human evaluation costs: (annotators) × (hours) × (hourly rate)
- [ ] Total budget ceiling and contingency (add 30-50% for reruns)
```

Track actual spend as experiments run:
```python
# Simple cost tracker pattern
import json, os
from datetime import datetime

COST_LOG = "results/cost_log.jsonl"

def log_cost(experiment: str, model: str, input_tokens: int, output_tokens: int, cost_usd: float):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "experiment": experiment,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": cost_usd,
    }
    with open(COST_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
```

**When budget is tight**: Run pilot experiments (1-2 seeds, subset of tasks) before committing to full sweeps. Use cheaper models for debugging pipelines, then switch to target models for final runs.

### Step 0.7: Multi-Author Coordination

Most papers have 3-10 authors. Establish workflows early:

| Workflow | Tool | When to Use |
|----------|------|-------------|
| **Overleaf** | Browser-based | Multiple authors editing simultaneously, no git experience |
| **Git + LaTeX** | `git` with `.gitignore` for aux files | Technical teams, need branch-based review |
| **Overleaf + Git sync** | Overleaf premium | Best of both — live collab with version history |

**Section ownership**: Assign each section to one primary author. Others comment but don't edit directly. Prevents merge conflicts and style inconsistency.

```
Author Coordination Checklist:
- [ ] Agree on section ownership (who writes what)
- [ ] Set up shared workspace (Overleaf or git repo)
- [ ] Establish notation conventions (before anyone writes)
- [ ] Schedule internal review rounds (not just at the end)
- [ ] Designate one person for final formatting pass
- [ ] Agree on figure style (colors, fonts, sizes) before creating figures
```

**LaTeX conventions to agree on early**:
- `\method{}` macro for consistent method naming
- Citation style: `\citet{}` vs `\citep{}` usage
- Math notation: lowercase bold for vectors, uppercase bold for matrices, etc.
- British vs American spelling

---

## Phase 1: Literature Review

**Goal**: Find related work, identify baselines, gather citations.

### Step 1.1: Identify Seed Papers

Start from papers already referenced in the codebase:

```bash
# Via terminal:
grep -r "arxiv\|doi\|cite" --include="*.md" --include="*.bib" --include="*.py"
find . -name "*.bib"
```

### Step 1.2: Search for Related Work

**Load the `arxiv` skill** for structured paper discovery: `skill_view("arxiv")`. It provides arXiv REST API search, Semantic Scholar citation graphs, author profiles, and BibTeX generation.

Use `web_search` for broad discovery, `web_extract` for fetching specific papers:

```
# Via web_search:
web_search("[main technique] + [application domain] site:arxiv.org")
web_search("[baseline method] comparison ICML NeurIPS 2024")

# Via web_extract (for specific papers):
web_extract("https://arxiv.org/abs/2303.17651")
```

Additional search queries to try:

```
Search queries:
- "[main technique] + [application domain]"
- "[baseline method] comparison"
- "[problem name] state-of-the-art"
- Author names from existing citations
```

**Recommended**: Install **Exa MCP** for real-time academic search:
```bash
claude mcp add exa -- npx -y mcp-remote "https://mcp.exa.ai/mcp"
```

### Step 1.2b: Deepen the Search (Breadth-First, Then Depth)

A flat search (one round of queries) typically misses important related work. Use an iterative **breadth-then-depth** pattern inspired by deep research pipelines:

```
Iterative Literature Search:

Round 1 (Breadth): 4-6 parallel queries covering different angles
  - "[method] + [domain]"
  - "[problem name] state-of-the-art 2024 2025"
  - "[baseline method] comparison"
  - "[alternative approach] vs [your approach]"
  → Collect papers, extract key concepts and terminology

Round 2 (Depth): Generate follow-up queries from Round 1 learnings
  - New terminology discovered in Round 1 papers
  - Papers cited by the most relevant Round 1 results
  - Contradictory findings that need investigation
  → Collect papers, identify remaining gaps

Round 3 (Targeted): Fill specific gaps
  - Missing baselines identified in Rounds 1-2
  - Concurrent work (last 6 months, same problem)
  - Key negative results or failed approaches
  → Stop when new queries return mostly papers you've already seen
```

**When to stop**: If a round returns >80% papers already in your collection, the search is saturated. Typically 2-3 rounds suffice. For survey papers, expect 4-5 rounds.

**For agent-based workflows**: Delegate each round's queries in parallel via `delegate_task`. Collect results, deduplicate, then generate the next round's queries from the combined learnings.

### Step 1.3: Verify Every Citation

**NEVER generate BibTeX from memory. ALWAYS fetch programmatically.**

For each citation, follow the mandatory 5-step process:

```
Citation Verification (MANDATORY per citation):
1. SEARCH → Query Semantic Scholar or Exa MCP with specific keywords
2. VERIFY → Confirm paper exists in 2+ sources (Semantic Scholar + arXiv/CrossRef)
3. RETRIEVE → Get BibTeX via DOI content negotiation (programmatically, not from memory)
4. VALIDATE → Confirm the claim you're citing actually appears in the paper
5. ADD → Add verified BibTeX to bibliography
If ANY step fails → mark as [CITATION NEEDED], inform scientist
```

```python
# Fetch BibTeX via DOI
import requests

def doi_to_bibtex(doi: str) -> str:
    response = requests.get(
        f"https://doi.org/{doi}",
        headers={"Accept": "application/x-bibtex"}
    )
    response.raise_for_status()
    return response.text
```

If you cannot verify a citation:

```latex
\cite{PLACEHOLDER_author2024_verify_this}  % TODO: Verify this citation exists
```

**Always tell the scientist**: "I've marked [X] citations as placeholders that need verification."

See [references/citation-workflow.md](references/citation-workflow.md) for complete API documentation and the full `CitationManager` class.

### Step 1.4: Organize Related Work

Group papers by methodology, not paper-by-paper:

**Good**: "One line of work uses X's assumption [refs] whereas we use Y's assumption because..."
**Bad**: "Smith et al. introduced X. Jones et al. introduced Y. We combine both."

---

## Phase 2: Experiment Design

**Goal**: Design experiments that directly support paper claims. Every experiment must answer a specific question.

### Step 2.1: Map Claims to Experiments

Create an explicit mapping:

| Claim | Experiment | Expected Evidence |
|-------|-----------|-------------------|
| "Our method outperforms baselines" | Main comparison (Table 1) | Win rate, statistical significance |
| "Effect is larger for weaker models" | Model scaling study | Monotonic improvement curve |
| "Convergence requires scope constraints" | Constrained vs unconstrained | Convergence rate comparison |

**Rule**: If an experiment doesn't map to a claim, don't run it.

### Step 2.2: Design Baselines

Strong baselines are what separates accepted papers from rejected ones. Reviewers will ask: "Did they compare against X?"

Standard baseline categories:
- **Naive baseline**: Simplest possible approach
- **Strong baseline**: Best known existing method
- **Ablation baselines**: Your method minus one component
- **Compute-matched baselines**: Same compute budget, different allocation

### Step 2.3: Define Evaluation Protocol

Before running anything, specify:
- **Metrics**: What you're measuring, direction symbols (higher/lower better)
- **Aggregation**: How results are combined across runs/tasks
- **Statistical tests**: What tests will establish significance
- **Sample sizes**: How many runs/problems/tasks

### Step 2.4: Write Experiment Scripts

Follow these patterns from successful research pipelines:

**Incremental saving** — save results after each step for crash recovery:
```python
# Save after each problem/task
result_path = f"results/{task}/{strategy}/result.json"
if os.path.exists(result_path):
    continue  # Skip already-completed work
# ... run experiment ...
with open(result_path, 'w') as f:
    json.dump(result, f, indent=2)
```

**Artifact preservation** — save all intermediate outputs:
```
results/<experiment>/
  <task>/
    <strategy>/
      final_output.md          # Final result
      history.json             # Full trajectory
      pass_01/                 # Per-iteration artifacts
        version_a.md
        version_b.md
        critic.md
```

**Separation of concerns** — keep generation, evaluation, and visualization separate:
```
run_experiment.py              # Core experiment runner
run_baselines.py               # Baseline comparison
run_comparison_judge.py        # Blind evaluation
analyze_results.py             # Statistical analysis
make_charts.py                 # Visualization
```

See [references/experiment-patterns.md](references/experiment-patterns.md) for complete design patterns, cron monitoring, and error recovery.

### Step 2.5: Design Human Evaluation (If Applicable)

Many NLP, HCI, and alignment papers require human evaluation as primary or complementary evidence. Design this before running automated experiments — human eval often has longer lead times (IRB approval, annotator recruitment).

**When human evaluation is needed:**
- Automated metrics don't capture what you care about (fluency, helpfulness, safety)
- Your contribution is about human-facing qualities (readability, preference, trust)
- Reviewers at NLP venues (ACL, EMNLP) expect it for generation tasks

**Key design decisions:**

| Decision | Options | Guidance |
|----------|---------|----------|
| **Annotator type** | Expert, crowdworker, end-user | Match to what your claims require |
| **Scale** | Likert (1-5), pairwise comparison, ranking | Pairwise is more reliable than Likert for LLM outputs |
| **Sample size** | Per annotator and total items | Power analysis or minimum 100 items, 3+ annotators |
| **Agreement metric** | Cohen's kappa, Krippendorff's alpha, ICC | Krippendorff's alpha for >2 annotators; report raw agreement too |
| **Platform** | Prolific, MTurk, internal team | Prolific for quality; MTurk for scale; internal for domain expertise |

**Annotation guideline checklist:**
```
- [ ] Clear task description with examples (good AND bad)
- [ ] Decision criteria for ambiguous cases
- [ ] At least 2 worked examples per category
- [ ] Attention checks / gold standard items (10-15% of total)
- [ ] Qualification task or screening round
- [ ] Estimated time per item and fair compensation (>= local minimum wage)
- [ ] IRB/ethics review if required by your institution
```

**Reporting requirements** (reviewers check all of these):
- Number of annotators and their qualifications
- Inter-annotator agreement with specific metric and value
- Compensation details (amount, estimated hourly rate)
- Annotation interface description or screenshot (appendix)
- Total annotation time

See [references/human-evaluation.md](references/human-evaluation.md) for complete guide including statistical tests for human eval data, crowdsourcing quality control patterns, and IRB guidance.

---

## Phase 3: Experiment Execution & Monitoring

**Goal**: Run experiments reliably, monitor progress, recover from failures.

### Step 3.1: Launch Experiments

Use `nohup` for long-running experiments:

```bash
nohup python run_experiment.py --config config.yaml > logs/experiment_01.log 2>&1 &
echo $!  # Record the PID
```

**Parallel execution**: Run independent experiments simultaneously, but be aware of API rate limits. 4+ concurrent experiments on the same API will slow each down.

### Step 3.2: Set Up Monitoring (Cron Pattern)

For long-running experiments, set up periodic status checks. The cron prompt should follow this template:

```
Monitor Prompt Template:
1. Check if process is still running: ps aux | grep <pattern>
2. Read last 30 lines of log: tail -30 <logfile>
3. Check for completed results: ls <result_dir>
4. If results exist, read and report: cat <result_file>
5. If all done, commit: git add -A && git commit -m "<descriptive message>" && git push
6. Report in structured format (tables with key metrics)
7. Answer the key analytical question for this experiment
```

**Silent mode**: If nothing has changed since the last check, respond with `[SILENT]` to suppress notification to the user. Only report when there's news.

### Step 3.3: Handle Failures

Common failure modes and recovery:

| Failure | Detection | Recovery |
|---------|-----------|----------|
| API rate limit / credit exhaustion | 402/429 errors in logs | Wait, then re-run (scripts skip completed work) |
| Process crash | PID gone, incomplete results | Re-run from last checkpoint |
| Timeout on hard problems | Process stuck, no log progress | Kill and skip, note in results |
| Wrong model ID | Errors referencing model name | Fix ID and re-run |

**Key**: Scripts should always check for existing results and skip completed work. This makes re-runs safe and efficient.

### Step 3.4: Commit Completed Results

After each experiment batch completes:

```bash
git add -A
git commit -m "Add <experiment name>: <key finding in 1 line>"
git push
```

### Step 3.5: Maintain an Experiment Journal

Git commits track what happened, but not the **exploration tree** — the decisions about what to try next based on what you learned. Maintain a structured experiment journal that captures this tree:

```json
// experiment_journal.jsonl — append one entry per experiment attempt
{
  "id": "exp_003",
  "parent": "exp_001",
  "timestamp": "2025-05-10T14:30:00Z",
  "hypothesis": "Adding scope constraints will fix convergence failure from exp_001",
  "plan": "Re-run autoreason with max_tokens=2000 and fixed structure template",
  "config": {"model": "haiku", "strategy": "autoreason", "max_tokens": 2000},
  "status": "completed",
  "result_path": "results/exp_003/",
  "key_metrics": {"win_rate": 0.85, "convergence_rounds": 3},
  "analysis": "Scope constraints fixed convergence. Win rate jumped from 0.42 to 0.85.",
  "next_steps": ["Try same constraints on Sonnet", "Test without structure template"],
  "figures": ["figures/exp003_convergence.pdf"]
}
```

**Why a journal, not just git?** Git tracks file changes. The journal tracks the reasoning: why you tried X, what you learned, and what that implies for the next experiment. When writing the paper, this tree is invaluable for the Methods section ("we observed X, which motivated Y") and for honest failure reporting.

**Selecting the best path**: When the journal shows a branching tree (exp_001 → exp_002a, exp_002b, exp_003), identify the path that best supports the paper's claims. Document dead-end branches in the appendix as ablations or negative results.

**Snapshot code per experiment**: Copy the experiment script after each run:
```bash
cp experiment.py results/exp_003/experiment_snapshot.py
```
This enables exact reproduction even after subsequent code changes.

---

## Phase 4: Result Analysis

**Goal**: Extract findings, compute statistics, identify the story.

### Step 4.1: Aggregate Results

Write analysis scripts that:
1. Load all result files from a batch
2. Compute per-task and aggregate metrics
3. Generate summary tables

```python
# Standard analysis pattern
import json, os
from pathlib import Path

results = {}
for result_file in Path("results/").rglob("result.json"):
    data = json.loads(result_file.read_text())
    strategy = result_file.parent.name
    task = result_file.parent.parent.name
    results.setdefault(strategy, {})[task] = data

# Compute aggregate metrics
for strategy, tasks in results.items():
    scores = [t["score"] for t in tasks.values()]
    print(f"{strategy}: mean={np.mean(scores):.1f}, std={np.std(scores):.1f}")
```

### Step 4.2: Statistical Significance

Always compute:
- **Error bars**: Standard deviation or standard error, specify which
- **Confidence intervals**: 95% CI for key results
- **Pairwise tests**: McNemar's test for comparing two methods
- **Effect sizes**: Cohen's d or h for practical significance

See [references/experiment-patterns.md](references/experiment-patterns.md) for complete implementations of McNemar's test, bootstrapped CIs, and Cohen's h.

### Step 4.3: Identify the Story

After analysis, explicitly answer:
1. **What is the main finding?** State it in one sentence.
2. **What surprised you?** Unexpected results often make the best papers.
3. **What failed?** Failed experiments can be the most informative. Honest reporting of failures strengthens the paper.
4. **What follow-up experiments are needed?** Results often raise new questions.

#### Handling Negative or Null Results

When your hypothesis was wrong or results are inconclusive, you have three options:

| Situation | Action | Venue Fit |
|-----------|--------|-----------|
| Hypothesis wrong but **why** is informative | Frame paper around the analysis of why | NeurIPS, ICML (if analysis is rigorous) |
| Method doesn't beat baselines but **reveals something new** | Reframe contribution as understanding/analysis | ICLR (values understanding), workshop papers |
| Clean negative result on popular claim | Write it up — the field needs to know | NeurIPS Datasets & Benchmarks, TMLR, workshops |
| Results inconclusive, no clear story | Pivot — run different experiments or reframe | Don't force a paper that isn't there |

**How to write a negative results paper:**
- Lead with what the community believes and why it matters to test it
- Describe your rigorous methodology (must be airtight — reviewers will scrutinize harder)
- Present the null result clearly with statistical evidence
- Analyze **why** the expected result didn't materialize
- Discuss implications for the field

**Venues that explicitly welcome negative results**: NeurIPS (Datasets & Benchmarks track), TMLR, ML Reproducibility Challenge, workshops at major conferences. Some workshops specifically call for negative results.

### Step 4.4: Create Figures and Tables

**Figures**:
- Use vector graphics (PDF) for all plots: `plt.savefig('fig.pdf')`
- Colorblind-safe palettes (Okabe-Ito or Paul Tol)
- Self-contained captions — reader should understand without main text
- No title inside figure — the caption serves this function

**Tables**:
- Use `booktabs` LaTeX package
- Bold best value per metric
- Include direction symbols (higher/lower better)
- Consistent decimal precision

```latex
\usepackage{booktabs}
\begin{tabular}{lcc}
\toprule
Method & Accuracy $\uparrow$ & Latency $\downarrow$ \\
\midrule
Baseline & 85.2 & 45ms \\
\textbf{Ours} & \textbf{92.1} & 38ms \\
\bottomrule
\end{tabular}
```

### Step 4.5: Decide: More Experiments or Write?

| Situation | Action |
|-----------|--------|
| Core claims supported, results significant | Move to Phase 5 (writing) |
| Results inconclusive, need more data | Back to Phase 2 (design) |
| Unexpected finding suggests new direction | Back to Phase 2 (design) |
| Missing one ablation reviewers will ask for | Run it, then Phase 5 |
| All experiments done but some failed | Note failures, move to Phase 5 |

### Step 4.6: Write the Experiment Log (Bridge to Writeup)

Before moving to paper writing, create a structured experiment log that bridges results to prose. This is the single most important connective tissue between experiments and the writeup — without it, the writing agent has to re-derive the story from raw result files.

**Create `experiment_log.md`** with the following structure:

```markdown
# Experiment Log

## Contribution (one sentence)
[The paper's main claim]

## Experiments Run

### Experiment 1: [Name]
- **Claim tested**: [Which paper claim this supports]
- **Setup**: [Model, dataset, config, number of runs]
- **Key result**: [One sentence with the number]
- **Result files**: results/exp1/final_info.json
- **Figures generated**: figures/exp1_comparison.pdf
- **Surprising findings**: [Anything unexpected]

### Experiment 2: [Name]
...

## Figures
| Filename | Description | Which section it belongs in |
|----------|-------------|---------------------------|
| figures/main_comparison.pdf | Bar chart comparing all methods on benchmark X | Results, Figure 2 |
| figures/ablation.pdf | Ablation removing components A, B, C | Results, Figure 3 |
...

## Failed Experiments (document for honesty)
- [What was tried, why it failed, what it tells us]

## Open Questions
- [Anything the results raised that the paper should address]
```

**Why this matters**: When drafting, the agent (or a delegated sub-agent) can load `experiment_log.md` alongside the LaTeX template and produce a first draft grounded in actual results. Without this bridge, the writing agent must parse raw JSON/CSV files and infer the story — a common source of hallucinated or misreported numbers.

**Git discipline**: Commit this log alongside the results it describes.

---

## Iterative Refinement: Strategy Selection

Any output in this pipeline — paper drafts, experiment scripts, analysis — can be iteratively refined. The autoreason research provides empirical evidence for when each refinement strategy works and when it fails. Use this section to choose the right approach.

### Quick Decision Table

| Your Situation | Strategy | Why |
|---------------|----------|-----|
| Mid-tier model + constrained task | **Autoreason** | Sweet spot. Generation-evaluation gap is widest. Baselines actively destroy weak model outputs. |
| Mid-tier model + open task | **Autoreason** with scope constraints added | Add fixed facts, structure, or deliverable to bound the improvement space. |
| Frontier model + constrained task | **Autoreason** | Wins 2/3 constrained tasks even at frontier. |
| Frontier model + unconstrained task | **Critique-and-revise** or **single pass** | Autoreason comes last. Model self-evaluates well enough. |
| Concrete technical task (system design) | **Critique-and-revise** | Direct find-and-fix loop is more efficient. |
| Template-filling task (one correct structure) | **Single pass** or **conservative** | Minimal decision space. Iteration adds no value. |
| Code with test cases | **Autoreason (code variant)** | Structured analysis of *why* it failed before fixing. Recovery rate 62% vs 43%. |
| Very weak model (Llama 8B class) | **Single pass** | Model too weak for diverse candidates. Invest in generation quality. |

### The Generation-Evaluation Gap

**Core insight**: Autoreason's value depends on the gap between a model's generation capability and its self-evaluation capability.

```
Model Tier        │ Generation │ Self-Eval │ Gap    │ Autoreason Value
──────────────────┼────────────┼───────────┼────────┼─────────────────
Weak (Llama 8B)   │ Poor       │ Poor      │ Small  │ None — can't generate diverse candidates
Mid (Haiku 3.5)   │ Decent     │ Poor      │ LARGE  │ MAXIMUM — 42/42 perfect Borda
Mid (Gemini Flash)│ Decent     │ Moderate  │ Large  │ High — wins 2/3
Strong (Sonnet 4) │ Good       │ Decent    │ Medium │ Moderate — wins 3/5
Frontier (S4.6)   │ Excellent  │ Good      │ Small  │ Only with constraints
```

This gap is structural, not temporary. As costs drop, today's frontier becomes tomorrow's mid-tier. The sweet spot moves but never disappears.

### Autoreason Loop (Summary)

Each pass produces three candidates from fresh, isolated agents:

1. **Critic** → finds problems in incumbent A (no fixes)
2. **Author B** → revises A based on critique
3. **Synthesizer** → merges A and B (randomized labels)
4. **Judge Panel** → 3 blind CoT judges rank A, B, AB via Borda count
5. **Convergence** → A wins k=2 consecutive passes → done

**Key parameters:**
- k=2 convergence (k=1 premature, k=3 too expensive, no quality gain)
- CoT judges always (3x faster convergence)
- Temperature 0.8 authors, 0.3 judges
- Conservative tiebreak: incumbent wins ties
- Every role is a fresh agent with no shared context

### Applying to Paper Drafts

When refining the paper itself through autoreason:
- **Provide ground truth to the critic**: actual experimental data, result JSONs, statistical outputs. Without this, models hallucinate fabricated ablation studies and fake confidence intervals.
- **Use 3 working judges minimum**: A broken judge parser doesn't add noise — it prevents equilibrium entirely.
- **Scope constrain the revision**: "Address these specific weaknesses" not "improve the paper."

### Failure Modes

| Failure | Detection | Fix |
|---------|-----------|-----|
| No convergence (A never wins) | A wins <15% over 20+ passes | Add scope constraints to the task |
| Synthesis drift | Word counts grow unboundedly | Constrain structure and deliverable |
| Degradation below single pass | Baselines score higher than iterated output | Switch to single pass; model may be too weak |
| Overfitting (code) | High public-test pass, low private-test pass | Use structured analysis, not just test feedback |
| Broken judges | Parsing failures reduce panel below 3 | Fix parser before continuing |

See [references/autoreason-methodology.md](references/autoreason-methodology.md) for complete prompts, Borda scoring details, model selection guide, scope constraint design patterns, and compute budget reference.

---

## Phase 5: Paper Drafting

**Goal**: Write a complete, publication-ready paper.

### Context Management for Large Projects

A paper project with 50+ experiment files, multiple result directories, and extensive literature notes can easily exceed the agent's context window. Manage this proactively:

**What to load into context per drafting task:**

| Drafting Task | Load Into Context | Do NOT Load |
|---------------|------------------|-------------|
| Writing Introduction | `experiment_log.md`, contribution statement, 5-10 most relevant paper abstracts | Raw result JSONs, full experiment scripts, all literature notes |
| Writing Methods | Experiment configs, pseudocode, architecture description | Raw logs, results from other experiments |
| Writing Results | `experiment_log.md`, result summary tables, figure list | Full analysis scripts, intermediate data |
| Writing Related Work | Organized citation notes (Step 1.4 output), .bib file | Experiment files, raw PDFs |
| Revision pass | Full paper draft, specific reviewer concerns | Everything else |

**Principles:**
- **`experiment_log.md` is the primary context bridge** — it summarizes everything needed for writing without loading raw data files (see Step 4.6)
- **Load one section's context at a time** when delegating. A sub-agent drafting Methods doesn't need the literature review notes.
- **Summarize, don't include raw files.** For a 200-line result JSON, load a 10-line summary table. For a 50-page related paper, load the 5-sentence abstract + your 2-line note about its relevance.
- **For very large projects**: Create a `context/` directory with pre-compressed summaries:
  ```
  context/
    contribution.md          # 1 sentence
    experiment_summary.md    # Key results table (from experiment_log.md)
    literature_map.md        # Organized citation notes
    figure_inventory.md      # List of figures with descriptions
  ```

### The Narrative Principle

**The single most critical insight**: Your paper is not a collection of experiments — it's a story with one clear contribution supported by evidence.

Every successful ML paper centers on what Neel Nanda calls "the narrative": a short, rigorous, evidence-based technical story with a takeaway readers care about.

**Three Pillars (must be crystal clear by end of introduction):**

| Pillar | Description | Test |
|--------|-------------|------|
| **The What** | 1-3 specific novel claims | Can you state them in one sentence? |
| **The Why** | Rigorous empirical evidence | Do experiments distinguish your hypothesis from alternatives? |
| **The So What** | Why readers should care | Does this connect to a recognized community problem? |

**If you cannot state your contribution in one sentence, you don't yet have a paper.**

### Time Allocation

Spend approximately **equal time** on each of:
1. The abstract
2. The introduction
3. The figures
4. Everything else combined

**Why?** Most reviewers form judgments before reaching your methods. Readers encounter your paper as: title → abstract → introduction → figures → maybe the rest.

### Writing Workflow

```
Paper Writing Checklist:
- [ ] Step 1: Define the one-sentence contribution
- [ ] Step 2: Draft Figure 1 (core idea or most compelling result)
- [ ] Step 3: Draft abstract (5-sentence formula)
- [ ] Step 4: Draft introduction (1-1.5 pages max)
- [ ] Step 5: Draft methods
- [ ] Step 6: Draft experiments & results
- [ ] Step 7: Draft related work
- [ ] Step 8: Draft conclusion & discussion
- [ ] Step 9: Draft limitations (REQUIRED by all venues)
- [ ] Step 10: Plan appendix (proofs, extra experiments, details)
- [ ] Step 11: Complete paper checklist
- [ ] Step 12: Final review
```

### Two-Pass Refinement Pattern

When drafting with an AI agent, use a **two-pass** approach (proven effective in SakanaAI's AI-Scientist pipeline):

**Pass 1 — Write + immediate refine per section:**
For each section, write a complete draft, then immediately refine it in the same context. This catches local issues (clarity, flow, completeness) while the section is fresh.

**Pass 2 — Global refinement with full-paper context:**
After all sections are drafted, revisit each section with awareness of the complete paper. This catches cross-section issues: redundancy, inconsistent terminology, narrative flow, and gaps where one section promises something another doesn't deliver.

```
Second-pass refinement prompt (per section):
"Review the [SECTION] in the context of the complete paper.
- Does it fit with the rest of the paper? Are there redundancies with other sections?
- Is terminology consistent with Introduction and Methods?
- Can anything be cut without weakening the message?
- Does the narrative flow from the previous section and into the next?
Make minimal, targeted edits. Do not rewrite from scratch."
```

### LaTeX Error Checklist

Append this checklist to every refinement prompt. These are the most common errors when LLMs write LaTeX:

```
LaTeX Quality Checklist (verify after every edit):
- [ ] No unenclosed math symbols ($ signs balanced)
- [ ] Only reference figures/tables that exist (\ref matches \label)
- [ ] No fabricated citations (\cite matches entries in .bib)
- [ ] Every \begin{env} has matching \end{env} (especially figure, table, algorithm)
- [ ] No HTML contamination (</end{figure}> instead of \end{figure})
- [ ] No unescaped underscores outside math mode (use \_ in text)
- [ ] No duplicate \label definitions
- [ ] No duplicate section headers
- [ ] Numbers in text match actual experimental results
- [ ] All figures have captions and labels
- [ ] No overly long lines that cause overfull hbox warnings
```

### Step 5.0: Title

The title is the single most-read element of the paper. It determines whether anyone clicks through to the abstract.

**Good titles**:
- State the contribution or finding: "Autoreason: When Iterative LLM Refinement Works and Why It Fails"
- Highlight a surprising result: "Scaling Data-Constrained Language Models" (implies you can)
- Name the method + what it does: "DPO: Direct Preference Optimization of Language Models"

**Bad titles**:
- Too generic: "An Approach to Improving Language Model Outputs"
- Too long: anything over ~15 words
- Jargon-only: "Asymptotic Convergence of Iterative Stochastic Policy Refinement" (who is this for?)

**Rules**:
- Include your method name if you have one (for citability)
- Include 1-2 keywords reviewers will search for
- Avoid colons unless both halves carry meaning
- Test: would a reviewer know the domain and contribution from the title alone?

### Step 5.1: Abstract (5-Sentence Formula)

From Sebastian Farquhar (DeepMind):

```
1. What you achieved: "We introduce...", "We prove...", "We demonstrate..."
2. Why this is hard and important
3. How you do it (with specialist keywords for discoverability)
4. What evidence you have
5. Your most remarkable number/result
```

**Delete** generic openings like "Large language models have achieved remarkable success..."

### Step 5.2: Figure 1

Figure 1 is the second thing most readers look at (after abstract). Draft it before writing the introduction — it forces you to clarify the core idea.

| Figure 1 Type | When to Use | Example |
|---------------|-------------|---------|
| **Method diagram** | New architecture or pipeline | TikZ flowchart showing your system |
| **Results teaser** | One compelling result tells the whole story | Bar chart: "Ours vs baselines" with clear gap |
| **Problem illustration** | The problem is unintuitive | Before/after showing failure mode you fix |
| **Conceptual diagram** | Abstract contribution needs visual grounding | 2x2 matrix of method properties |

**Rules**: Figure 1 must be understandable without reading any text. The caption alone should communicate the core idea. Use color purposefully — don't just decorate.

### Step 5.3: Introduction (1-1.5 pages max)

Must include:
- Clear problem statement
- Brief approach overview
- 2-4 bullet contribution list (max 1-2 lines each in two-column format)
- Methods should start by page 2-3

### Step 5.4: Methods

Enable reimplementation:
- Conceptual outline or pseudocode
- All hyperparameters listed
- Architectural details sufficient for reproduction
- Present final design decisions; ablations go in experiments

### Step 5.5: Experiments & Results

For each experiment, explicitly state:
- **What claim it supports**
- How it connects to main contribution
- What to observe: "the blue line shows X, which demonstrates Y"

Requirements:
- Error bars with methodology (std dev vs std error)
- Hyperparameter search ranges
- Compute infrastructure (GPU type, total hours)
- Seed-setting methods

### Step 5.6: Related Work

Organize methodologically, not paper-by-paper. Cite generously — reviewers likely authored relevant papers.

### Step 5.7: Limitations (REQUIRED)

All major conferences require this. Honesty helps:
- Reviewers are instructed not to penalize honest limitation acknowledgment
- Pre-empt criticisms by identifying weaknesses first
- Explain why limitations don't undermine core claims

### Step 5.8: Conclusion & Discussion

**Conclusion** (required, 0.5-1 page):
- Restate the contribution in one sentence (different wording from abstract)
- Summarize key findings (2-3 sentences, not a list)
- Implications: what does this mean for the field?
- Future work: 2-3 concrete next steps (not vague "we leave X for future work")

**Discussion** (optional, sometimes combined with conclusion):
- Broader implications beyond immediate results
- Connections to other subfields
- Honest assessment of when the method does and doesn't work
- Practical deployment considerations

**Do NOT** introduce new results or claims in the conclusion.

### Step 5.9: Appendix Strategy

Appendices are unlimited at all major venues and are essential for reproducibility. Structure:

| Appendix Section | What Goes Here |
|-----------------|---------------|
| **Proofs & Derivations** | Full proofs too long for main text. Main text can state theorems with "proof in Appendix A." |
| **Additional Experiments** | Ablations, scaling curves, per-dataset breakdowns, hyperparameter sensitivity |
| **Implementation Details** | Full hyperparameter tables, training details, hardware specs, random seeds |
| **Dataset Documentation** | Data collection process, annotation guidelines, licensing, preprocessing |
| **Prompts & Templates** | Exact prompts used (for LLM-based methods), evaluation templates |
| **Human Evaluation** | Annotation interface screenshots, instructions given to annotators, IRB details |
| **Additional Figures** | Per-task breakdowns, trajectory visualizations, failure case examples |

**Rules**:
- The main paper must be self-contained — reviewers are not required to read appendices
- Never put critical evidence only in the appendix
- Cross-reference: "Full results in Table 5 (Appendix B)" not just "see appendix"
- Use `\appendix` command, then `\section{A: Proofs}` etc.

### Page Budget Management

When over the page limit:

| Cut Strategy | Saves | Risk |
|-------------|-------|------|
| Move proofs to appendix | 0.5-2 pages | Low — standard practice |
| Condense related work | 0.5-1 page | Medium — may miss key citations |
| Combine tables with subfigures | 0.25-0.5 page | Low — often improves readability |
| Use `\vspace{-Xpt}` sparingly | 0.1-0.3 page | Low if subtle, high if obvious |
| Remove qualitative examples | 0.5-1 page | Medium — reviewers like examples |
| Reduce figure sizes | 0.25-0.5 page | High — figures must remain readable |

**Do NOT**: reduce font size, change margins, remove required sections (limitations, broader impact), or use `\small`/`\footnotesize` for main text.

### Step 5.10: Ethics & Broader Impact Statement

Most venues now require or strongly encourage an ethics/broader impact statement. This is not boilerplate — reviewers read it and can flag ethics concerns that trigger desk rejection.

**What to include:**

| Component | Content | Required By |
|-----------|---------|-------------|
| **Positive societal impact** | How your work benefits society | NeurIPS, ICML |
| **Potential negative impact** | Misuse risks, dual-use concerns, failure modes | NeurIPS, ICML |
| **Fairness & bias** | Does your method/data have known biases? | All venues (implicitly) |
| **Environmental impact** | Compute carbon footprint for large-scale training | ICML, increasingly NeurIPS |
| **Privacy** | Does your work use or enable processing of personal data? | ACL, NeurIPS |
| **LLM disclosure** | Was AI used in writing or experiments? | ICLR (mandatory), ACL |

**Writing the statement:**

```latex
\section*{Broader Impact Statement}
% NeurIPS/ICML: after conclusion, does not count toward page limit

% 1. Positive applications (1-2 sentences)
This work enables [specific application] which may benefit [specific group].

% 2. Risks and mitigations (1-3 sentences, be specific)
[Method/model] could potentially be misused for [specific risk]. We mitigate
this by [specific mitigation, e.g., releasing only model weights above size X,
including safety filters, documenting failure modes].

% 3. Limitations of impact claims (1 sentence)
Our evaluation is limited to [specific domain]; broader deployment would
require [specific additional work].
```

**Common mistakes:**
- Writing "we foresee no negative impacts" (almost never true — reviewers distrust this)
- Being vague: "this could be misused" without specifying how
- Ignoring compute costs for large-scale work
- Forgetting to disclose LLM use at venues that require it

**Compute carbon footprint** (for training-heavy papers):
```python
# Estimate using ML CO2 Impact tool methodology
gpu_hours = 1000  # total GPU hours
gpu_tdp_watts = 400  # e.g., A100 = 400W
pue = 1.1  # Power Usage Effectiveness (data center overhead)
carbon_intensity = 0.429  # kg CO2/kWh (US average; varies by region)

energy_kwh = (gpu_hours * gpu_tdp_watts * pue) / 1000
carbon_kg = energy_kwh * carbon_intensity
print(f"Energy: {energy_kwh:.0f} kWh, Carbon: {carbon_kg:.0f} kg CO2eq")
```

### Step 5.11: Datasheets & Model Cards (If Applicable)

If your paper introduces a **new dataset** or **releases a model**, include structured documentation. Reviewers increasingly expect this, and NeurIPS Datasets & Benchmarks track requires it.

**Datasheets for Datasets** (Gebru et al., 2021) — include in appendix:

```
Dataset Documentation (Appendix):
- Motivation: Why was this dataset created? What task does it support?
- Composition: What are the instances? How many? What data types?
- Collection: How was data collected? What was the source?
- Preprocessing: What cleaning/filtering was applied?
- Distribution: How is the dataset distributed? Under what license?
- Maintenance: Who maintains it? How to report issues?
- Ethical considerations: Contains personal data? Consent obtained?
  Potential for harm? Known biases?
```

**Model Cards** (Mitchell et al., 2019) — include in appendix for model releases:

```
Model Card (Appendix):
- Model details: Architecture, training data, training procedure
- Intended use: Primary use cases, out-of-scope uses
- Metrics: Evaluation metrics and results on benchmarks
- Ethical considerations: Known biases, fairness evaluations
- Limitations: Known failure modes, domains where model underperforms
```

### Writing Style

**Sentence-level clarity (Gopen & Swan's 7 Principles):**

| Principle | Rule |
|-----------|------|
| Subject-verb proximity | Keep subject and verb close |
| Stress position | Place emphasis at sentence ends |
| Topic position | Put context first, new info after |
| Old before new | Familiar info → unfamiliar info |
| One unit, one function | Each paragraph makes one point |
| Action in verb | Use verbs, not nominalizations |
| Context before new | Set stage before presenting |

**Word choice (Lipton, Steinhardt):**
- Be specific: "accuracy" not "performance"
- Eliminate hedging: drop "may" unless genuinely uncertain
- Consistent terminology throughout
- Avoid incremental vocabulary: "develop", not "combine"

**Full writing guide with examples**: See [references/writing-guide.md](references/writing-guide.md)

### Using LaTeX Templates

**Always copy the entire template directory first, then write within it.**

```
Template Setup Checklist:
- [ ] Step 1: Copy entire template directory to new project
- [ ] Step 2: Verify template compiles as-is (before any changes)
- [ ] Step 3: Read the template's example content to understand structure
- [ ] Step 4: Replace example content section by section
- [ ] Step 5: Use template macros (check preamble for \newcommand definitions)
- [ ] Step 6: Clean up template artifacts only at the end
```

**Step 1: Copy the Full Template**

```bash
cp -r templates/neurips2025/ ~/papers/my-paper/
cd ~/papers/my-paper/
ls -la  # Should see: main.tex, neurips.sty, Makefile, etc.
```

Copy the ENTIRE directory, not just the .tex file. Templates include style files (.sty), bibliography styles (.bst), example content, and Makefiles.

**Step 2: Verify Template Compiles First**

Before making ANY changes:
```bash
latexmk -pdf main.tex
# Or manual: pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
```

If the unmodified template doesn't compile, fix that first (usually missing TeX packages — install via `tlmgr install <package>`).

**Step 3: Keep Template Content as Reference**

Don't immediately delete example content. Comment it out and use as formatting reference:
```latex
% Template example (keep for reference):
% \begin{figure}[t]
%   \centering
%   \includegraphics[width=0.8\linewidth]{example-image}
%   \caption{Template shows caption style}
% \end{figure}

% Your actual figure:
\begin{figure}[t]
  \centering
  \includegraphics[width=0.8\linewidth]{your-figure.pdf}
  \caption{Your caption following the same style.}
\end{figure}
```

**Step 4: Replace Content Section by Section**

Work through systematically: title/authors → abstract → introduction → methods → experiments → related work → conclusion → references → appendix. Compile after each section.

**Step 5: Use Template Macros**

```latex
\newcommand{\method}{YourMethodName}  % Consistent method naming
\newcommand{\eg}{e.g.,\xspace}        % Proper abbreviations
\newcommand{\ie}{i.e.,\xspace}
```

### Template Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Copying only `.tex` file | Missing `.sty`, won't compile | Copy entire directory |
| Modifying `.sty` files | Breaks conference formatting | Never edit style files |
| Adding random packages | Conflicts, breaks template | Only add if necessary |
| Deleting template content early | Lose formatting reference | Keep as comments until done |
| Not compiling frequently | Errors accumulate | Compile after each section |
| Raster PNGs for figures | Blurry in paper | Always use vector PDF via `savefig('fig.pdf')` |

### Quick Template Reference

| Conference | Main File | Style File | Page Limit |
|------------|-----------|------------|------------|
| NeurIPS 2025 | `main.tex` | `neurips.sty` | 9 pages |
| ICML 2026 | `example_paper.tex` | `icml2026.sty` | 8 pages |
| ICLR 2026 | `iclr2026_conference.tex` | `iclr2026_conference.sty` | 9 pages |
| ACL 2025 | `acl_latex.tex` | `acl.sty` | 8 pages (long) |
| AAAI 2026 | `aaai2026-unified-template.tex` | `aaai2026.sty` | 7 pages |
| COLM 2025 | `colm2025_conference.tex` | `colm2025_conference.sty` | 9 pages |

**Universal**: Double-blind, references don't count, appendices unlimited, LaTeX required.

Templates in `templates/` directory. See [templates/README.md](templates/README.md) for compilation setup (VS Code, CLI, Overleaf, other IDEs).

### Tables and Figures

**Tables** — use `booktabs` for professional formatting:

```latex
\usepackage{booktabs}
\begin{tabular}{lcc}
\toprule
Method & Accuracy $\uparrow$ & Latency $\downarrow$ \\
\midrule
Baseline & 85.2 & 45ms \\
\textbf{Ours} & \textbf{92.1} & 38ms \\
\bottomrule
\end{tabular}
```

Rules:
- Bold best value per metric
- Include direction symbols ($\uparrow$ higher better, $\downarrow$ lower better)
- Right-align numerical columns
- Consistent decimal precision

**Figures**:
- **Vector graphics** (PDF, EPS) for all plots and diagrams — `plt.savefig('fig.pdf')`
- **Raster** (PNG 600 DPI) only for photographs
- **Colorblind-safe palettes** (Okabe-Ito or Paul Tol)
- Verify **grayscale readability** (8% of men have color vision deficiency)
- **No title inside figure** — the caption serves this function
- **Self-contained captions** — reader should understand without main text

### Conference Resubmission

For converting between venues, see Phase 7 (Submission Preparation) — it covers the full conversion workflow, page-change table, and post-rejection guidance.

### Professional LaTeX Preamble

Add these packages to any paper for professional quality. They are compatible with all major conference style files:

```latex
% --- Professional Packages (add after conference style file) ---

% Typography
\usepackage{microtype}              % Microtypographic improvements (protrusion, expansion)
                                     % Makes text noticeably more polished — always include

% Tables
\usepackage{booktabs}               % Professional table rules (\toprule, \midrule, \bottomrule)
\usepackage{siunitx}                % Consistent number formatting, decimal alignment
                                     % Usage: \num{12345} → 12,345; \SI{3.5}{GHz} → 3.5 GHz
                                     % Table alignment: S column type for decimal-aligned numbers

% Figures
\usepackage{graphicx}               % Include graphics (\includegraphics)
\usepackage{subcaption}             % Subfigures with (a), (b), (c) labels
                                     % Usage: \begin{subfigure}{0.48\textwidth} ... \end{subfigure}

% Diagrams and Algorithms
\usepackage{tikz}                   % Programmable vector diagrams
\usetikzlibrary{arrows.meta, positioning, shapes.geometric, calc, fit, backgrounds}
\usepackage[ruled,vlined]{algorithm2e}  % Professional pseudocode
                                     % Alternative: \usepackage{algorithmicx} if template bundles it

% Cross-references
\usepackage{cleveref}               % Smart references: \cref{fig:x} → "Figure 1"
                                     % MUST be loaded AFTER hyperref
                                     % Handles: figures, tables, sections, equations, algorithms

% Math (usually included by conference .sty, but verify)
\usepackage{amsmath,amssymb}        % AMS math environments and symbols
\usepackage{mathtools}              % Extends amsmath (dcases, coloneqq, etc.)

% Colors (for figures and diagrams)
\usepackage{xcolor}                 % Color management
% Okabe-Ito colorblind-safe palette:
\definecolor{okblue}{HTML}{0072B2}
\definecolor{okorange}{HTML}{E69F00}
\definecolor{okgreen}{HTML}{009E73}
\definecolor{okred}{HTML}{D55E00}
\definecolor{okpurple}{HTML}{CC79A7}
\definecolor{okcyan}{HTML}{56B4E9}
\definecolor{okyellow}{HTML}{F0E442}
```

**Notes:**
- `microtype` is the single highest-impact package for visual quality. It adjusts character spacing at a sub-pixel level. Always include it.
- `siunitx` handles decimal alignment in tables via the `S` column type — eliminates manual spacing.
- `cleveref` must be loaded **after** `hyperref`. Most conference .sty files load hyperref, so put cleveref last.
- Check if the conference template already loads any of these (especially `algorithm`, `amsmath`, `graphicx`). Don't double-load.

### siunitx Table Alignment

`siunitx` makes number-heavy tables significantly more readable:

```latex
\begin{tabular}{l S[table-format=2.1] S[table-format=2.1] S[table-format=2.1]}
\toprule
Method & {Accuracy $\uparrow$} & {F1 $\uparrow$} & {Latency (ms) $\downarrow$} \\
\midrule
Baseline         & 85.2  & 83.7  & 45.3 \\
Ablation (no X)  & 87.1  & 85.4  & 42.1 \\
\textbf{Ours}    & \textbf{92.1} & \textbf{90.8} & \textbf{38.7} \\
\bottomrule
\end{tabular}
```

The `S` column type auto-aligns on the decimal point. Headers in `{}` escape the alignment.

### Subfigures

Standard pattern for side-by-side figures:

```latex
\begin{figure}[t]
  \centering
  \begin{subfigure}[b]{0.48\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_results_a.pdf}
    \caption{Results on Dataset A.}
    \label{fig:results-a}
  \end{subfigure}
  \hfill
  \begin{subfigure}[b]{0.48\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_results_b.pdf}
    \caption{Results on Dataset B.}
    \label{fig:results-b}
  \end{subfigure}
  \caption{Comparison of our method across two datasets. (a) shows the scaling
  behavior and (b) shows the ablation results. Both use 5 random seeds.}
  \label{fig:results}
\end{figure}
```

Use `\cref{fig:results}` → "Figure 1", `\cref{fig:results-a}` → "Figure 1a".

### Pseudocode with algorithm2e

```latex
\begin{algorithm}[t]
\caption{Iterative Refinement with Judge Panel}
\label{alg:method}
\KwIn{Task $T$, model $M$, judges $J_1 \ldots J_n$, convergence threshold $k$}
\KwOut{Final output $A^*$}
$A \gets M(T)$ \tcp*{Initial generation}
$\text{streak} \gets 0$\;
\While{$\text{streak} < k$}{
  $C \gets \text{Critic}(A, T)$ \tcp*{Identify weaknesses}
  $B \gets M(T, C)$ \tcp*{Revised version addressing critique}
  $AB \gets \text{Synthesize}(A, B)$ \tcp*{Merge best elements}
  \ForEach{judge $J_i$}{
    $\text{rank}_i \gets J_i(\text{shuffle}(A, B, AB))$ \tcp*{Blind ranking}
  }
  $\text{winner} \gets \text{BordaCount}(\text{ranks})$\;
  \eIf{$\text{winner} = A$}{
    $\text{streak} \gets \text{streak} + 1$\;
  }{
    $A \gets \text{winner}$; $\text{streak} \gets 0$\;
  }
}
\Return{$A$}\;
\end{algorithm}
```

### TikZ Diagram Patterns

TikZ is the standard for method diagrams in ML papers. Common patterns:

**Pipeline/Flow Diagram** (most common in ML papers):

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}[
  node distance=1.8cm,
  box/.style={rectangle, draw, rounded corners, minimum height=1cm, 
              minimum width=2cm, align=center, font=\small},
  arrow/.style={-{Stealth[length=3mm]}, thick},
]
  \node[box, fill=okcyan!20] (input) {Input\\$x$};
  \node[box, fill=okblue!20, right of=input] (encoder) {Encoder\\$f_\theta$};
  \node[box, fill=okgreen!20, right of=encoder] (latent) {Latent\\$z$};
  \node[box, fill=okorange!20, right of=latent] (decoder) {Decoder\\$g_\phi$};
  \node[box, fill=okred!20, right of=decoder] (output) {Output\\$\hat{x}$};
  
  \draw[arrow] (input) -- (encoder);
  \draw[arrow] (encoder) -- (latent);
  \draw[arrow] (latent) -- (decoder);
  \draw[arrow] (decoder) -- (output);
\end{tikzpicture}
\caption{Architecture overview. The encoder maps input $x$ to latent 
representation $z$, which the decoder reconstructs.}
\label{fig:architecture}
\end{figure}
```

**Comparison/Matrix Diagram** (for showing method variants):

```latex
\begin{tikzpicture}[
  cell/.style={rectangle, draw, minimum width=2.5cm, minimum height=1cm, 
               align=center, font=\small},
  header/.style={cell, fill=gray!20, font=\small\bfseries},
]
  % Headers
  \node[header] at (0, 0) {Method};
  \node[header] at (3, 0) {Converges?};
  \node[header] at (6, 0) {Quality?};
  % Rows
  \node[cell] at (0, -1) {Single Pass};
  \node[cell, fill=okgreen!15] at (3, -1) {N/A};
  \node[cell, fill=okorange!15] at (6, -1) {Baseline};
  \node[cell] at (0, -2) {Critique+Revise};
  \node[cell, fill=okred!15] at (3, -2) {No};
  \node[cell, fill=okred!15] at (6, -2) {Degrades};
  \node[cell] at (0, -3) {Ours};
  \node[cell, fill=okgreen!15] at (3, -3) {Yes ($k$=2)};
  \node[cell, fill=okgreen!15] at (6, -3) {Improves};
\end{tikzpicture}
```

**Iterative Loop Diagram** (for methods with feedback):

```latex
\begin{tikzpicture}[
  node distance=2cm,
  box/.style={rectangle, draw, rounded corners, minimum height=0.8cm, 
              minimum width=1.8cm, align=center, font=\small},
  arrow/.style={-{Stealth[length=3mm]}, thick},
  label/.style={font=\scriptsize, midway, above},
]
  \node[box, fill=okblue!20] (gen) {Generator};
  \node[box, fill=okred!20, right=2.5cm of gen] (critic) {Critic};
  \node[box, fill=okgreen!20, below=1.5cm of $(gen)!0.5!(critic)$] (judge) {Judge Panel};
  
  \draw[arrow] (gen) -- node[label] {output $A$} (critic);
  \draw[arrow] (critic) -- node[label, right] {critique $C$} (judge);
  \draw[arrow] (judge) -| node[label, left, pos=0.3] {winner} (gen);
\end{tikzpicture}
```

### latexdiff for Revision Tracking

Essential for rebuttals — generates a marked-up PDF showing changes between versions:

```bash
# Install
# macOS: brew install latexdiff (or comes with TeX Live)
# Linux: sudo apt install latexdiff

# Generate diff
latexdiff paper_v1.tex paper_v2.tex > paper_diff.tex
pdflatex paper_diff.tex

# For multi-file projects (with \input{} or \include{})
latexdiff --flatten paper_v1.tex paper_v2.tex > paper_diff.tex
```

This produces a PDF with deletions in red strikethrough and additions in blue — standard format for rebuttal supplements.

### SciencePlots for matplotlib

Install and use for publication-quality plots:

```bash
pip install SciencePlots
```

```python
import matplotlib.pyplot as plt
import scienceplots  # registers styles

# Use science style (IEEE-like, clean)
with plt.style.context(['science', 'no-latex']):
    fig, ax = plt.subplots(figsize=(3.5, 2.5))  # Single-column width
    ax.plot(x, y, label='Ours', color='#0072B2')
    ax.plot(x, y2, label='Baseline', color='#D55E00', linestyle='--')
    ax.set_xlabel('Training Steps')
    ax.set_ylabel('Accuracy')
    ax.legend()
    fig.savefig('paper/fig_results.pdf', bbox_inches='tight')

# Available styles: 'science', 'ieee', 'nature', 'science+ieee'
# Add 'no-latex' if LaTeX is not installed on the machine generating plots
```

**Standard figure sizes** (two-column format):
- Single column: `figsize=(3.5, 2.5)` — fits in one column
- Double column: `figsize=(7.0, 3.0)` — spans both columns
- Square: `figsize=(3.5, 3.5)` — for heatmaps, confusion matrices

---

## Phase 6: Self-Review & Revision

**Goal**: Simulate the review process before submission. Catch weaknesses early.

### Step 6.1: Simulate Reviews (Ensemble Pattern)

Generate reviews from multiple perspectives. The key insight from automated research pipelines (notably SakanaAI's AI-Scientist): **ensemble reviewing with a meta-reviewer produces far more calibrated feedback than a single review pass.**

**Step 1: Generate N independent reviews** (N=3-5)

Use different models or temperature settings. Each reviewer sees only the paper, not other reviews. **Default to negative bias** — LLMs have well-documented positivity bias in evaluation.

```
You are an expert reviewer for [VENUE]. You are critical and thorough.
If a paper has weaknesses or you are unsure about a claim, flag it clearly
and reflect that in your scores. Do not give the benefit of the doubt.

Review this paper according to the official reviewer guidelines. Evaluate:

1. Soundness (are claims well-supported? are baselines fair and strong?)
2. Clarity (is the paper well-written? could an expert reproduce it?)
3. Significance (does this matter to the community?)
4. Originality (new insights, not just incremental combination?)

Provide your review as structured JSON:
{
  "summary": "2-3 sentence summary",
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1 (most critical)", "weakness 2", ...],
  "questions": ["question for authors 1", ...],
  "missing_references": ["paper that should be cited", ...],
  "soundness": 1-4,
  "presentation": 1-4,
  "contribution": 1-4,
  "overall": 1-10,
  "confidence": 1-5
}
```

**Step 2: Meta-review (Area Chair aggregation)**

Feed all N reviews to a meta-reviewer:

```
You are an Area Chair at [VENUE]. You have received [N] independent reviews
of a paper. Your job is to:

1. Identify consensus strengths and weaknesses across reviewers
2. Resolve disagreements by examining the paper directly
3. Produce a meta-review that represents the aggregate judgment
4. Use AVERAGED numerical scores across all reviews

Be conservative: if reviewers disagree on whether a weakness is serious,
treat it as serious until the authors address it.

Reviews:
[review_1]
[review_2]
...
```

**Step 3: Reflection loop** (optional, 2-3 rounds)

Each reviewer can refine their review after seeing the meta-review. Use an early termination sentinel: if the reviewer responds "I am done" (no changes), stop iterating.

**Model selection for reviewing**: Reviewing is best done with the strongest available model, even if you wrote the paper with a cheaper one. The reviewer model should be chosen independently from the writing model.

**Few-shot calibration**: If available, include 1-2 real published reviews from the target venue as examples. This dramatically improves score calibration. See [references/reviewer-guidelines.md](references/reviewer-guidelines.md) for example reviews.

### Step 6.1b: Visual Review Pass (VLM)

Text-only review misses an entire class of problems: figure quality, layout issues, visual consistency. If you have access to a vision-capable model, run a separate **visual review** on the compiled PDF:

```
You are reviewing the visual presentation of this research paper PDF.
Check for:
1. Figure quality: Are plots readable? Labels legible? Colors distinguishable?
2. Figure-caption alignment: Does each caption accurately describe its figure?
3. Layout issues: Orphaned section headers, awkward page breaks, figures far from their references
4. Table formatting: Aligned columns, consistent decimal precision, bold for best results
5. Visual consistency: Same color scheme across all figures, consistent font sizes
6. Grayscale readability: Would the figures be understandable if printed in B&W?

For each issue, specify the page number and exact location.
```

This catches problems that text-based review cannot: a plot with illegible axis labels, a figure placed 3 pages from its first reference, inconsistent color palettes between Figure 2 and Figure 5, or a table that's clearly wider than the column width.

### Step 6.1c: Claim Verification Pass

After simulated reviews, run a separate verification pass. This catches factual errors that reviewers might miss:

```
Claim Verification Protocol:
1. Extract every factual claim from the paper (numbers, comparisons, trends)
2. For each claim, trace it to the specific experiment/result that supports it
3. Verify the number in the paper matches the actual result file
4. Flag any claim without a traceable source as [VERIFY]
```

For agent-based workflows: delegate verification to a **fresh sub-agent** that receives only the paper text and the raw result files. The fresh context prevents confirmation bias — the verifier doesn't "remember" what the results were supposed to be.

### Step 6.2: Prioritize Feedback

After collecting reviews, categorize:

| Priority | Action |
|----------|--------|
| **Critical** (technical flaw, missing baseline) | Must fix. May require new experiments → back to Phase 2 |
| **High** (clarity issue, missing ablation) | Should fix in this revision |
| **Medium** (minor writing issues, extra experiments) | Fix if time allows |
| **Low** (style preferences, tangential suggestions) | Note for future work |

### Step 6.3: Revision Cycle

For each critical/high issue:
1. Identify the specific section(s) affected
2. Draft the fix
3. Verify the fix doesn't break other claims
4. Update the paper
5. Re-check against the reviewer's concern

### Step 6.4: Rebuttal Writing

When responding to actual reviews (post-submission), rebuttals are a distinct skill from revision:

**Format**: Point-by-point. For each reviewer concern:
```
> R1-W1: "The paper lacks comparison with Method X."

We thank the reviewer for this suggestion. We have added a comparison with 
Method X in Table 3 (revised). Our method outperforms X by 3.2pp on [metric] 
(p<0.05). We note that X requires 2x our compute budget.
```

**Rules**:
- Address every concern — reviewers notice if you skip one
- Lead with the strongest responses
- Be concise and direct — reviewers read dozens of rebuttals
- Include new results if you ran experiments during the rebuttal period
- Never be defensive or dismissive, even of weak criticisms
- Use `latexdiff` to generate a marked-up PDF showing changes (see Professional LaTeX Tooling section)
- Thank reviewers for specific, actionable feedback (not generic praise)

**What NOT to do**: "We respectfully disagree" without evidence. "This is out of scope" without explanation. Ignoring a weakness by only responding to strengths.

### Step 6.5: Paper Evolution Tracking

Save snapshots at key milestones:
```
paper/
  paper.tex                    # Current working version
  paper_v1_first_draft.tex     # First complete draft
  paper_v2_post_review.tex     # After simulated review
  paper_v3_pre_submission.tex  # Final before submission
  paper_v4_camera_ready.tex    # Post-acceptance final
```

---

## Phase 7: Submission Preparation

**Goal**: Final checks, formatting, and submission.

### Step 7.1: Conference Checklist

Every venue has mandatory checklists. Complete them carefully — incomplete checklists can result in desk rejection.

See [references/checklists.md](references/checklists.md) for:
- NeurIPS 16-item paper checklist
- ICML broader impact + reproducibility
- ICLR LLM disclosure policy
- ACL mandatory limitations section
- Universal pre-submission checklist

### Step 7.2: Anonymization Checklist

Double-blind review means reviewers cannot know who wrote the paper. Check ALL of these:

```
Anonymization Checklist:
- [ ] No author names or affiliations anywhere in the PDF
- [ ] No acknowledgments section (add after acceptance)
- [ ] Self-citations written in third person: "Smith et al. [1] showed..." not "We previously showed [1]..."
- [ ] No GitHub/GitLab URLs pointing to your personal repos
- [ ] Use Anonymous GitHub (https://anonymous.4open.science/) for code links
- [ ] No institutional logos or identifiers in figures
- [ ] No file metadata containing author names (check PDF properties)
- [ ] No "our previous work" or "in our earlier paper" phrasing
- [ ] Dataset names don't reveal institution (rename if needed)
- [ ] Supplementary materials don't contain identifying information
```

**Common mistakes**: Git commit messages visible in supplementary code, watermarked figures from institutional tools, acknowledgments left in from a previous draft, arXiv preprint posted before anonymity period.

### Step 7.3: Formatting Verification

```
Pre-Submission Format Check:
- [ ] Page limit respected (excluding references and appendix)
- [ ] All figures are vector (PDF) or high-res raster (600 DPI PNG)
- [ ] All figures readable in grayscale
- [ ] All tables use booktabs
- [ ] References compile correctly (no "?" in citations)
- [ ] No overfull hboxes in critical areas
- [ ] Appendix clearly labeled and separated
- [ ] Required sections present (limitations, broader impact, etc.)
```

### Step 7.4: Pre-Compilation Validation

Run these automated checks **before** attempting `pdflatex`. Catching errors here is faster than debugging compiler output.

```bash
# 1. Lint with chktex (catches common LaTeX mistakes)
# Suppress noisy warnings: -n2 (sentence end), -n24 (parens), -n13 (intersentence), -n1 (command terminated)
chktex main.tex -q -n2 -n24 -n13 -n1

# 2. Verify all citations exist in .bib
# Extract \cite{...} from .tex, check each against .bib
python3 -c "
import re
tex = open('main.tex').read()
bib = open('references.bib').read()
cites = set(re.findall(r'\\\\cite[tp]?{([^}]+)}', tex))
for cite_group in cites:
    for cite in cite_group.split(','):
        cite = cite.strip()
        if cite and cite not in bib:
            print(f'WARNING: \\\\cite{{{cite}}} not found in references.bib')
"

# 3. Verify all referenced figures exist on disk
python3 -c "
import re, os
tex = open('main.tex').read()
figs = re.findall(r'\\\\includegraphics(?:\[.*?\])?{([^}]+)}', tex)
for fig in figs:
    if not os.path.exists(fig):
        print(f'WARNING: Figure file not found: {fig}')
"

# 4. Check for duplicate \label definitions
python3 -c "
import re
from collections import Counter
tex = open('main.tex').read()
labels = re.findall(r'\\\\label{([^}]+)}', tex)
dupes = {k: v for k, v in Counter(labels).items() if v > 1}
for label, count in dupes.items():
    print(f'WARNING: Duplicate label: {label} (appears {count} times)')
"
```

Fix any warnings before proceeding. For agent-based workflows: feed chktex output back to the agent with instructions to make minimal fixes.

### Step 7.5: Final Compilation

```bash
# Clean build
rm -f *.aux *.bbl *.blg *.log *.out *.pdf
latexmk -pdf main.tex

# Or manual (triple pdflatex + bibtex for cross-references)
pdflatex -interaction=nonstopmode main.tex
bibtex main
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex

# Verify output exists and has content
ls -la main.pdf
```

**If compilation fails**: Parse the `.log` file for the first error. Common fixes:
- "Undefined control sequence" → missing package or typo in command name
- "Missing $ inserted" → math symbol outside math mode
- "File not found" → wrong figure path or missing .sty file
- "Citation undefined" → .bib entry missing or bibtex not run

### Step 7.6: Conference-Specific Requirements

| Venue | Special Requirements |
|-------|---------------------|
| **NeurIPS** | Paper checklist in appendix, lay summary if accepted |
| **ICML** | Broader Impact Statement (after conclusion, doesn't count toward limit) |
| **ICLR** | LLM disclosure required, reciprocal reviewing agreement |
| **ACL** | Mandatory Limitations section, Responsible NLP checklist |
| **AAAI** | Strict style file — no modifications whatsoever |
| **COLM** | Frame contribution for language model community |

### Step 7.7: Conference Resubmission & Format Conversion

When converting between venues, **never copy LaTeX preambles between templates**:

```bash
# 1. Start fresh with target template
cp -r templates/icml2026/ new_submission/

# 2. Copy ONLY content sections (not preamble)
#    - Abstract text, section content, figures, tables, bib entries

# 3. Adjust for page limits
# 4. Add venue-specific required sections
# 5. Update references
```

| From → To | Page Change | Key Adjustments |
|-----------|-------------|-----------------|
| NeurIPS → ICML | 9 → 8 | Cut 1 page, add Broader Impact |
| ICML → ICLR | 8 → 9 | Expand experiments, add LLM disclosure |
| NeurIPS → ACL | 9 → 8 | Restructure for NLP conventions, add Limitations |
| ICLR → AAAI | 9 → 7 | Significant cuts, strict style adherence |
| Any → COLM | varies → 9 | Reframe for language model focus |

When cutting pages: move proofs to appendix, condense related work, combine tables, use subfigures.
When expanding: add ablations, expand limitations, include additional baselines, add qualitative examples.

**After rejection**: Address reviewer concerns in the new version, but don't include a "changes" section or reference the previous submission (blind review).

### Step 7.8: Camera-Ready Preparation (Post-Acceptance)

After acceptance, prepare the camera-ready version:

```
Camera-Ready Checklist:
- [ ] De-anonymize: add author names, affiliations, email addresses
- [ ] Add Acknowledgments section (funding, compute grants, helpful reviewers)
- [ ] Add public code/data URL (real GitHub, not anonymous)
- [ ] Address any mandatory revisions from meta-reviewer
- [ ] Switch template to camera-ready mode (if applicable — e.g., AAAI \anon → \camera)
- [ ] Add copyright notice if required by venue
- [ ] Update any "anonymous" placeholders in text
- [ ] Verify final PDF compiles cleanly
- [ ] Check page limit for camera-ready (sometimes differs from submission)
- [ ] Upload supplementary materials (code, data, appendix) to venue portal
```

### Step 7.9: arXiv & Preprint Strategy

Posting to arXiv is standard practice in ML but has important timing and anonymity considerations.

**Timing decision tree:**

| Situation | Recommendation |
|-----------|---------------|
| Submitting to double-blind venue (NeurIPS, ICML, ACL) | Post to arXiv **after** submission deadline, not before. Posting before can technically violate anonymity policies, though enforcement varies. |
| Submitting to ICLR | ICLR explicitly allows arXiv posting before submission. But don't put author names in the submission itself. |
| Paper already on arXiv, submitting to new venue | Acceptable at most venues. Do NOT update arXiv version during review with changes that reference reviews. |
| Workshop paper | arXiv is fine at any time — workshops are typically not double-blind. |
| Want to establish priority | Post immediately if scooping is a concern — but accept the anonymity tradeoff. |

**arXiv category selection** (ML/AI papers):

| Category | Code | Best For |
|----------|------|----------|
| Machine Learning | `cs.LG` | General ML methods |
| Computation and Language | `cs.CL` | NLP, language models |
| Artificial Intelligence | `cs.AI` | Reasoning, planning, agents |
| Computer Vision | `cs.CV` | Vision models |
| Information Retrieval | `cs.IR` | Search, recommendation |

**List primary + 1-2 cross-listed categories.** More categories = more visibility, but only cross-list where genuinely relevant.

**Versioning strategy:**
- **v1**: Initial submission (matches conference submission)
- **v2**: Post-acceptance with camera-ready corrections (add "accepted at [Venue]" to abstract)
- Don't post v2 during the review period with changes that clearly respond to reviewer feedback

```bash
# Check if your paper's title is already taken on arXiv
# (before choosing a title)
pip install arxiv
python -c "
import arxiv
results = list(arxiv.Search(query='ti:\"Your Exact Title\"', max_results=5).results())
print(f'Found {len(results)} matches')
for r in results: print(f'  {r.title} ({r.published.year})')
"
```

### Step 7.10: Research Code Packaging

Releasing clean, runnable code significantly increases citations and reviewer trust. Package code alongside the camera-ready submission.

**Repository structure:**

```
your-method/
  README.md              # Setup, usage, reproduction instructions
  requirements.txt       # Or environment.yml for conda
  setup.py               # For pip-installable packages
  LICENSE                # MIT or Apache 2.0 recommended for research
  configs/               # Experiment configurations
  src/                   # Core method implementation
  scripts/               # Training, evaluation, analysis scripts
    train.py
    evaluate.py
    reproduce_table1.sh  # One script per main result
  data/                  # Small data or download scripts
    download_data.sh
  results/               # Expected outputs for verification
```

**README template for research code:**

```markdown
# [Paper Title]

Official implementation of "[Paper Title]" (Venue Year).

## Setup
[Exact commands to set up environment]

## Reproduction
To reproduce Table 1: `bash scripts/reproduce_table1.sh`
To reproduce Figure 2: `python scripts/make_figure2.py`

## Citation
[BibTeX entry]
```

**Pre-release checklist:**
```
- [ ] Code runs from a clean clone (test on fresh machine or Docker)
- [ ] All dependencies pinned to specific versions
- [ ] No hardcoded absolute paths
- [ ] No API keys, credentials, or personal data in repo
- [ ] README covers setup, reproduction, and citation
- [ ] LICENSE file present (MIT or Apache 2.0 for max reuse)
- [ ] Results are reproducible within expected variance
- [ ] .gitignore excludes data files, checkpoints, logs
```

**Anonymous code for submission** (before acceptance):
```bash
# Use Anonymous GitHub for double-blind review
# https://anonymous.4open.science/
# Upload your repo → get an anonymous URL → put in paper
```

---

## Phase 8: Post-Acceptance Deliverables

**Goal**: Maximize the impact of your accepted paper through presentation materials and community engagement.

### Step 8.1: Conference Poster

Most conferences require a poster session. Poster design principles:

| Element | Guideline |
|---------|-----------|
| **Size** | Check venue requirements (typically 24"x36" or A0 portrait/landscape) |
| **Content** | Title, authors, 1-sentence contribution, method figure, 2-3 key results, conclusion |
| **Flow** | Top-left to bottom-right (Z-pattern) or columnar |
| **Text** | Title readable at 3m, body at 1m. No full paragraphs — bullet points only. |
| **Figures** | Reuse paper figures at higher resolution. Enlarge key result. |

**Tools**: LaTeX (`beamerposter` package), PowerPoint/Keynote, Figma, Canva.

**Production**: Order 2+ weeks before the conference. Fabric posters are lighter for travel. Many conferences now support virtual/digital posters too.

### Step 8.2: Conference Talk / Spotlight

If awarded an oral or spotlight presentation:

| Talk Type | Duration | Content |
|-----------|----------|---------|
| **Spotlight** | 5 min | Problem, approach, one key result. Rehearse to exactly 5 minutes. |
| **Oral** | 15-20 min | Full story: problem, approach, key results, ablations, limitations. |
| **Workshop talk** | 10-15 min | Adapt based on workshop audience — may need more background. |

**Slide design rules:**
- One idea per slide
- Minimize text — speak the details, don't project them
- Animate key figures to build understanding step-by-step
- Include a "takeaway" slide at the end (single sentence contribution)
- Prepare backup slides for anticipated questions

### Step 8.3: Blog Post / Social Media

An accessible summary significantly increases impact:

- **Twitter/X thread**: 5-8 tweets. Lead with the result, not the method. Include Figure 1 and key result figure.
- **Blog post**: 800-1500 words. Written for ML practitioners, not reviewers. Skip formalism, emphasize intuition and practical implications.
- **Project page**: HTML page with abstract, figures, demo, code link, BibTeX. Use GitHub Pages.

**Timing**: Post within 1-2 days of paper appearing on proceedings or arXiv camera-ready.

---

## Workshop & Short Papers

Workshop papers and short papers (e.g., ACL short papers, Findings papers) follow the same pipeline but with different constraints and expectations.

### Workshop Papers

| Property | Workshop | Main Conference |
|----------|----------|-----------------|
| **Page limit** | 4-6 pages (typically) | 7-9 pages |
| **Review standard** | Lower bar for completeness | Must be complete, thorough |
| **Review process** | Usually single-blind or light review | Double-blind, rigorous |
| **What's valued** | Interesting ideas, preliminary results, position pieces | Complete empirical story with strong baselines |
| **arXiv** | Post anytime | Timing matters (see arXiv strategy) |
| **Contribution bar** | Novel direction, interesting negative result, work-in-progress | Significant advance with strong evidence |

**When to target a workshop:**
- Early-stage idea you want feedback on before a full paper
- Negative result that doesn't justify 8+ pages
- Position piece or opinion on a timely topic
- Replication study or reproducibility report

### ACL Short Papers & Findings

ACL venues have distinct submission types:

| Type | Pages | What's Expected |
|------|-------|-----------------|
| **Long paper** | 8 | Complete study, strong baselines, ablations |
| **Short paper** | 4 | Focused contribution: one clear point with evidence |
| **Findings** | 8 | Solid work that narrowly missed main conference |

**Short paper strategy**: Pick ONE claim and support it thoroughly. Don't try to compress a long paper into 4 pages — write a different, more focused paper.

---

## Paper Types Beyond Empirical ML

The main pipeline above targets empirical ML papers. Other paper types require different structures and evidence standards. See [references/paper-types.md](references/paper-types.md) for detailed guidance on each type.

### Theory Papers

**Structure**: Introduction → Preliminaries (definitions, notation) → Main Results (theorems) → Proof Sketches → Discussion → Full Proofs (appendix)

**Key differences from empirical papers:**
- Contribution is a theorem, bound, or impossibility result — not experimental numbers
- Methods section replaced by "Preliminaries" and "Main Results"
- Proofs are the evidence, not experiments (though empirical validation of theory is welcome)
- Proof sketches in main text, full proofs in appendix is standard practice
- Experimental section is optional but strengthens the paper if it validates theoretical predictions

**Proof writing principles:**
- State theorems formally with all assumptions explicit
- Provide intuition before formal proof ("The key insight is...")
- Proof sketches should convey the main idea in 0.5-1 page
- Use `\begin{proof}...\end{proof}` environments
- Number assumptions and reference them in theorems: "Under Assumptions 1-3, ..."

### Survey / Tutorial Papers

**Structure**: Introduction → Taxonomy / Organization → Detailed Coverage → Open Problems → Conclusion

**Key differences:**
- Contribution is the organization, synthesis, and identification of open problems — not new methods
- Must be comprehensive within scope (reviewers will check for missing references)
- Requires a clear taxonomy or organizational framework
- Value comes from connections between works that individual papers don't make
- Best venues: TMLR (survey track), JMLR, Foundations and Trends in ML, ACM Computing Surveys

### Benchmark Papers

**Structure**: Introduction → Task Definition → Dataset Construction → Baseline Evaluation → Analysis → Intended Use & Limitations

**Key differences:**
- Contribution is the benchmark itself — it must fill a genuine evaluation gap
- Dataset documentation is mandatory, not optional (see Datasheets, Step 5.11)
- Must demonstrate the benchmark is challenging (baselines don't saturate it)
- Must demonstrate the benchmark measures what you claim it measures (construct validity)
- Best venues: NeurIPS Datasets & Benchmarks track, ACL (resource papers), LREC-COLING

### Position Papers

**Structure**: Introduction → Background → Thesis / Argument → Supporting Evidence → Counterarguments → Implications

**Key differences:**
- Contribution is an argument, not a result
- Must engage seriously with counterarguments
- Evidence can be empirical, theoretical, or logical analysis
- Best venues: ICML (position track), workshops, TMLR

---

## Hermes Agent Integration

This skill is designed for the Hermes agent. It uses Hermes tools, delegation, scheduling, and memory for the full research lifecycle.

### Related Skills

Compose this skill with other Hermes skills for specific phases:

| Skill | When to Use | How to Load |
|-------|-------------|-------------|
| **arxiv** | Phase 1 (Literature Review): searching arXiv, generating BibTeX, finding related papers via Semantic Scholar | `skill_view("arxiv")` |
| **subagent-driven-development** | Phase 5 (Drafting): parallel section writing with 2-stage review (spec compliance then quality) | `skill_view("subagent-driven-development")` |
| **plan** | Phase 0 (Setup): creating structured plans before execution. Writes to `.hermes/plans/` | `skill_view("plan")` |
| **qmd** | Phase 1 (Literature): searching local knowledge bases (notes, transcripts, docs) via hybrid BM25+vector search | Install: `skill_manage("install", "qmd")` |
| **diagramming** | Phase 4-5: creating Excalidraw-based figures and architecture diagrams | `skill_view("diagramming")` |
| **data-science** | Phase 4 (Analysis): Jupyter live kernel for interactive analysis and visualization | `skill_view("data-science")` |

**This skill supersedes `ml-paper-writing`** — it contains all of ml-paper-writing's content plus the full experiment/analysis pipeline and autoreason methodology.

### Hermes Tools Reference

| Tool | Usage in This Pipeline |
|------|----------------------|
| **`terminal`** | LaTeX compilation (`latexmk -pdf`), git operations, launching experiments (`nohup python run.py &`), process checks |
| **`process`** | Background experiment management: `process("start", ...)`, `process("poll", pid)`, `process("log", pid)`, `process("kill", pid)` |
| **`execute_code`** | Run Python for citation verification, statistical analysis, data aggregation. Has tool access via RPC. |
| **`read_file`** / **`write_file`** / **`patch`** | Paper editing, experiment scripts, result files. Use `patch` for targeted edits to large .tex files. |
| **`web_search`** | Literature discovery: `web_search("transformer attention mechanism 2024")` |
| **`web_extract`** | Fetch paper content, verify citations: `web_extract("https://arxiv.org/abs/2303.17651")` |
| **`delegate_task`** | **Parallel section drafting** — spawn isolated subagents for each section. Also for concurrent citation verification. |
| **`todo`** | Primary state tracker across sessions. Update after every phase transition. |
| **`memory`** | Persist key decisions across sessions: contribution framing, venue choice, reviewer feedback. |
| **`cronjob`** | Schedule experiment monitoring, deadline countdowns, automated arXiv checks. |
| **`clarify`** | Ask the user targeted questions when blocked (venue choice, contribution framing). |
| **`send_message`** | Notify user when experiments complete or drafts are ready, even if user isn't in chat. |

### Tool Usage Patterns

**Experiment monitoring** (most common):
```
terminal("ps aux | grep <pattern>")
→ terminal("tail -30 <logfile>")
→ terminal("ls results/")
→ execute_code("analyze results JSON, compute metrics")
→ terminal("git add -A && git commit -m '<descriptive message>' && git push")
→ send_message("Experiment complete: <summary>")
```

**Parallel section drafting** (using delegation):
```
delegate_task("Draft the Methods section based on these experiment scripts and configs. 
  Include: pseudocode, all hyperparameters, architectural details sufficient for 
  reproduction. Write in LaTeX using the neurips2025 template conventions.")

delegate_task("Draft the Related Work section. Use web_search and web_extract to 
  find papers. Verify every citation via Semantic Scholar. Group by methodology.")

delegate_task("Draft the Experiments section. Read all result files in results/. 
  State which claim each experiment supports. Include error bars and significance.")
```

Each delegate runs as a **fresh subagent** with no shared context — provide all necessary information in the prompt. Collect outputs and integrate.

**Citation verification** (using execute_code):
```python
# In execute_code:
from semanticscholar import SemanticScholar
import requests

sch = SemanticScholar()
results = sch.search_paper("attention mechanism transformers", limit=5)
for paper in results:
    doi = paper.externalIds.get('DOI', 'N/A')
    if doi != 'N/A':
        bibtex = requests.get(f"https://doi.org/{doi}", 
                              headers={"Accept": "application/x-bibtex"}).text
        print(bibtex)
```

### State Management with `memory` and `todo`

**`memory` tool** — persist key decisions (bounded: ~2200 chars for MEMORY.md):

```
memory("add", "Paper: autoreason. Venue: NeurIPS 2025 (9 pages). 
  Contribution: structured refinement works when generation-evaluation gap is wide.
  Key results: Haiku 42/42, Sonnet 3/5, S4.6 constrained 2/3.
  Status: Phase 5 — drafting Methods section.")
```

Update memory after major decisions or phase transitions. This persists across sessions.

**`todo` tool** — track granular progress:

```
todo("add", "Design constrained task experiments for Sonnet 4.6")
todo("add", "Run Haiku baseline comparison")
todo("add", "Draft Methods section")
todo("update", id=3, status="in_progress")
todo("update", id=1, status="completed")
```

**Session startup protocol:**
```
1. todo("list")                           # Check current task list
2. memory("read")                         # Recall key decisions
3. terminal("git log --oneline -10")      # Check recent commits
4. terminal("ps aux | grep python")       # Check running experiments
5. terminal("ls results/ | tail -20")     # Check for new results
6. Report status to user, ask for direction
```

### Cron Monitoring with `cronjob`

Use the `cronjob` tool to schedule periodic experiment checks:

```
cronjob("create", {
  "schedule": "*/30 * * * *",  # Every 30 minutes
  "prompt": "Check experiment status:
    1. ps aux | grep run_experiment
    2. tail -30 logs/experiment_haiku.log
    3. ls results/haiku_baselines/
    4. If complete: read results, compute Borda scores, 
       git add -A && git commit -m 'Add Haiku results' && git push
    5. Report: table of results, key finding, next step
    6. If nothing changed: respond with [SILENT]"
})
```

**[SILENT] protocol**: When nothing has changed since the last check, respond with exactly `[SILENT]`. This suppresses notification delivery to the user. Only report when there are genuine changes worth knowing about.

**Deadline tracking**:
```
cronjob("create", {
  "schedule": "0 9 * * *",  # Daily at 9am
  "prompt": "NeurIPS 2025 deadline: May 22. Today is {date}. 
    Days remaining: {compute}. 
    Check todo list — are we on track? 
    If <7 days: warn user about remaining tasks."
})
```

### Communication Patterns

**When to notify the user** (via `send_message` or direct response):
- Experiment batch completed (with results table)
- Unexpected finding or failure requiring decision
- Draft section ready for review
- Deadline approaching with incomplete tasks

**When NOT to notify:**
- Experiment still running, no new results → `[SILENT]`
- Routine monitoring with no changes → `[SILENT]`
- Intermediate steps that don't need attention

**Report format** — always include structured data:
```
## Experiment: <name>
Status: Complete / Running / Failed

| Task | Method A | Method B | Method C |
|------|---------|---------|---------|
| Task 1 | 85.2 | 82.1 | **89.4** |

Key finding: <one sentence>
Next step: <what happens next>
```

### Decision Points Requiring Human Input

Use `clarify` for targeted questions when genuinely blocked:

| Decision | When to Ask |
|----------|-------------|
| Target venue | Before starting paper (affects page limits, framing) |
| Contribution framing | When multiple valid framings exist |
| Experiment priority | When TODO list has more experiments than time allows |
| Submission readiness | Before final submission |

**Do NOT ask about** (be proactive, make a choice, flag it):
- Word choice, section ordering
- Which specific results to highlight
- Citation completeness (draft with what you find, note gaps)

---

## Reviewer Evaluation Criteria

Understanding what reviewers look for helps focus effort:

| Criterion | What They Check |
|-----------|----------------|
| **Quality** | Technical soundness, well-supported claims, fair baselines |
| **Clarity** | Clear writing, reproducible by experts, consistent notation |
| **Significance** | Community impact, advances understanding |
| **Originality** | New insights (doesn't require new method) |

**Scoring (NeurIPS 6-point scale):**
- 6: Strong Accept — groundbreaking, flawless
- 5: Accept — technically solid, high impact
- 4: Borderline Accept — solid, limited evaluation
- 3: Borderline Reject — weaknesses outweigh
- 2: Reject — technical flaws
- 1: Strong Reject — known results or ethics issues

See [references/reviewer-guidelines.md](references/reviewer-guidelines.md) for detailed guidelines, common concerns, and rebuttal strategies.

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Abstract too generic | Delete first sentence if it could prepend any ML paper. Start with your specific contribution. |
| Introduction exceeds 1.5 pages | Split background into Related Work. Front-load contribution bullets. |
| Experiments lack explicit claims | Add: "This experiment tests whether [specific claim]..." before each one. |
| Reviewers find paper hard to follow | Add signposting, use consistent terminology, make figure captions self-contained. |
| Missing statistical significance | Add error bars, number of runs, statistical tests, confidence intervals. |
| Scope creep in experiments | Every experiment must map to a specific claim. Cut experiments that don't. |
| Paper rejected, need to resubmit | See Conference Resubmission in Phase 7. Address reviewer concerns without referencing reviews. |
| Missing broader impact statement | See Step 5.10. Most venues require it. "No negative impacts" is almost never credible. |
| Human eval criticized as weak | See Step 2.5 and [references/human-evaluation.md](references/human-evaluation.md). Report agreement metrics, annotator details, compensation. |
| Reviewers question reproducibility | Release code (Step 7.9), document all hyperparameters, include seeds and compute details. |
| Theory paper lacks intuition | Add proof sketches with plain-language explanations before formal proofs. See [references/paper-types.md](references/paper-types.md). |
| Results are negative/null | See Phase 4.3 on handling negative results. Consider workshops, TMLR, or reframing as analysis. |

---

## Reference Documents

| Document | Contents |
|----------|----------|
| [references/writing-guide.md](references/writing-guide.md) | Gopen & Swan 7 principles, Perez micro-tips, Lipton word choice, Steinhardt precision, figure design |
| [references/citation-workflow.md](references/citation-workflow.md) | Citation APIs, Python code, CitationManager class, BibTeX management |
| [references/checklists.md](references/checklists.md) | NeurIPS 16-item, ICML, ICLR, ACL requirements, universal pre-submission checklist |
| [references/reviewer-guidelines.md](references/reviewer-guidelines.md) | Evaluation criteria, scoring, common concerns, rebuttal template |
| [references/sources.md](references/sources.md) | Complete bibliography of all writing guides, conference guidelines, APIs |
| [references/experiment-patterns.md](references/experiment-patterns.md) | Experiment design patterns, evaluation protocols, monitoring, error recovery |
| [references/autoreason-methodology.md](references/autoreason-methodology.md) | Autoreason loop, strategy selection, model guide, prompts, scope constraints, Borda scoring |
| [references/human-evaluation.md](references/human-evaluation.md) | Human evaluation design, annotation guidelines, agreement metrics, crowdsourcing QC, IRB guidance |
| [references/paper-types.md](references/paper-types.md) | Theory papers (proof writing, theorem structure), survey papers, benchmark papers, position papers |

### LaTeX Templates

Templates in `templates/` for: **NeurIPS 2025**, **ICML 2026**, **ICLR 2026**, **ACL**, **AAAI 2026**, **COLM 2025**.

See [templates/README.md](templates/README.md) for compilation instructions.

### Key External Sources

**Writing Philosophy:**
- [Neel Nanda: How to Write ML Papers](https://www.alignmentforum.org/posts/eJGptPbbFPZGLpjsp/highly-opinionated-advice-on-how-to-write-ml-papers)
- [Sebastian Farquhar: How to Write ML Papers](https://sebastianfarquhar.com/on-research/2024/11/04/how_to_write_ml_papers/)
- [Gopen & Swan: Science of Scientific Writing](https://cseweb.ucsd.edu/~swanson/papers/science-of-writing.pdf)
- [Lipton: Heuristics for Scientific Writing](https://www.approximatelycorrect.com/2018/01/29/heuristics-technical-scientific-writing-machine-learning-perspective/)
- [Perez: Easy Paper Writing Tips](https://ethanperez.net/easy-paper-writing-tips/)

**APIs:** [Semantic Scholar](https://api.semanticscholar.org/api-docs/) | [CrossRef](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) | [arXiv](https://info.arxiv.org/help/api/basics.html)

**Venues:** [NeurIPS](https://neurips.cc/Conferences/2025/PaperInformation/StyleFiles) | [ICML](https://icml.cc/Conferences/2025/AuthorInstructions) | [ICLR](https://iclr.cc/Conferences/2026/AuthorGuide) | [ACL](https://github.com/acl-org/acl-style-files)
