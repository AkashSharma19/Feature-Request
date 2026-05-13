import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { ChevronLeft, Shield, Scale, FileText, Globe, Lock } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <div className="bg-gray-900 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Scale size={120} />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
              <p className="text-gray-400 font-medium">Last updated: May 13, 2026</p>
            </div>
          </div>

          <div className="p-10 prose prose-gray max-w-none">
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">1. Agreement to Terms</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using Hand Shake, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. These terms apply to all visitors, users, and others who access or use the Service.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">2. Service Description</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Hand Shake provides a platform for feedback management, roadmap visualization, and user engagement. We reserve the right to withdraw or amend our service, and any service or material we provide via the platform, in our sole discretion without notice.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">3. User Accounts</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-5">
                  <li>You are responsible for safeguarding your password.</li>
                  <li>You agree not to disclose your password to any third party.</li>
                  <li>You must notify us immediately upon becoming aware of any breach of security.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                    <Shield size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">4. Intellectual Property</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Hand Shake and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Hand Shake.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                    <Scale size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">5. Limitation of Liability</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  In no event shall Hand Shake, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400">Questions about our Terms? Contact us at <span className="font-bold text-gray-900">legal@handshake.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
