# DPO Variants

Complete guide to Direct Preference Optimization loss variants in TRL.

## Overview

DPO optimizes models using preference data (chosen/rejected pairs). TRL supports 10+ loss variants for different scenarios.

## Loss Types

### 1. Sigmoid (Standard DPO)

**Formula**: `-log(sigmoid(β * logits))`

**When to use**: Default choice, general preference alignment

**Config**:
```python
DPOConfig(
    loss_type="sigmoid",
    beta=0.1,  # KL penalty
    per_device_train_batch_size=64,
    learning_rate=1e-6
)
```

### 2. IPO (Identity Policy Optimization)

**Formula**: `(logits - 1/(2β))²`

**When to use**: Better theoretical foundation, reduce overfitting

**Config**:
```python
DPOConfig(
    loss_type="ipo",
    beta=0.1,
    per_device_train_batch_size=90,
    learning_rate=1e-2
)
```

### 3. Hinge (SLiC)

**Formula**: `ReLU(1 - β * logits)`

**When to use**: Margin-based objective

**Config**:
```python
DPOConfig(
    loss_type="hinge",
    beta=0.1,
    per_device_train_batch_size=512,
    learning_rate=1e-4
)
```

### 4. Robust DPO

**Formula**: Sigmoid with label smoothing for noise robustness

**When to use**: Noisy preference labels

**Config**:
```python
DPOConfig(
    loss_type="robust",
    beta=0.01,
    label_smoothing=0.1,  # Noise probability
    per_device_train_batch_size=16,
    learning_rate=1e-3,
    max_prompt_length=128,
    max_length=512
)
```

### 5. BCO Pair (Binary Classification)

**Formula**: Train binary classifier (chosen=1, rejected=0)

**When to use**: Pairwise preference data

**Config**:
```python
DPOConfig(
    loss_type="bco_pair",
    beta=0.01,
    per_device_train_batch_size=128,
    learning_rate=5e-7,
    max_prompt_length=1536,
    max_completion_length=512
)
```

### 6. SPPO Hard

**Formula**: Push chosen→0.5, rejected→-0.5

**When to use**: Nash equilibrium, sparse data

**Config**:
```python
DPOConfig(
    loss_type="sppo_hard",
    beta=0.1
)
```

### 7. DiscoPOP

**Formula**: Log-Ratio Modulated Loss

**When to use**: Automated loss discovery

**Config**:
```python
DPOConfig(
    loss_type="discopop",
    beta=0.05,
    discopop_tau=0.05,
    per_device_train_batch_size=64,
    learning_rate=5e-7
)
```

### 8. APO Zero

**Formula**: Increase chosen, decrease rejected likelihood

**When to use**: Model worse than winning outputs

**Config**:
```python
DPOConfig(
    loss_type="apo_zero",
    beta=0.1,
    per_device_train_batch_size=64,
    learning_rate=2e-7,
    max_prompt_length=512,
    max_completion_length=512
)
```

### 9. APO Down

**Formula**: Decrease both, emphasize rejected reduction

**When to use**: Model better than winning outputs

**Config**:
```python
DPOConfig(
    loss_type="apo_down",
    beta=0.1,
    # Same hyperparameters as apo_zero
)
```

### 10. AOT & AOT Pair

**Formula**: Distributional alignment via stochastic dominance

**When to use**:
- `aot_pair`: Paired preference data
- `aot`: Unpaired data

**Config**:
```python
DPOConfig(
    loss_type="aot_pair",  # or "aot"
    beta=0.1,
    label_smoothing=0.0
)
```

## Multi-Loss Training

Combine multiple losses:

```python
DPOConfig(
    loss_type=["sigmoid", "ipo"],
    loss_weights=[0.7, 0.3],  # Weighted combination
    beta=0.1
)
```

## Key Parameters

### Beta (β)

Controls deviation from reference model:
- **Higher** (0.5): More conservative, stays close to reference
- **Lower** (0.01): More aggressive alignment
- **Default**: 0.1

### Label Smoothing

For robust DPO:
- **0.0**: No smoothing (default)
- **0.1-0.3**: Moderate noise robustness
- **0.5**: Maximum noise tolerance

### Max Lengths

- `max_prompt_length`: 128-1536
- `max_completion_length`: 128-512
- `max_length`: Total sequence (1024-2048)

## Comparison Table

| Loss | Speed | Stability | Best For |
|------|-------|-----------|----------|
| Sigmoid | Fast | Good | **General use** |
| IPO | Fast | Better | Overfitting issues |
| Hinge | Fast | Good | Margin objectives |
| Robust | Fast | Best | Noisy data |
| BCO | Medium | Good | Binary classification |
| DiscoPOP | Fast | Good | New architectures |
| APO | Fast | Good | Model quality matching |

## References

- DPO paper: https://arxiv.org/abs/2305.18290
- IPO paper: https://arxiv.org/abs/2310.12036
- TRL docs: https://huggingface.co/docs/trl/dpo_trainer
