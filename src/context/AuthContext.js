// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiService from '../api/apiService'; // Assuming apiService is set up for calls

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { userId, userType, name, etc. }
  const [token, setToken] = useState(localStorage.getItem('authToken')); // Stores the auth token/API key
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Used for initial auth check

  // Effect to check for existing token in localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      // Conceptual endpoint: /api/auth/login
      // The response should ideally include the user object and the token
      const response = await apiService.post('/auth/login', { username, password });

      if (response && response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        setIsLoggedIn(true);
        setIsLoading(false);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Login failed: Invalid response structure.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      // Ensure error.data.message or error.message is passed for display
      const errorMessage = error.data?.message || error.message || 'An unknown error occurred during login.';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    // Optionally redirect to login page via navigation if called from a component context
    // For simplicity, this context only handles state, navigation is up to components.
  }, []);


  const contextValue = {
    user, // { userId, userType, name, etc. }
    token,
    isLoggedIn,
    isLoading, // For global loading state, e.g. during login process or initial load
    login,
    logout,
    authLoading: isLoading, // Specific alias for auth-related loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
