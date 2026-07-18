"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getFinanceDashboard, getTransactions, getExpenses, getBudgets } from "@/lib/actions/finance"
import { getAnalytics } from "@/lib/actions/reports"
import type { Module9DashboardData } from "@/types/finance"
import { Loader2, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, FileText, Users, Building2, Gift, BarChart3, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function FinanceDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module9DashboardData | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [dRes, aRes] = await Promise.all([getFinanceDashboard(festivalId), getAnalytics(festivalId)])
    setDash(dRes.data || null); setAnalytics(aRes.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Total Income", value: dash?.total_income || 0, prefix: "₹", icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Total Expense", value: dash?.total_expense || 0, prefix: "₹", icon: TrendingDown, color: "text-red-600 bg-red-50" },
    { label: "Net Balance", value: dash?.net_balance || 0, prefix: "₹", icon: Wallet, color: (dash?.net_balance || 0) >= 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50" },
    { label: "Pending Payments", value: dash?.pending_payments || 0, icon: CreditCard, color: "text-amber-600 bg-amber-50" },
    { label: "Active Budgets", value: dash?.active_budgets || 0, icon: FileText, color: "text-purple-600 bg-purple-50" },
    { label: "Sponsors", value: dash?.total_sponsors || 0, icon: Building2, color: "text-indigo-600 bg-indigo-50" },
    { label: "Donations", value: dash?.total_donations || 0, icon: Gift, color: "text-pink-600 bg-pink-50" },
    { label: "Reports", value: dash?.total_reports || 0, icon: BarChart3, color: "text-cyan-600 bg-cyan-50" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor income, expenses, budgets, and financial reports.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/finance/transactions`}>
            <Button variant="outline"><DollarSign className="h-4 w-4 mr-1" /> Transactions</Button>
          </Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/finance/reports`}>
            <Button><BarChart3 className="h-4 w-4 mr-1" /> Reports</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{s.label}</p>
              <p className="text-2xl font-bold">{s.prefix || ""}{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Income vs Expense (This Month)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-2xl font-bold text-green-600">₹{(dash?.income_this_month || 0).toLocaleString()}</p>
                <span className="text-xs text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> This month</span>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div>
                <p className="text-sm text-gray-500">Expense</p>
                <p className="text-2xl font-bold text-red-600">₹{(dash?.expense_this_month || 0).toLocaleString()}</p>
                <span className="text-xs text-red-600 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1" /> This month</span>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div>
                <p className="text-sm text-gray-500">Net</p>
                <p className={`text-2xl font-bold ${(dash?.income_this_month || 0) - (dash?.expense_this_month || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  ₹{((dash?.income_this_month || 0) - (dash?.expense_this_month || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Expense", href: `/finance/expenses`, icon: TrendingDown },
              { label: "Record Income", href: `/finance/income`, icon: TrendingUp },
              { label: "Create Budget", href: `/finance/budgets`, icon: FileText },
              { label: "Manage Sponsors", href: `/finance/sponsors`, icon: Building2 },
              { label: "View Analytics", href: `/finance/analytics`, icon: BarChart3 },
              { label: "Payments", href: `/finance/payments`, icon: CreditCard },
            ].map(a => (
              <Link key={a.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${a.href}`}>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <a.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
