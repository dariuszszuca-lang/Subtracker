import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import AddEditSubscription from './pages/AddEditSubscription';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Sharing from './pages/Sharing';
import Checkout from './pages/Checkout';

// Landing Page - rendered by static HTML in index.html
// This component returns null because landing is handled by static HTML
const Landing: React.FC = () => null;

// Hook to toggle fullscreen app mode based on route
const useAppActiveClass = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // Define actual React app routes that should show fullscreen
    const appRoutes = ['/login', '/register', '/checkout', '/dashboard', '/subscriptions', '/stats', '/calendar', '/sharing', '/settings'];
    const isAppRoute = appRoutes.some(route => location.pathname.startsWith(route));

    // Show React app fullscreen only for actual app routes or when user is logged in
    if (isAppRoute || user) {
      root.classList.add('app-active');
    } else {
      root.classList.remove('app-active');
    }
  }, [location.pathname, user]);
};

// Guard wrapper
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  
  return user ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/" replace />
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  // Toggle fullscreen mode based on current route
  useAppActiveClass();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login isRegister />} />
      <Route path="/checkout/:planId" element={<Checkout />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/subscriptions/add" element={<AddEditSubscription />} />
        <Route path="/subscriptions/:id" element={<AddEditSubscription />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/sharing" element={<Sharing />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;