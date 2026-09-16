/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

const db = Database.getInstance()

const defaultMockLabs = [
  { id: 1, name: "Computer Lab 1 (CP1)", code: "CP1", department_id: 1, department_name: "Computer Science & Engineering", capacity: 60, location: "LT-1 First Floor", is_active: 1 },
  { id: 2, name: "Computer Lab 2 (CP2)", code: "CP2", department_id: 1, department_name: "Computer Science & Engineering", capacity: 50, location: "LT-1 Second Floor", is_active: 1 },
  { id: 3, name: "Electronics & Hardware Lab", code: "ECL1", department_id: 2, department_name: "Electronics & Communication", capacity: 40, location: "Communication Block 102", is_active: 1 },
  { id: 4, name: "IoT & Embedded Systems Lab", code: "IOT1", department_id: 2, department_name: "Electronics & Communication", capacity: 35, location: "Communication Block 204", is_active: 1 },
  { id: 5, name: "AI & Data Science Research Lab", code: "AIL1", department_id: 1, department_name: "Computer Science & Engineering", capacity: 30, location: "Main Academic Block 301", is_active: 1 },
  { id: 6, name: "Physics & Material Science Lab", code: "PHL1", department_id: 3, department_name: "Physics Department", capacity: 45, location: "Science Block 101", is_active: 1 },
]

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT 
        l.id,
        l.name,
        l.code,
        l.department_id,
        d.name as department_name,
        l.capacity,
        l.location,
        l.is_active
      FROM labs l
      LEFT JOIN departments d ON l.department_id = d.id
      WHERE l.is_active = 1
      ORDER BY l.name
    `)

    const labs = result.rows || []

    return NextResponse.json({
      success: true,
      labs
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    })
  } catch (error: any) {
    console.warn("Database query failed, returning standard trial labs:", error?.message || error)
    return NextResponse.json({
      success: true,
      labs: defaultMockLabs
    })
  }
}