---
name: fine-tuning-with-trl
description: Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward optimization, and reward model training. Use when need RLHF, align model with preferences, or train from human feedback. Works with HuggingFace Transformers.
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [trl, transformers, datasets, peft, accelerate, torch]
metadata:
  hermes:
    tags: [Post-Training, TRL, Reinforcement Learning, Fine-Tuning, SFT, DPO, PPO, GRPO, RLHF, Preference Alignment, HuggingFace]

---

# TRL - Transformer Reinforcement Learning

## Quick start

TRL provides post-training methods for aligning language models with human preferences.

**Installation**:
```bash
pip install trl transformers datasets peft accelerate
```

**Supervised Fine-Tuning** (instruction tuning):
```python
from trl import SFTTrainer

trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B",
    train_dataset=dataset,  # Prompt-completion pairs
)
trainer.train()
```

**DPO** (align with preferences):
```python
from trl import DPOTrainer, DPOConfig

config = DPOConfig(output_dir="model-dpo", beta=0.1)
trainer = DPOTrainer(
    model=model,
    args=config,
    train_dataset=preference_dataset,  # chosen/rejected pairs
    processing_class=tokenizer
)
trainer.train()
```

## Common workflows

### Workflow 1: Full RLHF pipeline (SFT → Reward Model → PPO)

Complete pipeline from base model to human-aligned model.

Copy this checklist:

```
RLHF Training:
- [ ] Step 1: Supervised fine-tuning (SFT)
- [ ] Step 2: Train reward model
- [ ] Step 3: PPO reinforcement learning
- [ ] Step 4: Evaluate aligned model
```

**Step 1: Supervised fine-tuning**

Train base model on instruction-following data:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

# Load model
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B")

# Load instruction dataset
dataset = load_dataset("trl-lib/Capybara", split="train")

# Configure training
training_args = SFTConfig(
    output_dir="Qwen2.5-0.5B-SFT",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=2e-5,
    logging_steps=10,
    save_strategy="epoch"
)

# Train
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    tokenizer=tokenizer
)
trainer.train()
trainer.save_model()
```

**Step 2: Train reward model**

Train model to predict human preferences:

```python
from transformers import AutoModelForSequenceClassification
from trl import RewardTrainer, RewardConfig

# Load SFT model as base
model = AutoModelForSequenceClassification.from_pretrained(
    "Qwen2.5-0.5B-SFT",
    num_labels=1  # Single reward score
)
tokenizer = AutoTokenizer.from_pretrained("Qwen2.5-0.5B-SFT")

# Load preference data (chosen/rejected pairs)
dataset = load_dataset("trl-lib/ultrafeedback_binarized", split="train")

# Configure training
training_args = RewardConfig(
    output_dir="Qwen2.5-0.5B-Reward",
    per_device_train_batch_size=2,
    num_train_epochs=1,
    learning_rate=1e-5
)

# Train reward model
trainer = RewardTrainer(
    model=model,
    args=training_args,
    processing_class=tokenizer,
    train_dataset=dataset
)
trainer.train()
trainer.save_model()
```

**Step 3: PPO reinforcement learning**

Optimize policy using reward model:

```bash
python -m trl.scripts.ppo \
    --model_name_or_path Qwen2.5-0.5B-SFT \
    --reward_model_path Qwen2.5-0.5B-Reward \
    --dataset_name trl-internal-testing/descriptiveness-sentiment-trl-style \
    --output_dir Qwen2.5-0.5B-PPO \
    --learning_rate 3e-6 \
    --per_device_train_batch_size 64 \
    --total_episodes 10000
```

**Step 4: Evaluate**

```python
from transformers import pipeline

# Load aligned model
generator = pipeline("text-generation", model="Qwen2.5-0.5B-PPO")

# Test
prompt = "Explain quantum computing to a 10-year-old"
output = generator(prompt, max_length=200)[0]["generated_text"]
print(output)
```

### Workflow 2: Simple preference alignment with DPO

Align model with preferences without reward model.

Copy this checklist:

```
DPO Training:
- [ ] Step 1: Prepare preference dataset
- [ ] Step 2: Configure DPO
- [ ] Step 3: Train with DPOTrainer
- [ ] Step 4: Evaluate alignment
```

**Step 1: Prepare preference dataset**

Dataset format:
```json
{
  "prompt": "What is the capital of France?",
  "chosen": "The capital of France is Paris.",
  "rejected": "I don't know."
}
```

Load dataset:
```python
from datasets import load_dataset

dataset = load_dataset("trl-lib/ultrafeedback_binarized", split="train")
# Or load your own
# dataset = load_dataset("json", data_files="preferences.json")
```

**Step 2: Configure DPO**

```python
from trl import DPOConfig

config = DPOConfig(
    output_dir="Qwen2.5-0.5B-DPO",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=5e-7,
    beta=0.1,  # KL penalty strength
    max_prompt_length=512,
    max_length=1024,
    logging_steps=10
)
```

**Step 3: Train with DPOTrainer**

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import DPOTrainer

model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")

trainer = DPOTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    processing_class=tokenizer
)

trainer.train()
trainer.save_model()
```

**CLI alternative**:
```bash
trl dpo \
    --model_name_or_path Qwen/Qwen2.5-0.5B-Instruct \
    --dataset_name argilla/Capybara-Preferences \
    --output_dir Qwen2.5-0.5B-DPO \
    --per_device_train_batch_size 4 \
    --learning_rate 5e-7 \
    --beta 0.1
```

### Workflow 3: Memory-efficient online RL with GRPO

Train with reinforcement learning using minimal memory.

Copy this checklist:

```
GRPO Training:
- [ ] Step 1: Define reward function
- [ ] Step 2: Configure GRPO
- [ ] Step 3: Train with GRPOTrainer
```

**Step 1: Define reward function**

```python
def reward_function(completions, **kwargs):
    """
    Compute rewards for completions.

    Args:
        completions: List of generated texts

    Returns:
        List of reward scores (floats)
    """
    rewards = []
    for completion in completions:
        # Example: reward based on length and unique words
        score = len(completion.split())  # Favor longer responses
        score += len(set(completion.lower().split()))  # Reward unique words
        rewards.append(score)
    return rewards
```

Or use a reward model:
```python
from transformers import pipeline

reward_model = pipeline("text-classification", model="reward-model-path")

def reward_from_model(completions, prompts, **kwargs):
    # Combine prompt + completion
    full_texts = [p + c for p, c in zip(prompts, completions)]
    # Get reward scores
    results = reward_model(full_texts)
    return [r["score"] for r in results]
```

**Step 2: Configure GRPO**

```python
from trl import GRPOConfig

config = GRPOConfig(
    output_dir="Qwen2-GRPO",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=1e-5,
    num_generations=4,  # Generate 4 completions per prompt
    max_new_tokens=128
)
```

**Step 3: Train with GRPOTrainer**

```python
from datasets import load_dataset
from trl import GRPOTrainer

# Load prompt-only dataset
dataset = load_dataset("trl-lib/tldr", split="train")

trainer = GRPOTrainer(
    model="Qwen/Qwen2-0.5B-Instruct",
    reward_funcs=reward_function,  # Your reward function
    args=config,
    train_dataset=dataset
)

trainer.train()
```

**CLI**:
```bash
trl grpo \
    --model_name_or_path Qwen/Qwen2-0.5B-Instruct \
    --dataset_name trl-lib/tldr \
    --output_dir Qwen2-GRPO \
    --num_generations 4
```

## When to use vs alternatives

**Use TRL when:**
- Need to align model with human preferences
- Have preference data (chosen/rejected pairs)
- Want to use reinforcement learning (PPO, GRPO)
- Need reward model training
- Doing RLHF (full pipeline)

**Method selection**:
- **SFT**: Have prompt-completion pairs, want basic instruction following
- **DPO**: Have preferences, want simple alignment (no reward model needed)
- **PPO**: Have reward model, need maximum control over RL
- **GRPO**: Memory-constrained, want online RL
- **Reward Model**: Building RLHF pipeline, need to score generations

**Use alternatives instead:**
- **HuggingFace Trainer**: Basic fine-tuning without RL
- **Axolotl**: YAML-based training configuration
- **LitGPT**: Educational, minimal fine-tuning
- **Unsloth**: Fast LoRA training

## Common issues

**Issue: OOM during DPO training**

Reduce batch size and sequence length:
```python
config = DPOConfig(
    per_device_train_batch_size=1,  # Reduce from 4
    max_length=512,  # Reduce from 1024
    gradient_accumulation_steps=8  # Maintain effective batch
)
```

Or use gradient checkpointing:
```python
model.gradient_checkpointing_enable()
```

**Issue: Poor alignment quality**

Tune beta parameter:
```python
# Higher beta = more conservative (stays closer to reference)
config = DPOConfig(beta=0.5)  # Default 0.1

# Lower beta = more aggressive alignment
config = DPOConfig(beta=0.01)
```

**Issue: Reward model not learning**

Check loss type and learning rate:
```python
config = RewardConfig(
    learning_rate=1e-5,  # Try different LR
    num_train_epochs=3  # Train longer
)
```

Ensure preference dataset has clear winners:
```python
# Verify dataset
print(dataset[0])
# Should have clear chosen > rejected
```

**Issue: PPO training unstable**

Adjust KL coefficient:
```python
config = PPOConfig(
    kl_coef=0.1,  # Increase from 0.05
    cliprange=0.1  # Reduce from 0.2
)
```

## Advanced topics

**SFT training guide**: See [references/sft-training.md](references/sft-training.md) for dataset formats, chat templates, packing strategies, and multi-GPU training.

**DPO variants**: See [references/dpo-variants.md](references/dpo-variants.md) for IPO, cDPO, RPO, and other DPO loss functions with recommended hyperparameters.

**Reward modeling**: See [references/reward-modeling.md](references/reward-modeling.md) for outcome vs process rewards, Bradley-Terry loss, and reward model evaluation.

**Online RL methods**: See [references/online-rl.md](references/online-rl.md) for PPO, GRPO, RLOO, and OnlineDPO with detailed configurations.

## Hardware requirements

- **GPU**: NVIDIA (CUDA required)
- **VRAM**: Depends on model and method
  - SFT 7B: 16GB (with LoRA)
  - DPO 7B: 24GB (stores reference model)
  - PPO 7B: 40GB (policy + reward model)
  - GRPO 7B: 24GB (more memory efficient)
- **Multi-GPU**: Supported via `accelerate`
- **Mixed precision**: BF16 recommended (A100/H100)

**Memory optimization**:
- Use LoRA/QLoRA for all methods
- Enable gradient checkpointing
- Use smaller batch sizes with gradient accumulation

## Resources

- Docs: https://huggingface.co/docs/trl/
- GitHub: https://github.com/huggingface/trl
- Papers:
  - "Training language models to follow instructions with human feedback" (InstructGPT, 2022)
  - "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (DPO, 2023)
  - "Group Relative Policy Optimization" (GRPO, 2024)
- Examples: https://github.com/huggingface/trl/tree/main/examples/scripts



