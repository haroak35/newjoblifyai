import React from 'react';
import { Shield } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';
import FormCard from '../ui/FormCard';
import FormField from '../ui/FormField';
import Toggle from '../ui/Toggle';
import SegmentedControl from '../ui/SegmentedControl';

interface JobInfoFormProps {
  readOnly?: boolean;
}

const JobInfoForm: React.FC<JobInfoFormProps> = ({ readOnly = false }) => {
  const { 
    jobTitle, setJobTitle,
    description, setDescription,
    experienceLevel, setExperienceLevel,
    requireCaptcha = true, setRequireCaptcha,
    maxApplicants, setMaxApplicants
  } = useJobContext();

  const experienceOptions = [
    { value: 'entry', label: 'Entry' },
    { value: 'mid', label: 'Mid' },
    { value: 'senior', label: 'Senior' },
    { value: 'any', label: 'Any' }
  ];

  return (
    <FormCard 
      title="Job Information" 
      description="Enter the basic details about this position"
    >
      <div className="space-y-6">
        <FormField
          label="Job Title"
          htmlFor="job-title"
        >
          <input
            id="job-title"
            type="text"
            className="form-input"
            placeholder="e.g. Senior Frontend Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={readOnly}
          />
        </FormField>

        <FormField
          label="Job Description"
          htmlFor="job-description"
        >
          <textarea
            id="job-description"
            className="form-input min-h-[200px]"
            placeholder="Describe the role, responsibilities, and requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly}
          />
        </FormField>

        <FormField
          label="Experience Level"
          htmlFor="experience-level"
        >
          <SegmentedControl
            options={experienceOptions}
            value={experienceLevel}
            onChange={setExperienceLevel}
            disabled={readOnly}
          />
        </FormField>

        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Application Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700">
                  Require CAPTCHA verification
                </span>
              </div>
              <Toggle 
                checked={requireCaptcha} 
                onChange={setRequireCaptcha} 
                id="captcha-toggle"
                disabled={readOnly}
              />
            </div>

            <FormField
              label="Maximum Number of Applicants"
              htmlFor="max-applicants"
            >
              <input
                id="max-applicants"
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 100"
                value={maxApplicants}
                onChange={(e) => setMaxApplicants(parseInt(e.target.value, 10))}
                disabled={readOnly}
              />
            </FormField>
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default JobInfoForm;