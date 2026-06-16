import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates and downloads a beautifully styled PDF invoice.
 */
export const generateInvoicePDF = (billId, customerName, cartItems, subtotal, cgst, sgst, totalAmount, dateStr) => {
  const doc = new jsPDF();
  
  // Invoice Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('Venkateshwar Kiranam', 14, 25);
  
  // Subtitle
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Venkateshwar Nagar, Hyderabad, Telangana, 500098', 14, 31);
  
  // Horizontal divider line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);
  
  // Metadata section
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text('Invoice details:', 14, 45);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Bill ID: #${billId}`, 14, 52);
  doc.text(`Customer Name: ${customerName || 'Guest'}`, 14, 58);
  doc.text(`Date & Time: ${dateStr}`, 14, 64);
  
  // Table Setup
  const tableColumn = ['S.No.', 'Product Name', 'Price (INR)', 'Qty', 'Unit', 'Total (INR)'];
  const tableRows = [];
  
  cartItems.forEach((item, index) => {
    // Support both live context keys (price) and database model keys (selling_price)
    const price = item.price !== undefined ? item.price : item.selling_price;
    const qty = item.quantity;
    const unit = item.unit || 'units';
    const rowData = [
      index + 1,
      item.name,
      `Rs. ${price.toFixed(2)}`,
      qty,
      unit,
      `Rs. ${(price * qty).toFixed(2)}`
    ];
    tableRows.push(rowData);
  });
  
  // Generate Table
  doc.autoTable({
    startY: 72,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // Premium Blue-600
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 35, halign: 'right' }
    }
  });
  
  // Totals calculations positioning
  const finalY = doc.previousAutoTable.finalY + 10;
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  
  const rightLabelX = 135;
  const rightValueX = 196;
  
  doc.text('Subtotal:', rightLabelX, finalY);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, rightValueX, finalY, { align: 'right' });
  
  doc.text('CGST (9%):', rightLabelX, finalY + 6);
  doc.text(`Rs. ${cgst.toFixed(2)}`, rightValueX, finalY + 6, { align: 'right' });
  
  doc.text('SGST (9%):', rightLabelX, finalY + 12);
  doc.text(`Rs. ${sgst.toFixed(2)}`, rightValueX, finalY + 12, { align: 'right' });
  
  // Total Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(rightLabelX, finalY + 16, rightValueX, finalY + 16);
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Grand Total:', rightLabelX, finalY + 22);
  doc.text(`Rs. ${totalAmount.toFixed(2)}`, rightValueX, finalY + 22, { align: 'right' });
  
  // Invoice Footer
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('Thank you for shopping with us! Please visit again.', 105, finalY + 42, { align: 'center' });
  
  // Save/Download file
  doc.save(`Bill_${billId}_${customerName ? customerName.replace(/\s+/g, '_') : 'Guest'}.pdf`);
};
