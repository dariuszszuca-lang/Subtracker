
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebaseService';
import { Subscription } from '../types';
import { calculateNextPayment, convertToPLN, getMonthlyCost, getYearlyCost, formatCurrency, getDaysUntil, formatDate } from '../utils/helpers';
import { TrendingUp, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ label: string; value: string; subValue?: string; icon: any; color: string }> = ({ label, value, subValue, icon: Icon, color }) => (
  <div className="bg-surface border border-slate-700/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${color}`} />
    <div className="flex items-start justify-between mb-4 relative">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      dbService.getSubscriptions(user.uid)
        .then(data => {
          // Recalculate nextPayment
          const updated = data.map(s => ({
            ...s,
            nextPayment: calculateNextPayment(s.startDate, s.cycle).toISOString()
          })).sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime());
          setSubs(updated);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-surface rounded-2xl"></div>
      <div className="h-64 bg-surface rounded-2xl"></div>
    </div>;
  }

  // Calculate stats
  const activeSubs = subs.filter(s => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((acc, sub) => acc + convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 0);
  const yearlyTotal = activeSubs.reduce((acc, sub) => acc + convertToPLN(getYearlyCost(sub.amount, sub.cycle), sub.currency), 0);
  
  // Upcoming payments (next 7 days)
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const upcoming = activeSubs.filter(s => {
    const d = new Date(s.nextPayment);
    return d >= today && d <= sevenDaysLater;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1">Cześć, {user?.displayName?.split(' ')[0]}! 👋</h2>
        <p className="text-slate-400">Oto podsumowanie Twoich subskrypcji.</p>
      </div>

      {/* Info o powiadomieniach email */}
      <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Powiadomienia email już wkrótce!</p>
          <p className="text-xs text-slate-400">Pracujemy nad wysyłką przypomnień o płatnościach na Twój email.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Miesięczne wydatki" 
          value={formatCurrency(monthlyTotal, 'PLN')} 
          subValue={`≈ ${formatCurrency(yearlyTotal, 'PLN')} rocznie`}
          icon={CreditCard}
          color="bg-primary"
        />
        <StatCard 
          label="Aktywne subskrypcje" 
          value={activeSubs.length.toString()} 
          subValue={`${subs.length - activeSubs.length} nieaktywnych`}
          icon={TrendingUp}
          color="bg-accent"
        />
        <StatCard 
          label="Najbliższa płatność" 
          value={activeSubs[0] ? getDaysUntil(activeSubs[0].nextPayment) : '-'} 
          subValue={activeSubs[0]?.name || 'Brak'}
          icon={Calendar}
          color="bg-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming List */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Najbliższe 7 dni</h3>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded-md text-slate-300">{upcoming.length}</span>
          </div>
          
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-slate-700/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold bg-slate-800 text-slate-300`}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{sub.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(sub.nextPayment)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(sub.amount, sub.currency)}</p>
                    <p className="text-xs text-primary">{getDaysUntil(sub.nextPayment)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Brak płatności w najbliższym tygodniu. 🎉</p>
            </div>
          )}
        </div>

        {/* Quick Actions / All Subs Preview */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Twoje subskrypcje</h3>
            <Link to="/subscriptions" className="text-sm text-primary hover:text-primaryHover flex items-center">
              Wszystkie <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="flex-1 space-y-3 overflow-hidden">
             {activeSubs.slice(0, 4).map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                       {sub.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{sub.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">{formatCurrency(sub.amount, sub.currency)}</span>
                </div>
             ))}
             {activeSubs.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                 <p className="text-slate-400 mb-4">Nie masz jeszcze żadnych subskrypcji.</p>
                 <Link to="/subscriptions/add" className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-sm transition-colors">
                   Dodaj pierwszą
                 </Link>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
