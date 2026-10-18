/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Inter-Lab Component Request Action API:
 * Allows the unique target lab staff member to Approve or Reject a requisition.
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { approveOrRejectInterLabRequest } from "@/lib/inter-lab-service"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Lab staff access required" }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams
    const requestId = Number(id)
    if (!requestId || isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { action, remarks } = body

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 })
    }

    const result = await approveOrRejectInterLabRequest({
      requestId,
      staffId: Number(user.userId),
      action,
      remarks,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Inter-lab request action error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process request action" },
      { status: 500 }
    )
  }
}
