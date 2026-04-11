# PEFT Advanced Usage Guide

## Advanced LoRA Variants

### DoRA (Weight-Decomposed Low-Rank Adaptation)

DoRA decomposes weights into magnitude and direction components, often achieving better results than standard LoRA:

```python
from peft import LoraConfig

dora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    use_dora=True,  # Enable DoRA
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, dora_config)
```

**When to use DoRA**:
- Consistently outperforms LoRA on instruction-following tasks
- Slightly higher memory (~10%) due to magnitude vectors
- Best for quality-critical fine-tuning

### AdaLoRA (Adaptive Rank)

Automatically adjusts rank per layer based on importance:

```python
from peft import AdaLoraConfig

adalora_config = AdaLoraConfig(
    init_r=64,              # Initial rank
    target_r=16,            # Target average rank
    tinit=200,              # Warmup steps
    tfinal=1000,            # Final pruning step
    deltaT=10,              # Rank update frequency
    beta1=0.85,
    beta2=0.85,
    orth_reg_weight=0.5,    # Orthogonality regularization
    target_modules=["q_proj", "v_proj"],
    task_type="CAUSAL_LM"
)
```

**Benefits**:
- Allocates more rank to important layers
- Can reduce total parameters while maintaining quality
- Good for exploring optimal rank distribution

### LoRA+ (Asymmetric Learning Rates)

Different learning rates for A and B matrices:

```python
from peft import LoraConfig

# LoRA+ uses higher LR for B matrix
lora_plus_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules="all-linear",
    use_rslora=True,  # Rank-stabilized LoRA (related technique)
)

# Manual implementation of LoRA+
from torch.optim import AdamW

# Group parameters
lora_A_params = [p for n, p in model.named_parameters() if "lora_A" in n]
lora_B_params = [p for n, p in model.named_parameters() if "lora_B" in n]

optimizer = AdamW([
    {"params": lora_A_params, "lr": 1e-4},
    {"params": lora_B_params, "lr": 1e-3},  # 10x higher for B
])
```

### rsLoRA (Rank-Stabilized LoRA)

Scales LoRA outputs to stabilize training with different ranks:

```python
lora_config = LoraConfig(
    r=64,
    lora_alpha=64,
    use_rslora=True,  # Enables rank-stabilized scaling
    target_modules="all-linear"
)
```

**When to use**:
- When experimenting with different ranks
- Helps maintain consistent behavior across rank values
- Recommended for r > 32

## LoftQ (LoRA-Fine-Tuning-aware Quantization)

Initializes LoRA weights to compensate for quantization error:

```python
from peft import LoftQConfig, LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# LoftQ configuration
loftq_config = LoftQConfig(
    loftq_bits=4,              # Quantization bits
    loftq_iter=5,              # Alternating optimization iterations
)

# LoRA config with LoftQ initialization
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules="all-linear",
    init_lora_weights="loftq",
    loftq_config=loftq_config,
    task_type="CAUSAL_LM"
)

# Load quantized model
bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config
)

model = get_peft_model(model, lora_config)
```

**Benefits over standard QLoRA**:
- Better initial quality after quantization
- Faster convergence
- ~1-2% better final accuracy on benchmarks

## Custom Module Targeting

### Target specific layers

```python
# Target only first and last transformer layers
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["model.layers.0.self_attn.q_proj",
                    "model.layers.0.self_attn.v_proj",
                    "model.layers.31.self_attn.q_proj",
                    "model.layers.31.self_attn.v_proj"],
    layers_to_transform=[0, 31]  # Alternative approach
)
```

### Layer pattern matching

```python
# Target layers 0-10 only
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules="all-linear",
    layers_to_transform=list(range(11)),  # Layers 0-10
    layers_pattern="model.layers"
)
```

### Exclude specific layers

```python
lora_config = LoraConfig(
    r=16,
    target_modules="all-linear",
    modules_to_save=["lm_head"],  # Train these fully (not LoRA)
)
```

## Embedding and LM Head Training

### Train embeddings with LoRA

```python
from peft import LoraConfig

# Include embeddings
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "embed_tokens"],  # Include embeddings
    modules_to_save=["lm_head"],  # Train lm_head fully
)
```

### Extending vocabulary with LoRA

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import get_peft_model, LoraConfig

# Add new tokens
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")
new_tokens = ["<custom_token_1>", "<custom_token_2>"]
tokenizer.add_tokens(new_tokens)

# Resize model embeddings
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")
model.resize_token_embeddings(len(tokenizer))

# Configure LoRA to train new embeddings
lora_config = LoraConfig(
    r=16,
    target_modules="all-linear",
    modules_to_save=["embed_tokens", "lm_head"],  # Train these fully
)

model = get_peft_model(model, lora_config)
```

## Multi-Adapter Patterns

### Adapter composition

```python
from peft import PeftModel

# Load model with multiple adapters
model = AutoPeftModelForCausalLM.from_pretrained("./base-adapter")
model.load_adapter("./style-adapter", adapter_name="style")
model.load_adapter("./task-adapter", adapter_name="task")

# Combine adapters (weighted sum)
model.add_weighted_adapter(
    adapters=["style", "task"],
    weights=[0.7, 0.3],
    adapter_name="combined",
    combination_type="linear"  # or "cat", "svd"
)

model.set_adapter("combined")
```

### Adapter stacking

```python
# Stack adapters (apply sequentially)
model.add_weighted_adapter(
    adapters=["base", "domain", "task"],
    weights=[1.0, 1.0, 1.0],
    adapter_name="stacked",
    combination_type="cat"  # Concatenate adapter outputs
)
```

### Dynamic adapter switching

```python
import torch

class MultiAdapterModel:
    def __init__(self, base_model_path, adapter_paths):
        self.model = AutoPeftModelForCausalLM.from_pretrained(adapter_paths[0])
        for name, path in adapter_paths[1:].items():
            self.model.load_adapter(path, adapter_name=name)

    def generate(self, prompt, adapter_name="default"):
        self.model.set_adapter(adapter_name)
        return self.model.generate(**self.tokenize(prompt))

    def generate_ensemble(self, prompt, adapters, weights):
        """Generate with weighted adapter ensemble"""
        outputs = []
        for adapter, weight in zip(adapters, weights):
            self.model.set_adapter(adapter)
            logits = self.model(**self.tokenize(prompt)).logits
            outputs.append(weight * logits)
        return torch.stack(outputs).sum(dim=0)
```

## Memory Optimization

### Gradient checkpointing with LoRA

```python
from peft import prepare_model_for_kbit_training

# Enable gradient checkpointing
model = prepare_model_for_kbit_training(
    model,
    use_gradient_checkpointing=True,
    gradient_checkpointing_kwargs={"use_reentrant": False}
)
```

### CPU offloading for training

```python
from accelerate import Accelerator

accelerator = Accelerator(
    mixed_precision="bf16",
    gradient_accumulation_steps=8,
    cpu_offload=True  # Offload optimizer states to CPU
)

model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)
```

### Memory-efficient attention with LoRA

```python
from transformers import AutoModelForCausalLM

# Combine Flash Attention 2 with LoRA
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    attn_implementation="flash_attention_2",
    torch_dtype=torch.bfloat16
)

# Apply LoRA
model = get_peft_model(model, lora_config)
```

## Inference Optimization

### Merge for deployment

```python
# Merge adapter weights into base model
merged_model = model.merge_and_unload()

# Quantize merged model for inference
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(load_in_4bit=True)
quantized_model = AutoModelForCausalLM.from_pretrained(
    "./merged-model",
    quantization_config=bnb_config
)
```

### Export to different formats

```python
# Export to GGUF (llama.cpp)
# First merge, then convert
merged_model.save_pretrained("./merged-model")

# Use llama.cpp converter
# python convert-hf-to-gguf.py ./merged-model --outfile model.gguf

# Export to ONNX
from optimum.onnxruntime import ORTModelForCausalLM

ort_model = ORTModelForCausalLM.from_pretrained(
    "./merged-model",
    export=True
)
ort_model.save_pretrained("./onnx-model")
```

### Batch adapter inference

```python
from vllm import LLM
from vllm.lora.request import LoRARequest

# Initialize with LoRA support
llm = LLM(
    model="meta-llama/Llama-3.1-8B",
    enable_lora=True,
    max_lora_rank=64,
    max_loras=4  # Max concurrent adapters
)

# Batch with different adapters
requests = [
    ("prompt1", LoRARequest("adapter1", 1, "./adapter1")),
    ("prompt2", LoRARequest("adapter2", 2, "./adapter2")),
    ("prompt3", LoRARequest("adapter1", 1, "./adapter1")),
]

outputs = llm.generate(
    [r[0] for r in requests],
    lora_request=[r[1] for r in requests]
)
```

## Training Recipes

### Instruction tuning recipe

```python
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules="all-linear",
    bias="none",
    task_type="CAUSAL_LM"
)

training_args = TrainingArguments(
    output_dir="./output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    bf16=True,
    logging_steps=10,
    save_strategy="steps",
    save_steps=100,
    eval_strategy="steps",
    eval_steps=100,
)
```

### Code generation recipe

```python
lora_config = LoraConfig(
    r=32,              # Higher rank for code
    lora_alpha=64,
    lora_dropout=0.1,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    bias="none",
    task_type="CAUSAL_LM"
)

training_args = TrainingArguments(
    learning_rate=1e-4,        # Lower LR for code
    num_train_epochs=2,
    max_seq_length=2048,       # Longer sequences
)
```

### Conversational/Chat recipe

```python
from trl import SFTTrainer

lora_config = LoraConfig(
    r=16,
    lora_alpha=16,  # alpha = r for chat
    lora_dropout=0.05,
    target_modules="all-linear"
)

# Use chat template
def format_chat(example):
    messages = [
        {"role": "user", "content": example["instruction"]},
        {"role": "assistant", "content": example["response"]}
    ]
    return tokenizer.apply_chat_template(messages, tokenize=False)

trainer = SFTTrainer(
    model=model,
    peft_config=lora_config,
    train_dataset=dataset.map(format_chat),
    max_seq_length=1024,
)
```

## Debugging and Validation

### Verify adapter application

```python
# Check which modules have LoRA
for name, module in model.named_modules():
    if hasattr(module, "lora_A"):
        print(f"LoRA applied to: {name}")

# Print detailed config
print(model.peft_config)

# Check adapter state
print(f"Active adapters: {model.active_adapters}")
print(f"Trainable: {sum(p.numel() for p in model.parameters() if p.requires_grad)}")
```

### Compare with base model

```python
# Generate with adapter
model.set_adapter("default")
adapter_output = model.generate(**inputs)

# Generate without adapter
with model.disable_adapter():
    base_output = model.generate(**inputs)

print(f"Adapter: {tokenizer.decode(adapter_output[0])}")
print(f"Base: {tokenizer.decode(base_output[0])}")
```

### Monitor training metrics

```python
from transformers import TrainerCallback

class LoRACallback(TrainerCallback):
    def on_log(self, args, state, control, logs=None, **kwargs):
        if "loss" in logs:
            # Log adapter-specific metrics
            model = kwargs["model"]
            lora_params = sum(p.numel() for n, p in model.named_parameters()
                            if "lora" in n and p.requires_grad)
            print(f"Step {state.global_step}: loss={logs['loss']:.4f}, lora_params={lora_params}")
```
