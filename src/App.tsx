import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useCampStore } from './store/campStore';
import LoginPage from './components/LoginPage';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Campers = React.lazy(() => import('./components/Campers'));
const Announcements = React.lazy(() => import('./components/Announcements'));
const Chat = React.lazy(() => import('./components/Chat'));
const Admin = React.lazy(() => import('./components/Admin'));
const Tracking = React.lazy(() => import('./components/Tracking'));
const Documents = React.lazy(() => import('./components/Documents'));

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { initializeRealtimeSubscription } = useCampStore();

  useEffect(() => {
    initializeRealtimeSubscription();
  }, [initializeRealtimeSubscription]);

  return (
    <Router>
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/campers" element={
            <ProtectedRoute>
              <Campers />
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/tracking" element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;