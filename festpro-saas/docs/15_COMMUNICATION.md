# FestPro Communication Module — Complete Official Documentation

**Module:** Communication & Notifications  
**Version:** 1.0  
**Dependencies:** Registration (06), Festival (04)  
**Applies To:** Festival Directors, Managers

---

# Section 1: Introduction

The Communication module manages all outbound notifications — email, SMS, push, and WhatsApp. It supports pre-built templates, scheduled broadcasts, and automated trigger-based messaging.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Broadcast | `/dashboard/festivals/[id]/communication/broadcast` | Send messages |
| Templates | `/dashboard/festivals/[id]/communication/templates` | Manage message templates |
| History | `/dashboard/festivals/[id]/communication/history` | Sent message log |

---

# Section 5: Every Form

## 5.1 Template Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Template Name | text | Yes | Internal name |
| Channel | dropdown | Yes | Email, SMS, Push, WhatsApp |
| Subject (Email) | text | For Email | Email subject line |
| Body | rich text / SMS text | Yes | Message with variables |

## 5.2 Template Variables

| Variable | Example |
|----------|---------|
| `{{participant_name}}` | Aarav Sharma |
| `{{festival_name}}` | District Youth Festival 2025 |
| `{{competition_name}}` | Kathakali |
| `{{schedule}}` | 15 Jan 2025, 10:00 AM, Stage A |
| `{{rank}}` | 1st |
| `{{score}}` | 91.5 |
| `{{download_url}}` | https://.../certificate.pdf |

## 5.3 Broadcast Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Recipient Group | dropdown | Yes | All participants, specific competition, judges, volunteers |
| Template | dropdown | Yes | Select pre-built template |
| Custom Subject | text | For Email | Override template subject |
| Schedule | datetime | No | Send now or schedule |
| Preview | button | — | Preview message before sending |

---

# Section 7: Step-by-Step Guide

## 7.1 Sending a Broadcast

**Step 1:** Navigate to Communication → Broadcast.

**Step 2:** Select **Recipient Group** (All participants / Specific competition / Judges / Volunteers).

**Step 3:** Select a **Template**.

**Step 4:** Review the preview with sample data.

**Step 5:** Optionally set a **Schedule** for future delivery.

**Step 6:** Click **Send**.

**Step 7:** The broadcast status changes: Draft → Sending → Sent / Partial.

**Step 8:** View delivery status in Communication → History.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| COMM-001 | Email rate limit: 100/hour, max 1000 recipients |
| COMM-002 | SMS rate limit: 20/minute, max 500 recipients |
| COMM-003 | Push notifications: unlimited |
| COMM-004 | WhatsApp rate limit: 1000/day, max 1000 recipients |
| COMM-005 | Broadcasts to >100 recipients are queued for async delivery |
| COMM-006 | Failed deliveries are logged with error reason |
| COMM-007 | Templates can be previewed before sending |
| COMM-008 | Scheduled broadcasts can be cancelled before send time |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Festival Director | Manager | Others |
|-----------|:--------------:|:---------:|:-----------------:|:-------:|:------:|
| Send broadcast | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage templates | ✅ | ✅ | ✅ | ✅ | ❌ |
| View history | ✅ | ✅ | ✅ | ✅ | ❌ |
| Receive notifications | ✅ | ✅ | ✅ | ✅ | ✅ |

---

*End of Communication Module Documentation*
