# Source Bibliography

This document lists all authoritative sources used to build this skill, organized by topic.

---

## Writing Philosophy & Guides

### Primary Sources (Must-Read)

| Source | Author | URL | Key Contribution |
|--------|--------|-----|------------------|
| **Highly Opinionated Advice on How to Write ML Papers** | Neel Nanda | [Alignment Forum](https://www.alignmentforum.org/posts/eJGptPbbFPZGLpjsp/highly-opinionated-advice-on-how-to-write-ml-papers) | Narrative framework, "What/Why/So What", time allocation |
| **How to Write ML Papers** | Sebastian Farquhar (DeepMind) | [Blog](https://sebastianfarquhar.com/on-research/2024/11/04/how_to_write_ml_papers/) | 5-sentence abstract formula, structure templates |
| **A Survival Guide to a PhD** | Andrej Karpathy | [Blog](http://karpathy.github.io/2016/09/07/phd/) | Paper structure recipe, contribution framing |
| **Heuristics for Scientific Writing** | Zachary Lipton (CMU) | [Blog](https://www.approximatelycorrect.com/2018/01/29/heuristics-technical-scientific-writing-machine-learning-perspective/) | Word choice, section balance, intensifier warnings |
| **Advice for Authors** | Jacob Steinhardt (UC Berkeley) | [Blog](https://jsteinhardt.stat.berkeley.edu/blog/advice-for-authors) | Precision over brevity, consistent terminology |
| **Easy Paper Writing Tips** | Ethan Perez (Anthropic) | [Blog](https://ethanperez.net/easy-paper-writing-tips/) | Micro-level tips, apostrophe unfolding, clarity tricks |

### Foundational Scientific Writing

| Source | Author | URL | Key Contribution |
|--------|--------|-----|------------------|
| **The Science of Scientific Writing** | Gopen & Swan | [PDF](https://cseweb.ucsd.edu/~swanson/papers/science-of-writing.pdf) | Topic/stress positions, old-before-new, 7 principles |
| **Summary of Science of Scientific Writing** | Lawrence Crowl | [Summary](https://www.crowl.org/Lawrence/writing/GopenSwan90.html) | Condensed version of Gopen & Swan |

### Additional Resources

| Source | URL | Key Contribution |
|--------|-----|------------------|
| How To Write A Research Paper In ML | [Blog](https://grigorisg9gr.github.io/machine%20learning/research%20paper/how-to-write-a-research-paper-in-machine-learning/) | Practical walkthrough, LaTeX tips |
| A Recipe for Training Neural Networks | [Karpathy Blog](http://karpathy.github.io/2019/04/25/recipe/) | Debugging methodology that translates to paper structure |
| ICML Paper Writing Best Practices | [ICML](https://icml.cc/Conferences/2022/BestPractices) | Official venue guidance |
| Bill Freeman's Writing Slides | [MIT](https://billf.mit.edu/sites/default/files/documents/cvprPapers.pdf) | Visual guide to paper structure |

---

## Official Conference Guidelines

### NeurIPS

| Document | URL | Purpose |
|----------|-----|---------|
| Paper Checklist Guidelines | [NeurIPS](https://neurips.cc/public/guides/PaperChecklist) | 16-item mandatory checklist |
| Reviewer Guidelines 2025 | [NeurIPS](https://neurips.cc/Conferences/2025/ReviewerGuidelines) | Evaluation criteria, scoring |
| Style Files | [NeurIPS](https://neurips.cc/Conferences/2025/PaperInformation/StyleFiles) | LaTeX templates |

### ICML

| Document | URL | Purpose |
|----------|-----|---------|
| Paper Guidelines | [ICML](https://icml.cc/Conferences/2024/PaperGuidelines) | Submission requirements |
| Reviewer Instructions 2025 | [ICML](https://icml.cc/Conferences/2025/ReviewerInstructions) | Review form, evaluation |
| Style & Author Instructions | [ICML](https://icml.cc/Conferences/2022/StyleAuthorInstructions) | Formatting specifications |

### ICLR

| Document | URL | Purpose |
|----------|-----|---------|
| Author Guide 2026 | [ICLR](https://iclr.cc/Conferences/2026/AuthorGuide) | Submission requirements, LLM disclosure |
| Reviewer Guide 2025 | [ICLR](https://iclr.cc/Conferences/2025/ReviewerGuide) | Review process, evaluation |

### ACL/EMNLP

| Document | URL | Purpose |
|----------|-----|---------|
| ACL Style Files | [GitHub](https://github.com/acl-org/acl-style-files) | LaTeX templates |
| ACL Rolling Review | [ARR](https://aclrollingreview.org/) | Submission process |

### AAAI

| Document | URL | Purpose |
|----------|-----|---------|
| Author Kit 2026 | [AAAI](https://aaai.org/authorkit26/) | Templates and guidelines |

### COLM

| Document | URL | Purpose |
|----------|-----|---------|
| Template | [GitHub](https://github.com/COLM-org/Template) | LaTeX templates |

---

## Citation APIs & Tools

### APIs

| API | Documentation | Best For |
|-----|---------------|----------|
| **Semantic Scholar** | [Docs](https://api.semanticscholar.org/api-docs/) | ML/AI papers, citation graphs |
| **CrossRef** | [Docs](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) | DOI lookup, BibTeX retrieval |
| **arXiv** | [Docs](https://info.arxiv.org/help/api/basics.html) | Preprints, PDF access |
| **OpenAlex** | [Docs](https://docs.openalex.org/) | Open alternative, bulk access |

### Python Libraries

| Library | Install | Purpose |
|---------|---------|---------|
| `semanticscholar` | `pip install semanticscholar` | Semantic Scholar wrapper |
| `arxiv` | `pip install arxiv` | arXiv search and download |
| `habanero` | `pip install habanero` | CrossRef client |

### Citation Verification

| Tool | URL | Purpose |
|------|-----|---------|
| Citely | [citely.ai](https://citely.ai/citation-checker) | Batch verification |
| ReciteWorks | [reciteworks.com](https://reciteworks.com/) | In-text citation checking |

---

## Visualization & Formatting

### Figure Creation

| Tool | URL | Purpose |
|------|-----|---------|
| PlotNeuralNet | [GitHub](https://github.com/HarisIqbal88/PlotNeuralNet) | TikZ neural network diagrams |
| SciencePlots | [GitHub](https://github.com/garrettj403/SciencePlots) | Publication-ready matplotlib |
| Okabe-Ito Palette | [Reference](https://jfly.uni-koeln.de/color/) | Colorblind-safe colors |

### LaTeX Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| Overleaf Templates | [Overleaf](https://www.overleaf.com/latex/templates) | Online LaTeX editor |
| BibLaTeX Guide | [CTAN](https://ctan.org/pkg/biblatex) | Modern citation management |

---

## Research on AI Writing & Hallucination

| Source | URL | Key Finding |
|--------|-----|-------------|
| AI Hallucinations in Citations | [Enago](https://www.enago.com/academy/ai-hallucinations-research-citations/) | ~40% error rate |
| Hallucination in AI Writing | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10726751/) | Types of citation errors |
| NeurIPS 2025 AI Report | [ByteIota](https://byteiota.com/neurips-2025-100-ai-hallucinations-slip-through-review/) | 100+ hallucinated citations |

---

## Quick Reference by Topic

### For Narrative & Structure
→ Start with: Neel Nanda, Sebastian Farquhar, Andrej Karpathy

### For Sentence-Level Clarity
→ Start with: Gopen & Swan, Ethan Perez, Zachary Lipton

### For Word Choice & Style
→ Start with: Zachary Lipton, Jacob Steinhardt

### For Conference-Specific Requirements
→ Start with: Official venue guidelines (NeurIPS, ICML, ICLR, ACL)

### For Citation Management
→ Start with: Semantic Scholar API, CrossRef, citation-workflow.md

### For Reviewer Expectations
→ Start with: Venue reviewer guidelines, reviewer-guidelines.md
