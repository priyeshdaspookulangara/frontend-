// src/components/Navbar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  if (!isLoggedIn) {
    return null; // Don't render Navbar if not logged in
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/dashboard">SchoolMS</NavLink>
      </div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>

        {user?.userType === 'admin' && (
          <>
            <NavLink to="/mark-attendance" className={({ isActive }) => isActive ? "active" : ""}>Mark Attendance</NavLink>
            <NavLink to="/admin-settings" className={({ isActive }) => isActive ? "active" : ""}>Admin Settings</NavLink>
            <NavLink to="/reports/admin/overall-summary" className={({ isActive }) => isActive ? "active" : ""}>Reports</NavLink>
          </>
        )}

        {user?.userType === 'teacher' && (
          <>
            <NavLink to="/mark-attendance" className={({ isActive }) => isActive ? "active" : ""}>Mark Attendance</NavLink>
            <NavLink to="/reports/class/attendance-register" className={({ isActive }) => isActive ? "active" : ""}>Class Reports</NavLink>
          </>
        )}

        {user?.userType === 'student' && (
           <NavLink to="/reports/student/attendance-history" className={({ isActive }) => isActive ? "active" : ""}>My Attendance</NavLink>
        )}

        {user?.userType === 'parent' && (
           <NavLink to="/reports/student/attendance-history" className={({ isActive }) => isActive ? "active" : ""}>Child's Attendance</NavLink> /* Needs student_id logic */
        )}

      </div>
      <div className="navbar-user">
        {user && <span>Welcome, {user.name || user.username} ({user.userType})</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
