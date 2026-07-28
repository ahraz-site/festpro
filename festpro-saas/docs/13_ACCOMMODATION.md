# FestPro Accommodation Module — Complete Official Documentation

**Module:** 13 — Accommodation  
**Version:** 2.0  
**Dependencies:** Registration (06), Festival (04)  
**Applies To:** Accommodation Staff, Reception, Managers

---

# Section 1: Introduction

The Accommodation module manages on-site lodging for participants, team members, and guests during multi-day festivals. It handles room inventory, gender-based allocation, check-in/out, occupancy tracking, and facility management. Designed for hostels, dormitories, hotel blocks, and mixed-use buildings.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Room Inventory | Manage multiple buildings, floors, room types with capacity |
| Smart Allocation | Auto-suggest rooms based on gender, capacity, and group preferences |
| QR Check-in | Contactless room check-in using QR codes |
| Occupancy Dashboard | Real-time view of occupied, vacant, and reserved rooms |
| Maintenance Tracking | Mark rooms under maintenance or cleaning |
| Multi-building | Support for multiple buildings/halls per festival |
| Guest Registration | Register non-participant guests (parents, officials) |
| Export Reports | Room allocation list, occupancy report, guest list |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Festival Created | Multi-day festival with dates configured |
| Buildings/Halls Identified | Physical buildings where rooms are located |
| Registered Participants | Participants who need accommodation |
| Role Permission | Accommodation Staff or Manager+ role |

## Configuration Checklist

- [ ] Create buildings/halls in the system
- [ ] Add rooms with correct capacity and gender restrictions
- [ ] Define room types (Single, Double, Dormitory, VIP)
- [ ] Set up check-in and check-out time policy
- [ ] Enable QR-based check-in (optional)
- [ ] Configure max occupants per room type
- [ ] Test allocation flow with sample participants

---

# Section 3: Navigation

## Page Map

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/dashboard/festivals/[id]/accommodation` | Occupancy overview, KPIs, alerts |
| **Rooms** | `/dashboard/festivals/[id]/accommodation/rooms` | Room list, status, filters |
| **Room Detail** | `/dashboard/festivals/[id]/accommodation/rooms/[id]` | Single room info, current occupants |
| **Allocations** | `/dashboard/festivals/[id]/accommodation/allocations` | All participant-room assignments |
| **New Allocation** | `/dashboard/festivals/[id]/accommodation/allocations/new` | Assign participant to room |
| **Buildings** | `/dashboard/festivals/[id]/accommodation/buildings` | Building/hall management |
| **Reports** | `/dashboard/festivals/[id]/accommodation/reports` | Occupancy and allocation reports |
| **Settings** | `/dashboard/festivals/[id]/accommodation/settings` | Check-in/out rules, policies |

---

# Section 4: Screen Overview

## 4.1 Accommodation Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  ACCOMMODATION DASHBOARD                   [Export] [+]     │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Total    │ │ Occupied │ │ Vacant   │ │ Reserved │       │
│ │ Rooms:200│ │ 145 (72%)│ │ 35 (18%) │ │ 20 (10%) │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Occupancy by Building                                    ││
│ │ Girls Hostel: ██████████░░░░ 80%   Full     ││
│ │ Boys Hostel:  ██████████░░░░ 75%   Available││
│ │ VIP Block:    ██████░░░░░░░░ 30%   Available││
│ └──────────────────────────────────────────────────────────┘│
│ ┌───────────────┐   ┌─────────────────────────────────────┐│
│ │ Today's       │   │ Alerts                               ││
│ │ Check-ins: 30 │   │ • Girls Hostel GF: AC not working   ││
│ │ Check-outs:15 │   │ • VIP Room 101: Under maintenance   ││
│ │ Stay-overs:100│   │ • Floor 3: Over capacity warning    ││
│ └───────────────┘   └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Room Grid View

```
┌─────────────────────────────────────────────────────────────┐
│  ROOMS — Girls Hostel                    [Add Room] [▼]     │
├─────────────────────────────────────────────────────────────┤
│ Floor 1:                                                     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ │101 │ │102 │ │103 │ │104 │ │105 │ │106 │ │107 │ │108 │  │
│ │▓▓▓░│ │▓▓▓▓│ │▓▓▓░│ │░░░░│ │▓▓▓▓│ │▓▓▓▓│ │▓░░░│ │░░░░│  │
│ │3/4 │ │4/4 │ │3/4 │ │0/4 │ │4/4 │ │4/4 │ │1/4 │ │0/4 │  │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘  │
│ Floor 2 (Mezzanine):                                        │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                               │
│ │201 │ │202 │ │203 │ │204 │                               │
│ │▓▓▓░│ │▓▓▓▓│ │░░░░│ │▓▓▓░│                               │
│ │3/4 │ │4/4 │ │0/2 │ │2/2 │                               │
│ └────┘ └────┘ └────┘ └────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Building/Hall Form

**Location:** Accommodation → Buildings → Add Building

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Building Name | `text` | Yes | 2-100 chars | e.g., "Girls Hostel", "VIP Block" |
| Short Code | `text` | Yes | 2-10 chars, unique | e.g., "GH", "VB" |
| Number of Floors | `number` | Yes | 1-50 | Floors in this building |
| Building Type | `dropdown` | Yes | Hostel, Dormitory, Hotel, Guest House | Type of accommodation |
| Address/Location | `textarea` | No | Max 300 chars | Physical location description |
| Contact Person | `text` | No | Max 100 chars | Building warden/caretaker |
| Contact Phone | `tel` | No | 10-15 digits | Caretaker phone number |

## 5.2 Room Form

**Location:** Accommodation → Rooms → Add Room

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Building | `dropdown` | Yes | From buildings list | Which building |
| Floor | `number` | Yes | 1-50 | Floor level |
| Room Number | `text` | Yes | 1-20 chars, unique within building | Visible room number |
| Room Type | `dropdown` | Yes | Single, Double, Triple, Dormitory (4/6/8), VIP Suite | Room category |
| Capacity | `number` | Yes | 1-20 | Maximum occupants |
| Gender Restriction | `dropdown` | Yes | Male, Female, Mixed/Any | Who can be assigned |
| Facilities | `multi-select` | No | AC, Fan, Attached Bathroom, Common Bathroom, TV, Fridge, Balcony, Hot Water | Room amenities |
| Floor Level | `dropdown` | No | Ground, First, Second, etc. | Easy identification |
| Notes | `textarea` | No | Max 300 chars | Special notes about this room |

## 5.3 Allocation Form

**Location:** Accommodation → Allocations → New Allocation

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Guest Type | `radio` | Yes | Participant, Guardian, Official, Staff | Who is being accommodated |
| Participant | `autocomplete` | Conditional | Required if Guest Type = Participant | Registered participant |
| Guest Name | `text` | Conditional | Required if not participant | Full name of guest |
| Guest Contact | `tel` | Conditional | Required if not participant | Guest phone number |
| Building | `dropdown` | Auto | Filtered by gender match | Automatically set from room |
| Room | `dropdown` | Yes | Must have capacity available, gender-matched | Selected room |
| Check-in Date | `date` | Yes | Must be within festival dates | Arrival date |
| Check-out Date | `date` | Yes | After check-in, within festival dates | Departure date |
| Bed Number | `number` | No | 1-capacity | Specific bed in dormitory |
| Notes | `textarea` | No | Max 300 chars | Special requirements |

## 5.4 Check-in/Check-out Form

**Location:** Accommodation → Allocations → [Allocation ID] → Check In

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Action | `radio` | Yes | Check In, Check Out | Action type |
| Actual Check-in Time | `datetime` | Auto | — | Auto-recorded |
| ID Proof Type | `dropdown` | Conditional | Required for check-in: Aadhaar, DL, Passport, College ID, Other | Identity verification |
| ID Proof Number | `text` | Conditional | Required for check-in | ID reference |
| Keys Handed Over | `checkbox` | No | — | Room key given to occupant |
| Payment Collected | `checkbox` | No | — | Accommodation fee collected |
| Damage Deposit | `decimal` | No | 0-50000 | Refundable deposit collected |
| Notes | `textarea` | No | Max 300 chars | Check-in/out notes |

## 5.5 Room Maintenance Form

**Location:** Accommodation → Rooms → [Room ID] → Mark Maintenance

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Status | `dropdown` | Yes | Maintenance, Cleaning, Out of Order | Issue type |
| Description | `textarea` | Yes | Max 500 chars | What needs attention |
| Reported By | `text` | Auto | Current user | Who reported |
| Expected Resolution | `date` | No | Must be future | When room will be available |
| Notify Occupants | `toggle` | No | — | Notify current residents about disruption |

---

# Section 6: Every Button — Complete Reference

| Button | Location | Action | Permission Required | Confirmation? |
|--------|----------|--------|-------------------|:-------------:|
| **Add Building** | Buildings page | Open building form | Manager+ | No |
| **Add Room** | Rooms page | Open room form | Accommodation Staff+ | No |
| **Bulk Add Rooms** | Rooms page | Add multiple rooms at once (number range) | Manager+ | Yes |
| **Allocate Room** | Allocations page | Open allocation form | Accommodation Staff+ | No |
| **Check In** | Allocation detail | Mark as checked in | Reception / Staff | Yes |
| **Check Out** | Allocation detail | Mark as checked out | Reception / Staff | Yes |
| **Mark Maintenance** | Room detail | Mark room under maintenance | Manager+ | No |
| **Mark Vacant** | Room detail | Mark room as available | Accommodation Staff+ | Yes |
| **Change Room** | Allocation detail | Move occupant to different room | Manager+ | Yes |
| **Extend Stay** | Allocation detail | Modify check-out date | Manager+ | No |
| **View Occupants** | Room detail | Show current occupants | Accommodation Staff+ | No |
| **Export Occupancy** | Dashboard | Download occupancy report | Manager+ | No |
| **Print Room List** | Rooms page | Print room grid by floor | Accommodation Staff+ | No |
| **QR Check-in** | Mobile | Scan QR to check in | Volunteer+ | No |

---

# Section 7: Step-by-Step Guides

## 7.1 Setting Up Rooms

1. Navigate to **Accommodation → Buildings → Add Building**
2. Enter **Building Name** (e.g., "Girls Hostel"), **Short Code** ("GH"), **Floors** (3)
3. Click **Save**
4. Navigate to **Accommodation → Rooms → Add Room**
5. Select **Building**, **Floor**, enter **Room Number**
6. Choose **Room Type** and **Capacity**
7. Set **Gender Restriction** (critical for correct auto-suggestion)
8. Select **Facilities** available
9. Click **Save**
10. Repeat or use **Bulk Add Rooms** for multiple rooms in a range (e.g., 101-120)

## 7.2 Allocating Rooms to Participants

1. Navigate to **Accommodation → Allocations → New Allocation**
2. Select **Guest Type** → Participant
3. Search and select the **Participant** (auto-filters registered participants who need accommodation)
4. The system shows only rooms with:
   - Available capacity
   - Matching gender restriction
   - Within the participant's check-in/out dates
5. Select a **Room**
6. Set **Check-in Date** and **Check-out Date**
7. Click **Allocate**
8. The room's occupancy count updates
9. The participant receives a notification with room details and QR code

## 7.3 Check-in Process

1. On arrival, participant shows their QR code (from notification or portal)
2. Staff scans the QR code at **Accommodation → Allocations → Check In**
3. Or: search for the participant manually
4. Verify **ID Proof** and enter ID details
5. Hand over room **Keys**
6. Optionally collect **Damage Deposit**
7. Click **Check In**
8. Status changes: **Allocated → Checked In**
9. Room is marked as **Occupied**

## 7.4 Check-out Process

1. On departure, participant returns to reception
2. Staff navigates to the **Allocation** and clicks **Check Out**
3. Verify key return and room condition
4. Process **Damage Deposit** return (if applicable)
5. Click **Check Out**
6. Status changes: **Checked In → Checked Out**
7. Room is marked as **Vacant** (or **Cleaning** if housekeeping needed)

---

# Section 8: Statuses & States

## Room Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| Vacant | Available for allocation | Allocate to participant |
| Reserved | Blocked for upcoming check-in | Awaiting arrival |
| Occupied | Participant checked in | Check-out process |
| Maintenance | Under repair | Mark resolved when fixed |
| Cleaning | Being cleaned for next guest | Mark clean when done |

## Allocation Statuses

| Status | Description |
|--------|-------------|
| Allocated | Room assigned, not yet checked in |
| Checked In | Occupant has arrived and taken possession |
| Checked Out | Occupant has departed |
| Cancelled | Allocation was cancelled before check-in |
| Transferred | Occupant moved to another room |

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ACC-001 | Room capacity must never be exceeded | Database Check + UI |
| ACC-002 | Gender restriction must be respected — male rooms get male participants | Server Action |
| ACC-003 | A participant can have only one active room allocation per festival | Database Check |
| ACC-004 | Check-out date must be after check-in date | Form Validation |
| ACC-005 | Room cannot be allocated if status is Maintenance or Cleaning | Server Action |
| ACC-006 | Mixed/Any rooms allow any gender | Business Logic |
| ACC-007 | Room cannot be allocated with dates outside the festival date range | Server Action |
| ACC-008 | A building's total occupancy cannot exceed 120% of its capacity (fire safety) | Advisory |
| ACC-009 | Check-out time is 10:00 AM default (configurable in settings) | Settings |
| ACC-010 | Check-in time is 12:00 PM default (configurable in settings) | Settings |
| ACC-011 | Same-gender rooms are recommended for minors (under 18) | Advisory |
| ACC-012 | Damage deposit is refunded on check-out only if no damage reported | Business Logic |
| ACC-013 | Bulk room creation validates number range for duplicates | Server Action |
| ACC-014 | Room transfer creates an audit log entry with old and new room | Audit Log |
| ACC-015 | Export reports respect RLS — only accessible to org members | RLS |

---

# Section 10: Permissions Matrix

| Operation | Reception | Volunteer | Staff | Manager | Fest Director | Org Admin | Org Owner |
|-----------|:---------:|:---------:|:-----:|:-------:|:-------------:|:---------:|:---------:|
| View rooms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add rooms | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Allocate rooms | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check in | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check out | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark maintenance | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Transfer room | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage buildings | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Export data | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete allocation | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Configure settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

# Section 11: Best Practices

1. **Add all rooms before the festival starts** — allocation during the event is stressful
2. **Use gender-matched rooms** — avoid complaints and safety issues
3. **Keep buffer rooms** — reserve 5% of rooms for last-minute changes
4. **Group teams together** — allocate team members in adjacent rooms
5. **Mark maintenance rooms before allocation** — prevents assigning unusable rooms
6. **Use QR check-in** — reduces reception queue time by 60%
7. **Record ID proofs for all occupants** — security and compliance requirement
8. **Set clear check-in/out times** — communicate to participants in advance
9. **Have cleaning rotation** — immediately clean checked-out rooms for next occupant
10. **Print room allocation list** — keep at reception for offline reference

---

# Section 12: Common Mistakes

1. ❌ **Not setting gender restrictions** — mixed-gender unintentional allocation
2. ❌ **Over-allocating dormitories** — exceeding bed capacity
3. ❌ **Allocating rooms under maintenance** — guest arrives to unusable room
4. ❌ **Not recording ID proofs** — security vulnerability
5. ❌ **Ignoring check-out times** — next guest delayed entry
6. ❌ **Deleting allocations** — use cancel/transfer instead for audit

---

# Section 13: Troubleshooting

## P1: Cannot find available room for participant
**Problem:** No rooms shown as available for allocation.  
**Root Causes:** (1) All rooms of matching gender are full. (2) Date range overlaps with all rooms.  
**Solution:** Check other buildings; expand date range; add more rooms.

## P2: Wrong gender allocation
**Problem:** Male participant accidentally assigned to female room.  
**Root Causes:** Room marked as "Mixed/Any" but should be gender-specific.  
**Solution:** Transfer participant to correct room; update room gender restriction.

## P3: Check-in QR not scanning
**Problem:** Participant's QR code scans to error.  
**Root Causes:** (1) Allocation not yet confirmed. (2) Wrong participant QR.  
**Solution:** Verify allocation status; manually check in via search.

## P4: Occupancy numbers don't match
**Problem:** Dashboard occupancy count ≠ actual occupied rooms.  
**Root Causes:** Cache delay or orphan allocation records.  
**Solution:** Run the sync/recount tool; refresh dashboard.

---

# Section 14: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can a participant stay in a mixed-gender room?** | Only if the room is marked "Mixed/Any". Minor participants are recommended to stay in same-gender rooms. |
| 2 | **Can I change a participant's room after check-in?** | Yes. Use the "Change Room" function. Audit log records the change. |
| 3 | **How do I handle early check-in or late check-out?** | Adjust the check-in/out dates on the allocation. Additional fees can be configured. |
| 4 | **Is there a limit on rooms per building?** | No hard limit. Practical limit depends on database performance. |
| 5 | **Can guardians stay with participants?** | Yes. Select Guest Type = Guardian when allocating. |
| 6 | **How are occupancy reports generated?** | Navigate to Reports, select date range, and generate. Available in PDF and CSV. |

---

*End of Accommodation Module Documentation (Module 13)*
