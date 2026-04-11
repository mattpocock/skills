# Modal Troubleshooting Guide

## Installation Issues

### Authentication fails

**Error**: `modal setup` doesn't complete or token is invalid

**Solutions**:
```bash
# Re-authenticate
modal token new

# Check current token
modal config show

# Set token via environment
export MODAL_TOKEN_ID=ak-...
export MODAL_TOKEN_SECRET=as-...
```

### Package installation issues

**Error**: `pip install modal` fails

**Solutions**:
```bash
# Upgrade pip
pip install --upgrade pip

# Install with specific Python version
python3.11 -m pip install modal

# Install from wheel
pip install modal --prefer-binary
```

## Container Image Issues

### Image build fails

**Error**: `ImageBuilderError: Failed to build image`

**Solutions**:
```python
# Pin package versions to avoid conflicts
image = modal.Image.debian_slim().pip_install(
    "torch==2.1.0",
    "transformers==4.36.0",  # Pin versions
    "accelerate==0.25.0"
)

# Use compatible CUDA versions
image = modal.Image.from_registry(
    "nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04",  # Match PyTorch CUDA
    add_python="3.11"
)
```

### Dependency conflicts

**Error**: `ERROR: Cannot install package due to conflicting dependencies`

**Solutions**:
```python
# Layer dependencies separately
base = modal.Image.debian_slim().pip_install("torch")
ml = base.pip_install("transformers")  # Install after torch

# Use uv for better resolution
image = modal.Image.debian_slim().uv_pip_install(
    "torch", "transformers"
)
```

### Large image builds timeout

**Error**: Image build exceeds time limit

**Solutions**:
```python
# Split into multiple layers (better caching)
base = modal.Image.debian_slim().pip_install("torch")  # Cached
ml = base.pip_install("transformers", "datasets")      # Cached
app = ml.copy_local_dir("./src", "/app")               # Rebuilds on code change

# Download models during build, not runtime
image = modal.Image.debian_slim().pip_install("transformers").run_commands(
    "python -c 'from transformers import AutoModel; AutoModel.from_pretrained(\"bert-base\")'"
)
```

## GPU Issues

### GPU not available

**Error**: `RuntimeError: CUDA not available`

**Solutions**:
```python
# Ensure GPU is specified
@app.function(gpu="T4")  # Must specify GPU
def my_function():
    import torch
    assert torch.cuda.is_available()

# Check CUDA compatibility in image
image = modal.Image.from_registry(
    "nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04",
    add_python="3.11"
).pip_install(
    "torch",
    index_url="https://download.pytorch.org/whl/cu121"  # Match CUDA
)
```

### GPU out of memory

**Error**: `torch.cuda.OutOfMemoryError: CUDA out of memory`

**Solutions**:
```python
# Use larger GPU
@app.function(gpu="A100-80GB")  # More VRAM
def train():
    pass

# Enable memory optimization
@app.function(gpu="A100")
def memory_optimized():
    import torch
    torch.backends.cuda.enable_flash_sdp(True)

    # Use gradient checkpointing
    model.gradient_checkpointing_enable()

    # Mixed precision
    with torch.autocast(device_type="cuda", dtype=torch.float16):
        outputs = model(**inputs)
```

### Wrong GPU allocated

**Error**: Got different GPU than requested

**Solutions**:
```python
# Use strict GPU selection
@app.function(gpu="H100!")  # H100! prevents auto-upgrade to H200

# Specify exact memory variant
@app.function(gpu="A100-80GB")  # Not just "A100"

# Check GPU at runtime
@app.function(gpu="A100")
def check_gpu():
    import subprocess
    result = subprocess.run(["nvidia-smi"], capture_output=True, text=True)
    print(result.stdout)
```

## Cold Start Issues

### Slow cold starts

**Problem**: First request takes too long

**Solutions**:
```python
# Keep containers warm
@app.function(
    container_idle_timeout=600,  # Keep warm 10 min
    keep_warm=1                  # Always keep 1 container ready
)
def low_latency():
    pass

# Load model during container start
@app.cls(gpu="A100")
class Model:
    @modal.enter()
    def load(self):
        # This runs once at container start, not per request
        self.model = load_heavy_model()

# Cache model in volume
volume = modal.Volume.from_name("models", create_if_missing=True)

@app.function(volumes={"/cache": volume})
def cached_model():
    if os.path.exists("/cache/model"):
        model = load_from_disk("/cache/model")
    else:
        model = download_model()
        save_to_disk(model, "/cache/model")
        volume.commit()
```

### Container keeps restarting

**Problem**: Containers are killed and restarted frequently

**Solutions**:
```python
# Increase memory
@app.function(memory=32768)  # 32GB RAM
def memory_heavy():
    pass

# Increase timeout
@app.function(timeout=3600)  # 1 hour
def long_running():
    pass

# Handle signals gracefully
import signal

def handler(signum, frame):
    cleanup()
    exit(0)

signal.signal(signal.SIGTERM, handler)
```

## Volume Issues

### Volume changes not persisting

**Error**: Data written to volume disappears

**Solutions**:
```python
volume = modal.Volume.from_name("my-volume", create_if_missing=True)

@app.function(volumes={"/data": volume})
def write_data():
    with open("/data/file.txt", "w") as f:
        f.write("data")

    # CRITICAL: Commit changes!
    volume.commit()
```

### Volume read shows stale data

**Error**: Reading outdated data from volume

**Solutions**:
```python
@app.function(volumes={"/data": volume})
def read_data():
    # Reload to get latest
    volume.reload()

    with open("/data/file.txt", "r") as f:
        return f.read()
```

### Volume mount fails

**Error**: `VolumeError: Failed to mount volume`

**Solutions**:
```python
# Ensure volume exists
volume = modal.Volume.from_name("my-volume", create_if_missing=True)

# Use absolute path
@app.function(volumes={"/data": volume})  # Not "./data"
def my_function():
    pass

# Check volume in dashboard
# modal volume list
```

## Web Endpoint Issues

### Endpoint returns 502

**Error**: Gateway timeout or bad gateway

**Solutions**:
```python
# Increase timeout
@app.function(timeout=300)  # 5 min
@modal.web_endpoint()
def slow_endpoint():
    pass

# Return streaming response for long operations
from fastapi.responses import StreamingResponse

@app.function()
@modal.asgi_app()
def streaming_app():
    async def generate():
        for i in range(100):
            yield f"data: {i}\n\n"
            await process_chunk(i)
    return StreamingResponse(generate(), media_type="text/event-stream")
```

### Endpoint not accessible

**Error**: 404 or cannot reach endpoint

**Solutions**:
```bash
# Check deployment status
modal app list

# Redeploy
modal deploy my_app.py

# Check logs
modal app logs my-app
```

### CORS errors

**Error**: Cross-origin request blocked

**Solutions**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

web_app = FastAPI()
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.function()
@modal.asgi_app()
def cors_enabled():
    return web_app
```

## Secret Issues

### Secret not found

**Error**: `SecretNotFound: Secret 'my-secret' not found`

**Solutions**:
```bash
# Create secret via CLI
modal secret create my-secret KEY=value

# List secrets
modal secret list

# Check secret name matches exactly
```

### Secret value not accessible

**Error**: Environment variable is empty

**Solutions**:
```python
# Ensure secret is attached
@app.function(secrets=[modal.Secret.from_name("my-secret")])
def use_secret():
    import os
    value = os.environ.get("KEY")  # Use get() to handle missing
    if not value:
        raise ValueError("KEY not set in secret")
```

## Scheduling Issues

### Scheduled job not running

**Error**: Cron job doesn't execute

**Solutions**:
```python
# Verify cron syntax
@app.function(schedule=modal.Cron("0 0 * * *"))  # Daily at midnight UTC
def daily_job():
    pass

# Check timezone (Modal uses UTC)
# "0 8 * * *" = 8am UTC, not local time

# Ensure app is deployed
# modal deploy my_app.py
```

### Job runs multiple times

**Problem**: Scheduled job executes more than expected

**Solutions**:
```python
# Implement idempotency
@app.function(schedule=modal.Cron("0 * * * *"))
def hourly_job():
    job_id = get_current_hour_id()
    if already_processed(job_id):
        return
    process()
    mark_processed(job_id)
```

## Debugging Tips

### Enable debug logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)

@app.function()
def debug_function():
    logging.debug("Debug message")
    logging.info("Info message")
```

### View container logs

```bash
# Stream logs
modal app logs my-app

# View specific function
modal app logs my-app --function my_function

# View historical logs
modal app logs my-app --since 1h
```

### Test locally

```python
# Run function locally without Modal
if __name__ == "__main__":
    result = my_function.local()  # Runs on your machine
    print(result)
```

### Inspect container

```python
@app.function(gpu="T4")
def debug_environment():
    import subprocess
    import sys

    # System info
    print(f"Python: {sys.version}")
    print(subprocess.run(["nvidia-smi"], capture_output=True, text=True).stdout)
    print(subprocess.run(["pip", "list"], capture_output=True, text=True).stdout)

    # CUDA info
    import torch
    print(f"CUDA available: {torch.cuda.is_available()}")
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU: {torch.cuda.get_device_name(0)}")
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `FunctionTimeoutError` | Function exceeded timeout | Increase `timeout` parameter |
| `ContainerMemoryExceeded` | OOM killed | Increase `memory` parameter |
| `ImageBuilderError` | Build failed | Check dependencies, pin versions |
| `ResourceExhausted` | No GPUs available | Use GPU fallbacks, try later |
| `AuthenticationError` | Invalid token | Run `modal token new` |
| `VolumeNotFound` | Volume doesn't exist | Use `create_if_missing=True` |
| `SecretNotFound` | Secret doesn't exist | Create secret via CLI |

## Getting Help

1. **Documentation**: https://modal.com/docs
2. **Examples**: https://github.com/modal-labs/modal-examples
3. **Discord**: https://discord.gg/modal
4. **Status**: https://status.modal.com

### Reporting Issues

Include:
- Modal client version: `modal --version`
- Python version: `python --version`
- Full error traceback
- Minimal reproducible code
- GPU type if relevant
