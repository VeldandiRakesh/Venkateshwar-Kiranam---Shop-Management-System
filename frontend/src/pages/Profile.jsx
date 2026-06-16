import { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/api';
import { useProducts } from '../contexts/ProductContext';

const Profile = () => {
  const { addToast } = useProducts();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    full_name: '',
    shop_name: '',
    username: '',
    email: '',
    phone: '',
    profile_image: null,
    created_at: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    shop_name: '',
    email: '',
    phone: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchOwnerProfile();
  }, []);

  const fetchOwnerProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.success && response.owner) {
        setProfile(response.owner);
        setEditData({
          full_name: response.owner.full_name,
          shop_name: response.owner.shop_name,
          email: response.owner.email,
          phone: response.owner.phone
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      addToast(err.message || 'Failed to load profile info', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editData.full_name || !editData.shop_name || !editData.email || !editData.phone) {
      addToast('Please fill in all profile fields', 'warning');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await updateProfile({
        ...editData,
        profile_image: profile.profile_image
      });

      if (response.success) {
        setProfile(response.owner);
        setEditMode(false);
        addToast('Profile details updated successfully', 'success');
        // Reload to update sidebar shop name and header dropdown details
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmNewPassword) {
      addToast('Please fill in all password fields', 'warning');
      return;
    }

    if (passwords.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'warning');
      return;
    }

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      if (response.success) {
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        addToast('Password changed successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      addToast('Profile image must be smaller than 200KB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      try {
        const response = await updateProfile({
          ...editData,
          profile_image: base64Image
        });

        if (response.success) {
          setProfile(response.owner);
          addToast('Profile photo updated successfully', 'success');
          // Reload to sync header avatar instantly
          setTimeout(() => window.location.reload(), 800);
        }
      } catch (err) {
        addToast(err.message || 'Failed to save photo', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = async () => {
    try {
      const response = await updateProfile({
        ...editData,
        profile_image: null
      });

      if (response.success) {
        setProfile(response.owner);
        addToast('Profile photo removed', 'info');
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      addToast(err.message || 'Failed to remove photo', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
        <div className="inline-block animate-spin text-2xl">⏳</div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading owner profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile Manager</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage owner credentials, shop details, and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Owner Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  📝 Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={editData.full_name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Shop Name</label>
                    <input
                      type="text"
                      name="shop_name"
                      value={editData.shop_name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      placeholder="Enter shop name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={editData.phone}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditData({
                        full_name: profile.full_name,
                        shop_name: profile.shop_name,
                        email: profile.email,
                        phone: profile.phone
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Shop Name</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{profile.shop_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Username</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{profile.username}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Shop Active Since</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Change Security Password</h2>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwords.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Profile Image Column */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center h-fit">
          <h2 className="text-md font-bold text-gray-800 dark:text-gray-100 mb-6 w-full text-left">Profile Picture</h2>
          
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white text-4xl font-bold flex items-center justify-center shadow-lg border-2 border-blue-500">
              {profile.profile_image ? (
                <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.full_name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3 w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={triggerImageUpload}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              📤 Upload Photo
            </button>
            {profile.profile_image && (
              <button
                onClick={removeProfilePhoto}
                className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                🗑️ Remove Photo
              </button>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Maximum size 200KB. Formats supported: JPG, PNG, GIF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
