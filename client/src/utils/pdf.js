import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateBillPDF = (bill, shopDetails) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12); // Primary Orange EA580C
  doc.text(shopDetails?.shop_name || 'Kirana OS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Owner: ${shopDetails?.owner_name || ''}`, 105, 27, { align: 'center' });
  doc.text(`Ph: ${shopDetails?.phone || ''}`, 105, 32, { align: 'center' });
  
  // Bill Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Bill No: ${bill.bill_number}`, 14, 45);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 45);
  if (bill.customer_name) {
    doc.text(`Customer (Udhari): ${bill.customer_name}`, 14, 52);
  }

  // Table
  const tableColumn = ["SN", "Item", "Qty", "Price", "Total"];
  const tableRows = [];

  bill.items.forEach((item, index) => {
    const itemData = [
      index + 1,
      item.product_name,
      item.qty || item.quantity,
      `Rs ${item.unit_price}`,
      `Rs ${item.subtotal}`,
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] }, // Primary orange
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY || 60;
  doc.setFontSize(11);
  
  if (Number(bill.discount) > 0) {
    doc.text(`Total Amount: Rs ${bill.total_amount}`, 140, finalY + 10);
    doc.text(`Discount: Rs ${bill.discount}`, 140, finalY + 16);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Final Pay: Rs ${bill.final_amount}`, 140, finalY + 24);
  } else {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Final Pay: Rs ${bill.final_amount}`, 140, finalY + 15);
  }

  // Footer message
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for shopping with us!', 105, finalY + 40, { align: 'center' });

  // Save the PDF
  doc.save(`${bill.bill_number}.pdf`);
};
