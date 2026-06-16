const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Record a new sale / generate bill
router.post('/', salesController.createSale);

// Get sales history logs
router.get('/', salesController.getAllSales);

// Get real-time stats for the dashboard
router.get('/stats', salesController.getStats);

// Get daily/monthly/profit/low stock reports
router.get('/reports', salesController.getReports);

module.exports = router;
