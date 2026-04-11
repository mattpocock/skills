# Backend Configuration Guide

Complete guide to configuring Outlines with different model backends.

## Table of Contents
- Local Models (Transformers, llama.cpp, vLLM)
- API Models (OpenAI)
- Performance Comparison
- Configuration Examples
- Production Deployment

## Transformers (Hugging Face)

### Basic Setup

```python
import outlines

# Load model from Hugging Face
model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")

# Use with generator
generator = outlines.generate.json(model, YourModel)
result = generator("Your prompt")
```

### GPU Configuration

```python
# Use CUDA GPU
model = outlines.models.transformers(
    "microsoft/Phi-3-mini-4k-instruct",
    device="cuda"
)

# Use specific GPU
model = outlines.models.transformers(
    "microsoft/Phi-3-mini-4k-instruct",
    device="cuda:0"  # GPU 0
)

# Use CPU
model = outlines.models.transformers(
    "microsoft/Phi-3-mini-4k-instruct",
    device="cpu"
)

# Use Apple Silicon MPS
model = outlines.models.transformers(
    "microsoft/Phi-3-mini-4k-instruct",
    device="mps"
)
```

### Advanced Configuration

```python
# FP16 for faster inference
model = outlines.models.transformers(
    "microsoft/Phi-3-mini-4k-instruct",
    device="cuda",
    model_kwargs={
        "torch_dtype": "float16"
    }
)

# 8-bit quantization (less memory)
model = outlines.models.transformers(
    "microsoft/Phi-3-mini-4k-instruct",
    device="cuda",
    model_kwargs={
        "load_in_8bit": True,
        "device_map": "auto"
    }
)

# 4-bit quantization (even less memory)
model = outlines.models.transformers(
    "meta-llama/Llama-3.1-70B-Instruct",
    device="cuda",
    model_kwargs={
        "load_in_4bit": True,
        "device_map": "auto",
        "bnb_4bit_compute_dtype": "float16"
    }
)

# Multi-GPU
model = outlines.models.transformers(
    "meta-llama/Llama-3.1-70B-Instruct",
    device="cuda",
    model_kwargs={
        "device_map": "auto",  # Automatic GPU distribution
        "max_memory": {0: "40GB", 1: "40GB"}  # Per-GPU limits
    }
)
```

### Popular Models

```python
# Phi-4 (Microsoft)
model = outlines.models.transformers("microsoft/Phi-4-mini-instruct")
model = outlines.models.transformers("microsoft/Phi-3-medium-4k-instruct")

# Llama 3.1 (Meta)
model = outlines.models.transformers("meta-llama/Llama-3.1-8B-Instruct")
model = outlines.models.transformers("meta-llama/Llama-3.1-70B-Instruct")
model = outlines.models.transformers("meta-llama/Llama-3.1-405B-Instruct")

# Mistral (Mistral AI)
model = outlines.models.transformers("mistralai/Mistral-7B-Instruct-v0.3")
model = outlines.models.transformers("mistralai/Mixtral-8x7B-Instruct-v0.1")
model = outlines.models.transformers("mistralai/Mixtral-8x22B-Instruct-v0.1")

# Qwen (Alibaba)
model = outlines.models.transformers("Qwen/Qwen2.5-7B-Instruct")
model = outlines.models.transformers("Qwen/Qwen2.5-14B-Instruct")
model = outlines.models.transformers("Qwen/Qwen2.5-72B-Instruct")

# Gemma (Google)
model = outlines.models.transformers("google/gemma-2-9b-it")
model = outlines.models.transformers("google/gemma-2-27b-it")

# Llava (Vision)
model = outlines.models.transformers("llava-hf/llava-v1.6-mistral-7b-hf")
```

### Custom Model Loading

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import outlines

# Load model manually
tokenizer = AutoTokenizer.from_pretrained("your-model")
model_hf = AutoModelForCausalLM.from_pretrained(
    "your-model",
    device_map="auto",
    torch_dtype="float16"
)

# Use with Outlines
model = outlines.models.transformers(
    model=model_hf,
    tokenizer=tokenizer
)
```

## llama.cpp

### Basic Setup

```python
import outlines

# Load GGUF model
model = outlines.models.llamacpp(
    "./models/llama-3.1-8b-instruct.Q4_K_M.gguf",
    n_ctx=4096  # Context window
)

# Use with generator
generator = outlines.generate.json(model, YourModel)
```

### GPU Configuration

```python
# CPU only
model = outlines.models.llamacpp(
    "./models/model.gguf",
    n_ctx=4096,
    n_threads=8  # Use 8 CPU threads
)

# GPU offload (partial)
model = outlines.models.llamacpp(
    "./models/model.gguf",
    n_ctx=4096,
    n_gpu_layers=35,  # Offload 35 layers to GPU
    n_threads=4       # CPU threads for remaining layers
)

# Full GPU offload
model = outlines.models.llamacpp(
    "./models/model.gguf",
    n_ctx=8192,
    n_gpu_layers=-1  # All layers on GPU
)
```

### Advanced Configuration

```python
model = outlines.models.llamacpp(
    "./models/llama-3.1-8b.Q4_K_M.gguf",
    n_ctx=8192,          # Context window (tokens)
    n_gpu_layers=35,     # GPU layers
    n_threads=8,         # CPU threads
    n_batch=512,         # Batch size for prompt processing
    use_mmap=True,       # Memory-map model file (faster loading)
    use_mlock=False,     # Lock model in RAM (prevents swapping)
    seed=42,             # Random seed for reproducibility
    verbose=False        # Suppress verbose output
)
```

### Quantization Formats

```python
# Q4_K_M (4-bit, recommended for most cases)
# - Size: ~4.5GB for 7B model
# - Quality: Good
# - Speed: Fast
model = outlines.models.llamacpp("./models/model.Q4_K_M.gguf")

# Q5_K_M (5-bit, better quality)
# - Size: ~5.5GB for 7B model
# - Quality: Very good
# - Speed: Slightly slower than Q4
model = outlines.models.llamacpp("./models/model.Q5_K_M.gguf")

# Q6_K (6-bit, high quality)
# - Size: ~6.5GB for 7B model
# - Quality: Excellent
# - Speed: Slower than Q5
model = outlines.models.llamacpp("./models/model.Q6_K.gguf")

# Q8_0 (8-bit, near-original quality)
# - Size: ~8GB for 7B model
# - Quality: Near FP16
# - Speed: Slower than Q6
model = outlines.models.llamacpp("./models/model.Q8_0.gguf")

# F16 (16-bit float, original quality)
# - Size: ~14GB for 7B model
# - Quality: Original
# - Speed: Slowest
model = outlines.models.llamacpp("./models/model.F16.gguf")
```

### Popular GGUF Models

```python
# Llama 3.1
model = outlines.models.llamacpp("llama-3.1-8b-instruct.Q4_K_M.gguf")
model = outlines.models.llamacpp("llama-3.1-70b-instruct.Q4_K_M.gguf")

# Mistral
model = outlines.models.llamacpp("mistral-7b-instruct-v0.3.Q4_K_M.gguf")

# Phi-4
model = outlines.models.llamacpp("phi-4-mini-instruct.Q4_K_M.gguf")

# Qwen
model = outlines.models.llamacpp("qwen2.5-7b-instruct.Q4_K_M.gguf")
```

### Apple Silicon Optimization

```python
# Optimized for M1/M2/M3 Macs
model = outlines.models.llamacpp(
    "./models/llama-3.1-8b.Q4_K_M.gguf",
    n_ctx=4096,
    n_gpu_layers=-1,  # Use Metal GPU acceleration
    use_mmap=True,    # Efficient memory mapping
    n_threads=8       # Use performance cores
)
```

## vLLM (Production)

### Basic Setup

```python
import outlines

# Load model with vLLM
model = outlines.models.vllm("meta-llama/Llama-3.1-8B-Instruct")

# Use with generator
generator = outlines.generate.json(model, YourModel)
```

### Single GPU

```python
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    gpu_memory_utilization=0.9,  # Use 90% of GPU memory
    max_model_len=4096          # Max sequence length
)
```

### Multi-GPU

```python
# Tensor parallelism (split model across GPUs)
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-70B-Instruct",
    tensor_parallel_size=4,  # Use 4 GPUs
    gpu_memory_utilization=0.9
)

# Pipeline parallelism (rare, for very large models)
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-405B-Instruct",
    pipeline_parallel_size=8,  # 8-GPU pipeline
    tensor_parallel_size=4     # 4-GPU tensor split
    # Total: 32 GPUs
)
```

### Quantization

```python
# AWQ quantization (4-bit)
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization="awq",
    dtype="float16"
)

# GPTQ quantization (4-bit)
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization="gptq"
)

# SqueezeLLM quantization
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization="squeezellm"
)
```

### Advanced Configuration

```python
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    tensor_parallel_size=1,
    gpu_memory_utilization=0.9,
    max_model_len=8192,
    max_num_seqs=256,           # Max concurrent sequences
    max_num_batched_tokens=8192, # Max tokens per batch
    dtype="float16",
    trust_remote_code=True,
    enforce_eager=False,        # Use CUDA graphs (faster)
    swap_space=4                # CPU swap space (GB)
)
```

### Batch Processing

```python
# vLLM optimized for high-throughput batch processing
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    max_num_seqs=128  # Process 128 sequences in parallel
)

generator = outlines.generate.json(model, YourModel)

# Process many prompts efficiently
prompts = ["prompt1", "prompt2", ..., "prompt100"]
results = [generator(p) for p in prompts]
# vLLM automatically batches and optimizes
```

## OpenAI (Limited Support)

### Basic Setup

```python
import outlines

# Basic OpenAI support
model = outlines.models.openai("gpt-4o-mini", api_key="your-api-key")

# Use with generator
generator = outlines.generate.json(model, YourModel)
result = generator("Your prompt")
```

### Configuration

```python
model = outlines.models.openai(
    "gpt-4o-mini",
    api_key="your-api-key",  # Or set OPENAI_API_KEY env var
    max_tokens=2048,
    temperature=0.7
)
```

### Available Models

```python
# GPT-4o (latest)
model = outlines.models.openai("gpt-4o")

# GPT-4o Mini (cost-effective)
model = outlines.models.openai("gpt-4o-mini")

# GPT-4 Turbo
model = outlines.models.openai("gpt-4-turbo")

# GPT-3.5 Turbo
model = outlines.models.openai("gpt-3.5-turbo")
```

**Note**: OpenAI support is limited compared to local models. Some advanced features may not work.

## Backend Comparison

### Feature Matrix

| Feature | Transformers | llama.cpp | vLLM | OpenAI |
|---------|-------------|-----------|------|--------|
| Structured Generation | ✅ Full | ✅ Full | ✅ Full | ⚠️ Limited |
| FSM Optimization | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| GPU Support | ✅ Yes | ✅ Yes | ✅ Yes | N/A |
| Multi-GPU | ✅ Yes | ✅ Yes | ✅ Yes | N/A |
| Quantization | ✅ Yes | ✅ Yes | ✅ Yes | N/A |
| High Throughput | ⚠️ Medium | ⚠️ Medium | ✅ Excellent | ⚠️ API-limited |
| Setup Difficulty | Easy | Medium | Medium | Easy |
| Cost | Hardware | Hardware | Hardware | API usage |

### Performance Characteristics

**Transformers:**
- **Latency**: 50-200ms (single request, GPU)
- **Throughput**: 10-50 tokens/sec (depends on hardware)
- **Memory**: 2-4GB per 1B parameters (FP16)
- **Best for**: Development, small-scale deployment, flexibility

**llama.cpp:**
- **Latency**: 30-150ms (single request)
- **Throughput**: 20-150 tokens/sec (depends on quantization)
- **Memory**: 0.5-2GB per 1B parameters (Q4-Q8)
- **Best for**: CPU inference, Apple Silicon, edge deployment, low memory

**vLLM:**
- **Latency**: 30-100ms (single request)
- **Throughput**: 100-1000+ tokens/sec (batch processing)
- **Memory**: 2-4GB per 1B parameters (FP16)
- **Best for**: Production, high-throughput, batch processing, serving

**OpenAI:**
- **Latency**: 200-500ms (API call)
- **Throughput**: API rate limits
- **Memory**: N/A (cloud-based)
- **Best for**: Quick prototyping, no infrastructure

### Memory Requirements

**7B Model:**
- FP16: ~14GB
- 8-bit: ~7GB
- 4-bit: ~4GB
- Q4_K_M (GGUF): ~4.5GB

**13B Model:**
- FP16: ~26GB
- 8-bit: ~13GB
- 4-bit: ~7GB
- Q4_K_M (GGUF): ~8GB

**70B Model:**
- FP16: ~140GB (multi-GPU)
- 8-bit: ~70GB (multi-GPU)
- 4-bit: ~35GB (single A100/H100)
- Q4_K_M (GGUF): ~40GB

## Performance Tuning

### Transformers Optimization

```python
# Use FP16
model = outlines.models.transformers(
    "meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    model_kwargs={"torch_dtype": "float16"}
)

# Use flash attention (2-4x faster)
model = outlines.models.transformers(
    "meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    model_kwargs={
        "torch_dtype": "float16",
        "use_flash_attention_2": True
    }
)

# Use 8-bit quantization (2x less memory)
model = outlines.models.transformers(
    "meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    model_kwargs={
        "load_in_8bit": True,
        "device_map": "auto"
    }
)
```

### llama.cpp Optimization

```python
# Maximize GPU usage
model = outlines.models.llamacpp(
    "./models/model.Q4_K_M.gguf",
    n_gpu_layers=-1,  # All layers on GPU
    n_ctx=8192,
    n_batch=512       # Larger batch = faster
)

# Optimize for CPU (Apple Silicon)
model = outlines.models.llamacpp(
    "./models/model.Q4_K_M.gguf",
    n_ctx=4096,
    n_threads=8,      # Use all performance cores
    use_mmap=True
)
```

### vLLM Optimization

```python
# High throughput
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-8B-Instruct",
    gpu_memory_utilization=0.95,  # Use 95% of GPU
    max_num_seqs=256,             # High concurrency
    enforce_eager=False           # Use CUDA graphs
)

# Multi-GPU
model = outlines.models.vllm(
    "meta-llama/Llama-3.1-70B-Instruct",
    tensor_parallel_size=4,  # 4 GPUs
    gpu_memory_utilization=0.9
)
```

## Production Deployment

### Docker with vLLM

```dockerfile
FROM vllm/vllm-openai:latest

# Install outlines
RUN pip install outlines

# Copy your code
COPY app.py /app/

# Run
CMD ["python", "/app/app.py"]
```

### Environment Variables

```bash
# Transformers cache
export HF_HOME="/path/to/cache"
export TRANSFORMERS_CACHE="/path/to/cache"

# GPU selection
export CUDA_VISIBLE_DEVICES=0,1,2,3

# OpenAI API key
export OPENAI_API_KEY="sk-..."

# Disable tokenizers parallelism warning
export TOKENIZERS_PARALLELISM=false
```

### Model Serving

```python
# Simple HTTP server with vLLM
import outlines
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Load model once at startup
model = outlines.models.vllm("meta-llama/Llama-3.1-8B-Instruct")

class User(BaseModel):
    name: str
    age: int
    email: str

generator = outlines.generate.json(model, User)

@app.post("/extract")
def extract(text: str):
    result = generator(f"Extract user from: {text}")
    return result.model_dump()
```

## Resources

- **Transformers**: https://huggingface.co/docs/transformers
- **llama.cpp**: https://github.com/ggerganov/llama.cpp
- **vLLM**: https://docs.vllm.ai
- **Outlines**: https://github.com/outlines-dev/outlines
