/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, BookOpen, Plus, Eye, Users, Building } from "lucide-react"
import Link from "next/link"

interface BookingRequest {
  id: number
  lab_id: number
  lab_name: string
  faculty_supervisor_id: number
  faculty_name: string
  date: string
  start_time: string
  end_time: string
  purpose: string
  status: 'pending_faculty' | 'pending_lab_staff' | 'pending_hod' | 'approved' | 'rejected'
  highest_approval_authority?: 'hod' | 'lab_coordinator'
  created_at: string
  faculty_remarks?: string
  lab_staff_remarks?: string
  hod_remarks?: string
}

function formatTime(time: string): string {
  if (!time) return ""
  const [hours, minutes] = time.split(":")
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

export default function StudentDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
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
        if (parsed.role !== 'student') {
          window.location.href = "/dashboard"
          return
        }
      } catch {}
    }
    // Only load data if we have a user
    if (u) {
      loadBookingRequests()
      loadNotifications()
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err)
    }
  }

  const loadBookingRequests = async () => {
    try {
      console.log("Loading booking requests...")
      const res = await fetch("/api/student/booking-requests")
      console.log("Response status:", res.status)
      console.log("Response headers:", Object.fromEntries(res.headers.entries()))
      
      if (res.ok) {
        const text = await res.text()
        console.log("Response text:", text.substring(0, 200))
        
        try {
          const data = JSON.parse(text)
          console.log("Parsed data:", data)
          setBookingRequests(data.requests || [])
          
          // Calculate stats
          const requests = data.requests || []
          const pending = requests.filter((r: BookingRequest) => r.status === 'pending_faculty' || r.status === 'pending_lab_staff' || r.status === 'pending_hod').length
          const approved = requests.filter((r: BookingRequest) => r.status === 'approved').length
          const rejected = requests.filter((r: BookingRequest) => r.status === 'rejected').length
          
          setStats({
            pending,
            approved,
            rejected,
            total: requests.length
          })
        } catch (parseError: any) {
          console.error("JSON parse error:", parseError.message)
          console.error("Response text that failed to parse:", text)
          // Set some default data so the page still works
          setBookingRequests([])
          setStats({ pending: 0, approved: 0, rejected: 0, total: 0 })
        }
      } else {
        console.error("API responded with error:", res.status)
        // Set default data so page still works
        setBookingRequests([])
        setStats({ pending: 0, approved: 0, rejected: 0, total: 0 })
      }
    } catch (error: any) {
      console.error("Failed to load booking requests:", error.message)
      // Set default data so page still works
      setBookingRequests([])
      setStats({ pending: 0, approved: 0, rejected: 0, total: 0 })
    }
  }

  const getStatusBadge = (request: BookingRequest) => {
    const status = request.status
    switch (status) {
      case 'pending_faculty':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">Pending Faculty</span>
      case 'pending_lab_staff':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">Pending Lab Staff</span>
      case 'pending_hod':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80">{request.highest_approval_authority === 'lab_coordinator' ? 'Pending Lab Coordinator' : 'Pending HOD'}</span>
      case 'approved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">Approved</span>
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">Rejected</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-600'
      case 'rejected': return 'text-rose-600'
      default: return 'text-amber-600'
    }
  }

  if (!currentUser) return null

  return (
    <div className="space-y-6">
      {/* Student Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-r from-white via-sky-50/50 to-blue-50/40 p-5 md:p-6 shadow-xs admin-appear-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100/80 text-sky-800 border border-sky-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Student Session
              </span>
              <span className="text-xs text-slate-400 font-medium">• LNMIIT Jaipur</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">{currentUser.name}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Schedule laboratory research slots, requisition electronic components, and monitor real-time approval status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 hover:shadow-md">
              <Link href="/student/dashboard/book-lab">
                <Plus className="h-4 w-4 mr-1.5" />
                New Lab Booking
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl shadow-2xs">
              <Link href="/student/dashboard/request-components">
                <Plus className="h-4 w-4 mr-1.5" />
                Request Components
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Monthly Component Possession Reminder Alert */}
      {notifications.some(n => n.title?.toLowerCase().includes('monthly reminder') || n.title?.toLowerCase().includes('possession')) && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-amber-50/60 border border-blue-200/90 p-4 rounded-2xl shadow-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <span className="text-lg">🔔</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-blue-950">
                  Monthly Possession Reminder: Active Lab Component
                </h3>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Monthly Notice</span>
              </div>
              <p className="text-xs text-blue-900/90 leading-relaxed max-w-2xl">
                {notifications.find(n => n.title?.toLowerCase().includes('monthly reminder') || n.title?.toLowerCase().includes('possession'))?.message}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 bg-white hover:bg-blue-50 text-blue-800 border-blue-300 text-xs font-semibold rounded-xl" asChild>
            <Link href="/student/dashboard/my-component-requests">
              View Items
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Cards - Color-coded top borders and soft light cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
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
            <span>Awaiting authorization</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">Queue</span>
          </div>
        </div>
        
        {/* Approved Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-emerald-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved Slots</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.approved}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Confirmed lab sessions</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Ready</span>
          </div>
        </div>
        
        {/* Rejected Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-rose-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Declined / Revoked</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.rejected}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Requires resubmission</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">Action</span>
          </div>
        </div>
        
        {/* Total Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs border-t-4 border-t-blue-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bookings</p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Cumulative lifecycle</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">All-Time</span>
          </div>
        </div>
      </div>

      {/* Recent Booking Requests */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Recent Lab Booking Requests</h2>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-100 text-xs text-slate-700 font-semibold" asChild>
              <Link href="/student/dashboard/my-requests">
                <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {bookingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-800">No booking requests yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Submit your first lab reservation request to reserve equipment and workspace.
              </p>
              <Button asChild size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Link href="/student/dashboard/book-lab">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Book Lab Now
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 rounded-xl transition-colors gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{request.lab_name}</h4>
                      {getStatusBadge(request)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>Faculty: <strong className="text-slate-700">{request.faculty_name}</strong></span>
                      <span>•</span>
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatTime(request.start_time)} – {formatTime(request.end_time)}</span>
                    </div>
                    {request.purpose && (
                      <p className="text-xs text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/50 mt-1.5">
                        <strong className="text-slate-700">Purpose:</strong> {request.purpose}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-white text-xs font-semibold text-slate-700" asChild>
                      <Link href="/student/dashboard/my-requests">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {bookingRequests.length > 5 && (
            <div className="mt-4 text-center">
              <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold">
                <Link href="/student/dashboard/my-requests">
                  View All Requests ({bookingRequests.length})
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Notifications */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <Button asChild className="w-full justify-start rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
              <Link href="/student/dashboard/book-lab">
                <Plus className="h-4 w-4 mr-2" />
                New Lab Booking Request
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 font-medium">
              <Link href="/student/dashboard/request-components">
                <Plus className="h-4 w-4 mr-2 text-emerald-600" />
                Request Lab Components
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 font-medium">
              <Link href="/student/dashboard/my-component-requests">
                <Eye className="h-4 w-4 mr-2 text-purple-600" />
                View My Component Requests
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 font-medium">
              <Link href="/student/dashboard/my-requests">
                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                View My Booking History
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications & Reminders */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Notifications & Notices</h3>
              {notifications.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {notifications.length} New
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm font-medium">No active alerts</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up on announcements and reminders.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.slice(0, 3).map((n: any) => (
                  <div key={n.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 text-xs transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-blue-600">🔔</span>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
