/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Inter-Lab Component Transfer & Requisition Service:
 * Allows one lab staff member to request components/equipment from another lab staff,
 * sends 1-to-1 notifications, and handles approval confirmations.
 */

import { Database } from "@/lib/database"
import { sendEmail, emailTemplates } from "@/lib/notifications"

const db = Database.getInstance()

export interface InterLabRequestRecord {
  id: number
  from_lab_id: number
  from_lab_name: string
  from_staff_id: number
  from_staff_name: string
  from_staff_email: string
  to_lab_id: number
  to_lab_name: string
  to_staff_id: number
  to_staff_name: string
  to_staff_email: string
  component_id?: number | null
  item_name: string
  quantity: number
  purpose: string
  needed_by_date?: string | null
  expected_return_date?: string | null
  status: "pending" | "approved" | "rejected" | "returned"
  approver_remarks?: string | null
  action_at?: string | null
  created_at: string
  updated_at: string
}

export async function ensureInterLabSchema(): Promise<void> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS inter_lab_component_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_lab_id INT NOT NULL,
        from_staff_id INT NOT NULL,
        to_lab_id INT NOT NULL,
        to_staff_id INT NOT NULL,
        component_id INT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        purpose TEXT NOT NULL,
        needed_by_date DATE NULL,
        expected_return_date DATE NULL,
        status ENUM('pending', 'approved', 'rejected', 'returned') NOT NULL DEFAULT 'pending',
        approver_remarks TEXT NULL,
        action_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_from_staff (from_staff_id),
        INDEX idx_to_staff (to_staff_id),
        INDEX idx_to_lab (to_lab_id),
        INDEX idx_status (status)
      )
    `)
  } catch (err) {
    console.warn("Schema initialization for inter-lab requests:", err)
  }
}

// In-memory fallback store for demo & offline mode
let fallbackRequests: InterLabRequestRecord[] = [
  {
    id: 1,
    from_lab_id: 1,
    from_lab_name: "Electronics & Hardware Lab",
    from_staff_id: 4, // staff@lnmiit.ac.in
    from_staff_name: "Lab Staff User",
    from_staff_email: "staff@lnmiit.ac.in",
    to_lab_id: 2,
    to_lab_name: "IoT & Embedded Systems Lab",
    to_staff_id: 5, // jane.smith@lnmiit.ac.in
    to_staff_name: "Jane Smith",
    to_staff_email: "jane.smith@lnmiit.ac.in",
    item_name: "Logic Analyzer 16-Channel",
    quantity: 2,
    purpose: "Needed for ECE-302 Microprocessor Lab session testbench setup",
    needed_by_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    expected_return_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "approved",
    approver_remarks: "Approved. Items tested and kept ready on shelf B4.",
    action_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    from_lab_id: 2,
    from_lab_name: "IoT & Embedded Systems Lab",
    from_staff_id: 5, // jane.smith@lnmiit.ac.in
    from_staff_name: "Jane Smith",
    from_staff_email: "jane.smith@lnmiit.ac.in",
    to_lab_id: 1,
    to_lab_name: "Electronics & Hardware Lab",
    to_staff_id: 4, // staff@lnmiit.ac.in
    to_staff_name: "Lab Staff User",
    to_staff_email: "staff@lnmiit.ac.in",
    item_name: "High-Precision Digital Multimeter (Fluke 87V)",
    quantity: 1,
    purpose: "Battery impedance measurement calibration for ongoing IoT sensors project",
    needed_by_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    expected_return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "pending",
    approver_remarks: null,
    action_at: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45m ago
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
]

let nextId = 3

/**
 * Fetch inter-lab requests categorized as incoming and outgoing for a specific staff member
 */
export async function getInterLabRequestsForStaff(staffId: number) {
  await ensureInterLabSchema()

  let incoming: InterLabRequestRecord[] = []
  let outgoing: InterLabRequestRecord[] = []
  let myLabs: Array<{ id: number; name: string }> = []
  let availableTargetLabs: Array<{ id: number; name: string; staff_id: number; staff_name: string }> = []

  // 1. Fetch labs assigned to this staff member
  try {
    const myLabsRes = await db.query(
      `(SELECT id, name FROM labs WHERE staff_id = ?)
       UNION
       (SELECT l.id, l.name FROM lab_staff_assignments la JOIN labs l ON l.id = la.lab_id WHERE la.staff_id = ?)
       ORDER BY name`,
      [staffId, staffId]
    )
    if (myLabsRes.rows && myLabsRes.rows.length > 0) {
      myLabs = myLabsRes.rows.map((r: any) => ({ id: Number(r.id), name: r.name }))
    }
  } catch (e) {}

  if (myLabs.length === 0) {
    if (staffId === 4) {
      myLabs = [
        { id: 1, name: "Electronics & Hardware Lab" },
        { id: 3, name: "Robotics & Automation Lab" },
      ]
    } else {
      myLabs = [{ id: 2, name: "IoT & Embedded Systems Lab" }]
    }
  }

  // 2. Fetch other labs available to request from
  try {
    const otherLabsRes = await db.query(
      `SELECT l.id, l.name, l.staff_id, COALESCE(u.name, 'Assigned Lab Staff') as staff_name 
       FROM labs l 
       LEFT JOIN users u ON u.id = l.staff_id 
       WHERE l.is_active = 1 AND (l.staff_id != ? OR l.staff_id IS NULL)
       ORDER BY l.name`,
      [staffId]
    )
    if (otherLabsRes.rows && otherLabsRes.rows.length > 0) {
      availableTargetLabs = otherLabsRes.rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        staff_id: Number(r.staff_id) || 4,
        staff_name: r.staff_name,
      }))
    }
  } catch (e) {}

  if (availableTargetLabs.length === 0) {
    if (staffId === 4) {
      availableTargetLabs = [
        { id: 2, name: "IoT & Embedded Systems Lab", staff_id: 5, staff_name: "Jane Smith" },
      ]
    } else {
      availableTargetLabs = [
        { id: 1, name: "Electronics & Hardware Lab", staff_id: 4, staff_name: "Lab Staff User" },
        { id: 3, name: "Robotics & Automation Lab", staff_id: 4, staff_name: "Lab Staff User" },
      ]
    }
  }

  // 3. Query DB for incoming and outgoing
  try {
    const res = await db.query(`
      SELECT 
        r.*,
        fl.name AS from_lab_name,
        tl.name AS to_lab_name,
        fs.name AS from_staff_name,
        fs.email AS from_staff_email,
        ts.name AS to_staff_name,
        ts.email AS to_staff_email
      FROM inter_lab_component_requests r
      JOIN labs fl ON fl.id = r.from_lab_id
      JOIN labs tl ON tl.id = r.to_lab_id
      JOIN users fs ON fs.id = r.from_staff_id
      JOIN users ts ON ts.id = r.to_staff_id
      WHERE r.from_staff_id = ? OR r.to_staff_id = ?
      ORDER BY r.created_at DESC
    `, [staffId, staffId])

    if (res.rows && res.rows.length > 0) {
      for (const row of res.rows) {
        const item: InterLabRequestRecord = {
          id: Number(row.id),
          from_lab_id: Number(row.from_lab_id),
          from_lab_name: row.from_lab_name,
          from_staff_id: Number(row.from_staff_id),
          from_staff_name: row.from_staff_name,
          from_staff_email: row.from_staff_email,
          to_lab_id: Number(row.to_lab_id),
          to_lab_name: row.to_lab_name,
          to_staff_id: Number(row.to_staff_id),
          to_staff_name: row.to_staff_name,
          to_staff_email: row.to_staff_email,
          component_id: row.component_id ? Number(row.component_id) : null,
          item_name: row.item_name,
          quantity: Number(row.quantity) || 1,
          purpose: row.purpose,
          needed_by_date: row.needed_by_date ? String(row.needed_by_date).split("T")[0] : null,
          expected_return_date: row.expected_return_date ? String(row.expected_return_date).split("T")[0] : null,
          status: row.status,
          approver_remarks: row.approver_remarks,
          action_at: row.action_at ? new Date(row.action_at).toISOString() : null,
          created_at: new Date(row.created_at).toISOString(),
          updated_at: new Date(row.updated_at).toISOString(),
        }

        if (item.to_staff_id === staffId) {
          incoming.push(item)
        } else if (item.from_staff_id === staffId) {
          outgoing.push(item)
        }
      }

      return { incoming, outgoing, myLabs, availableTargetLabs }
    }
  } catch (e) {
    console.warn("Could not query inter_lab_component_requests from DB:", e)
  }

  // Fallback to in-memory store
  incoming = fallbackRequests.filter((r) => r.to_staff_id === staffId)
  outgoing = fallbackRequests.filter((r) => r.from_staff_id === staffId)

  return { incoming, outgoing, myLabs, availableTargetLabs }
}

/**
 * Create a new inter-lab component requisition request.
 * Notifies ONLY the designated staff member of the target lab.
 */
export async function createInterLabRequest(data: {
  fromStaffId: number
  fromLabId: number
  toLabId: number
  itemName: string
  quantity: number
  purpose: string
  neededByDate?: string
  expectedReturnDate?: string
}): Promise<InterLabRequestRecord> {
  await ensureInterLabSchema()

  // 1. Resolve Target Lab and its Unique Staff in-charge
  let toStaffId = 4
  let toStaffName = "Lab Staff User"
  let toStaffEmail = "staff@lnmiit.ac.in"
  let toLabName = "Target Laboratory"
  let fromLabName = "My Laboratory"
  let fromStaffName = "Requesting Staff"
  let fromStaffEmail = "staff@lnmiit.ac.in"

  try {
    const toLabRes = await db.query(
      `SELECT l.name as lab_name, l.staff_id, u.name as staff_name, u.email as staff_email 
       FROM labs l 
       LEFT JOIN users u ON u.id = l.staff_id 
       WHERE l.id = ? LIMIT 1`,
      [data.toLabId]
    )
    if (toLabRes.rows && toLabRes.rows.length > 0) {
      toLabName = toLabRes.rows[0].lab_name
      toStaffId = Number(toLabRes.rows[0].staff_id) || 4
      toStaffName = toLabRes.rows[0].staff_name || "Assigned Staff"
      toStaffEmail = toLabRes.rows[0].staff_email || "staff@lnmiit.ac.in"
    }

    const fromRes = await db.query(
      `SELECT l.name as lab_name, u.name as staff_name, u.email as staff_email 
       FROM labs l 
       CROSS JOIN users u 
       WHERE l.id = ? AND u.id = ? LIMIT 1`,
      [data.fromLabId, data.fromStaffId]
    )
    if (fromRes.rows && fromRes.rows.length > 0) {
      fromLabName = fromRes.rows[0].lab_name
      fromStaffName = fromRes.rows[0].staff_name
      fromStaffEmail = fromRes.rows[0].staff_email
    }
  } catch (e) {
    // Fallback mappings if DB is offline
    if (data.toLabId === 2) {
      toStaffId = 5
      toStaffName = "Jane Smith"
      toStaffEmail = "jane.smith@lnmiit.ac.in"
      toLabName = "IoT & Embedded Systems Lab"
    } else {
      toStaffId = 4
      toStaffName = "Lab Staff User"
      toStaffEmail = "staff@lnmiit.ac.in"
      toLabName = "Electronics & Hardware Lab"
    }
    if (data.fromStaffId === 5) {
      fromStaffName = "Jane Smith"
      fromStaffEmail = "jane.smith@lnmiit.ac.in"
      fromLabName = "IoT & Embedded Systems Lab"
    } else {
      fromStaffName = "Lab Staff User"
      fromStaffEmail = "staff@lnmiit.ac.in"
      fromLabName = "Electronics & Hardware Lab"
    }
  }

  let createdId = nextId++
  try {
    const insertRes = await db.query(
      `INSERT INTO inter_lab_component_requests 
       (from_lab_id, from_staff_id, to_lab_id, to_staff_id, item_name, quantity, purpose, needed_by_date, expected_return_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        data.fromLabId,
        data.fromStaffId,
        data.toLabId,
        toStaffId,
        data.itemName,
        data.quantity,
        data.purpose,
        data.neededByDate || null,
        data.expectedReturnDate || null,
      ]
    )
    if (insertRes.insertId) {
      createdId = insertRes.insertId
    }
  } catch (e) {
    console.warn("Could not insert into inter_lab_component_requests in DB:", e)
  }

  const record: InterLabRequestRecord = {
    id: createdId,
    from_lab_id: data.fromLabId,
    from_lab_name: fromLabName,
    from_staff_id: data.fromStaffId,
    from_staff_name: fromStaffName,
    from_staff_email: fromStaffEmail,
    to_lab_id: data.toLabId,
    to_lab_name: toLabName,
    to_staff_id: toStaffId,
    to_staff_name: toStaffName,
    to_staff_email: toStaffEmail,
    item_name: data.itemName,
    quantity: data.quantity,
    purpose: data.purpose,
    needed_by_date: data.neededByDate || null,
    expected_return_date: data.expectedReturnDate || null,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  fallbackRequests.unshift(record)

  // 2. DISPATCH NOTIFICATION TO TARGET LAB STAFF ONLY
  const notifTitle = `📦 Inter-Lab Request: ${fromLabName} requests ${data.itemName}`
  const notifMessage = `${fromStaffName} from ${fromLabName} has requested ${data.quantity}x "${data.itemName}" for: ${data.purpose}. Click to review & approve.`

  try {
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'warning')`,
      [toStaffId, notifTitle, notifMessage]
    )
  } catch (e) {}

  // 3. Email Notification to Target Staff
  if (emailTemplates.interLabRequestCreated) {
    const mailContent = emailTemplates.interLabRequestCreated({
      toStaffName,
      fromStaffName,
      fromLabName,
      toLabName,
      itemName: data.itemName,
      quantity: data.quantity,
      purpose: data.purpose,
      neededByDate: data.neededByDate,
      expectedReturnDate: data.expectedReturnDate,
      requestId: createdId,
    })

    await sendEmail({
      to: toStaffEmail,
      subject: mailContent.subject,
      html: mailContent.html,
    }).catch(() => {})
  }

  return record
}

/**
 * Approve or Reject an incoming inter-lab requisition.
 * Notifies the requesting staff member that their request is confirmed/declined.
 */
export async function approveOrRejectInterLabRequest(params: {
  requestId: number
  staffId: number // Must match to_staff_id
  action: "approve" | "reject"
  remarks?: string
}): Promise<{ success: boolean; request: InterLabRequestRecord; message: string }> {
  await ensureInterLabSchema()

  // 1. Fetch current request
  let reqRecord: InterLabRequestRecord | null = null

  try {
    const queryRes = await db.query(
      `SELECT 
         r.*,
         fl.name AS from_lab_name,
         tl.name AS to_lab_name,
         fs.name AS from_staff_name,
         fs.email AS from_staff_email,
         ts.name AS to_staff_name,
         ts.email AS to_staff_email
       FROM inter_lab_component_requests r
       JOIN labs fl ON fl.id = r.from_lab_id
       JOIN labs tl ON tl.id = r.to_lab_id
       JOIN users fs ON fs.id = r.from_staff_id
       JOIN users ts ON ts.id = r.to_staff_id
       WHERE r.id = ? LIMIT 1`,
      [params.requestId]
    )
    if (queryRes.rows && queryRes.rows.length > 0) {
      const row = queryRes.rows[0]
      reqRecord = {
        id: Number(row.id),
        from_lab_id: Number(row.from_lab_id),
        from_lab_name: row.from_lab_name,
        from_staff_id: Number(row.from_staff_id),
        from_staff_name: row.from_staff_name,
        from_staff_email: row.from_staff_email,
        to_lab_id: Number(row.to_lab_id),
        to_lab_name: row.to_lab_name,
        to_staff_id: Number(row.to_staff_id),
        to_staff_name: row.to_staff_name,
        to_staff_email: row.to_staff_email,
        item_name: row.item_name,
        quantity: Number(row.quantity),
        purpose: row.purpose,
        needed_by_date: row.needed_by_date,
        expected_return_date: row.expected_return_date,
        status: row.status,
        approver_remarks: row.approver_remarks,
        action_at: row.action_at,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      }
    }
  } catch (e) {}

  if (!reqRecord) {
    const found = fallbackRequests.find((r) => r.id === params.requestId)
    if (found) {
      reqRecord = { ...found }
    }
  }

  if (!reqRecord) {
    throw new Error("Inter-lab request not found")
  }

  // Verify that the person taking action is indeed the designated to_staff_id
  if (reqRecord.to_staff_id !== params.staffId) {
    throw new Error("Forbidden: You are not the designated staff in-charge of this target lab")
  }

  const newStatus = params.action === "approve" ? "approved" : "rejected"
  const now = new Date().toISOString()

  // 2. Update DB
  try {
    await db.query(
      `UPDATE inter_lab_component_requests 
       SET status = ?, approver_remarks = ?, action_at = NOW() 
       WHERE id = ?`,
      [newStatus, params.remarks || null, params.requestId]
    )
  } catch (e) {}

  reqRecord.status = newStatus
  reqRecord.approver_remarks = params.remarks || null
  reqRecord.action_at = now
  reqRecord.updated_at = now

  // Update fallback array
  const idx = fallbackRequests.findIndex((r) => r.id === params.requestId)
  if (idx !== -1) {
    fallbackRequests[idx] = reqRecord
  }

  // 3. SEND CONFIRMATION NOTIFICATION TO REQUESTING STAFF MEMBER (from_staff_id)
  const isApproved = newStatus === "approved"
  const notifTitle = isApproved
    ? `✅ Inter-Lab Request Confirmed: ${reqRecord.item_name} Approved!`
    : `❌ Inter-Lab Request Declined: ${reqRecord.item_name}`

  const notifMessage = isApproved
    ? `${reqRecord.to_staff_name} from ${reqRecord.to_lab_name} has APPROVED your request for ${reqRecord.quantity}x "${reqRecord.item_name}". Remarks: ${params.remarks || "Ready for handover"}. You can now collect the item.`
    : `${reqRecord.to_staff_name} from ${reqRecord.to_lab_name} declined your request for "${reqRecord.item_name}". Remarks: ${params.remarks || "Item not available"}.`

  const notifType = isApproved ? "success" : "error"

  try {
    // Insert notification for the unique requesting staff user
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [reqRecord.from_staff_id, notifTitle, notifMessage, notifType]
    )
  } catch (e) {}

  // 4. Send Confirmation Email to Requesting Staff Member
  if (isApproved && emailTemplates.interLabRequestApproved) {
    const mailContent = emailTemplates.interLabRequestApproved({
      fromStaffName: reqRecord.from_staff_name,
      toStaffName: reqRecord.to_staff_name,
      fromLabName: reqRecord.from_lab_name,
      toLabName: reqRecord.to_lab_name,
      itemName: reqRecord.item_name,
      quantity: reqRecord.quantity,
      remarks: params.remarks,
      requestId: reqRecord.id,
    })

    await sendEmail({
      to: reqRecord.from_staff_email,
      subject: mailContent.subject,
      html: mailContent.html,
    }).catch(() => {})
  } else if (!isApproved && emailTemplates.interLabRequestRejected) {
    const mailContent = emailTemplates.interLabRequestRejected({
      fromStaffName: reqRecord.from_staff_name,
      toStaffName: reqRecord.to_staff_name,
      fromLabName: reqRecord.from_lab_name,
      toLabName: reqRecord.to_lab_name,
      itemName: reqRecord.item_name,
      quantity: reqRecord.quantity,
      remarks: params.remarks,
      requestId: reqRecord.id,
    })

    await sendEmail({
      to: reqRecord.from_staff_email,
      subject: mailContent.subject,
      html: mailContent.html,
    }).catch(() => {})
  }

  const message = isApproved
    ? `Inter-lab request #${reqRecord.id} approved. Confirmation notification sent to ${reqRecord.from_staff_name}.`
    : `Inter-lab request #${reqRecord.id} declined. Notice sent to ${reqRecord.from_staff_name}.`

  return { success: true, request: reqRecord, message }
}

export const actionInterLabRequest = approveOrRejectInterLabRequest
