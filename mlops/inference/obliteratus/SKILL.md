---
name: obliteratus
description: Remove refusal behaviors from open-weight LLMs using OBLITERATUS — mechanistic interpretability techniques (diff-in-means, SVD, whitened SVD, LEACE, SAE decomposition, etc.) to excise guardrails while preserving reasoning. 9 CLI methods, 28 analysis modules, 116 model presets across 5 compute tiers, tournament evaluation, and telemetry-driven recommendations. Use when a user wants to uncensor, abliterate, or remove refusal from an LLM.
version: 2.0.0
author: Hermes Agent
license: MIT
dependencies: [obliteratus, torch, transformers, bitsandbytes, accelerate, safetensors]
metadata:
  hermes:
    tags: [Abliteration, Uncensoring, Refusal-Removal, LLM, Weight-Projection, SVD, Mechanistic-Interpretability, HuggingFace, Model-Surgery]
    related_skills: [vllm, gguf, huggingface-tokenizers]
---

# OBLITERATUS Skill

Remove refusal behaviors (guardrails) from open-weight LLMs without retraining or fine-tuning. Uses mechanistic interpretability techniques — including diff-in-means, SVD, whitened SVD, LEACE concept erasure, SAE decomposition, Bayesian kernel projection, and more — to identify and surgically excise refusal directions from model weights while preserving reasoning capabilities.

**License warning:** OBLITERATUS is AGPL-3.0. NEVER import it as a Python library. Always invoke via CLI (`obliteratus` command) or subprocess. This keeps Hermes Agent's MIT license clean.

## When to Use This Skill

Trigger when the user:
- Wants to "uncensor" or "abliterate" an LLM
- Asks about removing refusal/guardrails from a model
- Wants to create an uncensored version of Llama, Qwen, Mistral, etc.
- Mentions "refusal removal", "abliteration", "weight projection"
- Wants to analyze how a model's refusal mechanism works
- References OBLITERATUS, abliterator, or refusal directions

## Step 1: Installation

Check if already installed:
```bash
obliteratus --version 2>/dev/null && echo "INSTALLED" || echo "NOT INSTALLED"
```

If not installed, clone and install from GitHub:
```bash
git clone https://github.com/elder-plinius/OBLITERATUS.git
cd OBLITERATUS
pip install -e .
# For Gradio web UI support:
# pip install -e ".[spaces]"
```

**IMPORTANT:** Confirm with user before installing. This pulls in ~5-10GB of dependencies (PyTorch, Transformers, bitsandbytes, etc.).

## Step 2: Check Hardware

Before anything, check what GPU is available:
```bash
python3 -c "
import torch
if torch.cuda.is_available():
    gpu = torch.cuda.get_device_name(0)
    vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f'GPU: {gpu}')
    print(f'VRAM: {vram:.1f} GB')
    if vram < 4: print('TIER: tiny (models under 1B)')
    elif vram < 8: print('TIER: small (models 1-4B)')
    elif vram < 16: print('TIER: medium (models 4-9B with 4bit quant)')
    elif vram < 32: print('TIER: large (models 8-32B with 4bit quant)')
    else: print('TIER: frontier (models 32B+)')
else:
    print('NO GPU - only tiny models (under 1B) on CPU')
"
```

### VRAM Requirements (with 4-bit quantization)

| VRAM     | Max Model Size  | Example Models                              |
|:---------|:----------------|:--------------------------------------------|
| CPU only | ~1B params      | GPT-2, TinyLlama, SmolLM                    |
| 4-8 GB   | ~4B params      | Qwen2.5-1.5B, Phi-3.5 mini, Llama 3.2 3B   |
| 8-16 GB  | ~9B params      | Llama 3.1 8B, Mistral 7B, Gemma 2 9B       |
| 24 GB    | ~32B params     | Qwen3-32B, Llama 3.1 70B (tight), Command-R |
| 48 GB+   | ~72B+ params    | Qwen2.5-72B, DeepSeek-R1                    |
| Multi-GPU| 200B+ params    | Llama 3.1 405B, DeepSeek-V3 (685B MoE)      |

## Step 3: Browse Available Models & Get Recommendations

```bash
# Browse models by compute tier
obliteratus models --tier medium

# Get architecture info for a specific model
obliteratus info <model_name>

# Get telemetry-driven recommendation for best method & params
obliteratus recommend <model_name>
obliteratus recommend <model_name> --insights  # global cross-architecture rankings
```

## Step 4: Choose a Method

### Method Selection Guide
**Default / recommended for most cases: `advanced`.** It uses multi-direction SVD with norm-preserving projection and is well-tested.

| Situation                         | Recommended Method | Why                                      |
|:----------------------------------|:-------------------|:-----------------------------------------|
| Default / most models             | `advanced`         | Multi-direction SVD, norm-preserving, reliable |
| Quick test / prototyping          | `basic`            | Fast, simple, good enough to evaluate    |
| Dense model (Llama, Mistral)      | `advanced`         | Multi-direction, norm-preserving         |
| MoE model (DeepSeek, Mixtral)     | `nuclear`          | Expert-granular, handles MoE complexity  |
| Reasoning model (R1 distills)     | `surgical`         | CoT-aware, preserves chain-of-thought    |
| Stubborn refusals persist         | `aggressive`       | Whitened SVD + head surgery + jailbreak   |
| Want reversible changes           | Use steering vectors (see Analysis section) |
| Maximum quality, time no object   | `optimized`        | Bayesian search for best parameters      |
| Experimental auto-detection       | `informed`         | Auto-detects alignment type — experimental, may not always outperform advanced |

### 9 CLI Methods
- **basic** — Single refusal direction via diff-in-means. Fast (~5-10 min for 8B).
- **advanced** (DEFAULT, RECOMMENDED) — Multiple SVD directions, norm-preserving projection, 2 refinement passes. Medium speed (~10-20 min).
- **aggressive** — Whitened SVD + jailbreak-contrastive + attention head surgery. Higher risk of coherence damage.
- **spectral_cascade** — DCT frequency-domain decomposition. Research/novel approach.
- **informed** — Runs analysis DURING abliteration to auto-configure. Experimental — slower and less predictable than advanced.
- **surgical** — SAE features + neuron masking + head surgery + per-expert. Very slow (~1-2 hrs). Best for reasoning models.
- **optimized** — Bayesian hyperparameter search (Optuna TPE). Longest runtime but finds optimal parameters.
- **inverted** — Flips the refusal direction. Model becomes actively willing.
- **nuclear** — Maximum force combo for stubborn MoE models. Expert-granular.

### Direction Extraction Methods (--direction-method flag)
- **diff_means** (default) — Simple difference-in-means between refused/complied activations. Robust.
- **svd** — Multi-direction SVD extraction. Better for complex alignment.
- **leace** — LEACE (Linear Erasure via Closed-form Estimation). Optimal linear erasure.

### 4 Python-API-Only Methods
(NOT available via CLI — require Python import, which violates AGPL boundary. Mention to user only if they explicitly want to use OBLITERATUS as a library in their own AGPL project.)
- failspy, gabliteration, heretic, rdo

## Step 5: Run Abliteration

### Standard usage
```bash
# Default method (advanced) — recommended for most models
obliteratus obliterate <model_name> --method advanced --output-dir ./abliterated-models

# With 4-bit quantization (saves VRAM)
obliteratus obliterate <model_name> --method advanced --quantization 4bit --output-dir ./abliterated-models

# Large models (70B+) — conservative defaults
obliteratus obliterate <model_name> --method advanced --quantization 4bit --large-model --output-dir ./abliterated-models
```

### Fine-tuning parameters
```bash
obliteratus obliterate <model_name> \
  --method advanced \
  --direction-method diff_means \
  --n-directions 4 \
  --refinement-passes 2 \
  --regularization 0.1 \
  --quantization 4bit \
  --output-dir ./abliterated-models \
  --contribute  # opt-in telemetry for community research
```

### Key flags
| Flag | Description | Default |
|:-----|:------------|:--------|
| `--method` | Abliteration method | advanced |
| `--direction-method` | Direction extraction | diff_means |
| `--n-directions` | Number of refusal directions (1-32) | method-dependent |
| `--refinement-passes` | Iterative passes (1-5) | 2 |
| `--regularization` | Regularization strength (0.0-1.0) | 0.1 |
| `--quantization` | Load in 4bit or 8bit | none (full precision) |
| `--large-model` | Conservative defaults for 120B+ | false |
| `--output-dir` | Where to save the abliterated model | ./obliterated_model |
| `--contribute` | Share anonymized results for research | false |
| `--verify-sample-size` | Number of test prompts for refusal check | 20 |
| `--dtype` | Model dtype (float16, bfloat16) | auto |

### Other execution modes
```bash
# Interactive guided mode (hardware → model → preset)
obliteratus interactive

# Web UI (Gradio)
obliteratus ui --port 7860

# Run a full ablation study from YAML config
obliteratus run config.yaml --preset quick

# Tournament: pit all methods against each other
obliteratus tourney <model_name>
```

## Step 6: Verify Results

After abliteration, check the output metrics:

| Metric | Good Value | Warning |
|:-------|:-----------|:--------|
| Refusal rate | < 5% (ideally ~0%) | > 10% means refusals persist |
| Perplexity change | < 10% increase | > 15% means coherence damage |
| KL divergence | < 0.1 | > 0.5 means significant distribution shift |
| Coherence | High / passes qualitative check | Degraded responses, repetition |

### If refusals persist (> 10%)
1. Try `aggressive` method
2. Increase `--n-directions` (e.g., 8 or 16)
3. Add `--refinement-passes 3`
4. Try `--direction-method svd` instead of diff_means

### If coherence is damaged (perplexity > 15% increase)
1. Reduce `--n-directions` (try 2)
2. Increase `--regularization` (try 0.3)
3. Reduce `--refinement-passes` to 1
4. Try `basic` method (gentler)

## Step 7: Use the Abliterated Model

The output is a standard HuggingFace model directory.

```bash
# Test locally with transformers
python3 -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained('./abliterated-models/<model>')
tokenizer = AutoTokenizer.from_pretrained('./abliterated-models/<model>')
inputs = tokenizer('How do I pick a lock?', return_tensors='pt')
outputs = model.generate(**inputs, max_new_tokens=200)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
"

# Upload to HuggingFace Hub
huggingface-cli upload <username>/<model-name>-abliterated ./abliterated-models/<model>

# Serve with vLLM
vllm serve ./abliterated-models/<model>
```

## CLI Command Reference

| Command | Description |
|:--------|:------------|
| `obliteratus obliterate` | Main abliteration command |
| `obliteratus info <model>` | Print model architecture details |
| `obliteratus models --tier <tier>` | Browse curated models by compute tier |
| `obliteratus recommend <model>` | Telemetry-driven method/param suggestion |
| `obliteratus interactive` | Guided setup wizard |
| `obliteratus tourney <model>` | Tournament: all methods head-to-head |
| `obliteratus run <config.yaml>` | Execute ablation study from YAML |
| `obliteratus strategies` | List all registered ablation strategies |
| `obliteratus report <results.json>` | Regenerate visual reports |
| `obliteratus ui` | Launch Gradio web interface |
| `obliteratus aggregate` | Summarize community telemetry data |

## Analysis Modules

OBLITERATUS includes 28 analysis modules for mechanistic interpretability.
See `skill_view(name="obliteratus", file_path="references/analysis-modules.md")` for the full reference.

### Quick analysis commands
```bash
# Run specific analysis modules
obliteratus run analysis-config.yaml --preset quick

# Key modules to run first:
# - alignment_imprint: Fingerprint DPO/RLHF/CAI/SFT alignment method
# - concept_geometry: Single direction vs polyhedral cone
# - logit_lens: Which layer decides to refuse
# - anti_ouroboros: Self-repair risk score
# - causal_tracing: Causally necessary components
```

### Steering Vectors (Reversible Alternative)
Instead of permanent weight modification, use inference-time steering:
```python
# Python API only — for user's own projects
from obliteratus.analysis.steering_vectors import SteeringVectorFactory, SteeringHookManager
```

## Ablation Strategies

Beyond direction-based abliteration, OBLITERATUS includes structural ablation strategies:
- **Embedding Ablation** — Target embedding layer components
- **FFN Ablation** — Feed-forward network block removal
- **Head Pruning** — Attention head pruning
- **Layer Removal** — Full layer removal

List all available: `obliteratus strategies`

## Evaluation

OBLITERATUS includes built-in evaluation tools:
- Refusal rate benchmarking
- Perplexity comparison (before/after)
- LM Eval Harness integration for academic benchmarks
- Head-to-head competitor comparison
- Baseline performance tracking

## Platform Support

- **CUDA** — Full support (NVIDIA GPUs)
- **Apple Silicon (MLX)** — Supported via MLX backend
- **CPU** — Supported for tiny models (< 1B params)

## YAML Config Templates

Load templates for reproducible runs via `skill_view`:
- `templates/abliteration-config.yaml` — Standard single-model config
- `templates/analysis-study.yaml` — Pre-abliteration analysis study
- `templates/batch-abliteration.yaml` — Multi-model batch processing

## Telemetry

OBLITERATUS can optionally contribute anonymized run data to a global research dataset.
Enable with `--contribute` flag. No personal data is collected — only model name, method, metrics.

## Common Pitfalls

1. **Don't use `informed` as default** — it's experimental and slower. Use `advanced` for reliable results.
2. **Models under ~1B respond poorly to abliteration** — their refusal behaviors are shallow and fragmented, making clean direction extraction difficult. Expect partial results (20-40% remaining refusal). Models 3B+ have cleaner refusal directions and respond much better (often 0% refusal with `advanced`).
3. **`aggressive` can make things worse** — on small models it can damage coherence and actually increase refusal rate. Only use it if `advanced` leaves > 10% refusals on a 3B+ model.
4. **Always check perplexity** — if it spikes > 15%, the model is damaged. Reduce aggressiveness.
5. **MoE models need special handling** — use `nuclear` method for Mixtral, DeepSeek-MoE, etc.
6. **Quantized models can't be re-quantized** — abliterate the full-precision model, then quantize the output.
7. **VRAM estimation is approximate** — 4-bit quant helps but peak usage can spike during extraction.
8. **Reasoning models are sensitive** — use `surgical` for R1 distills to preserve chain-of-thought.
9. **Check `obliteratus recommend`** — telemetry data may have better parameters than defaults.
10. **AGPL license** — never `import obliteratus` in MIT/Apache projects. CLI invocation only.
11. **Large models (70B+)** — always use `--large-model` flag for conservative defaults.
12. **Spectral certification RED is common** — the spectral check often flags "incomplete" even when practical refusal rate is 0%. Check actual refusal rate rather than relying on spectral certification alone.

## Complementary Skills

- **vllm** — Serve abliterated models with high throughput
- **gguf** — Convert abliterated models to GGUF for llama.cpp
- **huggingface-tokenizers** — Work with model tokenizers
