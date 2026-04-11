# Reward Modeling

Guide to training reward models with TRL for RLHF pipelines.

## Overview

Reward models score completions based on human preferences. Used in:
- PPO training (RL feedback)
- GRPO online RL
- Completion ranking

## Basic Training

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from trl import RewardTrainer, RewardConfig
from datasets import load_dataset

# Load model (num_labels=1 for single reward score)
model = AutoModelForSequenceClassification.from_pretrained(
    "Qwen/Qwen2.5-0.5B-Instruct",
    num_labels=1
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")

# Load preference dataset (chosen/rejected pairs)
dataset = load_dataset("trl-lib/ultrafeedback_binarized", split="train")

# Configure
config = RewardConfig(
    output_dir="Qwen2.5-Reward",
    per_device_train_batch_size=2,
    num_train_epochs=1,
    learning_rate=1e-5
)

# Train
trainer = RewardTrainer(
    model=model,
    args=config,
    processing_class=tokenizer,
    train_dataset=dataset
)
trainer.train()
```

## Dataset Format

Required fields:
```json
{
  "prompt": "Question or instruction",
  "chosen": "Better response",
  "rejected": "Worse response"
}
```

## Bradley-Terry Loss

Default loss function:
```
loss = -log(sigmoid(reward_chosen - reward_rejected))
```

Learns to score chosen > rejected.

## Using Reward Models

### Inference

```python
from transformers import pipeline

# Load trained reward model
reward_pipe = pipeline("text-classification", model="Qwen2.5-Reward")

# Score completions
texts = ["Good answer", "Bad answer"]
scores = reward_pipe(texts)
print(scores)  # Higher score = better
```

### In PPO

```python
from trl import PPOTrainer, PPOConfig

config = PPOConfig(
    reward_model_path="Qwen2.5-Reward"  # Use trained reward model
)

trainer = PPOTrainer(
    model=policy_model,
    config=config,
    # Reward model loaded automatically
)
```

## Hyperparameters

| Model Size | Learning Rate | Batch Size | Epochs |
|------------|---------------|------------|--------|
| <1B | 2e-5 | 4-8 | 1-2 |
| 1-7B | 1e-5 | 2-4 | 1 |
| 7-13B | 5e-6 | 1-2 | 1 |

## Evaluation

Check reward separation:
```python
# Chosen should score higher than rejected
chosen_rewards = model(**chosen_inputs).logits
rejected_rewards = model(**rejected_inputs).logits

accuracy = (chosen_rewards > rejected_rewards).float().mean()
print(f"Accuracy: {accuracy:.2%}")  # Target: >80%
```

## References

- InstructGPT paper: https://arxiv.org/abs/2203.02155
- TRL docs: https://huggingface.co/docs/trl/reward_trainer
