/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Clock, CheckCircle, XCircle, User, Calendar, Eye, Plus, Package, History as HistoryIcon } from "lucide-react"
import Link from "next/link"

interface PendingRequest {
  id: number
  student_name: string
  student_email: string
  lab_name: string
  booking_date: string
  start_time: string
  end_time: string
  purpose: string
  status: string
  created_at: string
}

export default function FacultyDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (!u && typeof window !== "undefined") {
      window.location.href = "/"
      return
    }
    if (u) {
      try { 
        const parsed = JSON.parse(u)
        setCurrentUser(parsed)
        if (parsed.role !== 'faculty') {
          window.location.href = "/dashboard"
          return
        }
      } catch {}
    }
    // Load pending requests
    if (u) {
      loadPendingRequests()
      loadStats()
    }
  }, [])

  const loadPendingRequests = async () => {
    try {
      const res = await fetch("/api/faculty/requests?status=pending_faculty")
      if (res.ok) {
        const data = await res.json()
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Failed to load pending requests:", error)
    }
  }

  const loadStats = async () => {
    try {
      // Get all requests for this faculty to calculate stats
      const res = await fetch("/api/faculty/requests?status=all")
      if (res.ok) {
        const data = await res.json()
        const requests = data.requests || []
        
        setStats({
          pending: requests.filter((r: any) => r.status === 'pending_faculty').length,
          approved: requests.filter((r: any) => r.status === 'approved').length,
          rejected: requests.filter((r: any) => r.status === 'rejected').length,
          total: requests.length
        })
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const formatTime = (time: string) => {
    // Convert HH:MM:SS or HH:MM to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours, 10)
    const m = minutes || '00'
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${m} ${period}`
  }

  if (!currentUser) return null

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-white via-indigo-50/50 to-purple-50/40 p-5 md:p-6 shadow-xs admin-appear-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Faculty Session
              </span>
              <span className="text-xs text-slate-400 font-medium">• LNMIIT Jaipur</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{currentUser.name}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Authorize student laboratory access requests, review component requisitions, and inspect departmental activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 hover:shadow-md">
              <Link href="/faculty/dashboard/approve">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Review Requests
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl shadow-2xs">
              <Link href="/faculty/dashboard/book-labs">
                <Calendar className="h-4 w-4 mr-1.5" />
                Book Labs
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Color-coded top borders and light cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Review */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-amber-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Review</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.pending}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Awaiting signature</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">Requires Action</span>
          </div>
        </div>
        
        {/* Approved */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-emerald-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved by You</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.approved}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Cleared for labs</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Cleared</span>
          </div>
        </div>
        
        {/* Rejected */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-rose-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Declined / Revoked</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.rejected}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Rejected requests</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">Declined</span>
          </div>
        </div>
        
        {/* Total Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-indigo-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Supervised</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>All-time requests</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">Supervised</span>
          </div>
        </div>
      </div>

      {/* Pending Requests Card */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Pending Approval Requests</h2>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-100 text-xs text-slate-700 font-semibold" asChild>
              <Link href="/faculty/dashboard/approve">
                <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No pending student booking requests currently require your sign-off.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70 rounded-xl transition-colors gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{request.lab_name}</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100/90 text-amber-800 border border-amber-300">
                        Pending Your Approval
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span>Student: <strong className="text-slate-800">{request.student_name}</strong> ({request.student_email})</span>
                      <span>•</span>
                      <span>{new Date(request.booking_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatTime(request.start_time)} – {formatTime(request.end_time)}</span>
                    </div>
                    {request.purpose && (
                      <p className="text-xs text-slate-700 bg-white/90 p-2 rounded-lg border border-amber-200/60 mt-1.5">
                        <strong className="text-slate-900">Purpose:</strong> {request.purpose}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs" asChild>
                      <Link href="/faculty/dashboard/approve">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {pendingRequests.length > 3 && (
            <div className="mt-4 text-center">
              <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold">
                <Link href="/faculty/dashboard/approve">
                  View All Pending Requests ({pendingRequests.length})
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <Button asChild className="w-full justify-start rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold">
              <Link href="/faculty/dashboard/approve">
                <CheckCircle className="h-4 w-4 mr-2" />
                Review Pending Requests
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 font-medium">
              <Link href="/faculty/dashboard/request-components">
                <Plus className="h-4 w-4 mr-2 text-emerald-600" />
                Request Lab Components
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 font-medium">
              <Link href="/faculty/dashboard/my-component-requests">
                <Package className="h-4 w-4 mr-2 text-purple-600" />
                My Component Requests
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 font-medium">
              <Link href="/faculty/dashboard/bookings">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                View My Bookings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700 font-medium">
              <Link href="/faculty/dashboard/logs">
                <HistoryIcon className="h-4 w-4 mr-2 text-slate-500" />
                View Operational Logs
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
            <h3 className="text-sm font-bold text-slate-900">Faculty Advisory Notices</h3>
          </CardHeader>
          <CardContent className="p-5 text-center text-slate-500">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center mx-auto mb-2.5">
              <HistoryIcon className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">Department Guidelines</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Lab bookings require prior authorization 24 hours before the scheduled slot. High-risk equipment requires lab staff presence.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
