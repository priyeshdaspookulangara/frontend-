// src/pages/DashboardPage.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage'; // For displaying potential errors passed via route state

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const error = location.state?.error; // Check for error messages passed from redirects (e.g., ProtectedRoute)

  if (!user) {
    // This should ideally not happen if ProtectedRoute is working correctly
    return <p>Loading user data or not logged in...</p>;
  }

  return (
    <div className="container page-container">
      {error && <ErrorMessage message={error} />}
      <h1>Welcome to the Dashboard, {user.name || user.username}!</h1>
      <p>Your role: <strong>{user.userType}</strong></p>
      <p>This is your central hub for managing school activities. Use the navigation bar above or the links below to access different sections of the system.</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Quick Links:</h3>
        <ul className="dashboard-links">
          {/* Common Links */}
          <li><Link to="/reports">View Reports</Link></li>

          {/* Admin Specific Links */}
          {user.userType === 'admin' && (
            <>
              <li><Link to="/mark-attendance">Mark Student Attendance</Link></li>
              <li><Link to="/admin-settings">Manage System Settings</Link></li>
              <li><Link to="/reports/admin/overall-summary">Overall Attendance Summary</Link></li>
              <li><Link to="/reports/admin/chronic-absenteeism">Chronic Absenteeism List</Link></li>
              <li><Link to="/reports/admin/notification-log">Notification Log</Link></li>
            </>
          )}

          {/* Teacher Specific Links */}
          {user.userType === 'teacher' && (
            <>
              <li><Link to="/mark-attendance">Mark Student Attendance</Link></li>
              <li><Link to="/reports/class/attendance-register">Class Attendance Register</Link></li>
              <li><Link to="/reports/class/attendance-percentage">Class Attendance Percentage</Link></li>
            </>
          )}

          {/* Student Specific Links */}
          {user.userType === 'student' && (
            <>
              <li><Link to="/reports/student/attendance-history">My Attendance History</Link></li>
              <li><Link to="/reports/student/attendance-summary">My Attendance Summary</Link></li>
            </>
          )}

          {/* Parent Specific Links - Assuming parent needs to select a student or has one associated */}
          {user.userType === 'parent' && (
            <>
              <li><Link to="/reports/student/attendance-history">Child's Attendance History</Link></li>
              {/* This link might need to be dynamic or lead to a student selection page if parent has multiple children */}
            </>
          )}
        </ul>
      </div>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <h4>System Notifications (Placeholder)</h4>
        <p>No new notifications at this time.</p>
        {/* In a real application, this could fetch and display system-wide alerts or messages */}
      </div>
    </div>
  );
};

export default DashboardPage;
