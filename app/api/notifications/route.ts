import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

const db = Database.getInstance()

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const res = await db.query(
        `SELECT id, user_id, title, message, type, is_read, created_at 
         FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC LIMIT 30`,
        [Number(user.userId)]
      )
      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ notifications: res.rows })
      }
    } catch (dbErr) {
      console.warn("Notifications DB query fallback:", dbErr)
    }

    // Default mock notifications if DB empty/offline
    const fallbackNotifications = [
      {
        id: 991,
        title: "Monthly Reminder: Active Lab Component in Your Possession",
        message: "Reminder: You have had 'ESP32-S3-DevKitC (2 units), DHT11 Sensors (3 pcs)' issued from IoT & Embedded Systems Lab for 32 days (~1 month). Please ensure safe handling and return on time.",
        type: "info",
        is_read: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 992,
        title: "Lab Component Request Approved",
        message: "Your component request #101 was approved and issued by Lab Staff.",
        type: "success",
        is_read: 1,
        created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]

    return NextResponse.json({ notifications: fallbackNotifications })
  } catch (error: any) {
    console.error("Notifications GET error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
