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
import Sharing from './pages/Sharing';
import Checkout from './pages/Checkout';

// Landing Page for non-authenticated users
const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
         <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SubTracker</h1>
         <div className="flex items-center gap-4">
            <a href="#pricing" className="text-white/60 hover:text-white transition-colors">Cennik</a>
            <a href="#/login" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-colors">
               Zaloguj się
            </a>
         </div>
       </nav>

       <main className="flex-1 flex flex-col items-center text-center px-4 pt-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
             Twoje subskrypcje.<br/>
             <span className="text-primary">Pod kontrolą.</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mb-10 leading-relaxed">
             Netflix, Spotify, Hosting, ChatGPT... Przeciętny Polak płaci za 8 subskrypcji.
             Ile Ty tracisz na te, o których zapomniałeś?
          </p>
          <a href="#pricing" className="bg-primary hover:bg-primaryHover text-white text-lg px-8 py-4 rounded-full font-medium shadow-lg shadow-primary/25 transition-all hover:scale-105">
             Sprawdź cennik - od 49 zł
          </a>

          {/* Konkretne benefity */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
             <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary text-2xl font-bold">8+</div>
                <h3 className="font-bold text-lg mb-2">Średnio 8 subskrypcji</h3>
                <p className="text-slate-400">Tyle ma przeciętny użytkownik. Netflix, Spotify, chmura, domeny, narzędzia AI... Wszystko w jednym dashboardzie.</p>
             </div>
             <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent text-2xl font-bold">3 dni</div>
                <h3 className="font-bold text-lg mb-2">Powiadomienie przed płatnością</h3>
                <p className="text-slate-400">Email 3 dni przed każdą płatnością. Zdążysz anulować to, czego nie używasz. Koniec z niespodziankami na koncie.</p>
             </div>
             <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 text-pink-500 text-2xl font-bold">~200 zł</div>
                <h3 className="font-bold text-lg mb-2">Tyle tracisz rocznie</h3>
                <p className="text-slate-400">Na subskrypcje, których nie używasz. Jeden zapomniane konto = 50-100 zł rocznie. SubTracker się zwraca po pierwszym miesiącu.</p>
             </div>
          </div>

          {/* Sekcja cenowa */}
          <div id="pricing" className="mt-32 w-full max-w-5xl scroll-mt-20">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Jednorazowa płatność. Dożywotni dostęp.</h2>
             <p className="text-slate-400 mb-12">Bez abonamentu. Płacisz raz, korzystasz zawsze.</p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Early Bird */}
                <div className="bg-surface/50 p-6 rounded-2xl border-2 border-primary relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">Najpopularniejszy</div>
                   <h3 className="font-bold text-xl mb-1">Early Bird</h3>
                   <p className="text-slate-400 text-sm mb-4">Dla pierwszych 50 osób</p>
                   <div className="mb-4">
                      <span className="text-4xl font-bold">49 zł</span>
                      <span className="text-slate-400 line-through ml-2">79 zł</span>
                   </div>
                   <ul className="text-left text-sm space-y-2 mb-6 text-slate-300">
                      <li>✓ Nielimitowane subskrypcje</li>
                      <li>✓ Powiadomienia email</li>
                      <li>✓ Kalendarz płatności</li>
                      <li>✓ Dożywotni dostęp</li>
                   </ul>
                   <a href="#/checkout/earlybird" className="block w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-xl text-center font-medium transition-colors">
                      Kup teraz
                   </a>
                </div>

                {/* Solo */}
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/10">
                   <h3 className="font-bold text-xl mb-1">Solo</h3>
                   <p className="text-slate-400 text-sm mb-4">Pełna wersja</p>
                   <div className="mb-4">
                      <span className="text-4xl font-bold">79 zł</span>
                   </div>
                   <ul className="text-left text-sm space-y-2 mb-6 text-slate-300">
                      <li>✓ Nielimitowane subskrypcje</li>
                      <li>✓ Powiadomienia email</li>
                      <li>✓ Kalendarz płatności</li>
                      <li>✓ Raporty i statystyki</li>
                      <li>✓ Eksport CSV</li>
                   </ul>
                   <a href="#/checkout/solo" className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-center font-medium transition-colors">
                      Kup teraz
                   </a>
                </div>

                {/* Rodzina */}
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/10">
                   <h3 className="font-bold text-xl mb-1">Rodzina</h3>
                   <p className="text-slate-400 text-sm mb-4">Do 5 osób</p>
                   <div className="mb-4">
                      <span className="text-4xl font-bold">129 zł</span>
                      <span className="text-slate-400 text-sm ml-2">= 26 zł/os</span>
                   </div>
                   <ul className="text-left text-sm space-y-2 mb-6 text-slate-300">
                      <li>✓ Wszystko z Solo</li>
                      <li>✓ 5 osobnych kont</li>
                      <li>✓ Współdzielone subskrypcje</li>
                      <li>✓ Podział kosztów</li>
                   </ul>
                   <a href="#/checkout/family" className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-center font-medium transition-colors">
                      Kup teraz
                   </a>
                </div>
             </div>
          </div>

          {/* FAQ / Obiekcje */}
          <div className="mt-24 w-full max-w-3xl text-left">
             <h2 className="text-2xl font-bold mb-8 text-center">Częste pytania</h2>
             <div className="space-y-4">
                <div className="bg-surface/50 p-5 rounded-xl border border-white/5">
                   <h4 className="font-bold mb-2">Dlaczego jednorazowa płatność?</h4>
                   <p className="text-slate-400 text-sm">Bo to aplikacja do śledzenia subskrypcji. Byłoby dziwne, gdyby sama była kolejną subskrypcją. Płacisz raz - korzystasz zawsze.</p>
                </div>
                <div className="bg-surface/50 p-5 rounded-xl border border-white/5">
                   <h4 className="font-bold mb-2">A jeśli mi się nie spodoba?</h4>
                   <p className="text-slate-400 text-sm">14 dni na zwrot bez podawania przyczyny. Napisz maila - oddajemy pieniądze.</p>
                </div>
                <div className="bg-surface/50 p-5 rounded-xl border border-white/5">
                   <h4 className="font-bold mb-2">Czy moje dane są bezpieczne?</h4>
                   <p className="text-slate-400 text-sm">Tak. Nie przechowujemy danych kart ani loginów do serwisów. Tylko nazwy subskrypcji i kwoty - to Ty wpisujesz co chcesz.</p>
                </div>
             </div>
          </div>
       </main>

       <footer className="p-8 text-center text-slate-600 text-sm mt-20">
         © 2025 SubTracker
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