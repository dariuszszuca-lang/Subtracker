# SubTracker - Firebase Cloud Functions

## Konfiguracja

### 1. Zainstaluj Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Zainicjuj projekt Firebase
```bash
firebase init functions
```

### 3. Skonfiguruj Resend API Key
```bash
firebase functions:config:set resend.key="re_xxxxxxxxxxxxx"
```

Klucz Resend możesz uzyskać na: https://resend.com/api-keys

### 4. Zainstaluj zależności i zbuduj
```bash
cd functions
npm install
npm run build
```

### 5. Deploy
```bash
npm run deploy
```

## Funkcje

### `sendPaymentReminders`
- **Kiedy:** Codziennie o 8:00 (Europe/Warsaw)
- **Co robi:** Wysyła emaile z przypomnieniami o nadchodzących płatnościach
- **Logika:** Sprawdza subskrypcje, których `nextPayment` wypada za X dni (ustawione przez użytkownika)

### `sendWeeklyDigest`
- **Kiedy:** Poniedziałek o 9:00 (Europe/Warsaw)
- **Co robi:** Wysyła tygodniowe podsumowanie płatności
- **Logika:** Lista wszystkich płatności na następne 7 dni

## Testowanie lokalne

```bash
npm run serve
```

## Koszty

- Firebase Cloud Functions: ~$0.40/million invocations
- Resend: 3000 emaili/miesiąc za darmo, potem $20/miesiąc
