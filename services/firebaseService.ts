
import { db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { Subscription, NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '../types';

export const dbService = {
  getSubscriptions: async (userId: string): Promise<Subscription[]> => {
    try {
      const q = query(collection(db, `users/${userId}/subscriptions`));
      const querySnapshot = await getDocs(q);
      
      const subs: Subscription[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Subscription);
      });
      return subs;
    } catch (error) {
      console.error("Błąd pobierania subskrypcji:", error);
      return [];
    }
  },

  addSubscription: async (userId: string, sub: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newSubData = {
      ...sub,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Dodajemy do podkolekcji users/{userId}/subscriptions
    const docRef = await addDoc(collection(db, `users/${userId}/subscriptions`), newSubData);
    return { id: docRef.id, ...newSubData };
  },

  updateSubscription: async (userId: string, subId: string, updates: Partial<Subscription>) => {
    const subRef = doc(db, `users/${userId}/subscriptions`, subId);
    await updateDoc(subRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  deleteSubscription: async (userId: string, subId: string) => {
    const subRef = doc(db, `users/${userId}/subscriptions`, subId);
    await deleteDoc(subRef);
  },
  
  // Pobieranie pojedynczej subskrypcji
  getSubscription: async (userId: string, subId: string): Promise<Subscription | null> => {
    const subRef = doc(db, `users/${userId}/subscriptions`, subId);
    const docSnap = await getDoc(subRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Subscription;
    } else {
      return null;
    }
  }
};

// Funkcje do zarządzania ustawieniami powiadomień
export const getUserNotificationSettings = async (userId: string): Promise<NotificationSettings | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().notifications) {
      return docSnap.data().notifications as NotificationSettings;
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error("Błąd pobierania ustawień powiadomień:", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const updateUserNotificationSettings = async (userId: string, settings: NotificationSettings): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      await updateDoc(userRef, { notifications: settings });
    } else {
      // Jeśli dokument nie istnieje, tworzymy go z ustawieniami
      const { setDoc } = await import('firebase/firestore');
      await setDoc(userRef, { notifications: settings }, { merge: true });
    }
  } catch (error) {
    console.error("Błąd zapisu ustawień powiadomień:", error);
    throw error;
  }
};
