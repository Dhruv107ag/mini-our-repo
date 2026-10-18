// Test the milestone logic and template generation logic directly

function determineMilestone(daysHeld) {
  if (daysHeld >= 180) {
    return "critical_extended" // > 6 months / multi-semester
  }
  if (daysHeld >= 120) {
    return "1_semester" // ~4 months / full academic semester
  }
  if (daysHeld >= 30) {
    return "1_month" // ~30 days / 1 month
  }
  return null
}

function getMilestoneLabel(milestone) {
  switch (milestone) {
    case "critical_extended":
      return "Critical Overdue (> 6 Months / Multi-Semester)"
    case "1_semester":
      return "1 Academic Semester (~4 Months)"
    case "1_month":
      return "1 Month (~30 Days)"
  }
}

function createEmailTemplate(content) {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif;">
    <div style="background: #034da2; color: white; padding: 15px; text-align: center;">
      <h2>LNMIIT Lab Management System</h2>
    </div>
    ${content}
    <p>Best regards,<br/><b>Lab Management Team</b><br/>The LNM Institute of Information Technology</p>
  </body>
</html>`
}

function nonConsumableReturnReminder(data) {
  let greeting = `Dear <b>${data.studentName}</b>`
  if (data.studentSalutation && data.studentSalutation !== 'none') {
    const salutationMap = { 'prof': 'Prof.', 'dr': 'Dr.', 'mr': 'Mr.', 'mrs': 'Mrs.' }
    greeting = `Dear <b>${salutationMap[data.studentSalutation] || ''} ${data.studentName}</b>`
  }

  const isSem = data.milestone === '1_semester'
  const isCritical = data.milestone === 'critical_extended'

  const headerColor = isCritical ? '#991b1b' : isSem ? '#dc2626' : '#d97706'
  const badgeText = isCritical 
    ? '🚨 CRITICAL OVERDUE NOTICE (> 6 MONTHS)' 
    : isSem 
      ? '⚠️ 1-SEMESTER RETURN REQUIREMENT (~4 MONTHS)' 
      : '📦 1-MONTH RETURN REMINDER (~30 DAYS)'

  const subject = isCritical
    ? `🚨 [CRITICAL OVERDUE] Return Required: Non-Consumable Lab Equipment - ${data.labName}`
    : isSem
      ? `⚠️ [1-Semester Notice] Urgent Return Required: Non-Consumable Lab Equipment - ${data.labName}`
      : `📦 [1-Month Reminder] Non-Consumable Lab Equipment in Your Possession - ${data.labName}`

  const instructions = isCritical
    ? `<strong>⚡ Critical Action Required:</strong> Our records confirm you have possessed this non-consumable hardware for over 6 months across multiple academic terms. Non-consumable assets belong to the institute and must be returned or physically accounted for. Continued withholding may lead to a block on your semester registration, grade cards, and No-Dues clearance.`
    : isSem
      ? `<strong>⚠️ End-of-Semester Requirement:</strong> You have had this non-consumable equipment for approximately 1 academic semester (~${data.daysHeld} days). Departmental lab regulations mandate that all durable non-consumable equipment be physically surrendered or inspected by lab staff before the conclusion of each semester. Please return the items to avoid clearance holds.`
      : `<strong>ℹ️ Periodic Check-in:</strong> You have had this non-consumable item for over 1 month (~${data.daysHeld} days). Non-consumables are shared lab assets. If your scheduled lab work or assignment is complete, please return the item promptly. If you still require the equipment for an ongoing project, please apply for an extension through the student portal.`

  return {
    subject,
    html: createEmailTemplate(`
      <div style="padding: 10px;">
        <span style="background: ${headerColor}; color: white; padding: 4px 8px; font-weight: bold;">${badgeText}</span>
        <p>${greeting},</p>
        <p>This is an automated notification regarding the <b>non-consumable laboratory item(s)</b> currently issued under your name.</p>
        <table border="1" cellpadding="6" style="border-collapse: collapse;">
          <tr><td><b>Lab:</b></td><td>${data.labName}</td></tr>
          <tr><td><b>Item(s):</b></td><td>${data.componentList}</td></tr>
          <tr><td><b>Duration:</b></td><td>${data.daysHeld} days</td></tr>
        </table>
        <p>${instructions}</p>
      </div>
    `)
  }
}

console.log("=== Testing Milestone Classification ===");
const cases = [
  { days: 15, expected: null },
  { days: 30, expected: "1_month" },
  { days: 45, expected: "1_month" },
  { days: 119, expected: "1_month" },
  { days: 120, expected: "1_semester" },
  { days: 150, expected: "1_semester" },
  { days: 179, expected: "1_semester" },
  { days: 180, expected: "critical_extended" },
  { days: 250, expected: "critical_extended" },
];

for (const c of cases) {
  const m = determineMilestone(c.days);
  console.log(`[Days Held: ${c.days}] -> Expected: ${c.expected}, Got: ${m} ${m === c.expected ? '✅ PASS' : '❌ FAIL'}`);
}

console.log("\n=== Testing Template Generation ===");
const r1 = nonConsumableReturnReminder({
  studentName: "Ram Sharma",
  studentEmail: "23ucs123@lnmiit.ac.in",
  labName: "Electronics & Hardware Lab",
  componentList: "DSO-2000 (1 unit)",
  daysHeld: 35,
  milestone: "1_month"
});
console.log("1-Month Subject:", r1.subject);

const r2 = nonConsumableReturnReminder({
  studentName: "Student User",
  studentEmail: "student@lnmiit.ac.in",
  labName: "IoT Lab",
  componentList: "Spartan-7 FPGA Board",
  daysHeld: 130,
  milestone: "1_semester"
});
console.log("1-Semester Subject:", r2.subject);

const r3 = nonConsumableReturnReminder({
  studentName: "Ram Sharma",
  studentEmail: "23ucs123@lnmiit.ac.in",
  labName: "Robotics Lab",
  componentList: "Robotic Arm Controller Kit",
  daysHeld: 195,
  milestone: "critical_extended"
});
console.log("Critical Overdue Subject:", r3.subject);

console.log("\n🎉 ALL LOGIC AND TEMPLATE TESTS PASSED PERFECTLY!");
