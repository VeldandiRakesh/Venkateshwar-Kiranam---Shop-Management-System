import { useState } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { createSale } from '../services/api';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const Billing = () => {
  const { products, loading, error, fetchProducts, addToast } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Map backend product model structure to local billing UI structure
  const mappedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.selling_price,
    stock: product.stock_quantity,
    unit: product.unit,
  }));

  const filteredProducts = mappedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    // 1. Verify product has stock
    if (product.stock <= 0) {
      addToast(`"${product.name}" is out of stock!`, 'error');
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // 2. Verify we don't exceed stock quantity
      if (existingItem.quantity >= product.stock) {
        addToast(`Cannot add more. Only ${product.stock} ${product.unit} available in stock.`, 'warning');
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    setSearchTerm('');
    addToast(`${product.name} added to cart`, 'success');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = mappedProducts.find((p) => p.id === productId);
    if (product && newQuantity > product.stock) {
      addToast(`Cannot select more. Only ${product.stock} ${product.unit} available.`, 'warning');
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    const item = cart.find((item) => item.id === productId);
    setCart(cart.filter((item) => item.id !== productId));
    if (item) {
      addToast(`${item.name} removed from cart`, 'info');
    }
  };

  const calculateSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateCGST = () => calculateSubtotal() * 0.09; // 9% CGST
  const calculateSGST = () => calculateSubtotal() * 0.09; // 9% SGST

  const calculateTotal = () => calculateSubtotal() + calculateCGST() + calculateSGST();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addToast('Cart is empty', 'warning');
      return;
    }

    try {
      setIsCheckingOut(true);
      
      const subtotal = calculateSubtotal();
      const cgst = calculateCGST();
      const sgst = calculateSGST();
      const totalAmount = calculateTotal();
      const timestamp = new Date().toLocaleString('en-IN');

      const saleData = {
        customer_name: customerName.trim() || 'Guest',
        items: cart,
        subtotal,
        tax: cgst + sgst,
        total_amount: totalAmount
      };

      // 1. Post to backend sales database
      const response = await createSale(saleData);

      if (response.success) {
        addToast('Invoice generated and saved successfully!', 'success');
        
        // 2. Download invoice PDF locally
        const billId = response.data.bill_id;
        generateInvoicePDF(billId, saleData.customer_name, cart, subtotal, cgst, sgst, totalAmount, timestamp);

        // 3. Clear cart and refresh product list to sync new stock
        setCart([]);
        setCustomerName('');
        await fetchProducts();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      addToast(err.message || 'Checkout failed. Please check stock levels.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading && products.length === 0) {
    return <div className="p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search and Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Billing Counter</h1>
          <p className="text-gray-600 mt-1">Create bills and print invoices</p>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Product Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>

          {searchTerm && (
            <div className="mt-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100 bg-white shadow-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <span className="ml-2 text-xs text-gray-600">({product.stock} {product.unit} left)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">₹{product.price.toFixed(2)}</span>
                    <button className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors">
                      + Add
                    </button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">No products matched "{searchTerm}"</div>
              )}
            </div>
          )}
        </div>

        {/* Cart Listing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-lg">Cart Items ({cart.length})</h2>
            {cart.length > 0 && (
              <button
                onClick={() => { setCart([]); addToast('Cart cleared', 'info'); }}
                className="text-sm text-red-600 hover:text-red-800 hover:underline font-semibold"
              >
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <span className="text-4xl mb-2 block">🛒</span>
              <p className="font-medium">Cart is empty.</p>
              <p className="text-sm text-gray-600 mt-1">Search and select items to add to the bill.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{item.price.toFixed(2)} / {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-200 transition-colors font-semibold text-gray-700"
                      >
                        -
                      </button>
                      <span className="px-4 font-semibold text-gray-800 min-w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-200 transition-colors font-semibold text-gray-700"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-24">
                      <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 text-sm font-semibold active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bill Summary and Checkout */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg mb-6 border-b border-gray-100 pb-4">Bill Summary</h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">₹{calculateSubtotal().toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>CGST (9%)</span>
              <span className="font-medium text-gray-800">₹{calculateCGST().toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>SGST (9%)</span>
              <span className="font-medium text-gray-800">₹{calculateSGST().toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4 text-gray-800">
              <span>Total</span>
              <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            {isCheckingOut ? (
              <>
                <span className="animate-spin inline-block">⏳</span>
                <span>Generating Bill...</span>
              </>
            ) : (
              <>
                <span>🧾</span>
                <span>Generate Bill & Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;