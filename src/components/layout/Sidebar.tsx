import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Users, Star, UserCircle } from 'lucide-react';

interface SidebarProps {
  currentPage: 'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist';
  onNavigate: (page: 'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const location = useLocation();

  return (
    <aside className="h-full bg-white border-r border-neutral-200">
      <div className="p-6 flex flex-col h-full">
        <Link to="/dashboard" className="text-2xl font-bold text-neutral-800 mb-8 leading-none">
          Joblify
        </Link>
        <nav className="space-y-1 flex-1">
          <SidebarItem
            to="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={location.pathname === '/dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <SidebarItem
            to="/jobs"
            icon={<Briefcase size={20} />}
            label="Jobs"
            active={location.pathname === '/jobs'}
            onClick={() => onNavigate('jobs')}
          />
          <SidebarItem
            to="/applicants"
            icon={<Users size={20} />}
            label="Applicants"
            active={location.pathname === '/applicants'}
            onClick={() => onNavigate('applicants')}
          />
          <SidebarItem
            to="/shortlist"
            icon={<Star size={20} />}
            label="Shortlist"
            active={location.pathname === '/shortlist'}
            onClick={() => onNavigate('shortlist')}
          />
        </nav>
        <div className="pt-4 border-t border-neutral-200">
          <Link 
            to="/account"
            onClick={() => onNavigate('account')}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-150 ease-in-out"
          >
            <span className="mr-3">
              <UserCircle size={20} />
            </span>
            <div className="flex flex-col text-left">
              <span className="font-medium text-neutral-900">Harry Oakley</span>
              <span className="text-xs text-neutral-500">View Account</span>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link 
      to={to}
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ease-in-out ${
        active 
          ? 'bg-neutral-100 text-neutral-900' 
          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export default Sidebar;