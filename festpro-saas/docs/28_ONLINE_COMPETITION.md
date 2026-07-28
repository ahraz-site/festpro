# FestPro Online Competition Platform — Complete Official Documentation

**Module:** 28 — Online Competition Platform  
**Version:** 1.0  
**Applies To:** Participants, Judges, Coordinators

---

# Section 1: Introduction

The Online Competition Platform enables remote participation in competitions through digital submissions. Participants upload videos, documents, or images; judges evaluate remotely with time-stamped scoring; results are published online. Supports both live (scheduled video call) and recorded (upload-based) formats.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Digital Submission | Upload video/audio/document for evaluation |
| Submission Deadlines | Auto-close submissions at configured time |
| Remote Judging | Judges access submissions and score remotely |
| Time-Stamped Review | Judge review duration tracked |
| Plagiarism Check | Basic duplicate submission detection |
| Live Sessions | Scheduled video conference integration (Jitsi/Zoom) |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| My Submissions | `/dashboard/participant/submissions` | Participant's submissions |
| Submit Entry | `/dashboard/participant/submissions/new` | Upload competition entry |
| Judging Queue | `/dashboard/judge/submissions` | Pending evaluations |
| Evaluate | `/dashboard/judge/submissions/[id]` | Score and comment |
| Results | `/dashboard/festivals/[id]/online/results` | Published results |

---

# Section 3: Every Form

## Submission Form

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Competition | dropdown | Yes | Must be online-enabled | Select competition |
| Submission Type | dropdown | Yes | Video, Audio, Document, Image | Entry format |
| File Upload | file | Yes | Max 200MB per file | Upload entry |
| Description | textarea | No | Max 500 chars | Optional description |
| Additional Links | url | No | YouTube, SoundCloud, etc. | External hosting links |
| Declare Original Work | checkbox | Yes | Must be checked | Originality declaration |

---

# Section 4: Business Rules

| Rule ID | Rule |
|---------|------|
| ONLINE-001 | Submissions close automatically at the competition deadline |
| ONLINE-002 | Max file size: 200MB per submission |
| ONLINE-003 | Supported video formats: MP4, WEBM, MOV |
| ONLINE-004 | Judges see submissions only after deadline passes |
| ONLINE-005 | Participants can withdraw submission before deadline |
| ONLINE-006 | Late submissions are not accepted (system-enforced) |
| ONLINE-007 | Each judge evaluates all submissions in assigned competition |

---

*End of Online Competition Module Documentation (Module 28)*
