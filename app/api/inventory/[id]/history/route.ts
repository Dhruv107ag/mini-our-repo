/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Inventory Item Adjustment History API
 */

import { NextRequest, NextResponse } from "next/server"
import { getInventoryHistory } from "@/lib/inventory-db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 })
    }

    const history = await getInventoryHistory(id)

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error: any) {
    console.error("GET /api/inventory/[id]/history error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch history" },
      { status: 500 }
    )
  }
}
