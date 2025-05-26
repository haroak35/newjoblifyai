import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({ 
  id, 
  tags, 
  setTags, 
  placeholder = "Add a tag...",
  disabled = false
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`border border-neutral-200 rounded-xl p-2 ${disabled ? 'bg-neutral-50' : 'focus-within:ring-2 focus-within:ring-neutral-100 focus-within:border-neutral-900'}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm flex items-center"
          >
            {tag}
            {!disabled && (
              <button 
                type="button" 
                onClick={() => removeTag(tag)} 
                className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}
      </div>
      <input
        id={id}
        type="text"
        className="w-full border-0 p-1 focus:ring-0 text-sm bg-transparent disabled:cursor-not-allowed"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    </div>
  );
};

export default TagInput;