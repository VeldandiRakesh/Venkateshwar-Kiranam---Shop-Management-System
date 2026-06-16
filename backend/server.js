require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database
require('./database');

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Shop Items Backend API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    🛒 Shop Items Backend Server 🛒    ║
╠════════════════════════════════════════╣
║  ✓ Server running on port ${PORT}              ║
║  ✓ Database: shop.db                   ║
║  ✓ API: http://localhost:${PORT}/api    ║
║  ✓ Health: http://localhost:${PORT}/health    ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
