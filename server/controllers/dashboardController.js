const db = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    // 1. Fetch counts
    const orders = await db.query('SELECT status, budget, quote_grand_total, created_at FROM bulk_orders');

    let total = orders.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let completed = 0;
    let revenue = 0;

    orders.forEach(o => {
      const status = o.status;
      if (status === 'Pending' || status === 'Quotation Sent') {
        pending++;
      } else if (status === 'Approved' || status === 'Payment Pending' || status === 'Processing' || status === 'Packing' || status === 'Dispatched') {
        approved++;
      } else if (status === 'Delivered') {
        completed++;
        revenue += parseFloat(o.quote_grand_total || o.budget || 0);
      } else if (status === 'Rejected') {
        rejected++;
      }
    });

    // 2. Aggregations (Months & Statuses)
    const monthlyDataMap = {};
    const statusDataMap = { 
      Pending: 0, 
      'Quotation Sent': 0, 
      Approved: 0, 
      'Payment Pending': 0, 
      Processing: 0, 
      Packing: 0, 
      Dispatched: 0, 
      Delivered: 0, 
      Rejected: 0 
    };

    orders.forEach(o => {
      // Status count
      if (statusDataMap[o.status] !== undefined) {
        statusDataMap[o.status]++;
      } else {
        statusDataMap[o.status] = 1;
      }

      // Month calculation
      const date = new Date(o.created_at);
      if (!isNaN(date)) {
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyDataMap[yearMonth]) {
          monthlyDataMap[yearMonth] = { month: yearMonth, orders: 0, revenue: 0 };
        }
        monthlyDataMap[yearMonth].orders++;
        if (o.status !== 'Rejected' && o.status !== 'Pending') {
          monthlyDataMap[yearMonth].revenue += parseFloat(o.quote_grand_total || o.budget || 0);
        }
      }
    });

    // Format charts data
    const monthlyCharts = Object.values(monthlyDataMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // last 6 months

    const statusCharts = Object.keys(statusDataMap).map(key => ({
      name: key,
      value: statusDataMap[key]
    })).filter(item => item.value > 0);

    // Latest Orders
    const latestOrders = await db.query(`
      SELECT id, request_id, customer_name, event_type, budget, status, created_at, quote_grand_total 
      FROM bulk_orders 
      ORDER BY id DESC 
      LIMIT 8
    `);

    return res.status(200).json({
      counters: {
        total,
        pending,
        approved,
        rejected,
        completed,
        revenue
      },
      charts: {
        monthly: monthlyCharts,
        status: statusCharts
      },
      latestOrders
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Error loading dashboard indicators.' });
  }
}

async function getReports(req, res) {
  try {
    // Detailed list of orders for reports table
    const orders = await db.query(`
      SELECT bo.*, q.discount, q.tax_rate, q.delivery_charge, q.grand_total 
      FROM bulk_orders bo 
      LEFT JOIN quotes q ON bo.id = q.bulk_order_id
      ORDER BY bo.id DESC
    `);

    // Top selling products by total quantity ordered
    const topProducts = await db.query(`
      SELECT p.id, p.name, p.price, SUM(boi.quantity) as total_quantity, SUM(boi.quantity * boi.unit_price) as total_revenue
      FROM bulk_order_items boi
      JOIN products p ON boi.product_id = p.id
      GROUP BY p.id, p.name, p.price
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

    // Customers list with spending summaries
    const customers = await db.query(`
      SELECT 
        customer_name as name, 
        email, 
        phone, 
        company_name, 
        COUNT(id) as total_orders, 
        SUM(CASE WHEN status != 'Rejected' THEN COALESCE(quote_grand_total, budget) ELSE 0 END) as total_spend
      FROM bulk_orders
      GROUP BY customer_name, email, phone, company_name
      ORDER BY total_spend DESC
    `);

    return res.status(200).json({
      orders,
      topProducts,
      customers
    });
  } catch (error) {
    console.error('Reports Stats Error:', error);
    return res.status(500).json({ message: 'Error compiling report data.' });
  }
}

module.exports = {
  getDashboardStats,
  getReports
};
