// src/components/ErrorMessage.js
import React from 'react';

/**
 * A simple component to display error messages.
 * Styles for this component are expected to be in a global CSS file (e.g., index.css or App.css)
 * under the class name 'error-message'.
 *
 * Props:
 *  - message: string - The error message to display.
 *  - style: object (optional) - Custom styles to apply to the error message container.
 *
 * Example CSS:
 * .error-message {
 *   color: #e74c3c; // A common error color (e.g., red)
 *   background-color: #fdd; // Light red background
 *   border: 1px solid #e74c3c;
 *   padding: 10px;
 *   border-radius: 4px;
 *   margin-bottom: 15px; // Or as needed
 *   text-align: left; // Or center, depending on design
 * }
 */
const ErrorMessage = ({ message, style }) => {
  if (!message) {
    return null; // Don't render anything if there's no message
  }

  const defaultStyle = {
    // Inline styles as a fallback if global CSS isn't loaded or specific overrides are needed.
    // However, prefer global CSS for consistency.
    // color: '#e74c3c',
    // backgroundColor: '#fdd2d2', // Slightly different from index.css for differentiation
    // border: '1px solid #e74c3c',
    // padding: '10px',
    // borderRadius: '4px',
    // marginBottom: '15px',
  };

  return (
    <div className="error-message" style={{ ...defaultStyle, ...style }}>
      {message}
    </div>
  );
};

export default ErrorMessage;
