import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8">Ustawienia</h2>
      
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-700/50 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
          <div>
             <h3 className="font-bold text-lg">{user?.displayName}</h3>
             <p className="text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
           <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Domyślna waluta</label>
              <select className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:border-primary disabled:opacity-50" disabled>
                 <option>PLN (Polski Złoty)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Zmiana waluty dostępna wkrótce.</p>
           </div>
           
           <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Motyw</label>
              <div className="flex space-x-4">
                 <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/50">Ciemny</button>
                 <button className="px-4 py-2 rounded-lg bg-background border border-slate-700 text-slate-400" disabled>Jasny</button>
              </div>
           </div>
        </div>

        <div className="pt-6 border-t border-slate-700/50">
           <h4 className="text-red-400 font-bold mb-2">Strefa niebezpieczna</h4>
           <button className="text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm border border-transparent hover:border-red-500/20">
             Usuń konto
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;