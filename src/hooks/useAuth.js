// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context.
 * This provides a convenient way for components to get auth state and functions.
 *
 * @returns {object} The authentication context value, including:
 *  - user: object (null if not logged in) - { userId, userType, name, etc. }
 *  - token: string (null if not logged in) - The authentication token.
 *  - isLoggedIn: boolean - True if the user is authenticated.
 *  - isLoading: boolean - True if authentication state is currently being determined (e.g., on app load or during login).
 *  - login: function - Async function to attempt user login (username, password).
 *  - logout: function - Function to log out the current user.
 *  - authLoading: boolean - Alias for isLoading, specifically for auth operations.
 *
 * @example
 * const { user, isLoggedIn, login, logout } = useAuth();
 * if (isLoading) return <p>Loading auth state...</p>;
 * if (!isLoggedIn) return <LoginPage />;
 * return <p>Welcome, {user.name}!</p>;
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // If context is null (initial state before provider is ready),
  // it might indicate an issue or just initial render cycle.
  // Depending on strictness, you could throw or return a default shape.
  // For now, we assume AuthProvider wraps the app, so context will be populated.
  return context;
};

export default useAuth;
