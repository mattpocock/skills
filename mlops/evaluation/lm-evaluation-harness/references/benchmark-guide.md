# Benchmark Guide

Complete guide to all 60+ evaluation tasks in lm-evaluation-harness, what they measure, and how to interpret results.

## Overview

The lm-evaluation-harness includes 60+ benchmarks spanning:
- Language understanding (MMLU, GLUE)
- Mathematical reasoning (GSM8K, MATH)
- Code generation (HumanEval, MBPP)
- Instruction following (IFEval, AlpacaEval)
- Long-context understanding (LongBench)
- Multilingual capabilities (AfroBench, NorEval)
- Reasoning (BBH, ARC)
- Truthfulness (TruthfulQA)

**List all tasks**:
```bash
lm_eval --tasks list
```

## Major Benchmarks

### MMLU (Massive Multitask Language Understanding)

**What it measures**: Broad knowledge across 57 subjects (STEM, humanities, social sciences, law).

**Task variants**:
- `mmlu`: Original 57-subject benchmark
- `mmlu_pro`: More challenging version with reasoning-focused questions
- `mmlu_prox`: Multilingual extension

**Format**: Multiple choice (4 options)

**Example**:
```
Question: What is the capital of France?
A. Berlin
B. Paris
C. London
D. Madrid
Answer: B
```

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu \
  --num_fewshot 5
```

**Interpretation**:
- Random: 25% (chance)
- GPT-3 (175B): 43.9%
- GPT-4: 86.4%
- Human expert: ~90%

**Good for**: Assessing general knowledge and domain expertise.

### GSM8K (Grade School Math 8K)

**What it measures**: Mathematical reasoning on grade-school level word problems.

**Task variants**:
- `gsm8k`: Base task
- `gsm8k_cot`: With chain-of-thought prompting
- `gsm_plus`: Adversarial variant with perturbations

**Format**: Free-form generation, extract numerical answer

**Example**:
```
Question: A baker made 200 cookies. He sold 3/5 of them in the morning and 1/4 of the remaining in the afternoon. How many cookies does he have left?
Answer: 60
```

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks gsm8k \
  --num_fewshot 5
```

**Interpretation**:
- Random: ~0%
- GPT-3 (175B): 17.0%
- GPT-4: 92.0%
- Llama 2 70B: 56.8%

**Good for**: Testing multi-step reasoning and arithmetic.

### HumanEval

**What it measures**: Python code generation from docstrings (functional correctness).

**Task variants**:
- `humaneval`: Standard benchmark
- `humaneval_instruct`: For instruction-tuned models

**Format**: Code generation, execution-based evaluation

**Example**:
```python
def has_close_elements(numbers: List[float], threshold: float) -> bool:
    """ Check if in given list of numbers, are any two numbers closer to each other than
    given threshold.
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    """
```

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=codellama/CodeLlama-7b-hf \
  --tasks humaneval \
  --batch_size 1
```

**Interpretation**:
- Random: 0%
- GPT-3 (175B): 0%
- Codex: 28.8%
- GPT-4: 67.0%
- Code Llama 34B: 53.7%

**Good for**: Evaluating code generation capabilities.

### BBH (BIG-Bench Hard)

**What it measures**: 23 challenging reasoning tasks where models previously failed to beat humans.

**Categories**:
- Logical reasoning
- Math word problems
- Social understanding
- Algorithmic reasoning

**Format**: Multiple choice and free-form

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks bbh \
  --num_fewshot 3
```

**Interpretation**:
- Random: ~25%
- GPT-3 (175B): 33.9%
- PaLM 540B: 58.3%
- GPT-4: 86.7%

**Good for**: Testing advanced reasoning capabilities.

### IFEval (Instruction-Following Evaluation)

**What it measures**: Ability to follow specific, verifiable instructions.

**Instruction types**:
- Format constraints (e.g., "answer in 3 sentences")
- Length constraints (e.g., "use at least 100 words")
- Content constraints (e.g., "include the word 'banana'")
- Structural constraints (e.g., "use bullet points")

**Format**: Free-form generation with rule-based verification

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-chat-hf \
  --tasks ifeval \
  --batch_size auto
```

**Interpretation**:
- Measures: Instruction adherence (not quality)
- GPT-4: 86% instruction following
- Claude 2: 84%

**Good for**: Evaluating chat/instruct models.

### GLUE (General Language Understanding Evaluation)

**What it measures**: Natural language understanding across 9 tasks.

**Tasks**:
- `cola`: Grammatical acceptability
- `sst2`: Sentiment analysis
- `mrpc`: Paraphrase detection
- `qqp`: Question pairs
- `stsb`: Semantic similarity
- `mnli`: Natural language inference
- `qnli`: Question answering NLI
- `rte`: Recognizing textual entailment
- `wnli`: Winograd schemas

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=bert-base-uncased \
  --tasks glue \
  --num_fewshot 0
```

**Interpretation**:
- BERT Base: 78.3 (GLUE score)
- RoBERTa Large: 88.5
- Human baseline: 87.1

**Good for**: Encoder-only models, fine-tuning baselines.

### LongBench

**What it measures**: Long-context understanding (4K-32K tokens).

**21 tasks covering**:
- Single-document QA
- Multi-document QA
- Summarization
- Few-shot learning
- Code completion
- Synthetic tasks

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks longbench \
  --batch_size 1
```

**Interpretation**:
- Tests context utilization
- Many models struggle beyond 4K tokens
- GPT-4 Turbo: 54.3%

**Good for**: Evaluating long-context models.

## Additional Benchmarks

### TruthfulQA

**What it measures**: Model's propensity to be truthful vs. generate plausible-sounding falsehoods.

**Format**: Multiple choice with 4-5 options

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks truthfulqa_mc2 \
  --batch_size auto
```

**Interpretation**:
- Larger models often score worse (more convincing lies)
- GPT-3: 58.8%
- GPT-4: 59.0%
- Human: ~94%

### ARC (AI2 Reasoning Challenge)

**What it measures**: Grade-school science questions.

**Variants**:
- `arc_easy`: Easier questions
- `arc_challenge`: Harder questions requiring reasoning

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks arc_challenge \
  --num_fewshot 25
```

**Interpretation**:
- ARC-Easy: Most models >80%
- ARC-Challenge random: 25%
- GPT-4: 96.3%

### HellaSwag

**What it measures**: Commonsense reasoning about everyday situations.

**Format**: Choose most plausible continuation

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks hellaswag \
  --num_fewshot 10
```

**Interpretation**:
- Random: 25%
- GPT-3: 78.9%
- Llama 2 70B: 85.3%

### WinoGrande

**What it measures**: Commonsense reasoning via pronoun resolution.

**Example**:
```
The trophy doesn't fit in the brown suitcase because _ is too large.
A. the trophy
B. the suitcase
```

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks winogrande \
  --num_fewshot 5
```

### PIQA

**What it measures**: Physical commonsense reasoning.

**Example**: "To clean a keyboard, use compressed air or..."

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks piqa
```

## Multilingual Benchmarks

### AfroBench

**What it measures**: Performance across 64 African languages.

**15 tasks**: NLU, text generation, knowledge, QA, math reasoning

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks afrobench
```

### NorEval

**What it measures**: Norwegian language understanding (9 task categories).

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=NbAiLab/nb-gpt-j-6B \
  --tasks noreval
```

## Domain-Specific Benchmarks

### MATH

**What it measures**: High-school competition math problems.

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks math \
  --num_fewshot 4
```

**Interpretation**:
- Very challenging
- GPT-4: 42.5%
- Minerva 540B: 33.6%

### MBPP (Mostly Basic Python Problems)

**What it measures**: Python programming from natural language descriptions.

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=codellama/CodeLlama-7b-hf \
  --tasks mbpp \
  --batch_size 1
```

### DROP

**What it measures**: Reading comprehension requiring discrete reasoning.

**Command**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks drop
```

## Benchmark Selection Guide

### For General Purpose Models

Run this suite:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu,gsm8k,hellaswag,arc_challenge,truthfulqa_mc2 \
  --num_fewshot 5
```

### For Code Models

```bash
lm_eval --model hf \
  --model_args pretrained=codellama/CodeLlama-7b-hf \
  --tasks humaneval,mbpp \
  --batch_size 1
```

### For Chat/Instruct Models

```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-chat-hf \
  --tasks ifeval,mmlu,gsm8k_cot \
  --batch_size auto
```

### For Long Context Models

```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-3.1-8B \
  --tasks longbench \
  --batch_size 1
```

## Interpreting Results

### Understanding Metrics

**Accuracy**: Percentage of correct answers (most common)

**Exact Match (EM)**: Requires exact string match (strict)

**F1 Score**: Balances precision and recall

**BLEU/ROUGE**: Text generation similarity

**Pass@k**: Percentage passing when generating k samples

### Typical Score Ranges

| Model Size | MMLU | GSM8K | HumanEval | HellaSwag |
|------------|------|-------|-----------|-----------|
| 7B | 40-50% | 10-20% | 5-15% | 70-80% |
| 13B | 45-55% | 20-35% | 15-25% | 75-82% |
| 70B | 60-70% | 50-65% | 35-50% | 82-87% |
| GPT-4 | 86% | 92% | 67% | 95% |

### Red Flags

- **All tasks at random chance**: Model not trained properly
- **Exact 0% on generation tasks**: Likely format/parsing issue
- **Huge variance across runs**: Check seed/sampling settings
- **Better than GPT-4 on everything**: Likely contamination

## Best Practices

1. **Always report few-shot setting**: 0-shot, 5-shot, etc.
2. **Run multiple seeds**: Report mean ± std
3. **Check for data contamination**: Search training data for benchmark examples
4. **Compare to published baselines**: Validate your setup
5. **Report all hyperparameters**: Model, batch size, max tokens, temperature

## References

- Task list: `lm_eval --tasks list`
- Task README: `lm_eval/tasks/README.md`
- Papers: See individual benchmark papers
