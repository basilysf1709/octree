import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OctreeLogo } from '@/components/icons/octree-logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <OctreeLogo className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-blue-900">Octree</span>
              </Link>
              <div className="hidden md:flex items-center ml-10 space-x-8">
                <Link href="#features" className="text-blue-600 hover:text-blue-800">Features</Link>
                <Link href="#pricing" className="text-blue-600 hover:text-blue-800">Pricing</Link>
                <Link href="#docs" className="text-blue-600 hover:text-blue-800">Documentation</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-blue-600 hover:text-blue-800">
                Sign in
              </Link>
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-grid-blue-600/[0.03] -z-10" />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-sm font-medium text-blue-600">Now in public beta</span>
            </div>
            <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 bg-clip-text text-transparent leading-tight">
              Write LaTeX Documents with Octree
            </h1>
            <p className="text-2xl mb-10 text-blue-800 max-w-2xl mx-auto">
              The intelligent LaTeX editor that makes academic writing feel natural and effortless
            </p>
            <div className="flex gap-4 justify-center items-center">
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full">
                  Start Writing Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg rounded-full">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                  </svg>
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-blue-600">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Free for students
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-y border-blue-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto py-16 px-4">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">Beta</h3>
              <p className="text-blue-800">Development Stage</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">5+</h3>
              <p className="text-blue-800">LaTeX Templates</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">AI</h3>
              <p className="text-blue-800">Powered Editor</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">100%</h3>
              <p className="text-blue-800">Open Source</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-blue-900">
            Powerful Features
          </h2>
          <p className="text-blue-600 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to create professional LaTeX documents with ease
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900">{feature.title}</h3>
                <p className="text-blue-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-blue-900">
            How It Works
          </h2>
          <p className="text-blue-600 text-center mb-16 max-w-2xl mx-auto">
            Get started in minutes with our intuitive workflow
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900">{step.title}</h3>
                <p className="text-blue-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-blue-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-blue-600 text-center mb-16 max-w-2xl mx-auto">
            Start with a free trial, then choose the plan that works for you
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="rounded-2xl border border-blue-200 p-8 bg-blue-50">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Free Trial</h3>
              <p className="text-blue-600 mb-4">Perfect for getting started</p>
              <div className="text-4xl font-bold text-blue-900 mb-6">
                $0 <span className="text-lg font-normal text-blue-600">/week</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full access to all features
                </li>
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-powered assistance
                </li>
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  7 days trial period
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Start Free Trial
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border border-blue-600 p-8 bg-white shadow-lg relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Pro</h3>
              <p className="text-blue-600 mb-4">For individual researchers</p>
              <div className="text-4xl font-bold text-blue-900 mb-6">
                $20 <span className="text-lg font-normal text-blue-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free Trial
                </li>
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited documents
                </li>
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-blue-200 p-8 bg-blue-50">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Enterprise</h3>
              <p className="text-blue-600 mb-4">For teams and organizations</p>
              <div className="text-4xl font-bold text-blue-900 mb-6">
                Custom
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom integrations
                </li>
                <li className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Transform Your LaTeX Workflow?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of researchers and students who are already using Octree
          </p>
          <Link href="/auth">
            <Button className="bg-white hover:bg-blue-50 text-blue-600 px-8 py-6 text-lg">
              Start Writing Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Octree</h3>
              <p className="text-blue-200 mb-4">
                Making LaTeX writing easier and more efficient with AI assistance.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.href} className="text-blue-200 hover:text-white">
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.href} className="text-blue-200 hover:text-white">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-200">
            <p>© 2025 Octree. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "1M+", label: "Documents Created" },
  { value: "50+", label: "Templates" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  {
    title: "Sign Up",
    description: "Create your free account in seconds",
  },
  {
    title: "Choose Template",
    description: "Select from our pre-built templates",
  },
  {
    title: "Write & Edit",
    description: "Use AI assistance to write faster",
  },
  {
    title: "Export & Share",
    description: "Download as PDF or share with others",
  },
];

const features = [
  {
    title: "AI-Powered Assistance",
    description: "Get intelligent suggestions and autocompletions as you write your LaTeX documents.",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
  },
  {
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time, with instant updates and version control.",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>,
  },
  {
    title: "PDF Preview",
    description: "See your changes instantly with our built-in PDF preview feature.",
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>,
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const socialLinks = [
  {
    icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    href: "#",
  },
  {
    icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
    href: "#",
  },
  {
    icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.819-.26.819-.578 0-.284-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.755-1.332-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>,
    href: "#",
  },
];
