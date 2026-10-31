/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"
import { MOCK_LABS } from "@/lib/admin-mock-data"

const db = Database.getInstance()

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || !hasRole(user, ["others", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
      // Get all labs
      const result = await db.query(
        `SELECT id, name, code, department_id, capacity, location 
         FROM labs 
         ORDER BY name`
      )

      return NextResponse.json({ labs: result.rows || [] })
    } catch (dbErr) {
      console.warn("DB offline in others/labs, returning mock labs:", dbErr)
      const fallback = MOCK_LABS.map(l => ({
        id: l.id,
        name: l.name,
        code: l.code,
        department_id: l.department_id,
        capacity: l.capacity,
        location: l.location
      }))
      return NextResponse.json({ labs: fallback })
    }
  } catch (error) {
    console.error("Failed to fetch labs:", error)
    return NextResponse.json({ labs: MOCK_LABS })
  }
}
