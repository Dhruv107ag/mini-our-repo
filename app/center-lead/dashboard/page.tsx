"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ShoppingCart,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  Boxes,
  Sparkles,
  ArrowUpRight,
  Building2,
  Calendar,
  Layers,
  FileText,
} from "lucide-react"

export default function CenterLeadDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const res = await fetch("/api/center-lead/stats", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (e) {
      console.error("Failed to load center stats:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {}
    }
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl border border-indigo-700/30">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 px-3 py-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-300 inline" />
                Center Leadership Portal
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-300 border-slate-700">
                Independent Center System
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Welcome back, {user?.name || "Center Lead"}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Managing dedicated purchases, isolated center inventory, and student/faculty component issues & returns for{" "}
              <span className="font-semibold text-white">{user?.department || "Center for Advanced Studies"}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all hover:scale-[1.02]"
            >
              <Link href="/center-lead/dashboard/purchase">
                <Plus className="mr-2 h-4 w-4" /> New Dept Purchase
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-indigo-400/40 bg-indigo-950/40 text-indigo-100 hover:bg-indigo-900/60 transition-all hover:scale-[1.02]"
            >
              <Link href="/center-lead/dashboard/issue-return">
                <ArrowLeftRight className="mr-2 h-4 w-4" /> Issue Component
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Center Inventory Items */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-all hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Center Inventory
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Boxes className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {loading ? "..." : stats?.total_inventory_items ?? 5}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>{stats?.total_available_stock ?? 0} units available</span>
              <Link
                href="/center-lead/dashboard/inventory"
                className="text-indigo-600 hover:underline font-medium inline-flex items-center"
              >
                View all <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Active Issued */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-all hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Issues
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {loading ? "..." : stats?.active_issued_count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>With students & faculties</span>
              <Link
                href="/center-lead/dashboard/issue-return"
                className="text-amber-600 hover:underline font-medium inline-flex items-center"
              >
                Track <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Overdue Returns */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-all hover:border-rose-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overdue Returns
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {loading ? "..." : stats?.overdue_count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>{stats?.returned_count ?? 0} successfully returned</span>
              <Link
                href="/center-lead/dashboard/issue-return?status=overdue"
                className="text-rose-600 hover:underline font-medium inline-flex items-center"
              >
                Review <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Dept Purchases */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-all hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dept Purchases
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              ₹{(stats?.total_purchases_amount || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>{stats?.total_purchases_count ?? 0} purchase orders</span>
              <Link
                href="/center-lead/dashboard/purchase"
                className="text-emerald-600 hover:underline font-medium inline-flex items-center"
              >
                Ledger <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Active Issued + Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Issued Components (2 cols) */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Active Component Issues
              </CardTitle>
              <CardDescription>
                Equipment currently checked out from Center Inventory
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/center-lead/dashboard/issue-return">View All Issues</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading issues...</div>
            ) : !stats?.recent_issues || stats.recent_issues.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No active component issues currently.
              </div>
            ) : (
              <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
                {stats.recent_issues.map((issue: any) => (
                  <div
                    key={issue.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/40 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{issue.item_name}</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          Qty: {issue.quantity}
                        </Badge>
                        {issue.status === "overdue" ? (
                          <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 text-xs">
                            Overdue
                          </Badge>
                        ) : issue.status === "returned" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 text-xs">
                            Returned
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Issued to: <span className="font-medium text-foreground">{issue.issued_to_name}</span> (
                        {issue.issued_to_id || issue.issued_to_email}) • Dept: {issue.department || "CSE"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs sm:text-right text-muted-foreground">
                      <div>
                        <div>Expected Return:</div>
                        <span className="font-semibold text-foreground">
                          {issue.expected_return_date || "Open / Project end"}
                        </span>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-indigo-600">
                        <Link href="/center-lead/dashboard/issue-return">Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts & Quick Center Summary (1 col) */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Center Stock Alerts
              </CardTitle>
              <CardDescription>Items with low available stock (≤ 2 units)</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.low_stock_items || stats.low_stock_items.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  All center inventory items have healthy available stock levels.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.low_stock_items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-xs text-foreground line-clamp-1">{item.item_name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{item.part_no}</div>
                      </div>
                      <Badge className="bg-amber-600 text-white text-xs font-semibold">
                        {item.available_quantity} {item.unit} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-muted/30">
            <CardHeader>
              <CardTitle className="text-base font-bold">Center Operations</CardTitle>
              <CardDescription>Direct navigation to center workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9">
                <Link href="/center-lead/dashboard/purchase">
                  <ShoppingCart className="mr-2 h-4 w-4 text-emerald-600" />
                  Record Dept Purchase with Invoice PDF
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9">
                <Link href="/center-lead/dashboard/inventory">
                  <Package className="mr-2 h-4 w-4 text-indigo-600" />
                  Manage Dual Register (Consumable & Non-Consumable)
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9">
                <Link href="/center-lead/dashboard/issue-return">
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-amber-600" />
                  Process Item Return & Stock Restoration
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Purchases Row */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Recent Dept Purchases
            </CardTitle>
            <CardDescription>
              Procurement register for Center Lead lab & research equipment
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/center-lead/dashboard/purchase">View All Purchases</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading purchases...</div>
          ) : !stats?.recent_purchases || stats.recent_purchases.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No purchases recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">PO / Invoice #</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stats.recent_purchases.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-foreground">{p.purchase_no}</td>
                      <td className="py-2.5 px-3 font-semibold text-foreground max-w-xs truncate">{p.item_name}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {p.item_type?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{p.vendor_name}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{p.purchase_date}</td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(Number(p.total_amount) || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[11px] capitalize">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.invoice_pdf_url ? (
                          <a
                            href={p.invoice_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            <FileText className="h-4 w-4 mr-1" /> PDF
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
