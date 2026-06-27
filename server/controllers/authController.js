const bcrypt = require('bcryptjs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Query for admin by username or email
    const admins = await db.query('SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1', [username, username]);
    
    if (!admins || admins.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = authMiddleware.generateToken({ id: admin.id, username: admin.username, email: admin.email });
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Registered email address is required.' });
    }

    const admins = await db.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: 'No account registered with this email.' });
    }

    // Mock reset procedure
    console.log(`Password reset trigger for admin email: ${email}`);
    return res.status(200).json({
      message: 'Password recovery email dispatched. Please check your inbox.'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  login,
  forgotPassword
};
