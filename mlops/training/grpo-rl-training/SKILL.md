---
name: grpo-rl-training
description: Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [transformers>=4.47.0, trl>=0.14.0, datasets>=3.2.0, peft>=0.14.0, torch]
metadata:
  hermes:
    tags: [Post-Training, Reinforcement Learning, GRPO, TRL, RLHF, Reward Modeling, Reasoning, DPO, PPO, Structured Output]

---

# GRPO/RL Training with TRL

Expert-level guidance for implementing Group Relative Policy Optimization (GRPO) using the Transformer Reinforcement Learning (TRL) library. This skill provides battle-tested patterns, critical insights, and production-ready workflows for fine-tuning language models with custom reward functions.

## When to Use This Skill

Use GRPO training when you need to:
- **Enforce specific output formats** (e.g., XML tags, JSON, structured reasoning)
- **Teach verifiable tasks** with objective correctness metrics (math, coding, fact-checking)
- **Improve reasoning capabilities** by rewarding chain-of-thought patterns
- **Align models to domain-specific behaviors** without labeled preference data
- **Optimize for multiple objectives** simultaneously (format + correctness + style)

**Do NOT use GRPO for:**
- Simple supervised fine-tuning tasks (use SFT instead)
- Tasks without clear reward signals
- When you already have high-quality preference pairs (use DPO/PPO instead)

---

## Core Concepts

### 1. GRPO Algorithm Fundamentals

**Key Mechanism:**
- Generates **multiple completions** for each prompt (group size: 4-16)
- Compares completions within each group using reward functions
- Updates policy to favor higher-rewarded responses relative to the group

**Critical Difference from PPO:**
- No separate reward model needed
- More sample-efficient (learns from within-group comparisons)
- Simpler to implement and debug

**Mathematical Intuition:**
```
For each prompt p:
  1. Generate N completions: {c₁, c₂, ..., cₙ}
  2. Compute rewards: {r₁, r₂, ..., rₙ}
  3. Learn to increase probability of high-reward completions
     relative to low-reward ones in the same group
```

### 2. Reward Function Design Philosophy

**Golden Rules:**
1. **Compose multiple reward functions** - Each handles one aspect (format, correctness, style)
2. **Scale rewards appropriately** - Higher weight = stronger signal
3. **Use incremental rewards** - Partial credit for partial compliance
4. **Test rewards independently** - Debug each reward function in isolation

**Reward Function Types:**

| Type | Use Case | Example Weight |
|------|----------|----------------|
| **Correctness** | Verifiable tasks (math, code) | 2.0 (highest) |
| **Format** | Strict structure enforcement | 0.5-1.0 |
| **Length** | Encourage verbosity/conciseness | 0.1-0.5 |
| **Style** | Penalize unwanted patterns | -0.5 to 0.5 |

---

## Implementation Workflow

### Step 1: Dataset Preparation

**Critical Requirements:**
- Prompts in chat format (list of dicts with 'role' and 'content')
- Include system prompts to set expectations
- For verifiable tasks, include ground truth answers as additional columns

**Example Structure:**
```python
from datasets import load_dataset, Dataset

SYSTEM_PROMPT = """
Respond in the following format:
<reasoning>
[Your step-by-step thinking]
</reasoning>
<answer>
[Final answer]
</answer>
"""

def prepare_dataset(raw_data):
    """
    Transform raw data into GRPO-compatible format.

    Returns: Dataset with columns:
    - 'prompt': List[Dict] with role/content (system + user messages)
    - 'answer': str (ground truth, optional but recommended)
    """
    return raw_data.map(lambda x: {
        'prompt': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': x['question']}
        ],
        'answer': extract_answer(x['raw_answer'])
    })
```

**Pro Tips:**
- Use one-shot or few-shot examples in system prompt for complex formats
- Keep prompts concise (max_prompt_length: 256-512 tokens)
- Validate data quality before training (garbage in = garbage out)

### Step 2: Reward Function Implementation

**Template Structure:**
```python
def reward_function_name(
    prompts,        # List[List[Dict]]: Original prompts
    completions,    # List[List[Dict]]: Model generations
    answer=None,    # Optional: Ground truth from dataset
    **kwargs        # Additional dataset columns
) -> list[float]:
    """
    Evaluate completions and return rewards.

    Returns: List of floats (one per completion)
    """
    # Extract completion text
    responses = [comp[0]['content'] for comp in completions]

    # Compute rewards
    rewards = []
    for response in responses:
        score = compute_score(response)
        rewards.append(score)

    return rewards
```

**Example 1: Correctness Reward (Math/Coding)**
```python
def correctness_reward(prompts, completions, answer, **kwargs):
    """Reward correct answers with high score."""
    responses = [comp[0]['content'] for comp in completions]
    extracted = [extract_final_answer(r) for r in responses]
    return [2.0 if ans == gt else 0.0
            for ans, gt in zip(extracted, answer)]
```

**Example 2: Format Reward (Structured Output)**
```python
import re

def format_reward(completions, **kwargs):
    """Reward XML-like structured format."""
    pattern = r'<reasoning>.*?</reasoning>\s*<answer>.*?</answer>'
    responses = [comp[0]['content'] for comp in completions]
    return [1.0 if re.search(pattern, r, re.DOTALL) else 0.0
            for r in responses]
```

**Example 3: Incremental Format Reward (Partial Credit)**
```python
def incremental_format_reward(completions, **kwargs):
    """Award partial credit for format compliance."""
    responses = [comp[0]['content'] for comp in completions]
    rewards = []

    for r in responses:
        score = 0.0
        if '<reasoning>' in r:
            score += 0.25
        if '</reasoning>' in r:
            score += 0.25
        if '<answer>' in r:
            score += 0.25
        if '</answer>' in r:
            score += 0.25
        # Penalize extra text after closing tag
        if r.count('</answer>') == 1:
            extra_text = r.split('</answer>')[-1].strip()
            score -= len(extra_text) * 0.001
        rewards.append(score)

    return rewards
```

**Critical Insight:**
Combine 3-5 reward functions for robust training. Order matters less than diversity of signals.

### Step 3: Training Configuration

**Memory-Optimized Config (Small GPU)**
```python
from trl import GRPOConfig

training_args = GRPOConfig(
    output_dir="outputs/grpo-model",

    # Learning rate
    learning_rate=5e-6,          # Lower = more stable
    adam_beta1=0.9,
    adam_beta2=0.99,
    weight_decay=0.1,
    warmup_ratio=0.1,
    lr_scheduler_type='cosine',

    # Batch settings
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,  # Effective batch = 4

    # GRPO-specific
    num_generations=8,            # Group size: 8-16 recommended
    max_prompt_length=256,
    max_completion_length=512,

    # Training duration
    num_train_epochs=1,
    max_steps=None,               # Or set fixed steps (e.g., 500)

    # Optimization
    bf16=True,                    # Faster on A100/H100
    optim="adamw_8bit",          # Memory-efficient optimizer
    max_grad_norm=0.1,

    # Logging
    logging_steps=1,
    save_steps=100,
    report_to="wandb",            # Or "none" for no logging
)
```

**High-Performance Config (Large GPU)**
```python
training_args = GRPOConfig(
    output_dir="outputs/grpo-model",
    learning_rate=1e-5,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    num_generations=16,           # Larger groups = better signal
    max_prompt_length=512,
    max_completion_length=1024,
    num_train_epochs=1,
    bf16=True,
    use_vllm=True,                # Fast generation with vLLM
    logging_steps=10,
)
```

**Critical Hyperparameters:**

| Parameter | Impact | Tuning Advice |
|-----------|--------|---------------|
| `num_generations` | Group size for comparison | Start with 8, increase to 16 if GPU allows |
| `learning_rate` | Convergence speed/stability | 5e-6 (safe), 1e-5 (faster, riskier) |
| `max_completion_length` | Output verbosity | Match your task (512 for reasoning, 256 for short answers) |
| `gradient_accumulation_steps` | Effective batch size | Increase if GPU memory limited |

### Step 4: Model Setup and Training

**Standard Setup (Transformers)**
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig
from trl import GRPOTrainer

# Load model
model_name = "Qwen/Qwen2.5-1.5B-Instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    attn_implementation="flash_attention_2",  # 2-3x faster
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Optional: LoRA for parameter-efficient training
peft_config = LoraConfig(
    r=16,                         # Rank (higher = more capacity)
    lora_alpha=32,               # Scaling factor (typically 2*r)
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    task_type="CAUSAL_LM",
    lora_dropout=0.05,
)

# Initialize trainer
trainer = GRPOTrainer(
    model=model,
    processing_class=tokenizer,
    reward_funcs=[
        incremental_format_reward,
        format_reward,
        correctness_reward,
    ],
    args=training_args,
    train_dataset=dataset,
    peft_config=peft_config,      # Remove for full fine-tuning
)

# Train
trainer.train()

# Save
trainer.save_model("final_model")
```

**Unsloth Setup (2-3x Faster)**
```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="google/gemma-3-1b-it",
    max_seq_length=1024,
    load_in_4bit=True,
    fast_inference=True,
    max_lora_rank=32,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_alpha=32,
    use_gradient_checkpointing="unsloth",
)

# Rest is identical to standard setup
trainer = GRPOTrainer(model=model, ...)
trainer.train()
```

---

## Critical Training Insights

### 1. Loss Behavior (EXPECTED PATTERN)
- **Loss starts near 0 and INCREASES during training**
- This is CORRECT - loss measures KL divergence from initial policy
- Model is learning (diverging from original behavior to optimize rewards)
- Monitor reward metrics instead of loss for progress

### 2. Reward Tracking
Key metrics to watch:
- `reward`: Average across all completions
- `reward_std`: Diversity within groups (should remain > 0)
- `kl`: KL divergence from reference (should grow moderately)

**Healthy Training Pattern:**
```
Step   Reward    Reward_Std   KL
100    0.5       0.3          0.02
200    0.8       0.25         0.05
300    1.2       0.2          0.08  ← Good progression
400    1.5       0.15         0.12
```

**Warning Signs:**
- Reward std → 0 (model collapsing to single response)
- KL exploding (> 0.5) (diverging too much, reduce LR)
- Reward stuck (reward functions too harsh or model capacity issue)

### 3. Common Pitfalls and Solutions

| Problem | Symptom | Solution |
|---------|---------|----------|
| **Mode collapse** | All completions identical | Increase `num_generations`, add diversity penalty |
| **No learning** | Flat rewards | Check reward function logic, increase LR |
| **OOM errors** | GPU memory exceeded | Reduce `num_generations`, enable gradient checkpointing |
| **Slow training** | < 1 it/s | Enable `use_vllm=True`, use Unsloth, reduce seq length |
| **Format ignored** | Model doesn't follow structure | Increase format reward weight, add incremental rewards |

---

## Advanced Patterns

### 1. Multi-Stage Training
For complex tasks, train in stages:

```python
# Stage 1: Format compliance (epochs=1)
trainer_stage1 = GRPOTrainer(
    model=model,
    reward_funcs=[incremental_format_reward, format_reward],
    ...
)
trainer_stage1.train()

# Stage 2: Correctness (epochs=1)
trainer_stage2 = GRPOTrainer(
    model=model,
    reward_funcs=[format_reward, correctness_reward],
    ...
)
trainer_stage2.train()
```

### 2. Adaptive Reward Scaling
```python
class AdaptiveReward:
    def __init__(self, base_reward_func, initial_weight=1.0):
        self.func = base_reward_func
        self.weight = initial_weight

    def __call__(self, *args, **kwargs):
        rewards = self.func(*args, **kwargs)
        return [r * self.weight for r in rewards]

    def adjust_weight(self, success_rate):
        """Increase weight if model struggling, decrease if succeeding."""
        if success_rate < 0.3:
            self.weight *= 1.2
        elif success_rate > 0.8:
            self.weight *= 0.9
```

### 3. Custom Dataset Integration
```python
def load_custom_knowledge_base(csv_path):
    """Example: School communication platform docs."""
    import pandas as pd
    df = pd.read_csv(csv_path)

    dataset = Dataset.from_pandas(df).map(lambda x: {
        'prompt': [
            {'role': 'system', 'content': CUSTOM_SYSTEM_PROMPT},
            {'role': 'user', 'content': x['question']}
        ],
        'answer': x['expert_answer']
    })
    return dataset
```

---

## Deployment and Inference

### Save and Merge LoRA
```python
# Merge LoRA adapters into base model
if hasattr(trainer.model, 'merge_and_unload'):
    merged_model = trainer.model.merge_and_unload()
    merged_model.save_pretrained("production_model")
    tokenizer.save_pretrained("production_model")
```

### Inference Example
```python
from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="production_model",
    tokenizer=tokenizer
)

result = generator(
    [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': "What is 15 + 27?"}
    ],
    max_new_tokens=256,
    do_sample=True,
    temperature=0.7,
    top_p=0.9
)
print(result[0]['generated_text'])
```

---

## Best Practices Checklist

**Before Training:**
- [ ] Validate dataset format (prompts as List[Dict])
- [ ] Test reward functions on sample data
- [ ] Calculate expected max_prompt_length from data
- [ ] Choose appropriate num_generations based on GPU memory
- [ ] Set up logging (wandb recommended)

**During Training:**
- [ ] Monitor reward progression (should increase)
- [ ] Check reward_std (should stay > 0.1)
- [ ] Watch for OOM errors (reduce batch size if needed)
- [ ] Sample generations every 50-100 steps
- [ ] Validate format compliance on holdout set

**After Training:**
- [ ] Merge LoRA weights if using PEFT
- [ ] Test on diverse prompts
- [ ] Compare to baseline model
- [ ] Document reward weights and hyperparameters
- [ ] Save reproducibility config

---

## Troubleshooting Guide

### Debugging Workflow
1. **Isolate reward functions** - Test each independently
2. **Check data distribution** - Ensure diversity in prompts
3. **Reduce complexity** - Start with single reward, add gradually
4. **Monitor generations** - Print samples every N steps
5. **Validate extraction logic** - Ensure answer parsing works

### Quick Fixes
```python
# Debug reward function
def debug_reward(completions, **kwargs):
    responses = [comp[0]['content'] for comp in completions]
    for i, r in enumerate(responses[:2]):  # Print first 2
        print(f"Response {i}: {r[:200]}...")
    return [1.0] * len(responses)  # Dummy rewards

# Test without training
trainer = GRPOTrainer(..., reward_funcs=[debug_reward])
trainer.generate_completions(dataset[:1])  # Generate without updating
```

---

## References and Resources

**Official Documentation:**
- TRL GRPO Trainer: https://huggingface.co/docs/trl/grpo_trainer
- DeepSeek R1 Paper: https://arxiv.org/abs/2501.12948
- Unsloth Docs: https://docs.unsloth.ai/

**Example Repositories:**
- Open R1 Implementation: https://github.com/huggingface/open-r1
- TRL Examples: https://github.com/huggingface/trl/tree/main/examples

**Recommended Reading:**
- Progressive Disclosure Pattern for agent instructions
- Reward shaping in RL (Ng et al.)
- LoRA paper (Hu et al., 2021)

---

## Usage Instructions for Agents

When this skill is loaded:

1. **Read this entire file** before implementing GRPO training
2. **Start with the simplest reward function** (e.g., length-based) to validate setup
3. **Use the templates** in `templates/` directory as starting points
4. **Reference examples** in `examples/` for task-specific implementations
5. **Follow the workflow** sequentially (don't skip steps)
6. **Debug incrementally** - add one reward function at a time

**Critical Reminders:**
- Always use multiple reward functions (3-5 is optimal)
- Monitor reward metrics, not loss
- Test reward functions before training
- Start small (num_generations=4), scale up gradually
- Save checkpoints frequently (every 100 steps)

This skill is designed for **expert-level implementation**. Beginners should start with supervised fine-tuning before attempting GRPO.



