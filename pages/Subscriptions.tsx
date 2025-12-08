import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockFirestore } from '../services/mockFirebase';
import { Subscription, CATEGORIES, STATUSES } from '../types';
import { calculateNextPayment, formatCurrency, getDaysUntil, formatDate } from '../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Grid, List, MoreVertical } from 'lucide-react';

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortMethod, setSortMethod] = useState<'date' | 'amount' | 'name'>('date');

  useEffect(() => {
    if (user) {
      mockFirestore.getSubscriptions(user.uid).then(data => {
        const processed = data.map(s => ({
            ...s,
            nextPayment: calculateNextPayment(s.startDate, s.cycle).toISOString()
        }));
        setSubs(processed);
        setFilteredSubs(processed);
      });
    }
  }, [user]);

  useEffect(() => {
    let result = [...subs];

    if (search) {
      result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (filterCategory !== 'all') {
      result = result.filter(s => s.category === filterCategory);
    }

    result.sort((a, b) => {
      if (sortMethod === 'date') return new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime();
      if (sortMethod === 'amount') return b.amount - a.amount;
      if (sortMethod === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    setFilteredSubs(result);
  }, [subs, search, filterCategory, sortMethod]);

  const getCategoryColor = (cat: string) => CATEGORIES.find(c => c.value === cat)?.color || 'bg-slate-500/20 text-slate-400';
  const getStatusColor = (status: string) => STATUSES.find(s => s.value === status)?.color || 'bg-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Subskrypcje</h2>
        <Link to="/subscriptions/add" className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <Plus size={18} />
          <span>Dodaj nową</span>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-surface border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Szukaj..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
           <select 
             value={filterCategory} 
             onChange={(e) => setFilterCategory(e.target.value)}
             className="bg-background border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
           >
             <option value="all">Wszystkie kategorie</option>
             {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
           </select>

           <select 
             value={sortMethod} 
             onChange={(e) => setSortMethod(e.target.value as any)}
             className="bg-background border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
           >
             <option value="date">Wg daty płatności</option>
             <option value="amount">Wg kwoty</option>
             <option value="name">Wg nazwy</option>
           </select>
           
           <div className="border-l border-slate-700 pl-2 flex gap-1">
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
               <Grid size={18} />
             </button>
             <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
               <List size={18} />
             </button>
           </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubs.map(sub => (
            <div 
              key={sub.id} 
              onClick={() => navigate(`/subscriptions/${sub.id}`)}
              className="bg-surface border border-slate-700/50 rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer group relative hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl font-bold text-slate-300 group-hover:from-primary group-hover:to-accent group-hover:text-white transition-all">
                  {sub.name.charAt(0)}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(sub.category)}`}>
                   {CATEGORIES.find(c => c.value === sub.category)?.label}
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{sub.name}</h3>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-xl font-bold">{formatCurrency(sub.amount, sub.currency)}</span>
                <span className="text-xs text-slate-400">/{sub.cycle === 'monthly' ? 'mc' : sub.cycle === 'yearly' ? 'rok' : sub.cycle}</span>
              </div>

              <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm">
                <span className="text-slate-400">Następna:</span>
                <span className={getDaysUntil(sub.nextPayment).includes('za') || getDaysUntil(sub.nextPayment) === 'Jutro' || getDaysUntil(sub.nextPayment) === 'Dzisiaj' ? 'text-primary font-medium' : 'text-slate-300'}>
                  {formatDate(sub.nextPayment)} <span className="text-xs opacity-70">({getDaysUntil(sub.nextPayment)})</span>
                </span>
              </div>
              
              {sub.status !== 'active' && (
                <div className="absolute top-2 right-2">
                   <span className={`w-3 h-3 rounded-full block ${getStatusColor(sub.status)} ring-2 ring-surface`}></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-surface border border-slate-700/50 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-4 font-medium">Nazwa</th>
                <th className="p-4 font-medium">Koszt</th>
                <th className="p-4 font-medium">Kategoria</th>
                <th className="p-4 font-medium">Następna płatność</th>
                <th className="p-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredSubs.map(sub => (
                <tr 
                  key={sub.id} 
                  onClick={() => navigate(`/subscriptions/${sub.id}`)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-xs">
                        {sub.name.charAt(0)}
                      </div>
                      <span className="font-medium">{sub.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {formatCurrency(sub.amount, sub.currency)} <span className="text-xs text-slate-500">/{sub.cycle.substring(0,2)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs border ${getCategoryColor(sub.category)}`}>
                       {CATEGORIES.find(c => c.value === sub.category)?.label}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {formatDate(sub.nextPayment)}
                  </td>
                  <td className="p-4 text-right">
                     <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(sub.status)} mr-2`}></span>
                     <span className="text-sm capitalize">{sub.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredSubs.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>Nie znaleziono subskrypcji spełniających kryteria.</p>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;