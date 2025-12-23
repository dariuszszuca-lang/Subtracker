import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Mail, Smartphone, Calendar, AlertTriangle, TrendingUp, Save, Check } from 'lucide-react';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '../types';
import { updateUserNotificationSettings, getUserNotificationSettings } from '../services/firebaseService';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (user?.uid) {
        const settings = await getUserNotificationSettings(user.uid);
        if (settings) {
          setNotifications(settings);
        }
      }
    };
    loadSettings();
  }, [user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await updateUserNotificationSettings(user.uid, notifications);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Błąd zapisu ustawień:', error);
    }
    setSaving(false);
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8">Ustawienia</h2>

      {/* Profil */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 space-y-6 mb-6">
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
      </div>

      {/* Powiadomienia */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 space-y-6 mb-6">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Powiadomienia</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.enabled}
              onChange={() => toggleSetting('enabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className={`space-y-4 ${!notifications.enabled ? 'opacity-50 pointer-events-none' : ''}`}>

          {/* Kanały */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-400">Kanały powiadomień</p>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Email</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailEnabled}
                  onChange={() => toggleSetting('emailEnabled')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Push (przeglądarka)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.pushEnabled}
                  onChange={() => toggleSetting('pushEnabled')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Kiedy przypominać */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-400">Przypomnij przed płatnością</p>
            <div className="flex gap-2">
              {[1, 3, 7].map(days => (
                <button
                  key={days}
                  onClick={() => setNotifications(prev => ({ ...prev, daysBefore: days }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    notifications.daysBefore === days
                      ? 'bg-primary text-white'
                      : 'bg-background border border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {days} {days === 1 ? 'dzień' : 'dni'}
                </button>
              ))}
            </div>
          </div>

          {/* Dodatkowe alerty */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-400">Dodatkowe powiadomienia</p>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-sm">Podsumowanie tygodniowe</span>
                  <p className="text-xs text-slate-500">Digest nadchodzących płatności</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={() => toggleSetting('weeklyDigest')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <div>
                  <span className="text-sm">Koniec okresu próbnego</span>
                  <p className="text-xs text-slate-500">Alert przed końcem trial</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.trialEndReminder}
                  onChange={() => toggleSetting('trialEndReminder')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <div>
                  <span className="text-sm">Zmiana ceny</span>
                  <p className="text-xs text-slate-500">Alert gdy edytujesz kwotę subskrypcji</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.priceChangeAlert}
                  onChange={() => toggleSetting('priceChangeAlert')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Zapisz */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>Zapisuję...</>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Zapisano!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Zapisz ustawienia
            </>
          )}
        </button>
      </div>

      {/* Strefa niebezpieczna */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <h4 className="text-red-400 font-bold mb-2">Strefa niebezpieczna</h4>
        <button className="text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm border border-transparent hover:border-red-500/20">
          Usuń konto
        </button>
      </div>
    </div>
  );
};

export default Settings;
