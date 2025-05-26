import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Star, Wand2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Dropdown from '../components/ui/Dropdown';
import SkeletonCard from '../components/ui/SkeletonCard';

interface ShortlistPageProps {
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist') => void;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
}

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  ai_analysis?: {
    matchScore: number;
  };
}

const ShortlistPage: React.FC<ShortlistPageProps> = ({ currentPage, onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicants(selectedJob.id);
    }
  }, [selectedJob]);

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

  const fetchApplicants = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants(data || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  const handleShortlist = async (applicantId: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: 'shortlisted' })
        .eq('id', applicantId);

      if (error) throw error;

      setApplicants(applicants.map(applicant =>
        applicant.id === applicantId
          ? { ...applicant, status: 'shortlisted' }
          : applicant
      ));
    } catch (error) {
      console.error('Error shortlisting applicant:', error);
    }
  };

  const handleAIShortlist = async () => {
    if (!selectedJob) return;
    setAiLoading(true);

    try {
      // Simulate AI shortlisting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update applicants with highest match scores
      const updatedApplicants = applicants.map(applicant => ({
        ...applicant,
        status: (applicant.ai_analysis?.matchScore || 0) > 75 ? 'shortlisted' : applicant.status
      }));

      setApplicants(updatedApplicants);

      // Update in database
      for (const applicant of updatedApplicants) {
        if (applicant.status === 'shortlisted') {
          await supabase
            .from('applicants')
            .update({ status: 'shortlisted' })
            .eq('id', applicant.id);
        }
      }
    } catch (error) {
      console.error('Error during AI shortlisting:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const jobOptions = jobs.map(job => ({
    value: job.id,
    label: job.title
  }));

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-800">Shortlist</h1>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          {loading ? (
            <div className="space-y-6">
              <SkeletonCard />
              <div className="h-[400px] bg-neutral-100 animate-pulse rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="w-full sm:w-96">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Job
                  </label>
                  <Dropdown
                    options={jobOptions}
                    value={selectedJob?.id || ''}
                    onChange={(value) => {
                      const job = jobs.find(j => j.id === value);
                      setSelectedJob(job || null);
                    }}
                  />
                </div>
                <button
                  onClick={handleAIShortlist}
                  disabled={!selectedJob || aiLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#212121] text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wand2 size={18} />
                  {aiLoading ? 'Processing...' : 'AI Shortlist'}
                </button>
              </div>

              {selectedJob && (
                <div className="space-y-4">
                  {applicants.length === 0 ? (
                    <p className="text-center text-neutral-600 py-8">
                      No applicants found for this job
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {applicants.map((applicant) => (
                        <div
                          key={applicant.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-xl gap-4"
                        >
                          <div>
                            <p className="font-medium text-neutral-800">
                              {applicant.first_name} {applicant.last_name}
                            </p>
                            <p className="text-sm text-neutral-500">{applicant.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            {applicant.ai_analysis?.matchScore && (
                              <span className="text-sm font-medium text-neutral-600">
                                Match: {applicant.ai_analysis.matchScore}%
                              </span>
                            )}
                            <button
                              onClick={() => handleShortlist(applicant.id)}
                              disabled={applicant.status === 'shortlisted'}
                              className={`w-full sm:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                                applicant.status === 'shortlisted'
                                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
                              }`}
                            >
                              <Star size={16} />
                              {applicant.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShortlistPage;