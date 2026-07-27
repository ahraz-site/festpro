# FestPro Results & Certificates — Complete Official Documentation

**Module:** Results & Certificates  
**Version:** 1.0  
**Dependencies:** Judging (07), Competition (05)  
**Applies To:** Festival Directors, Admins, Participants

---

# Section 1: Introduction

## 1.1 Results Engine

The Results Engine aggregates judge scores, calculates final rankings, applies tie-breaking rules, and manages the publication workflow. Results are computed in real-time but only visible to authorized users until publication.

## 1.2 Certificate Engine

The Certificate module automatically generates personalized certificates for participants, winners, judges, and volunteers. It supports customizable templates, batch generation, and multiple output formats.

---

# Section 5: Every Form

## 5.1 Certificate Template Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Template Name | text | Yes | Internal name for the template |
| Certificate Type | dropdown | Yes | Participation, Winner (1st/2nd/3rd), Appreciation, Judge, Volunteer |
| Orientation | dropdown | Yes | Portrait, Landscape |
| Page Size | dropdown | Yes | A4, A5, Letter, Custom |
| Background Image | file | Yes | Background design (PDF/Image) |
| Font Family | dropdown | Yes | Serif, Sans-serif |
| Primary Color | color picker | Yes | Text color |

## 5.2 Template Variables

| Variable | Example |
|----------|---------|
| `{{participant_name}}` | "Aarav Sharma" |
| `{{competition_name}}` | "Kathakali" |
| `{{rank}}` | "1st" |
| `{{festival_name}}` | "District Youth Festival 2025" |
| `{{organization_name}}` | "Kerala Youth Association" |
| `{{date}}` | "15 January 2025" |
| `{{score}}` | "91.5" |

---

# Section 7: Step-by-Step Guide

## 7.1 Publishing Results

**Step 1:** All judges have submitted scores for the competition.

**Step 2:** Navigate to Competition → Results tab.

**Step 3:** Review the calculated rankings.

**Step 4:** Verify tie-breakers are applied (if needed).

**Step 5:** Click **Publish Results**.

**Step 6:** Confirm in the dialog: "Publishing results will make them visible to all participants."

**Step 7:** Optionally check "Send notification to participants."

**Step 8:** Click **Confirm Publish**.

**Step 9:** Results status changes to Published.

**Step 10:** Participants receive notification (if enabled).

**Step 11:** Certificates can now be generated.

## 7.2 Generating Certificates

**Step 1:** Navigate to Certificates → Generate.

**Step 2:** Select **Certificate Type** (Participation, Winner, etc.).

**Step 3:** Select **Competition** (or All).

**Step 4:** Select **Template**.

**Step 5:** Click **Generate**.

**Step 6:** Progress bar shows generation status.

**Step 7:** Summary report on completion (success count, error count).

**Step 8:** Certificates appear in the certificate list ready for download.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| RES-001 | Results can only be published after all judges have submitted scores |
| RES-002 | Published results are visible to all participants and the public (if enabled) |
| RES-003 | Results cannot be unpublished once published (can be overridden with new publication) |
| RES-004 | Tie-breaking follows configured priority: highest criterion → judge count → head judge → random |
| RES-005 | Certificates can only be generated after results are published |
| RES-006 | Certificate templates must be created before generation |
| RES-007 | Certificates can be revoked with a reason (shown on verification page) |
| RES-008 | Certificate IDs are unique across the platform |
| RES-009 | Certificates can be verified by anyone via the public verification page |
| RES-010 | Bulk certificate generation processes up to 500 per batch |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Festival Director | Manager | Participant |
|-----------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:-----------:|
| View preliminary results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Publish results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Generate certificates | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Download own results | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Download own certificate | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Verify certificate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Revoke certificate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

# Section 34: Troubleshooting

## P1: Results not publishing
**Problem:** "Publish" button is disabled.
**Reasons:** Not all judges have submitted scores. Competition status is incorrect.
**Solution:** Verify all assigned judges have completed scoring. Check competition status.

## P2: Certificate generation fails
**Problem:** Error during certificate generation.
**Reasons:** Template missing required variables, background image invalid.
**Solution:** Verify template has all required variables. Check background image is valid format.

## P3: Certificate text misaligned
**Problem:** Text prints outside the certificate boundaries.
**Reasons:** Template layout position incorrect.
**Solution:** Adjust text position in template editor. Use preview before generating bulk.

## P4: Certificate verification returns invalid
**Problem:** Verification page shows "Certificate not found" or "Invalid."
**Reasons:** Certificate ID entered incorrectly, or certificate was revoked.
**Solution:** Double-check the certificate ID. If revoked, contact the issuing organization.

---

*End of Results & Certificates Module Documentation*
