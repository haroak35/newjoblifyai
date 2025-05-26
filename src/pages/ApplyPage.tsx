import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Menu, X, ArrowRight, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ApplyPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    resume: null as File | null,
    coverLetter: ''
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      fetchJobByCode(code);
    }
    setLoading(false);
  }, [searchParams]);

  const fetchJobByCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('code', code)
        .eq('status', 'live')
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Job not found or no longer accepting applications');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    setError(null);

    try {
      // Upload resume
      let resumeUrl = null;
      if (formData.resume) {
        const fileExt = formData.resume.name.split('.').pop();
        const fileName = `${job.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resume);

        if (uploadError) throw uploadError;
        resumeUrl = fileName;
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('applicants')
        .insert({
          job_id: job.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          resume_url: resumeUrl,
          cover_letter: formData.coverLetter
        });

      if (applicationError) throw applicationError;

      setSuccess(true);
      window.location.href = '/apply/success';
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
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
              <Link to="/pricing" className="text-neutral-700 hover:text-neutral-900 font-medium">
                Pricing
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
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
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
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <p className="text-neutral-600">Loading...</p>
          </div>
        ) : !job ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h1 className="text-2xl font-bold text-neutral-800 mb-6">Apply for a Position</h1>
            <div className="space-y-6">
              <p className="text-neutral-600">
                Enter the job code provided to you to access the application form.
              </p>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Job Code
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter job code"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Continue
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h1 className="text-2xl font-bold text-neutral-800 mb-2">{job.title}</h1>
              <p className="text-neutral-600">{job.company}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Resume
                </label>
                <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0] || null })}
                    className="hidden"
                    id="resume"
                    required
                  />
                  <label
                    htmlFor="resume"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload size={24} className="text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600">
                      {formData.resume ? formData.resume.name : 'Click to upload your resume'}
                    </span>
                    <span className="text-xs text-neutral-500 mt-1">
                      PDF, DOC, or DOCX up to 10MB
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  className="form-input min-h-[200px]"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center px-4 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplyPage;