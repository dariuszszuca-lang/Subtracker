
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUser } from '../types';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Funkcja mapująca usera Firebase na nasz typ aplikacji
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      if (!db) throw new Error("Firestore not initialized");
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        setUser({ ...userData, uid: firebaseUser.uid });
      } else {
        // Jeśli dokument usera nie istnieje (np. po rejestracji), tworzymy go
        const newUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Użytkownik',
          currency: 'PLN',
          createdAt: Date.now()
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error("Błąd pobierania danych użytkownika:", error);
      // Fallback jeśli baza nie działa, ale auth zadziałał
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Użytkownik (Offline)',
        currency: 'PLN',
        createdAt: Date.now()
      });
    }
  };

  useEffect(() => {
    // Zabezpieczenie: Jeśli auth nie jest zainicjalizowany (np. zły config), wyłącz ładowanie
    if (!auth) {
      console.error("Auth module not initialized. Check firebaseConfig.ts");
      setLoading(false);
      return;
    }

    // Timeout bezpieczeństwa - jeśli Firebase nie odpowie w 3 sekundy, pokaż aplikację (wylogowaną)
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Firebase auth timeout - forcing loading to false");
        setLoading(false);
      }
    }, 3000);

    let unsubscribe: () => void;

    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        clearTimeout(safetyTimeout); // Anuluj timeout jeśli Firebase odpowiedział
        if (currentUser) {
          await fetchUserData(currentUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth State Error:", error);
        setLoading(false);
      });
    } catch (err) {
      console.error("Auth Init Error:", err);
      setLoading(false);
    }

    return () => {
      clearTimeout(safetyTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (auth) {
      await signOut(auth);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (auth && auth.currentUser) {
      await fetchUserData(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
