function formatTimeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDays = Math.floor(diffHour / 24)
  if (diffDays === 1) return "Yesterday"
  return `${diffDays}d ago`
}

// Sample items with different notification times
const now = Date.now();
const testItems = [
  {
    id: "alert_1",
    studentName: "Ram Sharma",
    componentList: "DSO-2000 (1 unit)",
    notifiedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    daysHeld: 35,
    milestone: "1_month"
  },
  {
    id: "alert_2",
    studentName: "Student User",
    componentList: "FPGA Spartan-7 (1 unit)",
    notifiedAt: new Date(now - 4 * 60 * 1000).toISOString(), // 4 minutes ago (LATEST!)
    daysHeld: 130,
    milestone: "1_semester"
  },
  {
    id: "alert_3",
    studentName: "Ram Sharma",
    componentList: "Robotic Arm Controller Kit",
    notifiedAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago
    daysHeld: 195,
    milestone: "critical_extended"
  }
];

// Sort descending by notifiedAt (latest on top)
testItems.sort((a, b) => new Date(b.notifiedAt).getTime() - new Date(a.notifiedAt).getTime());

testItems.forEach((item, idx) => {
  item.isLatest = (idx === 0);
  item.timeAgo = formatTimeAgo(item.notifiedAt);
});

console.log("=== Testing Queue Ordering (Latest on Top) ===");
testItems.forEach((item, idx) => {
  console.log(`[Pos ${idx + 1}] ID: ${item.id} | Student: ${item.studentName} | Time: ${item.timeAgo} | isLatest: ${item.isLatest}`);
});

if (testItems[0].id !== "alert_2") {
  throw new Error("Top item is not the latest notification!");
}

if (!testItems[0].isLatest) {
  throw new Error("Top item isLatest flag is false!");
}

if (testItems[1].isLatest || testItems[2].isLatest) {
  throw new Error("Subsequent items should have isLatest: false!");
}

console.log("\n🎉 QUEUE SORTING AND LATEST-ON-TOP VERIFICATION PASSED!");
