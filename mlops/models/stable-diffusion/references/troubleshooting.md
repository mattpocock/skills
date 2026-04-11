# Stable Diffusion Troubleshooting Guide

## Installation Issues

### Package conflicts

**Error**: `ImportError: cannot import name 'cached_download' from 'huggingface_hub'`

**Fix**:
```bash
# Update huggingface_hub
pip install --upgrade huggingface_hub

# Reinstall diffusers
pip install --upgrade diffusers
```

### xFormers installation fails

**Error**: `RuntimeError: CUDA error: no kernel image is available for execution`

**Fix**:
```bash
# Check CUDA version
nvcc --version

# Install matching xformers
pip install xformers --index-url https://download.pytorch.org/whl/cu121  # For CUDA 12.1

# Or build from source
pip install -v -U git+https://github.com/facebookresearch/xformers.git@main#egg=xformers
```

### Torch/CUDA mismatch

**Error**: `RuntimeError: CUDA error: CUBLAS_STATUS_NOT_INITIALIZED`

**Fix**:
```bash
# Check versions
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"

# Reinstall PyTorch with correct CUDA
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

## Memory Issues

### CUDA out of memory

**Error**: `torch.cuda.OutOfMemoryError: CUDA out of memory`

**Solutions**:

```python
# Solution 1: Enable CPU offloading
pipe.enable_model_cpu_offload()

# Solution 2: Sequential CPU offload (more aggressive)
pipe.enable_sequential_cpu_offload()

# Solution 3: Attention slicing
pipe.enable_attention_slicing()

# Solution 4: VAE slicing for large images
pipe.enable_vae_slicing()

# Solution 5: Use lower precision
pipe = DiffusionPipeline.from_pretrained(
    "model-id",
    torch_dtype=torch.float16  # or torch.bfloat16
)

# Solution 6: Reduce batch size
image = pipe(prompt, num_images_per_prompt=1).images[0]

# Solution 7: Generate smaller images
image = pipe(prompt, height=512, width=512).images[0]

# Solution 8: Clear cache between generations
import gc
torch.cuda.empty_cache()
gc.collect()
```

### Memory grows over time

**Problem**: Memory usage increases with each generation

**Fix**:
```python
import gc
import torch

def generate_with_cleanup(pipe, prompt, **kwargs):
    try:
        image = pipe(prompt, **kwargs).images[0]
        return image
    finally:
        # Clear cache after generation
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
```

### Large model loading fails

**Error**: `RuntimeError: Unable to load model weights`

**Fix**:
```python
# Use low CPU memory mode
pipe = DiffusionPipeline.from_pretrained(
    "large-model-id",
    low_cpu_mem_usage=True,
    torch_dtype=torch.float16
)
```

## Generation Issues

### Black images

**Problem**: Output images are completely black

**Solutions**:
```python
# Solution 1: Disable safety checker
pipe.safety_checker = None

# Solution 2: Check VAE scaling
# The issue might be with VAE encoding/decoding
latents = latents / pipe.vae.config.scaling_factor  # Before decode

# Solution 3: Ensure proper dtype
pipe = pipe.to(dtype=torch.float16)
pipe.vae = pipe.vae.to(dtype=torch.float32)  # VAE often needs fp32

# Solution 4: Check guidance scale
# Too high can cause issues
image = pipe(prompt, guidance_scale=7.5).images[0]  # Not 20+
```

### Noise/static images

**Problem**: Output looks like random noise

**Solutions**:
```python
# Solution 1: Increase inference steps
image = pipe(prompt, num_inference_steps=50).images[0]

# Solution 2: Check scheduler configuration
pipe.scheduler = pipe.scheduler.from_config(pipe.scheduler.config)

# Solution 3: Verify model was loaded correctly
print(pipe.unet)  # Should show model architecture
```

### Blurry images

**Problem**: Output images are low quality or blurry

**Solutions**:
```python
# Solution 1: Use more steps
image = pipe(prompt, num_inference_steps=50).images[0]

# Solution 2: Use better VAE
from diffusers import AutoencoderKL
vae = AutoencoderKL.from_pretrained("stabilityai/sd-vae-ft-mse")
pipe.vae = vae

# Solution 3: Use SDXL or refiner
pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0"
)

# Solution 4: Upscale with img2img
upscale_pipe = StableDiffusionImg2ImgPipeline.from_pretrained(...)
upscaled = upscale_pipe(
    prompt=prompt,
    image=image.resize((1024, 1024)),
    strength=0.3
).images[0]
```

### Prompt not being followed

**Problem**: Generated image doesn't match the prompt

**Solutions**:
```python
# Solution 1: Increase guidance scale
image = pipe(prompt, guidance_scale=10.0).images[0]

# Solution 2: Use negative prompts
image = pipe(
    prompt="A red car",
    negative_prompt="blue, green, yellow, wrong color",
    guidance_scale=7.5
).images[0]

# Solution 3: Use prompt weighting
# Emphasize important words
prompt = "A (red:1.5) car on a street"

# Solution 4: Use longer, more detailed prompts
prompt = """
A bright red sports car, ferrari style, parked on a city street,
photorealistic, high detail, 8k, professional photography
"""
```

### Distorted faces/hands

**Problem**: Faces and hands look deformed

**Solutions**:
```python
# Solution 1: Use negative prompts
negative_prompt = """
bad hands, bad anatomy, deformed, ugly, blurry,
extra fingers, mutated hands, poorly drawn hands,
poorly drawn face, mutation, deformed face
"""

# Solution 2: Use face-specific models
# ADetailer or similar post-processing

# Solution 3: Use ControlNet for poses
# Load pose estimation and condition generation

# Solution 4: Inpaint problematic areas
mask = create_face_mask(image)
fixed = inpaint_pipe(
    prompt="beautiful detailed face",
    image=image,
    mask_image=mask
).images[0]
```

## Scheduler Issues

### Scheduler not compatible

**Error**: `ValueError: Scheduler ... is not compatible with pipeline`

**Fix**:
```python
from diffusers import EulerDiscreteScheduler

# Create scheduler from config
pipe.scheduler = EulerDiscreteScheduler.from_config(
    pipe.scheduler.config
)

# Check compatible schedulers
print(pipe.scheduler.compatibles)
```

### Wrong number of steps

**Problem**: Model generates different quality with same steps

**Fix**:
```python
# Reset timesteps explicitly
pipe.scheduler.set_timesteps(num_inference_steps)

# Check scheduler's step count
print(len(pipe.scheduler.timesteps))
```

## LoRA Issues

### LoRA weights not loading

**Error**: `RuntimeError: Error(s) in loading state_dict for UNet2DConditionModel`

**Fix**:
```python
# Check weight file format
# Should be .safetensors or .bin

# Load with correct key prefix
pipe.load_lora_weights(
    "path/to/lora",
    weight_name="lora.safetensors"
)

# Try loading into specific component
pipe.unet.load_attn_procs("path/to/lora")
```

### LoRA not affecting output

**Problem**: Generated images look the same with/without LoRA

**Fix**:
```python
# Fuse LoRA weights
pipe.fuse_lora(lora_scale=1.0)

# Or set scale explicitly
pipe.set_adapters(["lora_name"], adapter_weights=[1.0])

# Verify LoRA is loaded
print(list(pipe.unet.attn_processors.keys()))
```

### Multiple LoRAs conflict

**Problem**: Multiple LoRAs produce artifacts

**Fix**:
```python
# Load with different adapter names
pipe.load_lora_weights("lora1", adapter_name="style")
pipe.load_lora_weights("lora2", adapter_name="subject")

# Balance weights
pipe.set_adapters(
    ["style", "subject"],
    adapter_weights=[0.5, 0.5]  # Lower weights
)

# Or use LoRA merge before loading
# Merge LoRAs offline with appropriate ratios
```

## ControlNet Issues

### ControlNet not conditioning

**Problem**: ControlNet has no effect on output

**Fix**:
```python
# Check control image format
# Should be RGB, matching generation size
control_image = control_image.resize((512, 512))

# Increase conditioning scale
image = pipe(
    prompt=prompt,
    image=control_image,
    controlnet_conditioning_scale=1.0,  # Try 0.5-1.5
    num_inference_steps=30
).images[0]

# Verify ControlNet is loaded
print(pipe.controlnet)
```

### Control image preprocessing

**Fix**:
```python
from controlnet_aux import CannyDetector

# Proper preprocessing
canny = CannyDetector()
control_image = canny(input_image)

# Ensure correct format
control_image = control_image.convert("RGB")
control_image = control_image.resize((512, 512))
```

## Hub/Download Issues

### Model download fails

**Error**: `requests.exceptions.ConnectionError`

**Fix**:
```bash
# Set longer timeout
export HF_HUB_DOWNLOAD_TIMEOUT=600

# Use mirror if available
export HF_ENDPOINT=https://hf-mirror.com

# Or download manually
huggingface-cli download stable-diffusion-v1-5/stable-diffusion-v1-5
```

### Cache issues

**Error**: `OSError: Can't load model from cache`

**Fix**:
```bash
# Clear cache
rm -rf ~/.cache/huggingface/hub

# Or set different cache location
export HF_HOME=/path/to/cache

# Force re-download
pipe = DiffusionPipeline.from_pretrained(
    "model-id",
    force_download=True
)
```

### Access denied for gated models

**Error**: `401 Client Error: Unauthorized`

**Fix**:
```bash
# Login to Hugging Face
huggingface-cli login

# Or use token
pipe = DiffusionPipeline.from_pretrained(
    "model-id",
    token="hf_xxxxx"
)

# Accept model license on Hub website first
```

## Performance Issues

### Slow generation

**Problem**: Generation takes too long

**Solutions**:
```python
# Solution 1: Use faster scheduler
from diffusers import DPMSolverMultistepScheduler
pipe.scheduler = DPMSolverMultistepScheduler.from_config(
    pipe.scheduler.config
)

# Solution 2: Reduce steps
image = pipe(prompt, num_inference_steps=20).images[0]

# Solution 3: Use LCM
from diffusers import LCMScheduler
pipe.load_lora_weights("latent-consistency/lcm-lora-sdxl")
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
image = pipe(prompt, num_inference_steps=4, guidance_scale=1.0).images[0]

# Solution 4: Enable xFormers
pipe.enable_xformers_memory_efficient_attention()

# Solution 5: Compile model
pipe.unet = torch.compile(pipe.unet, mode="reduce-overhead", fullgraph=True)
```

### First generation is slow

**Problem**: First image takes much longer

**Fix**:
```python
# Warm up the model
_ = pipe("warmup", num_inference_steps=1)

# Then run actual generation
image = pipe(prompt, num_inference_steps=50).images[0]

# Compile for faster subsequent runs
pipe.unet = torch.compile(pipe.unet)
```

## Debugging Tips

### Enable debug logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Or for specific modules
logging.getLogger("diffusers").setLevel(logging.DEBUG)
logging.getLogger("transformers").setLevel(logging.DEBUG)
```

### Check model components

```python
# Print pipeline components
print(pipe.components)

# Check model config
print(pipe.unet.config)
print(pipe.vae.config)
print(pipe.scheduler.config)

# Verify device placement
print(pipe.device)
for name, module in pipe.components.items():
    if hasattr(module, 'device'):
        print(f"{name}: {module.device}")
```

### Validate inputs

```python
# Check image dimensions
print(f"Height: {height}, Width: {width}")
assert height % 8 == 0, "Height must be divisible by 8"
assert width % 8 == 0, "Width must be divisible by 8"

# Check prompt tokenization
tokens = pipe.tokenizer(prompt, return_tensors="pt")
print(f"Token count: {tokens.input_ids.shape[1]}")  # Max 77 for SD
```

### Save intermediate results

```python
def save_latents_callback(pipe, step_index, timestep, callback_kwargs):
    latents = callback_kwargs["latents"]

    # Decode and save intermediate
    with torch.no_grad():
        image = pipe.vae.decode(latents / pipe.vae.config.scaling_factor).sample
    image = (image / 2 + 0.5).clamp(0, 1)
    image = image.cpu().permute(0, 2, 3, 1).numpy()[0]
    Image.fromarray((image * 255).astype("uint8")).save(f"step_{step_index}.png")

    return callback_kwargs

image = pipe(
    prompt,
    callback_on_step_end=save_latents_callback,
    callback_on_step_end_tensor_inputs=["latents"]
).images[0]
```

## Getting Help

1. **Documentation**: https://huggingface.co/docs/diffusers
2. **GitHub Issues**: https://github.com/huggingface/diffusers/issues
3. **Discord**: https://discord.gg/diffusers
4. **Forum**: https://discuss.huggingface.co

### Reporting Issues

Include:
- Diffusers version: `pip show diffusers`
- PyTorch version: `python -c "import torch; print(torch.__version__)"`
- CUDA version: `nvcc --version`
- GPU model: `nvidia-smi`
- Full error traceback
- Minimal reproducible code
- Model name/ID used
