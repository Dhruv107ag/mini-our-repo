/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Inter-Lab Component Requests API:
 * Handles listing incoming/outgoing inter-lab requisitions and creating new requests.
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import {
  getInterLabRequestsForStaff,
  createInterLabRequest,
} from "@/lib/inter-lab-service"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Lab staff access required" }, { status: 403 })
    }

    const data = await getInterLabRequestsForStaff(Number(user.userId))
    return NextResponse.json({ success: true, ...data })
  } catch (error: any) {
    console.error("Inter-lab requests GET error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load inter-lab requests" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Lab staff access required" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { fromLabId, toLabId, itemName, quantity, purpose, neededByDate, expectedReturnDate } = body

    if (!fromLabId || !toLabId || !itemName || !purpose) {
      return NextResponse.json(
        { error: "Source Lab, Target Lab, Item Name, and Purpose are required" },
        { status: 400 }
      )
    }

    if (Number(fromLabId) === Number(toLabId)) {
      return NextResponse.json(
        { error: "Cannot request items from the same laboratory" },
        { status: 400 }
      )
    }

    const request = await createInterLabRequest({
      fromStaffId: Number(user.userId),
      fromLabId: Number(fromLabId),
      toLabId: Number(toLabId),
      itemName: String(itemName).trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      purpose: String(purpose).trim(),
      neededByDate,
      expectedReturnDate,
    })

    return NextResponse.json({
      success: true,
      message: `Inter-lab requisition #${request.id} created successfully and sent to ${request.to_staff_name} (${request.to_lab_name}).`,
      request,
    })
  } catch (error: any) {
    console.error("Inter-lab requests POST error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create inter-lab request" },
      { status: 500 }
    )
  }
}
