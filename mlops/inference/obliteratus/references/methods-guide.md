# OBLITERATUS Methods — Detailed Guide

> The CLI accepts 9 methods via `--method`: basic, advanced, aggressive, spectral_cascade,
> informed, surgical, optimized, inverted, nuclear.
> Four additional methods (failspy, gabliteration, heretic, rdo) are available only via the Python API.

## How Abliteration Works (Theory)

Abliteration identifies a "refusal direction" — a vector in the model's activation space that
corresponds to refusal behavior — and projects it out of the weight matrices.

Mathematically: `W_new = W_old - (W_old @ d @ d.T)` where `d` is the refusal direction.

The key challenge is finding accurate refusal directions without damaging other capabilities.

---

## Direction Extraction Methods

Before projecting, OBLITERATUS extracts refusal directions using one of three methods:

| Method | Flag | Description | Best For |
|:-------|:-----|:------------|:---------|
| Diff-in-Means | `--direction-method diff_means` | Difference between mean activations on refused vs. complied prompts | Default, fast, robust |
| SVD | `--direction-method svd` | Multi-direction extraction via Singular Value Decomposition | Complex alignment, multiple refusal mechanisms |
| LEACE | `--direction-method leace` | Linear Erasure via Closed-form Estimation — mathematically optimal | Maximum precision, research |

---

## Method Details

### basic
- **Directions:** 1 (single diff-in-means vector)
- **Speed:** Fast (~5-10 min for 8B model)
- **Risk:** Low
- **Use case:** Quick tests, prototyping, evaluating if abliteration works for a model
- **How it works:** Extracts one refusal direction and projects it out uniformly across all layers.

### advanced (DEFAULT — RECOMMENDED)
- **Directions:** 4 (multi-direction SVD)
- **Speed:** Medium (~10-20 min for 8B model)
- **Risk:** Low-Medium
- **Refinement passes:** 2
- **Use case:** Default for most models. Well-tested and reliable.
- **How it works:** Extracts multiple refusal directions via SVD, applies norm-preserving bi-projection to maintain weight matrix norms. Two refinement passes catch residual refusal.

### aggressive
- **Directions:** 8+ (whitened SVD + jailbreak-contrastive)
- **Speed:** Medium-Slow
- **Risk:** Medium-High (may damage coherence)
- **Use case:** When `advanced` leaves > 10% refusals. Stubborn models.
- **How it works:** Uses whitened SVD for covariance-normalized extraction, adds jailbreak-contrastive directions, performs attention head surgery on the most refusal-active heads.

### spectral_cascade
- **Speed:** Medium
- **Risk:** Medium
- **Use case:** Research, novel approaches
- **How it works:** DCT (Discrete Cosine Transform) frequency-domain decomposition of refusal signals. Separates high-frequency (surface-level) from low-frequency (deep) refusal patterns.

### informed (EXPERIMENTAL)
- **Speed:** Slow (~20-40 min for 8B model)
- **Risk:** Variable — results depend on analysis quality
- **Use case:** When you want auto-configuration, but be aware this is experimental and may not outperform `advanced`.
- **How it works:** Runs 4 analysis modules first (alignment imprint, concept geometry, logit lens, ouroboros detection), then auto-configures extraction strategy. Includes an "Ouroboros loop" that detects and counteracts self-repair.
- **Note:** The auto-detection can sometimes misconfigure. If results are poor, fall back to `advanced`.

### surgical
- **Speed:** Very slow (~1-2 hrs for 8B model)
- **Risk:** Low (very precise)
- **Use case:** Reasoning models (R1 distills, QwQ, etc.) where chain-of-thought must be preserved.
- **How it works:** Uses SAE (Sparse Autoencoder) features + individual neuron masking + attention head surgery + per-expert decomposition (for MoE). CoT-aware — identifies and protects reasoning-critical directions before projecting.

### optimized
- **Speed:** Very slow (hours — runs many trials)
- **Risk:** Low (finds optimal parameters)
- **Use case:** When quality matters more than speed. Production models.
- **How it works:** Bayesian hyperparameter search via Optuna TPE sampler. Optimizes n_directions, regularization, refinement passes, and layer selection jointly. Evaluates each configuration on refusal rate + perplexity.

### inverted
- **Speed:** Fast
- **Risk:** High (model behavior changes dramatically)
- **Use case:** Research, studying refusal mechanisms
- **How it works:** Instead of projecting out the refusal direction, reflects it. The model actively complies rather than passively not-refusing. Useful for understanding the geometry of alignment.

### nuclear
- **Speed:** Slow
- **Risk:** Medium-High
- **Use case:** Stubborn MoE models (DeepSeek-MoE, Mixtral, etc.)
- **How it works:** Combines expert-granular abliteration (EGA), steering vector injection, attention head pruning, and multi-pass refinement. Decomposes refusal signals into per-expert components for MoE architectures.

---

## Method Selection Flowchart

```
Is this a quick test?
  → YES: basic
  → NO: continue

Is it an MoE model (Mixtral, DeepSeek-MoE)?
  → YES: nuclear
  → NO: continue

Is it a reasoning model (R1, QwQ, CoT-focused)?
  → YES: surgical
  → NO: continue

Do you need the absolute best quality and have time?
  → YES: optimized
  → NO: advanced (recommended default)

Did advanced leave > 10% refusals?
  → YES: aggressive
  → Still refusing: nuclear
```

---

## Key Parameters

| Parameter | Range | Default | Effect |
|:----------|:------|:--------|:-------|
| `--n-directions` | 1-32 | method-dependent | More directions = more complete removal, but higher damage risk |
| `--regularization` | 0.0-1.0 | 0.1 | Higher = more conservative (less removal, less damage) |
| `--refinement-passes` | 1-5 | 2 | More passes catch residual refusal, but diminishing returns |
| `--quantization` | 4bit, 8bit | none | Reduces VRAM usage; quality impact minimal for extraction |
| `--verify-sample-size` | 10-200 | 20 | More samples = more accurate refusal rate estimate |

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|:--------|:-------------|:----|
| Refusal rate > 20% | Too few directions | Increase `--n-directions`, try `aggressive` |
| Refusal rate 5-20% | Residual refusal | Add `--refinement-passes 3`, try `--direction-method svd` |
| Perplexity spike > 20% | Over-aggressive removal | Reduce `--n-directions`, increase `--regularization` |
| Repetitive output | Weight matrix damage | Use `basic` with fewer directions, check norm preservation |
| MoE model still refuses | Non-expert-aware method | Switch to `nuclear` |
| Reasoning degraded | CoT directions damaged | Use `surgical` method |
| OOM during extraction | Insufficient VRAM | Add `--quantization 4bit` and/or `--large-model` |
