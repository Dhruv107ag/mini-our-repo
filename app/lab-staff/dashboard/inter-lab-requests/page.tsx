/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 * Inter-Lab Component Requisitions Dashboard Page:
 * Allows lab staff to request components from other laboratories,
 * review incoming requests from other staff, approve/reject them,
 * and track real-time confirmations with instant notifications.
 */

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeftRight,
  Package,
  Clock,
  Calendar,
  Building,
  User,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Send,
  Check,
  X,
  Sparkles,
  Inbox,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react"

export interface InterLabItem {
  id: number
  from_lab_id: number
  from_lab_name: string
  from_staff_id: number
  from_staff_name: string
  from_staff_email: string
  to_lab_id: number
  to_lab_name: string
  to_staff_id: number
  to_staff_name: string
  to_staff_email: string
  item_name: string
  quantity: number
  purpose: string
  needed_by_date?: string | null
  expected_return_date?: string | null
  status: "pending" | "approved" | "rejected" | "returned"
  approver_remarks?: string | null
  action_at?: string | null
  created_at: string
}

export default function InterLabRequestsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing")
  const [incoming, setIncoming] = useState<InterLabItem[]>([])
  const [outgoing, setOutgoing] = useState<InterLabItem[]>([])
  const [myLabs, setMyLabs] = useState<Array<{ id: number; name: string }>>([])
  const [availableTargetLabs, setAvailableTargetLabs] = useState<
    Array<{ id: number; name: string; staff_id: number; staff_name: string }>
  >([])
  const [loading, setLoading] = useState(true)

  // New Request Dialog state
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newFromLabId, setNewFromLabId] = useState<string>("")
  const [newToLabId, setNewToLabId] = useState<string>("")
  const [newItemName, setNewItemName] = useState("")
  const [newQuantity, setNewQuantity] = useState(1)
  const [newPurpose, setNewPurpose] = useState("")
  const [newNeededByDate, setNewNeededByDate] = useState("")
  const [newReturnDate, setNewReturnDate] = useState("")
  const [submittingNew, setSubmittingNew] = useState(false)

  // Action Dialog state (Approve/Reject)
  const [actionItem, setActionItem] = useState<InterLabItem | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [actionRemarks, setActionRemarks] = useState("")
  const [submittingAction, setSubmittingAction] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/lab-staff/inter-lab-requests", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load inter-lab requests")
      const data = await res.json()
      setIncoming(data.incoming || [])
      setOutgoing(data.outgoing || [])
      setMyLabs(data.myLabs || [])
      setAvailableTargetLabs(data.availableTargetLabs || [])

      if (data.myLabs && data.myLabs.length > 0 && !newFromLabId) {
        setNewFromLabId(String(data.myLabs[0].id))
      }
    } catch (err: any) {
      toast({
        title: "Failed to load requests",
        description: err?.message || "Please check network connection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFromLabId || !newToLabId || !newItemName.trim() || !newPurpose.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmittingNew(true)
    try {
      const res = await fetch("/api/lab-staff/inter-lab-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLabId: Number(newFromLabId),
          toLabId: Number(newToLabId),
          itemName: newItemName.trim(),
          quantity: Number(newQuantity) || 1,
          purpose: newPurpose.trim(),
          neededByDate: newNeededByDate || undefined,
          expectedReturnDate: newReturnDate || undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to create inter-lab requisition")
      }

      toast({
        title: "🚀 Requisition Submitted",
        description: `Request created and notification sent directly to target lab staff.`,
      })

      setIsNewDialogOpen(false)
      // Reset form
      setNewItemName("")
      setNewQuantity(1)
      setNewPurpose("")
      setNewNeededByDate("")
      setNewReturnDate("")
      setActiveTab("outgoing")
      await loadData()
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err?.message || "Could not submit request",
        variant: "destructive",
      })
    } finally {
      setSubmittingNew(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!actionItem) return

    setSubmittingAction(true)
    try {
      const res = await fetch(`/api/lab-staff/inter-lab-requests/${actionItem.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          remarks: actionRemarks.trim(),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to ${actionType} request`)
      }

      const isApprove = actionType === "approve"
      toast({
        title: isApprove ? "✅ Request Approved & Confirmed" : "❌ Request Declined",
        description: `Confirmation notification sent to ${actionItem.from_staff_name} (${actionItem.from_lab_name}).`,
      })

      setActionItem(null)
      setActionRemarks("")
      await loadData()
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err?.message || "Could not process request",
        variant: "destructive",
      })
    } finally {
      setSubmittingAction(false)
    }
  }

  const pendingIncomingCount = incoming.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
            Inter-Lab Component Requisitions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Borrow equipment from other laboratories or approve incoming requests from fellow lab staff
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-9 gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewDialogOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Inter-Lab Request
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80 gap-6">
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "outgoing"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          My Outgoing Requests ({outgoing.length})
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors relative ${
            activeTab === "incoming"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Inbox className="h-4 w-4" />
          Incoming Requests from Other Labs ({incoming.length})
          {pendingIncomingCount > 0 && (
            <span className="h-2 w-2 rounded-full bg-rose-600" />
          )}
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm">Loading requisitions...</p>
          </CardContent>
        </Card>
      ) : activeTab === "outgoing" ? (
        /* OUTGOING REQUESTS (STAFF A SEES CONFIRMATIONS) */
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground space-y-3">
                <Package className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="text-base font-semibold text-foreground">No Outgoing Requisitions Yet</p>
                <p className="text-xs max-w-md mx-auto">
                  Need an instrument or component for your lab? Click &quot;New Inter-Lab Request&quot; to borrow from another laboratory.
                </p>
                <Button size="sm" onClick={() => setIsNewDialogOpen(true)} className="text-xs font-semibold mt-2">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Create Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {outgoing.map((item) => {
                const isApproved = item.status === "approved"
                const isRejected = item.status === "rejected"
                const isPending = item.status === "pending"

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all ${
                      isApproved
                        ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm"
                        : "border-border/80"
                    }`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            {item.item_name}
                          </span>
                          <Badge variant="outline" className="font-semibold text-xs">
                            Qty: {item.quantity}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            Request #{item.id}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isApproved && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 px-3 py-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              CONFIRMED &amp; APPROVED
                            </Badge>
                          )}
                          {isPending && (
                            <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 px-3 py-1">
                              <Clock className="h-3.5 w-3.5" />
                              PENDING APPROVAL
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1 px-3 py-1">
                              <XCircle className="h-3.5 w-3.5" />
                              DECLINED
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            Target Lab: <strong className="text-foreground">{item.to_lab_name}</strong>
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Target In-Charge: <strong className="text-foreground">{item.to_staff_name}</strong> ({item.to_staff_email})
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Submitted: <strong>{new Date(item.created_at).toLocaleDateString("en-IN")}</strong>
                          </p>
                          {item.expected_return_date && (
                            <p className="text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              Expected Return: <strong>{item.expected_return_date}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground">Justification / Purpose:</p>
                        <p>{item.purpose}</p>
                      </div>

                      {/* Confirmation Box when Approved */}
                      {isApproved && (
                        <div className="p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-100/60 dark:bg-emerald-950/30 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                            <Sparkles className="h-4 w-4" />
                            Request Confirmed by {item.to_staff_name}
                          </div>
                          <p className="text-emerald-700 dark:text-emerald-400">
                            Remarks: <em>&quot;{item.approver_remarks || "Approved for inter-lab transfer. You may now collect the equipment."}&quot;</em>
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium">
                            Approved on: {item.action_at ? new Date(item.action_at).toLocaleString("en-IN") : "Recently"} &bull; Ready for handover at {item.to_lab_name}
                          </p>
                        </div>
                      )}

                      {isRejected && item.approver_remarks && (
                        <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-400">
                          <strong>Decline Reason:</strong> {item.approver_remarks}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* INCOMING REQUESTS (STAFF B REVIEWS AND APPROVES) */
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="text-base font-semibold text-foreground">No Incoming Requisitions</p>
                <p className="text-xs">No other laboratories currently have pending requests for your equipment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {incoming.map((item) => {
                const isPending = item.status === "pending"
                const isApproved = item.status === "approved"

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all ${
                      isPending ? "border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm" : "border-border/80"
                    }`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            {item.item_name}
                          </span>
                          <Badge variant="outline" className="font-semibold text-xs">
                            Qty: {item.quantity}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            From: <strong>{item.from_lab_name}</strong>
                          </span>
                        </div>

                        <div>
                          {isPending ? (
                            <Badge className="bg-amber-600 text-white font-bold gap-1 px-3 py-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              ACTION REQUIRED
                            </Badge>
                          ) : (
                            <Badge
                              className={
                                isApproved
                                  ? "bg-emerald-600 text-white font-bold"
                                  : "bg-rose-600 text-white font-bold"
                              }
                            >
                              {item.status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Requesting Staff: <strong className="text-foreground">{item.from_staff_name}</strong> ({item.from_staff_email})
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            Source Lab: <strong className="text-foreground">{item.from_lab_name}</strong>
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Received: <strong>{new Date(item.created_at).toLocaleDateString("en-IN")}</strong>
                          </p>
                          {item.expected_return_date && (
                            <p className="text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              Expected Return: <strong>{item.expected_return_date}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground">Need / Purpose:</p>
                        <p>{item.purpose}</p>
                      </div>

                      {/* Action Buttons for Staff B */}
                      {isPending ? (
                        <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
                          <Button
                            size="sm"
                            onClick={() => {
                              setActionItem(item)
                              setActionType("approve")
                              setActionRemarks("Approved. Tested and ready for handover.")
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve &amp; Transfer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActionItem(item)
                              setActionType("reject")
                              setActionRemarks("Item currently occupied or needed for scheduled lab.")
                            }}
                            className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold text-xs gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground pt-1">
                          Resolved on: <strong>{item.action_at ? new Date(item.action_at).toLocaleString("en-IN") : "Recently"}</strong>
                          {item.approver_remarks && (
                            <span> &bull; Remarks: <em>&quot;{item.approver_remarks}&quot;</em></span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW INTER-LAB REQUEST DIALOG */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ArrowLeftRight className="h-5 w-5 text-blue-600" />
              New Inter-Lab Requisition
            </DialogTitle>
            <DialogDescription className="text-xs">
              Request components or instruments from another laboratory. The assigned staff member of that lab will be notified.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">My Laboratory (Source)</label>
              <Select value={newFromLabId} onValueChange={setNewFromLabId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select your lab" />
                </SelectTrigger>
                <SelectContent>
                  {myLabs.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)} className="text-xs">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Laboratory (To Borrow From)</label>
              <Select value={newToLabId} onValueChange={setNewToLabId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select target lab" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetLabs.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)} className="text-xs">
                      {l.name} &bull; (In-charge: {l.staff_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Component / Instrument Name</label>
                <Input
                  placeholder="e.g. Logic Analyzer, DSO"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value) || 1)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Purpose &amp; Lab Activity Justification</label>
              <Textarea
                placeholder="Explain why this equipment is needed for your lab session or project..."
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                className="text-xs h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Needed By Date</label>
                <Input
                  type="date"
                  value={newNeededByDate}
                  onChange={(e) => setNewNeededByDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Expected Return Date</label>
                <Input
                  type="date"
                  value={newReturnDate}
                  onChange={(e) => setNewReturnDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5"
              >
                <Send className={`h-3.5 w-3.5 ${submittingNew ? "animate-spin" : ""}`} />
                {submittingNew ? "Submitting..." : "Send Requisition"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* APPROVE / REJECT ACTION DIALOG */}
      <Dialog open={!!actionItem} onOpenChange={(open) => !open && setActionItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              {actionType === "approve" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Approve Inter-Lab Requisition
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-rose-600" />
                  Decline Inter-Lab Requisition
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "approve"
                ? `Confirm handover of "${actionItem?.item_name}" (Qty: ${actionItem?.quantity}) to ${actionItem?.from_staff_name} (${actionItem?.from_lab_name}).`
                : `Specify reason for declining request from ${actionItem?.from_staff_name}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {actionType === "approve" ? "Handover Remarks & Instructions" : "Decline Reason"}
              </label>
              <Textarea
                placeholder={
                  actionType === "approve"
                    ? "e.g. Ready for collection from rack 3, tested and calibrated."
                    : "e.g. Currently in use for semester examinations."
                }
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                className="text-xs h-20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setActionItem(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className={`text-xs font-semibold gap-1.5 text-white ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {submittingAction
                  ? "Processing..."
                  : actionType === "approve"
                  ? "Confirm & Notify Requester"
                  : "Decline & Notify Requester"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
