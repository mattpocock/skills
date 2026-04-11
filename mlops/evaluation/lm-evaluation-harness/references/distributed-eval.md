# Distributed Evaluation

Guide to running evaluation across multiple GPUs using data parallelism and tensor/pipeline parallelism.

## Overview

Distributed evaluation speeds up benchmarking by:
- **Data Parallelism**: Split evaluation samples across GPUs (each GPU has full model copy)
- **Tensor Parallelism**: Split model weights across GPUs (for large models)
- **Pipeline Parallelism**: Split model layers across GPUs (for very large models)

**When to use**:
- Data Parallel: Model fits on single GPU, want faster evaluation
- Tensor/Pipeline Parallel: Model too large for single GPU

## HuggingFace Models (`hf`)

### Data Parallelism (Recommended)

Each GPU loads a full copy of the model and processes a subset of evaluation data.

**Single Node (8 GPUs)**:
```bash
accelerate launch --multi_gpu --num_processes 8 \
  -m lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf,dtype=bfloat16 \
  --tasks mmlu,gsm8k,hellaswag \
  --batch_size 16
```

**Speedup**: Near-linear (8 GPUs = ~8× faster)

**Memory**: Each GPU needs full model (7B model ≈ 14GB × 8 = 112GB total)

### Tensor Parallelism (Model Sharding)

Split model weights across GPUs for models too large for single GPU.

**Without accelerate launcher**:
```bash
lm_eval --model hf \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    parallelize=True,\
    dtype=bfloat16 \
  --tasks mmlu,gsm8k \
  --batch_size 8
```

**With 8 GPUs**: 70B model (140GB) / 8 = 17.5GB per GPU ✅

**Advanced sharding**:
```bash
lm_eval --model hf \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    parallelize=True,\
    device_map_option=auto,\
    max_memory_per_gpu=40GB,\
    max_cpu_memory=100GB,\
    dtype=bfloat16 \
  --tasks mmlu
```

**Options**:
- `device_map_option`: `"auto"` (default), `"balanced"`, `"balanced_low_0"`
- `max_memory_per_gpu`: Max memory per GPU (e.g., `"40GB"`)
- `max_cpu_memory`: Max CPU memory for offloading
- `offload_folder`: Disk offloading directory

### Combined Data + Tensor Parallelism

Use both for very large models.

**Example: 70B model on 16 GPUs (2 copies, 8 GPUs each)**:
```bash
accelerate launch --multi_gpu --num_processes 2 \
  -m lm_eval --model hf \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    parallelize=True,\
    dtype=bfloat16 \
  --tasks mmlu \
  --batch_size 8
```

**Result**: 2× speedup from data parallelism, 70B model fits via tensor parallelism

### Configuration with `accelerate config`

Create `~/.cache/huggingface/accelerate/default_config.yaml`:
```yaml
compute_environment: LOCAL_MACHINE
distributed_type: MULTI_GPU
num_machines: 1
num_processes: 8
gpu_ids: all
mixed_precision: bf16
```

**Then run**:
```bash
accelerate launch -m lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu
```

## vLLM Models (`vllm`)

vLLM provides highly optimized distributed inference.

### Tensor Parallelism

**Single Node (4 GPUs)**:
```bash
lm_eval --model vllm \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    tensor_parallel_size=4,\
    dtype=auto,\
    gpu_memory_utilization=0.9 \
  --tasks mmlu,gsm8k \
  --batch_size auto
```

**Memory**: 70B model split across 4 GPUs = ~35GB per GPU

### Data Parallelism

**Multiple model replicas**:
```bash
lm_eval --model vllm \
  --model_args \
    pretrained=meta-llama/Llama-2-7b-hf,\
    data_parallel_size=4,\
    dtype=auto,\
    gpu_memory_utilization=0.8 \
  --tasks hellaswag,arc_challenge \
  --batch_size auto
```

**Result**: 4 model replicas = 4× throughput

### Combined Tensor + Data Parallelism

**Example: 8 GPUs = 4 TP × 2 DP**:
```bash
lm_eval --model vllm \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    tensor_parallel_size=4,\
    data_parallel_size=2,\
    dtype=auto,\
    gpu_memory_utilization=0.85 \
  --tasks mmlu \
  --batch_size auto
```

**Result**: 70B model fits (TP=4), 2× speedup (DP=2)

### Multi-Node vLLM

vLLM doesn't natively support multi-node. Use Ray:

```bash
# Start Ray cluster
ray start --head --port=6379

# Run evaluation
lm_eval --model vllm \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    tensor_parallel_size=8,\
    dtype=auto \
  --tasks mmlu
```

## NVIDIA NeMo Models (`nemo_lm`)

### Data Replication

**8 replicas on 8 GPUs**:
```bash
torchrun --nproc-per-node=8 --no-python \
  lm_eval --model nemo_lm \
  --model_args \
    path=/path/to/model.nemo,\
    devices=8 \
  --tasks hellaswag,arc_challenge \
  --batch_size 32
```

**Speedup**: Near-linear (8× faster)

### Tensor Parallelism

**4-way tensor parallelism**:
```bash
torchrun --nproc-per-node=4 --no-python \
  lm_eval --model nemo_lm \
  --model_args \
    path=/path/to/70b_model.nemo,\
    devices=4,\
    tensor_model_parallel_size=4 \
  --tasks mmlu,gsm8k \
  --batch_size 16
```

### Pipeline Parallelism

**2 TP × 2 PP on 4 GPUs**:
```bash
torchrun --nproc-per-node=4 --no-python \
  lm_eval --model nemo_lm \
  --model_args \
    path=/path/to/model.nemo,\
    devices=4,\
    tensor_model_parallel_size=2,\
    pipeline_model_parallel_size=2 \
  --tasks mmlu \
  --batch_size 8
```

**Constraint**: `devices = TP × PP`

### Multi-Node NeMo

Currently not supported by lm-evaluation-harness.

## SGLang Models (`sglang`)

### Tensor Parallelism

```bash
lm_eval --model sglang \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    tp_size=4,\
    dtype=auto \
  --tasks gsm8k \
  --batch_size auto
```

### Data Parallelism (Deprecated)

**Note**: SGLang is deprecating data parallelism. Use tensor parallelism instead.

```bash
lm_eval --model sglang \
  --model_args \
    pretrained=meta-llama/Llama-2-7b-hf,\
    dp_size=4,\
    dtype=auto \
  --tasks mmlu
```

## Performance Comparison

### 70B Model Evaluation (MMLU, 5-shot)

| Method | GPUs | Time | Memory/GPU | Notes |
|--------|------|------|------------|-------|
| HF (no parallel) | 1 | 8 hours | 140GB (OOM) | Won't fit |
| HF (TP=8) | 8 | 2 hours | 17.5GB | Slower, fits |
| HF (DP=8) | 8 | 1 hour | 140GB (OOM) | Won't fit |
| vLLM (TP=4) | 4 | 30 min | 35GB | Fast! |
| vLLM (TP=4, DP=2) | 8 | 15 min | 35GB | Fastest |

### 7B Model Evaluation (Multiple Tasks)

| Method | GPUs | Time | Speedup |
|--------|------|------|---------|
| HF (single) | 1 | 4 hours | 1× |
| HF (DP=4) | 4 | 1 hour | 4× |
| HF (DP=8) | 8 | 30 min | 8× |
| vLLM (DP=8) | 8 | 15 min | 16× |

**Takeaway**: vLLM is significantly faster than HuggingFace for inference.

## Choosing Parallelism Strategy

### Decision Tree

```
Model fits on single GPU?
├─ YES: Use data parallelism
│   ├─ HF: accelerate launch --multi_gpu --num_processes N
│   └─ vLLM: data_parallel_size=N (fastest)
│
└─ NO: Use tensor/pipeline parallelism
    ├─ Model < 70B:
    │   └─ vLLM: tensor_parallel_size=4
    ├─ Model 70-175B:
    │   ├─ vLLM: tensor_parallel_size=8
    │   └─ Or HF: parallelize=True
    └─ Model > 175B:
        └─ Contact framework authors
```

### Memory Estimation

**Rule of thumb**:
```
Memory (GB) = Parameters (B) × Precision (bytes) × 1.2 (overhead)
```

**Examples**:
- 7B FP16: 7 × 2 × 1.2 = 16.8GB ✅ Fits A100 40GB
- 13B FP16: 13 × 2 × 1.2 = 31.2GB ✅ Fits A100 40GB
- 70B FP16: 70 × 2 × 1.2 = 168GB ❌ Need TP=4 or TP=8
- 70B BF16: 70 × 2 × 1.2 = 168GB (same as FP16)

**With tensor parallelism**:
```
Memory per GPU = Total Memory / TP
```

- 70B on 4 GPUs: 168GB / 4 = 42GB per GPU ✅
- 70B on 8 GPUs: 168GB / 8 = 21GB per GPU ✅

## Multi-Node Evaluation

### HuggingFace with SLURM

**Submit job**:
```bash
#!/bin/bash
#SBATCH --nodes=4
#SBATCH --gpus-per-node=8
#SBATCH --ntasks-per-node=1

srun accelerate launch --multi_gpu \
  --num_processes $((SLURM_NNODES * 8)) \
  -m lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu,gsm8k,hellaswag \
  --batch_size 16
```

**Submit**:
```bash
sbatch eval_job.sh
```

### Manual Multi-Node Setup

**On each node, run**:
```bash
accelerate launch \
  --multi_gpu \
  --num_machines 4 \
  --num_processes 32 \
  --main_process_ip $MASTER_IP \
  --main_process_port 29500 \
  --machine_rank $NODE_RANK \
  -m lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu
```

**Environment variables**:
- `MASTER_IP`: IP of rank 0 node
- `NODE_RANK`: 0, 1, 2, 3 for each node

## Best Practices

### 1. Start Small

Test on small sample first:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-70b-hf,parallelize=True \
  --tasks mmlu \
  --limit 100  # Just 100 samples
```

### 2. Monitor GPU Usage

```bash
# Terminal 1: Run evaluation
lm_eval --model hf ...

# Terminal 2: Monitor
watch -n 1 nvidia-smi
```

Look for:
- GPU utilization > 90%
- Memory usage stable
- All GPUs active

### 3. Optimize Batch Size

```bash
# Auto batch size (recommended)
--batch_size auto

# Or tune manually
--batch_size 16  # Start here
--batch_size 32  # Increase if memory allows
```

### 4. Use Mixed Precision

```bash
--model_args dtype=bfloat16  # Faster, less memory
```

### 5. Check Communication

For data parallelism, check network bandwidth:
```bash
# Should see InfiniBand or high-speed network
nvidia-smi topo -m
```

## Troubleshooting

### "CUDA out of memory"

**Solutions**:
1. Increase tensor parallelism:
   ```bash
   --model_args tensor_parallel_size=8  # Was 4
   ```

2. Reduce batch size:
   ```bash
   --batch_size 4  # Was 16
   ```

3. Lower precision:
   ```bash
   --model_args dtype=int8  # Quantization
   ```

### "NCCL error" or Hanging

**Check**:
1. All GPUs visible: `nvidia-smi`
2. NCCL installed: `python -c "import torch; print(torch.cuda.nccl.version())"`
3. Network connectivity between nodes

**Fix**:
```bash
export NCCL_DEBUG=INFO  # Enable debug logging
export NCCL_IB_DISABLE=0  # Use InfiniBand if available
```

### Slow Evaluation

**Possible causes**:
1. **Data loading bottleneck**: Preprocess dataset
2. **Low GPU utilization**: Increase batch size
3. **Communication overhead**: Reduce parallelism degree

**Profile**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu \
  --limit 100 \
  --log_samples  # Check timing
```

### GPUs Imbalanced

**Symptom**: GPU 0 at 100%, others at 50%

**Solution**: Use `device_map_option=balanced`:
```bash
--model_args parallelize=True,device_map_option=balanced
```

## Example Configurations

### Small Model (7B) - Fast Evaluation

```bash
# 8 A100s, data parallel
accelerate launch --multi_gpu --num_processes 8 \
  -m lm_eval --model hf \
  --model_args \
    pretrained=meta-llama/Llama-2-7b-hf,\
    dtype=bfloat16 \
  --tasks mmlu,gsm8k,hellaswag,arc_challenge \
  --num_fewshot 5 \
  --batch_size 32

# Time: ~30 minutes
```

### Large Model (70B) - vLLM

```bash
# 8 H100s, tensor parallel
lm_eval --model vllm \
  --model_args \
    pretrained=meta-llama/Llama-2-70b-hf,\
    tensor_parallel_size=8,\
    dtype=auto,\
    gpu_memory_utilization=0.9 \
  --tasks mmlu,gsm8k,humaneval \
  --num_fewshot 5 \
  --batch_size auto

# Time: ~1 hour
```

### Very Large Model (175B+)

**Requires specialized setup - contact framework maintainers**

## References

- HuggingFace Accelerate: https://huggingface.co/docs/accelerate/
- vLLM docs: https://docs.vllm.ai/
- NeMo docs: https://docs.nvidia.com/nemo-framework/
- lm-eval distributed guide: `docs/model_guide.md`
