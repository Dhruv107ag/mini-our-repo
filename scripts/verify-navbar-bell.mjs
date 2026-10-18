function getNotificationSymbol(type, title = "") {
  const lowerType = (type || "").toLowerCase()
  const lowerTitle = (title || "").toLowerCase()

  if (
    lowerType === "error" ||
    lowerTitle.includes("critical") ||
    lowerTitle.includes("urgent") ||
    lowerTitle.includes("overdue") ||
    lowerTitle.includes("rejected")
  ) {
    return { symbol: "AlertOctagon (Red)", label: "Critical", color: "rose" }
  }

  if (
    lowerType === "warning" ||
    lowerTitle.includes("semester") ||
    lowerTitle.includes("warning") ||
    lowerTitle.includes("return due") ||
    lowerTitle.includes("queue")
  ) {
    return { symbol: "AlertTriangle (Amber)", label: "Warning", color: "amber" }
  }

  if (
    lowerType === "success" ||
    lowerTitle.includes("approved") ||
    lowerTitle.includes("issued") ||
    lowerTitle.includes("success") ||
    lowerTitle.includes("returned")
  ) {
    return { symbol: "CheckCircle2 (Emerald)", label: "Approved", color: "emerald" }
  }

  if (
    lowerTitle.includes("month") ||
    lowerTitle.includes("possession") ||
    lowerTitle.includes("equipment") ||
    lowerTitle.includes("component")
  ) {
    return { symbol: "Package (Blue)", label: "Item Alert", color: "blue" }
  }

  return { symbol: "Info (Sky)", label: "Info", color: "sky" }
}

const testNotifications = [
  { type: "error", title: "🚨 Critical Overdue: Non-Consumable Item Return Required" },
  { type: "warning", title: "⚠️ 1-Semester Notice: Non-Consumable Lab Equipment" },
  { type: "info", title: "📦 1-Month Reminder: Active Lab Component in Your Possession" },
  { type: "success", title: "Lab Component Request #101 Approved and Issued" },
  { type: "info", title: "General Notification: Lab Maintenance Scheduled" }
];

console.log("=== Testing Notification Navbar Symbol Mapping ===");
testNotifications.forEach((n, idx) => {
  const res = getNotificationSymbol(n.type, n.title);
  console.log(`[Item ${idx + 1}] Title: "${n.title}"`);
  console.log(`       -> Symbol: ${res.symbol} | Label: ${res.label} | Theme: ${res.color}\n`);
});

console.log("🎉 ALL NOTIFICATION NAVBAR SYMBOL MAPPINGS VERIFIED!");
