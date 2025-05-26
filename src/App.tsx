import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import PostJobPage from './pages/PostJobPage';
import AccountPage from './pages/AccountPage';
import DashboardPage from './pages/DashboardPage';
import ApplicantsPage from './pages/ApplicantsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import ApplyPage from './pages/ApplyPage';
import ApplicationSuccessPage from './pages/ApplicationSuccessPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PricingPage from './pages/PricingPage';
import DocsPage from './pages/DocsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ShortlistPage from './pages/ShortlistPage';
import NotFoundPage from './pages/NotFoundPage';
import { supabase } from './lib/supabase';
import { JobProvider } from './context/JobContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist'>(() => {
    const path = location.pathname.substring(1) || 'dashboard';
    return path as 'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist';
  });

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  useEffect(() => {
    const path = location.pathname.substring(1) || 'dashboard';
    if (['dashboard', 'jobs', 'applicants', 'account', 'shortlist'].includes(path)) {
      setCurrentPage(path as 'dashboard' | 'jobs' | 'applicants' | 'account' | 'shortlist');
    }
  }, [location]);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/apply',
    '/apply/success',
    '/forgot-password',
    '/pricing',
    '/blog',
    '/blog/*',
    '/docs',
    '/docs/getting-started',
    '/docs/how-it-works',
    '/docs/privacy',
    '/docs/terms',
    '/docs/contact',
    '/docs/faq'
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/jobs',
    '/applicants',
    '/shortlist',
    '/account'
  ];

  // If we're checking authentication status and the route requires auth, show nothing
  if (isAuthenticated === null && protectedRoutes.includes(location.pathname)) {
    return null;
  }

  // If not authenticated and trying to access a protected route, redirect to login
  if (isAuthenticated === false && protectedRoutes.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && ['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="page"
        timeout={200}
        unmountOnExit
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/apply/success" element={<ApplicationSuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/:section" element={<DocsPage />} />
          
          {isAuthenticated && (
            <>
              <Route path="/dashboard" element={<DashboardPage currentPage={currentPage} onNavigate={setCurrentPage} />} />
              <Route path="/jobs" element={<JobsPage onSelectJob={() => {}} onPostJob={() => {}} currentPage={currentPage} onNavigate={setCurrentPage} />} />
              <Route path="/applicants" element={<ApplicantsPage currentPage={currentPage} onNavigate={setCurrentPage} />} />
              <Route path="/shortlist" element={<ShortlistPage currentPage={currentPage} onNavigate={setCurrentPage} />} />
              <Route path="/account" element={<AccountPage currentPage={currentPage} onNavigate={setCurrentPage} />} />
            </>
          )}

          {/* Only show 404 for truly unknown routes */}
          <Route path="*" element={
            publicRoutes.includes(location.pathname) || (isAuthenticated && protectedRoutes.includes(location.pathname)) 
              ? <Navigate to="/" replace />
              : <NotFoundPage />
          } />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App;