import { useState, useEffect, useRef } from 'react';
import { Monitor, Camera, MessageSquare, FolderOpen, Smartphone, Zap, Image, Video, Bell, Battery, Package, ArrowRight, Check, Play, ExternalLink } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const roadmapRef = useRef<HTMLElement>(null);
  const downloadRef = useRef<HTMLElement>(null);

  // Enterprise-grade smooth scroll animations with GSAP
  useEffect(() => {
    // Section fade-ins with parallax
    const sections = [
      { ref: featuresRef },
      { ref: roadmapRef },
      { ref: downloadRef },
    ];

    sections.forEach(({ ref }) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 80, scale: 0.97 },
          {
              opacity: 1, 
              y: 0, 
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 85%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Subtle parallax effect
          gsap.to(ref.current, {
          y: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top bottom',
              end: 'bottom top',
            scrub: 1.5,
            },
          });
      }
    });

    // Staggered feature card animations with hover scale
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.93, rotateX: 5 },
        {
            opacity: 1,
            y: 0,
          scale: 1,
          rotateX: 0,
            duration: 0.8,
            ease: 'power3.out',
          delay: index * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Animate roadmap timeline cards
    const roadmapCards = document.querySelectorAll('.roadmap-card');
    roadmapCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: index % 2 === 0 ? -40 : 40, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
          delay: index * 0.12,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Subtle mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Monitor className="w-8 h-8" />,
      title: 'Screen Mirroring',
      description: 'View your device screen in real-time with ultra-low latency. Perfect for presentations, demonstrations, and monitoring.',
      videoPlaceholder: 'screen-mirroring',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Background Recording',
      description: 'Record ANY app activity - Snapchat, Instagram, WhatsApp, TikTok - everything! Stay in COMPLETE CONTROL with automatic app detection.',
      videoPlaceholder: 'background-recording',
      badge: 'Total Control',
      badgeColor: 'purple',
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Live Camera View',
      description: 'Access front and back cameras remotely. Monitor surroundings with crystal-clear live video feeds.',
      videoPlaceholder: 'camera-view',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Instant Snapshots',
      description: 'Capture screenshots from any device instantly. Save, organize, and review snapshots with full metadata.',
      videoPlaceholder: 'snapshots',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Messaging Access',
      description: 'View and send SMS messages remotely. Full conversation history at your fingertips. Requires Androama client app.',
      videoPlaceholder: 'messaging',
      badge: 'Requires Client',
      badgeColor: 'blue',
    },
    {
      icon: <FolderOpen className="w-8 h-8" />,
      title: 'File Management',
      description: 'Browse, download, and upload files between devices. Complete file system access with intuitive interface.',
      videoPlaceholder: 'files',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: 'Photo Access',
      description: 'View, download, and manage photos from connected devices. Full gallery access with metadata preservation.',
      videoPlaceholder: 'photos',
      badge: 'Requires Client',
      badgeColor: 'blue',
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Notification Monitoring',
      description: 'Real-time notification tracking and history. Never miss important alerts from monitored devices.',
      videoPlaceholder: 'notifications',
      badge: 'Requires Client',
      badgeColor: 'blue',
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'App Management',
      description: 'Install, uninstall, and manage applications remotely. Deploy APKs over-the-air with version control.',
      videoPlaceholder: 'apps',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
    {
      icon: <Battery className="w-8 h-8" />,
      title: 'Battery Monitoring',
      description: 'Track battery levels, charging status, and usage patterns. Comprehensive device health insights.',
      videoPlaceholder: 'battery',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Device Control',
      description: 'Execute ADB commands, reboot devices, and control settings remotely. Full administrative capabilities.',
      videoPlaceholder: 'control',
      badge: 'No Client Required',
      badgeColor: 'green',
    },
  ];

  const roadmapItems = [
    {
      phase: 'Current',
      title: 'Androama Core',
      status: 'Live',
      items: [
        'Screen mirroring & recording',
        'File management & transfers',
        'Messaging with client app',
        'Camera live view',
        'Snapshots & screenshots',
        'Device control & monitoring',
        'Battery status & usage metrics',
        'App management & installation',
        'Community hub for user engagement',
      ],
    },
    {
      phase: 'In Development',
      title: 'Enhanced Features',
      status: 'In Development',
      items: [
        'Improved UI/UX refinements',
        'Multi-device dashboard enhancements',
        'Advanced notification forwarding',
        'Call log integration',
        'Location tracking',
        'Enhanced automation tools',
        'Better device connection stability',
        'OTA update system improvements',
      ],
    },
    {
      phase: 'Planned',
      title: 'Upcoming Features',
      status: 'Planned',
      items: [
        'Cloud synchronization (optional)',
        'Advanced analytics & reporting',
        'Custom plugins & integrations',
        'API access for developers',
        'Enhanced security features',
        'Performance optimizations',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-black -z-10" />
      
      {/* Animated gradient orbs with pulsing effect */}
      <div className="fixed inset-0 -z-5 opacity-30">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-[120px] animate-enterprise-float-enhanced animate-pulse"
            style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            animation: 'enterprise-float-enhanced 10s ease-in-out infinite, pulse 8s ease-in-out infinite',
            }}
          />
          <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-full blur-[120px] animate-enterprise-float-enhanced"
            style={{
            animationDelay: '3s',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            animation: 'enterprise-float-enhanced 10s ease-in-out infinite 3s, pulse 6s ease-in-out infinite 2s',
            }}
          />
        <div 
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-purple-600/15 to-pink-600/15 rounded-full blur-[100px]"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            animation: 'pulse 10s ease-in-out infinite 5s',
          }}
        />
      </div>

      {/* Navigation removed - using App.tsx header instead */}

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <span className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm font-medium text-purple-300">
              Professional Android Device Management
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'Acquire, sans-serif' }}>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-enterprise-shimmer-enhanced bg-[length:200%_100%]">
              ANDROAMA
                  </span>
              </h1>
          
          <p className="text-2xl md:text-3xl text-gray-400 mb-4 font-light">
            Monitor, Control, and Manage
          </p>
          
          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional-grade Android device management platform. Screen mirroring, file transfers, 
            messaging, camera access, and complete device control — all from one powerful interface.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
            <a
              href="#download"
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Download Now</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="relative overflow-hidden px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Explore Features</span>
            </a>
          </div>

          {/* Hero Image/Video Placeholder */}
          <div className="mt-16 relative group animate-fade-in-up">
            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:border-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
              <div className="text-center">
                <Play className="w-20 h-20 mx-auto mb-4 text-white/40 group-hover:text-white/60 group-hover:scale-110 transition-all duration-300" />
                <p className="text-gray-500 group-hover:text-gray-400 transition-colors">Product Demo Video</p>
            </div>
          </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500 pointer-events-none" />
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Powerful Features
              </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage Android devices remotely. Built for professionals, 
              designed for simplicity.
              </p>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {feature.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 ${
                      feature.badgeColor === 'green' ? 'bg-green-600/30 border-green-500/50 text-green-300' :
                      feature.badgeColor === 'blue' ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' :
                      'bg-purple-600/30 border-purple-500/50 text-purple-300'
                    } border rounded-full text-xs font-medium`}>
                      {feature.badge}
                    </span>
                    </div>
                )}
                
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-purple-500/50">
                  {feature.icon}
            </div>

                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>
                
                {/* Video Preview Placeholder */}
                <div className="relative aspect-video bg-black/40 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500" />
                  <div className="text-center relative z-10">
                    <Play className="w-10 h-10 mx-auto mb-2 text-white/30 group-hover:text-white/60 group-hover:scale-110 transition-all duration-300" />
                    <p className="text-xs text-gray-600 group-hover:text-gray-500">Preview Video</p>
                  </div>
                </div>
                    </div>
              ))}
            </div>
          </div>
        </section>

      {/* Roadmap Section */}
      <section ref={roadmapRef} id="roadmap" className="py-32 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Product Roadmap
              </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We're constantly evolving. Here's what we're working on to make Androama even better.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roadmapItems.map((item, index) => (
              <div
                key={index}
                className="roadmap-card relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="mb-4">
                  <span className="text-sm font-semibold text-purple-400">{item.phase}</span>
              </div>

                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                
                <div className="mb-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Live'
                        ? 'bg-green-600/20 text-green-400 border border-green-500/50'
                        : item.status === 'In Development'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                        : 'bg-gray-600/20 text-gray-400 border border-gray-500/50'
                    }`}
                  >
                    {item.status}
                  </span>
              </div>

                <ul className="space-y-3">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex} className="flex items-start space-x-2 text-gray-400">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0 text-purple-400" />
                      <span className="text-sm leading-relaxed">{subItem}</span>
                    </li>
                  ))}
                </ul>
                    </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">
              Have suggestions? Join our community and help shape the future of Androama.
            </p>
            <Link
              to="/community"
              className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span className="font-medium">Visit Community Hub</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            </div>
          </div>
        </section>

      {/* Download Section */}
      <section ref={downloadRef} id="download" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Get Started Today
            </h2>
          <p className="text-xl text-gray-400 mb-12">
            Download Androama and start managing your Android devices like a pro.
          </p>

          <div className="flex justify-center mb-12">
            <div className="max-w-md w-full p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-4">Windows Desktop</h3>
              <p className="text-gray-400 mb-6">
                Full-featured desktop application for Windows 10/11
              </p>
              <button
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                onClick={async () => {
                  if (!user) {
                    navigate('/login?redirect=/#download');
                    return;
                  }
                  
                  // Mark as downloaded
                  try {
                    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/profile/mark-downloaded`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    // Update user in context
                    const updatedUser = { ...user, has_downloaded: true };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    // Open download link (replace with actual URL)
                    window.open('#', '_blank'); // Replace '#' with actual download URL
                    alert('Thank you for downloading ANDROAMA! The download will start shortly.');
                  } catch (error) {
                    console.error('Error marking download:', error);
                    // Still allow download even if marking fails
                    window.open('#', '_blank'); // Replace '#' with actual download URL
                  }
                }}
              >
                <span>Download for Windows</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500 mt-4">
                * Android client app available in-app for messaging features
              </p>
              </div>
              </div>

          <div className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">System Requirements</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-purple-400 mb-3">Desktop</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Windows 10/11 (64-bit)</li>
                  <li>• 4GB RAM minimum</li>
                  <li>• 500MB free disk space</li>
                  <li>• Internet connection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-pink-400 mb-3">Android</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Android 7.0 or higher</li>
                  <li>• USB debugging enabled</li>
                  <li>• Client app for messaging</li>
                  <li>• WiFi or USB connection</li>
                </ul>
              </div>
            </div>
              </div>
                    </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/NEWANDRO.png" alt="Androama" className="h-8 w-auto" />
                <span className="text-xl font-bold">ANDROAMA</span>
                    </div>
              <p className="text-gray-400 text-sm">
                Professional Android device management platform for monitoring and control.
                  </p>
                    </div>
                    <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="/#roadmap" className="hover:text-white transition-colors cursor-pointer">Roadmap</a></li>
                <li><a href="/#download" className="hover:text-white transition-colors cursor-pointer">Download</a></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Community Hub</Link></li>
              </ul>
                    </div>
                    <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Community Hub</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
                    </div>
                  </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Androama. All rights reserved.</p>
            </div>
          </div>
        </footer>
    </div>
  );
}

export default Home;
