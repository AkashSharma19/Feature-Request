import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { ChevronLeft, ShieldCheck, Eye, Database, Share2, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 selection:bg-gray-900 selection:text-white">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mb-8 hover:bg-white text-gray-500 hover:text-gray-900 transition-all gap-2"
        >
          <ChevronLeft size={16} />
          Back to previous page
        </Button>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-teal-600 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
              <p className="text-teal-100 font-medium">Last updated: May 13, 2026</p>
            </div>
          </div>

          <div className="p-10 prose prose-gray max-w-none">
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <Eye size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">1. Information We Collect</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We collect information to provide better services to all our users. The types of information we collect include:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
                  <li><strong>Personal Information:</strong> Name, email address, and profile picture provided through Google Authentication.</li>
                  <li><strong>Usage Data:</strong> Information on how you interact with our platform, boards, and feedback requests.</li>
                  <li><strong>Cookies:</strong> We use cookies to maintain your session and improve your experience.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <Database size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">2. How We Use Information</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
                  <li>To provide and maintain our Service.</li>
                  <li>To notify you about changes to our Service.</li>
                  <li>To provide customer support and gather feedback.</li>
                  <li>To monitor the usage of our Service and detect technical issues.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <Share2 size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">3. Data Sharing and Disclosure</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell your personal data. We may share your information only in the following circumstances:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
                  <li>With your consent or at your direction.</li>
                  <li>With service providers who help us operate our platform (e.g., Firebase, ClickUp).</li>
                  <li>To comply with legal obligations or protect our rights.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <UserCheck size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">4. Your Data Rights</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
                  <li>The right to access, update, or delete the information we have on you.</li>
                  <li>The right of rectification.</li>
                  <li>The right to object or restrict processing.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <Mail size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">5. Contact Us</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us by email:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                  <span className="font-bold text-teal-600">privacy@handshake.com</span>
                </div>
              </section>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400">&copy; 2026 Hand Shake. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
