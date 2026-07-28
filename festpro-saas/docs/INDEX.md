# FestPro Enterprise Platform — Official Documentation

**Product:** FestPro Enterprise SaaS 2025  
**Document Version:** 1.0  
**Classification:** Internal / Customer-Facing  
**Audience:** System Administrators, Organization Owners, Festival Directors, End Users

---

## Documentation Modules

| Module | File | Description |
|--------|------|-------------|
| 1 | `01_AUTHENTICATION.md` | Authentication, sessions, MFA, password management |
| 2 | `02_ORGANIZATION.md` | Organization management, branding, settings |
| 3 | `03_TEAM_ROLES.md` | Team management, RBAC, permissions |
| 4 | `04_FESTIVAL.md` | Festival lifecycle, creation, management |
| 5 | `05_COMPETITION.md` | Competition setup, categories, age groups |
| 6 | `06_REGISTRATION.md` | Participant registration, check-in, bulk import |
| 7 | `07_JUDGING_SCORING.md` | Judging, scoring methodologies, rubrics |
| 8 | `08_SCHEDULING.md` | Venue management, scheduling, conflicts |
| 9-10 | `09_10_RESULTS_CERTIFICATES.md` | Results engine + Certificate templates |
| 11 | `11_FINANCE.md` | Fees, payments, refunds, reports |
| 12 | `12_VOLUNTEERS.md` | Volunteer management, shifts, attendance |
| 13 | `13_ACCOMMODATION.md` | Room allocation, check-in/out |
| 14 | `14_MEDICAL.md` | Medical incidents, first-aid tracking |
| 15 | `15_COMMUNICATION.md` | Notifications, broadcasts, templates |
| 16 | `16_MEDIA_GALLERY.md` | Media upload, gallery, organization |
| 17 | `17_PUBLIC_PORTAL.md` | Public-facing website, registration |
| 18 | `18_MOBILE.md` | PWA, offline mode, mobile features |
| 19 | `19_AI_FEATURES.md` | AI scoring, optimization, automation |
| 20 | `20_API.md` | Server Actions, route handlers, integrations |
| 21 | `21_DATABASE.md` | Schema, tables, relationships, indexes |
| 22-23 | `22_23_SECURITY_ADMIN.md` | Security, RLS, encryption, audit, administration |

---

## What Is FestPro

FestPro is a multi-tenant enterprise SaaS platform for managing arts, cultural, and competitive festivals end-to-end. It digitizes the complete lifecycle: organizational setup, participant registration, competition management, judging, results, certificates, financial reconciliation, volunteer coordination, and post-event analytics.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| Multi-Tenancy | Isolated organizations with Row-Level Security |
| Role-Based Access | 12 predefined roles with granular permissions |
| Scalable Architecture | Cloud-native on Vercel + Supabase (PostgreSQL) |
| Real-Time Results | Live score aggregation and publication |
| Multi-Channel Notifications | Email, SMS, Push, WhatsApp |
| Offline Mobile Access | PWA with offline data sync |
| Bilingual Interface | English and Malayalam |
| Payment Processing | UPI, Card, NetBanking, Cash |
| Certificate Engine | Template-based bulk certificate generation |
| Analytics & Reports | 15+ report types with visualization |

### Architecture

```
Client Layer (Browser/PWA) → Next.js 16 App Router + Server Actions → Supabase (PostgreSQL + Auth + Storage)
```

Data flows through Server Actions that enforce authentication, authorization, and business rules before interacting with the database. Row-Level Security provides a second layer of access control at the database level.

### Who Should Read This

| Role | Relevant Sections |
|------|-------------------|
| Platform Administrator | 1, 2, 3, 22, 23 |
| Organization Owner | 2, 3, 4, 5, 6, 11, 22 |
| Festival Director | 4, 5, 6, 7, 8, 9, 10 |
| Judge | 7 |
| Finance Officer | 11 |
| Volunteer Coordinator | 12 |
| Reception Staff | 6 |
| Participant | 6, 8, 9, 10 |
| Developer | 20, 21, 22 |

---

## Core Concepts

### Multi-Tenant Data Model

Every data row carries an `organization_id` foreign key. RLS policies enforce strict data isolation:

- Organization A's team cannot see Organization B's data
- A user can belong to multiple organizations with different roles in each
- Cross-organization operations are blocked at the database level

### Role Hierarchy

```
Platform Owner
  └── Platform Admin
       └── Organization Owner
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

Each role inherits permissions from roles below it in the hierarchy.

### Festival Lifecycle

```
Draft → Published → Registration Open → Registration Closed →
Active (Competition Days) → Results Published → Completed → Archived
```

### Scoring Methodologies

| Method | Description | Use Case |
|--------|-------------|----------|
| Points-Based | Weighted criteria with max scores | Dance, Music, Drama |
| Rank-Based | Ordinal ranking (1st, 2nd, 3rd) | Sports, Debates |
| Pass/Fail | Binary result with threshold | Qualifying rounds |
| Hybrid | Combination of methods | Multi-round competitions |

---

## Conventions Used in This Documentation

| Convention | Meaning |
|------------|---------|
| **Bold text** | UI element name, button label, field name |
| `Code blocks` | Code examples, API endpoints, file paths |
| → | Navigation path (e.g., **Settings** → **Team**) |
| ✅ | Supported / Available |
| ❌ | Not supported / Not available |
| ⚠️ | Important warning or caution |
| 💡 | Tip or best practice |

---

## Getting Help

- **In-App Support:** Click the help icon (?) in the top navigation bar
- **Email:** support@festpro.app
- **Documentation:** This documentation set in the `docs/` directory
- **Status Page:** https://status.festpro.app

---

*Next: Read `01_AUTHENTICATION.md` for authentication and account management.*
