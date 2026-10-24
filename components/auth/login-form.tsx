/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

/**
 * LoginForm Component
 *
 * Provides authentication interface for LNMIIT Lab Management System
 * Supports multiple user roles: Student, Faculty, Lab Staff, HoD, Admin, Others
 *
 * Features:
 * - Role-based login selection
 * - Email validation for @lnmiit.ac.in domain
 * - Password visibility toggle
 * - Clean, professional UI matching LNMIIT branding
 */
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const u = new URL(window.location.href)
    if (u.searchParams.get("reset") === "1") {
      setResetSuccess(true)
      // clear flag from URL without a navigation
      u.searchParams.delete("reset")
      window.history.replaceState({}, "", u.toString())
    }
  }, [])

  // User roles available in the system
  const userRoles = [
    { value: "admin", label: "Administrator" },
    { value: "lab-staff", label: "Lab Staff" },
    { value: "faculty", label: "Faculty" },
    { value: "hod", label: "Head of Department (HoD)" },
    { value: "lab-coordinator", label: "Lab Coordinator" },
    { value: "student", label: "Student" },
    { value: "others", label: "Others" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate email domain for LNMIIT
    if (!email.endsWith("@lnmiit.ac.in")) {
      alert("Please use your LNMIIT email address (@lnmiit.ac.in)")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          userRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage for client-side access
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to role-scoped dashboard
        const role = data?.user?.role || ""
        const target = role ? `/${role}/dashboard` : "/"
        window.location.href = target
      } else {
        alert(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!email) {
      alert("Enter your LNMIIT email first")
      return
    }
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        alert("Reset link sent.")
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "Failed to send reset link")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to send reset link")
    }
  }

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden no-scrollbar">
      {/* Executive University Top Navigation Bar */}
      <header className="animate-login-header shrink-0 z-20 flex w-full items-center justify-between border-b border-[#3d2719]/50 bg-[#160f0a]/75 px-6 py-3 backdrop-blur-md sm:px-10 sm:py-3.5">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="rounded-lg bg-[#fcf9f4] px-2 py-1 sm:px-3 sm:py-1.5 shadow-md border border-[#e8ded2] transition-transform duration-300 hover:scale-105">
            <Image
              src="/lnmiit-logo.png"
              alt="LNMIIT Logo"
              width={140}
              height={45}
              className="h-7 sm:h-8.5 w-auto object-contain"
              priority
            />
          </div>
          <div className="hidden border-l-2 border-[#4a3020]/70 pl-3.5 py-0.5 leading-snug sm:block">
            <p className="text-xs sm:text-sm font-bold tracking-wider text-[#fcf9f4] uppercase">
              The LNM Institute of Information Technology
            </p>
            <p className="text-[11px] font-medium text-[#d4beaa]">
              Central Laboratory Infrastructure Portal
            </p>
          </div>
        </div>
      </header>

      {/* Main Center Portal Area */}
      <main className="flex flex-1 flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
        <div className="flex w-full max-w-[420px] flex-col items-center space-y-3.5 sm:space-y-4">
          {/* Professional Institutional Heading */}
          <div className="animate-login-header text-center space-y-0.5">
            <h1 className="font-montserrat whitespace-nowrap text-2xl sm:text-3xl font-bold tracking-tight text-[#fcf9f4] drop-shadow-md">
              Lab Management System
            </h1>
            <p className="text-xs sm:text-sm font-normal text-[#d4beaa] drop-shadow-sm">
              Sign in with your LNMIIT credentials
            </p>
          </div>

          {/* Reset success banner */}
          {resetSuccess && (
            <div className="animate-login-card mx-auto w-full">
              <div className="rounded-xl border border-amber-300/60 bg-[#fdfaf5] backdrop-blur-md px-3.5 py-2 text-xs sm:text-sm text-[#5c3116] shadow-sm">
                Password updated. You can now sign in with your new password.
              </div>
            </div>
          )}

          {/* Warm Coffee & Cream Elevated Card */}
          <Card className="animate-login-card w-full overflow-hidden rounded-2xl border-t-4 border-t-[#964724] border-x border-b border-[#e2d5c5]/80 bg-[#faf6f0]/98 dark:bg-[#1c140e]/98 shadow-[0_16px_40px_rgba(20,13,8,0.4)] backdrop-blur-md transition-all duration-300">
            <CardContent className="p-5 sm:p-6 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* User Role Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-[#4d3627] dark:text-[#d4beaa]">
                    <User className="mr-1.5 inline h-3.5 w-3.5 text-[#964724]" />
                    Select Your Role
                  </Label>
                  <Select value={userRole} onValueChange={setUserRole} required>
                    <SelectTrigger id="role" className="h-10 rounded-lg border-[#dfd2c2] bg-white/95 text-sm text-[#2c1d14] transition-colors hover:border-[#964724]/60 focus:border-[#964724] focus:ring-2 focus:ring-[#964724]/20">
                      <SelectValue placeholder="Choose your role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#4d3627] dark:text-[#d4beaa]">
                    <Mail className="mr-1.5 inline h-3.5 w-3.5 text-[#964724]" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@lnmiit.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-lg border-[#dfd2c2] bg-white/95 text-sm text-[#2c1d14] placeholder:text-[#9e8b7c] transition-colors hover:border-[#964724]/60 focus:border-[#964724] focus:ring-2 focus:ring-[#964724]/20"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#4d3627] dark:text-[#d4beaa]">
                    <Lock className="mr-1.5 inline h-3.5 w-3.5 text-[#964724]" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 rounded-lg pr-10 border-[#dfd2c2] bg-white/95 text-sm text-[#2c1d14] placeholder:text-[#9e8b7c] transition-colors hover:border-[#964724]/60 focus:border-[#964724] focus:ring-2 focus:ring-[#964724]/20"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-[#7d6756] hover:bg-transparent hover:text-[#2c1d14]"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  id="sign-in-btn"
                  type="submit"
                  className="h-10 w-full rounded-lg bg-[#8c3f1d] hover:bg-[#733214] font-semibold text-[#fcf9f4] tracking-wide shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.99] text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center pt-0.5">
                  <Button
                    id="forgot-password-btn"
                    type="button"
                    variant="link"
                    className="text-xs font-medium text-[#8c3f1d] hover:text-[#5e260e] dark:text-[#d97c45] dark:hover:text-[#f09a65] transition-colors h-auto py-0.5"
                    onClick={() => (window.location.href = "/forgot-password")}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Institutional Dignified Footer */}
      <footer className="animate-login-footer shrink-0 text-center text-[11px] sm:text-xs text-[#d4beaa] drop-shadow pb-2.5 sm:pb-3">
        <p className="font-medium">© 2025 The LNM Institute of Information Technology. All rights reserved.</p>
        <p className="text-[#b59e89]">Jaipur, Rajasthan • Laboratory Portal v1.0</p>
      </footer>
    </div>
  )
}
