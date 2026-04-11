# DSPy Modules

Complete guide to DSPy's built-in modules for language model programming.

## Module Basics

DSPy modules are composable building blocks inspired by PyTorch's NN modules:
- Have learnable parameters (prompts, few-shot examples)
- Can be composed using Python control flow
- Generalized to handle any signature
- Optimizable with DSPy optimizers

### Base Module Pattern

```python
import dspy

class CustomModule(dspy.Module):
    def __init__(self):
        super().__init__()
        # Initialize sub-modules
        self.predictor = dspy.Predict("input -> output")

    def forward(self, input):
        # Module logic
        result = self.predictor(input=input)
        return result
```

## Core Modules

### dspy.Predict

**Basic prediction module** - Makes LM calls without reasoning steps.

```python
# Inline signature
qa = dspy.Predict("question -> answer")
result = qa(question="What is 2+2?")

# Class signature
class QA(dspy.Signature):
    """Answer questions concisely."""
    question = dspy.InputField()
    answer = dspy.OutputField(desc="short, factual answer")

qa = dspy.Predict(QA)
result = qa(question="What is the capital of France?")
print(result.answer)  # "Paris"
```

**When to use:**
- Simple, direct predictions
- No reasoning steps needed
- Fast responses required

### dspy.ChainOfThought

**Step-by-step reasoning** - Generates rationale before answer.

**Parameters:**
- `signature`: Task signature
- `rationale_field`: Custom reasoning field (optional)
- `rationale_field_type`: Type for rationale (default: `str`)

```python
# Basic usage
cot = dspy.ChainOfThought("question -> answer")
result = cot(question="If I have 5 apples and give away 2, how many remain?")
print(result.rationale)  # "Let's think step by step..."
print(result.answer)     # "3"

# Custom rationale field
cot = dspy.ChainOfThought(
    signature="problem -> solution",
    rationale_field=dspy.OutputField(
        prefix="Reasoning: Let's break this down step by step to"
    )
)
```

**When to use:**
- Complex reasoning tasks
- Math word problems
- Logical deduction
- Quality > speed

**Performance:**
- ~2x slower than Predict
- Significantly better accuracy on reasoning tasks

### dspy.ProgramOfThought

**Code-based reasoning** - Generates and executes Python code.

```python
pot = dspy.ProgramOfThought("question -> answer")

result = pot(question="What is 15% of 240?")
# Internally generates: answer = 240 * 0.15
# Executes code and returns result
print(result.answer)  # 36.0

result = pot(question="If a train travels 60 mph for 2.5 hours, how far does it go?")
# Generates: distance = 60 * 2.5
print(result.answer)  # 150.0
```

**When to use:**
- Arithmetic calculations
- Symbolic math
- Data transformations
- Deterministic computations

**Benefits:**
- More reliable than text-based math
- Handles complex calculations
- Transparent (shows generated code)

### dspy.ReAct

**Reasoning + Acting** - Agent that uses tools iteratively.

```python
from dspy.predict import ReAct

# Define tools
def search_wikipedia(query: str) -> str:
    """Search Wikipedia for information."""
    # Your search implementation
    return search_results

def calculate(expression: str) -> float:
    """Evaluate a mathematical expression."""
    return eval(expression)

# Create ReAct agent
class ResearchQA(dspy.Signature):
    """Answer questions using available tools."""
    question = dspy.InputField()
    answer = dspy.OutputField()

react = ReAct(ResearchQA, tools=[search_wikipedia, calculate])

# Agent decides which tools to use
result = react(question="How old was Einstein when he published special relativity?")
# Internally:
# 1. Thinks: "Need birth year and publication year"
# 2. Acts: search_wikipedia("Albert Einstein")
# 3. Acts: search_wikipedia("Special relativity 1905")
# 4. Acts: calculate("1905 - 1879")
# 5. Returns: "26 years old"
```

**When to use:**
- Multi-step research tasks
- Tool-using agents
- Complex information retrieval
- Tasks requiring multiple API calls

**Best practices:**
- Keep tool descriptions clear and specific
- Limit to 5-7 tools (too many = confusion)
- Provide tool usage examples in docstrings

### dspy.MultiChainComparison

**Generate multiple outputs and compare** - Self-consistency pattern.

```python
mcc = dspy.MultiChainComparison("question -> answer", M=5)

result = mcc(question="What is the capital of France?")
# Generates 5 candidate answers
# Compares and selects most consistent
print(result.answer)  # "Paris"
print(result.candidates)  # All 5 generated answers
```

**Parameters:**
- `M`: Number of candidates to generate (default: 5)
- `temperature`: Sampling temperature for diversity

**When to use:**
- High-stakes decisions
- Ambiguous questions
- When single answer may be unreliable

**Tradeoff:**
- M times slower (M parallel calls)
- Higher accuracy on ambiguous tasks

### dspy.majority

**Majority voting over multiple predictions.**

```python
from dspy.primitives import majority

# Generate multiple predictions
predictor = dspy.Predict("question -> answer")
predictions = [predictor(question="What is 2+2?") for _ in range(5)]

# Take majority vote
answer = majority([p.answer for p in predictions])
print(answer)  # "4"
```

**When to use:**
- Combining multiple model outputs
- Reducing variance in predictions
- Ensemble approaches

## Advanced Modules

### dspy.TypedPredictor

**Structured output with Pydantic models.**

```python
from pydantic import BaseModel, Field

class PersonInfo(BaseModel):
    name: str = Field(description="Full name")
    age: int = Field(description="Age in years")
    occupation: str = Field(description="Current job")

class ExtractPerson(dspy.Signature):
    """Extract person information from text."""
    text = dspy.InputField()
    person: PersonInfo = dspy.OutputField()

extractor = dspy.TypedPredictor(ExtractPerson)
result = extractor(text="John Doe is a 35-year-old software engineer.")

print(result.person.name)       # "John Doe"
print(result.person.age)        # 35
print(result.person.occupation) # "software engineer"
```

**Benefits:**
- Type safety
- Automatic validation
- JSON schema generation
- IDE autocomplete

### dspy.Retry

**Automatic retry with validation.**

```python
from dspy.primitives import Retry

def validate_number(example, pred, trace=None):
    """Validate output is a number."""
    try:
        float(pred.answer)
        return True
    except ValueError:
        return False

# Retry up to 3 times if validation fails
qa = Retry(
    dspy.ChainOfThought("question -> answer"),
    validate=validate_number,
    max_retries=3
)

result = qa(question="What is 15% of 80?")
# If first attempt returns non-numeric, retries automatically
```

### dspy.Assert

**Assertion-driven optimization.**

```python
import dspy
from dspy.primitives.assertions import assert_transform_module, backtrack_handler

class ValidatedQA(dspy.Module):
    def __init__(self):
        super().__init__()
        self.qa = dspy.ChainOfThought("question -> answer: float")

    def forward(self, question):
        answer = self.qa(question=question).answer

        # Assert answer is numeric
        dspy.Assert(
            isinstance(float(answer), float),
            "Answer must be a number",
            backtrack=backtrack_handler
        )

        return dspy.Prediction(answer=answer)
```

**Benefits:**
- Catches errors during optimization
- Guides LM toward valid outputs
- Better than post-hoc filtering

## Module Composition

### Sequential Pipeline

```python
class Pipeline(dspy.Module):
    def __init__(self):
        super().__init__()
        self.stage1 = dspy.Predict("input -> intermediate")
        self.stage2 = dspy.ChainOfThought("intermediate -> output")

    def forward(self, input):
        intermediate = self.stage1(input=input).intermediate
        output = self.stage2(intermediate=intermediate).output
        return dspy.Prediction(output=output)
```

### Conditional Logic

```python
class ConditionalModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.router = dspy.Predict("question -> category: str")
        self.simple_qa = dspy.Predict("question -> answer")
        self.complex_qa = dspy.ChainOfThought("question -> answer")

    def forward(self, question):
        category = self.router(question=question).category

        if category == "simple":
            return self.simple_qa(question=question)
        else:
            return self.complex_qa(question=question)
```

### Parallel Execution

```python
class ParallelModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.approach1 = dspy.ChainOfThought("question -> answer")
        self.approach2 = dspy.ProgramOfThought("question -> answer")

    def forward(self, question):
        # Run both approaches
        answer1 = self.approach1(question=question).answer
        answer2 = self.approach2(question=question).answer

        # Compare or combine results
        if answer1 == answer2:
            return dspy.Prediction(answer=answer1, confidence="high")
        else:
            return dspy.Prediction(answer=answer1, confidence="low")
```

## Batch Processing

All modules support batch processing for efficiency:

```python
cot = dspy.ChainOfThought("question -> answer")

questions = [
    "What is 2+2?",
    "What is 3+3?",
    "What is 4+4?"
]

# Process all at once
results = cot.batch([{"question": q} for q in questions])

for result in results:
    print(result.answer)
```

## Saving and Loading

```python
# Save module
qa = dspy.ChainOfThought("question -> answer")
qa.save("models/qa_v1.json")

# Load module
loaded_qa = dspy.ChainOfThought("question -> answer")
loaded_qa.load("models/qa_v1.json")
```

**What gets saved:**
- Few-shot examples
- Prompt instructions
- Module configuration

**What doesn't get saved:**
- Model weights (DSPy doesn't fine-tune by default)
- LM provider configuration

## Module Selection Guide

| Task | Module | Reason |
|------|--------|--------|
| Simple classification | Predict | Fast, direct |
| Math word problems | ProgramOfThought | Reliable calculations |
| Logical reasoning | ChainOfThought | Better with steps |
| Multi-step research | ReAct | Tool usage |
| High-stakes decisions | MultiChainComparison | Self-consistency |
| Structured extraction | TypedPredictor | Type safety |
| Ambiguous questions | MultiChainComparison | Multiple perspectives |

## Performance Tips

1. **Start with Predict**, add reasoning only if needed
2. **Use batch processing** for multiple inputs
3. **Cache predictions** for repeated queries
4. **Profile token usage** with `track_usage=True`
5. **Optimize after prototyping** with teleprompters

## Common Patterns

### Pattern: Retrieval + Generation

```python
class RAG(dspy.Module):
    def __init__(self, k=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=k)
        self.generate = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        context = self.retrieve(question).passages
        return self.generate(context=context, question=question)
```

### Pattern: Verification Loop

```python
class VerifiedQA(dspy.Module):
    def __init__(self):
        super().__init__()
        self.answer = dspy.ChainOfThought("question -> answer")
        self.verify = dspy.Predict("question, answer -> is_correct: bool")

    def forward(self, question, max_attempts=3):
        for _ in range(max_attempts):
            answer = self.answer(question=question).answer
            is_correct = self.verify(question=question, answer=answer).is_correct

            if is_correct:
                return dspy.Prediction(answer=answer)

        return dspy.Prediction(answer="Unable to verify answer")
```

### Pattern: Multi-Turn Dialog

```python
class DialogAgent(dspy.Module):
    def __init__(self):
        super().__init__()
        self.respond = dspy.Predict("history, user_message -> assistant_message")
        self.history = []

    def forward(self, user_message):
        history_str = "\n".join(self.history)
        response = self.respond(history=history_str, user_message=user_message)

        self.history.append(f"User: {user_message}")
        self.history.append(f"Assistant: {response.assistant_message}")

        return response
```
