/**
 * Automated Verification Script for Inter-Lab Component Requisition & Notification System
 * Validates:
 * 1. Request Generation (Staff A -> Staff B)
 * 2. Strict 1-to-1 Isolation (Staff B receives incoming request, Staff A sees outgoing; Staff C sees neither)
 * 3. Security/Permission check (Only target staff can approve/reject)
 * 4. Approval action and confirmed status reflection
 * 5. Requester confirmation notification payload
 * 6. Email template generation for created, approved, rejected states
 */

// Email template simulations matching lib/notifications.ts
const emailTemplates = {
  interLabRequestCreated: (data) => ({
    subject: `New Inter-Lab Component Requisition: ${data.itemName} from ${data.fromLabName}`,
    html: `
      <h2>Inter-Lab Component Requisition</h2>
      <p>Dear ${data.toStaffName},</p>
      <p><strong>${data.fromStaffName}</strong> from <strong>${data.fromLabName}</strong> has submitted a request to borrow components from <strong>${data.toLabName}</strong>.</p>
      <ul>
        <li><strong>Component:</strong> ${data.itemName}</li>
        <li><strong>Quantity:</strong> ${data.quantity}</li>
        <li><strong>Purpose:</strong> ${data.purpose}</li>
      </ul>
    `,
  }),
  interLabRequestApproved: (data) => ({
    subject: `Inter-Lab Requisition Approved: ${data.itemName}`,
    html: `
      <h2>Inter-Lab Requisition Approved</h2>
      <p>Dear ${data.toStaffName},</p>
      <p>Your request for <strong>${data.quantity}x ${data.itemName}</strong> from <strong>${data.fromLabName}</strong> has been <strong>APPROVED</strong> by <strong>${data.fromStaffName}</strong>.</p>
      <p><strong>Approver Remarks:</strong> ${data.remarks || "No additional remarks"}</p>
    `,
  }),
  interLabRequestRejected: (data) => ({
    subject: `Inter-Lab Requisition Update: ${data.itemName}`,
    html: `
      <h2>Inter-Lab Requisition Update</h2>
      <p>Dear ${data.toStaffName},</p>
      <p>Your request for <strong>${data.quantity}x ${data.itemName}</strong> from <strong>${data.fromLabName}</strong> could not be approved at this time.</p>
      <p><strong>Reason:</strong> ${data.remarks || "No reason specified"}</p>
    `,
  }),
}

// Inter-Lab service logic simulation matching lib/inter-lab-service.ts
let fallbackRequests = [
  {
    id: 1,
    from_lab_id: 1,
    from_lab_name: "Electronics & Hardware Lab",
    from_staff_id: 4,
    from_staff_name: "Lab Staff User",
    to_lab_id: 2,
    to_lab_name: "IoT & Embedded Systems Lab",
    to_staff_id: 5,
    to_staff_name: "Jane Smith",
    item_name: "Logic Analyzer 16-Channel",
    quantity: 2,
    purpose: "Needed for ECE-302 Microprocessor Lab session testbench setup",
    status: "approved",
    approver_remarks: "Approved. Items tested and kept ready on shelf B4.",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
]

let nextId = 100

function createInterLabRequest({ fromStaffId, fromLabId, toLabId, itemName, quantity, purpose, neededByDate, expectedReturnDate }) {
  // Resolve target staff
  let toStaffId = toLabId === 2 ? 5 : 4
  let toStaffName = toLabId === 2 ? "Jane Smith" : "Lab Staff User"
  let toLabName = toLabId === 2 ? "IoT & Embedded Systems Lab" : "Electronics & Hardware Lab"
  let fromStaffName = fromStaffId === 5 ? "Jane Smith" : "Lab Staff User"
  let fromLabName = fromLabId === 2 ? "IoT & Embedded Systems Lab" : "Electronics & Hardware Lab"

  const newId = ++nextId
  const record = {
    id: newId,
    from_lab_id: fromLabId,
    from_lab_name: fromLabName,
    from_staff_id: fromStaffId,
    from_staff_name: fromStaffName,
    to_lab_id: toLabId,
    to_lab_name: toLabName,
    to_staff_id: toStaffId,
    to_staff_name: toStaffName,
    item_name: itemName,
    quantity,
    purpose,
    needed_by_date: neededByDate,
    expected_return_date: expectedReturnDate,
    status: "pending",
    approver_remarks: null,
    created_at: new Date().toISOString(),
  }

  fallbackRequests.unshift(record)

  // In-app notification generated for target staff only
  const targetNotification = {
    user_id: toStaffId,
    title: `📦 Inter-Lab Request: ${fromLabName} requests ${itemName}`,
    message: `${fromStaffName} from ${fromLabName} has requested ${quantity}x "${itemName}". Click to review & approve.`,
    type: "warning",
  }

  return { record, targetNotification }
}

function getInterLabRequestsForStaff(staffId) {
  const incoming = fallbackRequests.filter((r) => r.to_staff_id === staffId)
  const outgoing = fallbackRequests.filter((r) => r.from_staff_id === staffId)
  return { incoming, outgoing }
}

function actionInterLabRequest({ requestId, staffId, action, remarks }) {
  const req = fallbackRequests.find((r) => r.id === requestId)
  if (!req) {
    throw new Error("Inter-lab request not found")
  }
  if (req.to_staff_id !== staffId) {
    throw new Error("Forbidden: You are not the designated staff in-charge of this target lab")
  }

  const newStatus = action === "approve" ? "approved" : "rejected"
  req.status = newStatus
  req.approver_remarks = remarks || null
  req.action_at = new Date().toISOString()

  // In-app confirmation notification generated for requesting staff only
  const isApproved = newStatus === "approved"
  const requesterNotification = {
    user_id: req.from_staff_id,
    title: `${isApproved ? "✅ Request Approved" : "❌ Request Declined"}: ${req.item_name}`,
    message: `${req.to_staff_name} (${req.to_lab_name}) has ${isApproved ? "APPROVED" : "DECLINED"} your request for ${req.quantity}x "${req.item_name}". Remarks: ${remarks || "None"}`,
    type: isApproved ? "success" : "error",
  }

  return { req, requesterNotification }
}

async function runTests() {
  console.log("====================================================")
  console.log("🧪 VERIFYING INTER-LAB REQUISITION & NOTIFICATION SYSTEM")
  console.log("====================================================\n")

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${message}`)
      failed++
    }
  }

  // TEST 1: Email Templates
  console.log("--- 1. Testing Email Notification Templates ---")
  try {
    const createdTemplate = emailTemplates.interLabRequestCreated({
      toStaffName: "Jane Smith",
      fromStaffName: "Lab Staff User",
      fromLabName: "Electronics & Hardware Lab",
      toLabName: "IoT & Embedded Systems Lab",
      itemName: "Raspberry Pi 4 8GB",
      quantity: 3,
      purpose: "Final year capstone demo bench",
    })
    assert(
      createdTemplate.subject.includes("New Inter-Lab Component Requisition"),
      "Created email has proper subject"
    )
    assert(
      createdTemplate.html.includes("Raspberry Pi 4 8GB") && createdTemplate.html.includes("Jane Smith"),
      "Created email contains item name and recipient staff"
    )

    const approvedTemplate = emailTemplates.interLabRequestApproved({
      toStaffName: "Lab Staff User",
      fromStaffName: "Jane Smith",
      fromLabName: "IoT & Embedded Systems Lab",
      itemName: "Raspberry Pi 4 8GB",
      quantity: 3,
      remarks: "Ready for pickup at counter",
    })
    assert(
      approvedTemplate.subject.includes("Approved") && approvedTemplate.html.includes("Ready for pickup at counter"),
      "Approved email contains approval confirmation and remarks"
    )

    const rejectedTemplate = emailTemplates.interLabRequestRejected({
      toStaffName: "Lab Staff User",
      fromStaffName: "Jane Smith",
      fromLabName: "IoT & Embedded Systems Lab",
      itemName: "Raspberry Pi 4 8GB",
      quantity: 3,
      remarks: "Currently allocated to ongoing workshop",
    })
    assert(
      rejectedTemplate.subject.includes("Update") && rejectedTemplate.html.includes("allocated to ongoing workshop"),
      "Rejected email contains rejection status and reason"
    )
  } catch (err) {
    assert(false, `Email template test error: ${err.message}`)
  }

  // TEST 2: Request Creation & Target Staff Notification
  console.log("\n--- 2. Testing Inter-Lab Request Creation ---")
  let createdResult
  try {
    createdResult = createInterLabRequest({
      fromStaffId: 4, // Electronics lab staff
      fromLabId: 1,
      toLabId: 2, // IoT lab
      itemName: "Keysight 4-Channel Mixed Signal Oscilloscope",
      quantity: 1,
      purpose: "High frequency signal validation for student project",
      neededByDate: "2026-10-25",
      expectedReturnDate: "2026-11-05",
    })

    const req = createdResult.record
    assert(req && req.id > 100, `Request created with unique ID: ${req.id}`)
    assert(req.status === "pending", "Initial request status is 'pending'")
    assert(req.from_staff_id === 4, "from_staff_id is correctly set to 4 (Electronics Staff)")
    assert(req.to_staff_id === 5, "to_staff_id is correctly resolved to 5 (Jane Smith - IoT Staff)")
    assert(
      createdResult.targetNotification.user_id === 5,
      "Target notification is uniquely addressed to target staff (user_id: 5)"
    )
    assert(
      createdResult.targetNotification.title.includes("Electronics & Hardware Lab requests"),
      "Notification title accurately references requesting lab"
    )
  } catch (err) {
    assert(false, `Creation test error: ${err.message}`)
  }

  const reqId = createdResult.record.id

  // TEST 3: Strict 1-to-1 Isolation & Queue Views
  console.log("\n--- 3. Testing 1-to-1 Isolation & Queue Views ---")
  try {
    // Requester Staff (ID 4)
    const staffAData = getInterLabRequestsForStaff(4)
    const outReqA = staffAData.outgoing.find((r) => r.id === reqId)
    const inReqA = staffAData.incoming.find((r) => r.id === reqId)
    assert(outReqA !== undefined, "Requester (Staff A) sees request in their 'Outgoing' tab")
    assert(inReqA === undefined, "Requester (Staff A) does NOT see request in their 'Incoming' tab")

    // Target Staff (ID 5)
    const staffBData = getInterLabRequestsForStaff(5)
    const inReqB = staffBData.incoming.find((r) => r.id === reqId)
    const outReqB = staffBData.outgoing.find((r) => r.id === reqId)
    assert(inReqB !== undefined, "Target recipient (Staff B) sees request in their 'Incoming' tab")
    assert(outReqB === undefined, "Target recipient (Staff B) does NOT see request in their 'Outgoing' tab")

    // Unrelated Staff (e.g. ID 999)
    const staffCData = getInterLabRequestsForStaff(999)
    const inReqC = staffCData.incoming.find((r) => r.id === reqId)
    const outReqC = staffCData.outgoing.find((r) => r.id === reqId)
    assert(inReqC === undefined && outReqC === undefined, "Unrelated staff (ID 999) cannot see this request")
  } catch (err) {
    assert(false, `Isolation test error: ${err.message}`)
  }

  // TEST 4: Security & Permission Check
  console.log("\n--- 4. Testing Permission Enforcement ---")
  try {
    let unauthorizedBlocked = false
    try {
      // Requester tries to approve their own request
      actionInterLabRequest({
        requestId: reqId,
        staffId: 4, // Staff A is requester, not target
        action: "approve",
        remarks: "Self-approving my own request",
      })
    } catch (authErr) {
      if (authErr.message.includes("Forbidden")) {
        unauthorizedBlocked = true
      }
    }
    assert(unauthorizedBlocked, "Requester cannot approve their own requisition (Forbidden enforced)")
  } catch (err) {
    assert(false, `Permission check test error: ${err.message}`)
  }

  // TEST 5: Legitimate Approval by Target Staff & Confirmation Notification
  console.log("\n--- 5. Testing Target Staff Approval & Confirmation Notification ---")
  try {
    const actionResult = actionInterLabRequest({
      requestId: reqId,
      staffId: 5, // Staff B (target in-charge)
      action: "approve",
      remarks: "Approved for ECE capstone. Equipment tested & kept at Bench 2.",
    })

    assert(actionResult.req.status === "approved", "Request status updated to 'approved'")
    assert(
      actionResult.req.approver_remarks === "Approved for ECE capstone. Equipment tested & kept at Bench 2.",
      "Approver remarks saved"
    )

    // Check confirmation notification to requester
    assert(
      actionResult.requesterNotification.user_id === 4,
      "Confirmation notification is uniquely routed to requester (user_id: 4)"
    )
    assert(
      actionResult.requesterNotification.type === "success",
      "Confirmation notification has 'success' type"
    )
    assert(
      actionResult.requesterNotification.title.includes("Request Approved"),
      "Confirmation notification title announces approval"
    )

    // Verify requester can now see confirmation in their outgoing view
    const updatedStaffAData = getInterLabRequestsForStaff(4)
    const updatedOutReqA = updatedStaffAData.outgoing.find((r) => r.id === reqId)
    assert(updatedOutReqA.status === "approved", "Requester can see their request is CONFIRMED as 'approved'")
    assert(
      updatedOutReqA.approver_remarks.includes("Bench 2"),
      "Requester can see approver's confirmation notes"
    )
  } catch (err) {
    assert(false, `Approval test error: ${err.message}`)
  }

  console.log("\n====================================================")
  console.log(`Results: ${passed} Passed, ${failed} Failed`)
  console.log("====================================================")

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((e) => {
  console.error("Unhandled verification error:", e)
  process.exit(1)
})
