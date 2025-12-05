import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Leave Requests Report", 14, 20);

  const tableColumn = [
    "Employee",
    "Leave Type",
    "Start Date",
    "End Date",
    "Days",
    "Reason",
    "Status"
  ];

  const tableRows: any[] = [];

  requests.forEach((req) => {
    tableRows.push([
      req.employee,
      req.type,
      req.startDate,
      req.endDate,
      req.days,
      req.reason || "N/A",
      req.status,
    ]);
  });

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save("Leave_Requests_Report.pdf");
};
