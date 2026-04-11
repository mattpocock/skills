# Conference Paper Checklists

This reference documents the mandatory checklist requirements for major ML/AI conferences. All major venues now require paper checklists—missing them results in desk rejection.

---

## Contents

- [NeurIPS Paper Checklist](#neurips-paper-checklist)
- [ICML Paper Checklist](#icml-paper-checklist)
- [ICLR Requirements](#iclr-requirements)
- [ACL Requirements](#acl-requirements)
- [Universal Pre-Submission Checklist](#universal-pre-submission-checklist)

---

## NeurIPS Paper Checklist

### Mandatory Components

All NeurIPS submissions must include a completed paper checklist. Papers lacking this element face **automatic desk rejection**. The checklist appears after references and supplemental material, outside the page limit.

### 16 Required Checklist Items

#### 1. Claims Alignment
Authors must verify that abstract and introduction claims match theoretical and experimental results, with clearly stated contributions, assumptions, and limitations.

**What to check:**
- [ ] Abstract claims match actual results
- [ ] Introduction doesn't overclaim
- [ ] Contributions are specific and falsifiable

#### 2. Limitations Discussion
Papers should include a dedicated "Limitations" section addressing strong assumptions, robustness to violations, scope constraints, and performance-influencing factors.

**What to include:**
- [ ] Dedicated Limitations section
- [ ] Honest assessment of scope
- [ ] Conditions where method may fail

#### 3. Theory & Proofs
Theoretical contributions require full assumption statements and complete proofs (main paper or appendix with proof sketches for intuition).

**What to check:**
- [ ] All assumptions stated formally
- [ ] Complete proofs provided (main text or appendix)
- [ ] Proof sketches for intuition in main text

#### 4. Reproducibility
Authors must describe steps ensuring results verification through code release, detailed instructions, model access, or checkpoints appropriate to their contribution type.

**What to provide:**
- [ ] Clear reproducibility statement
- [ ] Code availability information
- [ ] Model checkpoints if applicable

#### 5. Data & Code Access
Instructions for reproducing main experimental results should be provided (supplemental material or URLs), including exact commands and environment specifications.

**What to include:**
- [ ] Exact commands to run experiments
- [ ] Environment specifications (requirements.txt, conda env)
- [ ] Data access instructions

#### 6. Experimental Details
Papers must specify training details: data splits, hyperparameters, and selection methods in the main paper or supplementary materials.

**What to document:**
- [ ] Train/val/test split details
- [ ] All hyperparameters used
- [ ] Hyperparameter selection method

#### 7. Statistical Significance
Results require error bars, confidence intervals, or statistical tests with clearly stated calculation methods and underlying assumptions.

**What to include:**
- [ ] Error bars or confidence intervals
- [ ] Number of runs/seeds
- [ ] Calculation method (std dev vs std error)

#### 8. Compute Resources
Specifications needed: compute worker types (CPU/GPU), memory, storage, execution time per run, and total project compute requirements.

**What to document:**
- [ ] GPU type and count
- [ ] Training time per run
- [ ] Total compute used

#### 9. Ethics Code Compliance
Authors confirm adherence to the NeurIPS Code of Ethics, noting any necessary deviations.

**What to verify:**
- [ ] Read NeurIPS Code of Ethics
- [ ] Confirm compliance
- [ ] Note any deviations with justification

#### 10. Broader Impacts
Discussion of potential negative societal applications, fairness concerns, privacy risks, and possible mitigation strategies when applicable.

**What to address:**
- [ ] Potential negative applications
- [ ] Fairness considerations
- [ ] Privacy implications
- [ ] Mitigation strategies

#### 11. Safeguards
High-risk models (language models, internet-scraped datasets) require controlled release mechanisms and usage guidelines.

**What to consider:**
- [ ] Release strategy for sensitive models
- [ ] Usage guidelines if needed
- [ ] Access controls if appropriate

#### 12. License Respect
All existing assets require creator citations, license names, URLs, version numbers, and terms-of-service acknowledgment.

**What to document:**
- [ ] Dataset licenses cited
- [ ] Code licenses respected
- [ ] Version numbers included

#### 13. Asset Documentation
New releases need structured templates documenting training details, limitations, consent procedures, and licensing information.

**For new datasets/models:**
- [ ] Datasheet or model card
- [ ] Training data documentation
- [ ] Known limitations

#### 14. Human Subjects
Crowdsourcing studies must include participant instructions, screenshots, compensation details, and comply with minimum wage requirements.

**What to include:**
- [ ] Task instructions
- [ ] Compensation details
- [ ] Time estimates

#### 15. IRB Approvals
Human subjects research requires documented institutional review board approval or equivalent, with risk descriptions disclosed (maintaining anonymity at submission).

**What to verify:**
- [ ] IRB approval obtained
- [ ] Risk assessment completed
- [ ] Anonymized at submission

#### 16. LLM Declaration
Usage of large language models as core methodology components requires disclosure; writing/editing use doesn't require declaration.

**What to disclose:**
- [ ] LLM used as core methodology component
- [ ] How LLM was used
- [ ] (Writing assistance doesn't require disclosure)

### Response Format

Authors select "yes," "no," or "N/A" per question, with optional 1-2 sentence justifications.

**Important:** Reviewers are explicitly instructed not to penalize honest limitation acknowledgment.

---

## ICML Paper Checklist

### Broader Impact Statement

ICML requires a Broader Impact Statement at the end of the paper, before references. This does NOT count toward the page limit.

**Required elements:**
- Potential positive impacts
- Potential negative impacts
- Mitigation strategies
- Who may be affected

### ICML Specific Requirements

#### Reproducibility Checklist

- [ ] Data splits clearly specified
- [ ] Hyperparameters listed
- [ ] Search ranges documented
- [ ] Selection method explained
- [ ] Compute resources specified
- [ ] Code availability stated

#### Statistical Reporting

- [ ] Error bars on all figures
- [ ] Standard deviation vs standard error specified
- [ ] Number of runs stated
- [ ] Significance tests if comparing methods

#### Anonymization

- [ ] No author names in paper
- [ ] No acknowledgments
- [ ] No grant numbers
- [ ] Prior work cited in third person
- [ ] No identifiable repository URLs

---

## ICLR Requirements

### LLM Disclosure Policy (New for 2026)

ICLR has a specific LLM disclosure requirement:

> "If LLMs played a significant role in research ideation and/or writing to the extent that they could be regarded as a contributor, authors must describe their precise role in a separate appendix section."

**When disclosure is required:**
- LLM used for significant research ideation
- LLM used for substantial writing
- LLM could be considered a contributor

**When disclosure is NOT required:**
- Grammar checking
- Minor editing assistance
- Code completion tools

**Consequences of non-disclosure:**
- Desk rejection
- Potential post-publication issues

### ICLR Specific Requirements

#### Reproducibility Statement (Optional but Recommended)

Add a statement referencing:
- Supporting materials
- Code availability
- Data availability
- Model checkpoints

#### Ethics Statement (Optional)

Address potential concerns in ≤1 page. Does not count toward page limit.

#### Reciprocal Reviewing

- Authors on 3+ papers must serve as reviewers for ≥6 papers
- Each submission needs ≥1 author registered to review ≥3 papers

---

## ACL Requirements

### Limitations Section (Mandatory)

ACL specifically requires a Limitations section:

**What to include:**
- Strong assumptions made
- Scope limitations
- When method may fail
- Generalization concerns

**Important:** The Limitations section does NOT count toward the page limit.

### ACL Specific Checklist

#### Responsible NLP

- [ ] Bias considerations addressed
- [ ] Fairness evaluated if applicable
- [ ] Dual-use concerns discussed

#### Multilingual Considerations

If applicable:
- [ ] Language diversity addressed
- [ ] Non-English languages included
- [ ] Translation quality verified

#### Human Evaluation

If applicable:
- [ ] Annotator details provided
- [ ] Agreement metrics reported
- [ ] Compensation documented

---

## Universal Pre-Submission Checklist

### Before Every Submission

#### Paper Content

- [ ] Abstract ≤ word limit (usually 250-300 words)
- [ ] Main content within page limit
- [ ] References complete and verified
- [ ] Limitations section included
- [ ] All figures/tables have captions
- [ ] Captions are self-contained

#### Formatting

- [ ] Correct template used (venue + year specific)
- [ ] Margins not modified
- [ ] Font sizes not modified
- [ ] Double-blind requirements met
- [ ] Page numbers (for review) or none (camera-ready)

#### Technical

- [ ] All claims supported by evidence
- [ ] Error bars included
- [ ] Baselines appropriate
- [ ] Hyperparameters documented
- [ ] Compute resources stated

#### Reproducibility

- [ ] Code will be available (or justification)
- [ ] Data will be available (or justification)
- [ ] Environment documented
- [ ] Commands to reproduce provided

#### Ethics

- [ ] Broader impacts considered
- [ ] Limitations honestly stated
- [ ] Licenses respected
- [ ] IRB obtained if needed

#### Final Checks

- [ ] PDF compiles without errors
- [ ] All figures render correctly
- [ ] All citations resolve
- [ ] Supplementary material organized
- [ ] Conference checklist completed

---

## Quick Reference: Page Limits

| Conference | Main Content | References | Appendix |
|------------|-------------|------------|----------|
| NeurIPS 2025 | 9 pages | Unlimited | Unlimited (checklist separate) |
| ICML 2026 | 8 pages (+1 camera) | Unlimited | Unlimited |
| ICLR 2026 | 9 pages (+1 camera) | Unlimited | Unlimited |
| ACL 2025 | 8 pages (long) | Unlimited | Unlimited |
| AAAI 2026 | 7 pages (+1 camera) | Unlimited | Unlimited |
| COLM 2025 | 9 pages (+1 camera) | Unlimited | Unlimited |

---

## Template Locations

All conference templates are in the `templates/` directory:

```
templates/
├── icml2026/       # ICML 2026 official
├── iclr2026/       # ICLR 2026 official
├── neurips2025/    # NeurIPS 2025
├── acl/            # ACL style files
├── aaai2026/       # AAAI 2026
└── colm2025/       # COLM 2025
```
