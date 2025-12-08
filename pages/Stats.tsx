
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebaseService';
import { Subscription, CATEGORIES } from '../types';
import { convertToPLN, getMonthlyCost, formatCurrency } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const Stats: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  
  useEffect(() => {
    if (user) {
      dbService.getSubscriptions(user.uid).then(data => setSubs(data));
    }
  }, [user]);

  const activeSubs = subs.filter(s => s.status === 'active');
  const totalMonthly = activeSubs.reduce((acc, sub) => acc + convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 0);

  // Prepare data for Pie Chart (Category Distribution)
  const categoryData = CATEGORIES.map(cat => {
    const value = activeSubs
      .filter(s => s.category === cat.value)
      .reduce((acc, sub) => acc + convertToPLN(getMonthlyCost(sub.amount, sub.cycle), sub.currency), 0);
    return {
      name: cat.label,
      value: Number(value.toFixed(2)),
      color: cat.color.includes('bg-') ? cat.color.match(/bg-(\w+)-/)?.[1] || 'slate' : 'slate'
    };
  }).filter(d => d.value > 0);
  
  // Custom colors matching the Tailwind classes roughly
  const COLORS: Record<string, string> = {
    pink: '#ec4899', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', cyan: '#06b6d4', indigo: '#6366f1', slate: '#64748b'
  };

  // Top Most Expensive
  const sortedByCost = [...activeSubs]
    .sort((a, b) => convertToPLN(getMonthlyCost(b.amount, b.cycle), b.currency) - convertToPLN(getMonthlyCost(a.amount, a.cycle), a.currency))
    .slice(0, 5)
    .map(s => ({
      name: s.name,
      cost: Number(convertToPLN(getMonthlyCost(s.amount, s.cycle), s.currency).toFixed(2))
    }));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Statystyki wydatków</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4 self-start">Wydatki wg kategorii (PLN/mies)</h3>
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
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.color] || '#cbd5e1'} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value) => formatCurrency(Number(value), 'PLN')}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">Łącznie miesięcznie</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonthly, 'PLN')}</p>
          </div>
        </div>

        {/* Top 5 Expensive */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
           <h3 className="text-lg font-bold mb-4">Top 5 najdroższych (Miesięcznie)</h3>
           <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={sortedByCost} layout="vertical" margin={{ left: 20 }}>
                 <XAxis type="number" hide />
                 <YAxis type="category" dataKey="name" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(value) => formatCurrency(Number(value), 'PLN')}
                 />
                 <Bar dataKey="cost" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
