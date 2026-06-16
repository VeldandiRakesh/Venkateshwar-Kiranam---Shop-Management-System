const db = require('../database');

// Promisify SQLite methods for async/await readability and transaction control
const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

/**
 * Create a new bill/sale and deduct stock automatically inside a transaction.
 */
exports.createSale = async (req, res) => {
  const { customer_name, items, subtotal, tax, total_amount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
  }

  try {
    // Start SQLite Transaction
    await run('BEGIN TRANSACTION');

    let totalProfit = 0;
    const finalItems = [];

    for (const item of items) {
      // 1. Fetch live product details from database
      const product = await get('SELECT * FROM products WHERE id = ?', [item.id]);
      if (!product) {
        throw new Error(`Product "${item.name}" not found in inventory.`);
      }

      // 2. Validate stock sufficiency
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${item.name}". Available: ${product.stock_quantity} ${product.unit}, Requested: ${item.quantity}`);
      }

      // 3. Deduct stock quantity
      const newStock = product.stock_quantity - item.quantity;
      await run('UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStock, item.id]);

      // 4. Calculate profit using purchase price stored at time of sale
      const profitPerUnit = item.price - product.purchase_price;
      const itemProfit = profitPerUnit * item.quantity;
      totalProfit += itemProfit;

      finalItems.push({
        id: item.id,
        name: item.name,
        selling_price: item.price,
        purchase_price: product.purchase_price,
        quantity: item.quantity,
        unit: item.unit || product.unit,
        subtotal: item.price * item.quantity
      });
    }

    // 5. Store the bill in sales table
    const itemsJson = JSON.stringify(finalItems);
    const result = await run(
      `INSERT INTO sales (customer_name, items, subtotal, tax, total_amount, profit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_name || 'Guest', itemsJson, subtotal, tax, total_amount, totalProfit]
    );

    // Commit transaction
    await run('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: {
        bill_id: result.lastID,
        customer_name: customer_name || 'Guest',
        total_amount,
        profit: totalProfit,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    // Rollback changes on any error
    await run('ROLLBACK');
    console.error('Sale transaction failed:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Transaction error. Stock was not modified.'
    });
  }
};

/**
 * Get all sales history with customer/date filters.
 */
exports.getAllSales = async (req, res) => {
  const { customer, date, startDate, endDate } = req.query;

  let query = 'SELECT * FROM sales WHERE 1=1';
  const params = [];

  if (customer) {
    query += ' AND customer_name LIKE ?';
    params.push(`%${customer}%`);
  }

  if (date) {
    query += " AND date(created_at, 'localtime') = date(?)";
    params.push(date);
  } else if (startDate && endDate) {
    query += " AND date(created_at, 'localtime') BETWEEN date(?) AND date(?)";
    params.push(startDate, endDate);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const rows = await all(query, params);
    const parsedRows = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));

    res.status(200).json({
      success: true,
      data: parsedRows,
      count: parsedRows.length
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ success: false, message: 'Error fetching sales history', error: error.message });
  }
};

/**
 * Get real database statistics for dashboard.
 */
exports.getStats = async (req, res) => {
  try {
    // Today's Sales
    const todayRow = await get(
      `SELECT SUM(total_amount) as total FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime')`
    );
    const todaySales = todayRow?.total || 0;

    // Yesterday's Sales
    const yesterdayRow = await get(
      `SELECT SUM(total_amount) as total FROM sales WHERE date(created_at, 'localtime') = date('now', '-1 day', 'localtime')`
    );
    const yesterdaySales = yesterdayRow?.total || 0;

    // Monthly Sales
    const monthRow = await get(
      `SELECT SUM(total_amount) as total FROM sales WHERE strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')`
    );
    const monthlySales = monthRow?.total || 0;

    // Total Profit
    const profitRow = await get(
      `SELECT SUM(profit) as total FROM sales`
    );
    const totalProfit = profitRow?.total || 0;

    // Low stock count (Products <= 10)
    const lowStockRow = await get(
      `SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 10`
    );
    const lowStockCount = lowStockRow?.count || 0;

    // Total products count
    const totalProductsRow = await get(
      `SELECT COUNT(*) as count FROM products`
    );
    const totalProductsCount = totalProductsRow?.count || 0;

    // Low stock products list (to display alerts)
    const lowStockItems = await all(
      `SELECT * FROM products WHERE stock_quantity <= 10 ORDER BY stock_quantity ASC LIMIT 5`
    );

    // Recent activity list
    const recentSales = await all(
      `SELECT * FROM sales ORDER BY created_at DESC LIMIT 5`
    );
    const parsedRecentSales = recentSales.map(sale => ({
      id: sale.id,
      customer_name: sale.customer_name,
      total_amount: sale.total_amount,
      created_at: sale.created_at
    }));

    res.status(200).json({
      success: true,
      data: {
        todaySales,
        yesterdaySales,
        monthlySales,
        totalProfit,
        lowStockCount,
        totalProductsCount,
        lowStockItems,
        recentSales: parsedRecentSales
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error generating dashboard metrics', error: error.message });
  }
};

/**
 * Fetch report metrics (Daily sales, Monthly sales, overall Profit breakdown, and Low Stock inventory).
 */
exports.getReports = async (req, res) => {
  try {
    // Daily revenue and profit trend (past 30 days)
    const dailyReport = await all(
      `SELECT date(created_at, 'localtime') as date, 
              SUM(total_amount) as revenue, 
              SUM(profit) as profit, 
              COUNT(*) as orders 
       FROM sales 
       WHERE created_at >= date('now', '-30 days', 'localtime')
       GROUP BY date(created_at, 'localtime')
       ORDER BY date DESC`
    );

    // Monthly revenue and profit trend (past 12 months)
    const monthlyReport = await all(
      `SELECT strftime('%Y-%m', created_at, 'localtime') as month, 
              SUM(total_amount) as revenue, 
              SUM(profit) as profit, 
              COUNT(*) as orders 
       FROM sales 
       GROUP BY month 
       ORDER BY month DESC`
    );

    // Profit report overall calculations
    const profitSummary = await get(
      `SELECT SUM(total_amount) as total_revenue, 
              SUM(profit) as total_profit
       FROM sales`
    );

    const totalRevenue = profitSummary?.total_revenue || 0;
    const totalProfit = profitSummary?.total_profit || 0;
    const totalCost = totalRevenue - totalProfit;
    const margin = totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;

    // Low stock items report
    const lowStockReport = await all(
      `SELECT * FROM products WHERE stock_quantity <= 10 ORDER BY stock_quantity ASC`
    );

    res.status(200).json({
      success: true,
      data: {
        dailyReport,
        monthlyReport,
        profitReport: {
          total_revenue: totalRevenue,
          total_profit: totalProfit,
          total_cost: totalCost,
          margin
        },
        lowStockReport
      }
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ success: false, message: 'Error generating report analysis', error: error.message });
  }
};

/**
 * Generate and download a PDF invoice for a sale (Zero-dependency custom PDF writer).
 */
exports.downloadSalePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await get('SELECT * FROM sales WHERE id = ?', [id]);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale invoice not found' });
    }

    const items = JSON.parse(sale.items);
    const dateStr = new Date(sale.created_at).toLocaleString('en-IN');
    const customerName = sale.customer_name || 'Guest';
    const totalAmount = sale.total_amount.toFixed(2);

    // Build PDF content stream
    let streamContent = '';
    
    // Header Info
    streamContent += 'BT\n/F1 22 Tf\n50 780 Td\n(Venkateshwar Kiranam) Tj\nET\n';
    streamContent += 'BT\n/F1 10 Tf\n50 760 Td\n(Venkateshwar Nagar, Hyderabad, Telangana, 500098) Tj\nET\n';
    
    // Divider
    streamContent += '0.5 w\n50 745 m\n545 745 l\nS\n';
    
    // Metadata
    streamContent += `BT\n/F1 11 Tf\n50 720 Td\n(Bill ID: #${sale.id}) Tj\nET\n`;
    streamContent += `BT\n/F1 11 Tf\n50 700 Td\n(Customer Name: ${customerName}) Tj\nET\n`;
    streamContent += `BT\n/F1 11 Tf\n50 680 Td\n(Date: ${dateStr}) Tj\nET\n`;
    
    // Table Header
    streamContent += 'BT\n/F1 11 Tf\n50 640 Td\n(Product Name) Tj\n250 0 Td\n(Qty) Tj\n100 0 Td\n(Price) Tj\n80 0 Td\n(Total) Tj\nET\n';
    streamContent += '0.2 w\n50 630 m\n545 630 l\nS\n';
    
    // Table Items
    let y = 610;
    items.forEach(item => {
      const price = item.price !== undefined ? item.price : item.selling_price;
      const qty = item.quantity;
      const itemTotal = (price * qty).toFixed(2);
      
      // Clean names of parentheses for valid PDF syntax
      const cleanName = item.name.replace(/[()]/g, '');
      const cleanUnit = (item.unit || 'units').replace(/[()]/g, '');
      
      streamContent += `BT\n/F1 10 Tf\n50 ${y} Td\n(${cleanName}) Tj\n250 0 Td\n(${qty} ${cleanUnit}) Tj\n100 0 Td\n(Rs. ${price.toFixed(2)}) Tj\n80 0 Td\n(Rs. ${itemTotal}) Tj\nET\n`;
      y -= 20;
    });
    
    // Divider
    streamContent += `0.2 w\n50 ${y + 5} m\n545 ${y + 5} l\nS\n`;
    
    // Grand Total
    streamContent += `BT\n/F1 12 Tf\n400 ${y - 15} Td\n(Grand Total: Rs. ${totalAmount}) Tj\nET\n`;
    
    // Footer
    streamContent += 'BT\n/F1 10 Tf\n200 50 Td\n(Thank you for shopping with us! Please visit again.) Tj\nET\n';

    const streamLength = Buffer.byteLength(streamContent, 'utf8');
    
    // Assemble PDF structural components and compute cross-reference byte offsets
    const objects = [];
    let currentOffset = 0;
    
    const header = '%PDF-1.4\n';
    currentOffset += header.length;
    
    const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    objects.push({ id: 1, content: obj1, offset: currentOffset });
    currentOffset += obj1.length;
    
    const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    objects.push({ id: 2, content: obj2, offset: currentOffset });
    currentOffset += obj2.length;
    
    const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
    objects.push({ id: 3, content: obj3, offset: currentOffset });
    currentOffset += obj3.length;
    
    const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
    objects.push({ id: 4, content: obj4, offset: currentOffset });
    currentOffset += obj4.length;
    
    const obj5Header = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n`;
    const obj5Footer = '\nendstream\nendobj\n';
    const obj5Content = obj5Header + streamContent + obj5Footer;
    objects.push({ id: 5, content: obj5Content, offset: currentOffset });
    currentOffset += Buffer.byteLength(obj5Content, 'utf8');
    
    // Xref
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    objects.forEach(obj => {
      const paddedOffset = String(obj.offset).padStart(10, '0');
      xref += `${paddedOffset} 00000 n \n`;
    });
    
    const startxref = currentOffset;
    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
    
    const fullPdfParts = [];
    fullPdfParts.push(Buffer.from(header, 'utf8'));
    objects.forEach(obj => {
      fullPdfParts.push(Buffer.from(obj.content, 'utf8'));
    });
    fullPdfParts.push(Buffer.from(xref, 'utf8'));
    fullPdfParts.push(Buffer.from(trailer, 'utf8'));
    
    const finalBuffer = Buffer.concat(fullPdfParts);
    
    // Set headers and return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Bill_${id}_${customerName.replace(/\s+/g, '_')}.pdf"`);
    res.status(200).send(finalBuffer);
  } catch (error) {
    console.error('PDF generation endpoint failed:', error);
    res.status(500).json({ success: false, message: 'PDF invoice generation failed', error: error.message });
  }
};
