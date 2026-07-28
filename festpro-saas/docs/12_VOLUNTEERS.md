# FestPro Volunteer Management — Complete Official Documentation

**Module:** 12 — Volunteer Management  
**Version:** 2.0  
**Dependencies:** Festival (04), Communication (15)  
**Applies To:** Volunteer Coordinators, Festival Directors, Managers

---

# Section 1: Introduction

The Volunteer Management module handles the complete volunteer lifecycle: recruitment (public application forms), approval workflow, shift definition and assignment, QR-based check-in/check-out, attendance tracking, and communication. It ensures every festival function is adequately staffed across all days and shifts.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Public Application | Embeddable volunteer application form with skill/availability collection |
| Approval Workflow | Review, approve, or reject applications in bulk |
| Shift Management | Define shifts with date, time, location, role, and headcount |
| Smart Assignment | Auto-suggest volunteers for shifts based on skills and availability |
| QR Check-in/out | Volunteers check in using QR codes on their mobile devices |
| Attendance Dashboard | Real-time view of checked-in vs absent volunteers |
| Shift Swap | Volunteers can request shift swaps (manager approval required) |
| Communication | Bulk notify volunteers via email/SMS about shifts and changes |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Active Festival | A festival must exist and be in Draft or Published state |
| Venues Created | Venues/locations must be defined for shift assignment |
| Festival Days | Festival days must be configured (shift dates link to these) |
| Role Permission | Volunteer Coordinator or Manager+ role required |

## Configuration Checklist

- [ ] Create festival days and venues
- [ ] Configure volunteer application form fields (optional customisation)
- [ ] Set maximum volunteer count per festival
- [ ] Define volunteer roles/task types (Ushering, Registration, Stage, etc.)
- [ ] Enable public application portal link sharing
- [ ] Assign Volunteer Coordinator role to team members
- [ ] Test QR check-in with a test volunteer
- [ ] Set up notification templates for volunteer communications

---

# Section 3: Navigation

## Page Map

| Page | URL | Purpose |
|------|-----|---------|
| **Volunteers Dashboard** | `/dashboard/festivals/[id]/volunteers` | Overview: total volunteers, checked-in, absent by shift |
| **Volunteer List** | `/dashboard/festivals/[id]/volunteers/list` | All approved volunteers with contact and assignment details |
| **Applications** | `/dashboard/festivals/[id]/volunteers/applications` | Pending, approved, rejected applications |
| **Application Detail** | `/dashboard/festivals/[id]/volunteers/applications/[id]` | Single application review |
| **Shifts** | `/dashboard/festivals/[id]/volunteers/shifts` | Calendar/grid view of all shifts |
| **Shift Detail** | `/dashboard/festivals/[id]/volunteers/shifts/[id]` | Single shift with assigned volunteers |
| **Attendance** | `/dashboard/festivals/[id]/volunteers/attendance` | Check-in/out log and status |
| **Settings** | `/dashboard/festivals/[id]/volunteers/settings` | Max volunteers, auto-approve toggle, roles configuration |

## Left Navigation Menu Items

| Menu Item | Icon | Badge |
|-----------|------|-------|
| Dashboard | `LayoutDashboard` | Understaffed shifts count |
| List | `Users` | — |
| Applications | `FileInput` | Pending applications count |
| Shifts | `Calendar` | Upcoming shifts count |
| Attendance | `ClipboardCheck` | Absent today |
| Settings | `Settings` | — |

---

# Section 4: Screen Overview

## 4.1 Volunteers Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  VOLUNTEERS DASHBOARD              [Export] [Bulk Message]  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Total    │ │ Checked  │ │ Absent   │ │ Pending  │       │
│ │ 45       │ │ In: 32   │ │ Today: 5 │ │ Appl: 12 │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Today's Shifts (15 Jan)               [Show All ►]      ││
│ │ ┌─────────┬─────────┬──────┬─────────┬──────────────┐   ││
│ │ │ Shift   │ Time    │ Need │ Assigned│ Checked In   │   ││
│ │ │ Ushering│ 8-12    │ 10   │ 8       │ 6            │   ││
│ │ │ Reg Desk│ 8-12    │ 6    │ 6       │ 5            │   ││
│ │ │ Stage   │ 12-4    │ 4    │ 3       │ 1            │   ││
│ │ └─────────┴─────────┴──────┴─────────┴──────────────┘   ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌───────────────┐   ┌─────────────────────────────────────┐│
│ │ Upcoming      │   │ Understaffed Shifts                 ││
│ │ • 15 Jan: 8   │   │ • Stage (12-4): 3 of 4 filled      ││
│ │ • 16 Jan: 6   │   │ • Sound (4-8): 2 of 5 filled       ││
│ │ • 17 Jan: 4   │   │   [Assign Now]                     ││
│ └───────────────┘   └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Shift Calendar View

```
┌─────────────────────────────────────────────────────────────┐
│  SHIFTS                                [+ Create Shift]    │
├─────────────────────────────────────────────────────────────┤
│ [Month ▼]  January 2025              [Week] [Month] [List] │
├─────────────────────────────────────────────────────────────┤
│ Mon      Tue      Wed     Thu     Fri     Sat     Sun      │
│ 13       14       15      16      17      18      19       │
│                  ┌──────┐ ┌──────┐                         │
│                  │Usher │ │Reg   │                         │
│                  │8-12  │ │8-12  │                         │
│                  │10/8  │ │6/5   │                         │
│                  └──────┘ └──────┘                         │
│                          ┌──────┐                         │
│                          │Stage │                         │
│                          │12-4  │                         │
│                          │4/3   │                         │
│                          └──────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Volunteer Application Form (Public)

**Access:** Public URL (no login required)  
**URL:** `/volunteer/apply/[festivalId]`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Full Name | `text` | Yes | 2-100 characters | Applicant's full name |
| Email Address | `email` | Yes | Valid email, unique per festival | Contact email |
| Phone Number | `tel` | Yes | 10-15 digits | Mobile number (WhatsApp capable recommended) |
| Date of Birth | `date` | Yes | Minimum age 16 | Age verification |
| Address | `textarea` | No | Max 300 chars | Residential address |
| Institution/College | `text` | No | Max 200 chars | If applicable |
| Previous Experience | `textarea` | No | Max 500 chars | Past volunteer experience |
| Skills | `multi-select` | Yes | Options: Stage Management, Ushering, Registration Desk, Sound & Light, First Aid, Security, Transport, Catering, Media & Photography, Tech Support | Skills offered |
| Available Days | `multi-select` | Yes | From festival days list | Which days applicant can volunteer |
| Preferred Shift | `dropdown` | Yes | Morning (6-12), Afternoon (12-4), Evening (4-8), Night (8-12), Any | Preferred time slot |
| T-shirt Size | `dropdown` | Yes | XS, S, M, L, XL, XXL, XXXL | Uniform size |
| Dietary Restrictions | `multi-select` | No | Vegetarian, Vegan, Gluten-free, None | Food preference |
| Emergency Contact Name | `text` | Yes | 2-100 chars | Emergency contact |
| Emergency Contact Phone | `tel` | Yes | 10-15 digits | Emergency phone |
| Agree to Terms | `checkbox` | Yes | Must be checked | Code of conduct acceptance |

## 5.2 Application Review Form (Admin)

**Location:** Volunteers → Applications → [Application ID]  
**Access:** Volunteer Coordinator+

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Decision | `radio` | Yes | Approve, Reject, Waitlist | Application decision |
| Rejection Reason | `textarea` | Conditional | Required if Rejected, max 500 chars | Why applicant was not selected |
| Assigned Role | `dropdown` | Conditional | Required if Approved | Primary volunteer role |
| Orientation Required | `toggle` | No | Default: ON | Does volunteer need orientation |
| Notes (Internal) | `textarea` | No | Max 500 chars | Internal notes about this volunteer |

## 5.3 Shift Creation Form

**Location:** Volunteers → Shifts → Create Shift  
**Access:** Volunteer Coordinator+

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Shift Name | `text` | Yes | 3-100 characters | e.g., "Morning Registration" |
| Festival Day | `date` | Yes | Must be a configured festival day | Which day this shift falls on |
| Start Time | `time` | Yes | Must be before end_time | Shift start |
| End Time | `time` | Yes | Must be after start_time | Shift end |
| Location/Venue | `dropdown` | Yes | From festival venues list | Where volunteers report |
| Role/Task | `dropdown` | Yes | From configured roles | Type of work |
| Volunteers Needed | `number` | Yes | Min: 1, Max: 100 | Required headcount |
| Description | `textarea` | No | Max 500 chars | Special instructions for this shift |
| Points | `number` | No | 0-100 | Volunteer points for this shift |
| Meal Provided | `toggle` | No | Default: ON | Whether meal is included |

## 5.4 Volunteer Assignment Form

**Location:** Volunteers → Shifts → [Shift ID] → Assign  
**Access:** Volunteer Coordinator+

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Volunteer | `autocomplete` | Yes | Must be approved, not assigned to overlapping shift | Select volunteer |
| Notes | `textarea` | No | Max 300 chars | Assignment instructions |
| Send Notification | `toggle` | No | Default: ON | Notify volunteer of assignment |

## 5.5 Shift Swap Request Form

**Location:** Volunteers → My Shifts → Request Swap  
**Access:** All approved volunteers

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Current Shift | `dropdown` | Yes | Must be volunteer's assigned shift | Shift to swap |
| Swap Type | `radio` | Yes | Switch with another volunteer, Change shift time | Type of change |
| Target Volunteer | `autocomplete` | Conditional | Required if switching with someone | Who to swap with |
| Preferred Shift | `dropdown` | Conditional | Required if changing time | Desired new shift |
| Reason | `textarea` | Yes | Max 300 chars | Why swap is needed |

## 5.6 Volunteer Settings Form

**Location:** Volunteers → Settings  
**Access:** Festival Director+

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Max Volunteers | `number` | Yes | 1-10000 | Festival-wide limit |
| Auto-Approve Applications | `toggle` | No | — | Automatically approve matching applicants |
| Allow Shift Swaps | `toggle` | No | Default: ON | Enable volunteer shift swap requests |
| Require Orientation | `toggle` | No | Default: ON | Require orientation before check-in |
| QR Check-in Enabled | `toggle` | No | Default: ON | Enable QR-based attendance |
| Check-in Window (minutes) | `number` | No | 0-120, default: 15 | How early/late check-in is allowed |
| Enable Volunteer Points | `toggle` | No | — | Track volunteer points for rewards |
| Volunteer Roles | `dynamic list` | Yes | At least 1 role | Volunteer role definitions (name, description) |

---

# Section 6: Every Button — Complete Reference

| Button | Location | Action | Permission Required | Confirmation? |
|--------|----------|--------|-------------------|:-------------:|
| **Approve** | Application detail | Approve applicant | Volunteer Coordinator+ | No |
| **Approve All** | Applications list | Bulk approve selected | Volunteer Coordinator+ | Yes |
| **Reject** | Application detail | Reject with reason | Volunteer Coordinator+ | Yes |
| **Create Shift** | Shifts page | Open shift form | Volunteer Coordinator+ | No |
| **Edit Shift** | Shift detail | Modify shift details | Volunteer Coordinator+ | No |
| **Delete Shift** | Shift detail | Remove shift and assignments | Festival Director+ | Yes |
| **Assign Volunteer** | Shift detail | Open assignment form | Volunteer Coordinator+ | No |
| **Unassign** | Shift detail | Remove volunteer from shift | Volunteer Coordinator+ | Yes |
| **Check In** | Attendance | Mark volunteer arrived | Volunteer (self) / Coordinator | No |
| **Check Out** | Attendance | Mark volunteer departed | Volunteer (self) / Coordinator | No |
| **Notify All** | Dashboard | Send broadcast to all volunteers | Volunteer Coordinator+ | Yes |
| **Notify Shift** | Shift detail | Send message to shift volunteers | Volunteer Coordinator+ | No |
| **Export List** | Volunteer list | Download CSV/Excel | Volunteer Coordinator+ | No |
| **Print Badge** | Volunteer detail | Print volunteer ID badge | Volunteer Coordinator+ | No |
| **View QR** | Volunteer detail | Show volunteer's QR code | Volunteer Coordinator+ | No |
| **Approve Swap** | Swap request | Approve shift swap | Volunteer Coordinator+ | No |
| **Reject Swap** | Swap request | Reject swap request | Volunteer Coordinator+ | No |

---

# Section 7: Step-by-Step Guides

## 7.1 Setting Up Volunteer Management

1. Navigate to **Festivals → [Your Festival] → Volunteers → Settings**
2. Set **Max Volunteers** to the total needed across all shifts
3. Define **Volunteer Roles** (e.g., Ushering, Registration Desk, Stage Support)
4. Optionally enable **Auto-Approve Applications** (turns the application review step)
5. Enable **QR Check-in** and set the **Check-in Window** (default: 15 min)
6. Configure **Allow Shift Swaps** if volunteers should be able to swap shifts
7. Enable **Volunteer Points** if you want a gamification element
8. Click **Save Settings**

## 7.2 Reviewing Volunteer Applications

1. Share the public application link: `https://festpro.app/volunteer/apply/[festivalId]`
2. Navigate to **Volunteers → Applications** — pending applications appear
3. Click an application to view full details (skills, availability, experience)
4. Click **Approve** to accept: assign a primary role
5. Click **Reject** to decline: enter a reason (volunteer is notified)
6. Use **Approve All** for bulk approval of qualified applicants
7. Approved volunteers appear in the **Volunteer List**
8. A welcome notification is automatically sent to approved volunteers

## 7.3 Creating and Assigning Shifts

1. Navigate to **Volunteers → Shifts**
2. Click **Create Shift**
3. Enter **Shift Name** (e.g., "Morning Registration - Day 1")
4. Select **Festival Day** (e.g., 15 Jan 2025)
5. Set **Start Time** and **End Time**
6. Choose **Location/Venue** where volunteers report
7. Select the **Role/Task** for this shift
8. Set **Volunteers Needed** (number of people required)
9. Click **Save**
10. From the shift detail page, click **Assign Volunteer**
11. Search and select an approved volunteer
12. Add optional notes, then click **Assign**
13. The volunteer receives a notification with shift details and QR code
14. Repeat for all required shifts

## 7.4 Volunteer Check-in Using QR

1. The volunteer opens their notification or the volunteer portal
2. They tap **View My QR Code**
3. At the venue, the Volunteer Coordinator scans the QR code
4. Or the volunteer checks in via the **Attendance** button in their portal
5. The system records check-in time and location
6. Status changes from **Assigned → Checked In**
7. At shift end, volunteer taps **Check Out** or coordinator checks them out
8. Attendance report is updated in real-time

## 7.5 Monitoring Attendance

1. Navigate to **Volunteers → Attendance** during the festival
2. The dashboard shows a real-time grid: shifts × assigned volunteers
3. **Green**: Checked in on time
4. **Yellow**: Checked in late
5. **Red**: Not checked in (absent)
6. **Gray**: Shift not yet started
7. Click on a volunteer to see their check-in/out timestamps
8. Click **Export** to download attendance report for record-keeping

---

# Section 8: States & Statuses

## Volunteer Status Flow

```
Applied → Pending Review → Approved → Assigned → Checked In → Checked Out → Completed
                             |            |
                             ▼            ▼
                          Rejected    Unassigned
                             |
                          Waitlisted
```

## Shift Statuses

| Status | Meaning |
|--------|---------|
| Draft | Shift created but not yet open for assignments |
| Open | Accepting volunteer assignments |
| Filled | All slots assigned |
| Understaffed | Some slots still open |
| In Progress | Shift start time reached, check-in active |
| Completed | Shift end time passed |
| Cancelled | Shift cancelled, all assignments released |

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| VOL-001 | Max volunteer count per festival cannot be exceeded | Server Action |
| VOL-002 | A volunteer cannot be assigned to overlapping shifts (same date/time) | Database Check |
| VOL-003 | Minimum age for volunteers is 16 years | Form Validation |
| VOL-004 | All applications require manual review unless auto-approve is enabled | Server Action |
| VOL-005 | QR check-in window is configurable (default: 15 min before shift) | Settings |
| VOL-006 | Volunteers cannot check in more than 30 minutes before shift start | Server Action |
| VOL-007 | A volunteer can only be assigned to one shift per time slot | Database Check |
| VOL-008 | Shift swaps require coordinator approval (unless auto-approve is on) | Server Action |
| VOL-009 | Volunteers are notified of new assignments within 5 minutes | Notification Queue |
| VOL-010 | Unassigning a volunteer sends an automatic cancellation notification | Server Action |
| VOL-011 | Attendance records are immutable after 24 hours (audit log override only) | Database Rule |
| VOL-012 | Volunteer points are awarded on completed shift check-out | Server Action |
| VOL-013 | A volunteer cannot apply twice to the same festival | Database Unique Constraint |
| VOL-014 | Shift end time must be after start time | Form Validation |
| VOL-015 | Check-out time must be after check-in time | Server Action |

---

# Section 10: Permissions Matrix

| Operation | Participant | Staff | Reception | Volunteer | Judge | Media | Finance | Manager | Fest Director | Org Admin | Org Owner | Platform Admin | Platform Owner |
|-----------|:-----------:|:-----:|:---------:|:---------:|:-----:|:-----:|:-------:|:-------:|:-------------:|:---------:|:---------:|:--------------:|:--------------:|
| Apply as volunteer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own shifts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all volunteers | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review applications | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve/reject applications | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create shifts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign volunteers | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check in volunteers | ❌ | ❌ | ✅ | ✅(self) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send broadcasts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export data | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve shift swaps | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete shifts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# Section 11: Best Practices

1. **Open applications 30 days before the festival** — gives time for review and training
2. **Define clear role descriptions** — volunteers perform better when they know expectations
3. **Assign a Volunteer Coordinator per shift** — one point of contact for each shift group
4. **Keep shifts to 4-6 hours** — longer shifts cause fatigue and absenteeism
5. **Always have 10-15% buffer volunteers** — last-minute dropouts are inevitable
6. **Provide orientation/training** — even experienced volunteers need festival-specific briefing
7. **Send shift reminders 24 hours and 1 hour before** — reduces no-shows
8. **Use QR check-in for accurate attendance** — manual sign-in sheets are unreliable
9. **Recognise volunteers publicly** — thank them during closing ceremony
10. **Track volunteer points** — offer certificates or perks for top volunteers
11. **Have a backup plan for no-shows** — identify float volunteers who can fill gaps
12. **Provide meals and water** — happy volunteers perform better
13. **Create a WhatsApp/Telegram group** — real-time communication during the festival
14. **Review applications within 48 hours** — prompt responses improve volunteer engagement
15. **Avoid over-assigning** — a volunteer should not work more than 2 shifts per day

---

# Section 12: Common Mistakes

1. ❌ **Creating too few shifts** — volunteers end up idle or underutilised
2. ❌ **Underestimating required headcount** — leading to exhausted volunteers
3. ❌ **Not checking skill matches** — assigning a photographer to stage setup
4. ❌ **Ignoring shift overlap conflicts** — volunteer assigned to two shifts at once
5. ❌ **Not configuring QR check-in location** — volunteers check in from anywhere
6. ❌ **Skipping volunteer orientation** — confusion on festival day
7. ❌ **Approving unqualified applicants** — safety and quality risk
8. ❌ **Not having an emergency contact list** — critical during incidents
9. ❌ **No communication plan** — volunteers don't know where to report
10. ❌ **Forgetting meal breaks** — hungry volunteers are ineffective

---

# Section 13: Troubleshooting

## P1: Volunteer can't see their shifts
**Problem:** Approved volunteer reports shift page is empty.  
**Root Causes:** (1) Not yet assigned to any shift. (2) Wrong festival selected.  
**Solution:** Coordinator assigns shifts; refresh volunteer portal.

## P2: QR check-in not working
**Problem:** Scanning QR code shows "Invalid code" or does nothing.  
**Root Causes:** (1) Check-in window not yet open. (2) Wrong QR scanned. (3) Camera permissions blocked.  
**Solution:** Verify check-in window timing; try manual check-in.

## P3: Overlapping shift assignment
**Problem:** System allows assigning a volunteer to overlapping shifts.  
**Root Causes:** Bug in conflict detection or timezone issue.  
**Solution:** Manual review; fix via unassign and reassign.

## P4: Volunteer application count wrong
**Problem:** Dashboard shows wrong pending count.  
**Root Causes:** Cache not refreshed.  
**Solution:** Refresh the page; if persists, clear server cache.

## P5: Bulk notification not delivered
**Problem:** Broadcast to all volunteers shows "Sent" but volunteers didn't receive.  
**Root Causes:** Rate limit hit, invalid emails/phone numbers.  
**Solution:** Check Communication → History for delivery status; resend to failed.

---

# Section 14: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can volunteers apply without logging in?** | Yes. The application form is public and requires no authentication. |
| 2 | **How do volunteers see their assigned shifts?** | They log in to their FestPro account → Volunteers → My Shifts. |
| 3 | **Can a volunteer swap shifts with another?** | Yes, if shift swapping is enabled. The swap requires coordinator approval. |
| 4 | **What happens if a volunteer doesn't show up?** | They are marked absent. The coordinator can assign a backup or move someone. |
| 5 | **Is there a limit on the number of volunteers?** | Yes, configurable per festival in Volunteer Settings. Default: 1000. |
| 6 | **Can volunteers check in from their phone?** | Yes. They can use the volunteer portal or their PWA to check in. |
| 7 | **How are volunteers notified of new shifts?** | They receive an in-app notification, email, and SMS if enabled. |
| 8 | **Can I export the volunteer list with contacts?** | Yes. The Volunteer List page has an Export CSV/Excel button. |
| 9 | **Can volunteers earn certificates?** | Yes. Completion certificates can be generated through the Certificate module. |
| 10 | **How do I handle last-minute cancellations?** | Use the Replace feature: unassign the cancelling volunteer and assign a backup. |

---

# Section 15: Glossary

| Term | Definition |
|------|------------|
| **Volunteer** | Person who offers to work without monetary compensation |
| **Shift** | A defined time slot with location, role, and required headcount |
| **Check-in** | Recording a volunteer's arrival at their shift |
| **Check-out** | Recording a volunteer's departure after completing their shift |
| **Float Volunteer** | Unassigned volunteer available to fill gaps |
| **Orientation** | Pre-festival briefing session for volunteers |
| **Volunteer Points** | Gamified reward system for volunteer participation |

---

*End of Volunteer Management Module Documentation (Module 12)*
