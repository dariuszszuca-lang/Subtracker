
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
  apiKey: "AIzaSyCVsTU44jdphe9GWOl2KNLbpEbRa6JjHXY",
  authDomain: "subtracker-app-2e596.firebaseapp.com",
  projectId: "subtracker-app-2e596",
  storageBucket: "subtracker-app-2e596.firebasestorage.app",
  messagingSenderId: "130705267576",
  appId: "1:130705267576:web:ab5e7da49018c9c77d868d"
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
