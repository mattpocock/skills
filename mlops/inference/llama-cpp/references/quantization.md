# GGUF Quantization Guide

Complete guide to GGUF quantization formats and model conversion.

## Quantization Overview

**GGUF** (GPT-Generated Unified Format) - Standard format for llama.cpp models.

### Format Comparison

| Format | Perplexity | Size (7B) | Tokens/sec | Notes |
|--------|------------|-----------|------------|-------|
| FP16 | 5.9565 (baseline) | 13.0 GB | 15 tok/s | Original quality |
| Q8_0 | 5.9584 (+0.03%) | 7.0 GB | 25 tok/s | Nearly lossless |
| **Q6_K** | 5.9642 (+0.13%) | 5.5 GB | 30 tok/s | Best quality/size |
| **Q5_K_M** | 5.9796 (+0.39%) | 4.8 GB | 35 tok/s | Balanced |
| **Q4_K_M** | 6.0565 (+1.68%) | 4.1 GB | 40 tok/s | **Recommended** |
| Q4_K_S | 6.1125 (+2.62%) | 3.9 GB | 42 tok/s | Faster, lower quality |
| Q3_K_M | 6.3184 (+6.07%) | 3.3 GB | 45 tok/s | Small models only |
| Q2_K | 6.8673 (+15.3%) | 2.7 GB | 50 tok/s | Not recommended |

**Recommendation**: Use **Q4_K_M** for best balance of quality and speed.

## Converting Models

### HuggingFace to GGUF

```bash
# 1. Download HuggingFace model
huggingface-cli download meta-llama/Llama-2-7b-chat-hf \
    --local-dir models/llama-2-7b-chat/

# 2. Convert to FP16 GGUF
python convert_hf_to_gguf.py \
    models/llama-2-7b-chat/ \
    --outtype f16 \
    --outfile models/llama-2-7b-chat-f16.gguf

# 3. Quantize to Q4_K_M
./llama-quantize \
    models/llama-2-7b-chat-f16.gguf \
    models/llama-2-7b-chat-Q4_K_M.gguf \
    Q4_K_M
```

### Batch quantization

```bash
# Quantize to multiple formats
for quant in Q4_K_M Q5_K_M Q6_K Q8_0; do
    ./llama-quantize \
        model-f16.gguf \
        model-${quant}.gguf \
        $quant
done
```

## K-Quantization Methods

**K-quants** use mixed precision for better quality:
- Attention weights: Higher precision
- Feed-forward weights: Lower precision

**Variants**:
- `_S` (Small): Faster, lower quality
- `_M` (Medium): Balanced (recommended)
- `_L` (Large): Better quality, larger size

**Example**: `Q4_K_M`
- `Q4`: 4-bit quantization
- `K`: Mixed precision method
- `M`: Medium quality

## Quality Testing

```bash
# Calculate perplexity (quality metric)
./llama-perplexity \
    -m model.gguf \
    -f wikitext-2-raw/wiki.test.raw \
    -c 512

# Lower perplexity = better quality
# Baseline (FP16): ~5.96
# Q4_K_M: ~6.06 (+1.7%)
# Q2_K: ~6.87 (+15.3% - too much degradation)
```

## Use Case Guide

### General purpose (chatbots, assistants)
```
Q4_K_M - Best balance
Q5_K_M - If you have extra RAM
```

### Code generation
```
Q5_K_M or Q6_K - Higher precision helps with code
```

### Creative writing
```
Q4_K_M - Sufficient quality
Q3_K_M - Acceptable for draft generation
```

### Technical/medical
```
Q6_K or Q8_0 - Maximum accuracy
```

### Edge devices (Raspberry Pi)
```
Q2_K or Q3_K_S - Fit in limited RAM
```

## Model Size Scaling

### 7B parameter models

| Format | Size | RAM needed |
|--------|------|------------|
| Q2_K | 2.7 GB | 5 GB |
| Q3_K_M | 3.3 GB | 6 GB |
| Q4_K_M | 4.1 GB | 7 GB |
| Q5_K_M | 4.8 GB | 8 GB |
| Q6_K | 5.5 GB | 9 GB |
| Q8_0 | 7.0 GB | 11 GB |

### 13B parameter models

| Format | Size | RAM needed |
|--------|------|------------|
| Q2_K | 5.1 GB | 8 GB |
| Q3_K_M | 6.2 GB | 10 GB |
| Q4_K_M | 7.9 GB | 12 GB |
| Q5_K_M | 9.2 GB | 14 GB |
| Q6_K | 10.7 GB | 16 GB |

### 70B parameter models

| Format | Size | RAM needed |
|--------|------|------------|
| Q2_K | 26 GB | 32 GB |
| Q3_K_M | 32 GB | 40 GB |
| Q4_K_M | 41 GB | 48 GB |
| Q4_K_S | 39 GB | 46 GB |
| Q5_K_M | 48 GB | 56 GB |

**Recommendation for 70B**: Use Q3_K_M or Q4_K_S to fit in consumer hardware.

## Finding Pre-Quantized Models

**TheBloke** on HuggingFace:
- https://huggingface.co/TheBloke
- Most models available in all GGUF formats
- No conversion needed

**Example**:
```bash
# Download pre-quantized Llama 2-7B
huggingface-cli download \
    TheBloke/Llama-2-7B-Chat-GGUF \
    llama-2-7b-chat.Q4_K_M.gguf \
    --local-dir models/
```

## Importance Matrices (imatrix)

**What**: Calibration data to improve quantization quality.

**Benefits**:
- 10-20% perplexity improvement with Q4
- Essential for Q3 and below

**Usage**:
```bash
# 1. Generate importance matrix
./llama-imatrix \
    -m model-f16.gguf \
    -f calibration-data.txt \
    -o model.imatrix

# 2. Quantize with imatrix
./llama-quantize \
    --imatrix model.imatrix \
    model-f16.gguf \
    model-Q4_K_M.gguf \
    Q4_K_M
```

**Calibration data**:
- Use domain-specific text (e.g., code for code models)
- ~100MB of representative text
- Higher quality data = better quantization

## Troubleshooting

**Model outputs gibberish**:
- Quantization too aggressive (Q2_K)
- Try Q4_K_M or Q5_K_M
- Verify model converted correctly

**Out of memory**:
- Use lower quantization (Q4_K_S instead of Q5_K_M)
- Offload fewer layers to GPU (`-ngl`)
- Use smaller context (`-c 2048`)

**Slow inference**:
- Higher quantization uses more compute
- Q8_0 much slower than Q4_K_M
- Consider speed vs quality trade-off
