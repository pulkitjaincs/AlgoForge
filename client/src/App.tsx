import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const SheetPage = React.lazy(() => import('./pages/SheetPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ReviewPage = React.lazy(() => import('./pages/ReviewPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const DiscoverSheetsPage = React.lazy(() => import('./pages/DiscoverSheetsPage'));
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'));
const PublicProfilePage = React.lazy(() => import('./pages/PublicProfilePage'));
const TrashPage = React.lazy(() => import('./pages/TrashPage'));
const IntegrationsPage = React.lazy(() => import('./pages/IntegrationsPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LandingLayout = React.lazy(() => import('./layouts/LandingLayout'));

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-brand-primary">Loading...</div>}>
        <Routes>
          {/* Public Landing */}
          <Route element={<LandingLayout />}>
             <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Public Profiles */}
          <Route path="/u/:username" element={<PublicProfilePage />} />

          {/* Protected App Routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="sheet" element={<SheetPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="discover" element={<DiscoverSheetsPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
