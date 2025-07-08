// src/components/LoadingSpinner.js
import React from 'react';

/**
 * A simple CSS-based loading spinner.
 * Styles for this component are expected to be in a global CSS file (e.g., index.css or App.css)
 * under the class name 'loading-spinner'.
 *
 * Example CSS:
 * .loading-spinner {
 *   border: 4px solid #f3f3f3; // Light grey
 *   border-top: 4px solid #3498db; // Blue
 *   border-radius: 50%;
 *   width: 30px;
 *   height: 30px;
 *   animation: spin 1s linear infinite;
 *   margin: 0 auto; // Or pass as prop/style for inline usage
 * }
 *
 * @keyframes spin {
 *   0% { transform: rotate(0deg); }
 *   100% { transform: rotate(360deg); }
 * }
 */
const LoadingSpinner = ({ size = '30px', color = '#3498db', topColor = '#f3f3f3', thickness = '4px', style }) => {
  const spinnerStyle = {
    border: `${thickness} solid ${topColor}`, // Light grey part
    borderTop: `${thickness} solid ${color}`, // Colored part
    borderRadius: '50%',
    width: size,
    height: size,
    animation: 'spin 1s linear infinite',
    margin: '0 auto', // Default margin, can be overridden by style prop
    ...style, // Allow custom styles to be passed
  };

  // Keyframes are typically defined in CSS, but for a self-contained component (without relying on global CSS):
  // This approach is less common for @keyframes in JS/React directly without CSS-in-JS libs.
  // For simplicity, it's assumed 'spin' animation is defined in a global CSS.
  // If not, a style tag could be injected, or a CSS-in-JS solution used.

  return <div style={spinnerStyle} className="loading-spinner-animation"></div>;
};

// Add keyframes to document head if not already present (for self-contained behavior)
// This is a bit of a hack for non-CSS-in-JS setups. Prefer global CSS.
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  const keyframes =`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }`;

  let animationExists = false;
  try {
    if (styleSheet && styleSheet.cssRules) {
      for (let i = 0; i < styleSheet.cssRules.length; i++) {
        if (styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE && styleSheet.cssRules[i].name === 'spin') {
          animationExists = true;
          break;
        }
      }
    }
  } catch (e) {
    // Catch potential security errors when accessing cssRules from different origins
    console.warn("Could not access CSS rules to check for 'spin' keyframes:", e.message);
  }


  if (!animationExists && styleSheet) {
    try {
      // styleSheet.insertRule(keyframes, styleSheet.cssRules ? styleSheet.cssRules.length : 0);
      // The above line might fail due to security or if stylesheet is not ready.
      // A safer way is to ensure a style tag exists or create one.
      let spinStyleTag = document.getElementById('spin-animation-style');
      if (!spinStyleTag) {
        spinStyleTag = document.createElement('style');
        spinStyleTag.id = 'spin-animation-style';
        spinStyleTag.innerHTML = keyframes;
        document.head.appendChild(spinStyleTag);
      }

    } catch (e) {
      console.error("Failed to insert spin keyframes:", e);
      // Fallback: rely on global CSS to define '.loading-spinner-animation @keyframes spin'
    }
  }
}


export default LoadingSpinner;
