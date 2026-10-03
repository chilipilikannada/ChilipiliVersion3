# Chili Pili Kannada Kali: go live in one evening

Your site: https://chilipilikannada.vercel.app
Open **https://chilipilikannada.vercel.app/#/setup** at any point: it checks every step below for real and tells you what's missing.

## 1. Upload this code (5 minutes)
GitHub → your repository → **Add file → Upload files** → drag in everything inside this `chilipili-app` folder → **Commit changes**. Vercel rebuilds by itself.

## 2. Firebase: Google sign-in and saving (15 minutes)
1. https://console.firebase.google.com → your project → ⚙ **Project settings → General → Your apps → Web app (</>)**. Copy the six config values.
2. **Build → Authentication → Sign-in method → Google → Enable**. Then **Settings → Authorized domains → Add** `chilipilikannada.vercel.app`.
3. **Build → Firestore Database → Create database** (production mode, US). **Rules** → paste `firebase/firestore.rules` → **Publish**.
4. **Build → Storage → Get started**. **Rules** → paste `firebase/storage.rules` → **Publish** (say yes if it asks to read Firestore).
5. ⚙ **Project settings → Service accounts → Generate new private key**. Keep the downloaded file private.

## 3. Email from ashsmi0621@gmail.com (5 minutes)
1. https://myaccount.google.com/security → turn on **2-Step Verification**.
2. https://myaccount.google.com/apppasswords → name it `Chili Pili` → **Create** → copy the 16 letters.

This switches on: **sign-in codes by email** (anyone, any email address), **kid numbers by email** ("Forgot your number?" and "Email it to me"), **welcome emails** with the child's number, **new-family emails** to you, and the **Monday notes** to families and the **class summary** to you.

## 4. Voice translator (10 minutes, optional but recommended)
- https://console.anthropic.com → API keys → create one.
- https://console.cloud.google.com (same project as Firebase) → **APIs & Services → Enable**: Cloud Text-to-Speech, Cloud Speech-to-Text, Cloud Translation → **Credentials → Create API key** → restrict it to those three.

## 5. Vercel settings (5 minutes)
Vercel → Project → **Settings → Environment Variables**. Add each one (names exactly as written; `.env.example` explains each):

| Name | Value |
|---|---|
| VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID | the six values from step 2.1 |
| VITE_ADMIN_EMAILS | ashsmi0621@gmail.com |
| FIREBASE_SERVICE_ACCOUNT | the whole service-account file from step 2.5 |
| GMAIL_USER | ashsmi0621@gmail.com |
| GMAIL_APP_PASSWORD | the 16 letters from step 3 |
| TEACHER_EMAIL | ashsmi0621@gmail.com |
| CRON_SECRET | any long random text |
| ANTHROPIC_API_KEY | from step 4 |
| GOOGLE_API_KEY | from step 4 |

Then **Deployments → ⋯ → Redeploy**.

## 6. Check and test (10 minutes)
1. Open `/#/setup` → **Check again** until all 8 steps are green.
2. Sign in with Google as ashsmi0621@gmail.com: you land in the teacher view. **Settings → Send me a test email**.
3. On your phone, sign in with **Email me a sign-in code** using a different email; add a test child; check the welcome email arrives with the child's number; try **I'm a kid** with that number on another device.
4. Try **Talk both ways** in both directions on an iPhone.
5. Remove the test child (Children → the child → remove), and share the site in your WhatsApp group.

First emails from a personal Gmail can land in spam: ask families to mark the first one "Not spam".
