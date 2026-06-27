const db = require('../config/db');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const path = require('path');
const fs = require('fs');

// Helper to generate a unique request ID
function generateRequestId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SRD-${dateStr}-${rand}`;
}

// 1. Submit Bulk Order (Publicly accessible form endpoint)
async function createBulkOrder(req, res) {
  try {
    const {
      customer_name,
      company_name,
      phone,
      email,
      event_type,
      event_date,
      delivery_address,
      city,
      state,
      pincode,
      category_id,
      package_id,
      quantity,
      budget,
      message,
      preferred_contact,
      items // Array of { product_id, quantity, unit_price }
    } = req.body;

    if (!customer_name || !phone || !email || !event_type || !event_date || !delivery_address || !city || !state || !pincode || !quantity || !budget) {
      return res.status(400).json({ message: 'All required bulk enquiry fields must be completed.' });
    }

    const requestId = generateRequestId();
    const catId = category_id || null;
    const pkgId = package_id || null;

    // Create bulk order record
    const result = await db.query(
      `INSERT INTO bulk_orders (
        request_id, customer_name, company_name, phone, email, 
        event_type, event_date, delivery_address, city, state, 
        pincode, category_id, package_id, quantity, budget, 
        message, preferred_contact, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        requestId, customer_name, company_name || null, phone, email,
        event_type, event_date, delivery_address, city, state,
        pincode, catId, pkgId, quantity, budget,
        message || null, preferred_contact || 'Email'
      ]
    );

    const bulkOrderId = result.insertId;

    // Add items if specified
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await db.query(
          `INSERT INTO bulk_order_items (bulk_order_id, product_id, quantity, unit_price) 
           VALUES (?, ?, ?, ?)`,
          [bulkOrderId, item.product_id, item.quantity, item.unit_price]
        );
      }
    } else if (pkgId) {
      // If a package was selected, automatically pull package products if possible
      const packages = await db.query('SELECT * FROM gift_packages WHERE id = ?', [pkgId]);
      if (packages && packages.length > 0) {
        // Link package price as quote estimate baseline
        await db.query('UPDATE bulk_orders SET quote_grand_total = ? WHERE id = ?', [packages[0].price * quantity, bulkOrderId]);
      }
    }

    // Add to Status History
    await db.query(
      `INSERT INTO status_history (bulk_order_id, status, notes, updated_by) 
       VALUES (?, 'Pending', 'Bulk order enquiry registered.', 'Customer')`,
      [bulkOrderId]
    );

    // Create Admin Notification
    await db.query(
      `INSERT INTO notifications (bulk_order_id, title, message, type) 
       VALUES (?, ?, ?, 'Info')`,
      [
        bulkOrderId,
        'New Bulk Order Request',
        `A new enquiry (${requestId}) has been received from ${customer_name} for a budget of Rs. ${budget}.`
      ]
    );

    // Send confirmation email
    await emailService.sendEmail({
      to: email,
      subject: `Enquiry Received: ${requestId} - Sharadha Stores`,
      text: `Dear ${customer_name},\n\nThank you for reaching out to Sharadha Stores. We have received your bulk order request for ${event_type} on ${event_date}. Your unique Request ID is: ${requestId}.\n\nOur team is reviewing your requirements and will generate a quotation shortly.\n\nWarm regards,\nSharadha Stores Team`
    });

    return res.status(201).json({
      message: 'Bulk order request submitted successfully.',
      request_id: requestId,
      id: bulkOrderId
    });
  } catch (error) {
    console.error('Create Bulk Order Error:', error);
    return res.status(500).json({ message: 'Error processing bulk order submission.' });
  }
}

// 2. Get Bulk Orders (Admin list with pagination, search, status, and sort filters)
async function getBulkOrders(req, res) {
  try {
    const { status, search, page = 1, limit = 10, sort = 'id', order = 'DESC' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const countParams = [];
    let queryStr = 'SELECT * FROM bulk_orders';
    let countQuery = 'SELECT COUNT(*) as total FROM bulk_orders';
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      conditions.push('(customer_name LIKE ? OR company_name LIKE ? OR request_id LIKE ? OR phone LIKE ?)');
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
      countParams.push(searchWild, searchWild, searchWild, searchWild);
    }

    if (conditions.length > 0) {
      const condStr = ' WHERE ' + conditions.join(' AND ');
      queryStr += condStr;
      countQuery += condStr;
    }

    // Secure sorting columns
    const allowedCols = ['id', 'customer_name', 'event_date', 'budget', 'quantity', 'status', 'created_at'];
    const sortCol = allowedCols.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    queryStr += ` ORDER BY ${sortCol} ${sortOrder}`;
    
    if (db.DB_TYPE === 'mysql') {
      queryStr += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), offset);
    } else {
      queryStr += ` LIMIT ${parseInt(limit, 10)} OFFSET ${offset}`;
    }

    const orders = await db.query(queryStr, params);
    const totals = await db.query(countQuery, countParams);
    const total = totals[0] ? totals[0].total : 0;

    return res.status(200).json({
      orders,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get Bulk Orders Error:', error);
    return res.status(500).json({ message: 'Error retrieving bulk orders.' });
  }
}

// 3. Get Details by Request ID or Database ID
async function getBulkOrderById(req, res) {
  try {
    const { id } = req.params;
    let order = null;

    if (isNaN(id)) {
      // Treat as Request ID
      const orders = await db.query('SELECT * FROM bulk_orders WHERE request_id = ? LIMIT 1', [id]);
      if (orders && orders.length > 0) order = orders[0];
    } else {
      const orders = await db.query('SELECT * FROM bulk_orders WHERE id = ? LIMIT 1', [id]);
      if (orders && orders.length > 0) order = orders[0];
    }

    if (!order) {
      return res.status(404).json({ message: 'Order request not found.' });
    }

    const orderId = order.id;

    // Load category and package
    let category = null;
    if (order.category_id) {
      const cats = await db.query('SELECT * FROM categories WHERE id = ?', [order.category_id]);
      if (cats.length > 0) category = cats[0];
    }

    let giftPackage = null;
    if (order.package_id) {
      const pkgs = await db.query('SELECT * FROM gift_packages WHERE id = ?', [order.package_id]);
      if (pkgs.length > 0) giftPackage = pkgs[0];
    }

    // Load Items, History, Payments, Dispatch records
    const items = await db.query(
      `SELECT boi.*, p.name, p.image_url 
       FROM bulk_order_items boi 
       JOIN products p ON boi.product_id = p.id 
       WHERE boi.bulk_order_id = ?`,
      [orderId]
    );

    const history = await db.query(
      'SELECT * FROM status_history WHERE bulk_order_id = ? ORDER BY id DESC',
      [orderId]
    );

    const payments = await db.query(
      'SELECT * FROM payments WHERE bulk_order_id = ? ORDER BY id DESC',
      [orderId]
    );

    const dispatch = await db.query(
      'SELECT * FROM dispatch WHERE bulk_order_id = ? ORDER BY id DESC',
      [orderId]
    );

    const quotes = await db.query(
      'SELECT * FROM quotes WHERE bulk_order_id = ? ORDER BY id DESC LIMIT 1',
      [orderId]
    );

    return res.status(200).json({
      order,
      category,
      giftPackage,
      items,
      history,
      payments,
      dispatch: dispatch[0] || null,
      quote: quotes[0] || null
    });
  } catch (error) {
    console.error('Get Order Details Error:', error);
    return res.status(500).json({ message: 'Error retrieving order details.' });
  }
}

// 4. Generate & Dispatch Quotation (Admin Quote Builder)
async function generateQuote(req, res) {
  try {
    const { id } = req.params;
    const { discount = 0, tax_rate = 18, delivery_charge = 0, items } = req.body;

    const orders = await db.query('SELECT * FROM bulk_orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order request not found.' });
    }
    const order = orders[0];

    // Load or compile quotation items
    let quoteItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      // Overwrite items list with actual selected items
      // First wipe old items
      await db.query('DELETE FROM bulk_order_items WHERE bulk_order_id = ?', [id]);
      for (const item of items) {
        await db.query(
          'INSERT INTO bulk_order_items (bulk_order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [id, item.product_id, item.quantity, item.unit_price]
        );
        
        const products = await db.query('SELECT name FROM products WHERE id = ?', [item.product_id]);
        quoteItems.push({
          product_id: item.product_id,
          name: products[0] ? products[0].name : 'Product',
          quantity: item.quantity,
          unit_price: item.unit_price
        });
      }
    } else {
      // Pull existing items
      quoteItems = await db.query(
        `SELECT boi.*, p.name 
         FROM bulk_order_items boi 
         JOIN products p ON boi.product_id = p.id 
         WHERE boi.bulk_order_id = ?`,
        [id]
      );
    }

    if (quoteItems.length === 0) {
      return res.status(400).json({ message: 'Cannot generate quotation with zero items.' });
    }

    // Calculations
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discountVal = parseFloat(discount);
    const taxRate = parseFloat(tax_rate);
    const taxAmount = (subtotal - discountVal) * (taxRate / 100);
    const deliveryChargeVal = parseFloat(delivery_charge);
    const grandTotal = subtotal - discountVal + taxAmount + deliveryChargeVal;

    // Create or update Quote record
    const existingQuotes = await db.query('SELECT id FROM quotes WHERE bulk_order_id = ?', [id]);
    let quoteId;

    if (existingQuotes && existingQuotes.length > 0) {
      quoteId = existingQuotes[0].id;
      await db.query(
        `UPDATE quotes 
         SET discount = ?, tax_rate = ?, delivery_charge = ?, grand_total = ?, status = 'Sent' 
         WHERE id = ?`,
        [discountVal, taxRate, deliveryChargeVal, grandTotal, quoteId]
      );
    } else {
      const qRes = await db.query(
        `INSERT INTO quotes (bulk_order_id, discount, tax_rate, delivery_charge, grand_total, status) 
         VALUES (?, ?, ?, ?, ?, 'Sent')`,
        [id, discountVal, taxRate, deliveryChargeVal, grandTotal]
      );
      quoteId = qRes.insertId;
    }

    const quoteRecord = { id: quoteId, discount: discountVal, tax_rate: taxRate, delivery_charge: deliveryChargeVal, grand_total: grandTotal };

    // Generate PDF
    const pdfUrl = await pdfService.generateQuotationPDF(order, quoteRecord, quoteItems);
    
    // Update quote record with path and order total
    await db.query('UPDATE quotes SET generated_pdf_path = ? WHERE id = ?', [pdfUrl, quoteId]);
    await db.query('UPDATE bulk_orders SET quote_grand_total = ?, status = \'Quotation Sent\' WHERE id = ?', [grandTotal, id]);

    // Status Timeline update
    await db.query(
      `INSERT INTO status_history (bulk_order_id, status, notes, updated_by) 
       VALUES (?, 'Quotation Sent', ?, ?)`,
      [id, `Quotation of Rs. ${grandTotal.toFixed(2)} generated and sent.`, req.admin ? req.admin.username : 'Admin']
    );

    // Notifications
    await db.query(
      `INSERT INTO notifications (bulk_order_id, title, message, type) 
       VALUES (?, 'Quotation Dispatched', ?, 'Quote')`,
      [id, `Quotation generated for order ${order.request_id}. Grand total: Rs. ${grandTotal.toFixed(2)}.`]
    );

    // Send PDF via email
    const pdfPath = path.join(__dirname, '..', pdfUrl);
    await emailService.sendEmail({
      to: order.email,
      subject: `Quotation for Bulk Order Request ${order.request_id} - Sharadha Stores`,
      text: `Dear ${order.customer_name},\n\nPlease find attached the official quotation for your bulk order request (${order.request_id}).\n\nTotal Amount: Rs. ${grandTotal.toFixed(2)} (including GST and delivery).\n\nYou can review, approve, or coordinate edits by replying to this email.\n\nWarm regards,\nSharadha Stores Team`,
      attachments: [
        {
          filename: `Quote-${order.request_id}.pdf`,
          path: pdfPath
        }
      ]
    });

    return res.status(200).json({
      message: 'Quotation generated and emailed successfully.',
      pdfUrl,
      quote: quoteRecord
    });
  } catch (error) {
    console.error('Generate Quote Error:', error);
    return res.status(500).json({ message: 'Error generating quote.' });
  }
}

// 5. Update Order Status (Timeline management)
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes, assigned_employee } = req.body;

    const orders = await db.query('SELECT * FROM bulk_orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order request not found.' });
    }
    const order = orders[0];

    const updater = req.admin ? req.admin.username : 'System';

    // Status updates
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (assigned_employee !== undefined) {
      updates.push('assigned_employee = ?');
      params.push(assigned_employee);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.query(`UPDATE bulk_orders SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Save history
    if (status) {
      await db.query(
        `INSERT INTO status_history (bulk_order_id, status, notes, updated_by) 
         VALUES (?, ?, ?, ?)`,
        [id, status, notes || `Status updated to ${status}`, updater]
      );

      // Trigger alerts and notifications
      await db.query(
        `INSERT INTO notifications (bulk_order_id, title, message, type) 
         VALUES (?, ?, ?, 'Alert')`,
        [id, `Status Update: ${order.request_id}`, `Order status has been updated to ${status}.`, 'Alert']
      );

      // Email notifications on key status shifts
      await emailService.sendEmail({
        to: order.email,
        subject: `Order Status Updated: ${order.request_id} - Sharadha Stores`,
        text: `Dear ${order.customer_name},\n\nThe status of your bulk order request (${order.request_id}) has been updated to: ${status}.\n\nDetails / Notes: ${notes || 'No extra notes provided.'}\n\nYou can track the progress using your Request ID directly on our portal.\n\nWarm regards,\nSharadha Stores`
      });
    }

    return res.status(200).json({ message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({ message: 'Error updating order status.' });
  }
}

// 6. Record Customer Payments
async function addPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount, payment_method, transaction_id, status = 'Completed' } = req.body;

    const orders = await db.query('SELECT * FROM bulk_orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order request not found.' });
    }
    const order = orders[0];

    const paidAt = status === 'Completed' ? new Date() : null;

    const result = await db.query(
      `INSERT INTO payments (bulk_order_id, amount, payment_method, status, transaction_id, paid_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, amount, payment_method, status, transaction_id || null, paidAt]
    );

    if (status === 'Completed') {
      // Transition bulk order status to Processing
      await db.query("UPDATE bulk_orders SET status = 'Processing' WHERE id = ?", [id]);
      await db.query(
        `INSERT INTO status_history (bulk_order_id, status, notes, updated_by) 
         VALUES (?, 'Processing', ?, 'System')`,
        [id, `Payment of Rs. ${amount} verified. Order forwarded to processing.`]
      );
      
      // Auto create dispatch job
      await db.query("INSERT INTO dispatch (bulk_order_id, status) VALUES (?, 'Processing')", [id]);
    }

    return res.status(201).json({
      message: 'Payment recorded successfully.',
      paymentId: result.insertId
    });
  } catch (error) {
    console.error('Add Payment Error:', error);
    return res.status(500).json({ message: 'Error registering payment details.' });
  }
}

// 7. Update Dispatch Log
async function updateDispatch(req, res) {
  try {
    const { id } = req.params; // Bulk Order ID
    const { delivery_partner, tracking_number, status, estimated_delivery } = req.body;

    const orders = await db.query('SELECT * FROM bulk_orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order request not found.' });
    }
    const order = orders[0];

    // Check if dispatch job exists
    const existing = await db.query('SELECT id FROM dispatch WHERE bulk_order_id = ?', [id]);
    let dispatchId;

    const dispTime = status === 'Dispatched' ? new Date() : null;
    const delTime = status === 'Delivered' ? new Date() : null;

    if (existing && existing.length > 0) {
      dispatchId = existing[0].id;
      const updates = [];
      const params = [];

      if (delivery_partner) { updates.push('delivery_partner = ?'); params.push(delivery_partner); }
      if (tracking_number) { updates.push('tracking_number = ?'); params.push(tracking_number); }
      if (status) { updates.push('status = ?'); params.push(status); }
      if (estimated_delivery) { updates.push('estimated_delivery = ?'); params.push(estimated_delivery); }
      if (dispTime) { updates.push('dispatched_at = ?'); params.push(dispTime); }
      if (delTime) { updates.push('delivered_at = ?'); params.push(delTime); }

      if (updates.length > 0) {
        params.push(dispatchId);
        await db.query(`UPDATE dispatch SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    } else {
      const resDisp = await db.query(
        `INSERT INTO dispatch (bulk_order_id, delivery_partner, tracking_number, status, estimated_delivery, dispatched_at, delivered_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, delivery_partner || null, tracking_number || null, status || 'Processing', estimated_delivery || null, dispTime, delTime]
      );
      dispatchId = resDisp.insertId;
    }

    // Map dispatch status back to bulk order status if it matches key transitions
    if (status === 'Dispatched' || status === 'Delivered' || status === 'Packing') {
      await db.query('UPDATE bulk_orders SET status = ? WHERE id = ?', [status, id]);
      await db.query(
        `INSERT INTO status_history (bulk_order_id, status, notes, updated_by) 
         VALUES (?, ?, ?, ?)`,
        [id, status, `Dispatch tracking details updated. Partner: ${delivery_partner || 'N/A'}. Track ID: ${tracking_number || 'N/A'}.`, req.admin ? req.admin.username : 'Admin']
      );
    }

    return res.status(200).json({ message: 'Dispatch log updated.' });
  } catch (error) {
    console.error('Update Dispatch Error:', error);
    return res.status(500).json({ message: 'Error updating dispatch log.' });
  }
}

// 8. Delete order
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const orders = await db.query('SELECT * FROM bulk_orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order request not found.' });
    }

    await db.query('DELETE FROM bulk_orders WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    return res.status(500).json({ message: 'Error deleting order.' });
  }
}

module.exports = {
  createBulkOrder,
  getBulkOrders,
  getBulkOrderById,
  generateQuote,
  updateOrderStatus,
  addPayment,
  updateDispatch,
  deleteOrder
};
