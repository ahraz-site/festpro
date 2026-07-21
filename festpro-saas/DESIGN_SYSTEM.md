# DESIGN_SYSTEM.md

FestPro UI conventions. Built on Tailwind CSS + shadcn/ui.

## Principles

- **Consistency:** reuse `src/components/ui` primitives (Button, Card, Dialog, Table, Input, Select, Tabs).
- **Multi-tenant aware:** org name/logo in the app shell header.
- **Accessible:** semantic HTML, focus states, aria labels.
- **Responsive:** mobile-first; dedicated `src/app/mobile` and `src/components/mobile`.

## Tokens

- Colors: shadcn CSS variables (`--background`, `--primary`, `--muted`, etc.) in `globals.css`.
- Spacing: Tailwind scale (4px base).
- Radius: `rounded-lg` for cards, `rounded-md` for controls.
- Font: system + `next/font` (Geist).

## Layout

- App shell: `src/components/layout` — sidebar nav + top bar.
- Dashboard pages under `src/app/dashboard/<module>`.
- Forms: label + control + inline error pattern.
- Tables: `src/components/ui/table` with server-side pagination for large datasets.

## Component Rules

- New primitives go in `src/components/ui` (shadcn pattern).
- Feature components in `src/components/<domain>`.
- Client interactivity only where needed (`'use client'`).
- No inline styles; use Tailwind utilities or theme tokens.

## Theming

- Light/dark via `class` strategy on `<html>`.
- Brand color configurable per organization (stored in `organizations`).
