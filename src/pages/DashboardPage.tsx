import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Users, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SkeletonCard from '../components/ui/SkeletonCard';

interface DashboardPageProps {
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account') => void;
}

interface DashboardStats {
  totalApplicants: number;
  activeJobs: number;
  pendingReviews: number;
  hired: number;
}

interface RecentApplication {
  id: string;
  name: string;
  position: string;
  date: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
}

interface PopularJob {
  id: string;
  title: string;
  applicants: number;
  deadline: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentPage, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplicants: 0,
    activeJobs: 0,
    pendingReviews: 0,
    hired: 0
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [popularJobs, setPopularJobs] = useState<PopularJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }

        // Fetch jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', (await user).data.user?.id);

        if (jobsError) throw jobsError;

        // Fetch applicants
        const { data: applicants, error: applicantsError } = await supabase
          .from('applicants')
          .select(`
            *,
            jobs!inner(user_id)
          `)
          .eq('jobs.user_id', (await user).data.user?.id);

        if (applicantsError) throw applicantsError;

        // Calculate stats
        const activeJobs = jobs?.filter(job => job.status === 'live').length || 0;
        const pendingReviews = applicants?.filter(app => app.status === 'pending').length || 0;
        const hired = applicants?.filter(app => app.status === 'accepted').length || 0;

        setStats({
          totalApplicants: applicants?.length || 0,
          activeJobs,
          pendingReviews,
          hired
        });

        // Set recent applications
        const recent = applicants?.slice(0, 3).map(app => ({
          id: app.id,
          name: `${app.first_name} ${app.last_name}`,
          position: jobs?.find(job => job.id === app.job_id)?.title || '',
          date: new Date(app.created_at).toLocaleDateString(),
          status: app.status as 'pending' | 'reviewing' | 'accepted' | 'rejected'
        })) || [];

        setRecentApplications(recent);

        // Set popular jobs
        const popular = jobs?.slice(0, 3).map(job => ({
          id: job.id,
          title: job.title,
          applicants: applicants?.filter(app => app.job_id === job.id).length || 0,
          deadline: new Date(job.created_at).toLocaleDateString()
        })) || [];

        setPopularJobs(popular);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="text-blue-600" size={24} />}
            label="Total Applicants"
            value={stats.totalApplicants.toString()}
            trend={`${stats.totalApplicants > 0 ? '+' : ''}${stats.totalApplicants} total`}
          />
          <StatCard
            icon={<Briefcase className="text-green-600" size={24} />}
            label="Active Jobs"
            value={stats.activeJobs.toString()}
            trend={stats.activeJobs === 1 ? '1 active posting' : `${stats.activeJobs} active postings`}
          />
          <StatCard
            icon={<Clock className="text-amber-600" size={24} />}
            label="Pending Reviews"
            value={stats.pendingReviews.toString()}
            trend="Needs attention"
          />
          <StatCard
            icon={<CheckCircle className="text-indigo-600" size={24} />}
            label="Hired"
            value={stats.hired.toString()}
            trend="Total hires"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Recent Applications</h2>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <ApplicationCard key={application.id} {...application} />
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 text-center py-8">
                No applications yet. Post a job to start receiving applications.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Popular Job Postings</h2>
            {popularJobs.length > 0 ? (
              <div className="space-y-4">
                {popularJobs.map((job) => (
                  <JobCard key={job.id} {...job} />
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 text-center py-8">
                No jobs posted yet. Create your first job posting to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend }) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-neutral-50 rounded-xl">{icon}</div>
      </div>
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-neutral-800 mb-2">{value}</p>
      <p className="text-sm text-neutral-500">{trend}</p>
    </div>
  );
};

interface ApplicationCardProps {
  id: string;
  name: string;
  position: string;
  date: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ name, position, date, status }) => {
  const getStatusStyles = (status: ApplicationCardProps['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'reviewing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
      <div>
        <p className="font-medium text-neutral-800">{name}</p>
        <p className="text-sm text-neutral-500">{position}</p>
      </div>
      <div className="text-right">
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <p className="text-xs text-neutral-500 mt-1">{date}</p>
      </div>
    </div>
  );
};

interface JobCardProps {
  id: string;
  title: string;
  applicants: number;
  deadline: string;
}

const JobCard: React.FC<JobCardProps> = ({ title, applicants, deadline }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
      <div>
        <p className="font-medium text-neutral-800">{title}</p>
        <p className="text-sm text-neutral-500">{applicants} applicants</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-neutral-500">Posted</p>
        <p className="text-sm font-medium text-neutral-800">{deadline}</p>
      </div>
    </div>
  );
};

export default DashboardPage;