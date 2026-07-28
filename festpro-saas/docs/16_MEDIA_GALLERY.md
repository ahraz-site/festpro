# FestPro Media & Gallery — Complete Official Documentation

**Module:** 16 — Media & Gallery  
**Version:** 2.0  
**Dependencies:** Storage (Supabase), Festival (04)  
**Applies To:** Media Team, Photographers, Admins

---

# Section 1: Introduction

The Media module handles the full lifecycle of digital assets — upload, storage, organisation, and display of photos, videos, and documents. Files are stored in Supabase Storage with bucket-level RLS policies. The gallery supports albums, categories, automated thumbnail generation (three sizes), and visibility controls (Public/Org/Admin Only).

## Key Capabilities

| Capability | Description |
|------------|-------------|
| File Upload | Single/multiple upload, max 50MB per file, drag-and-drop |
| Thumbnail Generation | Auto-generates 200px, 800px, and 1920px thumbnails for images |
| Albums | Group related media into themed collections |
| Categories | Organise by competition, stage, venue, behind-the-scenes |
| Visibility Control | Public, Organization-only, Admin-only per file |
| Lightbox Viewer | Full-screen gallery viewer with navigation |
| Supabase Storage | S3-compatible object storage with CDN |
| Direct Upload | Signed URL upload for large files |
| Multi-format | JPEG, PNG, GIF, WEBP, MP4, MOV, PDF, DOCX |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Festival Created | Gallery is scoped to a festival |
| Storage Bucket | Supabase storage bucket configured (festiva-media) |
| RLS Policies | Storage bucket policies set for org-based access |
| Role Permission | Media role or higher for uploads |

## Configuration Checklist

- [ ] Verify Supabase storage bucket exists
- [ ] Configure bucket RLS policies (org-based access)
- [ ] Set max file size (default: 50MB)
- [ ] Define allowed file types
- [ ] Create album categories if desired
- [ ] Enable thumbnail generation
- [ ] Test upload with a sample image

---

# Section 3: Navigation

## Page Map

| Page | URL | Purpose |
|------|-----|---------|
| **Gallery** | `/dashboard/festivals/[id]/media` | Grid/list view of all media |
| **Upload** | `/dashboard/festivals/[id]/media/upload` | Drag-and-drop file upload |
| **Albums** | `/dashboard/festivals/[id]/media/albums` | Grouped media collections |
| **Album Detail** | `/dashboard/festivals/[id]/media/albums/[id]` | Media in a specific album |
| **File Detail** | `/dashboard/festivals/[id]/media/[fileId]` | Single file info and actions |

---

# Section 4: Screen Overview

## 4.1 Gallery Grid View

```
┌─────────────────────────────────────────────────────────────┐
│  MEDIA GALLERY                  [Upload] [Album] [Search]   │
├─────────────────────────────────────────────────────────────┤
│ [All Media ▼] [Category ▼] [Visibility ▼]                  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ ┌──┐ │ │ ┌──┐ │ │ ┌──┐ │ │ ┌──┐ │ │ ┌──┐ │ │ ┌──┐ │    │
│ │ │📷│ │ │ │📷│ │ │ │📷│ │ │ │📷│ │ │ │📷│ │ │ │📷│ │    │
│ │ └──┘ │ │ └──┘ │ │ └──┘ │ │ └──┘ │ │ └──┘ │ │ └──┘ │    │
│ │Day 1 │ │Dance │ │Stage │ │Day 2 │ │Award │ │Group │    │
│ │  ♥12 │ │  ♥8  │ │  ♥5  │ │  ♥15 │ │  ♥10 │ │  ♥7  │    │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Upload Form

**Location:** Media → Upload

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| File | `file` | Yes | Max 50MB, allowed types | Select single or multiple files |
| Title | `text` | No | Max 200 chars | Display title (auto-named from filename if empty) |
| Description | `textarea` | No | Max 500 chars | Optional description |
| Category | `dropdown` | No | Competition, Stage, Behind Scenes, Venue, Group, Award Ceremony | Content category |
| Competition | `dropdown` | Conditional | Only if Category=Competition | Link to specific competition |
| Album | `dropdown` | No | From existing albums | Add to an album |
| Visibility | `dropdown` | Yes | Public, Organization, Admin Only | Who can see this file |
| Tags | `text` | No | Comma-separated, max 10 tags | Search keywords |
| Copyright | `text` | No | Max 200 chars | Photographer/credit attribution |

## 5.2 Album Form

**Location:** Media → Albums → Create Album

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Album Name | `text` | Yes | 3-100 chars | Display name |
| Description | `textarea` | No | Max 500 chars | Album description |
| Cover Image | `image` | No | From uploaded media | Album cover photo |
| Visibility | `dropdown` | Yes | Public, Organization, Admin Only | Album visibility |

---

# Section 6: Every Button — Complete Reference

| Button | Location | Action | Permission Required |
|--------|----------|--------|:------------------:|
| **Upload** | Gallery | Open upload dialog | Media+ |
| **Create Album** | Albums | Open album form | Media+ |
| **Add to Album** | File detail | Add file to album | Media+ |
| **Delete** | File detail | Remove file | Media+ (own) / Admin (any) |
| **Download** | File detail | Download original file | View access |
| **Copy Link** | File detail | Copy public/org URL | View access |
| **Set as Cover** | Album | Set album cover | Media+ |
| **Edit Metadata** | File detail | Change title/description/tags | Media+ |
| **Change Visibility** | File detail | Update visibility level | Media+ (own) / Admin (any) |
| **Select All** | Gallery | Select multiple for bulk action | Media+ |
| **Bulk Delete** | Gallery | Delete selected files | Media+ (own) / Admin (any) |

---

# Section 7: Step-by-Step Guide

## 7.1 Uploading Media

1. Navigate to **Media → Upload**
2. Drag and drop files or click to select
3. Up to 10 files at once, max 50MB each
4. For each file, optionally add **Title**, **Description**
5. Select **Category** and optionally link a **Competition**
6. Choose **Visibility**: Public (visible on public portal), Organization, or Admin Only
7. Click **Upload**
8. Progress bars show upload status for each file
9. Thumbnails auto-generate after upload completes
10. Files appear in the Gallery grid

## 7.2 Organising Albums

1. Navigate to **Media → Albums → Create Album**
2. Enter **Album Name** and optional **Description**
3. Set **Visibility**
4. Click **Save**
5. From the Gallery, select files and click **Add to Album**
6. Or from File Detail, select the album dropdown
7. The album appears on the Albums page with thumbnail preview

## 7.3 Managing Visibility

1. In Gallery, locate the file
2. Click the file to open **File Detail**
3. Click **Change Visibility**
4. Select: **Public** (anyone can view without login), **Organization** (any org member), **Admin Only** (Admin+ roles)
5. Click **Save**
6. Public files appear on the public portal gallery section
7. Organization files are visible in dashboard only

---

# Section 8: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| MEDIA-001 | Max file size: 50MB per file | Upload Validation |
| MEDIA-002 | Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, PDF, DOCX | Upload Validation |
| MEDIA-003 | Uploaded files are scanned for malware (if enabled) | Background Job |
| MEDIA-004 | Public visibility allows anyone to view (no login required) | RLS + Route |
| MEDIA-005 | Media uploaded by a user can be deleted by that user or any Admin+ | Server Action |
| MEDIA-006 | Thumbnails are auto-generated for image files at 200px, 800px, 1920px | Background Job |
| MEDIA-007 | Video files show a poster thumbnail (first frame extracted) | Background Job |
| MEDIA-008 | Storage bucket name: `festival-media-{org_id}` | Database Config |
| MEDIA-009 | Organization-level media is isolated via bucket folder prefix `{org_id}/` | Storage Policy |
| MEDIA-010 | Max 1000 files per album (soft limit) | UI Validation |

---

# Section 9: Best Practices

1. **Add descriptive titles** — helps with search and organisation
2. **Use categories and albums** — structured galleries are easier to browse
3. **Set appropriate visibility** — don't make sensitive images Public
4. **Compress images before upload** — smaller files upload faster
5. **Tag competition photos** — participants love finding their performance photos
6. **Create albums by day** — logical grouping for multi-day festivals
7. **Credit photographers** — use the Copyright field for attribution
8. **Review public gallery** — ensure only appropriate content is visible externally
9. **Delete duplicate uploads** — keep storage clean
10. **Use albums for results/ceremony** — parents look for award photos

---

# Section 10: Common Mistakes

1. ❌ **Uploading without visibility check** — private photos made public
2. ❌ **No organisation** — 500+ photos with no albums or categories
3. ❌ **Ignoring file size limits** — large files rejected by upload validation
4. ❌ **Uploading unsupported formats** — .HEIC, .RAW not supported
5. ❌ **Not adding descriptions** — difficult to find specific files later
6. ❌ **Mixing festival content** — unrelated images in festival gallery

---

# Section 11: Troubleshooting

## P1: Upload fails with "File too large"
**Problem:** File exceeds 50MB limit.  
**Solution:** Compress the file; split video into segments; use lower resolution.

## P2: Thumbnail not generating
**Problem:** Image uploads but thumbnail placeholder shows.  
**Root Causes:** Background job failed; unsupported format.  
**Solution:** Re-upload as JPEG/PNG; check background job logs.

## P3: Public gallery shows broken images
**Problem:** Public portal gallery shows broken image placeholders.  
**Root Causes:** RLS policy incorrect; file deleted but album still references.  
**Solution:** Check storage RLS policies; verify file still exists in bucket.

## P4: Cannot delete media
**Problem:** Delete button disabled or greyed out.  
**Root Causes:** You don't own the file and are not Admin+.  
**Solution:** Contact an Admin to delete; or change visibility to Admin Only to hide.

---

# Section 12: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **What file formats are supported?** | JPG, PNG, GIF, WEBP, MP4, MOV, PDF, DOCX. |
| 2 | **What's the maximum file size?** | 50MB per file. |
| 3 | **How many files can I upload at once?** | Up to 10 files simultaneously. |
| 4 | **Can I upload videos?** | Yes, MP4 and MOV are supported (max 50MB). |
| 5 | **Are files backed up?** | Supabase Storage is S3-compatible with 99.999999999% durability. |
| 6 | **Can the public see gallery photos?** | Only if visibility is set to Public. |
| 7 | **How long are files retained?** | Indefinitely, or until the organization deletes them. |
| 8 | **Can I download all gallery photos at once?** | Not currently. Use the Gallery view and download individually. |

---

*End of Media & Gallery Module Documentation (Module 16)*
