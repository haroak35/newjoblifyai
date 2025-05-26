import React from 'react';
import { Info } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';
import FormCard from '../ui/FormCard';
import FormField from '../ui/FormField';
import TagInput from '../ui/TagInput';
import Tooltip from '../ui/Tooltip';

interface AIMatchingFormProps {
  readOnly?: boolean;
}

const AIMatchingForm: React.FC<AIMatchingFormProps> = ({ readOnly = false }) => {
  const { 
    mustHaveSkills, setMustHaveSkills,
    preferredBackground, setPreferredBackground,
    niceToHaveSkills, setNiceToHaveSkills,
    priorities, setPriorities
  } = useJobContext();

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  return (
    <FormCard 
      title="AI Matching Criteria" 
      description="Help our AI find the best candidates for this role"
      className="bg-white/90 backdrop-blur-sm"
    >
      <div className="space-y-6">
        <FormField
          label={
            <div className="flex items-center gap-1">
              <span>Must-have Skills</span>
              <Tooltip content="Candidates without these skills will be ranked lower">
                <Info size={16} className="text-neutral-400" />
              </Tooltip>
            </div>
          }
          htmlFor="must-have-skills"
        >
          <TagInput
            id="must-have-skills"
            tags={mustHaveSkills}
            setTags={setMustHaveSkills}
            placeholder="Type a skill and press enter..."
            disabled={readOnly}
          />
        </FormField>

        <FormField
          label={
            <div className="flex items-center gap-1">
              <span>Preferred Background</span>
              <Tooltip content="Describe the ideal professional background">
                <Info size={16} className="text-neutral-400" />
              </Tooltip>
            </div>
          }
          htmlFor="preferred-background"
        >
          <input
            id="preferred-background"
            type="text"
            className="form-input"
            placeholder="e.g. 3+ years in a startup environment"
            value={preferredBackground}
            onChange={(e) => setPreferredBackground(e.target.value)}
            disabled={readOnly}
          />
        </FormField>

        <FormField
          label={
            <div className="flex items-center gap-1">
              <span>Nice-to-have Skills</span>
              <Tooltip content="Additional skills that would be beneficial">
                <Info size={16} className="text-neutral-400" />
              </Tooltip>
            </div>
          }
          htmlFor="nice-to-have-skills"
        >
          <TagInput
            id="nice-to-have-skills"
            tags={niceToHaveSkills}
            setTags={setNiceToHaveSkills}
            placeholder="Type a skill and press enter..."
            disabled={readOnly}
          />
        </FormField>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="block text-sm font-medium text-neutral-700">
              Top 3 Priorities
            </label>
            <Tooltip content="What's most important for this role?">
              <Info size={16} className="text-neutral-400" />
            </Tooltip>
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                type="text"
                className="form-input"
                placeholder={`Priority ${index + 1} (e.g. ${getPriorityPlaceholder(index)})`}
                value={priorities[index] || ''}
                onChange={(e) => handlePriorityChange(index, e.target.value)}
                disabled={readOnly}
              />
            ))}
          </div>
        </div>
      </div>
    </FormCard>
  );
};

function getPriorityPlaceholder(index: number): string {
  const placeholders = [
    "Strong problem-solving skills",
    "Experience with modern frameworks",
    "Team collaboration and communication"
  ];
  return placeholders[index] || "";
}

export default AIMatchingForm;