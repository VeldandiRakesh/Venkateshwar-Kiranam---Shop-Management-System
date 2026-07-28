const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'shop.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✓ Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create owner table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS owner (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      profile_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error('Error creating owner table:', err);
      } else {
        console.log('✓ Owner table ready');
        // Check if we need to add updated_at column
        addUpdatedAtColumn();
      }
    }
  );

  // Create products table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      selling_price REAL NOT NULL,
      purchase_price REAL NOT NULL,
      stock_quantity REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error('Error creating products table:', err);
      } else {
        console.log('✓ Products table ready');
        insertSampleProducts();
      }
    }
  );

  // Create sales table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total_amount REAL NOT NULL,
      profit REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error('Error creating sales table:', err);
      } else {
        console.log('✓ Sales table ready');
        insertSampleSales();
      }
    }
  );
}

function insertSampleProducts() {
  const sampleProducts = [
    {
      name: 'Sugar',
      category: 'Essentials',
      unit: 'kg',
      selling_price: 40,
      purchase_price: 35,
      stock_quantity: 100
    },
    {
      name: 'Salt',
      category: 'Essentials',
      unit: 'kg',
      selling_price: 20,
      purchase_price: 15,
      stock_quantity: 150
    },
    {
      name: 'Rice',
      category: 'Essentials',
      unit: 'kg',
      selling_price: 55,
      purchase_price: 45,
      stock_quantity: 200
    },
    {
      name: 'Parle-G',
      category: 'Snacks',
      unit: 'packet',
      selling_price: 10,
      purchase_price: 8,
      stock_quantity: 500
    },
    {
      name: 'Sunflower Oil',
      category: 'Oils',
      unit: 'litre',
      selling_price: 180,
      purchase_price: 150,
      stock_quantity: 50
    }
  ];

  // Check if products already exist
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (!err && row.count === 0) {
      // Insert sample products
      const stmt = db.prepare(
        `INSERT INTO products (name, category, unit, selling_price, purchase_price, stock_quantity) 
         VALUES (?, ?, ?, ?, ?, ?)`
      );

      sampleProducts.forEach((product) => {
        stmt.run(
          product.name,
          product.category,
          product.unit,
          product.selling_price,
          product.purchase_price,
          product.stock_quantity,
          (err) => {
            if (!err) {
              console.log(`✓ Inserted: ${product.name}`);
            }
          }
        );
      });

      stmt.finalize();
    }
  });
}

function insertSampleSales() {
  db.get('SELECT COUNT(*) as count FROM sales', (err, row) => {
    if (!err && row.count === 0) {
      const sampleSales = [
        {
          customer_name: 'Ramesh Kumar',
          items: JSON.stringify([
            { id: 3, name: 'Rice', selling_price: 55, purchase_price: 45, quantity: 10, unit: 'kg', subtotal: 550 },
            { id: 1, name: 'Sugar', selling_price: 40, purchase_price: 35, quantity: 5, unit: 'kg', subtotal: 200 }
          ]),
          subtotal: 750.0,
          tax: 135.0, // 18% GST (CGST 67.50 + SGST 67.50)
          total_amount: 885.0,
          profit: 125.0, // (55-45)*10 + (40-35)*5 = 100 + 25 = 125
          created_at: new Date().toISOString() // Today
        },
        {
          customer_name: 'Sita Devi',
          items: JSON.stringify([
            { id: 4, name: 'Parle-G', selling_price: 10, purchase_price: 8, quantity: 20, unit: 'packet', subtotal: 200 }
          ]),
          subtotal: 200.0,
          tax: 36.0,
          total_amount: 236.0,
          profit: 40.0, // (10-8)*20 = 40
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
        },
        {
          customer_name: 'Guest',
          items: JSON.stringify([
            { id: 5, name: 'Sunflower Oil', selling_price: 180, purchase_price: 150, quantity: 2, unit: 'litre', subtotal: 360 }
          ]),
          subtotal: 360.0,
          tax: 64.8,
          total_amount: 424.8,
          profit: 60.0, // (180-150)*2 = 60
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        }
      ];

      const stmt = db.prepare(
        `INSERT INTO sales (customer_name, items, subtotal, tax, total_amount, profit, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      sampleSales.forEach((sale) => {
        stmt.run(
          sale.customer_name,
          sale.items,
          sale.subtotal,
          sale.tax,
          sale.total_amount,
          sale.profit,
          sale.created_at,
          (err) => {
            if (err) {
              console.error('Error inserting sample sale:', err);
            } else {
              console.log(`✓ Inserted sample sale for ${sale.customer_name}`);
            }
          }
        );
      });

      stmt.finalize();
    }
  });
}

// Migration function to add updated_at column
function addUpdatedAtColumn() {
  db.all("PRAGMA table_info(owner)", (err, columns) => {
    if (err) {
      console.error('Error checking owner table schema:', err);
      return;
    }

    const hasUpdatedAt = columns.some(col => col.name === 'updated_at');

    if (!hasUpdatedAt) {
      console.log('Adding updated_at column to owner table...');
      db.run('ALTER TABLE owner ADD COLUMN updated_at DATETIME', (err) => {
        if (err) {
          console.error('Error adding updated_at column:', err);
        } else {
          console.log('✓ updated_at column added successfully');
          // Update existing rows to set updated_at to created_at
          db.run('UPDATE owner SET updated_at = created_at WHERE updated_at IS NULL', (err) => {
            if (err) {
              console.error('Error updating existing rows:', err);
            } else {
              console.log('✓ Existing rows updated with updated_at');
            }
            seedDefaultOwner();
          });
        }
      });
    } else {
      seedDefaultOwner();
    }
  });
}

// Seed or update owner with default settings
function seedDefaultOwner() {
  db.get('SELECT * FROM owner LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error checking owner:', err);
      return;
    }
    const defaultOwner = {
      full_name: 'Rakesh Veldandi',
      shop_name: 'Venkateshwar Kiranam',
      email: 'rakeshveldandi9390@gmail.com',
      phone: row ? row.phone : '9876543210',
      password_hash: 'no-auth'
    };
    if (!row) {
      db.run(
        `INSERT INTO owner (full_name, shop_name, email, phone, password_hash)
         VALUES (?, ?, ?, ?, ?)`,
        [defaultOwner.full_name, defaultOwner.shop_name, defaultOwner.email, defaultOwner.phone, defaultOwner.password_hash],
        (err) => {
          if (err) console.error('Error seeding default owner:', err);
          else console.log('✓ Seeding default owner');
        }
      );
    } else if (row.full_name !== 'Rakesh Veldandi' || row.email !== 'rakeshveldandi9390@gmail.com') {
      db.run(
        `UPDATE owner 
         SET full_name = ?, shop_name = ?, email = ?
         WHERE id = ?`,
        [defaultOwner.full_name, defaultOwner.shop_name, defaultOwner.email, row.id],
        (err) => {
          if (err) console.error('Error updating existing owner details:', err);
          else console.log('✓ Updated existing owner to default Rakesh Veldandi details');
        }
      );
    }
  });
}

module.exports = db;
