/**
 * Centralized Realistic Test & Mock Data for Admin Portal
 * Specifically tailored for The LNM Institute of Information Technology (LNMIIT)
 */

export interface MockAdminStat {
  totalUsers: number
  activeLabs: number
  dbUptimeSeconds: number
  dbSizeMB: number
  pendingApprovals: number
  recentActivities: {
    id: string
    title: string
    detail: string
    timestamp: string
    category: 'approval' | 'inventory' | 'schedule' | 'security' | 'system'
    badge: string
  }[]
  labUtilization: {
    labName: string
    labCode: string
    utilizationRate: number
    activeBookingsToday: number
    department: string
  }[]
}

export const MOCK_ADMIN_STATS: MockAdminStat = {
  totalUsers: 1428,
  activeLabs: 8,
  dbUptimeSeconds: 1245600, // ~14d 10h
  dbSizeMB: 184.6,
  pendingApprovals: 12,
  recentActivities: [
    {
      id: 'act-1',
      title: 'Lab Booking Request Approved',
      detail: 'Dr. Preety Singh approved Booking #BK-2041 for CP1 (Machine Learning Workshop)',
      timestamp: '15 mins ago',
      category: 'approval',
      badge: 'Approved',
    },
    {
      id: 'act-2',
      title: 'Component Bulk Issuance',
      detail: 'Ramesh Sharma issued 15x Arduino Uno R3 to Team Autonomous Rover (Lead: Dhruv Agrawal - 23ucs107)',
      timestamp: '42 mins ago',
      category: 'inventory',
      badge: 'Inventory',
    },
    {
      id: 'act-3',
      title: 'New Equipment Registered',
      detail: '5x Keysight 70MHz Digital Oscilloscopes added to Hardware Lab inventory',
      timestamp: '2 hours ago',
      category: 'inventory',
      badge: 'New Asset',
    },
    {
      id: 'act-4',
      title: 'Timetable Schedule Updated',
      detail: 'Added CS304 (Computer Networks Lab) slots for Batch A2 in CP2 for Spring 2026',
      timestamp: '4 hours ago',
      category: 'schedule',
      badge: 'Timetable',
    },
    {
      id: 'act-5',
      title: 'Automated Snapshot & Backup',
      detail: 'System snapshot completed successfully. 184.6 MB data integrity verified',
      timestamp: '6 hours ago',
      category: 'system',
      badge: 'Database',
    },
    {
      id: 'act-6',
      title: 'Under-Repair Ticket Logged',
      detail: '2x Hakko FX-888D Soldering Stations routed to vendor repair by Narendra Singh',
      timestamp: '1 day ago',
      category: 'inventory',
      badge: 'Maintenance',
    },
  ],
  labUtilization: [
    { labName: 'Computer Programming Lab 1', labCode: 'CP1', utilizationRate: 88, activeBookingsToday: 6, department: 'CSE' },
    { labName: 'Computer Programming Lab 2', labCode: 'CP2', utilizationRate: 82, activeBookingsToday: 5, department: 'CSE' },
    { labName: 'Hardware & Microprocessor Lab', labCode: 'HARDWARE', utilizationRate: 74, activeBookingsToday: 4, department: 'ECE' },
    { labName: 'IoT & Embedded Systems Lab', labCode: 'EMBEDDED', utilizationRate: 91, activeBookingsToday: 7, department: 'ECE/CCE' },
    { labName: 'Advanced Computing & AI Lab', labCode: 'CP3', utilizationRate: 68, activeBookingsToday: 3, department: 'CSE' },
    { labName: 'Cisco Networking Lab', labCode: 'NETWORKING', utilizationRate: 64, activeBookingsToday: 3, department: 'CCE' },
    { labName: 'Robotics & Mechatronics Lab', labCode: 'ROBOTICS', utilizationRate: 79, activeBookingsToday: 5, department: 'MME' },
    { labName: 'Physics & Optics Lab', labCode: 'PHYSICS_LAB', utilizationRate: 58, activeBookingsToday: 2, department: 'PHY' },
  ],
}

export interface MockDepartment {
  id: number
  name: string
  code: string
  hod_id?: number | null
  hod_name?: string | null
  hod_email?: string | null
  highest_approval_authority?: 'hod' | 'lab_coordinator' | null
  component_highest_approval_authority?: 'faculty' | 'lab_staff' | 'lab_coordinator' | 'hod' | null
  lab_coordinator_id?: number | null
  lab_coordinator_name?: string | null
}

export const MOCK_DEPARTMENTS: MockDepartment[] = [
  {
    id: 1,
    name: 'Computer Science and Engineering',
    code: 'CSE',
    hod_id: 101,
    hod_name: 'Prof. Poonam Gera',
    hod_email: 'poonam.gera@lnmiit.ac.in',
    highest_approval_authority: 'hod',
    component_highest_approval_authority: 'lab_coordinator',
    lab_coordinator_id: 102,
    lab_coordinator_name: 'Dr. Preety Singh',
  },
  {
    id: 2,
    name: 'Electronics and Communication Engineering',
    code: 'ECE',
    hod_id: 104,
    hod_name: 'Prof. Soumitra Debnath',
    hod_email: 'sdebnath@lnmiit.ac.in',
    highest_approval_authority: 'hod',
    component_highest_approval_authority: 'lab_coordinator',
    lab_coordinator_id: 105,
    lab_coordinator_name: 'Dr. Abhishek Sharma',
  },
  {
    id: 3,
    name: 'Communication and Computer Engineering',
    code: 'CCE',
    hod_id: 106,
    hod_name: 'Dr. Rajbir Kaur',
    hod_email: 'rajbirkaur@lnmiit.ac.in',
    highest_approval_authority: 'hod',
    component_highest_approval_authority: 'hod',
    lab_coordinator_id: 107,
    lab_coordinator_name: 'Dr. Sunil Kumar',
  },
  {
    id: 4,
    name: 'Mechanical-Mechatronics Engineering',
    code: 'MME',
    hod_id: 108,
    hod_name: 'Dr. Manoj Kumar',
    hod_email: 'manojkumar@lnmiit.ac.in',
    highest_approval_authority: 'hod',
    component_highest_approval_authority: 'lab_coordinator',
    lab_coordinator_id: 109,
    lab_coordinator_name: 'Dr. Vikram Sharma',
  },
  {
    id: 5,
    name: 'Physics',
    code: 'PHY',
    hod_id: 110,
    hod_name: 'Prof. Anupam Singh',
    hod_email: 'anupam@lnmiit.ac.in',
    highest_approval_authority: 'hod',
    component_highest_approval_authority: 'hod',
    lab_coordinator_id: 111,
    lab_coordinator_name: 'Dr. Manish Garg',
  },
  {
    id: 6,
    name: 'Mathematics',
    code: 'MTH',
    hod_id: 112,
    hod_name: 'Dr. Pratibha Garg',
    hod_email: 'pratibha@lnmiit.ac.in',
    highest_approval_authority: 'hod',
    component_highest_approval_authority: 'hod',
    lab_coordinator_id: null,
    lab_coordinator_name: null,
  },
]

export interface MockLab {
  id: number
  name: string
  code: string
  department_id: number
  department_name?: string
  staff_id?: number | null
  staff_name?: string | null
  staff_ids_csv?: string | null
  staff_names_csv?: string | null
  capacity?: number
  location?: string
}

export const MOCK_LABS: MockLab[] = [
  {
    id: 1,
    name: 'Computer Programming Lab 1',
    code: 'CP1',
    department_id: 1,
    department_name: 'Computer Science and Engineering',
    staff_id: 201,
    staff_name: 'Ramesh Sharma',
    staff_ids_csv: '201,202',
    staff_names_csv: 'Ramesh Sharma, Suresh Kumar',
    capacity: 75,
    location: 'LT-1 Basement, Academic Block',
  },
  {
    id: 2,
    name: 'Computer Programming Lab 2',
    code: 'CP2',
    department_id: 1,
    department_name: 'Computer Science and Engineering',
    staff_id: 202,
    staff_name: 'Suresh Kumar',
    staff_ids_csv: '202',
    staff_names_csv: 'Suresh Kumar',
    capacity: 75,
    location: 'LT-2 Basement, Academic Block',
  },
  {
    id: 3,
    name: 'Advanced Computing & AI Lab',
    code: 'CP3',
    department_id: 1,
    department_name: 'Computer Science and Engineering',
    staff_id: 203,
    staff_name: 'Vikas Verma',
    staff_ids_csv: '203',
    staff_names_csv: 'Vikas Verma',
    capacity: 60,
    location: 'AB1 Room 104, 1st Floor',
  },
  {
    id: 4,
    name: 'Hardware & Microprocessor Lab',
    code: 'HARDWARE',
    department_id: 2,
    department_name: 'Electronics and Communication Engineering',
    staff_id: 204,
    staff_name: 'Narendra Singh',
    staff_ids_csv: '204',
    staff_names_csv: 'Narendra Singh',
    capacity: 50,
    location: 'AB2 Room 201, ECE Wing',
  },
  {
    id: 5,
    name: 'IoT & Embedded Systems Lab',
    code: 'EMBEDDED',
    department_id: 2,
    department_name: 'Electronics and Communication Engineering',
    staff_id: 205,
    staff_name: 'Jitendra Yadav',
    staff_ids_csv: '205',
    staff_names_csv: 'Jitendra Yadav',
    capacity: 45,
    location: 'AB2 Room 208, ECE Wing',
  },
  {
    id: 6,
    name: 'Cisco Networking & Security Lab',
    code: 'NETWORKING',
    department_id: 3,
    department_name: 'Communication and Computer Engineering',
    staff_id: 203,
    staff_name: 'Vikas Verma',
    staff_ids_csv: '203',
    staff_names_csv: 'Vikas Verma',
    capacity: 40,
    location: 'AB1 Room 212, CCE Wing',
  },
  {
    id: 7,
    name: 'Robotics & Mechatronics Lab',
    code: 'ROBOTICS',
    department_id: 4,
    department_name: 'Mechanical-Mechatronics Engineering',
    staff_id: 206,
    staff_name: 'Mahendra Gurjar',
    staff_ids_csv: '206',
    staff_names_csv: 'Mahendra Gurjar',
    capacity: 35,
    location: 'Central Workshop Complex WS-02',
  },
  {
    id: 8,
    name: 'Engineering Physics & Optics Lab',
    code: 'PHYSICS_LAB',
    department_id: 5,
    department_name: 'Physics',
    staff_id: 207,
    staff_name: 'Ashok Sen',
    staff_ids_csv: '207',
    staff_names_csv: 'Ashok Sen',
    capacity: 60,
    location: 'AB1 Ground Floor Room 002',
  },
]

export interface MockUser {
  id: number
  name: string
  email: string
  role: 'student' | 'faculty' | 'lab_staff' | 'hod' | 'lab_coordinator' | 'admin' | 'others'
  department?: string
  salutation?: 'prof' | 'dr' | 'mr' | 'mrs' | 'none'
  student_id?: string
  created_at?: string
}

export const MOCK_USERS: MockUser[] = [
  // Administrators
  { id: 1, name: 'System Administrator', email: 'admin@lnmiit.ac.in', role: 'admin', department: 'Administration', salutation: 'mr', created_at: '2025-01-01' },

  // Faculty & HODs
  { id: 101, name: 'Prof. Poonam Gera', email: 'poonam.gera@lnmiit.ac.in', role: 'faculty', department: 'Computer Science and Engineering', salutation: 'prof', created_at: '2025-01-05' },
  { id: 102, name: 'Dr. Preety Singh', email: 'preety.singh@lnmiit.ac.in', role: 'faculty', department: 'Computer Science and Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 103, name: 'Dr. Sakthi Balan', email: 'sakthi.balan@lnmiit.ac.in', role: 'faculty', department: 'Computer Science and Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 104, name: 'Prof. Soumitra Debnath', email: 'sdebnath@lnmiit.ac.in', role: 'faculty', department: 'Electronics and Communication Engineering', salutation: 'prof', created_at: '2025-01-05' },
  { id: 105, name: 'Dr. Abhishek Sharma', email: 'abhisheksharma@lnmiit.ac.in', role: 'faculty', department: 'Electronics and Communication Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 106, name: 'Dr. Rajbir Kaur', email: 'rajbirkaur@lnmiit.ac.in', role: 'faculty', department: 'Communication and Computer Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 107, name: 'Dr. Sunil Kumar', email: 'skumar@lnmiit.ac.in', role: 'faculty', department: 'Communication and Computer Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 108, name: 'Dr. Manoj Kumar', email: 'manojkumar@lnmiit.ac.in', role: 'faculty', department: 'Mechanical-Mechatronics Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 109, name: 'Dr. Vikram Sharma', email: 'vsharma@lnmiit.ac.in', role: 'faculty', department: 'Mechanical-Mechatronics Engineering', salutation: 'dr', created_at: '2025-01-05' },
  { id: 110, name: 'Prof. Anupam Singh', email: 'anupam@lnmiit.ac.in', role: 'faculty', department: 'Physics', salutation: 'prof', created_at: '2025-01-05' },
  { id: 111, name: 'Dr. Manish Garg', email: 'mgarg@lnmiit.ac.in', role: 'faculty', department: 'Physics', salutation: 'dr', created_at: '2025-01-05' },
  { id: 112, name: 'Dr. Pratibha Garg', email: 'pratibha@lnmiit.ac.in', role: 'faculty', department: 'Mathematics', salutation: 'dr', created_at: '2025-01-05' },

  // Lab Technical Staff
  { id: 201, name: 'Ramesh Sharma', email: 'ramesh.sharma@lnmiit.ac.in', role: 'lab_staff', department: 'Computer Science and Engineering', salutation: 'mr', created_at: '2025-01-10' },
  { id: 202, name: 'Suresh Kumar', email: 'suresh.kumar@lnmiit.ac.in', role: 'lab_staff', department: 'Computer Science and Engineering', salutation: 'mr', created_at: '2025-01-10' },
  { id: 203, name: 'Vikas Verma', email: 'vikas.verma@lnmiit.ac.in', role: 'lab_staff', department: 'Computer Science and Engineering', salutation: 'mr', created_at: '2025-01-10' },
  { id: 204, name: 'Narendra Singh', email: 'narendra.singh@lnmiit.ac.in', role: 'lab_staff', department: 'Electronics and Communication Engineering', salutation: 'mr', created_at: '2025-01-10' },
  { id: 205, name: 'Jitendra Yadav', email: 'jitendra.yadav@lnmiit.ac.in', role: 'lab_staff', department: 'Electronics and Communication Engineering', salutation: 'mr', created_at: '2025-01-10' },
  { id: 206, name: 'Mahendra Gurjar', email: 'mahendra.gurjar@lnmiit.ac.in', role: 'lab_staff', department: 'Mechanical-Mechatronics Engineering', salutation: 'mr', created_at: '2025-01-10' },
  { id: 207, name: 'Ashok Sen', email: 'ashok.sen@lnmiit.ac.in', role: 'lab_staff', department: 'Physics', salutation: 'mr', created_at: '2025-01-10' },

  // Students
  { id: 301, name: 'Dhruv Agrawal', email: '23ucs107@lnmiit.ac.in', role: 'student', department: 'Computer Science and Engineering', student_id: '23UCS107', salutation: 'none', created_at: '2025-08-01' },
  { id: 302, name: 'Abhinav Dogra', email: '23ucs507@lnmiit.ac.in', role: 'student', department: 'Computer Science and Engineering', student_id: '23UCS507', salutation: 'none', created_at: '2025-08-01' },
  { id: 303, name: 'Abhinav Thulal', email: '23ucs508@lnmiit.ac.in', role: 'student', department: 'Computer Science and Engineering', student_id: '23UCS508', salutation: 'none', created_at: '2025-08-01' },
  { id: 304, name: 'Aarav Sharma', email: '22ucs001@lnmiit.ac.in', role: 'student', department: 'Computer Science and Engineering', student_id: '22UCS001', salutation: 'none', created_at: '2024-08-01' },
  { id: 305, name: 'Ananya Gupta', email: '22ucs042@lnmiit.ac.in', role: 'student', department: 'Computer Science and Engineering', student_id: '22UCS042', salutation: 'none', created_at: '2024-08-01' },
  { id: 306, name: 'Rohan Verma', email: '23uec034@lnmiit.ac.in', role: 'student', department: 'Electronics and Communication Engineering', student_id: '23UEC034', salutation: 'none', created_at: '2025-08-01' },
  { id: 307, name: 'Priya Patel', email: '23ucc019@lnmiit.ac.in', role: 'student', department: 'Communication and Computer Engineering', student_id: '23UCC019', salutation: 'none', created_at: '2025-08-01' },
  { id: 308, name: 'Ishaan Joshi', email: '23ume005@lnmiit.ac.in', role: 'student', department: 'Mechanical-Mechatronics Engineering', student_id: '23UME005', salutation: 'none', created_at: '2025-08-01' },
  { id: 309, name: 'Sneha Meena', email: '24ucs112@lnmiit.ac.in', role: 'student', department: 'Computer Science and Engineering', student_id: '24UCS112', salutation: 'none', created_at: '2026-08-01' },
  { id: 310, name: 'Tanmay Bansal', email: '24uec088@lnmiit.ac.in', role: 'student', department: 'Electronics and Communication Engineering', student_id: '24UEC088', salutation: 'none', created_at: '2026-08-01' },
]

export interface MockInventoryItem {
  id: number
  lab_id: number
  lab_name: string
  part_no: string
  item_name: string
  item_type: 'consumable' | 'non_consumable'
  category: string
  purchase_quantity: number
  available_quantity: number
  consumed_quantity: number
  condemned_quantity: number
  repair_quantity: number
  unit: string
  purchase_date: string | null
  purchase_pdf_url: string | null
  purchase_pdf_name: string | null
  remarks: string | null
  created_by_name?: string | null
  created_at: string
  updated_at: string
}

export const MOCK_INVENTORY_ITEMS: MockInventoryItem[] = [
  // Consumables
  {
    id: 1,
    lab_id: 5,
    lab_name: 'IoT & Embedded Systems Lab',
    part_no: 'ARD-UNO-R3',
    item_name: 'Arduino Uno R3 DIP Microcontroller Board',
    item_type: 'consumable',
    category: 'Microcontrollers',
    purchase_quantity: 120,
    available_quantity: 84,
    consumed_quantity: 26,
    condemned_quantity: 10,
    repair_quantity: 0,
    unit: 'pcs',
    purchase_date: '2025-03-12',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Arduino_2025.pdf',
    remarks: 'ATmega328P with removable IC socket, batch 2025-Q1',
    created_by_name: 'Jitendra Yadav',
    created_at: '2025-03-12T10:00:00Z',
    updated_at: '2026-02-15T14:30:00Z',
  },
  {
    id: 2,
    lab_id: 5,
    lab_name: 'IoT & Embedded Systems Lab',
    part_no: 'ESP32-WROOM-32D',
    item_name: 'ESP32 NodeMCU WiFi + BLE Development Board',
    item_type: 'consumable',
    category: 'Development Boards',
    purchase_quantity: 80,
    available_quantity: 52,
    consumed_quantity: 20,
    condemned_quantity: 8,
    repair_quantity: 0,
    unit: 'pcs',
    purchase_date: '2025-04-10',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_ESP32_IoT.pdf',
    remarks: 'Dual-core Xtensa LX6, Type-C CP2102 chip',
    created_by_name: 'Jitendra Yadav',
    created_at: '2025-04-10T09:15:00Z',
    updated_at: '2026-03-01T11:20:00Z',
  },
  {
    id: 3,
    lab_id: 3,
    lab_name: 'Advanced Computing & AI Lab',
    part_no: 'RPI4-4GB-V1.2',
    item_name: 'Raspberry Pi 4 Model B (4GB LPDDR4)',
    item_type: 'consumable',
    category: 'Single Board Computers',
    purchase_quantity: 45,
    available_quantity: 31,
    consumed_quantity: 11,
    condemned_quantity: 3,
    repair_quantity: 0,
    unit: 'pcs',
    purchase_date: '2025-02-18',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_RPi4_Al_Lab.pdf',
    remarks: 'Includes official active cooler heatsink and 32GB SanDisk Extreme MicroSD',
    created_by_name: 'Vikas Verma',
    created_at: '2025-02-18T14:00:00Z',
    updated_at: '2026-03-10T16:45:00Z',
  },
  {
    id: 4,
    lab_id: 4,
    lab_name: 'Hardware & Microprocessor Lab',
    part_no: 'BB-830-HQ',
    item_name: 'Solderless Breadboard 830 Tie Points with Rails',
    item_type: 'consumable',
    category: 'Prototyping Tools',
    purchase_quantity: 200,
    available_quantity: 155,
    consumed_quantity: 35,
    condemned_quantity: 10,
    repair_quantity: 0,
    unit: 'pcs',
    purchase_date: '2025-01-20',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Breadboards.pdf',
    remarks: 'Transparent backing with high durability nickel-plated phosphor bronze spring clips',
    created_by_name: 'Narendra Singh',
    created_at: '2025-01-20T11:30:00Z',
    updated_at: '2026-02-28T09:10:00Z',
  },
  {
    id: 5,
    lab_id: 4,
    lab_name: 'Hardware & Microprocessor Lab',
    part_no: 'JUMP-MF-20CM',
    item_name: 'Dupont Jumper Wires 20cm (Male-to-Female 40-pin)',
    item_type: 'consumable',
    category: 'Cables & Connectors',
    purchase_quantity: 500,
    available_quantity: 380,
    consumed_quantity: 90,
    condemned_quantity: 30,
    repair_quantity: 0,
    unit: 'bundles',
    purchase_date: '2025-01-20',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Wiring_Kits.pdf',
    remarks: 'Multi-color flexible copper ribbon cables',
    created_by_name: 'Narendra Singh',
    created_at: '2025-01-20T11:45:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 6,
    lab_id: 6,
    lab_name: 'Cisco Networking & Security Lab',
    part_no: 'CAT6-PATCH-2M',
    item_name: 'Cat6 UTP RJ45 Molded Snagless Patch Cable 2m',
    item_type: 'consumable',
    category: 'Networking Cables',
    purchase_quantity: 300,
    available_quantity: 240,
    consumed_quantity: 45,
    condemned_quantity: 15,
    repair_quantity: 0,
    unit: 'pcs',
    purchase_date: '2025-05-14',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Cat6_Cables.pdf',
    remarks: 'Fluke channel certified 550MHz pure copper conductors',
    created_by_name: 'Vikas Verma',
    created_at: '2025-05-14T08:30:00Z',
    updated_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 7,
    lab_id: 7,
    lab_name: 'Robotics & Mechatronics Lab',
    part_no: 'SENS-HCSR04',
    item_name: 'HC-SR04 Ultrasonic Distance Sensor Module',
    item_type: 'consumable',
    category: 'Sensors',
    purchase_quantity: 100,
    available_quantity: 68,
    consumed_quantity: 24,
    condemned_quantity: 8,
    repair_quantity: 0,
    unit: 'pcs',
    purchase_date: '2025-06-02',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Sensors_Robotics.pdf',
    remarks: '2cm - 400cm range, 5V DC operating voltage',
    created_by_name: 'Mahendra Gurjar',
    created_at: '2025-06-02T13:00:00Z',
    updated_at: '2026-03-05T15:00:00Z',
  },

  // Non-Consumables (Assets with Under Repair tracking)
  {
    id: 101,
    lab_id: 4,
    lab_name: 'Hardware & Microprocessor Lab',
    part_no: 'OSC-KEY-70M',
    item_name: 'Keysight DSOX1204G 70MHz 4-Channel Digital Oscilloscope',
    item_type: 'non_consumable',
    category: 'Test & Measurement',
    purchase_quantity: 25,
    available_quantity: 22,
    consumed_quantity: 0,
    condemned_quantity: 1,
    repair_quantity: 2,
    unit: 'units',
    purchase_date: '2024-07-15',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Keysight_Oscilloscopes.pdf',
    remarks: '2 units sent to Keysight Authorized Center for ADC channel recalibration',
    created_by_name: 'Narendra Singh',
    created_at: '2024-07-15T10:00:00Z',
    updated_at: '2026-03-02T16:15:00Z',
  },
  {
    id: 102,
    lab_id: 3,
    lab_name: 'Advanced Computing & AI Lab',
    part_no: 'PC-DELL-7090-AI',
    item_name: 'Dell OptiPlex 7090 Tower (Intel Core i7-11700, 32GB RAM, RTX 3060 12GB)',
    item_type: 'non_consumable',
    category: 'Workstations',
    purchase_quantity: 60,
    available_quantity: 57,
    consumed_quantity: 0,
    condemned_quantity: 1,
    repair_quantity: 2,
    unit: 'units',
    purchase_date: '2024-08-20',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Dell_AI_Workstations.pdf',
    remarks: '2 units awaiting replacement 650W power supply units',
    created_by_name: 'Vikas Verma',
    created_at: '2024-08-20T11:00:00Z',
    updated_at: '2026-03-08T14:20:00Z',
  },
  {
    id: 103,
    lab_id: 1,
    lab_name: 'Computer Programming Lab 1',
    part_no: 'PC-HP-400G7-CP1',
    item_name: 'HP ProDesk 400 G7 SFF (Intel Core i5-10500, 16GB RAM, 512GB NVMe SSD)',
    item_type: 'non_consumable',
    category: 'Desktop Systems',
    purchase_quantity: 75,
    available_quantity: 72,
    consumed_quantity: 0,
    condemned_quantity: 1,
    repair_quantity: 2,
    unit: 'units',
    purchase_date: '2024-06-10',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_HP_CP1_Desktops.pdf',
    remarks: 'Standard student programming node, dual-boot Ubuntu 24.04 LTS & Win 11',
    created_by_name: 'Ramesh Sharma',
    created_at: '2024-06-10T12:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 104,
    lab_id: 6,
    lab_name: 'Cisco Networking & Security Lab',
    part_no: 'SW-CISCO-2960X',
    item_name: 'Cisco Catalyst 2960-X 24-Port Gigabit Managed L2/L3 Switch',
    item_type: 'non_consumable',
    category: 'Network Infrastructure',
    purchase_quantity: 12,
    available_quantity: 11,
    consumed_quantity: 0,
    condemned_quantity: 0,
    repair_quantity: 1,
    unit: 'units',
    purchase_date: '2024-05-18',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Cisco_Switches.pdf',
    remarks: '1 unit port 17-24 fault, logged with Cisco RMA warranty ticket',
    created_by_name: 'Vikas Verma',
    created_at: '2024-05-18T09:30:00Z',
    updated_at: '2026-02-18T17:00:00Z',
  },
  {
    id: 105,
    lab_id: 4,
    lab_name: 'Hardware & Microprocessor Lab',
    part_no: 'SOLD-HAKKO-FX888D',
    item_name: 'Hakko FX-888D ESD-Safe Digital Temperature Soldering Station',
    item_type: 'non_consumable',
    category: 'Soldering & Rework',
    purchase_quantity: 30,
    available_quantity: 27,
    consumed_quantity: 0,
    condemned_quantity: 1,
    repair_quantity: 2,
    unit: 'units',
    purchase_date: '2024-09-01',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Hakko_Stations.pdf',
    remarks: 'Heating element replacement in progress for 2 units',
    created_by_name: 'Narendra Singh',
    created_at: '2024-09-01T15:00:00Z',
    updated_at: '2026-02-25T11:45:00Z',
  },
  {
    id: 106,
    lab_id: 8,
    lab_name: 'Engineering Physics & Optics Lab',
    part_no: 'LASER-HENE-632',
    item_name: 'Helium-Neon Gas Laser Demonstration Apparatus 632.8nm Red',
    item_type: 'non_consumable',
    category: 'Optical Equipment',
    purchase_quantity: 15,
    available_quantity: 14,
    consumed_quantity: 0,
    condemned_quantity: 0,
    repair_quantity: 1,
    unit: 'units',
    purchase_date: '2024-04-22',
    purchase_pdf_url: null,
    purchase_pdf_name: 'PO_Physics_Optics.pdf',
    remarks: 'High voltage cathode power adapter under repair',
    created_by_name: 'Ashok Sen',
    created_at: '2024-04-22T14:15:00Z',
    updated_at: '2026-02-10T13:30:00Z',
  },
]

export interface MockTimetableEntry {
  id: number
  lab_id: number
  day_of_week: number // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  time_slot_start: string
  time_slot_end: string
  notes?: string
  is_active: boolean
}

export const MOCK_TIMETABLE_ENTRIES: MockTimetableEntry[] = [
  // CP1 (lab_id: 1)
  { id: 1, lab_id: 1, day_of_week: 1, time_slot_start: '09:00', time_slot_end: '11:00', notes: 'CS201: Data Structures & Algorithms Lab (Batch B1) - Dr. Preety Singh', is_active: true },
  { id: 2, lab_id: 1, day_of_week: 1, time_slot_start: '14:00', time_slot_end: '16:00', notes: 'CS102: Object Oriented Programming Lab (Batch A1) - Prof. Poonam Gera', is_active: true },
  { id: 3, lab_id: 1, day_of_week: 2, time_slot_start: '09:00', time_slot_end: '11:00', notes: 'CS201: Data Structures & Algorithms Lab (Batch B2) - Dr. Preety Singh', is_active: true },
  { id: 4, lab_id: 1, day_of_week: 3, time_slot_start: '11:00', time_slot_end: '13:00', notes: 'CS302: Database Management Systems Lab (Batch C1) - Dr. Sakthi Balan', is_active: true },
  { id: 5, lab_id: 1, day_of_week: 4, time_slot_start: '14:00', time_slot_end: '17:00', notes: 'Competitive Coding Practice & ACM ICPC Club Session', is_active: true },
  { id: 6, lab_id: 1, day_of_week: 5, time_slot_start: '09:00', time_slot_end: '11:00', notes: 'CS101: Computer Programming in C (Batch D1) - Ramesh Sharma', is_active: true },

  // CP2 (lab_id: 2)
  { id: 7, lab_id: 2, day_of_week: 1, time_slot_start: '11:00', time_slot_end: '13:00', notes: 'CS304: Computer Networks Lab (Batch A2) - Dr. Sakthi Balan', is_active: true },
  { id: 8, lab_id: 2, day_of_week: 2, time_slot_start: '14:00', time_slot_end: '16:00', notes: 'CS301: Operating Systems Lab (Batch B1) - Dr. Rajbir Kaur', is_active: true },
  { id: 9, lab_id: 2, day_of_week: 3, time_slot_start: '09:00', time_slot_end: '11:00', notes: 'CS301: Operating Systems Lab (Batch B2) - Dr. Rajbir Kaur', is_active: true },
  { id: 10, lab_id: 2, day_of_week: 5, time_slot_start: '14:00', time_slot_end: '16:00', notes: 'CS304: Computer Networks Lab (Batch C2) - Dr. Sakthi Balan', is_active: true },

  // CP3 (lab_id: 3)
  { id: 11, lab_id: 3, day_of_week: 2, time_slot_start: '10:00', time_slot_end: '12:00', notes: 'AI401: Deep Learning & Computer Vision Lab - Dr. Preety Singh', is_active: true },
  { id: 12, lab_id: 3, day_of_week: 4, time_slot_start: '14:00', time_slot_end: '17:00', notes: 'BTP / M.Tech Thesis High-Performance Computing Cluster Lab', is_active: true },

  // Hardware Lab (lab_id: 4)
  { id: 13, lab_id: 4, day_of_week: 1, time_slot_start: '14:00', time_slot_end: '16:00', notes: 'EC302: Microprocessor & Microcontroller Lab (Batch E1) - Dr. Abhishek Sharma', is_active: true },
  { id: 14, lab_id: 4, day_of_week: 3, time_slot_start: '14:00', time_slot_end: '16:00', notes: 'EC204: Digital Electronics & Logic Design Lab (Batch E2) - Prof. Soumitra Debnath', is_active: true },
  { id: 15, lab_id: 4, day_of_week: 5, time_slot_start: '10:00', time_slot_end: '12:00', notes: 'EC305: Digital Signal Processing Lab - Dr. Abhishek Sharma', is_active: true },

  // Embedded Systems Lab (lab_id: 5)
  { id: 16, lab_id: 5, day_of_week: 2, time_slot_start: '11:00', time_slot_end: '13:00', notes: 'EC308: IoT & Embedded Systems Lab (Batch E2) - Dr. Sunil Kumar', is_active: true },
  { id: 17, lab_id: 5, day_of_week: 4, time_slot_start: '10:00', time_slot_end: '12:00', notes: 'EC308: IoT & Embedded Systems Lab (Batch E1) - Dr. Sunil Kumar', is_active: true },
]

export interface MockScheduleEntry {
  id: string
  lab_id: number
  lab_name: string
  lab_code: string
  start_time: string
  end_time: string
  time_range: string
  purpose: string
  type: 'class' | 'booking'
  booker_name?: string
  status: string
}

export const MOCK_DAILY_SCHEDULE: {
  lab_id: number
  lab_name: string
  lab_code: string
  entries: MockScheduleEntry[]
}[] = [
  {
    lab_id: 1,
    lab_name: 'Computer Programming Lab 1',
    lab_code: 'CP1',
    entries: [
      {
        id: 'ds-1',
        lab_id: 1,
        lab_name: 'Computer Programming Lab 1',
        lab_code: 'CP1',
        start_time: '09:00',
        end_time: '11:00',
        time_range: '09:00 - 11:00',
        purpose: 'CS201: Data Structures Lab (Batch B1)',
        type: 'class',
        booker_name: 'Dr. Preety Singh',
        status: 'scheduled',
      },
      {
        id: 'ds-2',
        lab_id: 1,
        lab_name: 'Computer Programming Lab 1',
        lab_code: 'CP1',
        start_time: '14:00',
        end_time: '16:00',
        time_range: '14:00 - 16:00',
        purpose: 'CS102: Object Oriented Programming (Batch A1)',
        type: 'class',
        booker_name: 'Prof. Poonam Gera',
        status: 'scheduled',
      },
      {
        id: 'ds-3',
        lab_id: 1,
        lab_name: 'Computer Programming Lab 1',
        lab_code: 'CP1',
        start_time: '17:30',
        end_time: '19:30',
        time_range: '17:30 - 19:30',
        purpose: 'CSI Student Chapter Hands-on Workshop on Web Systems',
        type: 'booking',
        booker_name: 'Dhruv Agrawal (23UCS107)',
        status: 'approved',
      },
    ],
  },
  {
    lab_id: 2,
    lab_name: 'Computer Programming Lab 2',
    lab_code: 'CP2',
    entries: [
      {
        id: 'ds-4',
        lab_id: 2,
        lab_name: 'Computer Programming Lab 2',
        lab_code: 'CP2',
        start_time: '11:00',
        end_time: '13:00',
        time_range: '11:00 - 13:00',
        purpose: 'CS304: Computer Networks Lab (Batch A2)',
        type: 'class',
        booker_name: 'Dr. Sakthi Balan',
        status: 'scheduled',
      },
      {
        id: 'ds-5',
        lab_id: 2,
        lab_name: 'Computer Programming Lab 2',
        lab_code: 'CP2',
        start_time: '15:00',
        end_time: '17:00',
        time_range: '15:00 - 17:00',
        purpose: 'Mid-term Practical Evaluation: Operating Systems',
        type: 'booking',
        booker_name: 'Dr. Rajbir Kaur',
        status: 'approved',
      },
    ],
  },
  {
    lab_id: 4,
    lab_name: 'Hardware & Microprocessor Lab',
    lab_code: 'HARDWARE',
    entries: [
      {
        id: 'ds-6',
        lab_id: 4,
        lab_name: 'Hardware & Microprocessor Lab',
        lab_code: 'HARDWARE',
        start_time: '14:00',
        end_time: '16:00',
        time_range: '14:00 - 16:00',
        purpose: 'EC302: Microprocessor & Microcontroller Lab (Batch E1)',
        type: 'class',
        booker_name: 'Dr. Abhishek Sharma',
        status: 'scheduled',
      },
    ],
  },
  {
    lab_id: 5,
    lab_name: 'IoT & Embedded Systems Lab',
    lab_code: 'EMBEDDED',
    entries: [
      {
        id: 'ds-7',
        lab_id: 5,
        lab_name: 'IoT & Embedded Systems Lab',
        lab_code: 'EMBEDDED',
        start_time: '10:00',
        end_time: '13:00',
        time_range: '10:00 - 13:00',
        purpose: 'Smart Agriculture IoT Sensor Prototype Testing',
        type: 'booking',
        booker_name: 'Aarav Sharma (22UCS001)',
        status: 'approved',
      },
    ],
  },
]
