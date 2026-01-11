export type Cycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type Status = 'active' | 'cancelled' | 'trial' | 'paused';
export type Category = 'entertainment' | 'work' | 'health' | 'education' | 'cloud' | 'domains' | 'other';
export type Currency = 'PLN' | 'USD' | 'EUR';
export type Plan = 'free' | 'earlybird' | 'solo' | 'family' | 'lifetime';

// VIP users - get lifetime access for free
export const VIP_EMAILS = [
  'darek@ai-team.pl',           // Darek - owner
  'krystian.nagaba@gmail.com',  // Krystian - gift
  'andrzejewski.martin@gmail.com', // Martin - gift
  'pola@aignostic.pl',          // Pola - gift
  'marcin.jaszcz.mj@gmail.com'  // Marcin - gift
];

export interface NotificationSettings {
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  daysBefore: number; // 1, 3, 7
  weeklyDigest: boolean;
  trialEndReminder: boolean;
  priceChangeAlert: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  currency: Currency;
  plan?: Plan;
  planPurchasedAt?: number;
  notifications?: NotificationSettings;
  createdAt: number;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: Currency;
  cycle: Cycle;
  billingDay: number; // 1-31
  startDate: string; // ISO date string YYYY-MM-DD
  nextPayment: string; // ISO date string YYYY-MM-DD
  category: Category;
  status: Status;
  notes?: string;
  url?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionFormData {
  name: string;
  amount: number;
  currency: Currency;
  cycle: Cycle;
  billingDay: number;
  startDate: string;
  category: Category;
  status: Status;
  notes: string;
  url: string;
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'entertainment', label: 'Rozrywka', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { value: 'work', label: 'Praca', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'health', label: 'Zdrowie', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'education', label: 'Edukacja', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'cloud', label: 'Chmura/SaaS', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'domains', label: 'Domeny', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { value: 'other', label: 'Inne', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];

export const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'active', label: 'Aktywna', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Anulowana', color: 'bg-red-500' },
  { value: 'trial', label: 'Próbny', color: 'bg-yellow-500' },
  { value: 'paused', label: 'Wstrzymana', color: 'bg-orange-500' },
];

export const CYCLES: { value: Cycle; label: string }[] = [
  { value: 'weekly', label: 'Tygodniowo' },
  { value: 'monthly', label: 'Miesięcznie' },
  { value: 'quarterly', label: 'Kwartalnie' },
  { value: 'yearly', label: 'Rocznie' },
];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  emailEnabled: true,
  pushEnabled: false,
  daysBefore: 3,
  weeklyDigest: true,
  trialEndReminder: true,
  priceChangeAlert: true,
};

// ============================================
// WSPÓŁDZIELENIE KOSZTÓW (Family Plan)
// ============================================

export type SplitType = 'equal' | 'percentage' | 'fixed';
export type MemberRole = 'owner' | 'admin' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface FamilyMember {
  userId: string;
  email: string;
  displayName: string;
  role: MemberRole;
  joinedAt: number;
  avatar?: string;
}

export interface FamilyInvite {
  id: string;
  groupId: string;
  email: string;
  invitedBy: string;
  status: InviteStatus;
  createdAt: number;
  expiresAt: number;
}

export interface CostSplit {
  memberId: string;
  memberName: string;
  type: SplitType;
  value: number; // dla equal: 1, percentage: 0-100, fixed: kwota
  calculatedAmount: number; // obliczona kwota do zapłaty
}

export interface SharedSubscription {
  subscriptionId: string;
  subscriptionName: string;
  totalAmount: number;
  currency: Currency;
  cycle: Cycle;
  splitType: SplitType;
  splits: CostSplit[];
  paidBy: string; // memberId osoby która płaci
  addedBy: string;
  addedAt: number;
}

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  sharedSubscriptions: SharedSubscription[];
  invites: FamilyInvite[];
  createdAt: number;
  updatedAt: number;
}

export interface FamilyGroupSummary {
  groupId: string;
  groupName: string;
  totalMonthly: number;
  myShare: number;
  membersCount: number;
  subscriptionsCount: number;
}