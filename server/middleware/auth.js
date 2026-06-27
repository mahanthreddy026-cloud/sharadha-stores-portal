const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sharadha_jwt_secret_key_2026_super_secure';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ message: 'Session expired. Please log in again.' });
    }
    req.admin = admin;
    next();
  });
}

module.exports = {
  generateToken,
  authenticateToken
};
