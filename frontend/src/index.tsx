import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
