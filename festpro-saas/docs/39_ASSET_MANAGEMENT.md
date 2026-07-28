# FestPro Asset Management — Complete Official Documentation

**Module:** 39 — Asset Management  
**Version:** 1.0  
**Applies To:** Storekeepers, Logistics, Technical Team

---

# Section 1: Introduction

The Asset Management module tracks high-value physical assets owned or rented by the organisation — sound systems, lighting rigs, stages, generators, furniture, and equipment. Supports depreciation tracking, maintenance scheduling, and assignment tracking.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Asset Registry | Centralised asset catalogue with specifications |
| Assignment | Track which festival/department has each asset |
| Maintenance | Scheduled maintenance reminders |
| Depreciation | Straight-line depreciation calculation |
| Rental Tracking | For rented equipment: return dates, damage deposits |
| Audit | Physical verification check-in/check-out |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Assets | `/dashboard/organization/assets` | Asset registry |
| Asset Detail | `/dashboard/organization/assets/[id]` | Full asset record |
| Assignments | `/dashboard/organization/assets/assignments` | Current assignments |
| Maintenance | `/dashboard/organization/assets/maintenance` | Maintenance schedule |
| Audit | `/dashboard/organization/assets/audit` | Physical verification |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| ASSET-001 | Assets valued >₹50,000 require admin approval for assignment |
| ASSET-002 | Maintenance reminders send 7 days before due date |
| ASSET-003 | Asset cannot be assigned to two festivals simultaneously |
| ASSET-004 | Rental assets must have return date and deposit recorded |
| ASSET-005 | Depreciation calculated annually on 1 April |

---

*End of Asset Management Module Documentation (Module 39)*
