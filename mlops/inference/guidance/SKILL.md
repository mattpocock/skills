---
name: guidance
description: Control LLM output with regex and grammars, guarantee valid JSON/XML/code generation, enforce structured formats, and build multi-step workflows with Guidance - Microsoft Research's constrained generation framework
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [guidance, transformers]
metadata:
  hermes:
    tags: [Prompt Engineering, Guidance, Constrained Generation, Structured Output, JSON Validation, Grammar, Microsoft Research, Format Enforcement, Multi-Step Workflows]

---

# Guidance: Constrained LLM Generation

## When to Use This Skill

Use Guidance when you need to:
- **Control LLM output syntax** with regex or grammars
- **Guarantee valid JSON/XML/code** generation
- **Reduce latency** vs traditional prompting approaches
- **Enforce structured formats** (dates, emails, IDs, etc.)
- **Build multi-step workflows** with Pythonic control flow
- **Prevent invalid outputs** through grammatical constraints

**GitHub Stars**: 18,000+ | **From**: Microsoft Research

## Installation

```bash
# Base installation
pip install guidance

# With specific backends
pip install guidance[transformers]  # Hugging Face models
pip install guidance[llama_cpp]     # llama.cpp models
```

## Quick Start

### Basic Example: Structured Generation

```python
from guidance import models, gen

# Load model (supports OpenAI, Transformers, llama.cpp)
lm = models.OpenAI("gpt-4")

# Generate with constraints
result = lm + "The capital of France is " + gen("capital", max_tokens=5)

print(result["capital"])  # "Paris"
```

### With Anthropic Claude

```python
from guidance import models, gen, system, user, assistant

# Configure Claude
lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Use context managers for chat format
with system():
    lm += "You are a helpful assistant."

with user():
    lm += "What is the capital of France?"

with assistant():
    lm += gen(max_tokens=20)
```

## Core Concepts

### 1. Context Managers

Guidance uses Pythonic context managers for chat-style interactions.

```python
from guidance import system, user, assistant, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# System message
with system():
    lm += "You are a JSON generation expert."

# User message
with user():
    lm += "Generate a person object with name and age."

# Assistant response
with assistant():
    lm += gen("response", max_tokens=100)

print(lm["response"])
```

**Benefits:**
- Natural chat flow
- Clear role separation
- Easy to read and maintain

### 2. Constrained Generation

Guidance ensures outputs match specified patterns using regex or grammars.

#### Regex Constraints

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Constrain to valid email format
lm += "Email: " + gen("email", regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Constrain to date format (YYYY-MM-DD)
lm += "Date: " + gen("date", regex=r"\d{4}-\d{2}-\d{2}")

# Constrain to phone number
lm += "Phone: " + gen("phone", regex=r"\d{3}-\d{3}-\d{4}")

print(lm["email"])  # Guaranteed valid email
print(lm["date"])   # Guaranteed YYYY-MM-DD format
```

**How it works:**
- Regex converted to grammar at token level
- Invalid tokens filtered during generation
- Model can only produce matching outputs

#### Selection Constraints

```python
from guidance import models, gen, select

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Constrain to specific choices
lm += "Sentiment: " + select(["positive", "negative", "neutral"], name="sentiment")

# Multiple-choice selection
lm += "Best answer: " + select(
    ["A) Paris", "B) London", "C) Berlin", "D) Madrid"],
    name="answer"
)

print(lm["sentiment"])  # One of: positive, negative, neutral
print(lm["answer"])     # One of: A, B, C, or D
```

### 3. Token Healing

Guidance automatically "heals" token boundaries between prompt and generation.

**Problem:** Tokenization creates unnatural boundaries.

```python
# Without token healing
prompt = "The capital of France is "
# Last token: " is "
# First generated token might be " Par" (with leading space)
# Result: "The capital of France is  Paris" (double space!)
```

**Solution:** Guidance backs up one token and regenerates.

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Token healing enabled by default
lm += "The capital of France is " + gen("capital", max_tokens=5)
# Result: "The capital of France is Paris" (correct spacing)
```

**Benefits:**
- Natural text boundaries
- No awkward spacing issues
- Better model performance (sees natural token sequences)

### 4. Grammar-Based Generation

Define complex structures using context-free grammars.

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# JSON grammar (simplified)
json_grammar = """
{
    "name": <gen name regex="[A-Za-z ]+" max_tokens=20>,
    "age": <gen age regex="[0-9]+" max_tokens=3>,
    "email": <gen email regex="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" max_tokens=50>
}
"""

# Generate valid JSON
lm += gen("person", grammar=json_grammar)

print(lm["person"])  # Guaranteed valid JSON structure
```

**Use cases:**
- Complex structured outputs
- Nested data structures
- Programming language syntax
- Domain-specific languages

### 5. Guidance Functions

Create reusable generation patterns with the `@guidance` decorator.

```python
from guidance import guidance, gen, models

@guidance
def generate_person(lm):
    """Generate a person with name and age."""
    lm += "Name: " + gen("name", max_tokens=20, stop="\n")
    lm += "\nAge: " + gen("age", regex=r"[0-9]+", max_tokens=3)
    return lm

# Use the function
lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = generate_person(lm)

print(lm["name"])
print(lm["age"])
```

**Stateful Functions:**

```python
@guidance(stateless=False)
def react_agent(lm, question, tools, max_rounds=5):
    """ReAct agent with tool use."""
    lm += f"Question: {question}\n\n"

    for i in range(max_rounds):
        # Thought
        lm += f"Thought {i+1}: " + gen("thought", stop="\n")

        # Action
        lm += "\nAction: " + select(list(tools.keys()), name="action")

        # Execute tool
        tool_result = tools[lm["action"]]()
        lm += f"\nObservation: {tool_result}\n\n"

        # Check if done
        lm += "Done? " + select(["Yes", "No"], name="done")
        if lm["done"] == "Yes":
            break

    # Final answer
    lm += "\nFinal Answer: " + gen("answer", max_tokens=100)
    return lm
```

## Backend Configuration

### Anthropic Claude

```python
from guidance import models

lm = models.Anthropic(
    model="claude-sonnet-4-5-20250929",
    api_key="your-api-key"  # Or set ANTHROPIC_API_KEY env var
)
```

### OpenAI

```python
lm = models.OpenAI(
    model="gpt-4o-mini",
    api_key="your-api-key"  # Or set OPENAI_API_KEY env var
)
```

### Local Models (Transformers)

```python
from guidance.models import Transformers

lm = Transformers(
    "microsoft/Phi-4-mini-instruct",
    device="cuda"  # Or "cpu"
)
```

### Local Models (llama.cpp)

```python
from guidance.models import LlamaCpp

lm = LlamaCpp(
    model_path="/path/to/model.gguf",
    n_ctx=4096,
    n_gpu_layers=35
)
```

## Common Patterns

### Pattern 1: JSON Generation

```python
from guidance import models, gen, system, user, assistant

lm = models.Anthropic("claude-sonnet-4-5-20250929")

with system():
    lm += "You generate valid JSON."

with user():
    lm += "Generate a user profile with name, age, and email."

with assistant():
    lm += """{
    "name": """ + gen("name", regex=r'"[A-Za-z ]+"', max_tokens=30) + """,
    "age": """ + gen("age", regex=r"[0-9]+", max_tokens=3) + """,
    "email": """ + gen("email", regex=r'"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"', max_tokens=50) + """
}"""

print(lm)  # Valid JSON guaranteed
```

### Pattern 2: Classification

```python
from guidance import models, gen, select

lm = models.Anthropic("claude-sonnet-4-5-20250929")

text = "This product is amazing! I love it."

lm += f"Text: {text}\n"
lm += "Sentiment: " + select(["positive", "negative", "neutral"], name="sentiment")
lm += "\nConfidence: " + gen("confidence", regex=r"[0-9]+", max_tokens=3) + "%"

print(f"Sentiment: {lm['sentiment']}")
print(f"Confidence: {lm['confidence']}%")
```

### Pattern 3: Multi-Step Reasoning

```python
from guidance import models, gen, guidance

@guidance
def chain_of_thought(lm, question):
    """Generate answer with step-by-step reasoning."""
    lm += f"Question: {question}\n\n"

    # Generate multiple reasoning steps
    for i in range(3):
        lm += f"Step {i+1}: " + gen(f"step_{i+1}", stop="\n", max_tokens=100) + "\n"

    # Final answer
    lm += "\nTherefore, the answer is: " + gen("answer", max_tokens=50)

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = chain_of_thought(lm, "What is 15% of 200?")

print(lm["answer"])
```

### Pattern 4: ReAct Agent

```python
from guidance import models, gen, select, guidance

@guidance(stateless=False)
def react_agent(lm, question):
    """ReAct agent with tool use."""
    tools = {
        "calculator": lambda expr: eval(expr),
        "search": lambda query: f"Search results for: {query}",
    }

    lm += f"Question: {question}\n\n"

    for round in range(5):
        # Thought
        lm += f"Thought: " + gen("thought", stop="\n") + "\n"

        # Action selection
        lm += "Action: " + select(["calculator", "search", "answer"], name="action")

        if lm["action"] == "answer":
            lm += "\nFinal Answer: " + gen("answer", max_tokens=100)
            break

        # Action input
        lm += "\nAction Input: " + gen("action_input", stop="\n") + "\n"

        # Execute tool
        if lm["action"] in tools:
            result = tools[lm["action"]](lm["action_input"])
            lm += f"Observation: {result}\n\n"

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = react_agent(lm, "What is 25 * 4 + 10?")
print(lm["answer"])
```

### Pattern 5: Data Extraction

```python
from guidance import models, gen, guidance

@guidance
def extract_entities(lm, text):
    """Extract structured entities from text."""
    lm += f"Text: {text}\n\n"

    # Extract person
    lm += "Person: " + gen("person", stop="\n", max_tokens=30) + "\n"

    # Extract organization
    lm += "Organization: " + gen("organization", stop="\n", max_tokens=30) + "\n"

    # Extract date
    lm += "Date: " + gen("date", regex=r"\d{4}-\d{2}-\d{2}", max_tokens=10) + "\n"

    # Extract location
    lm += "Location: " + gen("location", stop="\n", max_tokens=30) + "\n"

    return lm

text = "Tim Cook announced at Apple Park on 2024-09-15 in Cupertino."

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = extract_entities(lm, text)

print(f"Person: {lm['person']}")
print(f"Organization: {lm['organization']}")
print(f"Date: {lm['date']}")
print(f"Location: {lm['location']}")
```

## Best Practices

### 1. Use Regex for Format Validation

```python
# ✅ Good: Regex ensures valid format
lm += "Email: " + gen("email", regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# ❌ Bad: Free generation may produce invalid emails
lm += "Email: " + gen("email", max_tokens=50)
```

### 2. Use select() for Fixed Categories

```python
# ✅ Good: Guaranteed valid category
lm += "Status: " + select(["pending", "approved", "rejected"], name="status")

# ❌ Bad: May generate typos or invalid values
lm += "Status: " + gen("status", max_tokens=20)
```

### 3. Leverage Token Healing

```python
# Token healing is enabled by default
# No special action needed - just concatenate naturally
lm += "The capital is " + gen("capital")  # Automatic healing
```

### 4. Use stop Sequences

```python
# ✅ Good: Stop at newline for single-line outputs
lm += "Name: " + gen("name", stop="\n")

# ❌ Bad: May generate multiple lines
lm += "Name: " + gen("name", max_tokens=50)
```

### 5. Create Reusable Functions

```python
# ✅ Good: Reusable pattern
@guidance
def generate_person(lm):
    lm += "Name: " + gen("name", stop="\n")
    lm += "\nAge: " + gen("age", regex=r"[0-9]+")
    return lm

# Use multiple times
lm = generate_person(lm)
lm += "\n\n"
lm = generate_person(lm)
```

### 6. Balance Constraints

```python
# ✅ Good: Reasonable constraints
lm += gen("name", regex=r"[A-Za-z ]+", max_tokens=30)

# ❌ Too strict: May fail or be very slow
lm += gen("name", regex=r"^(John|Jane)$", max_tokens=10)
```

## Comparison to Alternatives

| Feature | Guidance | Instructor | Outlines | LMQL |
|---------|----------|------------|----------|------|
| Regex Constraints | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Grammar Support | ✅ CFG | ❌ No | ✅ CFG | ✅ CFG |
| Pydantic Validation | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| Token Healing | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Local Models | ✅ Yes | ⚠️ Limited | ✅ Yes | ✅ Yes |
| API Models | ✅ Yes | ✅ Yes | ⚠️ Limited | ✅ Yes |
| Pythonic Syntax | ✅ Yes | ✅ Yes | ✅ Yes | ❌ SQL-like |
| Learning Curve | Low | Low | Medium | High |

**When to choose Guidance:**
- Need regex/grammar constraints
- Want token healing
- Building complex workflows with control flow
- Using local models (Transformers, llama.cpp)
- Prefer Pythonic syntax

**When to choose alternatives:**
- Instructor: Need Pydantic validation with automatic retrying
- Outlines: Need JSON schema validation
- LMQL: Prefer declarative query syntax

## Performance Characteristics

**Latency Reduction:**
- 30-50% faster than traditional prompting for constrained outputs
- Token healing reduces unnecessary regeneration
- Grammar constraints prevent invalid token generation

**Memory Usage:**
- Minimal overhead vs unconstrained generation
- Grammar compilation cached after first use
- Efficient token filtering at inference time

**Token Efficiency:**
- Prevents wasted tokens on invalid outputs
- No need for retry loops
- Direct path to valid outputs

## Resources

- **Documentation**: https://guidance.readthedocs.io
- **GitHub**: https://github.com/guidance-ai/guidance (18k+ stars)
- **Notebooks**: https://github.com/guidance-ai/guidance/tree/main/notebooks
- **Discord**: Community support available

## See Also

- `references/constraints.md` - Comprehensive regex and grammar patterns
- `references/backends.md` - Backend-specific configuration
- `references/examples.md` - Production-ready examples


