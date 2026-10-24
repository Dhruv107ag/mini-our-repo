/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Settings, LogOut } from "lucide-react"
import { NotificationNavBell } from "@/components/dashboard/notification-nav-bell"

interface DashboardHeaderProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    department: string
    salutation?: string
  }
  onMenuClick: () => void
}

/**
 * DashboardHeader Component
 *
 * Top navigation bar with LNMIIT branding, notifications, and user menu
 * Responsive design with mobile menu toggle
 */
export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter()
  
  const getSalutationPrefix = (salutation?: string) => {
    if (!salutation || salutation === 'none') return ''
    const salutationMap: Record<string, string> = {
      'prof': 'Prof.',
      'dr': 'Dr.',
      'mr': 'Mr.',
      'mrs': 'Mrs.'
    }
    return salutationMap[salutation.toLowerCase()] || ''
  }

  const getDisplayName = () => {
    const prefix = getSalutationPrefix(user.salutation)
    return prefix ? `${prefix} ${user.name}` : user.name
  }
  
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      student: "Student",
      faculty: "Faculty",
      "lab-staff": "Lab Staff",
      hod: "Head of Department (HoD)",
      admin: "Administrator",
      others: "Others",
    }
    return roleMap[role] || role
  }

  const getSettingsPath = (role: string) => {
    const roleMap: Record<string, string> = {
      student: "/student/dashboard/settings",
      faculty: "/faculty/dashboard/settings",
      "lab-staff": "/lab-staff/dashboard/settings",
      "lab_staff": "/lab-staff/dashboard/settings",
      hod: "/hod/dashboard/settings",
      admin: "/admin/dashboard/settings",
      others: "/others/dashboard/settings",
    }
    return roleMap[role] || "/dashboard/settings"
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("user")
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect even if API call fails
      localStorage.removeItem("user")
      window.location.href = "/"
    }
  }

  const isAdmin = user.role === "admin"

  const getRoleBadgeConfig = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          label: "Admin Console",
          classes: "border-blue-200/80 bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50/50 text-blue-950",
          dot: "bg-blue-600 animate-pulse",
          subDot: "bg-amber-500",
          pill: "bg-amber-100/90 text-amber-900 border-amber-200/80",
          pillText: "Root Admin",
        }
      case "faculty":
        return {
          label: "Faculty Hub",
          classes: "border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-blue-50/60 text-indigo-950",
          dot: "bg-indigo-600 animate-pulse",
          subDot: "bg-blue-500",
          pill: "bg-indigo-100/90 text-indigo-900 border-indigo-200/80",
          pillText: "Faculty Member",
        }
      case "student":
        return {
          label: "Student Portal",
          classes: "border-sky-200/80 bg-gradient-to-r from-sky-50 to-blue-50/60 text-sky-950",
          dot: "bg-sky-500 animate-pulse",
          subDot: "bg-blue-600",
          pill: "bg-sky-100/90 text-sky-900 border-sky-200/80",
          pillText: "Student Roster",
        }
      case "lab_staff":
      case "lab-staff":
        return {
          label: "Lab Operations",
          classes: "border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50/60 text-emerald-950",
          dot: "bg-emerald-600 animate-pulse",
          subDot: "bg-teal-500",
          pill: "bg-emerald-100/90 text-emerald-900 border-emerald-200/80",
          pillText: "Technical Staff",
        }
      case "hod":
        return {
          label: "HoD Governance",
          classes: "border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/60 text-amber-950",
          dot: "bg-amber-500 animate-pulse",
          subDot: "bg-orange-600",
          pill: "bg-amber-100/90 text-amber-900 border-amber-200/80",
          pillText: "Department Head",
        }
      case "lab_coordinator":
      case "lab-coordinator":
        return {
          label: "Coordinator Hub",
          classes: "border-teal-200/80 bg-gradient-to-r from-teal-50 to-emerald-50/60 text-teal-950",
          dot: "bg-teal-600 animate-pulse",
          subDot: "bg-emerald-500",
          pill: "bg-teal-100/90 text-teal-900 border-teal-200/80",
          pillText: "Lab Coordinator",
        }
      default:
        return {
          label: "Institutional Portal",
          classes: "border-slate-200/80 bg-gradient-to-r from-slate-50 to-blue-50/50 text-slate-900",
          dot: "bg-blue-500",
          subDot: "bg-slate-400",
          pill: "bg-slate-100 text-slate-700 border-slate-200",
          pillText: "Authorized User",
        }
    }
  }

  const roleConfig = getRoleBadgeConfig(user.role)

  return (
    <header className="flex h-16 items-center justify-between px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-colors">
      {/* Left Section - Menu and Logo */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Image src="/lnmiit-logo.png" alt="LNMIIT" width={120} height={40} className="h-8 w-auto filter drop-shadow-2xs" />
          <div className="hidden md:flex items-center gap-3">
            <h1 className="font-montserrat text-lg font-bold tracking-tight text-slate-900">
              Lab Management System
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1 border text-[11px] font-extrabold tracking-wider uppercase rounded-lg shadow-2xs ${roleConfig.classes}`}>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${roleConfig.dot}`} />
                <span className={`h-1.5 w-1.5 rounded-full ${roleConfig.subDot}`} />
              </span>
              <span>{roleConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Notifications & User Menu */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Popover */}
        <div className="[&_button]:text-slate-600 [&_button:hover]:text-blue-700 [&_button:hover]:bg-blue-50/80 [&_button]:rounded-lg [&_button]:transition-all">
          <NotificationNavBell userId={user.id} />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="group flex items-center gap-2.5 h-auto py-1.5 px-2.5 bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200/80 rounded-xl transition-all duration-200"
            >
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-bold leading-none text-slate-900 group-hover:text-blue-900 transition-colors">
                  {getDisplayName()}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${roleConfig.dot.split(' ')[0]}`} />
                  <p className="text-xs font-semibold leading-none text-slate-500">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
              <div className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 text-blue-600 group-hover:text-blue-700 group-hover:border-blue-300 rounded-lg shadow-2xs transition-all duration-200">
                <Settings className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 rounded-xl p-1.5 shadow-xl bg-white border border-slate-200 text-slate-900" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal px-2.5 py-2 mb-1 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 rounded-lg">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold leading-none text-slate-900">{getDisplayName()}</p>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded-md ${roleConfig.pill}`}>
                    {roleConfig.pillText}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="text-xs font-semibold text-blue-700">
                  {getRoleDisplayName(user.role)} &bull; {user.department}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem 
              className="cursor-pointer text-xs font-medium rounded-lg px-2.5 py-2 text-slate-700 hover:text-blue-900 hover:bg-blue-50/80 transition-all" 
              onClick={() => router.push(getSettingsPath(user.role))}
            >
              <Settings className="mr-2 h-4 w-4 text-blue-600" />
              <span>Console Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              className="cursor-pointer text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg px-2.5 py-2 transition-all" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 text-rose-500" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
