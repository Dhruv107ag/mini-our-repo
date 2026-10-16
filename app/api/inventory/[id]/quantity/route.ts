/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Inventory Quantity Update Route Handler
 * Strictly enforces: Negative adjustments / deductions require Remark + Signed Proof Document!
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { updateInventoryQuantity } from "@/lib/inventory-db"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(req)
    if (user && !hasRole(user, ["lab_staff", "admin", "hod", "lab_coordinator"])) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
    }

    const { id: rawId } = await params
    const id = Number(rawId)
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid inventory ID" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const {
      action_type,
      quantity,
      remark,
      proof_doc_url,
      proof_doc_name,
      purchase_pdf_url,
      purchase_pdf_name,
    } = body || {}

    const validActions = ["purchase_add", "consumed", "condemned", "stock_adjustment"]
    if (!action_type || !validActions.includes(action_type)) {
      return NextResponse.json(
        { error: `Invalid action_type. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      )
    }

    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a valid positive number" },
        { status: 400 }
      )
    }

    const isReduction =
      action_type === "consumed" ||
      action_type === "condemned" ||
      action_type === "stock_adjustment"

    // STRICT VALIDATION AS REQUESTED:
    // If quantity is reduced, remark and signed proof document are required!
    if (isReduction) {
      if (!remark || String(remark).trim().length < 3) {
        return NextResponse.json(
          {
            error:
              "Remark is strictly required when reducing inventory quantity. Please state the reason for deduction.",
          },
          { status: 400 }
        )
      }
      if (!proof_doc_url || !String(proof_doc_url).trim()) {
        return NextResponse.json(
          {
            error:
              "Signed proof document is strictly required when reducing inventory quantity. Please upload a signed requisition or inspection document.",
          },
          { status: 400 }
        )
      }
    }

    const result = await updateInventoryQuantity(id, {
      action_type,
      quantity: qty,
      remark: String(remark || "").trim(),
      proof_doc_url: proof_doc_url || null,
      proof_doc_name: proof_doc_name || null,
      purchase_pdf_url: purchase_pdf_url || null,
      purchase_pdf_name: purchase_pdf_name || null,
      user_id: user?.userId,
      user_name: user?.name || "Lab Administrator",
      user_role: user?.role || "lab_staff",
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("PATCH /api/inventory/[id]/quantity error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update quantity" },
      { status: 400 }
    )
  }
}
