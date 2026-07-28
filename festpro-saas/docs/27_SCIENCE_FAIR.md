# FestPro Science Fair Management — Complete Official Documentation

**Module:** 27 — Science Fair Management  
**Version:** 1.0  
**Applies To:** Science Fair Coordinators, Judges, Participants

---

# Section 1: Introduction

The Science Fair Management module handles project-based evaluations common in science fairs, exhibitions, and innovation competitions. Participants submit projects with abstracts, documents, and media; judges evaluate against rubric criteria; results are published with project details and judge feedback.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Project Submission | Abstract, methodology, results, documents, media uploads |
| Category Management | Scientific disciplines (Physics, Chemistry, Biology, CS, etc.) |
| Rubric Evaluation | Custom criteria with weighted scoring per category |
| Judge Assignment | Judge rotation across projects for fair evaluation |
| Feedback System | Judge comments visible to participants after results |
| Project Display | Public gallery of projects (opt-in) |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Projects | `/dashboard/festivals/[id]/science-fair/projects` | All submitted projects |
| Project Detail | `/dashboard/festivals/[id]/science-fair/projects/[id]` | Full project with media |
| Evaluation | `/dashboard/festivals/[id]/science-fair/evaluation` | Judge scoring interface |
| Rubrics | `/dashboard/festivals/[id]/science-fair/rubrics` | Criteria management |
| Categories | `/dashboard/festivals/[id]/science-fair/categories` | Science categories |

---

# Section 3: Every Form

## Project Submission Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Project Title | text | Yes | 5-200 chars |
| Category | dropdown | Yes | Scientific discipline |
| Abstract | textarea | Yes | 100-500 word summary |
| Methodology | textarea | Yes | Approach description |
| Results | textarea | Yes | Findings and outcomes |
| Conclusion | textarea | Yes | Key takeaways |
| Documents | file | No | PDF/DOCX, max 10MB each |
| Images | file | No | PNG/JPG, max 5MB each |
| Video Link | url | No | YouTube/Vimeo link |
| Team Members | dynamic | No | Collaborator names |
| Mentor/Guide | text | No | Teacher or supervisor name |

## Rubric Criteria Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Criterion Name | text | Yes | e.g., "Scientific Method" |
| Description | textarea | Yes | What judges should evaluate |
| Max Score | number | Yes | 1-100 |
| Weight % | number | Yes | Percentage of total score |
| Category | dropdown | Yes | Which category this applies to |

---

# Section 4: Business Rules

| Rule ID | Rule |
|---------|------|
| SCI-001 | Each project is evaluated by at least 2 judges (configurable) |
| SCI-002 | Final score = weighted average of all judge scores |
| SCI-003 | Judges cannot evaluate projects from their own institution |
| SCI-004 | Participant feedback is visible only after results are published |
| SCI-005 | Project documents are scanned for malware on upload |
| SCI-006 | Maximum 5 team members per project |

---

*End of Science Fair Module Documentation (Module 27)*
