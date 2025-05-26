import React, { useState } from 'react';
import { Mail, Lock, User, Building, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return 'Password must include at least one special character';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company: company || null,
            job_role: jobRole
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned');

      // Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            company: company || null,
            job_role: jobRole,
          }
        ]);

      if (profileError) throw profileError;

      setSuccess(true);
      // After successful signup and profile creation, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('already registered') || err.message.includes('already exists')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="p-8">
        <a 
          href="/" 
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </a>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">Create an account</h1>
          <p className="text-neutral-600">Join Joblify to start hiring great talent and build your dream team.</p>
        </div>

        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6">
            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-lg flex items-center justify-between">
                <span>{error}</span>
                {error.includes('already exists') && (
                  <a 
                    href="/login" 
                    className="text-red-700 font-medium hover:text-red-800 ml-4"
                  >
                    Sign in
                  </a>
                )}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 text-sm text-green-600 bg-green-50 rounded-lg">
                Account created successfully! Redirecting to dashboard...
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="form-input pl-11"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="form-input pl-11"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-2">
                    Company (Optional)
                  </label>
                  <div className="relative">
                    <Building size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="form-input pl-11"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="jobRole" className="block text-sm font-medium text-neutral-700 mb-2">
                    Job Role
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="jobRole"
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="form-input pl-11"
                      placeholder="e.g. Hiring Manager"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input pl-11"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input pl-11"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">
                    Must be at least 8 characters with one special character
                  </p>
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-neutral-600">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-neutral-900 hover:text-neutral-700">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-neutral-900 hover:text-neutral-700">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-[#212121] text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : (
                    <>
                      Create account
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-neutral-600">
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-neutral-900 hover:text-neutral-700">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;