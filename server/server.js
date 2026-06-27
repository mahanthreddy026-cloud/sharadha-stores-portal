require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const quotesDir = path.join(__dirname, 'uploads/quotes');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir);
}
if (!require('fs').existsSync(quotesDir)) {
  require('fs').mkdirSync(quotesDir);
}

// Serve uploaded attachments and PDFs
app.use('/uploads', express.static(uploadsDir));

// API Router groups
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', customerRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Sharadha Stores Bulk Order API Portal' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server after database check
db.initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[SERVER RUNNING] http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server due to Database Initialization Error:', err);
    process.exit(1);
  });
