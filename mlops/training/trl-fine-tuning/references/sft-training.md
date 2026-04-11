# SFT Training Guide

Complete guide to Supervised Fine-Tuning (SFT) with TRL for instruction tuning and task-specific fine-tuning.

## Overview

SFT trains models on input-output pairs to minimize cross-entropy loss. Use for:
- Instruction following
- Task-specific fine-tuning
- Chatbot training
- Domain adaptation

## Dataset Formats

### Format 1: Prompt-Completion

```json
[
  {
    "prompt": "What is the capital of France?",
    "completion": "The capital of France is Paris."
  }
]
```

### Format 2: Conversational (ChatML)

```json
[
  {
    "messages": [
      {"role": "user", "content": "What is Python?"},
      {"role": "assistant", "content": "Python is a programming language."}
    ]
  }
]
```

### Format 3: Text-only

```json
[
  {"text": "User: Hello\nAssistant: Hi! How can I help?"}
]
```

## Basic Training

```python
from trl import SFTTrainer, SFTConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

# Load model
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B")

# Load dataset
dataset = load_dataset("trl-lib/Capybara", split="train")

# Configure
config = SFTConfig(
    output_dir="Qwen2.5-SFT",
    per_device_train_batch_size=4,
    num_train_epochs=1,
    learning_rate=2e-5,
    save_strategy="epoch"
)

# Train
trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer
)
trainer.train()
```

## Chat Templates

Apply chat templates automatically:

```python
trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset,  # Messages format
    tokenizer=tokenizer
    # Chat template applied automatically
)
```

Or manually:
```python
def format_chat(example):
    messages = example["messages"]
    text = tokenizer.apply_chat_template(messages, tokenize=False)
    return {"text": text}

dataset = dataset.map(format_chat)
```

## Packing for Efficiency

Pack multiple sequences into one to maximize GPU utilization:

```python
config = SFTConfig(
    packing=True,  # Enable packing
    max_seq_length=2048,
    dataset_text_field="text"
)
```

**Benefits**: 2-3× faster training
**Trade-off**: Slightly more complex batching

## Multi-GPU Training

```bash
accelerate launch --num_processes 4 train_sft.py
```

Or with config:
```python
config = SFTConfig(
    output_dir="model-sft",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    num_train_epochs=1
)
```

## LoRA Fine-Tuning

```python
from peft import LoraConfig

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules="all-linear",
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)

trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    peft_config=lora_config  # Add LoRA
)
```

## Hyperparameters

| Model Size | Learning Rate | Batch Size | Epochs |
|------------|---------------|------------|--------|
| <1B | 5e-5 | 8-16 | 1-3 |
| 1-7B | 2e-5 | 4-8 | 1-2 |
| 7-13B | 1e-5 | 2-4 | 1 |
| 13B+ | 5e-6 | 1-2 | 1 |

## References

- TRL docs: https://huggingface.co/docs/trl/sft_trainer
- Examples: https://github.com/huggingface/trl/tree/main/examples/scripts
