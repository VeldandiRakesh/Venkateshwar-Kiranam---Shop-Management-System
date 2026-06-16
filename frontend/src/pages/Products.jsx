import { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { createProduct, updateProduct, deleteProduct } from '../services/api';

const Products = () => {
  const { products, setProducts, loading, error: contextError, fetchProducts, addToast } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Essentials',
    unit: 'kg',
    selling_price: '',
    purchase_price: '',
    stock_quantity: ''
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock) => {
    if (stock <= 10) return { text: 'Low Stock', color: 'bg-red-100 text-red-700' };
    if (stock <= 30) return { text: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Essentials',
      unit: 'kg',
      selling_price: '',
      purchase_price: '',
      stock_quantity: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      selling_price: product.selling_price,
      purchase_price: product.purchase_price,
      stock_quantity: product.stock_quantity
    });
    setEditingId(product.id);
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.selling_price || formData.stock_quantity === '') {
      setError('Please fill in all required fields');
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const productData = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        selling_price: parseFloat(formData.selling_price),
        purchase_price: parseFloat(formData.purchase_price),
        stock_quantity: parseFloat(formData.stock_quantity)
      };

      if (editingId) {
        // Update existing product
        await updateProduct(editingId, productData);
        addToast(`${formData.name} updated successfully!`, 'success');
      } else {
        // Create new product
        await createProduct(productData);
        addToast(`${formData.name} added successfully!`, 'success');
      }

      // Refresh products list to sync with backend
      await fetchProducts();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMsg = err.message || 'Failed to save product';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const product = products.find(p => p.id === id);
    if (!window.confirm(`Are you sure you want to delete ${product?.name}?`)) {
      return;
    }

    try {
      setError(null);
      await deleteProduct(id);
      addToast(`${product?.name} deleted successfully!`, 'success');
      // Refresh products list
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMsg = err.message || 'Failed to delete product';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory ({products.length} products)</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <span className="mr-2">➕</span>
          Add Product
        </button>
      </div>

      {/* Error Message */}
      {(error || contextError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error || contextError}</p>
          <button
            onClick={() => {
              setError(null);
            }}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : (
        /* Products Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{product.selling_price}/{product.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock_quantity} {product.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📦</span>
              <p className="text-gray-500">
                {searchTerm ? 'No products match your search' : 'No products found. Create your first product!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Essentials</option>
                  <option>Grains</option>
                  <option>Spices</option>
                  <option>Oils</option>
                  <option>Pulses</option>
                  <option>Snacks</option>
                  <option>Sweeteners</option>
                  <option>Beverages</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>kg</option>
                    <option>g</option>
                    <option>litre</option>
                    <option>ml</option>
                    <option>piece</option>
                    <option>packet</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ Saving...' : (editingId ? 'Update' : 'Add')} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
