import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getProfile, updateProfile } from '../services/api';
import { useProducts } from '../contexts/ProductContext';

const Settings = () => {
  const { theme: activeTheme, setTheme } = useTheme();
  const { addToast } = useProducts();

  const [owner, setOwner] = useState({
    full_name: '',
    shop_name: '',
    email: '',
    phone: '',
    profile_image: null
  });

  const [ownerEdit, setOwnerEdit] = useState({
    full_name: '',
    shop_name: '',
    email: '',
    phone: ''
  });

  const [editingOwner, setEditingOwner] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return parsed;
      } catch (err) {
        console.error('Error parsing settings:', err);
      }
    }
    return {
      notifications: {
        email: true,
        lowStock: true,
        newSales: true,
        dailyReport: false
      },
      preferences: {
        theme: activeTheme,
        language: 'en',
        dateFormat: 'dd/mm/yyyy',
        currency: 'INR'
      },
      display: {
        itemsPerPage: '25',
        autoRefresh: true,
        autoRefreshInterval: '30'
      }
    };
  });

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await getProfile();
        if (response.success && response.owner) {
          setOwner(response.owner);
          setOwnerEdit({
            full_name: response.owner.full_name,
            shop_name: response.owner.shop_name,
            email: response.owner.email,
            phone: response.owner.phone
          });
        }
      } catch (err) {
        console.error('Error fetching owner profile in Settings:', err);
      }
    };
    fetchOwner();
  }, []);

  // Keep settings theme in sync with the active theme context (e.g. if toggled from the user profile menu)
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: activeTheme
      }
    }));
  }, [activeTheme]);

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));

    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handleDisplayChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    localStorage.setItem('theme', settings.preferences.theme);
    setTheme(settings.preferences.theme);
    addToast('Preferences saved successfully!', 'success');
  };

  const handleSaveOwner = async (e) => {
    e.preventDefault();
    if (!ownerEdit.full_name || !ownerEdit.shop_name || !ownerEdit.email || !ownerEdit.phone) {
      addToast('All owner fields are required', 'warning');
      return;
    }
    setSavingOwner(true);
    try {
      const response = await updateProfile({
        ...ownerEdit,
        profile_image: owner.profile_image
      });
      if (response.success) {
        setOwner(response.owner);
        setEditingOwner(false);
        addToast('Owner details updated successfully', 'success');
        // Reload to sync sidebars/headers
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update owner details', 'error');
    } finally {
      setSavingOwner(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your application preferences and owner account</p>
      </div>

      {/* Owner Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <span className="text-2xl mr-2">👤</span>
            Owner Account Information
          </h2>
          {!editingOwner && (
            <button
              onClick={() => setEditingOwner(true)}
              className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Edit Information
            </button>
          )}
        </div>

        {editingOwner ? (
          <form onSubmit={handleSaveOwner} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={ownerEdit.full_name}
                  onChange={(e) => setOwnerEdit({ ...ownerEdit, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Shop Name</label>
                <input
                  type="text"
                  name="shop_name"
                  value={ownerEdit.shop_name}
                  onChange={(e) => setOwnerEdit({ ...ownerEdit, shop_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={ownerEdit.email}
                  onChange={(e) => setOwnerEdit({ ...ownerEdit, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={ownerEdit.phone}
                  onChange={(e) => setOwnerEdit({ ...ownerEdit, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingOwner(false);
                  setOwnerEdit({
                    full_name: owner.full_name,
                    shop_name: owner.shop_name,
                    email: owner.email,
                    phone: owner.phone
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingOwner}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
              >
                {savingOwner ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Owner Name</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{owner.full_name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Shop Name</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{owner.shop_name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{owner.email || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Phone Number</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{owner.phone || 'Loading...'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
          <span className="text-2xl mr-2">🔔</span>
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => handleNotificationChange('email')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Low Stock Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when product stock is low</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.lowStock}
              onChange={() => handleNotificationChange('lowStock')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">New Sales Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when a new sale is made</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.newSales}
              onChange={() => handleNotificationChange('newSales')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Daily Report</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive daily sales and inventory report</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.dailyReport}
              onChange={() => handleNotificationChange('dailyReport')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
          <span className="text-2xl mr-2">⚙️</span>
          Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme Mode
            </label>
            <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-lg border border-gray-200 dark:border-slate-700 space-x-1">
              <button
                type="button"
                onClick={() => handlePreferenceChange('theme', 'light')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                  settings.preferences.theme === 'light'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                }`}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                onClick={() => handlePreferenceChange('theme', 'dark')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                  settings.preferences.theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                }`}
              >
                🌙 Dark
              </button>
              <button
                type="button"
                onClick={() => handlePreferenceChange('theme', 'auto')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                  settings.preferences.theme === 'auto'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                }`}
              >
                💻 Auto
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={settings.preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Display
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items Per Page
            </label>
            <select
              value={settings.display.itemsPerPage}
              onChange={(e) => handleDisplayChange('itemsPerPage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Auto Refresh</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically refresh data</p>
            </div>
            <input
              type="checkbox"
              checked={settings.display.autoRefresh}
              onChange={(e) => handleDisplayChange('autoRefresh', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {settings.display.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.display.autoRefreshInterval}
                onChange={(e) => handleDisplayChange('autoRefreshInterval', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-gray-750 dark:text-gray-350 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors border border-gray-200 dark:border-slate-700 cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-md"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default Settings;
