/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Lab Inventory Management Component
 * Supports:
 * 1. Consumable Inventory (ID/Part No, Purchased, Available, Consumed ["Student ko dedia"], Condemned ["Kharab hoga pr rkha rahega"], Remarks, Purchase PDF)
 * 2. Non-Consumable Inventory with dedicated "Under Repair / Need Repair" section & status tracking (🔧)
 * 3. Strict verification on negative adjustments (Mandatory Remark + Signed Proof Document)
 * 4. Monthly Possession Reminder for students holding components
 */

"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  Layers,
  Plus,
  Search,
  FileText,
  FileCheck2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  History,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Trash2,
  FileUp,
  Wrench,
  Hammer,
  BellRing,
  Send,
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

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
  repair_quantity: number // Non-consumable Under Repair / Need Repair
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

interface LabOption {
  id: number
  name: string
  code?: string
  location?: string
}

interface LabInventoryManagerProps {
  userRole?: string
  defaultLabId?: number
}

export function LabInventoryManager({ userRole = "lab_staff", defaultLabId }: LabInventoryManagerProps) {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"consumable" | "non_consumable">("consumable")
  const [items, setItems] = useState<InventoryItem[]>([])
  const [labs, setLabs] = useState<LabOption[]>([])
  const [selectedLabId, setSelectedLabId] = useState<string>(defaultLabId ? String(defaultLabId) : "all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all") // 'all' | 'working' | 'under_repair' | 'condemned'
  const [loading, setLoading] = useState(false)
  const [sendingMonthlyReminders, setSendingMonthlyReminders] = useState(false)

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)
  const [previewDocUrl, setPreviewDocUrl] = useState("")
  const [previewDocTitle, setPreviewDocTitle] = useState("")

  // Selected item for update or history
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [itemHistory, setItemHistory] = useState<InventoryAdjustment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Add Item Form State
  const [addForm, setAddForm] = useState({
    lab_id: defaultLabId ? String(defaultLabId) : "",
    part_no: "",
    item_name: "",
    item_type: "consumable" as "consumable" | "non_consumable",
    category: "",
    purchase_quantity: "1",
    repair_quantity: "0",
    unit: "pcs",
    purchase_date: new Date().toISOString().split("T")[0],
    purchase_pdf_url: "",
    purchase_pdf_name: "",
    remarks: "",
  })
  const [uploadingAddPdf, setUploadingAddPdf] = useState(false)

  // Update Quantity Form State
  const [updateForm, setUpdateForm] = useState<{
    action_type: "consumed" | "condemned" | "stock_adjustment" | "purchase_add" | "send_repair" | "return_repair"
    quantity: string
    remark: string
    proof_doc_url: string
    proof_doc_name: string
    purchase_pdf_url: string
    purchase_pdf_name: string
  }>({
    action_type: "consumed",
    quantity: "1",
    remark: "",
    proof_doc_url: "",
    proof_doc_name: "",
    purchase_pdf_url: "",
    purchase_pdf_name: "",
  })
  const [uploadingProof, setUploadingProof] = useState(false)
  const [uploadingRestockPdf, setUploadingRestockPdf] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadLabs()
    loadInventory()
  }, [selectedLabId])

  const loadLabs = async () => {
    try {
      const res = await fetch("/api/labs")
      const data = await res.json()
      if (data.labs && Array.isArray(data.labs)) {
        setLabs(data.labs)
        if (!addForm.lab_id && data.labs.length > 0) {
          setAddForm((prev) => ({ ...prev, lab_id: String(data.labs[0].id) }))
        }
      }
    } catch (e) {
      console.error("Failed to load labs:", e)
    }
  }

  const loadInventory = async () => {
    setLoading(true)
    try {
      let url = `/api/inventory?type=all`
      if (selectedLabId && selectedLabId !== "all") {
        url += `&lab_id=${selectedLabId}`
      }
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && data.items) {
        setItems(data.items)
      } else {
        setItems([])
      }
    } catch (e: any) {
      toast({
        title: "Error loading inventory",
        description: e?.message || "Failed to fetch items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Trigger monthly possession reminder for students holding components
  const handleSendMonthlyReminders = async () => {
    setSendingMonthlyReminders(true)
    try {
      const res = await fetch("/api/notifications/monthly-possession-reminder", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send reminders")
      }
      toast({
        title: "Monthly Possession Reminders Dispatched",
        description: `Sent monthly possession notices to ${data.count} student(s) holding active lab items.`,
      })
    } catch (e: any) {
      toast({
        title: "Reminder Failed",
        description: e?.message || "Could not dispatch reminders",
        variant: "destructive",
      })
    } finally {
      setSendingMonthlyReminders(false)
    }
  }

  // Filter items by active tab (consumable vs non_consumable) and optional status/category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.item_type !== activeTab) return false

      if (categoryFilter !== "all" && item.category !== categoryFilter) return false

      if (activeTab === "non_consumable") {
        if (statusFilter === "under_repair" && (item.repair_quantity || 0) <= 0) return false
        if (statusFilter === "condemned" && item.condemned_quantity <= 0) return false
        if (statusFilter === "working" && item.available_quantity <= 0) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.item_name.toLowerCase().includes(q)
        const matchPart = item.part_no.toLowerCase().includes(q)
        const matchCategory = item.category?.toLowerCase().includes(q)
        const matchLab = item.lab_name?.toLowerCase().includes(q)
        if (!matchName && !matchPart && !matchCategory && !matchLab) return false
      }

      return true
    })
  }, [items, activeTab, categoryFilter, statusFilter, searchQuery])

  // Extract unique categories for current tab
  const categories = useMemo(() => {
    const set = new Set<string>()
    items
      .filter((i) => i.item_type === activeTab)
      .forEach((i) => {
        if (i.category) set.add(i.category)
      })
    return Array.from(set)
  }, [items, activeTab])

  // Aggregate statistics for active tab
  const tabStats = useMemo(() => {
    const currentTabItems = items.filter((i) => i.item_type === activeTab)
    return currentTabItems.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        totalPurchased: acc.totalPurchased + (Number(item.purchase_quantity) || 0),
        totalAvailable: acc.totalAvailable + (Number(item.available_quantity) || 0),
        totalConsumed: acc.totalConsumed + (Number(item.consumed_quantity) || 0),
        totalCondemned: acc.totalCondemned + (Number(item.condemned_quantity) || 0),
        totalUnderRepair: acc.totalUnderRepair + (Number(item.repair_quantity) || 0),
      }),
      {
        totalItems: 0,
        totalPurchased: 0,
        totalAvailable: 0,
        totalConsumed: 0,
        totalCondemned: 0,
        totalUnderRepair: 0,
      }
    )
  }, [items, activeTab])

  // Handle generic file upload
  const handleFileUpload = async (file: File): Promise<{ url: string; name: string } | null> => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/inventory/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed")
      }
      return { url: data.fileUrl, name: data.fileName }
    } catch (e: any) {
      toast({
        title: "Upload Failed",
        description: e.message || "Could not upload file",
        variant: "destructive",
      })
      return null
    }
  }

  // Handle Add Item Submit
  const handleAddItem = async () => {
    if (!addForm.lab_id) {
      toast({ title: "Validation Error", description: "Please select a Lab", variant: "destructive" })
      return
    }
    if (!addForm.part_no.trim()) {
      toast({ title: "Validation Error", description: "Part Number / ID is required", variant: "destructive" })
      return
    }
    if (!addForm.item_name.trim()) {
      toast({ title: "Validation Error", description: "Item Name is required", variant: "destructive" })
      return
    }
    const qty = Number(addForm.purchase_quantity)
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Validation Error", description: "Purchase Quantity must be > 0", variant: "destructive" })
      return
    }

    const selectedLabObj = labs.find((l) => String(l.id) === String(addForm.lab_id))

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lab_id: Number(addForm.lab_id),
          lab_name: selectedLabObj?.name || "Laboratory",
          part_no: addForm.part_no.trim(),
          item_name: addForm.item_name.trim(),
          item_type: addForm.item_type,
          category: addForm.category.trim() || "General",
          purchase_quantity: qty,
          repair_quantity: Number(addForm.repair_quantity) || 0,
          unit: addForm.unit.trim() || "pcs",
          purchase_date: addForm.purchase_date,
          purchase_pdf_url: addForm.purchase_pdf_url || null,
          purchase_pdf_name: addForm.purchase_pdf_name || null,
          remarks: addForm.remarks.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add inventory item")
      }

      toast({
        title: "Item Added Successfully",
        description: `${data.item.item_name} (${data.item.part_no}) added to ${data.item.item_type} inventory.`,
      })

      setAddDialogOpen(false)
      setAddForm({
        lab_id: labs.length > 0 ? String(labs[0].id) : "",
        part_no: "",
        item_name: "",
        item_type: activeTab,
        category: "",
        purchase_quantity: "1",
        repair_quantity: "0",
        unit: "pcs",
        purchase_date: new Date().toISOString().split("T")[0],
        purchase_pdf_url: "",
        purchase_pdf_name: "",
        remarks: "",
      })

      loadInventory()
    } catch (e: any) {
      toast({
        title: "Failed to Add Item",
        description: e.message,
        variant: "destructive",
      })
    }
  }

  // Open Update Dialog
  const openUpdateDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setUpdateForm({
      action_type: item.item_type === "consumable" ? "consumed" : "send_repair",
      quantity: "1",
      remark: "",
      proof_doc_url: "",
      proof_doc_name: "",
      purchase_pdf_url: "",
      purchase_pdf_name: "",
    })
    setUpdateDialogOpen(true)
  }

  // Check if current action strictly requires proof document (consumed, condemned, stock_adjustment)
  const isDeductionAction =
    updateForm.action_type === "consumed" ||
    updateForm.action_type === "condemned" ||
    updateForm.action_type === "stock_adjustment"

  const isRepairAction =
    updateForm.action_type === "send_repair" || updateForm.action_type === "return_repair"

  // Can submit update form validation
  const canSubmitUpdate = useMemo(() => {
    if (!selectedItem) return false
    const qty = Number(updateForm.quantity)
    if (isNaN(qty) || qty <= 0) return false

    if (isDeductionAction) {
      if (qty > selectedItem.available_quantity) return false
      // STRICT REQUIREMENT: Remark and signed proof document required!
      if (!updateForm.remark.trim() || updateForm.remark.trim().length < 3) return false
      if (!updateForm.proof_doc_url.trim()) return false
    }

    if (updateForm.action_type === "send_repair") {
      if (qty > selectedItem.available_quantity) return false
      if (!updateForm.remark.trim() || updateForm.remark.trim().length < 3) return false
    }

    if (updateForm.action_type === "return_repair") {
      if (qty > (selectedItem.repair_quantity || 0)) return false
      if (!updateForm.remark.trim() || updateForm.remark.trim().length < 3) return false
    }

    return true
  }, [selectedItem, updateForm, isDeductionAction])

  // Handle Update Quantity Submit
  const handleUpdateQuantity = async () => {
    if (!selectedItem) return

    const qty = Number(updateForm.quantity)
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Invalid Quantity", description: "Enter a valid quantity > 0", variant: "destructive" })
      return
    }

    if (isDeductionAction) {
      if (qty > selectedItem.available_quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${selectedItem.available_quantity} ${selectedItem.unit} available to deduct.`,
          variant: "destructive",
        })
        return
      }
      if (!updateForm.remark.trim()) {
        toast({
          title: "Remark Required",
          description: "A reason/remark is mandatory when reducing quantity.",
          variant: "destructive",
        })
        return
      }
      if (!updateForm.proof_doc_url) {
        toast({
          title: "Signed Proof Document Required",
          description: "You must upload a signed proof document (e.g. signed requisition slip or inspection memo).",
          variant: "destructive",
        })
        return
      }
    }

    setUpdating(true)
    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}/quantity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: updateForm.action_type,
          quantity: qty,
          remark: updateForm.remark.trim(),
          proof_doc_url: updateForm.proof_doc_url || null,
          proof_doc_name: updateForm.proof_doc_name || null,
          purchase_pdf_url: updateForm.purchase_pdf_url || null,
          purchase_pdf_name: updateForm.purchase_pdf_name || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update quantity")
      }

      toast({
        title: "Status & Quantity Updated",
        description: `Successfully recorded ${updateForm.action_type.replace('_', ' ')} for ${selectedItem.item_name}.`,
      })

      setUpdateDialogOpen(false)
      loadInventory()
    } catch (e: any) {
      toast({
        title: "Update Failed",
        description: e.message,
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // Open History Dialog
  const openHistoryDialog = async (item: InventoryItem) => {
    setSelectedItem(item)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/inventory/${item.id}/history`)
      const data = await res.json()
      if (data.success && data.history) {
        setItemHistory(data.history)
      } else {
        setItemHistory([])
      }
    } catch (e) {
      setItemHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Handle Item Deletion
  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.item_name}" (${item.part_no})? This will also remove all its audit logs.`)) {
      return
    }

    try {
      const res = await fetch(`/api/inventory/${item.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Delete failed")
      }
      toast({ title: "Item Deleted", description: `${item.item_name} removed from inventory.` })
      loadInventory()
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message, variant: "destructive" })
    }
  }

  // Open Document Preview Modal
  const previewDocument = (url: string, title: string) => {
    setPreviewDocUrl(url)
    setPreviewDocTitle(title)
    setDocPreviewOpen(true)
  }

  // Generate Formal Inventory PDF Report
  const exportInventoryPDF = () => {
    const doc = new jsPDF()

    // Header styling
    doc.setFillColor(30, 41, 59)
    doc.rect(0, 0, 210, 36, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(15)
    doc.setFont("helvetica", "bold")
    doc.text("THE LNM INSTITUTE OF INFORMATION TECHNOLOGY", 105, 14, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Official Laboratory Inventory & Stock Movement Register", 105, 22, { align: "center" })

    const labLabel = selectedLabId === "all" ? "All Institutional Labs" : labs.find((l) => String(l.id) === selectedLabId)?.name || "Lab"
    doc.text(`Lab: ${labLabel} | Section: ${activeTab.toUpperCase()}`, 105, 30, { align: "center" })

    // Summary Box
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(
      `Date Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
      14,
      45
    )

    doc.setDrawColor(226, 232, 240)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(14, 48, 182, 18, 2, 2, "FD")

    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text(`Distinct Items: ${tabStats.totalItems}`, 18, 56)
    doc.text(`Total Purchased: ${tabStats.totalPurchased}`, 55, 56)
    doc.text(`Available: ${tabStats.totalAvailable}`, 98, 56)
    if (activeTab === "consumable") {
      doc.text(`Consumed (Student): ${tabStats.totalConsumed}`, 130, 56)
    } else {
      doc.text(`Under Repair: ${tabStats.totalUnderRepair}`, 130, 56)
    }
    doc.text(`Condemned: ${tabStats.totalCondemned}`, 172, 56)

    // Table
    const tableData = filteredItems.map((item) => [
      item.part_no,
      `${item.item_name}\n[${item.category || "General"}]`,
      `${item.purchase_quantity} ${item.unit}`,
      `${item.available_quantity} ${item.unit}`,
      activeTab === "consumable" ? `${item.consumed_quantity} ${item.unit}` : `${item.repair_quantity || 0} ${item.unit}`,
      `${item.condemned_quantity} ${item.unit}`,
      item.remarks || "-",
      item.purchase_pdf_url ? "Attached" : "No Invoice",
    ])

    autoTable(doc, {
      startY: 72,
      head: [
        [
          "ID / Part No",
          "Item Name & Category",
          "Purchased",
          "Available",
          activeTab === "consumable" ? "Consumed (Student)" : "Under Repair",
          "Condemned",
          "Remarks",
          "Invoice PDF",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 26, fontStyle: "bold" },
        1: { cellWidth: 46 },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 18, halign: "center" },
        6: { cellWidth: 24 },
        7: { cellWidth: 14, halign: "center" },
      },
    })

    // Signatures
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 30 : 230
    const safeY = finalY > 260 ? 260 : finalY

    doc.setDrawColor(148, 163, 184)
    doc.line(18, safeY, 78, safeY)
    doc.line(132, safeY, 192, safeY)

    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text("Verified & Signed By", 18, safeY + 5)
    doc.setFont("helvetica", "bold")
    doc.text("Lab Staff / Administrator", 18, safeY + 10)

    doc.setFont("helvetica", "normal")
    doc.text("Counter-Signed & Approved By", 132, safeY + 5)
    doc.setFont("helvetica", "bold")
    doc.text("Head of Department (HOD) / Incharge", 132, safeY + 10)

    doc.save(`LNMIIT_Lab_Inventory_${activeTab}_${new Date().toISOString().split("T")[0]}.pdf`)

    toast({
      title: "PDF Generated",
      description: `Lab Inventory PDF for ${activeTab} items downloaded.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Laboratory Inventory</h1>
              <p className="text-sm text-muted-foreground">
                Dual register for Consumable & Non-Consumable items with Under Repair tracking and student monthly reminders.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lab Filter */}
          <div className="w-52">
            <Select value={selectedLabId} onValueChange={setSelectedLabId}>
              <SelectTrigger className="h-9">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Labs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assigned Labs</SelectItem>
                {labs.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monthly Reminder Trigger for Students */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendMonthlyReminders}
            disabled={sendingMonthlyReminders}
            className="gap-2 h-9 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Dispatch monthly possession reminder to students holding components"
          >
            <BellRing className={`h-4 w-4 ${sendingMonthlyReminders ? "animate-bounce" : ""}`} />
            {sendingMonthlyReminders ? "Sending..." : "Send Monthly Student Reminders"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportInventoryPDF}
            className="gap-2 h-9 border-dashed hover:border-solid"
          >
            <Download className="h-4 w-4" />
            Export Register PDF
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setAddForm((prev) => ({ ...prev, item_type: activeTab }))
              setAddDialogOpen(true)
            }}
            className="gap-2 h-9"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadInventory}
            disabled={loading}
            title="Refresh Inventory"
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Two-Part Tabs: Consumable and Non-Consumable */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as any)
          setCategoryFilter("all")
          setStatusFilter("all")
        }}
        className="space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
          <TabsList className="grid grid-cols-2 w-full sm:w-[460px] p-1 h-11 bg-muted/70">
            <TabsTrigger
              value="consumable"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Consumable Inventory
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5">
                {items.filter((i) => i.item_type === "consumable").length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="non_consumable"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Non-Consumable (Equipment)
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5">
                {items.filter((i) => i.item_type === "non_consumable").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {activeTab === "consumable"
                ? "Consumable items issued permanently or used up (ICs, passives, sensors, jumper wires)."
                : "Permanent capital equipment & instruments with Under Repair / Need Repair tracking."}
            </span>
          </div>
        </div>

        {/* Overview Stats Cards for Selected Tab */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          <Card className="border-border shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Distinct Items</div>
              <div className="text-2xl font-bold mt-1 text-foreground">{tabStats.totalItems}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Catalogued varieties</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-blue-50/40 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Total Purchased
              </div>
              <div className="text-2xl font-bold mt-1 text-blue-800 dark:text-blue-200">
                {tabStats.totalPurchased}
              </div>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Procured stock</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-emerald-50/40 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Available (Working)
              </div>
              <div className="text-2xl font-bold mt-1 text-emerald-800 dark:text-emerald-200">
                {tabStats.totalAvailable}
              </div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Ready in lab</p>
            </CardContent>
          </Card>

          {/* 4th Card: Consumed for Consumable, OR "Under Repair" for Non-Consumable */}
          {activeTab === "consumable" ? (
            <Card className="border-border shadow-xs bg-amber-50/40 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Consumed (Student)
                </div>
                <div className="text-2xl font-bold mt-1 text-amber-800 dark:text-amber-200">
                  {tabStats.totalConsumed}
                </div>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Student ko dedia</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-xs bg-orange-50/50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-orange-600" />
                  Under Repair
                </div>
                <div className="text-2xl font-bold mt-1 text-orange-800 dark:text-orange-200">
                  {tabStats.totalUnderRepair}
                </div>
                <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80 mt-0.5">Need repair section</p>
              </CardContent>
            </Card>
          )}

          {/* 5th Card: Condemned */}
          <Card className="border-border shadow-xs bg-rose-50/40 dark:bg-rose-950/20">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Condemned
              </div>
              <div className="text-2xl font-bold mt-1 text-rose-800 dark:text-rose-200">
                {tabStats.totalCondemned}
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">Kharab hoga pr rkha rahega</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === "consumable" ? "consumables" : "equipment"} by name, part no...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status Filter for Non-Consumable (Under Repair section) */}
            {activeTab === "non_consumable" && (
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-44 bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="working">✅ Working / Available</SelectItem>
                    <SelectItem value="under_repair">🔧 Under Repair (Need Repair)</SelectItem>
                    <SelectItem value="condemned">🚫 Condemned (Dead)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Category:</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-40 bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setStatusFilter("all")
                }}
                className="h-9 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Tab Content - Table Container */}
        <TabsContent value="consumable" className="mt-0">
          <InventoryTable
            items={filteredItems}
            activeTab="consumable"
            loading={loading}
            onUpdate={openUpdateDialog}
            onHistory={openHistoryDialog}
            onDelete={handleDeleteItem}
            onPreviewDoc={previewDocument}
          />
        </TabsContent>

        <TabsContent value="non_consumable" className="mt-0">
          <InventoryTable
            items={filteredItems}
            activeTab="non_consumable"
            loading={loading}
            onUpdate={openUpdateDialog}
            onHistory={openHistoryDialog}
            onDelete={handleDeleteItem}
            onPreviewDoc={previewDocument}
          />
        </TabsContent>
      </Tabs>

      {/* ========================================================
          DIALOG 1: ADD NEW INVENTORY ITEM
          ======================================================== */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Lab Inventory Item
            </DialogTitle>
            <DialogDescription>
              Register a new consumable or non-consumable item into the laboratory register with initial purchase details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="add-lab">Laboratory *</Label>
                <Select
                  value={addForm.lab_id}
                  onValueChange={(val) => setAddForm((prev) => ({ ...prev, lab_id: val }))}
                >
                  <SelectTrigger id="add-lab" className="mt-1">
                    <SelectValue placeholder="Select Lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {labs.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="add-type">Inventory Type *</Label>
                <Select
                  value={addForm.item_type}
                  onValueChange={(val: any) => setAddForm((prev) => ({ ...prev, item_type: val }))}
                >
                  <SelectTrigger id="add-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumable">Consumable (Student issuance / usage)</SelectItem>
                    <SelectItem value="non_consumable">Non-Consumable (Equipment / Assets)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="add-part">ID / Part Number *</Label>
                <Input
                  id="add-part"
                  placeholder="e.g. IC-NE555P, DSO-1102X"
                  value={addForm.part_no}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, part_no: e.target.value }))}
                  className="mt-1 font-mono uppercase"
                />
              </div>

              <div>
                <Label htmlFor="add-category">Category</Label>
                <Input
                  id="add-category"
                  placeholder="e.g. Integrated Circuits, Passives, Test Equipment"
                  value={addForm.category}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="add-name">Item Name & Description *</Label>
              <Input
                id="add-name"
                placeholder="e.g. Digital Storage Oscilloscope 100MHz 2-Channel"
                value={addForm.item_name}
                onChange={(e) => setAddForm((prev) => ({ ...prev, item_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="add-qty">Purchase Quantity *</Label>
                <Input
                  id="add-qty"
                  type="number"
                  min="1"
                  value={addForm.purchase_quantity}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, purchase_quantity: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="add-unit">Unit of Measure</Label>
                <Input
                  id="add-unit"
                  placeholder="pcs, units, meters"
                  value={addForm.unit}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, unit: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="add-date">Purchase Date</Label>
                <Input
                  id="add-date"
                  type="date"
                  value={addForm.purchase_date}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, purchase_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Purchase PDF Upload */}
            <div className="border border-dashed border-border rounded-lg p-3.5 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    Purchase PDF / Invoice Document
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Upload official procurement bill, receipt, or PO slip (PDF / Image)
                  </p>
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploadingAddPdf(true)
                      const res = await handleFileUpload(file)
                      setUploadingAddPdf(false)
                      if (res) {
                        setAddForm((prev) => ({
                          ...prev,
                          purchase_pdf_url: res.url,
                          purchase_pdf_name: res.name,
                        }))
                        toast({ title: "Purchase PDF Attached", description: res.name })
                      }
                    }}
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border bg-background hover:bg-muted transition">
                    <FileUp className="h-3.5 w-3.5 text-primary" />
                    {uploadingAddPdf ? "Uploading..." : "Select Document"}
                  </div>
                </label>
              </div>

              {addForm.purchase_pdf_name && (
                <div className="flex items-center justify-between mt-2.5 px-2.5 py-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    {addForm.purchase_pdf_name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-rose-600 hover:text-rose-700 p-0 px-1"
                    onClick={() => setAddForm((prev) => ({ ...prev, purchase_pdf_url: "", purchase_pdf_name: "" }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="add-remarks">Remarks</Label>
              <Textarea
                id="add-remarks"
                placeholder="e.g. Batch no, supplier details, storage shelf location..."
                value={addForm.remarks}
                onChange={(e) => setAddForm((prev) => ({ ...prev, remarks: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={uploadingAddPdf}>
              Save to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          DIALOG 2: UPDATE QUANTITY & REPAIR MANAGEMENT
          ======================================================== */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Update Stock & Equipment Status
            </DialogTitle>
            <DialogDescription>
              Adjust available stock, log repairs, or condemn items for{" "}
              <span className="font-semibold text-foreground">{selectedItem?.item_name}</span> ({selectedItem?.part_no}).
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-2">
              {/* Current Status Pills */}
              <div
                className={`grid ${
                  selectedItem.item_type === "non_consumable" ? "grid-cols-5" : "grid-cols-4"
                } gap-2 p-2.5 rounded-lg bg-muted/50 border text-center text-xs`}
              >
                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-semibold">Purchased</div>
                  <div className="font-bold text-sm text-foreground">
                    {selectedItem.purchase_quantity} {selectedItem.unit}
                  </div>
                </div>
                <div>
                  <div className="text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-semibold">
                    Available
                  </div>
                  <div className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
                    {selectedItem.available_quantity} {selectedItem.unit}
                  </div>
                </div>
                {selectedItem.item_type === "consumable" ? (
                  <div>
                    <div className="text-amber-700 dark:text-amber-400 text-[10px] uppercase font-semibold">Consumed</div>
                    <div className="font-bold text-sm text-amber-800 dark:text-amber-200">
                      {selectedItem.consumed_quantity} {selectedItem.unit}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-orange-700 dark:text-orange-400 text-[10px] uppercase font-semibold">
                      In Repair
                    </div>
                    <div className="font-bold text-sm text-orange-800 dark:text-orange-200">
                      {selectedItem.repair_quantity || 0} {selectedItem.unit}
                    </div>
                  </div>
                )}
                {selectedItem.item_type === "non_consumable" && (
                  <div>
                    <div className="text-blue-700 dark:text-blue-400 text-[10px] uppercase font-semibold">In-Use</div>
                    <div className="font-bold text-sm text-blue-800 dark:text-blue-200">
                      {selectedItem.consumed_quantity || 0} {selectedItem.unit}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-rose-700 dark:text-rose-400 text-[10px] uppercase font-semibold">Condemned</div>
                  <div className="font-bold text-sm text-rose-800 dark:text-rose-200">
                    {selectedItem.condemned_quantity} {selectedItem.unit}
                  </div>
                </div>
              </div>

              {/* Action Type Selection */}
              <div>
                <Label htmlFor="update-action">Select Action / Status Change *</Label>
                <Select
                  value={updateForm.action_type}
                  onValueChange={(val: any) => setUpdateForm((prev) => ({ ...prev, action_type: val }))}
                >
                  <SelectTrigger id="update-action" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedItem.item_type === "consumable" ? (
                      <>
                        <SelectItem value="consumed">
                          🔵 Mark Consumed — "Student ko dedia" (Issued for lab practicals / projects)
                        </SelectItem>
                        <SelectItem value="condemned">
                          🟠 Mark Condemned — "Kharab hoga pr rkha rahega" (Burnt / defective, kept in lab)
                        </SelectItem>
                        <SelectItem value="stock_adjustment">
                          🔴 General Stock Deduction / Write-off
                        </SelectItem>
                        <SelectItem value="purchase_add">
                          🟢 Restock / Additional Purchase (+ Stock In)
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="send_repair">
                          🔧 Send to Repair / Under Repair (Equipment needs servicing / calibration)
                        </SelectItem>
                        <SelectItem value="return_repair">
                          🛠️ Return from Repair (Restored to working & available)
                        </SelectItem>
                        <SelectItem value="condemned">
                          🟠 Mark Condemned — "Kharab hoga pr rkha rahega" (Scrapped/Unrepairable)
                        </SelectItem>
                        <SelectItem value="consumed">
                          🔵 Mark as In-Use (Booked / In Lab Setup)
                        </SelectItem>
                        <SelectItem value="purchase_add">
                          🟢 Add New Purchase / Restock (+ Units)
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="update-qty">Quantity to Adjust *</Label>
                  {isDeductionAction && (
                    <span className="text-[11px] text-muted-foreground">
                      Max available: {selectedItem.available_quantity} {selectedItem.unit}
                    </span>
                  )}
                  {updateForm.action_type === "send_repair" && (
                    <span className="text-[11px] text-muted-foreground">
                      Max available to send: {selectedItem.available_quantity} {selectedItem.unit}
                    </span>
                  )}
                  {updateForm.action_type === "return_repair" && (
                    <span className="text-[11px] text-muted-foreground">
                      Currently in repair: {selectedItem.repair_quantity || 0} {selectedItem.unit}
                    </span>
                  )}
                </div>
                <Input
                  id="update-qty"
                  type="number"
                  min="1"
                  max={
                    updateForm.action_type === "return_repair"
                      ? selectedItem.repair_quantity || 1
                      : isDeductionAction || updateForm.action_type === "send_repair"
                      ? selectedItem.available_quantity
                      : undefined
                  }
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* MANDATORY WARNING FOR DEDUCTIONS / CONDEMNATIONS */}
              {isDeductionAction && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    Strict Policy: Proof Document & Remark Mandatory
                  </div>
                  <p>
                    Because quantity is being reduced or condemned, you <strong>must provide a specific reason / remark</strong> and{" "}
                    <strong>upload a signed proof document</strong> (e.g. signed student requisition slip, faculty
                    approval, or damage inspection memo).
                  </p>
                </div>
              )}

              {/* Remark Field */}
              <div>
                <Label htmlFor="update-remark">
                  Reason / Remark {isDeductionAction || isRepairAction ? <span className="text-rose-600 font-bold">*</span> : "(Optional)"}
                </Label>
                <Textarea
                  id="update-remark"
                  placeholder={
                    updateForm.action_type === "send_repair"
                      ? "Describe the fault or required repair (e.g. Channel 1 probe attenuation error, sent to calibration lab)..."
                      : updateForm.action_type === "return_repair"
                      ? "Describe the repair outcome (e.g. Motherboard fuse replaced, calibrated successfully)..."
                      : isDeductionAction
                      ? "Explain reason for stock deduction (e.g. Issued 10 pcs to batch 2024 for Embedded Project; or burnt in lab test)..."
                      : "Optional notes on restock batch..."
                  }
                  value={updateForm.remark}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, remark: e.target.value }))}
                  rows={2}
                  className="mt-1"
                />
                {(isDeductionAction || isRepairAction) && !updateForm.remark.trim() && (
                  <p className="text-[11px] text-rose-600 mt-1">Remark is required for this action.</p>
                )}
              </div>

              {/* Signed Proof Document Upload (MANDATORY on deduction / condemnation) */}
              {isDeductionAction && (
                <div
                  className={`border rounded-lg p-3.5 ${
                    !updateForm.proof_doc_url
                      ? "border-amber-400 bg-amber-50/20 dark:border-amber-800"
                      : "border-emerald-300 bg-emerald-50/20 dark:border-emerald-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <FileCheck2 className="h-4 w-4 text-primary" />
                        Signed Proof Document <span className="text-rose-600">*</span>
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Upload requisition slip / inspection report with signature (PDF or Image)
                      </p>
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploadingProof(true)
                          const res = await handleFileUpload(file)
                          setUploadingProof(false)
                          if (res) {
                            setUpdateForm((prev) => ({
                              ...prev,
                              proof_doc_url: res.url,
                              proof_doc_name: res.name,
                            }))
                            toast({ title: "Signed Proof Attached", description: res.name })
                          }
                        }}
                      />
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border bg-background hover:bg-muted transition">
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        {uploadingProof ? "Uploading..." : "Upload Proof"}
                      </div>
                    </label>
                  </div>

                  {updateForm.proof_doc_name ? (
                    <div className="flex items-center justify-between mt-2.5 px-2.5 py-1.5 rounded bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        Signed Document: {updateForm.proof_doc_name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-rose-600 hover:text-rose-700 p-0 px-1"
                        onClick={() =>
                          setUpdateForm((prev) => ({ ...prev, proof_doc_url: "", proof_doc_name: "" }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-600 font-medium mt-2">
                      ⚠️ Signed document is required before you can submit this reduction.
                    </p>
                  )}
                </div>
              )}

              {/* Purchase PDF Upload (for Restock / Purchase Add) */}
              {updateForm.action_type === "purchase_add" && (
                <div className="border border-dashed border-border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-medium flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        Purchase Invoice / Receipt PDF
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Attach supplier invoice for this restock</p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploadingRestockPdf(true)
                          const res = await handleFileUpload(file)
                          setUploadingRestockPdf(false)
                          if (res) {
                            setUpdateForm((prev) => ({
                              ...prev,
                              purchase_pdf_url: res.url,
                              purchase_pdf_name: res.name,
                            }))
                          }
                        }}
                      />
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border bg-background hover:bg-muted transition">
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        {uploadingRestockPdf ? "Uploading..." : "Upload Bill"}
                      </div>
                    </label>
                  </div>
                  {updateForm.purchase_pdf_name && (
                    <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 truncate">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Attached: {updateForm.purchase_pdf_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateQuantity}
              disabled={updating || uploadingProof || uploadingRestockPdf || !canSubmitUpdate}
              className={
                isDeductionAction
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : updateForm.action_type === "send_repair"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {updating
                ? "Saving..."
                : updateForm.action_type === "send_repair"
                ? "Send to Repair"
                : updateForm.action_type === "return_repair"
                ? "Confirm Repaired"
                : isDeductionAction
                ? "Confirm Deduction"
                : "Add Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          DIALOG 3: VIEW ITEM AUDIT HISTORY / LOGS
          ======================================================== */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Stock Movement & Maintenance History
            </DialogTitle>
            <DialogDescription>
              Complete audit trail for{" "}
              <span className="font-semibold text-foreground">{selectedItem?.item_name}</span> (Part No:{" "}
              {selectedItem?.part_no}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {loadingHistory ? (
              <div className="flex items-center justify-center p-8 text-sm text-muted-foreground gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                Loading history logs...
              </div>
            ) : itemHistory.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No past adjustments recorded for this item.
              </div>
            ) : (
              <div className="relative border-l border-border ml-3 pl-5 space-y-5">
                {itemHistory.map((adj) => {
                  const isConsumed = adj.action_type === "consumed"
                  const isCondemned = adj.action_type === "condemned"
                  const isPurchase = adj.action_type === "purchase_add"
                  const isSendRepair = adj.action_type === "send_repair"
                  const isReturnRepair = adj.action_type === "return_repair"

                  return (
                    <div key={adj.id} className="relative group">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                          isConsumed
                            ? "bg-blue-600"
                            : isCondemned
                            ? "bg-rose-600"
                            : isSendRepair
                            ? "bg-orange-600"
                            : isReturnRepair
                            ? "bg-teal-600"
                            : isPurchase
                            ? "bg-emerald-600"
                            : "bg-amber-600"
                        }`}
                      />

                      <div className="p-3.5 rounded-lg border bg-card/60 shadow-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                isConsumed
                                  ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40"
                                  : isCondemned
                                  ? "border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/40"
                                  : isSendRepair
                                  ? "border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950/40"
                                  : isReturnRepair
                                  ? "border-teal-500 text-teal-700 bg-teal-50 dark:bg-teal-950/40"
                                  : isPurchase
                                  ? "border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                                  : "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40"
                              }
                            >
                              {isConsumed && "Consumed (Student ko dedia)"}
                              {isCondemned && "Condemned (Kharab hoga pr rkha rahega)"}
                              {isSendRepair && "Sent to Repair (Under Repair)"}
                              {isReturnRepair && "Returned from Repair (Working)"}
                              {isPurchase && "Initial / New Purchase"}
                              {adj.action_type === "stock_adjustment" && "Stock Adjustment"}
                            </Badge>

                            <span className="text-xs font-bold text-foreground">
                              {adj.quantity_change > 0 ? `+${adj.quantity_change}` : adj.quantity_change}{" "}
                              {selectedItem?.unit}
                            </span>
                          </div>

                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(adj.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Quantitative change snapshot */}
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            Available:{" "}
                            <strong className="text-foreground">
                              {adj.prev_available} &rarr; {adj.new_available}
                            </strong>
                          </span>
                          {adj.prev_repair != null && (
                            <span>
                              Under Repair:{" "}
                              <strong className="text-foreground">
                                {adj.prev_repair} &rarr; {adj.new_repair}
                              </strong>
                            </span>
                          )}
                          {isConsumed && (
                            <span>
                              Total Consumed:{" "}
                              <strong className="text-foreground">
                                {adj.prev_consumed} &rarr; {adj.new_consumed}
                              </strong>
                            </span>
                          )}
                          {isCondemned && (
                            <span>
                              Total Condemned:{" "}
                              <strong className="text-foreground">
                                {adj.prev_condemned} &rarr; {adj.new_condemned}
                              </strong>
                            </span>
                          )}
                          <span>
                            Logged by: <strong className="text-foreground">{adj.performed_by_name || "Staff"}</strong>
                          </span>
                        </div>

                        {/* Remark */}
                        {adj.remark && (
                          <div className="text-xs bg-muted/40 p-2 rounded border border-border/60 text-foreground">
                            <strong>Reason:</strong> {adj.remark}
                          </div>
                        )}

                        {/* Document links */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {adj.proof_doc_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1.5 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              onClick={() =>
                                previewDocument(
                                  adj.proof_doc_url!,
                                  adj.proof_doc_name || "Signed Proof Document"
                                )
                              }
                            >
                              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                              View Signed Proof
                            </Button>
                          )}

                          {adj.purchase_pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1.5 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              onClick={() =>
                                previewDocument(
                                  adj.purchase_pdf_url!,
                                  adj.purchase_pdf_name || "Purchase Invoice Bill"
                                )
                              }
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-600" />
                              View Purchase Bill
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          DIALOG 4: DOCUMENT PREVIEW MODAL
          ======================================================== */}
      <Dialog open={docPreviewOpen} onOpenChange={setDocPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base">
              <span className="truncate flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {previewDocTitle || "Document Preview"}
              </span>
              <div className="flex items-center gap-2 pr-6">
                <a
                  href={previewDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
                </a>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 h-[550px] w-full border rounded-lg overflow-hidden bg-muted/20">
            {previewDocUrl ? (
              <iframe src={previewDocUrl} className="w-full h-full border-0" title="Document Preview" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No document URL available.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Table Sub-Component with Exact User Columns and Under Repair Section
function InventoryTable({
  items,
  activeTab,
  loading,
  onUpdate,
  onHistory,
  onDelete,
  onPreviewDoc,
}: {
  items: InventoryItem[]
  activeTab: "consumable" | "non_consumable"
  loading: boolean
  onUpdate: (item: InventoryItem) => void
  onHistory: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onPreviewDoc: (url: string, title: string) => void
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-sm text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
          Loading laboratory inventory records...
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-2">
          <Package className="h-10 w-10 mx-auto text-muted-foreground/60" />
          <h3 className="font-semibold text-foreground text-base">No {activeTab} items found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {activeTab === "consumable"
              ? "No consumable items match your filters. Click 'Add New Item' to register ICs, passives, sensors, or student issuance materials."
              : "No non-consumable equipment found. Register permanent lab instruments like oscilloscopes, meters, and workstations."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[140px] font-semibold">ID / Part No</TableHead>
              <TableHead className="min-w-[220px] font-semibold">Item Name & Category</TableHead>
              <TableHead className="text-center font-semibold">Purchased Qty</TableHead>
              <TableHead className="text-center font-semibold">Available (Working)</TableHead>
              {activeTab === "consumable" ? (
                <TableHead className="text-center font-semibold">
                  Consumed (Student)
                </TableHead>
              ) : (
                <TableHead className="text-center font-semibold bg-orange-50/50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200">
                  <span className="flex items-center justify-center gap-1">
                    <Wrench className="h-3.5 w-3.5 text-orange-600" />
                    Under Repair
                  </span>
                </TableHead>
              )}
              <TableHead className="text-center font-semibold">Condemned</TableHead>
              <TableHead className="min-w-[170px] font-semibold">Remarks</TableHead>
              <TableHead className="text-center font-semibold">Purchase PDF</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => {
              const isLowStock = item.available_quantity > 0 && item.available_quantity <= item.purchase_quantity * 0.2
              const isOutOfStock = item.available_quantity === 0
              const hasRepair = (item.repair_quantity || 0) > 0

              return (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  {/* ID / Part No */}
                  <TableCell className="font-mono text-xs">
                    <Badge variant="outline" className="font-semibold bg-background border-border">
                      {item.part_no}
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-0.5">ID: #{item.id}</div>
                  </TableCell>

                  {/* Item Name & Category */}
                  <TableCell>
                    <div className="font-medium text-foreground text-sm">{item.item_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {item.category || "General"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground truncate">{item.lab_name}</span>
                    </div>
                  </TableCell>

                  {/* Purchase Quantity */}
                  <TableCell className="text-center font-medium">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                      {item.purchase_quantity} {item.unit}
                    </span>
                  </TableCell>

                  {/* Available Quantity with Status */}
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300"
                          : isLowStock
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                      }`}
                    >
                      {item.available_quantity} {item.unit}
                    </span>
                  </TableCell>

                  {/* 5th Column: Consumed for Consumable, OR "Under Repair" for Non-Consumable */}
                  {activeTab === "consumable" ? (
                    <TableCell className="text-center">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        title="Consumed: Student ko dedia (Issued permanently or used up in projects)"
                      >
                        {item.consumed_quantity} {item.unit}
                      </span>
                    </TableCell>
                  ) : (
                    <TableCell className="text-center bg-orange-50/20 dark:bg-orange-950/10">
                      {hasRepair ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700"
                          title="Equipment currently undergoing repair/servicing"
                        >
                          <Wrench className="h-3 w-3 text-orange-600" />
                          {item.repair_quantity} {item.unit}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">0 {item.unit}</span>
                      )}
                    </TableCell>
                  )}

                  {/* Condemned Quantity ("karab hoga pr rkha rahega") */}
                  <TableCell className="text-center">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      title="Condemned: Kharab hoga pr rkha rahega (Defective/damaged kept in lab for scrap audit)"
                    >
                      {item.condemned_quantity} {item.unit}
                    </span>
                  </TableCell>

                  {/* Remarks */}
                  <TableCell>
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]" title={item.remarks || ""}>
                      {item.remarks || "—"}
                    </p>
                  </TableCell>

                  {/* Purchase PDF */}
                  <TableCell className="text-center">
                    {item.purchase_pdf_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onPreviewDoc(item.purchase_pdf_url!, item.purchase_pdf_name || "Purchase Invoice Bill")
                        }
                        className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                        title={item.purchase_pdf_name || "View Invoice PDF"}
                      >
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>PDF</span>
                        <Eye className="h-3 w-3 ml-0.5 opacity-70" />
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic">No PDF</span>
                    )}
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs gap-1 bg-primary hover:bg-primary/90"
                        onClick={() => onUpdate(item)}
                      >
                        {activeTab === "non_consumable" ? (
                          <>
                            <Wrench className="h-3.5 w-3.5" />
                            Manage
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5" />
                            Update Qty
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => onHistory(item)}
                        title="View stock movement audit history"
                      >
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        Logs
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                        onClick={() => onDelete(item)}
                        title="Delete item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
