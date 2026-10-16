/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Inventory Main API Route (GET, POST)
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { getInventoryItems, addInventoryItem } from "@/lib/inventory-db"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type") || "all"
    const labIdParam = searchParams.get("lab_id")
    const search = searchParams.get("search") || ""

    const lab_id = labIdParam && !isNaN(Number(labIdParam)) ? Number(labIdParam) : undefined

    const { items, stats } = await getInventoryItems({
      type: type === "all" ? undefined : type,
      lab_id,
      search,
    })

    return NextResponse.json({
      success: true,
      items,
      stats,
    })
  } catch (error: any) {
    console.error("GET /api/inventory error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    // Both lab_staff, admin, hod, and lab_coordinator can manage inventory
    if (user && !hasRole(user, ["lab_staff", "admin", "hod", "lab_coordinator"])) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const {
      lab_id,
      lab_name,
      part_no,
      item_name,
      item_type,
      category,
      purchase_quantity,
      unit,
      purchase_date,
      purchase_pdf_url,
      purchase_pdf_name,
      remarks,
    } = body || {}

    if (!part_no || !String(part_no).trim()) {
      return NextResponse.json({ error: "Part Number / ID is required" }, { status: 400 })
    }
    if (!item_name || !String(item_name).trim()) {
      return NextResponse.json({ error: "Item Name is required" }, { status: 400 })
    }
    const qty = Number(purchase_quantity)
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json({ error: "Purchase quantity must be 0 or greater" }, { status: 400 })
    }

    const type = item_type === "non_consumable" ? "non_consumable" : "consumable"

    const newItem = await addInventoryItem({
      lab_id: Number(lab_id) || 1,
      lab_name: lab_name || "General Lab",
      part_no: String(part_no).trim(),
      item_name: String(item_name).trim(),
      item_type: type,
      category: category ? String(category).trim() : "General",
      purchase_quantity: qty,
      unit: unit ? String(unit).trim() : "pcs",
      purchase_date,
      purchase_pdf_url: purchase_pdf_url || null,
      purchase_pdf_name: purchase_pdf_name || null,
      remarks: remarks || null,
      user_id: user?.userId,
      user_name: user?.name || "Lab Administrator",
    })

    return NextResponse.json({ success: true, item: newItem }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/inventory error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create inventory item" },
      { status: 500 }
    )
  }
}
