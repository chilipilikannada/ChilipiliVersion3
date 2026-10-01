// Learning content: stages, months, weekly themes and activities.
// Please have a Kannada teacher review all Kannada text before families use it.

export const SKILLS = ["speaking", "reading", "writing"];
export const SKILL = {
  speaking: { en: "Speaking", kn: "ಮಾತು" },
  reading: { en: "Reading", kn: "ಓದು" },
  writing: { en: "Writing", kn: "ಬರಹ" },
};

// Stages are birds, egg to Garuda. "Chili pili" is the sound of birds chirping.
export const STAGES = [
  { en: "Egg", kn: "ಮೊಟ್ಟೆ", what: "just starting" },
  { en: "Chick", kn: "ಮರಿ", what: "sounds" },
  { en: "Sparrow", kn: "ಗುಬ್ಬಿ", what: "letters" },
  { en: "Parrot", kn: "ಗಿಳಿ", what: "words" },
  { en: "Koel", kn: "ಕೋಗಿಲೆ", what: "sentences" },
  { en: "Peacock", kn: "ನವಿಲು", what: "stories" },
  { en: "Garuda", kn: "ಗರುಡ", what: "flying on their own" },
];

export const CAN_DO = {
  speaking: ["Not speaking Kannada yet.", "Greets, says own name, follows simple instructions.", "Names everyday things and counts to ten.", "Says short sentences about self and routine.", "Asks and answers questions.", "Retells a story and describes a picture.", "Holds a 2-minute conversation without English."],
  reading: ["Does not recognise Kannada letters yet.", "Knows the vowels.", "Knows the consonants.", "Reads vowel signs and short words.", "Reads joined letters and short sentences.", "Reads a short passage and understands it.", "Reads new text fluently."],
  writing: ["Not writing Kannada yet.", "Writes the vowels.", "Writes the consonants.", "Writes short words with vowel signs.", "Writes joined letters and a sentence.", "Writes a few sentences about a picture.", "Writes a paragraph about self from memory."],
};

// Parent's quick self-check at sign-up -> starting stage.
export const SELF_CHECK = {
  speaking: [[0, "Not yet"], [1, "A few words"], [3, "Short sentences"], [5, "Chats comfortably"]],
  reading: [[0, "No letters yet"], [1, "Some letters"], [3, "Reads simple words"], [4, "Reads sentences"]],
  writing: [[0, "Not yet"], [1, "Some letters"], [3, "Writes simple words"], [4, "Writes sentences"]],
};

// The six months, named for what the child can do by the end of each.
export const MONTHS = [
  { en: "Hello", kn: "ನಮಸ್ಕಾರ", tr: "Namaskara", covers: "First letters; naming things, introducing yourself, likes" },
  { en: "My home", kn: "ನನ್ನ ಮನೆ", tr: "Nanna Mane", covers: "More letters; where things are, how many, what I do" },
  { en: "Words", kn: "ಪದಗಳು", tr: "Padagalu", covers: "Vowel signs; he and she, questions, the past" },
  { en: "Let's talk", kn: "ಮಾತುಕತೆ", tr: "Maatukathe", covers: "Joined letters; plans, describing, word endings" },
  { en: "Tell me a story", kn: "ಕಥೆ ಹೇಳು", tr: "Kathe Helu", covers: "Spelling; and, but, because, first and then" },
  { en: "My Kannada", kn: "ನನ್ನ ಕನ್ನಡ", tr: "Nanna Kannada", covers: "Paragraphs, a story of their own, writing alone" },
];

// Suggested 6-month goal: lower starts move faster; capped at 3 stages.
export function suggestGoals(stages, intake = {}) {
  const g = {};
  for (const k of SKILLS) {
    const L = stages[k] || 0;
    let d = L <= 2 ? 3 : L <= 4 ? 2 : 1;
    if (k === "speaking" && intake.homeKannada === "daily") d += 1;
    if (k !== "speaking" && +intake.practiceMinutes >= 20) d += 1;
    if (+intake.practiceMinutes && +intake.practiceMinutes <= 10) d = Math.max(1, d - 1);
    g[k] = Math.min(6, L + Math.min(3, d));
  }
  return g;
}

// Alphabet chart (ಅಕ್ಷರಮಾಲೆ) with romanised sounds.
export const ALPHABET = {
  vowels: [["ಅ", "a"], ["ಆ", "aa"], ["ಇ", "i"], ["ಈ", "ii"], ["ಉ", "u"], ["ಊ", "uu"], ["ಋ", "ru"], ["ಎ", "e"], ["ಏ", "ee"], ["ಐ", "ai"], ["ಒ", "o"], ["ಓ", "oo"], ["ಔ", "au"], ["ಅಂ", "am"], ["ಅಃ", "aha"]],
  consonants: [
    [["ಕ", "ka"], ["ಖ", "kha"], ["ಗ", "ga"], ["ಘ", "gha"], ["ಙ", "nga"]],
    [["ಚ", "cha"], ["ಛ", "chha"], ["ಜ", "ja"], ["ಝ", "jha"], ["ಞ", "nya"]],
    [["ಟ", "Ta"], ["ಠ", "Tha"], ["ಡ", "Da"], ["ಢ", "Dha"], ["ಣ", "Na"]],
    [["ತ", "ta"], ["ಥ", "tha"], ["ದ", "da"], ["ಧ", "dha"], ["ನ", "na"]],
    [["ಪ", "pa"], ["ಫ", "pha"], ["ಬ", "ba"], ["ಭ", "bha"], ["ಮ", "ma"]],
    [["ಯ", "ya"], ["ರ", "ra"], ["ಲ", "la"], ["ವ", "va"], ["ಶ", "sha"], ["ಷ", "Sha"], ["ಸ", "sa"], ["ಹ", "ha"], ["ಳ", "La"]],
  ],
};
