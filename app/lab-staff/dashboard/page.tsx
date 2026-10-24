/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ClipboardList, Plus, ArrowLeftRight } from "lucide-react"
import Link from "next/link"
import { LabStaffNotificationQueue } from "@/components/dashboard/lab-staff-notification-queue"

export default function LabStaffDashboardPage() {
	const [currentUser, setCurrentUser] = useState<any>(null)
	const [stats, setStats] = useState({
		totalEquipment: 0,
		pendingIssues: 0
	})

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
		if (!currentUser) return ''
		const prefix = getSalutationPrefix(currentUser.salutation)
		return prefix ? `${prefix} ${currentUser.name}` : currentUser.name
	}

	useEffect(() => {
		const userData = localStorage.getItem("user")
		if (userData) {
			setCurrentUser(JSON.parse(userData))
		}
		// Load real stats from API
		loadStats()
	}, [])

	const loadStats = async () => {
		try {
			// Fetch total equipment count from components API
			const componentsRes = await fetch('/api/lab-staff/labs/components')
			if (componentsRes.ok) {
				const componentsData = await componentsRes.json()
				const totalEquipment = componentsData.components?.length || 0
				
				// Fetch pending component requests
				const componentRequestsRes = await fetch('/api/lab-staff/component-requests')
				let pendingComponentRequests = 0
				if (componentRequestsRes.ok) {
					const componentRequestsData = await componentRequestsRes.json()
					// Count requests with status 'pending_lab_staff'
					pendingComponentRequests = componentRequestsData.requests?.filter((r: any) => 
						r.status === 'pending_lab_staff' || r.status === 'pending_faculty' || r.status === 'pending_hod'
					).length || 0
				}
				
				// Fetch pending lab booking requests
				const labBookingRes = await fetch('/api/lab-staff/requests?status=pending_lab_staff')
				let pendingLabBookings = 0
				if (labBookingRes.ok) {
					const labBookingData = await labBookingRes.json()
					pendingLabBookings = labBookingData.requests?.length || 0
				}
				
				// Total pending issues = component requests + lab booking requests
				setStats({
					totalEquipment,
					pendingIssues: pendingComponentRequests + pendingLabBookings
				})
			}
		} catch (error) {
			console.error('Failed to load stats:', error)
			// Keep default values if API fails
			setStats({
				totalEquipment: 0,
				pendingIssues: 0
			})
		}
	}

	if (!currentUser) return null

	return (
		<div className="space-y-6">
			{/* Lab Staff Hero Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-white via-emerald-50/50 to-teal-50/40 p-5 md:p-6 shadow-xs admin-appear-card">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
								Active Lab Staff Session
							</span>
							<span className="text-xs text-slate-400 font-medium">• LNMIIT Jaipur</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
							Welcome, <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">{getDisplayName()}</span>
						</h1>
						<p className="text-xs md:text-sm text-slate-600">
							Supervise laboratory apparatus, audit consumable stock levels, and fulfill inter-lab requisitions.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2.5 shrink-0">
						<Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 hover:shadow-md">
							<Link href="/lab-staff/dashboard/inventory">
								<Package className="h-4 w-4 mr-1.5" />
								Manage Inventory
							</Link>
						</Button>
						<Button asChild variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl shadow-2xs">
							<Link href="/lab-staff/dashboard/component-requests">
								<ClipboardList className="h-4 w-4 mr-1.5" />
								Component Requests
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Stats Cards - Color-coded top borders and light cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Total Equipment */}
				<div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs border-t-4 border-t-emerald-500 hover:shadow-md transition-all duration-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tracked Lab Equipment</p>
							<p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalEquipment}</p>
						</div>
						<div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center">
							<Package className="h-6 w-6" />
						</div>
					</div>
					<div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
						<span>Hardware & consumables catalog</span>
						<span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active Stock</span>
					</div>
				</div>
				
				{/* Pending Issues */}
				<div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs border-t-4 border-t-amber-500 hover:shadow-md transition-all duration-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Actions & Issues</p>
							<p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.pendingIssues}</p>
						</div>
						<div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center">
							<ClipboardList className="h-6 w-6" />
						</div>
					</div>
					<div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
						<span>Component requests & slot approvals</span>
						<span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Action Queue</span>
					</div>
				</div>
			</div>

			{/* Non-Consumable Return Notification Queue */}
			<LabStaffNotificationQueue />

			{/* Quick Actions */}
			<Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
				<CardHeader className="bg-slate-50/50 border-b border-slate-200/70 pb-3 pt-3.5 px-5">
					<h3 className="text-sm font-bold text-slate-900">Lab Operations & Quick Actions</h3>
				</CardHeader>
				<CardContent className="p-4 grid sm:grid-cols-3 gap-3">
					<Button asChild className="w-full justify-start rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold">
						<Link href="/lab-staff/dashboard/inventory">
							<Package className="h-4 w-4 mr-2" />
							Manage Inventory
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 font-medium">
						<Link href="/lab-staff/dashboard/component-requests">
							<ClipboardList className="h-4 w-4 mr-2 text-purple-600" />
							Review Requests
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full justify-start rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 font-medium">
						<Link href="/lab-staff/dashboard/inter-lab-requests">
							<ArrowLeftRight className="h-4 w-4 mr-2 text-indigo-600" />
							Inter-Lab Transfers
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
