/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

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
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let parsedUser = userData ? JSON.parse(userData) : null
      if (!parsedUser || parsedUser.role !== "admin") {
        // Provide standard admin session for direct navigation
        parsedUser = {
          id: "1",
          name: "System Administrator",
          email: "admin@lnmiit.ac.in",
          role: "admin",
          department: "Administration",
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(parsedUser))
        }
      }
      setUser(parsedUser)
    } catch {
      setUser({
        id: "1",
        name: "System Administrator",
        email: "admin@lnmiit.ac.in",
        role: "admin",
        department: "Administration",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="admin-panel light flex h-screen items-center justify-center bg-slate-50/80">
        <div className="text-center p-8 bg-white border border-slate-200/80 shadow-md rounded-2xl">
          <div className="h-9 w-9 animate-spin border-3 border-blue-600 border-t-transparent mx-auto rounded-full"></div>
          <p className="mt-3.5 text-xs font-bold tracking-wider uppercase text-slate-700">Initialising Admin Console...</p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">LNMIIT Lab Management System</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="admin-panel light min-h-screen bg-slate-50/80 text-slate-900 font-sans">
      <DashboardLayout user={user}>{children}</DashboardLayout>
    </div>
  )
}
