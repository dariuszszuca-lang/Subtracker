import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

admin.initializeApp();
const db = admin.firestore();

// Inicjalizacja Resend (klucz API z Firebase Config)
const resend = new Resend(functions.config().resend?.key || process.env.RESEND_API_KEY);

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  nextPayment: string;
  status: string;
}

interface NotificationSettings {
  enabled: boolean;
  emailEnabled: boolean;
  daysBefore: number;
  weeklyDigest: boolean;
  trialEndReminder: boolean;
}

interface UserData {
  email: string;
  displayName: string;
  notifications: NotificationSettings;
}

// Funkcja sprawdzająca nadchodzące płatności i wysyłająca powiadomienia
// Uruchamiana codziennie o 8:00
export const sendPaymentReminders = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Europe/Warsaw')
  .onRun(async () => {
    console.log('🔔 Rozpoczynam wysyłanie przypomnień o płatnościach...');

    try {
      // Pobierz wszystkich użytkowników
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as UserData;
        const userId = userDoc.id;

        // Sprawdź czy użytkownik ma włączone powiadomienia
        if (!userData.notifications?.enabled || !userData.notifications?.emailEnabled) {
          continue;
        }

        const daysBefore = userData.notifications.daysBefore || 3;

        // Pobierz subskrypcje użytkownika
        const subsSnapshot = await db
          .collection(`users/${userId}/subscriptions`)
          .where('status', '==', 'active')
          .get();

        const upcomingPayments: Subscription[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        subsSnapshot.forEach((subDoc) => {
          const sub = { id: subDoc.id, ...subDoc.data() } as Subscription;
          const paymentDate = new Date(sub.nextPayment);
          paymentDate.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          // Sprawdź czy płatność wypada za X dni
          if (diffDays === daysBefore || diffDays === 1) {
            upcomingPayments.push(sub);
          }
        });

        // Wyślij email jeśli są nadchodzące płatności
        if (upcomingPayments.length > 0) {
          await sendReminderEmail(userData.email, userData.displayName, upcomingPayments, daysBefore);
          console.log(`✅ Wysłano przypomnienie do ${userData.email} o ${upcomingPayments.length} płatnościach`);
        }
      }

      console.log('✅ Zakończono wysyłanie przypomnień');
      return null;
    } catch (error) {
      console.error('❌ Błąd wysyłania przypomnień:', error);
      throw error;
    }
  });

// Funkcja wysyłająca tygodniowy digest (poniedziałek o 9:00)
export const sendWeeklyDigest = functions.pubsub
  .schedule('0 9 * * 1')
  .timeZone('Europe/Warsaw')
  .onRun(async () => {
    console.log('📊 Rozpoczynam wysyłanie tygodniowego podsumowania...');

    try {
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as UserData;
        const userId = userDoc.id;

        if (!userData.notifications?.enabled || !userData.notifications?.weeklyDigest) {
          continue;
        }

        // Pobierz subskrypcje na następny tydzień
        const subsSnapshot = await db
          .collection(`users/${userId}/subscriptions`)
          .where('status', '==', 'active')
          .get();

        const weekPayments: Subscription[] = [];
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        subsSnapshot.forEach((subDoc) => {
          const sub = { id: subDoc.id, ...subDoc.data() } as Subscription;
          const paymentDate = new Date(sub.nextPayment);

          if (paymentDate >= today && paymentDate <= nextWeek) {
            weekPayments.push(sub);
          }
        });

        if (weekPayments.length > 0) {
          await sendDigestEmail(userData.email, userData.displayName, weekPayments);
          console.log(`✅ Wysłano digest do ${userData.email}`);
        }
      }

      console.log('✅ Zakończono wysyłanie digestów');
      return null;
    } catch (error) {
      console.error('❌ Błąd wysyłania digestów:', error);
      throw error;
    }
  });

// Funkcja pomocnicza - wysyłanie emaila z przypomnieniem
async function sendReminderEmail(
  email: string,
  name: string,
  payments: Subscription[],
  daysBefore: number
) {
  const totalAmount = payments.reduce((sum, p) => {
    // Prosta konwersja - w produkcji użyj API kursów
    const amountInPLN = p.currency === 'USD' ? p.amount * 4 : p.currency === 'EUR' ? p.amount * 4.3 : p.amount;
    return sum + amountInPLN;
  }, 0);

  const paymentsList = payments
    .map((p) => `• ${p.name}: ${p.amount} ${p.currency} (${p.nextPayment})`)
    .join('\n');

  const daysText = daysBefore === 1 ? 'jutro' : `za ${daysBefore} dni`;

  await resend.emails.send({
    from: 'SubTracker <powiadomienia@subtracker.pl>',
    to: email,
    subject: `💳 Nadchodzące płatności - ${payments.length} ${payments.length === 1 ? 'subskrypcja' : 'subskrypcje'}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366F1 0%, #4338ca 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SubTracker</h1>
        </div>

        <div style="background: #1e1e2e; padding: 30px; border-radius: 0 0 16px 16px; color: #e0e0e0;">
          <p style="font-size: 18px; margin-bottom: 20px;">Cześć ${name}! 👋</p>

          <p style="margin-bottom: 20px;">
            Masz <strong style="color: #6366F1;">${payments.length}</strong> ${payments.length === 1 ? 'płatność' : 'płatności'} ${daysText}:
          </p>

          <div style="background: #2a2a3e; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; color: #a0a0a0;">${paymentsList}</pre>
          </div>

          <div style="background: #6366F1; color: white; padding: 15px 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 14px;">Łączna kwota</span>
            <div style="font-size: 28px; font-weight: bold;">${totalAmount.toFixed(2)} PLN</div>
          </div>

          <p style="color: #888; font-size: 12px; text-align: center;">
            Możesz zarządzać powiadomieniami w <a href="https://subtracker.pl/settings" style="color: #6366F1;">ustawieniach</a>
          </p>
        </div>
      </div>
    `,
  });
}

// Funkcja pomocnicza - wysyłanie tygodniowego digestu
async function sendDigestEmail(email: string, name: string, payments: Subscription[]) {
  const totalAmount = payments.reduce((sum, p) => {
    const amountInPLN = p.currency === 'USD' ? p.amount * 4 : p.currency === 'EUR' ? p.amount * 4.3 : p.amount;
    return sum + amountInPLN;
  }, 0);

  const paymentsList = payments
    .map((p) => {
      const date = new Date(p.nextPayment);
      const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      return `• ${dayName}: ${p.name} - ${p.amount} ${p.currency}`;
    })
    .join('\n');

  await resend.emails.send({
    from: 'SubTracker <powiadomienia@subtracker.pl>',
    to: email,
    subject: `📊 Twój tydzień w SubTracker - ${payments.length} płatności`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366F1 0%, #4338ca 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📊 Podsumowanie tygodnia</h1>
        </div>

        <div style="background: #1e1e2e; padding: 30px; border-radius: 0 0 16px 16px; color: #e0e0e0;">
          <p style="font-size: 18px; margin-bottom: 20px;">Cześć ${name}! 👋</p>

          <p style="margin-bottom: 20px;">
            W tym tygodniu czekają Cię następujące płatności:
          </p>

          <div style="background: #2a2a3e; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; color: #a0a0a0;">${paymentsList}</pre>
          </div>

          <div style="background: #6366F1; color: white; padding: 15px 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 14px;">Do zapłaty w tym tygodniu</span>
            <div style="font-size: 28px; font-weight: bold;">${totalAmount.toFixed(2)} PLN</div>
          </div>

          <a href="https://subtracker.pl/dashboard" style="display: block; background: #4338ca; color: white; text-decoration: none; padding: 15px; border-radius: 12px; text-align: center; font-weight: bold;">
            Otwórz SubTracker →
          </a>
        </div>
      </div>
    `,
  });
}
