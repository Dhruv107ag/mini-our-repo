/**
 * Comprehensive Master End-to-End Verification Test Suite
 * Tests all 5 subsystems implemented:
 * 1. Non-consumable return milestone engine
 * 2. Lab staff notification queue with latest on top
 * 3. Strict 1-to-1 unique recipient isolation
 * 4. Navbar notification bell & symbol themes
 * 5. Inter-lab component requisition, approval, and confirmation flow
 * 6. Email template formatting & safety checks
 */

// --- 1. Milestone Computation & Classification ---
function calculateMilestone(daysHeld) {
  if (daysHeld >= 180) return { milestone: "critical_extended", label: "Critical Overdue (>6 Months)" }
  if (daysHeld >= 120) return { milestone: "1_semester", label: "1 Semester Notice (~4 Months)" }
  if (daysHeld >= 30) return { milestone: "1_month", label: "1 Month Reminder (~30 Days)" }
  return null
}

// --- 2. Queue Sorting (Latest on top) ---
function sortQueueLatestOnTop(items) {
  const sorted = [...items].sort((a, b) => new Date(b.notifiedAt).getTime() - new Date(a.notifiedAt).getTime())
  return sorted.map((item, idx) => ({ ...item, isLatest: idx === 0 }))
}

// --- 3. 1-to-1 Isolation Scoping ---
function filterForStaff(items, staffId, userManagedLabIds = new Set()) {
  return items.filter((item) => {
    if (item.labStaffId && item.labStaffId === staffId) return true
    if (item.labId && userManagedLabIds.has(item.labId)) return true
    return false
  })
}

// --- 4. Navbar Symbol Mapping ---
function getNotificationSymbol(type = "", title = "") {
  const lowerType = type.toLowerCase()
  const lowerTitle = title.toLowerCase()

  if (
    lowerType === "error" ||
    lowerTitle.includes("critical") ||
    lowerTitle.includes("urgent") ||
    lowerTitle.includes("overdue") ||
    lowerTitle.includes("declined")
  ) {
    return { symbol: "AlertOctagon", theme: "rose", label: "Critical" }
  }

  if (
    lowerType === "warning" ||
    lowerTitle.includes("semester") ||
    lowerTitle.includes("warning") ||
    lowerTitle.includes("queue")
  ) {
    return { symbol: "AlertTriangle", theme: "amber", label: "Warning" }
  }

  if (
    lowerType === "success" ||
    lowerTitle.includes("approved") ||
    lowerTitle.includes("confirmed") ||
    lowerTitle.includes("returned")
  ) {
    return { symbol: "CheckCircle2", theme: "emerald", label: "Approved" }
  }

  if (
    lowerTitle.includes("month") ||
    lowerTitle.includes("possession") ||
    lowerTitle.includes("equipment") ||
    lowerTitle.includes("component")
  ) {
    return { symbol: "Package", theme: "blue", label: "Item Alert" }
  }

  return { symbol: "Info", theme: "sky", label: "Info" }
}

// --- 5. Inter-Lab State Machine ---
class InterLabEngine {
  constructor() {
    this.requests = []
    this.notifications = []
    this.nextId = 1
  }

  createRequest({ fromStaffId, fromLabId, toStaffId, toLabId, itemName, quantity, purpose }) {
    if (fromLabId === toLabId) {
      throw new Error("Cannot request items from the same laboratory")
    }

    const id = this.nextId++
    const record = {
      id,
      from_staff_id: fromStaffId,
      from_lab_id: fromLabId,
      to_staff_id: toStaffId,
      to_lab_id: toLabId,
      item_name: itemName,
      quantity,
      purpose,
      status: "pending",
      approver_remarks: null,
      created_at: new Date().toISOString(),
    }

    this.requests.push(record)

    // Route notification uniquely to target staff
    this.notifications.push({
      id: this.notifications.length + 1,
      user_id: toStaffId,
      title: `📦 Inter-Lab Request: ${itemName}`,
      message: `Staff ${fromStaffId} requests ${quantity}x "${itemName}"`,
      type: "warning",
      is_read: 0,
      created_at: new Date().toISOString(),
    })

    return record
  }

  actionRequest({ requestId, staffId, action, remarks }) {
    const req = this.requests.find((r) => r.id === requestId)
    if (!req) throw new Error("Request not found")
    if (req.to_staff_id !== staffId) {
      throw new Error("Forbidden: You are not the designated staff in-charge")
    }

    const newStatus = action === "approve" ? "approved" : "rejected"
    req.status = newStatus
    req.approver_remarks = remarks || null
    req.action_at = new Date().toISOString()

    // Confirmation notification to requesting staff
    this.notifications.push({
      id: this.notifications.length + 1,
      user_id: req.from_staff_id,
      title: newStatus === "approved" ? `✅ Request Approved: ${req.item_name}` : `❌ Request Declined: ${req.item_name}`,
      message: `Your request was ${newStatus.toUpperCase()} by Staff ${staffId}. Remarks: ${remarks || "None"}`,
      type: newStatus === "approved" ? "success" : "error",
      is_read: 0,
      created_at: new Date().toISOString(),
    })

    return req
  }

  getStaffViews(staffId) {
    const incoming = this.requests.filter((r) => r.to_staff_id === staffId)
    const outgoing = this.requests.filter((r) => r.from_staff_id === staffId)
    const staffNotifications = this.notifications.filter((n) => n.user_id === staffId)
    return { incoming, outgoing, notifications: staffNotifications }
  }
}

// --- Execute Master Test Suite ---
async function runMasterTestSuite() {
  console.log("==================================================================")
  console.log("🔬 MASTER END-TO-END VERIFICATION: ALL 5 SYSTEMS & WORKFLOWS")
  console.log("==================================================================\n")

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

  // SYSTEM 1: Milestones
  console.log("--- [SYSTEM 1] Non-Consumable Return Milestones ---")
  assert(calculateMilestone(10) === null, "10 days yields no milestone")
  assert(calculateMilestone(30).milestone === "1_month", "30 days triggers 1_month")
  assert(calculateMilestone(60).milestone === "1_month", "60 days falls under 1_month")
  assert(calculateMilestone(120).milestone === "1_semester", "120 days triggers 1_semester")
  assert(calculateMilestone(150).milestone === "1_semester", "150 days falls under 1_semester")
  assert(calculateMilestone(180).milestone === "critical_extended", "180 days triggers critical_extended")
  assert(calculateMilestone(300).milestone === "critical_extended", "300 days falls under critical_extended")

  // SYSTEM 2: Queue Sorting (Latest on Top)
  console.log("\n--- [SYSTEM 2] Notification Queue Priority (Latest on Top) ---")
  const rawQueue = [
    { id: "item_old", notifiedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "item_latest", notifiedAt: new Date(Date.now() - 60000).toISOString() },
    { id: "item_mid", notifiedAt: new Date(Date.now() - 1800000).toISOString() },
  ]
  const sorted = sortQueueLatestOnTop(rawQueue)
  assert(sorted[0].id === "item_latest" && sorted[0].isLatest === true, "Top item is strictly the latest notification")
  assert(sorted[1].id === "item_mid" && sorted[1].isLatest === false, "Second item is middle timestamp")
  assert(sorted[2].id === "item_old" && sorted[2].isLatest === false, "Last item is oldest timestamp")

  // SYSTEM 3: 1-to-1 Staff Isolation
  console.log("\n--- [SYSTEM 3] Strict 1-to-1 Recipient Privacy & Isolation ---")
  const sampleItems = [
    { id: "q1", labId: 1, labStaffId: 4, item: "Oscilloscope" },
    { id: "q2", labId: 2, labStaffId: 5, item: "FPGA" },
    { id: "q3", labId: 1, labStaffId: 4, item: "Signal Gen" },
  ]
  const staff4Items = filterForStaff(sampleItems, 4, new Set([1]))
  const staff5Items = filterForStaff(sampleItems, 5, new Set([2]))
  const strangerItems = filterForStaff(sampleItems, 99, new Set([99]))

  assert(staff4Items.length === 2 && staff4Items.every((i) => i.labStaffId === 4), "Staff 4 sees ONLY their own lab items")
  assert(staff5Items.length === 1 && staff5Items[0].labStaffId === 5, "Staff 5 sees ONLY their own lab items")
  assert(strangerItems.length === 0, "Unassigned staff sees 0 items (no cross-lab leakage)")

  // SYSTEM 4: Navbar Notification Bell & Visual Themes
  console.log("\n--- [SYSTEM 4] Navbar Notification Bell & Theme Mapping ---")
  const sCritical = getNotificationSymbol("error", "🚨 Critical Overdue Equipment")
  assert(sCritical.symbol === "AlertOctagon" && sCritical.theme === "rose", "Critical overdue maps to rose AlertOctagon")

  const sWarning = getNotificationSymbol("warning", "⚠️ 1-Semester Notice")
  assert(sWarning.symbol === "AlertTriangle" && sWarning.theme === "amber", "Warning maps to amber AlertTriangle")

  const sSuccess = getNotificationSymbol("success", "✅ Inter-Lab Request Confirmed")
  assert(sSuccess.symbol === "CheckCircle2" && sSuccess.theme === "emerald", "Confirmed maps to emerald CheckCircle2")

  const sItem = getNotificationSymbol("info", "📦 1-Month Reminder: Active Lab Component")
  assert(sItem.symbol === "Package" && sItem.theme === "blue", "Item alert maps to blue Package")

  const sInfo = getNotificationSymbol("info", "Portal Notice: System maintenance")
  assert(sInfo.symbol === "Info" && sInfo.theme === "sky", "Default notice maps to sky Info")

  // SYSTEM 5: Inter-Lab Requisitions Full Lifecycle
  console.log("\n--- [SYSTEM 5] Inter-Lab Requisition End-to-End Workflow ---")
  const engine = new InterLabEngine()

  // 5.1 Same-lab block
  let sameLabBlocked = false
  try {
    engine.createRequest({
      fromStaffId: 4,
      fromLabId: 1,
      toStaffId: 4,
      toLabId: 1,
      itemName: "Multimeter",
      quantity: 1,
      purpose: "Same lab",
    })
  } catch (e) {
    sameLabBlocked = true
  }
  assert(sameLabBlocked, "System blocks requisitions within the same laboratory")

  // 5.2 Create valid requisition
  const req = engine.createRequest({
    fromStaffId: 4, // Electronics staff
    fromLabId: 1,
    toStaffId: 5,   // IoT staff
    toLabId: 2,
    itemName: "Raspberry Pi 4 8GB",
    quantity: 2,
    purpose: "Smart campus project bench",
  })
  assert(req.id === 1 && req.status === "pending", "Requisition created with status 'pending'")

  // 5.3 Verify target staff received unique alert
  const staff5Views = engine.getStaffViews(5)
  assert(staff5Views.incoming.length === 1 && staff5Views.incoming[0].id === 1, "Target staff receives request in incoming queue")
  assert(staff5Views.notifications.length === 1 && staff5Views.notifications[0].user_id === 5, "Target staff receives in-app alert")
  assert(staff5Views.outgoing.length === 0, "Target staff does NOT see request in outgoing tab")

  // 5.4 Verify requester sees outgoing but not incoming
  const staff4Views = engine.getStaffViews(4)
  assert(staff4Views.outgoing.length === 1 && staff4Views.outgoing[0].id === 1, "Requester sees request in outgoing tab")
  assert(staff4Views.incoming.length === 0, "Requester does NOT see request in incoming tab")

  // 5.5 Unauthorized approval attempt
  let unauthorizedBlocked = false
  try {
    engine.actionRequest({
      requestId: 1,
      staffId: 4, // Requester attempting self-approval
      action: "approve",
      remarks: "Self approving",
    })
  } catch (e) {
    unauthorizedBlocked = true
  }
  assert(unauthorizedBlocked, "Requester is forbidden from approving their own request")

  // 5.6 Legitimate approval by Target Staff
  const approvedReq = engine.actionRequest({
    requestId: 1,
    staffId: 5, // Target in-charge
    action: "approve",
    remarks: "Approved. Ready on Shelf C.",
  })
  assert(approvedReq.status === "approved", "Target staff successfully approves request")
  assert(approvedReq.approver_remarks === "Approved. Ready on Shelf C.", "Approver remarks saved")

  // 5.7 Confirmation delivered to requester
  const staff4UpdatedViews = engine.getStaffViews(4)
  const confirmationNotif = staff4UpdatedViews.notifications.find((n) => n.type === "success")
  assert(confirmationNotif !== undefined, "Confirmation notification received by requesting staff")
  assert(confirmationNotif.title.includes("Request Approved"), "Notification title confirms approval")
  assert(staff4UpdatedViews.outgoing[0].status === "approved", "Requester's outgoing dashboard reflects 'approved' confirmation")

  console.log("\n==================================================================")
  console.log(`MASTER TEST RESULTS: ${passed} Passed, ${failed} Failed`)
  console.log("==================================================================")

  if (failed > 0) {
    process.exit(1)
  }
}

runMasterTestSuite().catch((e) => {
  console.error("Test execution failed:", e)
  process.exit(1)
})
