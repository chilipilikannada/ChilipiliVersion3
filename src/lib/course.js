// The course: three paths, the letters (script) and sentence patterns for all 18 packets.
// Please have a Kannada teacher review every Kannada line before families use it.
import { storyFor, dictationOf, RETELL } from "./stories.js";

// ---------- Paths ----------
// A child has two settings: the sentence path (how hard the sentences are) and the
// letter pace (how fast the alphabet comes). Placement looks at several answers together.
export const TRACKS = {
  start: {
    en: "First steps", kn: "ಮೊದಲ ಹೆಜ್ಜೆ", icon: "🌱",
    who: "Understands some Kannada, or a lot, but doesn't speak it on their own yet",
    aim: "Say, build and write short sentences, and answer in Kannada instead of English",
    detail: "One sentence pattern a week to hear, say, build and copy, with lots of practice answering in Kannada.",
  },
  write: {
    en: "Speaker to writer", kn: "ಮಾತಿನಿಂದ ಬರಹಕ್ಕೆ", icon: "✍️",
    who: "Speaks Kannada on their own, but doesn't read or write it yet",
    aim: "Read and write the sentences they can already say",
    detail: "Writes each week's sentence pattern and starts dictation.",
  },
  long: {
    en: "Longer sentences", kn: "ಉದ್ದ ವಾಕ್ಯಗಳು", icon: "📜",
    who: "Speaks on their own and already reads and writes some Kannada",
    aim: "Write joined-up sentences, paragraphs, a letter and a short story",
    detail: "Longer sentences, dictation, paragraphs and a writing project each week.",
  },
};
export const TRACK_KEYS = ["start", "write", "long"];

export const PACES = {
  gentle: { en: "Gentle", detail: "3 to 5 new letters a week; the whole alphabet by month 3, then vowel signs and joined letters" },
  steady: { en: "Steady", detail: "8 to 10 letters a week; the whole alphabet in 6 weeks, then vowel signs, joined letters and spelling" },
  review: { en: "Polish", detail: "Vowel signs and joined letters in the first month, then spelling and writing words" },
};
export const PACE_KEYS = ["gentle", "steady", "review"];
const TRACK_PACE = { start: "gentle", write: "steady", long: "review" };

// Sign-up answers, in plain words the parent recognises.
export const UNDERSTAND = [["none", "Not really"], ["some", "Simple things (come, eat, sit down)"], ["most", "Most everyday talk"]];
export const SPEAK = [["english", "Answers in English"], ["words", "A few Kannada words"], ["asked", "1 or 2 sentences, when asked"], ["own", "Talks in Kannada on their own"]];

// Placement: combine understanding, speaking on their own, reading, writing, home and age.
export function placement({ understand = "some", speak = "english", reading = 0, writing = 0, homeKannada = "sometimes", age = 7 } = {}) {
  const speaksOwn = speak === "own";
  const why = [];
  let track = "start";
  if (speaksOwn && writing >= 3) { track = "long"; why.push("Talks in Kannada on their own and already writes words."); }
  else if (speaksOwn) { track = "write"; why.push("Talks in Kannada on their own, so sentences can move faster than letters."); }
  else {
    why.push(speak === "asked" ? "Speaks when asked, not yet on their own: short sentences to say and build come first."
      : understand === "most" ? "Understands a lot but answers in English: speaking up in Kannada comes first."
        : "Just starting to speak: short, everyday sentences first.");
  }
  let pace = "gentle";
  if (writing >= 3 || reading >= 3) { pace = "review"; why.push("Already reads or writes some letters, so letters start at vowel signs."); }
  else if (age >= 8 || (age >= 7 && (reading >= 1 || writing >= 1))) { pace = "steady"; why.push(`At ${age}, ready for letters at a steady pace.`); }
  else why.push(`At ${age}, a few new letters a week is plenty.`);
  if (homeKannada === "daily" && track === "start") why.push("Hears Kannada every day, so the home task is answering in Kannada.");
  return { track, pace, why };
}

// Speaking stage from the sign-up answers (the teacher confirms at the first meet).
export const speakingStage = (speak, understand) => ({ english: understand === "none" ? 0 : 1, words: 1, asked: 2, own: 4 }[speak] ?? 0);

// For children who signed up before placement existed.
export function suggestTrack(est = {}) {
  if ((est.writing || 0) >= 3 && (est.speaking || 0) >= 4) return "long";
  if ((est.speaking || 0) >= 4) return "write";
  return "start";
}
export const trackOf = (child) => (child && TRACKS[child.track] ? child.track : suggestTrack(child ? child.stages || child.startStages : {}));
export const paceOf = (child) => (child && PACES[child.pace] ? child.pace : TRACK_PACE[trackOf(child)]);

// ---------- Letters ----------
// Example word for each letter: [word, romanised, english]
export const LETTER_WORD = {
  "ಅ": ["ಅಮ್ಮ", "amma", "mother"], "ಆ": ["ಆನೆ", "aane", "elephant"], "ಇ": ["ಇಲಿ", "ili", "mouse"], "ಈ": ["ಈಜು", "iiju", "swim"],
  "ಉ": ["ಉಪ್ಪು", "uppu", "salt"], "ಊ": ["ಊಟ", "uuTa", "meal"], "ಋ": ["ಋಷಿ", "rushi", "sage"], "ಎ": ["ಎಲೆ", "ele", "leaf"],
  "ಏ": ["ಏಣಿ", "eeNi", "ladder"], "ಐ": ["ಐದು", "aidu", "five"], "ಒ": ["ಒಂಟೆ", "onTe", "camel"], "ಓ": ["ಓದು", "oodu", "read"],
  "ಔ": ["ಔಷಧ", "aushadha", "medicine"], "ಅಂ": ["ಅಂಗಡಿ", "angaDi", "shop"], "ಅಃ": ["ದುಃಖ", "duhkha", "sadness"],
  "ಕ": ["ಕಮಲ", "kamala", "lotus"], "ಖ": ["ಖಡ್ಗ", "khaDga", "sword"], "ಗ": ["ಗಡಿಯಾರ", "gaDiyaara", "clock"], "ಘ": ["ಘಂಟೆ", "ghanTe", "bell"],
  "ಙ": ["ವಾಙ್ಮಯ", "vaangmaya", "literature"], "ಚ": ["ಚಮಚ", "chamacha", "spoon"], "ಛ": ["ಛತ್ರಿ", "chhatri", "umbrella"], "ಜ": ["ಜಿಂಕೆ", "jinke", "deer"],
  "ಝ": ["ಝರಿ", "jhari", "stream"], "ಞ": ["ಜ್ಞಾನ", "jnaana", "knowledge"], "ಟ": ["ಟೊಮೆಟೊ", "Tomato", "tomato"], "ಠ": ["ಠಾಣೆ", "Thaane", "station"],
  "ಡ": ["ಡಬ್ಬ", "Dabba", "box"], "ಢ": ["ಢಕ್ಕೆ", "Dhakke", "big drum"], "ಣ": ["ಬಾಣ", "baaNa", "arrow"], "ತ": ["ತಲೆ", "tale", "head"],
  "ಥ": ["ರಥ", "ratha", "chariot"], "ದ": ["ದನ", "dana", "cow"], "ಧ": ["ಧ್ವಜ", "dhvaja", "flag"], "ನ": ["ನವಿಲು", "navilu", "peacock"],
  "ಪ": ["ಪುಸ್ತಕ", "pustaka", "book"], "ಫ": ["ಫಲ", "phala", "fruit"], "ಬ": ["ಬಸ್ಸು", "bassu", "bus"], "ಭ": ["ಭೂಮಿ", "bhuumi", "earth"],
  "ಮ": ["ಮರ", "mara", "tree"], "ಯ": ["ಯಂತ್ರ", "yantra", "machine"], "ರ": ["ರಾಜ", "raaja", "king"], "ಲ": ["ಲಡ್ಡು", "laDDu", "laddu"],
  "ವ": ["ವೀಣೆ", "viiNe", "veena"], "ಶ": ["ಶಂಖ", "shankha", "conch"], "ಷ": ["ವೇಷ", "veesha", "costume"], "ಸ": ["ಸಿಂಹ", "simha", "lion"],
  "ಹ": ["ಹಸು", "hasu", "cow"], "ಳ": ["ಬಾಳೆ", "baaLe", "banana"],
};
export const SOUND = {
  "ಅ": "a", "ಆ": "aa", "ಇ": "i", "ಈ": "ii", "ಉ": "u", "ಊ": "uu", "ಋ": "ru", "ಎ": "e", "ಏ": "ee", "ಐ": "ai", "ಒ": "o", "ಓ": "oo", "ಔ": "au", "ಅಂ": "am", "ಅಃ": "aha",
  "ಕ": "ka", "ಖ": "kha", "ಗ": "ga", "ಘ": "gha", "ಙ": "nga", "ಚ": "cha", "ಛ": "chha", "ಜ": "ja", "ಝ": "jha", "ಞ": "nya",
  "ಟ": "Ta", "ಠ": "Tha", "ಡ": "Da", "ಢ": "Dha", "ಣ": "Na", "ತ": "ta", "ಥ": "tha", "ದ": "da", "ಧ": "dha", "ನ": "na",
  "ಪ": "pa", "ಫ": "pha", "ಬ": "ba", "ಭ": "bha", "ಮ": "ma", "ಯ": "ya", "ರ": "ra", "ಲ": "la", "ವ": "va", "ಶ": "sha", "ಷ": "Sha", "ಸ": "sa", "ಹ": "ha", "ಳ": "La",
};

export const SIGNS = [["ಾ", "aa"], ["ಿ", "i"], ["ೀ", "ii"], ["ು", "u"], ["ೂ", "uu"], ["ೃ", "ru"], ["ೆ", "e"], ["ೇ", "ee"], ["ೈ", "ai"], ["ೊ", "o"], ["ೋ", "oo"], ["ೌ", "au"], ["ಂ", "am"], ["ಃ", "aha"]];
export const KAG_GRID_CONS = ["ಕ", "ಗ", "ತ", "ದ", "ನ", "ಪ", "ಬ", "ಮ", "ರ", "ಲ", "ಸ"];
const kag = (c, signs) => signs.map((s) => c + s);

// Script units: what the child learns to write in a packet.
// kind: letters | signs | joined | spelling | words
const U = {
  V1: { kind: "letters", en: "Vowels ಅ to ಈ", items: ["ಅ", "ಆ", "ಇ", "ಈ"] },
  V2: { kind: "letters", en: "Vowels ಉ to ಎ", items: ["ಉ", "ಊ", "ಋ", "ಎ"] },
  V3: { kind: "letters", en: "Vowels ಏ to ಓ", items: ["ಏ", "ಐ", "ಒ", "ಓ"] },
  V4: { kind: "letters", en: "Vowels ಔ, ಅಂ, ಅಃ", items: ["ಔ", "ಅಂ", "ಅಃ"], review: ["ಅ", "ಇ", "ಉ", "ಎ", "ಒ"] },
  C1: { kind: "letters", en: "Consonants ಕ ಖ ಗ ಘ ಙ", items: ["ಕ", "ಖ", "ಗ", "ಘ", "ಙ"] },
  C2: { kind: "letters", en: "Consonants ಚ ಛ ಜ ಝ ಞ", items: ["ಚ", "ಛ", "ಜ", "ಝ", "ಞ"] },
  C3: { kind: "letters", en: "Consonants ಟ ಠ ಡ ಢ ಣ", items: ["ಟ", "ಠ", "ಡ", "ಢ", "ಣ"] },
  C4: { kind: "letters", en: "Consonants ತ ಥ ದ ಧ ನ", items: ["ತ", "ಥ", "ದ", "ಧ", "ನ"] },
  C5: { kind: "letters", en: "Consonants ಪ ಫ ಬ ಭ ಮ", items: ["ಪ", "ಫ", "ಬ", "ಭ", "ಮ"] },
  C6: { kind: "letters", en: "Consonants ಯ ರ ಲ ವ", items: ["ಯ", "ರ", "ಲ", "ವ"] },
  C7: { kind: "letters", en: "Consonants ಶ ಷ ಸ ಹ ಳ", items: ["ಶ", "ಷ", "ಸ", "ಹ", "ಳ"] },
  V12: { kind: "letters", en: "Vowels ಅ to ಎ", items: ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ಎ"] },
  V34: { kind: "letters", en: "Vowels ಏ to ಅಃ", items: ["ಏ", "ಐ", "ಒ", "ಓ", "ಔ", "ಅಂ", "ಅಃ"] },
  C12: { kind: "letters", en: "Consonants ಕ to ಞ", items: ["ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ"] },
  C34: { kind: "letters", en: "Consonants ಟ to ನ", items: ["ಟ", "ಠ", "ಡ", "ಢ", "ಣ", "ತ", "ಥ", "ದ", "ಧ", "ನ"] },
  C56: { kind: "letters", en: "Consonants ಪ to ವ", items: ["ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಲ", "ವ"] },
  K1: { kind: "signs", en: "Vowel signs ಾ ಿ ೀ", signs: ["ಾ", "ಿ", "ೀ"], items: ["ಕಾ", "ಕಿ", "ಕೀ", "ಮಾ", "ಮಿ", "ಮೀ"], words: ["ಮಾವು", "ಗಿಳಿ", "ಮೀನು", "ನೀರು"] },
  K2: { kind: "signs", en: "Vowel signs ು ೂ ೃ", signs: ["ು", "ೂ", "ೃ"], items: ["ಕು", "ಕೂ", "ಕೃ", "ಹು", "ಹೂ", "ಮೃ"], words: ["ಹುಲಿ", "ಹೂವು", "ಮೂಗು", "ಕೃಷಿ"] },
  K3: { kind: "signs", en: "Vowel signs ೆ ೇ ೈ", signs: ["ೆ", "ೇ", "ೈ"], items: ["ಕೆ", "ಕೇ", "ಕೈ", "ಮೆ", "ಮೇ", "ಬೈ"], words: ["ಮನೆ", "ಸೇಬು", "ಕೈ", "ಬೆಕ್ಕು"] },
  K4: { kind: "signs", en: "Vowel signs ೊ ೋ ೌ ಂ ಃ", signs: ["ೊ", "ೋ", "ೌ", "ಂ", "ಃ"], items: ["ಕೊ", "ಕೋ", "ಕೌ", "ಕಂ", "ಗೊಂ", "ದುಃ"], words: ["ಕೋತಿ", "ಗೊಂಬೆ", "ಮೌನ", "ಚೆಂಡು"] },
  K12: { kind: "signs", en: "Vowel signs ಾ to ೃ", signs: ["ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೃ"], items: ["ಕಾ", "ಕಿ", "ಕೀ", "ಕು", "ಕೂ", "ಕೃ"], words: ["ಮೀನು", "ಹೂವು", "ಗಿಳಿ", "ಕೃಷಿ"] },
  K34: { kind: "signs", en: "Vowel signs ೆ to ಃ", signs: ["ೆ", "ೇ", "ೈ", "ೊ", "ೋ", "ೌ", "ಂ", "ಃ"], items: ["ಕೆ", "ಕೇ", "ಕೈ", "ಕೊ", "ಕೋ", "ಕೌ"], words: ["ಸೇಬು", "ಕೋತಿ", "ಮೌನ", "ಗೊಂಬೆ"] },
  O1: { kind: "joined", en: "Joined letters: doubles", items: ["ಕ್ಕ", "ತ್ತ", "ಪ್ಪ", "ಮ್ಮ", "ನ್ನ", "ಲ್ಲ"], words: ["ಅಕ್ಕ", "ಹತ್ತು", "ಅಪ್ಪ", "ಅಮ್ಮ", "ಅನ್ನ", "ಹಲ್ಲು"] },
  O2: { kind: "joined", en: "Joined letters: mixed", items: ["ಸ್ತ", "ಪ್ರ", "ತ್ರ", "ಕ್ಷ", "ಶ್ರ", "ರ್ಯ"], words: ["ಪುಸ್ತಕ", "ಪ್ರಾಣಿ", "ರಾತ್ರಿ", "ಕ್ಷಮಿಸಿ", "ಶ್ರಮ", "ಸೂರ್ಯ"] },
  S1: { kind: "spelling", en: "Spelling: short and long vowels", items: ["ಹುಲಿ", "ಹೂವು", "ಇಲಿ", "ಈಜು", "ಎಲೆ", "ಏಣಿ"], tip: "Short sounds get a short sign, long sounds a long one: ಹು (hu) and ಹೂ (huu)." },
  S2: { kind: "spelling", en: "Spelling: ಲ or ಳ, ನ or ಣ", items: ["ಬಾಲ", "ಬಾಳೆ", "ಹಲ್ಲು", "ಹಳ್ಳಿ", "ಮನೆ", "ಹಣ"], tip: "ಳ and ಣ are said with the tongue curled back. Say the word slowly before you write it." },
  S3: { kind: "spelling", en: "Spelling: soft and breathy letters", items: ["ಕಥೆ", "ಖುಷಿ", "ದನ", "ಧ್ವಜ", "ಬಾಗಿಲು", "ಭಯ"], tip: "Breathy letters (ಖ ಧ ಭ) have a puff of air. Hold a hand in front of your mouth to feel it." },
  W: { kind: "words", en: "Writing this week's words" },
};

const PLAN = {
  gentle: ["V1", "V2", "V3", "V4", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "K1", "K2", "K3", "K4", "O1", "O2", "S1"],
  steady: ["V12", "V34", "C12", "C34", "C56", "C7", "K1", "K2", "K3", "K4", "O1", "O2", "S1", "S2", "S3", "W", "W", "W"],
  review: ["K12", "K34", "O1", "O2", "S1", "S2", "S3", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
};

// ---------- Sentence patterns ----------
// model: [kannada, romanised, english]; build/ladder: [kannada, english]; blanks: [with ___, answer]
export const PATTERNS = [
  {
    id: "this", en: "This is, that is", kn: "ಇದು / ಅದು", focus: "Naming things",
    model: [["ಇದು ಪುಸ್ತಕ.", "idu pustaka.", "This is a book."], ["ಅದು ಮರ.", "adu mara.", "That is a tree."], ["ಇದು ನನ್ನ ಚೀಲ.", "idu nanna chiila.", "This is my bag."], ["ಇದು ಏನು?", "idu eenu?", "What is this?"]],
    build: [["ಇದು ನನ್ನ ಮನೆ.", "This is my house."], ["ಅದು ದೊಡ್ಡ ಮರ.", "That is a big tree."], ["ಇದು ಅಮ್ಮನ ಚೀಲ.", "This is Amma's bag."]],
    ladder: [["ಇದು ಮನೆ.", "This is a house."], ["ಇದು ನನ್ನ ಮನೆ.", "This is my house."], ["ಇದು ನನ್ನ ದೊಡ್ಡ ಮನೆ.", "This is my big house."], ["ಇದು ನನ್ನ ದೊಡ್ಡ ಹಳದಿ ಮನೆ.", "This is my big yellow house."]],
    blanks: [["ಇದು ___.", "ಪುಸ್ತಕ"], ["___ ಮರ.", "ಅದು"], ["ಇದು ನನ್ನ ___.", "ಚೀಲ"]],
    words: [["ಪುಸ್ತಕ", "pustaka", "book", "📖"], ["ಮರ", "mara", "tree", "🌳"], ["ಚೀಲ", "chiila", "bag", "🎒"], ["ಮನೆ", "mane", "house", "🏠"], ["ಚೆಂಡು", "chenDu", "ball", "⚽"], ["ಲೋಟ", "looTa", "cup", "🥛"]],
    prompts: { start: "Point at 5 things at home and say ಇದು ___ for each.", write: "Write 4 sentences about things in your room: ಇದು ___ and ಅದು ___.", long: "Describe your room in 5 sentences, each at least 4 words long." },
    dictation: ["ಇದು ನನ್ನ ಪುಸ್ತಕ.", "ಅದು ಅಪ್ಪನ ಕಾರು.", "ಇದು ಏನು?"],
  },
  {
    id: "me", en: "All about me", kn: "ನನ್ನ ಹೆಸರು", focus: "Introducing yourself",
    model: [["ನನ್ನ ಹೆಸರು ಅನು.", "nanna hesaru Anu.", "My name is Anu."], ["ನನಗೆ ಏಳು ವರ್ಷ.", "nanage eeLu varsha.", "I am seven."], ["ನಾನು ಎರಡನೇ ತರಗತಿಯಲ್ಲಿ ಓದುತ್ತೇನೆ.", "naanu eraDanee taragatiyalli oodutteene.", "I study in second grade."], ["ನನ್ನ ಊರು ಶಿಕಾಗೋ.", "nanna uuru Shikaago.", "My town is Chicago."]],
    build: [["ನನ್ನ ಹೆಸರು ರವಿ.", "My name is Ravi."], ["ನನಗೆ ಎಂಟು ವರ್ಷ.", "I am eight."], ["ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.", "I go to school."]],
    ladder: [["ನಾನು ಓದುತ್ತೇನೆ.", "I read."], ["ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ.", "I read a book."], ["ನಾನು ಪ್ರತಿದಿನ ಪುಸ್ತಕ ಓದುತ್ತೇನೆ.", "I read a book every day."], ["ನಾನು ಪ್ರತಿದಿನ ರಾತ್ರಿ ಕನ್ನಡ ಪುಸ್ತಕ ಓದುತ್ತೇನೆ.", "I read a Kannada book every night."]],
    blanks: [["ನನ್ನ ___ ಅನು.", "ಹೆಸರು"], ["ನನಗೆ ಏಳು ___.", "ವರ್ಷ"], ["ನಾನು ___ ಹೋಗುತ್ತೇನೆ.", "ಶಾಲೆಗೆ"]],
    words: [["ಹೆಸರು", "hesaru", "name", "🏷️"], ["ವರ್ಷ", "varsha", "year", "🎂"], ["ಶಾಲೆ", "shaale", "school", "🏫"], ["ಊರು", "uuru", "town", "🏙️"], ["ತರಗತಿ", "taragati", "class", "🧑‍🏫"], ["ಗೆಳೆಯ", "geLeya", "friend", "🧒"]],
    prompts: { start: "Say 3 sentences about yourself: your name, your age, your school.", write: "Write your introduction: name, age, class and town.", long: "Write 6 sentences introducing yourself and your best friend." },
    dictation: ["ನನ್ನ ಗೆಳೆಯನ ಹೆಸರು ರವಿ.", "ನಾನು ಶಾಲೆಗೆ ಬಸ್ಸಿನಲ್ಲಿ ಹೋಗುತ್ತೇನೆ."],
  },
  {
    id: "like", en: "I like, I don't like", kn: "ಇಷ್ಟ / ಇಷ್ಟ ಇಲ್ಲ", focus: "Likes and dislikes",
    model: [["ನನಗೆ ಮಾವಿನ ಹಣ್ಣು ಇಷ್ಟ.", "nanage maavina haNNu ishTa.", "I like mangoes."], ["ನನಗೆ ಹಾಗಲಕಾಯಿ ಇಷ್ಟ ಇಲ್ಲ.", "nanage haagalakaayi ishTa illa.", "I don't like bitter gourd."], ["ನಿನಗೆ ಏನು ಇಷ್ಟ?", "ninage eenu ishTa?", "What do you like?"], ["ಅವನಿಗೆ ಕ್ರಿಕೆಟ್ ತುಂಬಾ ಇಷ್ಟ.", "avanige krikeT tumbaa ishTa.", "He likes cricket a lot."]],
    build: [["ನನಗೆ ದೋಸೆ ಇಷ್ಟ.", "I like dosa."], ["ನನಗೆ ಹಾಲು ಇಷ್ಟ ಇಲ್ಲ.", "I don't like milk."], ["ಅಕ್ಕನಿಗೆ ಹಾಡು ತುಂಬಾ ಇಷ್ಟ.", "Akka likes singing a lot."]],
    ladder: [["ನನಗೆ ಹಣ್ಣು ಇಷ್ಟ.", "I like fruit."], ["ನನಗೆ ಮಾವಿನ ಹಣ್ಣು ಇಷ್ಟ.", "I like mangoes."], ["ನನಗೆ ಮಾವಿನ ಹಣ್ಣು ತುಂಬಾ ಇಷ್ಟ.", "I like mangoes a lot."], ["ನನಗೆ ಬೇಸಿಗೆಯಲ್ಲಿ ಮಾವಿನ ಹಣ್ಣು ತುಂಬಾ ಇಷ್ಟ.", "In summer I like mangoes a lot."]],
    blanks: [["ನನಗೆ ___ ಇಷ್ಟ.", "ದೋಸೆ"], ["ನಿನಗೆ ಏನು ___?", "ಇಷ್ಟ"], ["ನನಗೆ ಹಾಲು ಇಷ್ಟ ___.", "ಇಲ್ಲ"]],
    words: [["ಮಾವು", "maavu", "mango", "🥭"], ["ದೋಸೆ", "doose", "dosa", "🫓"], ["ಹಾಲು", "haalu", "milk", "🥛"], ["ಹಾಡು", "haaDu", "song", "🎵"], ["ಆಟ", "aaTa", "game", "🎲"], ["ತುಂಬಾ", "tumbaa", "a lot", "💯"]],
    prompts: { start: "Say 3 things you like and 1 you don't.", write: "Write 3 sentences with ಇಷ್ಟ and 2 with ಇಷ್ಟ ಇಲ್ಲ.", long: "Ask two family members what they like and write 5 sentences about it (ಅಮ್ಮನಿಗೆ..., ಅಪ್ಪನಿಗೆ...)." },
    dictation: ["ನನಗೆ ಮಳೆ ಇಷ್ಟ.", "ತಮ್ಮನಿಗೆ ಹಾಲು ಇಷ್ಟ ಇಲ್ಲ.", "ನಿನಗೆ ಯಾವ ಬಣ್ಣ ಇಷ್ಟ?"],
  },
  {
    id: "where", en: "Where is it?", kn: "ಎಲ್ಲಿದೆ?", focus: "On, under, inside, near",
    model: [["ಬೆಕ್ಕು ಎಲ್ಲಿದೆ?", "bekku ellide?", "Where is the cat?"], ["ಬೆಕ್ಕು ಮೇಜಿನ ಕೆಳಗೆ ಇದೆ.", "bekku meejina keLage ide.", "The cat is under the table."], ["ಪುಸ್ತಕ ಚೀಲದ ಒಳಗೆ ಇದೆ.", "pustaka chiilada oLage ide.", "The book is inside the bag."], ["ಚೆಂಡು ಕುರ್ಚಿಯ ಮೇಲೆ ಇದೆ.", "chenDu kurchiya meele ide.", "The ball is on the chair."]],
    build: [["ಬೆಕ್ಕು ಮೇಜಿನ ಕೆಳಗೆ ಇದೆ.", "The cat is under the table."], ["ಹಾಲು ಲೋಟದ ಒಳಗೆ ಇದೆ.", "The milk is in the cup."], ["ನನ್ನ ಚಪ್ಪಲಿ ಎಲ್ಲಿದೆ?", "Where are my sandals?"]],
    ladder: [["ಚೆಂಡು ಇದೆ.", "There is a ball."], ["ಚೆಂಡು ಮಂಚದ ಕೆಳಗೆ ಇದೆ.", "The ball is under the bed."], ["ಕೆಂಪು ಚೆಂಡು ಮಂಚದ ಕೆಳಗೆ ಇದೆ.", "The red ball is under the bed."], ["ನನ್ನ ಕೆಂಪು ಚೆಂಡು ಮಂಚದ ಕೆಳಗೆ ಇದೆ.", "My red ball is under the bed."]],
    blanks: [["ಬೆಕ್ಕು ಮೇಜಿನ ___ ಇದೆ.", "ಕೆಳಗೆ"], ["ಪುಸ್ತಕ ___?", "ಎಲ್ಲಿದೆ"], ["ಹಕ್ಕಿ ಮರದ ___ ಇದೆ.", "ಮೇಲೆ"]],
    words: [["ಮೇಲೆ", "meele", "on top", "⬆️"], ["ಕೆಳಗೆ", "keLage", "under", "⬇️"], ["ಒಳಗೆ", "oLage", "inside", "📦"], ["ಹೊರಗೆ", "horage", "outside", "🚪"], ["ಹತ್ತಿರ", "hattira", "near", "📍"], ["ಮೇಜು", "meeju", "table", "🪵"]],
    prompts: { start: "Hide a toy. Ask ___ ಎಲ್ಲಿದೆ? and answer with ಮೇಲೆ, ಕೆಳಗೆ or ಒಳಗೆ.", write: "Draw your room and write 4 sentences about where things are.", long: "Write directions from your bedroom to the kitchen in 5 sentences (ಬಲಕ್ಕೆ right, ಎಡಕ್ಕೆ left, ನೇರವಾಗಿ straight)." },
    dictation: ["ನನ್ನ ಚೀಲ ಬಾಗಿಲಿನ ಹತ್ತಿರ ಇದೆ.", "ಹಕ್ಕಿ ಮರದ ಮೇಲೆ ಇದೆ."],
  },
  {
    id: "have", en: "I have, how many?", kn: "ನನ್ನ ಹತ್ತಿರ ___ ಇದೆ", focus: "Having and counting",
    model: [["ನನ್ನ ಹತ್ತಿರ ಒಂದು ನಾಯಿ ಇದೆ.", "nanna hattira ondu naayi ide.", "I have a dog."], ["ನನ್ನ ಹತ್ತಿರ ಐದು ಪುಸ್ತಕಗಳು ಇವೆ.", "nanna hattira aidu pustakagaLu ive.", "I have five books."], ["ನಿನ್ನ ಹತ್ತಿರ ಎಷ್ಟು ಬಣ್ಣಗಳು ಇವೆ?", "ninna hattira eshTu baNNagaLu ive?", "How many colours do you have?"], ["ನನ್ನ ಹತ್ತಿರ ಬೆಕ್ಕು ಇಲ್ಲ.", "nanna hattira bekku illa.", "I don't have a cat."]],
    build: [["ನನ್ನ ಹತ್ತಿರ ಎರಡು ಚೆಂಡುಗಳು ಇವೆ.", "I have two balls."], ["ಅಕ್ಕನ ಹತ್ತಿರ ಸೈಕಲ್ ಇದೆ.", "Akka has a bicycle."], ["ನಿನ್ನ ಹತ್ತಿರ ಎಷ್ಟು ಪುಸ್ತಕಗಳು ಇವೆ?", "How many books do you have?"]],
    ladder: [["ನನ್ನ ಹತ್ತಿರ ಗೊಂಬೆ ಇದೆ.", "I have a doll."], ["ನನ್ನ ಹತ್ತಿರ ಒಂದು ಗೊಂಬೆ ಇದೆ.", "I have one doll."], ["ನನ್ನ ಹತ್ತಿರ ಒಂದು ದೊಡ್ಡ ಗೊಂಬೆ ಇದೆ.", "I have one big doll."], ["ನನ್ನ ಹತ್ತಿರ ಅಜ್ಜಿ ಕೊಟ್ಟ ಒಂದು ದೊಡ್ಡ ಗೊಂಬೆ ಇದೆ.", "I have a big doll that Ajji gave me."]],
    blanks: [["ನನ್ನ ___ ಒಂದು ನಾಯಿ ಇದೆ.", "ಹತ್ತಿರ"], ["ನನ್ನ ಹತ್ತಿರ ಮೂರು ಪುಸ್ತಕಗಳು ___.", "ಇವೆ"], ["ನಿನ್ನ ಹತ್ತಿರ ___ ಬಣ್ಣಗಳು ಇವೆ?", "ಎಷ್ಟು"]],
    words: [["ಒಂದು", "ondu", "one", "1️⃣"], ["ಎರಡು", "eraDu", "two", "2️⃣"], ["ಮೂರು", "muuru", "three", "3️⃣"], ["ನಾಲ್ಕು", "naalku", "four", "4️⃣"], ["ಐದು", "aidu", "five", "5️⃣"], ["ಎಷ್ಟು", "eshTu", "how many", "❓"]],
    prompts: { start: "Count 5 things at home in Kannada: ಒಂದು ಚಮಚ, ಎರಡು ಚಮಚ...", write: "Write 4 sentences about what you have. Use ಇದೆ for one thing and ಇವೆ for many.", long: "Write 6 sentences about your school bag: what is in it and how many." },
    dictation: ["ನನ್ನ ಹತ್ತಿರ ನಾಲ್ಕು ಪುಸ್ತಕಗಳು ಇವೆ.", "ಅಣ್ಣನ ಹತ್ತಿರ ಹೊಸ ಸೈಕಲ್ ಇದೆ."],
  },
  {
    id: "do", en: "I do", kn: "ನಾನು ___ತ್ತೇನೆ", focus: "Action words, now",
    model: [["ನಾನು ಹಾಲು ಕುಡಿಯುತ್ತೇನೆ.", "naanu haalu kuDiyutteene.", "I drink milk."], ["ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ.", "naanu pustaka oodutteene.", "I read a book."], ["ನಾನು ಚೆಂಡು ಆಡುತ್ತೇನೆ.", "naanu chenDu aaDutteene.", "I play ball."], ["ನೀನು ಏನು ಮಾಡುತ್ತೀಯೆ?", "niinu eenu maaDuttiiye?", "What do you do?"]],
    build: [["ನಾನು ದೋಸೆ ತಿನ್ನುತ್ತೇನೆ.", "I eat dosa."], ["ನಾನು ಬೆಳಿಗ್ಗೆ ಹಲ್ಲು ಉಜ್ಜುತ್ತೇನೆ.", "I brush my teeth in the morning."], ["ನಾನು ಅಮ್ಮನ ಜೊತೆ ಆಡುತ್ತೇನೆ.", "I play with Amma."]],
    ladder: [["ನಾನು ಆಡುತ್ತೇನೆ.", "I play."], ["ನಾನು ಚೆಂಡು ಆಡುತ್ತೇನೆ.", "I play ball."], ["ನಾನು ಸಂಜೆ ಚೆಂಡು ಆಡುತ್ತೇನೆ.", "I play ball in the evening."], ["ನಾನು ಸಂಜೆ ಗೆಳೆಯರ ಜೊತೆ ಉದ್ಯಾನದಲ್ಲಿ ಚೆಂಡು ಆಡುತ್ತೇನೆ.", "In the evening I play ball in the park with friends."]],
    blanks: [["ನಾನು ಹಾಲು ___.", "ಕುಡಿಯುತ್ತೇನೆ"], ["ನಾನು ಪುಸ್ತಕ ___.", "ಓದುತ್ತೇನೆ"], ["___ ಚೆಂಡು ಆಡುತ್ತೇನೆ.", "ನಾನು"]],
    words: [["ತಿನ್ನು", "tinnu", "eat", "🍽️"], ["ಕುಡಿ", "kuDi", "drink", "🥤"], ["ಓದು", "oodu", "read", "📖"], ["ಬರೆ", "bare", "write", "✏️"], ["ಆಡು", "aaDu", "play", "⚽"], ["ಮಲಗು", "malagu", "sleep", "😴"]],
    prompts: { start: "Act it out: a grown-up says an action, you mime it and say ನಾನು ___ತ್ತೇನೆ.", write: "Write 5 things you do every day.", long: "Write your whole day in 6 to 8 sentences, from waking up to bedtime." },
    dictation: ["ನಾನು ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಹಾಲು ಕುಡಿಯುತ್ತೇನೆ.", "ನಾನು ರಾತ್ರಿ ಕಥೆ ಓದುತ್ತೇನೆ."],
  },
  {
    id: "they", en: "He, she, they", kn: "ಅವನು / ಅವಳು / ಅವರು", focus: "Talking about others",
    model: [["ಅವನು ಓಡುತ್ತಾನೆ.", "avanu ooDuttaane.", "He runs."], ["ಅವಳು ಹಾಡುತ್ತಾಳೆ.", "avaLu haaDuttaaLe.", "She sings."], ["ಅವರು ಊಟ ಮಾಡುತ್ತಾರೆ.", "avaru uuTa maaDuttaare.", "They eat."], ["ನಾಯಿ ಬೊಗಳುತ್ತದೆ.", "naayi bogaLuttade.", "The dog barks."]],
    build: [["ಅಕ್ಕ ನೃತ್ಯ ಮಾಡುತ್ತಾಳೆ.", "Akka dances."], ["ಅಪ್ಪ ಕಾರು ಓಡಿಸುತ್ತಾರೆ.", "Appa drives the car."], ["ಬೆಕ್ಕು ಹಾಲು ಕುಡಿಯುತ್ತದೆ.", "The cat drinks milk."]],
    ladder: [["ಅವನು ಓಡುತ್ತಾನೆ.", "He runs."], ["ಅವನು ವೇಗವಾಗಿ ಓಡುತ್ತಾನೆ.", "He runs fast."], ["ನನ್ನ ಅಣ್ಣ ವೇಗವಾಗಿ ಓಡುತ್ತಾನೆ.", "My big brother runs fast."], ["ನನ್ನ ಅಣ್ಣ ಮೈದಾನದಲ್ಲಿ ತುಂಬಾ ವೇಗವಾಗಿ ಓಡುತ್ತಾನೆ.", "My big brother runs very fast on the field."]],
    blanks: [["ಅವಳು ___.", "ಹಾಡುತ್ತಾಳೆ"], ["___ ಓಡುತ್ತಾನೆ.", "ಅವನು"], ["ನಾಯಿ ___.", "ಬೊಗಳುತ್ತದೆ"]],
    words: [["ಅವನು", "avanu", "he", "👦"], ["ಅವಳು", "avaLu", "she", "👧"], ["ಅವರು", "avaru", "they", "👨‍👩‍👧"], ["ಅದು", "adu", "it", "🐶"], ["ಓಡು", "ooDu", "run", "🏃"], ["ಹಾಡು", "haaDu", "sing", "🎤"]],
    prompts: { start: "Look at family photos and say what each person does: ಅಪ್ಪ ..., ಅಮ್ಮ ...", write: "Write one sentence for each person in your family. Watch the endings: -ಆನೆ, -ಆಳೆ, -ಆರೆ, -ಅದೆ.", long: "Write 6 sentences about what everyone at home does on a Sunday." },
    dictation: ["ಅಜ್ಜಿ ದೇವರ ಹಾಡು ಹಾಡುತ್ತಾರೆ.", "ನನ್ನ ತಂಗಿ ಚಿತ್ರ ಬಿಡಿಸುತ್ತಾಳೆ."],
  },
  {
    id: "ask", en: "Asking questions", kn: "ಏನು? ಯಾರು? ಎಲ್ಲಿ?", focus: "Question words",
    model: [["ಇವರು ಯಾರು?", "ivaru yaaru?", "Who is this?"], ["ಶಾಲೆ ಎಲ್ಲಿದೆ?", "shaale ellide?", "Where is the school?"], ["ನಿನ್ನ ಹುಟ್ಟುಹಬ್ಬ ಯಾವಾಗ?", "ninna huTTuhabba yaavaaga?", "When is your birthday?"], ["ನೀನು ಹೇಗಿದ್ದೀಯ?", "niinu heegiddiiya?", "How are you?"]],
    build: [["ನಿನ್ನ ಹೆಸರು ಏನು?", "What is your name?"], ["ನಿನ್ನ ಶಾಲೆ ಎಲ್ಲಿದೆ?", "Where is your school?"], ["ನಿನಗೆ ಯಾವ ಹಣ್ಣು ಇಷ್ಟ?", "Which fruit do you like?"]],
    ladder: [["ನೀನು ಬರುತ್ತೀಯಾ?", "Will you come?"], ["ನೀನು ನಾಳೆ ಬರುತ್ತೀಯಾ?", "Will you come tomorrow?"], ["ನೀನು ನಾಳೆ ನಮ್ಮ ಮನೆಗೆ ಬರುತ್ತೀಯಾ?", "Will you come to our house tomorrow?"], ["ನೀನು ನಾಳೆ ಸಂಜೆ ನಮ್ಮ ಮನೆಗೆ ಆಟ ಆಡಲು ಬರುತ್ತೀಯಾ?", "Will you come to our house tomorrow evening to play?"]],
    blanks: [["ನಿನ್ನ ಹೆಸರು ___?", "ಏನು"], ["ಇವರು ___?", "ಯಾರು"], ["ನಿನ್ನ ಹುಟ್ಟುಹಬ್ಬ ___?", "ಯಾವಾಗ"]],
    words: [["ಏನು", "eenu", "what", "❓"], ["ಯಾರು", "yaaru", "who", "🧑"], ["ಎಲ್ಲಿ", "elli", "where", "📍"], ["ಯಾವಾಗ", "yaavaaga", "when", "⏰"], ["ಏಕೆ", "eeke", "why", "🤔"], ["ಹೇಗೆ", "heege", "how", "🛠️"]],
    prompts: { start: "Play a question game: ask a grown-up questions with ಏನು, ಯಾರು and ಎಲ್ಲಿ.", write: "Write 5 questions to ask your grandparents, one with each question word.", long: "Interview a grandparent: write 5 questions and their answers in full sentences." },
    dictation: ["ನಿನ್ನ ಅಜ್ಜಿಯ ಊರು ಯಾವುದು?", "ನೀನು ಏಕೆ ತಡವಾಗಿ ಬಂದೆ?"],
  },
  {
    id: "past", en: "Yesterday I...", kn: "ನಿನ್ನೆ ನಾನು ___ದೆ", focus: "Talking about the past",
    model: [["ನಿನ್ನೆ ನಾನು ಉದ್ಯಾನಕ್ಕೆ ಹೋದೆ.", "ninne naanu udyaanakke hoode.", "Yesterday I went to the park."], ["ನಾನು ಇಡ್ಲಿ ತಿಂದೆ.", "naanu iDli tinde.", "I ate idli."], ["ನಾವು ಸಿನಿಮಾ ನೋಡಿದೆವು.", "naavu sinimaa nooDidevu.", "We watched a movie."], ["ಅವನು ಮನೆಗೆ ಬಂದನು.", "avanu manege bandanu.", "He came home."]],
    build: [["ನಿನ್ನೆ ನಾನು ಆಟ ಆಡಿದೆ.", "Yesterday I played a game."], ["ನಾವು ಅಜ್ಜಿಯ ಮನೆಗೆ ಹೋದೆವು.", "We went to Ajji's house."], ["ಅವಳು ಒಂದು ಚಿತ್ರ ಬಿಡಿಸಿದಳು.", "She drew a picture."]],
    ladder: [["ನಾನು ಹೋದೆ.", "I went."], ["ನಾನು ಅಂಗಡಿಗೆ ಹೋದೆ.", "I went to the shop."], ["ನಿನ್ನೆ ನಾನು ಅಂಗಡಿಗೆ ಹೋದೆ.", "Yesterday I went to the shop."], ["ನಿನ್ನೆ ಸಂಜೆ ನಾನು ಅಪ್ಪನ ಜೊತೆ ಅಂಗಡಿಗೆ ಹೋದೆ.", "Yesterday evening I went to the shop with Appa."]],
    blanks: [["ನಿನ್ನೆ ನಾನು ಶಾಲೆಗೆ ___.", "ಹೋದೆ"], ["ನಾನು ದೋಸೆ ___.", "ತಿಂದೆ"], ["___ ನಾವು ಸಿನಿಮಾ ನೋಡಿದೆವು.", "ನಿನ್ನೆ"]],
    words: [["ನಿನ್ನೆ", "ninne", "yesterday", "⏪"], ["ಹೋದೆ", "hoode", "went", "🚶"], ["ಬಂದೆ", "bande", "came", "🏠"], ["ತಿಂದೆ", "tinde", "ate", "🍛"], ["ನೋಡಿದೆ", "nooDide", "saw", "👀"], ["ಆಡಿದೆ", "aaDide", "played", "⚽"]],
    prompts: { start: "At dinner, say 2 things you did today: ನಾನು ___ದೆ.", write: "Write 5 sentences about what you did last weekend.", long: "Write a diary page about your best day this month, 7 to 8 sentences in the past tense." },
    dictation: ["ನಿನ್ನೆ ಜೋರಾಗಿ ಮಳೆ ಬಂತು.", "ನಾವು ಮನೆಯಲ್ಲಿ ಆಟ ಆಡಿದೆವು."],
  },
  {
    id: "want", en: "Tomorrow, and what I want", kn: "ನಾಳೆ / ಬೇಕು", focus: "Plans and wants",
    model: [["ನಾಳೆ ನಾನು ಈಜಲು ಹೋಗುತ್ತೇನೆ.", "naaLe naanu iijalu hoogutteene.", "Tomorrow I will go swimming."], ["ನನಗೆ ನೀರು ಬೇಕು.", "nanage niiru beeku.", "I want water."], ["ನನಗೆ ಹೊಸ ಪುಸ್ತಕ ಬೇಡ.", "nanage hosa pustaka beeDa.", "I don't want a new book."], ["ನಿನಗೆ ಏನು ಬೇಕು?", "ninage eenu beeku?", "What do you want?"]],
    build: [["ನನಗೆ ಇನ್ನೊಂದು ದೋಸೆ ಬೇಕು.", "I want one more dosa."], ["ನಾಳೆ ನಾವು ಊರಿಗೆ ಹೋಗುತ್ತೇವೆ.", "Tomorrow we will go to our hometown."], ["ನನಗೆ ಈಗ ಹಾಲು ಬೇಡ.", "I don't want milk now."]],
    ladder: [["ನಾನು ಹೋಗುತ್ತೇನೆ.", "I will go."], ["ನಾಳೆ ನಾನು ಹೋಗುತ್ತೇನೆ.", "Tomorrow I will go."], ["ನಾಳೆ ನಾನು ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗುತ್ತೇನೆ.", "Tomorrow I will go to the library."], ["ನಾಳೆ ನಾನು ಹೊಸ ಪುಸ್ತಕ ತರಲು ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗುತ್ತೇನೆ.", "Tomorrow I will go to the library to get a new book."]],
    blanks: [["ನನಗೆ ನೀರು ___.", "ಬೇಕು"], ["___ ನಾನು ಈಜಲು ಹೋಗುತ್ತೇನೆ.", "ನಾಳೆ"], ["ನಿನಗೆ ಏನು ___?", "ಬೇಕು"]],
    words: [["ನಾಳೆ", "naaLe", "tomorrow", "⏩"], ["ಬೇಕು", "beeku", "want", "✅"], ["ಬೇಡ", "beeDa", "don't want", "❌"], ["ಹೊಸ", "hosa", "new", "✨"], ["ಈಗ", "iiga", "now", "⏱️"], ["ಗ್ರಂಥಾಲಯ", "granthaalaya", "library", "📚"]],
    prompts: { start: "At meals, ask for things in Kannada only: ನನಗೆ ___ ಬೇಕು.", write: "Write your plan for tomorrow in 5 sentences.", long: "Write a letter to a friend about your holiday plans, 8 sentences." },
    dictation: ["ನಾಳೆ ನಮ್ಮ ಶಾಲೆಗೆ ರಜೆ.", "ನನಗೆ ಒಂದು ಹೊಸ ಚೀಲ ಬೇಕು."],
  },
  {
    id: "describe", en: "Describing things", kn: "ದೊಡ್ಡ, ಚಿಕ್ಕ, ಸುಂದರ", focus: "Describing words",
    model: [["ಆನೆ ದೊಡ್ಡದು.", "aane doDDadu.", "The elephant is big."], ["ಇರುವೆ ಚಿಕ್ಕದು.", "iruve chikkadu.", "The ant is small."], ["ಈ ಹೂವು ಕೆಂಪಾಗಿದೆ.", "ii huuvu kempaagide.", "This flower is red."], ["ಇಂದು ತುಂಬಾ ಚಳಿ ಇದೆ.", "indu tumbaa chaLi ide.", "It is very cold today."]],
    build: [["ಆಕಾಶ ನೀಲಿಯಾಗಿದೆ.", "The sky is blue."], ["ಈ ಮಾವಿನ ಹಣ್ಣು ಸಿಹಿಯಾಗಿದೆ.", "This mango is sweet."], ["ನನ್ನ ಬೆಕ್ಕು ಮೃದುವಾಗಿದೆ.", "My cat is soft."]],
    ladder: [["ಹುಲಿ ಇದೆ.", "There is a tiger."], ["ದೊಡ್ಡ ಹುಲಿ ಇದೆ.", "There is a big tiger."], ["ಕಾಡಿನಲ್ಲಿ ಒಂದು ದೊಡ್ಡ ಹುಲಿ ಇದೆ.", "There is a big tiger in the forest."], ["ಕಾಡಿನಲ್ಲಿ ಹಳದಿ ಮತ್ತು ಕಪ್ಪು ಪಟ್ಟೆಗಳ ಒಂದು ದೊಡ್ಡ ಹುಲಿ ಇದೆ.", "In the forest there is a big tiger with yellow and black stripes."]],
    blanks: [["ಆನೆ ___.", "ದೊಡ್ಡದು"], ["ಆಕಾಶ ___.", "ನೀಲಿಯಾಗಿದೆ"], ["ಈ ಹಣ್ಣು ___.", "ಸಿಹಿಯಾಗಿದೆ"]],
    words: [["ದೊಡ್ಡ", "doDDa", "big", "🐘"], ["ಚಿಕ್ಕ", "chikka", "small", "🐜"], ["ಸಿಹಿ", "sihi", "sweet", "🍬"], ["ಬಿಸಿ", "bisi", "hot", "🔥"], ["ಚಳಿ", "chaLi", "cold", "🥶"], ["ಸುಂದರ", "sundara", "beautiful", "🌸"]],
    prompts: { start: "Describe 4 things you see: say the colour and the size.", write: "Write 5 sentences describing your favourite animal.", long: "Describe a picture from a book in 6 sentences with at least 8 describing words." },
    dictation: ["ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಒಂದು ಎತ್ತರದ ಮರ ಇದೆ.", "ಅದರ ಹೂವುಗಳು ಹಳದಿಯಾಗಿವೆ."],
  },
  {
    id: "cases", en: "To, from, in, with", kn: "-ಗೆ, -ಇಂದ, -ಅಲ್ಲಿ, ಜೊತೆ", focus: "Word endings that show direction",
    model: [["ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.", "naanu shaalege hoogutteene.", "I go to school."], ["ಅಪ್ಪ ಕಚೇರಿಯಿಂದ ಬರುತ್ತಾರೆ.", "appa kacheeriyinda baruttaare.", "Appa comes from the office."], ["ಮೀನು ನೀರಿನಲ್ಲಿ ಇರುತ್ತದೆ.", "miinu niirinalli iruttade.", "Fish live in water."], ["ನಾನು ತಂಗಿಯ ಜೊತೆ ಆಡುತ್ತೇನೆ.", "naanu tangiya jote aaDutteene.", "I play with my little sister."]],
    build: [["ನಾವು ಬಸ್ಸಿನಲ್ಲಿ ಊರಿಗೆ ಹೋದೆವು.", "We went to town by bus."], ["ಅಜ್ಜಿ ಭಾರತದಿಂದ ಬಂದರು.", "Ajji came from India."], ["ನಾನು ಅಮ್ಮನಿಗೆ ಹೂವು ಕೊಟ್ಟೆ.", "I gave Amma a flower."]],
    ladder: [["ನಾನು ಹೋಗುತ್ತೇನೆ.", "I go."], ["ನಾನು ಮನೆಗೆ ಹೋಗುತ್ತೇನೆ.", "I go home."], ["ನಾನು ಶಾಲೆಯಿಂದ ಮನೆಗೆ ಹೋಗುತ್ತೇನೆ.", "I go home from school."], ["ನಾನು ಗೆಳೆಯನ ಜೊತೆ ಬಸ್ಸಿನಲ್ಲಿ ಶಾಲೆಯಿಂದ ಮನೆಗೆ ಹೋಗುತ್ತೇನೆ.", "I go home from school by bus with my friend."]],
    blanks: [["ನಾನು ಶಾಲೆ___ ಹೋಗುತ್ತೇನೆ.", "ಗೆ"], ["ಮೀನು ನೀರಿನ___ ಇರುತ್ತದೆ.", "ಲ್ಲಿ"], ["ಅಪ್ಪ ಕಚೇರಿ___ ಬರುತ್ತಾರೆ.", "ಯಿಂದ"]],
    words: [["ಮನೆಗೆ", "manege", "to home", "🏠"], ["ಶಾಲೆಯಿಂದ", "shaaleyinda", "from school", "🏫"], ["ನೀರಿನಲ್ಲಿ", "niirinalli", "in water", "🐟"], ["ಜೊತೆ", "jote", "with", "🤝"], ["ಬಸ್ಸಿನಲ್ಲಿ", "bassinalli", "on the bus", "🚌"], ["ಭಾರತ", "bhaarata", "India", "🇮🇳"]],
    prompts: { start: "Say where you go each day: ನಾನು ___ಗೆ ಹೋಗುತ್ತೇನೆ.", write: "Write 6 sentences: two with -ಗೆ, two with -ಇಂದ and two with -ಅಲ್ಲಿ.", long: "Write about a trip in 8 sentences: where from, where to, how, with whom and what was there." },
    dictation: ["ನಾವು ಬೇಸಿಗೆಯಲ್ಲಿ ವಿಮಾನದಲ್ಲಿ ಬೆಂಗಳೂರಿಗೆ ಹೋದೆವು.", "ಅಜ್ಜ ನಮಗೆ ಊರಿನಿಂದ ಹಲಸಿನ ಹಣ್ಣು ತಂದರು."],
  },
  {
    id: "and", en: "And, but, or", kn: "ಮತ್ತು / ಆದರೆ / ಅಥವಾ", focus: "Joining two ideas",
    model: [["ನನಗೆ ಹಾಲು ಮತ್ತು ಬಿಸ್ಕತ್ತು ಇಷ್ಟ.", "nanage haalu mattu biskattu ishTa.", "I like milk and biscuits."], ["ನನಗೆ ಈಜು ಇಷ್ಟ, ಆದರೆ ನೀರು ತಣ್ಣಗಿದೆ.", "nanage iiju ishTa, aadare niiru taNNagide.", "I like swimming, but the water is cold."], ["ನಿನಗೆ ಟೀ ಬೇಕಾ ಅಥವಾ ಕಾಫಿ ಬೇಕಾ?", "ninage Tii beekaa athavaa kaaphi beekaa?", "Do you want tea or coffee?"], ["ಅಕ್ಕ ಹಾಡುತ್ತಾಳೆ ಮತ್ತು ನಾನು ಕುಣಿಯುತ್ತೇನೆ.", "akka haaDuttaaLe mattu naanu kuNiyutteene.", "Akka sings and I dance."]],
    build: [["ಅಮ್ಮ ಮತ್ತು ಅಪ್ಪ ಊಟ ಮಾಡುತ್ತಾರೆ.", "Amma and Appa are eating."], ["ನಾನು ಓಡಿದೆ, ಆದರೆ ಬಿದ್ದೆ.", "I ran, but I fell."], ["ನಿನಗೆ ಹಾಲು ಬೇಕಾ ಅಥವಾ ನೀರು ಬೇಕಾ?", "Do you want milk or water?"]],
    ladder: [["ನಾನು ಆಡಿದೆ.", "I played."], ["ನಾನು ಆಡಿದೆ ಮತ್ತು ಓದಿದೆ.", "I played and read."], ["ನಾನು ಉದ್ಯಾನದಲ್ಲಿ ಆಡಿದೆ ಮತ್ತು ಮನೆಯಲ್ಲಿ ಓದಿದೆ.", "I played in the park and read at home."], ["ನಾನು ಉದ್ಯಾನದಲ್ಲಿ ಆಡಿದೆ, ಆದರೆ ಮನೆಯಲ್ಲಿ ಓದಲಿಲ್ಲ.", "I played in the park, but I didn't read at home."]],
    blanks: [["ನನಗೆ ಹಾಲು ___ ಬಿಸ್ಕತ್ತು ಇಷ್ಟ.", "ಮತ್ತು"], ["ನಾನು ಓಡಿದೆ, ___ ಬಿದ್ದೆ.", "ಆದರೆ"], ["ಟೀ ಬೇಕಾ ___ ಕಾಫಿ ಬೇಕಾ?", "ಅಥವಾ"]],
    words: [["ಮತ್ತು", "mattu", "and", "➕"], ["ಆದರೆ", "aadare", "but", "↔️"], ["ಅಥವಾ", "athavaa", "or", "🔀"], ["ಬಿಸ್ಕತ್ತು", "biskattu", "biscuit", "🍪"], ["ಕುಣಿ", "kuNi", "dance", "💃"], ["ಬಿದ್ದೆ", "bidde", "fell", "🤕"]],
    prompts: { start: "Join two things you like with ಮತ್ತು.", write: "Join 4 pairs of sentences with ಮತ್ತು or ಆದರೆ.", long: "Write 6 long sentences, each joining two ideas with ಮತ್ತು, ಆದರೆ or ಅಥವಾ." },
    dictation: ["ನನಗೆ ಕ್ರಿಕೆಟ್ ಇಷ್ಟ, ಆದರೆ ಇಂದು ಮಳೆ ಬರುತ್ತಿದೆ.", "ಅಮ್ಮ ಮತ್ತು ನಾನು ಅಂಗಡಿಗೆ ಹೋದೆವು."],
  },
  {
    id: "because", en: "Because, so", kn: "ಏಕೆಂದರೆ / ಆದ್ದರಿಂದ", focus: "Giving reasons",
    model: [["ನಾನು ಜಾಕೆಟ್ ಹಾಕಿದೆ, ಏಕೆಂದರೆ ಚಳಿ ಇತ್ತು.", "naanu jaakeT haakide, eekendare chaLi ittu.", "I wore a jacket because it was cold."], ["ನನಗೆ ಹಸಿವಾಗಿತ್ತು, ಆದ್ದರಿಂದ ನಾನು ಊಟ ಮಾಡಿದೆ.", "nanage hasivaagittu, aaddarinda naanu uuTa maaDide.", "I was hungry, so I ate."], ["ನೀನು ಏಕೆ ತಡವಾಗಿ ಬಂದೆ?", "niinu eeke taDavaagi bande?", "Why did you come late?"], ["ಏಕೆಂದರೆ ಬಸ್ಸು ತಡವಾಗಿ ಬಂತು.", "eekendare bassu taDavaagi bantu.", "Because the bus came late."]],
    build: [["ನಾನು ಬೇಗ ಮಲಗಿದೆ, ಏಕೆಂದರೆ ನನಗೆ ಸುಸ್ತಾಗಿತ್ತು.", "I slept early because I was tired."], ["ಮಳೆ ಬಂತು, ಆದ್ದರಿಂದ ನಾವು ಮನೆಯಲ್ಲಿ ಆಡಿದೆವು.", "It rained, so we played at home."], ["ಅವಳು ಅಳುತ್ತಿದ್ದಾಳೆ, ಏಕೆಂದರೆ ಅವಳ ಗೊಂಬೆ ಮುರಿಯಿತು.", "She is crying because her doll broke."]],
    ladder: [["ನಾನು ನೀರು ಕುಡಿದೆ.", "I drank water."], ["ನಾನು ತುಂಬಾ ನೀರು ಕುಡಿದೆ.", "I drank a lot of water."], ["ನಾನು ತುಂಬಾ ನೀರು ಕುಡಿದೆ, ಏಕೆಂದರೆ ಬಿಸಿಲು ಇತ್ತು.", "I drank a lot of water because it was sunny."], ["ಆಟದ ನಂತರ ನಾನು ತುಂಬಾ ನೀರು ಕುಡಿದೆ, ಏಕೆಂದರೆ ಹೊರಗೆ ತುಂಬಾ ಬಿಸಿಲು ಇತ್ತು.", "After the game I drank a lot of water because it was very sunny outside."]],
    blanks: [["ನಾನು ಊಟ ಮಾಡಿದೆ, ___ ಹಸಿವಾಗಿತ್ತು.", "ಏಕೆಂದರೆ"], ["ಮಳೆ ಬಂತು, ___ ನಾವು ಒಳಗೆ ಆಡಿದೆವು.", "ಆದ್ದರಿಂದ"], ["ನೀನು ___ ತಡವಾಗಿ ಬಂದೆ?", "ಏಕೆ"]],
    words: [["ಏಕೆಂದರೆ", "eekendare", "because", "💡"], ["ಆದ್ದರಿಂದ", "aaddarinda", "so", "➡️"], ["ಹಸಿವು", "hasivu", "hunger", "🤤"], ["ಸುಸ್ತು", "sustu", "tired", "😴"], ["ಮಳೆ", "maLe", "rain", "🌧️"], ["ಬಿಸಿಲು", "bisilu", "sunshine", "☀️"]],
    prompts: { start: "A grown-up asks 3 ಏಕೆ? questions. Answer each with ಏಕೆಂದರೆ...", write: "Write 4 sentences with ಏಕೆಂದರೆ and 2 with ಆದ್ದರಿಂದ.", long: "Write 6 sentences about your favourite season and why. Use ಏಕೆಂದರೆ and ಆದ್ದರಿಂದ." },
    dictation: ["ಇಂದು ನಾನು ಶಾಲೆಗೆ ಹೋಗಲಿಲ್ಲ, ಏಕೆಂದರೆ ನನಗೆ ಜ್ವರ ಇತ್ತು."],
  },
  {
    id: "then", en: "First, then, finally", kn: "ಮೊದಲು / ಆಮೇಲೆ / ಕೊನೆಗೆ", focus: "Putting things in order",
    model: [["ಮೊದಲು ನಾನು ಹಲ್ಲು ಉಜ್ಜುತ್ತೇನೆ.", "modalu naanu hallu ujjutteene.", "First I brush my teeth."], ["ಆಮೇಲೆ ಸ್ನಾನ ಮಾಡುತ್ತೇನೆ.", "aameele snaana maaDutteene.", "Then I take a bath."], ["ತಿಂಡಿಯ ನಂತರ ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.", "tinDiya nantara shaalege hoogutteene.", "After breakfast I go to school."], ["ಕೊನೆಗೆ ರಾತ್ರಿ ಮಲಗುತ್ತೇನೆ.", "konege raatri malagutteene.", "Finally, at night, I sleep."]],
    build: [["ಮೊದಲು ನಾನು ಕೈ ತೊಳೆಯುತ್ತೇನೆ.", "First I wash my hands."], ["ಆಮೇಲೆ ನಾವು ಊಟ ಮಾಡುತ್ತೇವೆ.", "Then we eat."], ["ಕೊನೆಗೆ ಅಮ್ಮ ಕಥೆ ಹೇಳುತ್ತಾರೆ.", "Finally Amma tells a story."]],
    ladder: [["ನಾನು ತಿಂಡಿ ತಿನ್ನುತ್ತೇನೆ.", "I eat breakfast."], ["ಸ್ನಾನದ ನಂತರ ನಾನು ತಿಂಡಿ ತಿನ್ನುತ್ತೇನೆ.", "After my bath I eat breakfast."], ["ಸ್ನಾನದ ನಂತರ ನಾನು ಅಮ್ಮ ಮಾಡಿದ ತಿಂಡಿ ತಿನ್ನುತ್ತೇನೆ.", "After my bath I eat the breakfast Amma made."], ["ಸ್ನಾನದ ನಂತರ ನಾನು ಅಮ್ಮ ಮಾಡಿದ ಬಿಸಿ ಬಿಸಿ ಉಪ್ಪಿಟ್ಟು ತಿನ್ನುತ್ತೇನೆ.", "After my bath I eat the piping hot uppittu Amma made."]],
    blanks: [["___ ನಾನು ಹಲ್ಲು ಉಜ್ಜುತ್ತೇನೆ.", "ಮೊದಲು"], ["ತಿಂಡಿಯ ___ ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.", "ನಂತರ"], ["___ ನಾನು ಮಲಗುತ್ತೇನೆ.", "ಕೊನೆಗೆ"]],
    words: [["ಮೊದಲು", "modalu", "first", "1️⃣"], ["ಆಮೇಲೆ", "aameele", "then", "➡️"], ["ನಂತರ", "nantara", "after", "⏭️"], ["ಕೊನೆಗೆ", "konege", "finally", "🏁"], ["ಸ್ನಾನ", "snaana", "bath", "🛁"], ["ತಿಂಡಿ", "tinDi", "breakfast", "🥞"]],
    prompts: { start: "Tell how to make a sandwich in 3 steps: ಮೊದಲು, ಆಮೇಲೆ, ಕೊನೆಗೆ.", write: "Write your morning in 5 sentences with ಮೊದಲು, ಆಮೇಲೆ, ನಂತರ and ಕೊನೆಗೆ.", long: "Write 8 steps for something you can make: a recipe, a craft or a game." },
    dictation: ["ಮೊದಲು ಹಾಲು ಕಾಯಿಸಬೇಕು.", "ಆಮೇಲೆ ಅದಕ್ಕೆ ಸಕ್ಕರೆ ಹಾಕಬೇಕು."],
  },
  {
    id: "can", en: "I can, I must", kn: "ಬರುತ್ತದೆ / ___ಬೇಕು", focus: "Ability and rules",
    model: [["ನನಗೆ ಈಜಲು ಬರುತ್ತದೆ.", "nanage iijalu baruttade.", "I can swim."], ["ನನಗೆ ಸೈಕಲ್ ಓಡಿಸಲು ಬರುವುದಿಲ್ಲ.", "nanage saikal ooDisalu baruvudilla.", "I can't ride a bicycle."], ["ನಾನು ಈಗ ಓದಬೇಕು.", "naanu iiga oodabeeku.", "I must study now."], ["ನಾವು ಗಿಡಕ್ಕೆ ನೀರು ಹಾಕಬೇಕು.", "naavu giDakke niiru haakabeeku.", "We must water the plant."]],
    build: [["ನನಗೆ ಕನ್ನಡ ಓದಲು ಬರುತ್ತದೆ.", "I can read Kannada."], ["ನಾವು ಬೇಗ ಮಲಗಬೇಕು.", "We must sleep early."], ["ತಮ್ಮನಿಗೆ ಇನ್ನೂ ಬರೆಯಲು ಬರುವುದಿಲ್ಲ.", "My little brother can't write yet."]],
    ladder: [["ನಾನು ಓದಬೇಕು.", "I must read."], ["ನಾನು ಕನ್ನಡ ಓದಬೇಕು.", "I must read Kannada."], ["ನಾನು ಪ್ರತಿದಿನ ಹತ್ತು ನಿಮಿಷ ಕನ್ನಡ ಓದಬೇಕು.", "I must read Kannada for ten minutes every day."], ["ಕಥೆ ಅರ್ಥವಾಗಲು ನಾನು ಪ್ರತಿದಿನ ಹತ್ತು ನಿಮಿಷ ಕನ್ನಡ ಓದಬೇಕು.", "To understand stories, I must read Kannada for ten minutes every day."]],
    blanks: [["ನನಗೆ ಈಜಲು ___.", "ಬರುತ್ತದೆ"], ["ನಾವು ಗಿಡಕ್ಕೆ ನೀರು ___.", "ಹಾಕಬೇಕು"], ["ನನಗೆ ಸೈಕಲ್ ಓಡಿಸಲು ___.", "ಬರುವುದಿಲ್ಲ"]],
    words: [["ಬರುತ್ತದೆ", "baruttade", "can", "👍"], ["ಬರುವುದಿಲ್ಲ", "baruvudilla", "can't", "👎"], ["ಬೇಕು", "beeku", "must", "✅"], ["ಈಜು", "iiju", "swim", "🏊"], ["ಸೈಕಲ್", "saikal", "bicycle", "🚲"], ["ಗಿಡ", "giDa", "plant", "🌱"]],
    prompts: { start: "Say 3 things you can do and 1 you can't do yet.", write: "Write 3 things you can do, 2 you can't do yet, and 2 rules at home (___ಬೇಕು).", long: "Write 'Rules for a new puppy' or 'Rules for our class' in 8 sentences." },
    dictation: ["ನನಗೆ ಚೆನ್ನಾಗಿ ಚಿತ್ರ ಬಿಡಿಸಲು ಬರುತ್ತದೆ.", "ರಸ್ತೆ ದಾಟುವಾಗ ಎಡ ಬಲ ನೋಡಬೇಕು."],
  },
  {
    id: "person", en: "A paragraph about someone", kn: "ನನ್ನ ಅಚ್ಚುಮೆಚ್ಚಿನ ವ್ಯಕ್ತಿ", focus: "Writing a paragraph",
    model: [["ನನ್ನ ಅಚ್ಚುಮೆಚ್ಚಿನ ವ್ಯಕ್ತಿ ನನ್ನ ಅಜ್ಜಿ.", "nanna achchumechchina vyakti nanna ajji.", "My favourite person is my grandmother."], ["ಅವರು ಮೈಸೂರಿನಲ್ಲಿ ಇರುತ್ತಾರೆ.", "avaru maisuurinalli iruttaare.", "She lives in Mysuru."], ["ಅವರು ರುಚಿಯಾದ ಅಡುಗೆ ಮಾಡುತ್ತಾರೆ.", "avaru ruchiyaada aDuge maaDuttaare.", "She cooks tasty food."], ["ನನಗೆ ಅಜ್ಜಿ ಎಂದರೆ ತುಂಬಾ ಪ್ರೀತಿ.", "nanage ajji endare tumbaa priiti.", "I love Ajji very much."]],
    build: [["ಅವರು ನನಗೆ ಕಥೆ ಹೇಳುತ್ತಾರೆ.", "She tells me stories."], ["ನನ್ನ ಅಜ್ಜಿ ಮೈಸೂರಿನಲ್ಲಿ ಇರುತ್ತಾರೆ.", "My grandmother lives in Mysuru."], ["ನಾವು ಜೊತೆಯಾಗಿ ತೋಟದಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ.", "We work in the garden together."]],
    ladder: [["ಅಜ್ಜ ನಡೆಯುತ್ತಾರೆ.", "Ajja walks."], ["ಅಜ್ಜ ಬೆಳಿಗ್ಗೆ ನಡೆಯುತ್ತಾರೆ.", "Ajja walks in the morning."], ["ಅಜ್ಜ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಉದ್ಯಾನದಲ್ಲಿ ನಡೆಯುತ್ತಾರೆ.", "Ajja walks in the park every morning."], ["ನನ್ನ ಅಜ್ಜ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ನನ್ನ ಜೊತೆ ಉದ್ಯಾನದಲ್ಲಿ ನಡೆಯುತ್ತಾರೆ.", "Every morning my grandfather walks with me in the park."]],
    blanks: [["ನನ್ನ ___ ವ್ಯಕ್ತಿ ನನ್ನ ಅಜ್ಜಿ.", "ಅಚ್ಚುಮೆಚ್ಚಿನ"], ["ಅವರು ಮೈಸೂರಿನಲ್ಲಿ ___.", "ಇರುತ್ತಾರೆ"], ["ಅವರು ___ ಅಡುಗೆ ಮಾಡುತ್ತಾರೆ.", "ರುಚಿಯಾದ"]],
    words: [["ಅಚ್ಚುಮೆಚ್ಚಿನ", "achchumechchina", "favourite", "⭐"], ["ವ್ಯಕ್ತಿ", "vyakti", "person", "🧑"], ["ಪ್ರೀತಿ", "priiti", "love", "❤️"], ["ರುಚಿ", "ruchi", "taste", "😋"], ["ಜೊತೆಯಾಗಿ", "joteyaagi", "together", "🤝"], ["ತೋಟ", "tooTa", "garden", "🌿"]],
    prompts: { start: "Tell a grown-up 4 sentences about your favourite person.", write: "Write a paragraph of 5 sentences about your favourite person: who, where they live, what they do, and why you love them.", long: "Write 2 paragraphs (10 sentences) about a person you admire. Start by saying who, end by saying why." },
    dictation: ["ನನ್ನ ಅಜ್ಜ ಪ್ರತಿದಿನ ಪತ್ರಿಕೆ ಓದುತ್ತಾರೆ.", "ಅವರು ನನಗೆ ಚೆಸ್ ಆಡಲು ಕಲಿಸಿದರು."],
  },
  {
    id: "story", en: "Telling a story", kn: "ಒಂದು ಊರಿನಲ್ಲಿ...", focus: "Beginning, middle and end",
    model: [["ಒಂದು ಊರಿನಲ್ಲಿ ಒಬ್ಬ ಹುಡುಗ ಇದ್ದನು.", "ondu uurinalli obba huDuga iddanu.", "In a village there was a boy."], ["ಒಂದು ದಿನ ಅವನು ಕಾಡಿಗೆ ಹೋದನು.", "ondu dina avanu kaaDige hoodanu.", "One day he went to the forest."], ["ಅಲ್ಲಿ ಅವನು ಒಂದು ಮರಿ ಆನೆಯನ್ನು ನೋಡಿದನು.", "alli avanu ondu mari aaneyannu nooDidanu.", "There he saw a baby elephant."], ["ಕೊನೆಗೆ ಅವರು ಗೆಳೆಯರಾದರು.", "konege avaru geLeyaraadaru.", "In the end they became friends."]],
    build: [["ಒಂದು ದಿನ ಅವಳು ಕಾಡಿಗೆ ಹೋದಳು.", "One day she went to the forest."], ["ಅಲ್ಲಿ ಒಂದು ನರಿ ಇತ್ತು.", "There was a fox there."], ["ಕೊನೆಗೆ ಎಲ್ಲರೂ ಸಂತೋಷವಾಗಿ ಇದ್ದರು.", "In the end everyone was happy."]],
    ladder: [["ಹುಡುಗಿ ಹೋದಳು.", "The girl went."], ["ಹುಡುಗಿ ನದಿಗೆ ಹೋದಳು.", "The girl went to the river."], ["ಒಂದು ದಿನ ಹುಡುಗಿ ನದಿಗೆ ಹೋದಳು.", "One day the girl went to the river."], ["ಒಂದು ದಿನ ಬೆಳಿಗ್ಗೆ ಪುಟ್ಟ ಹುಡುಗಿ ನೀರು ತರಲು ನದಿಗೆ ಹೋದಳು.", "One morning the little girl went to the river to fetch water."]],
    blanks: [["ಒಂದು ___ ಒಬ್ಬ ಹುಡುಗ ಇದ್ದನು.", "ಊರಿನಲ್ಲಿ"], ["ಒಂದು ___ ಅವನು ಕಾಡಿಗೆ ಹೋದನು.", "ದಿನ"], ["___ ಅವರು ಗೆಳೆಯರಾದರು.", "ಕೊನೆಗೆ"]],
    words: [["ಊರು", "uuru", "village", "🏘️"], ["ದಿನ", "dina", "day", "📅"], ["ಕಾಡು", "kaaDu", "forest", "🌳"], ["ನರಿ", "nari", "fox", "🦊"], ["ನದಿ", "nadi", "river", "🏞️"], ["ಸಂತೋಷ", "santoosha", "happiness", "😊"]],
    prompts: { start: "Tell a 4-sentence story with a grown-up: ಒಂದು ಊರಿನಲ್ಲಿ... ಒಂದು ದಿನ... ಆಮೇಲೆ... ಕೊನೆಗೆ...", write: "Write a 6-sentence story using ಒಂದು ಊರಿನಲ್ಲಿ, ಒಂದು ದಿನ, ಆಮೇಲೆ and ಕೊನೆಗೆ.", long: "Write your own story of 12 or more sentences, with a title, a problem and an ending. Read it aloud at the meet." },
    dictation: ["ಒಂದು ಕಾಡಿನಲ್ಲಿ ಒಂದು ಜಾಣ ನರಿ ಇತ್ತು.", "ಅದಕ್ಕೆ ತುಂಬಾ ಹಸಿವಾಗಿತ್ತು."],
  },
];

// Writing projects: the last five packets of the Longer sentences path.
export const PROJECTS = [
  {
    id: "letter", en: "Project: a letter home", kn: "ಪತ್ರ", focus: "Writing a real letter", project: true,
    model: [["ಪ್ರೀತಿಯ ಅಜ್ಜಿಗೆ ನಮಸ್ಕಾರ.", "priitiya ajjige namaskaara.", "Dear Ajji, namaskara."], ["ನಾನು ಇಲ್ಲಿ ಚೆನ್ನಾಗಿದ್ದೇನೆ.", "naanu illi chennaagiddeene.", "I am well here."], ["ನೀವು ಹೇಗಿದ್ದೀರಿ?", "niivu heegiddiiri?", "How are you?"], ["ಇಂತಿ ನಿಮ್ಮ ಪ್ರೀತಿಯ ಮೊಮ್ಮಗಳು, ಅನು.", "inti nimma priitiya mommagaLu, Anu.", "Your loving granddaughter, Anu."]],
    build: [["ನಾನು ಇಲ್ಲಿ ಚೆನ್ನಾಗಿದ್ದೇನೆ.", "I am well here."], ["ನೀವು ಹೇಗಿದ್ದೀರಿ?", "How are you?"], ["ನಿಮ್ಮನ್ನು ನೋಡಲು ಕಾಯುತ್ತಿದ್ದೇನೆ.", "I'm waiting to see you."]],
    ladder: [["ನಾನು ಬರುತ್ತೇನೆ.", "I will come."], ["ನಾನು ಭಾರತಕ್ಕೆ ಬರುತ್ತೇನೆ.", "I will come to India."], ["ಮುಂದಿನ ಬೇಸಿಗೆಯಲ್ಲಿ ನಾನು ಭಾರತಕ್ಕೆ ಬರುತ್ತೇನೆ.", "Next summer I will come to India."], ["ಮುಂದಿನ ಬೇಸಿಗೆಯಲ್ಲಿ ನಾನು ಅಮ್ಮ ಅಪ್ಪನ ಜೊತೆ ನಿಮ್ಮನ್ನು ನೋಡಲು ಭಾರತಕ್ಕೆ ಬರುತ್ತೇನೆ.", "Next summer I will come to India with Amma and Appa to see you."]],
    blanks: [["___ ಅಜ್ಜಿಗೆ ನಮಸ್ಕಾರ.", "ಪ್ರೀತಿಯ"], ["ನೀವು ___?", "ಹೇಗಿದ್ದೀರಿ"], ["___ ನಿಮ್ಮ ಪ್ರೀತಿಯ ಮೊಮ್ಮಗ.", "ಇಂತಿ"]],
    words: [["ಪ್ರೀತಿಯ", "priitiya", "dear", "💌"], ["ಪತ್ರ", "patra", "letter", "✉️"], ["ಮೊಮ್ಮಗ", "mommaga", "grandson", "👦"], ["ಮೊಮ್ಮಗಳು", "mommagaLu", "granddaughter", "👧"], ["ಚೆನ್ನಾಗಿ", "chennaagi", "well", "👍"], ["ಇಂತಿ", "inti", "yours", "✍️"]],
    prompts: { long: "Write a real letter to a grandparent or relative in India: a greeting, 6 sentences of news, one question, and a sign-off. Post it, or send them a photo!" },
    dictation: ["ಇಲ್ಲಿ ಈಗ ತುಂಬಾ ಚಳಿ ಇದೆ.", "ನಾನು ಕನ್ನಡ ಬರೆಯಲು ಕಲಿಯುತ್ತಿದ್ದೇನೆ."],
  },
  {
    id: "news", en: "Project: be a reporter", kn: "ಸುದ್ದಿ", focus: "What, where, when, who", project: true,
    model: [["ನಿನ್ನೆ ನಮ್ಮ ಶಾಲೆಯಲ್ಲಿ ಕ್ರೀಡಾ ದಿನ ನಡೆಯಿತು.", "ninne namma shaaleyalli kriiDaa dina naDeyitu.", "Yesterday our school held sports day."], ["ಎಲ್ಲಾ ಮಕ್ಕಳು ಓಟದಲ್ಲಿ ಭಾಗವಹಿಸಿದರು.", "ellaa makkaLu ooTadalli bhaagavahisidaru.", "All the children took part in the race."], ["ನನ್ನ ಗೆಳತಿ ಮೊದಲ ಬಹುಮಾನ ಗೆದ್ದಳು.", "nanna geLati modala bahumaana geddaLu.", "My friend won first prize."], ["ಎಲ್ಲರಿಗೂ ತುಂಬಾ ಖುಷಿಯಾಯಿತು.", "ellarigu tumbaa khushiyaayitu.", "Everyone was very happy."]],
    build: [["ನಿನ್ನೆ ಶಾಲೆಯಲ್ಲಿ ಕ್ರೀಡಾ ದಿನ ನಡೆಯಿತು.", "Yesterday there was sports day at school."], ["ನನ್ನ ಗೆಳತಿ ಬಹುಮಾನ ಗೆದ್ದಳು.", "My friend won a prize."], ["ಎಲ್ಲರಿಗೂ ತುಂಬಾ ಖುಷಿಯಾಯಿತು.", "Everyone was very happy."]],
    ladder: [["ಮಕ್ಕಳು ಓಡಿದರು.", "The children ran."], ["ಮಕ್ಕಳು ವೇಗವಾಗಿ ಓಡಿದರು.", "The children ran fast."], ["ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಮಕ್ಕಳು ವೇಗವಾಗಿ ಓಡಿದರು.", "The children ran fast on the school field."], ["ಕ್ರೀಡಾ ದಿನದಂದು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಎಲ್ಲಾ ಮಕ್ಕಳು ತುಂಬಾ ವೇಗವಾಗಿ ಓಡಿದರು.", "On sports day all the children ran very fast on the school field."]],
    blanks: [["ನಿನ್ನೆ ಕ್ರೀಡಾ ದಿನ ___.", "ನಡೆಯಿತು"], ["ನನ್ನ ಗೆಳತಿ ___ ಗೆದ್ದಳು.", "ಬಹುಮಾನ"], ["ಎಲ್ಲರಿಗೂ ತುಂಬಾ ___.", "ಖುಷಿಯಾಯಿತು"]],
    words: [["ಸುದ್ದಿ", "suddi", "news", "📰"], ["ನಡೆಯಿತು", "naDeyitu", "took place", "📅"], ["ಬಹುಮಾನ", "bahumaana", "prize", "🏆"], ["ಗೆದ್ದಳು", "geddaLu", "she won", "🥇"], ["ಮಕ್ಕಳು", "makkaLu", "children", "🧒"], ["ಖುಷಿ", "khushi", "happy", "😊"]],
    prompts: { long: "Be a reporter: write an 8-sentence news story about something that happened at home, at school or in town. Answer what, where, when, who and how." },
    dictation: ["ಇಂದು ನಮ್ಮ ಊರಿನಲ್ಲಿ ಮೊದಲ ಹಿಮ ಬಿತ್ತು.", "ಮಕ್ಕಳು ಹಿಮದ ಮನುಷ್ಯನನ್ನು ಮಾಡಿದರು."],
  },
  {
    id: "compare", en: "Project: comparing", kn: "ಹೋಲಿಕೆ (-ಗಿಂತ)", focus: "Bigger than, faster than", project: true,
    model: [["ಆನೆ ಕುದುರೆಗಿಂತ ದೊಡ್ಡದು.", "aane kudureginta doDDadu.", "An elephant is bigger than a horse."], ["ಚಿರತೆ ಎಲ್ಲಾ ಪ್ರಾಣಿಗಳಿಗಿಂತ ವೇಗವಾಗಿ ಓಡುತ್ತದೆ.", "chirate ellaa praaNigaLiginta veegavaagi ooDuttade.", "The cheetah runs faster than all animals."], ["ನನಗೆ ಬೇಸಿಗೆಗಿಂತ ಚಳಿಗಾಲ ಇಷ್ಟ.", "nanage beesigeginta chaLigaala ishTa.", "I like winter more than summer."], ["ಅಕ್ಕ ನನಗಿಂತ ಎತ್ತರ.", "akka nanaginta ettara.", "Akka is taller than me."]],
    build: [["ಅಣ್ಣ ನನಗಿಂತ ಎತ್ತರ.", "My big brother is taller than me."], ["ಬಸ್ಸು ಕಾರಿಗಿಂತ ದೊಡ್ಡದು.", "A bus is bigger than a car."], ["ನನಗೆ ಹಾಲಿಗಿಂತ ಜ್ಯೂಸ್ ಇಷ್ಟ.", "I like juice more than milk."]],
    ladder: [["ಬೆಕ್ಕು ಚಿಕ್ಕದು.", "The cat is small."], ["ಬೆಕ್ಕು ನಾಯಿಗಿಂತ ಚಿಕ್ಕದು.", "The cat is smaller than the dog."], ["ನಮ್ಮ ಬೆಕ್ಕು ಪಕ್ಕದ ಮನೆಯ ನಾಯಿಗಿಂತ ಚಿಕ್ಕದು.", "Our cat is smaller than the neighbour's dog."], ["ನಮ್ಮ ಬೆಕ್ಕು ಪಕ್ಕದ ಮನೆಯ ನಾಯಿಗಿಂತ ಚಿಕ್ಕದು, ಆದರೆ ಅದಕ್ಕಿಂತ ಜೋರಾಗಿ ಕೂಗುತ್ತದೆ.", "Our cat is smaller than the neighbour's dog, but it is louder."]],
    blanks: [["ಆನೆ ಕುದುರೆ___ ದೊಡ್ಡದು.", "ಗಿಂತ"], ["ಅಕ್ಕ ನನಗಿಂತ ___.", "ಎತ್ತರ"], ["ಆಮೆ ಮೊಲಕ್ಕಿಂತ ___ ನಡೆಯುತ್ತದೆ.", "ನಿಧಾನವಾಗಿ"]],
    words: [["ಗಿಂತ", "ginta", "than", "⚖️"], ["ಎತ್ತರ", "ettara", "tall", "🦒"], ["ಗಿಡ್ಡ", "giDDa", "short", "📏"], ["ವೇಗ", "veega", "fast", "🐆"], ["ನಿಧಾನ", "nidhaana", "slow", "🐢"], ["ಭಾರ", "bhaara", "heavy", "🏋️"]],
    prompts: { long: "Compare two places you know (here and India, or two cities) in 8 sentences. Use -ಗಿಂತ, ಆದರೆ and ಏಕೆಂದರೆ." },
    dictation: ["ಶಿಕಾಗೋ ಬೆಂಗಳೂರಿಗಿಂತ ತುಂಬಾ ಚಳಿ.", "ಆದರೆ ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮಳೆ ಹೆಚ್ಚು."],
  },
  {
    id: "festival", en: "Project: our festival", kn: "ನಮ್ಮ ಹಬ್ಬ", focus: "Before, during and after", project: true,
    model: [["ನಮಗೆ ದೀಪಾವಳಿ ತುಂಬಾ ಇಷ್ಟದ ಹಬ್ಬ.", "namage diipaavaLi tumbaa ishTada habba.", "Deepavali is our favourite festival."], ["ಆ ದಿನ ನಾವು ಮನೆಯ ಸುತ್ತ ದೀಪಗಳನ್ನು ಹಚ್ಚುತ್ತೇವೆ.", "aa dina naavu maneya sutta diipagaLannu hachchutteeve.", "That day we light lamps around the house."], ["ಅಮ್ಮ ಹೋಳಿಗೆ ಮಾಡುತ್ತಾರೆ.", "amma hooLige maaDuttaare.", "Amma makes holige."], ["ನಾವು ಹೊಸ ಬಟ್ಟೆ ಹಾಕಿಕೊಂಡು ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋಗುತ್ತೇವೆ.", "naavu hosa baTTe haakikonDu deevasthaanakke hoogutteeve.", "We wear new clothes and go to the temple."]],
    build: [["ನಾವು ದೀಪಗಳನ್ನು ಹಚ್ಚುತ್ತೇವೆ.", "We light lamps."], ["ಅಮ್ಮ ಹಬ್ಬಕ್ಕೆ ಹೋಳಿಗೆ ಮಾಡುತ್ತಾರೆ.", "Amma makes holige for the festival."], ["ನಾವು ಹೊಸ ಬಟ್ಟೆ ಹಾಕಿಕೊಳ್ಳುತ್ತೇವೆ.", "We wear new clothes."]],
    ladder: [["ನಾವು ರಂಗೋಲಿ ಹಾಕುತ್ತೇವೆ.", "We draw a rangoli."], ["ನಾವು ಬಾಗಿಲಿನ ಮುಂದೆ ರಂಗೋಲಿ ಹಾಕುತ್ತೇವೆ.", "We draw a rangoli in front of the door."], ["ಹಬ್ಬದ ದಿನ ನಾವು ಬಾಗಿಲಿನ ಮುಂದೆ ಬಣ್ಣದ ರಂಗೋಲಿ ಹಾಕುತ್ತೇವೆ.", "On the festival day we draw a coloured rangoli in front of the door."], ["ಹಬ್ಬದ ದಿನ ಬೆಳಿಗ್ಗೆ ಅಕ್ಕ ಮತ್ತು ನಾನು ಬಾಗಿಲಿನ ಮುಂದೆ ದೊಡ್ಡ ಬಣ್ಣದ ರಂಗೋಲಿ ಹಾಕುತ್ತೇವೆ.", "On the festival morning Akka and I draw a big coloured rangoli in front of the door."]],
    blanks: [["ನಾವು ದೀಪಗಳನ್ನು ___.", "ಹಚ್ಚುತ್ತೇವೆ"], ["ಅಮ್ಮ ___ ಮಾಡುತ್ತಾರೆ.", "ಹೋಳಿಗೆ"], ["ನಾವು ___ ಬಟ್ಟೆ ಹಾಕಿಕೊಳ್ಳುತ್ತೇವೆ.", "ಹೊಸ"]],
    words: [["ಹಬ್ಬ", "habba", "festival", "🎉"], ["ದೀಪ", "diipa", "lamp", "🪔"], ["ರಂಗೋಲಿ", "rangooli", "rangoli", "🎨"], ["ಹೋಳಿಗೆ", "hooLige", "holige", "🫓"], ["ದೇವಸ್ಥಾನ", "deevasthaana", "temple", "🛕"], ["ಉಡುಗೊರೆ", "uDugore", "gift", "🎁"]],
    prompts: { long: "Write about a festival your family celebrates in 3 short paragraphs: getting ready, the day itself, and after." },
    dictation: ["ಯುಗಾದಿಯಂದು ನಾವು ಬೇವು ಬೆಲ್ಲ ತಿನ್ನುತ್ತೇವೆ.", "ಅದು ಹೊಸ ವರ್ಷದ ಹಬ್ಬ."],
  },
  {
    id: "book", en: "Project: my little book", kn: "ನನ್ನ ಪುಸ್ತಕ", focus: "A story with pictures", project: true,
    model: [["ನನ್ನ ಕಥೆಯ ಹೆಸರು ಜಾಣ ಕಾಗೆ.", "nanna katheya hesaru jaaNa kaage.", "My story is called The Clever Crow."], ["ಒಂದು ಬೇಸಿಗೆಯಲ್ಲಿ ಕಾಗೆಗೆ ಬಾಯಾರಿಕೆ ಆಯಿತು.", "ondu beesigeyalli kaagege baayaarike aayitu.", "One summer the crow was thirsty."], ["ಅದು ಮಡಕೆಗೆ ಕಲ್ಲುಗಳನ್ನು ಹಾಕಿತು.", "adu maDakege kallugaLannu haakitu.", "It dropped stones into the pot."], ["ನೀರು ಮೇಲೆ ಬಂತು ಮತ್ತು ಕಾಗೆ ನೀರು ಕುಡಿಯಿತು.", "niiru meele bantu mattu kaage niiru kuDiyitu.", "The water rose and the crow drank."]],
    build: [["ಕಾಗೆಗೆ ಬಾಯಾರಿಕೆ ಆಯಿತು.", "The crow was thirsty."], ["ಅದು ಮಡಕೆಗೆ ಕಲ್ಲುಗಳನ್ನು ಹಾಕಿತು.", "It dropped stones into the pot."], ["ನೀರು ಮೇಲೆ ಬಂತು.", "The water came up."]],
    ladder: [["ಕಾಗೆ ಹಾರಿತು.", "The crow flew."], ["ಕಾಗೆ ದೂರ ಹಾರಿತು.", "The crow flew far."], ["ಬಾಯಾರಿದ ಕಾಗೆ ನೀರು ಹುಡುಕುತ್ತಾ ದೂರ ಹಾರಿತು.", "The thirsty crow flew far looking for water."], ["ಒಂದು ಬಿಸಿಲಿನ ದಿನ ಬಾಯಾರಿದ ಕಾಗೆ ನೀರು ಹುಡುಕುತ್ತಾ ತುಂಬಾ ದೂರ ಹಾರಿತು.", "One sunny day the thirsty crow flew very far looking for water."]],
    blanks: [["ಕಾಗೆಗೆ ___ ಆಯಿತು.", "ಬಾಯಾರಿಕೆ"], ["ಅದು ಮಡಕೆಗೆ ___ ಹಾಕಿತು.", "ಕಲ್ಲುಗಳನ್ನು"], ["ನೀರು ___ ಬಂತು.", "ಮೇಲೆ"]],
    words: [["ಕಥೆ", "kathe", "story", "📖"], ["ಕಾಗೆ", "kaage", "crow", "🐦‍⬛"], ["ಮಡಕೆ", "maDake", "pot", "🏺"], ["ಕಲ್ಲು", "kallu", "stone", "🪨"], ["ಬಾಯಾರಿಕೆ", "baayaarike", "thirst", "🥵"], ["ಜಾಣ", "jaaNa", "clever", "🧠"]],
    prompts: { long: "Make your own little book: a title page and 4 pages, each with a picture and 3 sentences. Bring it to the last meet and read it aloud." },
    dictation: ["ಜಾಣ ಕಾಗೆ ತನ್ನ ಬುದ್ಧಿ ಉಪಯೋಗಿಸಿತು.", "ಕಷ್ಟ ಬಂದಾಗ ಯೋಚಿಸಬೇಕು."],
  },
];

const SEQ = {
  start: PATTERNS,
  write: PATTERNS,
  long: [...PATTERNS.slice(5), ...PROJECTS], // 13 patterns from "I do", then 5 projects
};

// ---------- One packet ----------
export const tiles = (s) => s.replace(/[.?]$/, "").split(/\s+/).map((w) => w.replace(/,$/, ""));
const endMark = (s) => (/\?$/.test(s) ? "?" : ".");
export { endMark };

export function lesson(track, n, pace, opts = {}) {
  const t = TRACKS[track] ? track : "start";
  const pc = PACES[pace] ? pace : TRACK_PACE[t];
  const i = Math.max(1, Math.min(18, n)) - 1;
  const pattern = SEQ[t][i];
  const u0 = U[PLAN[pc][i]];
  let unit = { key: PLAN[pc][i], ...u0 };
  if (unit.kind === "words") {
    const ws = pattern.words.map((w) => w[0]).filter((w) => [...w].length >= 3).slice(0, 6);
    unit = { ...unit, en: `Writing words: ${pattern.en.replace(/^Project: /, "")}`, items: ws.length >= 4 ? ws : pattern.words.slice(0, 6).map((w) => w[0]) };
  }
  // What each path does with the pattern.
  const level = t;
  const tasks = {
    speaking: level === "start"
      ? (opts.understand === "most" || opts.homeKannada === "daily"
        ? { title: "Answer in Kannada", steps: ["Every day, ask 3 questions using this week's sentences. Your child answers in Kannada, even with one word.", "If they answer in English, say it back in Kannada and let them repeat it. No pressure, just every time.", pattern.prompts.start || pattern.prompts.long] }
        : { title: "Say it", steps: ["Listen to the model sentences in Gini's Listen and say each one back.", pattern.prompts.start || pattern.prompts.long, "Use one of this week's sentences at dinner every day."] })
      : level === "write"
        ? { title: "Say it, then say more", steps: ["Say each model sentence, then change one word to make it yours.", "Say the longer-sentence ladder out loud, one step at a time.", "Record 2 sentences in Gini's Speak and send them to your teacher."] }
        : { title: "Talk for one minute", steps: ["Read the model sentences aloud with expression.", `Talk for one minute about: ${pattern.focus.toLowerCase()}.`, "Record it in Gini's Speak and send it to your teacher."] },
    reading: level === "start"
      ? { title: "Read the letters", steps: [`Point to and name: ${(unit.items || []).join(" ")}.`, "Find this week's letters in the model sentences.", "Read the words of the week with a grown-up."] }
      : level === "write"
        ? { title: "Read the sentences", steps: ["Read each model sentence aloud twice.", "Circle this week's letters or signs in them.", "Build the sentences in Gini's Build, then read them back."] }
        : { title: "Read and answer", steps: ["Read the model sentences as one short passage.", "Tell a grown-up what it says, in Kannada.", "Underline the joining or ending words that are this week's focus."] },
    writing: level === "start"
      ? { title: "Trace, then write", steps: ["Watch and trace each letter in Gini's Write. Start at the green dot.", "Fill the tracing sheet: trace the light letters, then write alone.", "Copy one model sentence neatly."] }
      : level === "write"
        ? { title: "Write what you say", steps: ["Trace the letters in Gini's Write, then do the tracing sheet.", "Write the 3 built sentences on the lines.", pattern.prompts.write] }
        : { title: "Write longer", steps: ["Make a sentence longer, one step at a time, on the sentence page.", pattern.prompts.long, "Dictation: a grown-up reads the sentences aloud and you write them."] },
  };
  const theme = themeFor(n);
  return { track: t, pace: pc, n, pattern, unit, tasks, theme };
}

// Month summary for a path: letters covered and sentence patterns.
export function monthFocus(track, m, pace) {
  const ns = [1, 2, 3].map((k) => (m - 1) * 3 + k).filter((n) => n <= 18);
  const ls = ns.map((n) => lesson(track, n, pace));
  const script = [...new Set(ls.map((l) => l.unit.en.replace(/^Writing words: .*/, "writing words")))].join(", ");
  return { script, patterns: ls.map((l) => l.pattern.en.replace(/^Project: /, "")), lessons: ls };
}

// All Kannada text a child may hear this packet (for the teacher's voice library).
export function lessonTexts(l) {
  const out = [];
  for (const w of [...(l.theme ? l.theme.words : []), ...l.pattern.words]) out.push({ text: w[0], rom: w[1], en: w[2], pic: w[3] });
  for (const m of l.pattern.model) out.push({ text: m[0], rom: m[1], en: m[2] });
  for (const b of l.pattern.build) out.push({ text: b[0], en: b[1] });
  for (const s of l.pattern.ladder) out.push({ text: s[0], en: s[1] });
  const seen = new Set();
  return out.filter((x) => (seen.has(x.text) ? false : seen.add(x.text)));
}

// Easy dot-to-dot tracing: on for gentle-pace and young children unless switched off.
// Dot tracing with Gini showing the way: for ages 5 to 8 and gentle pace (a parent or teacher can switch it).
export const easyOf = (child) => (child && typeof child.easyTrace === "boolean" ? child.easyTrace : paceOf(child) === "gentle" || (child && +child.age > 0 && +child.age <= 8));

// ---------- Talk with Gini: questions to answer out loud ----------
// [question, question in English, answer frame, answer in English]. A null question means
// "you ask": the child says the Kannada line to Gini.
export const TALK = {
  this: [["ಇದು ಏನು?", "What is this? (Gini shows a picture)", "ಇದು ___.", "This is a ___."], ["ಅದು ಏನು?", "What is that?", "ಅದು ___.", "That is a ___."], [null, "Point at something and ask Gini what it is", "ಇದು ಏನು?", "What is this?"]],
  me: [["ನಿನ್ನ ಹೆಸರು ಏನು?", "What is your name?", "ನನ್ನ ಹೆಸರು ___.", "My name is ___."], ["ನಿನಗೆ ಎಷ್ಟು ವರ್ಷ?", "How old are you?", "ನನಗೆ ___ ವರ್ಷ.", "I am ___."], ["ನಿನ್ನ ಊರು ಯಾವುದು?", "Where are you from?", "ನನ್ನ ಊರು ___.", "My town is ___."]],
  like: [["ನಿನಗೆ ಏನು ಇಷ್ಟ?", "What do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like ___."], ["ನಿನಗೆ ಏನು ಇಷ್ಟ ಇಲ್ಲ?", "What don't you like?", "ನನಗೆ ___ ಇಷ್ಟ ಇಲ್ಲ.", "I don't like ___."], ["ಅಮ್ಮನಿಗೆ ಏನು ಇಷ್ಟ?", "What does Amma like?", "ಅಮ್ಮನಿಗೆ ___ ಇಷ್ಟ.", "Amma likes ___."]],
  where: [["ನಿನ್ನ ಚೀಲ ಎಲ್ಲಿದೆ?", "Where is your bag?", "ನನ್ನ ಚೀಲ ___ ಇದೆ.", "My bag is ___."], ["ನಿನ್ನ ಆಟಿಕೆ ಎಲ್ಲಿದೆ?", "Where is your toy?", "ನನ್ನ ಆಟಿಕೆ ___ ಮೇಲೆ ಇದೆ.", "My toy is on the ___."], [null, "Ask Gini where the cat is", "ಬೆಕ್ಕು ಎಲ್ಲಿದೆ?", "Where is the cat?"]],
  have: [["ನಿನ್ನ ಹತ್ತಿರ ಏನು ಇದೆ?", "What do you have?", "ನನ್ನ ಹತ್ತಿರ ___ ಇದೆ.", "I have ___."], ["ನಿನ್ನ ಹತ್ತಿರ ಎಷ್ಟು ಪುಸ್ತಕಗಳು ಇವೆ?", "How many books do you have?", "ನನ್ನ ಹತ್ತಿರ ___ ಪುಸ್ತಕಗಳು ಇವೆ.", "I have ___ books."], ["ನಿನಗೆ ಎಷ್ಟು ಕೈಗಳು ಇವೆ?", "How many hands do you have?", "ನನಗೆ ಎರಡು ಕೈಗಳು ಇವೆ.", "I have two hands."]],
  do: [["ನೀನು ಬೆಳಿಗ್ಗೆ ಏನು ತಿನ್ನುತ್ತೀಯ?", "What do you eat in the morning?", "ನಾನು ಬೆಳಿಗ್ಗೆ ___ ತಿನ್ನುತ್ತೇನೆ.", "I eat ___ in the morning."], ["ನೀನು ಏನು ಕುಡಿಯುತ್ತೀಯ?", "What do you drink?", "ನಾನು ___ ಕುಡಿಯುತ್ತೇನೆ.", "I drink ___."], ["ನೀನು ಸಂಜೆ ಏನು ಮಾಡುತ್ತೀಯ?", "What do you do in the evening?", "ನಾನು ಸಂಜೆ ___ ಆಡುತ್ತೇನೆ.", "I play ___ in the evening."]],
  they: [["ಅಮ್ಮ ಏನು ಮಾಡುತ್ತಾರೆ?", "What does Amma do?", "ಅಮ್ಮ ___ ಮಾಡುತ್ತಾರೆ.", "Amma does ___."], ["ನಾಯಿ ಏನು ಮಾಡುತ್ತದೆ?", "What does a dog do?", "ನಾಯಿ ಬೊಗಳುತ್ತದೆ.", "A dog barks."], ["ನಿನ್ನ ಗೆಳೆಯ ಏನು ಮಾಡುತ್ತಾನೆ?", "What does your friend do?", "ನನ್ನ ಗೆಳೆಯ ___ ಆಡುತ್ತಾನೆ.", "My friend plays ___."]],
  ask: [[null, "Ask Gini her name", "ನಿನ್ನ ಹೆಸರು ಏನು?", "What is your name?"], [null, "Ask Gini how she is", "ನೀನು ಹೇಗಿದ್ದೀಯ?", "How are you?"], [null, "Ask Gini where she lives", "ನೀನು ಎಲ್ಲಿ ಇರುತ್ತೀಯ?", "Where do you live?"]],
  past: [["ನಿನ್ನೆ ನೀನು ಏನು ತಿಂದೆ?", "What did you eat yesterday?", "ನಿನ್ನೆ ನಾನು ___ ತಿಂದೆ.", "Yesterday I ate ___."], ["ನಿನ್ನೆ ನೀನು ಎಲ್ಲಿಗೆ ಹೋದೆ?", "Where did you go yesterday?", "ನಿನ್ನೆ ನಾನು ___ಗೆ ಹೋದೆ.", "Yesterday I went to ___."], ["ಇವತ್ತು ನೀನು ಏನು ಆಡಿದೆ?", "What did you play today?", "ಇವತ್ತು ನಾನು ___ ಆಡಿದೆ.", "Today I played ___."]],
  want: [["ನಿನಗೆ ಏನು ಬೇಕು?", "What do you want?", "ನನಗೆ ___ ಬೇಕು.", "I want ___."], ["ನಾಳೆ ನೀನು ಏನು ಮಾಡುತ್ತೀಯ?", "What will you do tomorrow?", "ನಾಳೆ ನಾನು ___.", "Tomorrow I will ___."], ["ನಿನಗೆ ಹಾಲು ಬೇಕಾ?", "Do you want milk?", "ಹೌದು, ನನಗೆ ಹಾಲು ಬೇಕು. / ಬೇಡ.", "Yes, I want milk. / No."]],
  describe: [["ಆನೆ ದೊಡ್ಡದಾ, ಚಿಕ್ಕದಾ?", "Is an elephant big or small?", "ಆನೆ ದೊಡ್ಡದು.", "An elephant is big."], ["ಆಕಾಶ ಯಾವ ಬಣ್ಣ?", "What colour is the sky?", "ಆಕಾಶ ನೀಲಿ ಬಣ್ಣ.", "The sky is blue."], ["ಇವತ್ತು ಚಳಿ ಇದೆಯಾ?", "Is it cold today?", "ಹೌದು, ಇವತ್ತು ಚಳಿ ಇದೆ. / ಇಲ್ಲ.", "Yes, it's cold today. / No."]],
  cases: [["ನೀನು ಬೆಳಿಗ್ಗೆ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತೀಯ?", "Where do you go in the morning?", "ನಾನು ___ಗೆ ಹೋಗುತ್ತೇನೆ.", "I go to ___."], ["ಮೀನು ಎಲ್ಲಿ ಇರುತ್ತದೆ?", "Where do fish live?", "ಮೀನು ನೀರಿನಲ್ಲಿ ಇರುತ್ತದೆ.", "Fish live in water."], ["ನೀನು ಯಾರ ಜೊತೆ ಆಡುತ್ತೀಯ?", "Who do you play with?", "ನಾನು ___ ಜೊತೆ ಆಡುತ್ತೇನೆ.", "I play with ___."]],
  and: [["ನಿನಗೆ ಯಾವ ಎರಡು ಹಣ್ಣು ಇಷ್ಟ?", "Which two fruits do you like?", "ನನಗೆ ___ ಮತ್ತು ___ ಇಷ್ಟ.", "I like ___ and ___."], ["ನಿನಗೆ ಹಾಲು ಬೇಕಾ ಅಥವಾ ನೀರು ಬೇಕಾ?", "Do you want milk or water?", "ನನಗೆ ___ ಬೇಕು.", "I want ___."], ["ನಿನಗೆ ಏನು ಇಷ್ಟ, ಏನು ಇಷ್ಟ ಇಲ್ಲ?", "What do you like, and what don't you?", "ನನಗೆ ___ ಇಷ್ಟ, ಆದರೆ ___ ಇಷ್ಟ ಇಲ್ಲ.", "I like ___, but I don't like ___."]],
  because: [["ನಿನಗೆ ಯಾವ ಆಟ ಇಷ್ಟ? ಏಕೆ?", "Which game do you like? Why?", "ನನಗೆ ___ ಇಷ್ಟ, ಏಕೆಂದರೆ ___.", "I like ___ because ___."], ["ನೀನು ಏಕೆ ಜಾಕೆಟ್ ಹಾಕಿದೆ?", "Why did you wear a jacket?", "ಏಕೆಂದರೆ ಚಳಿ ಇತ್ತು.", "Because it was cold."], ["ನೀನು ಏಕೆ ನೀರು ಕುಡಿದೆ?", "Why did you drink water?", "ಏಕೆಂದರೆ ನನಗೆ ಬಾಯಾರಿಕೆ ಆಗಿತ್ತು.", "Because I was thirsty."]],
  then: [["ಬೆಳಿಗ್ಗೆ ಮೊದಲು ನೀನು ಏನು ಮಾಡುತ್ತೀಯ?", "What do you do first in the morning?", "ಮೊದಲು ನಾನು ___.", "First I ___."], ["ಆಮೇಲೆ ಏನು ಮಾಡುತ್ತೀಯ?", "What do you do after that?", "ಆಮೇಲೆ ನಾನು ___.", "Then I ___."], ["ರಾತ್ರಿ ಕೊನೆಗೆ ಏನು ಮಾಡುತ್ತೀಯ?", "What do you do last at night?", "ಕೊನೆಗೆ ನಾನು ಮಲಗುತ್ತೇನೆ.", "Finally I sleep."]],
  can: [["ನಿನಗೆ ಈಜಲು ಬರುತ್ತದಾ?", "Can you swim?", "ಹೌದು, ನನಗೆ ಈಜಲು ಬರುತ್ತದೆ. / ಇಲ್ಲ.", "Yes, I can swim. / No."], ["ನಿನಗೆ ಏನು ಮಾಡಲು ಬರುತ್ತದೆ?", "What can you do?", "ನನಗೆ ___ಲು ಬರುತ್ತದೆ.", "I can ___."], ["ಮಲಗುವ ಮೊದಲು ಏನು ಮಾಡಬೇಕು?", "What must you do before bed?", "ಹಲ್ಲು ಉಜ್ಜಬೇಕು.", "Brush my teeth."]],
  person: [["ನಿನಗೆ ಯಾರು ತುಂಬಾ ಇಷ್ಟ?", "Who do you love a lot?", "ನನಗೆ ___ ತುಂಬಾ ಇಷ್ಟ.", "I love ___ a lot."], ["ಅವರು ಎಲ್ಲಿ ಇರುತ್ತಾರೆ?", "Where do they live?", "ಅವರು ___ನಲ್ಲಿ ಇರುತ್ತಾರೆ.", "They live in ___."], ["ಅವರು ನಿನಗೆ ಏನು ಮಾಡುತ್ತಾರೆ?", "What do they do for you?", "ಅವರು ನನಗೆ ___.", "They ___ for me."]],
  story: [["ಕಥೆಯಲ್ಲಿ ಯಾರು ಇದ್ದರು?", "Who was in the story?", "ಒಂದು ___ ಇತ್ತು.", "There was a ___."], ["ಒಂದು ದಿನ ಏನಾಯಿತು?", "What happened one day?", "ಒಂದು ದಿನ ___.", "One day ___."], ["ಕೊನೆಗೆ ಏನಾಯಿತು?", "What happened in the end?", "ಕೊನೆಗೆ ___.", "In the end ___."]],
  letter: [["ಅಜ್ಜಿಗೆ ಏನು ಹೇಳುತ್ತೀಯ?", "What will you tell Ajji?", "ಅಜ್ಜಿ, ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.", "Ajji, I am well."], [null, "Ask Ajji how she is", "ನೀವು ಹೇಗಿದ್ದೀರಿ?", "How are you?"], ["ನೀನು ಯಾವಾಗ ಬರುತ್ತೀಯ?", "When will you come?", "ನಾನು ___ ಬರುತ್ತೇನೆ.", "I will come ___."]],
  news: [["ಇವತ್ತು ಏನು ಸುದ್ದಿ?", "What's the news today?", "ಇವತ್ತು ___.", "Today ___."], ["ಅದು ಎಲ್ಲಿ ನಡೆಯಿತು?", "Where did it happen?", "ಅದು ___ನಲ್ಲಿ ನಡೆಯಿತು.", "It happened in ___."], ["ಯಾರು ಗೆದ್ದರು?", "Who won?", "___ ಗೆದ್ದರು.", "___ won."]],
  compare: [["ಆನೆ ದೊಡ್ಡದಾ, ಬೆಕ್ಕು ದೊಡ್ಡದಾ?", "Which is bigger, an elephant or a cat?", "ಆನೆ ಬೆಕ್ಕಿಗಿಂತ ದೊಡ್ಡದು.", "An elephant is bigger than a cat."], ["ನಿನಗಿಂತ ಯಾರು ಎತ್ತರ?", "Who is taller than you?", "___ ನನಗಿಂತ ಎತ್ತರ.", "___ is taller than me."], ["ನಿನಗೆ ಬೇಸಿಗೆ ಇಷ್ಟವೋ, ಚಳಿಗಾಲ ಇಷ್ಟವೋ?", "Do you like summer or winter more?", "ನನಗೆ ___ಗಿಂತ ___ ಇಷ್ಟ.", "I like ___ more than ___."]],
  festival: [["ನಿನಗೆ ಯಾವ ಹಬ್ಬ ಇಷ್ಟ?", "Which festival do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like ___."], ["ಹಬ್ಬದಲ್ಲಿ ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?", "What do you do at the festival?", "ನಾವು ___.", "We ___."], ["ಹಬ್ಬಕ್ಕೆ ಅಮ್ಮ ಏನು ಮಾಡುತ್ತಾರೆ?", "What does Amma make for the festival?", "ಅಮ್ಮ ___ ಮಾಡುತ್ತಾರೆ.", "Amma makes ___."]],
  book: [["ನಿನ್ನ ಕಥೆಯ ಹೆಸರು ಏನು?", "What is your story called?", "ನನ್ನ ಕಥೆಯ ಹೆಸರು ___.", "My story is called ___."], ["ನಿನ್ನ ಕಥೆಯಲ್ಲಿ ಯಾರು ಇದ್ದಾರೆ?", "Who is in your story?", "ನನ್ನ ಕಥೆಯಲ್ಲಿ ___ ಇದೆ.", "In my story there is ___."], ["ಕೊನೆಗೆ ಏನಾಗುತ್ತದೆ?", "What happens at the end?", "ಕೊನೆಗೆ ___.", "In the end ___."]],
};
// Everyday questions: one opens every day's mission.
export const DAILY_TALK = [
  ["ನಮಸ್ಕಾರ! ಹೇಗಿದ್ದೀಯ?", "Hello! How are you?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.", "I am fine."],
  ["ಇವತ್ತು ನೀನು ಏನು ತಿಂದೆ?", "What did you eat today?", "ಇವತ್ತು ನಾನು ___ ತಿಂದೆ.", "Today I ate ___."],
  ["ಇವತ್ತು ಹವಾಮಾನ ಹೇಗಿದೆ?", "What's the weather like today?", "ಇವತ್ತು ___ ಇದೆ. (ಬಿಸಿಲು, ಮಳೆ, ಚಳಿ)", "Today it is ___ (sunny, rainy, cold)."],
  ["ನಿನ್ನ ಅಚ್ಚುಮೆಚ್ಚಿನ ಆಟ ಯಾವುದು?", "What's your favourite game?", "ನನ್ನ ಅಚ್ಚುಮೆಚ್ಚಿನ ಆಟ ___.", "My favourite game is ___."],
  ["ನೀನು ಇವತ್ತು ಖುಷಿಯಾಗಿದ್ದೀಯಾ?", "Are you happy today?", "ಹೌದು, ನಾನು ಖುಷಿಯಾಗಿದ್ದೇನೆ.", "Yes, I am happy."],
  ["ಶಾಲೆಯಲ್ಲಿ ಇವತ್ತು ಏನು ಮಾಡಿದೆ?", "What did you do at school today?", "ಶಾಲೆಯಲ್ಲಿ ನಾನು ___.", "At school I ___."],
];
export const talkFor = (pattern) => (TALK[pattern.id] || []).map(([q, qEn, a, aEn]) => ({ q, qEn, a, aEn }));

// ---------- Daily missions: six days a week, about 15 minutes each ----------
export const DAYS = [
  { en: "New words", icon: "🌱" },
  { en: "Letters", icon: "✏️" },
  { en: "Sentences", icon: "🧩" },
  { en: "Remember", icon: "🔁" },
  { en: "Say more", icon: "🗣️" },
  { en: "Show what you know", icon: "🏅" },
];

export const STORY_DAYS = [
  { en: "Read the story", icon: "📖" },
  { en: "Understand it", icon: "🤔" },
  { en: "Dictation", icon: "✍️" },
  { en: "Tell it back", icon: "🗣️" },
  { en: "Write your own", icon: "📝" },
  { en: "Show what you know", icon: "🏅" },
];
export const daysFor = (track) => (track === "long" ? STORY_DAYS : DAYS);

// Earlier packets, for review (last 3).
export function reviewLessons(track, n, pace) {
  const out = [];
  for (let k = n - 1; k >= Math.max(1, n - 3); k--) out.push(lesson(track, k, pace));
  return out;
}

// Big writers: each week is built around a story.
function storyPlan(l, day, { seed = 1 } = {}) {
  const st = storyFor(l.n), P = l.pattern;
  const items = [...new Set([...(l.unit.items || []), ...(l.unit.review || [])])].slice(0, 3);
  const short = st.lines.filter((x) => !/"/.test(x) && x.split(" ").length <= 7);
  const dict = dictationOf(st, 5);
  const sentences = st.lines.map((x, i) => [x, st.en_lines[i]]);
  const plans = [
    [
      { kind: "talk", title: "Warm up with Gini", items: [DAILY_TALK.map(([q, qEn, a, aEn]) => ({ q, qEn, a, aEn, daily: true }))[seed % DAILY_TALK.length]] },
      { kind: "listen", title: "Words from the story", cards: st.words.map((w) => ({ kn: w[0], rom: w[1], en: w[2], pic: w[3] })) },
      { kind: "story", title: `Read: ${st.en}`, story: st, record: true },
    ],
    [
      { kind: "questions", title: "Answer the questions", story: st },
      { kind: "build", title: "Story sentences in order", rounds: shuffleSeed(short, seed).slice(0, 3).map((kn) => ({ type: "order", kn, en: st.en_lines[st.lines.indexOf(kn)] })) },
      { kind: "write", title: "Letter practice", items, steps: ["write"] },
    ],
    [
      { kind: "dictation", title: "Dictation: listen and write", lines: dict.slice(0, 3) },
      { kind: "speak", title: "Read aloud", items: st.lines.slice(0, 3).map((kn, i) => ({ kn, en: st.en_lines[i] })) },
    ],
    [
      { kind: "talk", title: "Tell the story back", items: RETELL.map((r) => ({ ...r, hints: st.words })) },
      { kind: "build", title: "Make it longer", rounds: P.ladder.slice(1).map(([kn, en], j) => ({ type: "longer", kn, en, prev: P.ladder[j][0] })) },
      { kind: "play", title: "What does it mean?", mode: "sentences", sentences },
    ],
    [
      { kind: "storywrite", title: "Write your own story", story: st },
    ],
    [
      { kind: "questions", title: "Story quiz", story: st },
      { kind: "dictation", title: "Dictation from memory", lines: dict.slice(3, 5).length ? dict.slice(3, 5) : dict.slice(0, 2) },
      { kind: "story", title: "Read the whole story to your teacher", story: st, record: true, mustRecord: true },
    ],
  ];
  return plans[Math.max(0, Math.min(5, day - 1))];
}

export function dayPlan(l, day, { easy = false, review = [], seed = 1 } = {}) {
  if (l.track === "long") return storyPlan(l, day, { seed });
  const P = l.pattern, items = [...new Set([...(l.unit.items || []), ...(l.unit.review || [])])];
  const half = Math.ceil(items.length / 2);
  const firstHalf = items.slice(0, Math.min(half, easy ? 2 : 4)), secondHalf = items.slice(half, half + (easy ? 2 : 4));
  const talk = talkFor(P), daily = DAILY_TALK.map(([q, qEn, a, aEn]) => ({ q, qEn, a, aEn, daily: true }));
  const words = P.words, model = P.model.map(([kn, rom, en]) => ({ kn, rom, en }));
  const sentences = [...P.model.map((m) => [m[0], m[2]]), ...P.build, ...P.ladder];
  const rv = review.filter(Boolean);
  const rvSentences = rv.flatMap((r) => [...r.pattern.build, ...r.pattern.model.map((m) => [m[0], m[2]])]);
  const rvWords = rv.flatMap((r) => r.pattern.words);
  const rvLetters = [...new Set(rv.flatMap((r) => r.unit.items || []))].slice(0, 4);
  const rvTalk = rv.flatMap((r) => talkFor(r.pattern)).filter((t) => t.q);
  const extraBuild = P.dictation.filter((d) => d.split(" ").length >= 2).map((d) => [d, ""]);
  const long = l.track !== "start";
  const th = l.theme || themeFor(l.n), tw = th.words;
  const picQ = pictureTalk(th, 3, seed), thQ = themeTalk(th);
  const rvThemeWords = rv.flatMap((r) => (r.theme ? r.theme.words : []));
  const themeCards = tw.map((w) => ({ kn: w[0], rom: w[1], en: w[2], pic: w[3] }));
  const shortThemeWords = tw.map((w) => w[0]).filter((w) => [...w].length <= 5);
  const plans = [
    [
      { kind: "talk", title: "Say hello to Gini", items: [daily[(seed + 0) % daily.length], picQ[0]].filter(Boolean) },
      { kind: "listen", title: `New words: ${th.en}`, cards: [...themeCards, ...model] },
      { kind: "write", title: "Trace new letters", items: firstHalf, steps: ["watch", "trace"] },
      { kind: "build", title: "Build 2 sentences", rounds: P.build.slice(0, 2).map(([kn, en]) => ({ type: "order", kn, en })) },
    ],
    [
      { kind: "talk", title: "Talk with Gini", items: [thQ, talk[0]].filter(Boolean) },
      { kind: "play", title: `Picture game: ${th.en}`, mode: "words", words: tw },
      { kind: "write", title: "Trace more letters", items: secondHalf.length ? secondHalf : firstHalf, steps: ["watch", "trace"] },
      { kind: "speak", title: "Name the pictures", items: [...themeCards.slice(0, 3), model[0]] },
    ],
    [
      { kind: "talk", title: "What is this?", items: [picQ[1], talk[1] || talk[0]].filter(Boolean) },
      { kind: "listen", title: "Listen to the sentences", cards: [...words.map((w) => ({ kn: w[0], rom: w[1], en: w[2], pic: w[3] })), ...model, ...P.build.map(([kn, en]) => ({ kn, en }))] },
      { kind: "build", title: "Build and fill the gaps", rounds: [...P.build.map(([kn, en]) => ({ type: "order", kn, en })), ...P.blanks.map(([t, ans]) => ({ type: "gap", text: t, ans, kn: t.replace("___", ans) }))] },
      { kind: "write", title: "Write letters on your own", items: firstHalf, steps: easy ? ["trace", "write"] : ["write"] },
    ],
    [
      { kind: "talk", title: "Remember last week", items: [daily[(seed + 2) % daily.length], ...(rvTalk.length ? [rvTalk[seed % rvTalk.length]] : [])] },
      { kind: "play", title: "Picture game: this week and last", mode: "words", words: shuffleSeed([...tw, ...rvThemeWords, ...words], seed).slice(0, 14) },
      { kind: "write", title: "Old and new letters", items: [...(secondHalf.length ? secondHalf : firstHalf).slice(0, 2), ...rvLetters.slice(0, 2)], steps: easy ? ["trace", "write"] : ["write"] },
      { kind: "build", title: "Last week's sentences", rounds: (rvSentences.length ? rvSentences : P.build).slice(0, 3).map(([kn, en]) => ({ type: "order", kn, en: en || "Put the words in order" })) },
    ],
    [
      { kind: "talk", title: "Answer Gini's questions", items: [...talk.slice(0, 3), picQ[2]].filter(Boolean) },
      { kind: "speak", title: long ? "Say the long sentence" : "Say the sentences", items: long ? P.ladder.slice(-2).map(([kn, en]) => ({ kn, en })) : model.slice(2, 4) },
      { kind: "build", title: long ? "Make it longer" : "More sentences", rounds: long ? P.ladder.slice(1).map(([kn, en], j) => ({ type: "longer", kn, en, prev: P.ladder[j][0] })) : [...extraBuild.slice(0, 2).map(([kn]) => ({ type: "order", kn, en: "Listen, then put the words in order" })), ...P.build.slice(2).map(([kn, en]) => ({ type: "order", kn, en }))] },
      { kind: "write", title: `Write a word: ${th.en}`, items: (shortThemeWords.length ? shortThemeWords : (l.unit.words || P.words.map((w) => w[0]))).slice(0, 2), steps: easy ? ["trace"] : ["trace", "write"] },
    ],
    [
      { kind: "talk", title: "Tell Gini about your week", items: [daily[(seed + 3) % daily.length], talk[2] || talk[0]].filter(Boolean) },
      { kind: "play", title: long ? "Quiz: what does it mean?" : "Quiz: words and pictures", mode: long ? "sentences" : "words", words: [...tw, ...words], sentences },
      { kind: "write", title: "Write from memory", items: items.slice(0, easy ? 3 : 5), steps: ["write"], memory: true },
      { kind: "build", title: "Final sentences", rounds: shuffleSeed(P.build, seed).slice(0, 2).map(([kn, en]) => ({ type: "order", kn, en })) },
    ],
  ];
  return plans[Math.max(0, Math.min(5, day - 1))].filter((s) => !(s.items && !s.items.length) && !(s.rounds && !s.rounds.length));
}
function shuffleSeed(a, seed) { const b = [...a]; let s = seed || 1; for (let i = b.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

// ---------- Word themes: everyday words to recognise and say (one theme a week) ----------
// words: [kannada, romanised, english, picture]
export const THEMES = [
  { id: "family", kn: "ನನ್ನ ಕುಟುಂಬ", en: "My family", words: [["ಅಮ್ಮ", "amma", "mother", "👩"], ["ಅಪ್ಪ", "appa", "father", "👨"], ["ಅಕ್ಕ", "akka", "elder sister", "👧"], ["ಅಣ್ಣ", "aNNa", "elder brother", "👦"], ["ಅಜ್ಜಿ", "ajji", "grandmother", "👵"], ["ಅಜ್ಜ", "ajja", "grandfather", "👴"]] },
  { id: "food", kn: "ಊಟ", en: "Food", words: [["ಅನ್ನ", "anna", "rice", "🍚"], ["ದೋಸೆ", "dose", "dosa", "🫓"], ["ಹಾಲು", "haalu", "milk", "🥛"], ["ನೀರು", "neeru", "water", "💧"], ["ಮೊಸರು", "mosaru", "curd", "🥣"], ["ಬಾಳೆಹಣ್ಣು", "baaLehaNNu", "banana", "🍌"]] },
  { id: "colours", kn: "ಬಣ್ಣಗಳು", en: "Colours", words: [["ಕೆಂಪು", "kempu", "red", "🟥"], ["ಹಸಿರು", "hasiru", "green", "🟩"], ["ಹಳದಿ", "haLadi", "yellow", "🟨"], ["ನೀಲಿ", "neeli", "blue", "🟦"], ["ಬಿಳಿ", "biLi", "white", "⬜"], ["ಕಪ್ಪು", "kappu", "black", "⬛"]] },
  { id: "animals", kn: "ಪ್ರಾಣಿಗಳು", en: "Animals", words: [["ಹಸು", "hasu", "cow", "🐄"], ["ನಾಯಿ", "naayi", "dog", "🐕"], ["ಬೆಕ್ಕು", "bekku", "cat", "🐈"], ["ಆನೆ", "aane", "elephant", "🐘"], ["ಕೋತಿ", "kooti", "monkey", "🐒"], ["ಹುಲಿ", "huli", "tiger", "🐅"]] },
  { id: "body", kn: "ನನ್ನ ದೇಹ", en: "My body", words: [["ಕಣ್ಣು", "kaNNu", "eye", "👁️"], ["ಕಿವಿ", "kivi", "ear", "👂"], ["ಮೂಗು", "moogu", "nose", "👃"], ["ಬಾಯಿ", "baayi", "mouth", "👄"], ["ಕೈ", "kai", "hand", "✋"], ["ಕಾಲು", "kaalu", "leg", "🦵"]] },
  { id: "home", kn: "ಮನೆ", en: "Home", words: [["ಮನೆ", "mane", "house", "🏠"], ["ಬಾಗಿಲು", "baagilu", "door", "🚪"], ["ಕಿಟಕಿ", "kiTaki", "window", "🪟"], ["ಕುರ್ಚಿ", "kurchi", "chair", "🪑"], ["ಹಾಸಿಗೆ", "haasige", "bed", "🛏️"], ["ದೀಪ", "deepa", "lamp", "🪔"]] },
  { id: "school", kn: "ಶಾಲೆ", en: "School", words: [["ಶಾಲೆ", "shaale", "school", "🏫"], ["ಪುಸ್ತಕ", "pustaka", "book", "📖"], ["ಚೀಲ", "cheela", "bag", "🎒"], ["ಪೆನ್ಸಿಲ್", "pensil", "pencil", "✏️"], ["ಗೆಳೆಯ", "geLeya", "friend", "🧒"], ["ಗಡಿಯಾರ", "gaDiyaara", "clock", "🕰️"]] },
  { id: "fruits", kn: "ಹಣ್ಣುಗಳು", en: "Fruits", words: [["ಮಾವು", "maavu", "mango", "🥭"], ["ಸೇಬು", "seebu", "apple", "🍎"], ["ದ್ರಾಕ್ಷಿ", "draakshi", "grapes", "🍇"], ["ಕಿತ್ತಳೆ", "kittaLe", "orange", "🍊"], ["ಅನಾನಸ್", "anaanas", "pineapple", "🍍"], ["ಕಲ್ಲಂಗಡಿ", "kallangaDi", "watermelon", "🍉"]] },
  { id: "vegetables", kn: "ತರಕಾರಿ", en: "Vegetables", words: [["ಈರುಳ್ಳಿ", "eeruLLi", "onion", "🧅"], ["ಟೊಮೆಟೊ", "Tomato", "tomato", "🍅"], ["ಬದನೆಕಾಯಿ", "badanekaayi", "brinjal", "🍆"], ["ಆಲೂಗಡ್ಡೆ", "aaloogaDDe", "potato", "🥔"], ["ಕ್ಯಾರೆಟ್", "kyaareT", "carrot", "🥕"], ["ಮೆಣಸಿನಕಾಯಿ", "meNasinakaayi", "chilli", "🌶️"]] },
  { id: "festivals", kn: "ಹಬ್ಬ", en: "Festivals", words: [["ದೀಪ", "deepa", "lamp", "🪔"], ["ಹೂವು", "hoovu", "flower", "🌼"], ["ಸಿಹಿ", "sihi", "sweet", "🍬"], ["ರಂಗೋಲಿ", "rangoli", "rangoli", "🎨"], ["ಪಟಾಕಿ", "paTaaki", "crackers", "🎆"], ["ಉಡುಗೊರೆ", "uDugore", "gift", "🎁"]] },
  { id: "weather", kn: "ಹವಾಮಾನ", en: "Weather", words: [["ಮಳೆ", "maLe", "rain", "🌧️"], ["ಬಿಸಿಲು", "bisilu", "sunshine", "☀️"], ["ಗಾಳಿ", "gaaLi", "wind", "🌬️"], ["ಮೋಡ", "mooDa", "cloud", "☁️"], ["ಚಳಿ", "chaLi", "cold", "🥶"], ["ಹಿಮ", "hima", "snow", "❄️"]] },
  { id: "clothes", kn: "ಬಟ್ಟೆ", en: "Clothes", words: [["ಅಂಗಿ", "angi", "shirt", "👕"], ["ಲಂಗ", "langa", "skirt", "👗"], ["ಟೋಪಿ", "Topi", "cap", "🧢"], ["ಚಪ್ಪಲಿ", "chappali", "sandals", "🩴"], ["ಕಾಲುಚೀಲ", "kaalucheela", "socks", "🧦"], ["ಕನ್ನಡಕ", "kannaDaka", "spectacles", "👓"]] },
  { id: "vehicles", kn: "ವಾಹನಗಳು", en: "Getting around", words: [["ಬಸ್ಸು", "bassu", "bus", "🚌"], ["ಕಾರು", "kaaru", "car", "🚗"], ["ರೈಲು", "railu", "train", "🚆"], ["ಸೈಕಲ್", "saikal", "bicycle", "🚲"], ["ದೋಣಿ", "dooNi", "boat", "⛵"], ["ವಿಮಾನ", "vimaana", "aeroplane", "✈️"]] },
  { id: "numbers", kn: "ಸಂಖ್ಯೆಗಳು", en: "Numbers", words: [["ಒಂದು", "ondu", "one", "1️⃣"], ["ಎರಡು", "eraDu", "two", "2️⃣"], ["ಮೂರು", "mooru", "three", "3️⃣"], ["ನಾಲ್ಕು", "naalku", "four", "4️⃣"], ["ಐದು", "aidu", "five", "5️⃣"], ["ಹತ್ತು", "hattu", "ten", "🔟"]] },
  { id: "birds", kn: "ಹಕ್ಕಿಗಳು", en: "Birds", words: [["ಕಾಗೆ", "kaage", "crow", "🐦‍⬛"], ["ಗಿಳಿ", "giLi", "parrot", "🦜"], ["ನವಿಲು", "navilu", "peacock", "🦚"], ["ಕೋಳಿ", "kooLi", "hen", "🐔"], ["ಬಾತುಕೋಳಿ", "baatukooLi", "duck", "🦆"], ["ಗೂಬೆ", "goobe", "owl", "🦉"]] },
  { id: "kitchen", kn: "ಅಡುಗೆಮನೆ", en: "Kitchen", words: [["ತಟ್ಟೆ", "taTTe", "plate", "🍽️"], ["ಲೋಟ", "looTa", "tumbler", "🥛"], ["ಚಮಚ", "chamacha", "spoon", "🥄"], ["ಪಾತ್ರೆ", "paatre", "vessel", "🍲"], ["ಚಾಕು", "chaaku", "knife", "🔪"], ["ಬಟ್ಟಲು", "baTTalu", "bowl", "🥣"]] },
  { id: "play", kn: "ಆಟ", en: "Play", words: [["ಚೆಂಡು", "cheNDu", "ball", "⚽"], ["ಗೊಂಬೆ", "gombe", "doll", "🧸"], ["ಗಾಳಿಪಟ", "gaaLipaTa", "kite", "🪁"], ["ಓಡು", "ooDu", "run", "🏃"], ["ಆಡು", "aaDu", "play", "🤹"], ["ಈಜು", "iiju", "swim", "🏊"]] },
  { id: "feelings", kn: "ಭಾವನೆಗಳು", en: "Feelings", words: [["ಖುಷಿ", "khushi", "happy", "😊"], ["ದುಃಖ", "duhkha", "sad", "😢"], ["ಕೋಪ", "koopa", "angry", "😠"], ["ಭಯ", "bhaya", "scared", "😨"], ["ಸುಸ್ತು", "sustu", "tired", "😴"], ["ಹಸಿವು", "hasivu", "hungry", "🤤"]] },
];

// A question for each theme; Gini also shows pictures and asks "What is this?"
export const THEME_TALK = {
  family: ["ಇವರು ಯಾರು?", "Who is this?", "ಇವರು ನನ್ನ ___.", "This is my ___."],
  food: ["ನಿನಗೆ ಯಾವ ಊಟ ಇಷ್ಟ?", "Which food do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like ___."],
  colours: ["ಇದು ಯಾವ ಬಣ್ಣ?", "What colour is this?", "ಇದು ___ ಬಣ್ಣ.", "This is ___."],
  animals: ["ನಿನಗೆ ಯಾವ ಪ್ರಾಣಿ ಇಷ್ಟ?", "Which animal do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like the ___."],
  body: ["ಇದು ಏನು? (point to your nose, ears...)", "What is this?", "ಇದು ನನ್ನ ___.", "This is my ___."],
  home: ["ನಿನ್ನ ಕೋಣೆಯಲ್ಲಿ ಏನು ಇದೆ?", "What is in your room?", "ನನ್ನ ಕೋಣೆಯಲ್ಲಿ ___ ಇದೆ.", "There is a ___ in my room."],
  school: ["ನಿನ್ನ ಚೀಲದಲ್ಲಿ ಏನು ಇದೆ?", "What is in your bag?", "ನನ್ನ ಚೀಲದಲ್ಲಿ ___ ಇದೆ.", "There is a ___ in my bag."],
  fruits: ["ನಿನಗೆ ಯಾವ ಹಣ್ಣು ಇಷ್ಟ?", "Which fruit do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like ___."],
  vegetables: ["ಇವತ್ತು ಯಾವ ತರಕಾರಿ ತಿಂದೆ?", "Which vegetable did you eat today?", "ಇವತ್ತು ನಾನು ___ ತಿಂದೆ.", "Today I ate ___."],
  festivals: ["ಹಬ್ಬದಲ್ಲಿ ಏನು ಇರುತ್ತದೆ?", "What is there at a festival?", "ಹಬ್ಬದಲ್ಲಿ ___ ಇರುತ್ತದೆ.", "At a festival there is ___."],
  weather: ["ಇವತ್ತು ಹವಾಮಾನ ಹೇಗಿದೆ?", "What's the weather like today?", "ಇವತ್ತು ___ ಇದೆ.", "Today it is ___."],
  clothes: ["ನೀನು ಇವತ್ತು ಏನು ಹಾಕಿಕೊಂಡಿದ್ದೀಯ?", "What are you wearing today?", "ನಾನು ___ ಹಾಕಿಕೊಂಡಿದ್ದೇನೆ.", "I am wearing ___."],
  vehicles: ["ನೀನು ಶಾಲೆಗೆ ಹೇಗೆ ಹೋಗುತ್ತೀಯ?", "How do you go to school?", "ನಾನು ___ನಲ್ಲಿ ಹೋಗುತ್ತೇನೆ.", "I go by ___."],
  numbers: ["ನಿನಗೆ ಎಷ್ಟು ವರ್ಷ?", "How old are you?", "ನನಗೆ ___ ವರ್ಷ.", "I am ___."],
  birds: ["ನಿನಗೆ ಯಾವ ಹಕ್ಕಿ ಇಷ್ಟ?", "Which bird do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like the ___."],
  kitchen: ["ಅಡುಗೆಮನೆಯಲ್ಲಿ ಏನು ಇದೆ?", "What is in the kitchen?", "ಅಡುಗೆಮನೆಯಲ್ಲಿ ___ ಇದೆ.", "There is a ___ in the kitchen."],
  play: ["ನಿನಗೆ ಯಾವ ಆಟ ಇಷ್ಟ?", "Which game do you like?", "ನನಗೆ ___ ಇಷ್ಟ.", "I like ___."],
  feelings: ["ನಿನಗೆ ಈಗ ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ?", "How do you feel now?", "ನನಗೆ ___ ಆಗಿದೆ.", "I feel ___."],
};
export const themeFor = (n) => THEMES[(Math.max(1, n) - 1) % THEMES.length];
// "What is this?" questions from pictures in a theme.
const PIC_Q = {
  colours: ["ಇದು ಯಾವ ಬಣ್ಣ?", "What colour is this?", (w) => `ಇದು ${w} ಬಣ್ಣ.`],
  numbers: ["ಇದು ಯಾವ ಸಂಖ್ಯೆ?", "What number is this?", (w) => `ಇದು ${w}.`],
  family: ["ಇವರು ಯಾರು?", "Who is this?", (w) => `ಇವರು ${w}.`],
};
const NO_PIC_Q = ["feelings", "weather", "play"]; // pictures of feelings and actions don't make "What is this?" questions
export const pictureTalk = (theme, count = 2, seed = 1) => {
  if (!theme || NO_PIC_Q.includes(theme.id)) return [];
  const [q, qEn, a] = PIC_Q[theme.id] || ["ಇದು ಏನು?", "What is this?", (w) => `ಇದು ${w}.`];
  return shuffleSeed(theme.words, seed).slice(0, count).map((w) => ({ q, qEn, pic: w[3], a: a(w[0]), aEn: `This is: ${w[2]}.`, daily: true }));
};
export const themeTalk = (theme) => { const t = THEME_TALK[theme.id]; return t ? { q: t[0], qEn: t[1], a: t[2], aEn: t[3], daily: false, hints: theme.words } : null; };

// ---------- Levels: one simple ladder over path, letter pace and tracing style ----------
// Families and children can move up (or back) any time, to explore harder work.
export const LEVELS = [
  { n: 1, en: "Little learners", kn: "ಪುಟಾಣಿ", ages: "about 5 to 6", icon: "🐣", track: "start", pace: "gentle", easy: true, what: "Dot-to-dot letters, a few a week. Short, everyday sentences to hear, say and build." },
  { n: 2, en: "Explorers", kn: "ಅನ್ವೇಷಕರು", ages: "about 6 to 8", icon: "🐦", track: "start", pace: "steady", easy: false, what: "The whole alphabet in 6 weeks, checked on shape and stroke order. Short sentences, lots of talking." },
  { n: 3, en: "Speakers to writers", kn: "ಬರಹಗಾರರು", ages: "about 7 to 10", icon: "🦜", track: "write", pace: "steady", easy: false, what: "Sentences move faster: write what you say, make sentences longer, dictation." },
  { n: 4, en: "Big writers", kn: "ದೊಡ್ಡ ಬರಹಗಾರರು", ages: "about 9 to 12", icon: "🦚", track: "long", pace: "review", easy: false, what: "A story every week: read it aloud, answer questions, dictation, retell it, then write your own story. Long sentences and paragraphs." },
];
export function levelOf(child) {
  if (child && LEVELS[child.level - 1]) return child.level;
  const t = trackOf(child), p = paceOf(child);
  return t === "long" ? 4 : t === "write" ? 3 : p === "gentle" ? 1 : 2;
}
export const levelFromPlacement = (pl) => (pl.track === "long" ? 4 : pl.track === "write" ? 3 : pl.pace === "gentle" ? 1 : 2);
export const levelPatch = (n) => { const L = LEVELS[n - 1]; return { level: n, track: L.track, pace: L.pace, easyTrace: L.easy }; };
