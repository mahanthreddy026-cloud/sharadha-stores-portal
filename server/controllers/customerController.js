const bcrypt = require('bcryptjs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

async function register(req, res) {
  try {
    const { name, company_name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'Name, phone, email, and password are required.' });
    }

    // Check if email already registered
    const existing = await db.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'A customer account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO customers (name, company_name, phone, email, password_hash) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, company_name || null, phone, email, passwordHash]
    );

    return res.status(201).json({
      message: 'Account registered successfully. Please sign in.',
      customerId: result.insertId
    });
  } catch (error) {
    console.error('Customer Registration Error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const customers = await db.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
    if (!customers || customers.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const customer = customers[0];
    if (!customer.password_hash) {
      return res.status(400).json({ message: 'This account has no password set. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token with role: customer
    const token = authMiddleware.generateToken({ 
      id: customer.id, 
      name: customer.name, 
      email: customer.email, 
      role: 'customer' 
    });

    return res.status(200).json({
      message: 'Authentication successful',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company_name: customer.company_name
      }
    });
  } catch (error) {
    console.error('Customer Login Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

async function getOrders(req, res) {
  try {
    const email = req.admin.email; // From authenticateToken JWT decode
    const orders = await db.query('SELECT * FROM bulk_orders WHERE email = ? ORDER BY id DESC', [email]);
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  register,
  login,
  getOrders
};
