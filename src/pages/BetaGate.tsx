import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Send, CheckCircle, AlertCircle, Shield, Monitor, Camera, Video, Smartphone } from 'lucide-react';
import { publicAPI } from '../lib/api';

const DEFAULT_BETA_PASSWORD = import.meta.env.VITE_BETA_ACCESS_PASSWORD || 'androama2025beta';

export default function BetaGate() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [betaPassword, setBetaPassword] = useState(DEFAULT_BETA_PASSWORD);

  // Fetch password from backend (public endpoint)
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/public/beta-password`);
        if (response.ok) {
          const data = await response.json();
          setBetaPassword(data.password);
        }
      } catch (error) {
        // Fallback to default if fetch fails
        console.log('Using default beta password');
      }
    };
    fetchPassword();
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === betaPassword) {
      // Store access in sessionStorage immediately
      sessionStorage.setItem('beta_access_granted', 'true');
      // Dispatch custom event to notify App component
      window.dispatchEvent(new Event('betaAccessGranted'));
      // Navigate with replace to avoid back button issues
      navigate('/', { replace: true });
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmittingEmail(true);
    setError('');
    try {
      await publicAPI.joinBetaWaitlist(email);
      setEmailSubmitted(true);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit email. Please try again.');
    } finally {
      setSubmittingEmail(false);
    }
  };

  // Check if already granted access - redirect immediately
  if (sessionStorage.getItem('beta_access_granted') === 'true') {
    // Already has access, redirect to home
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 md:p-12">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/NEWANDRO.png" alt="Androama" className="h-12 w-auto brightness-0 invert" />
              <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Acquire, sans-serif' }}>
                ANDROAMA
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">Beta Access Required</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Professional Android Device Management Platform
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6 text-center">
              ANDROAMA is a powerful desktop application that allows you to remotely monitor, control, and manage Android devices with enterprise-grade features.
            </p>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Monitor className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Screen Mirroring</h3>
                </div>
                <p className="text-sm text-gray-400">Real-time screen viewing and recording</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Background Recording</h3>
                </div>
                <p className="text-sm text-gray-400">Record ANY app activity including social media apps</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Camera Access</h3>
                </div>
                <p className="text-sm text-gray-400">Live camera viewing from connected devices</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Complete Control</h3>
                </div>
                <p className="text-sm text-gray-400">File management, app installation, device control</p>
              </div>
            </div>

            <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg mb-6">
              <p className="text-sm text-purple-300 leading-relaxed">
                <strong className="text-purple-200">🔒 Privacy-Focused:</strong> All monitoring data is stored locally on your computer. 
                ANDROAMA can record activity from social media apps (Snapchat, Instagram, WhatsApp, TikTok, etc.) and any other Android application, 
                giving you complete visibility and control over device activity.
              </p>
            </div>
          </div>

          {/* Password Form */}
          {!showEmailForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Beta Access Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter beta access password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
              >
                Access Beta
              </button>
            </form>
          )}

          {/* Email Waitlist Form */}
          {showEmailForm && !emailSubmitted && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submittingEmail}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingEmail ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Join Waitlist
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {emailSubmitted && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-semibold mb-1">Thank you for your interest!</p>
              <p className="text-sm text-gray-400">We'll notify you when beta access becomes available.</p>
            </div>
          )}

          {/* Join Waitlist Link */}
          {!showEmailForm && !emailSubmitted && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                Don't have access? Join the beta waitlist →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

