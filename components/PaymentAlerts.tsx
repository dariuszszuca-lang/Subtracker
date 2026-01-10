import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService, getUserNotificationSettings } from '../services/firebaseService';
import { Subscription, NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '../types';
import { calculateNextPayment, formatCurrency } from '../utils/helpers';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  type: 'payment' | 'trial';
  subscription: Subscription;
  daysUntil: number;
}

const PaymentAlerts: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    const checkPayments = async () => {
      if (!user?.uid) return;

      // Load notification settings
      const notifSettings = await getUserNotificationSettings(user.uid);
      if (notifSettings) {
        setSettings(notifSettings);
      }

      // If notifications disabled, don't show anything
      if (!notifSettings?.enabled) return;

      // Load subscriptions
      const subs = await dbService.getSubscriptions(user.uid);
      const activeSubs = subs.filter(s => s.status === 'active' || s.status === 'trial');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newAlerts: Alert[] = [];

      // Check dismissed alerts from session storage
      const dismissedKey = `subtracker_dismissed_alerts_${today.toISOString().split('T')[0]}`;
      const previouslyDismissed = JSON.parse(sessionStorage.getItem(dismissedKey) || '[]');
      setDismissed(previouslyDismissed);

      activeSubs.forEach(sub => {
        const nextPayment = calculateNextPayment(sub.startDate, sub.cycle);
        nextPayment.setHours(0, 0, 0, 0);

        const diffTime = nextPayment.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Alert for upcoming payment based on user's daysBefore setting
        if (daysUntil >= 0 && daysUntil <= (notifSettings?.daysBefore || 3)) {
          newAlerts.push({
            id: `payment_${sub.id}_${daysUntil}`,
            type: 'payment',
            subscription: sub,
            daysUntil
          });
        }

        // Alert for trial ending
        if (sub.status === 'trial' && notifSettings?.trialEndReminder && daysUntil >= 0 && daysUntil <= 3) {
          newAlerts.push({
            id: `trial_${sub.id}`,
            type: 'trial',
            subscription: sub,
            daysUntil
          });
        }
      });

      // Filter out dismissed alerts
      setAlerts(newAlerts.filter(a => !previouslyDismissed.includes(a.id)));
    };

    checkPayments();
  }, [user?.uid]);

  const dismissAlert = (alertId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const dismissedKey = `subtracker_dismissed_alerts_${today}`;

    const newDismissed = [...dismissed, alertId];
    setDismissed(newDismissed);
    sessionStorage.setItem(dismissedKey, JSON.stringify(newDismissed));
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const dismissAll = () => {
    const today = new Date().toISOString().split('T')[0];
    const dismissedKey = `subtracker_dismissed_alerts_${today}`;

    const allIds = alerts.map(a => a.id);
    setDismissed(prev => [...prev, ...allIds]);
    sessionStorage.setItem(dismissedKey, JSON.stringify([...dismissed, ...allIds]));
    setAlerts([]);
  };

  if (!settings.enabled || alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {alerts.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={dismissAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Zamknij wszystkie
          </button>
        </div>
      )}

      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`relative flex items-center gap-4 p-4 rounded-xl border ${
            alert.type === 'trial'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : alert.daysUntil === 0
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-primary/10 border-primary/30'
          }`}
        >
          <div className={`p-2 rounded-lg ${
            alert.type === 'trial'
              ? 'bg-yellow-500/20'
              : alert.daysUntil === 0
              ? 'bg-red-500/20'
              : 'bg-primary/20'
          }`}>
            {alert.type === 'trial' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            ) : (
              <Bell className={`w-5 h-5 ${alert.daysUntil === 0 ? 'text-red-400' : 'text-primary'}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {alert.type === 'trial' ? (
                <>Okres trial dla <span className="text-yellow-400">{alert.subscription.name}</span> kończy się {
                  alert.daysUntil === 0 ? 'dzisiaj' : alert.daysUntil === 1 ? 'jutro' : `za ${alert.daysUntil} dni`
                }</>
              ) : (
                <>
                  {alert.daysUntil === 0 ? (
                    <span className="text-red-400">Dzisiaj płatność:</span>
                  ) : alert.daysUntil === 1 ? (
                    <span>Jutro płatność:</span>
                  ) : (
                    <span>Za {alert.daysUntil} dni płatność:</span>
                  )}
                  {' '}<span className="text-white">{alert.subscription.name}</span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatCurrency(alert.subscription.amount, alert.subscription.currency)}
              {alert.type !== 'trial' && ' do zapłaty'}
            </p>
          </div>

          <Link
            to={`/subscriptions/${alert.subscription.id}`}
            className="text-xs text-primary hover:underline shrink-0"
          >
            Szczegóły
          </Link>

          <button
            onClick={() => dismissAlert(alert.id)}
            className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PaymentAlerts;
