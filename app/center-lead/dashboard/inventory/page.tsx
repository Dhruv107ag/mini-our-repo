"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
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
  Boxes,
  Plus,
  Search,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Layers,
  ArrowLeftRight,
  TrendingUp,
  History,
  ExternalLink,
  ShieldAlert,
  Archive,
} from "lucide-react"

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

const CATEGORIES = [
  "All Categories",
  "Robotics & Edge AI",
  "IoT & Embedded Systems",
  "Microcontrollers & Sensors",
  "3D Printing & Prototyping",
  "Computing Hardware",
  "Tools & Machinery",
  "Passive Components",
  "General",
]

export default function CenterLeadInventoryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<CenterInventoryItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")

  // Add Item Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState({
    part_no: "",
    item_name: "",
    item_type: "non_consumable",
    category: "Robotics & Edge AI",
    total_purchased: 1,
    unit: "units",
    location: "Cabinet A - Shelf 1",
    unit_price: 0,
    remarks: "",
  })

  // Stock Adjustment Dialog state
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CenterInventoryItem | null>(null)
  const [adjustForm, setAdjustForm] = useState({
    action_type: "consumed",
    quantity_change: 1,
    remark: "",
  })

  const loadInventory = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/center-lead/inventory", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load center inventory")
      const data = await res.json()
      setItems(data.items || [])
      setStats(data.stats || null)
    } catch (e: any) {
      toast({
        title: "Load Error",
        description: e?.message || "Could not fetch inventory",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // Filter items by tab and search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "non_consumable" && item.item_type !== "non_consumable") return false
      if (activeTab === "consumable" && item.item_type !== "consumable") return false
      if (activeTab === "repair" && (item.repair_quantity || 0) <= 0) return false

      // Category filter
      if (categoryFilter !== "All Categories" && item.category !== categoryFilter) return false

      // Search filter
      if (search.trim() !== "") {
        const s = search.toLowerCase()
        const match =
          item.item_name.toLowerCase().includes(s) ||
          item.part_no.toLowerCase().includes(s) ||
          (item.location && item.location.toLowerCase().includes(s)) ||
          (item.category && item.category.toLowerCase().includes(s))
        if (!match) return false
      }

      return true
    })
  }, [items, activeTab, categoryFilter, search])

  // Open Adjust Modal
  const handleOpenAdjust = (item: CenterInventoryItem) => {
    setSelectedItem(item)
    setAdjustForm({
      action_type: item.item_type === "consumable" ? "consumed" : "repair_send",
      quantity_change: 1,
      remark: "",
    })
    setAdjustDialogOpen(true)
  }

  // Handle Add Item Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.part_no.trim()) {
      toast({ title: "Validation Error", description: "Part Number is required", variant: "destructive" })
      return
    }
    if (!addForm.item_name.trim()) {
      toast({ title: "Validation Error", description: "Item Name is required", variant: "destructive" })
      return
    }

    try {
      setAdding(true)
      const res = await fetch("/api/center-lead/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create item")

      toast({
        title: "Inventory Item Added",
        description: `Successfully added ${addForm.item_name} to Center Inventory.`,
      })
      setAddDialogOpen(false)
      await loadInventory()
    } catch (e: any) {
      toast({
        title: "Error Creating Item",
        description: e?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  // Handle Stock Adjustment Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    if (!adjustForm.remark.trim()) {
      toast({ title: "Validation Error", description: "Mandatory justification remark is required", variant: "destructive" })
      return
    }

    try {
      setAdjusting(true)
      const res = await fetch(`/api/center-lead/inventory/${selectedItem.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock")

      toast({
        title: "Stock Adjusted Successfully",
        description: `Updated ${selectedItem.item_name} (${adjustForm.action_type}).`,
      })
      setAdjustDialogOpen(false)
      await loadInventory()
    } catch (e: any) {
      toast({
        title: "Adjustment Failed",
        description: e?.message || "Could not adjust stock",
        variant: "destructive",
      })
    } finally {
      setAdjusting(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Part No",
      "Item Name",
      "Type",
      "Category",
      "Total Purchased",
      "Available",
      "Issued / Consumed",
      "Under Repair",
      "Condemned",
      "Unit",
      "Unit Price (INR)",
      "Location",
      "Remarks",
    ]

    const rows = filteredItems.map((i) => [
      i.part_no,
      `"${i.item_name.replace(/"/g, '""')}"`,
      i.item_type,
      `"${i.category || ""}"`,
      i.total_purchased,
      i.available_quantity,
      i.issued_quantity,
      i.repair_quantity,
      i.condemned_quantity,
      i.unit,
      i.unit_price,
      `"${i.location || ""}"`,
      `"${(i.remarks || "").replace(/"/g, '""')}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `center_inventory_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Boxes className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Center Inventory
            </h1>
            <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 text-xs font-semibold">
              Isolated Center Register
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete consumable & non-consumable register separated from department labs with maintenance tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAddForm({
                part_no: `CEN-HW-${String(items.length + 1).padStart(3, "0")}`,
                item_name: "",
                item_type: "non_consumable",
                category: "Robotics & Edge AI",
                total_purchased: 1,
                unit: "units",
                location: "Cabinet A - Shelf 1",
                unit_price: 0,
                remarks: "",
              })
              setAddDialogOpen(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Center Item
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items Types</div>
            <div className="text-xl font-bold mt-1 text-foreground">{stats?.total_items ?? items.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Available Units</div>
            <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {stats?.total_available ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Issued / In Use</div>
            <div className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">
              {stats?.total_issued ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Under Repair</div>
            <div className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">
              {stats?.total_under_repair ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Condemned</div>
            <div className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400">
              {stats?.total_condemned ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Valuation</div>
            <div className="text-lg font-bold mt-1 text-indigo-600 dark:text-indigo-400">
              ₹{(stats?.total_value || 0).toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Controls */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger value="all" className="text-xs">
              All ({items.length})
            </TabsTrigger>
            <TabsTrigger value="non_consumable" className="text-xs">
              Non-Consumable ({items.filter((i) => i.item_type === "non_consumable").length})
            </TabsTrigger>
            <TabsTrigger value="consumable" className="text-xs">
              Consumable ({items.filter((i) => i.item_type === "consumable").length})
            </TabsTrigger>
            <TabsTrigger value="repair" className="text-xs">
              Under Repair ({items.filter((i) => (i.repair_quantity || 0) > 0).length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search part no, item, shelf..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="w-44">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Inventory Table Tab Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading center inventory items...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
                  <Boxes className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>No inventory items found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-32 font-semibold">Part No / Code</TableHead>
                        <TableHead className="font-semibold">Item & Category</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Storage Location</TableHead>
                        <TableHead className="text-right font-semibold">Purchased</TableHead>
                        <TableHead className="text-right font-semibold">Available</TableHead>
                        <TableHead className="text-right font-semibold">Issued</TableHead>
                        <TableHead className="text-right font-semibold">Repair / Scrap</TableHead>
                        <TableHead className="text-right font-semibold">Unit Price</TableHead>
                        <TableHead className="text-center font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono font-medium text-xs text-foreground">
                            {item.part_no}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-xs text-foreground">{item.item_name}</div>
                            <div className="text-[11px] text-muted-foreground">{item.category}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.item_type === "non_consumable"
                                  ? "border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300 text-[10px]"
                                  : "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300 text-[10px]"
                              }
                            >
                              {item.item_type === "non_consumable" ? "Non-Consumable" : "Consumable"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.location || "General Storage"}</TableCell>
                          <TableCell className="text-right text-xs font-medium">
                            {item.total_purchased} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <span
                              className={`font-bold ${
                                item.available_quantity <= 2
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {item.available_quantity} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium text-amber-600 dark:text-amber-400">
                            {item.issued_quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {item.repair_quantity > 0 && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px] mr-1">
                                🔧 {item.repair_quantity}
                              </Badge>
                            )}
                            {item.condemned_quantity > 0 && (
                              <Badge variant="outline" className="text-rose-600 border-rose-200 text-[10px]">
                                ✕ {item.condemned_quantity}
                              </Badge>
                            )}
                            {item.repair_quantity === 0 && item.condemned_quantity === 0 && "-"}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold">
                            ₹{(Number(item.unit_price) || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAdjust(item)}
                                className="h-7 px-2 text-[11px]"
                              >
                                Adjust
                              </Button>
                              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-indigo-600">
                                <Link href="/center-lead/dashboard/issue-return">Issue</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New Center Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Boxes className="h-5 w-5 text-indigo-600" />
              Add Center Inventory Item
            </DialogTitle>
            <DialogDescription>
              Register an item into Center Lead's isolated inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="part_no" className="text-xs">
                  Part No / Model Code <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="part_no"
                  required
                  value={addForm.part_no}
                  onChange={(e) => setAddForm({ ...addForm, part_no: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Classification</Label>
                <Select
                  value={addForm.item_type}
                  onValueChange={(v) =>
                    setAddForm({
                      ...addForm,
                      item_type: v,
                      unit: v === "consumable" ? "pcs" : "units",
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_consumable" className="text-xs">
                      Non-Consumable (Returnable Hardware)
                    </SelectItem>
                    <SelectItem value="consumable" className="text-xs">
                      Consumable (Components / Filament)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="item_name" className="text-xs">
                  Item Description <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="item_name"
                  required
                  placeholder="e.g. Raspberry Pi 5 (8GB), RPLiDAR A2M8, Stepper Motor Driver..."
                  value={addForm.item_name}
                  onChange={(e) => setAddForm({ ...addForm, item_name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={addForm.category}
                  onValueChange={(v) => setAddForm({ ...addForm, category: v })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="total_purchased" className="text-xs">
                  Initial Total Quantity <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="total_purchased"
                  type="number"
                  min="1"
                  required
                  value={addForm.total_purchased}
                  onChange={(e) => setAddForm({ ...addForm, total_purchased: Number(e.target.value) || 1 })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="unit" className="text-xs">
                  Unit of Measurement
                </Label>
                <Input
                  id="unit"
                  value={addForm.unit}
                  onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="unit_price" className="text-xs">
                  Unit Price / Value (₹)
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  value={addForm.unit_price}
                  onChange={(e) => setAddForm({ ...addForm, unit_price: Number(e.target.value) || 0 })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="location" className="text-xs">
                  Storage Location / Bay
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Cabinet A - Rack 2, Sensor Locker B..."
                  value={addForm.location}
                  onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="remarks" className="text-xs">
                  Remarks / Specifications
                </Label>
                <Textarea
                  id="remarks"
                  rows={2}
                  placeholder="Hardware specs, operating notes, grant reference..."
                  value={addForm.remarks}
                  onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} disabled={adding}>
                Cancel
              </Button>
              <Button type="submit" disabled={adding} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {adding ? "Saving..." : "Add to Center Inventory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4 text-amber-500" />
              Adjust Stock: {selectedItem?.item_name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Current Available: <span className="font-bold text-foreground">{selectedItem?.available_quantity}</span>{" "}
              {selectedItem?.unit} • Under Repair:{" "}
              <span className="font-bold text-foreground">{selectedItem?.repair_quantity}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdjustSubmit} className="space-y-3.5">
            <div>
              <Label className="text-xs">Adjustment Type</Label>
              <Select
                value={adjustForm.action_type}
                onValueChange={(v) => setAdjustForm({ ...adjustForm, action_type: v })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumed" className="text-xs">
                    Mark Consumed / Distributed
                  </SelectItem>
                  <SelectItem value="repair_send" className="text-xs">
                    Send to Repair (🔧 Maintenance)
                  </SelectItem>
                  <SelectItem value="repair_return" className="text-xs">
                    Return from Repair (Back to Available)
                  </SelectItem>
                  <SelectItem value="condemned" className="text-xs">
                    Condemn / Scrap Damaged
                  </SelectItem>
                  <SelectItem value="purchase_add" className="text-xs">
                    Add Purchased Stock
                  </SelectItem>
                  <SelectItem value="stock_adjustment" className="text-xs">
                    Physical Audit Correction
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="adj_qty" className="text-xs">
                Quantity
              </Label>
              <Input
                id="adj_qty"
                type="number"
                min="1"
                required
                value={adjustForm.quantity_change}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity_change: Number(e.target.value) || 1 })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="adj_remark" className="text-xs">
                Mandatory Audit Remark <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="adj_remark"
                required
                rows={3}
                placeholder="Explain the reason for stock adjustment for inventory audit..."
                value={adjustForm.remark}
                onChange={(e) => setAdjustForm({ ...adjustForm, remark: e.target.value })}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAdjustDialogOpen(false)} disabled={adjusting}>
                Cancel
              </Button>
              <Button type="submit" disabled={adjusting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {adjusting ? "Updating..." : "Confirm Stock Change"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
