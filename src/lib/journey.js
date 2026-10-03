// The Letter journey (ಅಕ್ಷರ ಪಯಣ): 45 self-paced days of writing and reading.
// Vowels (8 days) → consonants (17) → vowel signs (12) → joined letters (8).
// A finished day unlocks the next one straight away. Please have a Kannada teacher review the words.
import { LETTER_WORD, SOUND, SIGNS } from "./course.js";

// Pictures for the example word of each letter.
export const LETTER_PIC = {
  "ಅ": "👩", "ಆ": "🐘", "ಇ": "🐭", "ಈ": "🏊", "ಉ": "🧂", "ಊ": "🍛", "ಋ": "🧘", "ಎ": "🍃", "ಏ": "🪜", "ಐ": "5️⃣", "ಒ": "🐫", "ಓ": "📖", "ಔ": "💊", "ಅಂ": "🏪", "ಅಃ": "😢",
  "ಕ": "🪷", "ಖ": "🗡️", "ಗ": "🕰️", "ಘ": "🔔", "ಙ": "📚", "ಚ": "🥄", "ಛ": "☂️", "ಜ": "🦌", "ಝ": "🏞️", "ಞ": "🧠", "ಟ": "🍅", "ಠ": "🏢", "ಡ": "📦", "ಢ": "🥁", "ಣ": "🏹",
  "ತ": "🙂", "ಥ": "🛕", "ದ": "🐄", "ಧ": "🚩", "ನ": "🦚", "ಪ": "📖", "ಫ": "🍎", "ಬ": "🚌", "ಭ": "🌍", "ಮ": "🌳", "ಯ": "⚙️", "ರ": "🤴", "ಲ": "🟠", "ವ": "🎻", "ಶ": "🐚", "ಷ": "🎭", "ಸ": "🦁", "ಹ": "🐄", "ಳ": "🍌",
};

// Words with no vowel signs, for reading as soon as their letters are learnt. [kannada, romanised, english, picture]
const PLAIN_WORDS = [
  ["ಮರ", "mara", "tree", "🌳"], ["ಜನ", "jana", "people", "👥"], ["ಹಣ", "haNa", "money", "💰"], ["ಬಲ", "bala", "strength", "💪"],
  ["ದನ", "dana", "cow", "🐄"], ["ಕಮಲ", "kamala", "lotus", "🪷"], ["ತಬಲ", "tabala", "tabla", "🥁"], ["ಪದ", "pada", "word", "🔤"],
  ["ಗಜ", "gaja", "elephant", "🐘"], ["ರಥ", "ratha", "chariot", "🛕"], ["ಸರ", "sara", "necklace", "📿"], ["ನಗರ", "nagara", "city", "🏙️"],
  ["ಕವನ", "kavana", "poem", "📝"], ["ಗಗನ", "gagana", "sky", "🌌"], ["ನಯನ", "nayana", "eye", "👁️"], ["ಜಲ", "jala", "water", "💧"],
  ["ಫಲ", "phala", "fruit", "🍎"], ["ಹವಳ", "havaLa", "coral", "🪸"], ["ಪಟ", "paTa", "kite", "🪁"], ["ಚಮಚ", "chamacha", "spoon", "🥄"],
  ["ಮಗ", "maga", "son", "👦"], ["ಅರಸ", "arasa", "king", "🤴"], ["ಕಲಶ", "kalasha", "pot", "🏺"], ["ಝಗಮಗ", "jhagamaga", "sparkly", "✨"],
  ["ಭರತ", "bharata", "Bharata", "🧑"], ["ಕರ", "kara", "hand", "✋"], ["ದಳ", "daLa", "petal", "🌸"], ["ಜಗ", "jaga", "world", "🌍"],
  ["ವನ", "vana", "forest", "🌲"], ["ಅಗಲ", "agala", "wide", "↔️"], ["ಘಟ", "ghaTa", "pot", "🏺"], ["ಕಡಲ", "kaDala", "of the sea", "🌊"],
];

// Words for each vowel sign and joined-letter day.
const SIGN_WORDS = {
  "ಾ": [["ಮಾವು", "maavu", "mango", "🥭"], ["ಹಾಲು", "haalu", "milk", "🥛"], ["ಕಾರು", "kaaru", "car", "🚗"], ["ಬಾಳೆ", "baaLe", "banana", "🍌"]],
  "ಿ": [["ಗಿಳಿ", "giLi", "parrot", "🦜"], ["ಕಿವಿ", "kivi", "ear", "👂"], ["ಬಿಸಿ", "bisi", "hot", "🔥"], ["ಹಿಮ", "hima", "snow", "❄️"]],
  "ೀ": [["ಮೀನು", "miinu", "fish", "🐟"], ["ನೀರು", "niiru", "water", "💧"], ["ನೀಲಿ", "niili", "blue", "🟦"], ["ಬೀಗ", "biiga", "lock", "🔒"]],
  "ು": [["ಹುಲಿ", "huli", "tiger", "🐅"], ["ಕುರಿ", "kuri", "sheep", "🐑"], ["ಮುಖ", "mukha", "face", "🙂"], ["ಗುಡಿ", "guDi", "temple", "🛕"]],
  "ೂ": [["ಹೂವು", "huuvu", "flower", "🌼"], ["ಮೂಗು", "muugu", "nose", "👃"], ["ಗೂಬೆ", "guube", "owl", "🦉"], ["ಕೂದಲು", "kuudalu", "hair", "💇"]],
  "ೃ": [["ಕೃಷಿ", "krushi", "farming", "🌾"], ["ಮೃಗ", "mruga", "animal", "🐾"], ["ಅಂಗಡಿ", "angaDi", "shop", "🏪"], ["ಶಂಖ", "shankha", "conch", "🐚"], ["ದುಃಖ", "duhkha", "sadness", "😢"]],
  "ೆ": [["ಮನೆ", "mane", "house", "🏠"], ["ಬೆಕ್ಕು", "bekku", "cat", "🐈"], ["ತಲೆ", "tale", "head", "🙂"], ["ಕೆಂಪು", "kempu", "red", "🟥"]],
  "ೇ": [["ಸೇಬು", "seebu", "apple", "🍎"], ["ಮೇಜು", "meeju", "table", "🪵"], ["ಮೇಕೆ", "meeke", "goat", "🐐"], ["ಬೇರು", "beeru", "root", "🌱"]],
  "ೈ": [["ಕೈ", "kai", "hand", "✋"], ["ಸೈಕಲ್", "saikal", "bicycle", "🚲"], ["ಮೈದಾನ", "maidaana", "field", "🏟️"], ["ಕೈಗಡಿಯಾರ", "kaigaDiyaara", "watch", "⌚"]],
  "ೊ": [["ಕೊಡೆ", "koDe", "umbrella", "☂️"], ["ಗೊಂಬೆ", "gombe", "doll", "🧸"], ["ಮೊಸರು", "mosaru", "curd", "🥣"], ["ಮೊಲ", "mola", "rabbit", "🐇"]],
  "ೋ": [["ಕೋತಿ", "kooti", "monkey", "🐒"], ["ದೋಸೆ", "doose", "dosa", "🫓"], ["ಕೋಳಿ", "kooLi", "hen", "🐔"], ["ದೋಣಿ", "dooNi", "boat", "⛵"]],
  "ೌ": [["ಹೌದು", "haudu", "yes", "✅"], ["ಮೌನ", "mauna", "silence", "🤫"], ["ಸೌತೆಕಾಯಿ", "sautekaayi", "cucumber", "🥒"], ["ಕೌದಿ", "kaudi", "quilt", "🛏️"]],
};
const SIGN_EN = { "ಾ": "aa", "ಿ": "i", "ೀ": "ii", "ು": "u", "ೂ": "uu", "ೃ": "ru", "ೆ": "e", "ೇ": "ee", "ೈ": "ai", "ೊ": "o", "ೋ": "oo", "ೌ": "au", "ಂ": "am", "ಃ": "aha" };
const KAG_CONS6 = ["ಕ", "ಗ", "ಮ", "ನ", "ಪ", "ಬ"];

export const SECTIONS = [
  { id: "vowels", en: "Vowels", kn: "ಸ್ವರಗಳು", icon: "🌱", from: 1, to: 8 },
  { id: "consonants", en: "Consonants", kn: "ವ್ಯಂಜನಗಳು", icon: "🌿", from: 9, to: 25 },
  { id: "signs", en: "Vowel signs", kn: "ಕಾಗುಣಿತ", icon: "🌳", from: 26, to: 37 },
  { id: "joined", en: "Joined letters", kn: "ಒತ್ತಕ್ಷರ", icon: "🌺", from: 38, to: 45 },
];

const V = [["ಅ", "ಆ"], ["ಇ", "ಈ"], ["ಉ", "ಊ"], ["ಋ", "ಎ"], ["ಏ", "ಐ"], ["ಒ", "ಓ"], ["ಔ", "ಅಂ"], ["ಅಃ"]];
const C = [["ಕ", "ಖ"], ["ಗ", "ಘ"], ["ಙ", "ಚ"], ["ಛ", "ಜ"], ["ಝ", "ಞ"], ["ಟ", "ಠ"], ["ಡ", "ಢ"], ["ಣ", "ತ"], ["ಥ", "ದ"], ["ಧ", "ನ"], ["ಪ", "ಫ"], ["ಬ", "ಭ"], ["ಮ", "ಯ"], ["ರ", "ಲ"], ["ವ", "ಶ"], ["ಷ", "ಸ"], ["ಹ", "ಳ"]];
const S = [["ಾ"], ["ಿ"], ["ೀ"], ["ು"], ["ೂ"], ["ೃ", "ಂ", "ಃ"], ["ೆ"], ["ೇ"], ["ೈ"], ["ೊ"], ["ೋ"], ["ೌ"]];
const J = [
  { en: "Doubles: ಕ್ಕ ತ್ತ ಪ್ಪ", items: ["ಕ್ಕ", "ತ್ತ", "ಪ್ಪ"], words: [["ಅಕ್ಕ", "akka", "elder sister", "👧"], ["ಹಕ್ಕಿ", "hakki", "bird", "🐦"], ["ಹತ್ತು", "hattu", "ten", "🔟"], ["ಅಪ್ಪ", "appa", "father", "👨"], ["ಉಪ್ಪು", "uppu", "salt", "🧂"]] },
  { en: "Doubles: ಮ್ಮ ನ್ನ ಲ್ಲ ಣ್ಣ ಳ್ಳ", items: ["ಮ್ಮ", "ನ್ನ", "ಲ್ಲ", "ಣ್ಣ", "ಳ್ಳ"], words: [["ಅಮ್ಮ", "amma", "mother", "👩"], ["ಅನ್ನ", "anna", "rice", "🍚"], ["ಹಲ್ಲು", "hallu", "tooth", "🦷"], ["ಹಣ್ಣು", "haNNu", "fruit", "🍎"], ["ಹಳ್ಳಿ", "haLLi", "village", "🏘️"]] },
  { en: "Doubles: ಟ್ಟ ಡ್ಡ ಚ್ಚ ಜ್ಜ ಗ್ಗ", items: ["ಟ್ಟ", "ಡ್ಡ", "ಚ್ಚ", "ಜ್ಜ", "ಗ್ಗ"], words: [["ಬಟ್ಟೆ", "baTTe", "clothes", "👕"], ["ಲಡ್ಡು", "laDDu", "laddu", "🟠"], ["ಬಚ್ಚಲು", "bachchalu", "bathroom", "🛁"], ["ಅಜ್ಜಿ", "ajji", "grandmother", "👵"], ["ಹಗ್ಗ", "hagga", "rope", "🪢"]] },
  { en: "ರ joined: ಪ್ರ ತ್ರ ಗ್ರ ಕ್ರ ದ್ರ", items: ["ಪ್ರ", "ತ್ರ", "ಗ್ರ", "ಕ್ರ", "ದ್ರ"], words: [["ಪ್ರಾಣಿ", "praaNi", "animal", "🐘"], ["ರಾತ್ರಿ", "raatri", "night", "🌙"], ["ಗ್ರಹ", "graha", "planet", "🪐"], ["ಕ್ರಿಕೆಟ್", "krikeT", "cricket", "🏏"], ["ದ್ರಾಕ್ಷಿ", "draakshi", "grapes", "🍇"]] },
  { en: "ಯ and ವ joined: ಕ್ಯ ದ್ಯ ಧ್ವ ಸ್ವ", items: ["ಕ್ಯ", "ದ್ಯ", "ಧ್ವ", "ಸ್ವ"], words: [["ಕ್ಯಾರೆಟ್", "kyaareT", "carrot", "🥕"], ["ಉದ್ಯಾನ", "udyaana", "park", "🌳"], ["ಧ್ವಜ", "dhvaja", "flag", "🚩"], ["ಸ್ವರ", "svara", "note", "🎵"]] },
  { en: "Mixed: ಸ್ತ ಕ್ಷ ಷ್ಟ ಸ್ಥ ಜ್ಞ", items: ["ಸ್ತ", "ಕ್ಷ", "ಷ್ಟ", "ಸ್ಥ", "ಜ್ಞ"], words: [["ಪುಸ್ತಕ", "pustaka", "book", "📖"], ["ಅಕ್ಷರ", "akshara", "letter", "🔤"], ["ನಕ್ಷತ್ರ", "nakshatra", "star", "⭐"], ["ಕಷ್ಟ", "kashTa", "hard", "😓"], ["ಸ್ಥಳ", "sthaLa", "place", "📍"]] },
  { en: "ರ on top (ಅರ್ಕಾವೊತ್ತು): ರ್ಯ ರ್ನ ರ್ಚ ರ್ವ", items: ["ರ್ಯ", "ರ್ನ", "ರ್ಚ", "ರ್ವ"], words: [["ಸೂರ್ಯ", "suurya", "sun", "☀️"], ["ಕರ್ನಾಟಕ", "karnaaTaka", "Karnataka", "🗺️"], ["ಕುರ್ಚಿ", "kurchi", "chair", "🪑"], ["ಪರ್ವತ", "parvata", "mountain", "🏔️"]] },
  { en: "Read it all: a little story", items: ["ಕ್ಕ", "ಮ್ಮ", "ಪ್ರ", "ಸ್ತ"], words: [["ಬೆಕ್ಕು", "bekku", "cat", "🐈"], ["ಹಕ್ಕಿ", "hakki", "bird", "🐦"], ["ಅಮ್ಮ", "amma", "mother", "👩"], ["ಪುಸ್ತಕ", "pustaka", "book", "📖"]], story: ["ಒಂದು ಬೆಕ್ಕು ಇತ್ತು.", "ಅದು ಮರದ ಮೇಲೆ ಒಂದು ಹಕ್ಕಿಯನ್ನು ನೋಡಿತು.", "ಹಕ್ಕಿ ಹಾರಿ ಹೋಯಿತು.", "ಬೆಕ್ಕು ಅಮ್ಮನ ಹತ್ತಿರ ಹೋಗಿ ಮಲಗಿತು."] },
];

const wordFor = (L) => (LETTER_WORD[L] ? [LETTER_WORD[L][0], LETTER_WORD[L][1], LETTER_WORD[L][2], LETTER_PIC[L] || "🔤"] : null);

function build() {
  const days = [];
  const learned = [];
  V.forEach((items, i) => {
    learned.push(...items);
    days.push({ day: days.length + 1, section: "vowels", en: `Vowels ${items.join(" ")}`, kind: "letters", items, sounds: items.map((x) => SOUND[x]), words: items.map(wordFor).filter(Boolean), learned: [...learned], tip: i === 7 ? "ಅಃ has two little circles after ಅ. Say 'aha' with a breath at the end." : "" });
  });
  learned.length = 0; learned.push("ಅ");
  C.forEach((items) => {
    learned.push(...items);
    const known = new Set(learned);
    const plain = PLAIN_WORDS.filter(([w]) => [...w].every((ch) => known.has(ch)));
    const fresh = plain.filter(([w]) => items.some((x) => w.includes(x)));
    const reading = [...fresh, ...plain.filter((p) => !fresh.includes(p))].slice(0, 4);
    days.push({ day: days.length + 1, section: "consonants", en: `Consonants ${items.join(" ")}`, kind: "letters", items, sounds: items.map((x) => SOUND[x]), words: [...items.map(wordFor).filter(Boolean), ...reading].slice(0, 6), reading, learned: [...learned] });
  });
  S.forEach((signs) => {
    const s = signs[0];
    const items = signs.length > 1 ? ["ಕೃ", "ಮೃ", "ಕಂ", "ಅಂ", "ದುಃ"] : KAG_CONS6.map((c) => c + s);
    days.push({ day: days.length + 1, section: "signs", en: `Vowel sign ${signs.map((x) => `◌${x}`).join(" ")} (${signs.map((x) => SIGN_EN[x]).join(", ")})`, kind: "signs", signs, items, sounds: signs.length > 1 ? ["kru", "mru", "kam", "am", "duhu"] : items.map((x) => (SOUND[x[0]] || "").replace(/a$/, "") + (SIGN_EN[x.slice(1)] || "")), words: SIGN_WORDS[s] || [], reading: SIGN_WORDS[s] || [], tip: `The sign ${signs.map((x) => `◌${x}`).join(" ")} turns ಕ (ka) into ${items[0]} (${(SOUND["ಕ"] || "k").replace(/a$/, "")}${SIGN_EN[s]}).` });
  });
  J.forEach((j) => {
    days.push({ day: days.length + 1, section: "joined", en: j.en, kind: "joined", items: j.items, words: j.words, reading: j.words, story: j.story || null, tip: "The second letter sits under the first as a small 'ottu'. Say both sounds together." });
  });
  return days;
}
export const JOURNEY = build();
export const JOURNEY_DAYS = JOURNEY.length; // 45

export const sectionOf = (day) => SECTIONS.find((s) => day >= s.from && day <= s.to) || SECTIONS[0];
// Where the journey starts from the sign-up answers: children who already read or write start at vowel signs.
export const startDay = (child) => (child && child.pace === "review" ? SECTIONS[2].from : 1);
export function journeyOf(child) {
  const j = (child && child.journey) || {};
  const day = Math.max(1, Math.min(JOURNEY_DAYS, j.day || startDay(child)));
  return { day, done: j.done || {}, skipped: j.skipped || [], lesson: JOURNEY[day - 1], section: sectionOf(day), finished: !!(j.done && j.done[JOURNEY_DAYS]) };
}
// All letters learnt so far (for review and games).
export function learnedBefore(day) {
  const out = [];
  for (const d of JOURNEY.slice(0, Math.max(0, day - 1))) out.push(...d.items);
  return [...new Set(out)];
}
// The letters for a stretch of days (used for the paper packet): current day and the next few.
export function journeyUnit(child, span = 5) {
  const { day } = journeyOf(child);
  const days = JOURNEY.slice(day - 1, Math.min(JOURNEY_DAYS, day - 1 + span));
  const items = [...new Set(days.flatMap((d) => d.items))];
  const signs = [...new Set(days.flatMap((d) => d.signs || []))].filter((x) => x !== "ಂ" && x !== "ಃ");
  const last = days[days.length - 1];
  return { key: "J" + day, kind: signs.length ? "signs" : days[0].kind, en: `Letter journey, days ${day} to ${last.day}`, items, signs, words: days.flatMap((d) => (d.words || []).map((w) => w[0])).filter((w, i, a) => a.indexOf(w) === i && [...w].length <= 6).slice(0, 4), tip: days[0].tip || "" };
}
