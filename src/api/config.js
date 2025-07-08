// src/api/config.js

/**
 * Base URL for the PHP API backend.
 * Ensure this is correctly configured for your development/production environment.
 */
export const API_BASE_URL = 'http://localhost/school-management-system/api';

/**
 * API Key if your backend uses X-API-Key header for auth.
 * Alternatively, if using Bearer tokens, the token will be retrieved from AuthContext/localStorage.
 * This is a placeholder; actual key management will depend on the auth strategy.
 */
export const API_KEY = 'YOUR_PHP_API_KEY_IF_APPLICABLE'; // Replace if you use a static API key

/**
 * Default headers for API requests.
 * Content-Type is set to JSON.
 * Additional headers like Authorization will be added dynamically by apiService.
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Timeout for API requests in milliseconds.
 */
export const API_TIMEOUT = 10000; // 10 seconds
