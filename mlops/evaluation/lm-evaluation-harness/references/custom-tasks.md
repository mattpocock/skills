# Custom Tasks

Complete guide to creating domain-specific evaluation tasks in lm-evaluation-harness.

## Overview

Custom tasks allow you to evaluate models on your own datasets and metrics. Tasks are defined using YAML configuration files with optional Python utilities for complex logic.

**Why create custom tasks**:
- Evaluate on proprietary/domain-specific data
- Test specific capabilities not covered by existing benchmarks
- Create evaluation pipelines for internal models
- Reproduce research experiments

## Quick Start

### Minimal Custom Task

Create `my_tasks/simple_qa.yaml`:

```yaml
task: simple_qa
dataset_path: data/simple_qa.jsonl
output_type: generate_until
doc_to_text: "Question: {{question}}\nAnswer:"
doc_to_target: "{{answer}}"
metric_list:
  - metric: exact_match
    aggregation: mean
    higher_is_better: true
```

**Run it**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks simple_qa \
  --include_path my_tasks/
```

## Task Configuration Reference

### Essential Fields

```yaml
# Task identification
task: my_custom_task           # Unique task name (required)
task_alias: "My Task"          # Display name
tag:                           # Tags for grouping
  - custom
  - domain_specific

# Dataset configuration
dataset_path: data/my_data.jsonl  # HuggingFace dataset or local path
dataset_name: default             # Subset name (if applicable)
training_split: train
validation_split: validation
test_split: test

# Evaluation configuration
output_type: generate_until    # or loglikelihood, multiple_choice
num_fewshot: 5                 # Number of few-shot examples
batch_size: auto               # Batch size

# Prompt templates (Jinja2)
doc_to_text: "Question: {{question}}"
doc_to_target: "{{answer}}"

# Metrics
metric_list:
  - metric: exact_match
    aggregation: mean
    higher_is_better: true

# Metadata
metadata:
  version: 1.0
```

### Output Types

**`generate_until`**: Free-form generation
```yaml
output_type: generate_until
generation_kwargs:
  max_gen_toks: 256
  until:
    - "\n"
    - "."
  temperature: 0.0
```

**`loglikelihood`**: Compute log probability of targets
```yaml
output_type: loglikelihood
# Used for perplexity, classification
```

**`multiple_choice`**: Choose from options
```yaml
output_type: multiple_choice
doc_to_choice: "{{choices}}"  # List of choices
```

## Data Formats

### Local JSONL File

`data/my_data.jsonl`:
```json
{"question": "What is 2+2?", "answer": "4"}
{"question": "Capital of France?", "answer": "Paris"}
```

**Task config**:
```yaml
dataset_path: data/my_data.jsonl
dataset_kwargs:
  data_files:
    test: data/my_data.jsonl
```

### HuggingFace Dataset

```yaml
dataset_path: squad
dataset_name: plain_text
test_split: validation
```

### CSV File

`data/my_data.csv`:
```csv
question,answer,category
What is 2+2?,4,math
Capital of France?,Paris,geography
```

**Task config**:
```yaml
dataset_path: data/my_data.csv
dataset_kwargs:
  data_files:
    test: data/my_data.csv
```

## Prompt Engineering

### Simple Template

```yaml
doc_to_text: "Question: {{question}}\nAnswer:"
doc_to_target: "{{answer}}"
```

### Conditional Logic

```yaml
doc_to_text: |
  {% if context %}
  Context: {{context}}
  {% endif %}
  Question: {{question}}
  Answer:
```

### Multiple Choice

```yaml
doc_to_text: |
  Question: {{question}}
  A. {{choices[0]}}
  B. {{choices[1]}}
  C. {{choices[2]}}
  D. {{choices[3]}}
  Answer:

doc_to_target: "{{ 'ABCD'[answer_idx] }}"
doc_to_choice: ["A", "B", "C", "D"]
```

### Few-Shot Formatting

```yaml
fewshot_delimiter: "\n\n"        # Between examples
target_delimiter: " "            # Between question and answer
doc_to_text: "Q: {{question}}"
doc_to_target: "A: {{answer}}"
```

## Custom Python Functions

For complex logic, use Python functions in `utils.py`.

### Create `my_tasks/utils.py`

```python
def process_docs(dataset):
    """Preprocess documents."""
    def _process(doc):
        # Custom preprocessing
        doc["question"] = doc["question"].strip().lower()
        return doc

    return dataset.map(_process)

def doc_to_text(doc):
    """Custom prompt formatting."""
    context = doc.get("context", "")
    question = doc["question"]

    if context:
        return f"Context: {context}\nQuestion: {question}\nAnswer:"
    return f"Question: {question}\nAnswer:"

def doc_to_target(doc):
    """Custom target extraction."""
    return doc["answer"].strip().lower()

def aggregate_scores(items):
    """Custom metric aggregation."""
    correct = sum(1 for item in items if item == 1.0)
    total = len(items)
    return correct / total if total > 0 else 0.0
```

### Use in Task Config

```yaml
task: my_custom_task
dataset_path: data/my_data.jsonl

# Use Python functions
process_docs: !function utils.process_docs
doc_to_text: !function utils.doc_to_text
doc_to_target: !function utils.doc_to_target

metric_list:
  - metric: exact_match
    aggregation: !function utils.aggregate_scores
    higher_is_better: true
```

## Real-World Examples

### Example 1: Domain QA Task

**Goal**: Evaluate medical question answering.

`medical_qa/medical_qa.yaml`:
```yaml
task: medical_qa
dataset_path: data/medical_qa.jsonl
output_type: generate_until
num_fewshot: 3

doc_to_text: |
  Medical Question: {{question}}
  Context: {{context}}
  Answer (be concise):

doc_to_target: "{{answer}}"

generation_kwargs:
  max_gen_toks: 100
  until:
    - "\n\n"
  temperature: 0.0

metric_list:
  - metric: exact_match
    aggregation: mean
    higher_is_better: true
  - metric: !function utils.medical_f1
    aggregation: mean
    higher_is_better: true

filter_list:
  - name: lowercase
    filter:
      - function: lowercase
      - function: remove_whitespace

metadata:
  version: 1.0
  domain: medical
```

`medical_qa/utils.py`:
```python
from sklearn.metrics import f1_score
import re

def medical_f1(predictions, references):
    """Custom F1 for medical terms."""
    pred_terms = set(extract_medical_terms(predictions[0]))
    ref_terms = set(extract_medical_terms(references[0]))

    if not pred_terms and not ref_terms:
        return 1.0
    if not pred_terms or not ref_terms:
        return 0.0

    tp = len(pred_terms & ref_terms)
    fp = len(pred_terms - ref_terms)
    fn = len(ref_terms - pred_terms)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0

    return 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

def extract_medical_terms(text):
    """Extract medical terminology."""
    # Custom logic
    return re.findall(r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b', text)
```

### Example 2: Code Evaluation

`code_eval/python_challenges.yaml`:
```yaml
task: python_challenges
dataset_path: data/python_problems.jsonl
output_type: generate_until
num_fewshot: 0

doc_to_text: |
  Write a Python function to solve:
  {{problem_statement}}

  Function signature:
  {{function_signature}}

doc_to_target: "{{canonical_solution}}"

generation_kwargs:
  max_gen_toks: 512
  until:
    - "\n\nclass"
    - "\n\ndef"
  temperature: 0.2

metric_list:
  - metric: !function utils.execute_code
    aggregation: mean
    higher_is_better: true

process_results: !function utils.process_code_results

metadata:
  version: 1.0
```

`code_eval/utils.py`:
```python
import subprocess
import json

def execute_code(predictions, references):
    """Execute generated code against test cases."""
    generated_code = predictions[0]
    test_cases = json.loads(references[0])

    try:
        # Execute code with test cases
        for test_input, expected_output in test_cases:
            result = execute_with_timeout(generated_code, test_input, timeout=5)
            if result != expected_output:
                return 0.0
        return 1.0
    except Exception:
        return 0.0

def execute_with_timeout(code, input_data, timeout=5):
    """Safely execute code with timeout."""
    # Implementation with subprocess and timeout
    pass

def process_code_results(doc, results):
    """Process code execution results."""
    return {
        "passed": results[0] == 1.0,
        "generated_code": results[1]
    }
```

### Example 3: Instruction Following

`instruction_eval/instruction_eval.yaml`:
```yaml
task: instruction_following
dataset_path: data/instructions.jsonl
output_type: generate_until
num_fewshot: 0

doc_to_text: |
  Instruction: {{instruction}}
  {% if constraints %}
  Constraints: {{constraints}}
  {% endif %}
  Response:

doc_to_target: "{{expected_response}}"

generation_kwargs:
  max_gen_toks: 256
  temperature: 0.7

metric_list:
  - metric: !function utils.check_constraints
    aggregation: mean
    higher_is_better: true
  - metric: !function utils.semantic_similarity
    aggregation: mean
    higher_is_better: true

process_docs: !function utils.add_constraint_checkers
```

`instruction_eval/utils.py`:
```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def check_constraints(predictions, references):
    """Check if response satisfies constraints."""
    response = predictions[0]
    constraints = json.loads(references[0])

    satisfied = 0
    total = len(constraints)

    for constraint in constraints:
        if verify_constraint(response, constraint):
            satisfied += 1

    return satisfied / total if total > 0 else 1.0

def verify_constraint(response, constraint):
    """Verify single constraint."""
    if constraint["type"] == "length":
        return len(response.split()) >= constraint["min_words"]
    elif constraint["type"] == "contains":
        return constraint["keyword"] in response.lower()
    # Add more constraint types
    return True

def semantic_similarity(predictions, references):
    """Compute semantic similarity."""
    pred_embedding = model.encode(predictions[0])
    ref_embedding = model.encode(references[0])
    return float(util.cos_sim(pred_embedding, ref_embedding))

def add_constraint_checkers(dataset):
    """Parse constraints into verifiable format."""
    def _parse(doc):
        # Parse constraint string into structured format
        doc["parsed_constraints"] = parse_constraints(doc.get("constraints", ""))
        return doc
    return dataset.map(_parse)
```

## Advanced Features

### Output Filtering

```yaml
filter_list:
  - name: extract_answer
    filter:
      - function: regex
        regex_pattern: "Answer: (.*)"
        group: 1
      - function: lowercase
      - function: strip_whitespace
```

### Multiple Metrics

```yaml
metric_list:
  - metric: exact_match
    aggregation: mean
    higher_is_better: true
  - metric: f1
    aggregation: mean
    higher_is_better: true
  - metric: bleu
    aggregation: mean
    higher_is_better: true
```

### Task Groups

Create `my_tasks/_default.yaml`:
```yaml
group: my_eval_suite
task:
  - simple_qa
  - medical_qa
  - python_challenges
```

**Run entire suite**:
```bash
lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks my_eval_suite \
  --include_path my_tasks/
```

## Testing Your Task

### Validate Configuration

```bash
# Test task loading
lm_eval --tasks my_custom_task --include_path my_tasks/ --limit 0

# Run on 5 samples
lm_eval --model hf \
  --model_args pretrained=gpt2 \
  --tasks my_custom_task \
  --include_path my_tasks/ \
  --limit 5
```

### Debug Mode

```bash
lm_eval --model hf \
  --model_args pretrained=gpt2 \
  --tasks my_custom_task \
  --include_path my_tasks/ \
  --limit 1 \
  --log_samples  # Save input/output samples
```

## Best Practices

1. **Start simple**: Test with minimal config first
2. **Version your tasks**: Use `metadata.version`
3. **Document your metrics**: Explain custom metrics in comments
4. **Test with multiple models**: Ensure robustness
5. **Validate on known examples**: Include sanity checks
6. **Use filters carefully**: Can hide errors
7. **Handle edge cases**: Empty strings, missing fields

## Common Patterns

### Classification Task

```yaml
output_type: loglikelihood
doc_to_text: "Text: {{text}}\nLabel:"
doc_to_target: " {{label}}"  # Space prefix important!
metric_list:
  - metric: acc
    aggregation: mean
```

### Perplexity Evaluation

```yaml
output_type: loglikelihood_rolling
doc_to_text: "{{text}}"
metric_list:
  - metric: perplexity
    aggregation: perplexity
```

### Ranking Task

```yaml
output_type: loglikelihood
doc_to_text: "Query: {{query}}\nPassage: {{passage}}\nRelevant:"
doc_to_target: [" Yes", " No"]
metric_list:
  - metric: acc
    aggregation: mean
```

## Troubleshooting

**"Task not found"**: Check `--include_path` and task name

**Empty results**: Verify `doc_to_text` and `doc_to_target` templates

**Metric errors**: Ensure metric names are correct (exact_match, not exact-match)

**Filter issues**: Test filters with `--log_samples`

**Python function not found**: Check `!function module.function_name` syntax

## References

- Task system: EleutherAI/lm-evaluation-harness docs
- Example tasks: `lm_eval/tasks/` directory
- TaskConfig: `lm_eval/api/task.py`
