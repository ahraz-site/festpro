# FestPro Organization Management — Complete Official Documentation

**Module:** Organization Management  
**Version:** 1.0  
**Dependencies:** Authentication Module (01)  
**Applies To:** Organization Owners, Organization Admins, Platform Admins

---

# Section 1: Introduction

## 1.1 What This Module Is

The Organization Management module is the tenant foundation of FestPro. An organization represents a legal or operational entity — a school district, a cultural association, a festival committee — that uses FestPro to manage its festivals. All data in the platform (festivals, competitions, participants, finances) belongs to exactly one organization and is isolated from every other organization.

## 1.2 Why It Exists

FestPro is a multi-tenant platform. Without the Organization module:
- Data from different customers would commingle, creating privacy violations
- Users could see and modify data across different entities
- Billing and subscription management would be impossible
- Branding and customization per customer would not be feasible

The Organization module provides the tenant boundary that keeps each customer's data completely isolated.

## 1.3 When to Use It

An organization must be created before any other module can be used. Specifically:
- **First login:** User is prompted to create their organization
- **New festival:** Belongs to the currently selected organization
- **Team management:** Members are added to the current organization
- **Billing:** Subscription is per organization
- **Customization:** Branding, language, and timezone are per organization

## 1.4 Business Purpose

| Purpose | Implementation |
|---------|---------------|
| Customer isolation | Each organization has a unique ID; all tables have org_id FK |
| Brand differentiation | Logo, colors, custom domain per org |
| Team collaboration | Members share org context, roles |
| Billing boundary | Subscription plan tied to org |
| Data ownership | Organization controls its data lifecycle |

## 1.5 Real-World Examples

**Example 1 — School District:** The Kerala Education Department creates one organization for the District Youth Festival. They invite 10 schools as team members. Each school's coordinator has `manager` role within this organization.

**Example 2 — Cultural Association:** A local cultural society uses FestPro for three separate events throughout the year — all under one organization. They reuse competition templates and participant lists across events.

**Example 3 — Corporate Event:** A company creates an organization for its annual talent show. They invite HR staff as admins, department heads as judges, and employees as participants — all within the same organization.

---

# Section 2: Before You Start

## 2.1 Requirements

| Requirement | Specification |
|-------------|---------------|
| Authenticated user | Must have completed signup and email verification |
| Unique organization name | Not already in use by another org |
| Valid email | For receiving notifications and verification |

## 2.2 Permissions

| Operation | Required Role |
|-----------|---------------|
| Create organization | Any authenticated user (auto-created on signup) |
| Edit organization settings | Organization Owner, Organization Admin |
| Delete organization | Organization Owner only |
| Transfer ownership | Organization Owner only |
| View organization data | Any organization member |

## 2.3 Dependencies

| Dependency | Module | Notes |
|------------|--------|-------|
| User authentication | Authentication Module | User must be logged in |
| Database schema | 00001_auth_schema.sql | organizations table must exist |

## 2.4 Configuration Checklist

- [ ] Organization name and slug verified as unique
- [ ] Logo uploaded (optional)
- [ ] Contact information filled
- [ ] Timezone configured (default: Asia/Kolkata)
- [ ] Language preference set (English/Malayalam)
- [ ] Branding customized (optional)
- [ ] Custom domain configured (optional)
- [ ] Billing plan selected (if applicable)

---

# Section 3: Navigation

## 3.1 Organization Pages

| Page | URL | Purpose |
|------|-----|---------|
| Organization Settings | `/dashboard/settings/organization` | Edit org details |
| Team Management | `/dashboard/settings/team` | Manage members |
| Billing | `/dashboard/settings/billing` | Subscription and invoices |
| Danger Zone | `/dashboard/settings/danger` | Delete org, transfer |

## 3.2 Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│ [Org Logo] Organization Name        [👤 User] [⚙️]      │
├──────────────────────────────────────────────────────────┤
│   ┌─── Dashboard ──────────────────────────────────────┐ │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│   │  │Active   │ │Total    │ │Upcoming │ │Revenue  │ │ │
│   │  │Festivals│ │Partici- │ │Events   │ │Summary  │ │ │
│   │  │   3     │ │pants    │ │         │ │₹ 50,000│ │ │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │
│   │                                                    │ │
│   │  [Create Festival] [Invite Team] [Reports]         │ │
│   │                                                    │ │
│   │  Recent Registrations              Upcoming Events │ │
│   │  ┌────────────────────┐  ┌────────────────────┐   │ │
│   │  │ Aarav - Kathakali  │  │ Youth Fest - Jul 15│   │ │
│   │  │ Meera - Group Song │  │ Dance Comp - Jul 20│   │ │
│   │  │ Rohit - Painting   │  │ Music Fest - Aug 5 │   │ │
│   │  └────────────────────┘  └────────────────────┘   │ │
│   └────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  Sidebar: Dashboard │ Festivals │ Finance │ Settings     │
└──────────────────────────────────────────────────────────┘
```

---

# Section 4: Screen Overview

## 4.1 Organization Dashboard

| Widget | Description | Data Source |
|--------|-------------|-------------|
| Active Festivals | Count of festivals with status 'published' or 'active' | festivals table |
| Total Participants | Count of confirmed participants across all festivals | registrations table |
| Upcoming Events | Next 5 festivals sorted by start date | festivals table |
| Revenue Summary | Total collected vs pending fees | finance_transactions table |

## 4.2 Organization Settings Screen

| Section | Content |
|---------|---------|
| General | Name, slug, logo, contact info, timezone, language |
| Branding | Theme color, banner image, custom domain |
| Localization | Language, date format, time format, currency |

---

# Section 5: Every Form

## 5.1 Organization Creation Form

| Field | Label | Type | Required | Validation | Default | Placeholder |
|-------|-------|------|----------|------------|---------|-------------|
| name | Organization Name | text | Yes | 2-200 characters, unique | Empty | e.g., Kerala Youth Festival |
| slug | URL Slug | text | Yes | Auto-generated, unique, 3-100 chars, lowercase+hyphens only | From name + random 4 chars | kerala-youth-festival-ab12 |
| logo_url | Organization Logo | file | No | PNG/JPG/SVG, max 2MB, 512x512 recommended | Empty | — |
| contact_email | Contact Email | email | No | Valid email | Empty | admin@example.com |
| contact_phone | Contact Phone | tel | No | Valid phone | Empty | +91-9876543210 |
| address | Address | textarea | No | Max 500 chars | Empty | Street, City, State |
| website | Website URL | url | No | Valid URL | Empty | https://example.com |

## 5.2 Organization Settings Form

| Field | Label | Type | Required | Editable By |
|-------|-------|------|----------|-------------|
| name | Organization Name | text | Yes | Owner, Admin |
| slug | URL Slug | text | Yes | Owner only |
| logo_url | Logo | file | No | Owner, Admin |
| contact_email | Contact Email | email | No | Owner, Admin |
| contact_phone | Contact Phone | tel | No | Owner, Admin |
| address | Address | textarea | No | Owner, Admin |
| website | Website URL | url | No | Owner, Admin |
| timezone | Timezone | dropdown | Yes | Owner, Admin |
| language | Default Language | dropdown | Yes | Owner, Admin |

---

# Section 6: Every Button

| Button | Location | Action | Permission |
|--------|----------|--------|------------|
| Save Settings | Organization Settings | Updates org record | Owner/Admin |
| Delete Organization | Danger Zone | Initiates deletion process | Owner only |
| Transfer Ownership | Danger Zone | Transfers org to another admin | Owner only |
| Switch Organization | Navigation dropdown | Changes active org context | Any member |

---

# Section 7: Step-by-Step Guide

## 7.1 Creating an Organization (New User)

**Step 1:** Complete signup and email verification.

**Step 2:** On first login, you are prompted to create an organization.

**Step 3:** Enter the organization name (e.g., "Kerala Youth Festival Association").

**Step 4:** Review the auto-generated slug. Edit if desired (must be unique).

**Step 5:** Optionally upload a logo image.

**Step 6:** Enter contact details (email, phone, address).

**Step 7:** Click **Create Organization**.

**Step 8:** The system creates the organization and assigns you as `organization_owner`.

**Step 9:** You are redirected to the organization dashboard.

**Step 10:** The onboarding checklist appears.

## 7.2 Switching Organizations

**Step 1:** Click the organization name/logo in the top navigation bar.

**Step 2:** A dropdown shows all organizations you belong to.

**Step 3:** Current organization is marked with a checkmark.

**Step 4:** Click the organization you want to switch to.

**Step 5:** The page refreshes with the new organization's context.

---

# Section 8: Real Workflow

```
User signs up → Email verified → First login
    │
    ▼
Prompted to create organization
    │
    ▼
Fill in: Name, Slug, Logo, Contact, Timezone
    │
    ▼
System creates:
  - organizations row
  - organization_members row (role: organization_owner)
  - Updates profiles.organization_id
    │
    ▼
Redirected to organization dashboard
    │
    ▼
Onboarding checklist shown:
  → Invite team members
  → Create first festival
  → Configure branding
```

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ORG-001 | Organization name must be unique | Database unique constraint + app check |
| ORG-002 | Organization slug must be unique | Database unique constraint |
| ORG-003 | Reserved slugs cannot be used | Application-level validation |
| ORG-004 | First user of an org gets 'organization_owner' role | Server Action |
| ORG-005 | Only the owner can delete the org | Server Action + RLS |
| ORG-006 | Only the owner can transfer ownership | Server Action + RLS |
| ORG-007 | Deletion has 30-day grace period | Application logic |
| ORG-008 | Data is soft-deleted first, hard-deleted after 30 days | Background job |
| ORG-009 | Organization cannot be deleted if active festivals exist | Application check |
| ORG-010 | Organization cannot be deleted if outstanding finances exist | Application check |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Others |
|-----------|:--------------:|:---------:|:---------:|:------:|
| View org | ✅ | ✅ | ✅ | ✅ |
| Edit org name | ✅ | ✅ | ✅ | ❌ |
| Edit org slug | ✅ | ✅ | ❌ | ❌ |
| Upload logo | ✅ | ✅ | ✅ | ❌ |
| Delete org | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ✅ | ❌ | ❌ |
| View team | ✅ | ✅ | ✅ | ✅ |
| Manage team | ✅ | ✅ | ✅ | ❌ |
| View billing | ✅ | ✅ | ✅ | ❌ |

---

# Section 11: Notifications

| Notification | Trigger | Channel |
|-------------|---------|---------|
| Organization created | Owner signup | Email (welcome) |
| Organization settings changed | Settings update | Email to owner |
| Organization deletion scheduled | Delete initiated | Email to all members |
| Organization deleted | Deletion confirmed | Email to all members |
| Ownership transferred | Transfer completed | Email to new and old owner |

---

# Section 12: Reports

No dedicated reports for organization management. Organization-level data appears in:
- Platform admin dashboard (all orgs overview)
- Billing reports (subscription status per org)

---

# Section 28: Best Practices

1. **Choose a descriptive organization name** that reflects your entity (school name, association name).
2. **Use a permanent email** for org contact — not a personal email that may change.
3. **Upload a logo** — it appears on public portals and all communications.
4. **Set the timezone correctly** — all event times are calculated relative to this setting.
5. **Keep the slug short and memorable** — it appears in the public portal URL.
6. **Add at least one co-owner** in case the primary owner is unavailable.
7. **Review team members quarterly** — remove inactive members for security.
8. **Archive old festivals** — improves dashboard performance.
9. **Use custom domain for public portal** — enhances brand identity.
10. **Configure language settings before creating festivals** — avoids localization rework.

---

# Section 29: Common Mistakes

1. **Using a personal email as org contact** — if the person leaves, the org loses its primary contact.
2. **Not approving the slug before sharing links** — changing the slug later breaks shared URLs.
3. **Not setting the timezone** — event times default to UTC, causing confusion.
4. **Creating multiple organizations unnecessarily** — one org can host unlimited festivals.
5. **Forgetting to add backup admins** — if the owner loses access, recovery is difficult.
6. **Not checking Danger Zone permissions** — only the owner can delete; ensure the owner's account is secure.
7. **Uploading an oversized logo** — 2MB limit; larger files cause upload failures.
8. **Not reviewing org settings after initial setup** — some defaults may not match requirements.
9. **Deleting the org instead of archiving** — archiving preserves data; deletion permanently removes it.
10. **Ignoring the onboarding checklist** — it guides through essential setup steps.

---

# Section 34: Troubleshooting

## P1: Cannot create organization
**Problem:** "Organization creation failed" error.
**Reasons:** Slug already taken, name too long, database constraint violation.
**Solution:** Try a different name/slug. Contact support if the problem persists.

## P2: Cannot edit organization settings
**Problem:** Save button does not update settings.
**Reasons:** User does not have permission, or validation error.
**Solution:** Verify you have Owner or Admin role. Check all fields for validation errors.

## P3: Cannot delete organization
**Problem:** Delete button is disabled.
**Reasons:** Active festivals exist, or pending financial transactions.
**Solution:** Cancel/archive all festivals. Settle all outstanding finances. Then try again.

## P4: Organization logo not displaying
**Problem:** Logo shows as broken image.
**Reasons:** File was deleted from storage, or URL is incorrect.
**Solution:** Re-upload the logo in Organization Settings.

## P5: Cannot switch organization
**Problem:** Other organizations not appearing in dropdown.
**Reasons:** User is not a member of any other organization.
**Solution:** Ask an admin of the target organization to invite you.

---

*End of Organization Management Module Documentation*
