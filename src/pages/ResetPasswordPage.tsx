import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Check your email</h1>
          <p className="text-neutral-600 mb-6">
            We've sent password reset instructions to {email}
          </p>
          <a
            href="/login"
            className="inline-block text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            Return to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="p-8">
        <a 
          href="/account" 
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Account
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Reset your password</h1>
            <p className="text-neutral-600">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#212121] text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : (
                <>
                  Send Reset Link
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-neutral-600">
              Remember your password?{' '}
              <a href="/login" className="font-medium text-neutral-900 hover:text-neutral-700">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;