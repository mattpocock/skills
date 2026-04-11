# Dogfood QA Report

**Target:** {target_url}
**Date:** {date}
**Scope:** {scope_description}
**Tester:** Hermes Agent (automated exploratory QA)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | {critical_count} |
| 🟠 High | {high_count} |
| 🟡 Medium | {medium_count} |
| 🔵 Low | {low_count} |
| **Total** | **{total_count}** |

**Overall Assessment:** {one_sentence_assessment}

---

## Issues

<!-- Repeat this section for each issue found, sorted by severity (Critical first) -->

### Issue #{issue_number}: {issue_title}

| Field | Value |
|-------|-------|
| **Severity** | {severity} |
| **Category** | {category} |
| **URL** | {url_where_found} |

**Description:**
{detailed_description_of_the_issue}

**Steps to Reproduce:**
1. {step_1}
2. {step_2}
3. {step_3}

**Expected Behavior:**
{what_should_happen}

**Actual Behavior:**
{what_actually_happens}

**Screenshot:**
MEDIA:{screenshot_path}

**Console Errors** (if applicable):
```
{console_error_output}
```

---

<!-- End of per-issue section -->

## Issues Summary Table

| # | Title | Severity | Category | URL |
|---|-------|----------|----------|-----|
| {n} | {title} | {severity} | {category} | {url} |

## Testing Coverage

### Pages Tested
- {list_of_pages_visited}

### Features Tested
- {list_of_features_exercised}

### Not Tested / Out of Scope
- {areas_not_covered_and_why}

### Blockers
- {any_issues_that_prevented_testing_certain_areas}

---

## Notes

{any_additional_observations_or_recommendations}
