const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateQuotationPDF(order, quote, items) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `Quote-${order.request_id}.pdf`;
      const quotesDir = path.join(__dirname, '../uploads/quotes');
      
      // Ensure quotes directory exists
      if (!fs.existsSync(quotesDir)) {
        fs.mkdirSync(quotesDir, { recursive: true });
      }
      
      const filePath = path.join(quotesDir, filename);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- Header / Brand ---
      doc.fillColor('#ea580c').font('Helvetica-Bold').fontSize(22).text('SHARADHA STORES', { align: 'center' });
      doc.fillColor('#475569').font('Helvetica').fontSize(10).text('Homemade Sweets, Traditional Snacks & Corporate Gifting', { align: 'center' });
      doc.text('No. 45, Sannidhi Street, Jubilee Hills, Hyderabad - 500033 | Support: 1111111111', { align: 'center' });
      doc.moveDown(1.5);

      // --- Quote Title ---
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(14).text('OFFICIAL BULK ORDER QUOTATION', { align: 'left' });
      
      // Horizontal Orange Separator Line
      doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#ea580c').lineWidth(2).stroke();
      doc.moveDown(1);

      // --- Document Meta & Client Info (Two Columns) ---
      const startY = 135;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ea580c').text('QUOTATION DETAILS', 50, startY);
      doc.font('Helvetica').fillColor('#334155');
      doc.text(`Request ID: ${order.request_id}`, 50, startY + 15);
      doc.text(`Date Issued: ${new Date().toLocaleDateString('en-IN')}`, 50, startY + 30);
      doc.text(`Preferred Contact: ${order.preferred_contact || 'Email'}`, 50, startY + 45);

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ea580c').text('CLIENT DETAILS', 300, startY);
      doc.font('Helvetica').fillColor('#334155');
      doc.text(`Client Name: ${order.customer_name}`, 300, startY + 15);
      if (order.company_name) {
        doc.text(`Company: ${order.company_name}`, 300, startY + 30);
      }
      doc.text(`Contact: ${order.phone} | ${order.email}`, 300, startY + 45);

      // --- Delivery Destination ---
      const deliveryY = startY + 70;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ea580c').text('DELIVERY SITE', 50, deliveryY);
      doc.font('Helvetica').fillColor('#334155');
      doc.text(`Event: ${order.event_type} (Date: ${new Date(order.event_date).toLocaleDateString('en-IN')})`, 50, deliveryY + 15);
      doc.text(`Address: ${order.delivery_address}, ${order.city}, ${order.state} - ${order.pincode}`, 50, deliveryY + 30);

      // --- Items Table ---
      const tableTop = deliveryY + 60;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
      
      // Draw Table Header Background
      doc.rect(50, tableTop, 500, 20).fill('#ea580c');
      
      // Header Texts
      doc.text('S.No', 60, tableTop + 5);
      doc.text('Product Item Description', 100, tableTop + 5);
      doc.text('Quantity', 320, tableTop + 5, { width: 60, align: 'right' });
      doc.text('Rate (Rs.)', 390, tableTop + 5, { width: 70, align: 'right' });
      doc.text('Total (Rs.)', 470, tableTop + 5, { width: 70, align: 'right' });

      let currentY = tableTop + 20;
      doc.font('Helvetica').fontSize(9).fillColor('#1e293b');

      items.forEach((item, index) => {
        const itemTotal = item.quantity * item.unit_price;
        
        // Alternate shading for rows
        if (index % 2 === 1) {
          doc.rect(50, currentY, 500, 20).fill('#f8fafc');
        }
        
        doc.fillColor('#1e293b');
        doc.text((index + 1).toString(), 60, currentY + 5);
        doc.text(item.name || item.product_name || 'Gifting Product', 100, currentY + 5);
        doc.text(item.quantity.toString(), 320, currentY + 5, { width: 60, align: 'right' });
        doc.text(parseFloat(item.unit_price).toFixed(2), 390, currentY + 5, { width: 70, align: 'right' });
        doc.text(itemTotal.toFixed(2), 470, currentY + 5, { width: 70, align: 'right' });

        currentY += 20;
      });

      // Bottom separator
      doc.moveTo(50, currentY).lineTo(550, currentY).strokeColor('#cbd5e1').lineWidth(1).stroke();
      currentY += 10;

      // --- Financial Calculations ---
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const discount = parseFloat(quote.discount || 0);
      const taxRate = parseFloat(quote.tax_rate || 18);
      const taxAmount = (subtotal - discount) * (taxRate / 100);
      const deliveryCharge = parseFloat(quote.delivery_charge || 0);
      const grandTotal = parseFloat(quote.grand_total);

      doc.fontSize(9).fillColor('#475569');

      // Align columns for summary
      const sumColX = 350;
      const valColX = 470;

      doc.text('Subtotal:', sumColX, currentY, { width: 100, align: 'right' });
      doc.text(subtotal.toFixed(2), valColX, currentY, { width: 70, align: 'right' });
      currentY += 15;

      if (discount > 0) {
        doc.text('Campaign Discount:', sumColX, currentY, { width: 100, align: 'right' });
        doc.text(`-${discount.toFixed(2)}`, valColX, currentY, { width: 70, align: 'right' });
        currentY += 15;
      }

      doc.text(`GST (${taxRate}%):`, sumColX, currentY, { width: 100, align: 'right' });
      doc.text(taxAmount.toFixed(2), valColX, currentY, { width: 70, align: 'right' });
      currentY += 15;

      if (deliveryCharge > 0) {
        doc.text('Logistics & Delivery:', sumColX, currentY, { width: 100, align: 'right' });
        doc.text(deliveryCharge.toFixed(2), valColX, currentY, { width: 70, align: 'right' });
        currentY += 15;
      }

      // Grand Total Highlight
      doc.moveTo(350, currentY - 2).lineTo(550, currentY - 2).strokeColor('#e2e8f0').stroke();
      
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ea580c');
      doc.text('Grand Total:', sumColX, currentY + 3, { width: 100, align: 'right' });
      doc.text(`Rs. ${grandTotal.toFixed(2)}`, valColX, currentY + 3, { width: 70, align: 'right' });

      // --- Terms & Notes ---
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text('Terms & Conditions:', 50, currentY + 40);
      doc.font('Helvetica').fontSize(8).fillColor('#64748b');
      doc.text('1. Quotation validity is 15 working days from the date of issue.', 50, currentY + 53);
      doc.text('2. 50% advance payment required for order processing, rest before delivery.', 50, currentY + 65);
      doc.text('3. Sweets shelf life is 7-10 days depending on storage conditions.', 50, currentY + 77);

      // --- Signatures ---
      doc.font('Helvetica-Oblique').fontSize(8).fillColor('#94a3b8')
         .text('Thank you for choosing Sharadha Stores. Taste traditional purity.', 50, 720, { align: 'center' });
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569')
         .text('Authorized Signatory, Sharadha Stores', 380, 700, { align: 'right' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/quotes/${filename}`);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateQuotationPDF
};
