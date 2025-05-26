import React from 'react';
import { Save } from 'lucide-react';

const SaveButton: React.FC = () => {
  return (
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 bg-[#212121] text-white font-medium rounded-xl shadow-sm hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors duration-200"
    >
      <Save size={18} className="mr-2" />
      Save Changes
    </button>
  );
};

export default SaveButton;