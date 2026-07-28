# FestPro Volunteer Management — Complete Official Documentation

**Module:** Volunteer Management  
**Version:** 1.0  
**Dependencies:** Festival (04)  
**Applies To:** Managers, Festival Directors

---

# Section 1: Introduction

The Volunteer Management module handles recruitment, scheduling, task assignment, and attendance tracking for event volunteers. It ensures adequate staffing across all festival functions.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Volunteer List | `/dashboard/festivals/[id]/volunteers` | All volunteers |
| Shifts | `/dashboard/festivals/[id]/volunteers/shifts` | Shift calendar and assignment |
| Applications | `/dashboard/festivals/[id]/volunteers/applications` | Pending applications |

---

# Section 5: Every Form

## 5.1 Volunteer Application (Public)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | text | Yes | 2-100 characters |
| Email | email | Yes | Valid email |
| Phone | tel | Yes | 10-15 digits |
| Age | number | Yes | 16+ |
| Skills | multi-select | Yes | Stage, Ushering, Registration, First Aid, Security, Tech |
| Availability | date range | Yes | Which festival days |
| Preferred Shift | dropdown | No | Morning, Afternoon, Evening, Any |

## 5.2 Shift Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Shift Name | text | Yes | e.g., "Morning Registration" |
| Festival Day | date | Yes | Which festival day |
| Start Time | time | Yes | Shift start |
| End Time | time | Yes | Shift end |
| Location | dropdown | Yes | Venue/area |
| Role | dropdown | Yes | Task type |
| Volunteers Needed | number | Yes | Minimum required |

---

# Section 7: Step-by-Step Guide

## 7.1 Managing Volunteers

**Step 1:** Navigate to Volunteers → Applications.

**Step 2:** Review pending applications.

**Step 3:** Click **Approve** or **Reject** for each applicant.

**Step 4:** Navigate to Volunteers → Shifts.

**Step 5:** Click **Create Shift** to define a time slot.

**Step 6:** Set name, date, time, location, and required count.

**Step 7:** Click **Assign Volunteer** to assign approved volunteers.

**Step 8:** Volunteers receive notification of their shift.

**Step 9:** On festival day, volunteers check in using QR code.

---

*End of Volunteer Management Module Documentation*
