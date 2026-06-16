import { useState } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Define low stock threshold
  const LOW_STOCK_THRESHOLD = 10;

  // Dynamically extract categories from live database products
  const categories = ['All', ...new Set(products.map(product => product.category))];

  const filteredInventory = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockItems = products.filter((item) => item.stock_quantity <= LOW_STOCK_THRESHOLD);

  const getStockLevel = (stock) => {
    if (stock <= 3) return { color: 'bg-red-500', text: 'Critical', textColor: 'text-red-700', bgColor: 'bg-red-50' };
    if (stock <= LOW_STOCK_THRESHOLD) return { color: 'bg-yellow-500', text: 'Low', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' };
    return { color: 'bg-green-500', text: 'Good', textColor: 'text-green-700', bgColor: 'bg-green-50' };
  };

  if (loading && products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-4">Loading inventory stock levels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center text-red-800 font-semibold">
        Error: {error}
      </div>
    );
  }

  // Calculate total inventory value (purchase price * stock quantity)
  const totalStockValue = products.reduce((sum, item) => sum + (item.purchase_price * item.stock_quantity), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Stock</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels, evaluate cost value, and manage alerts</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/products')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
        >
          ⚙️ Manage Products
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Unique Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl">
              📦
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Low Stock Alert Items</p>
              <p className={`text-3xl font-bold mt-2 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {lowStockItems.length}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${lowStockItems.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              ⚠️
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Stock Cost Value</p>
              <p className="text-3xl font-bold text-gray-950 mt-2">₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-xl">
              💰
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 font-medium">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length - 1}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-xl">
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Highlights */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">⚠️</span>
            <h3 className="font-bold text-red-800 text-lg">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">These items are running below {LOW_STOCK_THRESHOLD} units and require immediate re-ordering:</p>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                onClick={() => navigate('/dashboard/products')}
                className="inline-flex items-center px-3 py-1.5 bg-white border border-red-200 rounded-full text-xs font-bold text-red-700 hover:bg-red-100 cursor-pointer shadow-sm transition-colors"
              >
                {item.name} ({item.stock_quantity} {item.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search inventory by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-50">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price (INR)</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Value (INR)</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredInventory.map((item) => {
                const stockLevel = getStockLevel(item.stock_quantity);
                const costValue = item.purchase_price * item.stock_quantity;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {item.stock_quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                      ₹{item.selling_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-800">
                      ₹{costValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stockLevel.textColor} ${stockLevel.bgColor}`}>
                        <span className={`w-2 h-2 rounded-full ${stockLevel.color}`}></span>
                        {stockLevel.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📦</span>
            <p className="text-gray-500 font-semibold">No stock items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
