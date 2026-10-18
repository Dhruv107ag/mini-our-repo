/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * LabStaffNotificationQueue Component:
 * Real-time notification queue for Lab Staff displaying unreturned
 * non-consumable equipment alerts with the LATEST notification on top.
 */

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  BellRing,
  Clock,
  Package,
  Calendar,
  Send,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  User,
  Building,
  CheckCircle2,
  ArrowUpCircle,
} from "lucide-react"

export interface QueueItem {
  id: string
  isLatest: boolean
  sourceType: "loan" | "request"
  sourceId: number
  labId?: number
  studentId: number
  studentName: string
  studentEmail: string
  labName: string
  componentList: string
  issuedAt: string
  dueDate?: string
  daysHeld: number
  milestone: "1_month" | "1_semester" | "critical_extended"
  milestoneLabel: string
  urgency: "warning" | "urgent" | "critical"
  notifiedAt: string
  timeAgo: string
}

export function LabStaffNotificationQueue() {
  const { toast } = useToast()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [counts, setCounts] = useState({
    total: 0,
    oneMonth: 0,
    oneSemester: 0,
    criticalExtended: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "1_month" | "1_semester" | "critical_extended">("all")
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [sweepLoading, setSweepLoading] = useState(false)

  const loadQueue = async () => {
    setLoading(true)
    try {
      const url = activeTab === "all"
        ? "/api/lab-staff/non-consumable-queue"
        : `/api/lab-staff/non-consumable-queue?milestone=${activeTab}`

      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch notification queue")
      const data = await res.json()
      setQueue(data.queue || [])
      if (data.counts) {
        setCounts(data.counts)
      }
    } catch (err: any) {
      toast({
        title: "Could not load queue",
        description: err?.message || "Please check your network connection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQueue()
  }, [activeTab])

  const sendSingleReminder = async (item: QueueItem) => {
    setActionLoading((prev) => ({ ...prev, [item.id]: true }))
    try {
      const res = await fetch("/api/lab-staff/non-consumable-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_single",
          sourceId: item.sourceId,
          sourceType: item.sourceType,
          milestone: item.milestone,
        }),
      })

      if (!res.ok) throw new Error("Failed to send reminder")
      const data = await res.json()

      toast({
        title: "⚡ Notification Sent to Student",
        description: `Dispatched ${item.milestoneLabel} reminder to ${item.studentName} (${item.studentEmail}).`,
      })

      await loadQueue()
    } catch (err: any) {
      toast({
        title: "Failed to send reminder",
        description: err?.message || "Could not dispatch alert",
        variant: "destructive",
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  const handleSweepNotifyAll = async () => {
    setSweepLoading(true)
    try {
      const res = await fetch("/api/lab-staff/non-consumable-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_sweep",
          milestone: activeTab === "all" ? undefined : activeTab,
        }),
      })

      if (!res.ok) throw new Error("Sweep failed")
      const data = await res.json()

      toast({
        title: "🚀 Queue Sweep Completed",
        description: data.message || "All pending reminders dispatched successfully.",
      })

      await loadQueue()
    } catch (err: any) {
      toast({
        title: "Sweep execution failed",
        description: err?.message || "Could not complete sweep",
        variant: "destructive",
      })
    } finally {
      setSweepLoading(false)
    }
  }

  const getMilestoneBadge = (milestone: QueueItem["milestone"]) => {
    switch (milestone) {
      case "critical_extended":
        return (
          <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
            🚨 Critical Overdue (&gt;6 Months)
          </Badge>
        )
      case "1_semester":
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
            ⚠️ 1-Semester (~4 Months)
          </Badge>
        )
      case "1_month":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            📦 1-Month (~30 Days)
          </Badge>
        )
    }
  }

  return (
    <Card className="border border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BellRing className="h-5 w-5 animate-pulse text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  Non-Consumable Return Notification Queue
                  <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5">
                    {counts.total} in queue
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <ArrowUpCircle className="h-3.5 w-3.5 text-blue-600" />
                  Arranged as a live priority queue &bull; <strong>Latest notification displayed on top</strong>
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadQueue}
              disabled={loading}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSweepNotifyAll}
              disabled={sweepLoading || queue.length === 0}
              className="h-8 gap-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
            >
              <Send className={`h-3.5 w-3.5 ${sweepLoading ? "animate-spin" : ""}`} />
              {sweepLoading ? "Sending..." : "Notify All in Queue"}
            </Button>
          </div>
        </div>

        {/* Milestone Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs rounded-full px-3"
            onClick={() => setActiveTab("all")}
          >
            All Alerts ({counts.total})
          </Button>
          <Button
            variant={activeTab === "1_month" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs rounded-full px-3"
            onClick={() => setActiveTab("1_month")}
          >
            1-Month ({counts.oneMonth})
          </Button>
          <Button
            variant={activeTab === "1_semester" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs rounded-full px-3"
            onClick={() => setActiveTab("1_semester")}
          >
            1-Semester ({counts.oneSemester})
          </Button>
          <Button
            variant={activeTab === "critical_extended" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs rounded-full px-3"
            onClick={() => setActiveTab("critical_extended")}
          >
            Critical Overdue ({counts.criticalExtended})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm">Loading notification queue...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-2 border border-dashed rounded-lg p-6">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
            <p className="text-base font-semibold text-foreground">Notification Queue is Clear</p>
            <p className="text-xs max-w-md mx-auto text-muted-foreground">
              No students currently hold unreturned non-consumable equipment past the 30-day or 1-semester milestone.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {queue.map((item, index) => {
              const isFirst = index === 0

              return (
                <div
                  key={item.id}
                  className={`relative rounded-xl border transition-all duration-200 p-4 sm:p-5 ${
                    isFirst
                      ? "border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                      : "border-border/80 bg-card hover:border-border hover:shadow-sm"
                  }`}
                >
                  {/* Top Item Glow Banner */}
                  {isFirst && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide uppercase mb-3 shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      Latest Notification in Queue
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Item Information */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getMilestoneBadge(item.milestone)}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Held: {item.daysHeld} days
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          &bull; Updated {item.timeAgo}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-base font-bold text-foreground">
                          <Package className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>{item.componentList}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.studentName} ({item.studentEmail})
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.labName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        <span className="text-muted-foreground">
                          Issued: <strong>{new Date(item.issuedAt).toLocaleDateString("en-IN")}</strong>
                        </span>
                        {item.dueDate && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-amber-500" />
                            Scheduled Return: <strong className="text-foreground">{new Date(item.dueDate).toLocaleDateString("en-IN")}</strong>
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          Ref: {item.sourceType.toUpperCase()} #{item.sourceId}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      <Button
                        size="sm"
                        variant={isFirst ? "default" : "outline"}
                        onClick={() => sendSingleReminder(item)}
                        disabled={actionLoading[item.id]}
                        className={`text-xs font-semibold h-8 px-3.5 gap-1.5 ${
                          isFirst ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : ""
                        }`}
                      >
                        <Send className={`h-3 w-3 ${actionLoading[item.id] ? "animate-spin" : ""}`} />
                        {actionLoading[item.id] ? "Dispatching..." : "Send Reminder"}
                      </Button>
                      <span className="text-[11px] text-muted-foreground">
                        Notified: {item.timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
