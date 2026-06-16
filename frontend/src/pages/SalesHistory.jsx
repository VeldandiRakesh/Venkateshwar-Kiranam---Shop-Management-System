import { useState, useEffect } from 'react';
import { getSales, downloadSalePDF } from '../services/api';
import { useProducts } from '../contexts/ProductContext';

const SalesHistory = () => {
  const { addToast } = useProducts();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchDate, setSearchDate] = useState('');
  
  // Selected sale for detailed modal inspect
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSalesLogs();
  }, [searchCustomer, searchDate]);

  const fetchSalesLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (searchCustomer.trim()) filters.customer = searchCustomer.trim();
      if (searchDate) filters.date = searchDate;

      const response = await getSales(filters);
      setSales(response.data || []);
    } catch (err) {
      console.error('Error fetching sales logs:', err);
      setError(err.message || 'Failed to load sales history');
      if (addToast) {
        addToast('Error loading sales history', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (sale) => {
    try {
      const blob = await downloadSalePDF(sale.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const customerName = sale.customer_name ? sale.customer_name.replace(/\s+/g, '_') : 'Guest';
      link.setAttribute('download', `Bill_${sale.id}_${customerName}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast(`Downloaded Invoice #${sale.id} PDF`, 'success');
    } catch (err) {
      console.error('PDF download error:', err);
      addToast('Failed to download invoice PDF', 'error');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
        <p className="text-gray-600 mt-1">View past bills, search transactions, and download invoices</p>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Filter Invoices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name</label>
            <div className="relative">
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Search by customer name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Date</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
        </div>
        {(searchCustomer || searchDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => { setSearchCustomer(''); setSearchDate(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Table Listing */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-gray-600 mt-4">Loading transaction history...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bill ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => {
                  const itemCount = sale.items.reduce((sum, i) => sum + i.quantity, 0);
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">#{sale.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-950">{sale.customer_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-medium">
                        {itemCount} ({sale.items.length} unique)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        ₹{sale.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-3">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(sale)}
                          className="text-green-600 hover:text-green-800 font-semibold cursor-pointer"
                        >
                          📥 PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sales.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <span className="text-4xl mb-4 block">🧾</span>
              <p className="font-medium">No sales transactions found.</p>
              <p className="text-sm text-gray-600 mt-1">
                {searchCustomer || searchDate ? 'Try clearing your filters.' : 'Transactions will appear here after sales.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Invoice Details: #{selectedSale.id}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{formatDate(selectedSale.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Card */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Customer Name</p>
                  <p className="text-md font-bold text-blue-900 mt-0.5">{selectedSale.customer_name}</p>
                </div>
                <button
                  onClick={() => handleDownloadPDF(selectedSale)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <span>📥</span>
                  <span>Download PDF Invoice</span>
                </button>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Purchased Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="px-4 py-2 text-left">Product Name</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {selectedSale.items.map((item, index) => {
                        const price = item.price !== undefined ? item.price : item.selling_price;
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 font-medium">{item.name}</td>
                            <td className="px-4 py-3 text-right">₹{price.toFixed(2)} / {item.unit || 'unit'}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-semibold">₹{(price * item.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Summary & Profit Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Financial Summary */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium text-gray-800">₹{selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18% GST):</span>
                    <span className="font-medium text-gray-800">₹{selectedSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total Bill:</span>
                    <span className="text-blue-600">₹{selectedSale.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Profit Card */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col justify-center">
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wider">Earned Profit on this Bill</p>
                  <p className="text-2xl font-black text-green-800 mt-1">₹{selectedSale.profit.toFixed(2)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Margin: {selectedSale.total_amount > 0 ? ((selectedSale.profit / selectedSale.subtotal) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
