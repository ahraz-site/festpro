# FestPro CMS (Content Management) — Complete Official Documentation

**Module:** 24 — Content Management System  
**Version:** 1.0  
**Applies To:** Marketing Team, Content Authors, Admins

---

# Section 1: Introduction

The CMS module empowers organisations to create and manage content pages for their public portal and internal dashboards. It supports rich-text editing, blocks, menus, media embedding, and SEO metadata — enabling fully customisable public-facing content without developer involvement.

## Key Capabilities
- Page creation with WYSIWYG rich-text editor
- Customisable menus and navigation
- Reusable content blocks
- SEO metadata management (title, description, OG tags)
- Scheduled publishing and draft mode
- Media embedding from the Media Gallery

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Pages | `/dashboard/organization/cms/pages` | List of all CMS pages |
| New Page | `/dashboard/organization/cms/pages/new` | Create a new page |
| Page Editor | `/dashboard/organization/cms/pages/[id]/edit` | Edit page content |
| Menus | `/dashboard/organization/cms/menus` | Navigation menu editor |
| Blocks | `/dashboard/organization/cms/blocks` | Reusable content blocks |

---

# Section 3: Every Form

## Page Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | text | Yes | Page title (e.g., "About Us") |
| Slug | text | Yes | URL path (e.g., /about-us) |
| Content | rich-text | Yes | Page body with WYSIWYG editor |
| Template | dropdown | No | Page layout template |
| Meta Title | text | No | SEO title (defaults to page title) |
| Meta Description | textarea | No | SEO meta description |
| OG Image | image | No | Open Graph share image |
| Status | dropdown | Yes | Draft, Published, Scheduled |
| Publish Date | datetime | Conditional | Required if Status=Scheduled |
| Show in Menu | toggle | No | Add to navigation |

---

# Section 4: Best Practices

1. Use descriptive slugs for SEO
2. Add meta descriptions (150-160 chars) for every page
3. Use OG images for social sharing
4. Preview before publishing
5. Keep navigation simple — max 7 top-level items

---

*End of CMS Module Documentation (Module 24)*
