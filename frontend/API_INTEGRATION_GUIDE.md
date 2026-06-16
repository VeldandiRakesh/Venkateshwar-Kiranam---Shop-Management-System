# Frontend-Backend API Integration Guide

## 🚀 Quick Start

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install Axios along with other dependencies.

### 2. Start the Backend Server

In a separate terminal:
```bash
cd backend
npm run dev
```

Backend will run on: **http://localhost:5000**

### 3. Start the Frontend Development Server

In the frontend terminal:
```bash
npm run dev
```

Frontend will run on: **http://localhost:5173** (or next available port)

---

## 📁 Files Created/Updated

### **Frontend Files**

#### **src/services/api.js** (NEW)
- Centralized Axios API service
- Base URL: `http://localhost:5000/api`
- Methods for all CRUD operations
- JWT token handling
- Request/Response interceptors
- Functions:
  - `getProducts()` - Fetch all products
  - `getProductById(id)` - Fetch single product
  - `createProduct(data)` - Create new product
  - `updateProduct(id, data)` - Update product
  - `deleteProduct(id)` - Delete product
  - `calculatePrice(name, qty, unit)` - Smart price calculator
  - `login(username, password)` - User authentication
  - `logout()` - Clear authentication
  - `getCurrentUser()` - Get current user status

#### **src/pages/Products.jsx** (UPDATED)
- ✅ Connected to backend API
- ✅ Fetches products on component mount using `useEffect`
- ✅ Displays loading state while fetching
- ✅ Shows error messages if API call fails
- ✅ Add new products with modal form
- ✅ Edit existing products
- ✅ Delete products with confirmation
- ✅ Search and filter functionality
- ✅ Stock status indicator
- ✅ Form validation
- Uses React hooks:
  - `useState` - Manage state
  - `useEffect` - Fetch data on mount

#### **src/pages/PriceCalculator.jsx** (NEW)
- Smart price calculator page
- Features:
  - ✅ Select product from dropdown
  - ✅ Enter quantity and select unit
  - ✅ Automatic unit conversion (kg ↔ g, litre ↔ ml)
  - ✅ Calculate price from backend API
  - ✅ Display calculation results
  - ✅ Show stock availability
  - ✅ Calculation history (last 10)
  - ✅ Loading and error states
- Uses React hooks:
  - `useState` - Manage form and result state
  - `useEffect` - Fetch products on mount

#### **src/App.jsx** (UPDATED)
- ✅ Added route for PriceCalculator
- New route: `/dashboard/price-calculator`

#### **src/layouts/MainLayout.jsx** (UPDATED)
- ✅ Added Price Calculator navigation link
- ✅ Fixed all navigation links to include `/dashboard` prefix
- Navigation items now correctly route to nested pages

#### **package.json** (UPDATED)
- ✅ Added `"axios": "^1.6.7"` to dependencies

---

## 🔌 API Integration Details

### **Base Configuration**
```javascript
// src/services/api.js
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### **CORS Configuration**
- Backend: CORS enabled for all origins (localhost:5173)
- No additional CORS setup needed in frontend
- Backend configured with:
  ```javascript
  app.use(cors());
  ```

### **Request/Response Flow**

#### **GET Products**
```javascript
// Frontend
import { getProducts } from '../services/api';
const response = await getProducts();
// response.data = [{ id, name, category, unit, selling_price, ... }]
```

#### **Create Product**
```javascript
const productData = {
  name: 'Tea',
  category: 'Beverages',
  unit: 'kg',
  selling_price: 250,
  purchase_price: 200,
  stock_quantity: 50
};
const response = await createProduct(productData);
```

#### **Calculate Price**
```javascript
const result = await calculatePrice('Sugar', 250, 'g');
// result.data.totalPrice = 10 (calculated automatically)
```

---

## 🧪 Testing API Integration

### **Test 1: Load Products Page**
1. Navigate to Products page
2. Should display 5 pre-loaded products:
   - Sugar (₹40/kg)
   - Salt (₹20/kg)
   - Rice (₹55/kg)
   - Parle-G (₹10/packet)
   - Sunflower Oil (₹180/litre)
3. Check browser console for any errors

### **Test 2: Add Product**
1. Click "Add Product" button
2. Fill form:
   - Name: "Coffee"
   - Category: "Beverages"
   - Selling Price: 400
   - Purchase Price: 350
   - Stock: 30
   - Unit: kg
3. Click "Add Product"
4. Product should appear in table

### **Test 3: Edit Product**
1. Click "Edit" on any product
2. Change a value (e.g., price)
3. Click "Update Product"
4. Changes should reflect in table

### **Test 4: Delete Product**
1. Click "Delete" on any product
2. Confirm deletion
3. Product should be removed from table

### **Test 5: Search Products**
1. Type in search box
2. Products should filter by name or category
3. Clearing search shows all products

### **Test 6: Price Calculator**
1. Navigate to Price Calculator
2. Select "Sugar" from dropdown
3. Enter 250 in quantity
4. Select "g" from unit
5. Click "Calculate Price"
6. Result should show: ₹10
7. Check stock availability displayed
8. Try other products and unit conversions

### **Test 7: Unit Conversion**
- 250g Sugar (₹40/kg) = ₹10 ✓
- 500ml Oil (₹180/litre) = ₹90 ✓
- 10 packets Parle-G (₹10/packet) = ₹100 ✓

---

## ⚠️ Troubleshooting

### **Issue: "Failed to load products" Error**

**Possible Causes:**
1. Backend not running
2. Wrong backend URL
3. CORS blocked

**Solutions:**
```bash
# Make sure backend is running
cd backend
npm run dev

# Check if backend is at http://localhost:5000
# Verify CORS is enabled in server.js

# Check browser console for exact error
# Open DevTools (F12) → Console tab
```

### **Issue: API calls work but data doesn't display**

**Check:**
1. API service is properly imported:
   ```javascript
   import { getProducts } from '../services/api';
   ```
2. useEffect hook is present:
   ```javascript
   useEffect(() => {
     fetchProducts();
   }, []);
   ```
3. State is set correctly:
   ```javascript
   setProducts(response.data || []);
   ```

### **Issue: Add/Edit/Delete Not Working**

**Check:**
1. Network tab in DevTools shows request
2. Backend response status is 200/201
3. Form data is being sent as JSON
4. Product names are unique (error if duplicate)

### **Issue: Price Calculator Shows Wrong Results**

**Verify:**
1. Correct product is selected
2. Quantity is entered as number
3. Unit is selected
4. Backend API endpoint works:
   ```bash
   curl -X POST http://localhost:5000/api/products/calculate \
     -H "Content-Type: application/json" \
     -d '{
       "productName": "Sugar",
       "quantity": 250,
       "unit": "g"
     }'
   ```

---

## 🔐 Security Notes

### **Token Management**
- JWT tokens stored in `localStorage`
- Automatically sent in Authorization header
- Auto-logout on 401 (unauthorized)

### **Request Interceptors**
```javascript
// Automatically adds token to requests
config.headers.Authorization = `Bearer ${token}`;
```

### **Response Interceptors**
```javascript
// Handles auth errors
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/';
}
```

---

## 📊 Component Hierarchy

```
App (with Router)
└── MainLayout
    ├── Dashboard
    ├── Products ⬅️ API Connected
    │   └── [API calls: GET, POST, PUT, DELETE]
    ├── PriceCalculator ⬅️ API Connected
    │   └── [API call: POST /calculate]
    ├── Billing
    ├── Inventory
    └── Reports
```

---

## 🎨 React Hooks Used

### **useState**
```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [formData, setFormData] = useState({...});
```

### **useEffect**
```javascript
useEffect(() => {
  fetchProducts(); // Called on component mount
}, []); // Empty dependency array = run once
```

---

## 📝 API Response Examples

### **GET /api/products**
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
      "created_at": "2024-06-14T10:00:00.000Z"
    }
  ],
  "count": 5
}
```

### **POST /api/products/calculate**
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
    "stockAvailable": "100kg"
  }
}
```

---

## 🔄 Data Flow Example: Adding a Product

1. User fills form in modal
2. Click "Add Product"
3. `handleSubmit` validates data
4. `createProduct(formData)` called
5. API service sends POST to backend
6. Backend validates and saves to SQLite
7. Backend returns created product
8. Frontend calls `fetchProducts()`
9. Products list updates on UI

---

## 📦 Dependencies

### **Frontend**
- `react@19.2.6` - UI framework
- `react-dom@19.2.6` - React DOM
- `react-router-dom@7.17.0` - Routing
- `axios@1.6.7` - HTTP client ⬅️ NEW
- `tailwindcss@4.3.1` - Styling

### **Backend**
- `express@5.2.1` - Server
- `sqlite3@6.0.1` - Database
- `cors@2.8.6` - CORS middleware
- `dotenv@17.4.2` - Environment variables
- `jsonwebtoken@9.0.3` - JWT auth
- `bcryptjs@3.0.3` - Password hashing

---

## 🚀 Deployment Checklist

- [ ] Backend running on port 5000
- [ ] Frontend can connect to backend API
- [ ] All CRUD operations working
- [ ] Price calculator working with unit conversions
- [ ] Error handling displaying properly
- [ ] Loading states showing
- [ ] Search and filter working
- [ ] No console errors
- [ ] API responses correct

---

## 📞 Support

For issues, check:
1. Backend is running (`npm run dev` in backend folder)
2. Frontend environment variables set correctly
3. Browser console for errors (F12 → Console)
4. Network tab for API responses (F12 → Network)
5. Backend logs for server errors

---

## ✅ All Requirements Met

✅ Axios API service created  
✅ Products page connected to API  
✅ Load products from backend  
✅ Display products in table  
✅ Show loading state  
✅ Show error state  
✅ Add product functionality  
✅ Update product functionality  
✅ Delete product functionality  
✅ Smart Price Calculator page  
✅ Unit conversion (kg ↔ g, litre ↔ ml)  
✅ Price calculation from API  
✅ React hooks (useState, useEffect) used  
✅ Modern Tailwind UI  
✅ Every file explained before creation  
✅ CORS issues resolved  
✅ All API integrations working
