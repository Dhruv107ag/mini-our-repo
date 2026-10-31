import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { getCenterInventoryItems, addCenterInventoryItem } from "@/lib/center-db"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || undefined
    const category = searchParams.get("category") || undefined
    const item_type = searchParams.get("item_type") || undefined
    const repair_only = searchParams.get("repair_only") === "true"

    const data = await getCenterInventoryItems({ search, category, item_type, repair_only })
    return NextResponse.json({ success: true, ...data })
  } catch (error: any) {
    console.error("GET /api/center-lead/inventory error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to load inventory" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const {
      part_no,
      item_name,
      item_type,
      category,
      total_purchased,
      unit,
      location,
      unit_price,
      purchase_date,
      purchase_no,
      invoice_pdf_url,
      invoice_pdf_name,
      remarks,
    } = body

    if (!part_no?.trim()) {
      return NextResponse.json({ error: "Part Number / ID is required" }, { status: 400 })
    }
    if (!item_name?.trim()) {
      return NextResponse.json({ error: "Item Name is required" }, { status: 400 })
    }

    const item = await addCenterInventoryItem({
      part_no,
      item_name,
      item_type: item_type === "non_consumable" ? "non_consumable" : "consumable",
      category: category || "General",
      total_purchased: Number(total_purchased) || 1,
      unit: unit || "pcs",
      location: location || "Center Storage",
      unit_price: Number(unit_price) || 0,
      purchase_date,
      purchase_no,
      invoice_pdf_url,
      invoice_pdf_name,
      remarks,
      center_name: user.department || "Center for Advanced Studies",
    })

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/center-lead/inventory error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to add inventory item" }, { status: 500 })
  }
}
