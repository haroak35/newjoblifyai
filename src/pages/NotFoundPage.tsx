import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="p-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-neutral-200 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">Page Not Found</h2>
          <p className="text-neutral-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;