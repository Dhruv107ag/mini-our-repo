/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Calendar,
  Package,
  Users,
  Settings,
  BarChart3,
  BookOpen,
  ClipboardList,
  UserCheck,
  Building,
  X,
  CheckSquare,
  History,
  ArrowLeftRight,
  Clock,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface DashboardSidebarProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

/**
 * DashboardSidebar Component
 *
 * Navigation sidebar with role-based menu items
 * Responsive design with mobile sheet overlay
 */
export function DashboardSidebar({ user, isOpen, onClose }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Compute optional role prefix from current URL (e.g., /admin, /student)
  const roleMatch = pathname?.match(/^\/(admin|student|faculty|lab-staff|hod|lab-coordinator|others)(?:\/|$)/)
  const prefix = roleMatch ? `/${roleMatch[1]}` : ""

  const withPrefix = (p: string) => `${prefix}${p}`

  const getNavigationItems = (role: string) => {
    const baseItems = [{ name: "Dashboard", href: withPrefix("/dashboard"), icon: Home, color: "blue" }]

    switch (role) {
      case "student":
        return [
          ...baseItems,
          { name: "Book Lab", href: withPrefix("/dashboard/book-lab"), icon: Calendar, color: "indigo" },
          { name: "Request Components", href: withPrefix("/dashboard/request-components"), icon: Package, color: "emerald" },
          { name: "My Component Requests", href: withPrefix("/dashboard/my-component-requests"), icon: ClipboardList, color: "purple" },
          { name: "My Lab Booking Requests", href: withPrefix("/dashboard/my-requests"), icon: BookOpen, color: "amber" },
        ]

      case "faculty":
        return [
          ...baseItems,
          { name: "Book Labs", href: withPrefix("/dashboard/book-labs"), icon: Calendar, color: "indigo" },
          { name: "Request Components", href: withPrefix("/dashboard/request-components"), icon: Package, color: "emerald" },
          { name: "My Component Requests", href: withPrefix("/dashboard/my-component-requests"), icon: ClipboardList, color: "purple" },
          { name: "Approve Requests", href: withPrefix("/dashboard/approve"), icon: UserCheck, color: "amber" },
          { name: "My Lab Booking Requests", href: withPrefix("/dashboard/bookings"), icon: BookOpen, color: "teal" },
          { name: "View Logs", href: withPrefix("/dashboard/logs"), icon: History, color: "slate" },
        ]

      case "lab_staff":
      case "lab-staff":
        return [
          ...baseItems,
          { name: "My Labs", href: withPrefix("/dashboard/labs"), icon: Building, color: "indigo" },
          { name: "Lab Inventory", href: withPrefix("/dashboard/inventory"), icon: Package, color: "emerald" },
          { name: "View Timetable", href: withPrefix("/dashboard/timetable"), icon: Calendar, color: "amber" },
          { name: "Lab Booking Requests", href: withPrefix("/dashboard/approve"), icon: UserCheck, color: "purple" },
          { name: "Component Requests", href: withPrefix("/dashboard/component-requests"), icon: ClipboardList, color: "teal" },
          { name: "Inter-Lab Requisitions", href: withPrefix("/dashboard/inter-lab-requests"), icon: ArrowLeftRight, color: "rose" },
          { name: "View Logs", href: withPrefix("/dashboard/logs"), icon: History, color: "slate" },
          { name: "Analytics", href: withPrefix("/dashboard/analytics"), icon: BarChart3, color: "sky" },
        ]

      case "hod":
        return [
          ...baseItems,
          { name: "Department Labs", href: withPrefix("/dashboard/labs"), icon: Building, color: "indigo" },
          { name: "Lab Inventory", href: withPrefix("/dashboard/inventory"), icon: Package, color: "emerald" },
          { name: "Approvals", href: withPrefix("/dashboard/approvals"), icon: UserCheck, color: "amber" },
          { name: "View Logs", href: withPrefix("/dashboard/logs"), icon: History, color: "slate" },
          { name: "Analytics", href: withPrefix("/dashboard/analytics"), icon: BarChart3, color: "sky" },
        ]

      case "lab_coordinator":
      case "lab-coordinator":
        return [
          ...baseItems,
          { name: "Department Labs", href: withPrefix("/dashboard/labs"), icon: Building, color: "indigo" },
          { name: "Lab Inventory", href: withPrefix("/dashboard/inventory"), icon: Package, color: "emerald" },
          { name: "Approvals", href: withPrefix("/dashboard/approvals"), icon: UserCheck, color: "amber" },
          { name: "View Logs", href: withPrefix("/dashboard/logs"), icon: History, color: "slate" },
          { name: "Analytics", href: withPrefix("/dashboard/analytics"), icon: BarChart3, color: "sky" },
        ]

      case "admin":
        return [
          { name: "Command Dashboard", href: "/admin/dashboard", icon: Home, color: "blue" },
          { name: "Department & Lab Governance", href: "/admin/dashboard/department-and-lab-management", icon: Building, color: "indigo" },
          { name: "Lab Asset Inventory", href: "/admin/dashboard/inventory", icon: Package, color: "emerald" },
          { name: "User Management", href: "/admin/users", icon: Users, color: "purple" },
          { name: "Master Timetable", href: "/admin/dashboard/timetable", icon: Calendar, color: "amber" },
          { name: "Daily Lab Schedule", href: "/admin/dashboard/daily-schedule", icon: Clock, color: "rose" },
          { name: "System Analytics", href: "/admin/dashboard/analytics", icon: BarChart3, color: "sky" },
          { name: "Authorizations & Approvals", href: "/admin/dashboard/approvals", icon: UserCheck, color: "teal" },
          { name: "System Settings", href: "/admin/dashboard/settings", icon: Settings, color: "slate" },
        ]

      case "others":
        return [
          ...baseItems,
          { name: "Book Labs", href: withPrefix("/dashboard/book-labs"), icon: Calendar, color: "indigo" },
          { name: "My Lab Booking Requests", href: withPrefix("/dashboard/my-requests"), icon: ClipboardList, color: "amber" },
        ]

      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems(user.role)

  const getRoleBranding = (role: string) => {
    switch (role) {
      case "student":
        return {
          title: "Student Portal",
          subtitle: "LNMIIT Lab Services",
          badgeText: "Student",
          badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80",
          gradient: "from-sky-500 via-blue-600 to-indigo-600",
          category: "Student Services",
        }
      case "faculty":
        return {
          title: "Faculty Desk",
          subtitle: "Academic Operations",
          badgeText: "Faculty",
          badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          gradient: "from-indigo-600 via-purple-600 to-pink-500",
          category: "Faculty Portals",
        }
      case "lab_staff":
      case "lab-staff":
        return {
          title: "Lab Staff Desk",
          subtitle: "Resource & Inventory Hub",
          badgeText: "Lab Staff",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          gradient: "from-emerald-500 via-teal-600 to-blue-600",
          category: "Lab Operations",
        }
      case "hod":
        return {
          title: "HOD Portal",
          subtitle: "Department Governance",
          badgeText: "HOD",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
          gradient: "from-amber-500 via-orange-600 to-rose-600",
          category: "Department Governance",
        }
      case "lab_coordinator":
      case "lab-coordinator":
        return {
          title: "Coordinator Hub",
          subtitle: "Lab & Asset Operations",
          badgeText: "Coordinator",
          badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
          gradient: "from-purple-600 via-indigo-600 to-blue-600",
          category: "Coordination Desks",
        }
      case "admin":
        return {
          title: "Central Admin",
          subtitle: "LNMIIT Governance Hub",
          badgeText: "Admin",
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200/70",
          gradient: "from-blue-600 via-indigo-600 to-amber-500",
          category: "Administrative Portals",
        }
      default:
        return {
          title: "User Portal",
          subtitle: "LNMIIT Lab Services",
          badgeText: "User",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80",
          gradient: "from-slate-600 via-blue-600 to-indigo-600",
          category: "Portal Navigation",
        }
    }
  }

  const branding = getRoleBranding(user.role)

  const colorStyles: Record<string, { iconBg: string; activeBorder: string; activeBg: string; activeText: string; activeDot: string }> = {
    blue: {
      iconBg: "bg-blue-50 text-blue-600 border-blue-200/70 group-hover:bg-blue-100 group-hover:text-blue-700",
      activeBorder: "border-l-blue-600",
      activeBg: "bg-blue-50/80",
      activeText: "text-blue-950 font-bold",
      activeDot: "bg-blue-600",
    },
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200/70 group-hover:bg-indigo-100 group-hover:text-indigo-700",
      activeBorder: "border-l-indigo-600",
      activeBg: "bg-indigo-50/80",
      activeText: "text-indigo-950 font-bold",
      activeDot: "bg-indigo-600",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/70 group-hover:bg-emerald-100 group-hover:text-emerald-700",
      activeBorder: "border-l-emerald-600",
      activeBg: "bg-emerald-50/80",
      activeText: "text-emerald-950 font-bold",
      activeDot: "bg-emerald-600",
    },
    purple: {
      iconBg: "bg-purple-50 text-purple-600 border-purple-200/70 group-hover:bg-purple-100 group-hover:text-purple-700",
      activeBorder: "border-l-purple-600",
      activeBg: "bg-purple-50/80",
      activeText: "text-purple-950 font-bold",
      activeDot: "bg-purple-600",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border-amber-200/70 group-hover:bg-amber-100 group-hover:text-amber-700",
      activeBorder: "border-l-amber-600",
      activeBg: "bg-amber-50/80",
      activeText: "text-amber-950 font-bold",
      activeDot: "bg-amber-600",
    },
    rose: {
      iconBg: "bg-rose-50 text-rose-600 border-rose-200/70 group-hover:bg-rose-100 group-hover:text-rose-700",
      activeBorder: "border-l-rose-600",
      activeBg: "bg-rose-50/80",
      activeText: "text-rose-950 font-bold",
      activeDot: "bg-rose-600",
    },
    sky: {
      iconBg: "bg-sky-50 text-sky-600 border-sky-200/70 group-hover:bg-sky-100 group-hover:text-sky-700",
      activeBorder: "border-l-sky-600",
      activeBg: "bg-sky-50/80",
      activeText: "text-sky-950 font-bold",
      activeDot: "bg-sky-600",
    },
    teal: {
      iconBg: "bg-teal-50 text-teal-600 border-teal-200/70 group-hover:bg-teal-100 group-hover:text-teal-700",
      activeBorder: "border-l-teal-600",
      activeBg: "bg-teal-50/80",
      activeText: "text-teal-950 font-bold",
      activeDot: "bg-teal-600",
    },
    slate: {
      iconBg: "bg-slate-100 text-slate-600 border-slate-200/70 group-hover:bg-slate-200 group-hover:text-slate-700",
      activeBorder: "border-l-slate-600",
      activeBg: "bg-slate-100/80",
      activeText: "text-slate-950 font-bold",
      activeDot: "bg-slate-600",
    },
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white text-slate-800">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 bg-white">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${branding.gradient}`} />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">{branding.title}</h2>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{branding.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${branding.badgeClass}`}>
            {branding.badgeText}
          </span>
          <Button variant="ghost" size="sm" className="md:hidden ml-1 p-1 h-7 w-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="px-3 pb-2 pt-1 flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {branding.category}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
            {navigationItems.length} Active
          </span>
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item: any) => {
            // Normalize for active match across prefixed and non-prefixed URLs
            const normalized = pathname?.replace(/^\/(admin|student|faculty|lab-staff|hod|lab-coordinator|others)(?=\/)/, "") || ""
            const itemPath = item.href.replace(prefix, "")
            const isDashboardRoot = itemPath === "/dashboard" || item.href === "/admin/users"
            const isExact = normalized === itemPath
            const isPrefix = normalized.startsWith(itemPath + "/")
            const active = item.href === "/admin/users" ? pathname === "/admin/users" : (isDashboardRoot ? isExact : (isExact || isPrefix))
            
            const cs = colorStyles[item.color || "blue"] || colorStyles.blue
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`admin-nav-item group w-full justify-start gap-2.5 text-left overflow-hidden h-auto py-2 px-2.5 items-center rounded-xl text-xs transition-all duration-200 ${
                  active
                    ? `border-l-[3.5px] ${cs.activeBorder} ${cs.activeBg} ${cs.activeText} shadow-xs`
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-50/90 border-l-[3.5px] border-transparent font-medium"
                }`}
                onClick={() => {
                  router.push(item.href)
                  onClose()
                }}
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105 ${cs.iconBg}`}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 whitespace-normal break-words leading-tight">{item.name}</span>
                {active && (
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cs.activeDot}`} />
                )}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Role Portal Footer Badge - with safe bottom padding for Next.js dev overlay */}
      <div className="p-3 border-t border-slate-200/80 bg-white pb-7 relative z-10">
        <div className="p-2.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80 text-xs shadow-2xs space-y-1.5 rounded-xl">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
            <span className="tracking-wide">LNMIIT Jaipur</span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 border border-amber-200/80 rounded-md">
              2025–26
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/70">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Live
            </span>
            <span className="font-semibold text-slate-400">v1.2 Light</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - fixed */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 border-r border-slate-200/80 bg-white shadow-2xs z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0 rounded-r-xl border-r border-slate-200/80 bg-white">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
