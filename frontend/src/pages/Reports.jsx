import { useState, useEffect } from 'react';
import { getSalesReports } from '../services/api';
import { useProducts } from '../contexts/ProductContext';

const Reports = () => {
  const { addToast } = useProducts();
  const [selectedReport, setSelectedReport] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesReports();
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching sales reports:', err);
      setError(err.message || 'Failed to load sales reports');
      if (addToast) {
        addToast('Error loading reports', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-4">Generating business reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center text-red-800 font-semibold">
        Error: {error}
        <button onClick={fetchReports} className="mt-4 block mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const {
    dailyReport = [],
    monthlyReport = [],
    profitReport = { total_revenue: 0, total_profit: 0, total_cost: 0, margin: 0 },
    lowStockReport = []
  } = reportData || {};

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  // Find max revenue in daily/monthly to scale visual progress bars
  const maxDailyRevenue = dailyReport.length > 0 ? Math.max(...dailyReport.map(r => r.revenue)) : 1;
  const maxMonthlyRevenue = monthlyReport.length > 0 ? Math.max(...monthlyReport.map(r => r.revenue)) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
          <p className="text-gray-600 mt-1">Analyze sales metrics, profit margins, and stock requirements</p>
        </div>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-sm text-sm"
        >
          🔄 Refresh Reports
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto divide-x divide-gray-100">
          <button
            onClick={() => setSelectedReport('daily')}
            className={`flex-1 min-w-32 px-4 py-4 text-sm font-bold transition-all text-center cursor-pointer ${
              selectedReport === 'daily'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📅 Daily Sales
          </button>
          <button
            onClick={() => setSelectedReport('monthly')}
            className={`flex-1 min-w-32 px-4 py-4 text-sm font-bold transition-all text-center cursor-pointer ${
              selectedReport === 'monthly'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📈 Monthly Sales
          </button>
          <button
            onClick={() => setSelectedReport('profit')}
            className={`flex-1 min-w-32 px-4 py-4 text-sm font-bold transition-all text-center cursor-pointer ${
              selectedReport === 'profit'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💰 Profit Analysis
          </button>
          <button
            onClick={() => setSelectedReport('lowstock')}
            className={`flex-1 min-w-32 px-4 py-4 text-sm font-bold transition-all text-center cursor-pointer ${
              selectedReport === 'lowstock'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚠️ Low Stock List
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Daily Sales Report */}
          {selectedReport === 'daily' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Daily Sales Logs (Past 30 Days)</h2>
              {dailyReport.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No sales logs available.</p>
              ) : (
                <div className="space-y-4">
                  {dailyReport.map((row) => {
                    const widthPct = (row.revenue / maxDailyRevenue) * 100;
                    return (
                      <div key={row.date} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors gap-3">
                        <div className="sm:w-36 font-semibold text-gray-800">{formatDate(row.date)}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden relative mx-2 hidden sm:block">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${widthPct}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Total Revenue</p>
                            <p className="font-bold text-gray-950">₹{row.revenue.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Profit earned</p>
                            <p className="font-bold text-green-700">₹{row.profit.toFixed(2)}</p>
                          </div>
                          <div className="text-right min-w-16">
                            <p className="text-xs text-gray-600">Bills</p>
                            <p className="font-semibold text-gray-700">{row.orders}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Monthly Sales Report */}
          {selectedReport === 'monthly' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Monthly Sales Summary</h2>
              {monthlyReport.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No sales records available.</p>
              ) : (
                <div className="space-y-4">
                  {monthlyReport.map((row) => {
                    const widthPct = (row.revenue / maxMonthlyRevenue) * 100;
                    return (
                      <div key={row.month} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors gap-3">
                        <div className="sm:w-36 font-semibold text-gray-800">{formatMonth(row.month)}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden relative mx-2 hidden sm:block">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${widthPct}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Total Revenue</p>
                            <p className="font-bold text-gray-950">₹{row.revenue.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Profit earned</p>
                            <p className="font-bold text-green-700">₹{row.profit.toFixed(2)}</p>
                          </div>
                          <div className="text-right min-w-16">
                            <p className="text-xs text-gray-600">Bills</p>
                            <p className="font-semibold text-gray-700">{row.orders}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profit Analysis */}
          {selectedReport === 'profit' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Profit & Margin Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Cards */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Sales Revenue</p>
                  <p className="text-2xl font-black text-blue-900 mt-2">₹{profitReport.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-blue-600 mt-1">Total revenue collected</p>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Total Cost of Goods (COGS)</p>
                  <p className="text-2xl font-black text-red-900 mt-2">₹{profitReport.total_cost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-red-600 mt-1">Sum of product purchase prices</p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Net Profit Earned</p>
                  <p className="text-2xl font-black text-green-900 mt-2">₹{profitReport.total_profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-green-600 mt-1">Total Daily Profit: ₹{dailyReport[0]?.profit.toFixed(2) || '0.00'} today</p>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-600">Net Profit Margin percentage:</span>
                  <span className="text-green-700 text-lg">{profitReport.margin}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div className="bg-green-600 h-full rounded-full transition-all" style={{ width: `${Math.min(profitReport.margin, 100)}%` }}></div>
                </div>
                <p className="text-xs text-gray-600">
                  A higher profit margin percentage indicates greater shop profitability per rupee of items sold. Target margin for Kirana store is usually 12% - 20%.
                </p>
              </div>
            </div>
          )}

          {/* Low Stock List */}
          {selectedReport === 'lowstock' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Products Requiring Reorder (Stock ≤ 10)</h2>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">{lowStockReport.length} items warning</span>
              </div>

              {lowStockReport.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-800 font-semibold">
                  🎉 Excellent! All products are well stocked.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-gray-800">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="px-6 py-3 text-left">Product Name</th>
                        <th className="px-6 py-3 text-left">Category</th>
                        <th className="px-6 py-3 text-right">Selling Price</th>
                        <th className="px-6 py-3 text-right font-bold text-red-600">Current Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {lowStockReport.map((product) => (
                        <tr key={product.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                          <td className="px-6 py-4">{product.category}</td>
                          <td className="px-6 py-4 text-right">₹{product.selling_price.toFixed(2)} / {product.unit}</td>
                          <td className="px-6 py-4 text-right font-black text-red-600">
                            {product.stock_quantity} {product.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
