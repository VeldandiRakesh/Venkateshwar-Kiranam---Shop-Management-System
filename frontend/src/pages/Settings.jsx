import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme: activeTheme, setTheme } = useTheme();

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
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your application preferences</p>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">🔔</span>
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => handleNotificationChange('email')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Low Stock Alerts</p>
              <p className="text-sm text-gray-600">Get notified when product stock is low</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.lowStock}
              onChange={() => handleNotificationChange('lowStock')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-800">New Sales Notifications</p>
              <p className="text-sm text-gray-600">Get notified when a new sale is made</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.newSales}
              onChange={() => handleNotificationChange('newSales')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-800">Daily Report</p>
              <p className="text-sm text-gray-600">Receive daily sales and inventory report</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">⚙️</span>
          Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Display
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Per Page
            </label>
            <select
              value={settings.display.itemsPerPage}
              onChange={(e) => handleDisplayChange('itemsPerPage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Auto Refresh</p>
              <p className="text-sm text-gray-600">Automatically refresh data</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.display.autoRefreshInterval}
                onChange={(e) => handleDisplayChange('autoRefreshInterval', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
