# Shop Items Backend API

Complete backend for the Shop Items management system with Express.js and SQLite.

## Features

✅ SQLite database with products table  
✅ RESTful API for CRUD operations  
✅ Smart price calculator (unit conversions)  
✅ JWT authentication middleware  
✅ CORS enabled for frontend integration  
✅ Environment variables configuration  

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Or for production:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-06-14T10:30:00.000Z"
}
```

---

## Products API

### Get All Products
```
GET /api/products
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sugar",
      "category": "Essentials",
      "unit": "kg",
      "selling_price": 40,
      "purchase_price": 35,
      "stock_quantity": 100,
      "created_at": "2024-06-14T10:00:00.000Z",
      "updated_at": "2024-06-14T10:00:00.000Z"
    }
  ],
  "count": 5
}
```

---

### Get Single Product
```
GET /api/products/:id
```
**Example:** `GET /api/products/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sugar",
    "category": "Essentials",
    "unit": "kg",
    "selling_price": 40,
    "purchase_price": 35,
    "stock_quantity": 100,
    "created_at": "2024-06-14T10:00:00.000Z",
    "updated_at": "2024-06-14T10:00:00.000Z"
  }
}
```

---

### Create Product
```
POST /api/products
```
**Request Body:**
```json
{
  "name": "Tea",
  "category": "Beverages",
  "unit": "kg",
  "selling_price": 250,
  "purchase_price": 200,
  "stock_quantity": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 6,
    "name": "Tea",
    "category": "Beverages",
    "unit": "kg",
    "selling_price": 250,
    "purchase_price": 200,
    "stock_quantity": 50
  }
}
```

---

### Update Product
```
PUT /api/products/:id
```
**Example:** `PUT /api/products/1`

**Request Body (all fields optional):**
```json
{
  "selling_price": 45,
  "stock_quantity": 120
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

### Delete Product
```
DELETE /api/products/:id
```
**Example:** `DELETE /api/products/1`

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Smart Price Calculator 🧮

### Calculate Price with Unit Conversion
```
POST /api/products/calculate
```

This endpoint calculates the total price for any quantity and unit, automatically converting between compatible units.

**Supported Unit Conversions:**
- `kg` ↔ `g` (1 kg = 1000 g)
- `litre` ↔ `ml` (1 litre = 1000 ml)
- `packet` (no conversion)
- `piece` (no conversion)

### Example 1: Calculate Sugar Price
**Request:**
```json
{
  "productName": "Sugar",
  "quantity": 250,
  "unit": "g"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": "Sugar",
    "quantity": "250g",
    "baseQuantity": "0.25kg",
    "unitPrice": 40,
    "totalPrice": 10,
    "category": "Essentials",
    "stockAvailable": "100g"
  }
}
```

### Example 2: Calculate Sunflower Oil Price
**Request:**
```json
{
  "productName": "Sunflower Oil",
  "quantity": 500,
  "unit": "ml"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": "Sunflower Oil",
    "quantity": "500ml",
    "baseQuantity": "0.5litre",
    "unitPrice": 180,
    "totalPrice": 90,
    "category": "Oils",
    "stockAvailable": "50litre"
  }
}
```

### Example 3: Calculate Parle-G Price
**Request:**
```json
{
  "productName": "Parle-G",
  "quantity": 10,
  "unit": "packet"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": "Parle-G",
    "quantity": "10packet",
    "baseQuantity": "10packet",
    "unitPrice": 10,
    "totalPrice": 100,
    "category": "Snacks",
    "stockAvailable": "500packet"
  }
}
```

---

## Authentication API

### Login
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

---

## Sample Products (Pre-loaded)

| Name | Category | Unit | Price | Stock |
|------|----------|------|-------|-------|
| Sugar | Essentials | kg | ₹40 | 100 |
| Salt | Essentials | kg | ₹20 | 150 |
| Rice | Essentials | kg | ₹55 | 200 |
| Parle-G | Snacks | packet | ₹10 | 500 |
| Sunflower Oil | Oils | litre | ₹180 | 50 |

---

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  selling_price REAL NOT NULL,
  purchase_price REAL NOT NULL,
  stock_quantity REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## Environment Variables (.env)

```
PORT=5000
DB_PATH=./shop.db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

---

## Project Structure

```
backend/
├── server.js                    # Main Express server
├── database.js                  # SQLite initialization & setup
├── .env                        # Environment variables
├── package.json                # Dependencies & scripts
├── shop.db                     # SQLite database
├── controllers/
│   ├── productController.js    # Product business logic
│   └── authController.js       # Auth business logic
├── middleware/
│   └── auth.js                 # JWT authentication middleware
├── routes/
│   ├── products.js             # Product API routes
│   └── auth.js                 # Auth routes
└── node_modules/               # Dependencies
```

---

## Running Commands

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Check if server is running
curl http://localhost:5000/health
```

---

## Error Handling

All API errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Testing the API with cURL

```bash
# Get all products
curl http://localhost:5000/api/products

# Create a new product
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

# Calculate price
curl -X POST http://localhost:5000/api/products/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Sugar",
    "quantity": 500,
    "unit": "g"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## Next Steps

1. **Frontend Integration**: Connect your React frontend to these API endpoints
2. **User Authentication**: Implement user registration and database storage
3. **Billing API**: Create endpoints for sales/billing
4. **Reports API**: Add analytics and reporting endpoints
5. **Testing**: Add unit and integration tests
6. **Validation**: Implement comprehensive input validation
7. **Rate Limiting**: Add rate limiting for production

---

## License

ISC
