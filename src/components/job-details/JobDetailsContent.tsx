import React, { useState } from 'react';
import JobDetailsHeader from './JobDetailsHeader';
import JobInfoForm from './JobInfoForm';
import AIMatchingForm from './AIMatchingForm';
import ApplicantsTable from './ApplicantsTable';
import { supabase } from '../../lib/supabase';
import { useJobContext } from '../../context/JobContext';
import DateTimePicker from '../ui/DateTimePicker';

interface JobDetailsContentProps {
  onViewApplicant: (applicantId: string) => void;
  onDelete?: () => void;
}

const JobDetailsContent: React.FC<JobDetailsContentProps> = ({ onViewApplicant, onDelete }) => {
  const [applicationStart, setApplicationStart] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    jobId, 
    status, 
    setStatus,
    jobTitle,
    description,
    experienceLevel,
    mustHaveSkills,
    preferredBackground,
    niceToHaveSkills,
    priorities,
    requireCaptcha,
    maxApplicants,
    location,
    remoteAllowed,
    employmentType
  } = useJobContext();

  const handleStatusChange = async (newStatus: 'draft' | 'live') => {
    if (!jobId) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleSave = async () => {
    if (!jobId) return;
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: jobTitle,
          description,
          experience_level: experienceLevel,
          must_have_skills: mustHaveSkills,
          preferred_background: preferredBackground,
          nice_to_have_skills: niceToHaveSkills,
          priorities,
          require_captcha: requireCaptcha,
          max_applicants: maxApplicants,
          application_start: applicationStart,
          application_deadline: applicationDeadline,
          location,
          remote: remoteAllowed,
          type: employmentType
        })
        .eq('id', jobId);

      if (error) throw error;
      setError(null);
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <JobDetailsHeader onDelete={onDelete} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobInfoForm readOnly={!saving} />
        <AIMatchingForm readOnly={!saving} />
      </div>

      <ApplicantsTable jobId={jobId} onViewApplicant={onViewApplicant} />
      
      <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
        {error && (
          <p className="text-sm text-red-600 mr-auto">{error}</p>
        )}
        {saving ? (
          <>
            <button
              onClick={() => setSaving(false)}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setSaving(true)}
              className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Edit
            </button>
            {status === 'draft' ? (
              <button
                onClick={() => handleStatusChange('live')}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Publish
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('draft')}
                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Revert to Draft
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobDetailsContent;