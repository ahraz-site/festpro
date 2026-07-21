# CHANGELOG.md

## [Unreleased]

### Added
- Full documentation set: README, AI_CONTEXT, AGENTS, PROJECT_STRUCTURE, DATABASE, FEATURES, DESIGN_SYSTEM, API, CHANGELOG, CONTRIBUTING, .env.example.

### Fixed (migrations)
- `00001a`/`00001b` split: enum values vs role seed data.
- `00002`: removed seed INSERTs (moved to `00001b`).
- `00003`: dynamic `apply_festival_rls()`; storage policies `IF NOT EXISTS`.
- `00003b_pre_fix.sql`: RLS funcs, `update_updated_at_column()`, activity_action extend, safe duplicate types.
- `00004`: dynamic `apply_competition_rls()`.
- `00008`: canonical `result_engine_full.sql`; `auth.users(id)` refs; `participants.created_by` RLS.
- `00009`: `competition_registrations` → `registrations`.
- `00022`: `ssl_cert ARRAY` → `ssl_cert TEXT[]`.
- `00010`/`00015`/`00028`: idempotent `CREATE TYPE` via `DO $$ ... EXCEPTION`.

### Known Issues
- DB currently in inconsistent partial state from manual SQL Editor runs; needs fresh reset + ordered re-apply.
- `ALL_IN_ONE.sql` abandoned (environment write timeouts).

## [Initial]
- 30-module FestPro schema scaffolded across `00001`–`00030`.
