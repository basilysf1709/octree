'use client';

import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';

export default function CookiePolicy() {
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
            <h1 className="font-serif text-5xl font-bold text-blue-900">Cookie Policy</h1>
            <div className="mx-auto mt-4 h-1 w-20 bg-blue-300"></div>
            <p className="mt-6 text-blue-700">Last Updated: Apr 1, 2025</p>
          </div>

          <div className="prose prose-blue mx-auto max-w-full">
            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">1. Introduction</h2>
              <p className="mt-4 text-blue-700">
                This Cookie Policy explains how Octree (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses cookies and similar technologies 
                to recognize you when you visit our LaTeX editing platform. It explains what these technologies are 
                and why we use them, as well as your rights to control our use of them.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">2. What Are Cookies?</h2>
              <p className="mt-4 text-blue-700">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
                as well as to provide reporting information.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">3. Types of Cookies We Use</h2>
              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">3.1 Essential Cookies</h3>
              <p className="mt-2 text-blue-700">
                These cookies are necessary for the website to function and cannot be switched off in our systems. 
                They are usually only set in response to actions made by you which amount to a request for services, 
                such as setting your privacy preferences, logging in, or filling in forms.
              </p>

              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">3.2 Performance Cookies</h3>
              <p className="mt-2 text-blue-700">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
                of our site. They help us to know which pages are the most and least popular and see how visitors 
                move around the site.
              </p>

              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">3.3 Functional Cookies</h3>
              <p className="mt-2 text-blue-700">
                These cookies enable the website to provide enhanced functionality and personalization. They may be set 
                by us or by third-party providers whose services we have added to our pages.
              </p>

              <h3 className="mt-5 font-serif text-xl font-bold text-blue-800">3.4 Targeting Cookies</h3>
              <p className="mt-2 text-blue-700">
                These cookies may be set through our site by our advertising partners. They may be used by those companies 
                to build a profile of your interests and show you relevant advertisements on other sites.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">4. How We Use Cookies</h2>
              <p className="mt-4 text-blue-700">
                We use cookies for the following purposes:
              </p>
              <ul className="mt-2 list-disc pl-6 text-blue-700">
                <li>To authenticate users and prevent fraudulent use of user accounts</li>
                <li>To remember your preferences and settings</li>
                <li>To analyze how our website is used so we can improve it</li>
                <li>To help us develop and improve our LaTeX editing features</li>
                <li>To save your session state for our LaTeX editor</li>
                <li>To identify you when you sign in and provide personalized features</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">5. Your Cookie Choices</h2>
              <p className="mt-4 text-blue-700">
                Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, 
                or to alert you when cookies are being sent. The Help portion of the toolbar on most browsers will tell 
                you how to prevent your browser from accepting new cookies, how to have the browser notify you when you 
                receive a new cookie, or how to disable cookies altogether.
              </p>
              <p className="mt-4 text-blue-700">
                Please note that if you choose to remove or reject cookies, this could affect the availability and 
                functionality of our Service, particularly features that require you to be signed in.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">6. Third-Party Cookies</h2>
              <p className="mt-4 text-blue-700">
                We may use third-party analytics services, such as Google Analytics, to help us understand how users 
                engage with our website. These services may use cookies to collect information about your use of our website.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">7. Updates to This Policy</h2>
              <p className="mt-4 text-blue-700">
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, 
                or our business practices. Any changes will be posted on this page, and if the changes are significant, 
                we will provide a more prominent notice.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-blue-800">8. Contact Us</h2>
              <p className="mt-4 text-blue-700">
                If you have any questions about our use of cookies, please contact us at:
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