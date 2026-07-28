# FestPro Finance Module — Complete Official Documentation

**Module:** 11 — Finance  
**Version:** 2.0  
**Dependencies:** Registration (06), Festival (04), Organization (02)  
**Applies To:** Finance Officers, Organization Admins, Festival Directors

---

# Section 1: Introduction

The Finance module is the monetary backbone of FestPro. It handles fee configuration, payment processing (online and offline), refund management, invoice generation, expense tracking, and financial reporting. It integrates with Razorpay and Stripe for online payments and supports manual reconciliation for cash/cheque collections.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Fee Configuration | Registration fees, late fees, early bird discounts, group discounts |
| Online Payments | Razorpay and Stripe integration with webhook verification |
| Offline Payments | Cash, cheque, bank transfer recording and reconciliation |
| Refund Processing | Full and partial refunds with configurable policies |
| Invoice Engine | Auto-generation, custom numbering, PDF download |
| Expense Tracking | Categorised expense recording against festival budgets |
| Financial Reports | 10+ report types with export (PDF, CSV, Excel) |
| Tax Calculation | Configurable GST/VAT rates per transaction |
| Budget Management | Per-festival and per-competition budget allocation |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Organization | An active organization with confirmed ownership |
| Payment Gateway Account | Razorpay or Stripe account with API keys |
| Festival | At least one festival created (fee configuration is per festival) |
| Role | You need **Finance** role or higher (Manager+, Festival Director) |

## Configuration Checklist

- [ ] Add payment gateway API keys in Organization → Settings → Payments
- [ ] Configure fee structure for each competition in the festival
- [ ] Set up late fee rules and early bird discount windows
- [ ] Define refund policy (full refund window, partial refund window)
- [ ] Configure tax rates if applicable
- [ ] Set invoice numbering prefix
- [ ] Test payment flow in gateway test mode
- [ ] Assign Finance role to relevant team members

---

# Section 3: Navigation

## Page Map

| Page | URL | Purpose |
|------|-----|---------|
| **Finance Dashboard** | `/dashboard/festivals/[id]/finance` | Revenue summary, charts, recent transactions, pending actions |
| **Transactions** | `/dashboard/festivals/[id]/finance/transactions` | All payments, refunds, and expenses with filter/search |
| **Transaction Detail** | `/dashboard/festivals/[id]/finance/transactions/[txnId]` | Single transaction view with audit trail |
| **Invoices** | `/dashboard/festivals/[id]/finance/invoices` | Invoice list, status, download |
| **Invoice Detail** | `/dashboard/festivals/[id]/finance/invoices/[invoiceId]` | Single invoice with payment history |
| **Expenses** | `/dashboard/festivals/[id]/finance/expenses` | Expense records, categorization |
| **Reports** | `/dashboard/festivals/[id]/finance/reports` | Report generation and export |
| **Budget** | `/dashboard/festivals/[id]/finance/budget` | Budget allocation and tracking |
| **Settings** | `/dashboard/festivals/[id]/finance/settings` | Fee templates, gateway config, invoice settings |
| **Payments** | `/dashboard/festivals/[id]/finance/payments` | Payment attempt log with status |

## Left Navigation Menu Items

| Menu Item | Icon | Badge |
|-----------|------|-------|
| Dashboard | `LayoutDashboard` | Pending approvals count |
| Transactions | `ArrowLeftRight` | Failed payments count |
| Invoices | `FileText` | Unpaid count |
| Expenses | `Receipt` | — |
| Reports | `BarChart3` | — |
| Budget | `Wallet` | Over-budget count |
| Settings | `Settings` | — |

---

# Section 4: Screen Overview

## 4.1 Finance Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  FINANCE DASHBOARD                              [Export ▼] │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│ │ Revenue   │ │ Pending   │ │ Expenses  │ │ Net       │   │
│ │ ₹1,25,000│ │ ₹12,500   │ │ ₹45,000   │ │ ₹80,000   │   │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Revenue Trend (Line Chart)                    [Month ▼] │ │
│ │ ▁▂▃▅▇▆▅▃▂▁ — Jan to Dec 2025                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌──────────────┐  ┌──────────────────────────────────────┐ │
│ │ Recent       │  │ Pending Actions                      │ │
│ │ Transactions │  │ • 3 offline payments to verify       │ │
│ │ • INV-001    │  │ • 1 refund request — Awaiting        │ │
│ │ • INV-002    │  │ • Budget overrun: Stage Decoration   │ │
│ │ • INV-003    │  └──────────────────────────────────────┘ │
│ └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Transactions List

```
┌─────────────────────────────────────────────────────────────┐
│  TRANSACTIONS                                   [+ Record] │
├─────────────────────────────────────────────────────────────┤
│ [Search]    [All Types ▼]    [All Status ▼]    [Date ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ☐ │ ID │ Type    │ Amount │ Method │ Status    │ Date     │
│ ☐ │ 1  │ Fee     │ ₹500   │ UPI    │ Completed │ 15-Jan   │
│ ☐ │ 2  │ Refund  │ -₹500  │ UPI    │ Completed │ 16-Jan   │
│ ☐ │ 3  │ Expense │ ₹2000  │ Cash   │ Pending   │ 17-Jan   │
├─────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 45                           [1] [2] [3] ► │
└─────────────────────────────────────────────────────────────┘
```

## 4.3 Reports Page

```
┌─────────────────────────────────────────────────────────────┐
│  FINANCIAL REPORTS                               [+ New]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Report Type ─────────────────────────────────────────┐ │
│ │ ○ Revenue Summary    ○ Fee Collection    ○ P&L Statement│ │
│ │ ○ Budget vs Actual   ○ Expense Report    ○ Tax Report   │ │
│ │ ○ Refund Report      ○ Daily Collection  ○ GST Report   │ │
│ │ ○ Custom Report                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [From Date █] [To Date █] [Group By: Day ▼] [Generate]     │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 5: Every Form — Complete Field Reference

## 5.1 Fee Configuration Form

**Location:** Finance → Settings → Fee Configuration  
**Purpose:** Set up registration fees for the festival

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| Registration Fee | `decimal(10,2)` | Yes | Min: 0, Max: 1000000 | 0 | Base registration fee per participant |
| Late Fee | `decimal(10,2)` | No | Must be > registration_fee OR 0 | 0 | Additional fee charged after late fee start date |
| Late Fee Start Date | `date` | Conditional | Must be >= festival start date, before registration end | — | Date after which late fee applies |
| Early Bird Discount % | `decimal(5,2)` | No | 0-100 | 0 | Percentage discount for early registration |
| Early Bird End Date | `date` | Conditional | Must be before late fee start and registration end | — | Last date for early bird discount |
| Group Discount % | `decimal(5,2)` | No | 0-100 | 0 | Percentage discount for group registrations |
| Min Participants | `integer` | Conditional | 2-100, required if group discount > 0 | 5 | Minimum group size for discount eligibility |
| Max Participants | `integer` | No | 1-100000 | — | Festival capacity cap |
| Tax Rate % | `decimal(5,2)` | No | 0-100 | 0 | GST/VAT percentage applied to all fees |
| Tax Name | `text` | Conditional | Required if tax_rate > 0 | GST | Label shown on invoices |
| Currency | `dropdown` | Yes | INR, USD, EUR, GBP, AED | INR | Transaction currency |
| Payment Methods | `multi-select` | Yes | Options: UPI, Card, NetBanking, Wallet, Cash, Cheque, Bank Transfer | UPI, Card | Enabled payment methods |
| Auto Invoice | `toggle` | No | — | ON | Auto-generate invoice on successful payment |
| Allow Partial Payment | `toggle` | No | — | OFF | Allow participants to pay in instalments |
| Refund Policy | `dropdown` | Yes | No Refund, Full Refund (7d window), Full+Partial, Custom | Full Refund | Default refund policy for this festival |

## 5.2 Online Payment Form (Participant-facing)

**Location:** During registration → Payment step  
**Purpose:** Process online payment through gateway

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Amount | `decimal` | Auto | Calculated from fee config | Total payable amount |
| Payment Method | `radio` | Yes | UPI, Card, NetBanking, Wallet | Selected payment method |
| Coupon Code | `text` | No | Must be valid, not expired | Optional discount coupon |
| Discount Applied | `decimal` | Auto | — | Coupon or early bird discount |
| Final Amount | `decimal` | Auto | Non-negative | Amount after discounts + tax |
| Terms Accepted | `checkbox` | Yes | Must be checked | Accept refund policy and terms |
| Pay Now | `button` | — | — | Opens gateway checkout |

## 5.3 Offline Payment Recording Form

**Location:** Finance → Transactions → Record Payment  
**Purpose:** Manually record cash, cheque, or bank transfer payments

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Participant | `autocomplete` | Yes | Must be registered in this festival | Search by name, email, or registration ID |
| Registration | `autocomplete` | Auto | Linked to participant | Shows participant's registrations |
| Amount | `decimal(10,2)` | Yes | Must match registration fee (or custom) | Amount received |
| Payment Method | `dropdown` | Yes | Cash, Cheque, Bank Transfer | How payment was received |
| Cheque Number | `text` | Conditional | Required if method=Cheque, max 20 chars | Cheque identification |
| Bank Name | `text` | Conditional | Required if method=Cheque/Bank Transfer | Issuing bank |
| Cheque Date | `date` | Conditional | Required if method=Cheque | Date on cheque |
| Transaction Reference | `text` | No | Max 50 chars | Bank transaction or deposit reference |
| Payment Date | `date` | Yes | Cannot be future date | Date payment was received |
| Received By | `text` | Auto | Current user | Who recorded the payment |
| Notes | `textarea` | No | Max 500 chars | Additional information |
| Attach Receipt | `file` | No | PDF/Image, max 5MB | Upload payment proof |

## 5.4 Refund Processing Form

**Location:** Finance → Transactions → [Select Completed Payment] → Refund  
**Purpose:** Process partial or full refund

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Original Transaction | `text` | Auto | Must be completed | Linked payment transaction |
| Refund Type | `radio` | Yes | Full, Partial | Type of refund |
| Refund Amount | `decimal` | Yes | If partial: >0 and <= original amount | Amount to refund |
| Refund Method | `dropdown` | Yes | Same as original, Cash, Bank Transfer | How refund is returned |
| Reason | `textarea` | Yes | Max 1000 chars | Reason for refund |
| Gateway Refund ID | `text` | Conditional | Required for online refunds | PG refund reference |
| Process Fee Deduction | `toggle` | No | — | Deduct gateway processing fee from refund |
| Approver | `autocomplete` | Conditional | Finance+ role required for >₹5000 | Additional approval for large refunds |

## 5.5 Expense Recording Form

**Location:** Finance → Expenses → Add Expense  
**Purpose:** Record festival-related expenses

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Expense Title | `text` | Yes | 3-200 characters | Short description |
| Category | `dropdown` | Yes | Stage, Sound, Lighting, Catering, Transport, Decoration, Printing, Medical, Security, Other | Expense category |
| Amount | `decimal(10,2)` | Yes | >0 | Total expense amount |
| Bill/Receipt Number | `text` | No | Max 50 chars | Vendor bill reference |
| Vendor Name | `text` | No | Max 200 chars | Paid to |
| Payment Method | `dropdown` | Yes | Cash, Cheque, Bank Transfer, Card, UPI | How expense was paid |
| Payment Date | `date` | Yes | Cannot be future | Date of payment |
| Budget Code | `dropdown` | No | Linked budget line item | Allocate against budget |
| Attach Bill | `file` | No | PDF/Image, max 10MB | Upload bill copy |
| Notes | `textarea` | No | Max 500 chars | Any additional details |

## 5.6 Budget Allocation Form

**Location:** Finance → Budget → Add Budget Item  
**Purpose:** Allocate budget to festival categories

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Category | `dropdown` | Yes | Same as expense categories | Budget line category |
| Allocated Amount | `decimal(10,2)` | Yes | >0 | Total budget for this category |
| Description | `textarea` | No | Max 500 chars | What this budget covers |
| Start Date | `date` | No | Must be within festival dates | Budget availability start |
| End Date | `date` | No | Must be after start date | Budget availability end |
| Notify When | `dropdown` | No | 50%, 75%, 90%, 100% | Alert % of budget used |

## 5.7 Invoice Settings Form

**Location:** Finance → Settings → Invoices  
**Purpose:** Configure invoice generation

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Invoice Prefix | `text` | Yes | 2-10 chars | e.g., INV, FEST |
| Next Invoice Number | `integer` | Yes | Auto-increments | Starting number |
| Invoice Footer | `textarea` | No | Max 500 chars | Terms, bank details, etc. |
| Logo | `image` | No | PNG/JPG, max 2MB | Organization logo on invoice |
| Show GST | `toggle` | No | — | Show tax breakdown |
| GST Number | `text` | Conditional | Required if show_gst | Organization GSTIN |
| Auto-Email Invoice | `toggle` | No | — | Send invoice PDF via email |
| CC Email | `email` | No | Valid email | BCC copy to finance team |

## 5.8 Coupon/Discount Code Form

**Location:** Finance → Settings → Coupons  
**Purpose:** Create promotional discount codes

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Code | `text` | Yes | 4-20 chars, alphanumeric, unique | Coupon code |
| Discount Type | `radio` | Yes | Percentage, Fixed Amount | Type of discount |
| Discount Value | `decimal` | Yes | Percentage: 1-100, Fixed: 1-100000 | Discount amount |
| Max Uses | `integer` | No | 1-100000 or unlimited | Total usage limit |
| Per User Limit | `integer` | No | 1-10 | How many times one user can use |
| Min Registration Amount | `decimal` | No | 0-100000 | Minimum fee to apply coupon |
| Valid From | `datetime` | Yes | — | Coupon validity start |
| Valid Until | `datetime` | Yes | Must be after valid_from | Coupon expiry |
| Applicable Competitions | `multi-select` | No | List of competitions | Restrict coupon to specific competitions |

---

# Section 6: Every Button — Complete Reference

| Button | Location | Action | Permission Required | Confirmation? |
|--------|----------|--------|-------------------|:-------------:|
| **Record Payment** | Transactions page | Opens offline payment form | Finance+ | No |
| **Process Refund** | Transaction detail | Opens refund form | Finance+ | Yes |
| **Generate Invoice** | Invoice list | Creates invoice for selected transaction | Finance+ | No |
| **Download Invoice** | Invoice detail | Downloads PDF | Finance+ | No |
| **Email Invoice** | Invoice detail | Sends invoice PDF via email | Finance+ | No |
| **Add Expense** | Expenses page | Opens expense form | Finance+ | No |
| **Add Budget Item** | Budget page | Opens budget allocation form | Festival Director+ | No |
| **Export CSV** | Any list page | Downloads filtered data as CSV | Finance+ | No |
| **Generate Report** | Reports page | Runs report for selected period | Finance+ | No |
| **Schedule Report** | Reports page | Sets up auto-report generation | Festival Director+ | No |
| **Verify Payment** | Transaction detail | Marks offline payment as verified | Finance+ | Yes |
| **Void Transaction** | Transaction detail | Cancels a pending transaction | Festival Director+ | Yes |
| **Sync Gateway** | Settings → Payments | Pulls latest transactions from gateway | Org Admin+ | No |
| **Test Gateway** | Settings → Payments | Processes a ₹1 test transaction | Org Admin+ | No |
| **Add Coupon** | Settings → Coupons | Creates new discount code | Festival Director+ | No |
| **Reconcile** | Dashboard | Opens reconciliation tool | Finance+ | No |

---

# Section 7: Step-by-Step Guides

## 7.1 Configuring Fees for a Festival

1. Navigate to **Festivals → [Your Festival] → Finance → Settings**
2. Click **Fee Configuration** tab
3. Enter **Registration Fee** (e.g., 500 for the base fee)
4. Optionally set **Late Fee** (e.g., 200) and **Late Fee Start Date**
5. Optionally set **Early Bird Discount** (e.g., 10 for 10% off)
6. Set **Early Bird End Date** to the last day of early registration
7. Enable **Group Discount** and set **Min Participants** if applicable
8. Set **Tax Rate** (e.g., 18 for GST)
9. Select enabled **Payment Methods**
10. Choose **Refund Policy** from the dropdown
11. Click **Save Configuration**
12. Verify the fee structure appears correctly in the preview

## 7.2 Recording an Offline Payment (Cash/Cheque)

1. Navigate to **Finance → Transactions**
2. Click **Record Payment** button
3. In the **Participant** field, search by name, email, or registration ID
4. Select the participant — their registrations auto-populate
5. The **Amount** field auto-fills with the registration fee (overridable)
6. Select **Payment Method** (Cash, Cheque, or Bank Transfer)
7. If Cheque: enter cheque number, bank name, and cheque date
8. Set **Payment Date** to the actual receipt date
9. Optionally add **Notes** and attach **Receipt**
10. Click **Save**
11. The transaction appears with **Pending** status
12. A Finance Officer must **Verify** the payment to mark it **Completed**

## 7.3 Processing a Refund

1. Navigate to **Finance → Transactions**
2. Find the completed transaction
3. Click the transaction to open **Transaction Detail**
4. Click **Process Refund**
5. Select **Refund Type**: Full or Partial
6. If Partial, enter the **Refund Amount**
7. Select **Refund Method** (same as original or cash)
8. Enter **Reason** for refund
9. Toggle **Process Fee Deduction** if gateway fees should be deducted
10. If amount > ₹5000, select an **Approver**
11. Click **Submit Refund**
12. For online payments: refund is processed through gateway (may take 3-7 days)
13. For offline payments: mark as **Refund Handed Over** once cash is given

## 7.4 Generating Financial Reports

1. Navigate to **Finance → Reports**
2. Select **Report Type**:
   - **Revenue Summary**: Total income from all sources
   - **Fee Collection**: Registration fee breakup by competition
   - **P&L Statement**: Profit and loss calculation
   - **Budget vs Actual**: Compare budget with actual spending
   - **Expense Report**: All expenses by category
   - **Tax Report**: GST/VAT collected
   - **Refund Report**: All refunds processed
   - **Daily Collection**: Day-wise revenue breakdown
3. Set **From Date** and **To Date**
4. Optionally set **Group By** (Day, Week, Month, Category)
5. Click **Generate Report**
6. View the report on screen with charts and tables
7. Click **Export** → choose **PDF**, **CSV**, or **Excel**
8. Optionally click **Schedule Report** for auto-generation

## 7.5 Reconciling Online Payments

1. Navigate to **Finance → Settings → Payments**
2. Click **Sync Gateway** to pull latest transactions from Razorpay/Stripe
3. The sync compares gateway records with system records
4. **Matched** transactions are auto-reconciled
5. **Unmatched** transactions appear in the reconciliation queue
6. For each unmatched transaction:
   - If found in gateway but not in system: click **Import** to add
   - If found in system but not in gateway: click **Mark as Manual**
   - If amount mismatch: click **Flag for Review**
7. Download the **Reconciliation Report** for audit purposes
8. Repeat sync daily during active registration periods

## 7.6 Managing Budget

1. Navigate to **Finance → Budget**
2. Click **Add Budget Item**
3. Select **Category** (e.g., Stage Decoration, Sound System, Catering)
4. Enter **Allocated Amount**
5. Optionally set **Start Date** and **End Date**
6. Set **Notify When** threshold (e.g., 75% to get alert)
7. Click **Save**
8. The budget item appears in the list with a progress bar
9. As expenses are recorded against this category, utilization updates automatically
10. When utilization crosses the threshold, a notification is triggered

---

# Section 8: Invoice System

## 8.1 Invoice Numbering

Invoices follow a configurable numbering pattern:

```
[PREFIX]-[YEAR]-[SEQUENTIAL]
Example: INV-2025-000001
```

| Component | Configurable | Description |
|-----------|:-----------:|-------------|
| PREFIX | Yes | 2-10 character org prefix (default: INV) |
| YEAR | Auto | Current year (YYYY) |
| SEQUENTIAL | Auto | 6-digit zero-padded sequence, resets yearly |

## 8.2 Invoice Statuses

| Status | Description |
|--------|-------------|
| Draft | Generated but not finalized |
| Issued | Finalized and sent to participant |
| Paid | Full payment received |
| Partially Paid | Partial payment received |
| Overdue | Past due date without full payment |
| Cancelled | Voided — no longer valid |
| Refunded | Payment refunded |

## 8.3 Invoice Data Fields

| Field | Source |
|-------|--------|
| Invoice Number | Auto-generated |
| Invoice Date | Generation date |
| Due Date | Generation date + 7 days (configurable) |
| Bill To | Participant name, email, phone |
| Organization | Org name, address, GSTIN |
| Item | Competition name |
| Quantity | 1 |
| Unit Price | Registration fee |
| Discount | Applied discount amount |
| Taxable Amount | Fee - Discount |
| Tax % | Configured tax rate |
| Tax Amount | Taxable × Tax% |
| Total | Taxable Amount + Tax |
| Payment Status | Pending / Paid / Failed |

---

# Section 9: Business Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| FIN-001 | Registration fee must be paid before participant status changes from Pending to Confirmed | Server Action |
| FIN-002 | Online payments are processed exclusively through the configured gateway (Razorpay/Stripe) | Gateway SDK |
| FIN-003 | Offline payments must be manually verified by a Finance+ role before status changes | RLS + UI |
| FIN-004 | Refunds can be full or partial; gateway processing fees (2% + GST) may be non-refundable | Business Logic |
| FIN-005 | Online refunds must be processed through the payment gateway; offline refunds through cash/transfer | Server Action |
| FIN-006 | All financial transactions — fee, refund, expense — are recorded in the audit log | Database Trigger |
| FIN-007 | Invoices are auto-generated on successful payment (unless auto-invoice is disabled) | Server Action |
| FIN-008 | Invoice numbering follows pattern PREFIX-YYYY-NNNNNN with yearly reset | Database Sequence |
| FIN-009 | Discounts are applied before tax calculation: Total = (Fee - Discount) × (1 + Tax%) | Business Logic |
| FIN-010 | Late fees auto-apply when registration date is after late_fee_start_date | Database Check |
| FIN-011 | Early bird discount auto-applies when registration date is before early_bird_end_date | Database Check |
| FIN-012 | A single coupon code can be used only once per participant per competition | Server Action |
| FIN-013 | Refund amount cannot exceed the original transaction amount minus processing fees | Server Action |
| FIN-014 | Budget utilization is calculated as sum(expenses) / allocated_amount × 100 | Database View |
| FIN-015 | Expense against a budget category cannot exceed 110% of allocated amount without Festival Director approval | Server Action |
| FIN-016 | Gateway sync is idempotent — duplicate syncs do not create duplicate transactions | Business Logic |
| FIN-017 | All monetary values are stored in cents (integer) to avoid floating-point precision errors | Database Schema |
| FIN-018 | Transactions older than 7 years are archived (configurable retention period) | Cron Job |
| FIN-019 | Refund approval threshold: >₹5000 requires Festival Director+, >₹25000 requires Org Admin+ | Server Action |
| FIN-020 | Daily reconciliation report is auto-emailed to Finance role at 9 PM every day | Cron Job |

---

# Section 10: Permissions Matrix

| Operation | Participant | Staff | Reception | Volunteer | Judge | Media | Finance | Manager | Fest Director | Org Admin | Org Owner | Platform Admin | Platform Owner |
|-----------|:-----------:|:-----:|:---------:|:---------:|:-----:|:-----:|:-------:|:-------:|:-------------:|:---------:|:---------:|:--------------:|:--------------:|
| View own transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all transactions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Record offline payment | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Verify offline payment | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Process refund | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve refund >₹5000 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configure fees | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage coupons | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Generate invoices | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download invoices | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Record expenses | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage budget | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Generate reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schedule reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export financial data | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configure gateway | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Sync gateway | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete transaction | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View financial settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access audit trail | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# Section 11: Best Practices

1. **Reconcile payments daily** during registration periods — match gateway records with system records every evening
2. **Set late fees early** — define the late fee start date at least 2 weeks before registration opens
3. **Use group discounts strategically** — offer 5-10% for groups of 5+ to encourage institutional registrations
4. **Process refunds within 48 hours** — participant satisfaction depends on quick financial resolution
5. **Audit offline payments weekly** — cross-check cash and cheque records against bank deposit slips
6. **Keep fee configuration simple** — 2-3 fee tiers maximum; too many options confuse participants
7. **Test the payment gateway** in test mode before opening registrations — verify webhook delivery
8. **Generate and email invoices immediately** — participants appreciate instant receipts
9. **Monitor outstanding payments daily** — send automated reminders 7 days and 1 day before deadline
10. **Set budget alerts at 75% utilization** — avoid surprise overspending
11. **Archive financial reports annually** — maintain 7-year records for compliance
12. **Use the correct expense category** — consistent categorization enables accurate budget vs actual analysis
13. **Always attach receipts** for expenses and offline payments — paperless audit trail
14. **Never delete transactions** — void them instead; the audit log preserves the original record
15. **Configure tax rates before publishing** — retroactive tax changes require manual recalculations
16. **Limit Finance role access** — only grant Finance to team members who handle money
17. **Run a trial payment flow** — register a test participant and pay ₹1 to verify the full flow
18. **Set invoice footer with bank details** — participants can make direct bank transfers easily
19. **Use coupon codes for promotions** — track which channels drive registrations
20. **Monitor gateway fee structure** — Razorpay charges 2% + GST; factor this into pricing

---

# Section 12: Common Mistakes

1. ❌ **Setting late fee dates after registration closes** — late fee never applies
2. ❌ **Not setting a refund policy** — participants demand refunds without clear policy
3. ❌ **Forgetting to enable the payment gateway** — participants cannot pay online
4. ❌ **Entering fees without tax** — final amount at checkout differs from advertised price
5. ❌ **Recording offline payments without verification** — financial records become unreliable
6. ❌ **Processing refunds without noting the reason** — audit trail is incomplete
7. ❌ **Deleting transactions instead of voiding** — hard delete breaks invoice references
8. ❌ **Using incorrect expense categories** — budget reports show misleading data
9. ❌ **Not syncing the payment gateway daily** — reconciliation backlog grows
10. ❌ **Sharing gateway API keys with non-admin staff** — security risk to financial data
11. ❌ **Allowing partial payments without adequate tracking** — payment status confusion
12. ❌ **Generating reports without date filters** — includes data from previous festivals
13. ❌ **Skipping budget allocation** — no way to track spending against plan
14. ❌ **Not testing webhook endpoints** — payment statuses never update
15. ❌ **Forgetting to reset invoice numbering yearly** — invoice numbers become ambiguous
16. ❌ **Approving large refunds without documentation** — compliance risk
17. ❌ **Setting conflicting discount rules** — participants exploit overlapping discounts
18. ❌ **Not archiving old transactions** — database performance degrades
19. ❌ **Mixing personal and festival expenses** — financial reports become inaccurate
20. ❌ **Ignoring gateway settlement delays** — cash flow forecasting suffers

---

# Section 13: Troubleshooting

## P1: Payment gateway redirects to blank page
**Severity:** Critical  
**Problem:** After clicking "Pay Now", the gateway page shows blank or 504 error.  
**Root Causes:** (1) Gateway API keys are from production but mode is test (or vice versa). (2) Webhook URL is incorrect. (3) Gateway server is down.  
**Steps to Resolve:**
1. Go to Finance → Settings → Payments
2. Click **Test Gateway** — processes a ₹1 test
3. If test fails: verify API key pair (Key ID + Secret) match the gateway dashboard
4. Check gateway status page (status.razorpay.com or status.stripe.com)
5. Verify webhook endpoint is set to `https://festpro.app/api/webhooks/[gateway]`
6. Check browser console for CORS errors
7. Try a different payment method (UPI vs Card) to isolate the issue

## P2: Refund button is disabled or greyed out
**Severity:** High  
**Problem:** Cannot process a refund for a completed transaction.  
**Root Causes:** (1) Payment was recorded as offline (no gateway reference). (2) Refund window has expired. (3) Gateway balance insufficient. (4) Transaction is already fully refunded.  
**Steps to Resolve:**
1. Check the transaction's payment method — offline payments need manual refund
2. For offline refunds: click **Manual Refund** and record the cash/transfer
3. For online refunds: check gateway balance at Razorpay/Stripe dashboard
4. Check if the transaction has a `gateway_refund_id` already
5. Verify the refund policy window hasn't expired
6. If gateway limit reached: contact gateway support or wait for settlement

## P3: Invoice shows "Pending" status for a completed payment
**Severity:** Medium  
**Problem:** Invoice is not auto-generated or shows pending status despite payment success.  
**Root Causes:** (1) Auto-invoice setting is disabled. (2) Webhook delivery failed. (3) Registration status is not "Confirmed".  
**Steps to Resolve:**
1. Check Finance → Settings → Invoices → Auto-Invoice is ON
2. Navigate to the registration and verify status is "Confirmed"
3. If payment success but invoice not generated: click **Generate Invoice** manually
4. Check webhook logs at `/dashboard/settings/webhooks` for delivery failures
5. Re-sync gateway payments from Finance → Settings → Payments → Sync Gateway

## P4: Financial report totals do not match expected values
**Severity:** Medium  
**Problem:** Report amounts are different from manual calculations.  
**Root Causes:** (1) Date range filter excludes some transactions. (2) Pending/unverified payments are excluded. (3) Currency conversion applied. (4) Report includes/excludes refunds.  
**Steps to Resolve:**
1. Remove all date filters and regenerate
2. Verify the report type includes the right transaction types
3. Check if "Include Pending" toggle is available and enabled
4. Export raw data as CSV and compare in Excel
5. Check if refunds are shown as negative values or excluded
6. Verify timezone settings — transactions may be in UTC

## P5: Cannot add expense — "Budget Overrun" error
**Severity:** Medium  
**Problem:** Adding an expense shows "Budget exceeded 110% of allocation".  
**Root Causes:** (1) Budget category has reached its limit. (2) No budget allocated for this category.  
**Steps to Resolve:**
1. Navigate to Finance → Budget to check current utilization
2. Increase the budget allocation for that category (Festival Director+)
3. Or request approval from Festival Director to exceed budget
4. Or split the expense across multiple budget categories
5. If no budget exists: create one first, then add the expense

## P6: Offline payment shows "Pending" after recording
**Severity:** Low  
**Problem:** Offline payment remains in pending state.  
**Root Causes:** Payment needs manual verification by a Finance role.  
**Steps to Resolve:**
1. Navigate to Finance → Transactions
2. Filter by **Pending** status
3. Click the pending transaction
4. Verify the physical cash/cheque has been received
5. Click **Verify Payment** to mark as Completed
6. If cheque bounces: click **Mark as Failed** and notify the participant

## P7: GST calculation appears incorrect on invoice
**Severity:** Medium  
**Problem:** Tax amount on invoice doesn't match expected percentage.  
**Root Causes:** (1) Tax rate changed after some registrations. (2) Multiple tax rates configured. (3) Rounding issue.  
**Steps to Resolve:**
1. Check Finance → Settings → Tax Rate configuration
2. Verify if the same rate applies to all competitions or varies
3. Manually calculate: (Fee - Discount) × (Tax% / 100)
4. Check if rounding is set to nearest integer or two decimals
5. If rate was changed mid-festival: old registrations use old rate, new use new rate

## P8: Payment webhook not received
**Severity:** Critical  
**Problem:** Payment succeeds at gateway but system does not update status.  
**Root Causes:** (1) Webhook URL is wrong. (2) Webhook secret mismatch. (3) Firewall blocking gateway IPs. (4) Too many retries exhausted.  
**Steps to Resolve:**
1. Check webhook logs at gateway dashboard (Razorpay/Stripe)
2. Verify webhook URL: `https://festpro.app/api/webhooks/stripe` or `/razorpay`
3. Check webhook secret matches between gateway and system
4. Manually sync: Finance → Settings → Payments → Sync Gateway
5. If urgent: customer support can manually mark payment as received
6. Check server logs for 500 errors on webhook endpoint

## P9: Duplicate invoice numbers
**Severity:** Low  
**Problem:** Two invoices have the same number.  
**Root Causes:** (1) Invoice number sequence was manually reset. (2) Race condition in concurrent invoice generation.  
**Steps to Resolve:**
1. Navigate to Finance → Settings → Invoices
2. Check the current **Next Invoice Number**
3. If duplicate detected: manually assign unique numbers
4. The system prevents duplicates via database unique constraint
5. Report to support if constraint was bypassed

## P10: Export report times out for large festivals
**Severity:** Medium  
**Problem:** Report export for large data (>10,000 transactions) fails or times out.  
**Root Causes:** (1) Serverless function timeout (10s limit). (2) Memory limit exceeded.  
**Steps to Resolve:**
1. Narrow the date range to reduce data volume
2. Export as CSV instead of PDF (lighter processing)
3. Use **Schedule Report** — large reports are processed as background jobs
4. For full data: use the API endpoint with pagination
5. Contact support for a database-level export if urgent

---

# Section 14: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can I have different fees for different competitions?** | Yes. Fee configuration is per-competition within a festival. Each competition can have its own fee, late fee, and discounts. |
| 2 | **How do refunds work for online payments?** | Online refunds are processed through the payment gateway and credited back to the original payment method. Razorpay/Stripe typically takes 3-7 business days. |
| 3 | **Can I issue a partial refund?** | Yes. Select "Partial" refund type and enter the amount. Gateway processing fees may still be deducted. |
| 4 | **What payment methods are supported?** | Online: UPI, Credit/Debit Card, NetBanking, Wallets. Offline: Cash, Cheque, Bank Transfer. The available methods depend on gateway configuration. |
| 5 | **How are invoices numbered?** | Customizable prefix + year + 6-digit sequential number (e.g., INV-2025-000001). The sequence resets at the start of each year. |
| 6 | **Can I download all invoices at once?** | Yes. From the Invoices page, select multiple invoices and click "Download Selected" or "Export All" to get a ZIP of PDFs. |
| 7 | **What happens if a cheque bounces?** | The offline payment status can be changed from Completed to Failed. The system will notify the participant and re-mark their payment as unpaid. |
| 8 | **Is there a limit on the number of transactions?** | No hard limit. Performance is optimized for up to 100,000 transactions per festival. Beyond that, archiving older transactions is recommended. |
| 9 | **Can I create custom invoice templates?** | Currently, invoice layout is standardized. Custom branding (logo, colors, footer text) is available in the Invoice Settings. |
| 10 | **How do I handle multi-currency payments?** | The fee configuration has a Currency field. All transactions in a festival must use the same currency. Cross-currency is not supported per festival. |
| 11 | **Can I set up automated payment reminders?** | Yes. Scheduled notifications can be configured in Communication module. Template variables include {{amount}}, {{due_date}}, and {{invoice_url}}. |
| 12 | **What reports are available for auditors?** | Audit Trail (all financial actions), Transaction Log, Reconciliation Report, and the standard financial reports can be exported for auditors. |
| 13 | **How are group discounts calculated?** | The discount percentage applies to each registration in the group. The minimum group size must be met before any discount is applied. |
| 14 | **Can I apply a coupon on top of early bird discount?** | Yes, but the system applies them sequentially: early bird discount first, then coupon. Both cannot exceed the registration fee. |
| 15 | **Is there a sandbox/test environment?** | Yes. Use the gateway's test mode keys. Test transactions do not process real payments. A ₹1 test is available in Gateway Settings. |
| 16 | **How do I export data for GST filing?** | Generate the **GST Report** from Finance → Reports. It includes taxable value, tax amount, and participant-wise breakup required for GSTR-1. |
| 17 | **What is the default refund policy?** | "No Refund" unless configured otherwise. We recommend setting a clear refund policy at fee configuration time. |
| 18 | **Can I waive a fee for a specific participant?** | Yes. Finance+ roles can record a zero-amount transaction with a note explaining the waiver. The participant is still marked as registered. |
| 19 | **How long do refunds take?** | Online: 3-7 business days (gateway-dependent). Offline: immediately upon handing over cash. |
| 20 | **What happens to unpaid registrations when registration closes?** | Unpaid registrations are automatically cancelled 48 hours after the registration deadline. Participants are notified before cancellation. |

---

# Section 15: Glossary

| Term | Definition |
|------|------------|
| **Payment Gateway** | Third-party service (Razorpay/Stripe) that processes online payments |
| **Webhook** | HTTP callback that notifies the system of payment status changes |
| **Invoice** | Commercial document listing the amount due for registration |
| **Refund** | Reversal of a payment, partial or full |
| **Reconciliation** | Process of matching gateway records with system records |
| **Chargeback** | Dispute initiated by cardholder through their bank |
| **Settlement** | Transfer of collected funds from gateway to organization bank account |
| **GST** | Goods and Services Tax — Indian indirect tax |
| **Processing Fee** | Fee charged by gateway for each transaction (typically 2% + GST) |
| **Budget Utilization** | Percentage of allocated budget that has been spent |
| **Early Bird Discount** | Reduced fee for registrations completed before a specified date |
| **Late Fee** | Additional charge for registrations after a specified date |
| **Coupon Code** | Alphanumeric code for promotional discounts |
| **Offline Payment** | Cash, cheque, or bank transfer — not processed through the gateway |
| **Audit Trail** | Chronological record of all financial actions with timestamps and user IDs |
| **Revenue** | Total income from registration fees before deductions |
| **Net Revenue** | Revenue minus refunds and processing fees |
| **Expense** | Money spent on festival operations (stage, sound, catering, etc.) |
| **Budget** | Planned allocation of funds for specific categories |
| **P&L Statement** | Profit & Loss — revenue minus total expenses |

---

# Section 16: Payment Gateway Integration Notes

## Razorpay
| Property | Value |
|----------|-------|
| Supported Methods | UPI, Credit Card, Debit Card, NetBanking, Wallet, EMI |
| Webhook Events | `payment.captured`, `payment.failed`, `refund.created` |
| Webhook URL | `https://festpro.app/api/webhooks/razorpay` |
| API Version | v1 |
| SDK | `@razorpay/razorpay` |
| Fee | ~2% + GST per transaction |

## Stripe
| Property | Value |
|----------|-------|
| Supported Methods | Card, UPI (limited), Wallet |
| Webhook Events | `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` |
| Webhook URL | `https://festpro.app/api/webhooks/stripe` |
| API Version | 2023-10-16 |
| SDK | `stripe` |
| Fee | ~2.9% + $0.30 per transaction |

---

# Section 17: Video / Screenshot Placeholders

| Asset | Description | Location |
|-------|-------------|----------|
| `screenshots/finance-dashboard.png` | Finance dashboard with KPI cards and revenue chart | `docs/screenshots/` |
| `screenshots/finance-transactions.png` | Transaction list with filters | `docs/screenshots/` |
| `screenshots/finance-fee-config.png` | Fee configuration form | `docs/screenshots/` |
| `screenshots/finance-invoice.png` | Generated invoice PDF view | `docs/screenshots/` |
| `screenshots/finance-report.png` | Revenue report with chart | `docs/screenshots/` |
| `video/finance-reconciliation.mp4` | Step-by-step reconciliation walkthrough | `docs/video/` |
| `video/finance-refund.mp4` | How to process a refund | `docs/video/` |

---

*End of Finance Module Documentation (Module 11)*
