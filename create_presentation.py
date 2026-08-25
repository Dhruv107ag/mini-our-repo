import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette - Professional Tech Dark Theme
    COLOR_BG = RGBColor(15, 23, 42)          # #0F172A (Slate 900)
    COLOR_CARD = RGBColor(30, 41, 59)        # #1E293B (Slate 800)
    COLOR_CARD_BORDER = RGBColor(51, 65, 85) # #334155 (Slate 700)
    COLOR_PRIMARY = RGBColor(59, 130, 246)   # #3B82F6 (Blue 500)
    COLOR_SECONDARY = RGBColor(16, 185, 129) # #10B981 (Emerald 500)
    COLOR_ACCENT = RGBColor(139, 92, 246)    # #8B5CF6 (Purple 500)
    COLOR_TEXT = RGBColor(248, 250, 252)     # #F8FAFC (Slate 50)
    COLOR_MUTED = RGBColor(148, 163, 184)    # #94A3B8 (Slate 400)
    COLOR_GOLD = RGBColor(245, 158, 11)      # #F59E0B (Amber 500)

    blank_slide_layout = prs.slide_layouts[6]

    def set_slide_background(slide, color=COLOR_BG):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title_text, category_text="LNMIIT LAB MANAGEMENT SYSTEM"):
        # Top Accent line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.05))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_PRIMARY
        line.line.fill.background()

        # Category
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(11.733), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_PRIMARY
        p_cat.font.name = 'Calibri'

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.733), Inches(0.7))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = COLOR_TEXT
        p.font.name = 'Segoe UI'

    def add_footer(slide, current_slide, total_slides=12):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11.733), Inches(0.4))
        tf = footer_box.text_frame
        p = tf.paragraphs[0]
        p.text = f"LNMIIT Lab Management System  |  Slide {current_slide} of {total_slides}"
        p.font.size = Pt(10)
        p.font.color.rgb = COLOR_MUTED
        p.font.name = 'Calibri'

    def create_card(slide, left, top, width, height, title="", border_color=COLOR_CARD_BORDER, bg_color=COLOR_CARD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        if title:
            tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.15), Inches(width - 0.4), Inches(0.4))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = COLOR_SECONDARY
            p.font.name = 'Segoe UI'

        return card

    # ==================== SLIDE 1: TITLE ====================
    slide1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide1)

    # Decorative hero backdrop card
    hero_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.0), Inches(11.733), Inches(5.5))
    hero_card.fill.solid()
    hero_card.fill.fore_color.rgb = COLOR_CARD
    hero_card.line.color.rgb = COLOR_PRIMARY
    hero_card.line.width = Pt(2)

    # Title content
    tbox = slide1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.933), Inches(4.3))
    tf = tbox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "THE LNM INSTITUTE OF INFORMATION TECHNOLOGY"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_PRIMARY
    p0.font.name = 'Segoe UI'
    p0.space_after = Pt(14)

    p1 = tf.add_paragraph()
    p1.text = "LNMIIT Lab Management System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TEXT
    p1.font.name = 'Segoe UI'
    p1.space_after = Pt(10)

    p2 = tf.add_paragraph()
    p2.text = "A Next-Gen Full-Stack Platform for Laboratory Bookings, Equipment Tracking & Multi-Tier Workflow Automations"
    p2.font.size = Pt(16)
    p2.font.color.rgb = COLOR_MUTED
    p2.font.name = 'Calibri'
    p2.space_after = Pt(30)

    # Tech Badges Row
    p3 = tf.add_paragraph()
    p3.text = "⚡ Built with: Next.js 15 (App Router)  |  MySQL 8  |  TypeScript  |  Tailwind CSS  |  Nodemailer"
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = COLOR_SECONDARY
    p3.font.name = 'Segoe UI'

    # ==================== SLIDE 2: PROBLEM STATEMENT ====================
    slide2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide2)
    add_header(slide2, "1. Executive Summary & Problem Statement")
    add_footer(slide2, 2)

    # Left Card: Traditional Challenges
    create_card(slide2, 0.8, 1.7, 5.7, 4.9, "🔴 Traditional Manual System Challenges")
    tb_left = slide2.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_l = tb_left.text_frame
    tf_l.word_wrap = True

    items_l = [
        ("Paper-Based Approvals", "Slips getting lost, physical signature delays across departments."),
        ("Double Bookings & Conflicts", "Lack of real-time slot visibility causing lab schedule collisions."),
        ("Untracked Equipment Loans", "No automated tracking for components issued to students."),
        ("Communication Breakdown", "Manual emails/calls needed to notify students, faculty & staff."),
        ("Zero Audit Trail", "Inability to trace approval decisions or log historical usage data.")
    ]
    for idx, (heading, desc) in enumerate(items_l):
        p = tf_l.paragraphs[0] if idx == 0 else tf_l.add_paragraph()
        p.text = f"• {heading}: "
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_TEXT
        
        # append description
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    # Right Card: The LMS Solution
    create_card(slide2, 6.833, 1.7, 5.7, 4.9, "🟢 The LNMIIT LMS Solution")
    tb_right = slide2.shapes.add_textbox(Inches(7.033), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_r = tb_right.text_frame
    tf_r.word_wrap = True

    items_r = [
        ("Centralized Digital Portal", "Single web interface for all 7 stakeholder roles at LNMIIT."),
        ("Real-Time Slot Engine", "Prevents double-booking with dynamic capacity enforcement."),
        ("Multi-Tier Approval Engine", "Automated routing through Faculty -> Staff -> HOD / Coordinator."),
        ("Automated Reminders", "Cron-driven 2-hr pre-booking & daily loan due notifications."),
        ("Complete Transparency", "Full activity logging, downloadable PDF/Excel audit reports.")
    ]
    for idx, (heading, desc) in enumerate(items_r):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.text = f"✓ {heading}: "
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_SECONDARY
        
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    # ==================== SLIDE 3: KEY SYSTEM OBJECTIVES ====================
    slide3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide3)
    add_header(slide3, "2. Core System Objectives & Value Proposition")
    add_footer(slide3, 3)

    obj_cards = [
        ("🏛️ Role-Tailored Access", "7 distinct role views (Student, Faculty, Lab Staff, HOD, Lab Coordinator, Admin, T&P) with strict RBAC.", COLOR_PRIMARY),
        ("📅 Multi-Lab & Slot Booking", "Support single and multi-lab simultaneous bookings with conflict detection and head-staff approvals.", COLOR_SECONDARY),
        ("⚡ Component & Loan Management", "Track equipment inventory, component requests, issuing, return extensions, and overdue alerts.", COLOR_ACCENT),
        ("📧 17+ Email Templates", "Automated Nodemailer email triggers for every lifecycle state change, request, and approval.", COLOR_GOLD),
    ]

    coords = [(0.8, 1.7), (6.833, 1.7), (0.8, 4.3), (6.833, 4.3)]
    for idx, (title, desc, accent) in enumerate(obj_cards):
        left, top = coords[idx]
        create_card(slide3, left, top, 5.7, 2.3, title, border_color=accent)
        tb = slide3.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.65), Inches(5.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_MUTED
        p.font.name = 'Calibri'

    # ==================== SLIDE 4: SYSTEM ARCHITECTURE ====================
    slide4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide4)
    add_header(slide4, "3. Technical Architecture & Stack")
    add_footer(slide4, 4)

    # 3 Column Cards
    col_width = 3.644
    gap = 0.4
    left_margin = 0.8

    stacks = [
        ("🎨 Frontend Architecture", [
            ("Framework", "Next.js 15 (App Router)"),
            ("UI Components", "Shadcn UI + React 18"),
            ("Styling Engine", "Tailwind CSS + Dark/Light Theme"),
            ("Iconography", "Lucide React"),
            ("Client State", "React Hooks & Dynamic Modals")
        ], COLOR_PRIMARY),
        ("⚙️ Backend & API Layer", [
            ("API Routes", "Next.js Serverless Route Handlers"),
            ("Auth & Session", "SHA-256 Hashing + HTTP Cookies"),
            ("Middleware", "Role-Based Route Guards"),
            ("Report Engine", "jsPDF (PDF) & SheetJS xlsx"),
            ("Cron Jobs", "Automated Hourly & Daily Timers")
        ], COLOR_SECONDARY),
        ("🗄️ Database & Services", [
            ("Database", "MySQL 8.0+ Relational DB"),
            ("Connection", "MySQL Connection Pooling"),
            ("Email Delivery", "Nodemailer (SMTP / Testing Mode)"),
            ("Audit Engine", "Activity Logger (system_logs)"),
            ("Schema", "10 Normalized Relational Tables")
        ], COLOR_ACCENT)
    ]

    for idx, (title, items, accent) in enumerate(stacks):
        left = left_margin + idx * (col_width + gap)
        create_card(slide4, left, 1.7, col_width, 4.9, title, border_color=accent)
        tb = slide4.shapes.add_textbox(Inches(left + 0.15), Inches(2.3), Inches(col_width - 0.3), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True

        for i, (label, val) in enumerate(items):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.text = f"• {label}:\n"
            p.font.bold = True
            p.font.size = Pt(12)
            p.font.color.rgb = COLOR_TEXT

            run = p.add_run()
            run.text = f"   {val}"
            run.font.bold = False
            run.font.size = Pt(11)
            run.font.color.rgb = COLOR_MUTED
            p.space_after = Pt(8)

    # ==================== SLIDE 5: USER ROLES & HIERARCHY ====================
    slide5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide5)
    add_header(slide5, "4. Multi-Role Hierarchy & Permissions (7 User Roles)")
    add_footer(slide5, 5)

    roles_data = [
        ("🔑 Admin", "Full system control, manage users, labs, departments, view all logs & override approvals."),
        ("🎓 Student", "Book lab slots (requires supervisor), request components, track loan status & view personal logs."),
        ("👨‍🏫 Faculty", "Book labs, approve/reject student requests as supervisor, request research equipment."),
        ("🔬 Lab Staff", "Manage lab inventory, approve/reject booking requests (head staff), issue & return components."),
        ("🏛️ HOD", "Departmental oversight, final approval authority for lab bookings & component requests."),
        ("📋 Lab Coordinator", "Designated department approval authority alternative to HOD based on department policy."),
        ("🏢 Others (T&P)", "Direct booking for placement/institutional events with streamlined approval workflow.")
    ]

    # Grid layout 2x4
    for idx, (role, desc) in enumerate(roles_data):
        row = idx // 2
        col = idx % 2
        left = 0.8 + col * 5.966
        top = 1.7 + row * 1.25
        w = 5.766
        h = 1.15

        card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(w), Inches(h))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = COLOR_PRIMARY if "Admin" in role or "HOD" in role else COLOR_CARD_BORDER
        card.line.width = Pt(1.5)

        tb = slide5.shapes.add_textbox(Inches(left + 0.15), Inches(top + 0.1), Inches(w - 0.3), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p0 = tf.paragraphs[0]
        p0.text = role
        p0.font.bold = True
        p0.font.size = Pt(13)
        p0.font.color.rgb = COLOR_SECONDARY
        p0.space_after = Pt(2)

        p1 = tf.add_paragraph()
        p1.text = desc
        p1.font.size = Pt(11)
        p1.font.color.rgb = COLOR_MUTED

    # ==================== SLIDE 6: WORKFLOW 1 - LAB BOOKINGS ====================
    slide6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide6)
    add_header(slide6, "5. Detailed Workflow: Lab Slot Booking Engine")
    add_footer(slide6, 6)

    # 4 Steps Horizontal Flow Box
    step_width = 2.7
    step_gap = 0.31
    steps = [
        ("Step 1: Submission", "Student / Faculty / T&P submits slot request. Student selects Faculty Supervisor.", COLOR_PRIMARY),
        ("Step 2: Supervisor Review", "Faculty Supervisor receives email notification & approves/rejects request.", COLOR_SECONDARY),
        ("Step 3: Lab Staff Approval", "Head Lab Staff (labs.staff_id) checks equipment availability & approves.", COLOR_ACCENT),
        ("Step 4: HOD / Final Approval", "HOD or Lab Coordinator gives final sign-off. Slot locked & confirmation mailed.", COLOR_GOLD),
    ]

    for idx, (title, desc, accent) in enumerate(steps):
        left = 0.8 + idx * (step_width + step_gap)
        create_card(slide6, left, 1.7, step_width, 2.5, title, border_color=accent)
        tb = slide6.shapes.add_textbox(Inches(left + 0.15), Inches(2.3), Inches(step_width - 0.3), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_MUTED

    # Special Feature Highlight Box below
    create_card(slide6, 0.8, 4.4, 11.733, 2.2, "🌟 Advanced Booking Features Highlighted in LMS", border_color=COLOR_PRIMARY)
    tb_feat = slide6.shapes.add_textbox(Inches(1.0), Inches(4.95), Inches(11.333), Inches(1.5))
    tf_f = tb_feat.text_frame
    tf_f.word_wrap = True

    features = [
        "• Multi-Lab Simultaneous Bookings: Request multiple labs in one transaction with independent per-lab approvals.",
        "• Responsible Person Assignment: Designate specific accountable team members per lab in multi-lab bookings.",
        "• Conflict & Capacity Guard: Automatic validation against existing booked slots to prevent overbooking."
    ]
    for i, feat in enumerate(features):
        p = tf_f.paragraphs[0] if i == 0 else tf_f.add_paragraph()
        p.text = feat
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT
        p.space_after = Pt(6)

    # ==================== SLIDE 7: WORKFLOW 2 - EQUIPMENT LOANS ====================
    slide7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide7)
    add_header(slide7, "6. Detailed Workflow: Component & Equipment Inventory")
    add_footer(slide7, 7)

    # 2 Big Cards: Request -> Issue Lifecycle & Extensions
    create_card(slide7, 0.8, 1.7, 5.7, 4.9, "📦 Component Lifecycle (Request to Return)", border_color=COLOR_SECONDARY)
    tb_c1 = slide7.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True

    c1_steps = [
        ("1. Component Request", "Student requests components specifying quantity, purpose & return date."),
        ("2. Approval Chain", "Routed to Faculty Supervisor -> Lab Staff -> HOD for approval."),
        ("3. Equipment Issuance", "Lab Staff verifies physical items & issues components via dashboard."),
        ("4. Loan Tracking", "Record created in `component_loans` with active due-date countdown."),
        ("5. Inspection & Return", "Lab Staff verifies hardware condition and marks loan as returned.")
    ]
    for i, (st, desc) in enumerate(c1_steps):
        p = tf_c1.paragraphs[0] if i == 0 else tf_c1.add_paragraph()
        p.text = f"• {st}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(8)

    create_card(slide7, 6.833, 1.7, 5.7, 4.9, "⏳ Loan Extensions & Overdue Management", border_color=COLOR_GOLD)
    tb_c2 = slide7.shapes.add_textbox(Inches(7.033), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True

    c2_steps = [
        ("Extension Request", "Students can request due-date extensions before expiry with valid reasons."),
        ("Staff Approval for Extension", "Lab Staff reviews extension reasons and approves new return date."),
        ("Daily Automated Reminders", "Cron job sends daily email alerts at 9 AM for items due/overdue."),
        ("Inventory Real-Time Sync", "Available component quantities automatically update on return."),
        ("Audit Logs", "Every loan extension, delay, and return is permanently recorded in `system_logs`.")
    ]
    for i, (st, desc) in enumerate(c2_steps):
        p = tf_c2.paragraphs[0] if i == 0 else tf_c2.add_paragraph()
        p.text = f"✓ {st}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_GOLD

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(8)

    # ==================== SLIDE 8: DATABASE SCHEMA ====================
    slide8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide8)
    add_header(slide8, "7. Relational Database Schema (10 Tables)")
    add_footer(slide8, 8)

    # 2 Column layout of table summary
    create_card(slide8, 0.8, 1.7, 5.7, 4.9, "🗄️ Core Tables", border_color=COLOR_PRIMARY)
    tb_db1 = slide8.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_db1 = tb_db1.text_frame
    tf_db1.word_wrap = True

    db1_items = [
        ("users", "User accounts, role, department, hashed passwords (SHA-256)."),
        ("departments", "Dept hierarchy, HOD/Coordinator IDs, highest_approval_authority."),
        ("labs", "Lab metadata, department mapping, capacity, head staff_id."),
        ("lab_slots", "Operating time slots per lab (start_time, end_time, capacity)."),
        ("booking_requests", "Central booking records, multi-lab flag, status, timestamps.")
    ]
    for i, (tbl, desc) in enumerate(db1_items):
        p = tf_db1.paragraphs[0] if i == 0 else tf_db1.add_paragraph()
        p.text = f"📌 {tbl}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(8)

    create_card(slide8, 6.833, 1.7, 5.7, 4.9, "⚡ Workflows & Audit Tables", border_color=COLOR_ACCENT)
    tb_db2 = slide8.shapes.add_textbox(Inches(7.033), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_db2 = tb_db2.text_frame
    tf_db2.word_wrap = True

    db2_items = [
        ("multi_lab_approvals", "Per-lab staff and HOD approvals for multi-lab bookings."),
        ("multi_lab_responsible_persons", "Accountable user mapping per booked lab."),
        ("component_requests", "Equipment booking requests with faculty/staff approvals."),
        ("component_loans", "Active component loans, due dates, extension history."),
        ("system_logs & reminder_logs", "Full audit logging (IP, action, timestamp) & cron logs.")
    ]
    for i, (tbl, desc) in enumerate(db2_items):
        p = tf_db2.paragraphs[0] if i == 0 else tf_db2.add_paragraph()
        p.text = p.text = f"📌 {tbl}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_ACCENT

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(8)

    # ==================== SLIDE 9: NOTIFICATIONS & CRON ====================
    slide9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide9)
    add_header(slide9, "8. Automated Notifications & Background Cron Services")
    add_footer(slide9, 9)

    create_card(slide9, 0.8, 1.7, 5.7, 4.9, "📧 Nodemailer Notification Engine", border_color=COLOR_PRIMARY)
    tb_n1 = slide9.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_n1 = tb_n1.text_frame
    tf_n1.word_wrap = True

    n1_items = [
        ("17+ Email Templates", "Custom HTML email templates for every action (submission, approvals, rejections)."),
        ("SMTP Integration", "Powered by Nodemailer with Gmail/Custom SMTP server configuration."),
        ("TESTING_MODE Support", "Environment flag to redirect all test emails safely to admin inbox during development."),
        ("Instant Delivery", "Asynchronous mail dispatch on every status transition in API routes.")
    ]
    for i, (title, desc) in enumerate(n1_items):
        p = tf_n1.paragraphs[0] if i == 0 else tf_n1.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    create_card(slide9, 6.833, 1.7, 5.7, 4.9, "⏰ Automated Cron Job Endpoints", border_color=COLOR_GOLD)
    tb_n2 = slide9.shapes.add_textbox(Inches(7.033), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_n2 = tb_n2.text_frame
    tf_n2.word_wrap = True

    n2_items = [
        ("Hourly 2-Hour Booking Reminders", "`/api/cron/booking-reminders` scans upcoming bookings & sends reminder emails 2 hrs prior."),
        ("Daily 9 AM Loan Reminders", "`/api/cron/loan-reminders` identifies due/overdue component loans & alerts borrowers."),
        ("Daily Admin Digest", "`/api/admin/send-digest` sends daily summary report of pending requests to administrators."),
        ("Idempotent Execution", "Recorded in `reminder_logs` to prevent duplicate email dispatches.")
    ]
    for i, (title, desc) in enumerate(n2_items):
        p = tf_n2.paragraphs[0] if i == 0 else tf_n2.add_paragraph()
        p.text = f"⏰ {title}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_GOLD

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    # ==================== SLIDE 10: REPORTING & SECURITY ====================
    slide10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide10)
    add_header(slide10, "9. Analytics, Export Reports & Security Model")
    add_footer(slide10, 10)

    create_card(slide10, 0.8, 1.7, 5.7, 4.9, "📊 Analytics & Report Generator", border_color=COLOR_SECONDARY)
    tb_r1 = slide10.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_r1 = tb_r1.text_frame
    tf_r1.word_wrap = True

    r1_items = [
        ("PDF Report Export", "Generate official PDF summary reports for lab bookings using `jsPDF`."),
        ("Excel Data Export", "Export lab utilization & component loan data to spreadsheet formats via `SheetJS (xlsx)`."),
        ("Role-Based Statistics", "HOD & Coordinator dashboards display department-wide real-time booking charts & metrics."),
        ("Custom Date Filters", "Filter reports by date ranges, departments, lab codes, and booking statuses.")
    ]
    for i, (title, desc) in enumerate(r1_items):
        p = tf_r1.paragraphs[0] if i == 0 else tf_r1.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    create_card(slide10, 6.833, 1.7, 5.7, 4.9, "🔒 Security & Audit Architecture", border_color=COLOR_PRIMARY)
    tb_r2 = slide10.shapes.add_textbox(Inches(7.033), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_r2 = tb_r2.text_frame
    tf_r2.word_wrap = True

    r2_items = [
        ("SHA-256 Password Hashing", "Secure salted password hashing mechanism for user credential protection."),
        ("Next.js Middleware Guards", "Route protection enforcing role permission checks before rendering pages."),
        ("SQL Injection Prevention", "Parameterized MySQL queries across all database helpers (`lib/database.ts`)."),
        ("System Activity Logs", "All logins, request submissions, approvals & rejections saved in `system_logs` with IP addresses.")
    ]
    for i, (title, desc) in enumerate(r2_items):
        p = tf_r2.paragraphs[0] if i == 0 else tf_r2.add_paragraph()
        p.text = f"🔒 {title}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_PRIMARY

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    # ==================== SLIDE 11: USER INTERFACE & DEMO ====================
    slide11 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide11)
    add_header(slide11, "10. User Interface Design & Key Screenshots")
    add_footer(slide11, 11)

    ui_cards = [
        ("🖥️ Admin Control Panel", "User CRUD management, Lab configuration, Department highest-authority settings, system log view.", COLOR_PRIMARY),
        ("🎓 Student Dashboard", "Interactive lab booking forms, supervisor picker, component request modal, active loans status cards.", COLOR_SECONDARY),
        ("👨‍🏫 Faculty & HOD Portal", "Pending requests list, one-click approve/reject modal with comments, department utilization statistics.", COLOR_ACCENT),
        ("🔬 Lab Staff Workstation", "Lab inventory management, equipment issue UI, loan return modal, head staff approval controls.", COLOR_GOLD)
    ]

    coords_ui = [(0.8, 1.7), (6.833, 1.7), (0.8, 4.3), (6.833, 4.3)]
    for idx, (title, desc, accent) in enumerate(ui_cards):
        left, top = coords_ui[idx]
        create_card(slide11, left, top, 5.7, 2.3, title, border_color=accent)
        tb = slide11.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.65), Inches(5.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_MUTED
        p.font.name = 'Calibri'

    # ==================== SLIDE 12: CONCLUSION & FUTURE SCOPE ====================
    slide12 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide12)
    add_header(slide12, "11. Future Scope & Conclusion")
    add_footer(slide12, 12)

    create_card(slide12, 0.8, 1.7, 5.7, 4.9, "🚀 Roadmap & Future Enhancements", border_color=COLOR_SECONDARY)
    tb_f1 = slide12.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_f1 = tb_f1.text_frame
    tf_f1.word_wrap = True

    f1_items = [
        ("RFID & QR Code Integration", "Scan QR codes on student IDs or lab doors for instant check-in / check-out."),
        ("IoT Equipment Sensors", "Real-time monitoring of equipment usage and power consumption."),
        ("Native Mobile App", "Push notifications for instant approval requests on iOS & Android."),
        ("AI Analytics & Optimization", "Predictive slot allocation and automated equipment maintenance scheduling.")
    ]
    for i, (title, desc) in enumerate(f1_items):
        p = tf_f1.paragraphs[0] if i == 0 else tf_f1.add_paragraph()
        p.text = f"🌟 {title}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_SECONDARY

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    create_card(slide12, 6.833, 1.7, 5.7, 4.9, "💡 Key Impact & Summary", border_color=COLOR_PRIMARY)
    tb_f2 = slide12.shapes.add_textbox(Inches(7.033), Inches(2.3), Inches(5.3), Inches(4.1))
    tf_f2 = tb_f2.text_frame
    tf_f2.word_wrap = True

    f2_items = [
        ("100% Digital Transformation", "Replaces physical paper slips with automated multi-tier digital workflows."),
        ("Eliminates Booking Conflicts", "Enforces slot limits, capacity checks, and head-staff validations in real time."),
        ("Complete Accountability", "Full audit logging with IP tracking and automated email reminder systems."),
        ("Scalable Architecture", "Modular Next.js + MySQL stack ready for campus-wide deployment across all LNMIIT departments.")
    ]
    for i, (title, desc) in enumerate(f2_items):
        p = tf_f2.paragraphs[0] if i == 0 else tf_f2.add_paragraph()
        p.text = f"✅ {title}: "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT

        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(10)

    # Save presentation
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'LNMIIT_Lab_Management_System.pptx'
    build_presentation(out)
