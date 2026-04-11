# Whisper Language Support Guide

Complete guide to Whisper's multilingual capabilities.

## Supported languages (99 total)

### Top-tier support (WER < 10%)

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Polish (pl)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)

### Good support (WER 10-20%)

- Arabic (ar)
- Turkish (tr)
- Vietnamese (vi)
- Swedish (sv)
- Finnish (fi)
- Czech (cs)
- Romanian (ro)
- Hungarian (hu)
- Danish (da)
- Norwegian (no)
- Thai (th)
- Hebrew (he)
- Greek (el)
- Indonesian (id)
- Malay (ms)

### Full list (99 languages)

Afrikaans, Albanian, Amharic, Arabic, Armenian, Assamese, Azerbaijani, Bashkir, Basque, Belarusian, Bengali, Bosnian, Breton, Bulgarian, Burmese, Cantonese, Catalan, Chinese, Croatian, Czech, Danish, Dutch, English, Estonian, Faroese, Finnish, French, Galician, Georgian, German, Greek, Gujarati, Haitian Creole, Hausa, Hawaiian, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Javanese, Kannada, Kazakh, Khmer, Korean, Lao, Latin, Latvian, Lingala, Lithuanian, Luxembourgish, Macedonian, Malagasy, Malay, Malayalam, Maltese, Maori, Marathi, Moldavian, Mongolian, Myanmar, Nepali, Norwegian, Nynorsk, Occitan, Pashto, Persian, Polish, Portuguese, Punjabi, Pushto, Romanian, Russian, Sanskrit, Serbian, Shona, Sindhi, Sinhala, Slovak, Slovenian, Somali, Spanish, Sundanese, Swahili, Swedish, Tagalog, Tajik, Tamil, Tatar, Telugu, Thai, Tibetan, Turkish, Turkmen, Ukrainian, Urdu, Uzbek, Vietnamese, Welsh, Yiddish, Yoruba

## Usage examples

### Auto-detect language

```python
import whisper

model = whisper.load_model("turbo")

# Auto-detect language
result = model.transcribe("audio.mp3")

print(f"Detected language: {result['language']}")
print(f"Text: {result['text']}")
```

### Specify language (faster)

```python
# Specify language for faster transcription
result = model.transcribe("audio.mp3", language="es")  # Spanish
result = model.transcribe("audio.mp3", language="fr")  # French
result = model.transcribe("audio.mp3", language="ja")  # Japanese
```

### Translation to English

```python
# Translate any language to English
result = model.transcribe(
    "spanish_audio.mp3",
    task="translate"  # Translates to English
)

print(f"Original language: {result['language']}")
print(f"English translation: {result['text']}")
```

## Language-specific tips

### Chinese

```python
# Chinese works well with larger models
model = whisper.load_model("large")

result = model.transcribe(
    "chinese_audio.mp3",
    language="zh",
    initial_prompt="这是一段关于技术的讨论"  # Context helps
)
```

### Japanese

```python
# Japanese benefits from initial prompt
result = model.transcribe(
    "japanese_audio.mp3",
    language="ja",
    initial_prompt="これは技術的な会議の録音です"
)
```

### Arabic

```python
# Arabic: Use large model for best results
model = whisper.load_model("large")

result = model.transcribe(
    "arabic_audio.mp3",
    language="ar"
)
```

## Model size recommendations

| Language Tier | Recommended Model | WER |
|---------------|-------------------|-----|
| Top-tier (en, es, fr, de) | base/turbo | < 10% |
| Good (ar, tr, vi) | medium/large | 10-20% |
| Lower-resource | large | 20-30% |

## Performance by language

### English

- **tiny**: WER ~15%
- **base**: WER ~8%
- **small**: WER ~5%
- **medium**: WER ~4%
- **large**: WER ~3%
- **turbo**: WER ~3.5%

### Spanish

- **tiny**: WER ~20%
- **base**: WER ~12%
- **medium**: WER ~6%
- **large**: WER ~4%

### Chinese

- **small**: WER ~15%
- **medium**: WER ~8%
- **large**: WER ~5%

## Best practices

1. **Use English-only models** - Better for small models (tiny/base)
2. **Specify language** - Faster than auto-detect
3. **Add initial prompt** - Improves accuracy for technical terms
4. **Use larger models** - For low-resource languages
5. **Test on sample** - Quality varies by accent/dialect
6. **Consider audio quality** - Clear audio = better results
7. **Check language codes** - Use ISO 639-1 codes (2 letters)

## Language detection

```python
# Detect language only (no transcription)
import whisper

model = whisper.load_model("base")

# Load audio
audio = whisper.load_audio("audio.mp3")
audio = whisper.pad_or_trim(audio)

# Make log-Mel spectrogram
mel = whisper.log_mel_spectrogram(audio).to(model.device)

# Detect language
_, probs = model.detect_language(mel)
detected_language = max(probs, key=probs.get)

print(f"Detected language: {detected_language}")
print(f"Confidence: {probs[detected_language]:.2%}")
```

## Resources

- **Paper**: https://arxiv.org/abs/2212.04356
- **GitHub**: https://github.com/openai/whisper
- **Model Card**: https://github.com/openai/whisper/blob/main/model-card.md
