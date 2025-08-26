// File: src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Solution 1: Check if element exists before creating root
const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Root element with id "root" not found in the DOM. ' +
    'Make sure you have <div id="root"></div> in your HTML file.'
  );
}

// Solution 2: Ensure DOM is ready (alternative approach)
// document.addEventListener('DOMContentLoaded', () => {
//   const container = document.getElementById('root');
//   if (container) {
//     const root = createRoot(container);
//     root.render(<App />);
//   }
// });

// Main solution - create root with proper error handling
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);