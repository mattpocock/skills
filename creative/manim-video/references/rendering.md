# Rendering Reference

## Prerequisites

```bash
manim --version       # Manim CE
pdflatex --version    # LaTeX
ffmpeg -version       # ffmpeg
```

## CLI Reference

```bash
manim -ql script.py Scene1 Scene2    # draft (480p 15fps)
manim -qm script.py Scene1           # medium (720p 30fps)
manim -qh script.py Scene1           # production (1080p 60fps)
manim -ql --format=png -s script.py Scene1  # preview still (last frame)
manim -ql --format=gif script.py Scene1     # GIF output
```

## Quality Presets

| Flag | Resolution | FPS | Use case |
|------|-----------|-----|----------|
| `-ql` | 854x480 | 15 | Draft iteration (layout, timing) |
| `-qm` | 1280x720 | 30 | Preview (use for text-heavy scenes) |
| `-qh` | 1920x1080 | 60 | Production |

**Text rendering quality:** `-ql` (480p15) produces noticeably poor text kerning and readability. For scenes with significant text, preview stills at `-qm` to catch issues invisible at 480p. Use `-ql` only for testing layout and animation timing.

## Output Structure

```
media/videos/script/480p15/Scene1_Intro.mp4
media/images/script/Scene1_Intro.png  (from -s flag)
```

## Stitching with ffmpeg

```bash
cat > concat.txt << 'EOF'
file 'media/videos/script/480p15/Scene1_Intro.mp4'
file 'media/videos/script/480p15/Scene2_Core.mp4'
EOF
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy final.mp4
```

## Add Voiceover

```bash
# Mux narration
ffmpeg -y -i final.mp4 -i narration.mp3 -c:v copy -c:a aac -b:a 192k -shortest final_narrated.mp4

# Concat per-scene audio first
cat > audio_concat.txt << 'EOF'
file 'audio/scene1.mp3'
file 'audio/scene2.mp3'
EOF
ffmpeg -y -f concat -safe 0 -i audio_concat.txt -c copy full_narration.mp3
```

## Add Background Music

```bash
ffmpeg -y -i final.mp4 -i music.mp3 \
  -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=shortest" \
  -c:v copy final_with_music.mp4
```

## GIF Export

```bash
ffmpeg -y -i scene.mp4 \
  -vf "fps=15,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  output.gif
```

## Aspect Ratios

```bash
manim -ql --resolution 1080,1920 script.py Scene  # 9:16 vertical
manim -ql --resolution 1080,1080 script.py Scene  # 1:1 square
```

## Render Workflow

1. Draft render all scenes at `-ql`
2. Preview stills at key moments (`-s`)
3. Fix and re-render only broken scenes
4. Stitch with ffmpeg
5. Review stitched output
6. Production render at `-qh`
7. Re-stitch + add audio

## manim.cfg — Project Configuration

Create `manim.cfg` in the project directory for per-project defaults:

```ini
[CLI]
quality = low_quality
preview = True
media_dir = ./media

[renderer]
background_color = #0D1117

[tex]
tex_template_file = custom_template.tex
```

This eliminates repetitive CLI flags and `self.camera.background_color` in every scene.

## Sections — Chapter Markers

Mark sections within a scene for organized output:

```python
class LongVideo(Scene):
    def construct(self):
        self.next_section("Introduction")
        # ... intro content ...

        self.next_section("Main Concept")
        # ... main content ...

        self.next_section("Conclusion")
        # ... closing ...
```

Render individual sections: `manim --save_sections script.py LongVideo`
This outputs separate video files per section — useful for long videos where you want to re-render only one part.

## manim-voiceover Plugin (Recommended for Narrated Videos)

The official `manim-voiceover` plugin integrates TTS directly into scene code, auto-syncing animation duration to voiceover length. This is significantly cleaner than the manual ffmpeg muxing approach above.

### Installation

```bash
pip install "manim-voiceover[elevenlabs]"
# Or for free/local TTS:
pip install "manim-voiceover[gtts]"    # Google TTS (free, lower quality)
pip install "manim-voiceover[azure]"   # Azure Cognitive Services
```

### Usage

```python
from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.elevenlabs import ElevenLabsService

class NarratedScene(VoiceoverScene):
    def construct(self):
        self.set_speech_service(ElevenLabsService(
            voice_name="Alice",
            model_id="eleven_multilingual_v2"
        ))

        # Voiceover auto-controls scene duration
        with self.voiceover(text="Here is a circle being drawn.") as tracker:
            self.play(Create(Circle()), run_time=tracker.duration)

        with self.voiceover(text="Now let's transform it into a square.") as tracker:
            self.play(Transform(circle, Square()), run_time=tracker.duration)
```

### Key Features

- `tracker.duration` — total voiceover duration in seconds
- `tracker.time_until_bookmark("mark1")` — sync specific animations to specific words
- Auto-generates subtitle `.srt` files
- Caches audio locally — re-renders don't re-generate TTS
- Works with: ElevenLabs, Azure, Google TTS, pyttsx3 (offline), and custom services

### Bookmarks for Precise Sync

```python
with self.voiceover(text='This is a <bookmark mark="circle"/>circle.') as tracker:
    self.wait_until_bookmark("circle")
    self.play(Create(Circle()), run_time=tracker.time_until_bookmark("circle", limit=1))
```

This is the recommended approach for any video with narration. The manual ffmpeg muxing workflow above is still useful for adding background music or post-production audio mixing.
