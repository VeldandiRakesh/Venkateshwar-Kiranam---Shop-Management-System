import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
API.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============ PRODUCT ENDPOINTS ============

/**
 * Get all products
 * @returns {Promise} Array of products
 */
export const getProducts = async () => {
  try {
    const response = await API.get('/products');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching products' };
  }
};

/**
 * Get single product by ID
 * @param {number} id - Product ID
 * @returns {Promise} Product data
 */
export const getProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching product' };
  }
};

/**
 * Create new product
 * @param {Object} productData - Product details (name, category, unit, selling_price, purchase_price, stock_quantity)
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
  try {
    const response = await API.post('/products', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating product' };
  }
};

/**
 * Update product
 * @param {number} id - Product ID
 * @param {Object} productData - Fields to update
 * @returns {Promise} Updated product
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating product' };
  }
};

/**
 * Delete product
 * @param {number} id - Product ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting product' };
  }
};

// ============ SMART PRICE CALCULATOR ============

/**
 * Calculate product price with unit conversion
 * @param {string} productName - Name of the product
 * @param {number} quantity - Quantity of the product
 * @param {string} unit - Unit (kg, g, litre, ml, packet, piece)
 * @returns {Promise} Calculation result with total price
 */
export const calculatePrice = async (productName, quantity, unit) => {
  try {
    const response = await API.post('/products/calculate', {
      productName,
      quantity,
      unit,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error calculating price' };
  }
};

// ============ AUTH ENDPOINTS ============

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} JWT token and user data
 */
export const login = async (username, password) => {
  try {
    const response = await API.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error logging in' };
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Get current user
 * @returns {Promise} User data
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  return token ? { authenticated: true } : { authenticated: false };
};

// ============ SALES ENDPOINTS ============

/**
 * Get sales history
 * @param {Object} filters - customer, date, startDate, endDate
 * @returns {Promise} List of sales
 */
export const getSales = async (filters = {}) => {
  try {
    const response = await API.get('/sales', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching sales history' };
  }
};

/**
 * Create a new sale
 * @param {Object} saleData - customer_name, items, subtotal, tax, total_amount
 * @returns {Promise} Confirmation details
 */
export const createSale = async (saleData) => {
  try {
    const response = await API.post('/sales', saleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error recording sale' };
  }
};

/**
 * Get sales statistics for dashboard
 * @returns {Promise} Statistics
 */
export const getSalesStats = async () => {
  try {
    const response = await API.get('/sales/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching sales statistics' };
  }
};

/**
 * Get sales report statistics
 * @returns {Promise} Report summaries
 */
export const getSalesReports = async () => {
  try {
    const response = await API.get('/sales/reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching reports' };
  }
};

export default API;
