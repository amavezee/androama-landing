import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Mail, TrendingUp, Activity, Download, 
  MessageSquare, Clock, CheckCircle, AlertCircle, Loader,
  BarChart3, UserCheck, FileText, Calendar, Lock, Save
} from 'lucide-react';
import { adminAPI, AdminStats, BetaWaitlistEntry } from '../lib/api';

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [waitlist, setWaitlist] = useState<BetaWaitlistEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'waitlist' | 'users' | 'settings'>('overview');
  const [betaPassword, setBetaPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                            user.subscription_tier === 'free' 
                              ? 'bg-gray-500/20 text-gray-400' 
                              : user.subscription_tier === 'pro'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {user.subscription_tier === 'free' ? 'Free' : user.subscription_tier === 'pro' ? 'Pro' : 'Lifetime'}
                          </span>
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
    </div>
  );
}

