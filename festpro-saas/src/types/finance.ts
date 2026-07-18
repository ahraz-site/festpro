export type FinanceAccountType = "asset" | "liability" | "equity" | "income" | "expense"
export type TransactionType = "credit" | "debit"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled"
export type PaymentGateway = "razorpay" | "stripe" | "paypal" | "cash" | "bank_transfer" | "upi" | "other"
export type ExpenseStatus = "draft" | "approved" | "paid" | "cancelled"
export type BudgetStatus = "draft" | "active" | "closed" | "cancelled"
export type ReportFormat = "pdf" | "excel" | "csv"
export type ReportSchedule = "none" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
export type ChartType = "bar" | "pie" | "line" | "area" | "heatmap"
export type WidgetType = "stat" | "chart" | "table" | "list" | "metric"

export interface FinanceAccount {
  id: string; organization_id: string; account_code: string; account_name: string
  account_type: FinanceAccountType; description: string | null; parent_id: string | null
  is_active: boolean; opening_balance: number; created_at: string; updated_at: string
}

export interface TransactionCategory {
  id: string; organization_id: string; name: string; description: string | null
  type: TransactionType; color: string; is_active: boolean; created_at: string
}

export interface PaymentMethod {
  id: string; organization_id: string; method_name: string; gateway: PaymentGateway
  is_online: boolean; account_details: any; is_active: boolean; created_at: string
}

export interface Transaction {
  id: string; organization_id: string; festival_id: string | null; account_id: string | null
  category_id: string | null; payment_method_id: string | null; transaction_type: TransactionType
  amount: number; currency: string; description: string | null; reference_number: string | null
  transaction_date: string; status: PaymentStatus; is_reconciled: boolean; reconciled_at: string | null
  created_by: string | null; created_at: string; updated_at: string
  account?: FinanceAccount; category?: TransactionCategory; payment_method?: PaymentMethod
}

export interface RegistrationPayment {
  id: string; organization_id: string; festival_id: string; participant_id: string
  registration_id: string | null; transaction_id: string | null; amount: number
  discount_amount: number; scholarship_amount: number; net_amount: number
  payment_method_id: string | null; status: PaymentStatus; paid_at: string | null
  due_date: string | null; receipt_number: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
  participant?: { id: string; first_name: string; last_name: string; participant_id: string }
  payment_method?: PaymentMethod
}

export interface ExpenseCategory {
  id: string; organization_id: string; name: string; description: string | null
  color: string; is_active: boolean; created_at: string
}

export interface Expense {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  transaction_id: string | null; title: string; description: string | null; amount: number
  expense_date: string; vendor_name: string | null; vendor_contact: string | null
  invoice_number: string | null; receipt_url: string | null; status: ExpenseStatus
  approved_by: string | null; approved_at: string | null; paid_by: string | null; paid_at: string | null
  created_by: string | null; created_at: string; updated_at: string
  category?: ExpenseCategory
}

export interface Income {
  id: string; organization_id: string; festival_id: string | null; transaction_id: string | null
  title: string; description: string | null; amount: number; income_date: string
  source: string | null; is_recurring: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface Budget {
  id: string; organization_id: string; festival_id: string | null; name: string
  description: string | null; category_id: string | null; allocated_amount: number
  spent_amount: number; status: BudgetStatus; start_date: string | null; end_date: string | null
  created_by: string | null; created_at: string; updated_at: string
  category?: ExpenseCategory
}

export interface Sponsor {
  id: string; organization_id: string; festival_id: string | null; sponsor_name: string
  contact_person: string | null; email: string | null; phone: string | null; address: string | null
  logo_url: string | null; website: string | null; sponsorship_tier: string | null; amount: number
  is_active: boolean; agreement_url: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface Donation {
  id: string; organization_id: string; festival_id: string | null; transaction_id: string | null
  donor_name: string; donor_email: string | null; donor_phone: string | null; amount: number
  message: string | null; is_anonymous: boolean; payment_method_id: string | null
  status: PaymentStatus; receipt_sent: boolean; created_at: string
}

export interface FinancialReport {
  id: string; organization_id: string; festival_id: string | null; report_name: string
  report_type: string; date_from: string | null; date_to: string | null
  total_income: number; total_expense: number; net_balance: number; data: any
  generated_by: string | null; generated_at: string
}

export interface ReportTemplate {
  id: string; organization_id: string; template_name: string; description: string | null
  report_type: string; fields: any; filters: any; sorting: any; grouping: string | null
  chart_type: ChartType | null; is_system: boolean; created_by: string | null
  created_at: string; updated_at: string
}

export interface SavedReport {
  id: string; organization_id: string; user_id: string; template_id: string | null
  report_name: string; description: string | null; filters: any; schedule: ReportSchedule
  last_run_at: string | null; is_favorite: boolean; shared_with: any
  created_at: string; updated_at: string
}

export interface AnalyticsCache {
  id: string; organization_id: string; festival_id: string | null; cache_key: string
  cache_data: any; period: string | null; generated_at: string; expires_at: string | null
}

export interface DashboardWidget {
  id: string; organization_id: string; user_id: string; widget_type: WidgetType
  title: string; config: any; position: number; size: string; is_visible: boolean
  created_at: string; updated_at: string
}

export interface FinanceAuditLog {
  id: string; organization_id: string | null; festival_id: string | null; action: string
  entity_type: string; entity_id: string | null; performed_by: string | null
  old_values: any; new_values: any; metadata: any; created_at: string
}

export interface Module9DashboardData {
  total_transactions: number; total_income: number; total_expense: number; net_balance: number
  pending_payments: number; pending_expenses: number; active_budgets: number
  total_sponsors: number; total_donations: number; total_reports: number
  income_this_month: number; expense_this_month: number
}
