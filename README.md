# Date Invitation 💗

Cute desktopowa aplikacja React z uciekającym przyciskiem „Nie”, formularzem planowania randki, Cloud Firestore i automatycznym deploymentem na GitHub Pages.

## Funkcje

- zaproszenie „Czy pójdziesz ze mną na randkę?”,
- uciekający przycisk „Nie”,
- animacja po wybraniu „Tak”,
- wybór daty, godziny i rodzaju jedzenia,
- własna propozycja jedzenia,
- opcjonalne miejsce i wiadomość,
- zapis do Cloud Firestore,
- wysuwany panel z zapisanymi randkami,
- deployment przez GitHub Actions.

## Uruchomienie lokalne

```bash
npm install
cp .env.example .env.local
npm run dev
```

Uzupełnij `.env.local` konfiguracją aplikacji webowej z Firebase Console.

## Firebase

1. Utwórz projekt w Firebase Console.
2. Dodaj aplikację Web.
3. Skopiuj wartości z obiektu `firebaseConfig` do `.env.local`.
4. Utwórz Cloud Firestore w trybie produkcyjnym.
5. W zakładce Firestore Database → Rules wklej zawartość `firestore.rules` i opublikuj reguły.

Kolekcja `dates` utworzy się automatycznie przy pierwszym poprawnym zapisie.

## Personalizacja

Edytuj teksty w `src/config.js`:

```js
export const APP_CONFIG = {
  inviteeName: 'Piękna',
  // ...
};
```

Kolory i wygląd znajdują się w `src/index.css` oraz `src/App.css`.

## GitHub Pages

W repozytorium dodaj w Settings → Secrets and variables → Actions → Variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Następnie w Settings → Pages ustaw Source na **GitHub Actions**. Push na branch `main` uruchomi workflow `.github/workflows/deploy.yml`.

## Ważne ograniczenie

Aplikacja nie ma logowania. Każdy, kto zna adres i potrafi wysłać poprawne żądanie do projektu Firebase, może dodać wpis zgodny z regułami. Nie zapisuj w tej bazie danych wrażliwych informacji.
