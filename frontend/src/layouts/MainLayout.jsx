import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Products', href: '/dashboard/products', icon: '📦' },
    { name: 'Price Calculator', href: '/dashboard/price-calculator', icon: '🧮' },
    { name: 'Billing', href: '/dashboard/billing', icon: '💰' },
    { name: 'Sales History', href: '/dashboard/sales-history', icon: '📜' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: '📋' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userSettings');
    // Redirect to login
    navigate('/');
  };

  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (err) {
        return null;
      }
    }
    return null;
  };

  const user = getUserInfo() || { username: 'Shop Manager' };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">🏪 Venkateshwar</h1>
              <p className="text-xs text-blue-100">Kiranam</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="mr-3 text-lg">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 px-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {navigation.find((item) => isActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-3 relative">
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {user.username.charAt(0).toUpperCase()}
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-600">{user.email || 'manager@shop.com'}</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span className="mr-2">👤</span>
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span className="mr-2">⚙️</span>
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        toggleTheme();
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="mr-2">{theme === 'light' ? '🌙' : '☀️'}</span>
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <span className="mr-2">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Close dropdown when clicking elsewhere */}
        {profileDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setProfileDropdownOpen(false)}
          />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
