require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import database
require('./database');

// Import routes
const productRoutes = require('./routes/products');
const profileRoutes = require('./routes/profile');
const salesRoutes = require('./routes/sales');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/sales', salesRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Venkateshwar Kiranam Shop Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      profile: '/api/profile',
      sales: '/api/sales'
    }
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : undefined
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('===========================================');
  console.log('🛒 Venkateshwar Kiranam Backend Started');
  console.log(`🚀 Server Running on Port : ${PORT}`);
  console.log(`🌍 Environment            : ${process.env.NODE_ENV || 'development'}`);
  console.log(`❤️  Health Check          : /health`);
  console.log('===========================================');
});

module.exports = app;