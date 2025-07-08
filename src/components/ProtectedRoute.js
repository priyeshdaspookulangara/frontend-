// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner'; // Assuming you have a LoadingSpinner component

/**
 * A wrapper component for routes that require authentication and optionally specific user roles.
 *
 * Props:
 *  - children: The component(s) to render if authentication and role checks pass.
 *  - allowedUserTypes: Array of strings representing user types allowed to access this route (e.g., ['admin', 'teacher']).
 *                      If undefined or empty, only checks for login status.
 *
 * Behavior:
 *  - If auth state is loading, renders a loading spinner.
 *  - If user is not logged in, redirects to the /login page, preserving the intended location.
 *  - If user is logged in but their userType is not in allowedUserTypes, redirects to /dashboard (or a dedicated /unauthorized page).
 *  - If all checks pass, renders the children components.
 */
const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const { isLoggedIn, user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    // Display a loading indicator while authentication status is being checked
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' /* Adjust if Navbar height changes */ }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoggedIn) {
    // User is not logged in, redirect to login page
    // Pass the current location so that the user can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedUserTypes && allowedUserTypes.length > 0) {
    const userType = user?.userType; // Assuming user object has a 'userType' property
    if (!userType || !allowedUserTypes.includes(userType)) {
      // User is logged in, but does not have the required user type for this route
      console.warn(`Access denied for user type: ${userType}. Allowed types: ${allowedUserTypes.join(', ')} for route ${location.pathname}`);
      // Redirect to a general page like dashboard or a specific "Unauthorized" page
      // You might want to show a message to the user as well.
      return <Navigate to="/dashboard" state={{ error: "You are not authorized to view this page." }} replace />;
    }
  }

  // User is logged in and has the required role (if specified), render the children
  return children;
};

export default ProtectedRoute;
