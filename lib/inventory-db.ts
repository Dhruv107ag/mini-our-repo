/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Inventory Database Service with MySQL and Persistent JSON Fallback
 * Enhanced with Under Repair / Needs Repair tracking for Non-Consumable equipment
 */

import fs from "fs"
import path from "path"
import { Database } from "@/lib/database"

export interface InventoryItem {
  id: number
  lab_id: number
  lab_name: string
  part_no: string
  item_name: string
  item_type: "consumable" | "non_consumable"
  category: string
  purchase_quantity: number
  available_quantity: number
  consumed_quantity: number
  condemned_quantity: number
  repair_quantity: number // Non-consumable Under Repair / Need Repair quantity
  unit: string
  purchase_date: string | null
  purchase_pdf_url: string | null
  purchase_pdf_name: string | null
  remarks: string | null
  created_by_name?: string | null
  created_at: string
  updated_at: string
}

export interface InventoryAdjustment {
  id: number
  inventory_id: number
  action_type:
    | "purchase_add"
    | "consumed"
    | "condemned"
    | "stock_adjustment"
    | "send_repair"
    | "return_repair"
  quantity_change: number
  prev_available: number
  new_available: number
  prev_consumed: number
  new_consumed: number
  prev_condemned: number
  new_condemned: number
  prev_repair?: number
  new_repair?: number
  remark: string
  proof_doc_url: string | null
  proof_doc_name: string | null
  purchase_pdf_url?: string | null
  purchase_pdf_name?: string | null
  performed_by_id?: number | null
  performed_by_name?: string | null
  performed_by_role?: string | null
  created_at: string
}

interface InventoryStore {
  items: InventoryItem[]
  adjustments: InventoryAdjustment[]
}

const STORE_PATH = path.resolve(process.cwd(), "data", "inventory-store.json")

function loadStore(): InventoryStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8")
      const parsed = JSON.parse(raw)
      // Normalize items to ensure repair_quantity exists
      if (Array.isArray(parsed.items)) {
        parsed.items = parsed.items.map((i: any) => ({
          ...i,
          repair_quantity: Number(i.repair_quantity) || 0,
        }))
      }
      return parsed
    }
  } catch (e) {
    console.error("Error loading inventory store JSON:", e)
  }
  return { items: [], adjustments: [] }
}

function saveStore(data: InventoryStore): void {
  try {
    const dir = path.dirname(STORE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (e) {
    console.error("Error saving inventory store JSON:", e)
  }
}

const db = Database.getInstance()

export async function ensureInventorySchema(): Promise<boolean> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS lab_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lab_id INT NOT NULL,
        lab_name VARCHAR(150) NULL,
        part_no VARCHAR(100) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_type ENUM('consumable', 'non_consumable') NOT NULL DEFAULT 'consumable',
        category VARCHAR(100) DEFAULT 'General',
        purchase_quantity INT NOT NULL DEFAULT 0,
        available_quantity INT NOT NULL DEFAULT 0,
        consumed_quantity INT NOT NULL DEFAULT 0,
        condemned_quantity INT NOT NULL DEFAULT 0,
        repair_quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pcs',
        purchase_date DATE NULL,
        purchase_pdf_url TEXT NULL,
        purchase_pdf_name VARCHAR(255) NULL,
        remarks TEXT NULL,
        created_by_name VARCHAR(150) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_inv_lab (lab_id),
        INDEX idx_inv_part_no (part_no),
        INDEX idx_inv_type (item_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS lab_inventory_adjustments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_id INT NOT NULL,
        action_type ENUM('purchase_add', 'consumed', 'condemned', 'stock_adjustment', 'send_repair', 'return_repair') NOT NULL,
        quantity_change INT NOT NULL,
        prev_available INT NOT NULL,
        new_available INT NOT NULL,
        prev_consumed INT NOT NULL,
        new_consumed INT NOT NULL,
        prev_condemned INT NOT NULL,
        new_condemned INT NOT NULL,
        prev_repair INT NOT NULL DEFAULT 0,
        new_repair INT NOT NULL DEFAULT 0,
        remark TEXT NOT NULL,
        proof_doc_url TEXT NULL,
        proof_doc_name VARCHAR(255) NULL,
        purchase_pdf_url TEXT NULL,
        purchase_pdf_name VARCHAR(255) NULL,
        performed_by_id INT NULL,
        performed_by_name VARCHAR(150) NULL,
        performed_by_role VARCHAR(50) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_adj_inv_id (inventory_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    return true
  } catch (err) {
    return false
  }
}

export async function getInventoryItems(filters: {
  type?: string
  lab_id?: number
  search?: string
  repair_only?: boolean
}): Promise<{
  items: InventoryItem[]
  stats: {
    total_items: number
    total_purchased: number
    total_available: number
    total_consumed: number
    total_condemned: number
    total_under_repair: number
  }
}> {
  let items: InventoryItem[] = []

  const isDbConnected = await ensureInventorySchema()

  if (isDbConnected) {
    try {
      let queryStr = `SELECT * FROM lab_inventory WHERE 1=1`
      const params: any[] = []

      if (filters.type && filters.type !== "all") {
        queryStr += ` AND item_type = ?`
        params.push(filters.type)
      }
      if (filters.lab_id && !isNaN(filters.lab_id)) {
        queryStr += ` AND lab_id = ?`
        params.push(Number(filters.lab_id))
      }
      if (filters.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`
        queryStr += ` AND (item_name LIKE ? OR part_no LIKE ? OR category LIKE ?)`
        params.push(s, s, s)
      }
      if (filters.repair_only) {
        queryStr += ` AND repair_quantity > 0`
      }
      queryStr += ` ORDER BY item_name ASC`

      const res = await db.query(queryStr, params)
      if (res.rows && res.rows.length > 0) {
        items = res.rows as InventoryItem[]
      }
    } catch (e) {
      console.warn("DB query error in getInventoryItems, falling back to JSON store:", e)
    }
  }

  // Fallback to JSON store if DB offline or empty
  if (items.length === 0) {
    const store = loadStore()
    items = store.items

    if (filters.type && filters.type !== "all") {
      items = items.filter((i) => i.item_type === filters.type)
    }
    if (filters.lab_id && !isNaN(filters.lab_id)) {
      items = items.filter((i) => Number(i.lab_id) === Number(filters.lab_id))
    }
    if (filters.repair_only) {
      items = items.filter((i) => (Number(i.repair_quantity) || 0) > 0)
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase()
      items = items.filter(
        (i) =>
          i.item_name.toLowerCase().includes(q) ||
          i.part_no.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q)
      )
    }
  }

  const stats = items.reduce(
    (acc, curr) => ({
      total_items: acc.total_items + 1,
      total_purchased: acc.total_purchased + (Number(curr.purchase_quantity) || 0),
      total_available: acc.total_available + (Number(curr.available_quantity) || 0),
      total_consumed: acc.total_consumed + (Number(curr.consumed_quantity) || 0),
      total_condemned: acc.total_condemned + (Number(curr.condemned_quantity) || 0),
      total_under_repair: acc.total_under_repair + (Number(curr.repair_quantity) || 0),
    }),
    {
      total_items: 0,
      total_purchased: 0,
      total_available: 0,
      total_consumed: 0,
      total_condemned: 0,
      total_under_repair: 0,
    }
  )

  return { items, stats }
}

export async function getInventoryItemById(id: number): Promise<InventoryItem | null> {
  const isDbConnected = await ensureInventorySchema()
  if (isDbConnected) {
    try {
      const res = await db.query(`SELECT * FROM lab_inventory WHERE id = ?`, [id])
      if (res.rows && res.rows[0]) {
        return res.rows[0] as InventoryItem
      }
    } catch (e) {}
  }
  const store = loadStore()
  return store.items.find((i) => Number(i.id) === Number(id)) || null
}

export async function addInventoryItem(data: {
  lab_id: number
  lab_name?: string
  part_no: string
  item_name: string
  item_type: "consumable" | "non_consumable"
  category?: string
  purchase_quantity: number
  repair_quantity?: number
  unit?: string
  purchase_date?: string
  purchase_pdf_url?: string
  purchase_pdf_name?: string
  remarks?: string
  user_id?: number
  user_name?: string
}): Promise<InventoryItem> {
  const now = new Date().toISOString()
  const purchaseQty = Math.max(0, Number(data.purchase_quantity) || 0)
  const repairQty = Math.max(0, Number(data.repair_quantity) || 0)
  const itemType = data.item_type === "non_consumable" ? "non_consumable" : "consumable"
  const availQty = Math.max(0, purchaseQty - repairQty)

  const isDbConnected = await ensureInventorySchema()

  if (isDbConnected) {
    try {
      const insert = await db.query(
        `INSERT INTO lab_inventory 
        (lab_id, lab_name, part_no, item_name, item_type, category, purchase_quantity, available_quantity, consumed_quantity, condemned_quantity, repair_quantity, unit, purchase_date, purchase_pdf_url, purchase_pdf_name, remarks, created_by_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.lab_id,
          data.lab_name || "General Lab",
          data.part_no.trim(),
          data.item_name.trim(),
          itemType,
          data.category?.trim() || "General",
          purchaseQty,
          availQty,
          repairQty,
          data.unit || "pcs",
          data.purchase_date || now.split("T")[0],
          data.purchase_pdf_url || null,
          data.purchase_pdf_name || null,
          data.remarks || null,
          data.user_name || "Lab Administrator",
        ]
      )

      const newItemId = insert.insertId as number

      // Record initial purchase in adjustments
      await db.query(
        `INSERT INTO lab_inventory_adjustments 
        (inventory_id, action_type, quantity_change, prev_available, new_available, prev_consumed, new_consumed, prev_condemned, new_condemned, prev_repair, new_repair, remark, purchase_pdf_url, purchase_pdf_name, performed_by_id, performed_by_name, performed_by_role)
        VALUES (?, 'purchase_add', ?, 0, ?, 0, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, 'lab_staff')`,
        [
          newItemId,
          purchaseQty,
          availQty,
          repairQty,
          data.remarks || "Initial stock purchase entry.",
          data.purchase_pdf_url || null,
          data.purchase_pdf_name || null,
          data.user_id || null,
          data.user_name || "Lab Administrator",
        ]
      )

      const fetched = await db.query(`SELECT * FROM lab_inventory WHERE id = ?`, [newItemId])
      if (fetched.rows[0]) return fetched.rows[0] as InventoryItem
    } catch (e) {
      console.warn("DB insert failed in addInventoryItem, falling back to JSON store:", e)
    }
  }

  // Fallback to JSON store
  const store = loadStore()
  const nextId = store.items.length > 0 ? Math.max(...store.items.map((i) => i.id)) + 1 : 1
  const newItem: InventoryItem = {
    id: nextId,
    lab_id: Number(data.lab_id),
    lab_name: data.lab_name || "General Lab",
    part_no: data.part_no.trim(),
    item_name: data.item_name.trim(),
    item_type: itemType,
    category: data.category?.trim() || "General",
    purchase_quantity: purchaseQty,
    available_quantity: availQty,
    consumed_quantity: 0,
    condemned_quantity: 0,
    repair_quantity: repairQty,
    unit: data.unit || "pcs",
    purchase_date: data.purchase_date || now.split("T")[0],
    purchase_pdf_url: data.purchase_pdf_url || null,
    purchase_pdf_name: data.purchase_pdf_name || null,
    remarks: data.remarks || null,
    created_by_name: data.user_name || "Lab Administrator",
    created_at: now,
    updated_at: now,
  }

  const nextAdjId = store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1
  const initialAdj: InventoryAdjustment = {
    id: nextAdjId,
    inventory_id: nextId,
    action_type: "purchase_add",
    quantity_change: purchaseQty,
    prev_available: 0,
    new_available: availQty,
    prev_consumed: 0,
    new_consumed: 0,
    prev_condemned: 0,
    new_condemned: 0,
    prev_repair: 0,
    new_repair: repairQty,
    remark: data.remarks || "Initial stock purchase entry.",
    proof_doc_url: null,
    proof_doc_name: null,
    purchase_pdf_url: data.purchase_pdf_url || null,
    purchase_pdf_name: data.purchase_pdf_name || null,
    performed_by_id: data.user_id || 1,
    performed_by_name: data.user_name || "Lab Administrator",
    performed_by_role: "lab_staff",
    created_at: now,
  }

  store.items.push(newItem)
  store.adjustments.push(initialAdj)
  saveStore(store)

  return newItem
}

export async function updateInventoryQuantity(
  id: number,
  params: {
    action_type:
      | "purchase_add"
      | "consumed"
      | "condemned"
      | "stock_adjustment"
      | "send_repair"
      | "return_repair"
    quantity: number
    remark: string
    proof_doc_url?: string | null
    proof_doc_name?: string | null
    purchase_pdf_url?: string | null
    purchase_pdf_name?: string | null
    user_id?: number
    user_name?: string
    user_role?: string
  }
): Promise<{ success: boolean; item: InventoryItem; adjustment: InventoryAdjustment }> {
  const qty = Number(params.quantity)
  if (isNaN(qty) || qty <= 0) {
    throw new Error("Quantity must be a positive number greater than 0.")
  }

  const isDeduction =
    params.action_type === "consumed" ||
    params.action_type === "condemned" ||
    params.action_type === "stock_adjustment"

  // STRICT REQUIREMENT: If quantity is deducted / condemned / consumed, remark and signed proof document are MANDATORY
  if (isDeduction) {
    if (!params.remark || params.remark.trim().length < 3) {
      throw new Error("Remark is mandatory when reducing inventory quantity.")
    }
    if (!params.proof_doc_url || !params.proof_doc_url.trim()) {
      throw new Error("Proof with signed document is mandatory when reducing inventory quantity.")
    }
  }

  // Repair actions also require a remark describing the fault / repair details
  if (params.action_type === "send_repair" || params.action_type === "return_repair") {
    if (!params.remark || params.remark.trim().length < 3) {
      throw new Error("Defect / repair details are required in the remark field.")
    }
  }

  const current = await getInventoryItemById(id)
  if (!current) {
    throw new Error(`Inventory item with ID ${id} not found.`)
  }

  if (
    (isDeduction || params.action_type === "send_repair") &&
    qty > current.available_quantity
  ) {
    throw new Error(
      `Cannot adjust ${qty} ${current.unit}. Only ${current.available_quantity} ${current.unit} currently available.`
    )
  }

  if (params.action_type === "return_repair" && qty > (current.repair_quantity || 0)) {
    throw new Error(
      `Cannot return ${qty} ${current.unit} from repair. Only ${current.repair_quantity || 0} ${current.unit} currently under repair.`
    )
  }

  const now = new Date().toISOString()
  const prevAvailable = current.available_quantity
  const prevConsumed = current.consumed_quantity
  const prevCondemned = current.condemned_quantity
  const prevRepair = current.repair_quantity || 0
  let newAvailable = prevAvailable
  let newConsumed = prevConsumed
  let newCondemned = prevCondemned
  let newRepair = prevRepair
  let newPurchased = current.purchase_quantity
  let change = 0

  if (params.action_type === "consumed") {
    // Student ko dedia
    newAvailable -= qty
    newConsumed += qty
    change = -qty
  } else if (params.action_type === "condemned") {
    // Kharab hoga pr rkha rahega
    newAvailable -= qty
    newCondemned += qty
    change = -qty
  } else if (params.action_type === "stock_adjustment") {
    // General deduction
    newAvailable -= qty
    change = -qty
  } else if (params.action_type === "send_repair") {
    // Move from available to Under Repair (Need Repair)
    newAvailable -= qty
    newRepair += qty
    change = -qty
  } else if (params.action_type === "return_repair") {
    // Move from Under Repair back to Available
    newRepair -= qty
    newAvailable += qty
    change = qty
  } else if (params.action_type === "purchase_add") {
    // New restock purchase
    newPurchased += qty
    newAvailable += qty
    change = qty
  }

  const isDbConnected = await ensureInventorySchema()

  if (isDbConnected) {
    try {
      await db.query(
        `UPDATE lab_inventory SET 
          purchase_quantity = ?,
          available_quantity = ?,
          consumed_quantity = ?,
          condemned_quantity = ?,
          repair_quantity = ?,
          purchase_pdf_url = COALESCE(?, purchase_pdf_url),
          purchase_pdf_name = COALESCE(?, purchase_pdf_name),
          updated_at = NOW()
        WHERE id = ?`,
        [
          newPurchased,
          newAvailable,
          newConsumed,
          newCondemned,
          newRepair,
          params.purchase_pdf_url || null,
          params.purchase_pdf_name || null,
          id,
        ]
      )

      const adjInsert = await db.query(
        `INSERT INTO lab_inventory_adjustments 
        (inventory_id, action_type, quantity_change, prev_available, new_available, prev_consumed, new_consumed, prev_condemned, new_condemned, prev_repair, new_repair, remark, proof_doc_url, proof_doc_name, purchase_pdf_url, purchase_pdf_name, performed_by_id, performed_by_name, performed_by_role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          params.action_type,
          change,
          prevAvailable,
          newAvailable,
          prevConsumed,
          newConsumed,
          prevCondemned,
          newCondemned,
          prevRepair,
          newRepair,
          (params.remark || "").trim(),
          params.proof_doc_url || null,
          params.proof_doc_name || null,
          params.purchase_pdf_url || null,
          params.purchase_pdf_name || null,
          params.user_id || null,
          params.user_name || "Lab Administrator",
          params.user_role || "lab_staff",
        ]
      )

      const updated = await getInventoryItemById(id)
      const adj: InventoryAdjustment = {
        id: adjInsert.insertId as number,
        inventory_id: id,
        action_type: params.action_type,
        quantity_change: change,
        prev_available: prevAvailable,
        new_available: newAvailable,
        prev_consumed: prevConsumed,
        new_consumed: newConsumed,
        prev_condemned: prevCondemned,
        new_condemned: newCondemned,
        prev_repair: prevRepair,
        new_repair: newRepair,
        remark: params.remark.trim(),
        proof_doc_url: params.proof_doc_url || null,
        proof_doc_name: params.proof_doc_name || null,
        purchase_pdf_url: params.purchase_pdf_url || null,
        purchase_pdf_name: params.purchase_pdf_name || null,
        performed_by_id: params.user_id || null,
        performed_by_name: params.user_name || "Lab Administrator",
        performed_by_role: params.user_role || "lab_staff",
        created_at: now,
      }
      return { success: true, item: updated!, adjustment: adj }
    } catch (e) {
      console.warn("DB update error, falling back to JSON store:", e)
    }
  }

  // Fallback to JSON store
  const store = loadStore()
  const itemIndex = store.items.findIndex((i) => Number(i.id) === Number(id))
  if (itemIndex === -1) {
    throw new Error(`Inventory item with ID ${id} not found in store.`)
  }

  const updatedItem: InventoryItem = {
    ...store.items[itemIndex],
    purchase_quantity: newPurchased,
    available_quantity: newAvailable,
    consumed_quantity: newConsumed,
    condemned_quantity: newCondemned,
    repair_quantity: newRepair,
    purchase_pdf_url: params.purchase_pdf_url || store.items[itemIndex].purchase_pdf_url,
    purchase_pdf_name: params.purchase_pdf_name || store.items[itemIndex].purchase_pdf_name,
    updated_at: now,
  }

  const nextAdjId = store.adjustments.length > 0 ? Math.max(...store.adjustments.map((a) => a.id)) + 1 : 1
  const adj: InventoryAdjustment = {
    id: nextAdjId,
    inventory_id: id,
    action_type: params.action_type,
    quantity_change: change,
    prev_available: prevAvailable,
    new_available: newAvailable,
    prev_consumed: prevConsumed,
    new_consumed: newConsumed,
    prev_condemned: prevCondemned,
    new_condemned: newCondemned,
    prev_repair: prevRepair,
    new_repair: newRepair,
    remark: (params.remark || "").trim(),
    proof_doc_url: params.proof_doc_url || null,
    proof_doc_name: params.proof_doc_name || null,
    purchase_pdf_url: params.purchase_pdf_url || null,
    purchase_pdf_name: params.purchase_pdf_name || null,
    performed_by_id: params.user_id || 1,
    performed_by_name: params.user_name || "Lab Administrator",
    performed_by_role: params.user_role || "lab_staff",
    created_at: now,
  }

  store.items[itemIndex] = updatedItem
  store.adjustments.push(adj)
  saveStore(store)

  return { success: true, item: updatedItem, adjustment: adj }
}

export async function getInventoryHistory(inventoryId: number): Promise<InventoryAdjustment[]> {
  const isDbConnected = await ensureInventorySchema()
  if (isDbConnected) {
    try {
      const res = await db.query(
        `SELECT * FROM lab_inventory_adjustments WHERE inventory_id = ? ORDER BY created_at DESC`,
        [inventoryId]
      )
      if (res.rows && res.rows.length > 0) {
        return res.rows as InventoryAdjustment[]
      }
    } catch (e) {}
  }
  const store = loadStore()
  return store.adjustments
    .filter((a) => Number(a.inventory_id) === Number(inventoryId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function deleteInventoryItem(id: number): Promise<boolean> {
  const isDbConnected = await ensureInventorySchema()
  if (isDbConnected) {
    try {
      await db.query(`DELETE FROM lab_inventory_adjustments WHERE inventory_id = ?`, [id])
      await db.query(`DELETE FROM lab_inventory WHERE id = ?`, [id])
      return true
    } catch (e) {}
  }
  const store = loadStore()
  store.items = store.items.filter((i) => Number(i.id) !== Number(id))
  store.adjustments = store.adjustments.filter((a) => Number(a.inventory_id) !== Number(id))
  saveStore(store)
  return true
}
