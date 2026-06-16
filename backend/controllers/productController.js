const db = require('../database');

// Convert units for price calculation
const convertToBaseUnit = (quantity, unit) => {
  const conversions = {
    g: 0.001, // grams to kg
    kg: 1,
    ml: 0.001, // ml to litre
    litre: 1,
    packet: 1,
    piece: 1
  };

  return quantity * (conversions[unit] || 1);
};

// Get all products
exports.getAllProducts = (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching products', error: err });
    }
    res.status(200).json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
};

// Get single product
exports.getProductById = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product', error: err });
    }
    if (!row) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      success: true,
      data: row
    });
  });
};

// Create new product
exports.createProduct = (req, res) => {
  const { name, category, unit, selling_price, purchase_price, stock_quantity } = req.body;

  // Validate input
  if (!name || !category || !unit || !selling_price || !purchase_price || stock_quantity === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `INSERT INTO products (name, category, unit, selling_price, purchase_price, stock_quantity) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(query, [name, category, unit, selling_price, purchase_price, stock_quantity], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Product name already exists' });
      }
      return res.status(500).json({ message: 'Error creating product', error: err });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: this.lastID,
        name,
        category,
        unit,
        selling_price,
        purchase_price,
        stock_quantity
      }
    });
  });
};

// Update product
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, category, unit, selling_price, purchase_price, stock_quantity } = req.body;

  let updates = [];
  let values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    values.push(category);
  }
  if (unit !== undefined) {
    updates.push('unit = ?');
    values.push(unit);
  }
  if (selling_price !== undefined) {
    updates.push('selling_price = ?');
    values.push(selling_price);
  }
  if (purchase_price !== undefined) {
    updates.push('purchase_price = ?');
    values.push(purchase_price);
  }
  if (stock_quantity !== undefined) {
    updates.push('stock_quantity = ?');
    values.push(stock_quantity);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, values, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Product name already exists' });
      }
      return res.status(500).json({ message: 'Error updating product', error: err });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully'
    });
  });
};

// Delete product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting product', error: err });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  });
};

// Smart Price Calculator
exports.calculatePrice = (req, res) => {
  const { productName, quantity, unit } = req.body;

  if (!productName || !quantity || !unit) {
    return res.status(400).json({ message: 'Missing required fields: productName, quantity, unit' });
  }

  db.get('SELECT * FROM products WHERE name = ?', [productName], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (!product) {
      return res.status(404).json({ message: `Product "${productName}" not found` });
    }

    // Check if units are compatible
    const compatibleUnits = {
      kg: ['kg', 'g'],
      g: ['kg', 'g'],
      litre: ['litre', 'ml'],
      ml: ['litre', 'ml'],
      packet: ['packet'],
      piece: ['piece']
    };

    if (!compatibleUnits[unit] || !compatibleUnits[unit].includes(product.unit)) {
      return res.status(400).json({
        message: `Incompatible unit. Product is in ${product.unit}, but ${unit} was provided`
      });
    }

    // Convert to base unit (kg or litre)
    const baseQuantity = convertToBaseUnit(quantity, unit);

    // Calculate total price based on selling price
    const totalPrice = parseFloat((baseQuantity * product.selling_price).toFixed(2));

    // Calculate stock available in requested unit
    const stockInRequestedUnit = product.unit === unit 
      ? product.stock_quantity 
      : product.stock_quantity / (convertToBaseUnit(1, product.unit));

    res.status(200).json({
      success: true,
      data: {
        product: product.name,
        quantity: `${quantity}${unit}`,
        baseQuantity: `${baseQuantity}${product.unit}`,
        unitPrice: product.selling_price,
        totalPrice: totalPrice,
        category: product.category,
        stockAvailable: `${stockInRequestedUnit}${unit}`
      }
    });
  });
};
