import { emailTemplates } from "../lib/notifications.ts";
import { determineMilestone, getMilestoneLabel } from "../lib/non-consumable-reminder-service.ts";

async function testNonConsumableSystem() {
  console.log("=== Testing Non-Consumable Notification Milestone Logic ===");
  
  const testDays = [10, 29, 30, 45, 119, 120, 150, 180, 240];
  for (const days of testDays) {
    const milestone = determineMilestone(days);
    const label = milestone ? getMilestoneLabel(milestone) : "No milestone (<30 days)";
    console.log(`Held: ${days} days -> Milestone: ${milestone || 'none'} (${label})`);
  }

  console.log("\n=== Testing Email Template Generation for Milestones ===");
  
  // 1. Test 1-Month Milestone Template
  const email1Month = emailTemplates.nonConsumableReturnReminder({
    studentName: "Ram Sharma",
    studentEmail: "23ucs123@lnmiit.ac.in",
    studentSalutation: "mr",
    labName: "Electronics & Hardware Lab",
    componentList: "Digital Storage Oscilloscope DSO-2000 (1 unit)",
    issuedDate: "15-Sep-2026",
    dueDate: "15-Oct-2026",
    daysHeld: 35,
    milestone: "1_month",
    requestId: 201
  });
  console.log("✅ 1-Month Email Subject:", email1Month.subject);
  if (!email1Month.html.includes("1-MONTH RETURN REMINDER")) {
    throw new Error("Missing 1-month badge in HTML");
  }

  // 2. Test 1-Semester Milestone Template
  const email1Sem = emailTemplates.nonConsumableReturnReminder({
    studentName: "Student User",
    studentEmail: "student@lnmiit.ac.in",
    labName: "IoT & Embedded Systems Lab",
    componentList: "FPGA Development Board Spartan-7 (1 unit)",
    issuedDate: "10-Jun-2026",
    daysHeld: 130,
    milestone: "1_semester",
    requestId: 202
  });
  console.log("✅ 1-Semester Email Subject:", email1Sem.subject);
  if (!email1Sem.html.includes("1-SEMESTER RETURN REQUIREMENT")) {
    throw new Error("Missing 1-semester badge in HTML");
  }

  // 3. Test Critical Extended Milestone Template
  const emailCritical = emailTemplates.nonConsumableReturnReminder({
    studentName: "Ram Sharma",
    studentEmail: "23ucs123@lnmiit.ac.in",
    labName: "Robotics & Automation Lab",
    componentList: "Robotic Arm Controller Kit (1 unit)",
    issuedDate: "05-Apr-2026",
    daysHeld: 195,
    milestone: "critical_extended",
    loanId: 203
  });
  console.log("✅ Critical Overdue Email Subject:", emailCritical.subject);
  if (!emailCritical.html.includes("CRITICAL OVERDUE NOTICE")) {
    throw new Error("Missing critical overdue badge in HTML");
  }

  console.log("\n🎉 All non-consumable notification milestone tests passed successfully!");
}

testNonConsumableSystem().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
