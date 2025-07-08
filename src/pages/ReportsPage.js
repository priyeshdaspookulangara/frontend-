// src/pages/ReportsPage.js
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';

const ReportsPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine if the current view is the main /reports page or a specific report
  const isReportsHome = location.pathname === '/reports' || location.pathname === '/reports/';

  if (!user) {
    return <div className="container"><ErrorMessage message="User not found. Please log in." /></div>;
  }

  // Define available report links based on user type
  const reportLinks = [];
  if (user.userType === 'admin') {
    reportLinks.push(
      { path: 'admin/overall-summary', label: 'Overall Attendance Summary' },
      { path: 'admin/chronic-absenteeism', label: 'Chronic Absenteeism' },
      { path: 'admin/notification-log', label: 'Notification Log' },
      { path: 'class/attendance-register', label: 'Class Attendance Register' },
      { path: 'class/attendance-percentage', label: 'Class Attendance Percentage' },
      { path: 'student/attendance-history', label: 'Student Attendance History' } // Admin might want to look up any student
    );
  }
  if (user.userType === 'teacher') {
    reportLinks.push(
      { path: 'class/attendance-register', label: 'Class Attendance Register' },
      { path: 'class/attendance-percentage', label: 'Class Attendance Percentage' },
      { path: 'student/attendance-history', label: 'Student Attendance History' } // Teacher might look up students in their class
    );
  }
  if (user.userType === 'student') {
    reportLinks.push(
      { path: 'student/attendance-history', label: 'My Attendance History' },
      { path: 'student/attendance-summary', label: 'My Attendance Summary' }
    );
  }
  if (user.userType === 'parent') {
    // For parents, student-specific reports are relevant.
    // The actual student_id might need to be passed or determined.
    // For now, linking to generic student report paths.
    reportLinks.push(
      { path: 'student/attendance-history', label: "Child's Attendance History" },
      { path: 'student/attendance-summary', label: "Child's Attendance Summary" }
    );
  }

  // Remove duplicate links if any (e.g. admin and teacher having same class reports)
  const uniqueReportLinks = reportLinks.filter((link, index, self) =>
    index === self.findIndex((l) => (
      l.path === link.path && l.label === link.label
    ))
  );


  return (
    <div className="container page-container reports-page">
      <h1>Reporting Section</h1>
      <p>Select a report from the tabs below to view details and generate data.</p>

      {uniqueReportLinks.length > 0 && (
        <nav className="tabs">
          {uniqueReportLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      {uniqueReportLinks.length === 0 && (
        <p>No reports available for your user type.</p>
      )}

      <div className="report-content" style={{ marginTop: '20px' }}>
        {/* Child routes will render here. If it's /reports, Outlet might render the index route if defined in App.js */}
        <Outlet />
        {isReportsHome && uniqueReportLinks.length > 0 && (
          <div className="report-container">
            <h2>Welcome to Reports</h2>
            <p>Please select a specific report from the navigation tabs above to get started.</p>
            <p>Each report will allow you to specify parameters like date ranges, classes, or students to generate the information you need.</p>
          </div>
        )}
         {isReportsHome && uniqueReportLinks.length === 0 && (
            <p>It seems there are no specific reports configured for your role at the moment. Please contact an administrator if you believe this is an error.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
