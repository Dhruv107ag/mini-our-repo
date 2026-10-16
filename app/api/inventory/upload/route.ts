/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Inventory File Upload Route Handler (Purchase Invoices & Signed Proof Documents)
 */

import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.resolve(process.cwd(), "public", "uploads", "inventory")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filename = `${Date.now()}_${safeName}`
    const filePath = path.join(uploadDir, filename)

    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/inventory/${filename}`

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error: any) {
    console.error("Inventory upload error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}
