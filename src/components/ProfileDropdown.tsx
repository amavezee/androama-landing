import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Crown, Shield, Monitor, Building2, Sparkles } from 'lucide-react';

const editionIcons: { [key: string]: React.ReactNode } = {
  monitor: <Monitor className="w-4 h-4" />,
  parental: <Shield className="w-4 h-4" />,
  enterprise: <Building2 className="w-4 h-4" />,
  ultimate: <Sparkles className="w-4 h-4" />,
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

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const editionColor = editionColors[user.edition] || editionColors.monitor;
  const editionLabel = editionLabels[user.edition] || 'Monitor Edition';
  const editionIcon = editionIcons[user.edition] || editionIcons.monitor;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
      >
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${editionColor} flex items-center justify-center text-white text-sm font-semibold shadow-lg`}>
          {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">{user.username || user.email.split('@')[0]}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            {editionIcon}
            <span className="capitalize">{user.edition}</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username || user.email}
                  className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-gray-700"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${editionColor} flex items-center justify-center text-white text-lg font-semibold shadow-lg`}>
                  {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user.username || user.email.split('@')[0]}
                </div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${editionColor} text-white font-medium flex items-center gap-1`}>
                    {editionIcon}
                    {editionLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            {user.is_admin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800/50 transition-colors flex items-center gap-3"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Admin Panel
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-800 p-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

