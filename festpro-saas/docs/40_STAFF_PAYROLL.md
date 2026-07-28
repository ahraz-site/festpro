# FestPro Staff Payroll — Complete Official Documentation

**Module:** 40 — Staff Payroll  
**Version:** 1.0  
**Applies To:** Finance, HR, Administrators

---

# Section 1: Introduction

The Staff Payroll module manages payment and compensation for temporary staff hired during festivals — technicians, volunteers, contractors, performers, and daily-wage workers. Supports hourly/daily rates, attendance-linked payments, and tax deduction.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Staff Records | Contract terms, bank details, PAN |
| Time Tracking | Attendance-linked hours for hourly workers |
| Rate Configuration | Hourly, daily, event-based rates |
| Payslip Generation | Auto-calculated payslips |
| Bulk Payment | Generate payment file for bank transfer |
| TDS Deduction | Automatic tax calculation and reporting |
| Payment History | Complete payment record per staff |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Staff | `/dashboard/festivals/[id]/payroll/staff` | Hired staff list |
| Time Logs | `/dashboard/festivals/[id]/payroll/timesheets` | Attendance and hours |
| Process Payroll | `/dashboard/festivals/[id]/payroll/process` | Run payroll calculation |
| Payslips | `/dashboard/festivals/[id]/payroll/payslips` | Generated payslips |
| Settings | `/dashboard/festivals/[id]/payroll/settings` | Rates, tax config |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| PAY-001 | Staff must have bank account and PAN on file before payment |
| PAY-002 | Overtime (>8 hrs/day) paid at 1.5x rate |
| PAY-003 | Payroll runs every Saturday for the preceding week |
| PAY-004 | TDS deducted at 10% for contracts >₹30,000 |
| PAY-005 | Timesheets require staff + supervisor sign-off |
| PAY-006 | Payment records sync to Finance module transactions |

---

*End of Staff Payroll Module Documentation (Module 40)*
