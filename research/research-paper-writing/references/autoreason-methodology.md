# Autoreason: Iterative Refinement Methodology

Complete reference for the autoreason iterative refinement method, derived from experimental results across subjective writing tasks, competitive programming, and four model tiers. Use this when any output (paper draft, experiment script, analysis, task definition) needs iterative improvement.

**Source**: [NousResearch/autoreason](https://github.com/NousResearch/autoreason) — "Autoreason: When Iterative LLM Refinement Works and Why It Fails"

---

## Strategy Selection Guide

### Decision Tree

```
Is the task objectively verifiable (code, math, factual)?
├── YES → Does the model solve it on the first attempt?
│   ├── YES → Use single pass (no refinement needed)
│   └── NO → Use autoreason (structured analysis → reason-informed revision)
│
└── NO (subjective) → What model tier are you using?
    ├── Weak (Llama 8B, small models)
    │   → Single pass. Model too weak for refinement to help.
    │     Invest in generation quality, not iteration.
    │
    ├── Mid-tier (Haiku 3.5, Gemini Flash)
    │   → Autoreason with stronger judges. This is the sweet spot.
    │     Self-refinement DESTROYS weak model outputs — autoreason prevents this.
    │
    ├── Strong (Sonnet 4)
    │   → Autoreason for open-ended tasks. Wins 3/5.
    │     Critique-and-revise for concrete technical tasks (2/5).
    │
    └── Frontier (Sonnet 4.6, Opus)
        ├── Constrained scope? → Autoreason. Wins 2/3 constrained tasks.
        └── Unconstrained? → Critique-and-revise or single pass.
            Autoreason FAILS on unconstrained frontier tasks (comes last).
```

### Strategy Comparison Table

| Strategy | Best For | Avoid When | Compute (per iteration) |
|----------|----------|------------|------------------------|
| **Single pass** | Frontier models, template tasks, tight budgets | Mid-tier models where quality ceiling is low | 1 call |
| **Critique-and-revise** | Concrete technical requirements (system design, specifications) | Weak models (degrades output), unconstrained subjective tasks | 2 calls |
| **Autoreason** | Mid-tier models, constrained scope, tasks with genuine tradeoffs | Weak models (Llama 8B), frontier + unconstrained | ~6 calls |
| **Best-of-N** | Almost never recommended | Weak models especially — worse than single pass | N calls |

### Why Each Strategy Fails

| Strategy | Failure Mode | Mechanism |
|----------|-------------|-----------|
| **Single pass** | Quality ceiling | No mechanism to improve beyond first attempt |
| **Critique-and-revise** | Progressive degradation | Model hallucinates problems (sycophancy), scope creeps each pass, never declines to change |
| **Best-of-N** | Random selection | Without good ranking signal, more samples = more mediocre options |
| **Autoreason (unconstrained)** | Synthesis drift | Stronger models produce syntheses so consistently preferred that incumbent never stabilizes |

---

## The Autoreason Loop

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    ITERATION LOOP                         │
│                                                           │
│   Incumbent A ──► Critic ──► Author B ──► Synthesizer     │
│       │                                      │            │
│       │              ┌───────────────────────┘            │
│       ▼              ▼                                    │
│      [A]           [AB]          [B]                      │
│       │              │            │                       │
│       └──────────────┼────────────┘                       │
│                      ▼                                    │
│              Judge Panel (blind)                          │
│                      │                                    │
│                      ▼                                    │
│                   Winner                                  │
│                      │                                    │
│              ┌───────┴───────┐                            │
│              ▼               ▼                            │
│         A wins k=2      B or AB wins                      │
│         consecutive?    → new incumbent                   │
│              │                                            │
│              ▼                                            │
│           CONVERGED                                       │
└──────────────────────────────────────────────────────────┘
```

### Roles

Every role is a **fresh, isolated agent** with no shared context:

| Role | Input | Output | Key Rule |
|------|-------|--------|----------|
| **Critic** | Task + Incumbent A | List of problems | Find problems ONLY. No fixes. No suggestions. |
| **Author B** | Task + A + Critique | Revised version B | Address each criticism. State which problem each change fixes. |
| **Synthesizer** | Task + X + Y (randomized labels) | Synthesis AB | Take strongest elements of each. Not a compromise. |
| **Judge Panel** | Task + A, AB, B (randomized labels + order) | Ranking | Rank best to worst. No authorship stake. |

### Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Convergence k** | 2 | k=1 premature (94% displaced later). k=2 converges 100%, quality plateaus. k=3 fails 24%, 2x cost, no quality gain. |
| **Author temperature** | 0.7-0.8 | Encourages diverse revisions |
| **Judge temperature** | 0.3 | Encourages consistent evaluation |
| **In-loop judges** | 3 | Balance per-pass cost vs evaluation stability |
| **Final evaluation judges** | 7 | Higher statistical power for final comparison |
| **Max tokens** | 4096 | Standard; 8192 for long-form (papers) |
| **Judge type** | Chain-of-thought | 3x faster convergence on some tasks. Always use. |
| **Tiebreak** | Conservative (incumbent wins) | Prevents false positives — A must be genuinely beaten |
| **Max passes** | 25 (constrained), 50 (remedy) | Safety cap; most converge by pass 10-15 |

### Prompts

#### Critic
```
System: You are a critical reviewer. Your only job is to find real problems. 
Be specific and concrete. Do not suggest fixes.

User: Find real problems with this proposal. Focus on:
- Things that won't work as described
- Complexity that doesn't pay for itself
- Assumptions that are wrong
- Missing pieces
Do NOT propose fixes. Just the problems.
```

#### Author B
```
System: You are a senior consultant revising a proposal based on specific 
criticisms. Address each valid criticism directly. Do not make changes not 
motivated by an identified problem.

User: [TASK] + [VERSION A] + [CRITIC OUTPUT]
Revise to address these problems. For each change, state which problem it fixes.
```

#### Synthesizer
```
System: You are given two versions as equal inputs. Take the strongest elements 
from each and produce a coherent synthesis. This is not a compromise.

User: [TASK] + [VERSION X] + [VERSION Y]
(labels randomized — synthesizer doesn't know which is incumbent)
```

#### Judge (Chain-of-Thought) — ALWAYS USE THIS VERSION
```
System: You are an independent evaluator. Think carefully before deciding.

User: [TASK] + Three proposals. For each, think step by step:
1. What does it get right?
2. What does it get wrong or miss?
3. Are numbers and claims defensible?
4. Is detail appropriate or bloated?
After reasoning, rank all three.
RANKING: [best], [second], [worst]
```

#### Baseline Prompts (for comparison experiments)

| Baseline | Prompt |
|----------|--------|
| **Conservative** | "Make minimal improvements while preserving what works. Do not add new sections or significantly expand scope." |
| **Improve this** | "Improve this document." (no further guidance) |
| **Harsh critic** | "Critically evaluate and rewrite, fixing all weaknesses you identify." |
| **Critique & revise** | Step 1: "Produce a structured critique. List specific weaknesses." Step 2: "Revise to address each criticism." |

---

## Scoring: Borda Count

Judges rank candidates. Points awarded by rank position:

| Rank | Points (3 candidates) |
|------|----------------------|
| 1st | 3 |
| 2nd | 2 |
| 3rd | 1 |

**Aggregation**: Sum across all judges. Winner = highest total.
**Tiebreak**: Incumbent (A) wins any tie.

**Example** (3 judges):
- Judge 1: AB > A > B → AB gets 3, A gets 2, B gets 1
- Judge 2: A > AB > B → A gets 3, AB gets 2, B gets 1
- Judge 3: AB > B > A → AB gets 3, B gets 2, A gets 1
- Totals: AB=8, A=6, B=4 → AB wins, becomes new incumbent

**Randomization per judge**:
- Candidate labels randomized (A might be called "Proposal X" for one judge, "Proposal Z" for another)
- Presentation order randomized (AB might appear first or last)
- This prevents position bias and label bias

---

## Model Selection Guide

### Empirical Results by Model Tier

| Model | Autoreason Wins | Autoreason Avg Borda | Best Baseline | Margin | Recommendation |
|-------|----------------|---------------------|---------------|--------|----------------|
| **Llama 3.1 8B** | 1/3 | 23.7 | 25.0 (single) | -1.3 | Skip autoreason. Model too weak for diverse candidates. |
| **Gemini 2.0 Flash** | 2/3 | 25.0 | 20.0 (single) | +5.0 | Good candidate. Moderate gains. |
| **Haiku 3.5** | 3/3 | **42.0** | 33.7 (single) | **+8.3** | **Best candidate.** Perfect scores. Baselines actively destroy quality. |
| **Sonnet 4** | 3/5 | 27.8 | 22.4 (C&R) | +5.4 | Good candidate for open tasks. C&R better for technical tasks. |
| **Sonnet 4.6 (unconstrained)** | 0/1 | 7.0 | 31.0 (C&R) | -24.0 | Do NOT use autoreason without constraints. |
| **Sonnet 4.6 (constrained)** | 2/3 | 29.0 | 27.0 (improve) | +2.0 | Use only with scope constraints. |

### The Generation-Evaluation Gap

The core insight: **autoreason's value depends on the gap between a model's generation capability and its self-evaluation capability.**

```
Weak models (Llama 8B):
  Generation: Poor  |  Self-evaluation: Poor
  Gap: Small (both bad) → Autoreason can't help, no diverse candidates

Mid-tier models (Haiku, Flash):
  Generation: Decent  |  Self-evaluation: Poor
  Gap: LARGE → Autoreason's sweet spot. External eval bridges the gap.

Strong models (Sonnet 4):
  Generation: Good  |  Self-evaluation: Decent
  Gap: Moderate → Autoreason helps on 3/5 tasks

Frontier models (Sonnet 4.6):
  Generation: Excellent  |  Self-evaluation: Good
  Gap: Small → Simple methods suffice. Autoreason hurts on unconstrained tasks.
```

**Practical rule**: As model costs drop and capabilities improve, today's frontier becomes tomorrow's mid-tier. The generation-evaluation gap is structural, not temporary. Match refinement architecture to the model's position on the capability curve.

### Judge Selection

| Author Model | Recommended Judge | Rationale |
|-------------|------------------|-----------|
| Llama 8B | Don't use autoreason | Model too weak |
| Gemini Flash | Sonnet 4 | Cross-model evaluation works |
| Haiku 3.5 | Sonnet 4 | Strong external eval is the mechanism |
| Haiku 3.5 | Haiku 3.5 (same) | Still works — tournament structure provides value even without strong judges (20.7 vs 18.3 avg Borda) |
| Sonnet 4 | Sonnet 4 (same) | Same-model judges work at this tier |
| Sonnet 4.6 | Sonnet 4.6 (same) | Only with scope constraints |

---

## Scope Constraint Design

### What Makes Autoreason Work on Constrained Tasks

The same model (Sonnet 4.6) goes from **last place** (unconstrained) to **first place** (constrained) with scope constraints. The constraints bound the improvement space so synthesis drift can't accumulate.

### Effective Constraints

| Constraint Type | Example | Why It Works |
|----------------|---------|-------------|
| **Fixed facts** | "Use only these 8 data points, add nothing else" | Bounds information space |
| **Fixed deliverable** | "500-word startup pitch" (not "improve this") | Defines done condition |
| **Fixed structure** | "Exactly 4 sections, each with 3 numbered items" | Prevents structural drift |
| **Fixed change items** | "Address exactly these 3 reviewer concerns" | Bounds modification scope |

### Ineffective Constraints

| Constraint | Why It Fails | What Happens |
|-----------|-------------|-------------|
| Word count alone | Not a scope constraint | False convergence — rejected for length, not quality |
| "Be concise" | Too vague | Ignored after 2-3 passes |
| "Be comprehensive" | Anti-constraint | Invites scope creep |
| No constraints at all | Unbounded improvement space | Synthesis dominates, no convergence |

### Task Categories

| Task Type | Autoreason Works? | Why |
|-----------|-------------------|-----|
| Tasks with genuine tradeoffs (strategy, policy) | Yes | Multiple valid approaches for tournament to select between |
| Constrained writing (pitch, memo, postmortem) | Mostly (2/3) | Bounded scope, clear evaluation criteria |
| Template-filling (incident postmortem) | No | One correct structure, minimal decision space |
| Competitive programming | Yes | Naturally scoped, test suite provides external verification |
| Open-ended unconstrained + frontier model | No | Synthesis drift, no convergence |

---

## Failure Taxonomy

| Failure Mode | Condition | Detection | Evidence |
|-------------|-----------|-----------|----------|
| **Self-correction unreliable** | No external evaluation signal | Baselines degrade below single pass | Haiku baselines: 16.3 avg vs 33.7 single pass |
| **Drift / synthesis dominance** | Unconstrained scope | A wins <15%, AB dominates | Sonnet 4.6 unconstrained: A wins 12%, AB wins 60%+ |
| **Overfitting to visible feedback** | Shallow revision loop (C&R) | High public/private divergence | C&R overfits 32% on hard code problems |
| **No convergence** | Broken judge pipeline | Parsing failures, <3 valid judges | Mixed panel parser failure: 11+ passes |
| **Model too weak** | Insufficient generation diversity | All candidates look similar | Llama 8B wins only 1/3 tasks |

### Recovery Patterns

| Failure | Recovery |
|---------|----------|
| No convergence (drift) | Add scope constraints to the task |
| No convergence (broken judges) | Fix parser, ensure 3 valid judges before continuing |
| Quality degrades with iteration | Switch to single pass or add constraints |
| Model too weak | Use a stronger model for generation, keep weak model for cheap roles |
| Overfitting (code) | Use structured analysis step, not just test feedback |

---

## Code Domain Adaptation

The autoreason method adapts differently for code vs writing:

### Writing Domain
```
Call 1: Critic (find problems in incumbent)
Call 2: Author B (revise based on critique)
Call 3: Synthesizer (merge A and B)
Calls 4-6: Judge Panel (3 blind judges rank A, B, AB)
```

### Code Domain (6-call budget)
```
Call 1: Initial generation
Call 2: Structured analysis (5 points — NO CODE):
  - Problem analysis: what does the problem actually require?
  - Approach analysis: what approach did we use, is it correct?
  - Failure analysis: why did tests fail?
  - Alternative approaches: what else could work?
  - Edge cases: what inputs might break the solution?
Calls 3-6: Reason-informed revisions
  - Each revision must explain WHY it fixes the issue
  - Sees test results from public (visible) test cases
```

**Key difference**: The code strategy replaces the judge panel with test-suite evaluation (objective ground truth). The structured analysis step (Call 2) is what drives recovery — it forces reasoning about *why* the approach failed before attempting fixes.

**Results**: Recovery is the mechanism. Among problems where both autoreason and single-pass failed initially, autoreason recovered 62% vs single-pass's 43% (McNemar p=0.041, Cohen's h=0.32).

---

## Applying Autoreason to Paper Writing

The paper itself was refined using autoreason (Section 8 of the paper):

### Setup
- Model: claude-opus-4
- Judges: 3 Opus judges
- Enhancement: Ground-truth critic (access to actual experimental data)
- Result: Converged in 9 passes

### Key Findings for Paper Refinement

1. **Ground-truth critic is essential**: Without ground-truth access, Opus hallucinated a fabricated ablation study, fake confidence intervals, wrong model names, and incorrect role descriptions. With ground-truth access, the critic caught all four on pass 1.

2. **Judge panel integrity matters**: A broken parser in one judge (Gemini output format mismatch) reduced the panel from 3 to 2 judges. This prevented convergence for 11+ passes. Fixing to 3 working judges, the same incumbent converged in 2 passes. A broken judge doesn't add noise — it prevents equilibrium.

### Recommended Setup for Paper Refinement

```
Critic prompt: "You are reviewing a research paper draft. You have access to the 
actual experimental results [GROUND TRUTH DATA]. Find factual errors, unsupported 
claims, hallucinated results, and structural problems. Do not suggest fixes."

Author B prompt: "Revise this paper draft to fix the identified problems. For each 
change, cite the specific problem it addresses. Do not add claims not supported by 
the provided experimental data."

Judge prompt (CoT): "Compare three versions of this paper. For each, evaluate:
1. Factual accuracy against the provided results
2. Clarity of the narrative and contribution
3. Whether claims are properly hedged and supported
4. Writing quality (concision, precision, no filler)
After reasoning, rank all three. RANKING: [best], [second], [worst]"
```

### What to Provide as Ground Truth
- All experimental result JSON files
- Statistical test outputs
- Raw numbers for every table and figure
- Configuration files showing exact hyperparameters
- Code that generated the results (for method description accuracy)

---

## Compute Budget Reference

| Method | Calls per Pass | Typical Passes | Total Calls | Relative Cost |
|--------|---------------|----------------|-------------|---------------|
| Single pass | 1 | 1 | 1 | 1x |
| Best-of-N | N | 1 | N | Nx |
| Critique & revise | 2 | 15 | 30 | 30x |
| Autoreason (in-loop) | ~6 | 10-15 | 60-90 | 60-90x |
| Autoreason (with final eval) | ~6 + 7 | 10-15 + 1 | 67-97 | ~80x |

**Cost-quality tradeoff**: Autoreason uses ~6x more compute per pass and typically runs more passes. This is a real tradeoff. The method trades compute for evaluation quality. On constrained tasks with mid-tier models, this tradeoff is strongly positive. On unconstrained tasks with frontier models, it's negative.

**CoT judges reduce cost**: 1 CoT judge provides evaluation quality comparable to 3 standard judges, at ~40% cost savings. Always use CoT judges.
