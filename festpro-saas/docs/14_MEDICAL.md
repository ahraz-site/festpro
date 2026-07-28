# FestPro Medical Module — Complete Official Documentation

**Module:** Medical  
**Version:** 1.0  
**Dependencies:** Registration (06)  
**Applies To:** Medical Staff, Managers

---

# Section 1: Introduction

The Medical module provides first-aid tracking, incident reporting, and medical emergency management during festivals. It links incidents to participants, tracks treatments administered, and maintains emergency contact information.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Medical Dashboard | `/dashboard/festivals/[id]/medical` | Active cases, incidents overview |
| Incident Reports | `/dashboard/festivals/[id]/medical/incidents` | All medical incidents |
| New Incident | `/dashboard/festivals/[id]/medical/incidents/new` | Report an incident |

---

# Section 5: Every Form

## 5.1 Medical Incident Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Participant | auto-lookup | Yes | Affected participant |
| Incident Type | dropdown | Yes | Injury, Illness, Allergic Reaction, Heat Stroke, Other |
| Severity | dropdown | Yes | Minor, Moderate, Severe, Critical |
| Description | textarea | Yes | What happened |
| Location | dropdown | Yes | Where incident occurred |
| Date & Time | datetime | Yes | When incident occurred |
| Treatment Given | textarea | Yes | First aid administered |
| Referred To | dropdown | No | Hospital, Doctor, Pharmacy |
| Medication Given | textarea | No | Medicine name, dosage |

---

# Section 7: Step-by-Step Guide

**Step 1:** Navigate to Medical → New Incident.

**Step 2:** Search and select the affected participant.

**Step 3:** Select incident type and severity.

**Step 4:** Describe what happened.

**Step 5:** Note the treatment administered.

**Step 6:** If referred externally, note the referral details.

**Step 7:** Click **Save Incident**.

**Step 8:** The incident appears in the active cases dashboard.

**Step 9:** Update the case as needed (e.g., when participant is discharged).

---

*End of Medical Module Documentation*
