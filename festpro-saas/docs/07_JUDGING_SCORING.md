# FestPro Judging & Scoring — Complete Official Documentation

**Module:** Judging & Scoring  
**Version:** 1.0  
**Dependencies:** Competition (05), Registration (06)  
**Applies To:** Judges, Festival Directors, Admins

---

# Section 1: Introduction

## 1.1 What This Module Is

The Judging & Scoring module enables designated judges to evaluate participants in their assigned competitions. It supports multiple scoring methodologies (points-based, rank-based, pass/fail, hybrid), configurable rubrics, real-time leaderboards, anonymous evaluation modes, and multi-judge aggregation.

## 1.2 Business Purpose

| Purpose | Implementation |
|---------|----------------|
| Standardized evaluation | Configurable scoring criteria with weightages |
| Fair assessment | Anonymous mode, multi-judge aggregation |
| Real-time tracking | Live leaderboard during competition |
| Transparency | Criterion-wise score breakdown for participants |
| Flexibility | Multiple scoring methods for different competition types |

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Judge Dashboard | `/dashboard/judge` | Assigned competitions, pending scores |
| Scoring Screen | `/dashboard/judge/competitions/[id]` | Score entry for participants |
| Leaderboard | `/dashboard/festivals/[id]/competitions/[cid]/leaderboard` | Live rankings |

---

# Section 5: Every Form

## 5.1 Scoring Form

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| Criteria 1 Score | number (slider) | Yes | 0 to [max_score] for this criterion | 0 |
| Criteria 2 Score | number (slider) | Yes | 0 to [max_score] for this criterion | 0 |
| Criteria N Score | number (slider) | Yes | 0 to [max_score] for this criterion | 0 |
| Total Score | auto-calculated | — | — | Sum of weighted criteria |
| Remarks | textarea | No | Max 500 characters | Empty |

## 5.2 Scoring Methods

| Method | Description | Output | Use Case |
|--------|-------------|--------|----------|
| Points-based | Weighted criteria with max scores | Percentage (0-100) | Dance, Music, Drama |
| Rank-based | Judge assigns ordinal rank | Rank (1st, 2nd, 3rd...) | Sports, Debates |
| Pass/Fail | Binary with passing threshold | Pass/Fail | Qualifying rounds |
| Hybrid | Combination across rounds | Mixed | Multi-round events |

---

# Section 7: Step-by-Step Guide

## 7.1 Judge Scoring Flow

**Step 1:** Log in to FestPro. The judge dashboard shows assigned competitions.

**Step 2:** Click on a competition to open the scoring screen.

**Step 3:** The participant queue displays all participants in performance order.

**Step 4:** Click a participant to open the scoring form.

**Step 5:** Enter scores for each criterion using the slider or number inputs.

**Step 6:** The **Total Score** auto-calculates based on weights.

**Step 7:** Optionally enter **Remarks** about the performance.

**Step 8:** Click **Submit Score** to save permanently.

**Step 9:** The system moves to the next participant automatically.

**Step 10:** Scores can be edited until the competition is finalized.

## 7.2 Finalizing Scores (Admin/Director)

**Step 1:** Navigate to Competition → Results tab.

**Step 2:** Review the aggregated scores from all judges.

**Step 3:** Verify tie-breakers are applied correctly.

**Step 4:** Click **Finalize Scores** to lock all entries.

**Step 5:** Once finalized, judges can no longer edit scores.

**Step 6:** Proceed to publish results.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| JUDGE-001 | A judge can only view and score assigned competitions |
| JUDGE-002 | A judge cannot see other judges' scores (unless anonymous mode disabled) |
| JUDGE-003 | Scores must be within 0 and the defined max for each criterion |
| JUDGE-004 | All criteria must be scored before submission |
| JUDGE-005 | Scores can be edited until the competition is finalized |
| JUDGE-006 | At least one judge must have submitted scores to finalize |
| JUDGE-007 | Final aggregate uses configured method (average, trimmed, median, sum) |
| JUDGE-008 | Tie-breaking follows configured priority rules |
| JUDGE-009 | Anonymous mode replaces participant names with codes |
| JUDGE-010 | Judge status progresses: Pending → Accepted → Active → Completed |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Festival Director | Manager | Judge |
|-----------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:-----:|
| View scoring screen | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* |
| Enter scores | ❌ | ❌ | ❌ | ❌ | ❌ | ✅* |
| View other judges' scores | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Finalize scores | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Override scores | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

*Judge can only view/score assigned competitions.

---

# Section 34: Troubleshooting

## P1: Judge cannot see competition
**Problem:** Competition not in judge dashboard.
**Reasons:** Not assigned, or competition not yet in scoring phase.
**Solution:** Verify judge assignment in Competition → Judges. Check competition status.

## P2: Score not saving
**Problem:** Submit button does nothing or returns error.
**Reasons:** Score out of range, criteria not filled, network issue.
**Solution:** Verify all criteria are scored within allowed range. Check internet connection.

## P3: Total score appears wrong
**Problem:** Calculated total does not match expected.
**Reasons:** Weight calculation error in configuration.
**Solution:** Verify weights sum to 100%. Check individual criterion max scores.

## P4: Cannot finalize scores
**Problem:** "Finalize" button disabled.
**Reasons:** Not all judges have submitted, or minimum judge count not met.
**Solution:** Wait for all judges to complete scoring. Check minimum judge requirement.

---

*End of Judging & Scoring Module Documentation*
