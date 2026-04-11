# PEFT Troubleshooting Guide

## Installation Issues

### bitsandbytes CUDA Error

**Error**: `CUDA Setup failed despite GPU being available`

**Fix**:
```bash
# Check CUDA version
nvcc --version

# Install matching bitsandbytes
pip uninstall bitsandbytes
pip install bitsandbytes --no-cache-dir

# Or compile from source for specific CUDA
git clone https://github.com/TimDettmers/bitsandbytes.git
cd bitsandbytes
CUDA_VERSION=118 make cuda11x  # Adjust for your CUDA
pip install .
```

### Triton Import Error

**Error**: `ModuleNotFoundError: No module named 'triton'`

**Fix**:
```bash
# Install triton (Linux only)
pip install triton

# Windows: Triton not supported, use CUDA backend
# Set environment variable to disable triton
export CUDA_VISIBLE_DEVICES=0
```

### PEFT Version Conflicts

**Error**: `AttributeError: 'LoraConfig' object has no attribute 'use_dora'`

**Fix**:
```bash
# Upgrade to latest PEFT
pip install peft>=0.13.0 --upgrade

# Check version
python -c "import peft; print(peft.__version__)"
```

## Training Issues

### CUDA Out of Memory

**Error**: `torch.cuda.OutOfMemoryError: CUDA out of memory`

**Solutions**:

1. **Enable gradient checkpointing**:
```python
from peft import prepare_model_for_kbit_training
model = prepare_model_for_kbit_training(model, use_gradient_checkpointing=True)
```

2. **Reduce batch size**:
```python
TrainingArguments(
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16  # Maintain effective batch size
)
```

3. **Use QLoRA**:
```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)
model = AutoModelForCausalLM.from_pretrained(model_name, quantization_config=bnb_config)
```

4. **Lower LoRA rank**:
```python
LoraConfig(r=8)  # Instead of r=16 or higher
```

5. **Target fewer modules**:
```python
target_modules=["q_proj", "v_proj"]  # Instead of all-linear
```

### Loss Not Decreasing

**Problem**: Training loss stays flat or increases.

**Solutions**:

1. **Check learning rate**:
```python
# Start lower
TrainingArguments(learning_rate=1e-4)  # Not 2e-4 or higher
```

2. **Verify adapter is active**:
```python
model.print_trainable_parameters()
# Should show >0 trainable params

# Check adapter applied
print(model.peft_config)
```

3. **Check data formatting**:
```python
# Verify tokenization
sample = dataset[0]
decoded = tokenizer.decode(sample["input_ids"])
print(decoded)  # Should look correct
```

4. **Increase rank**:
```python
LoraConfig(r=32, lora_alpha=64)  # More capacity
```

### NaN Loss

**Error**: `Loss is NaN`

**Fix**:
```python
# Use bf16 instead of fp16
TrainingArguments(bf16=True, fp16=False)

# Or enable loss scaling
TrainingArguments(fp16=True, fp16_full_eval=True)

# Lower learning rate
TrainingArguments(learning_rate=5e-5)

# Check for data issues
for batch in dataloader:
    if torch.isnan(batch["input_ids"].float()).any():
        print("NaN in input!")
```

### Adapter Not Training

**Problem**: `trainable params: 0` or model not updating.

**Fix**:
```python
# Verify LoRA applied to correct modules
for name, module in model.named_modules():
    if "lora" in name.lower():
        print(f"Found LoRA: {name}")

# Check target_modules match model architecture
from peft.utils import TRANSFORMERS_MODELS_TO_LORA_TARGET_MODULES_MAPPING
print(TRANSFORMERS_MODELS_TO_LORA_TARGET_MODULES_MAPPING.get(model.config.model_type))

# Ensure model in training mode
model.train()

# Check requires_grad
for name, param in model.named_parameters():
    if param.requires_grad:
        print(f"Trainable: {name}")
```

## Loading Issues

### Adapter Loading Fails

**Error**: `ValueError: Can't find adapter weights`

**Fix**:
```python
# Check adapter files exist
import os
print(os.listdir("./adapter-path"))
# Should contain: adapter_config.json, adapter_model.safetensors

# Load with correct structure
from peft import PeftModel, PeftConfig

# Check config
config = PeftConfig.from_pretrained("./adapter-path")
print(config)

# Load base model first
base_model = AutoModelForCausalLM.from_pretrained(config.base_model_name_or_path)
model = PeftModel.from_pretrained(base_model, "./adapter-path")
```

### Base Model Mismatch

**Error**: `RuntimeError: size mismatch`

**Fix**:
```python
# Ensure base model matches adapter
from peft import PeftConfig

config = PeftConfig.from_pretrained("./adapter-path")
print(f"Base model: {config.base_model_name_or_path}")

# Load exact same base model
base_model = AutoModelForCausalLM.from_pretrained(config.base_model_name_or_path)
```

### Safetensors vs PyTorch Format

**Error**: `ValueError: We couldn't connect to 'https://huggingface.co'`

**Fix**:
```python
# Force local loading
model = PeftModel.from_pretrained(
    base_model,
    "./adapter-path",
    local_files_only=True
)

# Or specify format
model.save_pretrained("./adapter", safe_serialization=True)  # safetensors
model.save_pretrained("./adapter", safe_serialization=False)  # pytorch
```

## Inference Issues

### Slow Generation

**Problem**: Inference much slower than expected.

**Solutions**:

1. **Merge adapter for deployment**:
```python
merged_model = model.merge_and_unload()
# No adapter overhead during inference
```

2. **Use optimized inference engine**:
```python
from vllm import LLM
llm = LLM(model="./merged-model", dtype="half")
```

3. **Enable Flash Attention**:
```python
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    attn_implementation="flash_attention_2"
)
```

### Output Quality Issues

**Problem**: Fine-tuned model produces worse outputs.

**Solutions**:

1. **Check evaluation without adapter**:
```python
with model.disable_adapter():
    base_output = model.generate(**inputs)
# Compare with adapter output
```

2. **Lower temperature during eval**:
```python
model.generate(**inputs, temperature=0.1, do_sample=False)
```

3. **Retrain with more data**:
```python
# Increase training samples
# Use higher quality data
# Train for more epochs
```

### Wrong Adapter Active

**Problem**: Model using wrong adapter or no adapter.

**Fix**:
```python
# Check active adapters
print(model.active_adapters)

# Explicitly set adapter
model.set_adapter("your-adapter-name")

# List all adapters
print(model.peft_config.keys())
```

## QLoRA Specific Issues

### Quantization Errors

**Error**: `RuntimeError: mat1 and mat2 shapes cannot be multiplied`

**Fix**:
```python
# Ensure compute dtype matches
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,  # Match model dtype
    bnb_4bit_quant_type="nf4"
)

# Load with correct dtype
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    torch_dtype=torch.bfloat16
)
```

### QLoRA OOM

**Error**: OOM even with 4-bit quantization.

**Fix**:
```python
# Enable double quantization
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True  # Further memory reduction
)

# Use offloading
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
    max_memory={0: "20GB", "cpu": "100GB"}
)
```

### QLoRA Merge Fails

**Error**: `RuntimeError: expected scalar type BFloat16 but found Float`

**Fix**:
```python
# Dequantize before merging
from peft import PeftModel

# Load in higher precision for merging
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16,  # Not quantized
    device_map="auto"
)

# Load adapter
model = PeftModel.from_pretrained(base_model, "./qlora-adapter")

# Now merge
merged = model.merge_and_unload()
```

## Multi-Adapter Issues

### Adapter Conflict

**Error**: `ValueError: Adapter with name 'default' already exists`

**Fix**:
```python
# Use unique names
model.load_adapter("./adapter1", adapter_name="task1")
model.load_adapter("./adapter2", adapter_name="task2")

# Or delete existing
model.delete_adapter("default")
```

### Mixed Precision Adapters

**Error**: Adapters trained with different dtypes.

**Fix**:
```python
# Convert adapter precision
model = PeftModel.from_pretrained(base_model, "./adapter")
model = model.to(torch.bfloat16)

# Or load with specific dtype
model = PeftModel.from_pretrained(
    base_model,
    "./adapter",
    torch_dtype=torch.bfloat16
)
```

## Performance Optimization

### Memory Profiling

```python
import torch

def print_memory():
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        reserved = torch.cuda.memory_reserved() / 1e9
        print(f"Allocated: {allocated:.2f}GB, Reserved: {reserved:.2f}GB")

# Profile during training
print_memory()  # Before
model.train()
loss = model(**batch).loss
loss.backward()
print_memory()  # After
```

### Speed Profiling

```python
import time
import torch

def benchmark_generation(model, tokenizer, prompt, n_runs=5):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    # Warmup
    model.generate(**inputs, max_new_tokens=10)
    torch.cuda.synchronize()

    # Benchmark
    times = []
    for _ in range(n_runs):
        start = time.perf_counter()
        outputs = model.generate(**inputs, max_new_tokens=100)
        torch.cuda.synchronize()
        times.append(time.perf_counter() - start)

    tokens = outputs.shape[1] - inputs.input_ids.shape[1]
    avg_time = sum(times) / len(times)
    print(f"Speed: {tokens/avg_time:.2f} tokens/sec")

# Compare adapter vs merged
benchmark_generation(adapter_model, tokenizer, "Hello")
benchmark_generation(merged_model, tokenizer, "Hello")
```

## Getting Help

1. **Check PEFT GitHub Issues**: https://github.com/huggingface/peft/issues
2. **HuggingFace Forums**: https://discuss.huggingface.co/
3. **PEFT Documentation**: https://huggingface.co/docs/peft

### Debugging Template

When reporting issues, include:

```python
# System info
import peft
import transformers
import torch

print(f"PEFT: {peft.__version__}")
print(f"Transformers: {transformers.__version__}")
print(f"PyTorch: {torch.__version__}")
print(f"CUDA: {torch.version.cuda}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'N/A'}")

# Config
print(model.peft_config)
model.print_trainable_parameters()
```
