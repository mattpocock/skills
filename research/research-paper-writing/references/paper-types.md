# Paper Types Beyond Empirical ML

Guide for writing non-standard paper types: theory papers, survey/tutorial papers, benchmark/dataset papers, and position papers. Each type has distinct structure, evidence standards, and venue expectations.

---

## Contents

- [Theory Papers](#theory-papers)
- [Survey and Tutorial Papers](#survey-and-tutorial-papers)
- [Benchmark and Dataset Papers](#benchmark-and-dataset-papers)
- [Position Papers](#position-papers)
- [Reproducibility and Replication Papers](#reproducibility-and-replication-papers)

---

## Theory Papers

### When to Write a Theory Paper

Your paper should be a theory paper if:
- The main contribution is a theorem, bound, impossibility result, or formal characterization
- Experiments are supplementary validation, not the core evidence
- The contribution advances understanding rather than achieving state-of-the-art numbers

### Structure

```
1. Introduction (1-1.5 pages)
   - Problem statement and motivation
   - Informal statement of main results
   - Comparison to prior theoretical work
   - Contribution bullets (state theorems informally)

2. Preliminaries (0.5-1 page)
   - Notation table
   - Formal definitions
   - Assumptions (numbered, referenced later)
   - Known results you build on

3. Main Results (2-3 pages)
   - Theorem statements (formal)
   - Proof sketches (intuition + key steps)
   - Corollaries and special cases
   - Discussion of tightness / optimality

4. Experimental Validation (1-2 pages, optional but recommended)
   - Do theoretical predictions match empirical behavior?
   - Synthetic experiments that isolate the phenomenon
   - Comparison to bounds from prior work

5. Related Work (1 page)
   - Theoretical predecessors
   - Empirical work your theory explains

6. Discussion & Open Problems (0.5 page)
   - Limitations of your results
   - Conjectures suggested by your analysis
   - Concrete open problems

Appendix:
   - Full proofs
   - Technical lemmas
   - Extended experimental details
```

### Writing Theorems

**Template for a well-stated theorem:**

```latex
\begin{assumption}[Bounded Gradients]\label{assum:bounded-grad}
There exists $G > 0$ such that $\|\nabla f(x)\| \leq G$ for all $x \in \mathcal{X}$.
\end{assumption}

\begin{theorem}[Convergence Rate]\label{thm:convergence}
Under Assumptions~\ref{assum:bounded-grad} and~\ref{assum:smoothness},
Algorithm~\ref{alg:method} with step size $\eta = \frac{1}{\sqrt{T}}$ satisfies
\[
\frac{1}{T}\sum_{t=1}^{T} \mathbb{E}\left[\|\nabla f(x_t)\|^2\right]
\leq \frac{2(f(x_1) - f^*)}{\sqrt{T}} + \frac{G^2}{\sqrt{T}}.
\]
In particular, after $T = O(1/\epsilon^2)$ iterations, we obtain an
$\epsilon$-stationary point.
\end{theorem}
```

**Rules for theorem statements:**
- State all assumptions explicitly (numbered, with names)
- Include the formal bound, not just "converges at rate O(·)"
- Add a plain-language corollary: "In particular, this means..."
- Compare to known bounds: "This improves over [prior work]'s bound of O(·) by a factor of..."

### Proof Sketches

The proof sketch is the most important part of the main text for a theory paper. Reviewers evaluate whether you have genuine insight or just mechanical derivation.

**Good proof sketch pattern:**

```latex
\begin{proof}[Proof Sketch of Theorem~\ref{thm:convergence}]
The key insight is that [one sentence describing the main idea].

The proof proceeds in three steps:
\begin{enumerate}
\item \textbf{Decomposition.} We decompose the error into [term A]
  and [term B] using [technique]. This reduces the problem to
  bounding each term separately.

\item \textbf{Bounding [term A].} By [assumption/lemma], [term A]
  is bounded by $O(\cdot)$. The critical observation is that
  [specific insight that makes this non-trivial].

\item \textbf{Combining.} Choosing $\eta = 1/\sqrt{T}$ balances
  the two terms, yielding the stated bound.
\end{enumerate}

The full proof, including the technical lemma for Step 2,
appears in Appendix~\ref{app:proofs}.
\end{proof}
```

**Bad proof sketch**: Restating the theorem with slightly different notation, or just saying "the proof follows standard techniques."

### Full Proofs in Appendix

```latex
\appendix
\section{Proofs}\label{app:proofs}

\subsection{Proof of Theorem~\ref{thm:convergence}}

We first establish two technical lemmas.

\begin{lemma}[Descent Lemma]\label{lem:descent}
Under Assumption~\ref{assum:smoothness}, for any step size $\eta \leq 1/L$:
\[
f(x_{t+1}) \leq f(x_t) - \frac{\eta}{2}\|\nabla f(x_t)\|^2 + \frac{\eta^2 L}{2}\|\nabla f(x_t)\|^2.
\]
\end{lemma}

\begin{proof}
[Complete proof with all steps]
\end{proof}

% Continue with remaining lemmas and main theorem proof
```

### Common Theory Paper Pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Assumptions too strong | Trivializes the result | Discuss which assumptions are necessary; prove lower bounds |
| No comparison to existing bounds | Reviewers can't assess contribution | Add a comparison table of bounds |
| Proof sketch is just the full proof shortened | Doesn't convey insight | Focus on the 1-2 key ideas; defer mechanics to appendix |
| No experimental validation | Reviewers question practical relevance | Add synthetic experiments testing predictions |
| Notation inconsistency | Confuses reviewers | Create a notation table in Preliminaries |
| Overly complex proofs where simple ones exist | Reviewers suspect error | Prefer clarity over generality |

### Venues for Theory Papers

| Venue | Theory Acceptance Rate | Notes |
|-------|----------------------|-------|
| **NeurIPS** | Moderate | Values theory with practical implications |
| **ICML** | High | Strong theory track |
| **ICLR** | Moderate | Prefers theory with empirical validation |
| **COLT** | High | Theory-focused venue |
| **ALT** | High | Algorithmic learning theory |
| **STOC/FOCS** | For TCS-flavored results | If contribution is primarily combinatorial/algorithmic |
| **JMLR** | High | No page limit; good for long proofs |

---

## Survey and Tutorial Papers

### When to Write a Survey

- A subfield has matured enough that synthesis is valuable
- You've identified connections between works that individual papers don't make
- Newcomers to the area have no good entry point
- The landscape has changed significantly since the last survey

**Warning**: Surveys require genuine expertise. A survey by someone outside the field, however comprehensive, will miss nuances and mischaracterize work.

### Structure

```
1. Introduction (1-2 pages)
   - Scope definition (what's included and excluded, and why)
   - Motivation for the survey now
   - Overview of organization (often with a figure)

2. Background / Problem Formulation (1-2 pages)
   - Formal problem definition
   - Notation (used consistently throughout)
   - Historical context

3. Taxonomy (the core contribution)
   - Organize methods along meaningful axes
   - Present taxonomy as a figure or table
   - Each category gets a subsection

4. Detailed Coverage (bulk of paper)
   - For each category: representative methods, key ideas, strengths/weaknesses
   - Comparison tables within and across categories
   - Don't just describe — analyze and compare

5. Experimental Comparison (if applicable)
   - Standardized benchmark comparison
   - Fair hyperparameter tuning for all methods
   - Not always feasible but significantly strengthens the survey

6. Open Problems & Future Directions (1-2 pages)
   - Unsolved problems the field should tackle
   - Promising but underexplored directions
   - This section is what makes a survey a genuine contribution

7. Conclusion
```

### Taxonomy Design

The taxonomy is the core intellectual contribution of a survey. It should:

- **Be meaningful**: Categories should correspond to real methodological differences, not arbitrary groupings
- **Be exhaustive**: Every relevant paper should fit somewhere
- **Be mutually exclusive** (ideally): Each paper belongs to one primary category
- **Have informative names**: "Attention-based methods" > "Category 3"
- **Be visualized**: A figure showing the taxonomy is almost always helpful

**Example taxonomy axes for "LLM Reasoning" survey:**
- By technique: chain-of-thought, tree-of-thought, self-consistency, tool use
- By training requirement: prompting-only, fine-tuned, RLHF
- By reasoning type: mathematical, commonsense, logical, causal

### Writing Standards

- **Cite every relevant paper** — authors will check if their work is included
- **Be fair** — don't dismiss methods you don't prefer
- **Synthesize, don't just list** — identify patterns, trade-offs, open questions
- **Include a comparison table** — even if qualitative (features/properties checklist)
- **Update before submission** — check arXiv for papers published since you started writing

### Venues for Surveys

| Venue | Notes |
|-------|-------|
| **TMLR** (Survey track) | Dedicated survey submissions; no page limit |
| **JMLR** | Long format, well-respected |
| **Foundations and Trends in ML** | Invited, but can be proposed |
| **ACM Computing Surveys** | Broad CS audience |
| **arXiv** (standalone) | No peer review but high visibility if well-done |
| **Conference tutorials** | Present as tutorial at NeurIPS/ICML/ACL; write up as paper |

---

## Benchmark and Dataset Papers

### When to Write a Benchmark Paper

- Existing benchmarks don't measure what you think matters
- A new capability has emerged with no standard evaluation
- Existing benchmarks are saturated (all methods score >95%)
- You want to standardize evaluation in a fragmented subfield

### Structure

```
1. Introduction
   - What evaluation gap does this benchmark fill?
   - Why existing benchmarks are insufficient

2. Task Definition
   - Formal task specification
   - Input/output format
   - Evaluation criteria (what makes a good answer?)

3. Dataset Construction
   - Data source and collection methodology
   - Annotation process (if human-annotated)
   - Quality control measures
   - Dataset statistics (size, distribution, splits)

4. Baseline Evaluation
   - Run strong baselines (don't just report random/majority)
   - Show the benchmark is challenging but not impossible
   - Human performance baseline (if feasible)

5. Analysis
   - Error analysis on baselines
   - What makes items hard/easy?
   - Construct validity: does the benchmark measure what you claim?

6. Intended Use & Limitations
   - What should this benchmark be used for?
   - What should it NOT be used for?
   - Known biases or limitations

7. Datasheet (Appendix)
   - Full datasheet for datasets (Gebru et al.)
```

### Evidence Standards

Reviewers evaluate benchmarks on different criteria than methods papers:

| Criterion | What Reviewers Check |
|-----------|---------------------|
| **Novelty of evaluation** | Does this measure something existing benchmarks don't? |
| **Construct validity** | Does the benchmark actually measure the stated capability? |
| **Difficulty calibration** | Not too easy (saturated) or too hard (random performance) |
| **Annotation quality** | Agreement metrics, annotator qualifications, guidelines |
| **Documentation** | Datasheet, license, maintenance plan |
| **Reproducibility** | Can others use this benchmark easily? |
| **Ethical considerations** | Bias analysis, consent, sensitive content handling |

### Dataset Documentation (Required)

Follow the Datasheets for Datasets framework (Gebru et al., 2021):

```
Datasheet Questions:
1. Motivation
   - Why was this dataset created?
   - Who created it and on behalf of whom?
   - Who funded the creation?

2. Composition
   - What do the instances represent?
   - How many instances are there?
   - Does it contain all possible instances or a sample?
   - Is there a label? If so, how was it determined?
   - Are there recommended data splits?

3. Collection Process
   - How was the data collected?
   - Who was involved in collection?
   - Over what timeframe?
   - Was ethical review conducted?

4. Preprocessing
   - What preprocessing was done?
   - Was the "raw" data saved?

5. Uses
   - What tasks has this been used for?
   - What should it NOT be used for?
   - Are there other tasks it could be used for?

6. Distribution
   - How is it distributed?
   - Under what license?
   - Are there any restrictions?

7. Maintenance
   - Who maintains it?
   - How can users contact the maintainer?
   - Will it be updated? How?
   - Is there an erratum?
```

### Venues for Benchmark Papers

| Venue | Notes |
|-------|-------|
| **NeurIPS Datasets & Benchmarks** | Dedicated track; best venue for this |
| **ACL** (Resource papers) | NLP-focused datasets |
| **LREC-COLING** | Language resources |
| **TMLR** | Good for benchmarks with analysis |

---

## Position Papers

### When to Write a Position Paper

- You have an argument about how the field should develop
- You want to challenge a widely-held assumption
- You want to propose a research agenda based on analysis
- You've identified a systematic problem in current methodology

### Structure

```
1. Introduction
   - State your thesis clearly in the first paragraph
   - Why this matters now

2. Background
   - Current state of the field
   - Prevailing assumptions you're challenging

3. Argument
   - Present your thesis with supporting evidence
   - Evidence can be: empirical data, theoretical analysis, logical argument,
     case studies, historical precedent
   - Be rigorous — this isn't an opinion piece

4. Counterarguments
   - Engage seriously with the strongest objections
   - Explain why they don't undermine your thesis
   - Concede where appropriate — it strengthens credibility

5. Implications
   - What should the field do differently?
   - Concrete research directions your thesis suggests
   - How should evaluation/methodology change?

6. Conclusion
   - Restate thesis
   - Call to action
```

### Writing Standards

- **Lead with the strongest version of your argument** — don't hedge in the first paragraph
- **Engage with counterarguments honestly** — the best position papers address the strongest objections, not the weakest
- **Provide evidence** — a position paper without evidence is an editorial
- **Be concrete** — "the field should do X" is better than "more work is needed"
- **Don't straw-man existing work** — characterize opposing positions fairly

### Venues for Position Papers

| Venue | Notes |
|-------|-------|
| **ICML** (Position track) | Dedicated track for position papers |
| **NeurIPS** (Workshop papers) | Workshops often welcome position pieces |
| **ACL** (Theme papers) | When your position aligns with the conference theme |
| **TMLR** | Accepts well-argued position papers |
| **CACM** | For broader CS audience |

---

## Reproducibility and Replication Papers

### When to Write a Reproducibility Paper

- You attempted to reproduce a published result and succeeded/failed
- You want to verify claims under different conditions
- You've identified that a popular method's performance depends on unreported details

### Structure

```
1. Introduction
   - What paper/result are you reproducing?
   - Why is this reproduction valuable?

2. Original Claims
   - State the exact claims from the original paper
   - What evidence was provided?

3. Methodology
   - Your reproduction approach
   - Differences from original (if any) and why
   - What information was missing from the original paper?

4. Results
   - Side-by-side comparison with original results
   - Statistical comparison (confidence intervals overlap?)
   - What reproduced and what didn't?

5. Analysis
   - If results differ: why? What's sensitive?
   - Hidden hyperparameters or implementation details?
   - Robustness to seed, hardware, library versions?

6. Recommendations
   - For original authors: what should be clarified?
   - For practitioners: what to watch out for?
   - For the field: what reproducibility lessons emerge?
```

### Venues

| Venue | Notes |
|-------|-------|
| **ML Reproducibility Challenge** | Annual challenge at NeurIPS |
| **ReScience** | Journal dedicated to replications |
| **TMLR** | Accepts reproductions with analysis |
| **Workshops** | Reproducibility workshops at major conferences |
