import { NextRequest, NextResponse } from "next/server"
import { Database, dbOperations } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"
import { sendEmail, emailTemplates } from "@/lib/notifications"
import { logComponentActivity, getUserInfoForLogging } from "@/lib/activity-logger"

const db = Database.getInstance()

async function ensureSchema() {
  await dbOperations.runLightMigrations()
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["lab_coordinator", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await ensureSchema()
    const { id } = await params
    const requestId = Number(id)
    if (!requestId) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '').toLowerCase()
    const remarks = String(body?.remarks || '') || null

    const r = await db.query(
      `SELECT r.*, l.name as lab_name, l.department_id,
              d.name as department_name, d.hod_id, d.hod_email,
              d.lab_coordinator_id,
              COALESCE(d.component_highest_approval_authority, 'hod') as component_highest_approval_authority,
              hod.name as hod_name, hod.salutation as hod_salutation
       FROM component_requests r
       JOIN labs l ON l.id = r.lab_id
       LEFT JOIN departments d ON d.id = l.department_id
       LEFT JOIN users hod ON hod.id = d.hod_id
       WHERE r.id = ?`,
      [requestId]
    )
    const request = r.rows[0]
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 })

    // Check permissions
    if (user.role !== 'admin') {
      if (Number(request.lab_coordinator_id) !== Number(user.userId)) {
        return NextResponse.json({ error: "Only the assigned Lab Coordinator can act on this request" }, { status: 403 })
      }
      if (String(request.status) !== 'pending_lab_coordinator') {
        return NextResponse.json({ error: "Action not allowed in current status" }, { status: 400 })
      }
    }

    if (action === 'approve') {
      const isFinal = request.component_highest_approval_authority === 'lab_coordinator'
      const nextStatus = isFinal ? 'approved' : 'pending_hod'
      const finalRole = isFinal ? 'lab_coordinator' : null

      await db.query(
        `UPDATE component_requests
         SET status = ?, lab_coordinator_approver_id = ?, lab_coordinator_approved_at = NOW(),
             lab_coordinator_remarks = ?, final_approver_role = COALESCE(?, final_approver_role)
         WHERE id = ? AND status = 'pending_lab_coordinator'`,
        [nextStatus, Number(user.userId), remarks, finalRole, requestId]
      )

      // Details for email
      const details = await db.query(
        `SELECT r.*, l.name as lab_name, l.staff_id as lab_staff_id,
                u.name as requester_name, u.email as requester_email, u.salutation as requester_salutation,
                coord.name as coordinator_name, coord.salutation as coordinator_salutation,
                ls.name as lab_staff_name, ls.email as lab_staff_email, ls.salutation as lab_staff_salutation,
                hod.name as hod_name, hod.email as hod_email, hod.salutation as hod_salutation
         FROM component_requests r
         JOIN labs l ON l.id = r.lab_id
         JOIN users u ON u.id = r.requester_id
         LEFT JOIN users coord ON coord.id = ?
         LEFT JOIN users ls ON ls.id = l.staff_id
         LEFT JOIN departments d ON d.id = l.department_id
         LEFT JOIN users hod ON hod.id = d.hod_id
         WHERE r.id = ?`,
        [Number(user.userId), requestId]
      )
      const reqDetails = details.rows[0]

      const itemsDetails = await db.query(
        `SELECT c.name, cri.quantity_requested as quantity
         FROM component_request_items cri
         JOIN components c ON c.id = cri.component_id
         WHERE cri.request_id = ?`,
        [requestId]
      )

      if (nextStatus === 'pending_hod' && (request.hod_email || reqDetails?.hod_email)) {
        // Forwarding email to HOD
        const targetHodEmail = request.hod_email || reqDetails?.hod_email
        const emailData = emailTemplates.componentRequestForwarded({
          recipientRole: 'HOD',
          recipientName: reqDetails?.hod_name || request.hod_name || '',
          recipientSalutation: reqDetails?.hod_salutation || request.hod_salutation || 'none',
          requesterName: reqDetails?.requester_name,
          requesterSalutation: reqDetails?.requester_salutation,
          requesterRole: reqDetails?.initiator_role === 'faculty' ? 'Faculty' : 'Student',
          approverName: reqDetails?.coordinator_name || 'Lab Coordinator',
          approverSalutation: reqDetails?.coordinator_salutation || 'none',
          approverRole: 'Lab Coordinator',
          labName: reqDetails?.lab_name,
          purpose: reqDetails?.purpose || 'Not specified',
          items: itemsDetails.rows,
          returnDate: reqDetails?.return_date,
          requestId: requestId
        })
        await sendEmail({ to: targetHodEmail, ...emailData }).catch(err => console.error('Email failed:', err))
      }

      // Log activity
      const userInfo = await getUserInfoForLogging(user.userId)
      const sel = await db.query(`SELECT * FROM component_requests WHERE id = ?`, [requestId])
      if (sel.rows.length > 0) {
        logComponentActivity({
          entityType: 'component_request',
          entityId: requestId,
          labId: Number(request.lab_id),
          actorUserId: userInfo?.userId || null,
          actorName: userInfo?.name || null,
          actorEmail: userInfo?.email || null,
          actorRole: 'lab_coordinator',
          action: isFinal ? 'approved_by_lab_coordinator' : 'recommended_by_lab_coordinator',
          actionDescription: isFinal 
            ? `Final approval granted by Lab Coordinator (${remarks || 'No remarks'})`
            : `Recommended and forwarded to HOD by Lab Coordinator (${remarks || 'No remarks'})`,
          entitySnapshot: { ...sel.rows[0], items: itemsDetails.rows },
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
          userAgent: req.headers.get("user-agent") || null,
        }).catch(err => console.error("Activity logging failed:", err))
      }

      return NextResponse.json({ request: sel.rows[0] })
    }

    if (action === 'reject') {
      await db.query(
        `UPDATE component_requests
         SET status = 'rejected', rejected_by_id = ?, rejected_at = NOW(),
             rejection_reason = ?, lab_coordinator_remarks = COALESCE(lab_coordinator_remarks, ?),
             final_approver_role = 'lab_coordinator'
         WHERE id = ? AND status = 'pending_lab_coordinator'`,
        [Number(user.userId), remarks, remarks, requestId]
      )

      // Send rejection email to student
      const details = await db.query(
        `SELECT r.*, l.name as lab_name,
                u.name as requester_name, u.email as requester_email, u.salutation as requester_salutation,
                coord.name as coordinator_name, coord.salutation as coordinator_salutation
         FROM component_requests r
         JOIN labs l ON l.id = r.lab_id
         JOIN users u ON u.id = r.requester_id
         LEFT JOIN users coord ON coord.id = ?
         WHERE r.id = ?`,
        [Number(user.userId), requestId]
      )
      const reqDetails = details.rows[0]

      if (reqDetails && reqDetails.requester_email) {
        const itemsDetails = await db.query(
          `SELECT c.name, cri.quantity_requested as quantity
           FROM component_request_items cri
           JOIN components c ON c.id = cri.component_id
           WHERE cri.request_id = ?`,
          [requestId]
        )

        const emailData = emailTemplates.componentRequestRejected({
          requesterName: reqDetails.requester_name,
          rejecterName: reqDetails.coordinator_name || 'Lab Coordinator',
          rejecterRole: 'Lab Coordinator',
          labName: reqDetails.lab_name,
          requestId: requestId,
          reason: remarks || 'No reason provided'
        })
        await sendEmail({ to: reqDetails.requester_email, ...emailData }).catch(err => console.error('Email failed:', err))
      }

      const sel = await db.query(`SELECT * FROM component_requests WHERE id = ?`, [requestId])
      return NextResponse.json({ request: sel.rows[0] })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (e) {
    console.error("lab-coordinator component-requests action error:", e)
    return NextResponse.json({ error: "Failed to process request action" }, { status: 500 })
  }
}
