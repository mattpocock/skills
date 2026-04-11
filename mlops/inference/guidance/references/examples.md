# Production-Ready Examples

Real-world examples of using Guidance for structured generation, agents, and workflows.

## Table of Contents
- JSON Generation
- Data Extraction
- Classification Systems
- Agent Systems
- Multi-Step Workflows
- Code Generation
- Production Tips

## JSON Generation

### Basic JSON

```python
from guidance import models, gen, guidance

@guidance
def generate_user(lm):
    """Generate valid user JSON."""
    lm += "{\n"
    lm += '  "name": ' + gen("name", regex=r'"[A-Za-z ]+"') + ",\n"
    lm += '  "age": ' + gen("age", regex=r"[0-9]+") + ",\n"
    lm += '  "email": ' + gen(
        "email",
        regex=r'"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"'
    ) + "\n"
    lm += "}"
    return lm

# Use it
lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm += "Generate a user profile:\n"
lm = generate_user(lm)

print(lm)
# Output: Valid JSON guaranteed
```

### Nested JSON

```python
@guidance
def generate_order(lm):
    """Generate nested order JSON."""
    lm += "{\n"

    # Customer info
    lm += '  "customer": {\n'
    lm += '    "name": ' + gen("customer_name", regex=r'"[A-Za-z ]+"') + ",\n"
    lm += '    "email": ' + gen(
        "customer_email",
        regex=r'"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"'
    ) + "\n"
    lm += "  },\n"

    # Order details
    lm += '  "order": {\n'
    lm += '    "id": ' + gen("order_id", regex=r'"ORD-[0-9]{6}"') + ",\n"
    lm += '    "date": ' + gen("order_date", regex=r'"\d{4}-\d{2}-\d{2}"') + ",\n"
    lm += '    "total": ' + gen("order_total", regex=r"[0-9]+\.[0-9]{2}") + "\n"
    lm += "  },\n"

    # Status
    lm += '  "status": ' + gen(
        "status",
        regex=r'"(pending|processing|shipped|delivered)"'
    ) + "\n"

    lm += "}"
    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = generate_order(lm)
```

### JSON Array

```python
@guidance
def generate_user_list(lm, count=3):
    """Generate JSON array of users."""
    lm += "[\n"

    for i in range(count):
        lm += "  {\n"
        lm += '    "id": ' + gen(f"id_{i}", regex=r"[0-9]+") + ",\n"
        lm += '    "name": ' + gen(f"name_{i}", regex=r'"[A-Za-z ]+"') + ",\n"
        lm += '    "active": ' + gen(f"active_{i}", regex=r"(true|false)") + "\n"
        lm += "  }"
        if i < count - 1:
            lm += ","
        lm += "\n"

    lm += "]"
    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = generate_user_list(lm, count=5)
```

### Dynamic JSON Schema

```python
import json
from guidance import models, gen, guidance

@guidance
def json_from_schema(lm, schema):
    """Generate JSON matching a schema."""
    lm += "{\n"

    fields = list(schema["properties"].items())
    for i, (field_name, field_schema) in enumerate(fields):
        lm += f'  "{field_name}": '

        # Handle different types
        if field_schema["type"] == "string":
            if "pattern" in field_schema:
                lm += gen(field_name, regex=f'"{field_schema["pattern"]}"')
            else:
                lm += gen(field_name, regex=r'"[^"]+"')
        elif field_schema["type"] == "number":
            lm += gen(field_name, regex=r"[0-9]+(\.[0-9]+)?")
        elif field_schema["type"] == "integer":
            lm += gen(field_name, regex=r"[0-9]+")
        elif field_schema["type"] == "boolean":
            lm += gen(field_name, regex=r"(true|false)")

        if i < len(fields) - 1:
            lm += ","
        lm += "\n"

    lm += "}"
    return lm

# Define schema
schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer"},
        "score": {"type": "number"},
        "active": {"type": "boolean"}
    }
}

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = json_from_schema(lm, schema)
```

## Data Extraction

### Extract from Text

```python
from guidance import models, gen, guidance, system, user, assistant

@guidance
def extract_person_info(lm, text):
    """Extract structured info from text."""
    lm += f"Text: {text}\n\n"

    with assistant():
        lm += "Name: " + gen("name", regex=r"[A-Za-z ]+", stop="\n") + "\n"
        lm += "Age: " + gen("age", regex=r"[0-9]+", max_tokens=3) + "\n"
        lm += "Occupation: " + gen("occupation", regex=r"[A-Za-z ]+", stop="\n") + "\n"
        lm += "Email: " + gen(
            "email",
            regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            stop="\n"
        ) + "\n"

    return lm

text = "John Smith is a 35-year-old software engineer. Contact: john@example.com"

lm = models.Anthropic("claude-sonnet-4-5-20250929")

with system():
    lm += "You extract structured information from text."

with user():
    lm = extract_person_info(lm, text)

print(f"Name: {lm['name']}")
print(f"Age: {lm['age']}")
print(f"Occupation: {lm['occupation']}")
print(f"Email: {lm['email']}")
```

### Multi-Entity Extraction

```python
@guidance
def extract_entities(lm, text):
    """Extract multiple entity types."""
    lm += f"Analyze: {text}\n\n"

    # Person entities
    lm += "People:\n"
    for i in range(3):  # Up to 3 people
        lm += f"- " + gen(f"person_{i}", regex=r"[A-Za-z ]+", stop="\n") + "\n"

    # Organization entities
    lm += "\nOrganizations:\n"
    for i in range(2):  # Up to 2 orgs
        lm += f"- " + gen(f"org_{i}", regex=r"[A-Za-z0-9 ]+", stop="\n") + "\n"

    # Dates
    lm += "\nDates:\n"
    for i in range(2):  # Up to 2 dates
        lm += f"- " + gen(f"date_{i}", regex=r"\d{4}-\d{2}-\d{2}", stop="\n") + "\n"

    # Locations
    lm += "\nLocations:\n"
    for i in range(2):  # Up to 2 locations
        lm += f"- " + gen(f"location_{i}", regex=r"[A-Za-z ]+", stop="\n") + "\n"

    return lm

text = """
Tim Cook and Satya Nadella met at Microsoft headquarters in Redmond on 2024-09-15
to discuss the collaboration between Apple and Microsoft. The meeting continued
in Cupertino on 2024-09-20.
"""

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = extract_entities(lm, text)
```

### Batch Extraction

```python
@guidance
def batch_extract(lm, texts):
    """Extract from multiple texts."""
    lm += "Batch Extraction Results:\n\n"

    for i, text in enumerate(texts):
        lm += f"=== Item {i+1} ===\n"
        lm += f"Text: {text}\n"
        lm += "Name: " + gen(f"name_{i}", regex=r"[A-Za-z ]+", stop="\n") + "\n"
        lm += "Sentiment: " + gen(
            f"sentiment_{i}",
            regex=r"(positive|negative|neutral)",
            stop="\n"
        ) + "\n\n"

    return lm

texts = [
    "Alice is happy with the product",
    "Bob is disappointed with the service",
    "Carol has no strong feelings either way"
]

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = batch_extract(lm, texts)
```

## Classification Systems

### Sentiment Analysis

```python
from guidance import models, select, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

text = "This product is absolutely amazing! Best purchase ever."

lm += f"Text: {text}\n\n"
lm += "Sentiment: " + select(
    ["positive", "negative", "neutral"],
    name="sentiment"
)
lm += "\nConfidence: " + gen("confidence", regex=r"[0-9]{1,3}") + "%\n"
lm += "Reasoning: " + gen("reasoning", stop="\n", max_tokens=50)

print(f"Sentiment: {lm['sentiment']}")
print(f"Confidence: {lm['confidence']}%")
print(f"Reasoning: {lm['reasoning']}")
```

### Multi-Label Classification

```python
@guidance
def classify_article(lm, text):
    """Classify article with multiple labels."""
    lm += f"Article: {text}\n\n"

    # Primary category
    lm += "Primary Category: " + select(
        ["Technology", "Business", "Science", "Politics", "Entertainment"],
        name="primary_category"
    ) + "\n"

    # Secondary categories (up to 3)
    lm += "\nSecondary Categories:\n"
    categories = ["Technology", "Business", "Science", "Politics", "Entertainment"]
    for i in range(3):
        lm += f"{i+1}. " + select(categories, name=f"secondary_{i}") + "\n"

    # Tags
    lm += "\nTags: " + gen("tags", stop="\n", max_tokens=50) + "\n"

    # Target audience
    lm += "Target Audience: " + select(
        ["General", "Expert", "Beginner"],
        name="audience"
    )

    return lm

article = """
Apple announced new AI features in iOS 18, leveraging machine learning to improve
battery life and performance. The company's stock rose 5% following the announcement.
"""

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = classify_article(lm, article)
```

### Intent Classification

```python
@guidance
def classify_intent(lm, message):
    """Classify user intent."""
    lm += f"User Message: {message}\n\n"

    # Intent
    lm += "Intent: " + select(
        ["question", "complaint", "request", "feedback", "other"],
        name="intent"
    ) + "\n"

    # Urgency
    lm += "Urgency: " + select(
        ["low", "medium", "high", "critical"],
        name="urgency"
    ) + "\n"

    # Department
    lm += "Route To: " + select(
        ["support", "sales", "billing", "technical"],
        name="department"
    ) + "\n"

    # Sentiment
    lm += "Sentiment: " + select(
        ["positive", "neutral", "negative"],
        name="sentiment"
    )

    return lm

message = "My account was charged twice for the same order. Need help ASAP!"

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = classify_intent(lm, message)

print(f"Intent: {lm['intent']}")
print(f"Urgency: {lm['urgency']}")
print(f"Department: {lm['department']}")
```

## Agent Systems

### ReAct Agent

```python
from guidance import models, gen, select, guidance

@guidance(stateless=False)
def react_agent(lm, question, tools, max_rounds=5):
    """ReAct agent with tool use."""
    lm += f"Question: {question}\n\n"

    for round in range(max_rounds):
        # Thought
        lm += f"Thought {round+1}: " + gen("thought", stop="\n", max_tokens=100) + "\n"

        # Action selection
        lm += "Action: " + select(
            list(tools.keys()) + ["answer"],
            name="action"
        )

        if lm["action"] == "answer":
            lm += "\n\nFinal Answer: " + gen("answer", max_tokens=200)
            break

        # Action input
        lm += "\nAction Input: " + gen("action_input", stop="\n", max_tokens=100) + "\n"

        # Execute tool
        if lm["action"] in tools:
            try:
                result = tools[lm["action"]](lm["action_input"])
                lm += f"Observation: {result}\n\n"
            except Exception as e:
                lm += f"Observation: Error - {str(e)}\n\n"

    return lm

# Define tools
tools = {
    "calculator": lambda expr: eval(expr),
    "search": lambda query: f"Search results for '{query}': [Mock results]",
    "weather": lambda city: f"Weather in {city}: Sunny, 72°F"
}

# Use agent
lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = react_agent(lm, "What is (25 * 4) + 10?", tools)

print(lm["answer"])
```

### Multi-Agent System

```python
@guidance
def coordinator_agent(lm, task):
    """Coordinator that delegates to specialists."""
    lm += f"Task: {task}\n\n"

    # Determine which specialist to use
    lm += "Specialist: " + select(
        ["researcher", "writer", "coder", "analyst"],
        name="specialist"
    ) + "\n"

    lm += "Reasoning: " + gen("reasoning", stop="\n", max_tokens=100) + "\n"

    return lm

@guidance
def researcher_agent(lm, query):
    """Research specialist."""
    lm += f"Research Query: {query}\n\n"
    lm += "Findings:\n"
    for i in range(3):
        lm += f"{i+1}. " + gen(f"finding_{i}", stop="\n", max_tokens=100) + "\n"
    return lm

@guidance
def writer_agent(lm, topic):
    """Writing specialist."""
    lm += f"Topic: {topic}\n\n"
    lm += "Title: " + gen("title", stop="\n", max_tokens=50) + "\n"
    lm += "Content:\n" + gen("content", max_tokens=500)
    return lm

# Coordination workflow
task = "Write an article about AI safety"

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = coordinator_agent(lm, task)

specialist = lm["specialist"]
if specialist == "researcher":
    lm = researcher_agent(lm, task)
elif specialist == "writer":
    lm = writer_agent(lm, task)
```

### Tool Use with Validation

```python
@guidance(stateless=False)
def validated_tool_agent(lm, question):
    """Agent with validated tool calls."""
    tools = {
        "add": lambda a, b: float(a) + float(b),
        "multiply": lambda a, b: float(a) * float(b),
        "divide": lambda a, b: float(a) / float(b) if float(b) != 0 else "Error: Division by zero"
    }

    lm += f"Question: {question}\n\n"

    for i in range(5):
        # Select tool
        lm += "Tool: " + select(list(tools.keys()) + ["done"], name="tool")

        if lm["tool"] == "done":
            lm += "\nAnswer: " + gen("answer", max_tokens=100)
            break

        # Get validated numeric arguments
        lm += "\nArg1: " + gen("arg1", regex=r"-?[0-9]+(\.[0-9]+)?") + "\n"
        lm += "Arg2: " + gen("arg2", regex=r"-?[0-9]+(\.[0-9]+)?") + "\n"

        # Execute
        result = tools[lm["tool"]](lm["arg1"], lm["arg2"])
        lm += f"Result: {result}\n\n"

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = validated_tool_agent(lm, "What is (10 + 5) * 3?")
```

## Multi-Step Workflows

### Chain of Thought

```python
@guidance
def chain_of_thought(lm, question):
    """Multi-step reasoning with CoT."""
    lm += f"Question: {question}\n\n"

    # Generate reasoning steps
    lm += "Let me think step by step:\n\n"
    for i in range(4):
        lm += f"Step {i+1}: " + gen(f"step_{i+1}", stop="\n", max_tokens=100) + "\n"

    # Final answer
    lm += "\nTherefore, the answer is: " + gen("answer", stop="\n", max_tokens=50)

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = chain_of_thought(lm, "If a train travels 60 mph for 2.5 hours, how far does it go?")

print(lm["answer"])
```

### Self-Consistency

```python
@guidance
def self_consistency(lm, question, num_samples=3):
    """Generate multiple reasoning paths and aggregate."""
    lm += f"Question: {question}\n\n"

    answers = []
    for i in range(num_samples):
        lm += f"=== Attempt {i+1} ===\n"
        lm += "Reasoning: " + gen(f"reasoning_{i}", stop="\n", max_tokens=100) + "\n"
        lm += "Answer: " + gen(f"answer_{i}", stop="\n", max_tokens=50) + "\n\n"
        answers.append(lm[f"answer_{i}"])

    # Aggregate (simple majority vote)
    from collections import Counter
    most_common = Counter(answers).most_common(1)[0][0]

    lm += f"Final Answer (by majority): {most_common}\n"
    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = self_consistency(lm, "What is 15% of 200?")
```

### Planning and Execution

```python
@guidance
def plan_and_execute(lm, goal):
    """Plan tasks then execute them."""
    lm += f"Goal: {goal}\n\n"

    # Planning phase
    lm += "Plan:\n"
    num_steps = 4
    for i in range(num_steps):
        lm += f"{i+1}. " + gen(f"plan_step_{i}", stop="\n", max_tokens=100) + "\n"

    # Execution phase
    lm += "\nExecution:\n\n"
    for i in range(num_steps):
        lm += f"Step {i+1}: {lm[f'plan_step_{i}']}\n"
        lm += "Status: " + select(["completed", "in-progress", "blocked"], name=f"status_{i}") + "\n"
        lm += "Result: " + gen(f"result_{i}", stop="\n", max_tokens=150) + "\n\n"

    # Summary
    lm += "Summary: " + gen("summary", max_tokens=200)

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = plan_and_execute(lm, "Build a REST API for a blog platform")
```

## Code Generation

### Python Function

```python
@guidance
def generate_python_function(lm, description):
    """Generate Python function from description."""
    lm += f"Description: {description}\n\n"

    # Function signature
    lm += "def " + gen("func_name", regex=r"[a-z_][a-z0-9_]*") + "("
    lm += gen("params", regex=r"[a-z_][a-z0-9_]*(, [a-z_][a-z0-9_]*)*") + "):\n"

    # Docstring
    lm += '    """' + gen("docstring", stop='"""', max_tokens=100) + '"""\n'

    # Function body
    lm += "    " + gen("body", stop="\n", max_tokens=200) + "\n"

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = generate_python_function(lm, "Check if a number is prime")

print(lm)
```

### SQL Query

```python
@guidance
def generate_sql(lm, description):
    """Generate SQL query from description."""
    lm += f"Description: {description}\n\n"
    lm += "SQL Query:\n"

    # SELECT clause
    lm += "SELECT " + gen("select_clause", stop=" FROM", max_tokens=100)

    # FROM clause
    lm += " FROM " + gen("from_clause", stop=" WHERE", max_tokens=50)

    # WHERE clause (optional)
    lm += " WHERE " + gen("where_clause", stop=";", max_tokens=100) + ";"

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = generate_sql(lm, "Get all users who signed up in the last 30 days")
```

### API Endpoint

```python
@guidance
def generate_api_endpoint(lm, description):
    """Generate REST API endpoint."""
    lm += f"Description: {description}\n\n"

    # HTTP method
    lm += "Method: " + select(["GET", "POST", "PUT", "DELETE"], name="method") + "\n"

    # Path
    lm += "Path: /" + gen("path", regex=r"[a-z0-9/-]+", stop="\n") + "\n"

    # Request body (if POST/PUT)
    if lm["method"] in ["POST", "PUT"]:
        lm += "\nRequest Body:\n"
        lm += "{\n"
        lm += '  "field1": ' + gen("field1", regex=r'"[a-z_]+"') + ",\n"
        lm += '  "field2": ' + gen("field2", regex=r'"[a-z_]+"') + "\n"
        lm += "}\n"

    # Response
    lm += "\nResponse (200 OK):\n"
    lm += "{\n"
    lm += '  "status": "success",\n'
    lm += '  "data": ' + gen("response_data", max_tokens=100) + "\n"
    lm += "}\n"

    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = generate_api_endpoint(lm, "Create a new blog post")
```

## Production Tips

### Error Handling

```python
@guidance
def safe_extraction(lm, text):
    """Extract with fallback handling."""
    try:
        lm += f"Text: {text}\n"
        lm += "Name: " + gen("name", regex=r"[A-Za-z ]+", stop="\n", max_tokens=30)
        return lm
    except Exception as e:
        # Fallback to less strict extraction
        lm += f"Text: {text}\n"
        lm += "Name: " + gen("name", stop="\n", max_tokens=30)
        return lm
```

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_generation(text):
    """Cache LLM generations."""
    lm = models.Anthropic("claude-sonnet-4-5-20250929")
    lm += f"Analyze: {text}\n"
    lm += "Sentiment: " + select(["positive", "negative", "neutral"], name="sentiment")
    return lm["sentiment"]

# First call: hits LLM
result1 = cached_generation("This is great!")

# Second call: returns cached result
result2 = cached_generation("This is great!")  # Instant!
```

### Monitoring

```python
import time

@guidance
def monitored_generation(lm, text):
    """Track generation metrics."""
    start_time = time.time()

    lm += f"Text: {text}\n"
    lm += "Analysis: " + gen("analysis", max_tokens=100)

    elapsed = time.time() - start_time

    # Log metrics
    print(f"Generation time: {elapsed:.2f}s")
    print(f"Output length: {len(lm['analysis'])} chars")

    return lm
```

### Batch Processing

```python
def batch_process(texts, batch_size=10):
    """Process texts in batches."""
    lm = models.Anthropic("claude-sonnet-4-5-20250929")
    results = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]

        for text in batch:
            lm += f"Text: {text}\n"
            lm += "Sentiment: " + select(
                ["positive", "negative", "neutral"],
                name=f"sentiment_{i}"
            ) + "\n\n"

        results.extend([lm[f"sentiment_{i}"] for i in range(len(batch))])

    return results
```

## Resources

- **Guidance Notebooks**: https://github.com/guidance-ai/guidance/tree/main/notebooks
- **Guidance Docs**: https://guidance.readthedocs.io
- **Community Examples**: https://github.com/guidance-ai/guidance/discussions
