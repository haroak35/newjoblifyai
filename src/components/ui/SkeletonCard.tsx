import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-neutral-100 rounded-lg w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;