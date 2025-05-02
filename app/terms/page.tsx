'use client';

import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <OctreeLogo className="h-8 w-8 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                Octree
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-5xl font-bold text-blue-900">Terms of Service</h1>
            <div className="mx-auto mt-4 h-1 w-20 bg-blue-300"></div>
            <p className="mt-6 text-blue-700">Last Updated: Apr 1, 2025</p>
          </div>

          <div className="prose prose-blue mx-auto max-w-full">
            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">1. Acceptance of Terms</h2>
              <p className="mt-4 text-blue-700">
                By accessing or using Octree's LaTeX editing platform ("Service"), you agree to be bound by these 
                Terms of Service. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">2. Description of Service</h2>
              <p className="mt-4 text-blue-700">
                Octree provides an AI-powered LaTeX editing platform for academic and professional document creation. 
                Features include document editing, compilation, AI-assisted writing, and collaboration tools.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">3. User Accounts</h2>
              <p className="mt-4 text-blue-700">
                To use certain features of the Service, you must register for an account. You agree to provide 
                accurate information and to keep it updated. You are responsible for maintaining the confidentiality of 
                your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">4. Content Ownership</h2>
              <p className="mt-4 text-blue-700">
                You retain all rights to the LaTeX documents you create using our Service. We claim no ownership 
                over your content. However, you grant us a license to store, process, and analyze your documents 
                for the purpose of providing and improving our Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">5. Acceptable Use</h2>
              <p className="mt-4 text-blue-700">
                You agree not to use the Service to:
              </p>
              <ul className="mt-2 list-disc pl-6 text-blue-700">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Upload or transmit malicious code</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with other users' enjoyment of the Service</li>
                <li>Generate content that is illegal, harmful, or unethical using our AI features</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">6. Subscription and Payments</h2>
              <p className="mt-4 text-blue-700">
                Some features of our Service require a paid subscription. By subscribing, you agree to pay the applicable 
                fees. We may change our fees upon reasonable notice. Subscriptions automatically renew unless canceled 
                at least 24 hours before the end of the current period.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">7. Termination</h2>
              <p className="mt-4 text-blue-700">
                We reserve the right to suspend or terminate your account and access to the Service for violations of 
                these Terms. You may terminate your account at any time by contacting us.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">8. Disclaimer of Warranties</h2>
              <p className="mt-4 text-blue-700">
                The Service is provided "as is" without warranties of any kind, either express or implied. We do not 
                warrant that the Service will be error-free or uninterrupted.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">9. Limitation of Liability</h2>
              <p className="mt-4 text-blue-700">
                In no event shall Octree be liable for any indirect, incidental, special, consequential, or punitive 
                damages arising out of or related to your use of the Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">10. Changes to Terms</h2>
              <p className="mt-4 text-blue-700">
                We may modify these Terms at any time. We will provide notice of significant changes. Your continued 
                use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">11. Contact Us</h2>
              <p className="mt-4 text-blue-700">
                If you have any questions about these Terms, please contact us at:
                <br />
                <a href="mailto:legal@octree.com" className="text-blue-600 hover:text-blue-800">legal@octree.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-blue-100 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-blue-600">
          <div className="flex justify-center space-x-8">
            <Link href="/terms" className="hover:text-blue-800">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-blue-800">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-blue-800">Cookie Policy</Link>
          </div>
          <p className="mt-4 text-sm">© 2025 Octree. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 