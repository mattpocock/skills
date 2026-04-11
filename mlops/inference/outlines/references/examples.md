# Production-Ready Examples

Real-world examples of using Outlines for structured generation in production systems.

## Table of Contents
- Data Extraction
- Classification Systems
- Form Processing
- Multi-Entity Extraction
- Code Generation
- Batch Processing
- Production Patterns

## Data Extraction

### Basic Information Extraction

```python
from pydantic import BaseModel, Field
import outlines

class PersonInfo(BaseModel):
    name: str = Field(description="Full name")
    age: int = Field(ge=0, le=120)
    occupation: str
    email: str = Field(pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    location: str

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, PersonInfo)

text = """
Dr. Sarah Johnson is a 42-year-old research scientist at MIT.
She can be reached at sarah.j@mit.edu and currently lives in Cambridge, MA.
"""

prompt = f"Extract person information from:\n{text}\n\nPerson:"
person = generator(prompt)

print(f"Name: {person.name}")
print(f"Age: {person.age}")
print(f"Occupation: {person.occupation}")
print(f"Email: {person.email}")
print(f"Location: {person.location}")
```

### Company Information

```python
class CompanyInfo(BaseModel):
    name: str
    founded_year: int = Field(ge=1800, le=2025)
    industry: str
    headquarters: str
    employees: int = Field(gt=0)
    revenue: Optional[str] = None

model = outlines.models.transformers("meta-llama/Llama-3.1-8B-Instruct")
generator = outlines.generate.json(model, CompanyInfo)

text = """
Tesla, Inc. was founded in 2003 and operates primarily in the automotive
and energy industries. The company is headquartered in Austin, Texas,
and employs approximately 140,000 people worldwide.
"""

company = generator(f"Extract company information:\n{text}\n\nCompany:")

print(f"Company: {company.name}")
print(f"Founded: {company.founded_year}")
print(f"Industry: {company.industry}")
print(f"HQ: {company.headquarters}")
print(f"Employees: {company.employees:,}")
```

### Product Specifications

```python
class ProductSpec(BaseModel):
    name: str
    brand: str
    price: float = Field(gt=0)
    dimensions: str
    weight: str
    features: list[str]
    rating: Optional[float] = Field(None, ge=0, le=5)

generator = outlines.generate.json(model, ProductSpec)

text = """
The Apple iPhone 15 Pro is priced at $999. It measures 146.6 x 70.6 x 8.25 mm
and weighs 187 grams. Key features include the A17 Pro chip, titanium design,
action button, and USB-C port. It has an average customer rating of 4.5 stars.
"""

product = generator(f"Extract product specifications:\n{text}\n\nProduct:")

print(f"Product: {product.brand} {product.name}")
print(f"Price: ${product.price}")
print(f"Features: {', '.join(product.features)}")
```

## Classification Systems

### Sentiment Analysis

```python
from typing import Literal
from enum import Enum

class Sentiment(str, Enum):
    VERY_POSITIVE = "very_positive"
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    VERY_NEGATIVE = "very_negative"

class SentimentAnalysis(BaseModel):
    text: str
    sentiment: Sentiment
    confidence: float = Field(ge=0.0, le=1.0)
    aspects: list[str]  # What aspects were mentioned
    reasoning: str

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, SentimentAnalysis)

review = """
This product completely exceeded my expectations! The build quality is
outstanding, and customer service was incredibly helpful. My only minor
complaint is the packaging could be better.
"""

result = generator(f"Analyze sentiment:\n{review}\n\nAnalysis:")

print(f"Sentiment: {result.sentiment.value}")
print(f"Confidence: {result.confidence:.2%}")
print(f"Aspects: {', '.join(result.aspects)}")
print(f"Reasoning: {result.reasoning}")
```

### Content Classification

```python
class Category(str, Enum):
    TECHNOLOGY = "technology"
    BUSINESS = "business"
    SCIENCE = "science"
    POLITICS = "politics"
    ENTERTAINMENT = "entertainment"
    SPORTS = "sports"
    HEALTH = "health"

class ArticleClassification(BaseModel):
    primary_category: Category
    secondary_categories: list[Category]
    keywords: list[str] = Field(min_items=3, max_items=10)
    target_audience: Literal["general", "expert", "beginner"]
    reading_level: Literal["elementary", "intermediate", "advanced"]

generator = outlines.generate.json(model, ArticleClassification)

article = """
Apple announced groundbreaking advancements in its AI capabilities with the
release of iOS 18. The new features leverage machine learning to significantly
improve battery life and overall device performance. Industry analysts predict
this will strengthen Apple's position in the competitive smartphone market.
"""

classification = generator(f"Classify article:\n{article}\n\nClassification:")

print(f"Primary: {classification.primary_category.value}")
print(f"Secondary: {[c.value for c in classification.secondary_categories]}")
print(f"Keywords: {classification.keywords}")
print(f"Audience: {classification.target_audience}")
```

### Intent Recognition

```python
class Intent(str, Enum):
    QUESTION = "question"
    COMPLAINT = "complaint"
    REQUEST = "request"
    FEEDBACK = "feedback"
    CANCEL = "cancel"
    UPGRADE = "upgrade"

class UserMessage(BaseModel):
    original_message: str
    intent: Intent
    urgency: Literal["low", "medium", "high", "critical"]
    department: Literal["support", "sales", "billing", "technical"]
    sentiment: Literal["positive", "neutral", "negative"]
    action_required: bool
    summary: str

generator = outlines.generate.json(model, UserMessage)

message = """
I've been charged twice for my subscription this month! This is the third
time this has happened. I need someone to fix this immediately and refund
the extra charge. Very disappointed with this service.
"""

result = generator(f"Analyze message:\n{message}\n\nAnalysis:")

print(f"Intent: {result.intent.value}")
print(f"Urgency: {result.urgency}")
print(f"Route to: {result.department}")
print(f"Action required: {result.action_required}")
print(f"Summary: {result.summary}")
```

## Form Processing

### Job Application

```python
class Education(BaseModel):
    degree: str
    field: str
    institution: str
    year: int

class Experience(BaseModel):
    title: str
    company: str
    duration: str
    responsibilities: list[str]

class JobApplication(BaseModel):
    full_name: str
    email: str
    phone: str
    education: list[Education]
    experience: list[Experience]
    skills: list[str]
    availability: str

model = outlines.models.transformers("meta-llama/Llama-3.1-8B-Instruct")
generator = outlines.generate.json(model, JobApplication)

resume_text = """
John Smith
Email: john.smith@email.com | Phone: 555-0123

EDUCATION
- BS in Computer Science, MIT, 2018
- MS in Artificial Intelligence, Stanford, 2020

EXPERIENCE
Software Engineer, Google (2020-2023)
- Developed ML pipelines for search ranking
- Led team of 5 engineers
- Improved search quality by 15%

SKILLS: Python, Machine Learning, TensorFlow, System Design

AVAILABILITY: Immediate
"""

application = generator(f"Extract job application:\n{resume_text}\n\nApplication:")

print(f"Applicant: {application.full_name}")
print(f"Email: {application.email}")
print(f"Education: {len(application.education)} degrees")
for edu in application.education:
    print(f"  - {edu.degree} in {edu.field}, {edu.institution} ({edu.year})")
print(f"Experience: {len(application.experience)} positions")
```

### Invoice Processing

```python
class InvoiceItem(BaseModel):
    description: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)
    total: float = Field(gt=0)

class Invoice(BaseModel):
    invoice_number: str
    date: str = Field(pattern=r"\d{4}-\d{2}-\d{2}")
    vendor: str
    customer: str
    items: list[InvoiceItem]
    subtotal: float = Field(gt=0)
    tax: float = Field(ge=0)
    total: float = Field(gt=0)

generator = outlines.generate.json(model, Invoice)

invoice_text = """
INVOICE #INV-2024-001
Date: 2024-01-15

From: Acme Corp
To: Smith & Co

Items:
- Widget A: 10 units @ $50.00 = $500.00
- Widget B: 5 units @ $75.00 = $375.00
- Service Fee: 1 @ $100.00 = $100.00

Subtotal: $975.00
Tax (8%): $78.00
TOTAL: $1,053.00
"""

invoice = generator(f"Extract invoice:\n{invoice_text}\n\nInvoice:")

print(f"Invoice: {invoice.invoice_number}")
print(f"From: {invoice.vendor} → To: {invoice.customer}")
print(f"Items: {len(invoice.items)}")
for item in invoice.items:
    print(f"  - {item.description}: {item.quantity} × ${item.unit_price} = ${item.total}")
print(f"Total: ${invoice.total}")
```

### Survey Responses

```python
class SurveyResponse(BaseModel):
    respondent_id: str
    completion_date: str
    satisfaction: Literal[1, 2, 3, 4, 5]
    would_recommend: bool
    favorite_features: list[str]
    improvement_areas: list[str]
    additional_comments: Optional[str] = None

generator = outlines.generate.json(model, SurveyResponse)

survey_text = """
Survey ID: RESP-12345
Completed: 2024-01-20

How satisfied are you with our product? 4 out of 5

Would you recommend to a friend? Yes

What features do you like most?
- Fast performance
- Easy to use
- Great customer support

What could we improve?
- Better documentation
- More integrations

Additional feedback: Overall great product, keep up the good work!
"""

response = generator(f"Extract survey response:\n{survey_text}\n\nResponse:")

print(f"Respondent: {response.respondent_id}")
print(f"Satisfaction: {response.satisfaction}/5")
print(f"Would recommend: {response.would_recommend}")
print(f"Favorite features: {response.favorite_features}")
print(f"Improvement areas: {response.improvement_areas}")
```

## Multi-Entity Extraction

### News Article Entities

```python
class Person(BaseModel):
    name: str
    role: Optional[str] = None
    affiliation: Optional[str] = None

class Organization(BaseModel):
    name: str
    type: Optional[str] = None

class Location(BaseModel):
    name: str
    type: Literal["city", "state", "country", "region"]

class Event(BaseModel):
    name: str
    date: Optional[str] = None
    location: Optional[str] = None

class ArticleEntities(BaseModel):
    people: list[Person]
    organizations: list[Organization]
    locations: list[Location]
    events: list[Event]
    dates: list[str]

model = outlines.models.transformers("meta-llama/Llama-3.1-8B-Instruct")
generator = outlines.generate.json(model, ArticleEntities)

article = """
Apple CEO Tim Cook met with Microsoft CEO Satya Nadella at Microsoft
headquarters in Redmond, Washington on September 15, 2024, to discuss
potential collaboration opportunities. The meeting was attended by executives
from both companies and focused on AI integration strategies. Apple's
Cupertino offices will host a follow-up meeting on October 20, 2024.
"""

entities = generator(f"Extract all entities:\n{article}\n\nEntities:")

print("People:")
for person in entities.people:
    print(f"  - {person.name} ({person.role}) @ {person.affiliation}")

print("\nOrganizations:")
for org in entities.organizations:
    print(f"  - {org.name} ({org.type})")

print("\nLocations:")
for loc in entities.locations:
    print(f"  - {loc.name} ({loc.type})")

print("\nEvents:")
for event in entities.events:
    print(f"  - {event.name} on {event.date}")
```

### Document Metadata

```python
class Author(BaseModel):
    name: str
    email: Optional[str] = None
    affiliation: Optional[str] = None

class Reference(BaseModel):
    title: str
    authors: list[str]
    year: int
    source: str

class DocumentMetadata(BaseModel):
    title: str
    authors: list[Author]
    abstract: str
    keywords: list[str]
    publication_date: str
    journal: str
    doi: Optional[str] = None
    references: list[Reference]

generator = outlines.generate.json(model, DocumentMetadata)

paper = """
Title: Advances in Neural Machine Translation

Authors:
- Dr. Jane Smith (jane@university.edu), MIT
- Prof. John Doe (jdoe@stanford.edu), Stanford University

Abstract: This paper presents novel approaches to neural machine translation
using transformer architectures. We demonstrate significant improvements in
translation quality across multiple language pairs.

Keywords: Neural Networks, Machine Translation, Transformers, NLP

Published: Journal of AI Research, 2024-03-15
DOI: 10.1234/jair.2024.001

References:
1. "Attention Is All You Need" by Vaswani et al., 2017, NeurIPS
2. "BERT: Pre-training of Deep Bidirectional Transformers" by Devlin et al., 2019, NAACL
"""

metadata = generator(f"Extract document metadata:\n{paper}\n\nMetadata:")

print(f"Title: {metadata.title}")
print(f"Authors: {', '.join(a.name for a in metadata.authors)}")
print(f"Keywords: {', '.join(metadata.keywords)}")
print(f"References: {len(metadata.references)}")
```

## Code Generation

### Python Function Generation

```python
class Parameter(BaseModel):
    name: str = Field(pattern=r"^[a-z_][a-z0-9_]*$")
    type_hint: str
    default: Optional[str] = None

class PythonFunction(BaseModel):
    function_name: str = Field(pattern=r"^[a-z_][a-z0-9_]*$")
    parameters: list[Parameter]
    return_type: str
    docstring: str
    body: list[str]  # Lines of code

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, PythonFunction)

spec = "Create a function to calculate the factorial of a number"

func = generator(f"Generate Python function:\n{spec}\n\nFunction:")

print(f"def {func.function_name}(", end="")
print(", ".join(f"{p.name}: {p.type_hint}" for p in func.parameters), end="")
print(f") -> {func.return_type}:")
print(f'    """{func.docstring}"""')
for line in func.body:
    print(f"    {line}")
```

### SQL Query Generation

```python
class SQLQuery(BaseModel):
    query_type: Literal["SELECT", "INSERT", "UPDATE", "DELETE"]
    select_columns: Optional[list[str]] = None
    from_tables: list[str]
    joins: Optional[list[str]] = None
    where_conditions: Optional[list[str]] = None
    group_by: Optional[list[str]] = None
    order_by: Optional[list[str]] = None
    limit: Optional[int] = None

generator = outlines.generate.json(model, SQLQuery)

request = "Get top 10 users who made purchases in the last 30 days, ordered by total spent"

sql = generator(f"Generate SQL query:\n{request}\n\nQuery:")

print(f"Query type: {sql.query_type}")
print(f"SELECT {', '.join(sql.select_columns)}")
print(f"FROM {', '.join(sql.from_tables)}")
if sql.joins:
    for join in sql.joins:
        print(f"  {join}")
if sql.where_conditions:
    print(f"WHERE {' AND '.join(sql.where_conditions)}")
if sql.order_by:
    print(f"ORDER BY {', '.join(sql.order_by)}")
if sql.limit:
    print(f"LIMIT {sql.limit}")
```

### API Endpoint Spec

```python
class Parameter(BaseModel):
    name: str
    type: str
    required: bool
    description: str

class APIEndpoint(BaseModel):
    method: Literal["GET", "POST", "PUT", "DELETE", "PATCH"]
    path: str
    description: str
    parameters: list[Parameter]
    request_body: Optional[dict] = None
    response_schema: dict
    status_codes: dict[int, str]

generator = outlines.generate.json(model, APIEndpoint)

spec = "Create user endpoint"

endpoint = generator(f"Generate API endpoint:\n{spec}\n\nEndpoint:")

print(f"{endpoint.method} {endpoint.path}")
print(f"Description: {endpoint.description}")
print("\nParameters:")
for param in endpoint.parameters:
    req = "required" if param.required else "optional"
    print(f"  - {param.name} ({param.type}, {req}): {param.description}")
```

## Batch Processing

### Parallel Extraction

```python
def batch_extract(texts: list[str], schema: type[BaseModel], model_name: str):
    """Extract structured data from multiple texts."""
    model = outlines.models.transformers(model_name)
    generator = outlines.generate.json(model, schema)

    results = []
    for i, text in enumerate(texts):
        print(f"Processing {i+1}/{len(texts)}...", end="\r")
        result = generator(f"Extract:\n{text}\n\nData:")
        results.append(result)

    return results

class Product(BaseModel):
    name: str
    price: float
    category: str

texts = [
    "iPhone 15 Pro costs $999 in Electronics",
    "Running Shoes are $89.99 in Sports",
    "Coffee Maker priced at $49.99 in Home & Kitchen"
]

products = batch_extract(texts, Product, "microsoft/Phi-3-mini-4k-instruct")

for product in products:
    print(f"{product.name}: ${product.price} ({product.category})")
```

### CSV Processing

```python
import csv

def process_csv(csv_file: str, schema: type[BaseModel]):
    """Process CSV file and extract structured data."""
    model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
    generator = outlines.generate.json(model, schema)

    results = []
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = " | ".join(f"{k}: {v}" for k, v in row.items())
            result = generator(f"Extract:\n{text}\n\nData:")
            results.append(result)

    return results

class Customer(BaseModel):
    name: str
    email: str
    tier: Literal["basic", "premium", "enterprise"]
    mrr: float

# customers = process_csv("customers.csv", Customer)
```

## Production Patterns

### Error Handling

```python
from pydantic import ValidationError

def safe_extract(text: str, schema: type[BaseModel], retries: int = 3):
    """Extract with error handling and retries."""
    model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
    generator = outlines.generate.json(model, schema)

    for attempt in range(retries):
        try:
            result = generator(f"Extract:\n{text}\n\nData:")
            return result
        except ValidationError as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == retries - 1:
                raise
        except Exception as e:
            print(f"Unexpected error: {e}")
            if attempt == retries - 1:
                raise

    return None
```

### Caching

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=1000)
def cached_extract(text_hash: str, schema_name: str):
    """Cache extraction results."""
    # This would be called with actual extraction logic
    pass

def extract_with_cache(text: str, schema: type[BaseModel]):
    """Extract with caching."""
    text_hash = hashlib.md5(text.encode()).hexdigest()
    schema_name = schema.__name__

    cached_result = cached_extract(text_hash, schema_name)
    if cached_result:
        return cached_result

    # Perform actual extraction
    model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
    generator = outlines.generate.json(model, schema)
    result = generator(f"Extract:\n{text}\n\nData:")

    return result
```

### Monitoring

```python
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def monitored_extract(text: str, schema: type[BaseModel]):
    """Extract with monitoring and logging."""
    start_time = time.time()

    try:
        model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
        generator = outlines.generate.json(model, schema)

        result = generator(f"Extract:\n{text}\n\nData:")

        elapsed = time.time() - start_time
        logger.info(f"Extraction succeeded in {elapsed:.2f}s")
        logger.info(f"Input length: {len(text)} chars")

        return result

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"Extraction failed after {elapsed:.2f}s: {e}")
        raise
```

### Rate Limiting

```python
import time
from threading import Lock

class RateLimiter:
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
        self.lock = Lock()

    def wait_if_needed(self):
        with self.lock:
            now = time.time()
            # Remove old requests
            self.requests = [r for r in self.requests if now - r < self.time_window]

            if len(self.requests) >= self.max_requests:
                sleep_time = self.time_window - (now - self.requests[0])
                time.sleep(sleep_time)
                self.requests = []

            self.requests.append(now)

def rate_limited_extract(texts: list[str], schema: type[BaseModel]):
    """Extract with rate limiting."""
    limiter = RateLimiter(max_requests=10, time_window=60)  # 10 req/min
    model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
    generator = outlines.generate.json(model, schema)

    results = []
    for text in texts:
        limiter.wait_if_needed()
        result = generator(f"Extract:\n{text}\n\nData:")
        results.append(result)

    return results
```

## Resources

- **Outlines Documentation**: https://outlines-dev.github.io/outlines
- **Pydantic Documentation**: https://docs.pydantic.dev
- **GitHub Examples**: https://github.com/outlines-dev/outlines/tree/main/examples
