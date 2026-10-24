/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * LNMIIT Lab Management System - Faculty & Central Administration Hub
 * 
 * Aesthetic Architecture:
 * - Top Navigation Bar & Side Navigation Bar: Deep Institutional Blue (#0B1530)
 * - Canvas Background: Clean Crisp Light Slate (#F8FAFC / bg-slate-50)
 * - All Dashboard Cards & Panels: Pure White (#FFFFFF) with sharp square corners (rounded-none)
 * - Smooth, Eye-Friendly Amber-Orange Hover (#FDBA74 border, #EA580C accent, #FFFAF5 warm wash)
 * - Calibrated, balanced typography & zero outer container hover glare
 */

"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FlaskConical,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Layers,
  Check,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { MOCK_ADMIN_STATS } from "@/lib/admin-mock-data"

type StatResponse = {
  totalUsers: number
  activeLabs: number
  dbUptimeSeconds: number
  dbSizeMB: number
  pendingApprovals: number
}

interface PendingItem {
  id: string
  requester: string
  role: "Faculty" | "Student"
  department: string
  title: string
  detail: string
  time: string
  type: "lab" | "component"
}

const INITIAL_PENDING_REQUESTS: PendingItem[] = [
  {
    id: "req-1",
    requester: "Dr. Preety Singh",
    role: "Faculty",
    department: "CSE",
    title: "CP1 (Programming Lab 1) Slot Booking",
    detail: "Machine Learning Workshop for 3rd Year B.Tech (Batch A1 & A2)",
    time: "Today, 2:00 PM – 5:00 PM",
    type: "lab",
  },
  {
    id: "req-2",
    requester: "Prof. Vikas Gupta",
    role: "Faculty",
    department: "ECE",
    title: "Hardware Lab Special Booking",
    detail: "DSP & Microprocessor Mid-term Practical Examination",
    time: "Tomorrow, 10:00 AM – 1:00 PM",
    type: "lab",
  },
  {
    id: "req-3",
    requester: "Dhruv Agrawal (23ucs107)",
    role: "Student",
    department: "CSE",
    title: "15x Arduino Uno R3 & 5x ESP32 Kits",
    detail: "Autonomous Rover Research Project (Faculty Mentor: Dr. Abhishek Sharma)",
    time: "Requested 40 mins ago",
    type: "component",
  },
  {
    id: "req-4",
    requester: "Sneha Meena (23uec044)",
    role: "Student",
    department: "ECE",
    title: "Keysight 70MHz Digital Oscilloscope",
    detail: "High-Frequency RF Filter Analysis - Final Year Capstone Project",
    time: "Requested 2 hours ago",
    type: "component",
  },
]

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<StatResponse | null>(null)
  const [utilization] = useState(MOCK_ADMIN_STATS.labUtilization)
  const [pendingList, setPendingList] = useState<PendingItem[]>(INITIAL_PENDING_REQUESTS)
  const [approvedIds, setApprovedIds] = useState<string[]>([])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" })
      if (res.ok) {
        const json = (await res.json()) as StatResponse
        if (json && typeof json.totalUsers === "number") {
          setData(json)
          return
        }
      }
      setData({
        totalUsers: MOCK_ADMIN_STATS.totalUsers,
        activeLabs: MOCK_ADMIN_STATS.activeLabs,
        dbUptimeSeconds: MOCK_ADMIN_STATS.dbUptimeSeconds,
        dbSizeMB: MOCK_ADMIN_STATS.dbSizeMB,
        pendingApprovals: MOCK_ADMIN_STATS.pendingApprovals,
      })
    } catch {
      setData({
        totalUsers: MOCK_ADMIN_STATS.totalUsers,
        activeLabs: MOCK_ADMIN_STATS.activeLabs,
        dbUptimeSeconds: MOCK_ADMIN_STATS.dbUptimeSeconds,
        dbSizeMB: MOCK_ADMIN_STATS.dbSizeMB,
        pendingApprovals: MOCK_ADMIN_STATS.pendingApprovals,
      })
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await fetchStats()
      if (mounted) {
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
    setTimeout(() => setRefreshing(false), 450)
  }

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => [...prev, id])
  }

  const displayData = data || {
    totalUsers: MOCK_ADMIN_STATS.totalUsers,
    activeLabs: MOCK_ADMIN_STATS.activeLabs,
    dbUptimeSeconds: MOCK_ADMIN_STATS.dbUptimeSeconds,
    dbSizeMB: MOCK_ADMIN_STATS.dbSizeMB,
    pendingApprovals: MOCK_ADMIN_STATS.pendingApprovals,
  }

  // Calculate average utilization
  const averageUtilization = useMemo(() => {
    if (!utilization.length) return 81
    const sum = utilization.reduce((acc, curr) => acc + curr.utilizationRate, 0)
    return Math.round(sum / utilization.length)
  }, [utilization])

  const totalBookingsToday = useMemo(() => {
    return utilization.reduce((acc, curr) => acc + curr.activeBookingsToday, 0)
  }, [utilization])

  const remainingPendingCount = Math.max(0, displayData.pendingApprovals - approvedIds.length)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* =========================================================================
          EXECUTIVE COMMAND HEADER
          Luminous Light Theme with Soft Royal Blue & Warm Amber Accents
          ========================================================================= */}
      <div className="admin-appear-card bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/30 border border-blue-100/90 p-6 sm:p-7 shadow-xs rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50/90 px-2.5 py-0.5 border border-blue-200/80 rounded-full">
                LNMIIT Academic Session 2025–26
              </span>
            </div>
            <h1 className="admin-appear-text text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Central Administration Dashboard
            </h1>
            <p className="admin-appear-text text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Institutional oversight for LNMIIT laboratory allocations, weekly timetable grids, and pending faculty authorisations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 shrink-0">
            {/* Refresh Button with Smooth Blue Hover */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="border-slate-200 text-slate-700 bg-white hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/60 font-semibold h-9 px-3.5 text-xs rounded-xl shadow-xs transition-all duration-200"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-2 ${refreshing ? "animate-spin text-blue-600" : "text-blue-600"}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </Button>

            {/* Master Timetable with Amber Accent */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-700 bg-white hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/60 font-semibold h-9 px-3.5 text-xs rounded-xl shadow-xs transition-all duration-200 group"
            >
              <Link href="/admin/dashboard/timetable">
                <Calendar className="h-3.5 w-3.5 mr-2 text-amber-600 group-hover:scale-105 transition-transform" />
                Master Timetable
              </Link>
            </Button>

            {/* Primary Action Button with Royal Blue Gradient */}
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold h-9 px-4 text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Link href="/admin/dashboard/department-and-lab-management">
                <Building className="h-3.5 w-3.5 mr-2 text-blue-100" />
                Manage Labs & Depts
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY METRICS GRID
          4 Vibrant Light Theme Cards with Color-Coded Accent Borders
          ========================================================================= */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 p-6 shadow-xs rounded-2xl animate-pulse min-h-[125px]"
            >
              <div className="h-3 w-28 bg-slate-100 mb-4 rounded" />
              <div className="h-8 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Total Users (Royal Blue Accent) */}
          <div className="admin-appear-card admin-card-interactive group bg-white border-t-4 border-t-blue-500 border-x border-b border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-blue-300 rounded-2xl flex flex-col justify-between min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-900 transition-colors">
                Enrolled Users
              </span>
              <div className="h-9 w-9 bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-100 group-hover:text-blue-700">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-950 transition-colors">
                {displayData.totalUsers.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-md">
                Active Directory
              </span>
            </div>
          </div>

          {/* Metric 2: Active Facilities (Emerald Green Accent) */}
          <div className="admin-appear-card admin-card-interactive group bg-white border-t-4 border-t-emerald-500 border-x border-b border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-emerald-300 rounded-2xl flex flex-col justify-between min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-900 transition-colors">
                Active Facilities
              </span>
              <div className="h-9 w-9 bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                <FlaskConical className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-950 transition-colors">
                  {displayData.activeLabs}
                </span>
                <span className="text-xs font-semibold text-slate-500">Labs</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-md">
                100% Online
              </span>
            </div>
          </div>

          {/* Metric 3: Pending Authorizations (Warm Amber Accent) */}
          <div className="admin-appear-card admin-card-interactive group bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-amber-300 rounded-2xl flex flex-col justify-between min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-900 transition-colors">
                Pending Authorizations
              </span>
              <div className="h-9 w-9 bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:bg-amber-100 group-hover:text-amber-700">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 group-hover:text-amber-950 transition-colors">
                {remainingPendingCount}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-md">
                Awaiting Review
              </span>
            </div>
          </div>

          {/* Metric 4: Today's Scheduled Sessions (Purple/Violet Accent) */}
          <div className="admin-appear-card admin-card-interactive group bg-white border-t-4 border-t-purple-500 border-x border-b border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-purple-300 rounded-2xl flex flex-col justify-between min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-900 transition-colors">
                Today's Sessions
              </span>
              <div className="h-9 w-9 bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:bg-purple-100 group-hover:text-purple-700">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 group-hover:text-purple-950 transition-colors">
                  {totalBookingsToday}
                </span>
                <span className="text-xs font-semibold text-slate-500">Bookings</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/70 rounded-md">
                Active Slots
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMINISTRATIVE COMMAND PORTALS
          4 Color-Coded Quick Jump Cards in Vibrant Light Theme
          ========================================================================= */}
      <div className="admin-appear-card bg-white border border-slate-200/90 p-6 shadow-xs rounded-2xl">
        <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Administrative Command Portals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access for academic timetables, daily scheduling, departmental governance, and asset inventory
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Quick Navigation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Portal 1: Daily Schedule (Rose Accent) */}
          <Link
            href="/admin/dashboard/daily-schedule"
            className="admin-card-interactive group bg-white border-l-4 border-l-rose-500 border-y border-r border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] hover:border-rose-300 hover:bg-rose-50/20"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-rose-100 rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-rose-900 transition-colors">
                Daily Lab Schedule
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Live room occupancy & slots</p>
            </div>
          </Link>

          {/* Portal 2: Weekly Timetable (Amber Accent) */}
          <Link
            href="/admin/dashboard/timetable"
            className="admin-card-interactive group bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] hover:border-amber-300 hover:bg-amber-50/20"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-amber-100 rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-900 transition-colors">
                Master Timetable
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Weekly academic recurring grids</p>
            </div>
          </Link>

          {/* Portal 3: Governance & Labs (Indigo Accent) */}
          <Link
            href="/admin/dashboard/department-and-lab-management"
            className="admin-card-interactive group bg-white border-l-4 border-l-indigo-500 border-y border-r border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] hover:border-indigo-300 hover:bg-indigo-50/20"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-indigo-100 rounded-xl">
                <Building className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-900 transition-colors">
                Governance & Labs
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Depts, HoDs & lab staff</p>
            </div>
          </Link>

          {/* Portal 4: Lab Inventory (Emerald Accent) */}
          <Link
            href="/admin/dashboard/inventory"
            className="admin-card-interactive group bg-white border-l-4 border-l-emerald-500 border-y border-r border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] hover:border-emerald-300 hover:bg-emerald-50/20"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-100 rounded-xl">
                <PackageCheck className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-900 transition-colors">
                Asset & Inventory
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Components, kits & equipment</p>
            </div>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL WORKSPACE
          Approvals Desk (Left) + Occupancy Telemetry (Right)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Actionable Approvals Desk */}
        <div className="admin-appear-card lg:col-span-7 bg-white border border-slate-200/90 shadow-xs rounded-2xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Actionable Approvals Desk
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-priority laboratory booking requests and component requisitions awaiting review
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-amber-900 bg-amber-50 border-amber-200 font-bold text-[11px] uppercase rounded-lg px-2.5 py-1"
              >
                {remainingPendingCount} Action Required
              </Badge>
            </div>

            {/* List of Actionable Requests with Color Badges */}
            <div className="divide-y divide-slate-100">
              {pendingList.map((item) => {
                const isApproved = approvedIds.includes(item.id)
                const isLab = item.type === "lab"

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 border rounded-md ${
                            isLab
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-sky-50 text-sky-800 border-sky-200"
                          }`}
                        >
                          {isLab ? "Lab Slot" : "Component Loan"}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>

                      <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-0.5">
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded text-[11px] ${
                            item.role === "Faculty"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.requester} ({item.department})
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-400 font-medium">{item.time}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
                      {isApproved ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Approved</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3.5 rounded-xl font-bold shadow-2xs transition-all duration-200"
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing priority requests &bull; Quick decisions active
            </span>
            <Link
              href="/admin/dashboard/approvals"
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 group"
            >
              <span>View All Authorizations</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right: Live Facility Occupancy Index */}
        <div className="admin-appear-card lg:col-span-5 bg-white border border-slate-200/90 p-5 shadow-xs rounded-2xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-blue-600" />
                  Facility Occupancy Index
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Campus average: <strong className="text-slate-900">{averageUtilization}%</strong>
                </p>
              </div>
              <Link
                href="/admin/dashboard/timetable"
                className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 transition-colors group"
              >
                <span>Timetable</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Occupancy Bars with Multi-tier Colors */}
            <div className="mt-4 space-y-3.5">
              {utilization.slice(0, 5).map((lab) => {
                const isHigh = lab.utilizationRate >= 85
                const isModerate = lab.utilizationRate >= 60 && lab.utilizationRate < 85

                let barColor = "bg-gradient-to-r from-emerald-500 to-teal-500"
                let textColor = "text-emerald-700"

                if (isHigh) {
                  barColor = "bg-gradient-to-r from-amber-500 to-rose-500"
                  textColor = "text-rose-700 font-extrabold"
                } else if (isModerate) {
                  barColor = "bg-gradient-to-r from-blue-500 to-indigo-500"
                  textColor = "text-blue-700 font-bold"
                }

                return (
                  <div
                    key={lab.labCode}
                    className="p-2.5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-200 space-y-1.5 rounded-xl group"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="truncate max-w-[200px]">
                        <span className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                          {lab.labName}
                        </span>{" "}
                        <span className="text-slate-400 font-normal">({lab.labCode})</span>
                      </div>
                      <span className={`font-extrabold transition-colors ${textColor}`}>
                        {lab.utilizationRate}%
                      </span>
                    </div>

                    {/* Progress Bar with Soft Pill Shape */}
                    <div className="w-full h-2.5 bg-slate-100 border border-slate-200/80 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${barColor}`}
                        style={{ width: `${lab.utilizationRate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-xs h-9 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/50 rounded-xl shadow-xs font-bold transition-all duration-200"
            >
              <Link href="/admin/dashboard/department-and-lab-management">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                Configure Department Authorities
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
