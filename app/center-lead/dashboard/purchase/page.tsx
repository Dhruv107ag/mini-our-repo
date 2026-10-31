"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Receipt,
  FileCheck2,
  DollarSign,
  Boxes,
} from "lucide-react"

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

export default function CenterLeadPurchasesPage() {
  const { toast } = useToast()
  const [purchases, setPurchases] = useState<CenterPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [typeFilter, setTypeFilter] = useState("all")

  // New Purchase Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    purchase_no: "",
    item_name: "",
    item_type: "non_consumable",
    category: "Robotics & Edge AI",
    part_no: "",
    quantity: 1,
    unit: "units",
    unit_price: 0,
    vendor_name: "",
    vendor_contact: "",
    purchase_date: new Date().toISOString().split("T")[0],
    invoice_pdf_url: "/uploads/inventory/sample-invoice-dso.pdf",
    invoice_pdf_name: "Invoice.pdf",
    added_to_inventory: true,
    location: "Center Storage Bay 1",
    remarks: "",
  })

  const loadPurchases = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/center-lead/purchases", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load purchase records")
      const data = await res.json()
      setPurchases(data.purchases || [])
    } catch (e: any) {
      toast({
        title: "Load Error",
        description: e?.message || "Could not fetch purchases",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        search.trim() === "" ||
        p.item_name.toLowerCase().includes(search.toLowerCase()) ||
        p.purchase_no.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor_name.toLowerCase().includes(search.toLowerCase())

      const matchCategory =
        categoryFilter === "All Categories" || p.category === categoryFilter

      const matchType = typeFilter === "all" || p.item_type === typeFilter

      return matchSearch && matchCategory && matchType
    })
  }, [purchases, search, categoryFilter, typeFilter])

  // Calculations for KPIs
  const totalAmount = useMemo(() => {
    return purchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0)
  }, [purchases])

  const consumableSpend = useMemo(() => {
    return purchases
      .filter((p) => p.item_type === "consumable")
      .reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0)
  }, [purchases])

  const nonConsumableSpend = useMemo(() => {
    return purchases
      .filter((p) => p.item_type === "non_consumable")
      .reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0)
  }, [purchases])

  const handleOpenDialog = () => {
    const nextNo = `CP-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, "0")}`
    setFormData({
      purchase_no: nextNo,
      item_name: "",
      item_type: "non_consumable",
      category: "Robotics & Edge AI",
      part_no: "",
      quantity: 1,
      unit: "units",
      unit_price: 0,
      vendor_name: "",
      vendor_contact: "",
      purchase_date: new Date().toISOString().split("T")[0],
      invoice_pdf_url: "/uploads/inventory/sample-invoice-dso.pdf",
      invoice_pdf_name: `${nextNo}_Invoice.pdf`,
      added_to_inventory: true,
      location: "Center Storage Bay 1",
      remarks: "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.item_name.trim()) {
      toast({ title: "Validation Error", description: "Item Name is required", variant: "destructive" })
      return
    }
    if (!formData.vendor_name.trim()) {
      toast({ title: "Validation Error", description: "Vendor Name is required", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      const total = (Number(formData.quantity) || 1) * (Number(formData.unit_price) || 0)
      const res = await fetch("/api/center-lead/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          total_amount: total,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save purchase")

      toast({
        title: "Purchase Recorded",
        description: `Successfully added ${formData.purchase_no}. ${
          formData.added_to_inventory ? "Stock automatically updated in Center Inventory." : ""
        }`,
      })

      setDialogOpen(false)
      await loadPurchases()
    } catch (e: any) {
      toast({
        title: "Error Recording Purchase",
        description: e?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Purchase No",
      "Item Name",
      "Type",
      "Category",
      "Quantity",
      "Unit",
      "Unit Price (INR)",
      "Total Amount (INR)",
      "Vendor",
      "Vendor Contact",
      "Date",
      "Status",
      "Added to Inventory",
      "Remarks",
    ]

    const rows = filteredPurchases.map((p) => [
      p.purchase_no,
      `"${p.item_name.replace(/"/g, '""')}"`,
      p.item_type,
      `"${p.category || ""}"`,
      p.quantity,
      p.unit,
      p.unit_price,
      p.total_amount,
      `"${p.vendor_name.replace(/"/g, '""')}"`,
      `"${p.vendor_contact || ""}"`,
      p.purchase_date,
      p.status,
      p.added_to_inventory ? "Yes" : "No",
      `"${(p.remarks || "").replace(/"/g, '""')}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `center_purchases_${new Date().toISOString().split("T")[0]}.csv`)
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
              <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Dept Purchase
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
              Center Procurement Register
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Procurement records, vendor invoices, purchase orders, and automatic inventory synchronization for Center Lead
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={handleOpenDialog}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Record New Purchase
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Purchases
            </CardTitle>
            <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length} Orders</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Procured under Center funds</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Expenditure
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{totalAmount.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative purchase value</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Non-Consumable Equipment
            </CardTitle>
            <Boxes className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{nonConsumableSpend.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Long-term development hardware</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Consumable Modules
            </CardTitle>
            <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{consumableSpend.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sensor modules, filaments & parts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search item, PO#, or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 text-xs">
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

              <div className="w-full sm:w-40">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Item Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Types
                    </SelectItem>
                    <SelectItem value="non_consumable" className="text-xs">
                      Non-Consumable
                    </SelectItem>
                    <SelectItem value="consumable" className="text-xs">
                      Consumable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Data Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading purchases ledger...</div>
          ) : filteredPurchases.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
              <Receipt className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p>No purchase records matched your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-32 font-semibold">PO Number</TableHead>
                    <TableHead className="font-semibold">Item & Category</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Vendor & Contact</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Qty</TableHead>
                    <TableHead className="text-right font-semibold">Unit Price</TableHead>
                    <TableHead className="text-right font-semibold">Total Amount</TableHead>
                    <TableHead className="text-center font-semibold">Inventory Sync</TableHead>
                    <TableHead className="text-center font-semibold">Invoice PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono font-medium text-xs text-foreground">
                        {p.purchase_no}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{p.item_name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.category}</div>
                        {p.remarks && (
                          <div className="text-[10px] text-muted-foreground/80 italic mt-0.5 line-clamp-1">
                            Ref: {p.remarks}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            p.item_type === "non_consumable"
                              ? "border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300 text-[10px]"
                              : "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300 text-[10px]"
                          }
                        >
                          {p.item_type === "non_consumable" ? "Non-Consumable" : "Consumable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{p.vendor_name}</div>
                        {p.vendor_contact && (
                          <div className="text-[11px] text-muted-foreground">{p.vendor_contact}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {p.purchase_date}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold">
                        {p.quantity} {p.unit}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        ₹{(Number(p.unit_price) || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(Number(p.total_amount) || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.added_to_inventory ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Stock Synced
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px]">
                            Standalone
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.invoice_pdf_url ? (
                          <a
                            href={p.invoice_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>PDF</span>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record New Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              Record Department Purchase
            </DialogTitle>
            <DialogDescription>
              Enter purchase order details, upload vendor invoice, and automatically update Center Inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase_no" className="text-xs">
                  Purchase Order / Invoice # <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="purchase_no"
                  required
                  value={formData.purchase_no}
                  onChange={(e) => setFormData({ ...formData, purchase_no: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="purchase_date" className="text-xs">
                  Purchase Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="purchase_date"
                  type="date"
                  required
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="item_name" className="text-xs">
                  Item / Equipment Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="item_name"
                  required
                  placeholder="e.g. Jetson Orin Nano, 3D Printer Filament, Oscilloscope..."
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Item Classification</Label>
                <Select
                  value={formData.item_type}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
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
                      Consumable (Component / Filament)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
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
                <Label htmlFor="quantity" className="text-xs">
                  Quantity <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="unit" className="text-xs">
                  Unit (pcs, units, sets, spools)
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="unit_price" className="text-xs">
                  Unit Price (₹) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) || 0 })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Calculated Total Spend</Label>
                <div className="h-9 px-3 rounded-md bg-muted/60 flex items-center font-bold text-emerald-600 text-sm">
                  ₹{((formData.quantity || 1) * (formData.unit_price || 0)).toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <Label htmlFor="vendor_name" className="text-xs">
                  Vendor / Supplier Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vendor_name"
                  required
                  placeholder="e.g. Robu Enterprises, Element14..."
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="vendor_contact" className="text-xs">
                  Vendor Contact / Email / Phone
                </Label>
                <Input
                  id="vendor_contact"
                  placeholder="e.g. sales@vendor.com | +91..."
                  value={formData.vendor_contact}
                  onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="location" className="text-xs">
                  Center Storage Location / Rack
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Cabinet A - Rack 2, Sensor Locker..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="remarks" className="text-xs">
                  Purpose / Project Grant Reference
                </Label>
                <Textarea
                  id="remarks"
                  rows={2}
                  placeholder="Procured under Center of Excellence research project or student workshop fund..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Automatic Center Inventory Integration checkbox */}
              <div className="sm:col-span-2 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="added_to_inventory"
                  checked={formData.added_to_inventory}
                  onChange={(e) => setFormData({ ...formData, added_to_inventory: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="added_to_inventory" className="text-xs cursor-pointer">
                  <span className="font-semibold text-foreground">
                    Automatically add this stock into Center Inventory
                  </span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    If enabled, the item will immediately be available in the Center Lead Inventory register for issue to
                    students and faculty without manual duplicate entry.
                  </p>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? "Saving Purchase..." : "Save Purchase & Update Inventory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
