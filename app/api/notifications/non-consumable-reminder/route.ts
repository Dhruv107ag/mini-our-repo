/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Non-Consumable Item Return Reminder API:
 * Provides data retrieval and manual trigger endpoints for lab staff,
 * admin, and students regarding non-consumable items held for 1 month, 1 semester, etc.
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"
import {
  fetchUnreturnedNonConsumables,
  processNonConsumableReminders,
  MilestoneType,
} from "@/lib/non-consumable-reminder-service"

const db = Database.getInstance()

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allItems = await fetchUnreturnedNonConsumables()

    // If the requester is a student, filter only their own items
    const isStudent = user.role === "student"
    const filteredItems = isStudent
      ? allItems.filter((i) => i.studentId === Number(user.userId))
      : allItems

    // Group items by milestone
    const oneMonthItems = filteredItems.filter((i) => i.milestone === "1_month")
    const oneSemesterItems = filteredItems.filter((i) => i.milestone === "1_semester")
    const criticalExtendedItems = filteredItems.filter((i) => i.milestone === "critical_extended")

    // Fetch recent reminder logs
    let recentLogs: any[] = []
    try {
      const logsQuery = isStudent
        ? `SELECT * FROM non_consumable_reminder_logs WHERE student_id = ? ORDER BY sent_at DESC LIMIT 20`
        : `SELECT l.*, u.name as student_name, u.email as student_email 
           FROM non_consumable_reminder_logs l 
           LEFT JOIN users u ON u.id = l.student_id 
           ORDER BY l.sent_at DESC LIMIT 50`

      const logsRes = await db.query(logsQuery, isStudent ? [Number(user.userId)] : [])
      if (logsRes.rows) {
        recentLogs = logsRes.rows
      }
    } catch (e) {
      console.warn("Could not fetch reminder logs:", e)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalHeld: filteredItems.length,
        oneMonthCount: oneMonthItems.length,
        oneSemesterCount: oneSemesterItems.length,
        criticalExtendedCount: criticalExtendedItems.length,
      },
      grouped: {
        oneMonth: oneMonthItems,
        oneSemester: oneSemesterItems,
        criticalExtended: criticalExtendedItems,
      },
      items: filteredItems,
      recentLogs,
    })
  } catch (error: any) {
    console.error("Non-consumable notification GET error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch non-consumable status" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["admin", "lab_staff", "hod", "lab_coordinator"])) {
      return NextResponse.json({ error: "Forbidden: Only staff and admin can trigger reminders" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const force = body.force ?? true // Manual trigger defaults to forced send
    const targetMilestone = body.milestone as MilestoneType | undefined

    const result = await processNonConsumableReminders({
      force,
      targetMilestone,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Non-consumable notification POST error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to dispatch reminders" },
      { status: 500 }
    )
  }
}
