import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { returnCenterIssue } from "@/lib/center-db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const issueId = Number(id)
    if (isNaN(issueId)) {
      return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { return_condition, return_remarks } = body

    const updated = await returnCenterIssue({
      issue_id: issueId,
      return_condition: return_condition || "good",
      return_remarks,
      returned_to_name: user.name || "Center Lead",
    })

    return NextResponse.json({ success: true, issue: updated })
  } catch (error: any) {
    console.error("POST /api/center-lead/issue-return/[id]/return error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to record return" }, { status: 500 })
  }
}
