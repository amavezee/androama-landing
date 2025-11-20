import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Home from './Home';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileDropdown from './components/ProfileDropdown';
import Profile from './Profile';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import CommunityHub from './pages/CommunityHub';
import BetaGate from './pages/BetaGate';
import AdminPanel from './pages/AdminPanel';
import WelcomeNotification from './components/WelcomeNotification';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const [isValidatingToken, setIsValidatingToken] = useState(false);

  // Check for welcome message
  useEffect(() => {
    const message = sessionStorage.getItem('welcome_message');
    if (message) {
      setWelcomeMessage(message);
      sessionStorage.removeItem('welcome_message');
    }
  }, []);

  // Listen for beta access granted event
  useEffect(() => {
    const handleBetaAccess = () => {
      // Force re-render to check sessionStorage again
      forceUpdate({});
    };
    
    window.addEventListener('betaAccessGranted', handleBetaAccess);
    return () => {
      window.removeEventListener('betaAccessGranted', handleBetaAccess);
    };
  }, []);

  // Check for betaToken in URL and validate it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const betaToken = urlParams.get('betaToken');
    
    if (betaToken && sessionStorage.getItem('beta_access_granted') !== 'true') {
      setIsValidatingToken(true);
      // Validate token with backend
      const validateToken = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API_URL}/api/public/beta/validate-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: betaToken }),
          });
          
          const data = await response.json();
          if (data.valid === true) {
            // Grant beta access
            sessionStorage.setItem('beta_access_granted', 'true');
            // Remove token from URL
            urlParams.delete('betaToken');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
            // Force re-render
            setIsValidatingToken(false);
            forceUpdate({});
          } else {
            setIsValidatingToken(false);
          }
        } catch (error) {
          console.error('Failed to validate beta token:', error);
          setIsValidatingToken(false);
        }
      };
      
      validateToken();
    } else {
      setIsValidatingToken(false);
    }
  }, [location.search]);

  // Show beta gate if no access (except on beta-gate page itself)
  // Wait for token validation to complete first
  const hasAccess = sessionStorage.getItem('beta_access_granted') === 'true';
  const currentPath = location.pathname;
  
  // Show loading while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Validating access...</p>
        </div>
      </div>
    );
  }
  
  if (!hasAccess && currentPath !== '/beta-gate') {
    return <BetaGate />;
  }
  
  // If on beta-gate route but has access, redirect
  if (hasAccess && currentPath === '/beta-gate') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Profile Dropdown - shown on all pages */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/95 border-b border-white/10 transition-all duration-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link 
            to="/"
            className="flex items-center space-x-4 group cursor-pointer"
          >
            <div className="relative">
              <img 
                src="/NEWANDRO.png" 
                alt="Androama" 
                className="w-16 h-16 transition-all duration-300 group-hover:scale-110 brightness-0 invert relative z-10 logo-glow" 
              />
            </div>
            <span className="text-2xl font-black text-gray-100 font-acquire tracking-[10px] transition-all duration-300 group-hover:text-gray-50" style={{ letterSpacing: '10px', fontWeight: 900 }}>
              ANDROAMA
            </span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="/#download" 
              className="text-gray-300 hover:text-white transition-all duration-300 font-sans text-sm font-semibold uppercase tracking-wider relative group"
            >
              DOWNLOAD
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
            </a>
            {user && (
              <Link 
                to="/community" 
                className="text-gray-300 hover:text-white transition-all duration-300 font-sans text-sm font-semibold uppercase tracking-wider relative group"
              >
                COMMUNITY
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-6">
            {!loading && (
              <>
                {user ? (
                  <ProfileDropdown />
                ) : (
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Welcome Notification */}
      {welcomeMessage && (
        <WelcomeNotification
          message={welcomeMessage}
          onClose={() => setWelcomeMessage(null)}
        />
      )}

      {/* Main Content */}
      <main className="pt-24">
        <Routes>
          <Route path="/beta-gate" element={<BetaGate />} />
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <Register />} 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <CommunityHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
