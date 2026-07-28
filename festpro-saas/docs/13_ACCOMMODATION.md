# FestPro Accommodation Module — Complete Official Documentation

**Module:** Accommodation  
**Version:** 1.0  
**Dependencies:** Registration (06)  
**Applies To:** Managers, Reception Staff

---

# Section 1: Introduction

The Accommodation module manages room allocation for participants requiring lodging during multi-day festivals. It tracks room inventory, occupant assignments, check-in/out status, and facility management.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Rooms | `/dashboard/festivals/[id]/accommodation/rooms` | Room list and status |
| Allocations | `/dashboard/festivals/[id]/accommodation/allocations` | Participant allocations |
| Dashboard | `/dashboard/festivals/[id]/accommodation` | Occupancy overview |

---

# Section 5: Every Form

## 5.1 Room Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Room Number/Name | text | Yes | Unique identifier |
| Building/Hall | dropdown | Yes | Which building |
| Floor | number | Yes | Floor level |
| Room Type | dropdown | Yes | Single, Double, Dormitory, VIP |
| Capacity | number | Yes | Maximum occupants |
| Gender Restriction | dropdown | Yes | Male, Female, Mixed |
| Facilities | multi-select | No | AC, Attached Bathroom, Fan |

## 5.2 Allocation Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Participant | auto-lookup | Yes | Search by name/email |
| Room | dropdown | Yes | Available rooms (filtered by gender match) |
| Check-in Date | date | Yes | Arrival date |
| Check-out Date | date | Yes | Departure date |

---

# Section 7: Step-by-Step Guide

**Step 1:** Navigate to Accommodation → Rooms.

**Step 2:** Click **Add Room** to add rooms to inventory.

**Step 3:** Enter room details (number, type, capacity, gender restriction).

**Step 4:** Click **Save**.

**Step 5:** Navigate to Accommodation → Allocations.

**Step 6:** Click **Allocate Room**.

**Step 7:** Select participant and room. System shows available rooms only.

**Step 8:** Set check-in and check-out dates.

**Step 9:** Click **Allocate**.

**Step 10:** On arrival, mark room as **Occupied**.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| ACC-001 | Room capacity must not be exceeded |
| ACC-002 | Gender restriction must be respected (Male/Female rooms) |
| ACC-003 | A participant can only have one active room allocation |
| ACC-004 | Check-out must be after check-in date |
| ACC-005 | Room statuses: Vacant, Reserved, Occupied, Maintenance, Cleaning |

---

*End of Accommodation Module Documentation*
