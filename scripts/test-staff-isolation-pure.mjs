// Pure node test for 1-to-1 uniqueness and isolation logic

function filterQueueForStaff(allItems, options, userManagedLabIds = new Set()) {
  const isStaff = options?.userRole === "lab_staff" || (!options?.userRole && options?.staffUserId);

  let filtered = allItems;

  if (isStaff && options?.staffUserId) {
    filtered = allItems.filter((item) => {
      // 1. Direct match on item's unique assigned staff member ID
      if (item.labStaffId && item.labStaffId === options.staffUserId) {
        return true;
      }
      // 2. Or the item belongs to a lab where this staff user is the designated staff
      if (item.labId && userManagedLabIds.has(item.labId)) {
        return true;
      }
      return false;
    });
  }

  // Also filter by specific labId if requested in query
  if (options?.labId) {
    filtered = filtered.filter((i) => i.labId === options.labId);
  }

  return filtered;
}

const mockItems = [
  {
    id: "request_201",
    labId: 1,
    labName: "Electronics & Hardware Lab",
    labStaffId: 4, // staff@lnmiit.ac.in
    studentName: "Ram Sharma",
    componentList: "DSO-2000"
  },
  {
    id: "request_202",
    labId: 2,
    labName: "IoT & Embedded Systems Lab",
    labStaffId: 5, // jane.smith@lnmiit.ac.in
    studentName: "Student User",
    componentList: "FPGA Board Spartan-7"
  },
  {
    id: "loan_203",
    labId: 3,
    labName: "Robotics & Automation Lab",
    labStaffId: 4, // staff@lnmiit.ac.in
    studentName: "Ram Sharma",
    componentList: "Robotic Arm Controller"
  }
];

console.log("=== Testing 1-to-1 Unique Notification Scoping ===");

// Test Lab Staff 4 (staff@lnmiit.ac.in)
const staff4Items = filterQueueForStaff(mockItems, { staffUserId: 4, userRole: "lab_staff" }, new Set([1, 3]));
console.log(`Staff 4 items count: ${staff4Items.length}`);
staff4Items.forEach(i => console.log(`  - [${i.id}] ${i.labName} | Staff: ${i.labStaffId} | Item: ${i.componentList}`));

if (staff4Items.some(i => i.labStaffId !== 4)) {
  throw new Error("FAIL: Staff 4 saw items not belonging to their lab!");
}
if (staff4Items.length !== 2) {
  throw new Error("FAIL: Staff 4 should see exactly 2 items!");
}
console.log("✅ Staff 4 sees ONLY their own lab items!\n");

// Test Lab Staff 5 (jane.smith@lnmiit.ac.in)
const staff5Items = filterQueueForStaff(mockItems, { staffUserId: 5, userRole: "lab_staff" }, new Set([2]));
console.log(`Staff 5 items count: ${staff5Items.length}`);
staff5Items.forEach(i => console.log(`  - [${i.id}] ${i.labName} | Staff: ${i.labStaffId} | Item: ${i.componentList}`));

if (staff5Items.some(i => i.labStaffId !== 5)) {
  throw new Error("FAIL: Staff 5 saw items not belonging to their lab!");
}
if (staff5Items.length !== 1) {
  throw new Error("FAIL: Staff 5 should see exactly 1 item!");
}
console.log("✅ Staff 5 sees ONLY their own lab items!\n");

// Test Admin
const adminItems = filterQueueForStaff(mockItems, { staffUserId: 1, userRole: "admin" });
console.log(`Admin items count: ${adminItems.length} (sees all ${mockItems.length} items)`);
if (adminItems.length !== 3) {
  throw new Error("FAIL: Admin should see all items!");
}
console.log("✅ Admin sees full institutional overview!");

console.log("\n🎉 ALL 1-TO-1 UNIQUENESS & PRIVACY TESTS PASSED 100%!");
