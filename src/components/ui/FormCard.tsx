import React, { ReactNode } from 'react';

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const FormCard: React.FC<FormCardProps> = ({ 
  title, 
  description, 
  children,
  className = ""
}) => {
  return (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
        {description && (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default FormCard;