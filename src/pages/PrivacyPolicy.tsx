import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              1. Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to ANDROAMA ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our desktop application and website.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using ANDROAMA, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Account Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Email address (required for account creation)</li>
              <li>Username (optional)</li>
              <li>Password (hashed and encrypted)</li>
              <li>OAuth provider information (if you sign in with Google)</li>
              <li>Profile picture (if provided via OAuth)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Device Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Device identifiers and connection information</li>
              <li>Device model, Android version, and technical specifications</li>
              <li>Device status and last connection time</li>
              <li>Device name and custom labels you assign</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Application usage statistics and feature usage</li>
              <li>Session information and login history</li>
              <li>Error logs and diagnostic information</li>
              <li>IP addresses and connection metadata</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.4 Data from Monitored Devices</h3>
            <p className="text-gray-300 leading-relaxed">
              When you use ANDROAMA to monitor Android devices, the following data may be accessed and stored locally on your computer:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
              <li>Screenshots and screen recordings (stored locally on your device)</li>
              <li>File system information and file metadata</li>
              <li>Installed applications list</li>
              <li>Device settings and configuration data</li>
              <li>Messages and notifications (if you use the client app)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Important:</strong> All data from monitored devices is stored locally on your computer and is never transmitted to our servers unless explicitly required for cloud features you enable.
            </p>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-400" />
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>To provide, maintain, and improve our services</li>
              <li>To authenticate your account and manage user sessions</li>
              <li>To process transactions and manage subscriptions</li>
              <li>To send you important updates, security alerts, and support messages</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To analyze usage patterns and improve user experience</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              4. Data Storage and Security
            </h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Local Storage</h3>
            <p className="text-gray-300 leading-relaxed">
              All device monitoring data, screenshots, recordings, and files are stored locally on your computer. We do not have access to this data unless you explicitly choose to share it or use cloud synchronization features.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Server Storage</h3>
            <p className="text-gray-300 leading-relaxed">
              We store your account information, device connection metadata, and application preferences on secure servers. All sensitive data is encrypted both in transit and at rest.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Security Measures</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Encryption of passwords using industry-standard hashing algorithms</li>
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li><strong className="text-white">Service Providers:</strong> With trusted third-party service providers who assist in operating our services (e.g., cloud hosting, payment processing)</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong className="text-white">With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-300 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong className="text-white">Access:</strong> Request access to your personal data</li>
              <li><strong className="text-white">Correction:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your account and data</li>
              <li><strong className="text-white">Data Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong className="text-white">Account Management:</strong> Manage your account settings and preferences</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, please contact us at <a href="mailto:privacy@androama.com" className="text-purple-400 hover:text-purple-300">privacy@androama.com</a>
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed">
              Our website uses cookies and similar tracking technologies to enhance your experience. We use cookies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Authentication and session management</li>
              <li>Remembering your preferences and settings</li>
              <li>Analyzing website traffic and usage patterns</li>
              <li>Improving website functionality and performance</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our website.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              ANDROAMA is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to the transfer of your information to these countries.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-400" />
              11. Contact Us
            </h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-white font-semibold mb-2">ANDROAMA Privacy Team</p>
              <p className="text-gray-300">Email: <a href="mailto:privacy@androama.com" className="text-purple-400 hover:text-purple-300">privacy@androama.com</a></p>
              <p className="text-gray-300 mt-2">For general inquiries: <a href="mailto:support@androama.com" className="text-purple-400 hover:text-purple-300">support@androama.com</a></p>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

