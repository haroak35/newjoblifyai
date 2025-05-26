import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import JobInfoForm from '../components/job-details/JobInfoForm';
import AIMatchingForm from '../components/job-details/AIMatchingForm';
import { ArrowLeft } from 'lucide-react';
import { JobStatus } from '../types/job';
import DateTimePicker from '../components/ui/DateTimePicker';
import { supabase } from '../lib/supabase';
import { useJobContext } from '../context/JobContext';
import { generateJobCode } from '../lib/supabase';

interface PostJobPageProps {
  onBack: () => void;
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account') => void;
}

const PostJobPage: React.FC<PostJobPageProps> = ({ onBack, currentPage, onNavigate }) => {
  const [applicationStart, setApplicationStart] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    jobTitle,
    location,
    remoteAllowed,
    employmentType,
    experienceLevel,
    mustHaveSkills,
    preferredBackground,
    niceToHaveSkills,
    priorities
  } = useJobContext();

  const handleSave = async (status: JobStatus) => {
    if (!jobTitle) {
      setError('Please enter a job title');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('No profile found');

      const jobCode = generateJobCode();
      const { error: saveError } = await supabase.from('jobs').insert({
        code: jobCode,
        user_id: user.id,
        title: jobTitle,
        company: profile.company,
        location,
        type: employmentType,
        remote: remoteAllowed,
        status,
        experience_level: experienceLevel,
        must_have_skills: mustHaveSkills,
        preferred_background: preferredBackground,
        nice_to_have_skills: niceToHaveSkills,
        priorities,
        application_start: applicationStart || null,
        application_deadline: applicationDeadline || null
      });

      if (saveError) throw saveError;

      // Show success message in a more elegant way
      setError(null);
      onBack();
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Jobs
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('live')}
              disabled={saving}
              className="px-4 py-2 bg-[#212121] text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Publish Job
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <JobInfoForm />
            
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6">Application Schedule</h2>
              <div className="space-y-4">
                <DateTimePicker
                  label="Application Start Date"
                  value={applicationStart}
                  onChange={setApplicationStart}
                />
                <DateTimePicker
                  label="Application Deadline"
                  value={applicationDeadline}
                  onChange={setApplicationDeadline}
                />
              </div>
            </div>

            <AIMatchingForm />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h3 className="font-medium text-neutral-800 mb-4">Job Status</h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <p>• Draft - Job is not visible to applicants</p>
                  <p>• Live - Job is published and accepting applications</p>
                  <p>• Review - Application deadline has passed</p>
                  <p>• Ended - Job posting is archived</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostJobPage;