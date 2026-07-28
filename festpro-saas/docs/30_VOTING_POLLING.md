# FestPro Voting & Polling — Complete Official Documentation

**Module:** 30 — Voting & Polling  
**Version:** 1.0  
**Applies To:** Audience, Judges, Administrators

---

# Section 1: Introduction

The Voting & Polling module enables audience engagement through real-time voting and polling during festivals. Support for popular voting (audience choice awards), live polls during events, and survey collection.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Audience Choice | Vote for favourite performances |
| Live Polls | Real-time questions during events |
| Survey Forms | Post-event feedback collection |
| Results Display | Live results on public portal |
| Anti-spam | One vote per verified user per category |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Polls | `/dashboard/festivals/[id]/polls` | All polls |
| New Poll | `/dashboard/festivals/[id]/polls/new` | Create poll |
| Results | `/dashboard/festivals/[id]/polls/[id]/results` | Live results |
| Voting Categories | `/dashboard/festivals/[id]/voting` | Audience choice categories |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| VOTE-001 | One vote per registered user per category |
| VOTE-002 | Voting opens and closes at configured times |
| VOTE-003 | Live poll results are delayed by 30 seconds (anti-snipe) |
| VOTE-004 | Anonymous voting enabled by default |
| VOTE-005 | Poll creator can end poll early |

---

*End of Voting & Polling Module Documentation (Module 30)*
