# FestPro Competition Management — Complete Official Documentation

**Module:** Competition Management  
**Version:** 1.0  
**Dependencies:** Authentication (01), Organization (02), Festival (04)  
**Applies To:** Festival Directors, Managers, Admins

---

# Section 1: Introduction

## 1.1 What This Module Is

The Competition Management module defines the individual contests within a festival. A competition is a specific evaluative event — "Kathakali Performance," "Group Song Competition," "Painting Contest" — with defined categories, age groups, judging criteria, and participant entries. It is the unit at which judging, scoring, results, and certificates operate.

## 1.2 Why It Exists

Festivals consist of multiple distinct competitions. Each competition has different rules, different judges, different participants, and different scoring criteria. The Competition module provides the structure to define, manage, and evaluate each competition independently while keeping them organized within categories and age groups.

## 1.3 Business Purpose

| Purpose | Implementation |
|---------|----------------|
| Content organization | Hierarchical categories (e.g., Dance → Kathakali) |
| Participant filtering | Age groups restrict who can register |
| Scoring rules | Per-competition judging method and criteria |
| Schedule management | Individual time slots per competition |
| Capacity control | Max participants per competition |

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Competition List | `/dashboard/festivals/[id]/competitions` | All competitions in a festival |
| Create Competition | `/dashboard/festivals/[id]/competitions/new` | New competition form |
| Competition Detail | `/dashboard/festivals/[id]/competitions/[cid]` | Competition overview, participants, judges |
| Competition Edit | `/dashboard/festivals/[id]/competitions/[cid]/edit` | Edit competition settings |

---

# Section 5: Every Form

## 5.1 Competition Form

| Section | Field | Type | Required | Validation | Default |
|---------|-------|------|----------|------------|---------|
| Basic | Competition Name | text | Yes | 2-200 characters | Empty |
| Basic | Description | textarea | No | Max 2000 characters | Empty |
| Basic | Category | dropdown | Yes | Must exist in festival | Empty |
| Basic | Age Group | dropdown | Yes | Must exist in festival | Empty |
| Basic | Type | dropdown | Yes | Individual, Group, Both | Individual |
| Rules | Duration (minutes) | number | Yes | 1-480 | 10 |
| Rules | Max Participants | number | Yes | 1-10000 | 100 |
| Rules | Allow Online Registration | toggle | Yes | — | true |
| Judging | Judging Method | dropdown | Yes | Points/Rank/PassFail/Hybrid | Points-based |
| Display | Visible on Public Portal | toggle | Yes | — | true |

## 5.2 Judging Criteria Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Criterion Name | text | Yes | 2-100 characters |
| Description | textarea | No | Max 500 characters |
| Max Score | decimal | Yes | 1-1000 |
| Weight (%) | decimal | Yes | Sum must equal 100% |
| Sort Order | number | Yes | Display order |

---

# Section 7: Step-by-Step Guide

## 7.1 Creating a Competition

**Step 1:** Navigate to the festival dashboard.

**Step 2:** Click the **Competitions** tab.

**Step 3:** Click **Add Competition**.

**Step 4:** Enter the **Competition Name** (e.g., "Kathakali Performance").

**Step 5:** Select the **Category** from the dropdown (e.g., "Dance").

**Step 6:** Select the **Age Group** (e.g., "Senior: 15-17").

**Step 7:** Choose the **Competition Type**: Individual, Group, or Both.

**Step 8:** Set the **Duration** in minutes (e.g., 10 minutes per performance).

**Step 9:** Set the **Max Participants** limit.

**Step 10:** Choose the **Judging Method**: Points-based, Rank-based, Pass/Fail, or Hybrid.

**Step 11:** Add **Judging Criteria** (for points-based). Each criterion needs:
   - Name (e.g., "Technique")
   - Max Score (e.g., 100)
   - Weight (e.g., 30%)
   - Sum of all weights must equal 100%

**Step 12:** Configure additional rules and settings as needed.

**Step 13:** Click **Save Competition**.

**Step 14:** The competition is created in Draft status.

**Step 15:** After adding all competitions, open registration.

## 7.2 Assigning Judges

**Step 1:** Navigate to Competition → Judges tab.

**Step 2:** Click **Assign Judge**.

**Step 3:** Select the judge from the user list.

**Step 4:** Select which competitions to assign.

**Step 5:** Choose access level: Full or Limited (split).

**Step 6:** Click **Assign**.

**Step 7:** Judge receives notification of the assignment.

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| COMP-001 | Competition must belong to a festival | FK constraint |
| COMP-002 | Competition name must be unique within a festival | Application validation |
| COMP-003 | Max participants must not exceed festival max | Application validation |
| COMP-004 | Judging criteria weights must sum to 100% | Application validation |
| COMP-005 | Competition cannot be deleted if participants are registered | Application check |
| COMP-006 | Scoring method cannot be changed after first score entered | Application lock |
| COMP-007 | Judges can only be assigned from the same organization | RLS + app check |
| COMP-008 | One judge cannot be assigned to overlapping competitions | Application check |
| COMP-009 | Age group must be compatible with participant age | Registration validation |
| COMP-010 | Competition status follows: Draft → Published → Registration → Active → Results → Completed |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Festival Director | Manager | Staff |
|-----------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:-----:|
| Create competition | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit competition | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete competition | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign judges | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View competition | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enter scores | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Publish results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

# Section 28: Best Practices

1. **Create categories before competitions** — competitions require an existing category.
2. **Define age groups at the festival level first** — competitions reference age groups.
3. **Set judging criteria carefully** — they cannot be changed after scoring begins.
4. **Use consistent scoring methods** within a category for fair comparison.
5. **Set realistic max participants** based on venue capacity and time available.
6. **Name competitions clearly** — participants should understand what they are registering for.
7. **Add descriptions** — explain rules, requirements, and expectations for each competition.
8. **Configure judging criteria with appropriate weights** — the most important criteria should have highest weights.
9. **Test the scoring interface** before the event — verify criteria display correctly for judges.
10. **Assign judges early** — give them time to review criteria before the event.

---

*End of Competition Management Module Documentation*
