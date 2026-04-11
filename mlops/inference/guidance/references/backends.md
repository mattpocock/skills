# Backend Configuration Guide

Complete guide to configuring Guidance with different LLM backends.

## Table of Contents
- API-Based Models (Anthropic, OpenAI)
- Local Models (Transformers, llama.cpp)
- Backend Comparison
- Performance Tuning
- Advanced Configuration

## API-Based Models

### Anthropic Claude

#### Basic Setup

```python
from guidance import models

# Using environment variable
lm = models.Anthropic("claude-sonnet-4-5-20250929")
# Reads ANTHROPIC_API_KEY from environment

# Explicit API key
lm = models.Anthropic(
    model="claude-sonnet-4-5-20250929",
    api_key="your-api-key-here"
)
```

#### Available Models

```python
# Claude 3.5 Sonnet (Latest, recommended)
lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Claude 3.7 Sonnet (Fast, cost-effective)
lm = models.Anthropic("claude-sonnet-3.7-20250219")

# Claude 3 Opus (Most capable)
lm = models.Anthropic("claude-3-opus-20240229")

# Claude 3.5 Haiku (Fastest, cheapest)
lm = models.Anthropic("claude-3-5-haiku-20241022")
```

#### Configuration Options

```python
lm = models.Anthropic(
    model="claude-sonnet-4-5-20250929",
    api_key="your-api-key",
    max_tokens=4096,           # Max tokens to generate
    temperature=0.7,            # Sampling temperature (0-1)
    top_p=0.9,                  # Nucleus sampling
    timeout=30,                 # Request timeout (seconds)
    max_retries=3              # Retry failed requests
)
```

#### With Context Managers

```python
from guidance import models, system, user, assistant, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

with system():
    lm += "You are a helpful assistant."

with user():
    lm += "What is the capital of France?"

with assistant():
    lm += gen(max_tokens=50)

print(lm)
```

### OpenAI

#### Basic Setup

```python
from guidance import models

# Using environment variable
lm = models.OpenAI("gpt-4o")
# Reads OPENAI_API_KEY from environment

# Explicit API key
lm = models.OpenAI(
    model="gpt-4o",
    api_key="your-api-key-here"
)
```

#### Available Models

```python
# GPT-4o (Latest, multimodal)
lm = models.OpenAI("gpt-4o")

# GPT-4o Mini (Fast, cost-effective)
lm = models.OpenAI("gpt-4o-mini")

# GPT-4 Turbo
lm = models.OpenAI("gpt-4-turbo")

# GPT-3.5 Turbo (Cheapest)
lm = models.OpenAI("gpt-3.5-turbo")
```

#### Configuration Options

```python
lm = models.OpenAI(
    model="gpt-4o-mini",
    api_key="your-api-key",
    max_tokens=2048,
    temperature=0.7,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    timeout=30
)
```

#### Chat Format

```python
from guidance import models, gen

lm = models.OpenAI("gpt-4o-mini")

# OpenAI uses chat format
lm += [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is 2+2?"}
]

# Generate response
lm += gen(max_tokens=50)
```

### Azure OpenAI

```python
from guidance import models

lm = models.AzureOpenAI(
    model="gpt-4o",
    azure_endpoint="https://your-resource.openai.azure.com/",
    api_key="your-azure-api-key",
    api_version="2024-02-15-preview",
    deployment_name="your-deployment-name"
)
```

## Local Models

### Transformers (Hugging Face)

#### Basic Setup

```python
from guidance.models import Transformers

# Load model from Hugging Face
lm = Transformers("microsoft/Phi-4-mini-instruct")
```

#### GPU Configuration

```python
# Use GPU
lm = Transformers(
    "microsoft/Phi-4-mini-instruct",
    device="cuda"
)

# Use specific GPU
lm = Transformers(
    "microsoft/Phi-4-mini-instruct",
    device="cuda:0"  # GPU 0
)

# Use CPU
lm = Transformers(
    "microsoft/Phi-4-mini-instruct",
    device="cpu"
)
```

#### Advanced Configuration

```python
lm = Transformers(
    "microsoft/Phi-4-mini-instruct",
    device="cuda",
    torch_dtype="float16",      # Use FP16 (faster, less memory)
    load_in_8bit=True,          # 8-bit quantization
    max_memory={0: "20GB"},     # GPU memory limit
    offload_folder="./offload"  # Offload to disk if needed
)
```

#### Popular Models

```python
# Phi-4 (Microsoft)
lm = Transformers("microsoft/Phi-4-mini-instruct")
lm = Transformers("microsoft/Phi-3-medium-4k-instruct")

# Llama 3 (Meta)
lm = Transformers("meta-llama/Llama-3.1-8B-Instruct")
lm = Transformers("meta-llama/Llama-3.1-70B-Instruct")

# Mistral (Mistral AI)
lm = Transformers("mistralai/Mistral-7B-Instruct-v0.3")
lm = Transformers("mistralai/Mixtral-8x7B-Instruct-v0.1")

# Qwen (Alibaba)
lm = Transformers("Qwen/Qwen2.5-7B-Instruct")

# Gemma (Google)
lm = Transformers("google/gemma-2-9b-it")
```

#### Generation Configuration

```python
lm = Transformers(
    "microsoft/Phi-4-mini-instruct",
    device="cuda"
)

# Configure generation
from guidance import gen

result = lm + gen(
    max_tokens=100,
    temperature=0.7,
    top_p=0.9,
    top_k=50,
    repetition_penalty=1.1
)
```

### llama.cpp

#### Basic Setup

```python
from guidance.models import LlamaCpp

# Load GGUF model
lm = LlamaCpp(
    model_path="/path/to/model.gguf",
    n_ctx=4096  # Context window
)
```

#### GPU Configuration

```python
# Use GPU acceleration
lm = LlamaCpp(
    model_path="/path/to/model.gguf",
    n_ctx=4096,
    n_gpu_layers=35,  # Offload 35 layers to GPU
    n_threads=8       # CPU threads for remaining layers
)

# Full GPU offload
lm = LlamaCpp(
    model_path="/path/to/model.gguf",
    n_ctx=4096,
    n_gpu_layers=-1  # Offload all layers
)
```

#### Advanced Configuration

```python
lm = LlamaCpp(
    model_path="/path/to/llama-3.1-8b-instruct.Q4_K_M.gguf",
    n_ctx=8192,          # Context window (tokens)
    n_gpu_layers=35,     # GPU layers
    n_threads=8,         # CPU threads
    n_batch=512,         # Batch size for prompt processing
    use_mmap=True,       # Memory-map the model file
    use_mlock=False,     # Lock model in RAM
    seed=42,             # Random seed
    verbose=False        # Suppress verbose output
)
```

#### Quantized Models

```python
# Q4_K_M (4-bit, recommended for most cases)
lm = LlamaCpp("/path/to/model.Q4_K_M.gguf")

# Q5_K_M (5-bit, better quality)
lm = LlamaCpp("/path/to/model.Q5_K_M.gguf")

# Q8_0 (8-bit, high quality)
lm = LlamaCpp("/path/to/model.Q8_0.gguf")

# F16 (16-bit float, highest quality)
lm = LlamaCpp("/path/to/model.F16.gguf")
```

#### Popular GGUF Models

```python
# Llama 3.1
lm = LlamaCpp("llama-3.1-8b-instruct.Q4_K_M.gguf")

# Mistral
lm = LlamaCpp("mistral-7b-instruct-v0.3.Q4_K_M.gguf")

# Phi-4
lm = LlamaCpp("phi-4-mini-instruct.Q4_K_M.gguf")
```

## Backend Comparison

### Feature Matrix

| Feature | Anthropic | OpenAI | Transformers | llama.cpp |
|---------|-----------|--------|--------------|-----------|
| Constrained Generation | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Token Healing | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Streaming | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| GPU Support | N/A | N/A | ✅ Yes | ✅ Yes |
| Quantization | N/A | N/A | ✅ Yes | ✅ Yes |
| Cost | $$$ | $$$ | Free | Free |
| Latency | Low | Low | Medium | Low |
| Setup Difficulty | Easy | Easy | Medium | Medium |

### Performance Characteristics

**Anthropic Claude:**
- **Latency**: 200-500ms (API call)
- **Throughput**: Limited by API rate limits
- **Cost**: $3-15 per 1M input tokens
- **Best for**: Production systems, high-quality outputs

**OpenAI:**
- **Latency**: 200-400ms (API call)
- **Throughput**: Limited by API rate limits
- **Cost**: $0.15-30 per 1M input tokens
- **Best for**: Cost-sensitive production, gpt-4o-mini

**Transformers:**
- **Latency**: 50-200ms (local inference)
- **Throughput**: GPU-dependent (10-100 tokens/sec)
- **Cost**: Hardware cost only
- **Best for**: Privacy-sensitive, high-volume, experimentation

**llama.cpp:**
- **Latency**: 30-150ms (local inference)
- **Throughput**: Hardware-dependent (20-150 tokens/sec)
- **Cost**: Hardware cost only
- **Best for**: Edge deployment, Apple Silicon, CPU inference

### Memory Requirements

**Transformers (FP16):**
- 7B model: ~14GB GPU VRAM
- 13B model: ~26GB GPU VRAM
- 70B model: ~140GB GPU VRAM (multi-GPU)

**llama.cpp (Q4_K_M):**
- 7B model: ~4.5GB RAM
- 13B model: ~8GB RAM
- 70B model: ~40GB RAM

**Optimization Tips:**
- Use quantized models (Q4_K_M) for lower memory
- Use GPU offloading for faster inference
- Use CPU inference for smaller models (<7B)

## Performance Tuning

### API Models (Anthropic, OpenAI)

#### Reduce Latency

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Use lower max_tokens (faster response)
lm += gen(max_tokens=100)  # Instead of 1000

# Use streaming (perceived latency reduction)
for chunk in lm.stream(gen(max_tokens=500)):
    print(chunk, end="", flush=True)
```

#### Reduce Cost

```python
# Use cheaper models
lm = models.Anthropic("claude-3-5-haiku-20241022")  # vs Sonnet
lm = models.OpenAI("gpt-4o-mini")  # vs gpt-4o

# Reduce context size
# - Keep prompts concise
# - Avoid large few-shot examples
# - Use max_tokens limits
```

### Local Models (Transformers, llama.cpp)

#### Optimize GPU Usage

```python
from guidance.models import Transformers

# Use FP16 for 2x speedup
lm = Transformers(
    "meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    torch_dtype="float16"
)

# Use 8-bit quantization for 4x memory reduction
lm = Transformers(
    "meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    load_in_8bit=True
)

# Use flash attention (requires flash-attn package)
lm = Transformers(
    "meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    use_flash_attention_2=True
)
```

#### Optimize llama.cpp

```python
from guidance.models import LlamaCpp

# Maximize GPU layers
lm = LlamaCpp(
    model_path="/path/to/model.Q4_K_M.gguf",
    n_gpu_layers=-1  # All layers on GPU
)

# Optimize batch size
lm = LlamaCpp(
    model_path="/path/to/model.Q4_K_M.gguf",
    n_batch=512,     # Larger batch = faster prompt processing
    n_gpu_layers=-1
)

# Use Metal (Apple Silicon)
lm = LlamaCpp(
    model_path="/path/to/model.Q4_K_M.gguf",
    n_gpu_layers=-1,  # Use Metal GPU acceleration
    use_mmap=True
)
```

#### Batch Processing

```python
# Process multiple requests efficiently
requests = [
    "What is 2+2?",
    "What is the capital of France?",
    "What is photosynthesis?"
]

# Bad: Sequential processing
for req in requests:
    lm = Transformers("microsoft/Phi-4-mini-instruct")
    lm += req + gen(max_tokens=50)

# Good: Reuse loaded model
lm = Transformers("microsoft/Phi-4-mini-instruct")
for req in requests:
    lm += req + gen(max_tokens=50)
```

## Advanced Configuration

### Custom Model Configurations

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
from guidance.models import Transformers

# Load custom model
tokenizer = AutoTokenizer.from_pretrained("your-model")
model = AutoModelForCausalLM.from_pretrained(
    "your-model",
    device_map="auto",
    torch_dtype="float16"
)

# Use with Guidance
lm = Transformers(model=model, tokenizer=tokenizer)
```

### Environment Variables

```bash
# API keys
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."

# Transformers cache
export HF_HOME="/path/to/cache"
export TRANSFORMERS_CACHE="/path/to/cache"

# GPU selection
export CUDA_VISIBLE_DEVICES=0,1  # Use GPU 0 and 1
```

### Debugging

```python
# Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Check backend info
lm = models.Anthropic("claude-sonnet-4-5-20250929")
print(f"Model: {lm.model_name}")
print(f"Backend: {lm.backend}")

# Check GPU usage (Transformers)
lm = Transformers("microsoft/Phi-4-mini-instruct", device="cuda")
print(f"Device: {lm.device}")
print(f"Memory allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
```

## Resources

- **Anthropic Docs**: https://docs.anthropic.com
- **OpenAI Docs**: https://platform.openai.com/docs
- **Hugging Face Models**: https://huggingface.co/models
- **llama.cpp**: https://github.com/ggerganov/llama.cpp
- **GGUF Models**: https://huggingface.co/models?library=gguf
