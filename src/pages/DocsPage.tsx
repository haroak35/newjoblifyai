import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';

const DocsPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex space-x-4">
              {['getting-started', 'how-it-works', 'privacy', 'terms', 'contact', 'faq'].map((key) => {
                const title = key.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');

                return (
                  <Link
                    key={key}
                    to={`/docs/${key}`}
                    className={`docs-link ${currentSection === key ? 'active bg-[#FF7F50] text-white' : ''}`}
                    onClick={() => setCurrentSection(key)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{title}</span>
                      <ChevronRight size={16} className={currentSection === key ? 'text-white' : 'text-neutral-400'} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DocsPage;