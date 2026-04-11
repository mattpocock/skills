# Comprehensive JSON Generation Guide

Complete guide to JSON generation with Outlines using Pydantic models and JSON schemas.

## Table of Contents
- Pydantic Models
- JSON Schema Support
- Advanced Patterns
- Nested Structures
- Complex Types
- Validation
- Performance Optimization

## Pydantic Models

### Basic Models

```python
from pydantic import BaseModel
import outlines

class User(BaseModel):
    name: str
    age: int
    email: str

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, User)

user = generator("Generate user: Alice, 25, alice@example.com")
print(user.name)   # "Alice"
print(user.age)    # 25
print(user.email)  # "alice@example.com"
```

###

 Field Constraints

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0, description="Price in USD")
    discount: float = Field(ge=0, le=100, description="Discount percentage")
    quantity: int = Field(ge=0, description="Available quantity")
    sku: str = Field(pattern=r"^[A-Z]{3}-\d{6}$")

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, Product)

product = generator("Generate product: iPhone 15, $999")
# All fields guaranteed to meet constraints
```

**Available Constraints:**
- `min_length`, `max_length`: String length
- `gt`, `ge`, `lt`, `le`: Numeric comparisons
- `multiple_of`: Number must be multiple of value
- `pattern`: Regex pattern for strings
- `min_items`, `max_items`: List length

### Optional Fields

```python
from typing import Optional

class Article(BaseModel):
    title: str  # Required
    author: Optional[str] = None  # Optional
    published_date: Optional[str] = None  # Optional
    tags: list[str] = []  # Default empty list
    view_count: int = 0  # Default value

generator = outlines.generate.json(model, Article)

# Can generate even if optional fields missing
article = generator("Title: Introduction to AI")
print(article.author)  # None (not provided)
print(article.tags)    # [] (default)
```

### Default Values

```python
class Config(BaseModel):
    debug: bool = False
    max_retries: int = 3
    timeout: float = 30.0
    log_level: str = "INFO"

# Generator uses defaults when not specified
generator = outlines.generate.json(model, Config)
config = generator("Generate config with debug enabled")
print(config.debug)  # True (from prompt)
print(config.timeout)  # 30.0 (default)
```

## Enums and Literals

### Enum Fields

```python
from enum import Enum

class Status(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Application(BaseModel):
    applicant_name: str
    status: Status  # Must be one of enum values
    submitted_date: str

generator = outlines.generate.json(model, Application)
app = generator("Generate application for John Doe")

print(app.status)  # Status.PENDING (or one of the enum values)
print(type(app.status))  # <enum 'Status'>
```

### Literal Types

```python
from typing import Literal

class Task(BaseModel):
    title: str
    priority: Literal["low", "medium", "high", "critical"]
    status: Literal["todo", "in_progress", "done"]
    assigned_to: str

generator = outlines.generate.json(model, Task)
task = generator("Create high priority task: Fix bug")

print(task.priority)  # One of: "low", "medium", "high", "critical"
```

### Multiple Choice Fields

```python
class Survey(BaseModel):
    question: str
    answer: Literal["strongly_disagree", "disagree", "neutral", "agree", "strongly_agree"]
    confidence: Literal["low", "medium", "high"]

generator = outlines.generate.json(model, Survey)
survey = generator("Rate: 'I enjoy using this product'")
```

## Nested Structures

### Nested Models

```python
class Address(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"

class Person(BaseModel):
    name: str
    age: int
    email: str
    address: Address  # Nested model

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, Person)

prompt = """
Extract person:
Name: Alice Johnson
Age: 28
Email: alice@example.com
Address: 123 Main St, Boston, MA, 02101
"""

person = generator(prompt)
print(person.name)  # "Alice Johnson"
print(person.address.city)  # "Boston"
print(person.address.state)  # "MA"
```

### Deep Nesting

```python
class Coordinates(BaseModel):
    latitude: float
    longitude: float

class Location(BaseModel):
    name: str
    coordinates: Coordinates

class Event(BaseModel):
    title: str
    date: str
    location: Location

generator = outlines.generate.json(model, Event)
event = generator("Generate event: Tech Conference in San Francisco")

print(event.title)  # "Tech Conference"
print(event.location.name)  # "San Francisco"
print(event.location.coordinates.latitude)  # 37.7749
```

### Lists of Nested Models

```python
class Item(BaseModel):
    name: str
    quantity: int
    price: float

class Order(BaseModel):
    order_id: str
    customer: str
    items: list[Item]  # List of nested models
    total: float

generator = outlines.generate.json(model, Order)

prompt = """
Generate order for John:
- 2x Widget ($10 each)
- 3x Gadget ($15 each)
Order ID: ORD-001
"""

order = generator(prompt)
print(f"Order ID: {order.order_id}")
for item in order.items:
    print(f"- {item.quantity}x {item.name} @ ${item.price}")
print(f"Total: ${order.total}")
```

## Complex Types

### Union Types

```python
from typing import Union

class TextContent(BaseModel):
    type: Literal["text"]
    content: str

class ImageContent(BaseModel):
    type: Literal["image"]
    url: str
    caption: str

class Post(BaseModel):
    title: str
    content: Union[TextContent, ImageContent]  # Either type

generator = outlines.generate.json(model, Post)

# Can generate either text or image content
post = generator("Generate blog post with image")
if post.content.type == "text":
    print(post.content.content)
elif post.content.type == "image":
    print(post.content.url)
```

### Lists and Arrays

```python
class Article(BaseModel):
    title: str
    authors: list[str]  # List of strings
    tags: list[str]
    sections: list[dict[str, str]]  # List of dicts
    related_ids: list[int]

generator = outlines.generate.json(model, Article)
article = generator("Generate article about AI")

print(article.authors)  # ["Alice", "Bob"]
print(article.tags)  # ["AI", "Machine Learning", "Technology"]
```

### Dictionaries

```python
class Metadata(BaseModel):
    title: str
    properties: dict[str, str]  # String keys and values
    counts: dict[str, int]  # String keys, int values
    settings: dict[str, Union[str, int, bool]]  # Mixed value types

generator = outlines.generate.json(model, Metadata)
meta = generator("Generate metadata")

print(meta.properties)  # {"author": "Alice", "version": "1.0"}
print(meta.counts)  # {"views": 1000, "likes": 50}
```

### Any Type (Use Sparingly)

```python
from typing import Any

class FlexibleData(BaseModel):
    name: str
    structured_field: str
    flexible_field: Any  # Can be anything

# Note: Any reduces type safety, use only when necessary
generator = outlines.generate.json(model, FlexibleData)
```

## JSON Schema Support

### Direct Schema Usage

```python
import outlines

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")

# Define JSON schema
schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer", "minimum": 0, "maximum": 120},
        "email": {"type": "string", "format": "email"}
    },
    "required": ["name", "age", "email"]
}

# Generate from schema
generator = outlines.generate.json(model, schema)
result = generator("Generate person: Alice, 25, alice@example.com")

print(result)  # Valid JSON matching schema
```

### Schema from Pydantic

```python
class User(BaseModel):
    name: str
    age: int
    email: str

# Get JSON schema from Pydantic model
schema = User.model_json_schema()
print(schema)
# {
#   "type": "object",
#   "properties": {
#     "name": {"type": "string"},
#     "age": {"type": "integer"},
#     "email": {"type": "string"}
#   },
#   "required": ["name", "age", "email"]
# }

# Both approaches equivalent:
generator1 = outlines.generate.json(model, User)
generator2 = outlines.generate.json(model, schema)
```

## Advanced Patterns

### Conditional Fields

```python
class Order(BaseModel):
    order_type: Literal["standard", "express"]
    delivery_date: str
    express_fee: Optional[float] = None  # Only for express orders

generator = outlines.generate.json(model, Order)

# Express order
order1 = generator("Create express order for tomorrow")
print(order1.express_fee)  # 25.0

# Standard order
order2 = generator("Create standard order")
print(order2.express_fee)  # None
```

### Recursive Models

```python
from typing import Optional, List

class TreeNode(BaseModel):
    value: str
    children: Optional[List['TreeNode']] = None

# Enable forward references
TreeNode.model_rebuild()

generator = outlines.generate.json(model, TreeNode)
tree = generator("Generate file tree with subdirectories")

print(tree.value)  # "root"
print(tree.children[0].value)  # "subdir1"
```

### Model with Validation

```python
from pydantic import field_validator

class DateRange(BaseModel):
    start_date: str
    end_date: str

    @field_validator('end_date')
    def end_after_start(cls, v, info):
        """Ensure end_date is after start_date."""
        if 'start_date' in info.data:
            from datetime import datetime
            start = datetime.strptime(info.data['start_date'], '%Y-%m-%d')
            end = datetime.strptime(v, '%Y-%m-%d')
            if end < start:
                raise ValueError('end_date must be after start_date')
        return v

generator = outlines.generate.json(model, DateRange)
# Validation happens after generation
```

## Multiple Objects

### Generate List of Objects

```python
class Person(BaseModel):
    name: str
    age: int

class Team(BaseModel):
    team_name: str
    members: list[Person]

generator = outlines.generate.json(model, Team)

team = generator("Generate engineering team with 5 members")
print(f"Team: {team.team_name}")
for member in team.members:
    print(f"- {member.name}, {member.age}")
```

### Batch Generation

```python
def generate_batch(prompts: list[str], schema: type[BaseModel]):
    """Generate structured outputs for multiple prompts."""
    model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
    generator = outlines.generate.json(model, schema)

    results = []
    for prompt in prompts:
        result = generator(prompt)
        results.append(result)

    return results

class Product(BaseModel):
    name: str
    price: float

prompts = [
    "Product: iPhone 15, $999",
    "Product: MacBook Pro, $2499",
    "Product: AirPods, $179"
]

products = generate_batch(prompts, Product)
for product in products:
    print(f"{product.name}: ${product.price}")
```

## Performance Optimization

### Caching Generators

```python
from functools import lru_cache

@lru_cache(maxsize=10)
def get_generator(model_name: str, schema_hash: int):
    """Cache generators for reuse."""
    model = outlines.models.transformers(model_name)
    return outlines.generate.json(model, schema)

# First call: creates generator
gen1 = get_generator("microsoft/Phi-3-mini-4k-instruct", hash(User))

# Second call: returns cached generator (fast!)
gen2 = get_generator("microsoft/Phi-3-mini-4k-instruct", hash(User))
```

### Batch Processing

```python
# Process multiple items efficiently
model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")
generator = outlines.generate.json(model, User)

texts = ["User: Alice, 25", "User: Bob, 30", "User: Carol, 35"]

# Reuse generator (model stays loaded)
users = [generator(text) for text in texts]
```

### Minimize Schema Complexity

```python
# ✅ Good: Simple, flat structure (faster)
class SimplePerson(BaseModel):
    name: str
    age: int
    city: str

# ⚠️ Slower: Deep nesting
class ComplexPerson(BaseModel):
    personal_info: PersonalInfo
    address: Address
    employment: Employment
    # ... many nested levels
```

## Error Handling

### Handle Missing Fields

```python
from pydantic import ValidationError

class User(BaseModel):
    name: str
    age: int
    email: str

try:
    user = generator("Generate user")  # May not include all fields
except ValidationError as e:
    print(f"Validation error: {e}")
    # Handle gracefully
```

### Fallback with Optional Fields

```python
class RobustUser(BaseModel):
    name: str  # Required
    age: Optional[int] = None  # Optional
    email: Optional[str] = None  # Optional

# More likely to succeed even with incomplete data
user = generator("Generate user: Alice")
print(user.name)  # "Alice"
print(user.age)  # None (not provided)
```

## Best Practices

### 1. Use Specific Types

```python
# ✅ Good: Specific types
class Product(BaseModel):
    name: str
    price: float  # Not Any or str
    quantity: int  # Not str
    in_stock: bool  # Not int

# ❌ Bad: Generic types
class Product(BaseModel):
    name: Any
    price: str  # Should be float
    quantity: str  # Should be int
```

### 2. Add Descriptions

```python
# ✅ Good: Clear descriptions
class Article(BaseModel):
    title: str = Field(description="Article title, 10-100 characters")
    content: str = Field(description="Main article content in paragraphs")
    tags: list[str] = Field(description="List of relevant topic tags")

# Descriptions help the model understand expected output
```

### 3. Use Constraints

```python
# ✅ Good: With constraints
class Age(BaseModel):
    value: int = Field(ge=0, le=120, description="Age in years")

# ❌ Bad: No constraints
class Age(BaseModel):
    value: int  # Could be negative or > 120
```

### 4. Prefer Enums Over Strings

```python
# ✅ Good: Enum for fixed set
class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(BaseModel):
    priority: Priority  # Guaranteed valid

# ❌ Bad: Free-form string
class Task(BaseModel):
    priority: str  # Could be "urgent", "ASAP", "!!", etc.
```

### 5. Test Your Models

```python
# Test models work as expected
def test_product_model():
    product = Product(
        name="Test Product",
        price=19.99,
        quantity=10,
        in_stock=True
    )
    assert product.price == 19.99
    assert isinstance(product, Product)

# Run tests before using in production
```

## Resources

- **Pydantic Docs**: https://docs.pydantic.dev
- **JSON Schema**: https://json-schema.org
- **Outlines GitHub**: https://github.com/outlines-dev/outlines
