/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, ClipboardList, Building } from "lucide-react"
import Link from "next/link"

export default function OthersDashboardPage() {
	const [userName, setUserName] = useState<string>("")
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadUserData()
	}, [])

	const loadUserData = async () => {
		try {
			const res = await fetch('/api/auth/me')
			if (res.ok) {
				const data = await res.json()
				setUserName(data.user?.name || "Guest User")
			}
		} catch (error) {
			console.error('Failed to load user data:', error)
			setUserName("Guest User")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			{/* Hero Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 p-6 md:p-8 shadow-xs admin-appear-card">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
					<div className="space-y-1.5">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/80 text-blue-800 border border-blue-200">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
								Active User Portal
							</span>
							<span className="text-xs text-slate-400 font-medium">• LNMIIT Jaipur</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
							Welcome, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{loading ? "User" : userName}</span>
						</h1>
						<p className="text-xs md:text-sm text-slate-600 max-w-xl leading-relaxed">
							Welcome to the LNMIIT Laboratory & Resource Hub. You can reserve available laboratory slots and monitor booking request statuses through this portal.
						</p>
					</div>
					<div className="shrink-0">
						<Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-all duration-200 hover:shadow-md">
							<Link href="/others/dashboard/book-labs">
								<Plus className="h-4 w-4 mr-1.5" />
								Book Lab Now
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Quick Portals Grid */}
			<div className="grid sm:grid-cols-2 gap-4">
				<Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 border-t-4 border-t-blue-500">
					<div className="flex items-start gap-4">
						<div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center shrink-0">
							<Calendar className="h-6 w-6" />
						</div>
						<div className="space-y-1">
							<h3 className="font-bold text-base text-slate-900">Lab Reservation</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								Explore laboratory capacity, available time slots, and schedule your reservation.
							</p>
							<div className="pt-2">
								<Button size="sm" asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
									<Link href="/others/dashboard/book-labs">
										Open Scheduler
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</Card>

				<Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 border-t-4 border-t-amber-500">
					<div className="flex items-start gap-4">
						<div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center shrink-0">
							<ClipboardList className="h-6 w-6" />
						</div>
						<div className="space-y-1">
							<h3 className="font-bold text-base text-slate-900">My Requests</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								Track current and past laboratory booking approvals and feedback.
							</p>
							<div className="pt-2">
								<Button size="sm" variant="outline" asChild className="rounded-xl border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700">
									<Link href="/others/dashboard/my-requests">
										View History
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
