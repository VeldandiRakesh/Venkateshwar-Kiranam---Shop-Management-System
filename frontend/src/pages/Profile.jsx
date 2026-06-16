import { useState, useEffect } from 'react';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    role: '',
    joinDate: ''
  });

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          username: parsedUser.username || 'Shop Manager',
          email: parsedUser.email || 'manager@venkateshwar.com',
          role: parsedUser.role || 'Administrator',
          joinDate: parsedUser.joinDate || new Date().toLocaleDateString()
        });
      } catch (err) {
        console.error('Error parsing user info:', err);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{userInfo.username}</h2>
            <p className="text-gray-600">{userInfo.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={userInfo.username}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={userInfo.email}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              value={userInfo.role}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
            />
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value={userInfo.joinDate}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Account Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Account Status</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Secure your account with 2FA</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Password</p>
              <p className="text-sm text-gray-600">Last changed 90 days ago</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
