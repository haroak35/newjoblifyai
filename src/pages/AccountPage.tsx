import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Building, Briefcase, LogOut, Key, Trash2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { supabase } from '../lib/supabase';

interface AccountPageProps {
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account') => void;
}

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  job_role: string;
  usage_limits: {
    jobs: {
      max: number;
      used: number;
    };
    applicants_per_job: {
      max: number;
      shortlist: number | null;
    };
    features: {
      ai_matching: boolean;
      email_support: boolean;
      team_collaboration: boolean;
      api_access: boolean;
      advanced_analytics: boolean;
      custom_shortlist: boolean;
    };
  };
  subscription_tier: string;
}

const AccountPage: React.FC<AccountPageProps> = ({ currentPage, onNavigate }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobRole: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profile || {
        first_name: '',
        last_name: '',
        email: user.email || '',
        company: null,
        job_role: '',
        usage_limits: {
          jobs: { max: 5, used: 0 },
          applicants_per_job: { max: 25, shortlist: 5 },
          features: {
            ai_matching: true,
            email_support: true,
            team_collaboration: false,
            api_access: false,
            advanced_analytics: false,
            custom_shortlist: false
          }
        },
        subscription_tier: 'free'
      });

      setFormData({
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        company: profile?.company || '',
        jobRole: profile?.job_role || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company || null,
          job_role: formData.jobRole
        });

      if (error) throw error;

      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'delete') return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const getUsagePercentage = (used: number, max: number) => {
    return Math.min((used / max) * 100, 100);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-800">Account Settings</h1>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Subscription Plan</h2>
              <p className="text-neutral-600 capitalize">{profile?.subscription_tier || 'Free'} Plan</p>
            </div>
            {(!profile?.subscription_tier || profile.subscription_tier === 'free') && (
              <a
                href="/pricing"
                className="px-6 py-2 bg-[#FF7F50] text-white rounded-xl hover:bg-[#FF6B3D] transition-colors flex items-center gap-2"
              >
                Upgrade Now
                <ArrowRight size={18} />
              </a>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">Job Postings</span>
                <span className="font-medium text-neutral-800">
                  {profile?.usage_limits.jobs.used || 0} of {profile?.usage_limits.jobs.max || 5}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF7F50] rounded-full transition-all"
                  style={{ width: `${getUsagePercentage(profile?.usage_limits.jobs.used || 0, profile?.usage_limits.jobs.max || 5)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">Applicants per Job</span>
                <span className="font-medium text-neutral-800">
                  {profile?.usage_limits.applicants_per_job.max || 25}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">Shortlist Spots</span>
                <span className="font-medium text-neutral-800">
                  {profile?.usage_limits.applicants_per_job.shortlist === null ? 'Unlimited' : profile?.usage_limits.applicants_per_job.shortlist || 5}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {profile?.usage_limits.features && Object.entries(profile.usage_limits.features).map(([key, enabled]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    <span className="text-sm text-neutral-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  className="form-input pl-11"
                  value={profile?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Job Role
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  className="form-input pl-11"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company (Optional)
              </label>
              <div className="relative">
                <Building size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  className="form-input pl-11"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: profile?.first_name || '',
                    lastName: profile?.last_name || '',
                    company: profile?.company || '',
                    jobRole: profile?.job_role || ''
                  });
                }}
                className="px-4 py-2 text-neutral-700 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-6">Account Actions</h2>
          <div className="space-y-4">
            <a
              href="/reset-password"
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key size={18} className="text-neutral-400" />
                <span>Reset Password</span>
              </div>
              <ArrowRight size={18} className="text-neutral-400" />
            </a>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-neutral-400" />
                <span>Sign Out</span>
              </div>
              <ArrowRight size={18} className="text-neutral-400" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3 border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} />
                <span>Delete Account</span>
              </div>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Delete Account</h3>
            <p className="text-neutral-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
              Type 'delete' to confirm.
            </p>
            <input
              type="text"
              className="form-input mb-4"
              placeholder="Type 'delete' to confirm"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteText('');
                }}
                className="px-4 py-2 text-neutral-700 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'delete'}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AccountPage;