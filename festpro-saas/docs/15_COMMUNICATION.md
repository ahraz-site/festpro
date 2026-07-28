# FestPro Communication Module — Complete Official Documentation

**Module:** 15 — Communication & Notifications  
**Version:** 2.0  
**Dependencies:** Registration (06), Festival (04), Organization (02)  
**Applies To:** Festival Directors, Managers, Communication Team

---

# Section 1: Introduction

The Communication module powers all outbound messaging in FestPro. It supports multiple channels — Email, SMS, Push Notifications, and WhatsApp — with template-based content, variable substitution, broadcast scheduling, delivery tracking, and channel-specific rate limiting. Messages can be triggered manually or automated through event-based rules.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Multi-channel | Email (SendGrid), SMS (Twilio), Push (Web Push API), WhatsApp (WhatsApp Business API) |
| Template Engine | Pre-built templates with 8+ dynamic variables |
| Scheduled Broadcasts | Send now or schedule for later delivery |
| Event-triggered | Auto-notifications for registration, results, schedule changes |
| Delivery Tracking | Sent, Delivered, Read, Failed status per recipient |
| Rate Limiting | Channel-specific limits to prevent provider throttling |
| Preview Mode | Test messages before broadcast with sample data |
| Preference Management | Users can opt-in/opt-out per channel |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Service Provider Accounts | SendGrid (email), Twilio (SMS), WhatsApp Business API |
| API Keys Configured | Provider API keys set in Organization → Settings → Integrations |
| Verified Sender Identity | Sender email/phone verified with providers |
| Festival Selected | Messages are scoped to a festival |
| Recipient Data | Participants must have valid email and phone numbers in registration |

## Configuration Checklist

- [ ] Configure SendGrid API key for email delivery
- [ ] Configure Twilio Account SID + Auth Token for SMS
- [ ] Verify sender email (SendGrid single sender verification)
- [ ] Verify WhatsApp Business number
- [ ] Create message templates for common notifications
- [ ] Set up event-triggered notification rules
- [ ] Test a notification with a small group
- [ ] Review rate limits and adjust thresholds

---

# Section 3: Navigation

## Page Map

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/dashboard/festivals/[id]/communication` | Broadcast stats, recent activity |
| **New Broadcast** | `/dashboard/festivals/[id]/communication/broadcast/new` | Create and send a new message |
| **Templates** | `/dashboard/festivals/[id]/communication/templates` | Message template library |
| **Template Editor** | `/dashboard/festivals/[id]/communication/templates/[id]` | Edit template content |
| **History** | `/dashboard/festivals/[id]/communication/history` | Sent message log with delivery status |
| **Broadcast Detail** | `/dashboard/festivals/[id]/communication/history/[id]` | Per-recipient delivery breakdown |
| **Triggers** | `/dashboard/festivals/[id]/communication/triggers` | Event-based auto-notification rules |
| **Settings** | `/dashboard/festivals/[id]/communication/settings` | Provider config, rate limits, sender identity |

---

# Section 4: Screen Overview

## 4.1 New Broadcast Form

```
┌─────────────────────────────────────────────────────────────┐
│  NEW BROADCAST                                   [Send]     │
├─────────────────────────────────────────────────────────────┤
│ Channel:               [Email ▼]                            │
│ Recipient Group:       [All Participants        ▼]          │
│                           ├── All Participants              │
│                           ├── By Competition                │
│                           ├── Judges                        │
│                           ├── Volunteers                    │
│                           ├── Staff                         │
│                           └── Custom Filter                 │
│ Template:               [Select Template...      ▼]         │
│ Subject:                [Registration Confirmation     ]    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Body:                                                    │ │
│ │ Dear {{participant_name}},                               │ │
│ │                                                          │ │
│ │ Your registration for {{festival_name}} is confirmed!    │ │
│ │ Competition: {{competition_name}}                        │ │
│ │ Schedule: {{schedule}}                                   │ │
│ │                                                          │ │
│ │ Thank you!                                               │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [B] [I] [U] [Link] [Variable ▼]   Preview: [          ]│ │
│ └─────────────────────────────────────────────────────────┘ │
│ Schedule:              [Send Now] ○ [Schedule...]           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Preview (3 recipients sampled)                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ To: Aarav Sharma  │ Subject: Registration Confirmed │ │ │
│ │ │ Dear Aarav Sharma, ...                              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Template Form

**Location:** Communication → Templates → New/Edit Template

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Template Name | `text` | Yes | 2-100 chars | Internal identifier |
| Channel | `dropdown` | Yes | Email, SMS, Push, WhatsApp | Which channel this template is for |
| Category | `dropdown` | Yes | Registration, Results, Schedule, Payment, Reminder, System, Custom | Use case category |
| Subject (Email) | `text` | Conditional | Required for Email channel, max 200 chars | Email subject line |
| Body | `rich-text` / `textarea` | Yes | Email: HTML with rich text editor; SMS: 160 chars; Push: 100 chars | Message content with variables |
| Sender Name | `text` | No | Max 50 chars | Override sender display name |
| Attachment URL | `url` | No | Valid URL, max 10MB | Optional file to attach (email only) |
| Is Default | `toggle` | No | — | Use as default template for this category |

## 5.2 Template Variables

| Variable | Example Output | Description |
|----------|---------------|-------------|
| `{{participant_name}}` | Aarav Sharma | Full name of recipient |
| `{{festival_name}}` | District Youth Festival 2025 | Festival name |
| `{{competition_name}}` | Kathakali | Competition name |
| `{{schedule}}` | 15 Jan 2025, 10:00 AM, Stage A | Date/time/venue of participation |
| `{{rank}}` | 1st | Rank achieved (for results) |
| `{{score}}` | 91.5 | Score achieved (for results) |
| `{{certificate_url}}` | https://.../certificate.pdf | Link to download certificate |
| `{{registration_id}}` | REG-2025-00042 | Registration confirmation number |

## 5.3 Broadcast Form

**Location:** Communication → New Broadcast

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Channel | `dropdown` | Yes | Email, SMS, Push, WhatsApp | Delivery channel |
| Recipient Group | `dropdown` | Yes | All Participants, By Competition, Judges, Volunteers, Staff, Custom Filter | Target audience |
| Competition Filter | `multi-select` | Conditional | Required if group = By Competition | Specific competitions |
| Custom Recipients | `textarea` | Conditional | Required if group = Custom Filter | Enter emails/phones one per line |
| Template | `dropdown` | Yes | Filtered by channel | Select a template |
| Subject Override | `text` | No | Max 200 chars | Override template subject |
| Schedule | `datetime` | No | Must be future if scheduled | Send now or at scheduled time |
| Timezone | `dropdown` | Yes | Organization timezone default | Schedule timezone |
| Preview Mode | `toggle` | No | — | Send only to sender for testing |

## 5.4 Event Trigger Rule Form

**Location:** Communication → Triggers → New Rule

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Event | `dropdown` | Yes | Registration Confirmed, Payment Received, Results Published, Schedule Changed, Check-in Completed, Certificate Ready | Trigger event |
| Channel | `dropdown` | Yes | Email, SMS, Push, WhatsApp | Delivery channel |
| Template | `dropdown` | Yes | Filtered by channel | Template to use |
| Delay | `duration` | No | 0-72 hours | Delay before sending (e.g., "24h" for reminder) |
| Active | `toggle` | No | Default: ON | Enable or disable this rule |

---

# Section 6: Every Button — Complete Reference

| Button | Location | Action | Permission |
|--------|----------|--------|:----------:|
| **Send** | Broadcast form | Send message immediately | Manager+ |
| **Schedule** | Broadcast form | Schedule for later | Manager+ |
| **Save as Draft** | Broadcast form | Save without sending | Manager+ |
| **Preview** | Broadcast form | Preview with sample data | Manager+ |
| **Send Test** | Broadcast form | Send test to current user | Manager+ |
| **Cancel Schedule** | History detail | Cancel a scheduled broadcast | Manager+ |
| **Retry Failed** | History detail | Retry delivery for failed recipients | Manager+ |
| **Create Template** | Templates page | Open template editor | Manager+ |
| **Duplicate Template** | Template detail | Clone template | Manager+ |
| **Delete Template** | Template detail | Remove template | Fest Director+ |
| **Add Trigger** | Triggers page | Create event-triggered rule | Fest Director+ |
| **Test Trigger** | Trigger detail | Fire the action to test | Fest Director+ |
| **View History** | History page | Open broadcast details | Manager+ |
| **Export Log** | History page | Download delivery log as CSV | Manager+ |

---

# Section 7: Step-by-Step Guides

## 7.1 Creating a Message Template

1. Navigate to **Communication → Templates → New Template**
2. Enter **Template Name** (e.g., "Registration Confirmation - Email")
3. Select **Channel** (Email, SMS, Push, or WhatsApp)
4. Choose **Category** that fits the use case
5. If Email: enter **Subject** line (e.g., "Welcome to {{festival_name}}!")
6. Write the **Body** using the rich text editor
7. Insert variables using the **{{Variable}}** button (e.g., {{participant_name}})
8. Click **Preview** to see how the message renders with sample data
9. Toggle **Is Default** if this should be the default template for this category
10. Click **Save Template**

## 7.2 Sending a Broadcast

1. Navigate to **Communication → New Broadcast**
2. Select **Channel** (Email for formal, SMS for urgent, Push for real-time)
3. Select **Recipient Group**:
   - **All Participants**: Everyone registered for this festival
   - **By Competition**: Participants of selected competitions
   - **Judges**: All judges assigned to this festival
   - **Volunteers**: All approved volunteers
   - **Staff**: Organization staff with roles
   - **Custom Filter**: Manually enter email/phone list
4. Select a **Template** — the body auto-fills
5. Optionally override the **Subject**
6. Toggle **Preview Mode** to send a test to yourself
7. Choose **Send Now** or set **Schedule** for later
8. Click **Send** — the broadcast is queued for delivery
9. Track delivery status in **Communication → History**

## 7.3 Setting Up Event-Triggered Notifications

1. Navigate to **Communication → Triggers → Add Trigger**
2. Select **Event** that should trigger the message:
   - **Registration Confirmed**: Send welcome message
   - **Payment Received**: Send payment receipt
   - **Results Published**: Notify participants of results
   - **Schedule Changed**: Alert about time/venue change
   - **Check-in Completed**: Confirm check-in
   - **Certificate Ready**: Share download link
3. Select **Channel** and **Template**
4. Set optional **Delay** (e.g., send a reminder 24 hours before competition)
5. Toggle **Active** to ON
6. Click **Save**
7. Test the trigger by creating a test event

## 7.4 Checking Delivery Status

1. Navigate to **Communication → History**
2. All broadcasts appear with:
   - **Status**: Draft, Scheduled, Sending, Sent, Partial, Failed
   - **Progress**: X of Y delivered
   - **Time**: When sent/scheduled
3. Click a broadcast to view per-recipient breakdown:
   - ✅ **Delivered**: Successfully received
   - 👁️ **Read**: Recipient opened the message
   - ❌ **Failed**: Delivery failed (with error code)
   - ⏳ **Pending**: Still in delivery queue
4. Click **Retry Failed** to re-attempt delivery for failed recipients
5. Click **Export Log** for offline record-keeping

---

# Section 8: Delivery Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| Draft | Created but not sent | Send or schedule |
| Queued | In delivery queue | Auto-processed |
| Sending | Currently being sent | Monitor progress |
| Sent | All recipients processed | View breakdown |
| Partial | Some recipients not delivered | View failed, retry |
| Failed | All recipients failed | Check config, retry |
| Scheduled | Awaiting scheduled time | Cancel or wait |
| Cancelled | Scheduled broadcast cancelled | — |

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| COMM-001 | Email rate limit: 100/hour or 1000/day per organization | Server Action |
| COMM-002 | SMS rate limit: 20/minute per Twilio account | Server Action |
| COMM-003 | Push notifications: no rate limit (browser-based) | — |
| COMM-004 | WhatsApp rate limit: 1000/day per WhatsApp Business number | Server Action |
| COMM-005 | Broadcasts to >100 recipients are queued for async delivery | Queue |
| COMM-006 | Failed deliveries are logged with error reason and HTTP status code | Database |
| COMM-007 | Templates can be previewed with sample data before sending | UI |
| COMM-008 | Scheduled broadcasts can be cancelled before the scheduled time | Server Action |
| COMM-009 | Event-triggered notifications respect user notification preferences | Server Action |
| COMM-010 | Email sender must be verified with SendGrid | Provider Validation |
| COMM-011 | SMS messages >160 characters are split into multiple segments | Server Action |
| COMM-012 | Push notifications require user to have granted browser permission | Browser API |
| COMM-013 | Broadcast history is retained for 90 days (configurable) | Retention Policy |
| COMM-014 | Event-triggered notifications have a 5-minute cooldown per event per user | Server Action |
| COMM-015 | Variable substitution fails silently — missing variables are replaced with empty string | Business Logic |

---

# Section 10: Permissions Matrix

| Operation | Participant | Volunteer | Judge | Manager | Fest Director | Org Admin | Org Owner |
|-----------|:-----------:|:---------:|:-----:|:-------:|:-------------:|:---------:|:---------:|
| View own notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View history | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Send broadcast | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create templates | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit templates | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete templates | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage triggers | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Configure providers | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Cancel broadcast | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Export logs | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

---

# Section 11: Best Practices

1. **Use templates for consistency** — always brand your communications
2. **Personalise with variables** — messages with participant names have 30% higher open rates
3. **Test with Preview Mode** before broadcasting to all recipients
4. **Respect rate limits** — schedule large broadcasts in batches
5. **Schedule during business hours** — evening broadcasts have lower engagement
6. **Segment your audience** — send relevant messages to relevant groups
7. **Use SMS for urgent** — schedule changes, call-to-stage
8. **Use Email for formal** — certificates, invoices, results
9. **Enable push for real-time** — score updates, stage announcements
10. **Monitor delivery rates** — investigate if open rate drops below 40%
11. **Provide opt-out** — include unsubscribe link in emails
12. **A/B test subject lines** — test two subjects with small sample to find winner

---

# Section 12: Common Mistakes

1. ❌ **Sending without preview** — broken template variables
2. ❌ **Wrong recipient group** — sending schedule to judges instead of participants
3. ❌ **Exceeding rate limits** — messages queued but delayed or dropped
4. ❌ **Not testing on mobile** — SMS formatting broken on certain phones
5. ❌ **Missing unsubscribe link** — compliance issue (CAN-SPAM)
6. ❌ **Over-messaging** — notification fatigue, users disable notifications
7. ❌ **Using personal sender identity** — emails marked as spam
8. ❌ **Scheduling too far ahead** — context lost, schedule may have changed

---

# Section 13: Troubleshooting

## P1: Emails going to spam
**Problem:** Recipients report emails in spam folder.  
**Root Causes:** Sender not verified, low domain reputation, spammy content.  
**Solution:** Verify sender email; warm up domain; avoid spam trigger words.

## P2: SMS not delivered
**Problem:** SMS shows "Failed" status.  
**Root Causes:** Invalid phone number, carrier issue, insufficient Twilio balance.  
**Solution:** Verify phone format (include country code); check Twilio balance; retry.

## P3: Push notifications not appearing
**Problem:** Users don't receive push notifications.  
**Root Causes:** (1) Browser permission denied. (2) Service worker not registered. (3) PWA not installed.  
**Solution:** Check browser notification settings; re-register service worker.

## P4: Template variables showing raw text
**Problem:** {{participant_name}} appears literally in message.  
**Root Causes:** Variable name misspelled or data not available.  
**Solution:** Check template for exact variable spelling; verify participant data exists.

## P5: Scheduled broadcast not sent
**Problem:** Broadcast remains "Scheduled" past its time.  
**Root Causes:** Server timezone mismatch, queue worker down.  
**Solution:** Verify timezone setting; check background job queue; manually trigger.

---

# Section 14: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can I send a message to a single participant?** | Yes. Use "Custom Filter" recipient group and enter their email/phone. |
| 2 | **How many recipients can I send to at once?** | Up to 1000 per broadcast. Larger broadcasts are split into batches. |
| 3 | **Can I cancel a scheduled broadcast?** | Yes, before the scheduled time. Navigate to History → Cancel. |
| 4 | **What happens if a variable doesn't resolve?** | It shows as empty string (no error, no crash). |
| 5 | **Can I see who opened my email?** | Basic delivery tracking (Sent/Delivered/Failed) is available. Open tracking requires SendGrid engagement tracking. |
| 6 | **Are notifications stored permanently?** | History is retained for 90 days by default. Configurable in Settings. |
| 7 | **Can participants opt out of notifications?** | Yes, from their profile settings → Notification Preferences. |
| 8 | **Is WhatsApp messaging supported?** | Yes, through WhatsApp Business API. Requires a verified business number. |
| 9 | **Can I attach files to SMS?** | No. Attachments are only supported for Email. |
| 10 | **How do I resend failed messages?** | Navigate to History → Broadcast Detail → Retry Failed. |

---

# Section 15: Glossary

| Term | Definition |
|------|------------|
| **Broadcast** | A single message sent to multiple recipients |
| **Template** | Pre-defined message content with variable placeholders |
| **Channel** | Delivery method (Email, SMS, Push, WhatsApp) |
| **Rate Limit** | Maximum number of messages per unit time |
| **Delivery Status** | Current state of a message (Sent, Delivered, Failed) |
| **Event Trigger** | Rule that sends a notification automatically when an event occurs |
| **Service Provider** | Third-party service that handles actual message delivery (SendGrid, Twilio) |

---

*End of Communication Module Documentation (Module 15)*
