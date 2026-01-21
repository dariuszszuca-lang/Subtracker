
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebaseService';
import { Subscription, CATEGORIES } from '../types';
import { convertToPLN, getMonthlyCost, getYearlyCost, formatCurrency } from '../utils/helpers';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Area, AreaChart
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Calendar, DollarSign, PieChart as PieIcon, BarChart3, X } from 'lucide-react';

const MONTHS_PL = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

const Stats: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dbService.getSubscriptions(user.uid).then(data => {
        setSubs(data);
        setLoading(false);
      });
    }
  }, [user]);

  const activeSubs = subs.filter(s => s.status === 'active' || s.status === 'trial');

  // Obliczenia
  const totalMonthly = activeSubs.reduce((acc, sub) => acc + convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 0);
  const totalYearly = activeSubs.reduce((acc, sub) => acc + convertToPLN(getYearlyCost(sub.amount, sub.cycle), sub.currency), 0);

  // Dane do wykresu kołowego (kategorie)
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const value = activeSubs
        .filter(s => s.category === cat.value)
        .reduce((acc, sub) => acc + convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 0);
      return {
        name: cat.label,
        value: Number(value.toFixed(2)),
        color: cat.color.includes('bg-') ? cat.color.match(/bg-(\w+)-/)?.[1] || 'slate' : 'slate'
      };
    }).filter(d => d.value > 0);
  }, [activeSubs]);

  // Kolory
  const COLORS: Record<string, string> = {
    pink: '#ec4899', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', cyan: '#06b6d4', indigo: '#6366f1', orange: '#f97316', slate: '#64748b'
  };

  // Top 5 najdroższych
  const sortedByCost = useMemo(() => {
    return [...activeSubs]
      .sort((a, b) => convertToPLN(getMonthlyCost(b.amount, b.cycle), b.currency) - convertToPLN(getMonthlyCost(a.amount, a.cycle), a.currency))
      .slice(0, 5)
      .map(s => ({
        name: s.name,
        cost: Number(convertToPLN(getMonthlyCost(s.amount, s.cycle), s.currency).toFixed(2))
      }));
  }, [activeSubs]);

  // Symulacja trendu miesięcznego (na podstawie daty dodania subskrypcji)
  const monthlyTrend = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyData: Record<number, number> = {};

    // Inicjalizuj wszystkie miesiące
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = 0;
    }

    // Oblicz koszt dla każdego miesiąca
    activeSubs.forEach(sub => {
      const startDate = new Date(sub.startDate);
      const startMonth = startDate.getFullYear() === currentYear ? startDate.getMonth() : 0;

      for (let month = startMonth; month < 12; month++) {
        monthlyData[month] += convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency);
      }
    });

    return MONTHS_PL.map((name, idx) => ({
      name,
      wydatki: Number(monthlyData[idx].toFixed(2))
    }));
  }, [activeSubs]);

  // Statystyki podsumowujące
  const stats = useMemo(() => {
    const avgPerSub = activeSubs.length > 0 ? totalMonthly / activeSubs.length : 0;
    const mostExpensiveCategory = categoryData.length > 0
      ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0])
      : null;

    return {
      totalSubs: activeSubs.length,
      avgPerSub,
      mostExpensiveCategory,
      dailyCost: totalMonthly / 30,
    };
  }, [activeSubs, totalMonthly, categoryData]);

  // Subskrypcje w wybranej kategorii (drill-down)
  const selectedCategorySubs = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryValue = CATEGORIES.find(c => c.label === selectedCategory)?.value;
    return activeSubs
      .filter(s => s.category === categoryValue)
      .sort((a, b) => convertToPLN(getMonthlyCost(b.amount, b.cycle), b.currency) - convertToPLN(getMonthlyCost(a.amount, a.cycle), a.currency));
  }, [selectedCategory, activeSubs]);

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedCategory(data.name);
    }
  };

  // Eksport do CSV
  const exportToCSV = () => {
    const headers = ['Nazwa', 'Kwota', 'Waluta', 'Cykl', 'Kategoria', 'Status', 'Następna płatność', 'Koszt miesięczny (PLN)'];
    const rows = subs.map(sub => [
      sub.name,
      sub.amount,
      sub.currency,
      sub.cycle,
      CATEGORIES.find(c => c.value === sub.category)?.label || sub.category,
      sub.status,
      sub.nextPayment,
      convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtracker-raport-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Statystyki i analityka</h2>
          <p className="text-slate-400 text-sm mt-1">Pełny obraz Twoich wydatków</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-slate-700 rounded-lg text-sm hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Eksportuj CSV
        </button>
      </div>

      {/* Karty podsumowania */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            Miesięcznie
          </div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalMonthly, 'PLN')}</div>
          <div className="text-xs text-slate-500 mt-1">{formatCurrency(stats.dailyCost, 'PLN')}/dzień</div>
        </div>

        <div className="bg-surface border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            Rocznie
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalYearly, 'PLN')}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.totalSubs} subskrypcji</div>
        </div>

        <div className="bg-surface border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            Średnia/sub
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.avgPerSub, 'PLN')}</div>
          <div className="text-xs text-slate-500 mt-1">na subskrypcję</div>
        </div>

        <div className="bg-surface border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <PieIcon className="w-4 h-4" />
            Top kategoria
          </div>
          <div className="text-2xl font-bold text-white truncate">
            {stats.mostExpensiveCategory?.name || '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.mostExpensiveCategory ? formatCurrency(stats.mostExpensiveCategory.value, 'PLN') : '-'}
          </div>
        </div>
      </div>

      {/* Wykres trendu */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trend wydatków {new Date().getFullYear()}
          </h3>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorWydatki" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v} zł`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                formatter={(value) => [formatCurrency(Number(value), 'PLN'), 'Wydatki']}
              />
              <Area type="monotone" dataKey="wydatki" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorWydatki)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kategorie - Pie Chart */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-2">Wydatki wg kategorii</h3>
          <p className="text-xs text-slate-500 mb-4">Kliknij w kategorię, aby zobaczyć szczegóły</p>
          {categoryData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={handlePieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.color] || '#cbd5e1'} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(value) => formatCurrency(Number(value), 'PLN')}
                  />
                  <Legend onClick={(e) => handlePieClick({ name: e.value })} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Brak danych do wyświetlenia
            </div>
          )}
        </div>

        {/* Top 5 - Bar Chart */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Top 5 najdroższych</h3>
          {sortedByCost.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedByCost} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(value) => formatCurrency(Number(value), 'PLN')}
                  />
                  <Bar dataKey="cost" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Brak danych do wyświetlenia
            </div>
          )}
        </div>
      </div>

      {/* Roczne podsumowanie */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Roczne podsumowanie {new Date().getFullYear()}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{stats.totalSubs}</div>
            <div className="text-sm text-slate-400">aktywnych subskrypcji</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{formatCurrency(totalYearly, 'PLN')}</div>
            <div className="text-sm text-slate-400">wydatki roczne</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{formatCurrency(totalMonthly, 'PLN')}</div>
            <div className="text-sm text-slate-400">średnio miesięcznie</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{categoryData.length}</div>
            <div className="text-sm text-slate-400">kategorii wydatków</div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <div className="font-medium text-sm">Wskazówka oszczędności</div>
              <div className="text-slate-400 text-sm mt-1">
                {stats.mostExpensiveCategory
                  ? `Kategoria "${stats.mostExpensiveCategory.name}" stanowi największy wydatek. Rozważ przegląd subskrypcji w tej kategorii.`
                  : 'Dodaj subskrypcje aby zobaczyć analizę oszczędności.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Drill-down */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCategory(null)}>
          <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold">{selectedCategory}</h3>
              <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {selectedCategorySubs.length > 0 ? (
                <div className="space-y-3">
                  {selectedCategorySubs.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-slate-700/50">
                      <div>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-xs text-slate-500">{sub.cycle === 'monthly' ? 'miesięcznie' : sub.cycle === 'yearly' ? 'rocznie' : sub.cycle}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">{formatCurrency(convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 'PLN')}</div>
                        <div className="text-xs text-slate-500">/miesiąc</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-700 flex justify-between">
                    <span className="text-slate-400">Suma:</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(selectedCategorySubs.reduce((acc, sub) => acc + convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 0), 'PLN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">Brak subskrypcji w tej kategorii</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
