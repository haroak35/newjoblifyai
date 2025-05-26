import React, { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ApplicantsTableProps {
  jobId?: string;
  onViewApplicant: (applicantId: string, mode: 'view' | 'review') => void;
}

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  created_at: string;
  resume_url?: string;
  ai_analysis?: {
    matchScore: number;
  };
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Delete Applicant</h3>
        <p className="text-neutral-600 mb-6">
          This action cannot be undone. Type 'delete' to confirm.
        </p>
        <input
          type="text"
          className="form-input mb-4"
          placeholder="Type 'delete' to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 hover:text-neutral-900"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== 'delete'}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Applicant
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({ jobId, onViewApplicant }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    applicantId: string | null;
  }>({
    isOpen: false,
    applicantId: null
  });

  useEffect(() => {
    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants(data || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.applicantId) return;

    try {
      const applicant = applicants.find(a => a.id === deleteConfirmation.applicantId);
      
      if (applicant?.resume_url) {
        const { error: storageError } = await supabase.storage
          .from('resumes')
          .remove([applicant.resume_url]);

        if (storageError) throw storageError;
      }

      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', deleteConfirmation.applicantId);

      if (error) throw error;

      setApplicants(applicants.filter(a => a.id !== deleteConfirmation.applicantId));
      setDeleteConfirmation({ isOpen: false, applicantId: null });
    } catch (error) {
      console.error('Error deleting applicant:', error);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: Applicant['status']) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', applicantId);

      if (error) throw error;

      setApplicants(applicants.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, status: newStatus }
          : applicant
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
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

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <p className="text-center text-neutral-600">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Name</th>
              <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Email</th>
              <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Match</th>
              <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Status</th>
              <th className="text-right text-sm font-medium text-neutral-500 px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-neutral-600">
                  No applications received yet
                </td>
              </tr>
            ) : (
              applicants.map((applicant) => (
                <tr key={applicant.id} className="border-b border-neutral-200 last:border-0">
                  <td className="px-6 py-4 text-neutral-800">
                    {applicant.first_name} {applicant.last_name}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{applicant.email}</td>
                  <td className="px-6 py-4">
                    {applicant.ai_analysis?.matchScore !== undefined && (
                      <span className={`font-medium ${getMatchScoreColor(applicant.ai_analysis.matchScore)}`}>
                        {applicant.ai_analysis.matchScore}%
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant.id, e.target.value as Applicant['status'])}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(applicant.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onViewApplicant(applicant.id, 'view')}
                        className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmation({ 
                          isOpen: true, 
                          applicantId: applicant.id 
                        })}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, applicantId: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ApplicantsTable;