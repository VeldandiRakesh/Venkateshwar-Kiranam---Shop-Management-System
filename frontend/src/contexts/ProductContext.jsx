import { createContext, useContext, useState, useEffect } from 'react';
import { getProducts } from '../services/api';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      addToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add toast notification
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = {
    products,
    setProducts,
    loading,
    error,
    fetchProducts,
    addToast,
    removeToast,
    toasts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};
