# API Evaluation

Guide to evaluating OpenAI, Anthropic, and other API-based language models.

## Overview

The lm-evaluation-harness supports evaluating API-based models through a unified `TemplateAPI` interface. This allows benchmarking of:
- OpenAI models (GPT-4, GPT-3.5, etc.)
- Anthropic models (Claude 3, Claude 2, etc.)
- Local OpenAI-compatible APIs
- Custom API endpoints

**Why evaluate API models**:
- Benchmark closed-source models
- Compare API models to open models
- Validate API performance
- Track model updates over time

## Supported API Models

| Provider | Model Type | Request Types | Logprobs |
|----------|------------|---------------|----------|
| OpenAI (completions) | `openai-completions` | All | ✅ Yes |
| OpenAI (chat) | `openai-chat-completions` | `generate_until` only | ❌ No |
| Anthropic (completions) | `anthropic-completions` | All | ❌ No |
| Anthropic (chat) | `anthropic-chat` | `generate_until` only | ❌ No |
| Local (OpenAI-compatible) | `local-completions` | Depends on server | Varies |

**Note**: Models without logprobs can only be evaluated on generation tasks, not perplexity or loglikelihood tasks.

## OpenAI Models

### Setup

```bash
export OPENAI_API_KEY=sk-...
```

### Completion Models (Legacy)

**Available models**: `davinci-002`, `babbage-002`

```bash
lm_eval --model openai-completions \
  --model_args model=davinci-002 \
  --tasks lambada_openai,hellaswag \
  --batch_size auto
```

**Supports**:
- `generate_until`: ✅
- `loglikelihood`: ✅
- `loglikelihood_rolling`: ✅

### Chat Models

**Available models**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

```bash
lm_eval --model openai-chat-completions \
  --model_args model=gpt-4-turbo \
  --tasks mmlu,gsm8k,humaneval \
  --num_fewshot 5 \
  --batch_size auto
```

**Supports**:
- `generate_until`: ✅
- `loglikelihood`: ❌ (no logprobs)
- `loglikelihood_rolling`: ❌

**Important**: Chat models don't provide logprobs, so they can only be used with generation tasks (MMLU, GSM8K, HumanEval), not perplexity tasks.

### Configuration Options

```bash
lm_eval --model openai-chat-completions \
  --model_args \
    model=gpt-4-turbo,\
    base_url=https://api.openai.com/v1,\
    num_concurrent=5,\
    max_retries=3,\
    timeout=60,\
    batch_size=auto
```

**Parameters**:
- `model`: Model identifier (required)
- `base_url`: API endpoint (default: OpenAI)
- `num_concurrent`: Concurrent requests (default: 5)
- `max_retries`: Retry failed requests (default: 3)
- `timeout`: Request timeout in seconds (default: 60)
- `tokenizer`: Tokenizer to use (default: matches model)
- `tokenizer_backend`: `"tiktoken"` or `"huggingface"`

### Cost Management

OpenAI charges per token. Estimate costs before running:

```python
# Rough estimate
num_samples = 1000
avg_tokens_per_sample = 500  # input + output
cost_per_1k_tokens = 0.01  # GPT-3.5 Turbo

total_cost = (num_samples * avg_tokens_per_sample / 1000) * cost_per_1k_tokens
print(f"Estimated cost: ${total_cost:.2f}")
```

**Cost-saving tips**:
- Use `--limit N` for testing
- Start with `gpt-3.5-turbo` before `gpt-4`
- Set `max_gen_toks` to minimum needed
- Use `num_fewshot=0` for zero-shot when possible

## Anthropic Models

### Setup

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### Completion Models (Legacy)

```bash
lm_eval --model anthropic-completions \
  --model_args model=claude-2.1 \
  --tasks lambada_openai,hellaswag \
  --batch_size auto
```

### Chat Models (Recommended)

**Available models**: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`

```bash
lm_eval --model anthropic-chat \
  --model_args model=claude-3-5-sonnet-20241022 \
  --tasks mmlu,gsm8k,humaneval \
  --num_fewshot 5 \
  --batch_size auto
```

**Aliases**: `anthropic-chat-completions` (same as `anthropic-chat`)

### Configuration Options

```bash
lm_eval --model anthropic-chat \
  --model_args \
    model=claude-3-5-sonnet-20241022,\
    base_url=https://api.anthropic.com,\
    num_concurrent=5,\
    max_retries=3,\
    timeout=60
```

### Cost Management

Anthropic pricing (as of 2024):
- Claude 3.5 Sonnet: $3.00 / 1M input, $15.00 / 1M output
- Claude 3 Opus: $15.00 / 1M input, $75.00 / 1M output
- Claude 3 Haiku: $0.25 / 1M input, $1.25 / 1M output

**Budget-friendly strategy**:
```bash
# Test on small sample first
lm_eval --model anthropic-chat \
  --model_args model=claude-3-haiku-20240307 \
  --tasks mmlu \
  --limit 100

# Then run full eval on best model
lm_eval --model anthropic-chat \
  --model_args model=claude-3-5-sonnet-20241022 \
  --tasks mmlu \
  --num_fewshot 5
```

## Local OpenAI-Compatible APIs

Many local inference servers expose OpenAI-compatible APIs (vLLM, Text Generation Inference, llama.cpp, Ollama).

### vLLM Local Server

**Start server**:
```bash
vllm serve meta-llama/Llama-2-7b-hf \
  --host 0.0.0.0 \
  --port 8000
```

**Evaluate**:
```bash
lm_eval --model local-completions \
  --model_args \
    model=meta-llama/Llama-2-7b-hf,\
    base_url=http://localhost:8000/v1,\
    num_concurrent=1 \
  --tasks mmlu,gsm8k \
  --batch_size auto
```

### Text Generation Inference (TGI)

**Start server**:
```bash
docker run --gpus all --shm-size 1g -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-2-7b-hf
```

**Evaluate**:
```bash
lm_eval --model local-completions \
  --model_args \
    model=meta-llama/Llama-2-7b-hf,\
    base_url=http://localhost:8080/v1 \
  --tasks hellaswag,arc_challenge
```

### Ollama

**Start server**:
```bash
ollama serve
ollama pull llama2:7b
```

**Evaluate**:
```bash
lm_eval --model local-completions \
  --model_args \
    model=llama2:7b,\
    base_url=http://localhost:11434/v1 \
  --tasks mmlu
```

### llama.cpp Server

**Start server**:
```bash
./server -m models/llama-2-7b.gguf --host 0.0.0.0 --port 8080
```

**Evaluate**:
```bash
lm_eval --model local-completions \
  --model_args \
    model=llama2,\
    base_url=http://localhost:8080/v1 \
  --tasks gsm8k
```

## Custom API Implementation

For custom API endpoints, subclass `TemplateAPI`:

### Create `my_api.py`

```python
from lm_eval.models.api_models import TemplateAPI
import requests

class MyCustomAPI(TemplateAPI):
    """Custom API model."""

    def __init__(self, base_url, api_key, **kwargs):
        super().__init__(base_url=base_url, **kwargs)
        self.api_key = api_key

    def _create_payload(self, messages, gen_kwargs):
        """Create API request payload."""
        return {
            "messages": messages,
            "api_key": self.api_key,
            **gen_kwargs
        }

    def parse_generations(self, response):
        """Parse generation response."""
        return response.json()["choices"][0]["text"]

    def parse_logprobs(self, response):
        """Parse logprobs (if available)."""
        # Return None if API doesn't provide logprobs
        logprobs = response.json().get("logprobs")
        if logprobs:
            return logprobs["token_logprobs"]
        return None
```

### Register and Use

```python
from lm_eval import evaluator
from my_api import MyCustomAPI

model = MyCustomAPI(
    base_url="https://api.example.com/v1",
    api_key="your-key"
)

results = evaluator.simple_evaluate(
    model=model,
    tasks=["mmlu", "gsm8k"],
    num_fewshot=5,
    batch_size="auto"
)
```

## Comparing API and Open Models

### Side-by-Side Evaluation

```bash
# Evaluate OpenAI GPT-4
lm_eval --model openai-chat-completions \
  --model_args model=gpt-4-turbo \
  --tasks mmlu,gsm8k,hellaswag \
  --num_fewshot 5 \
  --output_path results/gpt4.json

# Evaluate open Llama 2 70B
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-70b-hf,dtype=bfloat16 \
  --tasks mmlu,gsm8k,hellaswag \
  --num_fewshot 5 \
  --output_path results/llama2-70b.json

# Compare results
python scripts/compare_results.py \
  results/gpt4.json \
  results/llama2-70b.json
```

### Typical Comparisons

| Model | MMLU | GSM8K | HumanEval | Cost |
|-------|------|-------|-----------|------|
| GPT-4 Turbo | 86.4% | 92.0% | 67.0% | $$$$ |
| Claude 3 Opus | 86.8% | 95.0% | 84.9% | $$$$ |
| GPT-3.5 Turbo | 70.0% | 57.1% | 48.1% | $$ |
| Llama 2 70B | 68.9% | 56.8% | 29.9% | Free (self-host) |
| Mixtral 8x7B | 70.6% | 58.4% | 40.2% | Free (self-host) |

## Best Practices

### Rate Limiting

Respect API rate limits:
```bash
lm_eval --model openai-chat-completions \
  --model_args \
    model=gpt-4-turbo,\
    num_concurrent=3,\  # Lower concurrency
    timeout=120 \  # Longer timeout
  --tasks mmlu
```

### Reproducibility

Set temperature to 0 for deterministic results:
```bash
lm_eval --model openai-chat-completions \
  --model_args model=gpt-4-turbo \
  --tasks mmlu \
  --gen_kwargs temperature=0.0
```

Or use `seed` for sampling:
```bash
lm_eval --model anthropic-chat \
  --model_args model=claude-3-5-sonnet-20241022 \
  --tasks gsm8k \
  --gen_kwargs temperature=0.7,seed=42
```

### Caching

API models automatically cache responses to avoid redundant calls:
```bash
# First run: makes API calls
lm_eval --model openai-chat-completions \
  --model_args model=gpt-4-turbo \
  --tasks mmlu \
  --limit 100

# Second run: uses cache (instant, free)
lm_eval --model openai-chat-completions \
  --model_args model=gpt-4-turbo \
  --tasks mmlu \
  --limit 100
```

Cache location: `~/.cache/lm_eval/`

### Error Handling

APIs can fail. Use retries:
```bash
lm_eval --model openai-chat-completions \
  --model_args \
    model=gpt-4-turbo,\
    max_retries=5,\
    timeout=120 \
  --tasks mmlu
```

## Troubleshooting

### "Authentication failed"

Check API key:
```bash
echo $OPENAI_API_KEY  # Should print sk-...
echo $ANTHROPIC_API_KEY  # Should print sk-ant-...
```

### "Rate limit exceeded"

Reduce concurrency:
```bash
--model_args num_concurrent=1
```

Or add delays between requests.

### "Timeout error"

Increase timeout:
```bash
--model_args timeout=180
```

### "Model not found"

For local APIs, verify server is running:
```bash
curl http://localhost:8000/v1/models
```

### Cost Runaway

Use `--limit` for testing:
```bash
lm_eval --model openai-chat-completions \
  --model_args model=gpt-4-turbo \
  --tasks mmlu \
  --limit 50  # Only 50 samples
```

## Advanced Features

### Custom Headers

```bash
lm_eval --model local-completions \
  --model_args \
    base_url=http://api.example.com/v1,\
    header="Authorization: Bearer token,X-Custom: value"
```

### Disable SSL Verification (Development Only)

```bash
lm_eval --model local-completions \
  --model_args \
    base_url=https://localhost:8000/v1,\
    verify_certificate=false
```

### Custom Tokenizer

```bash
lm_eval --model openai-chat-completions \
  --model_args \
    model=gpt-4-turbo,\
    tokenizer=gpt2,\
    tokenizer_backend=huggingface
```

## References

- OpenAI API: https://platform.openai.com/docs/api-reference
- Anthropic API: https://docs.anthropic.com/claude/reference
- TemplateAPI: `lm_eval/models/api_models.py`
- OpenAI models: `lm_eval/models/openai_completions.py`
- Anthropic models: `lm_eval/models/anthropic_llms.py`
