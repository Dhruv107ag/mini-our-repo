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
    if (!user || !hasRole(user, ["hod", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await ensureSchema()

    let query: string
    let params: any[] = []

    if (user.role === 'admin') {
      const { searchParams } = new URL(req.url)
      const deptId = searchParams.get('departmentId')
      if (deptId) {
        query = `SELECT d.id, d.name, d.code, d.hod_id, d.hod_email,
                        d.highest_approval_authority,
                        COALESCE(d.component_highest_approval_authority, 'hod') as component_highest_approval_authority,
                        d.lab_coordinator_id,
                        u_hod.name as hod_name,
                        u_coord.name as lab_coordinator_name,
                        u_coord.email as lab_coordinator_email
                 FROM departments d
                 LEFT JOIN users u_hod ON u_hod.id = d.hod_id
                 LEFT JOIN users u_coord ON u_coord.id = d.lab_coordinator_id
                 WHERE d.id = ?`
        params = [Number(deptId)]
      } else {
        query = `SELECT d.id, d.name, d.code, d.hod_id, d.hod_email,
                        d.highest_approval_authority,
                        COALESCE(d.component_highest_approval_authority, 'hod') as component_highest_approval_authority,
                        d.lab_coordinator_id,
                        u_hod.name as hod_name,
                        u_coord.name as lab_coordinator_name,
                        u_coord.email as lab_coordinator_email
                 FROM departments d
                 LEFT JOIN users u_hod ON u_hod.id = d.hod_id
                 LEFT JOIN users u_coord ON u_coord.id = d.lab_coordinator_id
                 ORDER BY d.name`
      }
    } else {
      // HOD user: fetch their department
      query = `SELECT d.id, d.name, d.code, d.hod_id, d.hod_email,
                      d.highest_approval_authority,
                      COALESCE(d.component_highest_approval_authority, 'hod') as component_highest_approval_authority,
                      d.lab_coordinator_id,
                      u_hod.name as hod_name,
                      u_coord.name as lab_coordinator_name,
                      u_coord.email as lab_coordinator_email
               FROM departments d
               LEFT JOIN users u_hod ON u_hod.id = d.hod_id
               LEFT JOIN users u_coord ON u_coord.id = d.lab_coordinator_id
               WHERE d.hod_id = ? OR LOWER(d.hod_email) = LOWER(?)
               LIMIT 1`
      params = [Number(user.userId), String(user.email || '')]
    }

    const res = await db.query(query, params)
    if (user.role === 'admin' && !new URL(req.url).searchParams.get('departmentId')) {
      return NextResponse.json({ departments: res.rows })
    }

    const dept = res.rows[0]
    if (!dept) {
      return NextResponse.json({ error: "Department not found for current user" }, { status: 404 })
    }

    return NextResponse.json({ department: dept })
  } catch (e) {
    console.error("GET approval-settings error:", e)
    return NextResponse.json({ error: "Failed to fetch approval settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["hod", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await ensureSchema()

    const body = await req.json().catch(() => ({}))
    const { departmentId, component_highest_approval_authority } = body || {}

    const validAuthorities = ['faculty', 'lab_staff', 'lab_coordinator', 'hod']
    if (!validAuthorities.includes(component_highest_approval_authority)) {
      return NextResponse.json({ error: "Invalid approval authority. Must be one of: faculty, lab_staff, lab_coordinator, hod" }, { status: 400 })
    }

    // Determine target department ID
    let targetDeptId: number | null = null
    if (user.role === 'admin') {
      if (!departmentId) {
        return NextResponse.json({ error: "departmentId is required for admin" }, { status: 400 })
      }
      targetDeptId = Number(departmentId)
    } else {
      // Find HOD's department
      const depRes = await db.query(
        `SELECT id FROM departments WHERE hod_id = ? OR LOWER(hod_email) = LOWER(?) LIMIT 1`,
        [Number(user.userId), String(user.email || '')]
      )
      if (!depRes.rows[0]) {
        return NextResponse.json({ error: "Department not found for this HOD" }, { status: 404 })
      }
      targetDeptId = Number(depRes.rows[0].id)
    }

    // Update department setting
    await db.query(
      `UPDATE departments SET component_highest_approval_authority = ? WHERE id = ?`,
      [component_highest_approval_authority, targetDeptId]
    )

    const updated = await db.query(
      `SELECT d.id, d.name, d.code, d.hod_id, d.highest_approval_authority,
              COALESCE(d.component_highest_approval_authority, 'hod') as component_highest_approval_authority,
              d.lab_coordinator_id,
              u_hod.name as hod_name,
              u_coord.name as lab_coordinator_name
       FROM departments d
       LEFT JOIN users u_hod ON u_hod.id = d.hod_id
       LEFT JOIN users u_coord ON u_coord.id = d.lab_coordinator_id
       WHERE d.id = ?`,
      [targetDeptId]
    )

    return NextResponse.json({
      message: "Component issue approval authority updated successfully",
      department: updated.rows[0]
    })
  } catch (e) {
    console.error("POST approval-settings error:", e)
    return NextResponse.json({ error: "Failed to update approval settings" }, { status: 500 })
  }
}
