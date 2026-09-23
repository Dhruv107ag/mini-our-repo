/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Lock, AlertCircle, CheckCircle2, Sliders, ShieldCheck, ArrowRight, Check } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [nameLoading, setNameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [newName, setNewName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Department Component Approval Authority State
  const [department, setDepartment] = useState<any>(null)
  const [deptLoading, setDeptLoading] = useState(true)
  const [compAuthority, setCompAuthority] = useState<'faculty' | 'lab_staff' | 'lab_coordinator' | 'hod'>('hod')
  const [deptSaveLoading, setDeptSaveLoading] = useState(false)
  const [deptMessage, setDeptMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setNewName(parsedUser.name || "")
    }
    loadDeptSettings()
  }, [])

  const loadDeptSettings = async () => {
    setDeptLoading(true)
    try {
      const res = await fetch("/api/hod/approval-settings", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.department) {
          setDepartment(data.department)
          setCompAuthority(data.department.component_highest_approval_authority || 'hod')
        }
      }
    } catch (e) {
      console.error("Failed to load department approval settings:", e)
    } finally {
      setDeptLoading(false)
    }
  }

  const handleSaveApprovalAuthority = async () => {
    setDeptSaveLoading(true)
    setDeptMessage(null)
    try {
      const res = await fetch("/api/hod/approval-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          component_highest_approval_authority: compAuthority
        })
      })
      const data = await res.json()
      if (res.ok) {
        setDeptMessage({ type: 'success', text: "Component issue approval authority updated successfully!" })
        if (data.department) {
          setDepartment(data.department)
        }
      } else {
        setDeptMessage({ type: 'error', text: data.error || "Failed to update approval authority" })
      }
    } catch (e: any) {
      setDeptMessage({ type: 'error', text: "An error occurred while saving settings" })
    } finally {
      setDeptSaveLoading(false)
    }
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    setNameMessage(null)

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })

      const data = await res.json()

      if (res.ok) {
        setNameMessage({ type: 'success', text: data.message })
        // Update localStorage
        const updatedUser = { ...user, name: data.name }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        
        // Reload page after 1.5 seconds to reflect changes
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setNameMessage({ type: 'error', text: data.error || "Failed to update name" })
      }
    } catch (error) {
      setNameMessage({ type: 'error', text: "An error occurred" })
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: "Passwords do not match" })
      setPasswordLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage({ type: 'success', text: data.message })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordMessage({ type: 'error', text: data.error || "Failed to change password" })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: "An error occurred" })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and security settings</p>
      </div>

      <div className="grid gap-6">
        {/* Component Approval Workflow Configuration */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Component Issue Approval Authority (Final Call)
                </CardTitle>
                <CardDescription className="mt-1">
                  Configure the approval chain for component issue requests and decide who takes the final approval call.
                </CardDescription>
              </div>
              {department && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-background">
                    Dept: {department.name} ({department.code})
                  </Badge>
                  {department.lab_coordinator_name && (
                    <Badge variant="secondary" className="text-xs">
                      Coordinator: {department.lab_coordinator_name}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {deptLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2" />
                Loading workflow configuration...
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Select Final Approval Authority</Label>
                  <p className="text-xs text-muted-foreground mb-4">
                    The request will follow the sequence until the chosen final authority gives approval. Once approved by the final authority, the request is marked <strong>Approved</strong> and Lab Staff can issue the items.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Option 1: Faculty */}
                    <div
                      onClick={() => setCompAuthority('faculty')}
                      className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        compAuthority === 'faculty'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm">Faculty Mentor</div>
                        {compAuthority === 'faculty' && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Flow terminates early: Once mentor faculty approves, the request is immediately approved.
                      </p>
                      <Badge variant="outline" className="mt-2 w-fit text-[10px] bg-background">1-Step Approval</Badge>
                    </div>

                    {/* Option 2: Lab Staff */}
                    <div
                      onClick={() => setCompAuthority('lab_staff')}
                      className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        compAuthority === 'lab_staff'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm">Lab Staff</div>
                        {compAuthority === 'lab_staff' && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Student &rarr; Faculty &rarr; Lab Staff. When Lab Staff approves, request is approved and issued.
                      </p>
                      <Badge variant="outline" className="mt-2 w-fit text-[10px] bg-background">2-Step Approval</Badge>
                    </div>

                    {/* Option 3: Lab Coordinator */}
                    <div
                      onClick={() => setCompAuthority('lab_coordinator')}
                      className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        compAuthority === 'lab_coordinator'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm">Lab Coordinator</div>
                        {compAuthority === 'lab_coordinator' && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Student &rarr; Faculty &rarr; Lab Staff &rarr; Lab Coordinator. Coordinator gives final approval.
                      </p>
                      <Badge variant="outline" className="mt-2 w-fit text-[10px] bg-background">3-Step Approval</Badge>
                    </div>

                    {/* Option 4: HOD */}
                    <div
                      onClick={() => setCompAuthority('hod')}
                      className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        compAuthority === 'hod'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm">HOD (Head of Department)</div>
                        {compAuthority === 'hod' && <Check className="h-4 w-4 text-primary font-bold" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Full hierarchy: Student &rarr; Faculty &rarr; Lab Staff &rarr; Lab Coordinator &rarr; HOD. HOD takes final call.
                      </p>
                      <Badge variant="default" className="mt-2 w-fit text-[10px]">Default Full Chain</Badge>
                    </div>
                  </div>
                </div>

                {/* Visual Pipeline Progression Preview */}
                <div className="bg-muted/40 p-4 rounded-lg border border-dashed">
                  <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" />
                    LIVE WORKFLOW PREVIEW FOR SELECTED AUTHORITY
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-medium">Student Requests</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={`px-2.5 py-1 rounded font-medium border ${
                      compAuthority === 'faculty' 
                        ? 'bg-green-100 border-green-500 text-green-800 font-semibold ring-2 ring-green-300' 
                        : 'bg-card text-foreground'
                    }`}>
                      Faculty Review {compAuthority === 'faculty' && '★ Final Call'}
                    </span>

                    <ArrowRight className={`h-3.5 w-3.5 ${compAuthority === 'faculty' ? 'opacity-30' : 'text-muted-foreground'}`} />
                    <span className={`px-2.5 py-1 rounded font-medium border ${
                      compAuthority === 'faculty'
                        ? 'opacity-40 line-through bg-muted text-muted-foreground'
                        : compAuthority === 'lab_staff'
                          ? 'bg-green-100 border-green-500 text-green-800 font-semibold ring-2 ring-green-300'
                          : 'bg-card text-foreground'
                    }`}>
                      Lab Staff Review {compAuthority === 'lab_staff' && '★ Final Call'}
                    </span>

                    <ArrowRight className={`h-3.5 w-3.5 ${['faculty', 'lab_staff'].includes(compAuthority) ? 'opacity-30' : 'text-muted-foreground'}`} />
                    <span className={`px-2.5 py-1 rounded font-medium border ${
                      ['faculty', 'lab_staff'].includes(compAuthority)
                        ? 'opacity-40 line-through bg-muted text-muted-foreground'
                        : compAuthority === 'lab_coordinator'
                          ? 'bg-green-100 border-green-500 text-green-800 font-semibold ring-2 ring-green-300'
                          : 'bg-card text-foreground'
                    }`}>
                      Lab Coordinator Review {compAuthority === 'lab_coordinator' && '★ Final Call'}
                    </span>

                    <ArrowRight className={`h-3.5 w-3.5 ${compAuthority !== 'hod' ? 'opacity-30' : 'text-muted-foreground'}`} />
                    <span className={`px-2.5 py-1 rounded font-medium border ${
                      compAuthority !== 'hod'
                        ? 'opacity-40 line-through bg-muted text-muted-foreground'
                        : 'bg-green-100 border-green-500 text-green-800 font-semibold ring-2 ring-green-300'
                    }`}>
                      HOD Approval {compAuthority === 'hod' && '★ Final Call'}
                    </span>

                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    <span className="px-2.5 py-1 rounded bg-green-600 text-white font-bold">
                      ✓ Approved & Issued
                    </span>
                  </div>
                </div>

                {deptMessage && (
                  <Alert variant={deptMessage.type === 'error' ? 'destructive' : 'default'}>
                    {deptMessage.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{deptMessage.text}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleSaveApprovalAuthority} 
                  disabled={deptSaveLoading || (department && department.component_highest_approval_authority === compAuthority)}
                >
                  {deptSaveLoading ? "Saving..." : "Save Approval Authority Setting"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your name and profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={user.role} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              {nameMessage && (
                <Alert variant={nameMessage.type === 'error' ? 'destructive' : 'default'}>
                  {nameMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{nameMessage.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={nameLoading || newName === user.name}>
                {nameLoading ? "Updating..." : "Update Name"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordMessage && (
                <Alert variant={passwordMessage.type === 'error' ? 'destructive' : 'default'}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{passwordMessage.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
