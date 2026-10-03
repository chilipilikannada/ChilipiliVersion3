// Kannada for grown-ups in the USA, mostly learning to talk with a partner or loved ones who speak Kannada.
// Conversation first, the script when you're ready.
// No age anywhere: a learner is a grown-up because they chose "Me" at sign-up (child.adult === true).
//
// Unit: { id, level, icon, en, kn, goal, phrases: [[kn, rom, en]], note, dialogue: [[who, kn, rom, en]] }
// who = "you" (the learner's lines, practised in the role-play) or "them" (Gini reads these).

import { childWeek, weekStart, PLAN_WEEKS } from "./plan.js";

export const isAdult = (c) => !!(c && c.adult);

export const ADULT_LEVELS = [
  { n: 1, icon: "🌱", en: "First words", kn: "ಮೊದಲ ಮಾತು", what: "Greetings, introducing yourself, everyday talk with your partner, family and in-laws, food, numbers, welcoming relatives from India, time. Everything in English letters too." },
  { n: 2, icon: "🌿", en: "Everyday talk", kn: "ದಿನದ ಮಾತು", what: "Cooking together, visiting family, past and future, phone calls, caring when someone's unwell, feelings, and talking Kannada with your child." },
  { n: 3, icon: "🌳", en: "Read and write", kn: "ಓದು ಬರಹ", what: "The Kannada script from ಅ to ಒತ್ತಕ್ಷರ at your own pace, then menus, messages and festival greetings with family and friends." },
  { n: 4, icon: "🏵️", en: "Fluent", kn: "ನಿರರ್ಗಳ", what: "Opinions, telling stories, work, and speaking respectfully with elders; reading and writing whole stories." },
];
export const adultLevelOf = (c) => Math.min(4, Math.max(1, +(c && c.level) || 1));
// Level changes keep the learner's letter pace (set at sign-up from "can you read the script?").
export const adultLevelPatch = (n) => ({ level: n, track: n >= 4 ? "long" : "write", easyTrace: false });

export const ADULT_GOALS = [
  ["partner", "Talk with my partner"],
  ["family", "Talk with their family or mine (parents, in-laws, grandparents)"],
  ["friends", "Talk with close friends who speak Kannada"],
  ["child", "Help my child learn"],
  ["script", "Read and write the script"],
];
export const A_UNDERSTAND = [
  ["none", "Very little"],
  ["words", "Some words and phrases"],
  ["most", "Most everyday conversation"],
];
export const A_SPEAK = [
  ["none", "Hardly any"],
  ["phrases", "A few phrases"],
  ["simple", "Simple conversations"],
  ["fluent", "Comfortably"],
];
export const A_READ = [
  ["none", "Not yet"],
  ["slow", "Slowly, letter by letter"],
  ["yes", "Yes, fairly well"],
];

// Combine the answers: speaking decides the conversation level, reading decides the script start.
export function adultPlacement({ understand, speak, read, goals = [] }) {
  let n = 1; const why = [];
  if (speak === "fluent" || (speak === "simple" && understand === "most")) { n = read === "yes" ? 4 : 3; why.push("You already hold conversations, so we start past the basics."); }
  else if (speak === "simple" || understand === "most" || speak === "phrases") { n = 2; why.push("You know some Kannada, so we start with everyday talk."); }
  else why.push("We start with the phrases you'll use most, all in English letters too.");
  if (read === "yes") why.push("You can read, so the letter journey starts at vowel signs (ಕಾಗುಣಿತ).");
  else if (goals.includes("script") || n >= 3) why.push("The script is part of your plan: one short letter lesson a day.");
  else why.push("The script is there whenever you want it; conversation comes first.");
  return { level: n, why, pace: read === "yes" ? "review" : "steady" };
}

const U = (id, level, icon, en, kn, goal, phrases, note, dialogue) => ({ id, level, icon, en, kn, goal, phrases, note, dialogue });

export const UNITS = [
  // ---------- Level 1: First words ----------
  U("greet", 1, "🙏", "Hello and how are you", "ನಮಸ್ಕಾರ", "Greet anyone politely and ask how they are.", [
    ["ನಮಸ್ಕಾರ!", "namaskaara!", "Hello!"],
    ["ಹೇಗಿದ್ದೀರಾ?", "heegiddiiraa?", "How are you?"],
    ["ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.", "naanu chennaagiddeene.", "I am fine."],
    ["ನೀವು ಹೇಗಿದ್ದೀರಾ?", "niivu heegiddiiraa?", "And how are you?"],
    ["ಧನ್ಯವಾದಗಳು.", "dhanyavaadagaLu.", "Thank you."],
    ["ಹೌದು. ಇಲ್ಲ.", "houdu. illa.", "Yes. No."],
    ["ಸರಿ.", "sari.", "Okay."],
    ["ಮತ್ತೆ ಸಿಗೋಣ.", "matte sigooNa.", "See you again."],
  ], "ನೀವು (niivu) is the polite \"you\" for elders and anyone you don't know well; ನೀನು (niinu) is for children and close friends. The verb changes with it: ಹೇಗಿದ್ದೀರಾ? (polite) and ಹೇಗಿದ್ದೀಯ? (friendly). When unsure, use ನೀವು.", [
    ["them", "ನಮಸ್ಕಾರ! ಹೇಗಿದ್ದೀರಾ?", "namaskaara! heegiddiiraa?", "Hello! How are you?"],
    ["you", "ನಮಸ್ಕಾರ! ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ. ನೀವು?", "namaskaara! naanu chennaagiddeene. niivu?", "Hello! I'm fine. You?"],
    ["them", "ನಾನೂ ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.", "naanuu chennaagiddeene, dhanyavaadagaLu.", "I'm fine too, thank you."],
    ["you", "ಸರಿ, ಮತ್ತೆ ಸಿಗೋಣ.", "sari, matte sigooNa.", "Okay, see you again."],
  ]),
  U("me", 1, "🙋", "About me", "ನನ್ನ ಬಗ್ಗೆ", "Say your name, where you live and where your family is from.", [
    ["ನಿಮ್ಮ ಹೆಸರು ಏನು?", "nimma hesaru eenu?", "What is your name?"],
    ["ನನ್ನ ಹೆಸರು ಅನು.", "nanna hesaru Anu.", "My name is Anu."],
    ["ನೀವು ಎಲ್ಲಿಯವರು?", "niivu elliyavaru?", "Where are you from?"],
    ["ನಮ್ಮ ಊರು ಮೈಸೂರು.", "namma uuru maisuuru.", "Our hometown is Mysuru."],
    ["ನಾನು ಅಮೆರಿಕದಲ್ಲಿ ಇರುತ್ತೇನೆ.", "naanu amerikadalli irutteene.", "I live in America."],
    ["ನಾನು ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ.", "naanu kannaDa kaliyuttiddeene.", "I am learning Kannada."],
    ["ಸ್ವಲ್ಪ ಸ್ವಲ್ಪ ಕನ್ನಡ ಬರುತ್ತೆ.", "svalpa svalpa kannaDa barutte.", "I know a little Kannada."],
    ["ನಿಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ ಸಂತೋಷ ಆಯ್ತು.", "nimmannu bheeTi maaDi santoosha aaytu.", "Nice to meet you."],
  ], "The verb comes last in Kannada: ನಾನು ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ is \"I Kannada am-learning\". \"Is\" is usually left out: ನನ್ನ ಹೆಸರು ಅನು is just \"my name Anu\". Speech shortens endings: ಬರುತ್ತದೆ becomes ಬರುತ್ತೆ.", [
    ["them", "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಹೆಸರು ಏನು?", "namaskaara, nimma hesaru eenu?", "Hello, what's your name?"],
    ["you", "ನನ್ನ ಹೆಸರು ___.", "nanna hesaru ___.", "My name is ___."],
    ["them", "ನೀವು ಎಲ್ಲಿಯವರು?", "niivu elliyavaru?", "Where are you from?"],
    ["you", "ನಮ್ಮ ಊರು ಮೈಸೂರು. ನಾನು ಅಮೆರಿಕದಲ್ಲಿ ಇರುತ್ತೇನೆ.", "namma uuru maisuuru. naanu amerikadalli irutteene.", "Our hometown is Mysuru. I live in America."],
    ["them", "ನಿಮಗೆ ಕನ್ನಡ ಬರುತ್ತಾ?", "nimage kannaDa baruttaa?", "Do you know Kannada?"],
    ["you", "ಸ್ವಲ್ಪ ಸ್ವಲ್ಪ ಬರುತ್ತೆ. ನಾನು ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ.", "svalpa svalpa barutte. naanu kannaDa kaliyuttiddeene.", "A little. I'm learning Kannada."],
  ]),
  U("help", 1, "🤔", "When you don't understand", "ಅರ್ಥ ಆಗಲಿಲ್ಲ", "Keep a conversation going: ask them to repeat, slow down or explain.", [
    ["ನನಗೆ ಅರ್ಥ ಆಗಲಿಲ್ಲ.", "nanage artha aagalilla.", "I didn't understand."],
    ["ಇನ್ನೊಂದು ಸಲ ಹೇಳಿ.", "innondu sala heeLi.", "Please say it once more."],
    ["ನಿಧಾನವಾಗಿ ಹೇಳಿ.", "nidhaanavaagi heeLi.", "Please say it slowly."],
    ["ಇದಕ್ಕೆ ಕನ್ನಡದಲ್ಲಿ ಏನು ಹೇಳ್ತಾರೆ?", "idakke kannaDadalli eenu heeLtaare?", "What do you call this in Kannada?"],
    ["ಅದು ಅಂದರೆ ಏನು?", "adu andare eenu?", "What does that mean?"],
    ["ನನಗೆ ಗೊತ್ತಿಲ್ಲ.", "nanage gottilla.", "I don't know."],
    ["ಗೊತ್ತಾಯ್ತು.", "gottaaytu.", "Got it."],
    ["ಪರವಾಗಿಲ್ಲ.", "paravaagilla.", "No problem."],
  ], "ಹೇಳಿ (heeLi) is a polite \"please say\". Add -ಇ to a verb to make a polite request: ಬನ್ನಿ (come), ಕೂತ್ಕೊಳ್ಳಿ (sit), ನೋಡಿ (look). ಊಟ ಆಯ್ತಾ? (have you eaten?) is how many people say hello, so it's worth knowing early.", [
    ["them", "ಊಟ ಆಯ್ತಾ?", "uuTa aaytaa?", "Have you eaten?"],
    ["you", "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥ ಆಗಲಿಲ್ಲ. ನಿಧಾನವಾಗಿ ಹೇಳಿ.", "kshamisi, nanage artha aagalilla. nidhaanavaagi heeLi.", "Sorry, I didn't understand. Please say it slowly."],
    ["them", "ಊಟ... ಆಯ್ತಾ?", "uuTa... aaytaa?", "Meal... done?"],
    ["you", "ಗೊತ್ತಾಯ್ತು! ಹೌದು, ಊಟ ಆಯ್ತು.", "gottaaytu! houdu, uuTa aaytu.", "Got it! Yes, I've eaten."],
  ]),
  U("numbers", 1, "🔢", "Numbers at home", "ಮನೆಯಲ್ಲಿ ಎಣಿಕೆ", "Count, and talk about ages, prices and guests with your partner and family.", [
    ["ಒಂದು, ಎರಡು, ಮೂರು, ನಾಲ್ಕು, ಐದು", "ondu, eraDu, muuru, naalku, aidu", "One, two, three, four, five"],
    ["ಆರು, ಏಳು, ಎಂಟು, ಒಂಬತ್ತು, ಹತ್ತು", "aaru, eeLu, enTu, ombattu, hattu", "Six, seven, eight, nine, ten"],
    ["ಇದು ಎಷ್ಟು ಆಯ್ತು?", "idu eshTu aaytu?", "How much did this cost?"],
    ["ಇಪ್ಪತ್ತು ಡಾಲರ್.", "ippattu Daalar.", "Twenty dollars."],
    ["ತುಂಬಾ ದುಬಾರಿ!", "tumbaa dubaari!", "That's expensive!"],
    ["ನಮ್ಮ ಮಗಳಿಗೆ ಆರು ವರ್ಷ.", "namma magaLige aaru varsha.", "Our daughter is six."],
    ["ಎಷ್ಟು ಜನ ಬರ್ತಾರೆ?", "eshTu jana bartaare?", "How many people are coming?"],
    ["ಹತ್ತು ಜನ.", "hattu jana.", "Ten people."],
  ], "ಎಷ್ಟು (eshTu) means how much or how many. Tens: ಇಪ್ಪತ್ತು 20, ಮೂವತ್ತು 30, ನಲವತ್ತು 40, ಐವತ್ತು 50, ನೂರು 100, ಸಾವಿರ 1000. Most of us say prices in English here, and that's fine; Kannada numbers help with elders, ages, and counting with children.", [
    ["them", "ಈ ಹೊಸ ಶೂ ಹೇಗಿದೆ?", "ii hosa shuu heegide?", "How are these new shoes?"],
    ["you", "ಚೆನ್ನಾಗಿದೆ! ಎಷ್ಟು ಆಯ್ತು?", "chennaagide! eshTu aaytu?", "Nice! How much were they?"],
    ["them", "ಇಪ್ಪತ್ತು ಡಾಲರ್, ಸೇಲ್‌ನಲ್ಲಿ.", "ippattu Daalar, seelnalli.", "Twenty dollars, on sale."],
    ["you", "ಅಷ್ಟೇನಾ? ಒಳ್ಳೆಯದು!", "ashTeenaa? oLLeyadu!", "That's all? Great!"],
    ["them", "ಶನಿವಾರ ಮಗಳ ಹುಟ್ಟುಹಬ್ಬ. ಎಷ್ಟು ಜನ ಕರೆಯೋಣ?", "shanivaara magaLa huTTuhabba. eshTu jana kareyooNa?", "Saturday is our daughter's birthday. How many people shall we invite?"],
    ["you", "ಹತ್ತು ಜನ ಸಾಕು.", "hattu jana saaku.", "Ten people is enough."],
  ]),
  U("food", 1, "🍛", "Dinner with family", "ಮನೆಯ ಊಟ", "At the table with your partner's family: accept, refuse more, and praise the cook.", [
    ["ಊಟ ಆಯ್ತಾ?", "uuTa aaytaa?", "Have you eaten?"],
    ["ಊಟ ಆಯ್ತು.", "uuTa aaytu.", "I have eaten."],
    ["ನನಗೆ ಹಸಿವಾಗಿದೆ.", "nanage hasivaagide.", "I'm hungry."],
    ["ಸ್ವಲ್ಪ ನೀರು ಕೊಡಿ.", "svalpa niiru koDi.", "A little water, please."],
    ["ಇನ್ನೂ ಸ್ವಲ್ಪ ಹಾಕಲಾ?", "innuu svalpa haakalaa?", "Shall I serve you a little more?"],
    ["ಖಾರ ಕಡಿಮೆ ಇರಲಿ.", "khaara kaDime irali.", "Less spicy, please."],
    ["ತುಂಬಾ ರುಚಿಯಾಗಿದೆ!", "tumbaa ruchiyaagide!", "It's really tasty!"],
    ["ಸಾಕು, ಹೊಟ್ಟೆ ತುಂಬಿತು.", "saaku, hoTTe tumbitu.", "Enough, I'm full."],
  ], "Feelings and needs use ನನಗೆ (to me): ನನಗೆ ಹಸಿವಾಗಿದೆ is \"to me, hunger has come\". The same pattern gives ನನಗೆ ಇಷ್ಟ (I like), ನನಗೆ ಬೇಕು (I want), ನನಗೆ ಗೊತ್ತು (I know). Praising the food is the quickest way to an in-law's heart.", [
    ["them", "ಬನ್ನಿ, ಊಟಕ್ಕೆ ಕೂತ್ಕೊಳ್ಳಿ.", "banni, uuTakke kuutkoLLi.", "Come, sit down to eat."],
    ["you", "ಧನ್ಯವಾದ. ಎಲ್ಲಾ ತುಂಬಾ ಚೆನ್ನಾಗಿ ಕಾಣ್ತಿದೆ!", "dhanyavaada. ellaa tumbaa chennaagi kaaNtide!", "Thank you. Everything looks wonderful!"],
    ["them", "ಇನ್ನೂ ಸ್ವಲ್ಪ ಅನ್ನ ಹಾಕಲಾ?", "innuu svalpa anna haakalaa?", "Shall I serve a little more rice?"],
    ["you", "ಸ್ವಲ್ಪ ಸಾಕು. ಸಾರು ತುಂಬಾ ರುಚಿಯಾಗಿದೆ!", "svalpa saaku. saaru tumbaa ruchiyaagide!", "Just a little. The saaru is really tasty!"],
    ["them", "ಖಾರ ಜಾಸ್ತಿ ಆಯ್ತಾ?", "khaara jaasti aaytaa?", "Is it too spicy?"],
    ["you", "ಇಲ್ಲ, ಸರಿಯಾಗಿದೆ. ಸಾಕು, ಹೊಟ್ಟೆ ತುಂಬಿತು.", "illa, sariyaagide. saaku, hoTTe tumbitu.", "No, it's just right. Enough, I'm full."],
  ]),
  U("family", 1, "👨‍👩‍👧", "Family", "ಕುಟುಂಬ", "Introduce your family and ask about theirs.", [
    ["ಇವರು ನನ್ನ ಅಮ್ಮ.", "ivaru nanna amma.", "This is my mother."],
    ["ಇವರು ನನ್ನ ಅಪ್ಪ.", "ivaru nanna appa.", "This is my father."],
    ["ನನ್ನ ಗಂಡ, ನನ್ನ ಹೆಂಡತಿ", "nanna ganDa, nanna henDati", "My husband, my wife"],
    ["ನನಗೆ ಇಬ್ಬರು ಮಕ್ಕಳು.", "nanage ibbaru makkaLu.", "I have two children."],
    ["ಮಗ, ಮಗಳು", "maga, magaLu", "Son, daughter"],
    ["ಅಜ್ಜ, ಅಜ್ಜಿ", "ajja, ajji", "Grandfather, grandmother"],
    ["ಅತ್ತೆ, ಮಾವ", "atte, maava", "Mother-in-law, father-in-law (also aunt, uncle)"],
    ["ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಯಾರು ಯಾರು ಇದ್ದಾರೆ?", "nimma maneyalli yaaru yaaru iddaare?", "Who all live in your home?"],
  ], "ಇವರು (ivaru) is the respectful \"this person\"; use it for elders. For children: ಇವನು (this boy), ಇವಳು (this girl). Having something also uses ನನಗೆ: ನನಗೆ ಇಬ್ಬರು ಮಕ್ಕಳು is \"to me, two children\".", [
    ["them", "ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಯಾರು ಯಾರು ಇದ್ದಾರೆ?", "nimma maneyalli yaaru yaaru iddaare?", "Who all live in your home?"],
    ["you", "ನಾವು ನಾಲ್ಕು ಜನ: ನಾವಿಬ್ಬರು ಮತ್ತು ಇಬ್ಬರು ಮಕ್ಕಳು.", "naavu naalku jana: naavibbaru mattu ibbaru makkaLu.", "We are four: the two of us and two children."],
    ["them", "ಮಕ್ಕಳಿಗೆ ಎಷ್ಟು ವಯಸ್ಸು?", "makkaLige eshTu vayassu?", "How old are the children?"],
    ["you", "ಮಗನಿಗೆ ಏಳು ವರ್ಷ, ಮಗಳಿಗೆ ನಾಲ್ಕು ವರ್ಷ.", "maganige eeLu varsha, magaLige naalku varsha.", "My son is seven, my daughter is four."],
    ["them", "ಅಜ್ಜ ಅಜ್ಜಿ ಎಲ್ಲಿ ಇದ್ದಾರೆ?", "ajja ajji elli iddaare?", "Where are the grandparents?"],
    ["you", "ಅವರು ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇದ್ದಾರೆ.", "avaru bengaLuurinalli iddaare.", "They are in Bengaluru."],
  ]),
  U("partner", 1, "💞", "With your partner", "ಮನೆಯವರ ಜೊತೆ", "Everyday talk at home with a partner who speaks Kannada.", [
    ["ಇವತ್ತು ದಿನ ಹೇಗಿತ್ತು?", "ivattu dina heegittu?", "How was your day today?"],
    ["ಚೆನ್ನಾಗಿತ್ತು. ನಿಂದು?", "chennaagittu. nindu?", "Good. And yours?"],
    ["ಊಟಕ್ಕೆ ಏನು ಮಾಡೋಣ?", "uuTakke eenu maaDooNa?", "What shall we make for dinner?"],
    ["ಇವತ್ತು ನಾನು ಅಡುಗೆ ಮಾಡ್ತೀನಿ.", "ivattu naanu aDuge maaDtiini.", "I'll cook today."],
    ["ಒಂದು ಸಿನಿಮಾ ನೋಡೋಣವಾ?", "ondu sinimaa nooDooNavaa?", "Shall we watch a movie?"],
    ["ನೀನು ಸುಸ್ತಾಗಿದ್ದೀಯಾ?", "niinu sustaagiddiiyaa?", "Are you tired?"],
    ["ನಿನ್ನ ಅಮ್ಮನಿಗೆ ಫೋನ್ ಮಾಡೋಣ.", "ninna ammanige phoon maaDooNa.", "Let's call your mom."],
    ["ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸ್ತೀನಿ.", "naanu ninnannu priitistiini.", "I love you."],
  ], "With your partner, close friends and siblings, use ನೀನು (niinu) and the friendly forms: ಹೇಗಿದ್ದೀಯ, ಬಾ, ನಿಂದು (yours). With their parents and other elders, switch to ನೀವು. Trying Kannada at home, mistakes and all, means a lot to a Kannada-speaking partner and their family.", [
    ["them", "ಬಂದ್ಯಾ? ಇವತ್ತು ದಿನ ಹೇಗಿತ್ತು?", "bandyaa? ivattu dina heegittu?", "You're home? How was your day?"],
    ["you", "ಚೆನ್ನಾಗಿತ್ತು, ಸ್ವಲ್ಪ ಸುಸ್ತು. ನಿಂದು?", "chennaagittu, svalpa sustu. nindu?", "Good, a bit tiring. Yours?"],
    ["them", "ನಂದೂ ಚೆನ್ನಾಗಿತ್ತು. ಊಟಕ್ಕೆ ಏನು ಮಾಡೋಣ?", "nanduu chennaagittu. uuTakke eenu maaDooNa?", "Mine was good too. What shall we make for dinner?"],
    ["you", "ಇವತ್ತು ನಾನು ಅಡುಗೆ ಮಾಡ್ತೀನಿ.", "ivattu naanu aDuge maaDtiini.", "I'll cook today."],
    ["them", "ಅರೆ! ನಿನ್ನ ಕನ್ನಡ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!", "are! ninna kannaDa tumbaa chennaagide!", "Wow! Your Kannada is really good!"],
    ["you", "ಧನ್ಯವಾದ! ಊಟದ ಆಮೇಲೆ ಒಂದು ಸಿನಿಮಾ ನೋಡೋಣವಾ?", "dhanyavaada! uuTada aamele ondu sinimaa nooDooNavaa?", "Thanks! Shall we watch a movie after dinner?"],
  ]),
  U("guests", 1, "✈️", "Family visiting from India", "ಊರಿಂದ ನೆಂಟರು", "Welcome parents and relatives at the airport and make them comfortable.", [
    ["ಪ್ರಯಾಣ ಹೇಗಿತ್ತು?", "prayaaNa heegittu?", "How was the journey?"],
    ["ಸುಸ್ತಾಗಿದೆಯಾ?", "sustaagideyaa?", "Are you tired?"],
    ["ಲಗೇಜ್ ಎಲ್ಲಿದೆ?", "lageej ellide?", "Where is the luggage?"],
    ["ಕಾರು ಅಲ್ಲಿದೆ.", "kaaru allide.", "The car is over there."],
    ["ಮನೆ ಇಲ್ಲಿಂದ ಅರ್ಧ ಗಂಟೆ.", "mane illinda ardha ganTe.", "Home is half an hour from here."],
    ["ಇಲ್ಲಿ ತುಂಬಾ ಚಳಿ.", "illi tumbaa chaLi.", "It's very cold here."],
    ["ಆರಾಮವಾಗಿ ಇರಿ.", "aaraamavaagi iri.", "Make yourselves comfortable."],
    ["ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.", "eenu beekaadaruu keeLi.", "Ask for anything you need."],
  ], "-ಇಂದ means \"from\": ಇಲ್ಲಿಂದ (from here), ಬೆಂಗಳೂರಿನಿಂದ (from Bengaluru), ಇಂಡಿಯಾದಿಂದ (from India). ಇರಿ is the polite \"please stay / be\": ಆರಾಮವಾಗಿ ಇರಿ is how you tell guests to relax.", [
    ["you", "ಬನ್ನಿ, ಬನ್ನಿ! ಪ್ರಯಾಣ ಹೇಗಿತ್ತು?", "banni, banni! prayaaNa heegittu?", "Welcome! How was the journey?"],
    ["them", "ಚೆನ್ನಾಗಿತ್ತು, ಆದರೆ ತುಂಬಾ ಉದ್ದ.", "chennaagittu, aadare tumbaa udda.", "Good, but very long."],
    ["you", "ಸುಸ್ತಾಗಿದೆಯಾ? ಲಗೇಜ್ ಎಲ್ಲಿದೆ?", "sustaagideyaa? lageej ellide?", "Are you tired? Where's the luggage?"],
    ["them", "ಇಲ್ಲಿದೆ. ಮನೆ ಎಷ್ಟು ದೂರ?", "illide. mane eshTu duura?", "Here it is. How far is home?"],
    ["you", "ಇಲ್ಲಿಂದ ಅರ್ಧ ಗಂಟೆ. ಕಾರು ಅಲ್ಲಿದೆ.", "illinda ardha ganTe. kaaru allide.", "Half an hour from here. The car's over there."],
    ["them", "ಅಬ್ಬಾ, ಇಲ್ಲಿ ತುಂಬಾ ಚಳಿ!", "abbaa, illi tumbaa chaLi!", "Oh my, it's so cold here!"],
    ["you", "ಹೌದು! ಮನೆಗೆ ಹೋಗಿ ಬಿಸಿ ಕಾಫಿ ಕುಡಿಯೋಣ.", "houdu! manege hoogi bisi kaafi kuDiyooNa.", "Yes! Let's go home and have hot coffee."],
  ]),
  U("time", 1, "🕐", "Time and days", "ಸಮಯ", "Ask the time, make a plan to meet, say you're late.", [
    ["ಈಗ ಎಷ್ಟು ಗಂಟೆ?", "iiga eshTu ganTe?", "What time is it now?"],
    ["ಐದು ಗಂಟೆ.", "aidu ganTe.", "Five o'clock."],
    ["ಇವತ್ತು, ನಾಳೆ, ನಿನ್ನೆ", "ivattu, naaLe, ninne", "Today, tomorrow, yesterday"],
    ["ಬೆಳಿಗ್ಗೆ, ಮಧ್ಯಾಹ್ನ, ಸಂಜೆ, ರಾತ್ರಿ", "beLigge, madhyaahna, sanje, raatri", "Morning, afternoon, evening, night"],
    ["ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಸಿಗೋಣ.", "naaLe beLigge sigooNa.", "Let's meet tomorrow morning."],
    ["ಒಂದು ನಿಮಿಷ.", "ondu nimisha.", "One minute."],
    ["ಬೇಗ ಬನ್ನಿ.", "beega banni.", "Come soon."],
    ["ತಡ ಆಯ್ತು.", "taDa aaytu.", "I'm late."],
  ], "ಗಂಟೆ is hour or o'clock; ಎಷ್ಟು ಗಂಟೆಗೆ? is \"at what time?\" (-ಗೆ again). -ಓಣ makes \"let's\": ಸಿಗೋಣ (let's meet), ಹೋಗೋಣ (let's go), ತಿನ್ನೋಣ (let's eat).", [
    ["them", "ನಾಳೆ ಸಿಗೋಣವಾ?", "naaLe sigooNavaa?", "Shall we meet tomorrow?"],
    ["you", "ಹೌದು, ಸಿಗೋಣ. ಎಷ್ಟು ಗಂಟೆಗೆ?", "houdu, sigooNa. eshTu ganTege?", "Yes, let's. At what time?"],
    ["them", "ಸಂಜೆ ಆರು ಗಂಟೆಗೆ?", "sanje aaru ganTege?", "At six in the evening?"],
    ["you", "ಆರು ಗಂಟೆ ಸ್ವಲ್ಪ ತಡ. ಐದು ಗಂಟೆಗೆ ಆಗುತ್ತಾ?", "aaru ganTe svalpa taDa. aidu ganTege aaguttaa?", "Six is a bit late. Does five work?"],
    ["them", "ಸರಿ, ಐದು ಗಂಟೆಗೆ ಸಿಗೋಣ.", "sari, aidu ganTege sigooNa.", "Okay, let's meet at five."],
  ]),

  // ---------- Level 2: Everyday talk ----------
  U("kitchen", 2, "🍳", "Cooking together", "ಅಡುಗೆಮನೆಯಲ್ಲಿ", "Cook with your partner or in-laws: ask where things are, help, taste.", [
    ["ಕರಿಬೇವು ಇದೆಯಾ?", "karibeevu ideyaa?", "Do we have curry leaves?"],
    ["ಉಪ್ಪು ಎಲ್ಲಿದೆ?", "uppu ellide?", "Where is the salt?"],
    ["ಈರುಳ್ಳಿ ಕತ್ತರಿಸಲಾ?", "iiruLLi kattarisalaa?", "Shall I chop the onions?"],
    ["ಸ್ವಲ್ಪ ಉಪ್ಪು ಹಾಕು.", "svalpa uppu haaku.", "Add a little salt."],
    ["ರುಚಿ ನೋಡು.", "ruchi nooDu.", "Taste it."],
    ["ಇನ್ನೂ ಸ್ವಲ್ಪ ಖಾರ ಬೇಕು.", "innuu svalpa khaara beeku.", "It needs a bit more spice."],
    ["ಅಡುಗೆ ಆಯ್ತು!", "aDuge aaytu!", "The cooking's done!"],
    ["ನಾನು ಪಾತ್ರೆ ತೊಳೀತೀನಿ.", "naanu paatre toLiitiini.", "I'll wash the dishes."],
  ], "With your partner, requests are short: ಹಾಕು (add), ನೋಡು (look, taste), ಕೊಡು (give). With in-laws add -ಇ: ಹಾಕಿ, ನೋಡಿ, ಕೊಡಿ. -ಲಾ asks \"shall I?\": ಕತ್ತರಿಸಲಾ? (shall I chop?).", [
    ["them", "ಇವತ್ತು ಬಿಸಿಬೇಳೆ ಬಾತ್ ಮಾಡೋಣ.", "ivattu bisibeeLe baat maaDooNa.", "Let's make bisibele bath today."],
    ["you", "ಸರಿ! ನಾನು ಈರುಳ್ಳಿ ಕತ್ತರಿಸಲಾ?", "sari! naanu iiruLLi kattarisalaa?", "Okay! Shall I chop the onions?"],
    ["them", "ಹೌದು. ಕರಿಬೇವು ಇದೆಯಾ ನೋಡು.", "houdu. karibeevu ideyaa nooDu.", "Yes. See if we have curry leaves."],
    ["you", "ಇದೆ, ಫ್ರಿಜ್‌ನಲ್ಲಿ. ಉಪ್ಪು ಎಲ್ಲಿದೆ?", "ide, phrijnalli. uppu ellide?", "Yes, in the fridge. Where's the salt?"],
    ["them", "ಅಲ್ಲಿ. ರುಚಿ ನೋಡು.", "alli. ruchi nooDu.", "Over there. Taste it."],
    ["you", "ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ! ನಾನು ಪಾತ್ರೆ ತೊಳೀತೀನಿ.", "tumbaa chennaagide! naanu paatre toLiitiini.", "Delicious! I'll wash the dishes."],
  ]),
  U("visit", 2, "🏡", "Visiting family", "ನೆಂಟರ ಮನೆ", "Be a good guest (and host): welcome, coffee, taking leave.", [
    ["ಬನ್ನಿ, ಬನ್ನಿ! ಒಳಗೆ ಬನ್ನಿ.", "banni, banni! oLage banni.", "Come, come! Come inside."],
    ["ಕೂತ್ಕೊಳ್ಳಿ.", "kuutkoLLi.", "Please sit."],
    ["ಕಾಫಿ ಕುಡೀತೀರಾ?", "kaafi kuDiitiiraa?", "Will you have coffee?"],
    ["ಬೇಡ, ಪರವಾಗಿಲ್ಲ.", "beeDa, paravaagilla.", "No need, it's fine."],
    ["ಎಲ್ಲರೂ ಹೇಗಿದ್ದಾರೆ?", "ellaruu heegiddaare?", "How is everyone?"],
    ["ಎಲ್ಲರೂ ಚೆನ್ನಾಗಿದ್ದಾರೆ.", "ellaruu chennaagiddaare.", "Everyone is well."],
    ["ತುಂಬಾ ದಿನ ಆಯ್ತು!", "tumbaa dina aaytu!", "It's been so long!"],
    ["ಹೋಗಿ ಬರ್ತೀನಿ.", "hoogi bartiini.", "I'll take my leave."],
  ], "Nobody says \"I'm going\" when leaving. You say ಹೋಗಿ ಬರ್ತೀನಿ (\"I'll go and come back\") and the host answers ಹೋಗಿ ಬನ್ನಿ. ಬೇಕು (want) and ಬೇಡ (don't want) are the most useful pair in the language.", [
    ["them", "ಬನ್ನಿ, ಬನ್ನಿ! ತುಂಬಾ ದಿನ ಆಯ್ತು!", "banni, banni! tumbaa dina aaytu!", "Come in! It's been so long!"],
    ["you", "ಹೌದು! ಎಲ್ಲರೂ ಹೇಗಿದ್ದಾರೆ?", "houdu! ellaruu heegiddaare?", "Yes! How is everyone?"],
    ["them", "ಎಲ್ಲರೂ ಚೆನ್ನಾಗಿದ್ದಾರೆ. ಕೂತ್ಕೊಳ್ಳಿ. ಕಾಫಿ ಕುಡೀತೀರಾ?", "ellaruu chennaagiddaare. kuutkoLLi. kaafi kuDiitiiraa?", "Everyone's well. Sit. Coffee?"],
    ["you", "ಸ್ವಲ್ಪ ಕೊಡಿ, ಸಕ್ಕರೆ ಕಡಿಮೆ.", "svalpa koDi, sakkare kaDime.", "A little, less sugar."],
    ["them", "ಇನ್ನೂ ಸ್ವಲ್ಪ ಹೊತ್ತು ಇರಿ.", "innuu svalpa hottu iri.", "Stay a little longer."],
    ["you", "ಇಲ್ಲ, ತಡ ಆಯ್ತು. ಹೋಗಿ ಬರ್ತೀನಿ.", "illa, taDa aaytu. hoogi bartiini.", "No, it's late. I'll take my leave."],
  ]),
  U("past", 2, "⏪", "What did you do?", "ನಿನ್ನೆ ಏನು ಮಾಡಿದಿರಿ?", "Talk about yesterday, the weekend, a trip.", [
    ["ನಿನ್ನೆ ಏನು ಮಾಡಿದಿರಿ?", "ninne eenu maaDidiri?", "What did you do yesterday?"],
    ["ನಾನು ಅಂಗಡಿಗೆ ಹೋದೆ.", "naanu angaDige hoode.", "I went to the shop."],
    ["ನಾವು ಸಿನಿಮಾ ನೋಡಿದೆವು.", "naavu sinimaa nooDidevu.", "We watched a movie."],
    ["ನಾನು ಅಡುಗೆ ಮಾಡಿದೆ.", "naanu aDuge maaDide.", "I cooked."],
    ["ಅವರು ಫೋನ್ ಮಾಡಿದರು.", "avaru phoon maaDidaru.", "They called."],
    ["ನಾನು ಬೇಗ ಮಲಗಿದೆ.", "naanu beega malagide.", "I slept early."],
    ["ಮಳೆ ಬಂತು.", "maLe bantu.", "It rained."],
    ["ಚೆನ್ನಾಗಿತ್ತು.", "chennaagittu.", "It was nice."],
  ], "Past tense endings follow the person: ನಾನು -ಎ (ಮಾಡಿದೆ I did, ಹೋದೆ I went), ನಾವು -ಎವು (ಮಾಡಿದೆವು), ನೀವು -ಇರಿ (ಮಾಡಿದಿರಿ), ಅವರು -ಅರು (ಮಾಡಿದರು), ಅದು -ಇತು or -ಉ (ಆಯ್ತು, ಬಂತು).", [
    ["them", "ನಿನ್ನೆ ಏನು ಮಾಡಿದಿರಿ?", "ninne eenu maaDidiri?", "What did you do yesterday?"],
    ["you", "ಬೆಳಿಗ್ಗೆ ಅಂಗಡಿಗೆ ಹೋದೆ. ಸಂಜೆ ನಾವು ಸಿನಿಮಾ ನೋಡಿದೆವು.", "beLigge angaDige hoode. sanje naavu sinimaa nooDidevu.", "In the morning I went to the shop. In the evening we watched a movie."],
    ["them", "ಯಾವ ಸಿನಿಮಾ? ಹೇಗಿತ್ತು?", "yaava sinimaa? heegittu?", "Which movie? How was it?"],
    ["you", "ಒಂದು ಕನ್ನಡ ಸಿನಿಮಾ. ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು!", "ondu kannaDa sinimaa. tumbaa chennaagittu!", "A Kannada movie. It was really good!"],
  ]),
  U("plans", 2, "📅", "Plans", "ಮುಂದಿನ ಯೋಜನೆ", "Say what you'll do, invite people, accept or say maybe.", [
    ["ನಾಳೆ ಏನು ಮಾಡ್ತೀರಾ?", "naaLe eenu maaDtiiraa?", "What will you do tomorrow?"],
    ["ನಾನು ಆಫೀಸಿಗೆ ಹೋಗ್ತೀನಿ.", "naanu aafiisige hoogtiini.", "I'll go to the office."],
    ["ನಾವು ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋಗ್ತೀವಿ.", "naavu deevasthaanakke hoogtiivi.", "We'll go to the temple."],
    ["ಮುಂದಿನ ತಿಂಗಳು ಬೆಂಗಳೂರಿಗೆ ಬರ್ತೀವಿ.", "mundina tingaLu bengaLuurige bartiivi.", "We'll come to Bengaluru next month."],
    ["ಬಹುಶಃ.", "bahushaha.", "Maybe."],
    ["ಖಂಡಿತ ಬರ್ತೀನಿ.", "khanDita bartiini.", "I'll definitely come."],
    ["ನಿಮಗೆ ಸಮಯ ಇದೆಯಾ?", "nimage samaya ideyaa?", "Do you have time?"],
    ["ಆಮೇಲೆ ಫೋನ್ ಮಾಡ್ತೀನಿ.", "aamele phoon maaDtiini.", "I'll call later."],
  ], "Spoken present and future share one form: stem + -ತೀನಿ (I), -ತೀವಿ (we), -ತೀರಾ? (you, asking), -ತಾರೆ (they). Written Kannada is longer (ಹೋಗುತ್ತೇನೆ); both are right.", [
    ["them", "ಮುಂದಿನ ವಾರ ಏನು ಮಾಡ್ತೀರಾ?", "mundina vaara eenu maaDtiiraa?", "What are you doing next week?"],
    ["you", "ಶನಿವಾರ ನಾವು ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋಗ್ತೀವಿ.", "shanivaara naavu deevasthaanakke hoogtiivi.", "On Saturday we're going to the temple."],
    ["them", "ಭಾನುವಾರ ನಮ್ಮ ಮನೆಗೆ ಬನ್ನಿ.", "bhaanuvaara namma manege banni.", "Come to our place on Sunday."],
    ["you", "ಖಂಡಿತ ಬರ್ತೀವಿ! ಎಷ್ಟು ಗಂಟೆಗೆ?", "khanDita bartiivi! eshTu ganTege?", "We'll definitely come! What time?"],
    ["them", "ಮಧ್ಯಾಹ್ನ ಊಟಕ್ಕೆ ಬನ್ನಿ.", "madhyaahna uuTakke banni.", "Come for lunch."],
  ]),
  U("phone", 2, "📞", "On the phone", "ಫೋನಿನಲ್ಲಿ", "Call grandparents and relatives without panicking.", [
    ["ಹಲೋ, ಯಾರು ಮಾತಾಡ್ತಿರೋದು?", "haloo, yaaru maataaDtiroodu?", "Hello, who is speaking?"],
    ["ನಾನು ಅನು ಮಾತಾಡ್ತಿದ್ದೀನಿ.", "naanu Anu maataaDtiddiini.", "This is Anu speaking."],
    ["ಅಮ್ಮ ಇದ್ದಾರಾ?", "amma iddaaraa?", "Is Amma there?"],
    ["ಒಂದು ನಿಮಿಷ, ಕೊಡ್ತೀನಿ.", "ondu nimisha, koDtiini.", "One minute, I'll hand it over."],
    ["ಕೇಳಿಸ್ತಿಲ್ಲ.", "keeListilla.", "I can't hear you."],
    ["ಆಮೇಲೆ ಫೋನ್ ಮಾಡಿ.", "aamele phoon maaDi.", "Please call later."],
    ["ಸಿಗ್ನಲ್ ಇಲ್ಲ.", "signal illa.", "There's no signal."],
    ["ಸರಿ, ಇಡ್ತೀನಿ.", "sari, iDtiini.", "Okay, I'll hang up."],
  ], "-ತಿದ್ದೀನಿ is \"am ___ing\": ಮಾತಾಡ್ತಿದ್ದೀನಿ (I'm speaking), ಬರ್ತಿದ್ದೀನಿ (I'm coming). Elders may call you ನೀನು; you still answer with ನೀವು.", [
    ["them", "ಹಲೋ?", "haloo?", "Hello?"],
    ["you", "ಹಲೋ ಅಜ್ಜಿ, ನಾನು ___ ಮಾತಾಡ್ತಿದ್ದೀನಿ.", "haloo ajji, naanu ___ maataaDtiddiini.", "Hello Ajji, this is ___ speaking."],
    ["them", "ಓ! ಹೇಗಿದ್ದೀಯಾ? ಮಕ್ಕಳು ಹೇಗಿದ್ದಾರೆ?", "oo! heegiddiiyaa? makkaLu heegiddaare?", "Oh! How are you? How are the children?"],
    ["you", "ಎಲ್ಲರೂ ಚೆನ್ನಾಗಿದ್ದೀವಿ. ನೀವು ಹೇಗಿದ್ದೀರಾ?", "ellaruu chennaagiddiivi. niivu heegiddiiraa?", "We're all well. How are you?"],
    ["them", "ಚೆನ್ನಾಗಿದ್ದೀನಿ. ಊಟ ಆಯ್ತಾ?", "chennaagiddiini. uuTa aaytaa?", "I'm fine. Have you eaten?"],
    ["you", "ಆಯ್ತು. ಸರಿ ಅಜ್ಜಿ, ಆಮೇಲೆ ಫೋನ್ ಮಾಡ್ತೀನಿ.", "aaytu. sari ajji, aamele phoon maaDtiini.", "Yes. Okay Ajji, I'll call later."],
  ]),
  U("unwell", 2, "🤒", "When someone's unwell", "ಹುಷಾರಿಲ್ಲದಾಗ", "Say what's wrong, and look after your partner or in-laws when they're sick.", [
    ["ನನಗೆ ಹುಷಾರಿಲ್ಲ.", "nanage hushaarilla.", "I'm not well."],
    ["ತಲೆ ನೋವು.", "tale noovu.", "Headache."],
    ["ಹೊಟ್ಟೆ ನೋವು.", "hoTTe noovu.", "Stomach ache."],
    ["ಜ್ವರ ಇದೆ.", "jvara ide.", "I have a fever."],
    ["ಕೆಮ್ಮು, ನೆಗಡಿ", "kemmu, negaDi", "Cough, cold"],
    ["ಮಾತ್ರೆ ತಗೊಂಡ್ಯಾ?", "maatre tagonDyaa?", "Did you take the tablet?"],
    ["ವಿಶ್ರಾಂತಿ ತಗೋ.", "vishraanti tagoo.", "Get some rest."],
    ["ಡಾಕ್ಟರ್ ಹತ್ತಿರ ಹೋಗೋಣ.", "DaakTar hattira hoogooNa.", "Let's go to the doctor."],
  ], "Pain is ನೋವು: ಕಾಲು ನೋವು (leg pain), ಹಲ್ಲು ನೋವು (toothache). ಹುಷಾರು means well: ಹುಷಾರಾಗಿರಿ (take care) is said on almost every family call.", [
    ["them", "ಯಾಕೆ ಸುಸ್ತಾಗಿ ಕಾಣ್ತಿದ್ದೀಯ?", "yaake sustaagi kaaNtiddiiya?", "Why do you look so tired?"],
    ["you", "ನನಗೆ ಹುಷಾರಿಲ್ಲ. ತಲೆ ನೋವು ಇದೆ.", "nanage hushaarilla. tale noovu ide.", "I'm not well. I have a headache."],
    ["them", "ಜ್ವರ ಇದೆಯಾ?", "jvara ideyaa?", "Do you have a fever?"],
    ["you", "ಸ್ವಲ್ಪ ಇದೆ. ಮಾತ್ರೆ ತಗೊಂಡೆ.", "svalpa ide. maatre tagonDe.", "A little. I took a tablet."],
    ["them", "ವಿಶ್ರಾಂತಿ ತಗೋ. ನಾನು ಗಂಜಿ ಮಾಡ್ತೀನಿ.", "vishraanti tagoo. naanu ganji maaDtiini.", "Get some rest. I'll make ganji."],
    ["you", "ಥ್ಯಾಂಕ್ಸ್. ನಾಳೆಯೂ ಹೀಗಿದ್ರೆ ಡಾಕ್ಟರ್ ಹತ್ತಿರ ಹೋಗೋಣ.", "thyaanks. naaLeyuu heegidre DaakTar hattira hoogooNa.", "Thanks. If it's the same tomorrow, let's go to the doctor."],
  ]),
  U("feel", 2, "😊", "Likes and feelings", "ಇಷ್ಟ, ಭಾವನೆ", "Say what you like and how you feel; comfort someone.", [
    ["ನನಗೆ ಸಂಗೀತ ಇಷ್ಟ.", "nanage sangiita ishTa.", "I like music."],
    ["ನನಗೆ ಅದು ಇಷ್ಟ ಇಲ್ಲ.", "nanage adu ishTa illa.", "I don't like that."],
    ["ನಿಮಗೆ ಏನು ಇಷ್ಟ?", "nimage eenu ishTa?", "What do you like?"],
    ["ನನಗೆ ಖುಷಿ ಆಯ್ತು.", "nanage khushi aaytu.", "That made me happy."],
    ["ನನಗೆ ಬೇಜಾರಾಗಿದೆ.", "nanage beejaaraagide.", "I'm feeling low."],
    ["ನನಗೆ ಸುಸ್ತಾಗಿದೆ.", "nanage sustaagide.", "I'm tired."],
    ["ಚಿಂತೆ ಮಾಡಬೇಡಿ.", "chinte maaDabeeDi.", "Don't worry."],
    ["ಪರವಾಗಿಲ್ಲ, ಎಲ್ಲಾ ಸರಿ ಆಗುತ್ತೆ.", "paravaagilla, ellaa sari aagutte.", "It's okay, everything will be fine."],
  ], "-ಬೇಡಿ after a verb is \"please don't\": ಚಿಂತೆ ಮಾಡಬೇಡಿ (don't worry), ಹೋಗಬೇಡಿ (don't go). Feelings use ನನಗೆ again. To like doing something, add -ಓದು: ಕೇಳೋದು ಇಷ್ಟ (I like listening).", [
    ["them", "ಯಾಕೆ ಸುಮ್ಮನಿದ್ದೀರಾ?", "yaake summaniddiiraa?", "Why so quiet?"],
    ["you", "ನನಗೆ ಸ್ವಲ್ಪ ಸುಸ್ತಾಗಿದೆ.", "nanage svalpa sustaagide.", "I'm a little tired."],
    ["them", "ಚಿಂತೆ ಮಾಡಬೇಡಿ. ಬಿಡುವಿನಲ್ಲಿ ನಿಮಗೆ ಏನು ಇಷ್ಟ?", "chinte maaDabeeDi. biDuvinalli nimage eenu ishTa?", "Don't worry. What do you like doing in your free time?"],
    ["you", "ನನಗೆ ಸಂಗೀತ ಕೇಳೋದು ಇಷ್ಟ.", "nanage sangiita keeLoodu ishTa.", "I like listening to music."],
    ["them", "ನನಗೂ!", "nanaguu!", "Me too!"],
    ["you", "ನಿಮ್ಮ ಜೊತೆ ಮಾತಾಡಿ ಖುಷಿ ಆಯ್ತು.", "nimma jote maataaDi khushi aaytu.", "It was lovely talking with you."],
  ]),
  U("child", 2, "🧒", "Kannada with your child", "ಮಗುವಿನ ಜೊತೆ", "Everyday lines to use at home so your child hears Kannada daily.", [
    ["ಹೋಂವರ್ಕ್ ಆಯ್ತಾ?", "hoomvark aaytaa?", "Is your homework done?"],
    ["ಬಾ, ಕೂತ್ಕೋ.", "baa, kuutkoo.", "Come, sit."],
    ["ಇದನ್ನು ಓದು.", "idannu oodu.", "Read this."],
    ["ಚೆನ್ನಾಗಿ ಬರೆದಿದ್ದೀಯ!", "chennaagi barediddiiya!", "You've written it nicely!"],
    ["ಇನ್ನೊಂದು ಸಲ ಹೇಳು.", "innondu sala heeLu.", "Say it once more."],
    ["ಕನ್ನಡದಲ್ಲಿ ಹೇಳು.", "kannaDadalli heeLu.", "Say it in Kannada."],
    ["ಶಭಾಷ್!", "shabhaash!", "Well done!"],
    ["ಬೇಗ ಮಲಗು.", "beega malagu.", "Go to sleep early."],
  ], "With children use the ನೀನು forms. A command is just the verb: ಬಾ (come), ಓದು (read), ಹೇಳು (say), ಮಲಗು (sleep). With elders add -ಇ: ಬನ್ನಿ, ಓದಿ, ಹೇಳಿ, ಮಲಗಿ. A few Kannada lines at home every day help your child more than anything else.", [
    ["you", "ಬಾ, ಕೂತ್ಕೋ. ಹೋಂವರ್ಕ್ ಆಯ್ತಾ?", "baa, kuutkoo. hoomvark aaytaa?", "Come, sit. Is your homework done?"],
    ["them", "ಇನ್ನೂ ಇಲ್ಲ.", "innuu illa.", "Not yet."],
    ["you", "ಸರಿ, ಇದನ್ನು ಓದು.", "sari, idannu oodu.", "Okay, read this."],
    ["them", "ಅ, ಆ, ಇ, ಈ...", "a, aa, i, ii...", "a, aa, i, ii..."],
    ["you", "ಶಭಾಷ್! ಈಗ ಕನ್ನಡದಲ್ಲಿ ಹೇಳು: ನನಗೆ ಹಸಿವಾಗಿದೆ.", "shabhaash! iiga kannaDadalli heeLu: nanage hasivaagide.", "Well done! Now say it in Kannada: I'm hungry."],
    ["them", "ನನಗೆ ಹಸಿವಾಗಿದೆ!", "nanage hasivaagide!", "I'm hungry!"],
  ]),

  // ---------- Level 3: Read and write (with the letter journey) ----------
  U("friends", 3, "🫶", "Friends come over", "ಸ್ನೇಹಿತರು ಬಂದಾಗ", "Welcome Kannada-speaking friends, catch up, and see them off. Try reading each line before the English letters.", [
    ["ಬನ್ನಿ, ಒಳಗೆ ಬನ್ನಿ!", "banni, oLage banni!", "Come in, come in!"],
    ["ಏನು ಸಮಾಚಾರ?", "eenu samaachaara?", "What's new?"],
    ["ಎಲ್ಲಾ ಚೆನ್ನಾಗಿದೆ.", "ellaa chennaagide.", "All good."],
    ["ತುಂಬಾ ದಿನ ಆಯ್ತು ಸಿಕ್ಕಿ!", "tumbaa dina aaytu sikki!", "It's been ages since we met!"],
    ["ಮಕ್ಕಳು ಹೇಗಿದ್ದಾರೆ?", "makkaLu heegiddaare?", "How are the kids?"],
    ["ಟೀ ಬೇಕಾ, ಕಾಫಿ ಬೇಕಾ?", "Tii beekaa, kaafi beekaa?", "Tea or coffee?"],
    ["ಬಂದಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ.", "bandiddakke dhanyavaada.", "Thanks for coming."],
    ["ಮತ್ತೆ ಬೇಗ ಸಿಗೋಣ.", "matte beega sigooNa.", "Let's meet again soon."],
  ], "ಏನು ಸಮಾಚಾರ? (literally \"what's the news?\") is the friendly \"what's up?\". Use ನೀನು with close friends your own age, and ನೀವು with their parents. Reading practice: cover the English letters and read each line from the Kannada first.", [
    ["you", "ಬನ್ನಿ, ಒಳಗೆ ಬನ್ನಿ! ತುಂಬಾ ದಿನ ಆಯ್ತು ಸಿಕ್ಕಿ!", "banni, oLage banni! tumbaa dina aaytu sikki!", "Come in! It's been ages!"],
    ["them", "ಹೌದು! ಏನು ಸಮಾಚಾರ?", "houdu! eenu samaachaara?", "Yes! What's new?"],
    ["you", "ಎಲ್ಲಾ ಚೆನ್ನಾಗಿದೆ. ಮಕ್ಕಳು ಹೇಗಿದ್ದಾರೆ?", "ellaa chennaagide. makkaLu heegiddaare?", "All good. How are the kids?"],
    ["them", "ಚೆನ್ನಾಗಿದ್ದಾರೆ. ನಿಮ್ಮ ಕನ್ನಡ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!", "chennaagiddaare. nimma kannaDa tumbaa chennaagide!", "They're fine. Your Kannada is really good!"],
    ["you", "ಧನ್ಯವಾದ, ಕಲಿಯುತ್ತಿದ್ದೇನೆ. ಟೀ ಬೇಕಾ, ಕಾಫಿ ಬೇಕಾ?", "dhanyavaada, kaliyuttiddeene. Tii beekaa, kaafi beekaa?", "Thanks, I'm learning. Tea or coffee?"],
    ["them", "ಕಾಫಿ. ಆಮೇಲೆ ನಾವು ಹೊರಡಬೇಕು.", "kaafi. aamele naavu horaDabeeku.", "Coffee. We'll have to leave after that."],
    ["you", "ಬಂದಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ. ಮತ್ತೆ ಬೇಗ ಸಿಗೋಣ.", "bandiddakke dhanyavaada. matte beega sigooNa.", "Thanks for coming. Let's meet again soon."],
  ]),
  U("menu", 3, "📜", "Reading the menu together", "ಮೆನು ಓದು", "Eating out with your partner: read the Kannada menu aloud and choose together.", [
    ["ಇಡ್ಲಿ ವಡೆ", "iDli vaDe", "Idli vada"],
    ["ಮಸಾಲೆ ದೋಸೆ", "masaale doose", "Masala dosa"],
    ["ಬಿಸಿಬೇಳೆ ಬಾತ್", "bisibeeLe baat", "Bisibele bath"],
    ["ಉಪ್ಪಿಟ್ಟು", "uppiTTu", "Upma"],
    ["ಮೊಸರನ್ನ", "mosaranna", "Curd rice"],
    ["ಫಿಲ್ಟರ್ ಕಾಫಿ", "philTar kaafi", "Filter coffee"],
    ["ಊಟ ಸಿದ್ಧ", "uuTa siddha", "Meals ready"],
    ["ಬೆಲೆ", "bele", "Price"],
  ], "Menus are perfect reading practice because you already know the words, so you can check yourself. ಅನ್ನ is cooked rice: ಮೊಸರು (curd) + ಅನ್ನ = ಮೊಸರನ್ನ. Notice ಬಾತ್ ends in ್ (no vowel): that little mark removes the \"a\" sound.", [
    ["them", "ಮೆನು ಓದು, ಏನು ತಗೊಳ್ಳೋಣ?", "menu oodu, eenu tagoLLooNa?", "Read the menu: what shall we get?"],
    ["you", "ಮಸಾಲೆ ದೋಸೆ ಇದೆ, ಬಿಸಿಬೇಳೆ ಬಾತ್ ಕೂಡ ಇದೆ.", "masaale doose ide, bisibeeLe baat kuuDa ide.", "There's masala dosa, and bisibele bath too."],
    ["them", "ನೀನು ಕನ್ನಡ ಓದ್ತಿದ್ದೀಯ!", "niinu kannaDa oodtiddiiya!", "You're reading Kannada!"],
    ["you", "ಹೌದು! ನನಗೆ ಮಸಾಲೆ ದೋಸೆ ಬೇಕು.", "houdu! nanage masaale doose beeku.", "Yes! I want masala dosa."],
    ["them", "ನಾನು ಇಡ್ಲಿ ವಡೆ ತಗೋತೀನಿ. ಕಾಫಿ?", "naanu iDli vaDe tagootiini. kaafi?", "I'll have idli vada. Coffee?"],
    ["you", "ಹೌದು, ಎರಡು ಫಿಲ್ಟರ್ ಕಾಫಿ.", "houdu, eraDu philTar kaafi.", "Yes, two filter coffees."],
  ]),
  U("messages", 3, "💬", "Messages and greetings", "ಸಂದೇಶ", "Write short WhatsApp messages and greetings in Kannada.", [
    ["ಶುಭೋದಯ", "shubhoodaya", "Good morning"],
    ["ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು", "huTTuhabbada shubhaashayagaLu", "Happy birthday"],
    ["ಹಬ್ಬದ ಶುಭಾಶಯಗಳು", "habbada shubhaashayagaLu", "Festival greetings"],
    ["ತಲುಪಿದೆ.", "talupide.", "I've reached."],
    ["ಐದು ನಿಮಿಷದಲ್ಲಿ ಬರ್ತೀನಿ.", "aidu nimishadalli bartiini.", "I'll be there in five minutes."],
    ["ಆಮೇಲೆ ಮಾತಾಡೋಣ.", "aamele maataaDooNa.", "Let's talk later."],
    ["ಹುಷಾರಾಗಿರಿ.", "hushaaraagiri.", "Take care."],
    ["ಎಲ್ಲರಿಗೂ ನಮಸ್ಕಾರ ತಿಳಿಸಿ.", "ellarigu namaskaara tiLisi.", "Give my regards to everyone."],
  ], "Add a Kannada keyboard on your phone. iPhone: Settings → General → Keyboard → Keyboards → Add New Keyboard → Kannada. Android: Gboard → Settings → Languages → Add → Kannada. Gboard can also turn typed English letters (namaskara) into ನಮಸ್ಕಾರ.", [
    ["them", "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "huTTuhabbada shubhaashayagaLu!", "Happy birthday!"],
    ["you", "ಧನ್ಯವಾದಗಳು! ಸಂಜೆ ಮನೆಗೆ ಬನ್ನಿ.", "dhanyavaadagaLu! sanje manege banni.", "Thank you! Come over this evening."],
    ["them", "ಖಂಡಿತ. ಎಷ್ಟು ಗಂಟೆಗೆ?", "khanDita. eshTu ganTege?", "Sure. What time?"],
    ["you", "ಏಳು ಗಂಟೆಗೆ.", "eeLu ganTege.", "At seven."],
    ["them", "ಸರಿ, ತಲುಪಿದಾಗ ಮೆಸೇಜ್ ಮಾಡ್ತೀನಿ.", "sari, talupidaaga meseej maaDtiini.", "Okay, I'll message when I reach."],
  ]),
  U("festivals", 3, "🪔", "Festivals", "ಹಬ್ಬಗಳು", "Greet people for festivals and say what your family does.", [
    ["ದೀಪಾವಳಿ, ಯುಗಾದಿ, ಸಂಕ್ರಾಂತಿ", "diipaavaLi, yugaadi, sankraanti", "Deepavali, Ugadi, Sankranti"],
    ["ಹಬ್ಬಕ್ಕೆ ಏನು ಮಾಡ್ತೀರಾ?", "habbakke eenu maaDtiiraa?", "What do you do for the festival?"],
    ["ಹೋಳಿಗೆ ಮಾಡ್ತೀವಿ.", "hooLige maaDtiivi.", "We make holige."],
    ["ಎಳ್ಳು ಬೆಲ್ಲ ತಿಂದು ಒಳ್ಳೆ ಮಾತಾಡಿ.", "eLLu bella tindu oLLe maataaDi.", "Eat sesame and jaggery, and speak kindly."],
    ["ಬೇವು ಬೆಲ್ಲ", "beevu bella", "Neem and jaggery"],
    ["ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋಗ್ತೀವಿ.", "deevasthaanakke hoogtiivi.", "We go to the temple."],
    ["ಮನೆ ಮುಂದೆ ರಂಗೋಲಿ ಹಾಕ್ತೀವಿ.", "mane munde rangooli haaktiivi.", "We draw rangoli in front of the house."],
    ["ಹೊಸ ಬಟ್ಟೆ ಹಾಕೊಳ್ತೀವಿ.", "hosa baTTe haakoLtiivi.", "We wear new clothes."],
  ], "Festival greeting pattern: ___ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು (ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು). At Ugadi, ಬೇವು ಬೆಲ್ಲ (neem and jaggery) stands for life's bitter and sweet. At Sankranti people swap ಎಳ್ಳು and say ಎಳ್ಳು ಬೆಲ್ಲ ತಿಂದು ಒಳ್ಳೆ ಮಾತಾಡಿ.", [
    ["them", "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "yugaadi habbada shubhaashayagaLu!", "Happy Ugadi!"],
    ["you", "ನಿಮಗೂ ಶುಭಾಶಯಗಳು!", "nimaguu shubhaashayagaLu!", "Same to you!"],
    ["them", "ಹಬ್ಬಕ್ಕೆ ಏನು ಮಾಡಿದಿರಿ?", "habbakke eenu maaDidiri?", "What did you do for the festival?"],
    ["you", "ಹೋಳಿಗೆ ಮಾಡಿದೆವು. ಬೇವು ಬೆಲ್ಲ ತಿಂದೆವು.", "hooLige maaDidevu. beevu bella tindevu.", "We made holige. We ate neem and jaggery."],
    ["them", "ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!", "tumbaa chennaagide!", "Lovely!"],
  ]),

  // ---------- Level 4: Fluent ----------
  U("opinion", 4, "💡", "Giving opinions", "ಅಭಿಪ್ರಾಯ", "Agree, disagree and give reasons.", [
    ["ನನ್ನ ಅಭಿಪ್ರಾಯದಲ್ಲಿ...", "nanna abhipraayadalli...", "In my opinion..."],
    ["ನನಗೆ ಅನ್ಸುತ್ತೆ...", "nanage ansutte...", "I feel that..."],
    ["ನೀವು ಹೇಳೋದು ಸರಿ.", "niivu heeLoodu sari.", "What you say is right."],
    ["ನಾನು ಒಪ್ಪಲ್ಲ.", "naanu oppalla.", "I don't agree."],
    ["ಯಾಕೆಂದರೆ...", "yaakendare...", "Because..."],
    ["ಆದರೆ...", "aadare...", "But..."],
    ["ಅದಕ್ಕೆ...", "adakke...", "So..."],
    ["ನೀವು ಏನು ಅಂತೀರಾ?", "niivu eenu antiiraa?", "What do you say?"],
  ], "ಅಂತ (anta) marks what someone thinks or says: ಚೆನ್ನಾಗಿದೆ ಅಂತ ಅನ್ಸುತ್ತೆ (I feel that it's good). Linking words: ಮತ್ತು (and), ಆದರೆ (but), ಯಾಕೆಂದರೆ (because), ಅದಕ್ಕೆ (so).", [
    ["them", "ಮಕ್ಕಳು ಕನ್ನಡ ಕಲಿಯಬೇಕಾ?", "makkaLu kannaDa kaliyabeekaa?", "Should children learn Kannada?"],
    ["you", "ಹೌದು, ಕಲಿಯಬೇಕು ಅಂತ ನನಗೆ ಅನ್ಸುತ್ತೆ.", "houdu, kaliyabeeku anta nanage ansutte.", "Yes, I feel they should."],
    ["them", "ಯಾಕೆ? ಇಲ್ಲಿ ಎಲ್ಲಾ ಇಂಗ್ಲಿಷ್ ಅಲ್ವಾ?", "yaake? illi ellaa inglish alvaa?", "Why? Isn't everything in English here?"],
    ["you", "ಹೌದು, ಆದರೆ ಅಜ್ಜ ಅಜ್ಜಿ ಜೊತೆ ಮಾತಾಡೋಕೆ ಕನ್ನಡ ಬೇಕು.", "houdu, aadare ajja ajji jote maataaDooke kannaDa beeku.", "Yes, but they need Kannada to talk with their grandparents."],
    ["them", "ನೀವು ಹೇಳೋದು ಸರಿ.", "niivu heeLoodu sari.", "You're right."],
    ["you", "ಅದಕ್ಕೆ ನಾವು ಮನೆಯಲ್ಲಿ ಕನ್ನಡ ಮಾತಾಡ್ತೀವಿ.", "adakke naavu maneyalli kannaDa maataaDtiivi.", "That's why we speak Kannada at home."],
  ]),
  U("story", 4, "📖", "Telling a story", "ಕಥೆ ಹೇಳು", "Tell what happened, in order, with feeling.", [
    ["ಒಂದು ದಿನ...", "ondu dina...", "One day..."],
    ["ಮೊದಲು...", "modalu...", "First..."],
    ["ಆಮೇಲೆ...", "aamele...", "After that..."],
    ["ಅಷ್ಟರಲ್ಲಿ...", "ashTaralli...", "Just then..."],
    ["ಕೊನೆಗೆ...", "konege...", "In the end..."],
    ["ಏನಾಯ್ತು ಗೊತ್ತಾ?", "eenaaytu gottaa?", "Guess what happened?"],
    ["ನನಗೆ ಆಶ್ಚರ್ಯ ಆಯ್ತು.", "nanage aashcharya aaytu.", "I was surprised."],
    ["ಎಲ್ಲರೂ ನಕ್ಕರು.", "ellaruu nakkaru.", "Everyone laughed."],
  ], "Chain actions instead of saying \"and then\": ಅಂಗಡಿಗೆ ಹೋಗಿ, ಹಾಲು ತಗೊಂಡು, ಮನೆಗೆ ಬಂದೆ (I went to the shop, got milk and came home). Only the last verb carries the tense. The story corner has 12 short stories to read aloud.", [
    ["them", "ನಿಮ್ಮ ಪ್ರಯಾಣ ಹೇಗಿತ್ತು?", "nimma prayaaNa heegittu?", "How was your trip?"],
    ["you", "ಏನಾಯ್ತು ಗೊತ್ತಾ? ಮೊದಲು ನಮ್ಮ ವಿಮಾನ ತಡ ಆಯ್ತು.", "eenaaytu gottaa? modalu namma vimaana taDa aaytu.", "Guess what? First our flight was late."],
    ["them", "ಅಯ್ಯೋ! ಆಮೇಲೆ?", "ayyoo! aamele?", "Oh no! Then?"],
    ["you", "ಅಷ್ಟರಲ್ಲಿ ನಮ್ಮ ಹಳೇ ಸ್ನೇಹಿತರು ಸಿಕ್ಕರು!", "ashTaralli namma haLee sneehitaru sikkaru!", "Just then we ran into our old friends!"],
    ["them", "ಅರೆ, ಎಂಥಾ ಅದೃಷ್ಟ!", "are, enthaa adrushTa!", "Wow, what luck!"],
    ["you", "ಕೊನೆಗೆ ಎಲ್ಲರೂ ಒಟ್ಟಿಗೆ ಕಾಫಿ ಕುಡಿದು ಮನೆಗೆ ಬಂದೆವು.", "konege ellaruu oTTige kaafi kuDidu manege bandevu.", "In the end we all had coffee together and came home."],
  ]),
  U("work", 4, "💼", "Work and routine", "ಕೆಲಸ, ದಿನಚರಿ", "Describe your job and your day; talk shop with friends.", [
    ["ನಾನು ಇಂಜಿನಿಯರ್ ಆಗಿ ಕೆಲಸ ಮಾಡ್ತೀನಿ.", "naanu injiniyar aagi kelasa maaDtiini.", "I work as an engineer."],
    ["ನಾನು ಮನೆಯಿಂದ ಕೆಲಸ ಮಾಡ್ತೀನಿ.", "naanu maneyinda kelasa maaDtiini.", "I work from home."],
    ["ಬೆಳಿಗ್ಗೆ ಆರು ಗಂಟೆಗೆ ಏಳ್ತೀನಿ.", "beLigge aaru ganTege eeLtiini.", "I get up at six in the morning."],
    ["ದಿನಾ ವಾಕ್ ಹೋಗ್ತೀನಿ.", "dinaa vaak hoogtiini.", "I go for a walk every day."],
    ["ಇವತ್ತು ತುಂಬಾ ಕೆಲಸ ಇದೆ.", "ivattu tumbaa kelasa ide.", "There's a lot of work today."],
    ["ವಾರದ ಕೊನೆಯಲ್ಲಿ ಬಿಡುವು ಇದೆ.", "vaarada koneyalli biDuvu ide.", "I'm free at the weekend."],
    ["ಮೀಟಿಂಗ್ ಮುಗೀತು.", "miiTing mugiitu.", "The meeting is over."],
    ["ಕೆಲಸ ಹೇಗೆ ನಡೀತಿದೆ?", "kelasa heege naDiitide?", "How's work going?"],
  ], "Kannada borrows English words freely and adds its own endings: ಆಫೀಸಿಗೆ (to the office), ಮೀಟಿಂಗ್‌ನಲ್ಲಿ (in the meeting). That's everyday Kannada, not a mistake. ___ ಆಗಿ means \"as a ___\".", [
    ["them", "ಕೆಲಸ ಹೇಗೆ ನಡೀತಿದೆ?", "kelasa heege naDiitide?", "How's work going?"],
    ["you", "ಚೆನ್ನಾಗಿ ನಡೀತಿದೆ. ಆದರೆ ಇವತ್ತು ತುಂಬಾ ಕೆಲಸ ಇದೆ.", "chennaagi naDiitide. aadare ivattu tumbaa kelasa ide.", "Going well. But there's a lot of work today."],
    ["them", "ನೀವು ಆಫೀಸಿಗೆ ಹೋಗ್ತೀರಾ?", "niivu aafiisige hoogtiiraa?", "Do you go to the office?"],
    ["you", "ಇಲ್ಲ, ನಾನು ಮನೆಯಿಂದ ಕೆಲಸ ಮಾಡ್ತೀನಿ.", "illa, naanu maneyinda kelasa maaDtiini.", "No, I work from home."],
    ["them", "ವಾರದ ಕೊನೆಯಲ್ಲಿ ಬಿಡುವು ಇದೆಯಾ?", "vaarada koneyalli biDuvu ideyaa?", "Are you free at the weekend?"],
    ["you", "ಇದೆ! ಭಾನುವಾರ ಸಿಗೋಣ.", "ide! bhaanuvaara sigooNa.", "Yes! Let's meet on Sunday."],
  ]),
  U("elders", 4, "🙏", "Speaking with elders", "ಹಿರಿಯರ ಜೊತೆ", "Speak respectfully with your partner's parents and grandparents at family gatherings.", [
    ["ದಯವಿಟ್ಟು", "dayaviTTu", "Please"],
    ["ಕ್ಷಮಿಸಿ", "kshamisi", "Excuse me, sorry"],
    ["ತಾವು ಹೇಗಿದ್ದೀರಿ?", "taavu heegiddiiri?", "How are you? (very respectful)"],
    ["ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು.", "nimma sahaayakke dhanyavaadagaLu.", "Thank you for your help."],
    ["ದಯವಿಟ್ಟು ಕುಳಿತುಕೊಳ್ಳಿ.", "dayaviTTu kuLitukoLLi.", "Please have a seat."],
    ["ನಿಮ್ಮನ್ನು ಒಂದು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದಾ?", "nimmannu ondu prashne keeLabahudaa?", "May I ask you a question?"],
    ["ನಿಮ್ಮ ಆಶೀರ್ವಾದ ಬೇಕು.", "nimma aashiirvaada beeku.", "Please bless us."],
    ["ಇಂತಿ ನಿಮ್ಮ ವಿಶ್ವಾಸಿ", "inti nimma vishvaasi", "Yours sincerely (to end a letter)"],
  ], "Respectful Kannada keeps full verb endings: ಕುಳಿತುಕೊಳ್ಳಿ (respectful) and ಕೂತ್ಕೊಳ್ಳಿ (everyday) mean the same. -ಬಹುದು is may or can: ಕೇಳಬಹುದಾ? (may I ask?). ತಾವು is an extra-respectful \"you\" for grandparents and honoured guests.", [
    ["you", "ನಮಸ್ಕಾರ ತಾತ. ತಾವು ಹೇಗಿದ್ದೀರಿ?", "namaskaara taata. taavu heegiddiiri?", "Namaskara, Tata. How are you?"],
    ["them", "ಚೆನ್ನಾಗಿದ್ದೀನಿ. ನಿನಗೆ ಕನ್ನಡ ಬರುತ್ತಾ?", "chennaagiddiini. ninage kannaDa baruttaa?", "I'm well. You know Kannada?"],
    ["you", "ಸ್ವಲ್ಪ ಕಲಿಯುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಕುಳಿತುಕೊಳ್ಳಿ.", "svalpa kaliyuttiddeene. dayaviTTu kuLitukoLLi.", "I'm learning a little. Please have a seat."],
    ["them", "ತುಂಬಾ ಸಂತೋಷ!", "tumbaa santoosha!", "That makes me so happy!"],
    ["you", "ನಿಮ್ಮನ್ನು ಒಂದು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದಾ? ನಿಮ್ಮ ಮದುವೆ ಹೇಗಾಯ್ತು?", "nimmannu ondu prashne keeLabahudaa? nimma maduve heegaaytu?", "May I ask you something? How did you two get married?"],
    ["them", "ಅದೊಂದು ದೊಡ್ಡ ಕಥೆ! ಕೂತ್ಕೋ, ಹೇಳ್ತೀನಿ.", "adondu doDDa kathe! kuutkoo, heeLtiini.", "That's a long story! Sit, I'll tell you."],
  ]),
];

export const unitsOf = (level) => UNITS.filter((u) => u.level === level);
export const doneUnits = (c) => (c && c.adultDone) || {};
// Next lesson: the first unfinished one at your level, then the next level up, then anything left.
export function nextUnit(c) {
  const L = adultLevelOf(c), done = doneUnits(c);
  return UNITS.find((u) => u.level === L && !done[u.id]) || UNITS.find((u) => u.level > L && !done[u.id]) || UNITS.find((u) => !done[u.id]) || null;
}
export const unitNo = (u) => UNITS.indexOf(u) + 1;

// Six months: about one new lesson a week (24 weeks), with practice in between.
// A lesson finished this week means "this week's lesson is done": the home page suggests practice,
// and the learner can still start the next one early.
export function adultPace(c, now = Date.now()) {
  const week = Math.max(1, childWeek(c, now));
  const since = weekStart(c, week);
  const done = doneUnits(c);
  const stamps = Object.values(done).map(Number).filter(Boolean);
  const thisWeek = stamps.some((t) => t >= since);
  const doneList = UNITS.filter((u) => done[u.id]);
  const review = doneList.length ? doneList[(week * 7) % doneList.length] : null;
  return { week, weeks: PLAN_WEEKS, thisWeek, review, doneCount: doneList.length };
}

// One lesson, about 15 to 20 minutes, using the same activities children use.
export function unitSteps(u) {
  const P = u.phrases, D = u.dialogue;
  const buildable = [...P.map((p) => [p[0], p[2]]), ...D.filter((d) => d[0] === "you").map((d) => [d[1], d[3]])]
    .filter(([kn]) => !/___|\.\.\.|,\s/.test(kn) && kn.split(/\s+/).length >= 3 && kn.split(/\s+/).length <= 7);
  const roleplay = D.map((d, i) => d[0] !== "you" ? null : {
    q: i > 0 && D[i - 1][0] !== "you" ? D[i - 1][1] : "",
    qEn: i > 0 && D[i - 1][0] !== "you" ? D[i - 1][3] : "You start the conversation",
    a: d[1], aEn: `${d[3]}  (${d[2]})`, hints: [],
  }).filter(Boolean);
  return [
    { kind: "listen", title: "New phrases", cards: P.map(([kn, rom, en]) => ({ kn, rom, en })) },
    { kind: "dialogue", title: "How it works", unit: u },
    { kind: "speak", title: "Say them", items: P.filter((p) => !/\.\.\.$/.test(p[0])).slice(0, 5).map(([kn, rom, en]) => ({ kn, rom, en })) },
    { kind: "play", title: "What does it mean?", mode: "sentences", sentences: [...P, ...D].map((x) => x.length === 4 ? [x[1], x[3]] : [x[0], x[2]]) },
    { kind: "talk", title: "Role-play", items: roleplay },
    ...(buildable.length >= 2 ? [{ kind: "build", title: "Build sentences", rounds: buildable.slice(0, 4).map(([kn, en]) => ({ type: "order", kn, en })) }] : []),
  ];
}
