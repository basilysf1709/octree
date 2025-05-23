'use client';

import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
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
            <h1 className="font-serif text-5xl font-bold text-blue-900">Privacy Policy</h1>
            <div className="mx-auto mt-4 h-1 w-20 bg-blue-300"></div>
            <p className="mt-6 text-blue-700">Last Updated: Apr 1, 2025</p>
          </div>

          <div className="prose prose-blue mx-auto max-w-full">
            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">1. Introduction</h2>
              <p className="mt-4 text-blue-700">
                Welcome to Octree (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to 
                protecting your personal data. This privacy policy explains how we collect, use, and 
                safeguard your information when you use our LaTeX editing platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">2. Information We Collect</h2>
              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">2.1 Personal Data</h3>
              <p className="mt-2 text-blue-700">
                When you register for an account, we collect information such as:
              </p>
              <ul className="mt-2 list-disc pl-6 text-blue-700">
                <li>Name and email address</li>
                <li>Profile information you provide</li>
                <li>Authentication information</li>
              </ul>

              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">2.2 Document Data</h3>
              <p className="mt-2 text-blue-700">
                We store the LaTeX documents you create, edit, and compile using our service.
              </p>

              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">2.3 Usage Data</h3>
              <p className="mt-2 text-blue-700">
                We collect information about how you interact with our platform, including:
              </p>
              <ul className="mt-2 list-disc pl-6 text-blue-700">
                <li>Features you use</li>
                <li>Time spent on the platform</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">3. How We Use Your Information</h2>
              <p className="mt-4 text-blue-700">
                We use your information for the following purposes:
              </p>
              <ul className="mt-2 list-disc pl-6 text-blue-700">
                <li>To provide and maintain our service</li>
                <li>To improve our AI-powered editing features</li>
                <li>To personalize your experience</li>
                <li>To communicate with you</li>
                <li>To process payments</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">4. AI Features and Your Data</h2>
              <p className="mt-4 text-blue-700">
                Our AI-powered features process your LaTeX documents to provide suggestions and improvements. 
                We may use anonymized content to improve our AI models, but we will never share your specific 
                documents with third parties without your consent.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">5. Data Security</h2>
              <p className="mt-4 text-blue-700">
                We implement appropriate security measures to protect your personal information. However, 
                no method of transmission over the Internet or electronic storage is 100% secure, and we 
                cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">6. Your Rights</h2>
              <p className="mt-4 text-blue-700">
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <ul className="mt-2 list-disc pl-6 text-blue-700">
                <li>Right to access your data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to delete your data</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">7. Contact Us</h2>
              <p className="mt-4 text-blue-700">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@octree.com" className="text-blue-600 hover:text-blue-800">privacy@octree.com</a>
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