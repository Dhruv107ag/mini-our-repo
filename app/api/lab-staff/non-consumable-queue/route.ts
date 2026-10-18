/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Staff Notification Queue API:
 * Returns the unreturned non-consumable notification queue arranged with
 * the latest notification on top, and allows lab staff to trigger reminders.
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import {
  getLabStaffNotificationQueue,
  processNonConsumableReminders,
  MilestoneType,
} from "@/lib/non-consumable-reminder-service"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin", "hod", "lab_coordinator"])) {
      return NextResponse.json({ error: "Forbidden: Lab staff access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const labIdParam = searchParams.get("labId")
    const milestoneParam = searchParams.get("milestone") as MilestoneType | null
    const labId = labIdParam ? Number(labIdParam) : undefined

    const data = await getLabStaffNotificationQueue({
      labId,
      staffUserId: Number(user.userId),
      userRole: user.role,
    })

    let filteredQueue = data.queue
    if (milestoneParam) {
      filteredQueue = filteredQueue.filter((item) => item.milestone === milestoneParam)
      // Maintain latest notification on top for filtered slice
      if (filteredQueue.length > 0) {
        filteredQueue.forEach((item, idx) => {
          item.isLatest = idx === 0
        })
      }
    }

    return NextResponse.json({
      success: true,
      counts: data.counts,
      latestAlertTime: data.latestAlertTime,
      queue: filteredQueue,
    })
  } catch (error: any) {
    console.error("Lab staff notification queue error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load notification queue" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin", "hod", "lab_coordinator"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { action, sourceId, sourceType, milestone } = body

    if (action === "send_single" && sourceId && sourceType) {
      // Dispatch reminder for this specific item in the queue
      const result = await processNonConsumableReminders({
        force: true, // User clicked send button intentionally
        targetSourceId: Number(sourceId),
        targetSourceType: sourceType as "loan" | "request",
      })

      return NextResponse.json({
        success: true,
        message: `Reminder sent successfully to student for this item.`,
        result,
      })
    }

    // Default action: run queue sweep
    const result = await processNonConsumableReminders({
      force: true,
      targetMilestone: milestone as MilestoneType | undefined,
    })

    return NextResponse.json({
      success: true,
      message: `Queue sweep executed. ${result.remindersSent} reminders dispatched.`,
      result,
    })
  } catch (error: any) {
    console.error("Lab staff queue action error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute queue action" },
      { status: 500 }
    )
  }
}
