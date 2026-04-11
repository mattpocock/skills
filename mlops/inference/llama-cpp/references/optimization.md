# Performance Optimization Guide

Maximize llama.cpp inference speed and efficiency.

## CPU Optimization

### Thread tuning
```bash
# Set threads (default: physical cores)
./llama-cli -m model.gguf -t 8

# For AMD Ryzen 9 7950X (16 cores, 32 threads)
-t 16  # Best: physical cores

# Avoid hyperthreading (slower for matrix ops)
```

### BLAS acceleration
```bash
# OpenBLAS (faster matrix ops)
make LLAMA_OPENBLAS=1

# BLAS gives 2-3× speedup
```

## GPU Offloading

### Layer offloading
```bash
# Offload 35 layers to GPU (hybrid mode)
./llama-cli -m model.gguf -ngl 35

# Offload all layers
./llama-cli -m model.gguf -ngl 999

# Find optimal value:
# Start with -ngl 999
# If OOM, reduce by 5 until fits
```

### Memory usage
```bash
# Check VRAM usage
nvidia-smi dmon

# Reduce context if needed
./llama-cli -m model.gguf -c 2048  # 2K context instead of 4K
```

## Batch Processing

```bash
# Increase batch size for throughput
./llama-cli -m model.gguf -b 512  # Default: 512

# Physical batch (GPU)
--ubatch 128  # Process 128 tokens at once
```

## Context Management

```bash
# Default context (512 tokens)
-c 512

# Longer context (slower, more memory)
-c 4096

# Very long context (if model supports)
-c 32768
```

## Benchmarks

### CPU Performance (Llama 2-7B Q4_K_M)

| Setup | Speed | Notes |
|-------|-------|-------|
| Apple M3 Max | 50 tok/s | Metal acceleration |
| AMD 7950X (16c) | 35 tok/s | OpenBLAS |
| Intel i9-13900K | 30 tok/s | AVX2 |

### GPU Offloading (RTX 4090)

| Layers GPU | Speed | VRAM |
|------------|-------|------|
| 0 (CPU only) | 30 tok/s | 0 GB |
| 20 (hybrid) | 80 tok/s | 8 GB |
| 35 (all) | 120 tok/s | 12 GB |
