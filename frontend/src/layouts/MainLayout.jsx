import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getProfile } from '../services/api';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
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

  const getOwnerInfo = () => {
    const ownerData = localStorage.getItem('owner');
    const defaultOwner = {
      full_name: 'Rakesh Veldandi',
      shop_name: 'Venkateshwar Kiranam',
      email: 'rakeshveldandi9390@gmail.com',
      phone: '9876543210',
      profile_image: null
    };
    if (ownerData) {
      try {
        return { ...defaultOwner, ...JSON.parse(ownerData) };
      } catch (err) {
        return defaultOwner;
      }
    }
    return defaultOwner;
  };

  const [owner, setOwner] = useState(getOwnerInfo());

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success && response.owner) {
          setOwner(response.owner);
          localStorage.setItem('owner', JSON.stringify(response.owner));
        }
      } catch (err) {
        console.error('Error fetching owner profile in MainLayout:', err);
      }
    };
    fetchFreshProfile();
  }, []);

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
              <h1 className="text-lg font-bold text-white">🏪 {owner.shop_name}</h1>
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
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer overflow-hidden border border-gray-200 shadow-sm"
                >
                  {owner.profile_image ? (
                    <img src={owner.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    owner.full_name.charAt(0).toUpperCase()
                  )}
                </button>

                {/* Profile Dropdown Menu / Static Owner Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-t-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Name</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{owner.full_name}</p>
                      
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop Name</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{owner.shop_name}</p>
                      
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">{owner.email}</p>
                      
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{owner.phone || 'Not configured'}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <span className="mr-2">👤</span>
                        Profile
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <span className="mr-2">⚙️</span>
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          toggleTheme();
                        }}
                        className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <span className="mr-2">{theme === 'light' ? '🌙' : '☀️'}</span>
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                      </button>
                    </div>
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
