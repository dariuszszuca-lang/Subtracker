
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
import { Subscription } from '../types';

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
