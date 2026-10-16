/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

const db = Database.getInstance()

export async function GET(_req: NextRequest) {
  try {
    const result = await db.query(`
      SELECT id, name, code 
      FROM departments 
      ORDER BY name ASC
    `)
    return NextResponse.json({ departments: result.rows })
  } catch (error) {
    console.warn("Failed to fetch departments from DB, using fallback mock:", error)
    return NextResponse.json({
      departments: [
        { id: 1, name: "Computer Science & Engineering", code: "CSE" },
        { id: 2, name: "Electronics & Communication", code: "ECE" },
        { id: 3, name: "Mechanical Engineering", code: "ME" },
        { id: 4, name: "Physics Department", code: "PHY" }
      ]
    })
  }
}
