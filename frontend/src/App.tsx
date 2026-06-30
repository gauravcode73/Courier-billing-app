import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { PageLoader } from './components/Loader';

// Lazy load or direct load pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateBill } from './pages/CreateBill';
import { SearchBills } from './pages/SearchBills';
import { DailyReports } from './pages/DailyReports';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/create" 
        element={
          <PrivateRoute>
            <CreateBill />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/search" 
        element={
          <PrivateRoute>
            <SearchBills />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <DailyReports />
          </PrivateRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
