# GGUF Troubleshooting Guide

## Installation Issues

### Build Fails

**Error**: `make: *** No targets specified and no makefile found`

**Fix**:
```bash
# Ensure you're in llama.cpp directory
cd llama.cpp
make
```

**Error**: `fatal error: cuda_runtime.h: No such file or directory`

**Fix**:
```bash
# Install CUDA toolkit
# Ubuntu
sudo apt install nvidia-cuda-toolkit

# Or set CUDA path
export CUDA_PATH=/usr/local/cuda
export PATH=$CUDA_PATH/bin:$PATH
make GGML_CUDA=1
```

### Python Bindings Issues

**Error**: `ERROR: Failed building wheel for llama-cpp-python`

**Fix**:
```bash
# Install build dependencies
pip install cmake scikit-build-core

# For CUDA support
CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python --force-reinstall --no-cache-dir

# For Metal (macOS)
CMAKE_ARGS="-DGGML_METAL=on" pip install llama-cpp-python --force-reinstall --no-cache-dir
```

**Error**: `ImportError: libcudart.so.XX: cannot open shared object file`

**Fix**:
```bash
# Add CUDA libraries to path
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH

# Or reinstall with correct CUDA version
pip uninstall llama-cpp-python
CUDACXX=/usr/local/cuda/bin/nvcc CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python
```

## Conversion Issues

### Model Not Supported

**Error**: `KeyError: 'model.embed_tokens.weight'`

**Fix**:
```bash
# Check model architecture
python -c "from transformers import AutoConfig; print(AutoConfig.from_pretrained('./model').architectures)"

# Use appropriate conversion script
# For most models:
python convert_hf_to_gguf.py ./model --outfile model.gguf

# For older models, check if legacy script needed
```

### Vocabulary Mismatch

**Error**: `RuntimeError: Vocabulary size mismatch`

**Fix**:
```python
# Ensure tokenizer matches model
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("./model")
model = AutoModelForCausalLM.from_pretrained("./model")

print(f"Tokenizer vocab size: {len(tokenizer)}")
print(f"Model vocab size: {model.config.vocab_size}")

# If mismatch, resize embeddings before conversion
model.resize_token_embeddings(len(tokenizer))
model.save_pretrained("./model-fixed")
```

### Out of Memory During Conversion

**Error**: `torch.cuda.OutOfMemoryError` during conversion

**Fix**:
```bash
# Use CPU for conversion
CUDA_VISIBLE_DEVICES="" python convert_hf_to_gguf.py ./model --outfile model.gguf

# Or use low memory mode
python convert_hf_to_gguf.py ./model --outfile model.gguf --outtype f16
```

## Quantization Issues

### Wrong Output File Size

**Problem**: Quantized file is larger than expected

**Check**:
```bash
# Verify quantization type
./llama-cli -m model.gguf --verbose

# Expected sizes for 7B model:
# Q4_K_M: ~4.1 GB
# Q5_K_M: ~4.8 GB
# Q8_0: ~7.2 GB
# F16: ~13.5 GB
```

### Quantization Crashes

**Error**: `Segmentation fault` during quantization

**Fix**:
```bash
# Increase stack size
ulimit -s unlimited

# Or use less threads
./llama-quantize -t 4 model-f16.gguf model-q4.gguf Q4_K_M
```

### Poor Quality After Quantization

**Problem**: Model outputs gibberish after quantization

**Solutions**:

1. **Use importance matrix**:
```bash
# Generate imatrix with good calibration data
./llama-imatrix -m model-f16.gguf \
    -f wiki_sample.txt \
    --chunk 512 \
    -o model.imatrix

# Quantize with imatrix
./llama-quantize --imatrix model.imatrix \
    model-f16.gguf model-q4_k_m.gguf Q4_K_M
```

2. **Try higher precision**:
```bash
# Use Q5_K_M or Q6_K instead of Q4
./llama-quantize model-f16.gguf model-q5_k_m.gguf Q5_K_M
```

3. **Check original model**:
```bash
# Test FP16 version first
./llama-cli -m model-f16.gguf -p "Hello, how are you?" -n 50
```

## Inference Issues

### Slow Generation

**Problem**: Generation is slower than expected

**Solutions**:

1. **Enable GPU offload**:
```bash
./llama-cli -m model.gguf -ngl 35 -p "Hello"
```

2. **Optimize batch size**:
```python
llm = Llama(
    model_path="model.gguf",
    n_batch=512,        # Increase for faster prompt processing
    n_gpu_layers=35
)
```

3. **Use appropriate threads**:
```bash
# Match physical cores, not logical
./llama-cli -m model.gguf -t 8 -p "Hello"
```

4. **Enable Flash Attention** (if supported):
```bash
./llama-cli -m model.gguf -ngl 35 --flash-attn -p "Hello"
```

### Out of Memory

**Error**: `CUDA out of memory` or system freeze

**Solutions**:

1. **Reduce GPU layers**:
```python
# Start low and increase
llm = Llama(model_path="model.gguf", n_gpu_layers=10)
```

2. **Use smaller quantization**:
```bash
./llama-quantize model-f16.gguf model-q3_k_m.gguf Q3_K_M
```

3. **Reduce context length**:
```python
llm = Llama(
    model_path="model.gguf",
    n_ctx=2048,  # Reduce from 4096
    n_gpu_layers=35
)
```

4. **Quantize KV cache**:
```python
llm = Llama(
    model_path="model.gguf",
    type_k=2,    # Q4_0 for K cache
    type_v=2,    # Q4_0 for V cache
    n_gpu_layers=35
)
```

### Garbage Output

**Problem**: Model outputs random characters or nonsense

**Diagnose**:
```python
# Check model loading
llm = Llama(model_path="model.gguf", verbose=True)

# Test with simple prompt
output = llm("1+1=", max_tokens=5, temperature=0)
print(output)
```

**Solutions**:

1. **Check model integrity**:
```bash
# Verify GGUF file
./llama-cli -m model.gguf --verbose 2>&1 | head -50
```

2. **Use correct chat format**:
```python
llm = Llama(
    model_path="model.gguf",
    chat_format="llama-3"  # Match your model: chatml, mistral, etc.
)
```

3. **Check temperature**:
```python
# Use lower temperature for deterministic output
output = llm("Hello", max_tokens=50, temperature=0.1)
```

### Token Issues

**Error**: `RuntimeError: unknown token` or encoding errors

**Fix**:
```python
# Ensure UTF-8 encoding
prompt = "Hello, world!".encode('utf-8').decode('utf-8')
output = llm(prompt, max_tokens=50)
```

## Server Issues

### Connection Refused

**Error**: `Connection refused` when accessing server

**Fix**:
```bash
# Bind to all interfaces
./llama-server -m model.gguf --host 0.0.0.0 --port 8080

# Check if port is in use
lsof -i :8080
```

### Server Crashes Under Load

**Problem**: Server crashes with multiple concurrent requests

**Solutions**:

1. **Limit parallelism**:
```bash
./llama-server -m model.gguf \
    --parallel 2 \
    -c 4096 \
    --cont-batching
```

2. **Add request timeout**:
```bash
./llama-server -m model.gguf --timeout 300
```

3. **Monitor memory**:
```bash
watch -n 1 nvidia-smi  # For GPU
watch -n 1 free -h     # For RAM
```

### API Compatibility Issues

**Problem**: OpenAI client not working with server

**Fix**:
```python
from openai import OpenAI

# Use correct base URL format
client = OpenAI(
    base_url="http://localhost:8080/v1",  # Include /v1
    api_key="not-needed"
)

# Use correct model name
response = client.chat.completions.create(
    model="local",  # Or the actual model name
    messages=[{"role": "user", "content": "Hello"}]
)
```

## Apple Silicon Issues

### Metal Not Working

**Problem**: Metal acceleration not enabled

**Check**:
```bash
# Verify Metal support
./llama-cli -m model.gguf --verbose 2>&1 | grep -i metal
```

**Fix**:
```bash
# Rebuild with Metal
make clean
make GGML_METAL=1

# Python bindings
CMAKE_ARGS="-DGGML_METAL=on" pip install llama-cpp-python --force-reinstall
```

### Incorrect Memory Usage on M1/M2

**Problem**: Model uses too much unified memory

**Fix**:
```python
# Offload all layers for Metal
llm = Llama(
    model_path="model.gguf",
    n_gpu_layers=99,    # Offload everything
    n_threads=1         # Metal handles parallelism
)
```

## Debugging

### Enable Verbose Output

```bash
# CLI verbose mode
./llama-cli -m model.gguf --verbose -p "Hello" -n 50

# Python verbose
llm = Llama(model_path="model.gguf", verbose=True)
```

### Check Model Metadata

```bash
# View GGUF metadata
./llama-cli -m model.gguf --verbose 2>&1 | head -100
```

### Validate GGUF File

```python
import struct

def validate_gguf(filepath):
    with open(filepath, 'rb') as f:
        magic = f.read(4)
        if magic != b'GGUF':
            print(f"Invalid magic: {magic}")
            return False

        version = struct.unpack('<I', f.read(4))[0]
        print(f"GGUF version: {version}")

        tensor_count = struct.unpack('<Q', f.read(8))[0]
        metadata_count = struct.unpack('<Q', f.read(8))[0]
        print(f"Tensors: {tensor_count}, Metadata: {metadata_count}")

        return True

validate_gguf("model.gguf")
```

## Getting Help

1. **GitHub Issues**: https://github.com/ggml-org/llama.cpp/issues
2. **Discussions**: https://github.com/ggml-org/llama.cpp/discussions
3. **Reddit**: r/LocalLLaMA

### Reporting Issues

Include:
- llama.cpp version/commit hash
- Build command used
- Model name and quantization
- Full error message/stack trace
- Hardware: CPU/GPU model, RAM, VRAM
- OS version
- Minimal reproduction steps
