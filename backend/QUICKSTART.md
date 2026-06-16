# 🚀 Quick Start Guide

## Start the Backend Server

### Option 1: Development Mode (with auto-reload)
```bash
npm run dev
```

### Option 2: Production Mode
```bash
npm start
```

## ✅ What's Included

### Files Created:
✓ **server.js** - Main Express server
✓ **database.js** - SQLite database initialization
✓ **controllers/productController.js** - Product business logic
✓ **controllers/authController.js** - Auth logic
✓ **middleware/auth.js** - JWT authentication middleware
✓ **routes/products.js** - Product API endpoints
✓ **routes/auth.js** - Authentication endpoints
✓ **.env** - Environment configuration
✓ **shop.db** - SQLite database (auto-created on first run)
✓ **.gitignore** - Git ignore rules

### Database:
✓ **Products Table** with 5 sample products:
  - Sugar (₹40/kg)
  - Salt (₹20/kg)
  - Rice (₹55/kg)
  - Parle-G (₹10/packet)
  - Sunflower Oil (₹180/litre)

### APIs Implemented:
✓ **CRUD Operations** - GET, POST, PUT, DELETE products
✓ **Smart Price Calculator** - Unit conversion (kg↔g, litre↔ml)
✓ **Authentication** - Login endpoint with JWT tokens

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/calculate` | Calculate price with unit conversion |
| POST | `/api/auth/login` | Login (admin/admin123) |
| GET | `/health` | Health check |

---

## 📝 Example API Calls

### Get All Products
```bash
curl http://localhost:5000/api/products
```

### Calculate Price (250g of Sugar)
```bash
curl -X POST http://localhost:5000/api/products/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Sugar",
    "quantity": 250,
    "unit": "g"
  }'
```

### Create New Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee",
    "category": "Beverages",
    "unit": "kg",
    "selling_price": 400,
    "purchase_price": 350,
    "stock_quantity": 30
  }'
```

---

## 🛠️ Scripts in package.json

```json
{
  "scripts": {
    "start": "node server.js",      // Production
    "dev": "nodemon server.js"      // Development with auto-reload
  }
}
```

---

## 📂 Project Structure

```
backend/
├── server.js                    ← Main server file
├── database.js                  ← SQLite setup
├── shop.db                      ← Database file (auto-created)
├── .env                        ← Configuration
├── package.json                ← Dependencies & scripts
├── README.md                   ← Full API documentation
├── controllers/
│   ├── productController.js    ← Product logic
│   └── authController.js       ← Auth logic
├── middleware/
│   └── auth.js                 ← JWT middleware
└── routes/
    ├── products.js             ← Product routes
    └── auth.js                 ← Auth routes
```

---

## 🔑 Key Features

✨ **Smart Price Calculator**
- Automatically converts between units (kg ↔ g, litre ↔ ml)
- Calculates total price based on quantity and product
- Shows available stock in requested unit

💾 **SQLite Database**
- 5 pre-loaded sample products
- Unique product names
- Timestamps for created_at and updated_at

🔐 **Authentication Ready**
- JWT token generation
- Auth middleware available
- Test credentials: admin/admin123

🌐 **CORS Enabled**
- Ready for frontend integration
- Accepts requests from any origin

---

## ⚡ Server will output on startup:

```
╔════════════════════════════════════════╗
║    🛒 Shop Items Backend Server 🛒    ║
╠════════════════════════════════════════╣
║  ✓ Server running on port 5000         ║
║  ✓ Database: shop.db                   ║
║  ✓ API: http://localhost:5000/api      ║
║  ✓ Health: http://localhost:5000/health║
╚════════════════════════════════════════╝
```

---

## 🧪 Test the Server

Once running, visit:
- **Health Check**: http://localhost:5000/health
- **All Products**: http://localhost:5000/api/products
- **API Root**: http://localhost:5000/

---

## 📖 For detailed API documentation, see README.md

All endpoints, request/response formats, error handling, and more detailed examples are in README.md
