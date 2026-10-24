import { redirect } from "next/navigation"

export default function LabsPage() {
  redirect("/admin/dashboard/department-and-lab-management?tab=labs")
}
