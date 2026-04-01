import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export simulation results as PDF
 */
export function exportToPDF({ title, algorithm, tableHeaders, tableData, averages, chartRef }) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OS Visualizer App', 14, 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} — ${algorithm}`, 14, 22);
  
  // Date
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
  
  // Table
  if (tableHeaders && tableData) {
    doc.autoTable({
      startY: 48,
      head: [tableHeaders],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });
  }
  
  // Averages
  if (averages) {
    const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 100;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    Object.entries(averages).forEach(([key, val], i) => {
      doc.text(`${key}: ${val}`, 14, y + 8 + i * 7);
    });
  }
  
  // Chart snapshot
  if (chartRef?.current) {
    try {
      const canvas = chartRef.current.canvas || chartRef.current;
      const imgData = canvas.toDataURL('image/png');
      const yPos = (doc.lastAutoTable?.finalY || 120) + 30;
      doc.addImage(imgData, 'PNG', 14, yPos, 180, 60);
    } catch (e) {
      console.warn('Chart export failed:', e);
    }
  }
  
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
