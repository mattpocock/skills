# AudioCraft Advanced Usage Guide

## Fine-tuning MusicGen

### Custom dataset preparation

```python
import os
import json
from pathlib import Path
import torchaudio

def prepare_dataset(audio_dir, output_dir, metadata_file):
    """
    Prepare dataset for MusicGen fine-tuning.

    Directory structure:
    output_dir/
    ├── audio/
    │   ├── 0001.wav
    │   ├── 0002.wav
    │   └── ...
    └── metadata.json
    """
    output_dir = Path(output_dir)
    audio_output = output_dir / "audio"
    audio_output.mkdir(parents=True, exist_ok=True)

    # Load metadata (format: {"path": "...", "description": "..."})
    with open(metadata_file) as f:
        metadata = json.load(f)

    processed = []

    for idx, item in enumerate(metadata):
        audio_path = Path(audio_dir) / item["path"]

        # Load and resample to 32kHz
        wav, sr = torchaudio.load(str(audio_path))
        if sr != 32000:
            resampler = torchaudio.transforms.Resample(sr, 32000)
            wav = resampler(wav)

        # Convert to mono if stereo
        if wav.shape[0] > 1:
            wav = wav.mean(dim=0, keepdim=True)

        # Save processed audio
        output_path = audio_output / f"{idx:04d}.wav"
        torchaudio.save(str(output_path), wav, sample_rate=32000)

        processed.append({
            "path": str(output_path.relative_to(output_dir)),
            "description": item["description"],
            "duration": wav.shape[1] / 32000
        })

    # Save processed metadata
    with open(output_dir / "metadata.json", "w") as f:
        json.dump(processed, f, indent=2)

    print(f"Processed {len(processed)} samples")
    return processed
```

### Fine-tuning with dora

```bash
# AudioCraft uses dora for experiment management
# Install dora
pip install dora-search

# Clone AudioCraft
git clone https://github.com/facebookresearch/audiocraft.git
cd audiocraft

# Create config for fine-tuning
cat > config/solver/musicgen/finetune.yaml << 'EOF'
defaults:
  - musicgen/musicgen_base
  - /model: lm/musicgen_lm
  - /conditioner: cond_base

solver: musicgen
autocast: true
autocast_dtype: float16

optim:
  epochs: 100
  batch_size: 4
  lr: 1e-4
  ema: 0.999
  optimizer: adamw

dataset:
  batch_size: 4
  num_workers: 4
  train:
    - dset: your_dataset
      root: /path/to/dataset
  valid:
    - dset: your_dataset
      root: /path/to/dataset

checkpoint:
  save_every: 10
  keep_every_states: null
EOF

# Run fine-tuning
dora run solver=musicgen/finetune
```

### LoRA fine-tuning

```python
from peft import LoraConfig, get_peft_model
from audiocraft.models import MusicGen
import torch

# Load base model
model = MusicGen.get_pretrained('facebook/musicgen-small')

# Get the language model component
lm = model.lm

# Configure LoRA
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj", "k_proj", "out_proj"],
    lora_dropout=0.05,
    bias="none"
)

# Apply LoRA
lm = get_peft_model(lm, lora_config)
lm.print_trainable_parameters()
```

## Multi-GPU Training

### DataParallel

```python
import torch
import torch.nn as nn
from audiocraft.models import MusicGen

model = MusicGen.get_pretrained('facebook/musicgen-small')

# Wrap LM with DataParallel
if torch.cuda.device_count() > 1:
    model.lm = nn.DataParallel(model.lm)

model.to("cuda")
```

### DistributedDataParallel

```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def setup(rank, world_size):
    dist.init_process_group("nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

def train(rank, world_size):
    setup(rank, world_size)

    model = MusicGen.get_pretrained('facebook/musicgen-small')
    model.lm = model.lm.to(rank)
    model.lm = DDP(model.lm, device_ids=[rank])

    # Training loop
    # ...

    dist.destroy_process_group()
```

## Custom Conditioning

### Adding new conditioners

```python
from audiocraft.modules.conditioners import BaseConditioner
import torch

class CustomConditioner(BaseConditioner):
    """Custom conditioner for additional control signals."""

    def __init__(self, dim, output_dim):
        super().__init__(dim, output_dim)
        self.embed = torch.nn.Linear(dim, output_dim)

    def forward(self, x):
        return self.embed(x)

    def tokenize(self, x):
        # Tokenize input for conditioning
        return x

# Use with MusicGen
from audiocraft.models.builders import get_lm_model

# Modify model config to include custom conditioner
# This requires editing the model configuration
```

### Melody conditioning internals

```python
from audiocraft.models import MusicGen
from audiocraft.modules.codebooks_patterns import DelayedPatternProvider
import torch

model = MusicGen.get_pretrained('facebook/musicgen-melody')

# Access chroma extractor
chroma_extractor = model.lm.condition_provider.conditioners.get('chroma')

# Manual chroma extraction
def extract_chroma(audio, sr):
    """Extract chroma features from audio."""
    import librosa

    # Compute chroma
    chroma = librosa.feature.chroma_cqt(y=audio.numpy(), sr=sr)

    return torch.from_numpy(chroma).float()

# Use extracted chroma for conditioning
chroma = extract_chroma(melody_audio, sample_rate)
```

## EnCodec Deep Dive

### Custom compression settings

```python
from audiocraft.models import CompressionModel
import torch

# Load EnCodec
encodec = CompressionModel.get_pretrained('facebook/encodec_32khz')

# Access codec parameters
print(f"Sample rate: {encodec.sample_rate}")
print(f"Channels: {encodec.channels}")
print(f"Cardinality: {encodec.cardinality}")  # Codebook size
print(f"Num codebooks: {encodec.num_codebooks}")
print(f"Frame rate: {encodec.frame_rate}")

# Encode with specific bandwidth
# Lower bandwidth = more compression, lower quality
encodec.set_target_bandwidth(6.0)  # 6 kbps

audio = torch.randn(1, 1, 32000)  # 1 second
encoded = encodec.encode(audio)
decoded = encodec.decode(encoded[0])
```

### Streaming encoding

```python
import torch
from audiocraft.models import CompressionModel

encodec = CompressionModel.get_pretrained('facebook/encodec_32khz')

def encode_streaming(audio_stream, chunk_size=32000):
    """Encode audio in streaming fashion."""
    all_codes = []

    for chunk in audio_stream:
        # Ensure chunk is right shape
        if chunk.dim() == 1:
            chunk = chunk.unsqueeze(0).unsqueeze(0)

        with torch.no_grad():
            codes = encodec.encode(chunk)[0]
            all_codes.append(codes)

    return torch.cat(all_codes, dim=-1)

def decode_streaming(codes_stream, output_stream):
    """Decode codes in streaming fashion."""
    for codes in codes_stream:
        with torch.no_grad():
            audio = encodec.decode(codes)
            output_stream.write(audio.cpu().numpy())
```

## MultiBand Diffusion

### Using MBD for enhanced quality

```python
from audiocraft.models import MusicGen, MultiBandDiffusion

# Load MusicGen
model = MusicGen.get_pretrained('facebook/musicgen-medium')

# Load MultiBand Diffusion
mbd = MultiBandDiffusion.get_mbd_musicgen()

model.set_generation_params(duration=10)

# Generate with standard decoder
descriptions = ["epic orchestral music"]
wav_standard = model.generate(descriptions)

# Generate tokens and use MBD decoder
with torch.no_grad():
    # Get tokens
    gen_tokens = model.generate_tokens(descriptions)

    # Decode with MBD
    wav_mbd = mbd.tokens_to_wav(gen_tokens)

# Compare quality
print(f"Standard shape: {wav_standard.shape}")
print(f"MBD shape: {wav_mbd.shape}")
```

## API Server Deployment

### FastAPI server

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import torchaudio
from audiocraft.models import MusicGen
import io
import base64

app = FastAPI()

# Load model at startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    model = MusicGen.get_pretrained('facebook/musicgen-small')
    model.set_generation_params(duration=10)

class GenerateRequest(BaseModel):
    prompt: str
    duration: float = 10.0
    temperature: float = 1.0
    cfg_coef: float = 3.0

class GenerateResponse(BaseModel):
    audio_base64: str
    sample_rate: int
    duration: float

@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        model.set_generation_params(
            duration=min(request.duration, 30),
            temperature=request.temperature,
            cfg_coef=request.cfg_coef
        )

        with torch.no_grad():
            wav = model.generate([request.prompt])

        # Convert to bytes
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav[0].cpu(), sample_rate=32000, format="wav")
        buffer.seek(0)

        audio_base64 = base64.b64encode(buffer.read()).decode()

        return GenerateResponse(
            audio_base64=audio_base64,
            sample_rate=32000,
            duration=wav.shape[-1] / 32000
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}

# Run: uvicorn server:app --host 0.0.0.0 --port 8000
```

### Batch processing service

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor
import torch
from audiocraft.models import MusicGen

class MusicGenService:
    def __init__(self, model_name='facebook/musicgen-small', max_workers=2):
        self.model = MusicGen.get_pretrained(model_name)
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.lock = asyncio.Lock()

    async def generate_async(self, prompt, duration=10):
        """Async generation with thread pool."""
        loop = asyncio.get_event_loop()

        def _generate():
            with torch.no_grad():
                self.model.set_generation_params(duration=duration)
                return self.model.generate([prompt])

        # Run in thread pool
        wav = await loop.run_in_executor(self.executor, _generate)
        return wav[0].cpu()

    async def generate_batch_async(self, prompts, duration=10):
        """Process multiple prompts concurrently."""
        tasks = [self.generate_async(p, duration) for p in prompts]
        return await asyncio.gather(*tasks)

# Usage
service = MusicGenService()

async def main():
    prompts = ["jazz piano", "rock guitar", "electronic beats"]
    results = await service.generate_batch_async(prompts)
    return results
```

## Integration Patterns

### LangChain tool

```python
from langchain.tools import BaseTool
import torch
import torchaudio
from audiocraft.models import MusicGen
import tempfile

class MusicGeneratorTool(BaseTool):
    name = "music_generator"
    description = "Generate music from a text description. Input should be a detailed description of the music style, mood, and instruments."

    def __init__(self):
        super().__init__()
        self.model = MusicGen.get_pretrained('facebook/musicgen-small')
        self.model.set_generation_params(duration=15)

    def _run(self, description: str) -> str:
        with torch.no_grad():
            wav = self.model.generate([description])

        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            torchaudio.save(f.name, wav[0].cpu(), sample_rate=32000)
            return f"Generated music saved to: {f.name}"

    async def _arun(self, description: str) -> str:
        return self._run(description)
```

### Gradio with advanced controls

```python
import gradio as gr
import torch
import torchaudio
from audiocraft.models import MusicGen

models = {}

def load_model(model_size):
    if model_size not in models:
        model_name = f"facebook/musicgen-{model_size}"
        models[model_size] = MusicGen.get_pretrained(model_name)
    return models[model_size]

def generate(prompt, duration, temperature, cfg_coef, top_k, model_size):
    model = load_model(model_size)

    model.set_generation_params(
        duration=duration,
        temperature=temperature,
        cfg_coef=cfg_coef,
        top_k=top_k
    )

    with torch.no_grad():
        wav = model.generate([prompt])

    # Save
    path = "output.wav"
    torchaudio.save(path, wav[0].cpu(), sample_rate=32000)
    return path

demo = gr.Interface(
    fn=generate,
    inputs=[
        gr.Textbox(label="Prompt", lines=3),
        gr.Slider(1, 30, value=10, label="Duration (s)"),
        gr.Slider(0.1, 2.0, value=1.0, label="Temperature"),
        gr.Slider(0.5, 10.0, value=3.0, label="CFG Coefficient"),
        gr.Slider(50, 500, value=250, step=50, label="Top-K"),
        gr.Dropdown(["small", "medium", "large"], value="small", label="Model Size")
    ],
    outputs=gr.Audio(label="Generated Music"),
    title="MusicGen Advanced",
    allow_flagging="never"
)

demo.launch(share=True)
```

## Audio Processing Pipeline

### Post-processing chain

```python
import torch
import torchaudio
import torchaudio.transforms as T
import numpy as np

class AudioPostProcessor:
    def __init__(self, sample_rate=32000):
        self.sample_rate = sample_rate

    def normalize(self, audio, target_db=-14.0):
        """Normalize audio to target loudness."""
        rms = torch.sqrt(torch.mean(audio ** 2))
        target_rms = 10 ** (target_db / 20)
        gain = target_rms / (rms + 1e-8)
        return audio * gain

    def fade_in_out(self, audio, fade_duration=0.1):
        """Apply fade in/out."""
        fade_samples = int(fade_duration * self.sample_rate)

        # Create fade curves
        fade_in = torch.linspace(0, 1, fade_samples)
        fade_out = torch.linspace(1, 0, fade_samples)

        # Apply fades
        audio[..., :fade_samples] *= fade_in
        audio[..., -fade_samples:] *= fade_out

        return audio

    def apply_reverb(self, audio, decay=0.5):
        """Apply simple reverb effect."""
        impulse = torch.zeros(int(self.sample_rate * 0.5))
        impulse[0] = 1.0
        impulse[int(self.sample_rate * 0.1)] = decay * 0.5
        impulse[int(self.sample_rate * 0.2)] = decay * 0.25

        # Convolve
        audio = torch.nn.functional.conv1d(
            audio.unsqueeze(0),
            impulse.unsqueeze(0).unsqueeze(0),
            padding=len(impulse) // 2
        ).squeeze(0)

        return audio

    def process(self, audio):
        """Full processing pipeline."""
        audio = self.normalize(audio)
        audio = self.fade_in_out(audio)
        return audio

# Usage with MusicGen
from audiocraft.models import MusicGen

model = MusicGen.get_pretrained('facebook/musicgen-small')
model.set_generation_params(duration=10)

wav = model.generate(["chill ambient music"])
processor = AudioPostProcessor()
wav_processed = processor.process(wav[0].cpu())

torchaudio.save("processed.wav", wav_processed, sample_rate=32000)
```

## Evaluation

### Audio quality metrics

```python
import torch
from audiocraft.metrics import CLAPTextConsistencyMetric
from audiocraft.data.audio import audio_read

def evaluate_generation(audio_path, text_prompt):
    """Evaluate generated audio quality."""
    # Load audio
    wav, sr = audio_read(audio_path)

    # CLAP consistency (text-audio alignment)
    clap_metric = CLAPTextConsistencyMetric()
    clap_score = clap_metric.compute(wav, [text_prompt])

    return {
        "clap_score": clap_score,
        "duration": wav.shape[-1] / sr
    }

# Batch evaluation
def evaluate_batch(generations):
    """Evaluate multiple generations."""
    results = []
    for gen in generations:
        result = evaluate_generation(gen["path"], gen["prompt"])
        result["prompt"] = gen["prompt"]
        results.append(result)

    # Aggregate
    avg_clap = sum(r["clap_score"] for r in results) / len(results)
    return {
        "individual": results,
        "average_clap": avg_clap
    }
```

## Model Comparison

### MusicGen variants benchmark

| Model | CLAP Score | Generation Time (10s) | VRAM |
|-------|------------|----------------------|------|
| musicgen-small | 0.35 | ~5s | 2GB |
| musicgen-medium | 0.42 | ~15s | 4GB |
| musicgen-large | 0.48 | ~30s | 8GB |
| musicgen-melody | 0.45 | ~15s | 4GB |
| musicgen-stereo-medium | 0.41 | ~18s | 5GB |

### Prompt engineering tips

```python
# Good prompts - specific and descriptive
good_prompts = [
    "upbeat electronic dance music with synthesizer leads and punchy drums at 128 bpm",
    "melancholic piano ballad with strings, slow tempo, emotional and cinematic",
    "funky disco groove with slap bass, brass section, and rhythmic guitar"
]

# Bad prompts - too vague
bad_prompts = [
    "nice music",
    "song",
    "good beat"
]

# Structure: [mood] [genre] with [instruments] at [tempo/style]
```
