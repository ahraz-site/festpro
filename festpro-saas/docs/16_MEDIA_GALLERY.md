# FestPro Media & Gallery — Complete Official Documentation

**Module:** Media & Gallery  
**Version:** 1.0  
**Dependencies:** Storage (Supabase)  
**Applies To:** Media Team, Admins

---

# Section 1: Introduction

The Media module handles upload, organization, and display of photos, videos, and documents throughout the festival lifecycle. Files are stored in Supabase Storage with bucket-level RLS policies.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Gallery | `/dashboard/festivals/[id]/media` | All media files in grid/list view |
| Upload | `/dashboard/festivals/[id]/media/upload` | Upload files |
| Albums | `/dashboard/festivals/[id]/media/albums` | Grouped media collections |

---

# Section 5: Every Form

## 5.1 Upload Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| File | file | Yes | Image/Video/Document, max 50MB |
| Title | text | No | Display title |
| Description | textarea | No | Description |
| Category | dropdown | No | Competition, Stage, Behind Scenes, Venue, Group |
| Competition | dropdown | No | Link to specific competition |
| Visibility | dropdown | Yes | Public, Organization, Admin Only |

---

# Section 7: Step-by-Step Guide

**Step 1:** Navigate to Media → Upload.

**Step 2:** Click to select files (multiple files allowed).

**Step 3:** Fill in metadata for each file (title, description, category).

**Step 4:** Set visibility: Public (visible on public portal), Organization (visible to members), Admin Only.

**Step 5:** Click **Upload**.

**Step 6:** Progress bar shows upload status for each file.

**Step 7:** After upload completes, files appear in the gallery.

**Step 8:** Thumbnails auto-generate at 200px, 800px, and 1920px sizes.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| MEDIA-001 | Max file size: 50MB per file |
| MEDIA-002 | Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, PDF, DOCX |
| MEDIA-003 | Uploaded files are scanned for malware (if enabled) |
| MEDIA-004 | Public visibility allows anyone to view (no login required) |
| MEDIA-005 | Media uploaded by a user can be deleted by that user or any admin |
| MEDIA-006 | Thumbnails are auto-generated for image files |

---

*End of Media & Gallery Module Documentation*
