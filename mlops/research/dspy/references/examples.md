# DSPy Real-World Examples

Practical examples of building production systems with DSPy.

## Table of Contents
- RAG Systems
- Agent Systems
- Classification
- Data Processing
- Multi-Stage Pipelines

## RAG Systems

### Basic RAG

```python
import dspy

class BasicRAG(dspy.Module):
    def __init__(self, num_passages=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=num_passages)
        self.generate = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        passages = self.retrieve(question).passages
        context = "\n\n".join(passages)
        return self.generate(context=context, question=question)

# Configure retriever (example with Chroma)
from dspy.retrieve.chromadb_rm import ChromadbRM

retriever = ChromadbRM(
    collection_name="my_docs",
    persist_directory="./chroma_db",
    k=3
)
dspy.settings.configure(rm=retriever)

# Use RAG
rag = BasicRAG()
result = rag(question="What is DSPy?")
print(result.answer)
```

### Optimized RAG

```python
from dspy.teleprompt import BootstrapFewShot

# Training data with question-answer pairs
trainset = [
    dspy.Example(
        question="What is retrieval augmented generation?",
        answer="RAG combines retrieval of relevant documents with generation..."
    ).with_inputs("question"),
    # ... more examples
]

# Define metric
def answer_correctness(example, pred, trace=None):
    # Check if answer contains key information
    return example.answer.lower() in pred.answer.lower()

# Optimize RAG
optimizer = BootstrapFewShot(metric=answer_correctness)
optimized_rag = optimizer.compile(rag, trainset=trainset)

# Optimized RAG performs better on similar questions
result = optimized_rag(question="Explain RAG systems")
```

### Multi-Hop RAG

```python
class MultiHopRAG(dspy.Module):
    """RAG that follows chains of reasoning across documents."""

    def __init__(self):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=3)
        self.generate_query = dspy.ChainOfThought("question -> search_query")
        self.generate_answer = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        # First retrieval
        query1 = self.generate_query(question=question).search_query
        passages1 = self.retrieve(query1).passages

        # Generate follow-up query based on first results
        context1 = "\n".join(passages1)
        query2 = self.generate_query(
            question=f"Based on: {context1}\nFollow-up: {question}"
        ).search_query

        # Second retrieval
        passages2 = self.retrieve(query2).passages

        # Combine all context
        all_context = "\n\n".join(passages1 + passages2)

        # Generate final answer
        return self.generate_answer(context=all_context, question=question)

# Use multi-hop RAG
multi_rag = MultiHopRAG()
result = multi_rag(question="Who wrote the book that inspired Blade Runner?")
# Hop 1: Find "Blade Runner was based on..."
# Hop 2: Find author of that book
```

### RAG with Reranking

```python
class RerankedRAG(dspy.Module):
    """RAG with learned reranking of retrieved passages."""

    def __init__(self):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=10)  # Get more candidates
        self.rerank = dspy.Predict("question, passage -> relevance_score: float")
        self.answer = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        # Retrieve candidates
        passages = self.retrieve(question).passages

        # Rerank passages
        scored_passages = []
        for passage in passages:
            score = float(self.rerank(
                question=question,
                passage=passage
            ).relevance_score)
            scored_passages.append((score, passage))

        # Take top 3 after reranking
        top_passages = [p for _, p in sorted(scored_passages, reverse=True)[:3]]
        context = "\n\n".join(top_passages)

        # Generate answer from reranked context
        return self.answer(context=context, question=question)
```

## Agent Systems

### ReAct Agent

```python
from dspy.predict import ReAct

# Define tools
def search_wikipedia(query: str) -> str:
    """Search Wikipedia for information."""
    import wikipedia
    try:
        return wikipedia.summary(query, sentences=3)
    except:
        return "No results found"

def calculate(expression: str) -> str:
    """Evaluate mathematical expression safely."""
    try:
        # Use safe eval
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except:
        return "Invalid expression"

def search_web(query: str) -> str:
    """Search the web."""
    # Your web search implementation
    return results

# Create agent signature
class ResearchAgent(dspy.Signature):
    """Answer questions using available tools."""
    question = dspy.InputField()
    answer = dspy.OutputField()

# Create ReAct agent
agent = ReAct(ResearchAgent, tools=[search_wikipedia, calculate, search_web])

# Agent decides which tools to use
result = agent(question="What is the population of France divided by 10?")
# Agent:
# 1. Thinks: "Need population of France"
# 2. Acts: search_wikipedia("France population")
# 3. Thinks: "Got 67 million, need to divide"
# 4. Acts: calculate("67000000 / 10")
# 5. Returns: "6,700,000"
```

### Multi-Agent System

```python
class MultiAgentSystem(dspy.Module):
    """System with specialized agents for different tasks."""

    def __init__(self):
        super().__init__()

        # Router agent
        self.router = dspy.Predict("question -> agent_type: str")

        # Specialized agents
        self.research_agent = ReAct(
            ResearchAgent,
            tools=[search_wikipedia, search_web]
        )
        self.math_agent = dspy.ProgramOfThought("problem -> answer")
        self.reasoning_agent = dspy.ChainOfThought("question -> answer")

    def forward(self, question):
        # Route to appropriate agent
        agent_type = self.router(question=question).agent_type

        if agent_type == "research":
            return self.research_agent(question=question)
        elif agent_type == "math":
            return self.math_agent(problem=question)
        else:
            return self.reasoning_agent(question=question)

# Use multi-agent system
mas = MultiAgentSystem()
result = mas(question="What is 15% of the GDP of France?")
# Routes to research_agent for GDP, then to math_agent for calculation
```

## Classification

### Binary Classifier

```python
class SentimentClassifier(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classify = dspy.Predict("text -> sentiment: str")

    def forward(self, text):
        return self.classify(text=text)

# Training data
trainset = [
    dspy.Example(text="I love this!", sentiment="positive").with_inputs("text"),
    dspy.Example(text="Terrible experience", sentiment="negative").with_inputs("text"),
    # ... more examples
]

# Optimize
def accuracy(example, pred, trace=None):
    return example.sentiment == pred.sentiment

optimizer = BootstrapFewShot(metric=accuracy, max_bootstrapped_demos=5)
classifier = SentimentClassifier()
optimized_classifier = optimizer.compile(classifier, trainset=trainset)

# Use classifier
result = optimized_classifier(text="This product is amazing!")
print(result.sentiment)  # "positive"
```

### Multi-Class Classifier

```python
class TopicClassifier(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classify = dspy.ChainOfThought(
            "text -> category: str, confidence: float"
        )

    def forward(self, text):
        result = self.classify(text=text)
        return dspy.Prediction(
            category=result.category,
            confidence=float(result.confidence)
        )

# Define categories in signature
class TopicSignature(dspy.Signature):
    """Classify text into one of: technology, sports, politics, entertainment."""
    text = dspy.InputField()
    category = dspy.OutputField(desc="one of: technology, sports, politics, entertainment")
    confidence = dspy.OutputField(desc="0.0 to 1.0")

classifier = dspy.ChainOfThought(TopicSignature)
result = classifier(text="The Lakers won the championship")
print(result.category)  # "sports"
print(result.confidence)  # 0.95
```

### Hierarchical Classifier

```python
class HierarchicalClassifier(dspy.Module):
    """Two-stage classification: coarse then fine-grained."""

    def __init__(self):
        super().__init__()
        self.coarse = dspy.Predict("text -> broad_category: str")
        self.fine_tech = dspy.Predict("text -> tech_subcategory: str")
        self.fine_sports = dspy.Predict("text -> sports_subcategory: str")

    def forward(self, text):
        # Stage 1: Broad category
        broad = self.coarse(text=text).broad_category

        # Stage 2: Fine-grained based on broad
        if broad == "technology":
            fine = self.fine_tech(text=text).tech_subcategory
        elif broad == "sports":
            fine = self.fine_sports(text=text).sports_subcategory
        else:
            fine = "other"

        return dspy.Prediction(broad_category=broad, fine_category=fine)
```

## Data Processing

### Text Summarization

```python
class AdaptiveSummarizer(dspy.Module):
    """Summarizes text to target length."""

    def __init__(self):
        super().__init__()
        self.summarize = dspy.ChainOfThought("text, target_length -> summary")

    def forward(self, text, target_length="3 sentences"):
        return self.summarize(text=text, target_length=target_length)

# Use summarizer
summarizer = AdaptiveSummarizer()
long_text = "..." # Long article

short_summary = summarizer(long_text, target_length="1 sentence")
medium_summary = summarizer(long_text, target_length="3 sentences")
detailed_summary = summarizer(long_text, target_length="1 paragraph")
```

### Information Extraction

```python
from pydantic import BaseModel, Field

class PersonInfo(BaseModel):
    name: str = Field(description="Full name")
    age: int = Field(description="Age in years")
    occupation: str = Field(description="Job title")
    location: str = Field(description="City and country")

class ExtractPerson(dspy.Signature):
    """Extract person information from text."""
    text = dspy.InputField()
    person: PersonInfo = dspy.OutputField()

extractor = dspy.TypedPredictor(ExtractPerson)

text = "Dr. Jane Smith, 42, is a neuroscientist at Stanford University in Palo Alto, California."
result = extractor(text=text)

print(result.person.name)       # "Dr. Jane Smith"
print(result.person.age)        # 42
print(result.person.occupation) # "neuroscientist"
print(result.person.location)   # "Palo Alto, California"
```

### Batch Processing

```python
class BatchProcessor(dspy.Module):
    """Process large datasets efficiently."""

    def __init__(self):
        super().__init__()
        self.process = dspy.Predict("text -> processed_text")

    def forward(self, texts):
        # Batch processing for efficiency
        return self.process.batch([{"text": t} for t in texts])

# Process 1000 documents
processor = BatchProcessor()
results = processor(texts=large_dataset)

# Results are returned in order
for original, result in zip(large_dataset, results):
    print(f"{original} -> {result.processed_text}")
```

## Multi-Stage Pipelines

### Document Processing Pipeline

```python
class DocumentPipeline(dspy.Module):
    """Multi-stage document processing."""

    def __init__(self):
        super().__init__()
        self.extract = dspy.Predict("document -> key_points")
        self.classify = dspy.Predict("key_points -> category")
        self.summarize = dspy.ChainOfThought("key_points, category -> summary")
        self.tag = dspy.Predict("summary -> tags")

    def forward(self, document):
        # Stage 1: Extract key points
        key_points = self.extract(document=document).key_points

        # Stage 2: Classify
        category = self.classify(key_points=key_points).category

        # Stage 3: Summarize
        summary = self.summarize(
            key_points=key_points,
            category=category
        ).summary

        # Stage 4: Generate tags
        tags = self.tag(summary=summary).tags

        return dspy.Prediction(
            key_points=key_points,
            category=category,
            summary=summary,
            tags=tags
        )
```

### Quality Control Pipeline

```python
class QualityControlPipeline(dspy.Module):
    """Generate output and verify quality."""

    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought("prompt -> output")
        self.verify = dspy.Predict("output -> is_valid: bool, issues: str")
        self.improve = dspy.ChainOfThought("output, issues -> improved_output")

    def forward(self, prompt, max_iterations=3):
        output = self.generate(prompt=prompt).output

        for _ in range(max_iterations):
            # Verify output
            verification = self.verify(output=output)

            if verification.is_valid:
                return dspy.Prediction(output=output, iterations=_ + 1)

            # Improve based on issues
            output = self.improve(
                output=output,
                issues=verification.issues
            ).improved_output

        return dspy.Prediction(output=output, iterations=max_iterations)
```

## Production Tips

### 1. Caching for Performance

```python
from functools import lru_cache

class CachedRAG(dspy.Module):
    def __init__(self):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=3)
        self.generate = dspy.ChainOfThought("context, question -> answer")

    @lru_cache(maxsize=1000)
    def forward(self, question):
        passages = self.retrieve(question).passages
        context = "\n".join(passages)
        return self.generate(context=context, question=question).answer
```

### 2. Error Handling

```python
class RobustModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.process = dspy.ChainOfThought("input -> output")

    def forward(self, input):
        try:
            result = self.process(input=input)
            return result
        except Exception as e:
            # Log error
            print(f"Error processing {input}: {e}")
            # Return fallback
            return dspy.Prediction(output="Error: could not process input")
```

### 3. Monitoring

```python
class MonitoredModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.process = dspy.ChainOfThought("input -> output")
        self.call_count = 0
        self.errors = 0

    def forward(self, input):
        self.call_count += 1

        try:
            result = self.process(input=input)
            return result
        except Exception as e:
            self.errors += 1
            raise

    def get_stats(self):
        return {
            "calls": self.call_count,
            "errors": self.errors,
            "error_rate": self.errors / max(self.call_count, 1)
        }
```

### 4. A/B Testing

```python
class ABTestModule(dspy.Module):
    """Run two variants and compare."""

    def __init__(self, variant_a, variant_b):
        super().__init__()
        self.variant_a = variant_a
        self.variant_b = variant_b
        self.a_calls = 0
        self.b_calls = 0

    def forward(self, input, variant="a"):
        if variant == "a":
            self.a_calls += 1
            return self.variant_a(input=input)
        else:
            self.b_calls += 1
            return self.variant_b(input=input)

# Compare two optimizers
baseline = dspy.ChainOfThought("question -> answer")
optimized = BootstrapFewShot(...).compile(baseline, trainset=trainset)

ab_test = ABTestModule(variant_a=baseline, variant_b=optimized)

# Route 50% to each
import random
variant = "a" if random.random() < 0.5 else "b"
result = ab_test(input=question, variant=variant)
```

## Complete Example: Customer Support Bot

```python
import dspy
from dspy.teleprompt import BootstrapFewShot

class CustomerSupportBot(dspy.Module):
    """Complete customer support system."""

    def __init__(self):
        super().__init__()

        # Classify intent
        self.classify_intent = dspy.Predict("message -> intent: str")

        # Specialized handlers
        self.technical_handler = dspy.ChainOfThought("message, history -> response")
        self.billing_handler = dspy.ChainOfThought("message, history -> response")
        self.general_handler = dspy.Predict("message, history -> response")

        # Retrieve relevant docs
        self.retrieve = dspy.Retrieve(k=3)

        # Conversation history
        self.history = []

    def forward(self, message):
        # Classify intent
        intent = self.classify_intent(message=message).intent

        # Retrieve relevant documentation
        docs = self.retrieve(message).passages
        context = "\n".join(docs)

        # Add context to history
        history_str = "\n".join(self.history)
        full_message = f"Context: {context}\n\nMessage: {message}"

        # Route to appropriate handler
        if intent == "technical":
            response = self.technical_handler(
                message=full_message,
                history=history_str
            ).response
        elif intent == "billing":
            response = self.billing_handler(
                message=full_message,
                history=history_str
            ).response
        else:
            response = self.general_handler(
                message=full_message,
                history=history_str
            ).response

        # Update history
        self.history.append(f"User: {message}")
        self.history.append(f"Bot: {response}")

        return dspy.Prediction(response=response, intent=intent)

# Training data
trainset = [
    dspy.Example(
        message="My account isn't working",
        intent="technical",
        response="I'd be happy to help. What error are you seeing?"
    ).with_inputs("message"),
    # ... more examples
]

# Define metric
def response_quality(example, pred, trace=None):
    # Check if response is helpful
    if len(pred.response) < 20:
        return 0.0
    if example.intent != pred.intent:
        return 0.3
    return 1.0

# Optimize
optimizer = BootstrapFewShot(metric=response_quality)
bot = CustomerSupportBot()
optimized_bot = optimizer.compile(bot, trainset=trainset)

# Use in production
optimized_bot.save("models/support_bot_v1.json")

# Later, load and use
loaded_bot = CustomerSupportBot()
loaded_bot.load("models/support_bot_v1.json")
response = loaded_bot(message="I can't log in")
```

## Resources

- **Documentation**: https://dspy.ai
- **Examples Repo**: https://github.com/stanfordnlp/dspy/tree/main/examples
- **Discord**: https://discord.gg/XCGy2WDCQB
