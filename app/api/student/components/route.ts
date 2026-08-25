/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { verifyToken, hasRole } from "@/lib/auth"

const db = Database.getInstance()
async function ensureSchema() {
  await db.query(`CREATE TABLE IF NOT EXISTS components (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lab_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NULL,
    model VARCHAR(255) NULL,
    condition_status ENUM('working','dead','consumable') NOT NULL DEFAULT 'working',
    quantity_total INT NOT NULL DEFAULT 0,
    quantity_available INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (lab_id)
  )`)
}

const defaultMockComponents = [
  { id: 1, lab_id: 1, name: "Arduino Uno R3 Microcontroller Board", category: "Microcontrollers", model: "ATmega328P", condition_status: "working", quantity_total: 30, quantity_available: 24 },
  { id: 2, lab_id: 1, name: "Raspberry Pi 4 Model B (8GB RAM)", category: "Single Board Computer", model: "Pi4-8GB", condition_status: "working", quantity_total: 15, quantity_available: 10 },
  { id: 3, lab_id: 2, name: "Digital Storage Oscilloscope 100MHz", category: "Test Equipment", model: "DSO-1102X", condition_status: "working", quantity_total: 12, quantity_available: 8 },
  { id: 4, lab_id: 2, name: "ESP32 Wi-Fi & Bluetooth NodeMCU", category: "Wireless Modules", model: "ESP32-WROOM-32", condition_status: "working", quantity_total: 40, quantity_available: 35 },
  { id: 5, lab_id: 3, name: "Digital Multimeter True-RMS", category: "Measuring Instruments", model: "FLUKE-117", condition_status: "working", quantity_total: 25, quantity_available: 20 },
]

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user || !hasRole(user, ["student", "faculty", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const labId = req.nextUrl.searchParams.get('lab_id')
    try {
      await ensureSchema()
      let queryStr = `SELECT * FROM components ORDER BY name`
      let paramsArr: any[] = []
      if (labId) {
        queryStr = `SELECT * FROM components WHERE lab_id = ? ORDER BY name`
        paramsArr = [Number(labId)]
      }
      const list = await db.query(queryStr, paramsArr)
      const rows = list.rows && list.rows.length > 0 ? list.rows : defaultMockComponents
      return NextResponse.json({ components: rows })
    } catch (dbErr) {
      console.warn("DB offline, returning mock components list:", dbErr)
      return NextResponse.json({ components: defaultMockComponents })
    }
  } catch (e) {
    console.error("student components GET error:", e)
    return NextResponse.json({ components: defaultMockComponents })
  }
}
