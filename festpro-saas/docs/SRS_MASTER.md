# FestPro Enterprise SRS v1.0

## Software Requirements Specification — Complete Architecture Blueprint

---

# TABLE OF CONTENTS

1. [PROJECT VISION](#1-project-vision)
2. [SYSTEM ARCHITECTURE OVERVIEW](#2-system-architecture-overview)
3. [DATABASE DESIGN — COMPLETE SCHEMA (100+ TABLES)](#3-database-design)
4. [API DOCUMENTATION — 500+ ENDPOINTS](#4-api-documentation)
5. [UI FLOW — 250+ SCREENS](#5-ui-flow)
6. [ROLE & PERMISSION MATRIX](#6-role--permission-matrix)
7. [BUSINESS RULES & VALIDATION](#7-business-rules--validation)
8. [FOLDER STRUCTURE](#8-folder-structure)
9. [CODING STANDARDS](#9-coding-standards)
10. [NOTIFICATION FLOWS](#10-notification-flows)
11. [STATE DIAGRAMS](#11-state-diagrams)
12. [DEPLOYMENT PLAN](#12-deployment-plan)
13. [TESTING STRATEGY](#13-testing-strategy)
14. [DEVELOPMENT ROADMAP](#14-development-roadmap)

---

# 1. PROJECT VISION

## 1.1 Product Name
**FestPro** — Enterprise Festival Management ERP

## 1.2 Vision Statement
To be the world's most comprehensive, scalable, and intelligent platform for managing festivals, competitions, and cultural events at enterprise scale.

## 1.3 Target Audience
- Educational institutions (schools, colleges, universities)
- Government cultural departments
- Large-scale festival organizers
- Event management companies
- Sports associations
- Online competition platforms

## 1.4 Core Value Proposition
- Multi-tenant SaaS architecture with complete data isolation
- End-to-end festival lifecycle management
- Real-time live stage and digital judging
- AI-powered scheduling, scoring, and recommendations
- White-label ready for enterprise branding
- Offline-capable with sync engine

## 1.5 System Qualities
- **Scalability**: Horizontal scaling to 100,000+ concurrent users
- **Security**: Row-Level Security (RLS), end-to-end encryption, audit logging
- **Reliability**: 99.9% uptime, automatic failover, disaster recovery
- **Performance**: Sub-second query responses, CDN-cached assets
- **Extensibility**: Plugin architecture, webhook integrations, public API
- **Accessibility**: WCAG 2.1 AA compliant, multi-language support

## 1.6 Architecture Levels

```
LEVEL 1 — CORE SYSTEM (✅ COMPLETED)
  01 Authentication
  02 Organizations & RBAC
  03 Festival Management
  04 Competition Management
  05 Participant Registration & Management
  06 Smart Scheduling & Live Stage
  07 Enterprise Digital Judging

LEVEL 2 — BUSINESS ENGINE (📋 PLANNED)
  08 Result Engine
  09 Certificate Engine
  10 Team Points Engine
  11 Appeal Engine
  12 Finance Engine
  13 Notification Engine
  14 Report Engine
  15 Public Portal

LEVEL 3 — ENTERPRISE (📋 PLANNED)
  16 Subscription & Billing
  17 White Label / Branding
  18 Public REST API + SDK
  19 Mobile App (React Native)
  20 AI/ML Services
  21 Monitoring & Observability
  22 Backup & Disaster Recovery
  23 Audit & Compliance
  24 CMS (Content Management)
  25 Integrations (WhatsApp, Slack, Zoom, etc.)

LEVEL 4 — VERTICALS (📋 PLANNED)
  26 Sports Management
  27 Science Fair Management
  28 Online Competition Platform
  29 Live Streaming
  30 Voting & Polling
  31 AI Judge / Auto Scoring
  32 Face Recognition
  33 Payment Gateway
  34 Inventory Management
  35 Accommodation Management
  36 Transportation Management
  37 Food & Catering Management
  38 Volunteer Management
  39 Medical / First Aid Desk
  40 Help Desk & Ticketing
  41 Media Center
  42 Digital Signage / Display
  43 Visitor Pass / Badge System
  44 Sponsor & Exhibitor Management
  45 Asset Management
  46 Staff Payroll
  47 Barcode / RFID System
  48 Offline Sync Engine
  49 Disaster Recovery
  50 Analytics & BI Dashboard
```

---

# 2. SYSTEM ARCHITECTURE OVERVIEW

## 2.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js Server Actions, Route Handlers |
| **Database** | Supabase PostgreSQL 16 |
| **Auth** | Supabase Auth (JWT, RLS) |
| **Storage** | Supabase Storage (S3-compatible) |
| **Realtime** | Supabase Realtime (WebSockets) |
| **State** | React Server Components + Client State |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts / D3.js |
| **PDF** | React-PDF / Puppeteer |
| **Queue** | Inngest / BullMQ |
| **Search** | pgvector / Meilisearch |
| **Cache** | Redis (Upstash) |
| **CDN** | Cloudflare / Vercel Edge |
| **Monitoring** | Sentry + OpenTelemetry |
| **Mobile** | React Native (future) |

## 2.2 Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   Web    │  │  Mobile  │  │   Kiosk  │  │  Public API   │  │
│  │  (Next)  │  │ (RN, TBD)│  │ (React)  │  │  (3rd Party)  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │             │             │               │           │
├───────┴─────────────┴─────────────┴───────────────┴───────────┤
│                      EDGE LAYER (Vercel Edge)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   CDN    │  │  Cache   │  │   Auth   │  │  Rate Limit   │  │
│  │  Static  │  │ (Redis)  │  │ (JWT)    │  │  (Upstash)    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │             │             │               │           │
├───────┴─────────────┴─────────────┴───────────────┴───────────┤
│                    APPLICATION LAYER (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Server  │  │  Server  │  │  Route   │  │  Background   │  │
│  │  Actions │  │  Comps   │  │ Handlers │  │  Jobs (Queue) │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │             │             │               │           │
├───────┴─────────────┴─────────────┴───────────────┴───────────┤
│                      SERVICE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Auth     Org    Fest    Comp    Part    Sched   Judge   │   │
│  │  Result   Cert   Points  Appeal  Finance  Notif  Report  │   │
│  │  Sub      White  API     AI      Monitor  Backup  Audit  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               │                                  │
├───────────────────────────────┴──────────────────────────────────┤
│                      DATA LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   PostgreSQL     │  │     Storage      │  │    Redis      │  │
│  │  (Supabase)      │  │   (S3/DO Spaces) │  │   (Cache)     │  │
│  │  100+ Tables     │  │  Photos, Docs,   │  │  Sessions,    │  │
│  │  Row-Level Sec.  │  │  Videos, Cert.   │  │  Rate Limits  │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   Search Index   │  │   Object Store   │  │   Message     │  │
│  │  (Meilisearch)   │  │  (S3 Compatible) │  │   Queue       │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2.3 Multi-Tenancy Model

```
Organization ──► Festivals ──► Competitions ──► Participants
     │                │               │               │
     ▼                ▼               ▼               ▼
  Settings        Days             Rounds         Registrations
  Members         Venues           Judges         Documents
  Roles           Stages           Materials      Medical
  Billing         Sponsors         Rules          Attendance
                  Announcements    Schedule       QR Cards
                  Gallery          Criteria       Teams
                  Documents        Scores
                  Committees       Results
                  Banners          Certificates
```

Every table has `organization_id` for RLS isolation. Cross-organization access is strictly denied at the database level.

---

# 3. DATABASE DESIGN — COMPLETE SCHEMA

## 3.1 Table Inventory

| # | Level | Module | Table Name | Status |
|---|-------|--------|------------|--------|
| — | **LEVEL 1** | **CORE SYSTEM** | | |
| 1 | L1 | 01 | profiles | ✅ |
| 2 | L1 | 01 | profile_verification | ✅ |
| 3 | L1 | 02 | organizations | ✅ |
| 4 | L1 | 02 | organization_members | ✅ |
| 5 | L1 | 02 | organization_settings | ✅ |
| 6 | L1 | 02 | activity_logs | ✅ |
| 7 | L1 | 02 | invitations | ✅ |
| 8 | L1 | 02 | permissions | ✅ |
| 9 | L1 | 02 | role_permissions | ✅ |
| 10 | L1 | 03 | festivals | ✅ |
| 11 | L1 | 03 | festival_settings | ✅ |
| 12 | L1 | 03 | festival_themes | ✅ |
| 13 | L1 | 03 | festival_days | ✅ |
| 14 | L1 | 03 | festival_venues | ✅ |
| 15 | L1 | 03 | festival_stages | ✅ |
| 16 | L1 | 03 | festival_committees | ✅ |
| 17 | L1 | 03 | festival_contacts | ✅ |
| 18 | L1 | 03 | festival_documents | ✅ |
| 19 | L1 | 03 | festival_announcements | ✅ |
| 20 | L1 | 03 | festival_sponsors | ✅ |
| 21 | L1 | 03 | festival_gallery | ✅ |
| 22 | L1 | 03 | festival_banners | ✅ |
| 23 | L1 | 03 | festival_statistics | ✅ |
| 24 | L1 | 04 | competition_categories | ✅ |
| 25 | L1 | 04 | competition_subcategories | ✅ |
| 26 | L1 | 04 | competition_groups | ✅ |
| 27 | L1 | 04 | competitions | ✅ |
| 28 | L1 | 04 | competition_rounds | ✅ |
| 29 | L1 | 04 | competition_rules | ✅ |
| 30 | L1 | 04 | competition_materials | ✅ |
| 31 | L1 | 04 | competition_stage_assignments | ✅ |
| 32 | L1 | 04 | competition_judge_assignments | ✅ |
| 33 | L1 | 04 | competition_time_slots | ✅ |
| 34 | L1 | 04 | competition_results | ✅ |
| 35 | L1 | 04 | competition_eligibility | ✅ |
| 36 | L1 | 05 | participants | ✅ |
| 37 | L1 | 05 | guardians | ✅ |
| 38 | L1 | 05 | institutions | ✅ |
| 39 | L1 | 05 | teams | ✅ |
| 40 | L1 | 05 | team_members | ✅ |
| 41 | L1 | 05 | registrations | ✅ |
| 42 | L1 | 05 | chest_number_sequences | ✅ |
| 43 | L1 | 05 | participant_documents | ✅ |
| 44 | L1 | 05 | medical_information | ✅ |
| 45 | L1 | 05 | attendance | ✅ |
| 46 | L1 | 05 | qr_cards | ✅ |
| 47 | L1 | 06 | schedule_sessions | ✅ |
| 48 | L1 | 06 | stage_schedules | ✅ |
| 49 | L1 | 06 | stage_queue | ✅ |
| 50 | L1 | 06 | stage_status | ✅ |
| 51 | L1 | 06 | stage_announcements | ✅ |
| 52 | L1 | 06 | live_events | ✅ |
| 53 | L1 | 06 | judge_availability | ✅ |
| 54 | L1 | 06 | schedule_conflicts | ✅ |
| 55 | L1 | 06 | call_history | ✅ |
| 56 | L1 | 06 | performance_log | ✅ |
| 57 | L1 | 07 | judge_profiles | ✅ |
| 58 | L1 | 07 | judge_sessions | ✅ |
| 59 | L1 | 07 | criteria_groups | ✅ |
| 60 | L1 | 07 | scoring_criteria | ✅ |
| 61 | L1 | 07 | competition_scoring_rules | ✅ |
| 62 | L1 | 07 | competition_criteria | ✅ |
| 63 | L1 | 07 | scores | ✅ |
| 64 | L1 | 07 | score_items | ✅ |
| 65 | L1 | 07 | score_history | ✅ |
| 66 | L1 | 07 | judge_comments | ✅ |
| 67 | L1 | 07 | score_lock | ✅ |
| 68 | L1 | 07 | chief_approvals | ✅ |
| 69 | L1 | 07 | result_processing | ✅ |
| 70 | L1 | 07 | tie_break_rules | ✅ |
| 71 | L1 | 07 | score_audit_logs | ✅ |
| — | **LEVEL 2** | **BUSINESS ENGINE** | | |
| 72 | L2 | 08 | results_final (extends result_processing) | 📋 |
| 73 | L2 | 08 | result_rankings | 📋 |
| 74 | L2 | 08 | result_grades | 📋 |
| 75 | L2 | 08 | result_publish_queue | 📋 |
| 76 | L2 | 09 | certificate_templates | 📋 |
| 77 | L2 | 09 | certificates | 📋 |
| 78 | L2 | 09 | certificate_batches | 📋 |
| 79 | L2 | 10 | team_points | 📋 |
| 80 | L2 | 10 | team_rankings | 📋 |
| 81 | L2 | 10 | point_rules | 📋 |
| 82 | L2 | 11 | appeals | 📋 |
| 83 | L2 | 11 | appeal_evidence | 📋 |
| 84 | L2 | 11 | appeal_decisions | 📋 |
| 85 | L2 | 12 | invoices | 📋 |
| 86 | L2 | 12 | payments | 📋 |
| 87 | L2 | 12 | fees | 📋 |
| 88 | L2 | 12 | refunds | 📋 |
| 89 | L2 | 12 | financial_transactions | 📋 |
| 90 | L2 | 12 | budgets | 📋 |
| 91 | L2 | 13 | notification_templates | 📋 |
| 92 | L2 | 13 | notifications | 📋 |
| 93 | L2 | 13 | notification_preferences | 📋 |
| 94 | L2 | 13 | notification_logs | 📋 |
| 95 | L2 | 14 | report_templates | 📋 |
| 96 | L2 | 14 | report_schedules | 📋 |
| 97 | L2 | 14 | report_exports | 📋 |
| 98 | L2 | 15 | public_pages | 📋 |
| 99 | L2 | 15 | public_schedules | 📋 |
| 100 | L2 | 15 | public_results | 📋 |
| — | **LEVEL 3** | **ENTERPRISE** | | |
| 101 | L3 | 16 | subscription_plans | 📋 |
| 102 | L3 | 16 | subscriptions | 📋 |
| 103 | L3 | 16 | usage_metrics | 📋 |
| 104 | L3 | 16 | billing_history | 📋 |
| 105 | L3 | 17 | white_label_configs | 📋 |
| 106 | L3 | 17 | custom_domains | 📋 |
| 107 | L3 | 18 | api_keys | 📋 |
| 108 | L3 | 18 | api_logs | 📋 |
| 109 | L3 | 18 | webhook_endpoints | 📋 |
| 110 | L3 | 18 | webhook_logs | 📋 |
| 111 | L3 | 20 | ai_models | 📋 |
| 112 | L3 | 20 | ai_jobs | 📋 |
| 113 | L3 | 20 | ai_predictions | 📋 |
| 114 | L3 | 21 | system_metrics | 📋 |
| 115 | L3 | 21 | alert_rules | 📋 |
| 116 | L3 | 21 | alert_history | 📋 |
| 117 | L3 | 22 | backup_jobs | 📋 |
| 118 | L3 | 22 | backup_archives | 📋 |
| 119 | L3 | 23 | audit_logs (extends activity_logs) | 📋 |
| 120 | L3 | 23 | compliance_reports | 📋 |
| 121 | L3 | 23 | data_retention_policies | 📋 |
| 122 | L3 | 24 | cms_pages | 📋 |
| 123 | L3 | 24 | cms_blocks | 📋 |
| 124 | L3 | 24 | cms_media | 📋 |
| 125 | L3 | 24 | cms_menus | 📋 |
| 126 | L3 | 25 | integration_configs | 📋 |
| 127 | L3 | 25 | integration_logs | 📋 |
| — | **LEVEL 4** | **VERTICALS** | | |
| 128 | L4 | 26 | sports_events | 📋 |
| 129 | L4 | 26 | sport_results | 📋 |
| 130 | L4 | 27 | science_projects | 📋 |
| 131 | L4 | 27 | project_evaluations | 📋 |
| 132 | L4 | 28 | online_submissions | 📋 |
| 133 | L4 | 28 | online_rooms | 📋 |
| 134 | L4 | 29 | live_stream_configs | 📋 |
| 135 | L4 | 29 | stream_sessions | 📋 |
| 136 | L4 | 30 | votes | 📋 |
| 137 | L4 | 30 | polls | 📋 |
| 138 | L4 | 31 | ai_scoring_models | 📋 |
| 139 | L4 | 31 | auto_grading_results | 📋 |
| 140 | L4 | 32 | face_registration | 📋 |
| 141 | L4 | 32 | face_verification_logs | 📋 |
| 142 | L4 | 33 | payment_transactions | 📋 |
| 143 | L4 | 33 | payment_refunds | 📋 |
| 144 | L4 | 34 | inventory_items | 📋 |
| 145 | L4 | 34 | inventory_transactions | 📋 |
| 146 | L4 | 35 | accommodations | 📋 |
| 147 | L4 | 35 | room_allocations | 📋 |
| 148 | L4 | 36 | transport_routes | 📋 |
| 149 | L4 | 36 | transport_bookings | 📋 |
| 150 | L4 | 37 | food_menus | 📋 |
| 151 | L4 | 37 | meal_plans | 📋 |
| 152 | L4 | 38 | volunteer_shifts | 📋 |
| 153 | L4 | 38 | volunteer_assignments | 📋 |
| 154 | L4 | 39 | medical_records | 📋 |
| 155 | L4 | 39 | first_aid_logs | 📋 |
| 156 | L4 | 40 | help_desk_tickets | 📋 |
| 157 | L4 | 40 | ticket_responses | 📋 |
| 158 | L4 | 41 | media_assets | 📋 |
| 159 | L4 | 41 | media_schedules | 📋 |
| 160 | L4 | 42 | signage_screens | 📋 |
| 161 | L4 | 42 | signage_content | 📋 |
| 162 | L4 | 43 | visitor_passes | 📋 |
| 163 | L4 | 43 | pass_scans | 📋 |
| 164 | L4 | 44 | sponsor_booths | 📋 |
| 165 | L4 | 44 | sponsor_contracts | 📋 |
| 166 | L4 | 45 | asset_registry | 📋 |
| 167 | L4 | 45 | asset_assignments | 📋 |
| 168 | L4 | 46 | staff_records | 📋 |
| 169 | L4 | 46 | payroll_transactions | 📋 |
| 170 | L4 | 47 | barcode_labels | 📋 |
| 171 | L4 | 47 | rfid_tags | 📋 |
| 172 | L4 | 48 | sync_queue | 📋 |
| 173 | L4 | 48 | sync_conflicts | 📋 |
| 174 | L4 | 49 | dr_plans | 📋 |
| 175 | L4 | 49 | dr_test_results | 📋 |
| 176 | L4 | 50 | bi_reports | 📋 |
| 177 | L4 | 50 | bi_dashboards | 📋 |
| 178 | L4 | 50 | bi_data_sources | 📋 |

**Total: 178 tables** (71 completed ✅, 107 planned 📋)

## 3.2 Entity-Relationship Diagram (Level 1 Complete)

[See `docs/ERD_LEVEL1.md` for complete ERD of all 71 existing tables]

## 3.3 Entity-Relationship Diagram (Level 2-4 Planned)

[See `docs/ERD_LEVEL2_4.md` for complete ERD of 107 planned tables]

---

# 4. API DOCUMENTATION — 500+ ENDPOINTS

## 4.1 Server Action Organization

```
src/lib/actions/
├── auth/                     # Module 01 (✅)
├── organization/             # Module 02 (✅)
├── festival/                 # Module 03 (✅)
├── competition/              # Module 04 (✅)
├── participant/              # Module 05 (✅)
├── schedule/                 # Module 06 (✅)
├── judging/                  # Module 07 (✅)
├── result/                   # Module 08 (📋)
├── certificate/              # Module 09 (📋)
├── team-points/              # Module 10 (📋)
├── appeal/                   # Module 11 (📋)
├── finance/                  # Module 12 (📋)
├── notification/             # Module 13 (📋)
├── report/                   # Module 14 (📋)
├── public/                   # Module 15 (📋)
├── subscription/             # Module 16 (📋)
├── white-label/              # Module 17 (📋)
├── api/                      # Module 18 (📋)
├── mobile/                   # Module 19 (📋)
├── ai/                       # Module 20 (📋)
├── monitoring/               # Module 21 (📋)
├── backup/                   # Module 22 (📋)
├── audit/                    # Module 23 (📋)
├── cms/                      # Module 24 (📋)
├── integration/              # Module 25 (📋)
├── sports/                   # Module 26-50 (📋)
└── ...
```

## 4.2 API Endpoint Count by Module

| Module | Server Actions | Route Handlers | Total |
|--------|---------------|----------------|-------|
| 01 Auth | 12 | 2 | 14 |
| 02 Organization | 48 | 4 | 52 |
| 03 Festival | 48 | 6 | 54 |
| 04 Competition | 52 | 4 | 56 |
| 05 Participant | 42 | 8 | 50 |
| 06 Scheduling | 32 | 6 | 38 |
| 07 Judging | 36 | 4 | 40 |
| 08 Result | 24 | 6 | 30 |
| 09 Certificate | 20 | 4 | 24 |
| 10 Team Points | 16 | 2 | 18 |
| 11 Appeal | 18 | 4 | 22 |
| 12 Finance | 30 | 8 | 38 |
| 13 Notification | 24 | 6 | 30 |
| 14 Report | 20 | 4 | 24 |
| 15 Public Portal | 16 | 12 | 28 |
| 16 Subscription | 16 | 4 | 20 |
| 17 White Label | 12 | 2 | 14 |
| 18 API | 8 | 8 | 16 |
| 19 Mobile | — | 20 | 20 |
| 20 AI | 16 | 8 | 24 |
| 21-50 Verticals | 120 | 60 | 180 |
| **Total** | **610** | **182** | **~792** |

---

# 5. UI FLOW — 250+ SCREENS

## 5.1 Screen Count by Module

| Module | Dashboard | List | Create | Detail | Edit | Settings | Total |
|--------|-----------|------|--------|--------|------|----------|-------|
| 01 Auth | 0 | 0 | 2 | 0 | 1 | 0 | 3 |
| 02 Organization | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| 03 Festival | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| 04 Competition | 1 | 1 | 1 | 1 | 1 | 0 | 5 |
| 05 Participant | 1 | 2 | 1 | 1 | 1 | 0 | 6 |
| 06 Scheduling | 1 | 3 | 1 | 0 | 0 | 0 | 5 |
| 07 Judging | 1 | 3 | 1 | 0 | 0 | 0 | 5 |
| 08 Result | 1 | 2 | 0 | 0 | 0 | 0 | 3 |
| 09 Certificate | 1 | 2 | 1 | 1 | 1 | 0 | 6 |
| 10 Team Points | 1 | 1 | 0 | 0 | 0 | 0 | 2 |
| 11 Appeal | 1 | 1 | 1 | 1 | 0 | 0 | 4 |
| 12 Finance | 1 | 3 | 1 | 1 | 0 | 1 | 7 |
| 13 Notification | 1 | 1 | 1 | 0 | 0 | 1 | 4 |
| 14 Report | 1 | 1 | 1 | 0 | 0 | 0 | 3 |
| 15 Public Portal | 1 | 4 | 0 | 2 | 0 | 0 | 7 |
| 16-50 Others | 10 | 20 | 10 | 10 | 5 | 5 | 60 |
| Shared/Layout | — | — | — | — | — | — | 10 |
| **Total** | **24** | **46** | **23** | **19** | **10** | **9** | **~250** |

## 5.2 Current Route Map (Level 1 — 71 screens implemented)

```
/dashboard/organization/[orgId]/
├── (org dashboard)                          # 02
├── festivals/                               # 03
│   ├── (festival dashboard)                 # 03
│   ├── days/                                # 03
│   ├── venues/                              # 03
│   ├── stages/                              # 03
│   ├── committees/                          # 03
│   ├── sponsors/                            # 03
│   ├── announcements/                       # 03
│   │   └── create/                          # 03
│   ├── gallery/                             # 03
│   ├── documents/                           # 03
│   ├── settings/                            # 03
│   ├── competitions/                        # 04
│   │   ├── (competition list)               # 04
│   │   ├── create/                          # 04
│   │   ├── categories/                      # 04
│   │   ├── groups/                          # 04
│   │   └── [competitionId]/
│   │       ├── (detail)                     # 04
│   │       ├── edit/                        # 04
│   │       ├── rounds/                      # 04
│   │       ├── rules/                       # 04
│   │       ├── stages/                      # 04
│   │       ├── judges/                      # 04
│   │       ├── schedule/                    # 04
│   │       ├── eligibility/                 # 04
│   │       ├── materials/                   # 04
│   │       ├── scoring/                     # 07
│   │       ├── scores/                      # 07
│   │       └── results/                     # 07
│   ├── participants/                        # 05
│   │   ├── (list)                           # 05
│   │   ├── create/                          # 05
│   │   ├── dashboard/                       # 05
│   │   ├── registrations/                   # 05
│   │   ├── attendance/                      # 05
│   │   ├── qr/                              # 05
│   │   ├── teams/                           # 05
│   │   │   ├── create/                      # 05
│   │   │   └── [teamId]/                    # 05
│   │   ├── import/                          # 05
│   │   └── [participantId]/
│   │       ├── (detail)                     # 05
│   │       └── edit/                        # 05
│   ├── sessions/                            # 06
│   ├── schedules/                           # 06
│   │   └── create/                          # 06
│   ├── live/                                # 06
│   │   └── display/                         # 06
│   ├── announcements/                       # 06
│   ├── conflicts/                           # 06
│   ├── call-history/                        # 06
│   ├── judge-availability/                  # 06
│   └── judging/                             # 07
│       ├── (dashboard)                      # 07
│       ├── criteria/                        # 07
│       ├── approvals/                       # 07
│       └── results/                         # 07
├── members/                                 # 02
├── activity/                                # 02
├── settings/                                # 02
├── billing/                                 # 16 (📋)
├── white-label/                             # 17 (📋)
└── integrations/                            # 25 (📋)
```

## 5.3 Planned Routes (Level 2-4)

[See `docs/ROUTES_LEVEL2_4.md` for complete route map of all future modules]

---

# 6. ROLE & PERMISSION MATRIX

## 6.1 Role Hierarchy

```
PLATFORM_OWNER (superadmin)
└── PLATFORM_ADMIN
    └── ORGANIZATION_OWNER
        └── ORGANIZATION_ADMIN
            ├── FESTIVAL_DIRECTOR
            │   ├── DIVISION_COORDINATOR
            │   │   ├── SECTOR_COORDINATOR
            │   │   │   └── UNIT_COORDINATOR
            │   │   │       └── VOLUNTEER
            │   │   │       └── RECEPTION
            │   │   │       └── MEDIA
            │   │   └── JUDGE
            │   └── FINANCE
            └── PARTICIPANT
            └── PUBLIC_USER
```

## 6.2 Permission Categories (37 granular permissions)

```
Festival:    fest.create, fest.read, fest.update, fest.delete, fest.publish
Competition: comp.create, comp.read, comp.update, comp.delete
Participant: part.create, part.read, part.update, part.delete, part.approve
Schedule:    sched.create, sched.read, sched.update, sched.delete, sched.manage_live
Judging:     judge.assign, score.enter, score.view, score.lock, score.approve
Finance:     fin.create, fin.read, fin.update, fin.delete
Report:      report.create, report.read, report.export
Settings:    settings.read, settings.update
Users:       user.invite, user.manage, user.suspend
Admin:       admin.access, admin.audit
```

## 6.3 Permission-to-Role Mapping

[See `docs/PERMISSION_MATRIX.md` for complete grid of 37 permissions × 16 roles]

---

# 7. BUSINESS RULES & VALIDATION

## 7.1 Module 08 — Result Engine
- Only locked + chief-approved scores count toward results
- Multiple scoring methods: average, total, weighted, best-of, cumulative
- Tie-breaking is configurable per competition (highest sub-score, manual, chief decision, random draw)
- Results auto-publish when all judges submit + chief approves
- Rank override allowed for authorized roles only (festival_director+)
- Grade assignment based on configurable thresholds (A+: 90%, A: 80%, etc.)
- Result recalculation triggers when any score changes (audit log required)

## 7.2 Module 09 — Certificate Engine
- Certificate templates support dynamic fields: {{name}}, {{rank}}, {{competition}}, etc.
- Batch generation with preview before finalization
- Digital signatures embedded via crypto hash
- QR code on each cert for verification
- Multiple languages supported in templates
- Auto-generated for top 3 ranks; manual for participation
- Certificate revocation with reason tracking

## 7.3 Module 10 — Team Points Engine
- Point rules configurable per competition type
- Points awarded for: rank (1st/X pts, 2nd/Y pts), participation (Z pts), special awards
- Team total = sum of all members' points
- Team rankings auto-calculated on result publish
- Historical team points tracked across festivals

## 7.4 Module 11 — Appeal Engine
- Appeal window configurable per competition (default: 30 min after result publish)
- Appeal fee optional (configurable)
- Appeal committee assigned by festival director
- Evidence upload (max 5 files, 10MB each)
- Decision: upheld / rejected / partial
- Auto-notification on decision
- Appeal history visible to participant
- Final and binding after chief review

## 7.5 Module 12 — Finance Engine
- Registration fees configurable per competition/participant
- Multiple fee tiers (early bird, regular, late)
- Multiple payment methods (card, bank transfer, cash, wallet)
- Invoice auto-generated on registration
- Refund policy configurable (full, partial, no refund windows)
- Budget tracking per festival/competition
- Expense categorization
- Financial reports (P&L, budget vs actual, fee collection)
- Tax calculation (configurable rates)

## 7.6 Module 13 — Notification Engine
- Delivery channels: in-app, email, SMS, WhatsApp, push
- Template-based with variable substitution
- Batch sending with rate limiting
- Delivery status tracking (sent, delivered, read, failed)
- User notification preferences (opt-in/opt-out per channel)
- Priority levels: critical, high, normal, low
- Notification categories: result, schedule, appeal, payment, reminder, system

## 7.7 Module 14 — Report Engine
- Report types: competition, participant, financial, attendance, judging, custom
- Export formats: PDF, Excel, CSV, HTML
- Scheduled report generation (daily, weekly, monthly, on-demand)
- Report templates with drag-and-drop builder
- Data filtering by date range, competition, status, etc.
- Role-based data visibility in reports
- Auto-email distribution list

## 7.8 Module 15 — Public Portal
- Live schedule display with auto-refresh (15s interval)
- Real-time result display
- Participant search by name/ID/chest number
- Public competition catalog
- Festival information page (sponsors, venue, contacts)
- No authentication required for public pages
- Rate limiting: 100 requests/min per IP
- Caching: 60s CDN cache for public pages

## 7.9 General Cross-Cutting Rules
- All mutations logged in activity_logs / score_audit_logs
- Soft delete on all major entities (deleted_at + deleted_by)
- MAX 3 failed login attempts before temporary lockout (15 min)
- Session timeout: 24h for web, 7d for "remember me"
- File upload max: 10MB per file, 50MB total per upload
- Rate limiting: 30 mutations/min per user
- All monetary values stored in cents (integer) to avoid floating-point issues
- Time stored in UTC, displayed in user's timezone

---

# 8. FOLDER STRUCTURE

## 8.1 Complete Project Tree

```
festpro-saas/
├── .vscode/
│   └── settings.json
├── docs/
│   ├── SRS_MASTER.md                   (this file)
│   ├── ERD_LEVEL1.md
│   ├── ERD_LEVEL2_4.md
│   ├── ROUTES_LEVEL2_4.md
│   ├── PERMISSION_MATRIX.md
│   └── API_REFERENCE.md
├── public/
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── manifests/
├── scripts/
│   ├── seed.sql
│   ├── deploy.sh
│   ├── backup.sh
│   └── migrate.sh
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify/
│   │   ├── (public)/
│   │   │   ├── [orgSlug]/
│   │   │   │   ├── festivals/
│   │   │   │   ├── schedule/
│   │   │   │   └── results/
│   │   │   ├── certificate/
│   │   │   │   └── [code]/
│   │   │   └── verify/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── judge/
│   │   │   ├── participant/
│   │   │   └── organization/
│   │   │       └── [orgId]/
│   │   │           ├── page.tsx
│   │   │           ├── members/
│   │   │           ├── activity/
│   │   │           ├── settings/
│   │   │           ├── billing/
│   │   │           ├── white-label/
│   │   │           ├── integrations/
│   │   │           ├── festivals/
│   │   │           │   └── [festivalId]/
│   │   │           │       ├── page.tsx
│   │   │           │       ├── days/
│   │   │           │       ├── venues/
│   │   │           │       ├── stages/
│   │   │           │       ├── committees/
│   │   │           │       ├── sponsors/
│   │   │           │       ├── announcements/
│   │   │           │       ├── gallery/
│   │   │           │       ├── documents/
│   │   │           │       ├── settings/
│   │   │           │       ├── competitions/
│   │   │           │       ├── participants/
│   │   │           │       ├── sessions/
│   │   │           │       ├── schedules/
│   │   │           │       ├── live/
│   │   │           │       ├── conflicts/
│   │   │           │       ├── call-history/
│   │   │           │       ├── judge-availability/
│   │   │           │       ├── judging/
│   │   │           │       ├── results/
│   │   │           │       ├── certificates/
│   │   │           │       ├── appeals/
│   │   │           │       ├── finance/
│   │   │           │       ├── notifications/
│   │   │           │       ├── reports/
│   │   │           │       ├── sports/
│   │   │           │       ├── volunteers/
│   │   │           │       ├── medical/
│   │   │           │       ├── media/
│   │   │           │       └── help-desk/
│   │   │           └── ...
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       ├── webhooks/
│   │       │   ├── stripe/
│   │       │   ├── sendgrid/
│   │       │   ├── twilio/
│   │       │   └── generic/
│   │       ├── public/
│   │       │   ├── schedule/
│   │       │   ├── results/
│   │       │   └── certificates/
│   │       └── v1/
│   │           ├── organizations/
│   │           ├── festivals/
│   │           ├── competitions/
│   │           ├── participants/
│   │           ├── results/
│   │           └── certificates/
│   ├── components/
│   │   ├── ui/                        (shadcn/ui components)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── festival/
│   │   ├── competition/
│   │   ├── participant/
│   │   ├── schedule/
│   │   ├── judging/
│   │   ├── result/
│   │   ├── certificate/
│   │   ├── finance/
│   │   ├── notification/
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── search-input.tsx
│   │       ├── pagination.tsx
│   │       ├── file-upload.tsx
│   │       ├── qr-code.tsx
│   │       ├── status-badge.tsx
│   │       └── empty-state.tsx
│   ├── config/
│   │   ├── auth.ts
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   ├── festival.ts
│   │   ├── competition.ts
│   │   ├── participant.ts
│   │   ├── schedule.ts
│   │   ├── judging.ts
│   │   ├── result.ts
│   │   ├── certificate.ts
│   │   ├── finance.ts
│   │   ├── notification.ts
│   │   ├── report.ts
│   │   └── site.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-org.ts
│   │   ├── use-festival.ts
│   │   ├── use-permissions.ts
│   │   ├── use-debounce.ts
│   │   ├── use-intersection.ts
│   │   └── use-media-query.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── actions/
│   │   │   ├── auth/
│   │   │   ├── organization/
│   │   │   ├── festival/
│   │   │   ├── competition/
│   │   │   ├── participant/
│   │   │   ├── schedule/
│   │   │   ├── judging/
│   │   │   ├── result/
│   │   │   ├── certificate/
│   │   │   ├── team-points/
│   │   │   ├── appeal/
│   │   │   ├── finance/
│   │   │   ├── notification/
│   │   │   ├── report/
│   │   │   ├── public/
│   │   │   ├── subscription/
│   │   │   ├── white-label/
│   │   │   ├── api/
│   │   │   ├── ai/
│   │   │   ├── monitoring/
│   │   │   ├── backup/
│   │   │   ├── audit/
│   │   │   ├── cms/
│   │   │   └── integration/
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── format.ts
│   │   │   ├── pdf.ts
│   │   │   ├── csv.ts
│   │   │   ├── image.ts
│   │   │   ├── qr.ts
│   │   │   └── validators.ts
│   │   └── middleware.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── organization.ts
│   │   ├── festival.ts
│   │   ├── competition.ts
│   │   ├── participant.ts
│   │   ├── schedule.ts
│   │   ├── judging.ts
│   │   ├── result.ts
│   │   ├── certificate.ts
│   │   ├── finance.ts
│   │   ├── notification.ts
│   │   ├── report.ts
│   │   ├── subscription.ts
│   │   └── api.ts
│   └── providers/
│       ├── auth-provider.tsx
│       ├── theme-provider.tsx
│       └── query-provider.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 00001_auth_schema.sql
│   │   ├── 00002_organizations_rbac.sql
│   │   ├── 00003_festival_schema.sql
│   │   ├── 00004_competition_schema.sql
│   │   ├── 00005_participant_schema.sql
│   │   ├── 00006_scheduling_schema.sql
│   │   ├── 00007_judging_schema.sql
│   │   ├── 00008_result_schema.sql           (📋)
│   │   ├── 00009_certificate_schema.sql       (📋)
│   │   ├── 00010_team_points_schema.sql       (📋)
│   │   ├── 00011_appeal_schema.sql            (📋)
│   │   ├── 00012_finance_schema.sql           (📋)
│   │   ├── 00013_notification_schema.sql      (📋)
│   │   ├── 00014_report_schema.sql            (📋)
│   │   ├── 00015_public_schema.sql            (📋)
│   │   ├── 00016_subscription_schema.sql      (📋)
│   │   ├── 00017_white_label_schema.sql       (📋)
│   │   ├── 00018_api_schema.sql               (📋)
│   │   ├── 00019_ai_schema.sql                (📋)
│   │   ├── 00020_monitoring_schema.sql        (📋)
│   │   └── 00021-50_vertical_schemas.sql      (📋)
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

# 9. CODING STANDARDS

## 9.1 General Principles
- **TypeScript strict mode** enabled
- **No `any`** types (exception: `as any` for third-party lib interop, documented with comment)
- **Server Components by default** — only use `"use client"` when interactivity required
- **Server Actions for mutations** — never expose raw DB queries to client
- **React Hook Form + Zod** for all forms
- **shadcn/ui** components extended as needed, never custom-styled from scratch
- **Tailwind CSS** only — no CSS modules, no styled-components, no CSS-in-JS
- **Lucide React** for icons — no icon font libraries

## 9.2 Naming Conventions
- **Files**: `kebab-case.ts`, `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase()`
- **Variables**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Database tables**: `snake_case`
- **Database columns**: `snake_case`
- **Server actions**: `verbNoun()` — e.g., `createFestival()`, `getParticipants()`
- **CSS classes**: Tailwind utility classes only

## 9.3 File Size Limits
- **Page components**: max 300 lines (extract sub-components)
- **Server actions**: max 200 lines per file (split by entity)
- **Types**: one interface per logical group
- **Config**: flat, no nesting beyond 2 levels

## 9.4 Performance Rules
- Always use `React.cache()` for data fetching in server components
- Always use `useCallback` + `useMemo` for client-side computations
- Paginate all list queries (default: 20 items/page)
- Use Supabase `.select()` with specific columns (no `select("*")`)
- Lazy load images with `next/image`
- Dynamic import for heavy components
- Server actions must `revalidatePath()` after mutations

## 9.5 Security Rules
- All DB access through Supabase RLS policies (enforced at DB level)
- Server actions check authentication + authorization at the start
- File uploads validated: type, size, virus scan
- User input sanitized via Zod schemas
- API keys hashed with bcrypt before storage
- Rate limiting on all public endpoints
- SQL injection impossible (parameterized queries via Supabase)
- XSS prevented (React escapes output by default)
- CSRF protected (Next.js built-in)

## 9.6 Error Handling
- Server actions return `{ data, error }` — errors never thrown
- Client components use `toast.error()` for user-facing errors
- API routes return `{ success, data, error }` with appropriate HTTP status
- Global error boundary at layout level
- 404 pages for all dynamic routes
- Loading states with skeleton/spinner for all async operations

---

# 10. NOTIFICATION FLOWS

## 10.1 Event → Notification Mapping

| Event | Channel | Priority | Template Variables |
|-------|---------|----------|-------------------|
| Registration submitted | Email, In-app | Normal | participant_name, competition_name |
| Registration approved | Email, SMS | High | participant_name, competition_name, chest_number |
| Registration rejected | Email | High | participant_name, competition_name, reason |
| Schedule published | In-app, Push | Normal | competition_name, date, time, stage |
| Schedule changed | Email, SMS, Push | Critical | competition_name, old_time, new_time |
| 5 min before performance | SMS, Push | Critical | participant_name, stage, time |
| Called to stage | SMS, Push | Critical | participant_name, stage |
| Score submitted | In-app | Normal | participant_name, score |
| Score approved | Email, In-app | High | participant_name, rank, score |
| Appeal submitted | Email | Normal | competition_name |
| Appeal decided | Email, In-app | High | competition_name, decision |
| Certificate ready | Email, In-app | Normal | participant_name, download_link |
| Payment received | Email | High | amount, invoice_no |
| Payment overdue | Email, SMS | Critical | amount, due_date |
| Team point updated | In-app | Normal | team_name, points, rank |
| System maintenance | Email | Critical | start_time, end_time, expected_downtime |

## 10.2 Notification Delivery Flow

```
Event Triggered
    │
    ▼
Check Notification Preferences
    │
    ├── In-app enabled? → Insert notification record → Real-time push
    ├── Email enabled?  → Queue email → SendGrid/Twilio SendEmail
    ├── SMS enabled?    → Queue SMS → Twilio
    └── Push enabled?   → Queue push → Firebase FCM
    │
    ▼
Track Delivery Status
    │
    ├── sent
    ├── delivered
    ├── read
    └── failed (retry 3x, then dead letter)
    │
    ▼
Notification Log Updated
```

---

# 11. STATE DIAGRAMS

## 11.1 Registration State Flow

```
DRAFT ──► PENDING ──► APPROVED ──► CHECKED_IN ──► COMPLETED
             │             │
             ▼             ▼
          REJECTED     CANCELLED
```

## 11.2 Score State Flow

```
DRAFT ──► SUBMITTED ──► LOCKED ──► APPROVED
                           │
                           ▼
                      REJECTED ──► DRAFT (correction requested)
```

## 11.3 Appeal State Flow

```
OPEN ──► UNDER_REVIEW ──► UPHOLD
   │                        │
   ▼                        ▼
WITHDRAWN               REJECTED
                            │
                            ▼
                     PARTIAL (points adjusted)
```

## 11.4 Payment State Flow

```
PENDING ──► PROCESSING ──► COMPLETED
   │                          │
   ▼                          ▼
FAILED                     REFUNDED
                              │
                              ▼
                         PARTIAL_REFUND
```

## 11.5 Certificate State Flow

```
DRAFT ──► GENERATED ──► PUBLISHED ──► DOWNLOADED
                           │
                           ▼
                       REVOKED
```

---

# 12. DEPLOYMENT PLAN

## 12.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (PRODUCTION)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Edge Functions   │   Serverless Functions   │  Static  │ │
│  │  (Rate Limit,     │   (Server Actions,       │  Assets  │ │
│  │   Auth, Redirect) │    API Routes)            │  (CDN)   │ │
│  └───────────────────┴──────────────────────────┴─────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PRODUCTION)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  PostgreSQL  │  │   Storage    │  │    Realtime        │  │
│  │  (16 cores)  │  │  (S3 Compat)│  │   (WebSocket)     │  │
│  │  100+ tables │  │  50GB+      │  │   Broadcast       │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    ADDITIONAL SERVICES                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Redis   │  │ Meili    │  │  Inngest │  │  Sentry    │  │
│  │ (Upstash)│  │ (Search) │  │  (Queue) │  │ (Monitor)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 12.2 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Local** | `http://localhost:3000` | Development |
| **Preview** | `*.vercel.app` | PR previews |
| **Staging** | `staging.festpro.app` | Integration testing |
| **Production** | `app.festpro.app` | Live |
| **Public** | `festpro.app` | Marketing site |

## 12.3 CI/CD Pipeline

```
Git Push → GitHub → Vercel Deploy
    │
    ├── Lint (ESLint + Prettier)
    ├── Type Check (tsc --noEmit)
    ├── Unit Tests (Vitest)
    ├── Build (next build)
    ├── Integration Tests (Playwright)
    └── Deploy
        ├── Preview: Every PR (auto)
        ├── Staging: Merge to develop (auto)
        └── Production: Merge to main (auto + approval)
```

## 12.4 Database Migration Strategy

```
1. Developer writes migration SQL in supabase/migrations/
2. CI runs migration against staging DB
3. Manual review of migration plan
4. Production migration:
   a. Backup DB
   b. Run migration (non-blocking when possible)
   c. Verify data integrity
   d. Rollback plan ready
```

---

# 13. TESTING STRATEGY

## 13.1 Test Pyramid

```
         ╱─────╲
        ╱  E2E  ╲         5% — Critical user journeys
       ╱──────────╲
      ╱ Integration ╲    25% — API, DB, service integration
     ╱────────────────╲
    ╱    Unit Tests     ╲    70% — Server actions, utils, validation
   ╱──────────────────────╲
```

## 13.2 Test Categories

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Vitest | 70%+ | Server actions (logic), validators, utils, config |
| Integration | Vitest + Supabase | 25%+ | DB queries, RLS policies, file uploads, auth flows |
| E2E | Playwright | 5%+ | Login → create org → create festival → register participant → score → results |
| Visual | Percy/Chromatic | Key pages | Component rendering, responsive layout |
| Security | Manual + Automated | Critical | RLS bypass, XSS, CSRF, SQLi, auth bypass |
| Performance | k6/Lighthouse | Budget | Page load < 2s, API response < 200ms, DB query < 50ms |
| Accessibility | axe-core | WCAG 2.1 AA | Screen reader, keyboard nav, color contrast |

## 13.3 What NOT to Test (Safer to Skip)
- Third-party libraries (shadcn/ui, Supabase SDK, Next.js internals)
- Tailwind CSS classes (visual regression instead)
- Simple getter/setter patterns
- Boilerplate CRUD that mirrors DB schema exactly

---

# 14. DEVELOPMENT ROADMAP

## 14.1 Phase Summary

| Phase | Modules | Est. Timeline | Status |
|-------|---------|---------------|--------|
| **Phase 1** | 01–07 Core System | 8 weeks | ✅ DONE |
| **Phase 2** | 08–15 Business Engine | 10 weeks | 📋 NEXT |
| **Phase 3** | 16–25 Enterprise | 8 weeks | 📋 |
| **Phase 4** | 26–50 Verticals | 16 weeks | 📋 |
| **Phase 5** | Polish, Scale, Launch | 4 weeks | 📋 |

## 14.2 Phase 2 Detailed Plan (Next)

| Sprint | Module | Deliverables |
|--------|--------|-------------|
| Sprint 1 | 08 — Result Engine | Migration, types, config, server actions, UI pages |
| Sprint 2 | 09 — Certificate Engine | Migration, types, PDF generation, templates, UI |
| Sprint 3 | 10 — Team Points | Migration, calculations, standings UI |
| Sprint 4 | 11 — Appeal Engine | Migration, workflow, committee assignment |
| Sprint 5 | 12 — Finance Engine (Part 1) | Migration, fees, invoices, payments |
| Sprint 6 | 12 — Finance Engine (Part 2) | Budget, expenses, reports |
| Sprint 7 | 13 — Notification Engine | Templates, delivery, preferences, logs |
| Sprint 8 | 14 — Report Engine | Templates, generation, scheduling, export |
| Sprint 9 | 15 — Public Portal | Public pages, API, rate limiting, CDN config |
| Sprint 10 | Integration & Polish | Connect all modules, E2E testing |

---

# NEXT STEPS

1. ✅ Review this SRS document
2. ✅ Confirm priorities / reorder
3. ➡️ Begin Phase 2, Sprint 1: **Module 08 — Result Engine**
4. Generate complete migration SQL for all planned Level 2 tables
5. Build incrementally with zero-regression guarantee

---

*Document Version: 1.0.0*
*Last Updated: 2026-07-18*
*Author: FestPro Architecture Team*
