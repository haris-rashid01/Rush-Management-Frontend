import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportPDF = (
  title: string,
  columns: string[],
  data: any[][],
  filename: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 20);

  (doc as any).autoTable({
    head: [columns],
    body: data,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [33, 150, 243] },
  });

  doc.save(filename);
};
