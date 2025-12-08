
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ==================================================================
// INSTRUKCJA KONFIGURACJI:
// 1. Wejdź na https://console.firebase.google.com/
// 2. Utwórz nowy projekt lub wybierz istniejący.
// 3. W ustawieniach projektu (ikona zębatki -> Project settings)
//    znajdź sekcję "Your apps" i wybierz aplikację Web (</>).
// 4. Skopiuj wartości z obiektu firebaseConfig i podmień poniżej.
// ==================================================================

const firebaseConfig = {
  // PODMIEŃ PONIŻSZE WARTOŚCI NA SWOJE Z KONSOLI FIREBASE
  apiKey: "AIzaSyD-PLACEHOLDER-KEY-ZMIEN-MNIE",
  authDomain: "twoj-projekt.firebaseapp.com",
  projectId: "twoj-projekt",
  storageBucket: "twoj-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicjalizacja Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Błąd inicjalizacji Firebase. Sprawdź plik firebaseConfig.ts", error);
}

export { auth, db };
