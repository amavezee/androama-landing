import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Search } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is ANDROAMA?',
    answer: 'ANDROAMA is a professional Android device management platform that allows you to remotely monitor, control, and manage Android devices. It provides features like screen mirroring, file management, app installation, camera access, and device control - all from a single desktop application.'
  },
  {
    category: 'Getting Started',
    question: 'Do I need to install anything on my Android device?',
    answer: 'For basic features like screen mirroring, file management, and app installation, you only need to enable USB debugging on your Android device. However, for advanced features like messaging access, notification monitoring, and photo access, you\'ll need to install the ANDROAMA client app on your Android device.'
  },
  {
    category: 'Getting Started',
    question: 'What are the system requirements?',
    answer: 'Desktop: Windows 10/11 (64-bit), 4GB RAM minimum, 500MB free disk space, and an internet connection. Android: Android 7.0 or higher, USB debugging enabled, and WiFi or USB connection capability.'
  },
  {
    category: 'Getting Started',
    question: 'How do I connect my Android device?',
    answer: '1. Enable USB debugging on your Android device (Settings > About Phone > tap Build Number 7 times, then Settings > Developer Options > enable USB debugging). 2. Connect your device via USB or ensure both devices are on the same WiFi network. 3. Open ANDROAMA desktop app and follow the connection wizard. The app will guide you through the setup process.'
  },

  // Features
  {
    category: 'Features',
    question: 'What features are available without the client app?',
    answer: 'You can use screen mirroring, file management, app installation/uninstallation, device control, camera access, instant snapshots, and battery monitoring without installing the client app. These features work directly through ADB (Android Debug Bridge).'
  },
  {
    category: 'Features',
    question: 'What features require the client app?',
    answer: 'Advanced features like messaging (SMS) access, notification monitoring, and photo gallery access require the ANDROAMA client app to be installed on your Android device. The client app provides deeper system integration for these features.'
  },
  {
    category: 'Features',
    question: 'Can I record my device screen?',
    answer: 'Yes! ANDROAMA supports background recording of any app activity, including Snapchat, Instagram, WhatsApp, TikTok, and more. The recording feature works automatically and can capture all screen activity even when apps are running in the background.'
  },
  {
    category: 'Features',
    question: 'Can I access my device camera remotely?',
    answer: 'Yes, ANDROAMA allows you to access both front and back cameras of your connected Android device remotely. You can view live camera feeds and capture photos directly from the desktop application.'
  },
  {
    category: 'Features',
    question: 'How does file management work?',
    answer: 'ANDROAMA provides complete file system access to your Android device. You can browse, download, and upload files between your computer and Android device. The file browser supports all standard file operations including copy, move, delete, and create folders.'
  },

  // Account & Subscription
  {
    category: 'Account & Subscription',
    question: 'Do I need an account to use ANDROAMA?',
    answer: 'Yes, you need to create a free account to use ANDROAMA. This allows us to sync your device connections across installations and provide cloud features. You can sign up with email or use Google OAuth for quick registration.'
  },
  {
    category: 'Account & Subscription',
    question: 'What subscription plans are available?',
    answer: 'ANDROAMA offers different editions: Monitor Edition (basic features), Parental Edition (parental controls), Enterprise Edition (business features), and Ultimate Edition (all features). Each edition has different capabilities and limitations. Check the pricing page for detailed feature comparisons.'
  },
  {
    category: 'Account & Subscription',
    question: 'Can I change my subscription plan?',
    answer: 'Yes, you can upgrade or downgrade your subscription plan at any time from your account settings. Changes take effect immediately, and billing will be prorated accordingly.'
  },
  {
    category: 'Account & Subscription',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your account profile page. Cancellation takes effect at the end of your current billing period. You\'ll continue to have access to paid features until the end of your billing cycle.'
  },

  // Technical
  {
    category: 'Technical',
    question: 'Is my data secure?',
    answer: 'Yes, ANDROAMA takes security seriously. All device monitoring data is stored locally on your computer and never transmitted to our servers unless you explicitly enable cloud features. Account information is encrypted, and all data transmission uses SSL/TLS encryption. Passwords are hashed using industry-standard algorithms.'
  },
  {
    category: 'Technical',
    question: 'What is USB debugging and is it safe?',
    answer: 'USB debugging is a developer feature in Android that allows your computer to communicate with your Android device. It\'s safe when used with trusted applications like ANDROAMA. However, you should only enable it when needed and disable it when not in use for additional security.'
  },
  {
    category: 'Technical',
    question: 'Can I use ANDROAMA wirelessly?',
    answer: 'Yes, ANDROAMA supports both USB and WiFi connections. For WiFi connection, both your computer and Android device need to be on the same network. The initial setup may require a USB connection, but subsequent connections can be wireless.'
  },
  {
    category: 'Technical',
    question: 'Does ANDROAMA work with all Android devices?',
    answer: 'ANDROAMA works with most Android devices running Android 7.0 (Nougat) or higher. Some features may vary depending on your device manufacturer and Android version. Root access is not required for most features, but some advanced capabilities may benefit from root access.'
  },
  {
    category: 'Technical',
    question: 'What if my device disconnects?',
    answer: 'ANDROAMA will automatically attempt to reconnect if your device disconnects. If automatic reconnection fails, you can manually reconnect through the device list. Make sure USB debugging remains enabled and your connection (USB or WiFi) is stable.'
  },

  // Legal & Privacy
  {
    category: 'Legal & Privacy',
    question: 'Is it legal to monitor Android devices?',
    answer: 'The legality of monitoring devices depends on your jurisdiction and the circumstances. Generally, you can legally monitor devices you own or have explicit permission to monitor. Monitoring devices without consent may be illegal. Always ensure you comply with local privacy and surveillance laws.'
  },
  {
    category: 'Legal & Privacy',
    question: 'Can I monitor someone else\'s device?',
    answer: 'You should only monitor devices you own or have explicit written consent to monitor. Monitoring someone else\'s device without their knowledge or consent may violate privacy laws and could be illegal. ANDROAMA is intended for legitimate use cases like parental control (with consent), device management, and personal device monitoring.'
  },
  {
    category: 'Legal & Privacy',
    question: 'What data does ANDROAMA collect?',
    answer: 'ANDROAMA collects account information (email, username), device connection metadata, and application usage statistics. All device monitoring data (screenshots, files, messages) is stored locally on your computer and is never sent to our servers unless you explicitly enable cloud features. See our Privacy Policy for complete details.'
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'My device is not connecting. What should I do?',
    answer: '1. Ensure USB debugging is enabled on your Android device. 2. Check that your USB cable supports data transfer (not just charging). 3. Try a different USB port or cable. 4. For WiFi connection, ensure both devices are on the same network. 5. Restart both your computer and Android device. 6. Check that ANDROAMA has necessary permissions on your computer.'
  },
  {
    category: 'Troubleshooting',
    question: 'Screen mirroring is laggy or not working',
    answer: 'Screen mirroring performance depends on your connection speed and device capabilities. For USB connections, use a USB 3.0 port if available. For WiFi, ensure a stable 5GHz connection. Close unnecessary apps on your Android device to free up resources. Lower the mirroring resolution in settings if needed.'
  },
  {
    category: 'Troubleshooting',
    question: 'I forgot my password. How do I reset it?',
    answer: 'If you forgot your password, click "Forgot Password" on the login page. You\'ll receive an email with instructions to reset your password. If you signed up with Google OAuth, you can continue using Google sign-in or set a password in your account settings.'
  },
  {
    category: 'Troubleshooting',
    question: 'The client app is not installing on my Android device',
    answer: 'Make sure "Install from Unknown Sources" is enabled in your Android settings. The client app may require Android 7.0 or higher. Check that you have sufficient storage space. If installation still fails, try downloading the APK directly from the ANDROAMA desktop app.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-gray-400">Find answers to common questions about ANDROAMA</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No FAQs found matching your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden transition-all hover:border-gray-700"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white pr-8">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

