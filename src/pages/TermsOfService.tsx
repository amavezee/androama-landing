import { Link } from 'react-router-dom';
import { FileText, Scale, AlertTriangle, Shield, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
            <Scale className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Terms of Service
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
              1. Agreement to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using ANDROAMA ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              These Terms apply to all users of the Service, including without limitation users who are browsers, customers, merchants, and contributors of content.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              ANDROAMA is a professional Android device management platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Remote screen mirroring and recording capabilities</li>
              <li>File management and transfer between devices</li>
              <li>Application management and installation</li>
              <li>Device monitoring and control features</li>
              <li>Camera access and live viewing</li>
              <li>Messaging and notification monitoring (with client app)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-300 leading-relaxed">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Account Responsibility</h3>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to protect your account information.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              4. Acceptable Use Policy
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Monitor devices without proper authorization or consent</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others, including privacy and intellectual property rights</li>
              <li>Transmit malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorized access to systems or networks</li>
              <li>Use the Service for illegal surveillance or stalking</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Reverse engineer, decompile, or disassemble the software</li>
              <li>Resell, redistribute, or sublicense the Service</li>
            </ul>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-white font-semibold mb-1">Legal Compliance</p>
                  <p className="text-gray-300 text-sm">
                    You are solely responsible for ensuring your use of ANDROAMA complies with all applicable laws, including privacy laws, surveillance laws, and employment laws. Unauthorized monitoring may be illegal in your jurisdiction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service, including its original content, features, and functionality, is owned by ANDROAMA and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software.
            </p>
          </section>

          {/* Subscriptions and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Subscriptions and Payments</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 Subscription Plans</h3>
            <p className="text-gray-300 leading-relaxed">
              ANDROAMA offers various subscription plans with different features and limitations. Subscription fees are billed in advance on a recurring basis.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 Payment Terms</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>All fees are non-refundable except as required by law</li>
              <li>Prices may change with 30 days' notice to existing subscribers</li>
              <li>You authorize us to charge your payment method for all fees</li>
              <li>Failed payments may result in service suspension</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Cancellation</h3>
            <p className="text-gray-300 leading-relaxed">
              You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. You will continue to have access to paid features until the end of your billing cycle.
            </p>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-300 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Obtaining proper consent before monitoring any device</li>
              <li>Complying with data protection laws (GDPR, CCPA, etc.)</li>
              <li>Securing data collected through the Service</li>
              <li>Notifying affected parties if data breaches occur</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimers</h2>
            <p className="text-gray-300 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
              <li>That the Service will be uninterrupted, secure, or error-free</li>
              <li>That defects will be corrected</li>
              <li>That the Service is free of viruses or harmful components</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ANDROAMA SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Damages resulting from unauthorized access or use</li>
              <li>Damages resulting from your misuse of the Service</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless ANDROAMA and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any unauthorized monitoring or surveillance activities</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Your right to use the Service will immediately cease</li>
              <li>You may request deletion of your account data</li>
              <li>All provisions that by their nature should survive termination will survive</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Your continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-white font-semibold mb-2">ANDROAMA Legal Team</p>
              <p className="text-gray-300">Email: <a href="mailto:legal@androama.com" className="text-purple-400 hover:text-purple-300">legal@androama.com</a></p>
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

