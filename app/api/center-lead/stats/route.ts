import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { getCenterDashboardStats } from "@/lib/center-db"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const stats = await getCenterDashboardStats()
    return NextResponse.json({ success: true, stats })
  } catch (error: any) {
    console.error("GET /api/center-lead/stats error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to load center stats" }, { status: 500 })
  }
}
