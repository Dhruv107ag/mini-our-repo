/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { type NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { dbOperations, Database } from "@/lib/database"

const mockUsers: any[] = [
  { id: "1", email: "admin@lnmiit.ac.in", password: "123", role: "admin", name: "System Admin", department: "IT" },
  { id: "2", email: "faculty@lnmiit.ac.in", password: "123", role: "faculty", name: "Dr. Faculty User", department: "CSE" },
  { id: "3", email: "john.doe@lnmiit.ac.in", password: "123", role: "faculty", name: "John Doe", department: "CSE" },
  { id: "4", email: "staff@lnmiit.ac.in", password: "123", role: "lab_staff", name: "Lab Staff User", department: "ECE" },
  { id: "5", email: "jane.smith@lnmiit.ac.in", password: "123", role: "lab_staff", name: "Jane Smith", department: "ECE" },
  { id: "6", email: "student@lnmiit.ac.in", password: "123", role: "student", name: "Student User", department: "CSE", studentId: "23UCS001" },
  { id: "7", email: "23ucs123@lnmiit.ac.in", password: "123", role: "student", name: "Ram Sharma", department: "CSE", studentId: "23UCS123" },
  { id: "8", email: "hod@lnmiit.ac.in", password: "123", role: "hod", name: "Dr. HOD User", department: "CSE" },
  { id: "9", email: "coordinator@lnmiit.ac.in", password: "123", role: "lab_coordinator", name: "Lab Coordinator", department: "CSE" },
  { id: "10", email: "other@lnmiit.ac.in", password: "123", role: "others", name: "Other User", department: "CCE" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, userRole } = await request.json()

    // Validate input
    if (!email || !password || !userRole) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 })
    }

    // Validate LNMIIT email domain
    if (!email.endsWith("@lnmiit.ac.in")) {
      return NextResponse.json({ error: "Please use your LNMIIT email address" }, { status: 400 })
    }

  // normalize role: convert hyphens to underscores and compare case-insensitively
  const normalizedRole = String(userRole).replace(/-/g, "_").toLowerCase()

    // DB-backed auth when enabled
    let dbUser: any = null
    if (process.env.USE_DB_AUTH === "true") {
      try {
        dbUser = await dbOperations.getUserByEmail(email)
      } catch (dbErr) {
        console.warn("DB auth check failed (offline), falling back to mock user:", dbErr)
      }
      if (dbUser) {
        // Special handling for lab_coordinator role
        // Faculty members can login as lab_coordinator if they are assigned as one
        if (normalizedRole === 'lab_coordinator') {
          // Check if user is faculty
          if (String(dbUser.role).toLowerCase() !== 'faculty') {
            return NextResponse.json({ error: "Only faculty members can be lab coordinators" }, { status: 401 })
          }
          
          // Check if this faculty is assigned as lab coordinator for any department
          const db = Database.getInstance()
          const coordCheck = await db.query(
            "SELECT id, code, name FROM departments WHERE lab_coordinator_id = ?",
            [dbUser.id]
          )
          
          if (coordCheck.rows.length === 0) {
            return NextResponse.json({ error: "You are not assigned as a lab coordinator" }, { status: 401 })
          }
        } else {
          // Compare role (normalize hyphen/underscore differences)
          if (String(dbUser.role).toLowerCase() !== normalizedRole) {
            return NextResponse.json({ error: "Invalid credentials or role" }, { status: 401 })
          }
        }
        
        // Verify password (scrypt format: salt:hash) or legacy sha256
        const stored: string | null = dbUser.password_hash || null
        if (stored) {
          let ok = false
          if (stored.includes(":")) {
            const [saltHex, hashHex] = stored.split(":")
            try {
              const salt = Buffer.from(saltHex, "hex")
              const calc = crypto.scryptSync(password, salt, 64)
              ok = crypto.timingSafeEqual(Buffer.from(hashHex, "hex"), calc)
            } catch {
              ok = false
            }
          } else {
            const legacy = crypto.createHash("sha256").update(password).digest("hex")
            ok = legacy === stored
          }
          if (ok) {
            // Format display name with salutation for all users
            let displayName = dbUser.name
            let userSalutation = dbUser.salutation || 'none'
            
            if (dbUser.role === 'hod') {
              try {
                const db = Database.getInstance()
                const result = await db.query(
                  "SELECT u.name, u.salutation FROM departments d JOIN users u ON d.hod_id = u.id WHERE d.code = ?",
                  [dbUser.department]
                )
                if (result.rows.length > 0 && result.rows[0].name) {
                  displayName = result.rows[0].name
                  userSalutation = result.rows[0].salutation || 'none'
                }
              } catch (error) {
                // Fall back to default name if query fails
              }
            }

            const tokenPayload = {
              userId: Number.parseInt(String(dbUser.id), 10),
              email: dbUser.email,
              role: normalizedRole === 'lab_coordinator' ? 'lab_coordinator' : String(dbUser.role),
              name: displayName,
              salutation: userSalutation,
              department: dbUser.department,
            }
            const token = encodeURIComponent(JSON.stringify(tokenPayload))
            const response = NextResponse.json({
              success: true,
              user: {
                id: String(dbUser.id),
                email: dbUser.email,
                name: displayName,
                salutation: userSalutation,
                role: normalizedRole === 'lab_coordinator' ? 'lab-coordinator' : String(dbUser.role).replace(/_/g, "-"),
                department: dbUser.department,
                studentId: dbUser.student_id || null,
              },
            })
            response.cookies.set("auth-token", token, {
              httpOnly: true,
              sameSite: "lax",
              secure: false,
              maxAge: 60 * 60 * 24 * 7,
              path: "/",
            })
            return response
          }
        }
      }
    }

    // Fallback: Find user in mock database or auto-generate session for valid @lnmiit.ac.in emails
    let user = mockUsers.find((u) => {
      const mockRoleNorm = String(u.role).replace(/-/g, "_").toLowerCase()
      return u.email === email && mockRoleNorm === normalizedRole
    })

    // If no exact mock user match, fallback to dynamic mock user for demo convenience
    if (!user) {
      const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      user = {
        id: String(Math.floor(Math.random() * 9000) + 1000),
        email,
        password,
        role: normalizedRole,
        name: nameFromEmail || "Demo User",
        department: "CSE",
      }
    }

  // Create encoded session payload and set as httpOnly cookie for API auth (demo only)
  const tokenPayload = {
      userId: Number.parseInt(user.id, 10),
      email: user.email,
      role: normalizedRole,  // Use normalized role (lab_staff) for middleware compatibility
      name: user.name,
      department: user.department,
    }

  const token = encodeURIComponent(JSON.stringify(tokenPayload))

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: String(user.role).replace(/_/g, "-"),
        department: user.department,
        studentId: user.studentId || null,
      },
    })

    // Secure cookie flags vary by env; keeping lax for local dev
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
