# Ranking & Grading Methodology

**Research Date:** April 9, 2026
**Author:** Claude Code Research Agent

---

## Overview

This document describes the mathematical ranking system used to evaluate and rank plugins, extensions, and problems across three research areas. The system combines two well-established operations research techniques:

1. **Modified TOPSIS** (Technique for Order of Preference by Similarity to Ideal Solution) - Hwang & Yoon, 1981
2. **Bayesian Average Smoothing** - Used by IMDb, JetBrains Marketplace, and others

These methods were chosen because they handle the specific challenge the user identified: **a brand-new plugin with explosive growth may deserve a higher rank than an older plugin with more total downloads but stagnant adoption.**

---

## Part A: Plugin/Extension Ranking (Sections 02 and 03)

### Criteria and Weights

| # | Criterion | Weight | What It Measures | Why It Matters |
|---|-----------|--------|------------------|----------------|
| C1 | **Adoption Scale** | 0.25 | Total installs, downloads, GitHub stars | Raw popularity and proven value |
| C2 | **Growth Momentum** | 0.20 | Rate of adoption increase, recency of creation | Captures rising stars vs stagnant tools |
| C3 | **Quality Signal** | 0.20 | User ratings (Bayesian smoothed), review sentiment | User satisfaction, not just downloads |
| C4 | **Functionality Breadth** | 0.15 | Range of capabilities, problem space covered | How much value it delivers |
| C5 | **Maintenance Health** | 0.10 | Update frequency, last update recency, issue responsiveness | Long-term reliability signal |
| C6 | **Community Impact** | 0.10 | Article mentions, expert endorsements, notable users | External validation and influence |

### Step 1: Bayesian Rating Smoothing

Raw ratings are unreliable when review counts vary wildly (e.g., 5.0 stars from 3 reviews vs 4.0 stars from 1,457 reviews). We apply the Bayesian Average formula:

```
Bayesian_Rating = (v / (v + m)) * R + (m / (v + m)) * C
```

Where:
- `v` = number of ratings for this item
- `m` = median number of ratings across all candidates (smoothing constant)
- `R` = item's raw average rating
- `C` = global mean rating across all candidates

**Effect:** Items with few ratings are pulled toward the global mean. Items with many ratings reflect their true score. This prevents a 5-star plugin with 3 reviews from outranking a 4.5-star plugin with 500 reviews.

### Step 2: Vector Normalization (TOPSIS Standard)

For each criterion j, normalize all candidate scores:

```
r_ij = x_ij / sqrt(sum(x_ij^2) for all i)
```

This maps all criteria to a common 0-1 scale regardless of original units (installs vs stars vs rating).

### Step 3: Weighted Normalized Matrix

```
v_ij = w_j * r_ij
```

Where `w_j` is the weight from the table above.

### Step 4: Ideal and Anti-Ideal Solutions

- **Positive Ideal (A+):** Best value for each criterion across all candidates
- **Negative Ideal (A-):** Worst value for each criterion across all candidates

### Step 5: Separation Distances (Euclidean)

```
S_i+ = sqrt(sum((v_ij - A_j+)^2))   # Distance from ideal
S_i- = sqrt(sum((v_ij - A_j-)^2))    # Distance from anti-ideal
```

### Step 6: Closeness Coefficient

```
CC_i = S_i- / (S_i+ + S_i-)
```

Range: 0 to 1. Higher = better. **This is the final ranking score.**

### Growth Momentum Scoring

To capture the "rising star" effect, Growth Momentum (C2) uses a composite of:

1. **Installs-per-month since launch** (normalized by age)
2. **Recency bonus:** `recency = 1 / (1 + months_since_last_update)`
3. **Star velocity:** GitHub stars per month (where available)

This means a 3-month-old plugin with 100K installs scores higher on momentum than a 12-month-old plugin with 200K installs.

---

## Part B: Problem Ranking (Section 01)

### Criteria and Weights

| # | Criterion | Weight | What It Measures |
|---|-----------|--------|------------------|
| P1 | **Impact Severity** | 0.30 | Workflow disruption magnitude, cost impact, measurable degradation |
| P2 | **Prevalence** | 0.25 | GitHub upvotes, issue count, media coverage breadth |
| P3 | **Frequency** | 0.20 | How often users encounter the problem per session/week |
| P4 | **Persistence** | 0.15 | Duration the problem has existed without official fix |
| P5 | **Solution Maturity** | 0.10 | Inverse -- fewer reliable workarounds = more severe problem |

The same TOPSIS process (Steps 2-6) is applied to rank problems.

---

## Why TOPSIS + Bayesian?

| Requirement | How It's Addressed |
|---|---|
| "Best plugin might be brand new" | Growth Momentum (20% weight) rewards velocity over raw totals |
| "Not just most stars" | Six criteria prevent any single metric from dominating |
| "Actual results" | TOPSIS is peer-reviewed (4,000+ citations) and used in engineering, healthcare, and software selection |
| "Rapidly evolving" | Recency bonus in maintenance and momentum criteria favor active projects |
| Fair to small plugins with great ratings | Bayesian smoothing prevents rating manipulation from low sample sizes |

---

## Sources for Methodology

- Hwang, C.L.; Yoon, K. (1981). *Multiple Attribute Decision Making: Methods and Applications*. Springer-Verlag.
- [TOPSIS - Wikipedia](https://en.wikipedia.org/wiki/TOPSIS)
- [Bayesian Average Ratings - Evan Miller](https://www.evanmiller.org/bayesian-average-ratings.html)
- [JetBrains Marketplace Plugin Rating Formula](https://plugins.jetbrains.com/docs/marketplace/plugins-rating.html)
- [Algolia - Bayesian Averages in Custom Ranking](https://www.algolia.com/doc/guides/managing-results/must-do/custom-ranking/how-to/bayesian-average)
- [GeeksforGeeks - TOPSIS Method for MCDM](https://www.geeksforgeeks.org/topsis-method-for-multiple-criteria-decision-making-mcdm/)
