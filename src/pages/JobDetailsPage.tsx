import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import JobDetailsContent from '../components/job-details/JobDetailsContent';
import ApplicantDetailsPage from './ApplicantDetailsPage';
import { JobProvider } from '../context/JobContext';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Job } from '../types/job';
import SkeletonCard from '../components/ui/SkeletonCard';

interface JobDetailsPageProps {
  jobId: string;
  onBack: () => void;
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account') => void;
  onDelete: (jobId: string, jobTitle: string) => void;
}

const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ jobId, onBack, currentPage, onNavigate, onDelete }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Jobs
        </button>
        <div className="space-y-6">
          <SkeletonCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-600">Job not found</p>
        </div>
      </Layout>
    );
  }

  if (selectedApplicantId) {
    return (
      <ApplicantDetailsPage
        applicantId={selectedApplicantId}
        mode="view"
        onBack={() => setSelectedApplicantId(null)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <JobProvider initialJob={job}>
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Jobs
        </button>
        <JobDetailsContent 
          onViewApplicant={(id) => setSelectedApplicantId(id)}
          onDelete={() => onDelete(job.id, job.title)}
        />
      </Layout>
    </JobProvider>
  );
};

export default JobDetailsPage;