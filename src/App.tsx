import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginScreen from './components/auth/LoginScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import MasterAdminDashboard from './components/master/MasterAdminDashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('App: Current user state:', user);
  console.log('App: Loading state:', loading);

  if (loading) {
    console.log('App: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('App: No user, showing login screen');
    return <LoginScreen />;
  }

  console.log('App: User role:', user.role);

  switch (user.role) {
    case 'admin':
      console.log('App: Rendering AdminDashboard');
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      );
    case 'master':
      console.log('App: Rendering MasterAdminDashboard');
      return (
        <ProtectedRoute allowedRoles={['master']}>
          <MasterAdminDashboard />
        </ProtectedRoute>
      );
    default:
      console.log('App: Unknown role, showing login screen');
      return <LoginScreen />;
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <DataProvider>
                <AppContent />
              </DataProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
