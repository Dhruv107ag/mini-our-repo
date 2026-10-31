import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { adjustCenterInventoryStock } from "@/lib/center-db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const inventoryId = Number(id)
    if (isNaN(inventoryId)) {
      return NextResponse.json({ error: "Invalid inventory item ID" }, { status: 400 })
    }

    const body = await req.json()
    const { action_type, quantity_change, remark, proof_doc_url, proof_doc_name } = body

    if (!action_type) {
      return NextResponse.json({ error: "Action type is required" }, { status: 400 })
    }
    const delta = Number(quantity_change)
    if (isNaN(delta) || delta <= 0) {
      return NextResponse.json({ error: "Quantity change must be greater than 0" }, { status: 400 })
    }
    if (!remark?.trim()) {
      return NextResponse.json({ error: "Mandatory justification remark is required" }, { status: 400 })
    }

    const updated = await adjustCenterInventoryStock({
      inventory_id: inventoryId,
      action_type,
      quantity_change: delta,
      remark: remark.trim(),
      proof_doc_url,
      proof_doc_name,
      performed_by: user.name || "Center Lead",
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (error: any) {
    console.error("POST /api/center-lead/inventory/[id]/adjust error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to adjust inventory stock" }, { status: 500 })
  }
}
