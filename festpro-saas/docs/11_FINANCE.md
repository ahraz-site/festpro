# FestPro Finance Module — Complete Official Documentation

**Module:** Finance  
**Version:** 1.0  
**Dependencies:** Registration (06)  
**Applies To:** Finance Officers, Admins

---

# Section 1: Introduction

The Finance module manages all monetary transactions: registration fees, payments, refunds, expenses, and financial reporting. It supports multiple payment gateways (Razorpay, Stripe) and offline payment reconciliation.

---

# Section 3: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Finance Dashboard | `/dashboard/finance` | Revenue summary, charts, recent transactions |
| Transactions | `/dashboard/finance/transactions` | All payment and refund records |
| Invoices | `/dashboard/finance/invoices` | Invoice list and generation |
| Reports | `/dashboard/finance/reports` | Financial report generation |
| Settings | `/dashboard/finance/settings` | Fee configuration, gateway settings |

---

# Section 5: Every Form

## 5.1 Fee Configuration

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Registration Fee | decimal | Yes | 0-1000000 |
| Late Fee | decimal | No | Must be > registration_fee |
| Late Fee Start Date | datetime | No | Must be before registration closes |
| Early Bird Discount | decimal | No | Percentage or fixed amount |
| Early Bird End Date | datetime | No | Must be before registration closes |
| Group Discount % | decimal | No | Percentage |
| Min Participants for Group Discount | number | No | 2-100 |
| Payment Methods | multi-select | Yes | UPI, Card, NetBanking, Offline |

## 5.2 Payment Recording (Offline)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Participant | auto-lookup | Yes | Search by name/email |
| Amount | decimal | Yes | Amount received |
| Payment Method | dropdown | Yes | Cash, Cheque, Bank Transfer |
| Reference Number | text | No | Cheque/transaction number |
| Payment Date | date | Yes | Date of receipt |
| Notes | textarea | No | Additional information |

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| FIN-001 | Registration fee must be paid before participant status becomes Confirmed |
| FIN-002 | Online payments are processed through the configured gateway (Razorpay/Stripe) |
| FIN-003 | Offline payments must be manually marked as received by Finance role+ |
| FIN-004 | Refunds can be full or partial; processing fees may be non-refundable |
| FIN-005 | Refund for online payments is processed through the payment gateway |
| FIN-006 | All financial transactions are recorded in the audit log |
| FIN-007 | Invoices are auto-generated for each confirmed registration |
| FIN-008 | Invoice numbering follows the pattern: INV-YYYY-NNNNNN |
| FIN-009 | Discounts are applied before payment calculation |
| FIN-010 | Late fees are auto-applied if configured and registration date is after late fee start |

---

# Section 10: Permissions

| Operation | Platform Owner | Org Owner | Org Admin | Festival Director | Finance | Manager |
|-----------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:-------:|
| View financial data | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Record payment | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Process refund | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Configure fees | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Generate invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

# Section 28: Best Practices

1. **Reconcile payments daily** during the festival — match gateway records with system records.
2. **Set late fees early** — before the early bird period ends.
3. **Use group discounts** for school/college registrations to encourage bulk enrollment.
4. **Process refunds promptly** — participant satisfaction depends on quick resolution.
5. **Audit offline payments** — check cash and cheque records against bank deposits.
6. **Keep fee configuration simple** — too many discount types confuse participants.
7. **Test the payment gateway** in test mode before going live.
8. **Generate invoices immediately** — participants appreciate immediate receipts.
9. **Monitor outstanding payments** — send reminders before registration closes.
10. **Export financial reports** after each festival for accounting records.

---

# Section 34: Troubleshooting

## P1: Payment gateway not loading
**Problem:** Payment page shows blank or error.
**Reasons:** Gateway API keys misconfigured, gateway down.
**Solution:** Check Razorpay/Stripe keys in environment variables. Verify gateway status page.

## P2: Cannot process refund
**Problem:** Refund button disabled or returns error.
**Reasons:** Payment was offline, refund window expired, insufficient gateway balance.
**Solution:** Process offline refund manually. Check gateway balance. Contact gateway support.

## P3: Invoice not generating
**Problem:** Invoice shows as "Pending" or missing.
**Reasons:** Registration status not Confirmed, system busy.
**Solution:** Confirm the registration payment is recorded. Retry invoice generation.

## P4: Financial report shows incorrect totals
**Problem:** Report totals do not match expected values.
**Reasons:** Date range filter incorrect, or some transactions excluded by filter.
**Solution:** Verify date range. Export without filters to see all data. Check for pending transactions.

---

*End of Finance Module Documentation*
