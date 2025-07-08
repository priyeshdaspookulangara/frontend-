// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming a LoadingSpinner component exists
import ErrorMessage from '../components/ErrorMessage'; // Assuming an ErrorMessage component exists

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username || !password) {
      setError('Username and password are required.');
      setIsSubmitting(false);
      return;
    }

    const result = await login(username, password);

    setIsSubmitting(false);

    if (result.success) {
      // Redirect to the page they were trying to access, or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-form container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner /> : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
