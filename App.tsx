import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import AddEditSubscription from './pages/AddEditSubscription';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';

// Landing Page for non-authenticated users
const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
         <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SubTracker</h1>
         <a href="#/login" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-colors">
            Zaloguj się
         </a>
       </nav>
       
       <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
             Twoje subskrypcje.<br/> 
             <span className="text-primary">Pod kontrolą.</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mb-10 leading-relaxed">
             Netflix, Spotify, Hosting, AI... Przestań tracić pieniądze na zapomniane płatności. 
             Śledź wszystko w jednym miejscu.
          </p>
          <a href="#/register" className="bg-primary hover:bg-primaryHover text-white text-lg px-8 py-4 rounded-full font-medium shadow-lg shadow-primary/25 transition-all hover:scale-105">
             Załóż darmowe konto
          </a>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
             <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary text-xl">✨</div>
                <h3 className="font-bold text-lg mb-2">Wszystko w jednym miejscu</h3>
                <p className="text-slate-400">Zbierz wszystkie swoje regularne płatności w przejrzystym dashboardzie.</p>
             </div>
             <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent text-xl">📅</div>
                <h3 className="font-bold text-lg mb-2">Pamiętaj o terminach</h3>
                <p className="text-slate-400">Dokładnie wiesz, kiedy i ile zapłacisz w nadchodzącym tygodniu.</p>
             </div>
             <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 text-pink-500 text-xl">💸</div>
                <h3 className="font-bold text-lg mb-2">Analizuj wydatki</h3>
                <p className="text-slate-400">Zobacz ile wydajesz rocznie na poszczególne kategorie usług.</p>
             </div>
          </div>
       </main>
       
       <footer className="p-8 text-center text-slate-600 text-sm">
         © 2024 SubTracker. Projekt demonstracyjny.
       </footer>
    </div>
  );
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
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login isRegister />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/subscriptions/add" element={<AddEditSubscription />} />
        <Route path="/subscriptions/:id" element={<AddEditSubscription />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/calendar" element={<Calendar />} />
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