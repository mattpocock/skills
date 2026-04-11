# Citation Management & Hallucination Prevention

This reference provides a complete workflow for managing citations programmatically, preventing AI-generated citation hallucinations, and maintaining clean bibliographies.

---

## Contents

- [Why Citation Verification Matters](#why-citation-verification-matters)
- [Citation APIs Overview](#citation-apis-overview)
- [Verified Citation Workflow](#verified-citation-workflow)
- [Python Implementation](#python-implementation)
- [BibTeX Management](#bibtex-management)
- [Common Citation Formats](#common-citation-formats)
- [Troubleshooting](#troubleshooting)

---

## Why Citation Verification Matters

### The Hallucination Problem

Research has documented significant issues with AI-generated citations:
- **~40% error rate** in AI-generated citations (Enago Academy research)
- NeurIPS 2025 found **100+ hallucinated citations** slipped through review
- Common errors include:
  - Fabricated paper titles with real author names
  - Wrong publication venues or years
  - Non-existent papers with plausible metadata
  - Incorrect DOIs or arXiv IDs

### Consequences

- Desk rejection at some venues
- Loss of credibility with reviewers
- Potential retraction if published
- Wasted time chasing non-existent sources

### Solution

**Never generate citations from memory—always verify programmatically.**

---

## Citation APIs Overview

### Primary APIs

| API | Coverage | Rate Limits | Best For |
|-----|----------|-------------|----------|
| **Semantic Scholar** | 214M papers | 1 RPS (free key) | ML/AI papers, citation graphs |
| **CrossRef** | 140M+ DOIs | Polite pool with mailto | DOI lookup, BibTeX retrieval |
| **arXiv** | Preprints | 3-second delays | ML preprints, PDF access |
| **OpenAlex** | 240M+ works | 100K/day, 10 RPS | Open alternative to MAG |

### API Selection Guide

```
Need ML paper search? → Semantic Scholar
Have DOI, need BibTeX? → CrossRef content negotiation
Looking for preprint? → arXiv API
Need open data, bulk access? → OpenAlex
```

### No Official Google Scholar API

Google Scholar has no official API. Scraping violates ToS. Use SerpApi ($75-275/month) only if Semantic Scholar coverage is insufficient.

---

## Verified Citation Workflow

### 5-Step Process

```
1. SEARCH → Query Semantic Scholar with specific keywords
     ↓
2. VERIFY → Confirm paper exists in 2+ sources
     ↓
3. RETRIEVE → Get BibTeX via DOI content negotiation
     ↓
4. VALIDATE → Confirm the claim appears in source
     ↓
5. ADD → Add verified entry to .bib file
```

### Step 1: Search

Use Semantic Scholar for ML/AI papers:

```python
from semanticscholar import SemanticScholar

sch = SemanticScholar()
results = sch.search_paper("transformer attention mechanism", limit=10)

for paper in results:
    print(f"Title: {paper.title}")
    print(f"Year: {paper.year}")
    print(f"DOI: {paper.externalIds.get('DOI', 'N/A')}")
    print(f"arXiv: {paper.externalIds.get('ArXiv', 'N/A')}")
    print(f"Citation count: {paper.citationCount}")
    print("---")
```

### Step 2: Verify Existence

Confirm paper exists in at least two sources:

```python
import requests

def verify_paper(doi=None, arxiv_id=None, title=None):
    """Verify paper exists in multiple sources."""
    sources_found = []

    # Check Semantic Scholar
    sch = SemanticScholar()
    if doi:
        paper = sch.get_paper(f"DOI:{doi}")
        if paper:
            sources_found.append("Semantic Scholar")

    # Check CrossRef (via DOI)
    if doi:
        resp = requests.get(f"https://api.crossref.org/works/{doi}")
        if resp.status_code == 200:
            sources_found.append("CrossRef")

    # Check arXiv
    if arxiv_id:
        resp = requests.get(
            f"http://export.arxiv.org/api/query?id_list={arxiv_id}"
        )
        if "<entry>" in resp.text:
            sources_found.append("arXiv")

    return len(sources_found) >= 2, sources_found
```

### Step 3: Retrieve BibTeX

Use DOI content negotiation for guaranteed accuracy:

```python
import requests

def doi_to_bibtex(doi: str) -> str:
    """Get verified BibTeX from DOI via CrossRef content negotiation."""
    response = requests.get(
        f"https://doi.org/{doi}",
        headers={"Accept": "application/x-bibtex"},
        allow_redirects=True
    )
    response.raise_for_status()
    return response.text

# Example: "Attention Is All You Need"
bibtex = doi_to_bibtex("10.48550/arXiv.1706.03762")
print(bibtex)
```

### Step 4: Validate Claims

Before citing a paper for a specific claim, verify the claim exists:

```python
def get_paper_abstract(doi):
    """Get abstract to verify claims."""
    sch = SemanticScholar()
    paper = sch.get_paper(f"DOI:{doi}")
    return paper.abstract if paper else None

# Verify claim appears in abstract
abstract = get_paper_abstract("10.48550/arXiv.1706.03762")
claim = "attention mechanism"
if claim.lower() in abstract.lower():
    print("Claim appears in paper")
```

### Step 5: Add to Bibliography

Add verified entry to your .bib file with consistent key format:

```python
def generate_citation_key(bibtex: str) -> str:
    """Generate consistent citation key: author_year_firstword."""
    import re

    # Extract author
    author_match = re.search(r'author\s*=\s*\{([^}]+)\}', bibtex, re.I)
    if author_match:
        first_author = author_match.group(1).split(',')[0].split()[-1]
    else:
        first_author = "unknown"

    # Extract year
    year_match = re.search(r'year\s*=\s*\{?(\d{4})\}?', bibtex, re.I)
    year = year_match.group(1) if year_match else "0000"

    # Extract title first word
    title_match = re.search(r'title\s*=\s*\{([^}]+)\}', bibtex, re.I)
    if title_match:
        first_word = title_match.group(1).split()[0].lower()
        first_word = re.sub(r'[^a-z]', '', first_word)
    else:
        first_word = "paper"

    return f"{first_author.lower()}_{year}_{first_word}"
```

---

## Python Implementation

### Complete Citation Manager Class

{% raw %}
```python
"""
Citation Manager - Verified citation workflow for ML papers.
"""

import requests
import time
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass

try:
    from semanticscholar import SemanticScholar
except ImportError:
    print("Install: pip install semanticscholar")
    SemanticScholar = None

@dataclass
class Paper:
    title: str
    authors: List[str]
    year: int
    doi: Optional[str]
    arxiv_id: Optional[str]
    venue: Optional[str]
    citation_count: int
    abstract: Optional[str]

class CitationManager:
    """Manage citations with verification."""

    def __init__(self, api_key: Optional[str] = None):
        self.sch = SemanticScholar(api_key=api_key) if SemanticScholar else None
        self.verified_papers: Dict[str, Paper] = {}

    def search(self, query: str, limit: int = 10) -> List[Paper]:
        """Search for papers using Semantic Scholar."""
        if not self.sch:
            raise RuntimeError("Semantic Scholar not available")

        results = self.sch.search_paper(query, limit=limit)
        papers = []

        for r in results:
            paper = Paper(
                title=r.title,
                authors=[a.name for a in (r.authors or [])],
                year=r.year or 0,
                doi=r.externalIds.get('DOI') if r.externalIds else None,
                arxiv_id=r.externalIds.get('ArXiv') if r.externalIds else None,
                venue=r.venue,
                citation_count=r.citationCount or 0,
                abstract=r.abstract
            )
            papers.append(paper)

        return papers

    def verify(self, paper: Paper) -> Tuple[bool, List[str]]:
        """Verify paper exists in multiple sources."""
        sources = []

        # Already found in Semantic Scholar via search
        sources.append("Semantic Scholar")

        # Check CrossRef if DOI available
        if paper.doi:
            try:
                resp = requests.get(
                    f"https://api.crossref.org/works/{paper.doi}",
                    timeout=10
                )
                if resp.status_code == 200:
                    sources.append("CrossRef")
            except:
                pass

        # Check arXiv if ID available
        if paper.arxiv_id:
            try:
                resp = requests.get(
                    f"http://export.arxiv.org/api/query?id_list={paper.arxiv_id}",
                    timeout=10
                )
                if "<entry>" in resp.text and "<title>" in resp.text:
                    sources.append("arXiv")
            except:
                pass

        return len(sources) >= 2, sources

    def get_bibtex(self, paper: Paper) -> Optional[str]:
        """Get BibTeX for verified paper."""
        if paper.doi:
            try:
                resp = requests.get(
                    f"https://doi.org/{paper.doi}",
                    headers={"Accept": "application/x-bibtex"},
                    timeout=10,
                    allow_redirects=True
                )
                if resp.status_code == 200:
                    return resp.text
            except:
                pass

        # Fallback: generate from paper data
        return self._generate_bibtex(paper)

    def _generate_bibtex(self, paper: Paper) -> str:
        """Generate BibTeX from paper metadata."""
        # Generate citation key
        first_author = paper.authors[0].split()[-1] if paper.authors else "unknown"
        first_word = paper.title.split()[0].lower().replace(',', '').replace(':', '')
        key = f"{first_author.lower()}_{paper.year}_{first_word}"

        # Format authors
        authors = " and ".join(paper.authors) if paper.authors else "Unknown"

        bibtex = f"""@article{{{key},
  title = {{{paper.title}}},
  author = {{{authors}}},
  year = {{{paper.year}}},
  {'doi = {' + paper.doi + '},' if paper.doi else ''}
  {'eprint = {' + paper.arxiv_id + '},' if paper.arxiv_id else ''}
  {'journal = {' + paper.venue + '},' if paper.venue else ''}
}}"""
        return bibtex

    def cite(self, query: str) -> Optional[str]:
        """Full workflow: search, verify, return BibTeX."""
        # Search
        papers = self.search(query, limit=5)
        if not papers:
            return None

        # Take top result
        paper = papers[0]

        # Verify
        verified, sources = self.verify(paper)
        if not verified:
            print(f"Warning: Could only verify in {sources}")

        # Get BibTeX
        bibtex = self.get_bibtex(paper)

        # Cache
        if bibtex:
            self.verified_papers[paper.title] = paper

        return bibtex


# Usage example
if __name__ == "__main__":
    cm = CitationManager()

    # Search and cite
    bibtex = cm.cite("attention is all you need transformer")
    if bibtex:
        print(bibtex)
```
{% endraw %}

### Quick Functions

```python
def quick_cite(query: str) -> str:
    """One-liner citation."""
    cm = CitationManager()
    return cm.cite(query)

def batch_cite(queries: List[str], output_file: str = "references.bib"):
    """Cite multiple papers and save to file."""
    cm = CitationManager()
    bibtex_entries = []

    for query in queries:
        print(f"Processing: {query}")
        bibtex = cm.cite(query)
        if bibtex:
            bibtex_entries.append(bibtex)
        time.sleep(1)  # Rate limiting

    with open(output_file, 'w') as f:
        f.write("\n\n".join(bibtex_entries))

    print(f"Saved {len(bibtex_entries)} citations to {output_file}")
```

---

## BibTeX Management

### BibTeX vs BibLaTeX

| Feature | BibTeX | BibLaTeX |
|---------|--------|----------|
| Unicode support | Limited | Full |
| Entry types | Standard | Extended (@online, @dataset) |
| Customization | Limited | Highly flexible |
| Backend | bibtex | Biber (recommended) |

**Recommendation**: Use BibLaTeX with Biber for new papers.

### LaTeX Setup

```latex
% In preamble
\usepackage[
    backend=biber,
    style=numeric,
    sorting=none
]{biblatex}
\addbibresource{references.bib}

% In document
\cite{vaswani_2017_attention}

% At end
\printbibliography
```

### Citation Commands

```latex
\cite{key}      % Numeric: [1]
\citep{key}     % Parenthetical: (Author, 2020)
\citet{key}     % Textual: Author (2020)
\citeauthor{key} % Just author name
\citeyear{key}  % Just year
```

### Consistent Citation Keys

Use format: `author_year_firstword`

```
vaswani_2017_attention
devlin_2019_bert
brown_2020_language
```

---

## Common Citation Formats

### Conference Paper

```bibtex
@inproceedings{vaswani_2017_attention,
  title = {Attention Is All You Need},
  author = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and
            Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and
            Kaiser, Lukasz and Polosukhin, Illia},
  booktitle = {Advances in Neural Information Processing Systems},
  volume = {30},
  year = {2017},
  publisher = {Curran Associates, Inc.}
}
```

### Journal Article

```bibtex
@article{hochreiter_1997_long,
  title = {Long Short-Term Memory},
  author = {Hochreiter, Sepp and Schmidhuber, J{\"u}rgen},
  journal = {Neural Computation},
  volume = {9},
  number = {8},
  pages = {1735--1780},
  year = {1997},
  publisher = {MIT Press}
}
```

### arXiv Preprint

```bibtex
@misc{brown_2020_language,
  title = {Language Models are Few-Shot Learners},
  author = {Brown, Tom and Mann, Benjamin and Ryder, Nick and others},
  year = {2020},
  eprint = {2005.14165},
  archiveprefix = {arXiv},
  primaryclass = {cs.CL}
}
```

---

## Troubleshooting

### Common Issues

**Issue: Semantic Scholar returns no results**
- Try more specific keywords
- Check spelling of author names
- Use quotation marks for exact phrases

**Issue: DOI doesn't resolve to BibTeX**
- DOI may be registered but not linked to CrossRef
- Try arXiv ID instead if available
- Generate BibTeX from metadata manually

**Issue: Rate limiting errors**
- Add delays between requests (1-3 seconds)
- Use API key if available
- Cache results to avoid repeat queries

**Issue: Encoding problems in BibTeX**
- Use proper LaTeX escaping: `{\"u}` for ü
- Ensure file is UTF-8 encoded
- Use BibLaTeX with Biber for better Unicode

### Verification Checklist

Before adding a citation:

- [ ] Paper found in at least 2 sources
- [ ] DOI or arXiv ID verified
- [ ] BibTeX retrieved (not generated from memory)
- [ ] Entry type correct (@inproceedings vs @article)
- [ ] Author names complete and correctly formatted
- [ ] Year and venue verified
- [ ] Citation key follows consistent format

---

## Additional Resources

**APIs:**
- Semantic Scholar: https://api.semanticscholar.org/api-docs/
- CrossRef: https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- arXiv: https://info.arxiv.org/help/api/basics.html
- OpenAlex: https://docs.openalex.org/

**Python Libraries:**
- `semanticscholar`: https://pypi.org/project/semanticscholar/
- `arxiv`: https://pypi.org/project/arxiv/
- `habanero` (CrossRef): https://github.com/sckott/habanero

**Verification Tools:**
- Citely: https://citely.ai/citation-checker
- ReciteWorks: https://reciteworks.com/
