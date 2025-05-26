import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
  options, 
  value, 
  onChange,
  disabled = false
}) => {
  return (
    <div className={`bg-neutral-100 p-1 rounded-xl flex ${disabled ? 'opacity-50' : ''}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
            value === option.value 
              ? 'bg-white text-neutral-800 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;