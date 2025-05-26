import React from 'react';
import { CopyIcon, Edit2 } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

const AIPreviewCard: React.FC = () => {
  const { 
    jobTitle,
    location,
    remoteAllowed,
    experienceLevel,
    mustHaveSkills,
    preferredBackground,
    niceToHaveSkills,
    priorities
  } = useJobContext();

  const getExperienceLevelText = () => {
    switch (experienceLevel) {
      case 'entry': return 'Entry';
      case 'mid': return 'Mid';
      case 'senior': return 'Senior';
      case 'any': return 'Any';
      default: return 'Any';
    }
  };

  const getLocationText = () => {
    if (!location) return 'Remote (allowed)';
    return `${location}${remoteAllowed ? ' (Remote allowed)' : ''}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="bg-neutral-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">AI Matching Preview</h3>
          <div className="flex gap-2">
            <button className="p-1 rounded-md hover:bg-neutral-700 transition-colors">
              <CopyIcon size={16} />
            </button>
            <button className="p-1 rounded-md hover:bg-neutral-700 transition-colors">
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-5 font-mono text-sm">
        <div className="mb-4">
          <div className="text-blue-600 font-semibold mb-1">Position: {jobTitle || 'Job Title'}</div>
        </div>
        
        <div className="text-neutral-800 font-medium mb-2">AI will prioritize:</div>
        <div className="space-y-2 pl-2">
          {mustHaveSkills.length > 0 && (
            <div>
              <span className="text-neutral-500">- Must-haves:</span>{' '}
              <span className="text-neutral-800">{mustHaveSkills.join(', ')}</span>
            </div>
          )}
          
          {niceToHaveSkills.length > 0 && (
            <div>
              <span className="text-neutral-500">- Nice-to-haves:</span>{' '}
              <span className="text-neutral-800">{niceToHaveSkills.join(', ')}</span>
            </div>
          )}
          
          {preferredBackground && (
            <div>
              <span className="text-neutral-500">- Background:</span>{' '}
              <span className="text-neutral-800">{preferredBackground}</span>
            </div>
          )}
          
          <div>
            <span className="text-neutral-500">- Candidate Level:</span>{' '}
            <span className="text-neutral-800">{getExperienceLevelText()}</span>
          </div>
          
          <div>
            <span className="text-neutral-500">- Location:</span>{' '}
            <span className="text-neutral-800">{getLocationText()}</span>
          </div>
          
          {priorities.filter(Boolean).length > 0 && (
            <div>
              <div className="text-neutral-500">- Priorities:</div>
              <ul className="list-disc pl-6 text-neutral-800">
                {priorities.filter(Boolean).map((priority, index) => (
                  <li key={index}>{priority}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPreviewCard;