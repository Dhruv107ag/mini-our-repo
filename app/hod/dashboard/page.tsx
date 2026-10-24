/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Building, 
  Package, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

interface DashboardStats {
  totalLabs: number
  totalComponents: number
  pendingApprovals: number
  approvedRequests: number
  rejectedRequests: number
  lowStockComponents: number
}

export default function HODDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalLabs: 0,
    totalComponents: 0,
    pendingApprovals: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    lowStockComponents: 0
  })

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      // Load labs and components
      const labsRes = await fetch('/api/hod/labs/components', { cache: 'no-store' })
      if (labsRes.ok) {
        const labsData = await labsRes.json()
        const labs = labsData.labs || []
        const components = labsData.components || []
        
        // Count low stock components (less than 30% available)
        const lowStock = components.filter((c: any) => 
          c.quantity_available > 0 && 
          c.quantity_available < c.quantity_total * 0.3
        ).length

        stats.totalLabs = labs.length
        stats.totalComponents = components.length
        stats.lowStockComponents = lowStock
      }

      // Load pending approvals
      const pendingRes = await fetch('/api/hod/requests?status=pending_hod', { cache: 'no-store' })
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        stats.pendingApprovals = pendingData.total || 0
      }

      // Load approved requests
      const approvedRes = await fetch('/api/hod/requests?status=approved', { cache: 'no-store' })
      if (approvedRes.ok) {
        const approvedData = await approvedRes.json()
        stats.approvedRequests = approvedData.total || 0
      }

      // Load rejected requests
      const rejectedRes = await fetch('/api/hod/requests?status=rejected', { cache: 'no-store' })
      if (rejectedRes.ok) {
        const rejectedData = await rejectedRes.json()
        stats.rejectedRequests = rejectedData.total || 0
      }

      setStats({ ...stats })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* HOD Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-white via-amber-50/50 to-orange-50/40 p-5 md:p-6 shadow-xs admin-appear-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-800 border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Department Session
              </span>
              <span className="text-xs text-slate-400 font-medium">• LNMIIT Jaipur</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Department <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">HOD Portal</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Departmental laboratory governance, faculty approval escalations, inventory auditing, and utilization metrics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button 
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 hover:shadow-md"
              onClick={() => router.push('/hod/dashboard/approvals')}
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Review Approvals
              {stats.pendingApprovals > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[11px] font-bold">
                  {stats.pendingApprovals}
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl shadow-2xs"
              onClick={() => router.push('/hod/dashboard/labs')}
            >
              <Building className="h-4 w-4 mr-1.5 text-slate-500" />
              Department Labs
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - 6 Color-Coded Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Labs */}
        <div 
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/hod/dashboard/labs')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Department Labs</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{loading ? "..." : stats.totalLabs}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Specialized laboratory wings</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">Facilities</span>
          </div>
        </div>

        {/* Total Components */}
        <div 
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/hod/dashboard/labs')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Asset Catalog</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{loading ? "..." : stats.totalComponents}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Aggregated equipment items</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Inventory</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/hod/dashboard/approvals')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{loading ? "..." : stats.pendingApprovals}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Escalated to HOD desk</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">Requires Action</span>
          </div>
        </div>

        {/* Approved Requests */}
        <div 
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-teal-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/hod/dashboard/approvals')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved Reservations</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{loading ? "..." : stats.approvedRequests}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/70 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Sanctioned lab usage</span>
            <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">Authorized</span>
          </div>
        </div>

        {/* Rejected Requests */}
        <div 
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-rose-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/hod/dashboard/approvals')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Declined / Revoked</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{loading ? "..." : stats.rejectedRequests}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Declined applications</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">Declined</span>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div 
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-orange-500 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/hod/dashboard/labs')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low Stock Warnings</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{loading ? "..." : stats.lowStockComponents}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/70 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Stock below 30% threshold</span>
            <span className="font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded">Restock</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Department Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
            <h3 className="text-sm font-bold text-slate-900">Governance Portals</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <Button 
              variant="outline" 
              className="w-full justify-between rounded-xl border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-700 font-medium" 
              onClick={() => router.push('/hod/dashboard/approvals')}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                Review Pending Approvals
              </span>
              <div className="flex items-center gap-2">
                {stats.pendingApprovals > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {stats.pendingApprovals}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 font-medium" 
              onClick={() => router.push('/hod/dashboard/labs')}
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Manage Lab Inventory
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-200 text-slate-700 font-medium" 
              onClick={() => router.push('/hod/dashboard/analytics')}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Department Lab Analytics
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>

        {/* Alerts/Notifications */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Department Attention Required
            </h3>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {stats.pendingApprovals > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-amber-950">Pending Approvals Escalation</p>
                  <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                    You have <strong className="text-amber-950">{stats.pendingApprovals} request{stats.pendingApprovals !== 1 ? 's' : ''}</strong> waiting for your administrative sign-off.
                  </p>
                </div>
              </div>
            ) : null}
            {stats.lowStockComponents > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl text-xs">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-orange-950">Low Stock Replenishment Notice</p>
                  <p className="text-orange-800/90 mt-0.5 leading-relaxed">
                    <strong className="text-orange-950">{stats.lowStockComponents} component{stats.lowStockComponents !== 1 ? 's' : ''}</strong> running low on stock in departmental laboratories.
                  </p>
                </div>
              </div>
            ) : null}
            {stats.pendingApprovals === 0 && stats.lowStockComponents === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">All Operations Clear</p>
                <p className="text-slate-500 mt-1">No pending escalations or urgent alerts for your department.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
  )
}
