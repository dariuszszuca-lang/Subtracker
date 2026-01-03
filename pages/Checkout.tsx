
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Check, CreditCard, Loader2 } from 'lucide-react';

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
}

const PLANS: Record<string, PlanInfo> = {
  earlybird: {
    id: 'earlybird',
    name: 'Early Bird',
    price: 49,
    originalPrice: 79,
    description: 'Limitowana oferta dla pierwszych 50 osób',
    badge: 'Oszczędzasz 30 zł',
    badgeColor: 'bg-green-500/20 text-green-400',
    features: [
      'Wszystkie funkcje planu Solo',
      'Dożywotnie aktualizacje',
      'Priorytetowe wsparcie',
      'Dożywotni dostęp'
    ]
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    price: 79,
    description: 'Pełna wersja dla jednego użytkownika',
    features: [
      'Nielimitowane subskrypcje',
      'Automatyczne powiadomienia email',
      'Kalendarz płatności',
      'Raporty i analityka',
      'Eksport CSV/Excel',
      'Dożywotni dostęp'
    ]
  },
  family: {
    id: 'family',
    name: 'Rodzina',
    price: 129,
    description: 'Do 5 użytkowników ze współdzieleniem',
    features: [
      'Wszystko z planu Solo',
      '5 osobnych kont',
      'Współdzielone subskrypcje',
      'Rozliczenia "kto ile wisi"',
      'Priorytetowe wsparcie',
      'Dożywotni dostęp'
    ]
  }
};

const Checkout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const plan = planId ? PLANS[planId] : null;

  useEffect(() => {
    if (!plan) {
      navigate('/');
    }
  }, [plan, navigate]);

  if (!plan) {
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !email) return;

    setLoading(true);

    // TODO: Tutaj integracja ze Stripe
    // const stripe = await loadStripe('pk_live_xxx');
    // await stripe.redirectToCheckout({ sessionId: 'xxx' });

    // Tymczasowo - symulacja i przekierowanie do rejestracji
    setTimeout(() => {
      // Zapisz email i plan w sessionStorage dla formularza rejestracji
      sessionStorage.setItem('checkout_email', email);
      sessionStorage.setItem('checkout_plan', plan.id);
      navigate(`/register?plan=${plan.id}&email=${encodeURIComponent(email)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Wróć do strony
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/60">Bezpieczna płatność</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formularz */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Dokończ zakup</h1>
            <p className="text-white/60 mb-8">Wprowadź dane do utworzenia konta</p>

            <form onSubmit={handleCheckout} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Adres email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jan@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                />
                <p className="text-xs text-white/40 mt-2">
                  Na ten adres wyślemy potwierdzenie i link do aktywacji
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-[#6366F1] focus:ring-[#6366F1] focus:ring-offset-0"
                  />
                  <span className="text-sm text-white/70">
                    Akceptuję{' '}
                    <a href="#" className="text-[#6366F1] hover:underline">Regulamin</a>
                    {' '}i{' '}
                    <a href="#" className="text-[#6366F1] hover:underline">Politykę Prywatności</a>.
                    Rozumiem, że mogę otrzymać zwrot w ciągu 14 dni.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreed || !email}
                className="w-full bg-[#6366F1] hover:bg-[#4f46e5] disabled:bg-white/10 disabled:text-white/30 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Przetwarzanie...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Zapłać {plan.price} zł
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 text-xs text-white/40">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  SSL 256-bit
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  14 dni na zwrot
                </div>
              </div>
            </form>

            {/* Metody płatności */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-xs text-white/40 mb-4">Akceptowane metody płatności</p>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 rounded-lg px-3 py-2 text-xs font-medium">VISA</div>
                <div className="bg-white/10 rounded-lg px-3 py-2 text-xs font-medium">Mastercard</div>
                <div className="bg-white/10 rounded-lg px-3 py-2 text-xs font-medium">BLIK</div>
                <div className="bg-white/10 rounded-lg px-3 py-2 text-xs font-medium">Przelewy24</div>
              </div>
            </div>
          </div>

          {/* Podsumowanie zamówienia */}
          <div>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 sticky top-8">
              <h2 className="text-lg font-bold mb-6">Podsumowanie zamówienia</h2>

              <div className="bg-white/5 rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-sm text-white/50">{plan.description}</p>
                  </div>
                  {plan.badge && (
                    <span className={`text-xs px-2 py-1 rounded-full ${plan.badgeColor || 'bg-[#6366F1]/20 text-[#6366F1]'}`}>
                      {plan.badge}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mt-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-[#6366F1]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Plan {plan.name}</span>
                  <span>
                    {plan.originalPrice && (
                      <span className="text-white/40 line-through mr-2">{plan.originalPrice} zł</span>
                    )}
                    {plan.price} zł
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Rok wsparcia i aktualizacji</span>
                  <span className="text-green-400">W cenie</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Do zapłaty</span>
                  <span className="text-2xl font-bold">{plan.price} zł</span>
                </div>
                <p className="text-xs text-white/40 mt-1">Jednorazowa opłata, bez ukrytych kosztów</p>
              </div>

              {/* Gwarancje */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span>14-dniowa gwarancja zwrotu pieniędzy</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#6366F1]" />
                  </div>
                  <span>Szyfrowanie danych AES-256</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
