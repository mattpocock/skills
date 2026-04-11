# Comprehensive Constraint Patterns

Guide to regex constraints, grammar-based generation, and token healing in Guidance.

## Table of Contents
- Regex Constraints
- Grammar-Based Generation
- Token Healing
- Selection Constraints
- Complex Patterns
- Performance Optimization

## Regex Constraints

### Basic Patterns

#### Numeric Constraints

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Integer (positive)
lm += "Age: " + gen("age", regex=r"[0-9]+")

# Integer (with negatives)
lm += "Temperature: " + gen("temp", regex=r"-?[0-9]+")

# Float (positive)
lm += "Price: $" + gen("price", regex=r"[0-9]+\.[0-9]{2}")

# Float (with negatives and optional decimals)
lm += "Value: " + gen("value", regex=r"-?[0-9]+(\.[0-9]+)?")

# Percentage (0-100)
lm += "Progress: " + gen("progress", regex=r"(100|[0-9]{1,2})")

# Range (1-5 stars)
lm += "Rating: " + gen("rating", regex=r"[1-5]") + " stars"
```

#### Text Constraints

```python
# Alphabetic only
lm += "Name: " + gen("name", regex=r"[A-Za-z]+")

# Alphabetic with spaces
lm += "Full Name: " + gen("full_name", regex=r"[A-Za-z ]+")

# Alphanumeric
lm += "Username: " + gen("username", regex=r"[A-Za-z0-9_]+")

# Capitalized words
lm += "Title: " + gen("title", regex=r"[A-Z][a-z]+( [A-Z][a-z]+)*")

# Lowercase only
lm += "Code: " + gen("code", regex=r"[a-z0-9-]+")

# Specific length
lm += "ID: " + gen("id", regex=r"[A-Z]{3}-[0-9]{6}")  # e.g., "ABC-123456"
```

#### Date and Time Constraints

```python
# Date (YYYY-MM-DD)
lm += "Date: " + gen("date", regex=r"\d{4}-\d{2}-\d{2}")

# Date (MM/DD/YYYY)
lm += "Date: " + gen("date_us", regex=r"\d{2}/\d{2}/\d{4}")

# Time (HH:MM)
lm += "Time: " + gen("time", regex=r"\d{2}:\d{2}")

# Time (HH:MM:SS)
lm += "Time: " + gen("time_full", regex=r"\d{2}:\d{2}:\d{2}")

# ISO 8601 datetime
lm += "Timestamp: " + gen(
    "timestamp",
    regex=r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z"
)

# Year (YYYY)
lm += "Year: " + gen("year", regex=r"(19|20)\d{2}")

# Month name
lm += "Month: " + gen(
    "month",
    regex=r"(January|February|March|April|May|June|July|August|September|October|November|December)"
)
```

#### Contact Information

```python
# Email
lm += "Email: " + gen(
    "email",
    regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
)

# Phone (US format)
lm += "Phone: " + gen("phone", regex=r"\d{3}-\d{3}-\d{4}")

# Phone (international format)
lm += "Phone: " + gen("phone_intl", regex=r"\+[0-9]{1,3}-[0-9]{1,14}")

# ZIP code (US)
lm += "ZIP: " + gen("zip", regex=r"\d{5}(-\d{4})?")

# Postal code (Canada)
lm += "Postal: " + gen("postal", regex=r"[A-Z]\d[A-Z] \d[A-Z]\d")

# URL
lm += "URL: " + gen(
    "url",
    regex=r"https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/[a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=-]*)?"
)
```

### Advanced Patterns

#### JSON Field Constraints

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# String field with quotes
lm += '"name": ' + gen("name", regex=r'"[A-Za-z ]+"')

# Numeric field (no quotes)
lm += '"age": ' + gen("age", regex=r"[0-9]+")

# Boolean field
lm += '"active": ' + gen("active", regex=r"(true|false)")

# Null field
lm += '"optional": ' + gen("optional", regex=r"(null|[0-9]+)")

# Array of strings
lm += '"tags": [' + gen(
    "tags",
    regex=r'"[a-z]+"(, "[a-z]+")*'
) + ']'

# Complete JSON object
lm += """{
    "name": """ + gen("name", regex=r'"[A-Za-z ]+"') + """,
    "age": """ + gen("age", regex=r"[0-9]+") + """,
    "email": """ + gen(
        "email",
        regex=r'"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"'
    ) + """
}"""
```

#### Code Patterns

```python
# Python variable name
lm += "Variable: " + gen("var", regex=r"[a-z_][a-z0-9_]*")

# Python function name
lm += "Function: " + gen("func", regex=r"[a-z_][a-z0-9_]*")

# Hex color code
lm += "Color: #" + gen("color", regex=r"[0-9A-Fa-f]{6}")

# UUID
lm += "UUID: " + gen(
    "uuid",
    regex=r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
)

# Git commit hash (short)
lm += "Commit: " + gen("commit", regex=r"[0-9a-f]{7}")

# Semantic version
lm += "Version: " + gen("version", regex=r"[0-9]+\.[0-9]+\.[0-9]+")

# IP address (IPv4)
lm += "IP: " + gen(
    "ip",
    regex=r"((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"
)
```

#### Domain-Specific Patterns

```python
# Credit card number
lm += "Card: " + gen("card", regex=r"\d{4}-\d{4}-\d{4}-\d{4}")

# Social Security Number (US)
lm += "SSN: " + gen("ssn", regex=r"\d{3}-\d{2}-\d{4}")

# ISBN-13
lm += "ISBN: " + gen("isbn", regex=r"978-\d{1,5}-\d{1,7}-\d{1,7}-\d")

# License plate (US)
lm += "Plate: " + gen("plate", regex=r"[A-Z]{3}-\d{4}")

# Currency amount
lm += "Amount: $" + gen("amount", regex=r"[0-9]{1,3}(,[0-9]{3})*\.[0-9]{2}")

# Percentage with decimal
lm += "Rate: " + gen("rate", regex=r"[0-9]+\.[0-9]{1,2}%")
```

## Grammar-Based Generation

### JSON Grammar

```python
from guidance import models, gen, guidance

@guidance
def json_object(lm):
    """Generate valid JSON object."""
    lm += "{\n"

    # Name field (required)
    lm += '    "name": ' + gen("name", regex=r'"[A-Za-z ]+"') + ",\n"

    # Age field (required)
    lm += '    "age": ' + gen("age", regex=r"[0-9]+") + ",\n"

    # Email field (required)
    lm += '    "email": ' + gen(
        "email",
        regex=r'"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"'
    ) + ",\n"

    # Active field (required, boolean)
    lm += '    "active": ' + gen("active", regex=r"(true|false)") + "\n"

    lm += "}"
    return lm

lm = models.Anthropic("claude-sonnet-4-5-20250929")
lm = json_object(lm)
print(lm)  # Valid JSON guaranteed
```

### Nested JSON Grammar

```python
@guidance
def nested_json(lm):
    """Generate nested JSON structure."""
    lm += "{\n"

    # User object
    lm += '    "user": {\n'
    lm += '        "name": ' + gen("name", regex=r'"[A-Za-z ]+"') + ",\n"
    lm += '        "age": ' + gen("age", regex=r"[0-9]+") + "\n"
    lm += "    },\n"

    # Address object
    lm += '    "address": {\n'
    lm += '        "street": ' + gen("street", regex=r'"[A-Za-z0-9 ]+"') + ",\n"
    lm += '        "city": ' + gen("city", regex=r'"[A-Za-z ]+"') + ",\n"
    lm += '        "zip": ' + gen("zip", regex=r'"\d{5}"') + "\n"
    lm += "    }\n"

    lm += "}"
    return lm
```

### Array Grammar

```python
@guidance
def json_array(lm, count=3):
    """Generate JSON array with fixed count."""
    lm += "[\n"

    for i in range(count):
        lm += "    {\n"
        lm += '        "id": ' + gen(f"id_{i}", regex=r"[0-9]+") + ",\n"
        lm += '        "name": ' + gen(f"name_{i}", regex=r'"[A-Za-z ]+"') + "\n"
        lm += "    }"
        if i < count - 1:
            lm += ","
        lm += "\n"

    lm += "]"
    return lm
```

### XML Grammar

```python
@guidance
def xml_document(lm):
    """Generate valid XML document."""
    lm += '<?xml version="1.0"?>\n'
    lm += "<person>\n"

    # Name element
    lm += "    <name>" + gen("name", regex=r"[A-Za-z ]+") + "</name>\n"

    # Age element
    lm += "    <age>" + gen("age", regex=r"[0-9]+") + "</age>\n"

    # Email element
    lm += "    <email>" + gen(
        "email",
        regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    ) + "</email>\n"

    lm += "</person>"
    return lm
```

### CSV Grammar

```python
@guidance
def csv_row(lm):
    """Generate CSV row."""
    lm += gen("name", regex=r"[A-Za-z ]+") + ","
    lm += gen("age", regex=r"[0-9]+") + ","
    lm += gen("email", regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
    return lm

@guidance
def csv_document(lm, rows=5):
    """Generate complete CSV."""
    # Header
    lm += "Name,Age,Email\n"

    # Rows
    for i in range(rows):
        lm = csv_row(lm)
        if i < rows - 1:
            lm += "\n"

    return lm
```

## Token Healing

### How Token Healing Works

**Problem:** Tokenization creates unnatural boundaries.

```python
# Example without token healing
prompt = "The capital of France is "
# Tokenization: ["The", " capital", " of", " France", " is", " "]
# Model sees last token: " "
# First generated token might include leading space: " Paris"
# Result: "The capital of France is  Paris" (double space)
```

**Solution:** Guidance backs up and regenerates the last token.

```python
from guidance import models, gen

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Token healing enabled by default
lm += "The capital of France is " + gen("capital", max_tokens=5)

# Process:
# 1. Back up to token before " is "
# 2. Regenerate " is" + "capital" together
# 3. Result: "The capital of France is Paris" (correct)
```

### Token Healing Examples

#### Natural Continuations

```python
# Before token healing
lm += "The function name is get" + gen("rest")
# Might generate: "The function name is get User" (space before User)

# With token healing
lm += "The function name is get" + gen("rest")
# Generates: "The function name is getUser" (correct camelCase)
```

#### Code Generation

```python
# Function name completion
lm += "def calculate_" + gen("rest", stop="(")
# Token healing ensures smooth connection: "calculate_total"

# Variable name completion
lm += "my_" + gen("var_name", regex=r"[a-z_]+")
# Token healing ensures: "my_variable_name" (not "my_ variable_name")
```

#### Domain-Specific Terms

```python
# Medical terms
lm += "The patient has hyper" + gen("condition")
# Token healing helps: "hypertension" (not "hyper tension")

# Technical terms
lm += "Using micro" + gen("tech")
# Token healing helps: "microservices" (not "micro services")
```

### Disabling Token Healing

```python
# Disable token healing if needed (rare)
lm += gen("text", token_healing=False)
```

## Selection Constraints

### Basic Selection

```python
from guidance import models, select

lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Simple selection
lm += "Status: " + select(["active", "inactive", "pending"], name="status")

# Boolean selection
lm += "Approved: " + select(["Yes", "No"], name="approved")

# Multiple choice
lm += "Answer: " + select(
    ["A) Paris", "B) London", "C) Berlin", "D) Madrid"],
    name="answer"
)
```

### Conditional Selection

```python
from guidance import models, select, gen, guidance

@guidance
def conditional_fields(lm):
    """Generate fields conditionally based on type."""
    lm += "Type: " + select(["person", "company"], name="type")

    if lm["type"] == "person":
        lm += "\nName: " + gen("name", regex=r"[A-Za-z ]+")
        lm += "\nAge: " + gen("age", regex=r"[0-9]+")
    else:
        lm += "\nCompany Name: " + gen("company", regex=r"[A-Za-z ]+")
        lm += "\nEmployees: " + gen("employees", regex=r"[0-9]+")

    return lm
```

### Repeated Selection

```python
@guidance
def multiple_selections(lm):
    """Select multiple items."""
    lm += "Select 3 colors:\n"

    colors = ["red", "blue", "green", "yellow", "purple"]

    for i in range(3):
        lm += f"{i+1}. " + select(colors, name=f"color_{i}") + "\n"

    return lm
```

## Complex Patterns

### Pattern 1: Structured Forms

```python
@guidance
def user_form(lm):
    """Generate structured user form."""
    lm += "=== User Registration ===\n\n"

    # Name (alphabetic only)
    lm += "Full Name: " + gen("name", regex=r"[A-Za-z ]+", stop="\n") + "\n"

    # Age (numeric)
    lm += "Age: " + gen("age", regex=r"[0-9]+", max_tokens=3) + "\n"

    # Email (validated format)
    lm += "Email: " + gen(
        "email",
        regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        stop="\n"
    ) + "\n"

    # Phone (US format)
    lm += "Phone: " + gen("phone", regex=r"\d{3}-\d{3}-\d{4}") + "\n"

    # Account type (selection)
    lm += "Account Type: " + select(
        ["Standard", "Premium", "Enterprise"],
        name="account_type"
    ) + "\n"

    # Active status (boolean)
    lm += "Active: " + select(["Yes", "No"], name="active") + "\n"

    return lm
```

### Pattern 2: Multi-Entity Extraction

```python
@guidance
def extract_entities(lm, text):
    """Extract multiple entities with constraints."""
    lm += f"Text: {text}\n\n"

    # Person name (alphabetic)
    lm += "Person: " + gen("person", regex=r"[A-Za-z ]+", stop="\n") + "\n"

    # Organization (alphanumeric with spaces)
    lm += "Organization: " + gen(
        "organization",
        regex=r"[A-Za-z0-9 ]+",
        stop="\n"
    ) + "\n"

    # Date (YYYY-MM-DD format)
    lm += "Date: " + gen("date", regex=r"\d{4}-\d{2}-\d{2}") + "\n"

    # Location (alphabetic with spaces)
    lm += "Location: " + gen("location", regex=r"[A-Za-z ]+", stop="\n") + "\n"

    # Amount (currency)
    lm += "Amount: $" + gen("amount", regex=r"[0-9,]+\.[0-9]{2}") + "\n"

    return lm
```

### Pattern 3: Code Generation

```python
@guidance
def generate_python_function(lm):
    """Generate Python function with constraints."""
    # Function name (valid Python identifier)
    lm += "def " + gen("func_name", regex=r"[a-z_][a-z0-9_]*") + "("

    # Parameter name
    lm += gen("param", regex=r"[a-z_][a-z0-9_]*") + "):\n"

    # Docstring
    lm += '    """' + gen("docstring", stop='"""', max_tokens=50) + '"""\n'

    # Function body (constrained to valid Python)
    lm += "    return " + gen("return_value", stop="\n") + "\n"

    return lm
```

### Pattern 4: Hierarchical Data

```python
@guidance
def org_chart(lm):
    """Generate organizational chart."""
    lm += "Company: " + gen("company", regex=r"[A-Za-z ]+") + "\n\n"

    # CEO
    lm += "CEO: " + gen("ceo", regex=r"[A-Za-z ]+") + "\n"

    # Departments
    for dept in ["Engineering", "Sales", "Marketing"]:
        lm += f"\n{dept} Department:\n"
        lm += "  Head: " + gen(f"{dept.lower()}_head", regex=r"[A-Za-z ]+") + "\n"
        lm += "  Size: " + gen(f"{dept.lower()}_size", regex=r"[0-9]+") + " employees\n"

    return lm
```

## Performance Optimization

### Best Practices

#### 1. Use Specific Patterns

```python
# ✅ Good: Specific pattern
lm += gen("age", regex=r"[0-9]{1,3}")  # Fast

# ❌ Bad: Overly broad pattern
lm += gen("age", regex=r"[0-9]+")  # Slower
```

#### 2. Limit Max Tokens

```python
# ✅ Good: Reasonable limit
lm += gen("name", max_tokens=30)

# ❌ Bad: No limit
lm += gen("name")  # May generate forever
```

#### 3. Use stop Sequences

```python
# ✅ Good: Stop at newline
lm += gen("line", stop="\n")

# ❌ Bad: Rely on max_tokens
lm += gen("line", max_tokens=100)
```

#### 4. Cache Compiled Grammars

```python
# Grammars are cached automatically after first use
# No manual caching needed
@guidance
def reusable_pattern(lm):
    """This grammar is compiled once and cached."""
    lm += gen("email", regex=r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
    return lm

# First call: compiles grammar
lm = reusable_pattern(lm)

# Subsequent calls: uses cached grammar (fast)
lm = reusable_pattern(lm)
```

#### 5. Avoid Overlapping Constraints

```python
# ✅ Good: Clear constraints
lm += gen("age", regex=r"[0-9]+", max_tokens=3)

# ❌ Bad: Conflicting constraints
lm += gen("age", regex=r"[0-9]{2}", max_tokens=10)  # max_tokens unnecessary
```

### Performance Benchmarks

**Regex vs Free Generation:**
- Simple regex (digits): ~1.2x slower than free gen
- Complex regex (email): ~1.5x slower than free gen
- Grammar-based: ~2x slower than free gen

**But:**
- 100% valid outputs (vs ~70% with free gen + validation)
- No retry loops needed
- Overall faster end-to-end for structured outputs

**Optimization Tips:**
- Use regex for critical fields only
- Use `select()` for small fixed sets (fastest)
- Use `stop` sequences when possible (faster than max_tokens)
- Cache compiled grammars by reusing functions

## Resources

- **Token Healing Paper**: https://arxiv.org/abs/2306.17648
- **Guidance Docs**: https://guidance.readthedocs.io
- **GitHub**: https://github.com/guidance-ai/guidance
