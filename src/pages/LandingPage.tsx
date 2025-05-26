import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import CookieBar from '../components/CookieBar';
import { Link } from 'react-router-dom';

const DashboardPreview = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">Senior Frontend Developer</h3>
            <p className="text-sm text-neutral-600">TechCorp Inc.</p>
          </div>
          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Live</span>
        </div>
        <div className="space-y-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Applicant Analysis</span>
              <span className="text-sm font-medium text-neutral-800">24 Processed</span>
            </div>
            <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-900 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <span className="text-sm text-neutral-600">Match Rate</span>
              <p className="text-lg font-semibold text-neutral-900">78%</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <span className="text-sm text-neutral-600">Processing</span>
              <p className="text-lg font-semibold text-neutral-900">Real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-neutral-800">Joblify</Link>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            <div className="hidden lg:flex items-center gap-4">
              <Link to="/pricing" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Pricing
              </Link>
              <Link to="/apply" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Apply for Jobs
              </Link>
              <Link to="/login" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Sign in
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-[#FF7F50] text-white rounded-xl hover:bg-[#FF6B3D] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div className={`lg:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-64' : 'max-h-0'} overflow-hidden bg-white border-t border-neutral-200`}>
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Pricing
            </Link>
            <Link
              to="/apply"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Apply for Jobs
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium bg-[#FF7F50] text-white hover:bg-[#FF6B3D]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
                    Smarter Hiring.
                    <br />
                    <span className="text-[#FF7F50]">Instantly.</span>
                  </h2>
                  <p className="text-base text-neutral-600 mb-8 max-w-2xl">
                    Joblify helps companies instantly score and sort applicant CVs — no complex software or setup. Just share a code and get results.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link 
                      to="/signup" 
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#FF7F50] text-white rounded-xl hover:bg-[#FF6B3D] transition-colors text-lg font-medium"
                    >
                      Try Joblify Free
                      <ArrowRight size={20} className="ml-2" />
                    </Link>
                    <a 
                      href="#how-it-works" 
                      className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-800 rounded-xl hover:bg-neutral-50 transition-colors text-lg font-medium"
                    >
                      See How It Works
                    </a>
                  </div>
                </div>
                <div className="flex-1">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>

          <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                  Everything you need to hire better
                </h2>
                <p className="text-xl text-neutral-600">
                  Streamline your hiring process with powerful features
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Shield className="w-8 h-8 text-[#FF7F50]" />}
                  title="Smart Job Postings"
                  description="Create detailed job listings with AI-powered candidate matching criteria"
                />
                <FeatureCard
                  icon={<CheckCircle className="w-8 h-8 text-[#FF7F50]" />}
                  title="Applicant Tracking"
                  description="Manage and review candidates in a streamlined, organized system"
                />
                <FeatureCard
                  icon={<Shield className="w-8 h-8 text-[#FF7F50]" />}
                  title="Secure Platform"
                  description="Enterprise-grade security to protect your hiring data"
                />
              </div>
            </div>
          </div>

          <div className="py-20 bg-[#212121] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your hiring?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Get started with Joblify today and see the difference
              </p>
              <Link 
                to="/signup" 
                className="inline-flex items-center px-6 py-3 bg-[#FF7F50] text-white rounded-xl hover:bg-[#FF6B3D] transition-colors text-lg font-medium"
              >
                Start Free Trial
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-neutral-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/docs/getting-started" className="text-neutral-600 hover:text-neutral-900">Features</Link></li>
                <li><Link to="/pricing" className="text-neutral-600 hover:text-neutral-900">Pricing</Link></li>
                <li><Link to="/docs/how-it-works" className="text-neutral-600 hover:text-neutral-900">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/docs/getting-started" className="text-neutral-600 hover:text-neutral-900">About</Link></li>
                <li><Link to="/docs/contact" className="text-neutral-600 hover:text-neutral-900">Careers</Link></li>
                <li><Link to="/docs/contact" className="text-neutral-600 hover:text-neutral-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/docs/getting-started" className="text-neutral-600 hover:text-neutral-900">Blog</Link></li>
                <li><Link to="/docs/faq" className="text-neutral-600 hover:text-neutral-900">Help Center</Link></li>
                <li><Link to="/docs/getting-started" className="text-neutral-600 hover:text-neutral-900">Guides</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/docs/privacy" className="text-neutral-600 hover:text-neutral-900">Privacy</Link></li>
                <li><Link to="/docs/terms" className="text-neutral-600 hover:text-neutral-900">Terms</Link></li>
                <li><Link to="/docs/privacy" className="text-neutral-600 hover:text-neutral-900">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-neutral-200 text-center text-neutral-600">
            © {new Date().getFullYear()} Joblify. All rights reserved.
          </div>
        </div>
      </footer>
      <CookieBar />
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
};

export default LandingPage;