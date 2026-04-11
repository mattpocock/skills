---
name: llama-cpp
description: Runs LLM inference on CPU, Apple Silicon, and consumer GPUs without NVIDIA hardware. Use for edge deployment, M1/M2/M3 Macs, AMD/Intel GPUs, or when CUDA is unavailable. Supports GGUF quantization (1.5-8 bit) for reduced memory and 4-10× speedup vs PyTorch on CPU.
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [llama-cpp-python]
metadata:
  hermes:
    tags: [Inference Serving, Llama.cpp, CPU Inference, Apple Silicon, Edge Deployment, GGUF, Quantization, Non-NVIDIA, AMD GPUs, Intel GPUs, Embedded]

---

# llama.cpp

Pure C/C++ LLM inference with minimal dependencies, optimized for CPUs and non-NVIDIA hardware.

## When to use llama.cpp

**Use llama.cpp when:**
- Running on CPU-only machines
- Deploying on Apple Silicon (M1/M2/M3/M4)
- Using AMD or Intel GPUs (no CUDA)
- Edge deployment (Raspberry Pi, embedded systems)
- Need simple deployment without Docker/Python

**Use TensorRT-LLM instead when:**
- Have NVIDIA GPUs (A100/H100)
- Need maximum throughput (100K+ tok/s)
- Running in datacenter with CUDA

**Use vLLM instead when:**
- Have NVIDIA GPUs
- Need Python-first API
- Want PagedAttention

## Quick start

### Installation

```bash
# macOS/Linux
brew install llama.cpp

# Or build from source
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# With Metal (Apple Silicon)
make LLAMA_METAL=1

# With CUDA (NVIDIA)
make LLAMA_CUDA=1

# With ROCm (AMD)
make LLAMA_HIP=1
```

### Download model

```bash
# Download from HuggingFace (GGUF format)
huggingface-cli download \
    TheBloke/Llama-2-7B-Chat-GGUF \
    llama-2-7b-chat.Q4_K_M.gguf \
    --local-dir models/

# Or convert from HuggingFace
python convert_hf_to_gguf.py models/llama-2-7b-chat/
```

### Run inference

```bash
# Simple chat
./llama-cli \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    -p "Explain quantum computing" \
    -n 256  # Max tokens

# Interactive chat
./llama-cli \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    --interactive
```

### Server mode

```bash
# Start OpenAI-compatible server
./llama-server \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -ngl 32  # Offload 32 layers to GPU

# Client request
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-2-7b-chat",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## Quantization formats

### GGUF format overview

| Format | Bits | Size (7B) | Speed | Quality | Use Case |
|--------|------|-----------|-------|---------|----------|
| **Q4_K_M** | 4.5 | 4.1 GB | Fast | Good | **Recommended default** |
| Q4_K_S | 4.3 | 3.9 GB | Faster | Lower | Speed critical |
| Q5_K_M | 5.5 | 4.8 GB | Medium | Better | Quality critical |
| Q6_K | 6.5 | 5.5 GB | Slower | Best | Maximum quality |
| Q8_0 | 8.0 | 7.0 GB | Slow | Excellent | Minimal degradation |
| Q2_K | 2.5 | 2.7 GB | Fastest | Poor | Testing only |

### Choosing quantization

```bash
# General use (balanced)
Q4_K_M  # 4-bit, medium quality

# Maximum speed (more degradation)
Q2_K or Q3_K_M

# Maximum quality (slower)
Q6_K or Q8_0

# Very large models (70B, 405B)
Q3_K_M or Q4_K_S  # Lower bits to fit in memory
```

## Hardware acceleration

### Apple Silicon (Metal)

```bash
# Build with Metal
make LLAMA_METAL=1

# Run with GPU acceleration (automatic)
./llama-cli -m model.gguf -ngl 999  # Offload all layers

# Performance: M3 Max 40-60 tokens/sec (Llama 2-7B Q4_K_M)
```

### NVIDIA GPUs (CUDA)

```bash
# Build with CUDA
make LLAMA_CUDA=1

# Offload layers to GPU
./llama-cli -m model.gguf -ngl 35  # Offload 35/40 layers

# Hybrid CPU+GPU for large models
./llama-cli -m llama-70b.Q4_K_M.gguf -ngl 20  # GPU: 20 layers, CPU: rest
```

### AMD GPUs (ROCm)

```bash
# Build with ROCm
make LLAMA_HIP=1

# Run with AMD GPU
./llama-cli -m model.gguf -ngl 999
```

## Common patterns

### Batch processing

```bash
# Process multiple prompts from file
cat prompts.txt | ./llama-cli \
    -m model.gguf \
    --batch-size 512 \
    -n 100
```

### Constrained generation

```bash
# JSON output with grammar
./llama-cli \
    -m model.gguf \
    -p "Generate a person: " \
    --grammar-file grammars/json.gbnf

# Outputs valid JSON only
```

### Context size

```bash
# Increase context (default 512)
./llama-cli \
    -m model.gguf \
    -c 4096  # 4K context window

# Very long context (if model supports)
./llama-cli -m model.gguf -c 32768  # 32K context
```

## Performance benchmarks

### CPU performance (Llama 2-7B Q4_K_M)

| CPU | Threads | Speed | Cost |
|-----|---------|-------|------|
| Apple M3 Max | 16 | 50 tok/s | $0 (local) |
| AMD Ryzen 9 7950X | 32 | 35 tok/s | $0.50/hour |
| Intel i9-13900K | 32 | 30 tok/s | $0.40/hour |
| AWS c7i.16xlarge | 64 | 40 tok/s | $2.88/hour |

### GPU acceleration (Llama 2-7B Q4_K_M)

| GPU | Speed | vs CPU | Cost |
|-----|-------|--------|------|
| NVIDIA RTX 4090 | 120 tok/s | 3-4× | $0 (local) |
| NVIDIA A10 | 80 tok/s | 2-3× | $1.00/hour |
| AMD MI250 | 70 tok/s | 2× | $2.00/hour |
| Apple M3 Max (Metal) | 50 tok/s | ~Same | $0 (local) |

## Supported models

**LLaMA family**:
- Llama 2 (7B, 13B, 70B)
- Llama 3 (8B, 70B, 405B)
- Code Llama

**Mistral family**:
- Mistral 7B
- Mixtral 8x7B, 8x22B

**Other**:
- Falcon, BLOOM, GPT-J
- Phi-3, Gemma, Qwen
- LLaVA (vision), Whisper (audio)

**Find models**: https://huggingface.co/models?library=gguf

## References

- **[Quantization Guide](references/quantization.md)** - GGUF formats, conversion, quality comparison
- **[Server Deployment](references/server.md)** - API endpoints, Docker, monitoring
- **[Optimization](references/optimization.md)** - Performance tuning, hybrid CPU+GPU

## Resources

- **GitHub**: https://github.com/ggerganov/llama.cpp
- **Models**: https://huggingface.co/models?library=gguf
- **Discord**: https://discord.gg/llama-cpp


