# OBLITERATUS Analysis Modules — Reference

OBLITERATUS includes 28 analysis modules for mechanistic interpretability of refusal in LLMs.
These modules help understand how and where refusal behaviors are encoded before performing abliteration.

---

## Core Analysis (Run These First)

### 1. Alignment Imprint Detection (`alignment_imprint.py`)
Fingerprints whether a model was trained via DPO, RLHF, CAI, or SFT.
This determines which extraction strategy will work best.

### 2. Concept Cone Geometry (`concept_geometry.py`)
Determines if refusal is a single linear direction or a polyhedral cone
(set of multiple mechanisms). Single-direction models respond well to `basic`;
polyhedral models need `advanced` or `surgical`.

### 3. Refusal Logit Lens (`logit_lens.py`)
Identifies the specific layer where a model "decides" to refuse by decoding
intermediate layer representations into token space.

### 4. Ouroboros Detection (`anti_ouroboros.py`)
Identifies if a model attempts to "self-repair" refusal behaviors after
excision. Reports a risk score (0-1). High scores mean additional refinement
passes are needed.

### 5. Causal Tracing (`causal_tracing.py`)
Identifies which components (layers, heads, MLPs) are causally necessary
for refusal behavior using activation patching.

---

## Geometric Analysis

### 6. Cross-Layer Alignment (`cross_layer.py`)
Measures how refusal directions align across different layers. High alignment
means the refusal signal is consistent; low alignment suggests layer-specific
mechanisms.

### 7. Residual Stream Decomposition (`residual_stream.py`)
Decomposes the residual stream into attention and MLP contributions to
understand which component type contributes more to refusal.

### 8. Riemannian Manifold Geometry (`riemannian_manifold.py`)
Analyzes the curvature and geometry of the weight manifold near refusal
directions. Informs how aggressively projections can be applied without
damaging the manifold structure.

### 9. Whitened SVD (`whitened_svd.py`)
Covariance-normalized SVD extraction that separates guardrail signals from
natural activation variance. More precise than standard SVD for models with
high activation variance.

### 10. Concept Cone Geometry (extended)
Maps the full polyhedral structure of refusal, including cone angles,
face counts, and intersection patterns.

---

## Probing & Classification

### 11. Activation Probing (`activation_probing.py`)
Post-excision verification — probes for residual refusal concepts after
abliteration to ensure complete removal.

### 12. Probing Classifiers (`probing_classifiers.py`)
Trains linear classifiers to detect refusal in activations. Used both
before (to verify refusal exists) and after (to verify it's gone).

### 13. Activation Patching (`activation_patching.py`)
Interchange interventions — swaps activations between refused and complied
runs to identify causal components.

### 14. Tuned Lens (`tuned_lens.py`)
Trained version of logit lens that provides more accurate per-layer
decoding by learning affine transformations for each layer.

### 15. Multi-Token Position Analysis (`multi_token_position.py`)
Analyzes refusal signals across multiple token positions, not just the
last token. Important for models that distribute refusal across the sequence.

---

## Abliteration & Manipulation

### 16. SAE-Based Abliteration (`sae_abliteration.py`)
Uses Sparse Autoencoder features to identify and remove specific refusal
features. More surgical than direction-based methods.

### 17. Steering Vectors (`steering_vectors.py`)
Creates and applies inference-time steering vectors for reversible refusal
modification. Includes `SteeringVectorFactory` and `SteeringHookManager`.

### 18. LEACE Concept Erasure (`leace.py`)
Linear Erasure via Closed-form Estimation — mathematically optimal linear
concept removal. Available as both analysis module and direction extraction method.

### 19. Sparse Surgery (`sparse_surgery.py`)
High-precision weight modification targeting individual neurons and
weight matrix entries rather than full directions.

### 20. Conditional Abliteration (`conditional_abliteration.py`)
Targeted removal that only affects specific refusal categories while
preserving others (e.g., remove weapons refusal but keep CSAM refusal).

---

## Transfer & Robustness

### 21. Cross-Model Transfer (`cross_model_transfer.py`)
Tests whether refusal directions extracted from one model transfer to
another architecture. Measures universality of guardrail directions.

### 22. Defense Robustness (`defense_robustness.py`)
Evaluates how robust the abliteration is against various defense mechanisms
and re-alignment attempts.

### 23. Spectral Certification (`spectral_certification.py`)
Provides mathematical bounds on the completeness of refusal removal
using spectral analysis of the projection.

### 24. Wasserstein Optimal Extraction (`wasserstein_optimal.py`)
Uses optimal transport theory for more precise direction extraction
that minimizes distribution shift.

### 25. Wasserstein Transfer (`wasserstein_transfer.py`)
Distribution transfer between models using Wasserstein distance
for cross-architecture refusal direction mapping.

---

## Advanced / Research

### 26. Bayesian Kernel Projection (`bayesian_kernel_projection.py`)
Probabilistic feature mapping that estimates uncertainty in refusal
direction identification.

### 27. Cross-Model Universality Index
Measures if guardrail directions generalize across different model
architectures and training regimes.

### 28. Visualization (`visualization.py`)
Plotting and graphing utilities for all analysis modules. Generates
heatmaps, direction plots, and layer-wise analysis charts.

---

## Running Analysis

### Via CLI
```bash
# Run analysis from a YAML config
obliteratus run analysis-study.yaml --preset quick

# Available study presets:
# quick     — Fast sanity check (2-3 modules)
# full      — All core + geometric analysis
# jailbreak — Refusal circuit localization
# knowledge — Knowledge preservation analysis
# robustness — Stress testing / defense evaluation
```

### Via YAML Config
See the `templates/analysis-study.yaml` template for a complete example.
Load with: `skill_view(name="obliteratus", file_path="templates/analysis-study.yaml")`
