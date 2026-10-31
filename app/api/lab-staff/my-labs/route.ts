/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"
import { MOCK_LABS } from "@/lib/admin-mock-data"

const db = Database.getInstance()

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const uid = Number(user.userId)
    try {
      // Labs where user is head OR assigned (deduped)
      const rows = await db.query(
        `(
           SELECT l.id, l.name, l.location
           FROM labs l
           WHERE l.staff_id = ?
         )
         UNION
         (
           SELECT l.id, l.name, l.location
           FROM lab_staff_assignments la
           JOIN labs l ON l.id = la.lab_id
           WHERE la.staff_id = ?
         )
         ORDER BY name`,
        [uid, uid]
      )
      return NextResponse.json({ labs: rows.rows || [] })
    } catch (dbErr) {
      console.warn("DB offline in my-labs, returning mock labs:", dbErr)
      const fallback = MOCK_LABS.map(l => ({
        id: l.id,
        name: l.name,
        location: l.location
      }))
      return NextResponse.json({ labs: fallback })
    }
  } catch (e) {
    console.error("my-labs GET error:", e)
    const fallback = MOCK_LABS.map(l => ({
      id: l.id,
      name: l.name,
      location: l.location
    }))
    return NextResponse.json({ labs: fallback })
  }
}
