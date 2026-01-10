import React, { useState, useEffect } from 'react';
import { Cookie, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'subtracker_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'subtracker_cookie_preferences';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false, // NOT pre-checked (GDPR compliant)
    marketing: false, // NOT pre-checked (GDPR compliant)
  });

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to not show immediately on page load
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      setHasConsent(true);
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch {}
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences, accepted: boolean) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'rejected');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setHasConsent(true);

    // Here you would enable/disable analytics based on preferences
    if (prefs.analytics) {
      // Enable analytics (Firebase Analytics, etc.)
      console.log('Analytics enabled');
    }
  };

  const handleOpenSettings = () => {
    setShowDetails(true);
    setIsVisible(true);
  };

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    savePreferences(allAccepted, true);
  };

  const handleRejectAll = () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false };
    setPreferences(onlyNecessary);
    savePreferences(onlyNecessary, false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences, preferences.analytics || preferences.marketing);
  };

  // Show floating button when banner is closed but user has given consent
  if (!isVisible && hasConsent) {
    return (
      <button
        onClick={handleOpenSettings}
        className="fixed bottom-4 left-4 z-[9998] w-10 h-10 bg-[#1a1a1f] border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2a2a2f] hover:border-white/20 transition-all shadow-lg group"
        title="Ustawienia cookies"
      >
        <Cookie className="w-5 h-5" />
        <span className="absolute left-12 bg-[#1a1a1f] border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ustawienia cookies
        </span>
      </button>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto"
        onClick={() => {}} // Prevent closing by clicking backdrop
      />

      {/* Banner */}
      <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto mb-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#6366F1]/20 rounded-xl flex items-center justify-center shrink-0">
              <Cookie className="w-6 h-6 text-[#6366F1]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-2">
                Szanujemy Twoją prywatność
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Używamy plików cookies, aby zapewnić działanie aplikacji i - za Twoją zgodą -
                analizować sposób korzystania z serwisu. Możesz zaakceptować wszystkie,
                odrzucić opcjonalne lub dostosować ustawienia.
              </p>
            </div>
          </div>
        </div>

        {/* Cookie Details (expandable) */}
        <div className="px-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-[#6366F1] hover:text-[#818CF8] transition-colors mb-4"
          >
            <Settings className="w-4 h-4" />
            <span>Dostosuj ustawienia</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="space-y-3 pb-4">
              {/* Necessary cookies - always on */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">Niezbędne</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Wymagane</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Cookies wymagane do działania aplikacji (sesja, bezpieczeństwo).
                  </p>
                </div>
                <div className="w-12 h-6 bg-green-500/30 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">Analityczne</span>
                  <p className="text-xs text-white/50 mt-1">
                    Pomagają nam zrozumieć jak korzystasz z aplikacji (Firebase Analytics).
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    preferences.analytics ? 'bg-[#6366F1] justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              {/* Marketing cookies */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">Marketingowe</span>
                  <p className="text-xs text-white/50 mt-1">
                    Służą do personalizacji reklam. Obecnie nieaktywne.
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    preferences.marketing ? 'bg-[#6366F1] justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <a href="#/privacy" className="hover:text-white transition-colors">
              Polityka prywatności
            </a>
            <span>•</span>
            <a href="mailto:darek@ai-team.pl" className="hover:text-white transition-colors">
              Kontakt: darek@ai-team.pl
            </a>
          </div>
        </div>

        {/* Buttons - EQUALLY VISIBLE (no dark patterns) */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Reject button - same visual weight as Accept */}
            <button
              onClick={handleRejectAll}
              className="flex-1 py-3 px-4 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors text-sm"
            >
              Odrzuć opcjonalne
            </button>

            {/* Save preferences - shown when details expanded */}
            {showDetails && (
              <button
                onClick={handleSavePreferences}
                className="flex-1 py-3 px-4 rounded-lg border border-[#6366F1]/50 text-[#6366F1] font-medium hover:bg-[#6366F1]/10 transition-colors text-sm"
              >
                Zapisz wybrane
              </button>
            )}

            {/* Accept button - same visual weight as Reject */}
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-3 px-4 rounded-lg border border-white/20 bg-white/10 text-white font-medium hover:bg-white/20 transition-colors text-sm"
            >
              Akceptuj wszystkie
            </button>
          </div>
        </div>

        {/* Info about revoking consent */}
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
          <p className="text-[11px] text-white/30 text-center">
            Możesz zmienić lub wycofać zgodę w dowolnym momencie w ustawieniach aplikacji.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

// Helper hook to check cookie preferences
export const useCookiePreferences = (): CookiePreferences => {
  const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { necessary: true, analytics: false, marketing: false };
    }
  }
  return { necessary: true, analytics: false, marketing: false };
};
