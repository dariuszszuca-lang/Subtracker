import { User, Subscription } from '../types';

// Mock delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const USERS_KEY = 'subtracker_users';
const SUBS_KEY = 'subtracker_subs';
const CURRENT_USER_KEY = 'subtracker_current_user_id';

// Helper to get from local storage
const getStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockAuth = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(500);
    const users = getStorage<User>(USERS_KEY);
    // For demo purposes, we accept any password if user exists
    const user = users.find(u => u.email === email);
    
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, user.uid);
      return user;
    }
    throw new Error("Użytkownik nie istnieje lub błędne hasło.");
  },

  register: async (email: string, password: string, name: string): Promise<User> => {
    await delay(500);
    const users = getStorage<User>(USERS_KEY);
    if (users.find(u => u.email === email)) {
      throw new Error("Email już zajęty.");
    }
    
    const newUser: User = {
      uid: 'user_' + Date.now(),
      email,
      displayName: name,
      currency: 'PLN',
      createdAt: Date.now()
    };
    
    users.push(newUser);
    setStorage(USERS_KEY, users);
    localStorage.setItem(CURRENT_USER_KEY, newUser.uid);
    
    // Seed some data for new user
    seedData(newUser.uid);
    
    return newUser;
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const uid = localStorage.getItem(CURRENT_USER_KEY);
    if (!uid) return null;
    const users = getStorage<User>(USERS_KEY);
    return users.find(u => u.uid === uid) || null;
  }
};

export const mockFirestore = {
  getSubscriptions: async (userId: string): Promise<Subscription[]> => {
    await delay(300);
    const subs = getStorage<Subscription>(SUBS_KEY);
    return subs.filter(s => s.userId === userId);
  },

  addSubscription: async (userId: string, sub: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await delay(300);
    const subs = getStorage<Subscription>(SUBS_KEY);
    const newSub: Subscription = {
      ...sub,
      id: 'sub_' + Date.now() + Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    subs.push(newSub);
    setStorage(SUBS_KEY, subs);
    return newSub;
  },

  updateSubscription: async (id: string, updates: Partial<Subscription>) => {
    await delay(300);
    const subs = getStorage<Subscription>(SUBS_KEY);
    const index = subs.findIndex(s => s.id === id);
    if (index !== -1) {
      subs[index] = { ...subs[index], ...updates, updatedAt: Date.now() };
      setStorage(SUBS_KEY, subs);
      return subs[index];
    }
    throw new Error("Subskrypcja nie znaleziona");
  },

  deleteSubscription: async (id: string) => {
    await delay(300);
    let subs = getStorage<Subscription>(SUBS_KEY);
    subs = subs.filter(s => s.id !== id);
    setStorage(SUBS_KEY, subs);
  }
};

const seedData = (userId: string) => {
  const existingSubs = getStorage<Subscription>(SUBS_KEY);
  if (existingSubs.some(s => s.userId === userId)) return;

  const demoData: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
    { name: "Netflix", amount: 43, currency: 'PLN', cycle: "monthly", billingDay: 15, startDate: "2024-01-15", nextPayment: "2025-01-15", category: "entertainment", status: "active", url: "https://netflix.com" },
    { name: "Spotify", amount: 19.99, currency: 'PLN', cycle: "monthly", billingDay: 10, startDate: "2024-01-10", nextPayment: "2025-01-10", category: "entertainment", status: "active" },
    { name: "ChatGPT Plus", amount: 20, currency: "USD", cycle: "monthly", billingDay: 2, startDate: "2024-02-02", nextPayment: "2025-02-02", category: "work", status: "active" },
    { name: "Domena .pl", amount: 49, currency: 'PLN', cycle: "yearly", billingDay: 20, startDate: "2024-05-20", nextPayment: "2025-05-20", category: "domains", status: "active" },
  ];

  const newSubs = demoData.map(d => ({
    ...d,
    id: 'seed_' + Math.random().toString(36).substr(2, 9),
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }));

  setStorage(SUBS_KEY, [...existingSubs, ...newSubs]);
};