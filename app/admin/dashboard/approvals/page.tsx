/**
 * Authorizations & Approvals Governance Console
 * Lab Management System - LNMIIT
 */

"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Building,
  Package,
  Calendar,
  User,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ApprovalRequest {
  id: string
  type: "lab" | "component"
  title: string
  requesterName: string
  requesterEmail: string
  requesterRole: string
  department: string
  facilityOrItem: string
  dateOrDuration: string
  timeSlot?: string
  quantity?: number
  purpose: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  supervisorApproval?: string
  staffApproval?: string
  remarks?: string
}

const DEFAULT_APPROVALS: ApprovalRequest[] = [
  {
    id: "req-1",
    type: "lab",
    title: "CP1 (Programming Lab 1) Slot Booking",
    requesterName: "Dr. Preety Singh",
    requesterEmail: "preety.singh@lnmiit.ac.in",
    requesterRole: "Faculty",
    department: "CSE",
    facilityOrItem: "CP1 (Computer Lab 1)",
    dateOrDuration: "Today",
    timeSlot: "2:00 PM – 5:00 PM",
    purpose: "Machine Learning Workshop for 3rd Year B.Tech (Batch A1 & A2)",
    status: "pending",
    submittedAt: "Today, 11:20 AM",
    supervisorApproval: "Self-Requested (Faculty)",
    staffApproval: "Verified available by Lab Staff (Mahesh Sharma)",
  },
  {
    id: "req-2",
    type: "lab",
    title: "Hardware Lab Special Booking",
    requesterName: "Prof. Vikas Gupta",
    requesterEmail: "vgupta@lnmiit.ac.in",
    requesterRole: "Faculty",
    department: "ECE",
    facilityOrItem: "Hardware & Microprocessor Lab",
    dateOrDuration: "Tomorrow",
    timeSlot: "10:00 AM – 1:00 PM",
    purpose: "DSP & Microprocessor Mid-term Practical Examination",
    status: "pending",
    submittedAt: "Today, 10:45 AM",
    supervisorApproval: "Faculty Request",
    staffApproval: "Pending equipment inventory setup",
  },
  {
    id: "req-3",
    type: "component",
    title: "15x Arduino Uno R3 & 5x ESP32 Kits",
    requesterName: "Dhruv Agrawal",
    requesterEmail: "23ucs107@lnmiit.ac.in",
    requesterRole: "Student (23UCS107)",
    department: "CSE",
    facilityOrItem: "Arduino Uno R3 (x15) & ESP32 NodeMCU (x5)",
    dateOrDuration: "14 Days Loan",
    quantity: 20,
    purpose: "Autonomous Rover Research Project & IEEE Competition Preparation",
    status: "pending",
    submittedAt: "Today, 09:15 AM",
    supervisorApproval: "Approved by Dr. Abhishek Sharma (CSE)",
    staffApproval: "Units tested & reserved by Lab Staff",
  },
  {
    id: "req-4",
    type: "component",
    title: "Keysight 70MHz Digital Oscilloscope",
    requesterName: "Sneha Meena",
    requesterEmail: "23uec044@lnmiit.ac.in",
    requesterRole: "Student (23UEC044)",
    department: "ECE",
    facilityOrItem: "Keysight DSOX1202A 70MHz Oscilloscope",
    dateOrDuration: "7 Days Loan",
    quantity: 1,
    purpose: "High-Frequency RF Filter Analysis - Final Year Capstone Project",
    status: "pending",
    submittedAt: "Today, 08:30 AM",
    supervisorApproval: "Approved by Dr. Rajbir Kaur (ECE)",
    staffApproval: "Calibrated & ready for dispatch",
  },
  {
    id: "req-5",
    type: "lab",
    title: "CP2 (Advanced Computing) Weekend Hackathon",
    requesterName: "Aman Verma",
    requesterEmail: "22ucs012@lnmiit.ac.in",
    requesterRole: "Student (CSI Chapter Lead)",
    department: "CSE",
    facilityOrItem: "CP2 (Computer Lab 2)",
    dateOrDuration: "This Saturday",
    timeSlot: "9:00 AM – 6:00 PM",
    purpose: "Annual 24-Hour Hackathon - LNMIIT Developer Student Club",
    status: "approved",
    submittedAt: "Yesterday, 3:00 PM",
    supervisorApproval: "Endorsed by Faculty Advisor Dr. Poonam Gera",
    staffApproval: "Approved by Lab Staff",
  },
  {
    id: "req-6",
    type: "component",
    title: "3x NVIDIA Jetson Nano Developer Kits",
    requesterName: "Rohan Kulkarni",
    requesterEmail: "21ume025@lnmiit.ac.in",
    requesterRole: "Student (21UME025)",
    department: "MME",
    facilityOrItem: "NVIDIA Jetson Nano 4GB",
    dateOrDuration: "21 Days Loan",
    quantity: 3,
    purpose: "Deep Learning Edge Inferencing for Robotic Arm Sorting",
    status: "rejected",
    submittedAt: "2 days ago",
    supervisorApproval: "Rejected by HoD",
    remarks: "Units currently reserved for postgraduate thesis experiments until semester end.",
  },
]

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ApprovalRequest[]>(DEFAULT_APPROVALS)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [filterType, setFilterType] = useState<"all" | "lab" | "component">("all")
  const [filterDept, setFilterDept] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Action modal state
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [actionRemarks, setActionRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verify admin session
  useEffect(() => {
    const rawUser = localStorage.getItem("user")
    if (!rawUser) {
      router.push("/")
      return
    }
    try {
      const user = JSON.parse(rawUser)
      if (user.role !== "admin") {
        router.push(`/${user.role.replace(/_/g, "-")}/dashboard`)
      }
    } catch {
      router.push("/")
    }
  }, [router])

  // Try to load any live requests from database/API
  useEffect(() => {
    async function fetchLiveRequests() {
      try {
        const [bookingsRes, compRes] = await Promise.all([
          fetch("/api/admin/bookings?status=pending").then(r => r.ok ? r.json() : null),
          fetch("/api/hod/component-requests").then(r => r.ok ? r.json() : null)
        ])

        const liveItems: ApprovalRequest[] = []

        if (bookingsRes?.bookings && Array.isArray(bookingsRes.bookings)) {
          bookingsRes.bookings.forEach((b: any) => {
            liveItems.push({
              id: `booking-${b.id}`,
              type: "lab",
              title: `${b.lab_name || "Laboratory"} Booking`,
              requesterName: b.requester_name || b.user_name || "Department User",
              requesterEmail: b.requester_email || b.user_email || "user@lnmiit.ac.in",
              requesterRole: b.role || "Faculty / Student",
              department: b.department || "General",
              facilityOrItem: b.lab_name || "Assigned Lab",
              dateOrDuration: b.booking_date || "Upcoming",
              timeSlot: `${b.start_time || "09:00"} – ${b.end_time || "12:00"}`,
              purpose: b.purpose || "Laboratory Practical Session",
              status: (b.approval_status === "approved" || b.status === "approved") ? "approved" : (b.approval_status === "rejected" || b.status === "rejected") ? "rejected" : "pending",
              submittedAt: b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recent",
              supervisorApproval: "Awaiting Central Validation",
              staffApproval: "Pending Review"
            })
          })
        }

        if (compRes?.requests && Array.isArray(compRes.requests)) {
          compRes.requests.forEach((c: any) => {
            liveItems.push({
              id: `comp-${c.id}`,
              type: "component",
              title: `${c.component_name || "Hardware Component"} Requisition`,
              requesterName: c.requester_name || c.user_name || "Student",
              requesterEmail: c.requester_email || "student@lnmiit.ac.in",
              requesterRole: c.requester_role || "Student",
              department: c.department || "ECE",
              facilityOrItem: `${c.component_name || "Lab Gear"} (${c.quantity || 1} pcs)`,
              dateOrDuration: `${c.duration_days || 7} Days Loan`,
              quantity: c.quantity || 1,
              purpose: c.purpose || "Academic Research Project",
              status: c.status === "approved" ? "approved" : c.status === "rejected" ? "rejected" : "pending",
              submittedAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recent",
              supervisorApproval: c.faculty_name ? `Approved by ${c.faculty_name}` : "Pending Faculty Endorsement",
              staffApproval: "Inventory Assigned"
            })
          })
        }

        if (liveItems.length > 0) {
          // Merge live items with sample defaults for complete test experience
          setRequests(prev => {
            const existingIds = new Set(liveItems.map(i => i.id))
            const remainingDefaults = prev.filter(p => !existingIds.has(p.id))
            return [...liveItems, ...remainingDefaults]
          })
        }
      } catch (err) {
        console.warn("Could not load external requests, maintaining local records.", err)
      }
    }

    fetchLiveRequests()
  }, [])

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Tab filter
      if (activeTab !== "all" && req.status !== activeTab) return false
      // Type filter
      if (filterType !== "all" && req.type !== filterType) return false
      // Dept filter
      if (filterDept !== "all" && req.department !== filterDept) return false
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          req.title.toLowerCase().includes(q) ||
          req.requesterName.toLowerCase().includes(q) ||
          req.facilityOrItem.toLowerCase().includes(q) ||
          req.purpose.toLowerCase().includes(q) ||
          req.department.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [requests, activeTab, filterType, filterDept, searchQuery])

  // Count summaries
  const pendingCount = requests.filter(r => r.status === "pending").length
  const approvedCount = requests.filter(r => r.status === "approved").length
  const rejectedCount = requests.filter(r => r.status === "rejected").length

  const handleOpenAction = (req: ApprovalRequest, type: "approve" | "reject") => {
    setSelectedReq(req)
    setActionType(type)
    setActionRemarks("")
  }

  const handleConfirmAction = async () => {
    if (!selectedReq || !actionType) return
    setIsSubmitting(true)

    // Simulate API delay and update state
    await new Promise(r => setTimeout(r, 400))

    setRequests(prev =>
      prev.map(r =>
        r.id === selectedReq.id
          ? {
              ...r,
              status: actionType === "approve" ? "approved" : "rejected",
              remarks: actionRemarks.trim() || (actionType === "approve" ? "Authorized by Administrator" : "Declined by Administrator"),
            }
          : r
      )
    )

    toast.success(
      actionType === "approve"
        ? `Request #${selectedReq.id} has been Authorized successfully.`
        : `Request #${selectedReq.id} has been Rejected.`
    )

    setIsSubmitting(false)
    setSelectedReq(null)
    setActionType(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
            <Link
              href="/admin/dashboard"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Command Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800">Governance & Authorizations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            Central Authorizations & Approvals
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Supervisory queue for reviewing, greenlighting, and tracking laboratory bookings and component requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
              <User className="h-3.5 w-3.5 text-purple-600" />
              User Management
            </Button>
          </Link>
          <Link href="/admin/dashboard/timetable">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
              Master Timetable
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/90 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Decision</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized & Clear</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Declined / Closed</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/90 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Evaluated</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{requests.length}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by requester, facility, purpose, or department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger className="w-[150px] h-10 text-xs bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Request Types</SelectItem>
                  <SelectItem value="lab">Lab Bookings</SelectItem>
                  <SelectItem value="component">Component Loans</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Filter */}
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="w-[140px] h-10 text-xs bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="CCE">CCE</SelectItem>
                  <SelectItem value="MME">MME</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="HSS">HSS</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || filterType !== "all" || filterDept !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                    setFilterDept("all")
                  }}
                  className="h-10 text-xs text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "pending"
                  ? "bg-amber-100 text-amber-900 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Pending Decisions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/90 text-amber-950 font-extrabold">
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "approved"
                  ? "bg-emerald-100 text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Approved</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/90 text-emerald-950 font-extrabold">
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "rejected"
                  ? "bg-rose-100 text-rose-900 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/90 text-rose-950 font-extrabold">
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "all"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>All Queue Items</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white font-extrabold">
                {requests.length}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="bg-white border-slate-200 p-12 text-center shadow-xs">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No requests found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no authorization requests matching your current filter criteria. All pending queues are clear.
            </p>
          </Card>
        ) : (
          filteredRequests.map(item => (
            <Card
              key={item.id}
              className={`bg-white border transition-all duration-150 shadow-2xs hover:shadow-xs ${
                item.status === "pending"
                  ? "border-amber-200/90 hover:border-amber-300"
                  : item.status === "approved"
                  ? "border-emerald-200/90 hover:border-emerald-300"
                  : "border-slate-200 hover:border-slate-300 opacity-80"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "lab"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-purple-50 text-purple-800 border-purple-200"
                        }`}
                      >
                        {item.type === "lab" ? "Lab Reservation" : "Component Loan"}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-slate-50 text-slate-700 border-slate-200"
                      >
                        {item.department}
                      </Badge>

                      {item.status === "pending" && (
                        <Badge className="bg-amber-500 text-white text-[10px] font-bold gap-1">
                          <Clock className="h-3 w-3" /> Pending Review
                        </Badge>
                      )}
                      {item.status === "approved" && (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Authorized
                        </Badge>
                      )}
                      {item.status === "rejected" && (
                        <Badge className="bg-rose-600 text-white text-[10px] font-bold gap-1">
                          <XCircle className="h-3 w-3" /> Declined
                        </Badge>
                      )}

                      <span className="text-[11px] text-slate-400 ml-auto">
                        Submitted: {item.submittedAt}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        <span className="font-semibold text-slate-700">Purpose: </span>
                        {item.purpose}
                      </p>
                    </div>

                    {/* Metadata strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong className="text-slate-800">{item.requesterName}</strong> ({item.requesterRole})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        {item.type === "lab" ? (
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">
                          <strong>Resource:</strong> {item.facilityOrItem}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong>Schedule:</strong> {item.dateOrDuration} {item.timeSlot ? `(${item.timeSlot})` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Endorsements / remarks */}
                    {(item.supervisorApproval || item.staffApproval || item.remarks) && (
                      <div className="bg-slate-50/80 rounded-lg p-2.5 text-[11px] space-y-1 border border-slate-100">
                        {item.supervisorApproval && (
                          <p className="text-slate-600">
                            <strong className="text-slate-700">Supervisor:</strong> {item.supervisorApproval}
                          </p>
                        )}
                        {item.staffApproval && (
                          <p className="text-slate-600">
                            <strong className="text-slate-700">Staff Verification:</strong> {item.staffApproval}
                          </p>
                        )}
                        {item.remarks && (
                          <p className="text-rose-700 font-medium">
                            <strong>Admin Remarks:</strong> {item.remarks}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex lg:flex-col items-center justify-end gap-2 lg:min-w-[140px] pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {item.status === "pending" ? (
                      <>
                        <Button
                          onClick={() => handleOpenAction(item, "approve")}
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-xs gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Authorize
                        </Button>
                        <Button
                          onClick={() => handleOpenAction(item, "reject")}
                          variant="outline"
                          size="sm"
                          className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs h-9 gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </Button>
                      </>
                    ) : (
                      <div className="text-center w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAction(item, item.status === "approved" ? "reject" : "approve")}
                          className="text-xs text-slate-500 hover:text-slate-800 h-8"
                        >
                          Change Status
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Decision Dialog Modal */}
      <Dialog open={!!selectedReq && !!actionType} onOpenChange={() => { setSelectedReq(null); setActionType(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {actionType === "approve" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Confirm Request Authorization
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  Decline Request
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {actionType === "approve"
                ? `You are granting formal administrative approval for request #${selectedReq?.id}. An automated confirmation will be sent to the requester.`
                : `Please provide a mandatory or optional justification for declining request #${selectedReq?.id}.`}
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-3 my-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900">{selectedReq.title}</p>
                <p className="text-slate-600">Requester: {selectedReq.requesterName} ({selectedReq.requesterEmail})</p>
                <p className="text-slate-600">Target: {selectedReq.facilityOrItem}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {actionType === "approve" ? "Administrative Endorsement Remarks (Optional)" : "Reason for Decline (Sent to Requester)"}
                </label>
                <Textarea
                  placeholder={
                    actionType === "approve"
                      ? "e.g., Authorized per HOD and faculty recommendation."
                      : "e.g., Facility booked for scheduled maintenance during this window."
                  }
                  value={actionRemarks}
                  onChange={e => setActionRemarks(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedReq(null); setActionType(null) }}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmAction}
              disabled={isSubmitting}
              className={`text-xs font-bold text-white ${
                actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting ? "Processing..." : actionType === "approve" ? "Authorize Now" : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
