import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // ← REQUIRED
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>              {/* ← WRAP HERE */}
      <HelmetProvider>
        <Toaster />
        <App />
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);