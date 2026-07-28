# FestPro Digital Signage — Complete Official Documentation

**Module:** 37 — Digital Signage / Display Management  
**Version:** 1.0  
**Applies To:** Media Team, Technical Staff

---

# Section 1: Introduction

The Digital Signage module powers large-screen displays at festival venues — showing live schedules, results, stage queues, sponsor messages, and announcements. Content is auto-rotated and can be controlled remotely.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Screen Management | Register screens by venue/location |
| Content Playlist | Schedule content rotation per screen |
| Live Results | Real-time score display |
| Stage Queue | Next 5 performers on screen |
| Announcements | Scrolling ticker for important messages |
| Sponsor Rotation | Sponsor logo display in rotation |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Screens | `/dashboard/festivals/[id]/signage/screens` | All registered screens |
| Content | `/dashboard/festivals/[id]/signage/content` | Content playlist |
| Display URL | `/dashboard/festivals/[id]/signage/display/[screenId]` | Full-screen display page |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| SIGN-001 | Display page auto-refreshes every 15 seconds |
| SIGN-002 | Content rotation order: Live updates > Scheduled > Sponsor rotation |
| SIGN-003 | Maximum 5 scrolling announcements at a time |
| SIGN-004 | Screen orientation (landscape/portrait) configurable per screen |

---

*End of Digital Signage Module Documentation (Module 37)*
