// src/api/apiService.js
import { API_BASE_URL, DEFAULT_HEADERS, API_KEY, API_TIMEOUT } from './config';

/**
 * Utility function to get the authentication token.
 * It retrieves the token from localStorage. This should be in sync with
 * how AuthContext stores the token.
 * @returns {string|null} The auth token or null if not found.
 */
const getAuthToken = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user?.token || null; // Assumes token is stored within the user object
  }
  return null;
};

/**
 * Core function for making API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/users').
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [body=null] - Request body for POST/PUT requests.
 * @param {object} [customHeaders={}] - Any custom headers to add or override.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws {Error} - Throws an error if the request fails or returns a non-OK status.
 */
const request = async (endpoint, method, body = null, customHeaders = {}) => {
  const authToken = getAuthToken();
  const headers = {
    ...DEFAULT_HEADERS,
    ...customHeaders,
  };

  // Add Authorization header if token exists (for Bearer token auth)
  // Or X-API-Key if your backend uses that
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else if (API_KEY) {
    // Fallback or alternative: if you use a static X-API-Key
    // headers['X-API-Key'] = API_KEY;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  config.signal = controller.signal;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.response = response;
      error.data = errorData;
      throw error;
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return {}; // Return empty object for non-JSON responses or handle as needed
    }

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    // Re-throw other errors (network error, or error thrown from !response.ok)
    throw error;
  }
};

// Helper methods for common HTTP verbs
export const apiService = {
  get: (endpoint, customHeaders = {}) => request(endpoint, 'GET', null, customHeaders),
  post: (endpoint, body, customHeaders = {}) => request(endpoint, 'POST', body, customHeaders),
  put: (endpoint, body, customHeaders = {}) => request(endpoint, 'PUT', body, customHeaders),
  delete: (endpoint, customHeaders = {}) => request(endpoint, 'DELETE', null, customHeaders),
};

export default apiService;
