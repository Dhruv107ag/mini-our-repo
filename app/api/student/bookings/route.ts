/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, hasRole } from "@/lib/auth"
import { dbOperations } from "@/lib/database"
import { logLabBookingActivity, getUserInfoForLogging } from "@/lib/activity-logger"

const defaultMockBookings = [
  { id: 101, lab_id: 1, lab_name: "Computer Lab 1 (CP1)", booking_date: "2026-08-25", start_time: "14:00", end_time: "16:00", purpose: "DBMS Mini Project Lab Work", approval_status: "approved", created_at: "2026-08-23T10:00:00Z" },
  { id: 102, lab_id: 3, lab_name: "Electronics & Hardware Lab", booking_date: "2026-08-26", start_time: "10:00", end_time: "12:00", purpose: "Microcontroller Board Testing", approval_status: "pending", created_at: "2026-08-23T11:30:00Z" },
  { id: 103, lab_id: 2, lab_name: "Computer Lab 2 (CP2)", booking_date: "2026-08-28", start_time: "11:00", end_time: "13:00", purpose: "Algorithm Speed Benchmarking", approval_status: "approved", created_at: "2026-08-22T09:00:00Z" },
]

// GET - Student: list my bookings
export async function GET(req: NextRequest) {
  const user = await verifyToken(req)
  if (!user || !hasRole(user, ["student"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  let rows: any[] = []
  try {
    rows = await dbOperations.getBookingsByUser(user.userId)
  } catch (e) {
    console.warn("DB offline, using mock bookings list:", e)
    rows = defaultMockBookings
  }
  return NextResponse.json({ bookings: rows })
}

// POST - Student: create a booking for myself
export async function POST(req: NextRequest) {
  const user = await verifyToken(req)
  if (!user || !hasRole(user, ["student"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const required = ["labId", "bookingDate", "startTime", "endTime", "purpose"]
  for (const k of required) if (!body?.[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 })
  // Optional: conflict check could be applied here using dbOperations.checkBookingConflicts
  const booking = await dbOperations.createBooking({
    labId: Number.parseInt(String(body.labId), 10),
    bookedBy: user.userId,
    bookingDate: String(body.bookingDate),
    startTime: String(body.startTime),
    endTime: String(body.endTime),
    purpose: String(body.purpose),
    expectedStudents: body?.expectedStudents ?? null,
    equipmentNeeded: body?.equipmentNeeded ?? null,
  })
  
  // Log the activity
  const userInfo = await getUserInfoForLogging(user.userId)
  logLabBookingActivity({
    bookingId: booking.id,
    labId: booking.lab_id,
    actorUserId: userInfo?.userId || null,
    actorName: userInfo?.name || null,
    actorEmail: userInfo?.email || null,
    actorRole: userInfo?.role || null,
    action: "created",
    actionDescription: `Created lab booking for ${booking.purpose}`,
    bookingSnapshot: booking,
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
    userAgent: req.headers.get("user-agent") || null,
  }).catch(err => console.error("Activity logging failed:", err))
  
  return NextResponse.json({ booking }, { status: 201 })
}
