"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  studentId?: string
  salutation?: string
}

export default function CenterLeadDashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      } else {
        window.location.href = "/"
      }
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Center Lead Portal...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
