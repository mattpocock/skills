"""
Basic GRPO Training Template
=============================

A minimal, production-ready template for GRPO training with TRL.
Adapt this for your specific task by modifying:
1. Dataset loading (get_dataset function)
2. Reward functions (reward_*_func)
3. System prompt (SYSTEM_PROMPT)
4. Hyperparameters (GRPOConfig)
"""

import torch
import re
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig
from trl import GRPOTrainer, GRPOConfig

# ==================== CONFIGURATION ====================

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
OUTPUT_DIR = "outputs/grpo-model"
MAX_PROMPT_LENGTH = 256
MAX_COMPLETION_LENGTH = 512

SYSTEM_PROMPT = """
Respond in the following format:
<reasoning>
[Your step-by-step thinking]
</reasoning>
<answer>
[Final answer]
</answer>
"""

# ==================== DATASET ====================

def get_dataset(split="train"):
    """
    Load and prepare your dataset.

    Returns: Dataset with columns:
    - 'prompt': List[Dict] with role/content
    - 'answer': str (ground truth, optional)
    """
    # Example: GSM8K math dataset
    data = load_dataset('openai/gsm8k', 'main')[split]

    def process_example(x):
        # Extract ground truth answer
        answer = x['answer'].split('####')[1].strip() if '####' in x['answer'] else None

        return {
            'prompt': [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': x['question']}
            ],
            'answer': answer
        }

    return data.map(process_example)

# ==================== HELPER FUNCTIONS ====================

def extract_xml_tag(text: str, tag: str) -> str:
    """Extract content between XML tags."""
    pattern = f'<{tag}>(.*?)</{tag}>'
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""

def extract_answer(text: str) -> str:
    """Extract the final answer from structured output."""
    return extract_xml_tag(text, 'answer')

# ==================== REWARD FUNCTIONS ====================

def correctness_reward_func(prompts, completions, answer, **kwargs):
    """
    Reward correct answers.
    Weight: 2.0 (highest priority)
    """
    responses = [comp[0]['content'] for comp in completions]
    extracted = [extract_answer(r) for r in responses]
    return [2.0 if ans == gt else 0.0 for ans, gt in zip(extracted, answer)]

def format_reward_func(completions, **kwargs):
    """
    Reward proper XML format.
    Weight: 0.5
    """
    pattern = r'<reasoning>.*?</reasoning>\s*<answer>.*?</answer>'
    responses = [comp[0]['content'] for comp in completions]
    return [0.5 if re.search(pattern, r, re.DOTALL) else 0.0 for r in responses]

def incremental_format_reward_func(completions, **kwargs):
    """
    Incremental reward for partial format compliance.
    Weight: up to 0.5
    """
    responses = [comp[0]['content'] for comp in completions]
    rewards = []

    for r in responses:
        score = 0.0
        if '<reasoning>' in r:
            score += 0.125
        if '</reasoning>' in r:
            score += 0.125
        if '<answer>' in r:
            score += 0.125
        if '</answer>' in r:
            score += 0.125

        # Penalize extra content after closing tag
        if '</answer>' in r:
            extra = r.split('</answer>')[-1].strip()
            score -= len(extra) * 0.001

        rewards.append(score)

    return rewards

# ==================== MODEL SETUP ====================

def setup_model_and_tokenizer():
    """Load model and tokenizer with optimizations."""
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.bfloat16,
        attn_implementation="flash_attention_2",
        device_map="auto"
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token

    return model, tokenizer

def get_peft_config():
    """LoRA configuration for parameter-efficient training."""
    return LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
        task_type="CAUSAL_LM",
        lora_dropout=0.05,
    )

# ==================== TRAINING ====================

def main():
    """Main training function."""

    # Load data
    print("Loading dataset...")
    dataset = get_dataset()
    print(f"Dataset size: {len(dataset)}")

    # Setup model
    print("Loading model...")
    model, tokenizer = setup_model_and_tokenizer()

    # Training configuration
    training_args = GRPOConfig(
        output_dir=OUTPUT_DIR,
        run_name="grpo-training",

        # Learning rate
        learning_rate=5e-6,
        adam_beta1=0.9,
        adam_beta2=0.99,
        weight_decay=0.1,
        warmup_ratio=0.1,
        lr_scheduler_type='cosine',

        # Batch settings
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,

        # GRPO specific
        num_generations=8,
        max_prompt_length=MAX_PROMPT_LENGTH,
        max_completion_length=MAX_COMPLETION_LENGTH,

        # Training duration
        num_train_epochs=1,

        # Optimization
        bf16=True,
        optim="adamw_8bit",
        max_grad_norm=0.1,

        # Logging
        logging_steps=1,
        save_steps=100,
        report_to="wandb",  # Change to "none" to disable logging
    )

    # Initialize trainer
    trainer = GRPOTrainer(
        model=model,
        processing_class=tokenizer,
        reward_funcs=[
            incremental_format_reward_func,
            format_reward_func,
            correctness_reward_func,
        ],
        args=training_args,
        train_dataset=dataset,
        peft_config=get_peft_config(),
    )

    # Train
    print("Starting training...")
    trainer.train()

    # Save final model
    print(f"Saving model to {OUTPUT_DIR}/final")
    trainer.save_model(f"{OUTPUT_DIR}/final")

    print("Training complete!")

if __name__ == "__main__":
    main()
