# Chili Pili Kannada · ಚಿಲಿಪಿಲಿ ಕನ್ನಡ

A web app for learning Kannada at home. Works on phones, iPads and laptops, and can be added to the home screen like an app.

- **Kids** learn with Gini the parrot: *Listen* to the week's words and sentences in the teacher's voice, *Play* (pictures, or sentence meanings), *Speak* (record and compare), *Write* (watch the teacher's strokes, trace with a finger, then write alone, and get checked on shape, stroke order and direction), and *Build* (put words in order, fill the gap, make a sentence longer). Stars, a day streak, "letters I can write", and bird stages from Egg 🥚 to Garuda 🦅.
- **Parents** print the weekly packet, hand it in with a phone photo, read the teacher's replies, message the teacher (text or voice notes), and see the month-end meet dates.
- **The teacher** gets an email the moment a family registers, a class summary every Monday (and a Summary page any time), reviews hand-ins with a one-tap reaction or a voice reply, writes up each month-end meet on one screen, posts to a class feed and records the words in their own voice.
- **Weekly packets are real PDFs** (US Letter): tracing sheets with the teacher's numbered start dots, a vowel-sign grid, sentence pages (order the words, fill the gap, make it longer, your turn, dictation) and a grown-ups' page with answers. Families hand in photos or a PDF. The teacher can add their own worksheets (PDF or image) to any week.

## The course: three paths

Parents choose at sign-up (a suggestion is pre-picked from their answers); the teacher can change it per child.

| Path | For | Letters | Sentences |
|---|---|---|---|
| 🌱 First steps | New to Kannada, or understands a little | Vowels and consonants, 3 to 5 a week, then vowel signs and joined letters | Say, build and copy one pattern a week |
| ✍️ Speaker to writer | Speaks at home, can't read or write | Whole alphabet in 6 weeks, vowel signs, joined letters, spelling | Writes each week's pattern, starts dictation |
| 📜 Longer sentences | Reads and writes some already | Vowel signs and joined letters polished, then spelling | Longer sentences, joining words, paragraphs, dictation, five writing projects (a letter home, news report, comparing, a festival, a little book) |

The 18 sentence patterns run from *This is* and *I like* through *where*, *how many*, verbs, past and future, word endings (-ಗೆ, -ಇಂದ, -ಅಲ್ಲಿ), *and/but/or*, *because/so*, *first/then/finally*, *can/must*, a paragraph and a story. All of it is in `src/lib/course.js`.

**Ages:** built for 5 to 10 year olds (the sweet spot is 6 to 9). 11 and 12 year olds can join; they may find Gini a bit young. Under 7, a grown-up sits with the child.

**The rhythm:** six months. Each month is three weeks of packets at home, then a month-end meet (ಕೂಟ) in week 4, in person or online.

Built with React + Vite, hosted on Vercel, with Firebase for Google sign-in, the database and file storage.

---

## Try it on your computer

You need [Node.js](https://nodejs.org) (the LTS version).

```bash
npm install
npm run dev
```

Open the address it prints. Without Firebase settings the app runs **on this device only**: you sign in with a name and email, and everything is saved in that browser. It's a real, empty app, handy for trying things before going live.

---

## Go live: GitHub → Vercel → Firebase (about 40 minutes)

### 1. Put the code on GitHub
1. Go to <https://github.com/new>, name the repository `chilipili`, keep it **Private**, and create it (don't add a README).
2. In this folder, run the commands GitHub shows under *"…or push an existing repository from the command line"*:
   ```bash
   git remote add origin https://github.com/YOUR-NAME/chilipili.git
   git push -u origin main
   ```
   (Or use GitHub Desktop: *File → Add local repository*, choose this folder, then *Publish*.)

### 2. Create the Firebase project
1. <https://console.firebase.google.com> → **Create a project** (e.g. `chilipili`).
2. **Build → Authentication → Get started → Google → Enable.** Pick your email as support email.
3. **Build → Firestore Database → Create database**, production mode, a location near your families (e.g. `us-central1`).
4. **Build → Storage → Get started.** Firebase may ask you to switch to the **Blaze** plan; it still has a free monthly allowance that a small class stays within. Set a budget alert under *Usage and billing*.
5. **Project settings (⚙) → General → Your apps → Web (`</>`)**, register an app. Keep this page open: you need the `firebaseConfig` values in step 4.

### 3. Add the security rules
1. `firebase/firestore.rules` already lists `ashsmi0621@gmail.com` as the teacher in `adminEmails()`. Add more emails there if a second teacher ever joins.
2. In the Firebase console: **Firestore Database → Rules**, paste the whole file, **Publish**.
3. **Storage → Rules**, paste `firebase/storage.rules`, **Publish**. If it asks to let Storage read Firestore, say yes.

(Or from a terminal: `npx firebase-tools login`, `npx firebase-tools use --add`, `npm run rules`.)

### 4. Deploy on Vercel
1. <https://vercel.com/new> → sign in with GitHub → **Import** the `chilipili` repository. Vercel detects Vite; keep the defaults.
2. Before deploying, open **Environment Variables** and add every line from `.env.example` with your Firebase values. `VITE_ADMIN_EMAILS` and `TEACHER_EMAIL` are both `ashsmi0621@gmail.com`. The email lines are explained in step 4b; you can add them later and redeploy.
3. **Deploy.** You get an address like `https://chilipili.vercel.app`.
4. Back in Firebase: **Authentication → Settings → Authorized domains → Add domain** → your Vercel address (without `https://`).

From now on, every change pushed to GitHub redeploys automatically.

### 4b. Turn on the emails (about 10 minutes)
The app sends two emails to `TEACHER_EMAIL`: **one per new registration** (child's name, age, starting stages, parent's email) and a **weekly class summary every Monday at 8 AM Central** (13:00 UTC).

1. **Resend** (free for this size): sign up at <https://resend.com> **with ashsmi0621@gmail.com**. Without your own domain, Resend only delivers to the address you signed up with, which is exactly what you need. Go to **API Keys → Create**, copy the key.
2. In Vercel → Project → **Settings → Environment Variables** add:
   - `RESEND_API_KEY` = the key
   - `TEACHER_EMAIL` = `ashsmi0621@gmail.com`
   - `CRON_SECRET` = any long random text (Vercel sends it to the Monday job so nobody else can trigger it)
3. **For the Monday summary only:** Firebase → ⚙ **Project settings → Service accounts → Generate new private key**. Open the downloaded file, copy all of it, and paste it as `FIREBASE_SERVICE_ACCOUNT` (one line is fine). Keep that file private.
4. **Redeploy** (Deployments → ⋯ → Redeploy). Test: in the app open **Summary → Email me this summary**.

The registration email doesn't need the service account; it uses the parent's own sign-in.

### 5. First run as the teacher
1. Open your site, **Sign in** with your Google account. You land in the teacher view.
2. **Settings:** check your groups, venue and time zone. **Who can join** is *Open* by default: any family that signs in with Google and adds their child starts week 1 at once, and you get the email. Switch to *Class code only* if the link spreads beyond MKS. Press **Copy invite** and paste it into your parents' WhatsApp group.
3. **My handwriting:** write each vowel once over the grey letter, the way you teach it (about 10 minutes for the vowels). Children then watch your strokes and get checked against your order and direction. Letters you haven't written yet are still checked on shape.
4. **My voice:** record month 1's words and sentences so children hear you.
5. **Meets:** schedule all six month-end meets at once.
6. **Packets:** preview each path's week 1 PDF, and add any worksheets of your own.
7. Post a welcome in the **Class feed**.

Families sign in with Google, answer three quick questions about their child (which sets the starting stage), and start week 1 straight away. Confirm or adjust each child's stages at the first month-end meet (**Children → child → Stages**). The **Summary** tab shows where the whole class is, and **Download spreadsheet** gives you a CSV.

**Custom domain** (optional): Vercel → Project → Settings → Domains. Add the new domain to Firebase's authorized domains too.

---

## How it works inside

| What | Where |
|---|---|
| Accounts and roles (parent, teacher, admin) | `users` |
| Children, their stages, goals, stars | `children` |
| Kids' activity with Gini | `activity` |
| Packet photos and speaking recordings, teacher replies | `submissions`, Storage `handins/`, `speaking/`, `feedback/` |
| Stage history | `stageLogs` |
| Month-end meets and per-child notes | `meets`, `meetNotes` |
| Messages (text and voice notes) | `messages`, Storage `messages/` |
| Class feed | `posts`, Storage `posts/` |
| The teacher's word recordings | `voice`, Storage `voice/` |
| The teacher's handwriting (stroke order) | `strokes` |
| The teacher's own worksheets | `packetFiles`, Storage `packets/` |
| School settings and class code | `settings/school` (public), `settings/join` (teachers only) |
| Registration and Monday emails | `api/notify.js`, `api/weekly-summary.js` (Vercel functions, Resend) |

Stages and months live in `src/lib/content.js`; the paths, letters, sentence patterns and projects in `src/lib/course.js`; handwriting checking in `src/lib/strokes.js`; the PDF in `src/lib/packetPdf.js`. **Please have a Kannada teacher review every Kannada word before families use it.**

## Stages and months

| Stage | Kannada | Can do |
|---|---|---|
| 🥚 Egg | ಮೊಟ್ಟೆ | Just starting |
| 🐣 Chick | ಮರಿ | Sounds, greetings, vowels |
| 🐦 Sparrow | ಗುಬ್ಬಿ | Letters, everyday words |
| 🦜 Parrot | ಗಿಳಿ | Words and short sentences |
| 🐦‍⬛ Koel | ಕೋಗಿಲೆ | Sentences, questions, joined letters |
| 🦚 Peacock | ನವಿಲು | Stories |
| 🦅 Garuda | ಗರುಡ | Flying on their own |

| Month | Name | Covers |
|---|---|---|
| 1 | Hello · ನಮಸ್ಕಾರ | First letters; naming things, introducing yourself, likes |
| 2 | My home · ನನ್ನ ಮನೆ | More letters; where things are, how many, what I do |
| 3 | Words · ಪದಗಳು | Vowel signs; he and she, questions, the past |
| 4 | Let's talk · ಮಾತುಕತೆ | Joined letters; plans, describing, word endings |
| 5 | Tell me a story · ಕಥೆ ಹೇಳು | Spelling; and, but, because, first and then |
| 6 | My Kannada · ನನ್ನ ಕನ್ನಡ | Paragraphs, a story of their own, writing alone |

(Exact letters and patterns per month depend on the path.)

## Good to know
- **Handwriting checks** compare the child's strokes with the letter's shape (drawn from the bundled Noto Sans Kannada font) and, once you have written a letter under My handwriting, with your stroke order and direction. It is forgiving by design: a wobbly but complete letter gets 2 to 3 stars; scribbles and half letters don't pass.
- **Recording** needs a secure (https) address, which Vercel gives you. On iPhone, Safari asks for microphone permission the first time.
- **Listening** uses the teacher's recordings. If a word isn't recorded yet and the phone has a Kannada voice installed (common on Android), that is used instead; otherwise the child sees the word and says it with a grown-up.
- **Emails go to the teacher only.** Families see replies and meets when they open the app, and can add meets to their phone calendar. No WhatsApp automation.
- **Vercel Cron** on the free Hobby plan runs once a day at most, which is plenty for one Monday email. The time can drift by up to an hour.
- **Children's data:** parents consent when adding a child. Delete a family's photos and recordings from Firebase Storage if they ask.

## Launch checklist
- [ ] Code pushed to GitHub, Vercel deployed, Vercel address added to Firebase authorized domains
- [ ] Firestore and Storage rules published (again, if you published them before: they now include handwriting and worksheets)
- [ ] Signed in as ashsmi0621@gmail.com and landed in the teacher view
- [ ] Resend key, `TEACHER_EMAIL`, `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT` added, redeployed, test summary email received
- [ ] Vowels written under **My handwriting**; month 1 words and sentences recorded under **My voice**
- [ ] Six month-end meets scheduled
- [ ] Welcome post in the class feed
- [ ] A test family registered from a second Google account on a phone, registration email arrived, then that test child removed
- [ ] Kannada words in `src/lib/content.js` checked once more
- [ ] Invite pasted in the MKS parents' WhatsApp group
