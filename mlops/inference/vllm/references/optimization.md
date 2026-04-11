# Performance Optimization

## Contents
- PagedAttention explained
- Continuous batching mechanics
- Prefix caching strategies
- Speculative decoding setup
- Benchmark results and comparisons
- Performance tuning guide

## PagedAttention explained

**Traditional attention problem**:
- KV cache stored in contiguous memory
- Wastes ~50% GPU memory due to fragmentation
- Cannot dynamically reallocate for varying sequence lengths

**PagedAttention solution**:
- Divides KV cache into fixed-size blocks (like OS virtual memory)
- Dynamic allocation from free block queue
- Shares blocks across sequences (for prefix caching)

**Memory savings example**:
```
Traditional: 70B model needs 160GB KV cache → OOM on 8x A100
PagedAttention: 70B model needs 80GB KV cache → Fits on 4x A100
```

**Configuration**:
```bash
# Block size (default: 16 tokens)
vllm serve MODEL --block-size 16

# Number of GPU blocks (auto-calculated)
# Controlled by --gpu-memory-utilization
vllm serve MODEL --gpu-memory-utilization 0.9
```

## Continuous batching mechanics

**Traditional batching**:
- Wait for all sequences in batch to finish
- GPU idle while waiting for longest sequence
- Low GPU utilization (~40-60%)

**Continuous batching**:
- Add new requests as slots become available
- Mix prefill (new requests) and decode (ongoing) in same batch
- High GPU utilization (>90%)

**Throughput improvement**:
```
Traditional batching: 50 req/sec @ 50% GPU util
Continuous batching: 200 req/sec @ 90% GPU util
= 4x throughput improvement
```

**Tuning parameters**:
```bash
# Max concurrent sequences (higher = more batching)
vllm serve MODEL --max-num-seqs 256

# Prefill/decode schedule (auto-balanced by default)
# No manual tuning needed
```

## Prefix caching strategies

Reuse computed KV cache for common prompt prefixes.

**Use cases**:
- System prompts repeated across requests
- Few-shot examples in every prompt
- RAG contexts with overlapping chunks

**Example savings**:
```
Prompt: [System: 500 tokens] + [User: 100 tokens]

Without caching: Compute 600 tokens every request
With caching: Compute 500 tokens once, then 100 tokens/request
= 83% faster TTFT
```

**Enable prefix caching**:
```bash
vllm serve MODEL --enable-prefix-caching
```

**Automatic prefix detection**:
- vLLM detects common prefixes automatically
- No code changes required
- Works with OpenAI-compatible API

**Cache hit rate monitoring**:
```bash
curl http://localhost:9090/metrics | grep cache_hit
# vllm_cache_hit_rate: 0.75  (75% hit rate)
```

## Speculative decoding setup

Use smaller "draft" model to propose tokens, larger model to verify.

**Speed improvement**:
```
Standard: Generate 1 token per forward pass
Speculative: Generate 3-5 tokens per forward pass
= 2-3x faster generation
```

**How it works**:
1. Draft model proposes K tokens (fast)
2. Target model verifies all K tokens in parallel (one pass)
3. Accept verified tokens, restart from first rejection

**Setup with separate draft model**:
```bash
vllm serve meta-llama/Llama-3-70B-Instruct \
  --speculative-model TinyLlama/TinyLlama-1.1B-Chat-v1.0 \
  --num-speculative-tokens 5
```

**Setup with n-gram draft** (no separate model):
```bash
vllm serve MODEL \
  --speculative-method ngram \
  --num-speculative-tokens 3
```

**When to use**:
- Output length > 100 tokens
- Draft model 5-10x smaller than target
- Acceptable 2-3% accuracy trade-off

## Benchmark results

**vLLM vs HuggingFace Transformers** (Llama 3 8B, A100):
```
Metric                  | HF Transformers | vLLM   | Improvement
------------------------|-----------------|--------|------------
Throughput (req/sec)    | 12              | 280    | 23x
TTFT (ms)              | 850             | 120    | 7x
Tokens/sec             | 45              | 2,100  | 47x
GPU Memory (GB)        | 28              | 16     | 1.75x less
```

**vLLM vs TensorRT-LLM** (Llama 2 70B, 4x A100):
```
Metric                  | TensorRT-LLM | vLLM   | Notes
------------------------|--------------|--------|------------------
Throughput (req/sec)    | 320          | 285    | TRT 12% faster
Setup complexity        | High         | Low    | vLLM much easier
NVIDIA-only            | Yes          | No     | vLLM multi-platform
Quantization support    | FP8, INT8    | AWQ/GPTQ/FP8 | vLLM more options
```

## Performance tuning guide

**Step 1: Measure baseline**

```bash
# Install benchmarking tool
pip install locust

# Run baseline benchmark
vllm bench throughput \
  --model MODEL \
  --input-tokens 128 \
  --output-tokens 256 \
  --num-prompts 1000

# Record: throughput, TTFT, tokens/sec
```

**Step 2: Tune memory utilization**

```bash
# Try different values: 0.7, 0.85, 0.9, 0.95
vllm serve MODEL --gpu-memory-utilization 0.9
```

Higher = more batch capacity = higher throughput, but risk OOM.

**Step 3: Tune concurrency**

```bash
# Try values: 128, 256, 512, 1024
vllm serve MODEL --max-num-seqs 256
```

Higher = more batching opportunity, but may increase latency.

**Step 4: Enable optimizations**

```bash
vllm serve MODEL \
  --enable-prefix-caching \     # For repeated prompts
  --enable-chunked-prefill \    # For long prompts
  --gpu-memory-utilization 0.9 \
  --max-num-seqs 512
```

**Step 5: Re-benchmark and compare**

Target improvements:
- Throughput: +30-100%
- TTFT: -20-50%
- GPU utilization: >85%

**Common performance issues**:

**Low throughput (<50 req/sec)**:
- Increase `--max-num-seqs`
- Enable `--enable-prefix-caching`
- Check GPU utilization (should be >80%)

**High TTFT (>1 second)**:
- Enable `--enable-chunked-prefill`
- Reduce `--max-model-len` if possible
- Check if model is too large for GPU

**OOM errors**:
- Reduce `--gpu-memory-utilization` to 0.7
- Reduce `--max-model-len`
- Use quantization (`--quantization awq`)
