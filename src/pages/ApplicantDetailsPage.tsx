import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import SkeletonCard from '../components/ui/SkeletonCard';

interface ApplicantDetailsPageProps {
  applicantId: string;
  mode: 'view' | 'review';
  onBack: () => void;
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account') => void;
}

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  created_at: string;
  resume_url?: string;
  cover_letter?: string;
  ai_analysis?: {
    matchScore: number;
    strengths: string[];
    concerns: string[];
    skillsAssessment: {
      matchedMustHave: string[];
      matchedNiceToHave: string[];
      missingCritical: string[];
      skillDetails?: {
        proficiencyLevels: Record<string, string>;
        yearsOfExperience: Record<string, number>;
      };
    };
    backgroundFit: {
      alignment: string;
      yearsRelevant: number;
      industryMatch?: number;
      environmentFit?: string;
    };
    priorityMatching?: {
      overallScore: number;
      details: Record<string, number>;
    };
    recommendation: string;
    recommendationDetails?: string;
  };
}

const ApplicantDetailsPage: React.FC<ApplicantDetailsPageProps> = ({ 
  applicantId,
  mode,
  onBack, 
  currentPage, 
  onNavigate 
}) => {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    fetchApplicantDetails();
  }, [applicantId]);

  useEffect(() => {
    if (mode === 'review' && applicant?.status === 'pending') {
      updateStatus('reviewing');
    }
  }, [mode, applicant]);

  const fetchApplicantDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('id', applicantId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Applicant not found');

      setApplicant(data);

      if (data.resume_url) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('resumes')
          .createSignedUrl(data.resume_url, 3600);

        if (urlError) throw urlError;
        setResumeUrl(urlData.signedUrl);
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: Applicant['status']) => {
    if (!applicant) return;

    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', applicant.id);

      if (error) throw error;
      setApplicant({ ...applicant, status: newStatus });
      setIsStatusOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusStyles = (status: Applicant['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'reviewing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  if (loading) {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Applicants
        </button>
        <div className="space-y-6">
          <SkeletonCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard className="h-[800px]" />
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!applicant) {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-600">Applicant not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Applicants
      </button>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-neutral-800">
                  {applicant.first_name} {applicant.last_name}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(applicant.status)}`}>
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </span>
              </div>
              <p className="text-neutral-600">{applicant.email}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <span>Update Status</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isStatusOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-10">
                  {(['pending', 'reviewing', 'accepted', 'rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      className={`w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors ${
                        applicant.status === status ? 'bg-neutral-50' : ''
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        status === 'pending' ? 'bg-amber-500' :
                        status === 'reviewing' ? 'bg-blue-500' :
                        status === 'accepted' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Preview */}
          {resumeUrl && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-800">Resume</h2>
                <button
                  onClick={() => window.open(resumeUrl, '_blank')}
                  className="flex items-center px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </button>
              </div>
              <div className="h-[800px]">
                <iframe
                  src={resumeUrl + '#toolbar=0&navpanes=0&scrollbar=0'}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  title="Resume Preview"
                />
              </div>
            </div>
          )}

          {/* Applicant Details */}
          <div className="space-y-6">
            {/* AI Analysis */}
            {applicant.ai_analysis && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">AI Analysis</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <p className="text-sm text-neutral-600 mb-2">Match Score</p>
                      <p className={`text-2xl font-bold ${getMatchScoreColor(applicant.ai_analysis.matchScore)}`}>
                        {applicant.ai_analysis.matchScore}%
                      </p>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <p className="text-sm text-neutral-600 mb-2">Recommendation</p>
                      <p className="text-lg font-medium text-neutral-800">
                        {applicant.ai_analysis.recommendation}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-800 mb-3">Skills Assessment</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-neutral-600 mb-2">Matched Must-Have Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.ai_analysis.skillsAssessment.matchedMustHave.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
                              {skill}
                              {applicant.ai_analysis?.skillsAssessment.skillDetails?.yearsOfExperience[skill] && (
                                <span className="ml-1 opacity-75">
                                  ({applicant.ai_analysis.skillsAssessment.skillDetails.yearsOfExperience[skill]}y)
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-2">Matched Nice-to-Have Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.ai_analysis.skillsAssessment.matchedNiceToHave.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                              {skill}
                              {applicant.ai_analysis?.skillsAssessment.skillDetails?.yearsOfExperience[skill] && (
                                <span className="ml-1 opacity-75">
                                  ({applicant.ai_analysis.skillsAssessment.skillDetails.yearsOfExperience[skill]}y)
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      {applicant.ai_analysis.skillsAssessment.missingCritical.length > 0 && (
                        <div>
                          <p className="text-sm text-neutral-600 mb-2">Missing Critical Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {applicant.ai_analysis.skillsAssessment.missingCritical.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Background Fit */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="font-medium text-neutral-800 mb-3">Background Assessment</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-neutral-600">Experience: </span>
                        <span className="text-neutral-800">{applicant.ai_analysis.backgroundFit.yearsRelevant} years relevant</span>
                      </p>
                      {applicant.ai_analysis.backgroundFit.industryMatch && (
                        <p className="text-sm">
                          <span className="text-neutral-600">Industry Match: </span>
                          <span className="text-neutral-800">{applicant.ai_analysis.backgroundFit.industryMatch}%</span>
                        </p>
                      )}
                      {applicant.ai_analysis.backgroundFit.environmentFit && (
                        <p className="text-sm">
                          <span className="text-neutral-600">Environment Fit: </span>
                          <span className="text-neutral-800">{applicant.ai_analysis.backgroundFit.environmentFit}</span>
                        </p>
                      )}
                      <p className="text-sm text-neutral-600 mt-2">{applicant.ai_analysis.backgroundFit.alignment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {applicant.cover_letter && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Cover Letter</h2>
                <div className="prose prose-neutral max-w-none">
                  <p className="whitespace-pre-wrap">{applicant.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Key Strengths */}
            {applicant.ai_analysis?.strengths.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-medium text-neutral-800 mb-4">Key Strengths</h3>
                <ul className="space-y-2">
                  {applicant.ai_analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-2 bg-green-400 rounded-full flex-shrink-0" />
                      <span className="text-neutral-600">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Potential Concerns */}
            {applicant.ai_analysis?.concerns.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-medium text-neutral-800 mb-4">Potential Concerns</h3>
                <ul className="space-y-2">
                  {applicant.ai_analysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-2 bg-red-400 rounded-full flex-shrink-0" />
                      <span className="text-neutral-600">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Priority Matching */}
            {applicant.ai_analysis?.priorityMatching && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-medium text-neutral-800 mb-4">Priority Matching</h3>
                <div className="space-y-4">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-sm text-neutral-600 mb-2">Overall Priority Match</p>
                    <p className={`text-2xl font-bold ${getMatchScoreColor(applicant.ai_analysis.priorityMatching.overallScore)}`}>
                      {applicant.ai_analysis.priorityMatching.overallScore}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(applicant.ai_analysis.priorityMatching.details).map(([priority, score]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">{priority}</span>
                        <span className={`text-sm font-medium ${getMatchScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicantDetailsPage;