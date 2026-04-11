# Stable Diffusion Advanced Usage Guide

## Custom Pipelines

### Building from components

```python
from diffusers import (
    UNet2DConditionModel,
    AutoencoderKL,
    DDPMScheduler,
    StableDiffusionPipeline
)
from transformers import CLIPTextModel, CLIPTokenizer
import torch

# Load components individually
unet = UNet2DConditionModel.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    subfolder="unet"
)
vae = AutoencoderKL.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    subfolder="vae"
)
text_encoder = CLIPTextModel.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    subfolder="text_encoder"
)
tokenizer = CLIPTokenizer.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    subfolder="tokenizer"
)
scheduler = DDPMScheduler.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    subfolder="scheduler"
)

# Assemble pipeline
pipe = StableDiffusionPipeline(
    unet=unet,
    vae=vae,
    text_encoder=text_encoder,
    tokenizer=tokenizer,
    scheduler=scheduler,
    safety_checker=None,
    feature_extractor=None,
    requires_safety_checker=False
)
```

### Custom denoising loop

```python
from diffusers import DDIMScheduler, AutoencoderKL, UNet2DConditionModel
from transformers import CLIPTextModel, CLIPTokenizer
import torch

def custom_generate(
    prompt: str,
    num_steps: int = 50,
    guidance_scale: float = 7.5,
    height: int = 512,
    width: int = 512
):
    # Load components
    tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-large-patch14")
    text_encoder = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14")
    unet = UNet2DConditionModel.from_pretrained("sd-model", subfolder="unet")
    vae = AutoencoderKL.from_pretrained("sd-model", subfolder="vae")
    scheduler = DDIMScheduler.from_pretrained("sd-model", subfolder="scheduler")

    device = "cuda"
    text_encoder.to(device)
    unet.to(device)
    vae.to(device)

    # Encode prompt
    text_input = tokenizer(
        prompt,
        padding="max_length",
        max_length=77,
        truncation=True,
        return_tensors="pt"
    )
    text_embeddings = text_encoder(text_input.input_ids.to(device))[0]

    # Unconditional embeddings for classifier-free guidance
    uncond_input = tokenizer(
        "",
        padding="max_length",
        max_length=77,
        return_tensors="pt"
    )
    uncond_embeddings = text_encoder(uncond_input.input_ids.to(device))[0]

    # Concatenate for batch processing
    text_embeddings = torch.cat([uncond_embeddings, text_embeddings])

    # Initialize latents
    latents = torch.randn(
        (1, 4, height // 8, width // 8),
        device=device
    )
    latents = latents * scheduler.init_noise_sigma

    # Denoising loop
    scheduler.set_timesteps(num_steps)
    for t in scheduler.timesteps:
        latent_model_input = torch.cat([latents] * 2)
        latent_model_input = scheduler.scale_model_input(latent_model_input, t)

        # Predict noise
        with torch.no_grad():
            noise_pred = unet(
                latent_model_input,
                t,
                encoder_hidden_states=text_embeddings
            ).sample

        # Classifier-free guidance
        noise_pred_uncond, noise_pred_cond = noise_pred.chunk(2)
        noise_pred = noise_pred_uncond + guidance_scale * (
            noise_pred_cond - noise_pred_uncond
        )

        # Update latents
        latents = scheduler.step(noise_pred, t, latents).prev_sample

    # Decode latents
    latents = latents / vae.config.scaling_factor
    with torch.no_grad():
        image = vae.decode(latents).sample

    # Convert to PIL
    image = (image / 2 + 0.5).clamp(0, 1)
    image = image.cpu().permute(0, 2, 3, 1).numpy()
    image = (image * 255).round().astype("uint8")[0]

    return Image.fromarray(image)
```

## IP-Adapter

Use image prompts alongside text:

```python
from diffusers import StableDiffusionPipeline
from diffusers.utils import load_image
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    torch_dtype=torch.float16
).to("cuda")

# Load IP-Adapter
pipe.load_ip_adapter(
    "h94/IP-Adapter",
    subfolder="models",
    weight_name="ip-adapter_sd15.bin"
)

# Set IP-Adapter scale
pipe.set_ip_adapter_scale(0.6)

# Load reference image
ip_image = load_image("reference_style.jpg")

# Generate with image + text prompt
image = pipe(
    prompt="A portrait in a garden",
    ip_adapter_image=ip_image,
    num_inference_steps=50
).images[0]
```

### Multiple IP-Adapter images

```python
# Use multiple reference images
pipe.set_ip_adapter_scale([0.5, 0.7])

images = [
    load_image("style_reference.jpg"),
    load_image("composition_reference.jpg")
]

result = pipe(
    prompt="A landscape painting",
    ip_adapter_image=images,
    num_inference_steps=50
).images[0]
```

## SDXL Refiner

Two-stage generation for higher quality:

```python
from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline
import torch

# Load base model
base = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# Load refiner
refiner = StableDiffusionXLImg2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-refiner-1.0",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

# Generate with base (partial denoising)
image = base(
    prompt="A majestic eagle soaring over mountains",
    num_inference_steps=40,
    denoising_end=0.8,
    output_type="latent"
).images

# Refine with refiner
refined = refiner(
    prompt="A majestic eagle soaring over mountains",
    image=image,
    num_inference_steps=40,
    denoising_start=0.8
).images[0]
```

## T2I-Adapter

Lightweight conditioning without full ControlNet:

```python
from diffusers import StableDiffusionXLAdapterPipeline, T2IAdapter
import torch

# Load adapter
adapter = T2IAdapter.from_pretrained(
    "TencentARC/t2i-adapter-canny-sdxl-1.0",
    torch_dtype=torch.float16
)

pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    adapter=adapter,
    torch_dtype=torch.float16
).to("cuda")

# Get canny edges
canny_image = get_canny_image(input_image)

image = pipe(
    prompt="A colorful anime character",
    image=canny_image,
    num_inference_steps=30,
    adapter_conditioning_scale=0.8
).images[0]
```

## Fine-tuning with DreamBooth

Train on custom subjects:

```python
from diffusers import StableDiffusionPipeline, DDPMScheduler
from diffusers.optimization import get_scheduler
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import os

class DreamBoothDataset(Dataset):
    def __init__(self, instance_images_path, instance_prompt, tokenizer, size=512):
        self.instance_images_path = instance_images_path
        self.instance_prompt = instance_prompt
        self.tokenizer = tokenizer
        self.size = size

        self.instance_images = [
            os.path.join(instance_images_path, f)
            for f in os.listdir(instance_images_path)
            if f.endswith(('.png', '.jpg', '.jpeg'))
        ]

    def __len__(self):
        return len(self.instance_images)

    def __getitem__(self, idx):
        image = Image.open(self.instance_images[idx]).convert("RGB")
        image = image.resize((self.size, self.size))
        image = torch.tensor(np.array(image)).permute(2, 0, 1) / 127.5 - 1.0

        tokens = self.tokenizer(
            self.instance_prompt,
            padding="max_length",
            max_length=77,
            truncation=True,
            return_tensors="pt"
        )

        return {"image": image, "input_ids": tokens.input_ids.squeeze()}

def train_dreambooth(
    pretrained_model: str,
    instance_data_dir: str,
    instance_prompt: str,
    output_dir: str,
    learning_rate: float = 5e-6,
    max_train_steps: int = 800,
    train_batch_size: int = 1
):
    # Load pipeline
    pipe = StableDiffusionPipeline.from_pretrained(pretrained_model)

    unet = pipe.unet
    vae = pipe.vae
    text_encoder = pipe.text_encoder
    tokenizer = pipe.tokenizer
    noise_scheduler = DDPMScheduler.from_pretrained(pretrained_model, subfolder="scheduler")

    # Freeze VAE and text encoder
    vae.requires_grad_(False)
    text_encoder.requires_grad_(False)

    # Create dataset
    dataset = DreamBoothDataset(
        instance_data_dir, instance_prompt, tokenizer
    )
    dataloader = DataLoader(dataset, batch_size=train_batch_size, shuffle=True)

    # Setup optimizer
    optimizer = torch.optim.AdamW(unet.parameters(), lr=learning_rate)
    lr_scheduler = get_scheduler(
        "constant",
        optimizer=optimizer,
        num_warmup_steps=0,
        num_training_steps=max_train_steps
    )

    # Training loop
    unet.train()
    device = "cuda"
    unet.to(device)
    vae.to(device)
    text_encoder.to(device)

    global_step = 0
    for epoch in range(max_train_steps // len(dataloader) + 1):
        for batch in dataloader:
            if global_step >= max_train_steps:
                break

            # Encode images to latents
            latents = vae.encode(batch["image"].to(device)).latent_dist.sample()
            latents = latents * vae.config.scaling_factor

            # Sample noise
            noise = torch.randn_like(latents)
            timesteps = torch.randint(0, noise_scheduler.num_train_timesteps, (latents.shape[0],))
            timesteps = timesteps.to(device)

            # Add noise
            noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)

            # Get text embeddings
            encoder_hidden_states = text_encoder(batch["input_ids"].to(device))[0]

            # Predict noise
            noise_pred = unet(noisy_latents, timesteps, encoder_hidden_states).sample

            # Compute loss
            loss = torch.nn.functional.mse_loss(noise_pred, noise)

            # Backprop
            loss.backward()
            optimizer.step()
            lr_scheduler.step()
            optimizer.zero_grad()

            global_step += 1

            if global_step % 100 == 0:
                print(f"Step {global_step}, Loss: {loss.item():.4f}")

    # Save model
    pipe.unet = unet
    pipe.save_pretrained(output_dir)
```

## LoRA Training

Efficient fine-tuning with Low-Rank Adaptation:

```python
from peft import LoraConfig, get_peft_model
from diffusers import StableDiffusionPipeline
import torch

def train_lora(
    base_model: str,
    train_dataset,
    output_dir: str,
    lora_rank: int = 4,
    learning_rate: float = 1e-4,
    max_train_steps: int = 1000
):
    pipe = StableDiffusionPipeline.from_pretrained(base_model)
    unet = pipe.unet

    # Configure LoRA
    lora_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_rank,
        target_modules=["to_q", "to_v", "to_k", "to_out.0"],
        lora_dropout=0.1
    )

    # Apply LoRA to UNet
    unet = get_peft_model(unet, lora_config)
    unet.print_trainable_parameters()  # Shows ~0.1% trainable

    # Train (similar to DreamBooth but only LoRA params)
    optimizer = torch.optim.AdamW(
        unet.parameters(),
        lr=learning_rate
    )

    # ... training loop ...

    # Save LoRA weights only
    unet.save_pretrained(output_dir)
```

## Textual Inversion

Learn new concepts through embeddings:

```python
from diffusers import StableDiffusionPipeline
import torch

# Load with textual inversion
pipe = StableDiffusionPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    torch_dtype=torch.float16
).to("cuda")

# Load learned embedding
pipe.load_textual_inversion(
    "sd-concepts-library/cat-toy",
    token="<cat-toy>"
)

# Use in prompts
image = pipe("A photo of <cat-toy> on a beach").images[0]
```

## Quantization

Reduce memory with quantization:

```python
from diffusers import BitsAndBytesConfig, StableDiffusionXLPipeline
import torch

# 8-bit quantization
quantization_config = BitsAndBytesConfig(load_in_8bit=True)

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    quantization_config=quantization_config,
    torch_dtype=torch.float16
)
```

### NF4 quantization (4-bit)

```python
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    quantization_config=quantization_config
)
```

## Production Deployment

### FastAPI server

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from diffusers import DiffusionPipeline
import torch
import base64
from io import BytesIO

app = FastAPI()

# Load model at startup
pipe = DiffusionPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    torch_dtype=torch.float16
).to("cuda")
pipe.enable_model_cpu_offload()

class GenerationRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    num_inference_steps: int = 30
    guidance_scale: float = 7.5
    width: int = 512
    height: int = 512
    seed: int = None

class GenerationResponse(BaseModel):
    image_base64: str
    seed: int

@app.post("/generate", response_model=GenerationResponse)
async def generate(request: GenerationRequest):
    try:
        generator = None
        seed = request.seed or torch.randint(0, 2**32, (1,)).item()
        generator = torch.Generator("cuda").manual_seed(seed)

        image = pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            width=request.width,
            height=request.height,
            generator=generator
        ).images[0]

        # Convert to base64
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode()

        return GenerationResponse(image_base64=image_base64, seed=seed)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### Docker deployment

```dockerfile
FROM nvidia/cuda:12.1-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

# Pre-download model
RUN python3 -c "from diffusers import DiffusionPipeline; DiffusionPipeline.from_pretrained('stable-diffusion-v1-5/stable-diffusion-v1-5')"

EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stable-diffusion
spec:
  replicas: 2
  selector:
    matchLabels:
      app: stable-diffusion
  template:
    metadata:
      labels:
        app: stable-diffusion
    spec:
      containers:
      - name: sd
        image: your-registry/stable-diffusion:latest
        ports:
        - containerPort: 8000
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "16Gi"
          requests:
            nvidia.com/gpu: 1
            memory: "8Gi"
        env:
        - name: TRANSFORMERS_CACHE
          value: "/cache/huggingface"
        volumeMounts:
        - name: model-cache
          mountPath: /cache
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: model-cache-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: stable-diffusion
spec:
  selector:
    app: stable-diffusion
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

## Callback System

Monitor and modify generation:

```python
from diffusers import StableDiffusionPipeline
from diffusers.callbacks import PipelineCallback
import torch

class ProgressCallback(PipelineCallback):
    def __init__(self):
        self.progress = []

    def callback_fn(self, pipe, step_index, timestep, callback_kwargs):
        self.progress.append({
            "step": step_index,
            "timestep": timestep.item()
        })

        # Optionally modify latents
        latents = callback_kwargs["latents"]

        return callback_kwargs

# Use callback
callback = ProgressCallback()

image = pipe(
    prompt="A sunset",
    callback_on_step_end=callback.callback_fn,
    callback_on_step_end_tensor_inputs=["latents"]
).images[0]

print(f"Generation completed in {len(callback.progress)} steps")
```

### Early stopping

```python
def early_stop_callback(pipe, step_index, timestep, callback_kwargs):
    # Stop after 20 steps
    if step_index >= 20:
        pipe._interrupt = True
    return callback_kwargs

image = pipe(
    prompt="A landscape",
    num_inference_steps=50,
    callback_on_step_end=early_stop_callback
).images[0]
```

## Multi-GPU Inference

### Device map auto

```python
from diffusers import StableDiffusionXLPipeline

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    device_map="auto",  # Automatically distribute across GPUs
    torch_dtype=torch.float16
)
```

### Manual distribution

```python
from accelerate import infer_auto_device_map, dispatch_model

# Create device map
device_map = infer_auto_device_map(
    pipe.unet,
    max_memory={0: "10GiB", 1: "10GiB"}
)

# Dispatch model
pipe.unet = dispatch_model(pipe.unet, device_map=device_map)
```
