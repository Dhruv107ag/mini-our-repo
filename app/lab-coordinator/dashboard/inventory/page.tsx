/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useEffect, useState } from "react"
import { LabInventoryManager } from "@/components/inventory/lab-inventory-manager"

export default function LabCoordinatorInventoryPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (!user && typeof window !== "undefined") {
      window.location.href = "/"
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <LabInventoryManager userRole="lab_coordinator" />
    </div>
  )
}
