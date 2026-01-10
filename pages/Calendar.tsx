import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebaseService';
import { Subscription, CATEGORIES } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, CreditCard } from 'lucide-react';
import { formatCurrency, calculateNextPayment } from '../utils/helpers';

const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (user?.uid) {
        setLoading(true);
        const subs = await dbService.getSubscriptions(user.uid);
        // Recalculate nextPayment for all subscriptions
        const updated = subs
          .filter(s => s.status === 'active' || s.status === 'trial')
          .map(s => ({
            ...s,
            nextPayment: calculateNextPayment(s.startDate, s.cycle).toISOString().split('T')[0]
          }));
        setSubscriptions(updated);
        setLoading(false);
      }
    };
    loadSubscriptions();
  }, [user?.uid]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Oblicz dni w miesiącu
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Konwersja niedzieli (0) na 7 dla polskiego kalendarza
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Mapuj płatności na dni
  const paymentsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {};

    subscriptions.forEach(sub => {
      const paymentDate = new Date(sub.nextPayment);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        const day = paymentDate.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(sub);
      }
    });

    return map;
  }, [subscriptions, currentMonth, currentYear]);

  // Suma za miesiąc
  const monthlyTotal = useMemo(() => {
    let total = 0;
    Object.values(paymentsByDay).forEach(subs => {
      subs.forEach(sub => {
        const amount = sub.currency === 'USD' ? sub.amount * 4 : sub.currency === 'EUR' ? sub.amount * 4.3 : sub.amount;
        total += amount;
      });
    });
    return total;
  }, [paymentsByDay]);

  // Płatności w wybranym dniu
  const selectedDayPayments = selectedDay ? paymentsByDay[selectedDay] || [] : [];

  // Następne 7 dni
  const next7DaysPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return subscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPayment);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate >= today && paymentDate <= weekFromNow;
    }).sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime());
  }, [subscriptions]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  // Eksport do iCal
  const exportToICal = () => {
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SubTracker//Payments//PL
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    subscriptions.forEach(sub => {
      const paymentDate = new Date(sub.nextPayment);
      const dateStr = paymentDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(paymentDate.getTime() + 60 * 60 * 1000);
      const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icalContent += `BEGIN:VEVENT
DTSTART:${dateStr}
DTEND:${endStr}
SUMMARY:💳 ${sub.name} - ${sub.amount} ${sub.currency}
DESCRIPTION:Płatność za subskrypcję ${sub.name}
UID:${sub.id}@subtracker
END:VEVENT
`;
    });

    icalContent += 'END:VCALENDAR';

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtracker-payments.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || 'bg-slate-500/20 text-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kalendarz płatności</h2>
          <p className="text-slate-400 text-sm mt-1">Planuj wydatki i kontroluj terminy</p>
        </div>
        <button
          onClick={exportToICal}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-slate-700 rounded-lg text-sm hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Eksportuj do kalendarza
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kalendarz */}
        <div className="lg:col-span-2 bg-surface border border-slate-700/50 rounded-2xl p-6">
          {/* Nawigacja miesiąca */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-xl font-bold">{MONTHS_PL[currentMonth]} {currentYear}</h3>
              <button onClick={goToToday} className="text-xs text-primary hover:underline mt-1">
                Dzisiaj
              </button>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dni tygodnia */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_PL.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Siatka dni */}
          <div className="grid grid-cols-7 gap-1">
            {/* Puste dni przed pierwszym dniem miesiąca */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Dni miesiąca */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const payments = paymentsByDay[day] || [];
              const hasPayments = payments.length > 0;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                    ${isToday(day) ? 'ring-2 ring-primary' : ''}
                    ${isSelected ? 'bg-primary text-white' : 'hover:bg-slate-800'}
                    ${hasPayments && !isSelected ? 'bg-slate-800/50' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                    {day}
                  </span>
                  {hasPayments && (
                    <div className="flex gap-0.5 mt-1">
                      {payments.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}
                        />
                      ))}
                      {payments.length > 3 && (
                        <span className={`text-[8px] ${isSelected ? 'text-white' : 'text-primary'}`}>
                          +{payments.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Podsumowanie miesiąca */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Suma w {MONTHS_PL[currentMonth].toLowerCase()}:
            </div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(monthlyTotal, 'PLN')}
            </div>
          </div>
        </div>

        {/* Panel boczny */}
        <div className="space-y-6">
          {/* Wybrany dzień */}
          {selectedDay && (
            <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                {selectedDay} {MONTHS_PL[currentMonth]}
              </h4>

              {selectedDayPayments.length === 0 ? (
                <p className="text-slate-500 text-sm">Brak płatności tego dnia</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayPayments.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{sub.name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryColor(sub.category)}`}>
                          {CATEGORIES.find(c => c.value === sub.category)?.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(sub.amount, sub.currency)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Następne 7 dni */}
          <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Następne 7 dni
            </h4>

            {next7DaysPayments.length === 0 ? (
              <p className="text-slate-500 text-sm">Brak płatności w tym tygodniu 🎉</p>
            ) : (
              <div className="space-y-3">
                {next7DaysPayments.map(sub => {
                  const paymentDate = new Date(sub.nextPayment);
                  const dayName = paymentDate.toLocaleDateString('pl-PL', { weekday: 'short' });
                  const dayNum = paymentDate.getDate();

                  return (
                    <div key={sub.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-primary uppercase">{dayName}</span>
                        <span className="text-sm font-bold text-primary">{dayNum}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{sub.name}</div>
                        <div className="text-xs text-slate-500">
                          {sub.status === 'trial' && '🔔 Koniec trial'}
                        </div>
                      </div>
                      <div className="font-bold text-sm">
                        {formatCurrency(sub.amount, sub.currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
