# FestPro Registration Module — Complete Official Documentation

**Module:** Registration & Participants  
**Version:** 1.0  
**Dependencies:** Authentication (01), Organization (02), Festival (04), Competition (05)  
**Applies To:** Festival Directors, Managers, Reception Staff, Participants

---

# Section 1: Introduction

## 1.1 What This Module Is

The Registration module manages the complete lifecycle of participant enrollment — from self-service registration through the public portal to manual registration by reception staff. It handles participant profiles, competition selections, fee payments, status transitions, and on-site check-in.

## 1.2 Business Purpose

| Purpose | Implementation |
|---------|----------------|
| Participant enrollment | Self-service + manual + bulk import |
| Fee collection | Integrated payment processing |
| Identity verification | QR code check-in system |
| Capacity management | Per-competition participant limits |
| Communication channel | Participant contact for notifications |

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Participant List | `/dashboard/festivals/[id]/participants` | All participants in a festival |
| Create Participant | `/dashboard/festivals/[id]/participants/new` | Manual registration form |
| Participant Detail | `/dashboard/festivals/[id]/participants/[pid]` | Profile, registrations, payments |
| Check-in | `/dashboard/festivals/[id]/checkin` | QR scanner and manual check-in |
| Import | `/dashboard/festivals/[id]/participants/import` | Bulk CSV upload |

---

# Section 5: Every Form

## 5.1 Participant Registration Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | text | Yes | 2-100 characters |
| Last Name | text | Yes | 2-100 characters |
| Date of Birth | date | Yes | Must be valid for age group |
| Gender | dropdown | Yes | Male, Female, Other |
| Email | email | Yes | Valid email format |
| Phone | tel | Yes | 10-15 digits |
| Address | textarea | No | Max 500 characters |
| City | text | Yes | 2-100 characters |
| State/Province | text | No | 2-100 characters |
| Institution/School | text | No | 2-200 characters |
| Emergency Contact Name | text | Yes | 2-200 characters |
| Emergency Contact Phone | tel | Yes | 10-15 digits |

## 5.2 Competition Selection (during registration)

| Field | Type | Description |
|-------|------|-------------|
| Available Competitions | checkbox group | Filtered by participant's age and gender |
| Max Selections | Number | Defined in festival settings (default: 5) |

---

# Section 6: Every Button

| Button | Location | Action | Permission |
|--------|----------|--------|------------|
| Register | Public portal / Admin panel | Submit registration | Self / Reception+ |
| Check In | Participant list / Check-in page | Mark participant arrived | Reception+ |
| Approve | Participant detail | Confirm registration (skip payment) | Manager+ |
| Cancel | Participant detail | Cancel registration + optionally refund | Manager+ |
| Import | Participants page | Upload CSV | Manager+ |
| Export | Participants page | Download participant list | Manager+ |
| Resend Confirmation | Participant detail | Re-send confirmation email | Manager+ |

---

# Section 7: Step-by-Step Guide

## 7.1 Self-Registration (Participant)

**Step 1:** Visit the public portal (no login required).

**Step 2:** Browse the list of published festivals.

**Step 3:** Click on a festival to see its details and competitions.

**Step 4:** Click **Register Now**.

**Step 5:** Fill in personal information (name, DOB, gender, email, phone, etc.).

**Step 6:** Select competitions from the available list (filtered by age group).

**Step 7:** Review the registration summary and total fee.

**Step 8:** Proceed to payment (if fee applies). Choose payment method:
   - UPI: Scan QR code or enter UPI ID
   - Card: Enter card details
   - NetBanking: Select bank
   - Offline: Note the bank details for manual transfer

**Step 9:** After successful payment, registration status changes to **Confirmed**.

**Step 10:** Receive confirmation email with registration number and QR code.

**Step 11:** On festival day, present QR code for check-in.

## 7.2 Manual Registration (Reception)

**Step 1:** Navigate to the festival → **Participants** tab.

**Step 2:** Click **Add Participant**.

**Step 3:** Search for existing participant by email/phone to avoid duplicates.

**Step 4:** If not found, fill in the registration form.

**Step 5:** Select competitions.

**Step 6:** Process payment (cash, card, UPI — mark as received).

**Step 7:** Click **Save**. Participant receives confirmation.

**Step 8:** Print QR code badge or send via WhatsApp.

## 7.3 Bulk Import

**Step 1:** Click **Import** on the Participants page.

**Step 2:** Download the CSV template.

**Step 3:** Fill in participant data following the template format.

**Step 4:** Upload the completed CSV file.

**Step 5:** Review the import summary (success count, error count).

**Step 6:** Download error report for failed rows.

**Step 7:** Fix errors and re-upload remaining rows.

## 7.4 Check-in (On-Site)

**Step 1:** Participant presents QR code (printed or on phone).

**Step 2:** Reception opens the Check-in page on the tablet/phone.

**Step 3:** Scan the QR code using the device camera.

**Step 4:** Participant details appear on screen (name, competitions).

**Step 5:** Verify identity by matching name/photo.

**Step 6:** Click **Check In**.

**Step 7:** Status changes from Confirmed to Checked In.

**Step 8:** Participant proceeds to competition venue.

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| REG-001 | Email must be unique within a festival (one registration per email per festival) |
| REG-002 | Participant must be within the age range for each selected competition |
| REG-003 | Competition capacity must not be exceeded |
| REG-004 | Registration is only allowed during the open registration period |
| REG-005 | Registration fee must be paid (or marked as waived) before status becomes Confirmed |
| REG-006 | Cancelled registrations free up capacity for other participants |
| REG-007 | Check-in can only be done on or after the festival start date |
| REG-008 | A participant can be checked in at most once per registration |
| REG-009 | Walk-in registration (on the day) requires Reception role or higher |
| REG-010 | Bulk import validates all rows before importing any |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Festival Director | Manager | Reception | Participant |
|-----------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:---------:|:-----------:|
| Self-register | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manual register | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve registration | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel registration | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Check-in | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Bulk import | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export participants | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View own data | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

# Section 34: Troubleshooting

## P1: Registration form does not submit
**Problem:** "Please fill in all required fields" error.
**Reasons:** Required field is empty; validation rule failed.
**Solution:** Check all fields marked with *. Ensure email format is valid. Ensure phone has 10-15 digits.

## P2: Cannot select competition
**Problem:** Competition is grayed out or not in list.
**Reasons:** Age group mismatch, gender restriction, competition full, or registration closed.
**Solution:** Check participant's age matches age group. Check competition capacity. Verify registration period is open.

## P3: Payment fails
**Problem:** Gateway returns error or blank page.
**Reasons:** Payment gateway misconfigured, insufficient balance, network issue.
**Solution:** Try another payment method. Contact admin to check gateway configuration.

## P4: QR code not scanning
**Problem:** Scanner cannot read QR code.
**Reasons:** Screen brightness low, QR code damaged, camera permission denied.
**Solution:** Increase screen brightness. Download PDF and print. Grant camera permission. Use manual check-in.

## P5: Duplicate registration detected
**Problem:** "Already registered" message.
**Reasons:** Email already used for this festival.
**Solution:** Ask the participant to log in to view existing registration. Admin can override if it's a different person.

---

*End of Registration Module Documentation*
