/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * NotificationNavBell Component:
 * Navigation bar bell icon with real-time notification popover,
 * type-based symbol/icon mapping, unread badges, and mark-as-read actions.
 */

"use client"

import React, { useState, useEffect } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  Package,
  Clock,
  Sparkles,
  RefreshCw,
  XCircle,
} from "lucide-react"

export interface NotificationItem {
  id: number
  user_id?: number
  title: string
  message: string
  type: string // 'info' | 'warning' | 'error' | 'success' | 'withdrawn'
  is_read: number | boolean
  created_at: string
}

interface NotificationNavBellProps {
  userId?: string | number
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return "Just now"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}h ago`
    const diffDays = Math.floor(diffHour / 24)
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Recently"
  }
}

/**
 * Returns the contextual icon and color scheme based on notification type/title
 */
function getNotificationSymbol(type: string, title: string = "") {
  const lowerType = (type || "").toLowerCase()
  const lowerTitle = (title || "").toLowerCase()

  // 1. Critical / Error / Condemned / Overdue (>6 months)
  if (
    lowerType === "error" ||
    lowerTitle.includes("critical") ||
    lowerTitle.includes("urgent") ||
    lowerTitle.includes("overdue") ||
    lowerTitle.includes("rejected")
  ) {
    return {
      icon: <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />,
      bg: "bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900",
      badgeColor: "bg-rose-600 text-white",
      label: "Critical",
    }
  }

  // 2. Warning / 1-Semester / Return Required
  if (
    lowerType === "warning" ||
    lowerTitle.includes("semester") ||
    lowerTitle.includes("warning") ||
    lowerTitle.includes("return due") ||
    lowerTitle.includes("queue")
  ) {
    return {
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      bg: "bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
      badgeColor: "bg-amber-600 text-white",
      label: "Warning",
    }
  }

  // 3. Success / Approved / Issued / Returned
  if (
    lowerType === "success" ||
    lowerTitle.includes("approved") ||
    lowerTitle.includes("issued") ||
    lowerTitle.includes("success") ||
    lowerTitle.includes("returned")
  ) {
    return {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      bg: "bg-emerald-100 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900",
      badgeColor: "bg-emerald-600 text-white",
      label: "Approved",
    }
  }

  // 4. Equipment / Possession / 1-Month
  if (
    lowerTitle.includes("month") ||
    lowerTitle.includes("possession") ||
    lowerTitle.includes("equipment") ||
    lowerTitle.includes("component")
  ) {
    return {
      icon: <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      bg: "bg-blue-100 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900",
      badgeColor: "bg-blue-600 text-white",
      label: "Item Alert",
    }
  }

  // 5. Default Info / General Notification
  return {
    icon: <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />,
    bg: "bg-sky-100 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900",
    badgeColor: "bg-sky-600 text-white",
    label: "Info",
  }
}

export function NotificationNavBell({ userId }: NotificationNavBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all")

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.warn("Could not fetch notifications for nav bell:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Periodic silent refresh every 45s
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [userId])

  const unreadCount = notifications.filter(
    (n) => n.is_read === 0 || n.is_read === false || !n.is_read
  ).length

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      })
    } catch (err) {
      console.warn("Failed to mark all as read:", err)
    }
  }

  const markSingleAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    )

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      })
    } catch (err) {
      console.warn(`Failed to mark notification ${id} as read:`, err)
    }
  }

  const displayedNotifications = activeFilter === "unread"
    ? notifications.filter((n) => !n.is_read || n.is_read === 0)
    : notifications

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50 duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-xl border border-border/80 rounded-xl overflow-hidden bg-popover"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600 shrink-0" />
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 ? (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] h-5 px-1.5 py-0 font-semibold rounded-full">
                {unreadCount} new
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground font-normal">All read</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={fetchNotifications}
              disabled={loading}
              title="Refresh notifications"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden sm:inline">Mark read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 px-4 py-2 bg-muted/20 border-b border-border/40 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              activeFilter === "unread"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification Items List */}
        <ScrollArea className="max-h-[380px] overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/80" />
              <p className="text-sm font-semibold text-foreground">You&apos;re all caught up!</p>
              <p className="text-xs max-w-xs mx-auto">
                {activeFilter === "unread"
                  ? "No unread notifications at the moment."
                  : "No new activity or reminder notices found."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {displayedNotifications.map((item) => {
                const isUnread = !item.is_read || item.is_read === 0
                const symbol = getNotificationSymbol(item.type, item.title)

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isUnread) markSingleAsRead(item.id)
                    }}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 text-left ${
                      isUnread
                        ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        : "hover:bg-muted/40 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Symbol / Icon with themed container */}
                    <div
                      className={`p-2 rounded-lg border shrink-0 mt-0.5 ${symbol.bg}`}
                    >
                      {symbol.icon}
                    </div>

                    {/* Notification Content */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-semibold leading-tight truncate ${
                            isUnread ? "text-foreground font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </h4>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(item.created_at)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted font-medium">
                          {symbol.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2.5 bg-muted/30 border-t border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground">
              Showing latest {notifications.length} alerts &bull; Click any item to mark as read
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
