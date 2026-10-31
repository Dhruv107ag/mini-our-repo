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
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  User,
  Download,
  Boxes,
  Sparkles,
  Calendar,
  Check,
  ShieldAlert,
} from "lucide-react"

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

export interface CenterInventoryItem {
  id: number
  item_name: string
  part_no: string
  available_quantity: number
  unit: string
  item_type: string
}

export default function CenterLeadIssueReturnPage() {
  const { toast } = useToast()
  const [issues, setIssues] = useState<CenterItemIssue[]>([])
  const [inventoryList, setInventoryList] = useState<CenterInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [search, setSearch] = useState("")

  // Issue Dialog state
  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [issueForm, setIssueForm] = useState({
    inventory_id: "",
    quantity: 1,
    issued_to_name: "",
    issued_to_email: "",
    issued_to_role: "student",
    issued_to_id: "",
    department: "CSE",
    expected_return_date: "",
    purpose: "",
    remarks: "",
  })

  // Return Dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returning, setReturning] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<CenterItemIssue | null>(null)
  const [returnForm, setReturnForm] = useState({
    return_condition: "good",
    return_remarks: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [issueRes, invRes] = await Promise.all([
        fetch("/api/center-lead/issue-return", { cache: "no-store" }),
        fetch("/api/center-lead/inventory", { cache: "no-store" }),
      ])
      if (issueRes.ok) {
        const d = await issueRes.json()
        setIssues(d.issues || [])
      }
      if (invRes.ok) {
        const d = await invRes.json()
        setInventoryList(d.items || [])
      }
    } catch (e: any) {
      toast({
        title: "Load Error",
        description: e?.message || "Could not fetch issue records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Tab filter
      if (activeTab === "active" && issue.status !== "issued") return false
      if (activeTab === "overdue" && issue.status !== "overdue") return false
      if (activeTab === "returned" && issue.status !== "returned") return false

      // Search filter
      if (search.trim() !== "") {
        const s = search.toLowerCase()
        const match =
          issue.item_name.toLowerCase().includes(s) ||
          issue.issued_to_name.toLowerCase().includes(s) ||
          issue.issued_to_email.toLowerCase().includes(s) ||
          issue.issue_code.toLowerCase().includes(s) ||
          (issue.issued_to_id && issue.issued_to_id.toLowerCase().includes(s))
        if (!match) return false
      }

      return true
    })
  }, [issues, activeTab, search])

  // Count metrics
  const activeCount = useMemo(() => issues.filter((i) => i.status === "issued").length, [issues])
  const overdueCount = useMemo(() => issues.filter((i) => i.status === "overdue").length, [issues])
  const returnedCount = useMemo(() => issues.filter((i) => i.status === "returned").length, [issues])

  // Open Issue Dialog
  const handleOpenIssueDialog = () => {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 14) // Default 2 weeks return window
    setIssueForm({
      inventory_id: inventoryList.length > 0 ? String(inventoryList[0].id) : "",
      quantity: 1,
      issued_to_name: "",
      issued_to_email: "",
      issued_to_role: "student",
      issued_to_id: "",
      department: "CSE",
      expected_return_date: nextDate.toISOString().split("T")[0],
      purpose: "",
      remarks: "",
    })
    setIssueDialogOpen(true)
  }

  // Handle Issue Submit
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueForm.inventory_id) {
      toast({ title: "Validation Error", description: "Select an item to issue", variant: "destructive" })
      return
    }
    if (!issueForm.issued_to_name.trim()) {
      toast({ title: "Validation Error", description: "Requester name is required", variant: "destructive" })
      return
    }
    if (!issueForm.issued_to_email.trim() || !issueForm.issued_to_email.includes("@")) {
      toast({ title: "Validation Error", description: "Valid email is required", variant: "destructive" })
      return
    }

    try {
      setIssuing(true)
      const res = await fetch("/api/center-lead/issue-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to issue item")

      toast({
        title: "Component Issued Successfully",
        description: `Loan ${data.issue?.issue_code} recorded. Stock deducted from Center Inventory.`,
      })
      setIssueDialogOpen(false)
      await loadData()
    } catch (e: any) {
      toast({
        title: "Issue Failed",
        description: e?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIssuing(false)
    }
  }

  // Open Return Dialog
  const handleOpenReturn = (issue: CenterItemIssue) => {
    setSelectedIssue(issue)
    setReturnForm({
      return_condition: "good",
      return_remarks: "",
    })
    setReturnDialogOpen(true)
  }

  // Handle Return Submit
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIssue) return

    try {
      setReturning(true)
      const res = await fetch(`/api/center-lead/issue-return/${selectedIssue.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to record return")

      toast({
        title: "Component Return Recorded",
        description: `Successfully processed return for ${selectedIssue.item_name}. Stock restored to Center Inventory.`,
      })
      setReturnDialogOpen(false)
      await loadData()
    } catch (e: any) {
      toast({
        title: "Return Action Failed",
        description: e?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setReturning(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Issue Code",
      "Item Name",
      "Part No",
      "Type",
      "Quantity",
      "Issued To",
      "Email",
      "Role",
      "ID / Roll No",
      "Department",
      "Issue Date",
      "Expected Return",
      "Actual Return",
      "Status",
      "Condition",
      "Purpose",
      "Remarks",
    ]

    const rows = filteredIssues.map((i) => [
      i.issue_code,
      `"${i.item_name.replace(/"/g, '""')}"`,
      i.part_no,
      i.item_type,
      i.quantity,
      `"${i.issued_to_name.replace(/"/g, '""')}"`,
      i.issued_to_email,
      i.issued_to_role,
      i.issued_to_id || "",
      i.department,
      i.issue_date,
      i.expected_return_date || "",
      i.actual_return_date || "",
      i.status,
      i.return_condition || "",
      `"${(i.purpose || "").replace(/"/g, '""')}"`,
      `"${(i.remarks || "").replace(/"/g, '""')}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `center_issues_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const selectedInventoryItem = inventoryList.find((i) => String(i.id) === issueForm.inventory_id)

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              Issue & Return
            </h1>
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-xs font-semibold">
              Center Loan Desk
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue components to students & faculty from Center Inventory, track due dates, and restore returned equipment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export Logs
          </Button>
          <Button
            size="sm"
            onClick={handleOpenIssueDialog}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Issue Component
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Loans
            </CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{activeCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Currently checked out</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overdue Returns
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{overdueCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Exceeded return date</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Returned Items
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{returnedCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Restored to Center Inventory</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Transactions
            </CardTitle>
            <Boxes className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Lifetime center issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Controls */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger value="active" className="text-xs">
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs text-rose-600 dark:text-rose-400">
              Overdue ({overdueCount})
            </TabsTrigger>
            <TabsTrigger value="returned" className="text-xs">
              Returned ({returnedCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              All ({issues.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search student, item, issue code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Issues Table Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading issue records...</div>
              ) : filteredIssues.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground space-y-2">
                  <ArrowLeftRight className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>No records found in this view.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-32 font-semibold">Issue ID</TableHead>
                        <TableHead className="font-semibold">Item & Model</TableHead>
                        <TableHead className="text-right font-semibold">Qty</TableHead>
                        <TableHead className="font-semibold">Issued To</TableHead>
                        <TableHead className="font-semibold">Dept</TableHead>
                        <TableHead className="font-semibold">Issue Date</TableHead>
                        <TableHead className="font-semibold">Expected Return</TableHead>
                        <TableHead className="text-center font-semibold">Status</TableHead>
                        <TableHead className="text-center font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIssues.map((issue) => (
                        <TableRow key={issue.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono font-medium text-xs text-foreground">
                            {issue.issue_code}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-xs text-foreground">{issue.item_name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{issue.part_no}</div>
                            {issue.purpose && (
                              <div className="text-[10px] text-muted-foreground/80 italic line-clamp-1 mt-0.5">
                                For: {issue.purpose}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-foreground">
                            {issue.quantity}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-foreground">{issue.issued_to_name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {issue.issued_to_id ? `${issue.issued_to_id} • ` : ""}
                              {issue.issued_to_email}
                            </div>
                            <Badge variant="outline" className="text-[9px] capitalize px-1 py-0 mt-0.5">
                              {issue.issued_to_role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{issue.department || "CSE"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {issue.issue_date}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {issue.status === "returned" ? (
                              <span className="text-muted-foreground">
                                Returned on {issue.actual_return_date}
                              </span>
                            ) : (
                              <span
                                className={`font-medium ${
                                  issue.status === "overdue"
                                    ? "text-rose-600 dark:text-rose-400 font-bold"
                                    : "text-foreground"
                                }`}
                              >
                                {issue.expected_return_date || "Open loan"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {issue.status === "overdue" ? (
                              <Badge className="bg-rose-500/15 text-rose-600 border-rose-300 dark:border-rose-800 text-[10px]">
                                Overdue
                              </Badge>
                            ) : issue.status === "returned" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[10px]">
                                Returned ({issue.return_condition || "good"})
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-300 dark:border-amber-800 text-[10px]">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {issue.status !== "returned" ? (
                              <Button
                                size="sm"
                                onClick={() => handleOpenReturn(issue)}
                                className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" /> Return
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Restored</span>
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
        </TabsContent>
      </Tabs>

      {/* Issue Component Modal */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ArrowLeftRight className="h-5 w-5 text-amber-600" />
              Issue Component to Student / Faculty
            </DialogTitle>
            <DialogDescription>
              Check out hardware from Center Inventory. Available stock will be updated automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleIssueSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <Label className="text-xs">
                  Select Item from Center Inventory <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={issueForm.inventory_id}
                  onValueChange={(v) => setIssueForm({ ...issueForm, inventory_id: v })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose inventory item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryList.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)} className="text-xs">
                        {item.item_name} ({item.part_no}) — {item.available_quantity} {item.unit} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedInventoryItem && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Available in stock:{" "}
                    <span className="font-semibold text-emerald-600">
                      {selectedInventoryItem.available_quantity} {selectedInventoryItem.unit}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="issue_qty" className="text-xs">
                  Quantity to Issue <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="issue_qty"
                  type="number"
                  min="1"
                  max={selectedInventoryItem?.available_quantity || 100}
                  required
                  value={issueForm.quantity}
                  onChange={(e) => setIssueForm({ ...issueForm, quantity: Number(e.target.value) || 1 })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="expected_date" className="text-xs">
                  Expected Return Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="expected_date"
                  type="date"
                  required
                  value={issueForm.expected_return_date}
                  onChange={(e) => setIssueForm({ ...issueForm, expected_return_date: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Requester Role</Label>
                <Select
                  value={issueForm.issued_to_role}
                  onValueChange={(v) => setIssueForm({ ...issueForm, issued_to_role: v as any })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" className="text-xs">
                      Student
                    </SelectItem>
                    <SelectItem value="faculty" className="text-xs">
                      Faculty
                    </SelectItem>
                    <SelectItem value="staff" className="text-xs">
                      Staff
                    </SelectItem>
                    <SelectItem value="other" className="text-xs">
                      Other / Researcher
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issued_to_id" className="text-xs">
                  Roll Number / Employee ID <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="issued_to_id"
                  required
                  placeholder="e.g. 23UCS045 or EMP-ECE-108"
                  value={issueForm.issued_to_id}
                  onChange={(e) => setIssueForm({ ...issueForm, issued_to_id: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="issued_to_name" className="text-xs">
                  Requester Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="issued_to_name"
                  required
                  placeholder="e.g. Aman Verma"
                  value={issueForm.issued_to_name}
                  onChange={(e) => setIssueForm({ ...issueForm, issued_to_name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="issued_to_email" className="text-xs">
                  LNMIIT Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="issued_to_email"
                  type="email"
                  required
                  placeholder="name@lnmiit.ac.in"
                  value={issueForm.issued_to_email}
                  onChange={(e) => setIssueForm({ ...issueForm, issued_to_email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="department" className="text-xs">
                  Department
                </Label>
                <Select
                  value={issueForm.department}
                  onValueChange={(v) => setIssueForm({ ...issueForm, department: v })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE" className="text-xs">CSE</SelectItem>
                    <SelectItem value="ECE" className="text-xs">ECE</SelectItem>
                    <SelectItem value="CCE" className="text-xs">CCE</SelectItem>
                    <SelectItem value="MME" className="text-xs">MME</SelectItem>
                    <SelectItem value="Physics" className="text-xs">Physics</SelectItem>
                    <SelectItem value="Other" className="text-xs">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="purpose" className="text-xs">
                  Research / Project Purpose
                </Label>
                <Input
                  id="purpose"
                  placeholder="e.g. Drone Obstacle Avoidance Capstone, SLAM testing..."
                  value={issueForm.purpose}
                  onChange={(e) => setIssueForm({ ...issueForm, purpose: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIssueDialogOpen(false)} disabled={issuing}>
                Cancel
              </Button>
              <Button type="submit" disabled={issuing} className="bg-amber-600 hover:bg-amber-700 text-white">
                {issuing ? "Issuing Item..." : "Confirm & Issue Hardware"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Return Modal */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <RotateCcw className="h-4 w-4 text-emerald-600" />
              Process Component Return
            </DialogTitle>
            <DialogDescription className="text-xs">
              Returning <span className="font-semibold text-foreground">{selectedIssue?.item_name}</span> (Qty:{" "}
              {selectedIssue?.quantity}) from {selectedIssue?.issued_to_name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReturnSubmit} className="space-y-3.5">
            <div>
              <Label className="text-xs">Physical Condition Upon Return</Label>
              <Select
                value={returnForm.return_condition}
                onValueChange={(v) => setReturnForm({ ...returnForm, return_condition: v })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good" className="text-xs">
                    Good Condition (Restored to Available Stock)
                  </SelectItem>
                  <SelectItem value="minor_damage" className="text-xs">
                    Minor Wear (Functional, Restored)
                  </SelectItem>
                  <SelectItem value="damaged" className="text-xs">
                    Damaged / Non-Functional (Moved to Condemned)
                  </SelectItem>
                  <SelectItem value="lost" className="text-xs">
                    Lost / Unrecoverable (Marked Lost)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="return_remarks" className="text-xs">
                Inspection Remarks / Notes
              </Label>
              <Textarea
                id="return_remarks"
                rows={3}
                placeholder="Inspected power cord, tested serial interface, accessories verified..."
                value={returnForm.return_remarks}
                onChange={(e) => setReturnForm({ ...returnForm, return_remarks: e.target.value })}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setReturnDialogOpen(false)} disabled={returning}>
                Cancel
              </Button>
              <Button type="submit" disabled={returning} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {returning ? "Recording..." : "Confirm Return & Restore Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
