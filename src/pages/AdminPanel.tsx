import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Mail, TrendingUp, Activity, Download, 
  MessageSquare, Clock, CheckCircle, Loader,
  BarChart3, FileText, Lock, Save,
  Package, Upload, Edit, Trash2, X
} from 'lucide-react';
import { adminAPI, AdminStats, BetaWaitlistEntry, appManagementAPI, App, AppCreateData, AppUpdateData } from '../lib/api';

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [waitlist, setWaitlist] = useState<BetaWaitlistEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'waitlist' | 'users' | 'settings' | 'apps'>('overview');
  const [betaPassword, setBetaPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Apps management state
  const [apps, setApps] = useState<App[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [uploadForm, setUploadForm] = useState<AppCreateData & { file: File | null }>({
    name: '',
    description: '',
    version: '',
    package_name: '',
    category: 'Other',
    icon_url: '',
    is_essential: false,
    file: null
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/admin');
      return;
    }
    
    if (!authLoading && user && !user.is_admin) {
      navigate('/');
      return;
    }

    if (user?.is_admin) {
      loadStats();
      loadWaitlist();
      if (activeTab === 'users') {
        loadUsers();
      }
      if (activeTab === 'settings') {
        loadBetaPassword();
      }
      if (activeTab === 'apps') {
        loadApps();
      }
    }
  }, [user, authLoading, navigate, activeTab]);

  const loadBetaPassword = async () => {
    try {
      const data = await adminAPI.getBetaPassword();
      setBetaPassword(data.password);
    } catch (error) {
      console.error('Error loading beta password:', error);
      // Fallback to env variable
      const currentPassword = import.meta.env.VITE_BETA_ACCESS_PASSWORD || 'androama2025beta';
      setBetaPassword(currentPassword);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaitlist = async () => {
    setLoadingWaitlist(true);
    try {
      const data = await adminAPI.getWaitlist(0, 100);
      setWaitlist(data);
    } catch (error) {
      console.error('Error loading waitlist:', error);
    } finally {
      setLoadingWaitlist(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminAPI.getUsers(0, 100);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveBetaPassword = async () => {
    if (!betaPassword.trim() || betaPassword.trim().length < 3) {
      alert('Password must be at least 3 characters long');
      return;
    }

    setSavingPassword(true);
    setPasswordSuccess(false);
    try {
      const result = await adminAPI.updateBetaPassword(betaPassword.trim());
      setPasswordSuccess(true);
      setBetaPassword(result.password);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const loadApps = async () => {
    setLoadingApps(true);
    try {
      const data = await appManagementAPI.getApps();
      setApps(data.apps);
    } catch (error) {
      console.error('Error loading apps:', error);
      alert('Failed to load apps');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.apk')) {
        alert('Only APK files are allowed');
        return;
      }
      setUploadForm({ ...uploadForm, file });
      
      // Try to extract version from filename
      const versionMatch = file.name.match(/v?(\d+\.\d+\.\d+)/i) || file.name.match(/v?(\d+\.\d+)/i);
      if (versionMatch && !uploadForm.version) {
        setUploadForm({ ...uploadForm, file, version: versionMatch[1] });
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      alert('Please select an APK file');
      return;
    }
    if (!uploadForm.name || !uploadForm.description || !uploadForm.version || !uploadForm.package_name) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      await appManagementAPI.uploadApp(uploadForm.file, uploadForm);
      setShowUploadModal(false);
      setUploadForm({
        name: '',
        description: '',
        version: '',
        package_name: '',
        category: 'Other',
        icon_url: '',
        is_essential: false,
        file: null
      });
      await loadApps();
      alert('App uploaded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to upload app');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app? This will also delete the APK file.')) {
      return;
    }

    try {
      await appManagementAPI.deleteApp(appId);
      await loadApps();
      alert('App deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete app');
    }
  };

  const handleUpdateApp = async (appId: string, data: AppUpdateData) => {
    try {
      await appManagementAPI.updateApp(appId, data);
      setEditingApp(null);
      await loadApps();
      alert('App updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update app');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-400">Manage your platform and view analytics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'overview'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'waitlist'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Beta Waitlist ({waitlist.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'users'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'apps'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Apps Management
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'settings'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.active_users} active
                </p>
              </div>

              {/* New Users (7 days) */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">New Users (7d)</h3>
                <p className="text-3xl font-bold text-white">{stats.users_last_7_days}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.users_last_30_days} in last 30 days
                </p>
              </div>

              {/* Beta Waitlist */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">Beta Waitlist</h3>
                <p className="text-3xl font-bold text-white">{stats.total_waitlist}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.waitlist_notified} notified
                </p>
              </div>

              {/* Downloads */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-600/20 rounded-lg">
                    <Download className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">App Downloads</h3>
                <p className="text-3xl font-bold text-white">{stats.users_with_downloads}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {((stats.users_with_downloads / stats.total_users) * 100).toFixed(1)}% of users
                </p>
              </div>
            </div>

            {/* Community Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Community Posts</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{stats.total_posts}</p>
                <p className="text-sm text-gray-400">
                  {stats.posts_last_7_days} in last 7 days
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Replies</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{stats.total_replies}</p>
                <p className="text-sm text-gray-400">
                  Community engagement
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Engagement</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  {stats.total_posts + stats.total_replies}
                </p>
                <p className="text-sm text-gray-400">
                  Total interactions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Beta Waitlist Emails
              </h2>
              <button
                onClick={loadWaitlist}
                disabled={loadingWaitlist}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                {loadingWaitlist ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>

            {loadingWaitlist ? (
              <div className="text-center py-12 text-gray-400">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
                Loading waitlist...
              </div>
            ) : waitlist.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No emails in waitlist yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date Added</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 text-white">{entry.email}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          {entry.notified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                              <CheckCircle className="w-3 h-3" />
                              Notified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                All Users
              </h2>
              <button
                onClick={loadUsers}
                disabled={loadingUsers}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                {loadingUsers ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12 text-gray-400">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Username</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Edition</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Tier</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 text-white">{user.email}</td>
                        <td className="py-3 px-4 text-gray-300">{user.username || '—'}</td>
                        <td className="py-3 px-4 text-gray-300 capitalize">{user.edition}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.subscription_tier === 'free' || user.subscription_tier === 'pro' ? 'beta' : user.subscription_tier}
                            onChange={async (e) => {
                              const newTier = e.target.value;
                              const currentTier = user.subscription_tier === 'free' || user.subscription_tier === 'pro' ? 'beta' : user.subscription_tier;
                              if (newTier !== currentTier) {
                                if (confirm(`Change ${user.email}'s tier from ${currentTier} to ${newTier}?`)) {
                                  try {
                                    const updatedUser = await adminAPI.updateUserTier(user.id, newTier);
                                    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
                                    alert(`User tier updated successfully!`);
                                  } catch (error: any) {
                                    alert(error.response?.data?.detail || 'Failed to update user tier');
                                    e.target.value = currentTier; // Revert on error
                                  }
                                } else {
                                  e.target.value = currentTier; // Revert if cancelled
                                }
                              }
                            }}
                            className={`px-2 py-1 rounded text-sm font-medium border-0 bg-transparent cursor-pointer ${
                              (user.subscription_tier === 'free' || user.subscription_tier === 'pro' || user.subscription_tier === 'beta')
                                ? 'text-purple-400' 
                                : 'text-yellow-400'
                            }`}
                            style={{
                              backgroundColor: (user.subscription_tier === 'free' || user.subscription_tier === 'pro' || user.subscription_tier === 'beta')
                                ? 'rgba(168, 85, 247, 0.2)' 
                                : 'rgba(234, 179, 8, 0.2)'
                            }}
                          >
                            <option value="beta">Beta</option>
                            <option value="lifetime">Lifetime</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          {user.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-sm">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">User</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Apps Management Tab */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Apps Management
                </h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  Upload New App
                </button>
              </div>

              {loadingApps ? (
                <div className="text-center py-12 text-gray-400">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
                  Loading apps...
                </div>
              ) : apps.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No apps uploaded yet</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                  >
                    Upload Your First App
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Icon</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Version</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Category</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Package</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apps.map((app) => (
                        <tr key={app.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 px-4">
                            {app.iconUrl ? (
                              <img 
                                src={app.iconUrl} 
                                alt={app.name} 
                                className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">{app.name}</div>
                            <div className="text-gray-400 text-sm mt-1 line-clamp-2 max-w-md">{app.description}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{app.version}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                              {app.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm font-mono">{app.packageName}</td>
                          <td className="py-3 px-4">
                            {app.isEssential ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                                <CheckCircle className="w-3 h-3" />
                                Essential
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-sm">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingApp(app)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app.id)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Admin Settings
            </h2>

            <div className="space-y-6">
              {/* BetaGate Password */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  BetaGate Password
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Change the password required to access the beta version of ANDROAMA.
                </p>
                <div className="space-y-4">
                  {passwordSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Password updated successfully!
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Beta Access Password
                    </label>
                    <input
                      type="text"
                      value={betaPassword}
                      onChange={(e) => setBetaPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter beta password"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This password is stored in the database and will be used immediately. Users will need this password to access the beta version.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveBetaPassword}
                    disabled={savingPassword || !betaPassword.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload New App
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  APK File <span className="text-red-400">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept=".apk"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="apk-upload"
                  />
                  <label htmlFor="apk-upload" className="cursor-pointer">
                    {uploadForm.file ? (
                      <div className="text-white">
                        <Package className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                        <p className="font-medium">{uploadForm.file.name}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Upload className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Click to select APK file</p>
                        <p className="text-sm mt-1">or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* App Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  App Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., ANDROAMA Client"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe what this app does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Version <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.version}
                    onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 1.0.0"
                  />
                </div>

                {/* Package Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Package Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.package_name}
                    onChange={(e) => setUploadForm({ ...uploadForm, package_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="com.example.app"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Other">Other</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Tools">Tools</option>
                    <option value="Security">Security</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>

                {/* Icon URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon URL (optional)
                  </label>
                  <input
                    type="url"
                    value={uploadForm.icon_url || ''}
                    onChange={(e) => setUploadForm({ ...uploadForm, icon_url: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Is Essential */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is-essential"
                  checked={uploadForm.is_essential}
                  onChange={(e) => setUploadForm({ ...uploadForm, is_essential: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is-essential" className="text-sm text-gray-300">
                  Mark as Essential App
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.file}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload App
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      name: '',
                      description: '',
                      version: '',
                      package_name: '',
                      category: 'Other',
                      icon_url: '',
                      is_essential: false,
                      file: null
                    });
                  }}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6" />
                Edit App
              </h3>
              <button
                onClick={() => setEditingApp(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">App Name</label>
                <input
                  type="text"
                  defaultValue={editingApp.name}
                  id="edit-name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  defaultValue={editingApp.description}
                  id="edit-description"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                  <input
                    type="text"
                    defaultValue={editingApp.version}
                    id="edit-version"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    defaultValue={editingApp.category}
                    id="edit-category"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Other">Other</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Tools">Tools</option>
                    <option value="Security">Security</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon URL</label>
                <input
                  type="url"
                  defaultValue={editingApp.iconUrl || ''}
                  id="edit-icon-url"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-is-essential"
                  defaultChecked={editingApp.isEssential}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="edit-is-essential" className="text-sm text-gray-300">
                  Mark as Essential App
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    const name = (document.getElementById('edit-name') as HTMLInputElement)?.value;
                    const description = (document.getElementById('edit-description') as HTMLTextAreaElement)?.value;
                    const version = (document.getElementById('edit-version') as HTMLInputElement)?.value;
                    const category = (document.getElementById('edit-category') as HTMLSelectElement)?.value;
                    const iconUrl = (document.getElementById('edit-icon-url') as HTMLInputElement)?.value;
                    const isEssential = (document.getElementById('edit-is-essential') as HTMLInputElement)?.checked;

                    handleUpdateApp(editingApp.id, {
                      name,
                      description,
                      version,
                      category,
                      icon_url: iconUrl || undefined,
                      is_essential: isEssential
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingApp(null)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

