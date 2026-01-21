
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { AlertCircle, Check, Shield } from 'lucide-react';
import { VIP_EMAILS } from '../types';

const PLAN_NAMES: Record<string, string> = {
  earlybird: 'Early Bird',
  solo: 'Solo',
  family: 'Rodzina',
  lifetime: 'Lifetime VIP'
};

const Login: React.FC<{ isRegister?: boolean }> = ({ isRegister = false }) => {
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan');
  const emailFromUrl = searchParams.get('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Pobierz dane z checkout
  useEffect(() => {
    if (isRegister) {
      const checkoutEmail = emailFromUrl || sessionStorage.getItem('checkout_email');
      if (checkoutEmail) {
        setEmail(decodeURIComponent(checkoutEmail));
      }
    }
  }, [isRegister, emailFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!auth) {
      setError("Błąd konfiguracji Firebase. Sprawdź plik firebaseConfig.ts.");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Walidacja potwierdzenia hasła
        if (password !== confirmPassword) {
          setError('Hasła nie są identyczne.');
          setIsLoading(false);
          return;
        }
        // Rejestracja
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Aktualizacja profilu Auth
        await updateProfile(user, {
          displayName: name
        });

        // Utworzenie dokumentu w Firestore
        if (db) {
          // Check if VIP email - gets lifetime access
          const isVIP = VIP_EMAILS.includes(email.toLowerCase());
          const plan = isVIP ? 'lifetime' : (planFromUrl || sessionStorage.getItem('checkout_plan') || 'free');

          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: name,
            currency: 'PLN',
            plan: plan,
            planPurchasedAt: plan !== 'free' ? Date.now() : null,
            createdAt: Date.now()
          });
          // Wyczyść dane checkout
          sessionStorage.removeItem('checkout_email');
          sessionStorage.removeItem('checkout_plan');
        }

      } else {
        // Logowanie
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = 'Wystąpił błąd.';
      
      // Tłumaczenie kodów błędów Firebase
      switch (err.code) {
        case 'auth/email-already-in-use': msg = 'Ten email jest już zajęty.'; break;
        case 'auth/invalid-credential': msg = 'Błędny email lub hasło.'; break;
        case 'auth/user-not-found': msg = 'Nie znaleziono użytkownika.'; break;
        case 'auth/wrong-password': msg = 'Błędne hasło.'; break;
        case 'auth/weak-password': msg = 'Hasło jest za słabe (min. 6 znaków).'; break;
        case 'auth/invalid-api-key': msg = 'Niepoprawny klucz API w firebaseConfig.ts.'; break;
        case 'auth/network-request-failed': msg = 'Błąd sieci. Sprawdź połączenie.'; break;
        default: msg = `Błąd: ${err.message}`;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            SubTracker
          </h1>
          <p className="text-slate-400">Kontroluj swoje wydatki cykliczne.</p>
        </div>

        <div className="bg-surface border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-2 text-center">
            {isRegister ? 'Utwórz konto' : 'Zaloguj się'}
          </h2>

          {/* Info o planie z checkout */}
          {isRegister && planFromUrl && PLAN_NAMES[planFromUrl] && (
            <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-slate-300">
                  Wybrany plan: <strong className="text-primary">{PLAN_NAMES[planFromUrl]}</strong>
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Imię</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Jan Kowalski"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="jan@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Hasło</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Potwierdź hasło</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isRegister ? 'Zarejestruj się' : 'Zaloguj się'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {isRegister ? (
              <>
                Masz już konto?{' '}
                <Link to="/login" className="text-primary hover:text-primaryHover font-medium">
                  Zaloguj się
                </Link>
              </>
            ) : (
              <>
                Nie masz konta?{' '}
                <Link to="/register" className="text-primary hover:text-primaryHover font-medium">
                  Załóż darmowe konto
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
