/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Inventory Item Detail and Delete API Route
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { getInventoryItemById, deleteInventoryItem } from "@/lib/inventory-db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 })
    }

    const item = await getInventoryItemById(id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error("GET /api/inventory/[id] error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch item" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(req)
    if (user && !hasRole(user, ["lab_staff", "admin", "hod"])) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
    }

    const { id: rawId } = await params
    const id = Number(rawId)
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 })
    }

    await deleteInventoryItem(id)
    return NextResponse.json({ success: true, message: "Item deleted successfully" })
  } catch (error: any) {
    console.error("DELETE /api/inventory/[id] error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete item" },
      { status: 500 }
    )
  }
}
