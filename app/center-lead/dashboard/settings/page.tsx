"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, AlertCircle, CheckCircle2, ShieldCheck, Building } from "lucide-react"

export default function CenterLeadSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [nameLoading, setNameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [newName, setNewName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setNewName(parsedUser.name || "")
    }
  }, [])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    setNameMessage(null)

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })

      const data = await res.json()

      if (res.ok) {
        setNameMessage({ type: "success", text: data.message || "Profile updated successfully" })
        const updatedUser = { ...user, name: data.name }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setNameMessage({ type: "error", text: data.error || "Failed to update profile name" })
      }
    } catch (error) {
      setNameMessage({ type: "error", text: "Network error occurred" })
    } finally {
      setNameLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      setPasswordLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage({ type: "success", text: data.message || "Password changed successfully" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" })
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Network error occurred" })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Center Lead Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal information, center assignment, and credentials
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </div>
            <CardDescription>Update your display name and view Center Lead role details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border border-border/60">
              <div>
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <div className="font-semibold text-sm mt-0.5">{user?.email || "centerlead@lnmiit.ac.in"}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Assigned Center / Department</Label>
                <div className="font-semibold text-sm mt-0.5">{user?.department || "Center for Advanced Studies"}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">System Role</Label>
                <div className="font-semibold text-sm mt-0.5 text-indigo-600">Center Lead (center_lead)</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Inventory Scope</Label>
                <div className="font-semibold text-sm mt-0.5 text-emerald-600">Isolated Center Register</div>
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4 pt-2">
              {nameMessage && (
                <Alert
                  className={
                    nameMessage.type === "success"
                      ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500 text-rose-700 dark:text-rose-300"
                  }
                >
                  {nameMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className="text-xs">{nameMessage.text}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="name" className="text-xs">
                  Full Display Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="max-w-md h-9 text-xs mt-1"
                  required
                />
              </div>

              <Button type="submit" disabled={nameLoading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {nameLoading ? "Saving..." : "Save Name"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Change Password</CardTitle>
            </div>
            <CardDescription>Ensure your account is protected with a strong password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              {passwordMessage && (
                <Alert
                  className={
                    passwordMessage.type === "success"
                      ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500 text-rose-700 dark:text-rose-300"
                  }
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className="text-xs">{passwordMessage.text}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="currentPassword" className="text-xs">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-xs">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <Button type="submit" disabled={passwordLoading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
