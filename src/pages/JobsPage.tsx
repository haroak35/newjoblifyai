import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Briefcase, MapPin, Copy, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Job } from '../types/job';
import JobDetailsPage from './JobDetailsPage';
import PostJobPage from './PostJobPage';
import { JobProvider } from '../context/JobContext';
import SkeletonCard from '../components/ui/SkeletonCard';

interface JobsPageProps {
  onSelectJob: (id: string) => void;
  onPostJob: () => void;
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account') => void;
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ isOpen, jobTitle, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Delete Job</h3>
        <p className="text-neutral-600 mb-6">
          Are you sure you want to delete "{jobTitle}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-neutral-700 hover:text-neutral-900"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Delete Job
          </button>
        </div>
      </div>
    </div>
  );
};

const JobsPage: React.FC<JobsPageProps> = ({ currentPage, onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [usageLimits, setUsageLimits] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
  } | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchUsageLimits();
  }, []);

  const fetchUsageLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('usage_limits, subscription_tier')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUsageLimits(data);
    } catch (error) {
      console.error('Error fetching usage limits:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    if (!usageLimits) return;

    const totalJobs = jobs.length;
    const jobsMax = usageLimits.usage_limits.jobs.max;

    if (totalJobs >= jobsMax) {
      setError(`You've reached your limit of ${jobsMax} jobs. Please upgrade your plan to create more jobs.`);
      return;
    }

    setIsCreating(true);
    setError(null);
  };

  const copyCodeToClipboard = async (code: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const url = `${window.location.origin}/apply?code=${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      // Update local state after successful deletion
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setDeleteConfirmation(null);
      
      // If we're in job details view, go back to list
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
      }

      // Refresh usage limits
      await fetchUsageLimits();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  if (selectedJobId) {
    return (
      <JobDetailsPage
        jobId={selectedJobId}
        onBack={() => {
          setSelectedJobId(null);
          fetchJobs();
        }}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onDelete={(jobId, jobTitle) => setDeleteConfirmation({ isOpen: true, jobId, jobTitle })}
      />
    );
  }

  if (isCreating) {
    return (
      <JobProvider>
        <PostJobPage
          onBack={() => {
            setIsCreating(false);
            fetchJobs();
          }}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
      </JobProvider>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-800">All Jobs</h1>
          <button 
            onClick={handleCreateJob}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            + Post New Job
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {usageLimits && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-600">
              Using {jobs.length} of {usageLimits.usage_limits.jobs.max} jobs 
              ({usageLimits.subscription_tier} plan)
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
              <p className="text-neutral-600">No jobs posted yet. Create your first job posting!</p>
            </div>
          ) : (
            jobs.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className="w-full text-left bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-neutral-800">{job.title}</h2>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        job.status === 'live' ? 'bg-green-50 text-green-700' :
                        job.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                        job.status === 'review' ? 'bg-blue-50 text-blue-700' :
                        'bg-neutral-50 text-neutral-700'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-neutral-600 mb-4">
                      <Briefcase size={16} className="mr-2" />
                      {job.company}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          {job.location}
                        </div>
                      )}
                      {job.remote && (
                        <span className="px-2 py-1 bg-neutral-100 rounded-full text-neutral-700">
                          Remote
                        </span>
                      )}
                      {job.code && job.status === 'live' && (
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono">
                            {job.code}
                          </code>
                          <button
                            onClick={(e) => copyCodeToClipboard(job.code, e)}
                            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                          >
                            {copiedId === job.code ? (
                              <span className="text-green-600 text-sm">Copied!</span>
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({
                          isOpen: true,
                          jobId: job.id,
                          jobTitle: job.title
                        });
                      }}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="text-neutral-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {deleteConfirmation && (
        <DeleteConfirmation
          isOpen={true}
          jobTitle={deleteConfirmation.jobTitle}
          onConfirm={() => handleDeleteJob(deleteConfirmation.jobId)}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </Layout>
  );
};

export default JobsPage;