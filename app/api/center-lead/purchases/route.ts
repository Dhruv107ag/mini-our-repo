import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { getCenterPurchases, addCenterPurchase } from "@/lib/center-db"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || undefined
    const category = searchParams.get("category") || undefined
    const status = searchParams.get("status") || undefined
    const item_type = searchParams.get("item_type") || undefined

    const purchases = await getCenterPurchases({ search, category, status, item_type })
    return NextResponse.json({ success: true, purchases })
  } catch (error: any) {
    console.error("GET /api/center-lead/purchases error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to load purchases" }, { status: 500 })
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
      item_name,
      item_type,
      category,
      quantity,
      unit,
      unit_price,
      total_amount,
      vendor_name,
      vendor_contact,
      purchase_date,
      invoice_pdf_url,
      invoice_pdf_name,
      status,
      added_to_inventory,
      remarks,
      part_no,
      location,
    } = body

    if (!item_name?.trim()) {
      return NextResponse.json({ error: "Item Name is required" }, { status: 400 })
    }
    if (!vendor_name?.trim()) {
      return NextResponse.json({ error: "Vendor Name is required" }, { status: 400 })
    }
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 })
    }

    const created = await addCenterPurchase({
      item_name,
      item_type: item_type === "non_consumable" ? "non_consumable" : "consumable",
      category: category || "General",
      quantity: qty,
      unit: unit || "pcs",
      unit_price: Number(unit_price) || 0,
      total_amount: Number(total_amount) || undefined,
      vendor_name,
      vendor_contact,
      purchase_date,
      invoice_pdf_url,
      invoice_pdf_name,
      status: status || "received",
      added_to_inventory: added_to_inventory !== false,
      remarks,
      purchased_by: user.name || "Center Lead",
      center_name: user.department || "Center for Advanced Studies",
      part_no,
      location,
    })

    return NextResponse.json({ success: true, purchase: created }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/center-lead/purchases error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to record purchase" }, { status: 500 })
  }
}
