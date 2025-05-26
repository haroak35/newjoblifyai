import React from 'react';
import { Clock, Users, Copy, Trash2 } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';
import StatusBadge from '../ui/StatusBadge';

interface JobDetailsHeaderProps {
  onDelete?: () => void;
}

const JobDetailsHeader: React.FC<JobDetailsHeaderProps> = ({ onDelete }) => {
  const { 
    jobTitle, 
    jobCode, 
    status,
    description,
    createdAt 
  } = useJobContext();
  
  const [copied, setCopied] = React.useState(false);
  
  const copyCodeToClipboard = () => {
    if (jobCode) {
      const url = `${window.location.origin}/apply?code=${jobCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-neutral-800">
              {jobTitle || 'New Job Position'}
            </h1>
            <StatusBadge status={status || 'draft'} />
          </div>
          {jobCode && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-neutral-600">Job Code:</span>
              <code className="px-2 py-1 bg-neutral-100 rounded text-sm font-mono">{jobCode}</code>
              <button
                onClick={copyCodeToClipboard}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {copied ? (
                  <span className="text-green-600 text-sm">Copied!</span>
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          )}
          {description && (
            <p className="text-neutral-600 mt-4 max-w-2xl">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <StatItem 
            icon={<Clock size={18} />} 
            label="Posted" 
            value={createdAt ? formatDate(createdAt) : 'Just now'} 
          />
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-neutral-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Delete job"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="text-neutral-400">{icon}</div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-medium text-neutral-800">{value}</p>
      </div>
    </div>
  );
};

export default JobDetailsHeader;