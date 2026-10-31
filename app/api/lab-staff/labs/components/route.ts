/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"

const db = Database.getInstance()

const defaultMockLabs = [
  { id: 1, name: "Computer Lab 1 (CP1)", department_id: 1 },
  { id: 2, name: "Computer Lab 2 (CP2)", department_id: 1 },
  { id: 3, name: "Electronics & Communication Lab (ECE)", department_id: 2 },
  { id: 4, name: "IoT & Embedded Systems Lab", department_id: 2 },
]

const defaultMockComponents = [
  { id: 1, lab_id: 1, lab_name: "Computer Lab 1 (CP1)", department_id: 1, name: "Arduino Uno R3 Microcontroller Board", category: "Microcontrollers", model: "ATmega328P", condition_status: "working", quantity_total: 30, quantity_available: 24 },
  { id: 2, lab_id: 1, lab_name: "Computer Lab 1 (CP1)", department_id: 1, name: "Raspberry Pi 4 Model B (8GB RAM)", category: "Single Board Computer", model: "Pi4-8GB", condition_status: "working", quantity_total: 15, quantity_available: 10 },
  { id: 3, lab_id: 2, lab_name: "Computer Lab 2 (CP2)", department_id: 1, name: "Digital Storage Oscilloscope 100MHz", category: "Test Equipment", model: "DSO-1102X", condition_status: "working", quantity_total: 12, quantity_available: 8 },
  { id: 4, lab_id: 2, lab_name: "Computer Lab 2 (CP2)", department_id: 1, name: "ESP32 Wi-Fi & Bluetooth NodeMCU", category: "Wireless Modules", model: "ESP32-WROOM-32", condition_status: "working", quantity_total: 40, quantity_available: 35 },
  { id: 5, lab_id: 3, lab_name: "Electronics & Communication Lab (ECE)", department_id: 2, name: "Digital Multimeter True-RMS", category: "Measuring Instruments", model: "FLUKE-117", condition_status: "working", quantity_total: 25, quantity_available: 20 },
  { id: 6, lab_id: 3, lab_name: "Electronics & Communication Lab (ECE)", department_id: 2, name: "Soldering Station 60W Temperature Controlled", category: "Assembly Tools", model: "ESD-SAFE-936", condition_status: "working", quantity_total: 10, quantity_available: 7 },
  { id: 7, lab_id: 4, lab_name: "IoT & Embedded Systems Lab", department_id: 2, name: "FPGA Spartan-6 Development Kit", category: "Programmable Logic", model: "XC6SLX9", condition_status: "working", quantity_total: 10, quantity_available: 6 },
]

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || !hasRole(user, ["lab_staff", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
      // If admin, behave like HOD admin view
      if (user.role === 'admin') {
        const labsRes = await db.query(`SELECT id, name, department_id FROM labs ORDER BY name`)
        const componentsRes = await db.query(`
          SELECT c.*, l.name as lab_name, l.department_id
          FROM components c
          JOIN labs l ON c.lab_id = l.id
          ORDER BY l.name, c.name
        `)
        return NextResponse.json({ labs: labsRes.rows || [], components: componentsRes.rows || [] })
      }

      // For lab staff, get labs where the user is head (l.staff_id)
      const labRes = await db.query(`SELECT id FROM labs WHERE staff_id = ?`, [Number(user.userId)])
      const labIds = labRes.rows.map((r: any) => Number(r.id))

      if (labIds.length === 0) {
        // Fallback to all labs if user has no assigned labs or in demo
        const allLabs = await db.query(`SELECT id, name, department_id FROM labs ORDER BY name`)
        if (allLabs.rows.length === 0) {
          return NextResponse.json({ labs: defaultMockLabs, components: defaultMockComponents })
        }
        return NextResponse.json({ labs: allLabs.rows, components: [] })
      }

      const placeholders = labIds.map(() => '?').join(',')
      const labsRes = await db.query(
        `SELECT id, name, department_id FROM labs WHERE id IN (${placeholders}) ORDER BY name`,
        labIds
      )

      const componentsRes = await db.query(
        `SELECT c.*, l.name as lab_name, l.department_id
         FROM components c
         JOIN labs l ON c.lab_id = l.id
         WHERE l.id IN (${placeholders})
         ORDER BY l.name, c.name`,
        labIds
      )

      return NextResponse.json({ labs: labsRes.rows || [], components: componentsRes.rows || [] })
    } catch (dbErr) {
      console.warn("DB offline in lab-staff/labs/components, returning fallback mock data:", dbErr)
      return NextResponse.json({ labs: defaultMockLabs, components: defaultMockComponents })
    }
  } catch (error) {
    console.error('Error fetching lab components for lab head:', error)
    return NextResponse.json({ labs: defaultMockLabs, components: defaultMockComponents })
  }
}
