/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Automated Cron Route for Non-Consumable Item Return Reminders
 * Dispatches 1-Month, 1-Semester, and Extended possession notifications
 * to students who hold durable non-consumable laboratory equipment.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  processNonConsumableReminders,
  MilestoneType,
} from "@/lib/non-consumable-reminder-service"

export async function GET(req: NextRequest) {
  return handleCronReminders(req)
}

export async function POST(req: NextRequest) {
  return handleCronReminders(req)
}

async function handleCronReminders(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const force = searchParams.get("force") === "true"
    const dryRun = searchParams.get("dryRun") === "true"
    const milestoneParam = searchParams.get("milestone") as MilestoneType | null

    const validMilestones: MilestoneType[] = ["1_month", "1_semester", "critical_extended"]
    const targetMilestone = milestoneParam && validMilestones.includes(milestoneParam)
      ? milestoneParam
      : undefined

    const result = await processNonConsumableReminders({
      force,
      dryRun,
      targetMilestone,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("Non-consumable reminders cron error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process non-consumable return reminders",
      },
      { status: 500 }
    )
  }
}
