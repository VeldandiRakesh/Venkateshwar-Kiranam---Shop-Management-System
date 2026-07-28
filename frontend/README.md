# 🛒 Venkateshwar Kiranam - Shop Management System

A Full Stack Shop Management System developed to simplify the day-to-day operations of a Kirana (Grocery) store. The project was inspired by a real-world problem observed in my family's grocery shop, where managing products, inventory, billing, and sales manually was time-consuming and prone to errors.

The application provides an easy-to-use interface for managing products, generating bills, tracking inventory, viewing sales history, and generating PDF invoices.

---

## 📌 Project Overview

The primary objective of this project is to digitize the daily operations of a small grocery store by replacing manual record keeping with an efficient web-based management system.

This project demonstrates Full Stack Development skills using React.js, Node.js, Express.js, and SQLite.

---

## 🚀 Features

### Dashboard
- View shop statistics
- Total Products
- Total Sales
- Inventory Overview
- Recent Transactions

### Product Management
- Add Products
- Update Products
- Delete Products
- Search Products
- Product Categories
- Product Pricing

### Billing System
- Create Customer Bills
- Automatic Price Calculation
- Quantity-Based Billing
- Total Amount Calculation
- Save Bills

### Inventory Management
- Stock Management
- Update Available Quantity
- Low Stock Monitoring
- Inventory Tracking

### Sales History
- View Previous Bills
- Search Sales
- Sales Records
- Transaction Details

### Reports
- Sales Reports
- Product Reports
- Inventory Reports
- Business Statistics

### PDF Invoice
- Generate PDF Bills
- Download Invoice
- Printable Receipt

---

# 💻 Technologies Used

## Frontend

- React.js
- JavaScript (ES6+)
- Tailwind CSS
- React Router DOM
- Axios

## Backend

- Node.js
- Express.js

## Database

- SQLite

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- npm

---

# 🏗 Project Architecture

```
Frontend (React)
        │
        │ REST API
        ▼
Backend (Node.js + Express)
        │
        ▼
SQLite Database
```

---

# 📂 Project Structure

```
shop-management-system/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── database/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Venkateshwar-Kiranam-Shop-Management.git
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

Runs on

```
http://localhost:5000
```

---

# API Endpoints

## Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/products | Get all products |
| POST | /api/products | Add product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

---

## Billing

| Method | Endpoint |
|---------|----------|
| GET | /api/billing |
| POST | /api/billing |

---

## Inventory

| Method | Endpoint |
|---------|----------|
| GET | /api/inventory |
| PUT | /api/inventory/:id |

---

## Reports

| Method | Endpoint |
|---------|----------|
| GET | /api/reports |

---

# How the System Works

```
Shop Owner

      │

      ▼

Login / Dashboard

      │

      ▼

Manage Products

      │

      ▼

Inventory Updated

      │

      ▼

Create Bill

      │

      ▼

Bill Saved

      │

      ▼

Sales History Updated

      │

      ▼

Dashboard Statistics Updated

      │

      ▼

Generate PDF Invoice
```

---

# Real-Life Inspiration

This project was inspired by my family's Kirana (grocery) shop.

While helping in the shop, I noticed that product management, billing, and inventory tracking were handled manually. Calculating prices for different quantities, updating stock, and maintaining sales records consumed time and sometimes led to mistakes.

As I was learning Full Stack Development, I decided to build a web application to simplify these daily operations and gain practical experience by solving a real-world problem.

---

# Challenges Faced

- Connecting React frontend with Express backend
- Building REST APIs
- Managing SQLite database
- CRUD Operations
- State Management
- PDF Invoice Generation
- Inventory Synchronization
- Error Handling
- API Testing using Postman

---

# Future Enhancements

- Barcode Scanner
- QR Code Billing
- Customer Management
- Supplier Management
- Cloud Database
- Online Backup
- WhatsApp Invoice Sharing
- Mobile Responsive Improvements
- Role-Based Access Control

---

# Learning Outcomes

Through this project I learned

- React Component Architecture
- REST API Development
- Express.js
- Node.js
- SQLite Database
- CRUD Operations
- API Integration
- State Management
- Git & GitHub
- Debugging
- Full Stack Development Workflow

---

# Screenshots

### Dashboard

(Add Screenshot)

### Products

(Add Screenshot)

### Billing

(Add Screenshot)

### Reports

(Add Screenshot)

---

# Live Demo

Frontend

```
https://your-vercel-link.vercel.app
```

Backend

```
https://your-render-link.onrender.com
```

---

# GitHub Repository

```
https://github.com/yourusername/Venkateshwar-Kiranam-Shop-Management
```

---

# Author

**Rakesh Veldandi**

B.Tech Computer Science Engineering

Parul University

GitHub:
https://github.com/VeldandiRakesh

LinkedIn:
https://www.linkedin.com/in/rakeshveldandi

---

## ⭐ If you found this project helpful, consider giving it a Star!