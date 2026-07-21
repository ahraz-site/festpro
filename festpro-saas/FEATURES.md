# FEATURES.md

FestPro is organized into 30 feature modules. Each maps to a migration `000NN_*`.

| # | Module | Migration | Summary |
|---|--------|-----------|---------|
| 1 | Auth & Org Schema | `00001_auth_schema.sql` | user_role enum, organizations, members |
| 2 | Organizations & RBAC | `00002_organizations_rbac.sql` | activity_action, roles, permissions |
| 3 | Festival Schema | `00003_festival_schema.sql` | festivals, venues, storage policies |
| 4 | Competition Schema | `00004_competition_schema.sql` | competitions, categories, dynamic RLS |
| 5 | Registration & Participants | `00005_*` | registrations, participants, age groups |
| 6 | Judging & Scoring | `00006_*` | judges, scores, criteria |
| 7 | Scheduling | `00007_*` | stages, time slots, clashes |
| 8 | Results Engine | `00008_result_engine_full.sql` | result computation, ranks, certificates |
| 9 | Finance & Reports | `00009_*` | invoices, payments, analytics |
| 10 | Certificates | `00010_*` | templates, generation |
| 11 | Volunteers | `00011_*` | assignments, shifts |
| 12 | Accommodation | `00012_*` | rooms, allocations |
| 13 | Medical | `00013_*` | medical records, incidents |
| 14 | Communication | `00014_*` | notifications, announcements |
| 15 | Roles & Permissions UI | `00015_*` | role management |
| 16 | Audit Log | `00016_*` | activity tracking |
| 17 | AI Features | `00017_*` | LLM integrations |
| 18 | Localization | `00018_*` | ml/en translations |
| 19 | Mobile/PWA | `00019_*` | offline, mobile views |
| 20 | Public Portal | `00020_*` | public festival pages |
| 21 | EDMS | `00021_*` | document management |
| 22 | SaaS Platform | `00022_saas_platform.sql` | tenants, billing, ssl_cert TEXT[] |
| 23 | Analytics | `00023_*` | dashboards |
| 24 | Integrations | `00024_*` | third-party APIs |
| 25 | Security & Compliance | `00025_*` | encryption, retention |
| 26 | Workflows | `00026_*` | approval flows |
| 27 | Reports Builder | `00027_*` | custom reports |
| 28 | Notifications Engine | `00028_*` | email/SMS |
| 29 | Backup & Sync | `00029_*` | snapshots |
| 30 | Misc/Polish | `00030_*` | final tweaks |

> Exact file names for 5–30 follow the `000NN_<module>.sql` pattern. See `supabase/migrations/`.

## Cross-Cutting

- **Multi-tenancy:** every module scoped by `organization_id`.
- **RBAC:** role-based access enforced via RLS helpers.
- **Audit:** all key mutations logged to `activity_log`.
- **AI:** judging assistance, content generation, insights.
- **Localization:** Malayalam + English throughout.
