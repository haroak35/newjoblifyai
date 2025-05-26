import React from 'react';

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'archived';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'published':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'archived':
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;