import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { DeviceDataProvider } from './contexts/DeviceDataContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './index.css';

// Apply the custom DaisyUI theme globally
document.documentElement.setAttribute('data-theme', 'iset');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <DeviceDataProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#ffffff',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
              }}
            />
          </DeviceDataProvider>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
