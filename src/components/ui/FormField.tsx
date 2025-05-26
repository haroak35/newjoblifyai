import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  htmlFor, 
  children,
  className = ""
}) => {
  return (
    <div className={className}>
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium text-neutral-700 mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;