# FestPro Help Desk & Ticketing — Complete Official Documentation

**Module:** 35 — Help Desk & Ticketing  
**Version:** 1.0  
**Applies To:** Support Staff, Participants

---

# Section 1: Introduction

The Help Desk module provides a centralised ticketing system for participants, parents, and staff to raise queries, report issues, and request assistance during the festival. Supports prioritisation, assignment, SLAs, and knowledge base.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Ticket Creation | Public and internal ticket submission |
| Categorisation | Type, priority, department |
| Assignment | Auto-assign or manual assign to support staff |
| SLA Tracking | Response and resolution time tracking |
| Knowledge Base | FAQ and self-help articles |
| Status Tracking | Open → In Progress → Resolved → Closed |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard/festivals/[id]/help-desk` | Ticket stats and queue |
| Tickets | `/dashboard/festivals/[id]/help-desk/tickets` | All tickets |
| New Ticket | `/dashboard/festivals/[id]/help-desk/tickets/new` | Create ticket |
| Ticket Detail | `/dashboard/festivals/[id]/help-desk/tickets/[id]` | Conversation and resolution |
| Knowledge Base | `/dashboard/festivals/[id]/help-desk/kb` | Help articles |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| HELP-001 | Critical priority tickets auto-assign within 5 minutes |
| HELP-002 | SLA: Critical — 15 min response, High — 1 hr, Medium — 4 hrs, Low — 24 hrs |
| HELP-003 | Tickets cannot be deleted (only closed) for audit |
| HELP-004 | Participant can view only their own tickets |
| HELP-005 | Escalation after SLA breach — auto-notify manager |

---

*End of Help Desk Module Documentation (Module 35)*
