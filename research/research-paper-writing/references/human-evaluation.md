# Human Evaluation Guide for ML/AI Research

Comprehensive guide for designing, running, and reporting human evaluations in ML/AI papers. Human evaluation is the primary evidence for many NLP, HCI, and alignment papers, and is increasingly expected as complementary evidence at all ML venues.

---

## Contents

- [When Human Evaluation Is Needed](#when-human-evaluation-is-needed)
- [Study Design](#study-design)
- [Annotation Guidelines](#annotation-guidelines)
- [Platforms and Recruitment](#platforms-and-recruitment)
- [Quality Control](#quality-control)
- [Agreement Metrics](#agreement-metrics)
- [Statistical Analysis for Human Eval](#statistical-analysis-for-human-eval)
- [Reporting Requirements](#reporting-requirements)
- [IRB and Ethics](#irb-and-ethics)
- [Common Pitfalls](#common-pitfalls)

---

## When Human Evaluation Is Needed

| Scenario | Human Eval Required? | Notes |
|----------|---------------------|-------|
| Text generation quality (fluency, coherence) | **Yes** | Automated metrics (BLEU, ROUGE) correlate poorly with human judgment |
| Factual accuracy of generated text | **Strongly recommended** | Automated fact-checking is unreliable |
| Safety/toxicity evaluation | **Yes for nuanced cases** | Classifiers miss context-dependent harm |
| Preference between two systems | **Yes** | Most reliable method for comparing LLM outputs |
| Summarization quality | **Yes** | ROUGE doesn't capture faithfulness or relevance well |
| Task completion (UI, agents) | **Yes** | User studies are the gold standard |
| Classification accuracy | **Usually no** | Ground truth labels suffice; human eval adds cost without insight |
| Perplexity or loss comparisons | **No** | Automated metrics are the correct evaluation |

---

## Study Design

### Evaluation Types

| Type | When to Use | Pros | Cons |
|------|-------------|------|------|
| **Pairwise comparison** | Comparing two systems | Most reliable, minimizes scale bias | Only compares pairs, quadratic in systems |
| **Likert scale** (1-5 or 1-7) | Rating individual outputs | Easy to aggregate | Subjective anchoring, scale compression |
| **Ranking** | Ordering 3+ systems | Captures full preference order | Cognitive load increases with items |
| **Best-worst scaling** | Comparing many systems efficiently | More reliable than Likert, linear in items | Requires careful item selection |
| **Binary judgment** | Yes/no decisions (grammatical? factual?) | Simple, high agreement | Loses nuance |
| **Error annotation** | Identifying specific error types | Rich diagnostic information | Expensive, requires trained annotators |

**Recommendation for most ML papers**: Pairwise comparison is the most defensible. Reviewers rarely question its validity. For Likert scales, always report both mean and distribution.

### Sample Size Planning

**Minimum viable sample sizes:**

| Study Type | Minimum Items | Minimum Annotators | Notes |
|------------|--------------|-------------------|-------|
| Pairwise comparison | 100 pairs | 3 per pair | Detects ~10% win rate difference at p<0.05 |
| Likert rating | 100 items | 3 per item | Enough for meaningful averages |
| Ranking | 50 sets | 3 per set | Each set contains all systems being compared |
| Error annotation | 200 items | 2 per item | Higher agreement expected for structured schemes |

**Power analysis** (for planning more precisely):

```python
from scipy import stats
import numpy as np

def sample_size_pairwise(effect_size=0.10, alpha=0.05, power=0.80):
    """
    Estimate sample size for pairwise comparison (sign test).
    effect_size: expected win rate difference from 0.50
    """
    p_expected = 0.50 + effect_size
    # Normal approximation to binomial
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    n = ((z_alpha * np.sqrt(0.25) + z_beta * np.sqrt(p_expected * (1 - p_expected))) ** 2) / (effect_size ** 2)
    return int(np.ceil(n))

print(f"Sample size for 10% effect: {sample_size_pairwise(0.10)}")  # ~200
print(f"Sample size for 15% effect: {sample_size_pairwise(0.15)}")  # ~90
print(f"Sample size for 20% effect: {sample_size_pairwise(0.20)}")  # ~50
```

### Controlling for Bias

| Bias | Mitigation |
|------|-----------|
| **Order bias** (first item preferred) | Randomize presentation order for each annotator |
| **Length bias** (longer = better) | Control for length or analyze separately |
| **Anchoring** (first annotation sets scale) | Include warm-up items (not counted) |
| **Fatigue** (quality drops over time) | Limit session length (30-45 min max), randomize item order |
| **Annotator expertise** | Report annotator background; use qualification tasks |

---

## Annotation Guidelines

Well-written annotation guidelines are the single biggest factor in evaluation quality. Invest significant time here.

### Structure of Good Guidelines

```markdown
# [Task Name] Annotation Guidelines

## Overview
[1-2 sentences describing the task]

## Definitions
[Define every term annotators will use in their judgments]
- Quality: [specific definition for this study]
- Fluency: [specific definition]
- Factuality: [specific definition]

## Rating Scale
[For each scale point, provide:]
- Numeric value
- Label (e.g., "Excellent", "Good", "Acceptable", "Poor", "Unacceptable")
- Definition of what qualifies for this rating
- 1-2 concrete examples at this level

## Examples

### Example 1: [Rating = 5]
Input: [exact input]
Output: [exact output]
Rating: 5
Explanation: [why this is a 5]

### Example 2: [Rating = 2]
Input: [exact input]
Output: [exact output]
Rating: 2
Explanation: [why this is a 2]

[Include at least 2 examples per rating level, covering edge cases]

## Edge Cases
- If the output is [ambiguous case]: [instruction]
- If the input is [unusual case]: [instruction]

## Common Mistakes
- Don't [common annotator error]
- Don't let [bias] influence your rating
```

### Pilot Testing

**Always run a pilot** before the full study:
1. 3-5 annotators, 20-30 items
2. Compute agreement metrics
3. Discuss disagreements in group session
4. Revise guidelines based on confusion points
5. Run second pilot if agreement was poor (<0.40 kappa)

---

## Platforms and Recruitment

| Platform | Best For | Cost | Quality |
|----------|----------|------|---------|
| **Prolific** | General annotation, surveys | $8-15/hr | High (academic-focused pool) |
| **Amazon MTurk** | Large-scale simple tasks | $5-12/hr | Variable (needs strong QC) |
| **Surge AI** | NLP-specific annotation | $15-25/hr | Very high (trained annotators) |
| **Scale AI** | Production-quality labeling | Varies | High (managed workforce) |
| **Internal team** | Domain expertise required | Varies | Highest for specialized tasks |
| **Upwork/contractors** | Long-term annotation projects | $10-30/hr | Depends on hiring |

**Fair compensation**: Always pay at least the equivalent of local minimum wage for the annotator's location. Many conferences (ACL in particular) now ask about annotator compensation. Paying below minimum wage is an ethics risk.

**Prolific setup (recommended for most ML papers):**
1. Create study on prolific.co
2. Set prescreening filters (language, country, approval rate >95%)
3. Estimate time per task from pilot → set fair payment
4. Use Prolific's built-in attention checks or add your own
5. Collect Prolific IDs for quality tracking (but don't share in paper)

---

## Quality Control

### Attention Checks

Include items where the correct answer is unambiguous:

```python
# Types of attention checks
attention_checks = {
    "instructed_response": "For this item, please select 'Strongly Agree' regardless of content.",
    "obvious_quality": "Rate this clearly ungrammatical text: 'The cat dog house green yesterday.'",  # Should get lowest score
    "gold_standard": "Items where expert consensus exists (pre-annotated by authors)",
    "trap_question": "What color is the sky on a clear day? (embedded in annotation interface)"
}

# Recommended: 10-15% of total items should be checks
# Exclusion criterion: fail 2+ attention checks → exclude annotator
```

### Annotator Qualification

For tasks requiring expertise:

```
Qualification Task Design:
1. Create a set of 20-30 items with known-correct labels
2. Require annotators to complete this before the main task
3. Set threshold: ≥80% agreement with gold labels to qualify
4. Record qualification scores for reporting
```

### Monitoring During Collection

```python
# Real-time quality monitoring
def monitor_quality(annotations):
    """Check for annotation quality issues during collection."""
    issues = []
    
    # 1. Check for straight-lining (same answer for everything)
    for annotator_id, items in annotations.groupby('annotator'):
        if items['rating'].nunique() <= 1:
            issues.append(f"Annotator {annotator_id}: straight-lining detected")
    
    # 2. Check time per item (too fast = not reading)
    median_time = annotations['time_seconds'].median()
    fast_annotators = annotations.groupby('annotator')['time_seconds'].median()
    for ann_id, time in fast_annotators.items():
        if time < median_time * 0.3:
            issues.append(f"Annotator {ann_id}: suspiciously fast ({time:.0f}s vs median {median_time:.0f}s)")
    
    # 3. Check attention check performance
    checks = annotations[annotations['is_attention_check']]
    for ann_id, items in checks.groupby('annotator'):
        accuracy = (items['rating'] == items['gold_rating']).mean()
        if accuracy < 0.80:
            issues.append(f"Annotator {ann_id}: failing attention checks ({accuracy:.0%})")
    
    return issues
```

---

## Agreement Metrics

### Which Metric to Use

| Metric | When to Use | Interpretation |
|--------|-------------|---------------|
| **Cohen's kappa (κ)** | Exactly 2 annotators, categorical | Chance-corrected agreement |
| **Fleiss' kappa** | 3+ annotators, all rate same items, categorical | Multi-annotator extension of Cohen's |
| **Krippendorff's alpha (α)** | Any number of annotators, handles missing data | Most general; recommended default |
| **ICC (Intraclass Correlation)** | Continuous ratings (Likert) | Consistency among raters |
| **Percent agreement** | Reporting alongside kappa/alpha | Raw agreement (not chance-corrected) |
| **Kendall's W** | Rankings | Concordance among rankers |

**Always report at least two**: one chance-corrected metric (kappa or alpha) AND raw percent agreement.

### Interpretation Guide

| Value | Krippendorff's α / Cohen's κ | Quality |
|-------|-------------------------------|---------|
| > 0.80 | Excellent agreement | Reliable for most purposes |
| 0.67 - 0.80 | Good agreement | Acceptable for most ML papers |
| 0.40 - 0.67 | Moderate agreement | Borderline; discuss in paper |
| < 0.40 | Poor agreement | Revise guidelines and redo annotation |

**Note**: Krippendorff recommends α > 0.667 as minimum for tentative conclusions. NLP tasks with subjective judgments (fluency, helpfulness) typically achieve 0.40-0.70.

### Implementation

```python
import numpy as np
from sklearn.metrics import cohen_kappa_score
import krippendorff  # pip install krippendorff

def compute_agreement(annotations_matrix):
    """
    annotations_matrix: shape (n_items, n_annotators)
    Values: ratings (int or float). Use np.nan for missing.
    """
    results = {}
    
    # Krippendorff's alpha (handles missing data, any number of annotators)
    results['krippendorff_alpha'] = krippendorff.alpha(
        annotations_matrix.T,  # krippendorff expects (annotators, items)
        level_of_measurement='ordinal'  # or 'nominal', 'interval', 'ratio'
    )
    
    # Pairwise Cohen's kappa (for 2 annotators at a time)
    n_annotators = annotations_matrix.shape[1]
    kappas = []
    for i in range(n_annotators):
        for j in range(i + 1, n_annotators):
            mask = ~np.isnan(annotations_matrix[:, i]) & ~np.isnan(annotations_matrix[:, j])
            if mask.sum() > 0:
                k = cohen_kappa_score(
                    annotations_matrix[mask, i].astype(int),
                    annotations_matrix[mask, j].astype(int)
                )
                kappas.append(k)
    results['mean_pairwise_kappa'] = np.mean(kappas) if kappas else None
    
    # Raw percent agreement
    agree_count = 0
    total_count = 0
    for item in range(annotations_matrix.shape[0]):
        ratings = annotations_matrix[item, ~np.isnan(annotations_matrix[item, :])]
        if len(ratings) >= 2:
            # All annotators agree
            if len(set(ratings.astype(int))) == 1:
                agree_count += 1
            total_count += 1
    results['percent_agreement'] = agree_count / total_count if total_count > 0 else None
    
    return results
```

---

## Statistical Analysis for Human Eval

### Pairwise Comparisons

```python
from scipy import stats

def analyze_pairwise(wins_a, wins_b, ties=0):
    """
    Analyze pairwise comparison results.
    wins_a: number of times system A won
    wins_b: number of times system B won
    ties: number of ties (excluded from sign test)
    """
    n = wins_a + wins_b  # exclude ties
    
    # Sign test (exact binomial)
    p_value = stats.binom_test(wins_a, n, 0.5, alternative='two-sided')
    
    # Win rate with 95% CI (Wilson score interval)
    win_rate = wins_a / n if n > 0 else 0.5
    z = 1.96
    denominator = 1 + z**2 / n
    center = (win_rate + z**2 / (2 * n)) / denominator
    margin = z * np.sqrt((win_rate * (1 - win_rate) + z**2 / (4 * n)) / n) / denominator
    ci_lower = center - margin
    ci_upper = center + margin
    
    return {
        'win_rate_a': win_rate,
        'win_rate_b': 1 - win_rate,
        'p_value': p_value,
        'ci_95': (ci_lower, ci_upper),
        'significant': p_value < 0.05,
        'n_comparisons': n,
        'ties': ties,
    }
```

### Likert Scale Analysis

```python
def analyze_likert(ratings_a, ratings_b):
    """Compare Likert ratings between two systems (paired)."""
    # Wilcoxon signed-rank test (non-parametric, paired)
    stat, p_value = stats.wilcoxon(ratings_a, ratings_b, alternative='two-sided')
    
    # Effect size (rank-biserial correlation)
    n = len(ratings_a)
    r = 1 - (2 * stat) / (n * (n + 1))
    
    return {
        'mean_a': np.mean(ratings_a),
        'mean_b': np.mean(ratings_b),
        'std_a': np.std(ratings_a),
        'std_b': np.std(ratings_b),
        'wilcoxon_stat': stat,
        'p_value': p_value,
        'effect_size_r': r,
        'significant': p_value < 0.05,
    }
```

### Multiple Comparisons Correction

When comparing more than two systems:

```python
from statsmodels.stats.multitest import multipletests

# After computing p-values for all pairs
p_values = [0.03, 0.001, 0.08, 0.04, 0.15, 0.002]
rejected, corrected_p, _, _ = multipletests(p_values, method='holm')
# Use corrected p-values in your paper
```

---

## Reporting Requirements

Reviewers at NLP venues (ACL, EMNLP, NAACL) check for all of these. ML venues (NeurIPS, ICML) increasingly expect them too.

### Mandatory Reporting

```latex
% In your paper's human evaluation section:
\paragraph{Annotators.} We recruited [N] annotators via [platform].
[Describe qualifications or screening.] Annotators were paid
\$[X]/hour, above the [country] minimum wage.

\paragraph{Agreement.} Inter-annotator agreement was [metric] = [value]
(Krippendorff's $\alpha$ = [value]; raw agreement = [value]\%).
[If low: explain why the task is subjective and how you handle disagreements.]

\paragraph{Evaluation Protocol.} Each [item type] was rated by [N]
annotators on a [scale description]. We collected [total] annotations
across [N items]. [Describe randomization and blinding.]
```

### What Goes in the Appendix

```
Appendix: Human Evaluation Details
- Full annotation guidelines (verbatim)
- Screenshot of annotation interface
- Qualification task details and threshold
- Attention check items and failure rates
- Per-annotator agreement breakdown
- Full results table (not just averages)
- Compensation calculation
- IRB approval number (if applicable)
```

---

## IRB and Ethics

### When IRB Approval Is Needed

| Situation | IRB Required? |
|-----------|---------------|
| Crowdworkers rating text quality | **Usually no** (not "human subjects research" at most institutions) |
| User study with real users | **Yes** at most US/EU institutions |
| Collecting personal information | **Yes** |
| Studying annotator behavior/cognition | **Yes** (they become the subject) |
| Using existing annotated data | **Usually no** (secondary data analysis) |

**Check your institution's policy.** The definition of "human subjects research" varies. When in doubt, submit an IRB protocol — the review is often fast for minimal-risk studies.

### Ethics Checklist for Human Evaluation

```
- [ ] Annotators informed about task purpose (not deceptive)
- [ ] Annotators can withdraw at any time without penalty
- [ ] No personally identifiable information collected beyond platform ID
- [ ] Content being evaluated does not expose annotators to harm
  (if it does: content warnings + opt-out + higher compensation)
- [ ] Fair compensation (>= equivalent local minimum wage)
- [ ] Data stored securely, access limited to research team
- [ ] IRB approval obtained if required by institution
```

---

## Common Pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Too few annotators (1-2) | No agreement metric possible | Minimum 3 annotators per item |
| No attention checks | Can't detect low-quality annotations | Include 10-15% attention checks |
| Not reporting compensation | Reviewers flag as ethics concern | Always report hourly rate |
| Using only automated metrics for generation | Reviewers will ask for human eval | Add at least pairwise comparison |
| Not piloting guidelines | Low agreement, wasted budget | Always pilot with 3-5 people first |
| Reporting only averages | Hides annotator disagreement | Report distribution and agreement |
| Not controlling for order/position | Position bias inflates results | Randomize presentation order |
| Conflating annotator agreement with ground truth | High agreement doesn't mean correct | Validate against expert judgments |
