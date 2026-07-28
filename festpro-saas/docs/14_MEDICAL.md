# FestPro Medical Module — Complete Official Documentation

**Module:** 14 — Medical & First Aid  
**Version:** 2.0  
**Dependencies:** Registration (06), Festival (04)  
**Applies To:** Medical Staff, First Aid Volunteers, Managers

---

# Section 1: Introduction

The Medical module manages all health-related incidents during a festival. It provides first-aid tracking, incident reporting, treatment administration, referral management, and emergency escalation. Every medical event is logged with timestamps, severity levels, and treatment details to ensure participant safety and regulatory compliance.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Incident Reporting | Log injuries, illnesses, allergic reactions with severity classification |
| Treatment Tracking | Record first aid administered, medications given, follow-up required |
| Referral Management | Track external referrals to hospitals, clinics, or doctors |
| Emergency Contacts | Quick access to participant emergency contact information |
| Medical History | View participant's pre-existing conditions (from registration) |
| Severity Escalation | Auto-notify managers for Severe/Critical incidents |
| Analytics Dashboard | Incident frequency, common injury types, response times |
| Medication Log | Track medicine inventory and usage during the festival |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Festival Created | Festival must be in Active state |
| Medical Team | At least one Medical Staff role assigned |
| First Aid Stations | Locations marked in the system |
| Participant Data | Participants must have emergency contact info from registration |

## Configuration Checklist

- [ ] Configure incident categories (Injury, Illness, Allergic Reaction, etc.)
- [ ] Set up severity levels and escalation rules
- [ ] Define first aid station locations
- [ ] Create medication inventory list (optional)
- [ ] Assign Medical Staff role to team members
- [ ] Set up auto-notification for Severe+ incidents
- [ ] Link emergency contact numbers (local hospitals, ambulance)

---

# Section 3: Navigation

## Page Map

| Page | URL | Purpose |
|------|-----|---------|
| **Medical Dashboard** | `/dashboard/festivals/[id]/medical` | Active cases, incident statistics, quick actions |
| **All Incidents** | `/dashboard/festivals/[id]/medical/incidents` | Complete incident log with filters |
| **New Incident** | `/dashboard/festivals/[id]/medical/incidents/new` | Report a medical incident |
| **Incident Detail** | `/dashboard/festivals/[id]/medical/incidents/[id]` | Full incident record with treatment history |
| **Medication Inventory** | `/dashboard/festivals/[id]/medical/medications` | Medicine stock management |
| **Emergency Contacts** | `/dashboard/festivals/[id]/medical/emergency` | Quick dial emergency numbers |
| **Reports** | `/dashboard/festivals/[id]/medical/reports` | Incident analytics and export |
| **Settings** | `/dashboard/festivals/[id]/medical/settings` | Categories, severity levels, escalation |

---

# Section 4: Screen Overview

## 4.1 Medical Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  MEDICAL DASHBOARD                          [New Incident]  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Today's  │ │ Active   │ │ Referred │ │ Critical │       │
│ │ Incidents│ │ Cases    │ │ to Hosp. │ │ Cases    │       │
│ │ 5        │ │ 3        │ │ 1        │ │ 0        │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Active Cases                                       ││
│ │ ┌────────┬────────┬──────┬────────┬────────┬─────────┐ ││
│ │ │ Time   │Particip.│ Type │ Sever. │ Treat. │ Status  │ ││
│ │ │ 10:30  │ Aarav S│ Injur│ Moderate│Bandaged│Active   │ ││
│ │ │ 11:15  │ Neha K │ Head │ Mild   │Ice pack│Active   │ ││
│ │ │ 12:00  │ Rahul M│ Aller│ Severe │Antihist│Referred │ ││
│ │ └────────┴────────┴──────┴────────┴────────┴─────────┘ ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Incidents by Type                        [View All ►]   ││
│ │ ████████████ Injury (60%)                                ││
│ │ ██████ Headache / Illness (30%)                          ││
│ │ ██ Allergic Reaction (10%)                               ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Medical Incident Form

**Location:** Medical → New Incident

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Participant | `autocomplete` | Yes | Must be registered for this festival | Affected participant |
| Incident Type | `dropdown` | Yes | Injury, Illness, Allergic Reaction, Heat Stroke, Dehydration, Headache, Fainting, Bite/Sting, Burn, Respiratory, Other | Category of incident |
| Severity | `dropdown` | Yes | Mild, Moderate, Severe, Critical | Severity level |
| Incident Date & Time | `datetime` | Yes | Cannot be future | When it happened |
| Location | `dropdown` | Yes | From venue/stage locations | Where it happened |
| Description of Incident | `textarea` | Yes | Max 1000 chars | What happened — detailed narrative |
| Symptoms | `textarea` | No | Max 500 chars | Observed symptoms |
| Pre-existing Condition | `text` | Auto | Pulled from registration (if any) | Known medical conditions |
| Allergies | `text` | Auto | Pulled from registration (if any) | Known allergies |
| Treatment Given | `textarea` | Yes | Max 1000 chars | First aid or medical treatment administered |
| Medication Given | `textarea` | No | Max 500 chars | Medicine name, dosage, route |
| Equipment Used | `multi-select` | No | Bandage, Ice Pack, Stretcher, Wheelchair, Oxygen, AED, Splint | First aid equipment used |
| Treated By | `autocomplete` | Yes | Must be Medical Staff+ | Who administered treatment |
| Referred To | `dropdown` | No | Hospital, Clinic, Doctor, Pharmacy | External referral |
| Referral Details | `textarea` | Conditional | Required if referred | Hospital name, doctor, address |
| Transport Used | `dropdown` | Conditional | Ambulance, Private Vehicle, None | If referred externally |
| Follow-up Required | `toggle` | No | — | Does participant need follow-up |
| Follow-up Notes | `textarea` | Conditional | Required if follow-up | When and what follow-up |
| Reported By | `text` | Auto | Current user | Incident reporter |

## 5.2 Incident Update Form

**Location:** Incident Detail → Update Treatment

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Update Type | `radio` | Yes | Status Change, Treatment Update, Follow-up, Discharge | Type of update |
| New Status | `dropdown` | Conditional | Active, Under Observation, Referred, Resolved, Discharged | Case status update |
| Additional Treatment | `textarea` | No | Max 500 chars | Any further treatment given |
| Notes | `textarea` | No | Max 500 chars | Update notes |
| Discharge Summary | `textarea` | Conditional | Required if discharging | Final condition summary |

## 5.3 Medication Inventory Form

**Location:** Medical → Medications → Add Item

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Medication Name | `text` | Yes | 2-200 chars | Generic/Brand name |
| Category | `dropdown` | Yes | Painkiller, Antihistamine, Antiseptic, Bandage, Equipment, Other | Type |
| Quantity | `number` | Yes | 0-100000 | Current stock |
| Unit | `dropdown` | Yes | Tablets, Bottles, Boxes, Pieces, Litres | Measurement unit |
| Expiry Date | `date` | No | Must be future | Expiry of medication |
| Reorder Level | `number` | No | 0-100000 | Alert when stock reaches this level |

---

# Section 6: Every Button — Complete Reference

| Button | Location | Action | Permission Required | Confirmation? |
|--------|----------|--------|-------------------|:-------------:|
| **New Incident** | Dashboard | Open incident form | Medical Staff+ | No |
| **Update Treatment** | Incident detail | Add treatment update | Medical Staff+ | No |
| **Refer** | Incident detail | Open referral form | Medical Staff+ | Yes |
| **Discharge** | Incident detail | Close case | Medical Staff+ | Yes |
| **View History** | Participant detail | Show medical history across festivals | Medical Staff+ | No |
| **Call Emergency** | Emergency contacts | Dial emergency number | All | No |
| **Notify Coordinator** | Incident detail | Alert festival director of critical case | Medical Staff+ | Yes |
| **Export Report** | Reports page | Download incident report | Manager+ | No |
| **Add Medication** | Medications page | Add to inventory | Medical Staff+ | No |
| **Update Stock** | Medication detail | Adjust inventory count | Medical Staff+ | No |

---

# Section 7: Step-by-Step Guides

## 7.1 Reporting a Medical Incident

1. Navigate to **Medical → New Incident**
2. Search and select the **Participant** (auto-fills pre-existing conditions and allergies)
3. Select **Incident Type** from the dropdown
4. Set **Severity** based on medical judgment
5. Enter **Date & Time** of the incident
6. Select **Location** where it occurred
7. Describe the **Incident** and **Symptoms** in detail
8. Enter **Treatment Given** and any **Medication** administered
9. If the participant needs external care: fill in **Referred To** and **Referral Details**
10. Set **Follow-up Required** if needed
11. Click **Save Incident**

## 7.2 Managing On-going Cases

1. From the **Medical Dashboard**, view **Active Cases**
2. Click on a case to open **Incident Detail**
3. To add treatment: click **Update Treatment**
4. Select **Update Type** (Treatment Update / Status Change)
5. Enter **Additional Treatment** and **Notes**
6. If referred: click **Refer** and enter referral details
7. To close case: click **Discharge**, enter **Discharge Summary**
8. All updates are timestamped and logged

## 7.3 Managing Medication Inventory

1. Navigate to **Medical → Medications**
2. Click **Add Medication** to add new stock
3. Enter name, category, current quantity, and unit
4. Set **Reorder Level** for low-stock alerts
5. Click **Save**
6. Use **Update Stock** when medications are used or replenished
7. The dashboard shows low-stock warnings when inventory is below reorder level

---

# Section 8: Severity Levels & Escalation

## Severity Classification

| Level | Definition | Response Time | Notification |
|-------|------------|:-------------:|--------------|
| **Mild** | Minor cuts, mild headache, basic first aid | Within 30 min | None |
| **Moderate** | Sprains, moderate burns, dehydration | Within 15 min | Medical Coordinator |
| **Severe** | Fractures, severe allergic reaction, deep cuts | Immediate | Medical Coordinator + Festival Director |
| **Critical** | Unconsciousness, cardiac event, major trauma | Immediate | ALL — Medical, Director, Emergency Services |

## Escalation Flow

```
Incident Reported
    │
    ├── Mild/Moderate → Treat on-site → Log → Close
    │
    ├── Severe → Treat → Notify Medical Coordinator
    │              │
    │              ├── Resolved → Log → Close
    │              └── Refer to Hospital → Log → Track → Discharge
    │
    └── Critical → Call 108/911 → First Aid while waiting
                   Notify Festival Director
                   Notify Emergency Contact
                   Track at Hospital
                   Log → Discharge
```

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| MED-001 | All medical incidents must be logged within 1 hour of occurrence | Advisory |
| MED-002 | Critical incidents auto-notify Festival Director and emergency contact | Notification |
| MED-003 | Participant pre-existing conditions and allergies are auto-populated from registration | Data Pull |
| MED-004 | A participant can have multiple incidents logged | Database |
| MED-005 | Incidents cannot be deleted — only updated or discharged | Database Rule |
| MED-006 | Treatment updates require a timestamp and medical staff ID | Form Validation |
| MED-007 | Medication inventory cannot go negative | Server Action |
| MED-008 | Referral details are mandatory for Severe and Critical incidents | Form Validation |
| MED-009 | Medical data is accessible only to Medical Staff+ and participant | RLS |
| MED-010 | Emergency contact info is always visible (even without login on public portal) | Business Logic |

---

# Section 10: Permissions Matrix

| Operation | Participant | Volunteer | Staff | Manager | Medical Staff | Fest Director | Org Admin |
|-----------|:-----------:|:---------:|:-----:|:-------:|:-------------:|:-------------:|:---------:|
| View own medical records | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View all incidents | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create incident | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update treatment | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Discharge case | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Manage inventory | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Export reports | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Configure settings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View emergency contacts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete incident | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

# Section 11: Best Practices

1. **Position first aid stations strategically** — near stages, high-traffic areas
2. **Log every incident immediately** — even mild ones create useful data
3. **Keep participant allergies visible** — tag on registration/chest card
4. **Stock medications for common issues** — headache, dehydration, allergies
5. **Establish hospital partnerships** — pre-arrange referral protocols
6. **Train volunteers on basic first aid** — faster initial response
7. **Review incident patterns daily** — adjust safety measures accordingly
8. **Maintain comms with central control** — radio/phone for critical alerts
9. **Keep discharge summaries concise** — useful for follow-up and legal record
10. **Run a drill before the festival** — test escalation procedures

---

# Section 12: Common Mistakes

1. ❌ **Delaying incident logging** — critical details forgotten
2. ❌ **Incorrect severity classification** — delayed escalation
3. ❌ **Not recording all treatment given** — incomplete medical record
4. ❌ **Forgetting to update case status** — active cases pile up
5. ❌ **No follow-up after referral** — unsure if participant recovered
6. ❌ **Running out of critical medications** — inventory not checked
7. ❌ **Not having emergency contact numbers accessible** — delayed response

---

# Section 13: Troubleshooting

## P1: Cannot find participant in incident form
**Problem:** Participant search shows no results.  
**Root Causes:** Participant not registered for this festival.  
**Solution:** Verify registration status; register as walk-in if needed.

## P2: Critical incident notification not sent
**Problem:** No notification triggered for a Critical-severity incident.  
**Root Causes:** Notification configuration missing.  
**Solution:** Check Medical Settings → Escalation Rules; ensure notification channels configured.

## P3: Medication stock showing negative
**Problem:** Inventory count went below zero after usage entry.  
**Root Causes:** Concurrent usage requests or stock not updated before usage.  
**Solution:** Audit medication log; adjust stock count via inventory update.

---

# Section 14: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can participants see their own medical records?** | Yes, they can view their own incidents from their dashboard. |
| 2 | **How are critical incidents reported to emergency services?** | The system dials the configured emergency number and displays it on screen; manual call required. |
| 3 | **Can I edit an incident after creation?** | You can add treatment updates, but the original incident record is immutable. |
| 4 | **What data carries over from registration?** | Pre-existing conditions, allergies, blood group, and emergency contact. |
| 5 | **How long are medical records retained?** | Per data retention policy — minimum 3 years for legal compliance. |
| 6 | **Can volunteers administer medication?** | Only Medical Staff+ can record medication administration. |

---

*End of Medical Module Documentation (Module 14)*
