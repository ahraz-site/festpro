# FestPro Scheduling Module — Complete Official Documentation

**Module:** Scheduling  
**Version:** 1.0  
**Dependencies:** Competition (05), Venues  
**Applies To:** Festival Directors, Managers

---

# Section 1: Introduction

The Scheduling module creates and manages the timeline of competitions across venues and time slots. It prevents resource conflicts, optimizes venue utilization, auto-generates schedules, and provides participants with personalized schedules.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Schedule Grid | `/dashboard/festivals/[id]/schedule` | Visual schedule with drag-drop |
| Venues | `/dashboard/festivals/[id]/venues` | Manage venues and stages |
| Auto Schedule | `/dashboard/festivals/[id]/schedule/auto` | Auto-scheduler configuration |

---

# Section 5: Every Form

## 5.1 Venue Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Venue Name | text | Yes | 2-100 characters |
| Description | textarea | No | Max 500 characters |
| Capacity | number | Yes | 1-100000 |
| Type | dropdown | Yes | Auditorium, Classroom, Outdoor, Hall, Stage, Online |
| Location | text | Yes | Building/area name |
| Facilities | multi-select | No | Stage, Sound System, Projector, AC, Seating |

## 5.2 Auto-Scheduler Settings

| Field | Type | Options | Default |
|-------|------|---------|---------|
| Default Duration | dropdown | 15/30/45/60 min/custom | 30 min |
| Gap Between Entries | number | Minutes | 5 |
| Parallel Sessions | toggle | Allow / Don't Allow | Allow |
| Start Time | time | HH:MM | 08:00 |
| End Time | time | HH:MM | 18:00 |
| Lunch Break | time range | HH:MM-HH:MM | 13:00-14:00 |

---

# Section 7: Step-by-Step Guide

## 7.1 Creating a Schedule Manually

**Step 1:** Navigate to the festival → **Schedule** tab.

**Step 2:** The schedule grid displays days (columns) and time slots (rows).

**Step 3:** Drag a competition from the left panel onto a time slot.

**Step 4:** The system checks for venue conflicts (red highlight if conflict).

**Step 5:** Adjust the duration by dragging the bottom edge of the competition block.

**Step 6:** Assign a venue to each competition block.

**Step 7:** Continue until all competitions are scheduled.

**Step 8:** Click **Publish Schedule** to make it visible to participants.

**Step 9:** Participants can now view their personal schedule.

## 7.2 Auto-Generating a Schedule

**Step 1:** Click **Auto Schedule** button.

**Step 2:** Configure settings (start time, end time, gap, break).

**Step 3:** Click **Generate Schedule**.

**Step 4:** The algorithm distributes competitions across days and venues.

**Step 5:** Review the generated schedule.

**Step 6:** Make manual adjustments as needed by drag-and-drop.

**Step 7:** Click **Publish Schedule**.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| SCHED-001 | A venue cannot have overlapping competitions |
| SCHED-002 | A judge cannot be assigned to overlapping competitions |
| SCHED-003 | A participant cannot be in two competitions at the same time |
| SCHED-004 | Schedule can only be published if all competitions are assigned a time slot |
| SCHED-005 | Published schedule changes trigger notifications to affected participants |
| SCHED-006 | Back-to-back competitions for the same participant must have 10+ min gap |

---

*End of Scheduling Module Documentation*
