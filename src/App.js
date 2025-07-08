// src/App.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for better initial load performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MarkAttendancePage = lazy(() => import('./pages/MarkAttendancePage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

// Lazy load report components
const OverallAttendanceSummary = lazy(() => import('./components/reports/OverallAttendanceSummary'));
const ChronicAbsenteeismList = lazy(() => import('./components/reports/ChronicAbsenteeismList'));
const NotificationLog = lazy(() => import('./components/reports/NotificationLog'));
const ClassAttendanceRegister = lazy(() => import('./components/reports/ClassAttendanceRegister'));
const ClassAttendancePercentage = lazy(() => import('./components/reports/ClassAttendancePercentage'));
const StudentAttendanceHistory = lazy(() => import('./components/reports/StudentAttendanceHistory'));
const StudentAttendanceSummary = lazy(() => import('./components/reports/StudentAttendanceSummary'));

// ProtectedRoute component (can be in a separate file: src/components/ProtectedRoute.js)
const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const { isLoggedIn, user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="container"><LoadingSpinner /></div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedUserTypes && allowedUserTypes.length > 0 && !allowedUserTypes.includes(user?.userType)) {
    // User is logged in but doesn't have the required role
    // Redirect to a 'not authorized' page or dashboard
    console.warn(`User type ${user?.userType} not allowed for this route. Allowed: ${allowedUserTypes.join(', ')}`);
    return <Navigate to="/dashboard" replace />; // Or a dedicated /unauthorized page
  }

  return children;
};


function App() {
  const { isLoggedIn, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && <Navbar />}
      <Suspense fallback={<div className="container"><LoadingSpinner /></div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mark-attendance"
            element={
              <ProtectedRoute allowedUserTypes={['admin', 'teacher']}>
                <MarkAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-settings"
            element={
              <ProtectedRoute allowedUserTypes={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedUserTypes={['admin', 'teacher', 'student', 'parent']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          >
            {/* Default report or instructions */}
            <Route index element={
              <div className="container report-container">
                <h2>Reports Section</h2>
                <p>Select a report type from the tabs above to view details.</p>
              </div>
            } />

            {/* Admin Reports */}
            <Route path="admin/overall-summary" element={<ProtectedRoute allowedUserTypes={['admin']}><OverallAttendanceSummary /></ProtectedRoute>} />
            <Route path="admin/chronic-absenteeism" element={<ProtectedRoute allowedUserTypes={['admin']}><ChronicAbsenteeismList /></ProtectedRoute>} />
            <Route path="admin/notification-log" element={<ProtectedRoute allowedUserTypes={['admin']}><NotificationLog /></ProtectedRoute>} />

            {/* Class-Wise Reports */}
            <Route path="class/attendance-register" element={<ProtectedRoute allowedUserTypes={['admin', 'teacher']}><ClassAttendanceRegister /></ProtectedRoute>} />
            <Route path="class/attendance-percentage" element={<ProtectedRoute allowedUserTypes={['admin', 'teacher']}><ClassAttendancePercentage /></ProtectedRoute>} />

            {/* Student-Wise Reports */}
            {/* These might need dynamic student_id or context-based student_id */}
            <Route path="student/attendance-history" element={<ProtectedRoute allowedUserTypes={['admin', 'teacher', 'student', 'parent']}><StudentAttendanceHistory /></ProtectedRoute>} />
            <Route path="student/attendance-summary" element={<ProtectedRoute allowedUserTypes={['admin', 'teacher', 'student', 'parent']}><StudentAttendanceSummary /></ProtectedRoute>} />
          </Route>

          {/* Fallback route - redirect to login or dashboard based on auth state */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
          <Route
            path="*"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} // Or a 404 page
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
