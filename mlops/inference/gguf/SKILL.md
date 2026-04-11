---
name: gguf-quantization
description: GGUF format and llama.cpp quantization for efficient CPU/GPU inference. Use when deploying models on consumer hardware, Apple Silicon, or when needing flexible quantization from 2-8 bit without GPU requirements.
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [llama-cpp-python>=0.2.0]
metadata:
  hermes:
    tags: [GGUF, Quantization, llama.cpp, CPU Inference, Apple Silicon, Model Compression, Optimization]

---

# GGUF - Quantization Format for llama.cpp

The GGUF (GPT-Generated Unified Format) is the standard file format for llama.cpp, enabling efficient inference on CPUs, Apple Silicon, and GPUs with flexible quantization options.

## When to use GGUF

**Use GGUF when:**
- Deploying on consumer hardware (laptops, desktops)
- Running on Apple Silicon (M1/M2/M3) with Metal acceleration
- Need CPU inference without GPU requirements
- Want flexible quantization (Q2_K to Q8_0)
- Using local AI tools (LM Studio, Ollama, text-generation-webui)

**Key advantages:**
- **Universal hardware**: CPU, Apple Silicon, NVIDIA, AMD support
- **No Python runtime**: Pure C/C++ inference
- **Flexible quantization**: 2-8 bit with various methods (K-quants)
- **Ecosystem support**: LM Studio, Ollama, koboldcpp, and more
- **imatrix**: Importance matrix for better low-bit quality

**Use alternatives instead:**
- **AWQ/GPTQ**: Maximum accuracy with calibration on NVIDIA GPUs
- **HQQ**: Fast calibration-free quantization for HuggingFace
- **bitsandbytes**: Simple integration with transformers library
- **TensorRT-LLM**: Production NVIDIA deployment with maximum speed

## Quick start

### Installation

```bash
# Clone llama.cpp
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp

# Build (CPU)
make

# Build with CUDA (NVIDIA)
make GGML_CUDA=1

# Build with Metal (Apple Silicon)
make GGML_METAL=1

# Install Python bindings (optional)
pip install llama-cpp-python
```

### Convert model to GGUF

```bash
# Install requirements
pip install -r requirements.txt

# Convert HuggingFace model to GGUF (FP16)
python convert_hf_to_gguf.py ./path/to/model --outfile model-f16.gguf

# Or specify output type
python convert_hf_to_gguf.py ./path/to/model \
    --outfile model-f16.gguf \
    --outtype f16
```

### Quantize model

```bash
# Basic quantization to Q4_K_M
./llama-quantize model-f16.gguf model-q4_k_m.gguf Q4_K_M

# Quantize with importance matrix (better quality)
./llama-imatrix -m model-f16.gguf -f calibration.txt -o model.imatrix
./llama-quantize --imatrix model.imatrix model-f16.gguf model-q4_k_m.gguf Q4_K_M
```

### Run inference

```bash
# CLI inference
./llama-cli -m model-q4_k_m.gguf -p "Hello, how are you?"

# Interactive mode
./llama-cli -m model-q4_k_m.gguf --interactive

# With GPU offload
./llama-cli -m model-q4_k_m.gguf -ngl 35 -p "Hello!"
```

## Quantization types

### K-quant methods (recommended)

| Type | Bits | Size (7B) | Quality | Use Case |
|------|------|-----------|---------|----------|
| Q2_K | 2.5 | ~2.8 GB | Low | Extreme compression |
| Q3_K_S | 3.0 | ~3.0 GB | Low-Med | Memory constrained |
| Q3_K_M | 3.3 | ~3.3 GB | Medium | Balance |
| Q4_K_S | 4.0 | ~3.8 GB | Med-High | Good balance |
| Q4_K_M | 4.5 | ~4.1 GB | High | **Recommended default** |
| Q5_K_S | 5.0 | ~4.6 GB | High | Quality focused |
| Q5_K_M | 5.5 | ~4.8 GB | Very High | High quality |
| Q6_K | 6.0 | ~5.5 GB | Excellent | Near-original |
| Q8_0 | 8.0 | ~7.2 GB | Best | Maximum quality |

### Legacy methods

| Type | Description |
|------|-------------|
| Q4_0 | 4-bit, basic |
| Q4_1 | 4-bit with delta |
| Q5_0 | 5-bit, basic |
| Q5_1 | 5-bit with delta |

**Recommendation**: Use K-quant methods (Q4_K_M, Q5_K_M) for best quality/size ratio.

## Conversion workflows

### Workflow 1: HuggingFace to GGUF

```bash
# 1. Download model
huggingface-cli download meta-llama/Llama-3.1-8B --local-dir ./llama-3.1-8b

# 2. Convert to GGUF (FP16)
python convert_hf_to_gguf.py ./llama-3.1-8b \
    --outfile llama-3.1-8b-f16.gguf \
    --outtype f16

# 3. Quantize
./llama-quantize llama-3.1-8b-f16.gguf llama-3.1-8b-q4_k_m.gguf Q4_K_M

# 4. Test
./llama-cli -m llama-3.1-8b-q4_k_m.gguf -p "Hello!" -n 50
```

### Workflow 2: With importance matrix (better quality)

```bash
# 1. Convert to GGUF
python convert_hf_to_gguf.py ./model --outfile model-f16.gguf

# 2. Create calibration text (diverse samples)
cat > calibration.txt << 'EOF'
The quick brown fox jumps over the lazy dog.
Machine learning is a subset of artificial intelligence.
Python is a popular programming language.
# Add more diverse text samples...
EOF

# 3. Generate importance matrix
./llama-imatrix -m model-f16.gguf \
    -f calibration.txt \
    --chunk 512 \
    -o model.imatrix \
    -ngl 35  # GPU layers if available

# 4. Quantize with imatrix
./llama-quantize --imatrix model.imatrix \
    model-f16.gguf \
    model-q4_k_m.gguf \
    Q4_K_M
```

### Workflow 3: Multiple quantizations

```bash
#!/bin/bash
MODEL="llama-3.1-8b-f16.gguf"
IMATRIX="llama-3.1-8b.imatrix"

# Generate imatrix once
./llama-imatrix -m $MODEL -f wiki.txt -o $IMATRIX -ngl 35

# Create multiple quantizations
for QUANT in Q4_K_M Q5_K_M Q6_K Q8_0; do
    OUTPUT="llama-3.1-8b-${QUANT,,}.gguf"
    ./llama-quantize --imatrix $IMATRIX $MODEL $OUTPUT $QUANT
    echo "Created: $OUTPUT ($(du -h $OUTPUT | cut -f1))"
done
```

## Python usage

### llama-cpp-python

```python
from llama_cpp import Llama

# Load model
llm = Llama(
    model_path="./model-q4_k_m.gguf",
    n_ctx=4096,          # Context window
    n_gpu_layers=35,     # GPU offload (0 for CPU only)
    n_threads=8          # CPU threads
)

# Generate
output = llm(
    "What is machine learning?",
    max_tokens=256,
    temperature=0.7,
    stop=["</s>", "\n\n"]
)
print(output["choices"][0]["text"])
```

### Chat completion

```python
from llama_cpp import Llama

llm = Llama(
    model_path="./model-q4_k_m.gguf",
    n_ctx=4096,
    n_gpu_layers=35,
    chat_format="llama-3"  # Or "chatml", "mistral", etc.
)

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is Python?"}
]

response = llm.create_chat_completion(
    messages=messages,
    max_tokens=256,
    temperature=0.7
)
print(response["choices"][0]["message"]["content"])
```

### Streaming

```python
from llama_cpp import Llama

llm = Llama(model_path="./model-q4_k_m.gguf", n_gpu_layers=35)

# Stream tokens
for chunk in llm(
    "Explain quantum computing:",
    max_tokens=256,
    stream=True
):
    print(chunk["choices"][0]["text"], end="", flush=True)
```

## Server mode

### Start OpenAI-compatible server

```bash
# Start server
./llama-server -m model-q4_k_m.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -ngl 35 \
    -c 4096

# Or with Python bindings
python -m llama_cpp.server \
    --model model-q4_k_m.gguf \
    --n_gpu_layers 35 \
    --host 0.0.0.0 \
    --port 8080
```

### Use with OpenAI client

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="local-model",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=256
)
print(response.choices[0].message.content)
```

## Hardware optimization

### Apple Silicon (Metal)

```bash
# Build with Metal
make clean && make GGML_METAL=1

# Run with Metal acceleration
./llama-cli -m model.gguf -ngl 99 -p "Hello"

# Python with Metal
llm = Llama(
    model_path="model.gguf",
    n_gpu_layers=99,     # Offload all layers
    n_threads=1          # Metal handles parallelism
)
```

### NVIDIA CUDA

```bash
# Build with CUDA
make clean && make GGML_CUDA=1

# Run with CUDA
./llama-cli -m model.gguf -ngl 35 -p "Hello"

# Specify GPU
CUDA_VISIBLE_DEVICES=0 ./llama-cli -m model.gguf -ngl 35
```

### CPU optimization

```bash
# Build with AVX2/AVX512
make clean && make

# Run with optimal threads
./llama-cli -m model.gguf -t 8 -p "Hello"

# Python CPU config
llm = Llama(
    model_path="model.gguf",
    n_gpu_layers=0,      # CPU only
    n_threads=8,         # Match physical cores
    n_batch=512          # Batch size for prompt processing
)
```

## Integration with tools

### Ollama

```bash
# Create Modelfile
cat > Modelfile << 'EOF'
FROM ./model-q4_k_m.gguf
TEMPLATE """{{ .System }}
{{ .Prompt }}"""
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
EOF

# Create Ollama model
ollama create mymodel -f Modelfile

# Run
ollama run mymodel "Hello!"
```

### LM Studio

1. Place GGUF file in `~/.cache/lm-studio/models/`
2. Open LM Studio and select the model
3. Configure context length and GPU offload
4. Start inference

### text-generation-webui

```bash
# Place in models folder
cp model-q4_k_m.gguf text-generation-webui/models/

# Start with llama.cpp loader
python server.py --model model-q4_k_m.gguf --loader llama.cpp --n-gpu-layers 35
```

## Best practices

1. **Use K-quants**: Q4_K_M offers best quality/size balance
2. **Use imatrix**: Always use importance matrix for Q4 and below
3. **GPU offload**: Offload as many layers as VRAM allows
4. **Context length**: Start with 4096, increase if needed
5. **Thread count**: Match physical CPU cores, not logical
6. **Batch size**: Increase n_batch for faster prompt processing

## Common issues

**Model loads slowly:**
```bash
# Use mmap for faster loading
./llama-cli -m model.gguf --mmap
```

**Out of memory:**
```bash
# Reduce GPU layers
./llama-cli -m model.gguf -ngl 20  # Reduce from 35

# Or use smaller quantization
./llama-quantize model-f16.gguf model-q3_k_m.gguf Q3_K_M
```

**Poor quality at low bits:**
```bash
# Always use imatrix for Q4 and below
./llama-imatrix -m model-f16.gguf -f calibration.txt -o model.imatrix
./llama-quantize --imatrix model.imatrix model-f16.gguf model-q4_k_m.gguf Q4_K_M
```

## References

- **[Advanced Usage](references/advanced-usage.md)** - Batching, speculative decoding, custom builds
- **[Troubleshooting](references/troubleshooting.md)** - Common issues, debugging, benchmarks

## Resources

- **Repository**: https://github.com/ggml-org/llama.cpp
- **Python Bindings**: https://github.com/abetlen/llama-cpp-python
- **Pre-quantized Models**: https://huggingface.co/TheBloke
- **GGUF Converter**: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- **License**: MIT
