import { NextRequest, NextResponse } from "next/server"
import { Database, dbOperations } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"

const db = Database.getInstance()

async function ensureSchema() {
  await dbOperations.runLightMigrations()
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_coordinator", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await ensureSchema()

    let rows: { rows: any[] } = { rows: [] }

    if (user.role === 'admin') {
      rows = await db.query(
        `SELECT r.*, l.name AS lab_name, ureq.name AS requester_name, ureq.email AS requester_email,
                ureq.salutation AS requester_salutation,
                uf.name AS mentor_faculty_name,
                ul.name AS lab_staff_name,
                d.name AS department_name,
                d.highest_approval_authority,
                COALESCE(d.component_highest_approval_authority, 'hod') AS component_highest_approval_authority
         FROM component_requests r
         JOIN labs l ON l.id = r.lab_id
         LEFT JOIN departments d ON d.id = l.department_id
         JOIN users ureq ON ureq.id = r.requester_id
         LEFT JOIN users uf ON uf.id = r.mentor_faculty_id
         LEFT JOIN users ul ON ul.id = r.lab_staff_approver_id
         ORDER BY r.created_at DESC`
      )
    } else {
      // Find departments where current user is lab coordinator
      const depRes = await db.query(
        `SELECT id FROM departments WHERE lab_coordinator_id = ?`,
        [Number(user.userId)]
      )
      const depIds: number[] = depRes.rows.map((d: any) => Number(d.id))
      if (depIds.length === 0) {
        return NextResponse.json({ requests: [] })
      }

      const labsRes = await db.query(
        `SELECT id FROM labs WHERE department_id IN (${depIds.map(() => '?').join(',')})`,
        depIds
      )
      const labIds: number[] = labsRes.rows.map((r: any) => Number(r.id))
      if (labIds.length === 0) {
        return NextResponse.json({ requests: [] })
      }

      const placeholders = labIds.map(() => '?').join(',')
      rows = await db.query(
        `SELECT r.*, l.name AS lab_name, ureq.name AS requester_name, ureq.email AS requester_email,
                ureq.salutation AS requester_salutation,
                uf.name AS mentor_faculty_name,
                ul.name AS lab_staff_name,
                d.name AS department_name,
                d.highest_approval_authority,
                COALESCE(d.component_highest_approval_authority, 'hod') AS component_highest_approval_authority
         FROM component_requests r
         JOIN labs l ON l.id = r.lab_id
         LEFT JOIN departments d ON d.id = l.department_id
         JOIN users ureq ON ureq.id = r.requester_id
         LEFT JOIN users uf ON uf.id = r.mentor_faculty_id
         LEFT JOIN users ul ON ul.id = r.lab_staff_approver_id
         WHERE r.lab_id IN (${placeholders})
         ORDER BY r.created_at DESC`,
        labIds
      )
    }

    const reqIds = rows.rows.map((r: any) => r.id)
    let itemsByReq = new Map<number, any[]>()
    if (reqIds.length > 0) {
      const placeholders = reqIds.map(() => '?').join(',')
      const items = await db.query(
        `SELECT i.*, c.name AS component_name, c.model, c.category
         FROM component_request_items i
         JOIN components c ON c.id = i.component_id
         WHERE i.request_id IN (${placeholders})`,
        reqIds
      )
      for (const it of items.rows) {
        const arr = itemsByReq.get(Number(it.request_id)) || []
        arr.push(it)
        itemsByReq.set(Number(it.request_id), arr)
      }
    }

    const out = rows.rows.map((r: any) => ({ ...r, items: itemsByReq.get(Number(r.id)) || [] }))
    return NextResponse.json({ requests: out })
  } catch (e) {
    console.error("lab-coordinator component-requests GET error:", e)
    return NextResponse.json({ error: "Failed to list component requests" }, { status: 500 })
  }
}
