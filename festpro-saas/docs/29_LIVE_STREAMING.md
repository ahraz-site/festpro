# FestPro Live Streaming — Complete Official Documentation

**Module:** 29 — Live Streaming  
**Version:** 1.0  
**Applies To:** Media Team, Technical Staff

---

# Section 1: Introduction

The Live Streaming module enables real-time broadcast of festival events to remote audiences. It integrates with streaming platforms (YouTube Live, Facebook Live, custom RTMP endpoints) and provides embedded players for the public portal.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| RTMP Streaming | Stream to custom RTMP endpoints |
| Platform Integration | YouTube Live, Facebook Live |
| Embedded Player | Public portal embed with chat |
| Stream Schedule | Scheduled go-live times per event |
| Stream Status | Live, Offline, Scheduled, Ended |
| Multi-camera | Multiple stream sources (future) |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Streams | `/dashboard/festivals/[id]/streaming` | All streams |
| New Stream | `/dashboard/festivals/[id]/streaming/new` | Create stream |
| Stream Control | `/dashboard/festivals/[id]/streaming/[id]/control` | Go live, end stream |
| Embed Code | `/dashboard/festivals/[id]/streaming/[id]/embed` | Get embed HTML |

---

# Section 3: Every Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Stream Title | text | Yes | Display title |
| Event/Competition | dropdown | Yes | Link to competition |
| Platform | dropdown | Yes | YouTube, Facebook, Custom RTMP |
| Stream Key/URL | text | Yes | RTMP URL or platform stream key |
| Scheduled Start | datetime | Yes | When stream goes live |
| Scheduled End | datetime | Yes | Expected end time |
| Public URL | url | No | Embed on public portal |

---

# Section 4: Business Rules

| Rule ID | Rule |
|---------|------|
| STREAM-001 | Only one active stream per competition at a time |
| STREAM-002 | Stream keys are stored encrypted |
| STREAM-003 | Public portal embed is available only for streams with Public visibility |
| STREAM-004 | Stream recording URLs can be saved post-event for on-demand viewing |

---

*End of Live Streaming Module Documentation (Module 29)*
