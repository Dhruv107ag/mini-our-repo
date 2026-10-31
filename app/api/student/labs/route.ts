/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { MOCK_LABS } from "@/lib/admin-mock-data"

const db = Database.getInstance()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("department_id")
    try {
      let rows
      if (departmentId) {
        rows = (await db.query(
          `SELECT id, name, code, department_id, capacity, location FROM labs WHERE department_id = ? ORDER BY name ASC`,
          [departmentId]
        )).rows
      } else {
        rows = (await db.query(
          `SELECT id, name, code, department_id, capacity, location FROM labs ORDER BY name ASC`
        )).rows
      }
      return NextResponse.json({ labs: rows || [] })
    } catch (dbErr) {
      console.warn("DB offline in student/labs, returning mock labs:", dbErr)
      let fallback = MOCK_LABS.map(l => ({
        id: l.id,
        name: l.name,
        code: l.code,
        department_id: l.department_id,
        capacity: l.capacity,
        location: l.location
      }))
      if (departmentId) {
        fallback = fallback.filter(l => String(l.department_id) === String(departmentId))
      }
      return NextResponse.json({ labs: fallback })
    }
  } catch (error) {
    console.error("Failed to fetch labs:", error)
    return NextResponse.json({ labs: MOCK_LABS })
  }
}
