# FestPro Team & Role Management — Complete Official Documentation

**Module:** Team & Role Management  
**Version:** 1.0  
**Dependencies:** Organization (02)  
**Applies To:** Organization Owners, Organization Admins

---

# Section 1: Introduction

## 1.1 What This Module Is

The Team & Role Management module controls who can access the organization's data and what actions they can perform. FestPro uses a role-based access control (RBAC) system with 12 predefined roles organized in a hierarchy. Each role has specific permissions that determine which modules, screens, and operations a user can access.

## 1.2 Why It Exists

Festivals involve diverse stakeholders: planners, judges, finance officers, volunteers, and participants. Each needs different levels of access. Without structured role management, either everyone would have full access (security risk) or everyone would be locked out (operational nightmare). The RBAC system provides fine-grained control that matches real-world organizational structures.

## 1.3 Business Purpose

| Purpose | Implementation |
|---------|----------------|
| Separation of duties | Finance cannot modify judging data; judges cannot access finances |
| Delegation | Festival Directors manage day-to-day; Owners focus on strategy |
| Security | Least-privilege access reduces data breach risk |
| Audit trail | Actions attributed to specific users and roles |

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Team List | `/dashboard/settings/team` | All members, roles, statuses |
| Invite Member | `/dashboard/settings/team/invite` | Send invitation form |
| Member Detail | `/dashboard/settings/team/[id]` | Edit member role or permissions |

---

# Section 5: Role Definitions

## 5.1 Role Hierarchy

```
Platform Owner (1 per platform)
  └── Platform Admin
       └── Organization Owner (1+ per org)
            └── Organization Admin
                 └── Festival Director
                      └── Manager
                           ├── Staff
                           ├── Judge
                           ├── Finance
                           ├── Media
                           ├── Volunteer
                           └── Reception
                                └── Participant
```

## 5.2 Role Permissions Matrix

| Permission Group | Platform Owner | Org Owner | Org Admin | Festival Director | Manager | Judge | Finance | Media | Volunteer | Reception | Participant |
|-----------------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:-----:|:-------:|:-----:|:---------:|:---------:|:-----------:|
| Platform settings | ✅ | — | — | — | — | — | — | — | — | — | — |
| Org management | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — |
| Team management | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — |
| Festival CRUD | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| Competition CRUD | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — |
| Registration | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — |
| Judging | — | — | — | — | — | ✅ | — | — | — | — | — |
| Finance | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — |
| Media upload | — | — | — | — | — | — | — | ✅ | — | ✅ | — |
| Volunteer ops | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — |
| Check-in | — | — | — | — | — | — | — | — | — | ✅ | — |
| Own results | — | — | — | — | — | — | — | — | — | — | ✅ |

---

# Section 7: Step-by-Step Guide

## 7.1 Inviting a Team Member

**Step 1:** Navigate to **Settings → Team**.

**Step 2:** Click **Invite Member**.

**Step 3:** Enter the person's **Email Address**.

**Step 4:** Select a **Role** from the dropdown:
   - Admin (org_admin)
   - Festival Director (festival_director)
   - Manager (manager)
   - Staff (staff)
   - Judge (judge)
   - Finance (finance)
   - Media (media)
   - Volunteer (volunteer)
   - Reception (reception)

**Step 5:** Optionally restrict to specific festivals (for Director/Manager roles).

**Step 6:** Optionally restrict to specific competitions (for Judge role).

**Step 7:** Click **Send Invitation**.

**Step 8:** If the email belongs to an existing user, they receive a notification.

**Step 9:** If the email is not registered, they receive an invitation email with signup link.

**Step 10:** Status shows as "Pending" until accepted.

## 7.2 Changing a Member's Role

**Step 1:** Go to **Settings → Team**.

**Step 2:** Click on the member whose role you want to change.

**Step 3:** Click **Edit** in the role section.

**Step 4:** Select the new role from the dropdown.

**Step 5:** Optionally add a note about the change.

**Step 6:** Click **Save Changes**.

**Step 7:** The member is notified of the role change.

**Step 8:** An audit log entry is created.

## 7.3 Removing a Team Member

**Step 1:** Go to **Settings → Team**.

**Step 2:** Click the Remove button (trash icon) next to the member.

**Step 3:** Confirmation dialog: "Remove [name] from organization?"

**Step 4:** Optionally check "Notify member about removal."

**Step 5:** Click **Confirm Remove**.

**Step 6:** The member's access is immediately revoked.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| TEAM-001 | An organization must have at least one owner |
| TEAM-002 | The last owner cannot be removed (must transfer ownership first) |
| TEAM-003 | A member can only be assigned a role that is at or below the inviter's role |
| TEAM-004 | Email must be unique within the organization (one membership per user per org) |
| TEAM-005 | Invitations expire after 7 days |
| TEAM-006 | Role changes are logged in the audit trail |
| TEAM-007 | Removed members lose access to all organization data immediately |
| TEAM-008 | Platform roles (owner, admin) cannot be assigned by org-level users |
| TEAM-009 | Custom permission overrides are highlighted in the UI |
| TEAM-010 | Bulk invitation processes in batch; invalid rows are reported |

---

# Section 28: Best Practices

1. **Assign the minimum role necessary** — start with a lower role and upgrade if needed.
2. **Use Festival Director role for coordinators** — they need management access but not org settings.
3. **Use Judge role strictly for scoring** — judges should not have access to financial or participant data.
4. **Review team membership quarterly** — remove inactive members.
5. **Document role assignments** — add notes when changing roles for audit purposes.
6. **Train team members on their role's capabilities** — so they know what they can and cannot do.
7. **Limit org admin count** — 2-3 admins maximum to prevent unauthorized changes.
8. **Use invitations instead of manual creation** — ensures email verification.
9. **Monitor pending invitations** — resend if not accepted within 48 hours.
10. **Never assign platform roles through the application** — these are system-managed only.

---

*End of Team & Role Management Module Documentation*
