import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Search, Filter, Download } from 'lucide-react';
import Dropdown from '../components/ui/Dropdown';
import { supabase } from '../lib/supabase';
import ApplicantDetailsPage from './ApplicantDetailsPage';
import SkeletonTable from '../components/ui/SkeletonTable';

interface ApplicantsPageProps {
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
  job: {
    title: string;
  };
}

const ApplicantsPage: React.FC<ApplicantsPageProps> = ({ currentPage, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<{ id: string; mode: 'view' | 'review' } | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applicants')
        .select(`
          *,
          job:jobs(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants(data || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: 'pending' | 'reviewing' | 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', applicantId);

      if (error) throw error;

      // Update local state
      setApplicants(applicants.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, status: newStatus }
          : applicant
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const exportToCSV = () => {
    // Filter applicants based on current filters
    const filteredApplicants = applicants.filter(applicant => {
      const matchesSearch = 
        `${applicant.first_name} ${applicant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || applicant.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Email', 'Position', 'Status', 'Applied Date'];
    const rows = filteredApplicants.map(applicant => [
      applicant.first_name,
      applicant.last_name,
      applicant.email,
      applicant.job.title,
      applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1),
      new Date(applicant.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `applicants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      `${applicant.first_name} ${applicant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || applicant.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (selectedApplicant) {
    return (
      <ApplicantDetailsPage
        applicantId={selectedApplicant.id}
        mode={selectedApplicant.mode}
        onBack={() => setSelectedApplicant(null)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
    );
  }

  if (loading) {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-neutral-800">All Applicants</h1>
            <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors opacity-50 cursor-not-allowed">
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <div className="form-input pl-11 w-full bg-neutral-50"></div>
            </div>
            <div className="w-48">
              <div className="form-input bg-neutral-50"></div>
            </div>
          </div>

          <SkeletonTable rows={5} columns={5} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-800">All Applicants</h1>
          <button 
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              className="form-input pl-11 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Dropdown
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              icon={<Filter size={18} />}
            />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Applicant</th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Position</th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Applied</th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Status</th>
                  <th className="text-right text-sm font-medium text-neutral-500 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-600">
                      No applicants found
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-neutral-200 last:border-0">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-neutral-800">
                            {applicant.first_name} {applicant.last_name}
                          </div>
                          <div className="text-sm text-neutral-500">{applicant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{applicant.job.title}</td>
                      <td className="px-6 py-4 text-neutral-600">
                        {new Date(applicant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value as any)}
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
                            onClick={() => setSelectedApplicant({ id: applicant.id, mode: 'view' })}
                            className="px-3 py-1 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setSelectedApplicant({ id: applicant.id, mode: 'review' })}
                            className="px-3 py-1 text-sm font-medium bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
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

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const getStatusStyles = (status: string) => {
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

export default ApplicantsPage;