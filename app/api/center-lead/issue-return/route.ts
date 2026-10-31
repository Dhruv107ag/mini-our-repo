import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { getCenterIssues, createCenterIssue } from "@/lib/center-db"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["center_lead", "admin"])) {
      return NextResponse.json({ error: "Forbidden: Center Lead or Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || undefined
    const status = searchParams.get("status") || undefined

    const issues = await getCenterIssues({ search, status })
    return NextResponse.json({ success: true, issues })
  } catch (error: any) {
    console.error("GET /api/center-lead/issue-return error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to load issues" }, { status: 500 })
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
      inventory_id,
      quantity,
      issued_to_name,
      issued_to_email,
      issued_to_role,
      issued_to_id,
      department,
      expected_return_date,
      purpose,
      remarks,
    } = body

    if (!inventory_id) {
      return NextResponse.json({ error: "Please select an inventory item" }, { status: 400 })
    }
    if (!issued_to_name?.trim()) {
      return NextResponse.json({ error: "Requester name is required" }, { status: 400 })
    }
    if (!issued_to_email?.trim() || !issued_to_email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    const issue = await createCenterIssue({
      inventory_id: Number(inventory_id),
      quantity: qty,
      issued_to_name,
      issued_to_email,
      issued_to_role,
      issued_to_id,
      department,
      expected_return_date,
      purpose,
      remarks,
      issued_by_name: user.name || "Center Lead",
    })

    return NextResponse.json({ success: true, issue }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/center-lead/issue-return error:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to create issue" }, { status: 500 })
  }
}
