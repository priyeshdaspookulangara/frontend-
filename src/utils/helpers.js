// src/utils/helpers.js

/**
 * Formats a date object or string into a more readable format.
 * Example: "YYYY-MM-DD" or "Jan 1, 2023"
 * @param {Date|string} dateInput - The date to format.
 * @param {object} options - Formatting options for toLocaleDateString.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateInput, options) => {
  if (!dateInput) return '';
  const date = new Date(dateInput); // Handles both Date objects and valid date strings
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString(undefined, options || defaultOptions);
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Helper to get a default academic year start date.
 * Assumes academic year starts around August 1st.
 * If current month is before August, it uses the previous year's August.
 * @returns {Date} A Date object representing August 1st of the current/previous academic year.
 */
export const getDefaultAcademicYearStartDate = () => {
    const today = new Date();
    let year = today.getFullYear();
    // Month is 0-indexed, 7 is August
    if (today.getMonth() < 7) {
      year -= 1;
    }
    return new Date(year, 7, 1); // August 1st
};


// Add other general utility functions here as needed.
// For example, functions for data transformation, validation (though libraries like Yup/Zod are better for complex validation), etc.

/**
 * Simple email validation regex. For more robust validation, use a library.
 * @param {string} email The email to validate.
 * @returns {boolean} True if email format is valid, false otherwise.
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    // Basic regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Placeholder for a more complex permission check if needed beyond simple userType.
 * @param {object} user The user object from AuthContext.
 * @param {string|Array<string>} requiredPermissions The permission(s) required.
 * @returns {boolean} True if user has the permission, false otherwise.
 */
export const hasPermission = (user, requiredPermissions) => {
    if (!user || !user.userType) return false; // Basic check

    // This is a simplistic example. Real permission systems might involve roles with multiple permissions.
    if (Array.isArray(requiredPermissions)) {
        return requiredPermissions.includes(user.userType); // If permissions are just user types
    }
    return user.userType === requiredPermissions;
};
