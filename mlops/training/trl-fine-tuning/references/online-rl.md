# Online RL Methods

Guide to online reinforcement learning with PPO, GRPO, RLOO, and OnlineDPO.

## Overview

Online RL generates completions during training and optimizes based on rewards.

## PPO (Proximal Policy Optimization)

Classic RL algorithm for LLM alignment.

### Basic Usage

```bash
python -m trl.scripts.ppo \
    --model_name_or_path Qwen/Qwen2.5-0.5B-Instruct \
    --reward_model_path reward-model \
    --dataset_name trl-internal-testing/descriptiveness-sentiment-trl-style \
    --output_dir model-ppo \
    --learning_rate 3e-6 \
    --per_device_train_batch_size 64 \
    --total_episodes 10000 \
    --num_ppo_epochs 4 \
    --kl_coef 0.05
```

### Key Parameters

- `kl_coef`: KL penalty (0.05-0.2)
- `num_ppo_epochs`: Epochs per batch (2-4)
- `cliprange`: PPO clip (0.1-0.3)
- `vf_coef`: Value function coef (0.1)

## GRPO (Group Relative Policy Optimization)

Memory-efficient online RL.

### Basic Usage

```python
from trl import GRPOTrainer, GRPOConfig
from datasets import load_dataset

# Define reward function
def reward_func(completions, **kwargs):
    return [len(set(c.split())) for c in completions]

config = GRPOConfig(
    output_dir="model-grpo",
    num_generations=4,  # Completions per prompt
    max_new_tokens=128
)

trainer = GRPOTrainer(
    model="Qwen/Qwen2-0.5B-Instruct",
    reward_funcs=reward_func,
    args=config,
    train_dataset=load_dataset("trl-lib/tldr", split="train")
)
trainer.train()
```

### Key Parameters

- `num_generations`: 2-8 completions
- `max_new_tokens`: 64-256
- Learning rate: 1e-5 to 1e-4

## Memory Comparison

| Method | Memory (7B) | Speed | Use Case |
|--------|-------------|-------|----------|
| PPO | 40GB | Medium | Maximum control |
| GRPO | 24GB | Fast | **Memory-constrained** |
| OnlineDPO | 28GB | Fast | No reward model |

## References

- PPO paper: https://arxiv.org/abs/1707.06347
- GRPO paper: https://arxiv.org/abs/2402.03300
- TRL docs: https://huggingface.co/docs/trl/
