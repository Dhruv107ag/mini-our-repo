/**
 * Center Database Service
 * Provides isolated storage for Center Lead:
 * 1. Center Purchases (Dept Purchase)
 * 2. Center Inventory (Separate from regular lab inventory)
 * 3. Center Issues & Returns (Track components loaned to students/faculty)
 * Supports MySQL DB with automatic persistent JSON fallback.
 */

import fs from "fs"
import path from "path"
import { Database } from "@/lib/database"

export interface CenterPurchase {
  id: number
  purchase_no: string
  item_name: string
  item_type: "consumable" | "non_consumable"
  category: string
  quantity: number
  unit: string
  unit_price: number
  total_amount: number
  vendor_name: string
  vendor_contact?: string | null
  purchase_date: string
  invoice_pdf_url?: string | null
  invoice_pdf_name?: string | null
  status: "received" | "ordered" | "cancelled"
  added_to_inventory: boolean
  remarks?: string | null
  purchased_by?: string | null
  center_name: string
  created_at: string
}

export interface CenterInventoryItem {
  id: number
  center_name: string
  part_no: string
  item_name: string
  item_type: "consumable" | "non_consumable"
  category: string
  total_purchased: number
  available_quantity: number
  issued_quantity: number
  condemned_quantity: number
  repair_quantity: number
  unit: string
  location: string
  unit_price: number
  purchase_date?: string | null
  purchase_no?: string | null
  invoice_pdf_url?: string | null
  invoice_pdf_name?: string | null
  remarks?: string | null
  created_at: string
  updated_at: string
}

export interface CenterItemIssue {
  id: number
  issue_code: string
  inventory_id: number
  item_name: string
  item_type: "consumable" | "non_consumable"
  part_no: string
  quantity: number
  issued_to_name: string
  issued_to_email: string
  issued_to_role: "student" | "faculty" | "staff" | "other"
  issued_to_id: string
  department: string
  issue_date: string
  expected_return_date?: string | null
  actual_return_date?: string | null
  purpose?: string | null
  status: "issued" | "returned" | "overdue" | "lost"
  return_condition?: "good" | "minor_damage" | "damaged" | "lost" | null
  issued_by_name: string
  returned_to_name?: string | null
  remarks?: string | null
  created_at: string
  updated_at: string
}

export interface CenterInventoryAdjustment {
  id: number
  inventory_id: number
  action_type: "purchase_add" | "issue" | "return" | "consumed" | "condemned" | "repair_send" | "repair_return" | "stock_adjustment"
  quantity_change: number
  prev_available: number
  new_available: number
  prev_issued: number
  new_issued: number
  remark: string
  proof_doc_url?: string | null
  proof_doc_name?: string | null
  performed_by?: string | null
  created_at: string
}

interface CenterStoreData {
  purchases: CenterPurchase[]
  inventory: CenterInventoryItem[]
  issues: CenterItemIssue[]
  adjustments: CenterInventoryAdjustment[]
}

const STORE_PATH = path.resolve(process.cwd(), "data", "center-store.json")

// Seed sample data for Center Lead
const initialCenterStore: CenterStoreData = {
  purchases: [
    {
      id: 1,
      purchase_no: "CP-2026-001",
      item_name: "NVIDIA Jetson Orin Nano Developer Kit (8GB)",
      item_type: "non_consumable",
      category: "Robotics & Edge AI",
      quantity: 5,
      unit: "units",
      unit_price: 49900,
      total_amount: 249500,
      vendor_name: "Robu Enterprises Pvt Ltd",
      vendor_contact: "sales@robu.in | +91 20 4855 0000",
      purchase_date: "2026-01-15",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-dso.pdf",
      invoice_pdf_name: "ROBU_JETSON_INV_9021.pdf",
      status: "received",
      added_to_inventory: true,
      remarks: "For Autonomous Drone and Robotics AI Lab. Procured under Center Development Fund.",
      purchased_by: "Prof. Center Lead",
      center_name: "Center for Advanced Studies",
      created_at: "2026-01-15T11:30:00.000Z",
    },
    {
      id: 2,
      purchase_no: "CP-2026-002",
      item_name: "Raspberry Pi 5 (8GB RAM) High Performance Single Board",
      item_type: "non_consumable",
      category: "IoT & Embedded Systems",
      quantity: 12,
      unit: "pcs",
      unit_price: 7850,
      total_amount: 94200,
      vendor_name: "Element14 India",
      vendor_contact: "support-in@element14.com",
      purchase_date: "2026-02-04",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-ne555.pdf",
      invoice_pdf_name: "E14_RPI5_INVOICE_4482.pdf",
      status: "received",
      added_to_inventory: true,
      remarks: "For Edge Computing, Smart Campus IoT experiments and final year capstone projects.",
      purchased_by: "Prof. Center Lead",
      center_name: "Center for Advanced Studies",
      created_at: "2026-02-04T14:15:00.000Z",
    },
    {
      id: 3,
      purchase_no: "CP-2026-003",
      item_name: "ESP32-S3-WROOM-1 Dual Core WiFi+BLE Module",
      item_type: "consumable",
      category: "Microcontrollers & Sensors",
      quantity: 50,
      unit: "pcs",
      unit_price: 450,
      total_amount: 22500,
      vendor_name: "SunRobotics Jaipur",
      vendor_contact: "+91 141 2288990",
      purchase_date: "2026-02-18",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-resistors.pdf",
      invoice_pdf_name: "SUNROB_ESP32_INV_1102.pdf",
      status: "received",
      added_to_inventory: true,
      remarks: "Consumable modules distributed to students for Smart Sensor Nodes research.",
      purchased_by: "Prof. Center Lead",
      center_name: "Center for Advanced Studies",
      created_at: "2026-02-18T10:00:00.000Z",
    },
    {
      id: 4,
      purchase_no: "CP-2026-004",
      item_name: "LiDAR RPLIDAR A2M8 360 Degree Laser Scanner",
      item_type: "non_consumable",
      category: "Robotics & Edge AI",
      quantity: 3,
      unit: "units",
      unit_price: 32000,
      total_amount: 96000,
      vendor_name: "Robu Enterprises Pvt Ltd",
      vendor_contact: "sales@robu.in",
      purchase_date: "2026-03-01",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-dso.pdf",
      invoice_pdf_name: "RPLIDAR_INV_7781.pdf",
      status: "received",
      added_to_inventory: true,
      remarks: "High accuracy 2D LiDAR scanners for SLAM navigation and mapping bots.",
      purchased_by: "Prof. Center Lead",
      center_name: "Center for Advanced Studies",
      created_at: "2026-03-01T15:00:00.000Z",
    },
  ],
  inventory: [
    {
      id: 1,
      center_name: "Center for Advanced Studies",
      part_no: "CEN-AI-JET01",
      item_name: "NVIDIA Jetson Orin Nano Developer Kit (8GB)",
      item_type: "non_consumable",
      category: "Robotics & Edge AI",
      total_purchased: 5,
      available_quantity: 3,
      issued_quantity: 2,
      condemned_quantity: 0,
      repair_quantity: 0,
      unit: "units",
      location: "Cabinet A - Rack 2",
      unit_price: 49900,
      purchase_date: "2026-01-15",
      purchase_no: "CP-2026-001",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-dso.pdf",
      invoice_pdf_name: "ROBU_JETSON_INV_9021.pdf",
      remarks: "Primary AI development platform with 40 TOPS AI compute capability.",
      created_at: "2026-01-15T11:30:00.000Z",
      updated_at: "2026-02-10T16:20:00.000Z",
    },
    {
      id: 2,
      center_name: "Center for Advanced Studies",
      part_no: "CEN-IOT-RPI5",
      item_name: "Raspberry Pi 5 (8GB RAM) High Performance Single Board",
      item_type: "non_consumable",
      category: "IoT & Embedded Systems",
      total_purchased: 12,
      available_quantity: 8,
      issued_quantity: 3,
      condemned_quantity: 0,
      repair_quantity: 1,
      unit: "pcs",
      location: "Cabinet B - Shelf 1",
      unit_price: 7850,
      purchase_date: "2026-02-04",
      purchase_no: "CP-2026-002",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-ne555.pdf",
      invoice_pdf_name: "E14_RPI5_INVOICE_4482.pdf",
      remarks: "Equipped with official active cooler. 1 unit under HDMI port diagnosis.",
      created_at: "2026-02-04T14:15:00.000Z",
      updated_at: "2026-02-20T12:00:00.000Z",
    },
    {
      id: 3,
      center_name: "Center for Advanced Studies",
      part_no: "CEN-MCU-ESP32S3",
      item_name: "ESP32-S3-WROOM-1 Dual Core WiFi+BLE Module",
      item_type: "consumable",
      category: "Microcontrollers & Sensors",
      total_purchased: 50,
      available_quantity: 28,
      issued_quantity: 22,
      condemned_quantity: 0,
      repair_quantity: 0,
      unit: "pcs",
      location: "Component Bin C-04",
      unit_price: 450,
      purchase_date: "2026-02-18",
      purchase_no: "CP-2026-003",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-resistors.pdf",
      invoice_pdf_name: "SUNROB_ESP32_INV_1102.pdf",
      remarks: "Consumable modules given to student teams for research prototypes.",
      created_at: "2026-02-18T10:00:00.000Z",
      updated_at: "2026-02-25T11:15:00.000Z",
    },
    {
      id: 4,
      center_name: "Center for Advanced Studies",
      part_no: "CEN-ROB-LIDAR",
      item_name: "LiDAR RPLIDAR A2M8 360 Degree Laser Scanner",
      item_type: "non_consumable",
      category: "Robotics & Edge AI",
      total_purchased: 3,
      available_quantity: 2,
      issued_quantity: 1,
      condemned_quantity: 0,
      repair_quantity: 0,
      unit: "units",
      location: "Optics & Sensors Locker",
      unit_price: 32000,
      purchase_date: "2026-03-01",
      purchase_no: "CP-2026-004",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-dso.pdf",
      invoice_pdf_name: "RPLIDAR_INV_7781.pdf",
      remarks: "Used for 12-meter range laser mapping and navigation robots.",
      created_at: "2026-03-01T15:00:00.000Z",
      updated_at: "2026-03-05T09:40:00.000Z",
    },
    {
      id: 5,
      center_name: "Center for Advanced Studies",
      part_no: "CEN-3D-PLA-PRO",
      item_name: "PLA+ High Speed 3D Printer Filament 1.75mm (1kg Black)",
      item_type: "consumable",
      category: "3D Printing & Prototyping",
      total_purchased: 20,
      available_quantity: 14,
      issued_quantity: 6,
      condemned_quantity: 0,
      repair_quantity: 0,
      unit: "spools",
      location: "Material Storage Cabinet D",
      unit_price: 1250,
      purchase_date: "2026-01-20",
      purchase_no: "CP-2026-000",
      invoice_pdf_url: "/uploads/inventory/sample-invoice-resistors.pdf",
      invoice_pdf_name: "FILAMENT_STORE_INV_3310.pdf",
      remarks: "Premium filament for Bambu Lab rapid prototyping printer.",
      created_at: "2026-01-20T10:00:00.000Z",
      updated_at: "2026-02-14T14:20:00.000Z",
    },
  ],
  issues: [
    {
      id: 1,
      issue_code: "ISS-CEN-2026-001",
      inventory_id: 1,
      item_name: "NVIDIA Jetson Orin Nano Developer Kit (8GB)",
      item_type: "non_consumable",
      part_no: "CEN-AI-JET01",
      quantity: 1,
      issued_to_name: "Aman Verma",
      issued_to_email: "23ucs045@lnmiit.ac.in",
      issued_to_role: "student",
      issued_to_id: "23UCS045",
      department: "CSE",
      issue_date: "2026-02-10 14:30",
      expected_return_date: "2026-03-10",
      actual_return_date: null,
      purpose: "Deep learning object detection for autonomous navigation drone project.",
      status: "issued",
      issued_by_name: "Prof. Center Lead",
      remarks: "Kit issued with 19V power supply and HDMI cable.",
      created_at: "2026-02-10T14:30:00.000Z",
      updated_at: "2026-02-10T14:30:00.000Z",
    },
    {
      id: 2,
      issue_code: "ISS-CEN-2026-002",
      inventory_id: 2,
      item_name: "Raspberry Pi 5 (8GB RAM) High Performance Single Board",
      item_type: "non_consumable",
      part_no: "CEN-IOT-RPI5",
      quantity: 2,
      issued_to_name: "Dr. Ankit Agarwal",
      issued_to_email: "ankit.agarwal@lnmiit.ac.in",
      issued_to_role: "faculty",
      issued_to_id: "EMP-ECE-108",
      department: "ECE",
      issue_date: "2026-02-12 11:00",
      expected_return_date: "2026-02-28",
      actual_return_date: null,
      purpose: "Smart energy grid monitoring research and wireless gateway testbed.",
      status: "overdue",
      issued_by_name: "Prof. Center Lead",
      remarks: "Overdue reminder scheduled. Units checked out for collaborative grant research.",
      created_at: "2026-02-12T11:00:00.000Z",
      updated_at: "2026-03-01T09:00:00.000Z",
    },
    {
      id: 3,
      issue_code: "ISS-CEN-2026-003",
      inventory_id: 4,
      item_name: "LiDAR RPLIDAR A2M8 360 Degree Laser Scanner",
      item_type: "non_consumable",
      part_no: "CEN-ROB-LIDAR",
      quantity: 1,
      issued_to_name: "Pooja Sharma",
      issued_to_email: "23ume012@lnmiit.ac.in",
      issued_to_role: "student",
      issued_to_id: "23UME012",
      department: "MME",
      issue_date: "2026-03-02 16:00",
      expected_return_date: "2026-03-25",
      actual_return_date: null,
      purpose: "UGP B.Tech Capstone: Autonomous obstacle avoidance ground rover.",
      status: "issued",
      issued_by_name: "Prof. Center Lead",
      remarks: "USB interface board and ribbon cable included.",
      created_at: "2026-03-02T16:00:00.000Z",
      updated_at: "2026-03-02T16:00:00.000Z",
    },
    {
      id: 4,
      issue_code: "ISS-CEN-2026-004",
      inventory_id: 2,
      item_name: "Raspberry Pi 5 (8GB RAM) High Performance Single Board",
      item_type: "non_consumable",
      part_no: "CEN-IOT-RPI5",
      quantity: 1,
      issued_to_name: "Karan Patel",
      issued_to_email: "22ucc019@lnmiit.ac.in",
      issued_to_role: "student",
      issued_to_id: "22UCC019",
      department: "CCE",
      issue_date: "2026-01-20 10:00",
      expected_return_date: "2026-02-05",
      actual_return_date: "2026-02-04 15:30",
      purpose: "Edge gateway test for smart water management sensor node.",
      status: "returned",
      return_condition: "good",
      issued_by_name: "Prof. Center Lead",
      returned_to_name: "Prof. Center Lead",
      remarks: "Returned in original ESD bag. Fully functional.",
      created_at: "2026-01-20T10:00:00.000Z",
      updated_at: "2026-02-04T15:30:00.000Z",
    },
  ],
  adjustments: [
    {
      id: 1,
      inventory_id: 1,
      action_type: "purchase_add",
      quantity_change: 5,
      prev_available: 0,
      new_available: 5,
      prev_issued: 0,
      new_issued: 0,
      remark: "Initial stock received via Purchase Order CP-2026-001.",
      performed_by: "Prof. Center Lead",
      created_at: "2026-01-15T11:30:00.000Z",
    },
    {
      id: 2,
      inventory_id: 2,
      action_type: "repair_send",
      quantity_change: -1,
      prev_available: 9,
      new_available: 8,
      prev_issued: 3,
      new_issued: 3,
      remark: "Unit sent to warranty center for micro-HDMI port repair.",
      performed_by: "Prof. Center Lead",
      created_at: "2026-02-20T12:00:00.000Z",
    },
  ],
}

function loadCenterStore(): CenterStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8")
      const parsed = JSON.parse(raw)
      return {
        purchases: Array.isArray(parsed.purchases) ? parsed.purchases : initialCenterStore.purchases,
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : initialCenterStore.inventory,
        issues: Array.isArray(parsed.issues) ? parsed.issues : initialCenterStore.issues,
        adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : initialCenterStore.adjustments,
      }
    }
  } catch (e) {
    console.error("Error loading center store JSON:", e)
  }
  saveCenterStore(initialCenterStore)
  return initialCenterStore
}

function saveCenterStore(data: CenterStoreData): void {
  try {
    const dir = path.dirname(STORE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (e) {
    console.error("Error saving center store JSON:", e)
  }
}

// Ensure database tables exist if DB is online
export async function ensureCenterSchema(): Promise<boolean> {
  try {
    const db = Database.getInstance()
    await db.query(`
      CREATE TABLE IF NOT EXISTS center_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_no VARCHAR(100) NOT NULL UNIQUE,
        item_name VARCHAR(255) NOT NULL,
        item_type ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
        category VARCHAR(100) DEFAULT 'General',
        quantity INT NOT NULL DEFAULT 1,
        unit VARCHAR(50) DEFAULT 'pcs',
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        vendor_name VARCHAR(200) NOT NULL,
        vendor_contact VARCHAR(150) NULL,
        purchase_date DATE NOT NULL,
        invoice_pdf_url TEXT NULL,
        invoice_pdf_name VARCHAR(255) NULL,
        status ENUM('received', 'ordered', 'cancelled') NOT NULL DEFAULT 'received',
        added_to_inventory TINYINT(1) NOT NULL DEFAULT 1,
        remarks TEXT NULL,
        purchased_by VARCHAR(150) NULL,
        center_name VARCHAR(150) DEFAULT 'Center for Advanced Studies',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS center_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        center_name VARCHAR(150) DEFAULT 'Center for Advanced Studies',
        part_no VARCHAR(100) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_type ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
        category VARCHAR(100) DEFAULT 'General',
        total_purchased INT NOT NULL DEFAULT 0,
        available_quantity INT NOT NULL DEFAULT 0,
        issued_quantity INT NOT NULL DEFAULT 0,
        condemned_quantity INT NOT NULL DEFAULT 0,
        repair_quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pcs',
        location VARCHAR(100) DEFAULT 'Center Storage',
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        purchase_date DATE NULL,
        purchase_no VARCHAR(100) NULL,
        invoice_pdf_url TEXT NULL,
        invoice_pdf_name VARCHAR(255) NULL,
        remarks TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_c_part_no (part_no),
        INDEX idx_c_item_type (item_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS center_item_issues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        issue_code VARCHAR(100) NOT NULL UNIQUE,
        inventory_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_type ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
        part_no VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        issued_to_name VARCHAR(150) NOT NULL,
        issued_to_email VARCHAR(255) NOT NULL,
        issued_to_role ENUM('student', 'faculty', 'staff', 'other') NOT NULL DEFAULT 'student',
        issued_to_id VARCHAR(50) NULL,
        department VARCHAR(100) NULL,
        issue_date DATETIME NOT NULL,
        expected_return_date DATE NULL,
        actual_return_date DATETIME NULL,
        purpose TEXT NULL,
        status ENUM('issued', 'returned', 'overdue', 'lost') NOT NULL DEFAULT 'issued',
        return_condition ENUM('good', 'minor_damage', 'damaged', 'lost') NULL,
        issued_by_name VARCHAR(150) NOT NULL,
        returned_to_name VARCHAR(150) NULL,
        remarks TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_c_issue_inv (inventory_id),
        INDEX idx_c_issue_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    return true
  } catch (err) {
    return false
  }
}

// ==========================================
// 1. CENTER PURCHASES ("Dept Purchase")
// ==========================================

export async function getCenterPurchases(filters?: {
  search?: string
  category?: string
  status?: string
  item_type?: string
}): Promise<CenterPurchase[]> {
  const isDb = await ensureCenterSchema()
  if (isDb) {
    try {
      const db = Database.getInstance()
      let query = "SELECT * FROM center_purchases WHERE 1=1"
      const params: any[] = []
      if (filters?.item_type && filters.item_type !== "all") {
        query += " AND item_type = ?"
        params.push(filters.item_type)
      }
      if (filters?.category && filters.category !== "all") {
        query += " AND category = ?"
        params.push(filters.category)
      }
      if (filters?.status && filters.status !== "all") {
        query += " AND status = ?"
        params.push(filters.status)
      }
      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim().toLowerCase()}%`
        query += " AND (LOWER(item_name) LIKE ? OR LOWER(purchase_no) LIKE ? OR LOWER(vendor_name) LIKE ?)"
        params.push(s, s, s)
      }
      query += " ORDER BY purchase_date DESC, id DESC"
      const res = await db.query(query, params)
      if (res.rows && res.rows.length > 0) {
        return res.rows as CenterPurchase[]
      }
    } catch (e) {
      console.warn("DB query failed, fallback to JSON store:", e)
    }
  }

  // Fallback to JSON store
  const store = loadCenterStore()
  let list = [...store.purchases]

  if (filters?.item_type && filters.item_type !== "all") {
    list = list.filter((p) => p.item_type === filters.item_type)
  }
  if (filters?.category && filters.category !== "all") {
    list = list.filter((p) => p.category === filters.category)
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((p) => p.status === filters.status)
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase()
    list = list.filter(
      (p) =>
        p.item_name.toLowerCase().includes(s) ||
        p.purchase_no.toLowerCase().includes(s) ||
        p.vendor_name.toLowerCase().includes(s) ||
        (p.category && p.category.toLowerCase().includes(s))
    )
  }

  return list.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
}

export async function addCenterPurchase(data: {
  purchase_no?: string
  item_name: string
  item_type: "consumable" | "non_consumable"
  category: string
  quantity: number
  unit: string
  unit_price: number
  total_amount?: number
  vendor_name: string
  vendor_contact?: string
  purchase_date: string
  invoice_pdf_url?: string
  invoice_pdf_name?: string
  status?: "received" | "ordered" | "cancelled"
  added_to_inventory?: boolean
  remarks?: string
  purchased_by?: string
  center_name?: string
  part_no?: string // For automatic inventory synchronization
  location?: string
}): Promise<CenterPurchase> {
  const store = loadCenterStore()
  const now = new Date().toISOString()
  const purchaseNo = data.purchase_no && data.purchase_no.trim() 
    ? data.purchase_no.trim() 
    : `CP-${new Date().getFullYear()}-${String(store.purchases.length + 1).padStart(3, "0")}`

  const qty = Number(data.quantity) || 1
  const price = Number(data.unit_price) || 0
  const total = Number(data.total_amount) || qty * price
  const centerName = data.center_name || "Center for Advanced Studies"
  const shouldAddToInventory = data.added_to_inventory !== false

  const newPurchase: CenterPurchase = {
    id: store.purchases.length > 0 ? Math.max(...store.purchases.map((p) => p.id)) + 1 : 1,
    purchase_no: purchaseNo,
    item_name: data.item_name.trim(),
    item_type: data.item_type || "consumable",
    category: data.category?.trim() || "General",
    quantity: qty,
    unit: data.unit?.trim() || "pcs",
    unit_price: price,
    total_amount: total,
    vendor_name: data.vendor_name.trim(),
    vendor_contact: data.vendor_contact?.trim() || null,
    purchase_date: data.purchase_date || now.split("T")[0],
    invoice_pdf_url: data.invoice_pdf_url || "/uploads/inventory/sample-invoice-dso.pdf",
    invoice_pdf_name: data.invoice_pdf_name || `${purchaseNo}_Invoice.pdf`,
    status: data.status || "received",
    added_to_inventory: shouldAddToInventory,
    remarks: data.remarks?.trim() || null,
    purchased_by: data.purchased_by || "Prof. Center Lead",
    center_name: centerName,
    created_at: now,
  }

  // 1. If requested, automatically create or increase stock in Center Inventory
  if (shouldAddToInventory && newPurchase.status === "received") {
    const partNo = data.part_no && data.part_no.trim() 
      ? data.part_no.trim() 
      : `CEN-${data.item_name.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase()}-${String(store.inventory.length + 1).padStart(3, "0")}`

    const existingIdx = store.inventory.findIndex(
      (inv) => inv.part_no.toLowerCase() === partNo.toLowerCase() || inv.item_name.toLowerCase() === newPurchase.item_name.toLowerCase()
    )

    if (existingIdx >= 0) {
      const inv = store.inventory[existingIdx]
      inv.total_purchased += qty
      inv.available_quantity += qty
      inv.updated_at = now
      if (newPurchase.invoice_pdf_url) {
        inv.invoice_pdf_url = newPurchase.invoice_pdf_url
        inv.invoice_pdf_name = newPurchase.invoice_pdf_name
      }
      inv.purchase_no = newPurchase.purchase_no
      inv.purchase_date = newPurchase.purchase_date
    } else {
      const newInvItem: CenterInventoryItem = {
        id: store.inventory.length > 0 ? Math.max(...store.inventory.map((i) => i.id)) + 1 : 1,
        center_name: centerName,
        part_no: partNo,
        item_name: newPurchase.item_name,
        item_type: newPurchase.item_type,
        category: newPurchase.category,
        total_purchased: qty,
        available_quantity: qty,
        issued_quantity: 0,
        condemned_quantity: 0,
        repair_quantity: 0,
        unit: newPurchase.unit,
        location: data.location?.trim() || "Center Storage Bay",
        unit_price: price,
        purchase_date: newPurchase.purchase_date,
        purchase_no: newPurchase.purchase_no,
        invoice_pdf_url: newPurchase.invoice_pdf_url,
        invoice_pdf_name: newPurchase.invoice_pdf_name,
        remarks: newPurchase.remarks,
        created_at: now,
        updated_at: now,
      }
      store.inventory.push(newInvItem)
    }

    // Add adjustment log
    store.adjustments.push({
      id: store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1,
      inventory_id: existingIdx >= 0 ? store.inventory[existingIdx].id : store.inventory[store.inventory.length - 1].id,
      action_type: "purchase_add",
      quantity_change: qty,
      prev_available: existingIdx >= 0 ? store.inventory[existingIdx].available_quantity - qty : 0,
      new_available: existingIdx >= 0 ? store.inventory[existingIdx].available_quantity : qty,
      prev_issued: existingIdx >= 0 ? store.inventory[existingIdx].issued_quantity : 0,
      new_issued: existingIdx >= 0 ? store.inventory[existingIdx].issued_quantity : 0,
      remark: `Received purchase ${newPurchase.purchase_no} from ${newPurchase.vendor_name}`,
      performed_by: newPurchase.purchased_by,
      created_at: now,
    })
  }

  store.purchases.push(newPurchase)
  saveCenterStore(store)

  // Try DB persistence
  try {
    const isDb = await ensureCenterSchema()
    if (isDb) {
      const db = Database.getInstance()
      await db.query(
        `INSERT INTO center_purchases 
         (purchase_no, item_name, item_type, category, quantity, unit, unit_price, total_amount, vendor_name, vendor_contact, purchase_date, invoice_pdf_url, invoice_pdf_name, status, added_to_inventory, remarks, purchased_by, center_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newPurchase.purchase_no,
          newPurchase.item_name,
          newPurchase.item_type,
          newPurchase.category,
          newPurchase.quantity,
          newPurchase.unit,
          newPurchase.unit_price,
          newPurchase.total_amount,
          newPurchase.vendor_name,
          newPurchase.vendor_contact,
          newPurchase.purchase_date,
          newPurchase.invoice_pdf_url,
          newPurchase.invoice_pdf_name,
          newPurchase.status,
          newPurchase.added_to_inventory ? 1 : 0,
          newPurchase.remarks,
          newPurchase.purchased_by,
          newPurchase.center_name,
          newPurchase.created_at,
        ]
      )
    }
  } catch (err) {
    console.warn("Could not insert purchase into DB table, saved to JSON store successfully:", err)
  }

  return newPurchase
}

// ==========================================
// 2. CENTER INVENTORY ("Invenbtry sb alag hoga")
// ==========================================

export async function getCenterInventoryItems(filters?: {
  search?: string
  category?: string
  item_type?: string
  repair_only?: boolean
}): Promise<{
  items: CenterInventoryItem[]
  stats: {
    total_items: number
    total_purchased: number
    total_available: number
    total_issued: number
    total_condemned: number
    total_under_repair: number
    total_value: number
  }
}> {
  const store = loadCenterStore()
  let list = [...store.inventory]

  if (filters?.repair_only) {
    list = list.filter((i) => i.repair_quantity > 0)
  } else if (filters?.item_type && filters.item_type !== "all") {
    list = list.filter((i) => i.item_type === filters.item_type)
  }
  if (filters?.category && filters.category !== "all") {
    list = list.filter((i) => i.category === filters.category)
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase()
    list = list.filter(
      (i) =>
        i.item_name.toLowerCase().includes(s) ||
        i.part_no.toLowerCase().includes(s) ||
        (i.location && i.location.toLowerCase().includes(s)) ||
        (i.category && i.category.toLowerCase().includes(s))
    )
  }

  const allItems = store.inventory
  const stats = {
    total_items: allItems.length,
    total_purchased: allItems.reduce((acc, i) => acc + (Number(i.total_purchased) || 0), 0),
    total_available: allItems.reduce((acc, i) => acc + (Number(i.available_quantity) || 0), 0),
    total_issued: allItems.reduce((acc, i) => acc + (Number(i.issued_quantity) || 0), 0),
    total_condemned: allItems.reduce((acc, i) => acc + (Number(i.condemned_quantity) || 0), 0),
    total_under_repair: allItems.reduce((acc, i) => acc + (Number(i.repair_quantity) || 0), 0),
    total_value: allItems.reduce((acc, i) => acc + (Number(i.total_purchased) || 0) * (Number(i.unit_price) || 0), 0),
  }

  return { items: list, stats }
}

export async function addCenterInventoryItem(data: {
  part_no: string
  item_name: string
  item_type: "consumable" | "non_consumable"
  category: string
  total_purchased: number
  unit: string
  location?: string
  unit_price?: number
  purchase_date?: string
  purchase_no?: string
  invoice_pdf_url?: string
  invoice_pdf_name?: string
  remarks?: string
  center_name?: string
}): Promise<CenterInventoryItem> {
  const store = loadCenterStore()
  const now = new Date().toISOString()
  const qty = Number(data.total_purchased) || 1

  const newItem: CenterInventoryItem = {
    id: store.inventory.length > 0 ? Math.max(...store.inventory.map((i) => i.id)) + 1 : 1,
    center_name: data.center_name || "Center for Advanced Studies",
    part_no: data.part_no.trim(),
    item_name: data.item_name.trim(),
    item_type: data.item_type || "consumable",
    category: data.category?.trim() || "General",
    total_purchased: qty,
    available_quantity: qty,
    issued_quantity: 0,
    condemned_quantity: 0,
    repair_quantity: 0,
    unit: data.unit?.trim() || "pcs",
    location: data.location?.trim() || "Center Storage Room",
    unit_price: Number(data.unit_price) || 0,
    purchase_date: data.purchase_date || now.split("T")[0],
    purchase_no: data.purchase_no || null,
    invoice_pdf_url: data.invoice_pdf_url || null,
    invoice_pdf_name: data.invoice_pdf_name || null,
    remarks: data.remarks?.trim() || null,
    created_at: now,
    updated_at: now,
  }

  store.inventory.push(newItem)
  store.adjustments.push({
    id: store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1,
    inventory_id: newItem.id,
    action_type: "purchase_add",
    quantity_change: qty,
    prev_available: 0,
    new_available: qty,
    prev_issued: 0,
    new_issued: 0,
    remark: "Direct addition to Center Inventory",
    performed_by: "Prof. Center Lead",
    created_at: now,
  })

  saveCenterStore(store)
  return newItem
}

export async function adjustCenterInventoryStock(data: {
  inventory_id: number
  action_type: "purchase_add" | "consumed" | "condemned" | "repair_send" | "repair_return" | "stock_adjustment"
  quantity_change: number
  remark: string
  proof_doc_url?: string
  proof_doc_name?: string
  performed_by?: string
}): Promise<CenterInventoryItem> {
  const store = loadCenterStore()
  const item = store.inventory.find((i) => i.id === Number(data.inventory_id))
  if (!item) throw new Error("Center inventory item not found")

  const delta = Number(data.quantity_change)
  const prevAvail = item.available_quantity
  const prevIssued = item.issued_quantity
  const prevCondemned = item.condemned_quantity
  const prevRepair = item.repair_quantity

  switch (data.action_type) {
    case "purchase_add":
      item.total_purchased += delta
      item.available_quantity += delta
      break
    case "consumed":
      if (item.available_quantity < delta) throw new Error("Insufficient available stock to consume")
      item.available_quantity -= delta
      item.issued_quantity += delta
      break
    case "condemned":
      if (item.available_quantity < delta) throw new Error("Insufficient available stock to condemn")
      item.available_quantity -= delta
      item.condemned_quantity += delta
      break
    case "repair_send":
      if (item.available_quantity < delta) throw new Error("Insufficient available stock to send for repair")
      item.available_quantity -= delta
      item.repair_quantity += delta
      break
    case "repair_return":
      if (item.repair_quantity < delta) throw new Error("Quantity exceeds items currently under repair")
      item.repair_quantity -= delta
      item.available_quantity += delta
      break
    case "stock_adjustment":
      item.available_quantity += delta
      if (item.available_quantity < 0) item.available_quantity = 0
      break
  }

  item.updated_at = new Date().toISOString()

  store.adjustments.push({
    id: store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1,
    inventory_id: item.id,
    action_type: data.action_type,
    quantity_change: delta,
    prev_available: prevAvail,
    new_available: item.available_quantity,
    prev_issued: prevIssued,
    new_issued: item.issued_quantity,
    remark: data.remark,
    proof_doc_url: data.proof_doc_url || null,
    proof_doc_name: data.proof_doc_name || null,
    performed_by: data.performed_by || "Prof. Center Lead",
    created_at: new Date().toISOString(),
  })

  saveCenterStore(store)
  return item
}

// ==========================================
// 3. CENTER ISSUE & RETURN ("Ussye and Return")
// ==========================================

export async function getCenterIssues(filters?: {
  search?: string
  status?: string
}): Promise<CenterItemIssue[]> {
  const store = loadCenterStore()
  let list = [...store.issues]

  // Dynamic overdue computation for items with expected_return_date < today
  const todayStr = new Date().toISOString().split("T")[0]
  list = list.map((issue) => {
    if (issue.status === "issued" && issue.expected_return_date && issue.expected_return_date < todayStr) {
      return { ...issue, status: "overdue" as const }
    }
    return issue
  })

  if (filters?.status && filters.status !== "all") {
    list = list.filter((i) => i.status === filters.status)
  }

  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase()
    list = list.filter(
      (i) =>
        i.item_name.toLowerCase().includes(s) ||
        i.issued_to_name.toLowerCase().includes(s) ||
        i.issued_to_email.toLowerCase().includes(s) ||
        i.issue_code.toLowerCase().includes(s) ||
        (i.issued_to_id && i.issued_to_id.toLowerCase().includes(s))
    )
  }

  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function createCenterIssue(data: {
  inventory_id: number
  quantity: number
  issued_to_name: string
  issued_to_email: string
  issued_to_role?: "student" | "faculty" | "staff" | "other"
  issued_to_id?: string
  department?: string
  expected_return_date?: string
  purpose?: string
  issued_by_name?: string
  remarks?: string
}): Promise<CenterItemIssue> {
  const store = loadCenterStore()
  const invItem = store.inventory.find((i) => i.id === Number(data.inventory_id))
  if (!invItem) throw new Error("Center inventory item not found")

  const qty = Number(data.quantity) || 1
  if (qty <= 0) throw new Error("Quantity must be at least 1")
  if (invItem.available_quantity < qty) {
    throw new Error(`Only ${invItem.available_quantity} ${invItem.unit} available in stock`)
  }

  const now = new Date().toISOString()
  const issueDateFormatted = `${now.split("T")[0]} ${now.split("T")[1].slice(0, 5)}`
  const issueCode = `ISS-CEN-${new Date().getFullYear()}-${String(store.issues.length + 1).padStart(3, "0")}`

  // 1. Deduct from available stock and add to issued quantity
  invItem.available_quantity -= qty
  invItem.issued_quantity += qty
  invItem.updated_at = now

  const newIssue: CenterItemIssue = {
    id: store.issues.length > 0 ? Math.max(...store.issues.map((i) => i.id)) + 1 : 1,
    issue_code: issueCode,
    inventory_id: invItem.id,
    item_name: invItem.item_name,
    item_type: invItem.item_type,
    part_no: invItem.part_no,
    quantity: qty,
    issued_to_name: data.issued_to_name.trim(),
    issued_to_email: data.issued_to_email.trim(),
    issued_to_role: data.issued_to_role || "student",
    issued_to_id: data.issued_to_id?.trim() || "",
    department: data.department?.trim() || "CSE",
    issue_date: issueDateFormatted,
    expected_return_date: data.expected_return_date || null,
    actual_return_date: null,
    purpose: data.purpose?.trim() || "Center research / coursework",
    status: "issued",
    return_condition: null,
    issued_by_name: data.issued_by_name || "Prof. Center Lead",
    remarks: data.remarks?.trim() || null,
    created_at: now,
    updated_at: now,
  }

  store.issues.push(newIssue)

  // Record audit adjustment
  store.adjustments.push({
    id: store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1,
    inventory_id: invItem.id,
    action_type: "issue",
    quantity_change: -qty,
    prev_available: invItem.available_quantity + qty,
    new_available: invItem.available_quantity,
    prev_issued: invItem.issued_quantity - qty,
    new_issued: invItem.issued_quantity,
    remark: `Issued ${qty} ${invItem.unit} to ${newIssue.issued_to_name} (${newIssue.issue_code})`,
    performed_by: newIssue.issued_by_name,
    created_at: now,
  })

  saveCenterStore(store)
  return newIssue
}

export async function returnCenterIssue(data: {
  issue_id: number
  return_condition?: "good" | "minor_damage" | "damaged" | "lost"
  return_remarks?: string
  returned_to_name?: string
}): Promise<CenterItemIssue> {
  const store = loadCenterStore()
  const issue = store.issues.find((i) => i.id === Number(data.issue_id))
  if (!issue) throw new Error("Issue record not found")
  if (issue.status === "returned") throw new Error("Item has already been marked as returned")

  const now = new Date().toISOString()
  const returnDateFormatted = `${now.split("T")[0]} ${now.split("T")[1].slice(0, 5)}`
  const condition = data.return_condition || "good"
  const qty = issue.quantity

  // Locate the inventory item to restore stock
  const invItem = store.inventory.find((i) => i.id === issue.inventory_id)
  if (invItem) {
    const prevAvail = invItem.available_quantity
    const prevIssued = invItem.issued_quantity
    invItem.issued_quantity = Math.max(0, invItem.issued_quantity - qty)

    if (condition === "damaged" || condition === "lost") {
      invItem.condemned_quantity += qty
    } else {
      invItem.available_quantity += qty
    }
    invItem.updated_at = now

    store.adjustments.push({
      id: store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1,
      inventory_id: invItem.id,
      action_type: "return",
      quantity_change: condition === "damaged" || condition === "lost" ? 0 : qty,
      prev_available: prevAvail,
      new_available: invItem.available_quantity,
      prev_issued: prevIssued,
      new_issued: invItem.issued_quantity,
      remark: `Returned ${qty} ${invItem.unit} by ${issue.issued_to_name}. Condition: ${condition}. ${data.return_remarks || ""}`,
      performed_by: data.returned_to_name || "Prof. Center Lead",
      created_at: now,
    })
  }

  issue.status = "returned"
  issue.actual_return_date = returnDateFormatted
  issue.return_condition = condition
  issue.returned_to_name = data.returned_to_name || "Prof. Center Lead"
  if (data.return_remarks) {
    issue.remarks = issue.remarks 
      ? `${issue.remarks} | Return: ${data.return_remarks}` 
      : data.return_remarks
  }
  issue.updated_at = now

  saveCenterStore(store)
  return issue
}

// ==========================================
// 4. CENTER OVERVIEW STATS (For Main Dashboard)
// ==========================================

export async function getCenterDashboardStats() {
  const store = loadCenterStore()
  const todayStr = new Date().toISOString().split("T")[0]

  const activeIssued = store.issues.filter((i) => i.status === "issued" && (!i.expected_return_date || i.expected_return_date >= todayStr))
  const overdueIssued = store.issues.filter((i) => i.status === "overdue" || (i.status === "issued" && i.expected_return_date && i.expected_return_date < todayStr))
  const returnedIssues = store.issues.filter((i) => i.status === "returned")

  const totalPurchasesAmount = store.purchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0)
  const totalAvailableStock = store.inventory.reduce((acc, i) => acc + (Number(i.available_quantity) || 0), 0)
  const totalInventoryItems = store.inventory.length
  const totalUnderRepair = store.inventory.reduce((acc, i) => acc + (Number(i.repair_quantity) || 0), 0)

  return {
    total_inventory_items: totalInventoryItems,
    total_available_stock: totalAvailableStock,
    active_issued_count: activeIssued.length,
    overdue_count: overdueIssued.length,
    returned_count: returnedIssues.length,
    total_purchases_count: store.purchases.length,
    total_purchases_amount: totalPurchasesAmount,
    total_under_repair: totalUnderRepair,
    recent_purchases: store.purchases.slice(0, 5),
    recent_issues: store.issues.slice(0, 5),
    low_stock_items: store.inventory.filter((i) => i.available_quantity <= 2),
  }
}
