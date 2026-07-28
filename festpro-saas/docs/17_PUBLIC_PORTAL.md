# FestPro Public Portal — Complete Official Documentation

**Module:** 17 — Public Portal  
**Version:** 2.0  
**Dependencies:** Festival (04), Competition (05), Registration (06)  
**Applies To:** All website visitors (no login required), Marketing Team

---

# Section 1: Introduction

The Public Portal is the outward-facing website where potential participants discover festivals, view competition details, browse schedules, explore galleries, and register — all without logging in. Each organisation gets a branded portal at `/org/[slug]` with customisable hero images, colors, and content sections.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Public Landing | Organisation portal at `/org/[slug]` with festival listings |
| Festival Detail | Full festival page with schedule, competitions, gallery |
| Self-Registration | Complete registration flow without authentication |
| Certificate Verification | Public certificate verification by ID |
| Live Schedule | Real-time schedule display with auto-refresh |
| Public Gallery | Publicly visible media gallery |
| Mobile Responsive | Fully responsive design for all screen sizes |
| SEO Optimised | Meta tags, structured data, sitemap generation |
| Rate Limited | 100 req/min per IP to prevent abuse |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Published Festival | At least one festival with Published status |
| Organisation Slug | URL slug configured in Organization → Settings |
| Public Content | Schedule, gallery, competitions marked as public visibility |
| Custom Domain (opt) | Custom domain configured in Organization → White Label |

## Configuration Checklist

- [ ] Set organization slug in Organization Settings
- [ ] Publish at least one festival
- [ ] Set competition schedules to Published
- [ ] Mark gallery media as Public visibility
- [ ] Add hero banner and description for the portal
- [ ] Configure SEO meta tags (optional)
- [ ] Test the public registration flow
- [ ] Verify certificate verification works

---

# Section 3: Portal Pages

## Page Map

| URL | Purpose | Example |
|-----|---------|---------|
| `/org/[slug]` | Organisation public portal — list of festivals | `/org/kerala-youth-fest` |
| `/org/[slug]/[festivalId]` | Single festival detail page | `/org/kerala-youth-fest/2025` |
| `/org/[slug]/[festivalId]/schedule` | Published schedule | `/org/kerala-youth-fest/2025/schedule` |
| `/org/[slug]/[festivalId]/gallery` | Public gallery | `/org/kerala-youth-fest/2025/gallery` |
| `/register/[festivalId]` | Self-service registration | `/register/abc-123` |
| `/verify` | Certificate verification | `/verify` |
| `/verify/[certCode]` | Certificate result | `/verify/CERT-2025-001` |

---

# Section 4: Screen Overview

## 4.1 Organisation Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│  🏛️  Kerala Youth Festival                                    │
│  ─────────────────────────────────────────────────         │
│  Organised by: Department of Cultural Affairs, Kerala      │
│  Since: 1956                                                │
├─────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║            DISTRICT YOUTH FESTIVAL 2025              ║  │
│  ║  📅 15-18 Jan 2025  📍 Kozhikode                    ║  │
│  ║  🏆 200+ Competitions  👥 10,000+ Participants      ║  │
│  ║           [Register Now]  [View Details]             ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║            YOUTH FESTIVAL 2024 (ARCHIVED)            ║  │
│  ║  📅 10-13 Jan 2024  📍 Thiruvananthapuram           ║  │
│  ║  [View Results] [Gallery]                            ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Festival Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│  ⬅ Back to Organization                                     │
│                                                             │
│  DISTRICT YOUTH FESTIVAL 2025                                │
│  ==============================================             │
│  About: The premier youth cultural festival of Kerala...     │
│                                                             │
│  📅 Dates: 15-18 January 2025                              │
│  📍 Venue: Kozhikode District                               │
│  ⏰ Registration: 1 Oct - 31 Dec 2024                       │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│  │Compet│ │Sched│ │Galer│ │Regis│                           │
│  │itions│ │ ule │ │  y  │ │ter  │                           │
│  └─────┘ └─────┘ └─────┘ └─────┘                           │
│                                                             │
│  Competition Categories:                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🎭 Folk Arts (12 competitions)                        │ │
│  │ 🎵 Music (45 competitions)                             │ │
│  │ 💃 Dance (30 competitions)                             │ │
│  │ 🎨 Visual Arts (25 competitions)                       │ │
│  │ 📚 Literary (40 competitions)                          │ │
│  │ 🎪 Theatre (20 competitions)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Public Registration Form

**URL:** `/register/[festivalId]`  
**Access:** No authentication required

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| First Name | `text` | Yes | 2-100 chars | Participant's given name |
| Last Name | `text` | Yes | 2-100 chars | Participant's family name |
| Date of Birth | `date` | Yes | Must match age group requirements | Age verification |
| Gender | `dropdown` | Yes | Male, Female, Other | Gender |
| Email | `email` | Yes | Valid email format | Contact email |
| Phone | `tel` | Yes | 10-15 digits | Mobile number |
| Address | `textarea` | Yes | Max 300 chars | Residential address |
| Institution | `text` | Conditional | Required for school/college festivals | School, college, or organisation |
| Institution ID | `text` | No | — | Student/employee ID |
| Guardian Name | `text` | Conditional | Required if under 18 | Parent/guardian name |
| Guardian Phone | `tel` | Conditional | Required if under 18 | Emergency contact |
| Competitions | `multi-select` | Yes | Must select at least 1 | Competitions to enter |
| Fee Summary | `auto` | Auto | Calculated from fee config | Total registration fee |
| Payment Method | `radio` | Conditional | Only if fee > 0 | How to pay |
| Agree to Terms | `checkbox` | Yes | Must be checked | Acceptance of rules |
| Captcha | `captcha` | Yes | Must pass | Anti-bot verification |

## 5.2 Certificate Verification Form

**URL:** `/verify`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Certificate Code | `text` | Yes | Valid certificate ID or QR code | Enter the code from the certificate |
| Captcha | `captcha` | Yes | Must pass | Anti-bot verification |

---

# Section 6: Step-by-Step Guide

## 6.1 Public Registration

1. Visit the public portal link shared by the organiser
2. Browse the list of published festivals
3. Click on a festival to view details
4. Review the competition categories and individual competitions
5. Click **Register Now**
6. Fill in **Personal Details**: name, DOB, gender, contact info
7. If under 18: enter guardian details
8. Select **Competitions** to enter (from available categories)
9. Review **Fee Summary** — discounts and taxes are auto-calculated
10. Choose **Payment Method** (if fee applies):
    - **Online**: UPI / Card / NetBanking — proceed to gateway
    - **Offline**: Pay at venue — note the reference number
11. Accept **Terms & Conditions**
12. Complete **Captcha** verification
13. Click **Submit Registration**
14. Confirmation page shows **Registration ID** and next steps
15. Confirmation email is sent automatically

## 6.2 Verifying a Certificate

1. Visit the public portal → **Verify Certificate**
2. Enter the **Certificate Code** from the certificate (or scan QR)
3. Complete the **Captcha**
4. Click **Verify**
5. The system displays:
   - ✅ Certificate is **Valid**: Participant name, competition, rank, date
   - ❌ Certificate is **Invalid**: Code not found or revoked
   - 🔄 Certificate was **Revoked**: Shows revoked date and reason

---

# Section 7: Business Rules

| Rule ID | Rule |
|---------|------|
| PORTAL-001 | Only Published festivals appear on the public portal |
| PORTAL-002 | Registration is open only during the registration window |
| PORTAL-003 | Public schedule shows only Published schedule items |
| PORTAL-004 | Public gallery shows only media with Public visibility |
| PORTAL-005 | Certificate verification is publicly accessible (no login) |
| PORTAL-006 | Rate limit: 100 requests per minute per IP |
| PORTAL-007 | Cache: 60s CDN cache for public pages (max 300s for static) |
| PORTAL-008 | Registration requires Captcha (anti-bot) |
| PORTAL-009 | Organisation slug must be unique across the platform |
| PORTAL-010 | Public pages are SEO-optimised with meta tags |

---

# Section 8: Best Practices

1. **Keep the portal updated** — stale festival info creates confusion
2. **Publish schedules early** — participants plan their attendance
3. **Use high-quality hero images** — first impression matters
4. **Optimise for mobile** — 70%+ of users access from phones
5. **Share the registration link widely** — social media, WhatsApp, email
6. **Test the full registration flow** — before opening registrations
7. **Monitor rate limits** — traffic spikes can trigger blocks
8. **Feature past festival results** — builds credibility
9. **Add FAQ section** — reduces support calls
10. **Enable public gallery** — participants share their photos

---

# Section 9: Common Mistakes

1. ❌ **Forgetting to publish the festival** — portal shows "No festivals"
2. ❌ **Registration window not set** — participants can't register
3. ❌ **Not marking media as Public** — gallery shows empty
4. ❌ **Broken certificate verification** — wrong certificate ID format
5. ❌ **Slow loading images** — unoptimised hero images

---

# Section 10: Troubleshooting

## P1: Festival not showing on portal
**Problem:** Published festival doesn't appear on the portal.  
**Root Causes:** Festival status is Draft; registration window not yet open.  
**Solution:** Verify festival status is Published; check registration date range.

## P2: Registration button disabled
**Problem:** Register Now button is greyed out.  
**Root Causes:** Registration window closed; max capacity reached.  
**Solution:** Check registration date range; increase max participants if needed.

## P3: Certificate shows "Invalid"
**Problem:** Certificate verification returns invalid.  
**Root Causes:** Code entered incorrectly; certificate revoked; not yet generated.  
**Solution:** Double-check the certificate code; verify certificate status in admin.

---

# Section 11: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can I register without creating an account?** | Yes. Public registration requires no login. |
| 2 | **How do I find my organisation's portal?** | Visit `/org/[slug]` where slug is your organisation's URL handle. |
| 3 | **Can I cancel my registration?** | Yes, using the cancellation link in your confirmation email. |
| 4 | **Is my personal data safe?** | Yes. All data is encrypted and protected by RLS policies. |
| 5 | **How do I verify a certificate?** | Visit `/verify` and enter the certificate code. |
| 6 | **Can organisations have custom domains?** | Yes, with the White Label module. |
| 7 | **How long are registration links valid?** | Until the registration closing date. |
| 8 | **Can I see past festival results?** | Yes, if the organiser has published results. |

---

*End of Public Portal Module Documentation (Module 17)*
