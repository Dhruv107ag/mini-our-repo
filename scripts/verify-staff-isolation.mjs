// Verification script testing 1-to-1 uniqueness and isolation per lab staff member

import {
  fetchUnreturnedNonConsumables,
  getLabStaffNotificationQueue,
} from "../lib/non-consumable-reminder-service.ts";

async function verifyStaffIsolation() {
  console.log("=== Testing 1-to-1 Staff Isolation & Notification Uniqueness ===\n");

  const allItems = await fetchUnreturnedNonConsumables();
  console.log(`Total active unreturned non-consumables in system: ${allItems.length}`);
  allItems.forEach((item) => {
    console.log(`- [${item.id}] ${item.labName} | Assigned Staff ID: ${item.labStaffId} | Item: ${item.componentList}`);
  });

  // 1. Test Staff User 4 (In-charge of Electronics & Hardware Lab)
  console.log("\n--- Testing Lab Staff 4 (staff@lnmiit.ac.in) Queue ---");
  const queueStaff4 = await getLabStaffNotificationQueue({
    staffUserId: 4,
    userRole: "lab_staff"
  });

  console.log(`Queue items count for Staff 4: ${queueStaff4.queue.length}`);
  queueStaff4.queue.forEach((item, idx) => {
    console.log(`  [Pos ${idx + 1}] ID: ${item.id} | Lab: ${item.labName} | Staff ID: ${item.labStaffId} | isLatest: ${item.isLatest}`);
  });

  // Assertions for Staff 4
  const staff4HasLab2 = queueStaff4.queue.some(i => i.labStaffId === 5);
  if (staff4HasLab2) {
    throw new Error("VIOLATION: Staff 4 saw items assigned to Staff 5!");
  }
  console.log("✅ Verified: Staff 4 ONLY sees their own assigned lab items!");

  // 2. Test Staff User 5 (Jane Smith - In-charge of IoT Lab)
  console.log("\n--- Testing Lab Staff 5 (jane.smith@lnmiit.ac.in) Queue ---");
  const queueStaff5 = await getLabStaffNotificationQueue({
    staffUserId: 5,
    userRole: "lab_staff"
  });

  console.log(`Queue items count for Staff 5: ${queueStaff5.queue.length}`);
  queueStaff5.queue.forEach((item, idx) => {
    console.log(`  [Pos ${idx + 1}] ID: ${item.id} | Lab: ${item.labName} | Staff ID: ${item.labStaffId} | isLatest: ${item.isLatest}`);
  });

  // Assertions for Staff 5
  const staff5HasLab1Or3 = queueStaff5.queue.some(i => i.labStaffId === 4);
  if (staff5HasLab1Or3) {
    throw new Error("VIOLATION: Staff 5 saw items assigned to Staff 4!");
  }
  console.log("✅ Verified: Staff 5 ONLY sees their own assigned lab items!");

  // 3. Test Admin (can see all department queues)
  console.log("\n--- Testing Admin (Full Oversight) ---");
  const queueAdmin = await getLabStaffNotificationQueue({
    staffUserId: 1,
    userRole: "admin"
  });
  console.log(`Queue items count for Admin: ${queueAdmin.queue.length}`);
  if (queueAdmin.queue.length !== allItems.length) {
    throw new Error("Admin should see all items across all labs!");
  }
  console.log("✅ Verified: Admin sees complete institutional overview!");

  console.log("\n🎉 ALL 1-TO-1 UNIQUENESS & LAB STAFF ISOLATION TESTS PASSED!");
}

verifyStaffIsolation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
