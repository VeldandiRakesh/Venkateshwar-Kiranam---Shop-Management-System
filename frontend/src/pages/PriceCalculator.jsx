import { useState, useEffect } from 'react';
import { getProducts, calculatePrice } from '../services/api';

const PriceCalculator = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Result state
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductError(null);
      const response = await getProducts();
      setProducts(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedProduct(response.data[0].name);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductError('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !quantity) {
      setError('Please select a product and enter quantity');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await calculatePrice(selectedProduct, parseFloat(quantity), unit);
      setResult(response.data);

      // Add to history
      const historyItem = {
        id: Date.now(),
        product: response.data.product,
        quantity: response.data.quantity,
        totalPrice: response.data.totalPrice,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory([historyItem, ...history.slice(0, 9)]);
    } catch (err) {
      console.error('Error calculating price:', err);
      setError(err.message || 'Failed to calculate price');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedProduct(products.length > 0 ? products[0].name : '');
    setQuantity('');
    setUnit('kg');
    setResult(null);
    setError(null);
  };

  const selectedProductData = products.find(p => p.name === selectedProduct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Smart Price Calculator</h1>
        <p className="text-gray-600 mt-1">Calculate product prices with automatic unit conversion</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Calculate Price</h2>

            {productError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">❌ {productError}</p>
              </div>
            )}

            {loadingProducts ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">⏳</div>
                <p className="text-gray-600 mt-4">Loading products...</p>
              </div>
            ) : (
              <form onSubmit={handleCalculate} className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name} (₹{product.selling_price}/{product.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Details */}
                {selectedProductData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Unit Price</p>
                        <p className="text-lg font-bold text-blue-700">₹{selectedProductData.selling_price}/{selectedProductData.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Stock Available</p>
                        <p className="text-lg font-bold text-blue-700">{selectedProductData.stock_quantity} {selectedProductData.unit}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="g">g (grams)</option>
                      <option value="kg">kg (kilograms)</option>
                      <option value="ml">ml (millilitres)</option>
                      <option value="litre">litre (litres)</option>
                      <option value="piece">piece</option>
                      <option value="packet">packet</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">💡 Select compatible unit for automatic conversion</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">❌ {error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Calculating...' : '🧮 Calculate Price'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Result Card */}
        <div className="lg:col-span-1">
          {result ? (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-green-800 mb-4">💰 Calculation Result</h3>

              <div className="space-y-4 bg-white rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-600">Product</p>
                  <p className="text-sm font-semibold text-gray-800">{result.product}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Requested Quantity</p>
                  <p className="text-sm font-semibold text-gray-800">{result.quantity}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Base Quantity (Standard Unit)</p>
                  <p className="text-xs text-gray-600">{result.baseQuantity}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Unit Price</p>
                  <p className="text-sm font-semibold text-gray-800">₹{result.unitPrice}/{selectedProductData?.unit}</p>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs text-gray-600 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-green-600">₹{result.totalPrice}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-800">
                    ℹ️ Stock available: <span className="font-semibold">{result.stockAvailable}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Result</h3>
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-4xl mb-4">🔍</span>
                <p className="text-gray-500 text-center">
                  Enter quantity and click <span className="font-medium">"Calculate Price"</span> to see results here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Recent Calculations</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.product}</p>
                  <p className="text-xs text-gray-600">{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">₹{item.totalPrice}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4">✨ Features</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-900">
          <li>✅ Automatic unit conversion (kg ↔ g, litre ↔ ml)</li>
          <li>✅ Real-time price calculation from backend API</li>
          <li>✅ Stock availability check</li>
          <li>✅ Calculation history tracking</li>
          <li>✅ Support for multiple units (packet, piece, etc.)</li>
          <li>✅ Responsive design for all devices</li>
        </ul>
      </div>
    </div>
  );
};

export default PriceCalculator;
