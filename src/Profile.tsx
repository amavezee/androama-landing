import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Clock, Activity, Key, Edit2, Save, X, 
  CheckCircle, AlertCircle, Eye, EyeOff, Building2, Monitor, Sparkles,
  Crown, Calendar, Globe
} from 'lucide-react';
import { userAPI } from './lib/api';

const editionIcons: { [key: string]: React.ReactNode } = {
  monitor: <Monitor className="w-5 h-5" />,
  parental: <Shield className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
  ultimate: <Sparkles className="w-5 h-5" />,
};

const editionColors: { [key: string]: string } = {
  monitor: 'from-purple-500 to-pink-500',
  parental: 'from-blue-500 to-cyan-500',
  enterprise: 'from-amber-500 to-orange-500',
  ultimate: 'from-purple-500 via-pink-500 to-amber-500',
};

const editionLabels: { [key: string]: string } = {
  monitor: 'Monitor Edition',
  parental: 'Parental Edition',
  enterprise: 'Enterprise Edition',
  ultimate: 'Ultimate Edition',
};

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile editing
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [editedAvatarUrl, setEditedAvatarUrl] = useState('');
  
  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userAPI.getProfile();
        setUser(userData);
        setEditedUsername(userData.username || '');
        setEditedAvatarUrl(userData.avatar_url || '');
        updateUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [authUser, navigate, updateUser]);

  const handleSaveUsername = async () => {
    if (!editedUsername.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' });
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await userAPI.updateProfile({ username: editedUsername.trim() });
      setUser(updatedUser);
      updateUser(updatedUser);
      setIsEditingUsername(false);
      setMessage({ type: 'success', text: 'Username updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to update username' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    setSaving(true);
    try {
      const updatedUser = await userAPI.updateProfile({ avatar_url: editedAvatarUrl.trim() || null });
      setUser(updatedUser);
      updateUser(updatedUser);
      setIsEditingAvatar(false);
      setMessage({ type: 'success', text: 'Avatar updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to update avatar' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setSaving(true);
    try {
      await userAPI.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => {
        setMessage(null);
        setPasswordSuccess(false);
      }, 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const editionColor = editionColors[user.edition] || editionColors.monitor;
  const editionLabel = editionLabels[user.edition] || 'Monitor Edition';
  const editionIcon = editionIcons[user.edition] || editionIcons.monitor;
  const isOAuthUser = !!user.oauth_provider;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">Manage your account information and security settings</p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username || user.email}
                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-gray-700 mb-4"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${editionColor} flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4`}>
                    {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                )}
                {!isEditingAvatar ? (
                  <button
                    onClick={() => setIsEditingAvatar(true)}
                    className="mb-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Change Avatar
                  </button>
                ) : (
                  <div className="w-full mb-2 space-y-2">
                    <input
                      type="url"
                      value={editedAvatarUrl}
                      onChange={(e) => setEditedAvatarUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAvatar}
                        disabled={saving}
                        className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingAvatar(false);
                          setEditedAvatarUrl(user.avatar_url || '');
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Enter a URL to an image (e.g., from Imgur, Gravatar, etc.)</p>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.username || user.email.split('@')[0]}
                </h2>
                <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${editionColor} text-white font-medium flex items-center gap-2`}>
                  {editionIcon}
                  {editionLabel}
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Account Status</span>
                  <span className={`flex items-center gap-2 text-sm font-medium ${
                    user.is_active ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Email Verified</span>
                  <span className={`flex items-center gap-2 text-sm font-medium ${
                    user.email_verified ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {user.email_verified ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>
                {user.is_admin && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Role</span>
                    <span className="flex items-center gap-2 text-sm font-medium text-amber-400">
                      <Crown className="w-4 h-4" />
                      Administrator
                    </span>
                  </div>
                )}
                {isOAuthUser && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Sign-in Method</span>
                    <span className="flex items-center gap-2 text-sm font-medium text-blue-400">
                      <Globe className="w-4 h-4" />
                      {user.oauth_provider ? user.oauth_provider.charAt(0).toUpperCase() + user.oauth_provider.slice(1) : 'OAuth'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h3>
              
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nickname
                  </label>
                  {isEditingUsername ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedUsername}
                        onChange={(e) => {
                          setEditedUsername(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveUsername();
                          }
                        }}
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter nickname"
                      />
                      <button
                        onClick={handleSaveUsername}
                        disabled={saving}
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setEditedUsername(user.username || '');
                        }}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                    ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
                        {user.username || 'Not set'}
                      </div>
                      <button
                        onClick={() => {
                          setIsEditingUsername(true);
                          setEditedUsername(user.username || '');
                        }}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Details */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Member Since
                    </label>
                    <p className="text-white">{formatDate(user.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Last Login
                    </label>
                    <p className="text-white">{formatDate(user.last_login)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </h3>

              {isOAuthUser ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">OAuth Account</h4>
                      <p className="text-gray-400 text-sm">
                        Your account is managed through {user.oauth_provider}. To change your password, 
                        please visit your {user.oauth_provider} account settings.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!showPasswordChange ? (
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-semibold mb-1">Password</h4>
                        <p className="text-gray-400 text-sm">Update your account password</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Change Password</h4>
                        <button
                          onClick={() => {
                            setShowPasswordChange(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordError('');
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {passwordError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Password changed successfully!
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-3 pr-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 pr-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter new password (min. 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 pr-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleChangePassword}
                          disabled={saving}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Changing...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Change Password
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordChange(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordError('');
                          }}
                          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Subscription Information */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Subscription Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Edition</label>
                  <div className="flex items-center gap-2 text-white">
                    {editionIcon}
                    <span className="font-semibold">{editionLabel}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Subscription Tier</label>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold capitalize">{user.subscription_tier}</p>
                    {user.subscription_tier === 'free' && (
                      <button
                        onClick={() => {
                          // TODO: Implement upgrade flow
                          alert('Upgrade functionality coming soon!');
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <p className={`font-semibold capitalize ${
                    user.subscription_status === 'active' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {user.subscription_status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
