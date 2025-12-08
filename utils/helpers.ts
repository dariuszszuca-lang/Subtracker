import { Cycle, Currency } from '../types';

export const calculateNextPayment = (startDateStr: string, cycle: Cycle): Date => {
  const start = new Date(startDateStr);
  const now = new Date();
  // Reset time to start of day for accurate comparison
  now.setHours(0, 0, 0, 0);
  
  let next = new Date(start);
  
  // Safety break to prevent infinite loops if data is bad
  let iterations = 0;
  const MAX_ITERATIONS = 5000;

  while (next < now && iterations < MAX_ITERATIONS) {
    switch (cycle) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    iterations++;
  }
  return next;
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string | Date): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const getDaysUntil = (dateStr: string | Date): string => {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Dzisiaj';
  if (diffDays === 1) return 'Jutro';
  if (diffDays < 0) return `${Math.abs(diffDays)} dni temu`;
  return `za ${diffDays} dni`;
};

// Simple conversion for stats MVP (1 USD = 4.0 PLN, 1 EUR = 4.3 PLN)
export const convertToPLN = (amount: number, currency: Currency): number => {
  if (currency === 'PLN') return amount;
  if (currency === 'USD') return amount * 4.0;
  if (currency === 'EUR') return amount * 4.3;
  return amount;
};

export const getMonthlyCost = (amount: number, cycle: Cycle): number => {
  switch (cycle) {
    case 'weekly': return amount * 4.33;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    default: return 0;
  }
};

export const getYearlyCost = (amount: number, cycle: Cycle): number => {
  switch (cycle) {
    case 'weekly': return amount * 52;
    case 'monthly': return amount * 12;
    case 'quarterly': return amount * 4;
    case 'yearly': return amount;
    default: return 0;
  }
};