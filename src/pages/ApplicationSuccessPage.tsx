import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const ApplicationSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="p-8">
        <a 
          href="/" 
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-neutral-600 mb-8">
            Thank you for your application. We'll review your submission and get back to you soon.
          </p>
          
          <div className="space-y-4">
            <a
              href="/"
              className="block w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Return to Home
            </a>
            <a
              href="/apply"
              className="block w-full px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Apply to Another Position
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccessPage;