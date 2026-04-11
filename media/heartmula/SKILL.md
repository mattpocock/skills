---
name: heartmula
description: Set up and run HeartMuLa, the open-source music generation model family (Suno-like). Generates full songs from lyrics + tags with multilingual support.
version: 1.0.0
metadata:
  hermes:
    tags: [music, audio, generation, ai, heartmula, heartcodec, lyrics, songs]
    related_skills: [audiocraft]
---

# HeartMuLa - Open-Source Music Generation

## Overview
HeartMuLa is a family of open-source music foundation models (Apache-2.0) that generates music conditioned on lyrics and tags. Comparable to Suno for open-source. Includes:
- **HeartMuLa** - Music language model (3B/7B) for generation from lyrics + tags
- **HeartCodec** - 12.5Hz music codec for high-fidelity audio reconstruction
- **HeartTranscriptor** - Whisper-based lyrics transcription
- **HeartCLAP** - Audio-text alignment model

## When to Use
- User wants to generate music/songs from text descriptions
- User wants an open-source Suno alternative
- User wants local/offline music generation
- User asks about HeartMuLa, heartlib, or AI music generation

## Hardware Requirements
- **Minimum**: 8GB VRAM with `--lazy_load true` (loads/unloads models sequentially)
- **Recommended**: 16GB+ VRAM for comfortable single-GPU usage
- **Multi-GPU**: Use `--mula_device cuda:0 --codec_device cuda:1` to split across GPUs
- 3B model with lazy_load peaks at ~6.2GB VRAM

## Installation Steps

### 1. Clone Repository
```bash
cd ~/  # or desired directory
git clone https://github.com/HeartMuLa/heartlib.git
cd heartlib
```

### 2. Create Virtual Environment (Python 3.10 required)
```bash
uv venv --python 3.10 .venv
. .venv/bin/activate
uv pip install -e .
```

### 3. Fix Dependency Compatibility Issues

**IMPORTANT**: As of Feb 2026, the pinned dependencies have conflicts with newer packages. Apply these fixes:

```bash
# Upgrade datasets (old version incompatible with current pyarrow)
uv pip install --upgrade datasets

# Upgrade transformers (needed for huggingface-hub 1.x compatibility)
uv pip install --upgrade transformers
```

### 4. Patch Source Code (Required for transformers 5.x)

**Patch 1 - RoPE cache fix** in `src/heartlib/heartmula/modeling_heartmula.py`:

In the `setup_caches` method of the `HeartMuLa` class, add RoPE reinitialization after the `reset_caches` try/except block and before the `with device:` block:

```python
# Re-initialize RoPE caches that were skipped during meta-device loading
from torchtune.models.llama3_1._position_embeddings import Llama3ScaledRoPE
for module in self.modules():
    if isinstance(module, Llama3ScaledRoPE) and not module.is_cache_built:
        module.rope_init()
        module.to(device)
```

**Why**: `from_pretrained` creates model on meta device first; `Llama3ScaledRoPE.rope_init()` skips cache building on meta tensors, then never rebuilds after weights are loaded to real device.

**Patch 2 - HeartCodec loading fix** in `src/heartlib/pipelines/music_generation.py`:

Add `ignore_mismatched_sizes=True` to ALL `HeartCodec.from_pretrained()` calls (there are 2: the eager load in `__init__` and the lazy load in the `codec` property).

**Why**: VQ codebook `initted` buffers have shape `[1]` in checkpoint vs `[]` in model. Same data, just scalar vs 0-d tensor. Safe to ignore.

### 5. Download Model Checkpoints
```bash
cd heartlib  # project root
hf download --local-dir './ckpt' 'HeartMuLa/HeartMuLaGen'
hf download --local-dir './ckpt/HeartMuLa-oss-3B' 'HeartMuLa/HeartMuLa-oss-3B-happy-new-year'
hf download --local-dir './ckpt/HeartCodec-oss' 'HeartMuLa/HeartCodec-oss-20260123'
```

All 3 can be downloaded in parallel. Total size is several GB.

## GPU / CUDA

HeartMuLa uses CUDA by default (`--mula_device cuda --codec_device cuda`). No extra setup needed if the user has an NVIDIA GPU with PyTorch CUDA support installed.

- The installed `torch==2.4.1` includes CUDA 12.1 support out of the box
- `torchtune` may report version `0.4.0+cpu` — this is just package metadata, it still uses CUDA via PyTorch
- To verify GPU is being used, look for "CUDA memory" lines in the output (e.g. "CUDA memory before unloading: 6.20 GB")
- **No GPU?** You can run on CPU with `--mula_device cpu --codec_device cpu`, but expect generation to be **extremely slow** (potentially 30-60+ minutes for a single song vs ~4 minutes on GPU). CPU mode also requires significant RAM (~12GB+ free). If the user has no NVIDIA GPU, recommend using a cloud GPU service (Google Colab free tier with T4, Lambda Labs, etc.) or the online demo at https://heartmula.github.io/ instead.

## Usage

### Basic Generation
```bash
cd heartlib
. .venv/bin/activate
python ./examples/run_music_generation.py \
  --model_path=./ckpt \
  --version="3B" \
  --lyrics="./assets/lyrics.txt" \
  --tags="./assets/tags.txt" \
  --save_path="./assets/output.mp3" \
  --lazy_load true
```

### Input Formatting

**Tags** (comma-separated, no spaces):
```
piano,happy,wedding,synthesizer,romantic
```
or
```
rock,energetic,guitar,drums,male-vocal
```

**Lyrics** (use bracketed structural tags):
```
[Intro]

[Verse]
Your lyrics here...

[Chorus]
Chorus lyrics...

[Bridge]
Bridge lyrics...

[Outro]
```

### Key Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| `--max_audio_length_ms` | 240000 | Max length in ms (240s = 4 min) |
| `--topk` | 50 | Top-k sampling |
| `--temperature` | 1.0 | Sampling temperature |
| `--cfg_scale` | 1.5 | Classifier-free guidance scale |
| `--lazy_load` | false | Load/unload models on demand (saves VRAM) |
| `--mula_dtype` | bfloat16 | Dtype for HeartMuLa (bf16 recommended) |
| `--codec_dtype` | float32 | Dtype for HeartCodec (fp32 recommended for quality) |

### Performance
- RTF (Real-Time Factor) ≈ 1.0 — a 4-minute song takes ~4 minutes to generate
- Output: MP3, 48kHz stereo, 128kbps

## Pitfalls
1. **Do NOT use bf16 for HeartCodec** — degrades audio quality. Use fp32 (default).
2. **Tags may be ignored** — known issue (#90). Lyrics tend to dominate; experiment with tag ordering.
3. **Triton not available on macOS** — Linux/CUDA only for GPU acceleration.
4. **RTX 5080 incompatibility** reported in upstream issues.
5. The dependency pin conflicts require the manual upgrades and patches described above.

## Links
- Repo: https://github.com/HeartMuLa/heartlib
- Models: https://huggingface.co/HeartMuLa
- Paper: https://arxiv.org/abs/2601.10547
- License: Apache-2.0
