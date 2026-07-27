# FestPro Festival Management — Complete Official Documentation

**Module:** Festival Management  
**Version:** 1.0  
**Dependencies:** Authentication (01), Organization (02)  
**Applies To:** Organization Owners, Organization Admins, Festival Directors

---

# Section 1: Introduction

## 1.1 What This Module Is

The Festival Management module is the core container for all event activity. A festival represents a time-bound event — a youth festival, a cultural competition series, a talent show — with defined dates, venues, competition categories, and participant capacity. Every competition, registration, and result belongs to exactly one festival.

## 1.2 Why It Exists

Festivals are the primary organizational unit of FestPro. They define the temporal, spatial, and operational boundaries within which all other activities occur. Without festivals, there would be no context for competitions, no registration period, no schedule, and no results.

## 1.3 Business Purpose

| Purpose | Implementation |
|---------|----------------|
| Event lifecycle | Create → Publish → Register → Execute → Complete → Archive |
| Participant capacity | Configurable max participants per festival |
| Registration control | Open/close registration with date-based automation |
| Fee management | Per-festival and per-competition fee configuration |
| Scheduling | Multi-venue, multi-day schedule management |
| Branding | Per-festival banner, theme, and customization |

---

# Section 2: Before You Start

## 2.1 Requirements

| Requirement | Specification |
|-------------|---------------|
| Organization | Must have an existing organization |
| Permission | `festival_director` role or higher |
| Festival dates | Start and end dates confirmed |
| Venue details | At least one venue name and address |

## 2.2 Permissions

| Operation | Required Role |
|-----------|---------------|
| Create festival | Festival Director or higher |
| Edit festival | Festival Director or higher (limited after registration opens) |
| Publish festival | Festival Director or higher |
| Cancel festival | Organization Admin or higher |
| Delete festival | Organization Admin or higher |
| Archive festival | Manager or higher |
| View festival | Any organization member |

---

# Section 3: Navigation

## 3.1 Festival Pages

| Page | URL | Purpose |
|------|-----|---------|
| Festival List | `/dashboard/festivals` | All festivals for the organization |
| Create Festival | `/dashboard/festivals/new` | New festival form |
| Festival Detail | `/dashboard/festivals/[id]` | Dashboard for a specific festival |
| Festival Settings | `/dashboard/festivals/[id]/settings` | Edit festival configuration |

---

# Section 4: Screen Overview

## 4.1 Festival List Page

| Element | Description |
|---------|-------------|
| Search bar | Search by festival name |
| Filter dropdown | Filter by status (All, Draft, Published, Active, Completed, Archived) |
| Create Festival button | Navigate to creation form |
| Festival cards | Card for each festival showing name, dates, status badge, participant count |

## 4.2 Festival Detail Dashboard

| Tab | Content |
|-----|---------|
| Overview | Status badge, countdown, stats (registrations, competitions, judges, volunteers) |
| Competitions | List of competitions with status, participants, judges |
| Registrations | Participant list with statuses |
| Schedule | Visual schedule grid |
| Judges | Assigned judge list |
| Finance | Revenue, payments, expenses |
| Settings | Edit festival configuration |

---

# Section 5: Every Form

## 5.1 Festival Creation/Edit Form

| Section | Field | Type | Required | Validation |
|---------|-------|------|----------|------------|
| Basic Info | Festival Name | text | Yes | 2-200 characters |
| Basic Info | Description | textarea | Yes | 10-5000 characters |
| Basic Info | Tagline | text | No | Max 100 characters |
| Basic Info | Festival Type | dropdown | Yes | Physical, Virtual, Hybrid |
| Dates | Start Date | date | Yes | Must be in the future |
| Dates | End Date | date | Yes | Must be after start_date |
| Dates | Registration Opens | datetime | Yes | Before registration_closes |
| Dates | Registration Closes | datetime | Yes | After registration_opens |
| Capacity | Max Participants | number | No | 1-100000 |
| Venue | Main Venue | text | Yes | 2-200 characters |
| Venue | Venue Address | textarea | Yes | Max 1000 characters |
| Financial | Registration Fee | decimal | Yes | 0-1000000 |
| Financial | Currency | dropdown | Yes | INR, USD, EUR, GBP |
| Branding | Banner Image | file | No | 1920x400px, max 5MB |

---

# Section 7: Step-by-Step Guide

## 7.1 Creating a Festival

**Step 1:** From the dashboard, click **Create Festival**.

**Step 2:** Enter the **Festival Name** (e.g., "District Youth Festival 2025").

**Step 3:** Write a **Description** explaining the festival's purpose and scope.

**Step 4:** Set the **Start Date** and **End Date** for the festival.

**Step 5:** Configure **Registration Opens** and **Registration Closes** dates.

**Step 6:** Set **Max Participants** (leave empty for unlimited).

**Step 7:** Enter the **Main Venue** and **Address**.

**Step 8:** Set the **Registration Fee** (0 for free events).

**Step 9:** Optionally upload a **Banner Image** and customize the **Theme Color**.

**Step 10:** Click **Save Festival**.

**Step 11:** The festival is created in **Draft** status.

**Step 12:** Add competition categories and competitions (see Competition module).

**Step 13:** When ready, click **Publish** to make visible on the public portal.

## 7.2 Publishing a Festival

**Step 1:** Navigate to the festival dashboard.

**Step 2:** Click the **Publish** button in the status section.

**Step 3:** Confirm in the dialog: "Publish this festival? It will be visible on the public portal."

**Step 4:** Festival status changes from Draft to Published.

**Step 5:** Registration can now be opened.

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| FEST-001 | Festivals can only exist within an organization | FK constraint |
| FEST-002 | End date must be after start date | Application validation |
| FEST-003 | Registration close must be before start date | Application validation |
| FEST-004 | Festival name must be unique within an organization | Application validation |
| FEST-005 | Published festivals cannot be deleted (must cancel first) | Application check |
| FEST-006 | Cancelled festivals auto-notify all participants | Server Action |
| FEST-007 | Archived festivals are read-only | UI disable + RLS |
| FEST-008 | Fee changes after registrations require admin approval | Application check |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Festival Director | Manager |
|-----------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|
| Create festival | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit festival | ✅ | ✅ | ✅ | ✅ | ❌ |
| Publish/unpublish | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cancel festival | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete festival | ✅ | ✅ | ✅ | ❌ | ❌ |
| Archive festival | ✅ | ✅ | ✅ | ✅ | ✅ |
| View festival data | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# Section 34: Troubleshooting

## P1: Cannot create festival
**Problem:** Save button disabled or returns error.
**Reasons:** Missing required fields, end date before start date, registration dates invalid.
**Solution:** Check all required fields (marked with *). Ensure dates are logical (start < end, registration opens before closes).

## P2: Festival not appearing on public portal
**Problem:** Published festival is not visible to the public.
**Reasons:** Festival is in Draft status (not Published), or "Visible on Public Portal" setting is disabled.
**Solution:** Check festival status is "Published". Verify settings → Visibility → "Visible on Public Portal" is ON.

## P3: Cannot publish festival
**Problem:** "Publish" button is disabled.
**Reasons:** Festival has no competitions, or required configuration incomplete.
**Solution:** Add at least one competition before publishing. Complete all required festival settings.

## P4: Cannot cancel festival
**Problem:** Cancel button does not work.
**Reasons:** Insufficient permissions (needs Org Admin+), or refund processing failed.
**Solution:** Verify user role. Ensure payment gateway is accessible for refund processing.

---

*End of Festival Management Module Documentation*
