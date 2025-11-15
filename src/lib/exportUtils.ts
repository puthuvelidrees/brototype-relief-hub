import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface Complaint {
  ticket_id: string;
  student_name: string;
  mobile: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_admin?: { full_name: string | null };
  locations: { name: string };
  domains: { name: string };
  categories: { name: string } | null;
}

interface ExportStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

export const calculateStats = (complaints: Complaint[]): ExportStats => {
  const stats: ExportStats = {
    total: complaints.length,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
    byCategory: {},
  };

  complaints.forEach((complaint) => {
    // Status counts
    if (complaint.status === "pending") stats.pending++;
    else if (complaint.status === "in_progress") stats.in_progress++;
    else if (complaint.status === "resolved") stats.resolved++;

    // Priority counts
    stats.byPriority[complaint.priority] = (stats.byPriority[complaint.priority] || 0) + 1;

    // Category counts
    const category = complaint.categories?.name || "Uncategorized";
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  });

  return stats;
};

export const exportToPDF = (complaints: Complaint[], filters: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text("Complaint Report", pageWidth / 2, 20, { align: "center" });

  // Report metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "PPP p")}`, 14, 30);
  doc.text(`Total Complaints: ${complaints.length}`, 14, 36);

  // Filters applied
  let yPos = 42;
  if (filters.dateFrom || filters.dateTo) {
    const dateRange = `${filters.dateFrom || "Start"} to ${filters.dateTo || "End"}`;
    doc.text(`Date Range: ${dateRange}`, 14, yPos);
    yPos += 6;
  }
  if (filters.status !== "all") {
    doc.text(`Status: ${filters.status}`, 14, yPos);
    yPos += 6;
  }
  if (filters.priority !== "all") {
    doc.text(`Priority: ${filters.priority}`, 14, yPos);
    yPos += 6;
  }
  if (filters.category !== "all") {
    doc.text(`Category: ${filters.category}`, 14, yPos);
    yPos += 6;
  }

  // Summary statistics
  const stats = calculateStats(complaints);
  yPos += 6;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Summary Statistics", 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Status Breakdown:`, 14, yPos);
  yPos += 5;
  doc.text(`  • Pending: ${stats.pending}`, 20, yPos);
  yPos += 5;
  doc.text(`  • In Progress: ${stats.in_progress}`, 20, yPos);
  yPos += 5;
  doc.text(`  • Resolved: ${stats.resolved}`, 20, yPos);
  yPos += 8;

  doc.text(`Priority Breakdown:`, 14, yPos);
  yPos += 5;
  Object.entries(stats.byPriority).forEach(([priority, count]) => {
    doc.text(`  • ${priority.charAt(0).toUpperCase() + priority.slice(1)}: ${count}`, 20, yPos);
    yPos += 5;
  });

  // Complaints table
  const tableData = complaints.map((complaint) => [
    complaint.ticket_id,
    complaint.student_name,
    complaint.status,
    complaint.priority,
    complaint.categories?.name || "N/A",
    complaint.locations.name,
    format(new Date(complaint.created_at), "PP"),
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [["Ticket ID", "Student", "Status", "Priority", "Category", "Location", "Date"]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 10 },
  });

  // Save
  doc.save(`complaints-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const exportToExcel = (complaints: Complaint[], filters: any) => {
  const stats = calculateStats(complaints);

  // Summary sheet data
  const summaryData = [
    ["Complaint Report"],
    ["Generated", format(new Date(), "PPP p")],
    ["Total Complaints", complaints.length],
    [],
    ["Filters Applied"],
  ];

  if (filters.dateFrom || filters.dateTo) {
    summaryData.push(["Date Range", `${filters.dateFrom || "Start"} to ${filters.dateTo || "End"}`]);
  }
  if (filters.status !== "all") {
    summaryData.push(["Status", filters.status]);
  }
  if (filters.priority !== "all") {
    summaryData.push(["Priority", filters.priority]);
  }
  if (filters.category !== "all") {
    summaryData.push(["Category", filters.category]);
  }

  summaryData.push(
    [],
    ["Summary Statistics"],
    ["Status Breakdown"],
    ["Pending", stats.pending],
    ["In Progress", stats.in_progress],
    ["Resolved", stats.resolved],
    [],
    ["Priority Breakdown"]
  );

  Object.entries(stats.byPriority).forEach(([priority, count]) => {
    summaryData.push([priority.charAt(0).toUpperCase() + priority.slice(1), count]);
  });

  summaryData.push([], ["Category Breakdown"]);
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    summaryData.push([category, count]);
  });

  // Complaints data
  const complaintsData = [
    [
      "Ticket ID",
      "Student Name",
      "Mobile",
      "Description",
      "Status",
      "Priority",
      "Category",
      "Location",
      "Domain",
      "Assigned To",
      "Created Date",
    ],
    ...complaints.map((complaint) => [
      complaint.ticket_id,
      complaint.student_name,
      complaint.mobile,
      complaint.description,
      complaint.status,
      complaint.priority,
      complaint.categories?.name || "N/A",
      complaint.locations.name,
      complaint.domains.name,
      complaint.assigned_admin?.full_name || "Unassigned",
      format(new Date(complaint.created_at), "PPP p"),
    ]),
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Add complaints sheet
  const complaintsWs = XLSX.utils.aoa_to_sheet(complaintsData);
  XLSX.utils.book_append_sheet(wb, complaintsWs, "Complaints");

  // Save
  XLSX.writeFile(wb, `complaints-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
};
