import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Menu, X } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { products } from '../stripe-config';

const PricingPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentPlan(profile.subscription_tier);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/signup';
      return;
    }

    try {
      setError(null);
      setLoading(priceId);
      
      const { url } = await createCheckoutSession(priceId);
      
      if (!url) {
        throw new Error('No checkout URL returned');
      }

      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-neutral-800">
              Joblify
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/apply" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Apply for Jobs
              </Link>
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="text-neutral-700 hover:text-neutral-900 font-medium">
                    Sign in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 bg-[#FF7F50] text-white rounded-xl hover:bg-[#FF6B3D] transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`lg:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-64' : 'max-h-0'} overflow-hidden bg-white border-t border-neutral-200`}>
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/apply"
              className="block px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Apply for Jobs
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-lg bg-[#FF7F50] text-white hover:bg-[#FF6B3D]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Choose the plan that best fits your hiring needs. All plans include our core features.
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {products.map((product, index) => {
            const isCurrentPlan = currentPlan === product.name.toLowerCase();
            
            return (
              <div 
                key={product.id}
                className={`rounded-2xl border ${
                  index === 1 
                    ? 'border-[#FF7F50] shadow-xl'
                    : 'border-neutral-200'
                } bg-white p-8 relative`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#FF7F50] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">{product.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-neutral-900">
                      {product.name === 'Free' ? 'Free' : product.name === 'Startup' ? '$20' : '$50'}
                    </span>
                    {product.name !== 'Free' && (
                      <span className="text-neutral-600 ml-1">/month</span>
                    )}
                  </div>
                  <p className="text-neutral-600 text-sm">{product.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={18} className="text-[#FF7F50] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="block w-full py-2 px-4 rounded-xl text-center font-medium bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : product.name === 'Free' ? (
                  <Link
                    to="/signup"
                    className="block w-full py-2 px-4 rounded-xl text-center font-medium transition-colors bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                  >
                    Get Started
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubscribe(product.priceId)}
                    disabled={loading === product.priceId}
                    className={`block w-full py-2 px-4 rounded-xl text-center font-medium transition-colors ${
                      index === 1
                        ? 'bg-[#FF7F50] text-white hover:bg-[#FF6B3D]'
                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === product.priceId ? 'Processing...' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;