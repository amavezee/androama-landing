import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Clock } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <SettingsIcon className="w-10 h-10 text-purple-400" />
            Settings
          </h1>
          <p className="text-gray-400">Manage your application preferences and configurations</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">
                We're working on bringing you comprehensive settings and preferences. 
                This section will allow you to customize your ANDROAMA experience.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">Planned Features:</strong>
              </p>
              <ul className="mt-3 text-left text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Application preferences and themes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Notification settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Privacy and security options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Data management and export</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Advanced configuration options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

