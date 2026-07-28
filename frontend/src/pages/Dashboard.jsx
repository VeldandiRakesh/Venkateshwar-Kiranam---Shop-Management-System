import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalesStats } from '../services/api';
import { useProducts } from '../contexts/ProductContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useProducts();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSalesStats();

      // Backend response:
      // {
      //   success: true,
      //   data: { ...stats }
      // }

      if (response.success) {
        setStats(response.data);
      } else {
        setError("Failed to load dashboard statistics");
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);

      setError(
        err.message ||
        err.response?.data?.message ||
        "Failed to load dashboard statistics"
      );

      if (addToast) {
        addToast("Error loading stats", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPercentageChange = (today, yesterday) => {
    if (yesterday === 0) return today > 0 ? '+100%' : '0%';
    const change = ((today - yesterday) / yesterday) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-4">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
        <p className="text-red-800 font-semibold">Error: {error}</p>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const {
    todaySales = 0,
    yesterdaySales = 0,
    monthlySales = 0,
    totalProfit = 0,
    lowStockCount = 0,
    totalProductsCount = 0,
    lowStockItems = [],
    recentSales = []
  } = stats || {};

  const statsCards = [
    {
      name: 'Total Products',
      value: totalProductsCount.toString(),
      icon: '📦',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: 'Active inventory items',
      changeType: 'neutral',
    },
    {
      name: 'Low Stock Items',
      value: lowStockCount.toString(),
      icon: '⚠️',
      bgLight: lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50',
      textColor: lowStockCount > 0 ? 'text-red-600' : 'text-green-600',
      change: lowStockCount > 0 ? 'Needs restock!' : 'Stock levels good',
      changeType: lowStockCount > 0 ? 'negative' : 'positive',
    },
    {
      name: "Today's Sales",
      value: `₹${todaySales.toFixed(2)}`,
      icon: '💰',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      change: `${getPercentageChange(todaySales, yesterdaySales)} vs yesterday`,
      changeType: todaySales >= yesterdaySales ? 'positive' : 'negative',
    },
    {
      name: 'Monthly Sales',
      value: `₹${monthlySales.toFixed(2)}`,
      icon: '📈',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: 'Current month total',
      changeType: 'positive',
    },
    {
      name: 'Total Profit',
      value: `₹${totalProfit.toFixed(2)}`,
      icon: '👑',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: `Cumulative earnings`,
      changeType: 'positive',
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Add Product',
      icon: '➕',
      action: () => navigate('/dashboard/products')
    },
    {
      id: 2,
      title: 'New Bill',
      icon: '🧾',
      action: () => navigate('/dashboard/billing')
    },
    {
      id: 3,
      title: 'Sales History',
      icon: '📜',
      action: () => navigate('/dashboard/sales-history')
    },
    {
      id: 4,
      title: 'View Reports',
      icon: '📊',
      action: () => navigate('/dashboard/reports')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold">Venkateshwar Kiranam 🏪</h1>
        <p className="text-blue-100 mt-2">Manage billing, inventory, and track sales performance in real time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgLight}`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </div>
            <div className="flex items-center pt-4 border-t border-gray-50 mt-4">
              <span
                className={`text-xs font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {stat.changeType === 'positive' ? '↑' : stat.changeType === 'negative' ? '↓' : '•'} {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">⚠️</span>
            <h3 className="font-bold text-red-800 text-lg">Low Stock Alerts</h3>
          </div>
          <p className="text-sm text-red-700 mb-4">The following products are running below the threshold (10 units) and need restock:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-red-200 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate('/dashboard/inventory')}
              >
                <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">
                  {item.stock_quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
            <button
              onClick={() => navigate('/dashboard/sales-history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All History
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSales.map((sale) => (
              <div key={sale.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Bill generated for {sale.customer_name}</p>
                    <p className="text-xs text-gray-600">ID: #{sale.id} • {new Date(sale.created_at).toLocaleTimeString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">₹{sale.total_amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                <p className="text-sm">No sales recorded yet today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Shortcuts</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer active:scale-95 text-center"
                >
                  <span className="text-3xl mb-2">{action.icon}</span>
                  <span className="text-xs font-bold text-gray-700">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
