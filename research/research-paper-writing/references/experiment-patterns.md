# Experiment Design Patterns

Patterns and best practices distilled from running research experiments at scale with the Hermes agent. These cover experiment infrastructure, evaluation protocols, monitoring, and failure recovery.

---

## Experiment Infrastructure

### Directory Structure

Organize experiments with a consistent structure:

```
workspace/
  experiments/
    run_main.py                # Core experiment runner
    run_baselines.py           # Baseline comparison
    run_ablation.py            # Ablation studies
    strategies.py              # Method implementations
    config.yaml                # Shared configuration
  results/
    <experiment_name>/
      <task_or_problem>/
        <strategy>/
          result.json          # Final metrics
          final_output.md      # Final output artifact
          history.json         # Full trajectory/log
          pass_01/             # Per-iteration artifacts (if iterative)
            intermediate.md
  analysis/
    analyze_results.py         # Statistical analysis
    compute_stats.py           # Significance tests
    make_charts.py             # Visualization
  paper/
    paper.tex                  # LaTeX source
    fig_*.pdf                  # Generated figures
```

### Script Design Principles

**1. Incremental Saving (Crash Recovery)**

Every experiment script should save results after each unit of work, and skip already-completed work on restart:

```python
import json, os
from pathlib import Path

def run_experiment(problems, strategies, output_dir):
    for problem in problems:
        for strategy in strategies:
            result_path = Path(output_dir) / problem["id"] / strategy / "result.json"
            if result_path.exists():
                print(f"Skipping {problem['id']}/{strategy} (already done)")
                continue
            
            # Run the experiment
            result = execute_strategy(problem, strategy)
            
            # Save immediately
            result_path.parent.mkdir(parents=True, exist_ok=True)
            with open(result_path, 'w') as f:
                json.dump(result, f, indent=2)
```

This pattern makes re-runs safe and efficient. If a process crashes at problem 47/150, restarting skips the first 46.

**2. Artifact Preservation**

Save all intermediate outputs, not just final results. This enables post-hoc analysis without re-running:

```python
def save_pass_artifacts(output_dir, pass_num, artifacts):
    """Save all artifacts from a single pass of an iterative method."""
    pass_dir = Path(output_dir) / f"pass_{pass_num:02d}"
    pass_dir.mkdir(parents=True, exist_ok=True)
    
    for name, content in artifacts.items():
        with open(pass_dir / f"{name}.md", 'w') as f:
            f.write(content)
```

**3. Configuration Management**

Use YAML configs for reproducibility:

```yaml
# config.yaml
model: anthropic/claude-sonnet-4-20250514
author_temperature: 0.8
judge_temperature: 0.3
max_tokens: 4096
num_judges: 3
max_passes: 15
convergence_k: 2
```

```python
import yaml

with open("config.yaml") as f:
    config = yaml.safe_load(f)
```

**4. Separation of Concerns**

Keep generation, evaluation, and visualization in separate scripts:

| Script | Purpose |
|--------|---------|
| `run_experiment.py` | Core method execution |
| `run_baselines.py` | Baseline comparisons at same compute |
| `run_eval.py` | Blind evaluation / judge panels |
| `analyze_results.py` | Statistical analysis |
| `make_charts.py` | Figure generation |

This lets you re-run evaluation without re-running expensive generation, and regenerate figures without re-running analysis.

---

## Evaluation Protocols

### Blind Judge Panels (for Subjective Tasks)

When evaluating subjective outputs (writing, analysis, recommendations), use a blind judge panel:

```python
import random

def run_blind_evaluation(outputs: dict, task_prompt: str, num_judges: int = 7):
    """
    Run blind evaluation of multiple method outputs.
    
    Args:
        outputs: {"method_name": "output_text", ...}
        task_prompt: The original task description
        num_judges: Number of independent judge evaluations
    """
    rankings = []
    
    for judge_i in range(num_judges):
        # Randomize labels and presentation order per judge
        methods = list(outputs.keys())
        random.shuffle(methods)
        labels = {m: chr(65 + i) for i, m in enumerate(methods)}  # A, B, C...
        
        # Present to judge with randomized labels
        prompt = f"Task: {task_prompt}\n\n"
        for method in methods:
            prompt += f"--- Proposal {labels[method]} ---\n{outputs[method]}\n\n"
        prompt += "Rank all proposals from best to worst. Format: RANKING: [best], [second], [worst]"
        
        ranking = call_judge(prompt)
        rankings.append({"labels": labels, "ranking": ranking})
    
    # Aggregate via Borda count
    return compute_borda(rankings)

def compute_borda(rankings, n_methods=3):
    """Borda count: 3/2/1 points for 1st/2nd/3rd."""
    scores = {}
    points = {0: n_methods, 1: n_methods - 1, 2: n_methods - 2}  # Adjust for n_methods
    
    for r in rankings:
        for position, method in enumerate(r["ranking"]):
            scores[method] = scores.get(method, 0) + points.get(position, 0)
    
    return scores
```

Key design decisions:
- **Randomize both labels AND order** per judge to prevent position bias
- **Use odd number of judges** (3, 5, 7) to break ties
- **Conservative tiebreak**: Incumbent/baseline wins ties (prevents false positives)
- **CoT judges** match non-CoT quality at ~40% cost (1 CoT judge ≈ 3 standard judges)

### Code/Objective Evaluation

For tasks with ground-truth evaluation (code, math, factual):

```python
import subprocess

def evaluate_code(solution: str, test_cases: list, timeout: int = 30):
    """Run code solution against test cases with sandboxed execution."""
    results = {"public": [], "private": []}
    
    for test in test_cases:
        try:
            proc = subprocess.run(
                ["python3", "-c", solution],
                input=test["input"],
                capture_output=True,
                timeout=timeout,
                text=True
            )
            actual = proc.stdout.strip()
            expected = test["expected"].strip()
            passed = actual == expected
        except subprocess.TimeoutExpired:
            passed = False
        
        category = "public" if test.get("public") else "private"
        results[category].append(passed)
    
    return {
        "public_pass_rate": sum(results["public"]) / max(len(results["public"]), 1),
        "private_pass_rate": sum(results["private"]) / max(len(results["private"]), 1),
    }
```

### Compute-Matched Comparison

Always compare methods at equal compute budget. If your method uses N API calls, baselines get N calls too:

| Method | Call Budget | Allocation |
|--------|-----------|------------|
| Single pass | 6 calls | 6 independent generations |
| Critique & revise | 6 calls | 1 generate + 5 revise rounds |
| Autoreason | 6 calls | 1 generate + 1 analysis + 4 revisions |
| Best-of-N | 6 calls | 6 independent, pick best on public test |

### Human Evaluation Design

Many ML/NLP papers require human evaluation, especially for subjective tasks (text generation, summarization, dialogue, creative writing). Poorly designed human evals are a common rejection reason.

#### When Human Evaluation Is Required

| Task Type | Required? | Notes |
|-----------|-----------|-------|
| Text generation (open-ended) | Yes | LLM-as-judge alone is insufficient for acceptance at ACL/EMNLP |
| Summarization | Usually | At minimum for a subset of outputs |
| Dialogue systems | Yes | User studies or annotation |
| Code generation | No | Test suites are objective ground truth |
| Classification | No | Standard metrics suffice |
| Any task with subjective quality | Strongly recommended | Strengthens the paper significantly |

#### Annotation Protocol Design

```
Human Evaluation Protocol:
1. Define the evaluation dimensions (fluency, relevance, factual accuracy, etc.)
2. Create annotation guidelines with examples of each score level
3. Run a pilot with 2-3 annotators on 20-30 examples
4. Compute pilot inter-annotator agreement — if low, revise guidelines
5. Run full evaluation
6. Report: annotator count, agreement metrics, compensation, time per item
```

**Evaluation dimensions** (pick relevant subset):

| Dimension | Definition | Scale |
|-----------|-----------|-------|
| Fluency | Grammaticality and naturalness | 1-5 Likert |
| Relevance | Does it address the task? | 1-5 Likert |
| Factual accuracy | Are stated facts correct? | Binary or 1-5 |
| Coherence | Logical flow and consistency | 1-5 Likert |
| Informativeness | Does it provide useful information? | 1-5 Likert |
| Overall preference | Which output is better? | A/B/Tie (pairwise) |

**Pairwise comparison** (preferred over absolute scoring — more reliable):
- Present two outputs side-by-side (randomize left/right position)
- Ask: "Which is better? A / B / Tie"
- More discriminative and less susceptible to annotator calibration drift

#### Inter-Annotator Agreement

Always report agreement metrics. Without them, reviewers assume your annotations are unreliable.

```python
# Krippendorff's alpha (preferred — handles missing data, any scale)
# pip install krippendorffs-alpha
import krippendorff

# Ratings: rows = annotators, columns = items, values = scores
ratings = [
    [3, 4, 1, 2, 5, None, 3],  # Annotator 1
    [3, 5, 1, 3, 5, 2, 3],     # Annotator 2
    [4, 4, 2, 2, 4, 2, None],  # Annotator 3
]
alpha = krippendorff.alpha(reliability_data=ratings, level_of_measurement="ordinal")
print(f"Krippendorff's alpha: {alpha:.3f}")
# Interpretation: >0.80 good, 0.67-0.80 acceptable, <0.67 questionable
```

```python
# Cohen's kappa (for exactly 2 annotators, categorical data)
from sklearn.metrics import cohen_kappa_score

annotator_1 = [1, 2, 3, 1, 2, 3, 2]
annotator_2 = [1, 2, 2, 1, 3, 3, 2]
kappa = cohen_kappa_score(annotator_1, annotator_2)
print(f"Cohen's kappa: {kappa:.3f}")
# Interpretation: >0.80 excellent, 0.60-0.80 substantial, 0.40-0.60 moderate
```

| Metric | When to Use | Annotators | Scale |
|--------|------------|-----------|-------|
| Krippendorff's alpha | Default choice | Any number | Any (ordinal, nominal, ratio) |
| Cohen's kappa | 2 annotators, categorical | Exactly 2 | Nominal/ordinal |
| Fleiss' kappa | 3+ annotators, categorical | 3+ | Nominal |
| Pearson/Spearman | Continuous scores | 2 | Interval/ratio |

#### Crowdsourcing Platforms

| Platform | Best For | Cost | Quality |
|----------|----------|------|---------|
| **Prolific** | Academic research, higher quality | $8-15/hr | High — academic participant pool |
| **MTurk** | Large-scale, fast turnaround | $2-10/hr | Variable — use qualifications |
| **Surge AI** | NLP-specific annotations | Premium | High — trained annotators |
| **Expert annotators** | Domain-specific (medical, legal) | Highest | Highest — but slow |

**Ethics requirements**:
- Report compensation rate (must be at minimum local minimum wage)
- Describe annotator demographics if relevant
- Obtain IRB/ethics approval if required by your institution
- ACL venues explicitly require compensation documentation

#### What to Report in the Paper

```
Human Evaluation Section Checklist:
- [ ] Number of annotators
- [ ] Annotator qualifications / recruitment method
- [ ] Number of items evaluated
- [ ] Evaluation dimensions with definitions
- [ ] Scale used (Likert, pairwise, binary)
- [ ] Inter-annotator agreement (Krippendorff's alpha or Cohen's kappa)
- [ ] Compensation rate
- [ ] Time per annotation item
- [ ] Whether annotators saw model identities (should be blind)
- [ ] Randomization of presentation order
```

---

## Statistical Analysis

### Required Tests

| Test | When to Use | Python |
|------|------------|--------|
| McNemar's test | Comparing two methods on same problems | `scipy.stats.binomtest` for small n |
| Two-proportion z-test | Comparing success rates | Custom or `statsmodels` |
| Fisher's exact test | Small sample pairwise comparison | `scipy.stats.fisher_exact` |
| Bootstrapped CI | Confidence intervals for any metric | Custom bootstrap |
| Cohen's h | Effect size for proportions | Manual calculation |

### Standard Analysis Script

```python
import numpy as np
from scipy import stats
from pathlib import Path
import json

def load_all_results(results_dir):
    """Load all results into a structured format."""
    results = {}
    for result_file in Path(results_dir).rglob("result.json"):
        parts = result_file.relative_to(results_dir).parts
        if len(parts) >= 3:
            experiment, task, strategy = parts[0], parts[1], parts[2]
            data = json.loads(result_file.read_text())
            results.setdefault(experiment, {}).setdefault(strategy, {})[task] = data
    return results

def pairwise_mcnemar(method_a_results, method_b_results):
    """McNemar's test for paired binary outcomes."""
    a_win_b_lose = sum(1 for a, b in zip(method_a_results, method_b_results) if a and not b)
    b_win_a_lose = sum(1 for a, b in zip(method_a_results, method_b_results) if b and not a)
    
    n = a_win_b_lose + b_win_a_lose
    if n < 25:
        # Use exact binomial for small samples
        result = stats.binomtest(a_win_b_lose, n, 0.5)
        p_value = result.pvalue
    else:
        # Chi-squared approximation
        chi2 = (abs(a_win_b_lose - b_win_a_lose) - 1)**2 / (a_win_b_lose + b_win_a_lose)
        p_value = 1 - stats.chi2.cdf(chi2, df=1)
    
    return {
        "a_wins": a_win_b_lose,
        "b_wins": b_win_a_lose,
        "n_discordant": n,
        "p_value": p_value,
        "significant": p_value < 0.05
    }

def bootstrap_ci(data, n_bootstrap=10000, ci=0.95):
    """Bootstrap confidence interval for mean."""
    means = []
    for _ in range(n_bootstrap):
        sample = np.random.choice(data, size=len(data), replace=True)
        means.append(np.mean(sample))
    lower = np.percentile(means, (1 - ci) / 2 * 100)
    upper = np.percentile(means, (1 + ci) / 2 * 100)
    return {"mean": np.mean(data), "ci_lower": lower, "ci_upper": upper}

def cohens_h(p1, p2):
    """Cohen's h effect size for two proportions."""
    return 2 * np.arcsin(np.sqrt(p1)) - 2 * np.arcsin(np.sqrt(p2))
```

### Reporting Standards

Always include in the paper:
- **Sample sizes**: n=X problems/tasks
- **Number of runs**: K independent runs if applicable
- **Error bars**: Specify standard deviation or standard error
- **Confidence intervals**: 95% CI for key results
- **Significance tests**: p-values for key comparisons
- **Effect sizes**: Cohen's d or h for practical significance

---

## Monitoring (Cron Pattern)

### Cron Prompt Template

For each experiment batch, create a monitoring prompt:

```
Check the status of the [EXPERIMENT_NAME] experiment:

1. Process check: ps aux | grep [PROCESS_PATTERN]
2. Log check: tail -30 [LOG_FILE]
3. Results check: ls [RESULT_DIR]/eval/ (or appropriate result location)
4. If results are available:
   - Read the result JSON files
   - Report metrics in a table (Borda scores, accuracy, etc.)
   - Compute key comparisons between methods
5. If all experiments in this batch are complete:
   - git add -A && git commit -m "[COMMIT_MESSAGE]" && git push
   - Report final summary
6. Key question: [SPECIFIC ANALYTICAL QUESTION]

If nothing has changed since the last check, respond with [SILENT].
```

### Monitoring Best Practices

1. **Check processes first** — don't read results if the experiment is still running and results are incomplete
2. **Read the log tail** — look for errors, progress indicators, completion messages
3. **Count completed vs expected** — "45/150 problems done" is more useful than "some results exist"
4. **Report in structured tables** — always include key metrics in a table
5. **Answer the key question** — each experiment should have a specific analytical question to answer when done
6. **[SILENT] for no-news** — suppress notifications when nothing has changed
7. **Commit on completion** — every completed batch gets committed with a descriptive message

### Example Monitoring Report

```
## Code Experiments (Haiku 3.5) - COMPLETE

| Strategy | Pass Rate (150 problems) | vs Single |
|----------|------------------------|-----------|
| single_pass | 38.0% | — |
| critique_revise | 35.2% | -2.8pp |
| **autoreason** | **40.0%** | **+2.0pp** |
| best_of_6 | 31.0% | -7.0pp |

Key finding: Autoreason shows +2pp improvement over single pass, while 
best-of-6 collapses due to single-public-test selection issue.

Committed: `git commit -m "Add Haiku code results (150 problems, 4 strategies)"`
Next: Run significance tests on these results.
```

---

## Failure Recovery

### Common Failures and Recovery

| Failure | Detection | Recovery |
|---------|-----------|----------|
| **API credit exhaustion** | 402 errors in logs, incomplete results | Top up credits, re-run (skips completed work automatically) |
| **Rate limiting** | 429 errors, slow progress | Add retry logic with exponential backoff |
| **Process crash** | PID gone, log stops mid-problem | Re-run script (resumes from last checkpoint) |
| **Wrong model ID** | Model not found errors | Fix ID (e.g., `claude-opus-4-6` not `claude-opus-4.6`) |
| **Parallel slowdown** | Each experiment taking 2x longer | Reduce parallel experiments to 2-3 max |
| **Security scan blocks** | Commands blocked by security | Use `execute_code` instead of piped `terminal` commands |
| **Delegation failures** | `delegate_task` returns errors | Fall back to doing work directly |
| **Timeout on hard problems** | Process stuck, no log progress | Kill, skip problem, note in results |
| **Dataset path mismatch** | File not found errors | Verify paths before launching |

### Retry Naming Convention

When re-running failed experiments, use a suffix to track rounds:

```
logs/experiment_haiku_0_50.log       # Round 1
logs/experiment_haiku_0_50_r2.log    # Round 2 (after credit exhaustion)
logs/experiment_haiku_0_50_r3.log    # Round 3 (after bug fix)
```

### Pre-Flight Checklist

Before launching any experiment batch:

```
Pre-Flight:
- [ ] API credits sufficient for estimated calls
- [ ] Model IDs correct (test with 1 problem first)
- [ ] Output directory exists and is writable
- [ ] Resume logic works (re-run won't overwrite existing results)
- [ ] Log file path is unique (won't overwrite previous logs)
- [ ] Dataset/task files are accessible
- [ ] Config matches intended experiment
```

---

## Task/Benchmark Design

### Open-Ended Tasks (Subjective Evaluation)

Design tasks that have clear objectives but subjective quality:

```markdown
# Task: [Title]

## Context
[Specific scenario with concrete details: company size, constraints, timeline]

## Deliverable
[Exact format and structure required]

## Requirements
- [Specific, measurable requirements]
- [Not vague — "be comprehensive" is bad, "include exactly 6 sections" is good]
```

### Constrained Tasks (for Testing Scope Effects)

Constrained tasks test whether methods respect scope boundaries. Design with:

- **Fixed facts**: "Use only these N data points, add nothing else"
- **Fixed deliverable**: Specific format (pitch, postmortem, memo — not "improve this")
- **Fixed structure**: "These sections in this order, do not add/remove"
- **Fixed change items**: "Address exactly these N points, nothing else"

**Do NOT use word count as a scope constraint.** Word limits cause false convergence — outputs get rejected for length, not quality. Constrain scope (what to include) not length.

### Example: Good vs Bad Constraints

| Bad Constraint | Why | Good Constraint |
|---------------|-----|-----------------|
| "Max 500 words" | Judges reject for length | "Exactly 4 sections, each with 3 numbered items" |
| "Be concise" | Too vague | "Each prohibition must reference a specific base fact" |
| "Improve this" | Unbounded scope | "Write a 600-word incident postmortem with this exact structure" |
| "Make it better" | No clear criterion | "Address exactly these 3 reviewer concerns" |

---

## Visualization Best Practices

### Setup: SciencePlots + matplotlib

Install SciencePlots for publication-ready defaults:

```bash
pip install SciencePlots matplotlib numpy
```

**Option A: SciencePlots styles** (recommended — handles most defaults automatically):

```python
import matplotlib.pyplot as plt
import scienceplots  # registers the styles

# Pick a style:
# 'science'        — clean, serif fonts, suitable for most venues
# 'science+ieee'   — IEEE-style (good for two-column papers)
# 'science+nature' — Nature-style
# Add 'no-latex' if LaTeX is not installed on the machine generating plots

with plt.style.context(['science', 'no-latex']):
    fig, ax = plt.subplots(figsize=(3.5, 2.5))  # single-column width
    # ... plot ...
    fig.savefig('paper/fig_results.pdf', bbox_inches='tight')
```

**Option B: Manual rcParams** (when you need full control):

```python
import matplotlib.pyplot as plt

plt.rcParams.update({
    'font.size': 10,
    'font.family': 'serif',
    'axes.labelsize': 11,
    'axes.titlesize': 11,
    'xtick.labelsize': 9,
    'ytick.labelsize': 9,
    'legend.fontsize': 9,
    'figure.figsize': (3.5, 2.5),    # single-column default
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.05,
    'axes.linewidth': 0.8,
    'lines.linewidth': 1.5,
    'lines.markersize': 5,
    'axes.grid': True,
    'grid.alpha': 0.3,
    'grid.linewidth': 0.5,
})
```

### Standard Figure Sizes (Two-Column Format)

| Use Case | figsize | Notes |
|----------|---------|-------|
| Single column | `(3.5, 2.5)` | Fits in one column of two-column layout |
| Double column | `(7.0, 3.0)` | Spans full page width |
| Square (heatmap, confusion matrix) | `(3.5, 3.5)` | Single column |
| Tall single (many rows) | `(3.5, 5.0)` | Use sparingly |

### Colorblind-Safe Palette (Okabe-Ito)

Use this palette for all paper figures. It is distinguishable by people with all common forms of color vision deficiency:

```python
COLORS = {
    'blue':    '#0072B2',
    'orange':  '#E69F00',
    'green':   '#009E73',
    'red':     '#D55E00',
    'purple':  '#CC79A7',
    'cyan':    '#56B4E9',
    'yellow':  '#F0E442',
    'black':   '#000000',
}

# As a list for cycling:
COLOR_CYCLE = ['#0072B2', '#D55E00', '#009E73', '#E69F00', '#CC79A7', '#56B4E9']
```

Also differentiate lines by **marker and linestyle**, not just color:
```python
STYLES = [
    {'color': '#0072B2', 'marker': 'o', 'linestyle': '-'},
    {'color': '#D55E00', 'marker': 's', 'linestyle': '--'},
    {'color': '#009E73', 'marker': '^', 'linestyle': '-.'},
    {'color': '#E69F00', 'marker': 'D', 'linestyle': ':'},
]
```

### Complete Example: Method Comparison Bar Chart

```python
import matplotlib.pyplot as plt
import numpy as np

try:
    import scienceplots
    style = ['science', 'no-latex']
except ImportError:
    style = 'default'

with plt.style.context(style):
    methods = ['Single Pass', 'Critique+Revise', 'Best-of-N', 'Ours']
    scores = [73.2, 74.1, 68.5, 77.0]
    errors = [2.1, 1.8, 3.2, 1.5]
    colors = ['#56B4E9', '#E69F00', '#CC79A7', '#0072B2']
    
    fig, ax = plt.subplots(figsize=(3.5, 2.5))
    bars = ax.bar(methods, scores, yerr=errors, capsize=3,
                  color=colors, edgecolor='black', linewidth=0.5)
    
    # Highlight "Ours"
    bars[-1].set_edgecolor('#0072B2')
    bars[-1].set_linewidth(1.5)
    
    ax.set_ylabel('Pass Rate (%)')
    ax.set_ylim(60, 85)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    fig.savefig('paper/fig_comparison.pdf', bbox_inches='tight')
```

### Complete Example: Convergence/Trajectory Line Chart

```python
with plt.style.context(style):
    fig, ax = plt.subplots(figsize=(3.5, 2.5))
    
    passes = np.arange(1, 16)
    ours = [65, 72, 78, 82, 85, 87, 88, 89, 89.5, 90, 90, 90, 90, 90, 90]
    baseline = [65, 68, 70, 71, 69, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58]
    
    ax.plot(passes, ours, **STYLES[0], label='Ours', markersize=4)
    ax.plot(passes, baseline, **STYLES[1], label='Critique+Revise', markersize=4)
    
    # Mark convergence point
    ax.axvline(x=10, color='gray', linestyle=':', alpha=0.5, linewidth=0.8)
    ax.annotate('Converged', xy=(10, 90), fontsize=8, ha='center',
                xytext=(10, 93), arrowprops=dict(arrowstyle='->', color='gray'))
    
    ax.set_xlabel('Iteration')
    ax.set_ylabel('Quality Score')
    ax.legend(loc='lower right')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    fig.savefig('paper/fig_trajectory.pdf', bbox_inches='tight')
```

### Output Rules

- **Always save as PDF**: `fig.savefig('fig.pdf')` — vector graphics, sharp at any zoom
- **Never save as PNG** for paper figures — raster PNGs look blurry when printed/zoomed
- **Exception**: Screenshots, photographs, or pixel-art visualizations → PNG at 600 DPI
- **Verify grayscale**: Print to grayscale PDF and check all information is still visible

### Chart Types for Common Comparisons

| Comparison Type | Chart | Notes |
|----------------|-------|-------|
| Method vs method | Grouped bar chart | Include error bars |
| Across model sizes | Line chart with CI bands | Log scale for model size axis |
| Ablation study | Stacked/grouped bar | Highlight removed component |
| Trajectory/convergence | Line chart over iterations | Show winner per iteration |
| Per-task breakdown | Heatmap or grouped bar | Show variance across tasks |
