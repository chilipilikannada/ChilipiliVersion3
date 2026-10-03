# Chili Pili Kannada · ಚಿಲಿಪಿಲಿ ಕನ್ನಡ

> **Going live?** Follow [GO-LIVE.md](GO-LIVE.md): one page, in order, with the email setup. Then open `/#/setup` on your site to check every step.

A web app for learning Kannada at home. Works on phones, iPads and laptops, and can be added to the home screen like an app.

- **Kids** learn with Gini the parrot: *Listen* to the week's words and sentences in the teacher's voice, *Play* (pictures, or sentence meanings), *Speak* (record and compare), *Write* (watch the teacher's strokes, trace with a finger, then write alone, and get checked on shape, stroke order and direction), and *Build* (put words in order, fill the gap, make a sentence longer). Stars, a day streak, "letters I can write", and bird stages from Egg 🥚 to Garuda 🦅.
- **Parents** print the weekly packet, hand it in with a phone photo, read the teacher's replies, message the teacher (text or voice notes), and see the month-end meet dates.
- **The teacher** gets an email the moment a family registers, a class summary every Monday (and a Summary page any time), reviews hand-ins with a one-tap reaction or a voice reply, writes up each month-end meet on one screen, posts to a class feed and records the words in their own voice.
- **Weekly packets are real PDFs** (US Letter): tracing sheets with the teacher's numbered start dots, a vowel-sign grid, sentence pages (order the words, fill the gap, make it longer, your turn, dictation) and a grown-ups' page with answers. Families hand in photos or a PDF. The teacher can add their own worksheets (PDF or image) to any week.

## Levels 1 to 4 (anyone can move up)

| Level | For about | What changes |
|---|---|---|
| 🐣 1 Little learners | 5 to 6 | Dot-to-dot letters, a few a week; short sentences |
| 🐦 2 Explorers | 6 to 8 | Whole alphabet in 6 weeks; tracing checked on shape and stroke order |
| 🦜 3 Speakers to writers | 7 to 10 | Faster sentences, writing what they say, dictation |
| 🦚 4 Big writers | 9 to 12 | A story every week: read long sentences aloud, answer in full sentences, dictation, write their own story |

Sign-up suggests a level; the parent can pick another. Afterwards the parent can step up or down any time with the ◀ ▶ buttons on Home (or on the child's Profile), and the child can from kids' space → "Try level N", even if it's hard. The teacher sees level changes in the child's activity and can fine-tune path, pace and tracing separately.

## The Letter journey (ಅಕ್ಷರ ಪಯಣ): 45 days of writing and reading

Self-paced, one lesson a day (about 10 to 15 minutes): **vowels** (days 1 to 8), **consonants ಕ ಖ ಗ ಘ …** (9 to 25), **vowel signs / ಕಾಗುಣಿತ** (26 to 37) and **joined letters / ಒತ್ತಕ್ಷರ** (38 to 45, ending with a short story).
Each day: meet the letters (sound and a picture word), write them (watch, trace, on my own), find the sound (hear it, tap the letter), read words made of letters already learnt, and write two older letters from memory.
- Finishing a day unlocks the next one straight away, so keen children move faster.
- **Quick check**: find 7 of 8 sounds and write 3 letters from memory to jump to the next section.
- The teacher can move a child to any section from their page. Children who already read and write start at vowel signs.
- The weekly packet's tracing pages follow each child's journey (their current day and the next four).
- After all six missions in a week, a child can start next week straight away.

## Every day: missions, talking and "Say it in Kannada"

- **Today's mission**: six missions a week, about 15 minutes each (Day 1 New words, 2 Letters, 3 Sentences, 4 Remember, 5 Say more, 6 Show what you know). Each is four short steps: talk with Gini, listen or play, write, build sentences. Days 4 to 6 mix in the last three weeks for review.
- **Talk with Gini**: Gini asks a question out loud (ನಿನಗೆ ಏನು ಇಷ್ಟ?), shows an answer frame (ನನಗೆ ___ ಇಷ್ಟ) with picture words, and the child answers into the mic. Answers go to the teacher automatically.
- **Say it in Kannada**: the child (or parent) says something in English; Gini shows and says it in Kannada with an easy pronunciation, and the child says it back. Every phrase is saved; the teacher sees them under **My voice → Children's phrases** and can record them in their own voice.
- **Easy dot-to-dot tracing**: on for gentle-pace and younger children (switch on the child's page). Dots light up green as the finger passes; the letter completes by itself. The PDF gets dotted letters and a find-and-circle page.
- **No deadlines**: letters written alone on screen, Speak recordings and Talk answers reach the teacher on their own (Review, and a handwriting gallery on each child's page). Paper pages are sent whenever they're done.

### Turn on Talk both ways, the voice translator (about 10 minutes)
**Talk both ways** lets anyone speak English and hear Kannada (with easy English-letter pronunciation and key words), or speak Kannada and hear English. Turns stack up like a chat, so a child and a grandparent can talk through it. It's in every learner's space and there's a live demo on the front page (15 tries an hour per visitor).

1. **Claude key** (translation, both directions): <https://console.anthropic.com> → API keys → create one. Add a few dollars of credit; each translation costs a fraction of a cent.
2. **Google key** (Kannada voice, and understanding spoken Kannada on every phone including iPhones): <https://console.cloud.google.com>, pick your Firebase project → **APIs & Services → Enable APIs** → enable **Cloud Text-to-Speech API**, **Cloud Speech-to-Text API** and **Cloud Translation API** → **Credentials → Create credentials → API key** → *Restrict key* to those three APIs. Speech-to-Text includes 60 free minutes a month, then about 2 cents a minute.
3. In Vercel → Settings → Environment Variables add `ANTHROPIC_API_KEY` and `GOOGLE_API_KEY`, then redeploy. **Settings → Setup check** shows both lines green.

Without the Claude key, translation uses Google Translate (more formal Kannada, no word list). Without the Google key, English still works on most phones, and Kannada listening falls back to the browser (Chrome on Android and computers; not iPhones).

## Big writers: a story every week
Level 4 swaps the six missions for a story week built on 12 graded stories (the thirsty crow, lion and mouse, hare and tortoise, the greedy dog, monkey and crocodile, a birthday, a trip, and more):
1. **Read**: the story line by line in Kannada, tap a line to hear it, English toggle, record yourself reading it aloud.
2. **Questions**: answer in full sentences, then build sentences from the story's words.
3. **Dictation**: hear a line, write it on the ruled pad, then read the whole story aloud again.
4. **Retell** in your own words (recorded).
5. **Write your own story** on the pad or on paper (photo), with word tiles, then read it aloud. It reaches the teacher's Review and handwriting gallery.
6. **Show what you know**.

The **Story corner** on the kid home screen opens any story they have reached. The weekly PDF adds a story page with questions and a "Write your own story" page.

## Signing in: Google, a code by email, or a kid number
- **Continue with Google**: one tap for anyone with a Gmail/Google account.
- **Email me a sign-in code**: anyone types any email (Gmail, Yahoo, Outlook…) and gets a 6-digit code sent from ashsmi0621@gmail.com. It works for 10 minutes and once only; 5 wrong tries cancels it. The same email always opens the same account, whether they used Google or a code, so children and progress never split. Needs `FIREBASE_SERVICE_ACCOUNT` and Gmail.
- **I'm a kid**: the child's 4-digit number. **Forgot your number?** sends it to the grown-up's own email (never shown on screen). Parents can also tap **Email it to me** next to the number on Home.

## Go-live checklist page
Open **your-site/#/setup** (also linked as *Site setup* at the bottom of the front page and from Settings). It walks through every step (Firebase, Google sign-in, database and rules, service account, Gmail, Monday emails, voice translator), **tries each connection for real**, and shows exactly what's missing, with buttons to copy the Firestore and Storage rules. All setting names are in `.env.example`.

## Signing in: parents and kids
- **Parents** sign in with Google once per device; the browser keeps them signed in. The app never sees or stores a Gmail password.
- **Kid numbers**: every child gets a 4-digit number automatically when the parent adds them. It shows on the parent's Home page and the child's Profile. On any phone, iPad or laptop the child taps **I'm a kid** and types the 4 numbers; they stay signed in on that device. Stars, letters and recordings live in the cloud, so work carries across devices. **New number** on the Profile stops the old one. Kids only see their own space; a hold-to-sign-out button sits under Grown-ups.
- Kid numbers need `FIREBASE_SERVICE_ACCOUNT` in Vercel (the same one the Monday email uses). Wrong guesses are limited to 8 an hour per network and 300 an hour for the whole site, and easy numbers (1111, 1234, years) are never given out.

## Is it really six months? (Course plan)
Open **Course plan** in the teacher view. It lists all 24 weeks for each level (and the grown-ups' weekly lessons) and checks that nothing repeats:
- **18 lesson weeks + 6 month-end meet weeks** (every 4th week) = 24 weeks.
- Every lesson week has its own sentence pattern, word theme, family talk (with writing), story (levels 3 and 4) and Know Karnataka card. Meet weeks are review plus "Show Ajji what you learnt".
- Every week also has 6 daily missions (about 15 minutes), the printable packet and the self-paced letter journey (45 days).
- Grown-ups get one new lesson a week (25 lessons) with practice suggestions in between; they can start the next lesson early.

## Adding extra
**Without touching code** (teacher view):
- **Packets → add your own worksheet** (PDF or photo) to any week; families get it with that week's packet.
- **My voice**: record any word or sentence in your voice; it replaces the computer voice everywhere.
- **Class feed**: songs, rhymes, videos, festival greetings for everyone.

**New content in the app** (edit on GitHub, then Vercel redeploys by itself):
| To add | File | How |
|---|---|---|
| A family talk | `src/lib/family.js` | Copy one `T("…")` block inside `FAMILY_TALKS`, give it a new id. Talks follow the lesson weeks in order. |
| A Know Karnataka card | `src/lib/family.js` | Add a line to `KNOW`: `["emoji", "Kannada title", "English sentence"]`. |
| A story | `src/lib/stories.js` | Copy one story block: 8 lines, the 8 English lines, 4 words, 3 questions, a writing prompt. |
| A grown-up lesson | `src/lib/adult.js` | Copy one `U("…")` block inside `UNITS`: 8 phrases, a note, a dialogue. |
| Months 7 to 12 | `src/lib/plan.js` and `src/lib/course.js` | Set `PLAN_WEEKS` to 48 and add 18 more patterns, themes, talks, stories and cards so the new weeks don't repeat. The Course plan page shows any gaps. |

Every line of Kannada should be checked by a fluent speaker before families see it.

## Family talks: kids connect with parents and grandparents
Children in the USA learn Kannada to talk with the people they love, so every week has a **family talk** (`src/lib/family.js`): 18 talks, one per lesson week (a video call with Ajji, telling Amma about school, helping Appa cook, a bedtime story with Tata, grandparents visiting from India, the park, being sick, planting with Tata, the shopping list, chatting with a cousin in India, the temple, thanking Maava, Ugadi and more), plus "Show Ajji what you learnt" in meet weeks.
- **In the kids' space** (Family talk card and **Family corner**): listen to the talk → Gini plays Amma, Ajji or Tata and the child answers out loud → the child **writes** a line for that person: a word at level 1, a phrase at level 2, a whole sentence at levels 3 and 4.
- **Send to Ajji**: the handwriting becomes a picture card ("For Ajji ❤️", the Kannada, and the child's own writing) that opens the phone's share sheet, so a parent can send it on WhatsApp. The teacher gets a copy in Review and the handwriting gallery.
- **Parents** see the same talk on Home under *This week at home*, with every line to hear, so they can do it for real at dinner or on the next call.
- **Know Karnataka**: one short fact a week (Rajyotsava, Mysuru Dasara, Hampi, Jog Falls, Ugadi, Yakshagana…) to talk about as a family.

## Grown-ups can learn too
Grown-ups here are mostly learning to talk with a partner or loved ones who speak Kannada. They sign up the same way (Google), then choose **Me** at "Who is learning?" (or tap **Learn Kannada myself** on the front page). No age is asked. The grown-up course is written for life in the USA: calling family in India, relatives visiting, the Indian store, temple and Kannada Koota events. A family can have children and grown-ups side by side and switch from the name at the top.

- **Sign-up** asks what they want Kannada for (their partner, family and in-laws, close friends, helping a child, the script) and how much they understand, speak and read, then suggests a level.
- **Levels**: 🌱 1 First words · 🌿 2 Everyday talk · 🌳 3 Read and write · 🏵️ 4 Fluent. Move with ◀ ▶ on Home any time; every lesson stays open whatever the level.
- **25 conversation lessons** (`src/lib/adult.js`), all with a partner, family and friends, never strangers: greetings, about me, numbers at home, dinner with family, family, with your partner, relatives visiting from India, time, cooking together, visiting family, past and future, the phone, when someone's unwell, feelings, Kannada with your child, friends come over, reading the menu together, messages, festivals, opinions, storytelling, work, speaking with elders. Each has 8 phrases with English letters and meaning, a short "how it works" grammar note, and a dialogue.
- **A lesson** (15 to 20 minutes): hear the phrases → read the note and the conversation → say them (recorded, reaches you) → what does it mean? → role-play (Gini reads the other person, the learner answers out loud) → build sentences.
- **Also for grown-ups**: the 45-day letter journey (optional below level 3), the story corner, word lists (colours, family, fruits…) and Say it in Kannada.
- **You see** grown-ups marked *Grown-up* in Children and Summary; their recordings arrive in Review like the children's. Welcome and Monday emails have grown-up wording. Grown-ups sign in with Google on every device, so they don't get a kid number.
- **Please check the Kannada** in `src/lib/adult.js` once (phrases, English letters, notes), as you did for the children's words.

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

### 4b. Turn on the emails and kid numbers (about 15 minutes)
Emails go out from your own Gmail, so parents see them from you and their replies land in your inbox:
- **To you**: every new family, and a class summary every Monday at 8 AM Central.
- **To each parent**: a welcome email with their child's 4-digit number, the number again whenever it changes (or they tap *Email it to me*), and a short note every Monday (stars, missions, your replies). You can switch the Monday family note off in **Settings**.

1. **Gmail app password** (Gmail won't let apps use your normal password):
   - Go to <https://myaccount.google.com/security> signed in as ashsmi0621@gmail.com and turn on **2-Step Verification** if it isn't on.
   - Then open <https://myaccount.google.com/apppasswords>, name it `Chili Pili`, and tap **Create**. Copy the 16-letter password it shows (spaces are fine).
2. **Service account** (lets kid numbers work on any device and lets the Monday job read the class): Firebase → ⚙ **Project settings → Service accounts → Generate new private key**. Open the downloaded file, copy all of it. Keep that file private.
3. In Vercel → Project → **Settings → Environment Variables** add:
   - `GMAIL_USER` = `ashsmi0621@gmail.com`
   - `GMAIL_APP_PASSWORD` = the 16-letter app password
   - `TEACHER_EMAIL` = `ashsmi0621@gmail.com`
   - `FIREBASE_SERVICE_ACCOUNT` = the whole file you copied
   - `CRON_SECRET` = any long random text (so nobody else can trigger the Monday job)
4. **Redeploy** (Deployments → ⋯ → Redeploy). Then in the app open **Settings → Setup check**: every line should have a green tick. Tap **Send me a test email**.

Gmail allows about 500 emails a day, far more than a class needs. (Resend still works for emails to you with `RESEND_API_KEY`, but without your own domain it can't reach parents.)

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
| Phrases children asked to say | `phrases` |
| Translation and Kannada voice | `api/translate.js`, `api/speak.js` |
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
- **Microphone**: if it's blocked, children see steps for their device (iPhone, iPad, Android, computer) and an "Allow microphone" button. It works on the live website, not inside the Claude preview.
- **Recording** needs a secure (https) address, which Vercel gives you. On iPhone, Safari asks for microphone permission the first time.
- **Listening** uses the teacher's recordings. If a word isn't recorded yet and the phone has a Kannada voice installed (common on Android), that is used instead; otherwise the child sees the word and says it with a grown-up.
- **Emails** go from your Gmail to you and to parents (welcome with the kid number, number changes, a Monday note). Families still see replies and meets in the app. No WhatsApp automation.
- **Vercel Cron** on the free Hobby plan runs once a day at most, which is plenty for one Monday email. The time can drift by up to an hour.
- **Children's data:** parents consent when adding a child. Delete a family's photos and recordings from Firebase Storage if they ask.

## Launch checklist
- [ ] Code pushed to GitHub, Vercel deployed, Vercel address added to Firebase authorized domains
- [ ] Firestore and Storage rules published (again, if you published them before: they now include grown-up lessons, kid numbers, handwriting and worksheets)
- [ ] Signed in as ashsmi0621@gmail.com and landed in the teacher view
- [ ] `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `TEACHER_EMAIL`, `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT` added, redeployed, Settings → Setup check all green, test email received
- [ ] Vowels written under **My handwriting**; month 1 words and sentences recorded under **My voice**
- [ ] A test child's 4-digit number and tried on a second device
- [ ] Talk both ways tried on an iPhone in both directions (English → ಕನ್ನಡ and ಕನ್ನಡ → English)
- [ ] One family talk done with a test child, and the "Send to Ajji" card shared from a phone
- [ ] Six month-end meets scheduled
- [ ] Welcome post in the class feed
- [ ] A test family registered from a second Google account on a phone, registration email arrived, then that test child removed
- [ ] Kannada words in `src/lib/content.js` and the grown-up lessons in `src/lib/adult.js` checked once more
- [ ] A test grown-up signed up with **Learn Kannada myself** and finished one lesson
- [ ] Invite pasted in the MKS parents' WhatsApp group
