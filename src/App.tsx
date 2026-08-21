import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageTransition } from './components/PageTransition';
import { HomeSkeleton } from './components/skeletons/HomeSkeleton';
import { DeviceSkeleton } from './components/skeletons/DeviceSkeleton';
import { TeamSkeleton } from './components/skeletons/TeamSkeleton';
import { CommunitySkeleton } from './components/skeletons/CommunitySkeleton';
import { RomsSkeleton } from './components/skeletons/RomsSkeleton';
import { DashboardSkeleton } from './components/skeletons/DashboardSkeleton';

// Resilient lazy loader helper for dynamic module chunk fetching
function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName?: string
) {
  return lazy(async () => {
    try {
      const module = await importFn();
      try {
        sessionStorage.removeItem('sky_chunk_retry');
      } catch (e) {
        // Ignore potential sessionStorage access security restrictions in iframes
      }
      if (module.default) {
        return { default: module.default };
      }
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      // Find the component function matching uppercase naming or Page suffix
      const matchingKey = Object.keys(module).find(
        (k) => (exportName && k.toLowerCase() === exportName.toLowerCase()) || k.endsWith('Page') || /^[A-Z]/.test(k)
      );
      if (matchingKey && typeof module[matchingKey] === 'function') {
        return { default: module[matchingKey] };
      }
      const firstFn = Object.values(module).find((val) => typeof val === 'function');
      if (firstFn) {
        return { default: firstFn as T };
      }
      return { default: module };
    } catch (error) {
      console.warn('Dynamic chunk load failed, refreshing page...', error);
      let reloaded = null;
      try {
        reloaded = sessionStorage.getItem('sky_chunk_retry');
        if (!reloaded) {
          sessionStorage.setItem('sky_chunk_retry', 'true');
        }
      } catch (e) {
        // Fallback for strict sandbox environments
      }
      if (!reloaded) {
        window.location.reload();
      }
      throw error;
    }
  });
}

const HomePage = safeLazy(() => import('./pages/HomePage'), 'HomePage');
const DevicePage = safeLazy(() => import('./pages/DevicePage'), 'DevicePage');
const TeamPage = safeLazy(() => import('./pages/TeamPage'), 'TeamPage');
const CommunityPage = safeLazy(() => import('./pages/CommunityPage'), 'CommunityPage');
const RomsPage = safeLazy(() => import('./pages/RomsPage'), 'RomsPage');
const NotFoundPage = safeLazy(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// Admin Pages
const LoginPage = safeLazy(() => import('./pages/admin/LoginPage'), 'LoginPage');
const ResetPasswordPage = safeLazy(() => import('./pages/admin/ResetPasswordPage'), 'ResetPasswordPage');
const DashboardPage = safeLazy(() => import('./pages/admin/DashboardPage'), 'DashboardPage');
const RomEditorPage = safeLazy(() => import('./pages/admin/RomEditorPage'), 'RomEditorPage');
const ProfilePage = safeLazy(() => import('./pages/admin/ProfilePage'), 'ProfilePage');
const RegisterAdminPage = safeLazy(() => import('./pages/admin/RegisterPage'), 'RegisterPage');
const ApproveAdminsPage = safeLazy(() => import('./pages/admin/ApproveAdminsPage'), 'ApproveAdminsPage');
const SecurityLogsPage = safeLazy(() => import('./pages/admin/SecurityLogsPage'), 'SecurityLogsPage');
const FeedbackAdminPage = safeLazy(() => import('./pages/admin/FeedbackAdminPage'), 'FeedbackAdminPage');

// A lightweight fallback spinner for lazy loaded routes
const SuspenseFallback = () => (
  <div className="flex-grow flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 rounded-full border-2 border-[#EBE4CF] dark:border-[#36342A] border-t-[#FDE694] animate-spin" />
  </div>
);


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<HomeSkeleton />}>
                <PageTransition variant="slideUp">
                  <HomePage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="device"
            element={
              <Suspense fallback={<DeviceSkeleton />}>
                <PageTransition variant="zoom">
                  <DevicePage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="roms"
            element={
              <Suspense fallback={<RomsSkeleton />}>
                <PageTransition variant="slideRight">
                  <RomsPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="roms/:id"
            element={
              <Suspense fallback={<RomsSkeleton />}>
                <PageTransition variant="slideRight">
                  <RomsPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="team"
            element={
              <Suspense fallback={<TeamSkeleton />}>
                <PageTransition variant="bounce">
                  <TeamPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="community"
            element={
              <Suspense fallback={<CommunitySkeleton />}>
                <PageTransition variant="flip">
                  <CommunityPage />
                </PageTransition>
              </Suspense>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="admin/login"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="admin/reset-password"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <PageTransition>
                  <ResetPasswordPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="admin/register"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <PageTransition>
                  <RegisterAdminPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <DashboardPage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/roms/new"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <RomEditorPage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/roms/:id/edit"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <RomEditorPage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <ProfilePage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/approve"
            element={
              <ProtectedRoute requireSuperAdmin={true}>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <ApproveAdminsPage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/logs"
            element={
              <ProtectedRoute requireSuperAdmin={true}>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <SecurityLogsPage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/feedback"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <PageTransition>
                    <FeedbackAdminPage />
                  </PageTransition>
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Route alias: redirect /about directly to unified /community */}
          <Route path="about" element={<Navigate to="/community" replace />} />
          {/* Catch-all fallback route rendering custom SKY 404 page */}
          <Route
            path="*"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import { ErrorBoundary } from './components/ErrorBoundary';
import { SessionManager } from './components/admin/SessionManager';
import { GlobalKeyboardShortcuts } from './components/GlobalKeyboardShortcuts';

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <PerformanceProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <SessionManager />
                <BrowserRouter>
                  <GlobalKeyboardShortcuts />
                  <AnimatedRoutes />
                </BrowserRouter>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </PerformanceProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
