# AudioCraft Troubleshooting Guide

## Installation Issues

### Import errors

**Error**: `ModuleNotFoundError: No module named 'audiocraft'`

**Solutions**:
```bash
# Install from PyPI
pip install audiocraft

# Or from GitHub
pip install git+https://github.com/facebookresearch/audiocraft.git

# Verify installation
python -c "from audiocraft.models import MusicGen; print('OK')"
```

### FFmpeg not found

**Error**: `RuntimeError: ffmpeg not found`

**Solutions**:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows (using conda)
conda install -c conda-forge ffmpeg

# Verify
ffmpeg -version
```

### PyTorch CUDA mismatch

**Error**: `RuntimeError: CUDA error: no kernel image is available`

**Solutions**:
```bash
# Check CUDA version
nvcc --version
python -c "import torch; print(torch.version.cuda)"

# Install matching PyTorch
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121

# For CUDA 11.8
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### xformers issues

**Error**: `ImportError: xformers` related errors

**Solutions**:
```bash
# Install xformers for memory efficiency
pip install xformers

# Or disable xformers
export AUDIOCRAFT_USE_XFORMERS=0

# In Python
import os
os.environ["AUDIOCRAFT_USE_XFORMERS"] = "0"
from audiocraft.models import MusicGen
```

## Model Loading Issues

### Out of memory during load

**Error**: `torch.cuda.OutOfMemoryError` during model loading

**Solutions**:
```python
# Use smaller model
model = MusicGen.get_pretrained('facebook/musicgen-small')

# Force CPU loading first
import torch
device = "cpu"
model = MusicGen.get_pretrained('facebook/musicgen-small', device=device)
model = model.to("cuda")

# Use HuggingFace with device_map
from transformers import MusicgenForConditionalGeneration
model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-small",
    device_map="auto"
)
```

### Download failures

**Error**: Connection errors or incomplete downloads

**Solutions**:
```python
# Set cache directory
import os
os.environ["AUDIOCRAFT_CACHE_DIR"] = "/path/to/cache"

# Or for HuggingFace
os.environ["HF_HOME"] = "/path/to/hf_cache"

# Resume download
from huggingface_hub import snapshot_download
snapshot_download("facebook/musicgen-small", resume_download=True)

# Use local files
model = MusicGen.get_pretrained('/local/path/to/model')
```

### Wrong model type

**Error**: Loading wrong model for task

**Solutions**:
```python
# For text-to-music: use MusicGen
from audiocraft.models import MusicGen
model = MusicGen.get_pretrained('facebook/musicgen-medium')

# For text-to-sound: use AudioGen
from audiocraft.models import AudioGen
model = AudioGen.get_pretrained('facebook/audiogen-medium')

# For melody conditioning: use melody variant
model = MusicGen.get_pretrained('facebook/musicgen-melody')

# For stereo: use stereo variant
model = MusicGen.get_pretrained('facebook/musicgen-stereo-medium')
```

## Generation Issues

### Empty or silent output

**Problem**: Generated audio is silent or very quiet

**Solutions**:
```python
import torch

# Check output
wav = model.generate(["upbeat music"])
print(f"Shape: {wav.shape}")
print(f"Max amplitude: {wav.abs().max().item()}")
print(f"Mean amplitude: {wav.abs().mean().item()}")

# If too quiet, normalize
def normalize_audio(audio, target_db=-14.0):
    rms = torch.sqrt(torch.mean(audio ** 2))
    target_rms = 10 ** (target_db / 20)
    gain = target_rms / (rms + 1e-8)
    return audio * gain

wav_normalized = normalize_audio(wav)
```

### Poor quality output

**Problem**: Generated music sounds bad or noisy

**Solutions**:
```python
# Use larger model
model = MusicGen.get_pretrained('facebook/musicgen-large')

# Adjust generation parameters
model.set_generation_params(
    duration=15,
    top_k=250,          # Increase for more diversity
    temperature=0.8,    # Lower for more focused output
    cfg_coef=4.0        # Increase for better text adherence
)

# Use better prompts
# Bad: "music"
# Good: "upbeat electronic dance music with synthesizers and punchy drums"

# Try MultiBand Diffusion
from audiocraft.models import MultiBandDiffusion
mbd = MultiBandDiffusion.get_mbd_musicgen()
tokens = model.generate_tokens(["prompt"])
wav = mbd.tokens_to_wav(tokens)
```

### Generation too short

**Problem**: Audio shorter than expected

**Solutions**:
```python
# Check duration setting
model.set_generation_params(duration=30)  # Set before generate

# Verify in generation
print(f"Duration setting: {model.generation_params}")

# Check output shape
wav = model.generate(["prompt"])
actual_duration = wav.shape[-1] / 32000
print(f"Actual duration: {actual_duration}s")

# Note: max duration is typically 30s
```

### Melody conditioning fails

**Error**: Issues with melody-conditioned generation

**Solutions**:
```python
import torchaudio
from audiocraft.models import MusicGen

# Load melody model (not base model)
model = MusicGen.get_pretrained('facebook/musicgen-melody')

# Load and prepare melody
melody, sr = torchaudio.load("melody.wav")

# Resample to model sample rate if needed
if sr != 32000:
    resampler = torchaudio.transforms.Resample(sr, 32000)
    melody = resampler(melody)

# Ensure correct shape [batch, channels, samples]
if melody.dim() == 1:
    melody = melody.unsqueeze(0).unsqueeze(0)
elif melody.dim() == 2:
    melody = melody.unsqueeze(0)

# Convert stereo to mono
if melody.shape[1] > 1:
    melody = melody.mean(dim=1, keepdim=True)

# Generate with melody
model.set_generation_params(duration=min(melody.shape[-1] / 32000, 30))
wav = model.generate_with_chroma(["piano cover"], melody, 32000)
```

## Memory Issues

### CUDA out of memory

**Error**: `torch.cuda.OutOfMemoryError: CUDA out of memory`

**Solutions**:
```python
import torch

# Clear cache before generation
torch.cuda.empty_cache()

# Use smaller model
model = MusicGen.get_pretrained('facebook/musicgen-small')

# Reduce duration
model.set_generation_params(duration=10)  # Instead of 30

# Generate one at a time
for prompt in prompts:
    wav = model.generate([prompt])
    save_audio(wav)
    torch.cuda.empty_cache()

# Use CPU for very large generations
model = MusicGen.get_pretrained('facebook/musicgen-small', device="cpu")
```

### Memory leak during batch processing

**Problem**: Memory grows over time

**Solutions**:
```python
import gc
import torch

def generate_with_cleanup(model, prompts):
    results = []

    for prompt in prompts:
        with torch.no_grad():
            wav = model.generate([prompt])
            results.append(wav.cpu())

        # Cleanup
        del wav
        gc.collect()
        torch.cuda.empty_cache()

    return results

# Use context manager
with torch.inference_mode():
    wav = model.generate(["prompt"])
```

## Audio Format Issues

### Wrong sample rate

**Problem**: Audio plays at wrong speed

**Solutions**:
```python
import torchaudio

# MusicGen outputs at 32kHz
sample_rate = 32000

# AudioGen outputs at 16kHz
sample_rate = 16000

# Always use correct rate when saving
torchaudio.save("output.wav", wav[0].cpu(), sample_rate=sample_rate)

# Resample if needed
resampler = torchaudio.transforms.Resample(32000, 44100)
wav_resampled = resampler(wav)
```

### Stereo/mono mismatch

**Problem**: Wrong number of channels

**Solutions**:
```python
# Check model type
print(f"Audio channels: {wav.shape}")
# Mono: [batch, 1, samples]
# Stereo: [batch, 2, samples]

# Convert mono to stereo
if wav.shape[1] == 1:
    wav_stereo = wav.repeat(1, 2, 1)

# Convert stereo to mono
if wav.shape[1] == 2:
    wav_mono = wav.mean(dim=1, keepdim=True)

# Use stereo model for stereo output
model = MusicGen.get_pretrained('facebook/musicgen-stereo-medium')
```

### Clipping and distortion

**Problem**: Audio has clipping or distortion

**Solutions**:
```python
import torch

# Check for clipping
max_val = wav.abs().max().item()
print(f"Max amplitude: {max_val}")

# Normalize to prevent clipping
if max_val > 1.0:
    wav = wav / max_val

# Apply soft clipping
def soft_clip(x, threshold=0.9):
    return torch.tanh(x / threshold) * threshold

wav_clipped = soft_clip(wav)

# Lower temperature during generation
model.set_generation_params(temperature=0.7)  # More controlled
```

## HuggingFace Transformers Issues

### Processor errors

**Error**: Issues with MusicgenProcessor

**Solutions**:
```python
from transformers import AutoProcessor, MusicgenForConditionalGeneration

# Load matching processor and model
processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

# Ensure inputs are on same device
inputs = processor(
    text=["prompt"],
    padding=True,
    return_tensors="pt"
).to("cuda")

# Check processor configuration
print(processor.tokenizer)
print(processor.feature_extractor)
```

### Generation parameter errors

**Error**: Invalid generation parameters

**Solutions**:
```python
# HuggingFace uses different parameter names
audio_values = model.generate(
    **inputs,
    do_sample=True,           # Enable sampling
    guidance_scale=3.0,       # CFG (not cfg_coef)
    max_new_tokens=256,       # Token limit (not duration)
    temperature=1.0
)

# Calculate tokens from duration
# ~50 tokens per second
duration_seconds = 10
max_tokens = duration_seconds * 50
audio_values = model.generate(**inputs, max_new_tokens=max_tokens)
```

## Performance Issues

### Slow generation

**Problem**: Generation takes too long

**Solutions**:
```python
# Use smaller model
model = MusicGen.get_pretrained('facebook/musicgen-small')

# Reduce duration
model.set_generation_params(duration=10)

# Use GPU
model.to("cuda")

# Enable flash attention if available
# (requires compatible hardware)

# Batch multiple prompts
prompts = ["prompt1", "prompt2", "prompt3"]
wav = model.generate(prompts)  # Single batch is faster than loop

# Use compile (PyTorch 2.0+)
model.lm = torch.compile(model.lm)
```

### CPU fallback

**Problem**: Generation running on CPU instead of GPU

**Solutions**:
```python
import torch

# Check CUDA availability
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA device: {torch.cuda.get_device_name(0)}")

# Explicitly move to GPU
model = MusicGen.get_pretrained('facebook/musicgen-small')
model.to("cuda")

# Verify model device
print(f"Model device: {next(model.lm.parameters()).device}")
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `CUDA out of memory` | Model too large | Use smaller model, reduce duration |
| `ffmpeg not found` | FFmpeg not installed | Install FFmpeg |
| `No module named 'audiocraft'` | Not installed | `pip install audiocraft` |
| `RuntimeError: Expected 3D tensor` | Wrong input shape | Check tensor dimensions |
| `KeyError: 'melody'` | Wrong model for melody | Use musicgen-melody |
| `Sample rate mismatch` | Wrong audio format | Resample to model rate |

## Getting Help

1. **GitHub Issues**: https://github.com/facebookresearch/audiocraft/issues
2. **HuggingFace Forums**: https://discuss.huggingface.co
3. **Paper**: https://arxiv.org/abs/2306.05284

### Reporting Issues

Include:
- Python version
- PyTorch version
- CUDA version
- AudioCraft version: `pip show audiocraft`
- Full error traceback
- Minimal reproducible code
- Hardware (GPU model, VRAM)
