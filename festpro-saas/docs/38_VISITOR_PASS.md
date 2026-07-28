# FestPro Visitor Pass & Badge System — Complete Official Documentation

**Module:** 38 — Visitor Pass & Badge System  
**Version:** 1.0  
**Applies To:** Reception, Security, Registration

---

# Section 1: Introduction

The Visitor Pass module manages physical and digital passes for participants, staff, volunteers, sponsors, and guests. Supports QR-coded badges, access level control, and entry/exit logging.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Badge Types | Participant, Staff, VIP, Sponsor, Volunteer, Guest |
| QR Code | Unique QR on each badge for check-in |
| Access Levels | Restricted area permissions per badge type |
| Bulk Print | Print badge sheets for large groups |
| Digital Pass | Mobile wallet pass (Apple Wallet / Google Pay) |
| Entry Log | Gate entry/exit tracking |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Pass Types | `/dashboard/festivals/[id]/passes/types` | Badge templates |
| Issue Pass | `/dashboard/festivals/[id]/passes/issue` | Generate passes |
| Bulk Print | `/dashboard/festivals/[id]/passes/bulk-print` | Print badge sheets |
| Entry Log | `/dashboard/festivals/[id]/passes/entries` | Gate scan log |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| PASS-001 | Each pass has a unique QR code linked to the individual |
| PASS-002 | VIP and Sponsor passes grant additional access areas |
| PASS-003 | Lost passes can be revoked and reissued |
| PASS-004 | Entry log records: pass ID, gate, timestamp, direction (in/out) |

---

*End of Visitor Pass Module Documentation (Module 38)*
