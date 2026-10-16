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
        return <Badge variant="secondary">Pending Faculty</Badge>
      case 'pending_lab_staff':
        return <Badge variant="outline">Pending Lab Staff</Badge>
      case 'pending_hod':
        return <Badge variant="outline">{request.highest_approval_authority === 'lab_coordinator' ? 'Pending Lab Coordinator' : 'Pending HOD'}</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  if (!currentUser) return null

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
        </div>
        <Button asChild>
          <Link href="/student/dashboard/book-lab">
            <Plus className="h-4 w-4 mr-2" />
            New Lab Booking
          </Link>
        </Button>
      </div>

      {/* Monthly Component Possession Reminder Alert */}
      {notifications.some(n => n.title?.toLowerCase().includes('monthly reminder') || n.title?.toLowerCase().includes('possession')) && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-300 p-4 rounded-xl shadow-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🔔</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-blue-950">
                  Monthly Possession Reminder: Active Lab Component
                </h3>
                <Badge className="bg-blue-600 text-white text-[10px]">Monthly Notice</Badge>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed max-w-2xl">
                {notifications.find(n => n.title?.toLowerCase().includes('monthly reminder') || n.title?.toLowerCase().includes('possession'))?.message}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 bg-white hover:bg-blue-50 text-blue-800 border-blue-300 text-xs" asChild>
            <Link href="/student/dashboard/my-component-requests">
              View Items
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Booking Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Lab Booking Requests
            <Button variant="outline" size="sm" asChild>
              <Link href="/student/dashboard/my-requests">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p className="font-medium">No booking requests yet</p>
              <p className="text-sm">Create your first lab booking request to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{request.lab_name}</h4>
                      {getStatusBadge(request)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Faculty: {request.faculty_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.date).toLocaleDateString()} • {formatTime(request.start_time)} - {formatTime(request.end_time)}
                    </p>
                    <p className="text-sm mt-1">{request.purpose}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {bookingRequests.length > 3 && (
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/student/dashboard/my-requests">
                  View All Requests ({bookingRequests.length})
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/student/dashboard/book-lab">
                <Plus className="h-4 w-4 mr-2" />
                New Lab Booking Request
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/student/dashboard/request-components">
                <Plus className="h-4 w-4 mr-2" />
                Request Lab Components
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/student/dashboard/my-component-requests">
                <Eye className="h-4 w-4 mr-2" />
                View My Component Requests
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/student/dashboard/my-requests">
                <Eye className="h-4 w-4 mr-2" />
                View My Requests
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Check Available Slots
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span>Notifications & Reminders</span>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((n: any) => (
                  <div key={n.id} className="p-3 bg-muted/40 hover:bg-muted/70 rounded-lg border text-sm transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <span className="text-blue-600">🔔</span>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-5">
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
