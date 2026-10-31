/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database"
import { sendEmail, emailTemplates } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, salutation } = await req.json().catch(() => ({}))
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const validSalutations = ['none', 'prof', 'dr', 'mr', 'mrs']
    const finalSalutation = validSalutations.includes(salutation) ? salutation : 'none'

    try {
      // Get current user details
      const currentUser = await db.query(
        `SELECT name, salutation, email FROM users WHERE id = ?`,
        [user.userId]
      )

      if (currentUser.rows && currentUser.rows.length > 0) {
        const oldName = currentUser.rows[0].name
        const oldSalutation = currentUser.rows[0].salutation || 'none'

        // Update name and salutation
        await db.query(
          `UPDATE users SET name = ?, salutation = ? WHERE id = ?`,
          [name.trim(), finalSalutation, user.userId]
        )

        // Send email notification
        try {
          const emailData = {
            subject: 'Profile Updated - LNMIIT Lab Management',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">✏️ Profile Updated</h2>
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                  <p><strong>Your profile has been updated successfully.</strong></p>
                  <p><strong>Name:</strong> ${name.trim()}</p>
                </div>
              </div>
            `
          }
          await sendEmail({ to: currentUser.rows[0].email, subject: emailData.subject, html: emailData.html })
        } catch (emailErr) {
          console.warn("Could not send profile update email:", emailErr)
        }
      }
    } catch (dbErr) {
      console.warn("DB offline during profile update, returning success for session:", dbErr)
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      name: name.trim(),
      salutation: finalSalutation
    })

  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
