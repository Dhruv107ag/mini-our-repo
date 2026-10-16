import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

const targetDir = path.resolve("./public/uploads/inventory");

function createSamplePDF(filename, title, subtitle, details = []) {
  const doc = new jsPDF();
  
  // Header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("THE LNM INSTITUTE OF INFORMATION TECHNOLOGY", 105, 15, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Central Laboratory Inventory & Procurement Section", 105, 24, { align: "center" });
  
  // Document title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(71, 85, 105);
  doc.text(subtitle, 20, 58);
  
  // Details box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 65, 170, details.length * 10 + 15, 3, 3, "FD");
  
  let y = 75;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  details.forEach(([label, value]) => {
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 25, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), 80, y);
    y += 10;
  });
  
  // Signatures section
  const sigY = 220;
  doc.setDrawColor(148, 163, 184);
  doc.line(25, sigY, 85, sigY);
  doc.line(125, sigY, 185, sigY);
  
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Verified & Signed By", 25, sigY + 6);
  doc.setFont("helvetica", "bold");
  doc.text("Lab Administrator / Technician", 25, sigY + 12);
  
  doc.setFont("helvetica", "normal");
  doc.text("Approved & Counter-Signed", 125, sigY + 6);
  doc.setFont("helvetica", "bold");
  doc.text("Head of Department / Faculty Incharge", 125, sigY + 12);
  
  // Official stamp watermark
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Document ID: LNMIIT-INV-${Math.floor(100000 + Math.random() * 900000)} | Generated: 2024-09-15`, 105, 280, { align: "center" });
  
  const buffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(path.join(targetDir, filename), buffer);
  console.log(`Generated: ${filename}`);
}

createSamplePDF(
  "sample-invoice-ne555.pdf",
  "PURCHASE INVOICE / BILL",
  "Texas Instruments Authorized Distributor - Tax Invoice",
  [
    ["Invoice No", "TI-DIST-2024-8841"],
    ["Date", "15-July-2024"],
    ["Part Number", "IC-NE555P"],
    ["Item Description", "NE555 Precision Timer IC (8-pin DIP package)"],
    ["Purchased Quantity", "100 Units"],
    ["Unit Price", "INR 18.50"],
    ["Total Amount", "INR 1,850.00 + GST"],
    ["Supplied To", "LNMIIT Electronics & Hardware Lab"],
    ["PO Reference", "LNMIIT/PUR/ECE/2024/091"],
  ]
);

createSamplePDF(
  "sample-invoice-resistors.pdf",
  "PURCHASE INVOICE / BILL",
  "Yageo Electronic Components Procurement",
  [
    ["Invoice No", "YAG-2024-1109"],
    ["Date", "10-June-2024"],
    ["Part Number", "RES-10K-025W"],
    ["Item Description", "10k Ohm Metal Film Resistors 1/4W (500 pcs)"],
    ["Purchased Quantity", "500 pcs"],
    ["Unit Price", "INR 0.65"],
    ["Total Amount", "INR 325.00"],
    ["Supplied To", "LNMIIT Electronics & Hardware Lab"],
    ["PO Reference", "LNMIIT/PUR/ECE/2024/074"],
  ]
);

createSamplePDF(
  "sample-invoice-dso.pdf",
  "EQUIPMENT PURCHASE ORDER & INVOICE",
  "Siglent Technologies India - Capital Equipment Bill",
  [
    ["Invoice No", "SIG-IN-2023-450"],
    ["Date", "10-November-2023"],
    ["Part Number", "DSO-SIG-1102"],
    ["Item Description", "Digital Storage Oscilloscope 100MHz 2-Channel"],
    ["Purchased Quantity", "15 Units"],
    ["Unit Price", "INR 32,500.00"],
    ["Total Amount", "INR 4,87,500.00"],
    ["Supplied To", "LNMIIT Central Electronics Lab"],
    ["GeM Contract", "GEMC-511687766543110"],
  ]
);

createSamplePDF(
  "sample-signed-proof-ne555.pdf",
  "SIGNED COMPONENT ISSUE REQUISITION SLIP",
  "Student Practical Requisition with Lab Incharge Approval & Signatures",
  [
    ["Requisition No", "REQ-LNMIIT-2024-0412"],
    ["Date of Issue", "20-August-2024"],
    ["Part Number", "IC-NE555P"],
    ["Item Name", "NE555 Precision Timer IC"],
    ["Quantity Consumed", "30 pcs (Student ko de diya)"],
    ["Issued For", "B.Tech ECE 2nd Year Multivibrator Lab Practicals"],
    ["Authorized Faculty", "Dr. Sandeep Saini (Associate Professor)"],
    ["Recipient Rep", "Aman Verma (Roll No: 23UEC012 - Batch Representative)"],
    ["Verified By", "Mukesh Sharma (Head Lab Staff) [Digitally Signed]"],
  ]
);

createSamplePDF(
  "sample-signed-proof-condemned.pdf",
  "SIGNED DEFECT & CONDEMNATION INSPECTION REPORT",
  "Inspection Memo for Damaged / Unserviceable Lab Stock",
  [
    ["Memo Reference", "MEMO-CONDEMN-2024-019"],
    ["Date of Inspection", "05-September-2024"],
    ["Part Number", "IC-NE555P / DSO-SIG-1102"],
    ["Item Name", "NE555 Timer IC & Oscilloscope Front Channel"],
    ["Quantity Condemned", "5 pcs ICs + 2 units DSO (Kharab hoga pr rkha rahega)"],
    ["Defect Reason", "Over-voltage surge during power stage experiment; retained for scrap audit"],
    ["Storage Location", "Condemned Equipment Rack B-4, Electronics Lab"],
    ["Inspecting Staff", "Mukesh Sharma (Lab Administrator) [Signed]"],
    ["Faculty Incharge", "Prof. R. Gangopadhyay (ECE Dept Head) [Signed]"],
  ]
);

console.log("All sample PDFs created successfully.");
