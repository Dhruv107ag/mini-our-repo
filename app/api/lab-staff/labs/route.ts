/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"

const db = Database.getInstance()

const defaultMockLabs = [
  { id: 1, name: "Computer Lab 1 (CP1)", code: "CP1", department: "Computer Science & Engineering", capacity: 60, location: "Academic Block 1", is_head_staff: 1 },
  { id: 2, name: "Computer Lab 2 (CP2)", code: "CP2", department: "Computer Science & Engineering", capacity: 60, location: "Academic Block 1", is_head_staff: 1 },
  { id: 3, name: "Electronics & Communication Lab", code: "ECE-01", department: "Electronics & Communication", capacity: 45, location: "Academic Block 2", is_head_staff: 1 },
  { id: 4, name: "IoT & Embedded Systems Lab", code: "IOT-01", department: "Electronics & Communication", capacity: 40, location: "Academic Block 2", is_head_staff: 0 },
]

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_staff", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const uid = Number(user.userId)
    
    try {
      // Get labs where user is assigned as staff, prioritizing head staff status if user has both roles
      const rows = await db.query(
        `SELECT DISTINCT
           l.id, 
           l.name, 
           l.code, 
           d.name as department, 
           l.capacity, 
           l.location,
           MAX(CASE WHEN l.staff_id = ? THEN 1 ELSE 0 END) as is_head_staff
         FROM labs l
         LEFT JOIN departments d ON l.department_id = d.id
         LEFT JOIN lab_staff_assignments la ON l.id = la.lab_id AND la.staff_id = ?
         WHERE l.staff_id = ? OR la.staff_id = ?
         GROUP BY l.id, l.name, l.code, d.name, l.capacity, l.location
         ORDER BY l.name`,
        [uid, uid, uid, uid]
      )
      
      const list = rows.rows || []
      if (list.length === 0) {
        return NextResponse.json({ labs: defaultMockLabs })
      }
      return NextResponse.json({ labs: list })
    } catch (dbErr) {
      console.warn("DB offline in lab-staff/labs, returning mock labs:", dbErr)
      return NextResponse.json({ labs: defaultMockLabs })
    }
  } catch (e) {
    console.error("lab-staff/labs GET error:", e)
    return NextResponse.json({ labs: defaultMockLabs })
  }
}
