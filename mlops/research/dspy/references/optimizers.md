# DSPy Optimizers (Teleprompters)

Complete guide to DSPy's optimization algorithms for improving prompts and model weights.

## What are Optimizers?

DSPy optimizers (called "teleprompters") automatically improve your modules by:
- **Synthesizing few-shot examples** from training data
- **Proposing better instructions** through search
- **Fine-tuning model weights** (optional)

**Key idea**: Instead of manually tuning prompts, define a metric and let DSPy optimize.

## Optimizer Selection Guide

| Optimizer | Best For | Speed | Quality | Data Needed |
|-----------|----------|-------|---------|-------------|
| BootstrapFewShot | General purpose | Fast | Good | 10-50 examples |
| MIPRO | Instruction tuning | Medium | Excellent | 50-200 examples |
| BootstrapFinetune | Fine-tuning | Slow | Excellent | 100+ examples |
| COPRO | Prompt optimization | Medium | Good | 20-100 examples |
| KNNFewShot | Quick baseline | Very fast | Fair | 10+ examples |

## Core Optimizers

### BootstrapFewShot

**Most popular optimizer** - Generates few-shot demonstrations from training data.

**How it works:**
1. Takes your training examples
2. Uses your module to generate predictions
3. Selects high-quality predictions (based on metric)
4. Uses these as few-shot examples in future prompts

**Parameters:**
- `metric`: Function that scores predictions (required)
- `max_bootstrapped_demos`: Max demonstrations to generate (default: 4)
- `max_labeled_demos`: Max labeled examples to use (default: 16)
- `max_rounds`: Optimization iterations (default: 1)
- `metric_threshold`: Minimum score to accept (optional)

```python
import dspy
from dspy.teleprompt import BootstrapFewShot

# Define metric
def validate_answer(example, pred, trace=None):
    """Return True if prediction matches gold answer."""
    return example.answer.lower() == pred.answer.lower()

# Training data
trainset = [
    dspy.Example(question="What is 2+2?", answer="4").with_inputs("question"),
    dspy.Example(question="What is 3+5?", answer="8").with_inputs("question"),
    dspy.Example(question="What is 10-3?", answer="7").with_inputs("question"),
]

# Create module
qa = dspy.ChainOfThought("question -> answer")

# Optimize
optimizer = BootstrapFewShot(
    metric=validate_answer,
    max_bootstrapped_demos=3,
    max_rounds=2
)

optimized_qa = optimizer.compile(qa, trainset=trainset)

# Now optimized_qa has learned few-shot examples!
result = optimized_qa(question="What is 5+7?")
```

**Best practices:**
- Start with 10-50 training examples
- Use diverse examples covering edge cases
- Set `max_bootstrapped_demos=3-5` for most tasks
- Increase `max_rounds=2-3` for better quality

**When to use:**
- First optimizer to try
- You have 10+ labeled examples
- Want quick improvements
- General-purpose tasks

### MIPRO (Most Important Prompt Optimization)

**State-of-the-art optimizer** - Iteratively searches for better instructions.

**How it works:**
1. Generates candidate instructions
2. Tests each on validation set
3. Selects best-performing instructions
4. Iterates to refine further

**Parameters:**
- `metric`: Evaluation metric (required)
- `num_candidates`: Instructions to try per iteration (default: 10)
- `init_temperature`: Sampling temperature (default: 1.0)
- `verbose`: Show progress (default: False)

```python
from dspy.teleprompt import MIPRO

# Define metric with more nuance
def answer_quality(example, pred, trace=None):
    """Score answer quality 0-1."""
    if example.answer.lower() in pred.answer.lower():
        return 1.0
    # Partial credit for similar answers
    return 0.5 if len(set(example.answer.split()) & set(pred.answer.split())) > 0 else 0.0

# Larger training set (MIPRO benefits from more data)
trainset = [...]  # 50-200 examples
valset = [...]    # 20-50 examples

# Create module
qa = dspy.ChainOfThought("question -> answer")

# Optimize with MIPRO
optimizer = MIPRO(
    metric=answer_quality,
    num_candidates=10,
    init_temperature=1.0,
    verbose=True
)

optimized_qa = optimizer.compile(
    student=qa,
    trainset=trainset,
    valset=valset,  # MIPRO uses separate validation set
    num_trials=100   # More trials = better quality
)
```

**Best practices:**
- Use 50-200 training examples
- Separate validation set (20-50 examples)
- Run 100-200 trials for best results
- Takes 10-30 minutes typically

**When to use:**
- You have 50+ labeled examples
- Want state-of-the-art performance
- Willing to wait for optimization
- Complex reasoning tasks

### BootstrapFinetune

**Fine-tune model weights** - Creates training dataset for fine-tuning.

**How it works:**
1. Generates synthetic training data
2. Exports data in fine-tuning format
3. You fine-tune model separately
4. Load fine-tuned model back

**Parameters:**
- `metric`: Evaluation metric (required)
- `max_bootstrapped_demos`: Demonstrations to generate (default: 4)
- `max_rounds`: Data generation rounds (default: 1)

```python
from dspy.teleprompt import BootstrapFinetune

# Training data
trainset = [...]  # 100+ examples recommended

# Define metric
def validate(example, pred, trace=None):
    return example.answer == pred.answer

# Create module
qa = dspy.ChainOfThought("question -> answer")

# Generate fine-tuning data
optimizer = BootstrapFinetune(metric=validate)
optimized_qa = optimizer.compile(qa, trainset=trainset)

# Exports training data to file
# You then fine-tune using your LM provider's API

# After fine-tuning, load your model:
finetuned_lm = dspy.OpenAI(model="ft:gpt-3.5-turbo:your-model-id")
dspy.settings.configure(lm=finetuned_lm)
```

**Best practices:**
- Use 100+ training examples
- Validate on held-out test set
- Monitor for overfitting
- Compare with prompt-based methods first

**When to use:**
- You have 100+ examples
- Latency is critical (fine-tuned models faster)
- Task is narrow and well-defined
- Prompt optimization isn't enough

### COPRO (Coordinate Prompt Optimization)

**Optimize prompts via gradient-free search.**

**How it works:**
1. Generates prompt variants
2. Evaluates each variant
3. Selects best prompts
4. Iterates to refine

```python
from dspy.teleprompt import COPRO

# Training data
trainset = [...]

# Define metric
def metric(example, pred, trace=None):
    return example.answer == pred.answer

# Create module
qa = dspy.ChainOfThought("question -> answer")

# Optimize with COPRO
optimizer = COPRO(
    metric=metric,
    breadth=10,  # Candidates per iteration
    depth=3      # Optimization rounds
)

optimized_qa = optimizer.compile(qa, trainset=trainset)
```

**When to use:**
- Want prompt optimization
- Have 20-100 examples
- MIPRO too slow

### KNNFewShot

**Simple k-nearest neighbors** - Selects similar examples for each query.

**How it works:**
1. Embeds all training examples
2. For each query, finds k most similar examples
3. Uses these as few-shot demonstrations

```python
from dspy.teleprompt import KNNFewShot

trainset = [...]

# No metric needed - just selects similar examples
optimizer = KNNFewShot(k=3)
optimized_qa = optimizer.compile(qa, trainset=trainset)

# For each query, uses 3 most similar examples from trainset
```

**When to use:**
- Quick baseline
- Have diverse training examples
- Similarity is good proxy for helpfulness

## Writing Metrics

Metrics are functions that score predictions. They're critical for optimization.

### Binary Metrics

```python
def exact_match(example, pred, trace=None):
    """Return True if prediction exactly matches gold."""
    return example.answer == pred.answer

def contains_answer(example, pred, trace=None):
    """Return True if prediction contains gold answer."""
    return example.answer.lower() in pred.answer.lower()
```

### Continuous Metrics

```python
def f1_score(example, pred, trace=None):
    """F1 score between prediction and gold."""
    pred_tokens = set(pred.answer.lower().split())
    gold_tokens = set(example.answer.lower().split())

    if not pred_tokens:
        return 0.0

    precision = len(pred_tokens & gold_tokens) / len(pred_tokens)
    recall = len(pred_tokens & gold_tokens) / len(gold_tokens)

    if precision + recall == 0:
        return 0.0

    return 2 * (precision * recall) / (precision + recall)

def semantic_similarity(example, pred, trace=None):
    """Embedding similarity between prediction and gold."""
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')

    emb1 = model.encode(example.answer)
    emb2 = model.encode(pred.answer)

    similarity = cosine_similarity(emb1, emb2)
    return similarity
```

### Multi-Factor Metrics

```python
def comprehensive_metric(example, pred, trace=None):
    """Combine multiple factors."""
    score = 0.0

    # Correctness (50%)
    if example.answer.lower() in pred.answer.lower():
        score += 0.5

    # Conciseness (25%)
    if len(pred.answer.split()) <= 20:
        score += 0.25

    # Citation (25%)
    if "source:" in pred.answer.lower():
        score += 0.25

    return score
```

### Using Trace for Debugging

```python
def metric_with_trace(example, pred, trace=None):
    """Metric that uses trace for debugging."""
    is_correct = example.answer == pred.answer

    if trace is not None and not is_correct:
        # Log failures for analysis
        print(f"Failed on: {example.question}")
        print(f"Expected: {example.answer}")
        print(f"Got: {pred.answer}")

    return is_correct
```

## Evaluation Best Practices

### Train/Val/Test Split

```python
# Split data
trainset = data[:100]   # 70%
valset = data[100:120]  # 15%
testset = data[120:]    # 15%

# Optimize on train
optimized = optimizer.compile(module, trainset=trainset)

# Validate during optimization (for MIPRO)
optimized = optimizer.compile(module, trainset=trainset, valset=valset)

# Evaluate on test
from dspy.evaluate import Evaluate
evaluator = Evaluate(devset=testset, metric=metric)
score = evaluator(optimized)
```

### Cross-Validation

```python
from sklearn.model_selection import KFold

kfold = KFold(n_splits=5)
scores = []

for train_idx, val_idx in kfold.split(data):
    trainset = [data[i] for i in train_idx]
    valset = [data[i] for i in val_idx]

    optimized = optimizer.compile(module, trainset=trainset)
    score = evaluator(optimized, devset=valset)
    scores.append(score)

print(f"Average score: {sum(scores) / len(scores):.2f}")
```

### Comparing Optimizers

```python
results = {}

for opt_name, optimizer in [
    ("baseline", None),
    ("fewshot", BootstrapFewShot(metric=metric)),
    ("mipro", MIPRO(metric=metric)),
]:
    if optimizer is None:
        module_opt = module
    else:
        module_opt = optimizer.compile(module, trainset=trainset)

    score = evaluator(module_opt, devset=testset)
    results[opt_name] = score

print(results)
# {'baseline': 0.65, 'fewshot': 0.78, 'mipro': 0.85}
```

## Advanced Patterns

### Custom Optimizer

```python
from dspy.teleprompt import Teleprompter

class CustomOptimizer(Teleprompter):
    def __init__(self, metric):
        self.metric = metric

    def compile(self, student, trainset, **kwargs):
        # Your optimization logic here
        # Return optimized student module
        return student
```

### Multi-Stage Optimization

```python
# Stage 1: Bootstrap few-shot
stage1 = BootstrapFewShot(metric=metric, max_bootstrapped_demos=3)
optimized1 = stage1.compile(module, trainset=trainset)

# Stage 2: Instruction tuning
stage2 = MIPRO(metric=metric, num_candidates=10)
optimized2 = stage2.compile(optimized1, trainset=trainset, valset=valset)

# Final optimized module
final_module = optimized2
```

### Ensemble Optimization

```python
class EnsembleModule(dspy.Module):
    def __init__(self, modules):
        super().__init__()
        self.modules = modules

    def forward(self, question):
        predictions = [m(question=question).answer for m in self.modules]
        # Vote or average
        return dspy.Prediction(answer=max(set(predictions), key=predictions.count))

# Optimize multiple modules
opt1 = BootstrapFewShot(metric=metric).compile(module, trainset=trainset)
opt2 = MIPRO(metric=metric).compile(module, trainset=trainset)
opt3 = COPRO(metric=metric).compile(module, trainset=trainset)

# Ensemble
ensemble = EnsembleModule([opt1, opt2, opt3])
```

## Optimization Workflow

### 1. Start with Baseline

```python
# No optimization
baseline = dspy.ChainOfThought("question -> answer")
baseline_score = evaluator(baseline, devset=testset)
print(f"Baseline: {baseline_score}")
```

### 2. Try BootstrapFewShot

```python
# Quick optimization
fewshot = BootstrapFewShot(metric=metric, max_bootstrapped_demos=3)
optimized = fewshot.compile(baseline, trainset=trainset)
fewshot_score = evaluator(optimized, devset=testset)
print(f"Few-shot: {fewshot_score} (+{fewshot_score - baseline_score:.2f})")
```

### 3. If More Data Available, Try MIPRO

```python
# State-of-the-art optimization
mipro = MIPRO(metric=metric, num_candidates=10)
optimized_mipro = mipro.compile(baseline, trainset=trainset, valset=valset)
mipro_score = evaluator(optimized_mipro, devset=testset)
print(f"MIPRO: {mipro_score} (+{mipro_score - baseline_score:.2f})")
```

### 4. Save Best Model

```python
if mipro_score > fewshot_score:
    optimized_mipro.save("models/best_model.json")
else:
    optimized.save("models/best_model.json")
```

## Common Pitfalls

### 1. Overfitting to Training Data

```python
# ❌ Bad: Too many demos
optimizer = BootstrapFewShot(max_bootstrapped_demos=20)  # Overfits!

# ✅ Good: Moderate demos
optimizer = BootstrapFewShot(max_bootstrapped_demos=3-5)
```

### 2. Metric Doesn't Match Task

```python
# ❌ Bad: Binary metric for nuanced task
def bad_metric(example, pred, trace=None):
    return example.answer == pred.answer  # Too strict!

# ✅ Good: Graded metric
def good_metric(example, pred, trace=None):
    return f1_score(example.answer, pred.answer)  # Allows partial credit
```

### 3. Insufficient Training Data

```python
# ❌ Bad: Too little data
trainset = data[:5]  # Not enough!

# ✅ Good: Sufficient data
trainset = data[:50]  # Better
```

### 4. No Validation Set

```python
# ❌ Bad: Optimizing on test set
optimizer.compile(module, trainset=testset)  # Cheating!

# ✅ Good: Proper splits
optimizer.compile(module, trainset=trainset, valset=valset)
evaluator(optimized, devset=testset)
```

## Performance Tips

1. **Start simple**: BootstrapFewShot first
2. **Use representative data**: Cover edge cases
3. **Monitor overfitting**: Validate on held-out set
4. **Iterate metrics**: Refine based on failures
5. **Save checkpoints**: Don't lose progress
6. **Compare to baseline**: Measure improvement
7. **Test multiple optimizers**: Find best fit

## Resources

- **Paper**: "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines"
- **GitHub**: https://github.com/stanfordnlp/dspy
- **Discord**: https://discord.gg/XCGy2WDCQB
