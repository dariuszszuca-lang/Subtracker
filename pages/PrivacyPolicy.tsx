import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, MapPin } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do strony głównej
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#6366F1]/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Polityka Prywatności</h1>
            <p className="text-white/50 text-sm">Ostatnia aktualizacja: 10 stycznia 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white/80 leading-relaxed">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Administrator danych</h2>
            <p className="mb-4">
              Administratorem Twoich danych osobowych jest:
            </p>
            <div className="bg-surface border border-white/10 rounded-xl p-4 space-y-2">
              <p className="font-medium text-white">Dariusz Szuca</p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#6366F1]" />
                <span>ul. Pułaskiego 7, 81-368 Sopot</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#6366F1]" />
                <a href="mailto:darek@ai-team.pl" className="text-[#6366F1] hover:underline">darek@ai-team.pl</a>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Jakie dane zbieramy</h2>
            <p className="mb-4">Zbieramy następujące kategorie danych:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Dane konta:</strong> adres e-mail, imię (pseudonim), hasło (zaszyfrowane)</li>
              <li><strong className="text-white">Dane subskrypcji:</strong> nazwy usług, kwoty, daty płatności, kategorie</li>
              <li><strong className="text-white">Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny</li>
              <li><strong className="text-white">Pliki cookies:</strong> niezbędne do działania aplikacji oraz analityczne (za zgodą)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Cele przetwarzania danych</h2>
            <p className="mb-4">Twoje dane przetwarzamy w celu:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Świadczenia usługi SubTracker (art. 6 ust. 1 lit. b RODO)</li>
              <li>Wysyłania powiadomień o płatnościach (art. 6 ust. 1 lit. b RODO)</li>
              <li>Analizy i poprawy działania aplikacji (art. 6 ust. 1 lit. f RODO)</li>
              <li>Marketingu bezpośredniego - tylko za Twoją zgodą (art. 6 ust. 1 lit. a RODO)</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Pliki cookies</h2>
            <p className="mb-4">Używamy następujących kategorii plików cookies:</p>

            <div className="space-y-4">
              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <h3 className="font-medium text-white mb-2">Niezbędne (wymagane)</h3>
                <p className="text-sm">Cookies niezbędne do działania aplikacji: sesja użytkownika, preferencje, bezpieczeństwo. Nie można ich wyłączyć.</p>
              </div>

              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <h3 className="font-medium text-white mb-2">Analityczne (opcjonalne)</h3>
                <p className="text-sm">Pomagają nam zrozumieć jak korzystasz z aplikacji. Używamy Firebase Analytics. Możesz je wyłączyć w ustawieniach.</p>
              </div>

              <div className="bg-surface border border-white/10 rounded-xl p-4">
                <h3 className="font-medium text-white mb-2">Marketingowe (opcjonalne)</h3>
                <p className="text-sm">Służą do personalizacji reklam. Obecnie NIE używamy cookies marketingowych.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Twoje prawa</h2>
            <p className="mb-4">Zgodnie z RODO masz prawo do:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Dostępu</strong> do swoich danych</li>
              <li><strong className="text-white">Sprostowania</strong> nieprawidłowych danych</li>
              <li><strong className="text-white">Usunięcia</strong> danych ("prawo do bycia zapomnianym")</li>
              <li><strong className="text-white">Ograniczenia</strong> przetwarzania</li>
              <li><strong className="text-white">Przenoszenia</strong> danych do innej usługi</li>
              <li><strong className="text-white">Sprzeciwu</strong> wobec przetwarzania</li>
              <li><strong className="text-white">Wycofania zgody</strong> w dowolnym momencie</li>
            </ul>
            <p className="mt-4">
              Aby skorzystać z tych praw, napisz do nas: <a href="mailto:darek@ai-team.pl" className="text-[#6366F1] hover:underline">darek@ai-team.pl</a>
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Bezpieczeństwo danych</h2>
            <p>
              Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić Twoje dane:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Szyfrowanie danych (AES-256, TLS/SSL)</li>
              <li>Bezpieczne przechowywanie w Firebase (certyfikaty SOC 2, ISO 27001)</li>
              <li>Regularne kopie zapasowe</li>
              <li>Hasła przechowywane w formie zaszyfrowanej (hash)</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Okres przechowywania</h2>
            <p>
              Dane przechowujemy przez okres korzystania z usługi. Po usunięciu konta, dane są usuwane w ciągu 30 dni,
              z wyjątkiem danych wymaganych przepisami prawa (np. faktury - 5 lat).
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Podmioty trzecie</h2>
            <p className="mb-4">Korzystamy z usług następujących podmiotów:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Firebase (Google)</strong> - hosting, baza danych, autoryzacja</li>
              <li><strong className="text-white">Stripe</strong> - obsługa płatności</li>
              <li><strong className="text-white">Vercel</strong> - hosting aplikacji</li>
            </ul>
            <p className="mt-4">
              Każdy z tych podmiotów przetwarza dane zgodnie z własnymi politykami prywatności i standardami RODO.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Zmiany polityki</h2>
            <p>
              Możemy aktualizować niniejszą politykę. O istotnych zmianach poinformujemy Cię e-mailem
              lub komunikatem w aplikacji.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Kontakt i skargi</h2>
            <p className="mb-4">
              W razie pytań lub wątpliwości dotyczących prywatności, skontaktuj się z nami:
            </p>
            <div className="bg-surface border border-white/10 rounded-xl p-4 space-y-2">
              <p className="font-medium text-white">Dariusz Szuca</p>
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#6366F1]" />
                ul. Pułaskiego 7, 81-368 Sopot
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#6366F1]" />
                <a href="mailto:darek@ai-team.pl" className="text-[#6366F1] hover:underline">darek@ai-team.pl</a>
              </p>
            </div>
            <p className="mt-4">
              Masz również prawo złożyć skargę do organu nadzorczego - Prezesa Urzędu Ochrony Danych Osobowych (UODO).
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>SubTracker &copy; 2026. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
