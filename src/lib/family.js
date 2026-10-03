// Family talks for children in the USA: short, real conversations with Amma, Appa, Ajji and Tata,
// each ending with the child WRITING a line for that person and sending it to them.
// Line: [who, kannada, roman, english]; who = "them" (Gini plays the family member) or "you" (the child).
// write: [word, phrase, sentence] as [kannada, roman, english]; which one depends on the child's level.

const T = (id, pic, who, en, kn, goal, lines, write, note) => ({ id, pic, who, en, kn, goal, lines, write, note });

export const FAMILY_TALKS = [
  T("call-ajji", "📞", "Ajji", "Video call with Ajji", "ಅಜ್ಜಿ ಜೊತೆ ಫೋನ್", "Say hello, answer Ajji's questions, and tell her you miss her.", [
    ["them", "ಹಲೋ ಪುಟ್ಟ! ಹೇಗಿದ್ದೀಯ?", "haloo puTTa! heegiddiiya?", "Hello little one! How are you?"],
    ["you", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ ಅಜ್ಜಿ. ನೀವು ಹೇಗಿದ್ದೀರಾ?", "naanu chennaagiddiini ajji. niivu heegiddiiraa?", "I'm fine, Ajji. How are you?"],
    ["them", "ನಾನೂ ಚೆನ್ನಾಗಿದ್ದೀನಿ. ಊಟ ಆಯ್ತಾ?", "naanuu chennaagiddiini. uuTa aaytaa?", "I'm fine too. Have you eaten?"],
    ["you", "ಆಯ್ತು ಅಜ್ಜಿ. ನಿಮ್ದು?", "aaytu ajji. nimdu?", "Yes, Ajji. Have you?"],
    ["them", "ಆಯ್ತು. ಶಾಲೆ ಹೇಗಿದೆ?", "aaytu. shaale heegide?", "Yes. How is school?"],
    ["you", "ಚೆನ್ನಾಗಿದೆ! ಅಜ್ಜಿ, ನಾನು ನಿಮ್ಮನ್ನು ತುಂಬಾ ಮಿಸ್ ಮಾಡ್ತೀನಿ.", "chennaagide! ajji, naanu nimmannu tumbaa mis maaDtiini.", "It's good! Ajji, I miss you a lot."],
  ], [["ಅಜ್ಜಿ", "ajji", "Grandma"], ["ಊಟ ಆಯ್ತು", "uuTa aaytu", "I've eaten"], ["ಅಜ್ಜಿ, ನೀವು ಹೇಗಿದ್ದೀರಾ?", "ajji, niivu heegiddiiraa?", "Ajji, how are you?"]],
  "Many children say ನೀವು (niivu) to grandparents to show respect. Ask at home what your family says!"),
  T("school-amma", "🎒", "Amma", "Telling Amma about school", "ಅಮ್ಮನಿಗೆ ಶಾಲೆಯ ಸುದ್ದಿ", "Tell Amma what you did today and how you feel.", [
    ["them", "ಬಂದ್ಯಾ ಮಗು! ಇವತ್ತು ಶಾಲೆಯಲ್ಲಿ ಏನು ಮಾಡಿದೆ?", "bandyaa magu! ivattu shaaleyalli eenu maaDide?", "You're home! What did you do at school today?"],
    ["you", "ನಾವು ಚಿತ್ರ ಬಿಡಿಸಿದೆವು.", "naavu chitra biDisidevu.", "We drew pictures."],
    ["them", "ಎಷ್ಟು ಚೆನ್ನಾಗಿದೆ! ನಿನ್ನ ಸ್ನೇಹಿತರು ಹೇಗಿದ್ದಾರೆ?", "eshTu chennaagide! ninna sneehitaru heegiddaare?", "How lovely! How are your friends?"],
    ["you", "ಚೆನ್ನಾಗಿದ್ದಾರೆ. ನಾವು ಹೊರಗೆ ಆಟ ಆಡಿದೆವು.", "chennaagiddaare. naavu horage aaTa aaDidevu.", "They're fine. We played outside."],
    ["them", "ಹಸಿವಾಗಿದೆಯಾ?", "hasivaagideyaa?", "Are you hungry?"],
    ["you", "ಹೌದು ಅಮ್ಮ, ತುಂಬಾ ಹಸಿವಾಗಿದೆ!", "houdu amma, tumbaa hasivaagide!", "Yes Amma, I'm very hungry!"],
  ], [["ಅಮ್ಮ", "amma", "Mom"], ["ನನಗೆ ಹಸಿವಾಗಿದೆ", "nanage hasivaagide", "I'm hungry"], ["ನಾವು ಹೊರಗೆ ಆಟ ಆಡಿದೆವು.", "naavu horage aaTa aaDidevu.", "We played outside."]],
  "Tell Amma one thing about your day in Kannada every evening. It's the best practice there is."),
  T("cook-appa", "🍳", "Appa", "Helping Appa cook", "ಅಪ್ಪನಿಗೆ ಸಹಾಯ", "Help in the kitchen and tell Appa the food is tasty.", [
    ["them", "ಬಾ, ನನಗೆ ಸಹಾಯ ಮಾಡು.", "baa, nanage sahaaya maaDu.", "Come, help me."],
    ["you", "ಸರಿ ಅಪ್ಪ! ಏನು ಮಾಡಬೇಕು?", "sari appa! eenu maaDabeeku?", "Okay Appa! What should I do?"],
    ["them", "ಈ ತರಕಾರಿ ತೊಳೆ.", "ii tarakaari toLe.", "Wash these vegetables."],
    ["you", "ತೊಳೆದೆ! ಇನ್ನೇನು?", "toLede! inneenu?", "Done! What else?"],
    ["them", "ಈಗ ತಟ್ಟೆ ಇಡು.", "iiga taTTe iDu.", "Now set the plates."],
    ["you", "ಅಪ್ಪ, ಊಟ ತುಂಬಾ ರುಚಿಯಾಗಿದೆ!", "appa, uuTa tumbaa ruchiyaagide!", "Appa, the food is really tasty!"],
  ], [["ಅಪ್ಪ", "appa", "Dad"], ["ಊಟ ರುಚಿಯಾಗಿದೆ", "uuTa ruchiyaagide", "The food is tasty"], ["ಅಪ್ಪ, ಊಟ ತುಂಬಾ ರುಚಿಯಾಗಿದೆ.", "appa, uuTa tumbaa ruchiyaagide.", "Appa, the food is really tasty."]],
  "Grown-ups tell children what to do with short words: ಬಾ (come), ತೊಳೆ (wash), ಇಡು (put)."),
  T("story-tata", "🌙", "Tata", "Bedtime story with Tata", "ತಾತನ ಕಥೆ", "Ask Tata for a story and say good night.", [
    ["you", "ತಾತ, ಒಂದು ಕಥೆ ಹೇಳಿ.", "taata, ondu kathe heeLi.", "Tata, tell me a story."],
    ["them", "ಯಾವ ಕಥೆ ಬೇಕು?", "yaava kathe beeku?", "Which story do you want?"],
    ["you", "ಆನೆಯ ಕಥೆ ಹೇಳಿ!", "aaneya kathe heeLi!", "Tell me the elephant story!"],
    ["them", "ಒಂದು ಕಾಡಿನಲ್ಲಿ ಒಂದು ದೊಡ್ಡ ಆನೆ ಇತ್ತು...", "ondu kaaDinalli ondu doDDa aane ittu...", "In a forest there was a big elephant..."],
    ["you", "ಆಮೇಲೆ ಏನಾಯ್ತು?", "aamele eenaaytu?", "Then what happened?"],
    ["them", "ನಾಳೆ ಹೇಳ್ತೀನಿ. ಈಗ ಮಲಗು.", "naaLe heeLtiini. iiga malagu.", "I'll tell you tomorrow. Now sleep."],
    ["you", "ಶುಭ ರಾತ್ರಿ ತಾತ!", "shubha raatri taata!", "Good night, Tata!"],
  ], [["ಕಥೆ", "kathe", "story"], ["ಶುಭ ರಾತ್ರಿ", "shubha raatri", "Good night"], ["ತಾತ, ಒಂದು ಕಥೆ ಹೇಳಿ.", "taata, ondu kathe heeLi.", "Tata, tell me a story."]],
  "Some families say ತಾತ (taata) for grandpa, others ಅಜ್ಜ (ajja). Use the word your family uses."),
  T("visit", "✈️", "Ajji and Tata", "Ajji and Tata come from India", "ಅಜ್ಜಿ ತಾತ ಬಂದರು", "Welcome your grandparents to your home here.", [
    ["them", "ಎಷ್ಟು ಬೆಳೆದಿದ್ದೀಯ!", "eshTu beLediddiiya!", "Look how much you've grown!"],
    ["you", "ಅಜ್ಜಿ! ತಾತ! ಬನ್ನಿ ಬನ್ನಿ!", "ajji! taata! banni banni!", "Ajji! Tata! Come in, come in!"],
    ["them", "ನಿನಗೆ ಒಂದು ಉಡುಗೊರೆ ತಂದಿದ್ದೀವಿ.", "ninage ondu uDugore tandiddiivi.", "We've brought you a present."],
    ["you", "ಧನ್ಯವಾದ! ನನ್ನ ರೂಮ್ ನೋಡಿ.", "dhanyavaada! nanna ruum nooDi.", "Thank you! Come see my room."],
    ["them", "ಎಷ್ಟು ಚೆನ್ನಾಗಿದೆ!", "eshTu chennaagide!", "How lovely!"],
    ["you", "ನೀವು ಇಲ್ಲಿ ತುಂಬಾ ದಿನ ಇರಿ.", "niivu illi tumbaa dina iri.", "Please stay here for a long time."],
  ], [["ತಾತ", "taata", "Grandpa"], ["ಬನ್ನಿ ಬನ್ನಿ", "banni banni", "Come in, come in"], ["ನೀವು ಇಲ್ಲಿ ತುಂಬಾ ದಿನ ಇರಿ.", "niivu illi tumbaa dina iri.", "Please stay here for a long time."]],
  "ಬನ್ನಿ is the polite \"come\" for grown-ups. To a friend you'd just say ಬಾ."),
  T("birthday", "🎂", "Ajji", "Ajji's birthday", "ಅಜ್ಜಿಯ ಹುಟ್ಟುಹಬ್ಬ", "Wish Ajji a happy birthday and tell her about your drawing.", [
    ["you", "ಅಜ್ಜಿ, ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "ajji, huTTuhabbada shubhaashayagaLu!", "Ajji, happy birthday!"],
    ["them", "ಧನ್ಯವಾದ ಪುಟ್ಟ! ನೆನಪಿಟ್ಟುಕೊಂಡೆಯಾ!", "dhanyavaada puTTa! nenapiTTukonDeyaa!", "Thank you, little one! You remembered!"],
    ["you", "ಹೌದು! ನಾನು ನಿಮಗೆ ಒಂದು ಚಿತ್ರ ಬಿಡಿಸಿದ್ದೀನಿ.", "houdu! naanu nimage ondu chitra biDisiddiini.", "Yes! I drew you a picture."],
    ["them", "ಏನು ಬಿಡಿಸಿದ್ದೀಯ?", "eenu biDisiddiiya?", "What did you draw?"],
    ["you", "ನಮ್ಮ ಕುಟುಂಬ!", "namma kuTumba!", "Our family!"],
    ["them", "ನನಗೆ ತುಂಬಾ ಖುಷಿ ಆಯ್ತು.", "nanage tumbaa khushi aaytu.", "That makes me so happy."],
  ], [["ಚಿತ್ರ", "chitra", "picture"], ["ಶುಭಾಶಯಗಳು", "shubhaashayagaLu", "best wishes"], ["ಅಜ್ಜಿ, ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "ajji, huTTuhabbada shubhaashayagaLu!", "Ajji, happy birthday!"]],
  "ಹುಟ್ಟುಹಬ್ಬ is ಹುಟ್ಟು (birth) + ಹಬ್ಬ (festival): a birthday is your own festival!"),
  T("sorry", "🥛", "Amma", "Sorry, please and thank you", "ಕ್ಷಮಿಸು, ದಯವಿಟ್ಟು", "Say sorry, help fix it, and ask nicely.", [
    ["them", "ಯಾರು ಹಾಲು ಚೆಲ್ಲಿದ್ದು?", "yaaru haalu chelliddu?", "Who spilled the milk?"],
    ["you", "ನಾನು, ಅಮ್ಮ. ಕ್ಷಮಿಸು.", "naanu, amma. kshamisu.", "Me, Amma. Sorry."],
    ["them", "ಪರವಾಗಿಲ್ಲ. ಬಟ್ಟೆ ತಗೊಂಡು ಬಾ.", "paravaagilla. baTTe tagonDu baa.", "It's okay. Bring a cloth."],
    ["you", "ನಾನೇ ಒರೆಸ್ತೀನಿ.", "naanee orestiini.", "I'll wipe it myself."],
    ["them", "ಜಾಣ ಮಗು!", "jaaNa magu!", "Good child!"],
    ["you", "ಅಮ್ಮ, ಇನ್ನೊಂದು ಲೋಟ ಹಾಲು ಕೊಡು, ದಯವಿಟ್ಟು.", "amma, innondu looTa haalu koDu, dayaviTTu.", "Amma, another glass of milk, please."],
  ], [["ಹಾಲು", "haalu", "milk"], ["ಕ್ಷಮಿಸು ಅಮ್ಮ", "kshamisu amma", "Sorry, Amma"], ["ಅಮ್ಮ, ಹಾಲು ಕೊಡು, ದಯವಿಟ್ಟು.", "amma, haalu koDu, dayaviTTu.", "Amma, milk please."]],
  "To Amma you might say ಕ್ಷಮಿಸು; to Ajji or a teacher, the polite ಕ್ಷಮಿಸಿ."),
  T("deepavali", "🪔", "Amma", "Deepavali at home", "ಮನೆಯಲ್ಲಿ ದೀಪಾವಳಿ", "Plan the festival with Amma and call Ajji with greetings.", [
    ["them", "ನಾಳೆ ದೀಪಾವಳಿ! ಏನು ಮಾಡೋಣ?", "naaLe diipaavaLi! eenu maaDooNa?", "Tomorrow is Deepavali! What shall we do?"],
    ["you", "ದೀಪ ಹಚ್ಚೋಣ!", "diipa hacchooNa!", "Let's light the lamps!"],
    ["them", "ಹೌದು. ಇನ್ನೇನು?", "houdu. inneenu?", "Yes. What else?"],
    ["you", "ರಂಗೋಲಿ ಹಾಕೋಣ, ಸಿಹಿ ತಿನ್ನೋಣ!", "rangooli haakooNa, sihi tinnooNa!", "Let's draw rangoli and eat sweets!"],
    ["them", "ಅಜ್ಜಿಗೆ ಫೋನ್ ಮಾಡಿ ಶುಭಾಶಯ ಹೇಳು.", "ajjige phoon maaDi shubhaashaya heeLu.", "Call Ajji and wish her."],
    ["you", "ಅಜ್ಜಿ, ದೀಪಾವಳಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "ajji, diipaavaLi habbada shubhaashayagaLu!", "Ajji, happy Deepavali!"],
  ], [["ದೀಪ", "diipa", "lamp"], ["ಸಿಹಿ ತಿನ್ನೋಣ", "sihi tinnooNa", "Let's eat sweets"], ["ದೀಪಾವಳಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "diipaavaLi habbada shubhaashayagaLu!", "Happy Deepavali!"]],
  "-ಓಣ means \"let's\": ಹಚ್ಚೋಣ (let's light), ತಿನ್ನೋಣ (let's eat), ಆಡೋಣ (let's play)."),
  T("feelings", "🤗", "Amma", "Telling Amma how you feel", "ಅಮ್ಮನಿಗೆ ಮನಸ್ಸಿನ ಮಾತು", "Say what made you sad, ask for a hug, feel better.", [
    ["them", "ಯಾಕೆ ಬೇಜಾರು ಮಗು?", "yaake beejaaru magu?", "Why are you sad, sweetheart?"],
    ["you", "ನನ್ನ ಸ್ನೇಹಿತ ನನ್ನ ಜೊತೆ ಆಡಲಿಲ್ಲ.", "nanna sneehita nanna jote aaDalilla.", "My friend didn't play with me."],
    ["them", "ಅಯ್ಯೋ. ನಾಳೆ ಅವನ ಜೊತೆ ಮಾತಾಡು.", "ayyoo. naaLe avana jote maataaDu.", "Oh no. Talk to him tomorrow."],
    ["you", "ಸರಿ ಅಮ್ಮ. ಒಂದು ಅಪ್ಪುಗೆ ಕೊಡು.", "sari amma. ondu appuge koDu.", "Okay Amma. Give me a hug."],
    ["them", "ಬಾ, ನನ್ನ ಮುದ್ದು!", "baa, nanna muddu!", "Come here, my darling!"],
    ["you", "ಈಗ ನನಗೆ ಖುಷಿ ಆಯ್ತು.", "iiga nanage khushi aaytu.", "Now I feel happy."],
  ], [["ಖುಷಿ", "khushi", "happy"], ["ಒಂದು ಅಪ್ಪುಗೆ", "ondu appuge", "a hug"], ["ಈಗ ನನಗೆ ಖುಷಿ ಆಯ್ತು.", "iiga nanage khushi aaytu.", "Now I feel happy."]],
  "Feelings start with ನನಗೆ (to me): ನನಗೆ ಖುಷಿ (I'm happy), ನನಗೆ ಬೇಜಾರು (I'm sad), ನನಗೆ ಭಯ (I'm scared)."),
  T("news-tata", "✉️", "Tata", "News for Tata", "ತಾತನಿಗೆ ಸುದ್ದಿ", "Tell Tata something new you learned, and promise to write to him.", [
    ["them", "ಈ ವಾರ ಏನು ವಿಶೇಷ?", "ii vaara eenu vishesha?", "What's new this week?"],
    ["you", "ನಾನು ಈಜು ಕಲಿತೆ!", "naanu iiju kalite!", "I learned to swim!"],
    ["them", "ಶಭಾಷ್! ಇನ್ನೇನು?", "shabhaash! inneenu?", "Well done! What else?"],
    ["you", "ನಾನು ಕನ್ನಡದಲ್ಲಿ ನನ್ನ ಹೆಸರು ಬರೆದೆ.", "naanu kannaDadalli nanna hesaru barede.", "I wrote my name in Kannada."],
    ["them", "ತುಂಬಾ ಖುಷಿ ಆಯ್ತು! ನನಗೆ ಒಂದು ಪತ್ರ ಬರಿ.", "tumbaa khushi aaytu! nanage ondu patra bari.", "I'm so happy! Write me a letter."],
    ["you", "ಖಂಡಿತ ತಾತ, ಕನ್ನಡದಲ್ಲೇ ಬರೀತೀನಿ!", "khanDita taata, kannaDadallee bariitiini!", "Of course, Tata, I'll write it in Kannada!"],
  ], [["ಪತ್ರ", "patra", "letter"], ["ನನ್ನ ಹೆಸರು", "nanna hesaru", "my name"], ["ತಾತ, ನಾನು ಕನ್ನಡದಲ್ಲಿ ಬರೆಯುತ್ತೇನೆ.", "taata, naanu kannaDadalli bareyutteene.", "Tata, I write in Kannada."]],
  "Spoken ಬರೀತೀನಿ and written ಬರೆಯುತ್ತೇನೆ mean the same thing: \"I'll write\". Letters use the written form."),
  T("park", "🛝", "Appa", "At the park with Appa", "ಅಪ್ಪನ ಜೊತೆ ಪಾರ್ಕಿಗೆ", "Ask to go to the park and tell Appa what fun it is.", [
    ["them", "ಪಾರ್ಕಿಗೆ ಹೋಗೋಣವಾ?", "paarkige hoogooNavaa?", "Shall we go to the park?"],
    ["you", "ಹೋಗೋಣ! ನಾನು ಜೋಕಾಲಿ ಆಡಬೇಕು.", "hoogooNa! naanu jookaali aaDabeeku.", "Yes! I want to go on the swing."],
    ["them", "ಸರಿ, ಶೂ ಹಾಕಿಕೋ.", "sari, shuu haakikoo.", "Okay, put your shoes on."],
    ["you", "ಹಾಕಿಕೊಂಡೆ. ಅಪ್ಪ, ನನ್ನನ್ನು ತಳ್ಳು!", "haakikonDe. appa, nannannu taLLu!", "Done. Appa, push me!"],
    ["them", "ಗಟ್ಟಿಯಾಗಿ ಹಿಡಿದುಕೋ!", "gaTTiyaagi hiDidukoo!", "Hold on tight!"],
    ["you", "ಇನ್ನೂ ಮೇಲೆ! ತುಂಬಾ ಮಜಾ!", "innuu meele! tumbaa majaa!", "Higher! So much fun!"],
  ], [["ಜೋಕಾಲಿ", "jookaali", "swing"], ["ತುಂಬಾ ಮಜಾ", "tumbaa majaa", "so much fun"], ["ಅಪ್ಪ, ನನ್ನನ್ನು ಪಾರ್ಕಿಗೆ ಕರೆದುಕೊಂಡು ಹೋಗು.", "appa, nannannu paarkige karedukonDu hoogu.", "Appa, take me to the park."]],
  "Kannada happily borrows words like ಪಾರ್ಕ್ and ಶೂ, then adds its own endings: ಪಾರ್ಕಿಗೆ means \"to the park\"."),
  T("sick", "🤒", "Ajji", "Telling Ajji you're sick", "ಅಜ್ಜಿಗೆ ಹುಷಾರಿಲ್ಲ ಅಂತ", "Tell Ajji what's wrong and that you're taking care.", [
    ["them", "ಯಾಕೆ ಸಪ್ಪಗಿದ್ದೀಯ?", "yaake sappagiddiiya?", "Why do you look so low?"],
    ["you", "ಅಜ್ಜಿ, ನನಗೆ ಜ್ವರ ಬಂದಿದೆ.", "ajji, nanage jvara bandide.", "Ajji, I have a fever."],
    ["them", "ಅಯ್ಯೋ! ಔಷಧಿ ತಗೊಂಡ್ಯಾ?", "ayyoo! aushadhi tagonDyaa?", "Oh no! Did you take medicine?"],
    ["you", "ತಗೊಂಡೆ. ಅಮ್ಮ ಗಂಜಿ ಮಾಡಿದರು.", "tagonDe. amma ganji maaDidaru.", "Yes. Amma made ganji."],
    ["them", "ಚೆನ್ನಾಗಿ ನಿದ್ದೆ ಮಾಡು. ಬೇಗ ಹುಷಾರಾಗು.", "chennaagi nidde maaDu. beega hushaaraagu.", "Sleep well. Get better soon."],
    ["you", "ಸರಿ ಅಜ್ಜಿ. ನಾಳೆ ಫೋನ್ ಮಾಡ್ತೀನಿ.", "sari ajji. naaLe phoon maaDtiini.", "Okay Ajji. I'll call tomorrow."],
  ], [["ಜ್ವರ", "jvara", "fever"], ["ಬೇಗ ಹುಷಾರಾಗು", "beega hushaaraagu", "get better soon"], ["ಅಜ್ಜಿ, ನನಗೆ ಈಗ ಹುಷಾರಾಗಿದೆ.", "ajji, nanage iiga hushaaraagide.", "Ajji, I'm better now."]],
  "Body words to know: ತಲೆ (head), ಹೊಟ್ಟೆ (tummy), ಗಂಟಲು (throat). ನೋವು means pain: ತಲೆ ನೋವು is a headache."),
  T("garden", "🌱", "Tata", "Planting with Tata", "ತಾತನ ಜೊತೆ ಗಿಡ ನೆಡು", "Plant a tomato with Tata and ask questions.", [
    ["them", "ಬಾ, ಗಿಡ ನೆಡೋಣ.", "baa, giDa neDooNa.", "Come, let's plant something."],
    ["you", "ಯಾವ ಗಿಡ ತಾತ?", "yaava giDa taata?", "Which plant, Tata?"],
    ["them", "ಟೊಮೇಟೊ ಗಿಡ. ಮೊದಲು ಮಣ್ಣು ಅಗೆ.", "Tomeeto giDa. modalu maNNu age.", "A tomato plant. First dig the soil."],
    ["you", "ಅಗೆದೆ! ಈಗ ನೀರು ಹಾಕಲಾ?", "agede! iiga niiru haakalaa?", "Done! Shall I water it now?"],
    ["them", "ಹೌದು, ಸ್ವಲ್ಪ ನೀರು ಹಾಕು.", "houdu, svalpa niiru haaku.", "Yes, give it a little water."],
    ["you", "ತಾತ, ಟೊಮೇಟೊ ಯಾವಾಗ ಬರುತ್ತೆ?", "taata, Tomeeto yaavaaga barutte?", "Tata, when will the tomatoes come?"],
  ], [["ಗಿಡ", "giDa", "plant"], ["ನೀರು ಹಾಕು", "niiru haaku", "water it"], ["ತಾತ, ನಾವು ಟೊಮೇಟೊ ಗಿಡ ನೆಟ್ಟೆವು.", "taata, naavu Tomeeto giDa neTTevu.", "Tata, we planted a tomato plant."]],
  "-ಲಾ at the end asks \"shall I?\": ನೀರು ಹಾಕಲಾ? (shall I water it?), ಬರಲಾ? (shall I come?)."),
  T("grocery", "🛒", "Amma", "The shopping list with Amma", "ಅಮ್ಮನ ಜೊತೆ ಪಟ್ಟಿ", "Make the shopping list together, and write it in Kannada.", [
    ["them", "ಅಂಗಡಿಗೆ ಹೋಗಬೇಕು. ಏನೇನು ಬೇಕು?", "angaDige hoogabeeku. eeneenu beeku?", "We need to go to the store. What all do we need?"],
    ["you", "ಹಾಲು, ಮೊಸರು ಮತ್ತು ಬಾಳೆಹಣ್ಣು!", "haalu, mosaru mattu baaLehaNNu!", "Milk, yogurt and bananas!"],
    ["them", "ಇನ್ನೇನು?", "inneenu?", "What else?"],
    ["you", "ನನಗೆ ಸೇಬು ಬೇಕು.", "nanage seebu beeku.", "I want apples."],
    ["them", "ಸರಿ. ನೀನೇ ಪಟ್ಟಿ ಬರಿ.", "sari. niinee paTTi bari.", "Okay. You write the list."],
    ["you", "ಕನ್ನಡದಲ್ಲಿ ಬರೀತೀನಿ!", "kannaDadalli bariitiini!", "I'll write it in Kannada!"],
  ], [["ಸೇಬು", "seebu", "apple"], ["ಹಾಲು, ಮೊಸರು", "haalu, mosaru", "milk, yogurt"], ["ನನಗೆ ಸೇಬು ಮತ್ತು ಬಾಳೆಹಣ್ಣು ಬೇಕು.", "nanage seebu mattu baaLehaNNu beeku.", "I want apples and bananas."]],
  "ಏನೇನು means \"what all\": saying a question word twice asks for a list. ಯಾರ್ಯಾರು means \"who all\"."),
  T("cousin", "📱", "Anu", "Chatting with cousin Anu in India", "ಅನು ಜೊತೆ ಮಾತು", "Chat with a cousin in India: time zones, school and games.", [
    ["them", "ಹಾಯ್! ನಿಮ್ಮ ಕಡೆ ಈಗ ಎಷ್ಟು ಗಂಟೆ?", "haay! nimma kaDe iiga eshTu ganTe?", "Hi! What time is it where you are?"],
    ["you", "ಇಲ್ಲಿ ರಾತ್ರಿ ಎಂಟು ಗಂಟೆ. ಅಲ್ಲಿ?", "illi raatri enTu ganTe. alli?", "It's eight at night here. There?"],
    ["them", "ಇಲ್ಲಿ ಬೆಳಿಗ್ಗೆ! ನಾನು ಶಾಲೆಗೆ ಹೋಗ್ತಿದ್ದೀನಿ.", "illi beLigge! naanu shaalege hoogtiddiini.", "It's morning here! I'm going to school."],
    ["you", "ನಾನು ಈಗ ಮಲಗ್ತೀನಿ!", "naanu iiga malagtiini!", "And I'm going to bed now!"],
    ["them", "ಹ ಹ! ನಿನ್ನ ಇಷ್ಟದ ಆಟ ಯಾವುದು?", "ha ha! ninna ishTada aaTa yaavudu?", "Ha ha! What's your favourite game?"],
    ["you", "ನನಗೆ ಫುಟ್‌ಬಾಲ್ ಇಷ್ಟ. ನಿನಗೆ?", "nanage phuTbaal ishTa. ninage?", "I like soccer. You?"],
  ], [["ಆಟ", "aaTa", "game"], ["ರಾತ್ರಿ ಎಂಟು ಗಂಟೆ", "raatri enTu ganTe", "eight at night"], ["ಅನು, ನನಗೆ ಫುಟ್‌ಬಾಲ್ ಆಡೋದು ಇಷ್ಟ.", "anu, nanage phuTbaal aaDoodu ishTa.", "Anu, I like playing soccer."]],
  "With cousins and friends you say ನೀನು and ನಿನಗೆ. India is 9½ to 13½ hours ahead of the USA, depending on where you live, so their morning is your night!"),
  T("temple", "🛕", "Amma", "At the temple with Amma", "ಅಮ್ಮನ ಜೊತೆ ದೇವಸ್ಥಾನ", "Ring the bell, fold your hands and greet everyone.", [
    ["them", "ದೇವಸ್ಥಾನದಲ್ಲಿ ಶಾಂತವಾಗಿರು.", "deevasthaanadalli shaantavaagiru.", "Be calm and quiet in the temple."],
    ["you", "ಸರಿ ಅಮ್ಮ. ನಾನು ಗಂಟೆ ಬಾರಿಸಲಾ?", "sari amma. naanu ganTe baarisalaa?", "Okay Amma. Shall I ring the bell?"],
    ["them", "ಬಾರಿಸು. ಈಗ ಕೈ ಮುಗಿ.", "baarisu. iiga kai mugi.", "Ring it. Now fold your hands."],
    ["you", "ಕೈ ಮುಗಿದೆ. ಅಮ್ಮ, ಪ್ರಸಾದ ಎಲ್ಲಿ?", "kai mugide. amma, prasaada elli?", "I did. Amma, where's the prasada?"],
    ["them", "ಅಲ್ಲಿ. ಎಲ್ಲರಿಗೂ ನಮಸ್ಕಾರ ಹೇಳು.", "alli. ellarigu namaskaara heeLu.", "Over there. Say namaskara to everyone."],
    ["you", "ಎಲ್ಲರಿಗೂ ನಮಸ್ಕಾರ!", "ellarigu namaskaara!", "Namaskara, everyone!"],
  ], [["ಗಂಟೆ", "ganTe", "bell"], ["ಕೈ ಮುಗಿ", "kai mugi", "fold your hands"], ["ನಾವು ಶನಿವಾರ ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋದೆವು.", "naavu shanivaara deevasthaanakke hoodevu.", "We went to the temple on Saturday."]],
  "ಗಂಟೆ means both \"bell\" and \"hour\". The rest of the sentence tells you which one."),
  T("gift", "🎁", "Maava", "Thanking Maava for a present", "ಮಾವನಿಗೆ ಧನ್ಯವಾದ", "Thank your uncle for a present on a call.", [
    ["them", "ಉಡುಗೊರೆ ಸಿಕ್ತಾ?", "uDugore siktaa?", "Did you get the present?"],
    ["you", "ಸಿಕ್ತು ಮಾವ! ತುಂಬಾ ಧನ್ಯವಾದ.", "siktu maava! tumbaa dhanyavaada.", "I got it, Maava! Thank you so much."],
    ["them", "ಇಷ್ಟ ಆಯ್ತಾ?", "ishTa aaytaa?", "Did you like it?"],
    ["you", "ತುಂಬಾ ಇಷ್ಟ ಆಯ್ತು! ನಾನು ದಿನಾ ಅದರ ಜೊತೆ ಆಡ್ತೀನಿ.", "tumbaa ishTa aaytu! naanu dinaa adara jote aaDtiini.", "I love it! I play with it every day."],
    ["them", "ಒಳ್ಳೆಯದು. ಅಮ್ಮ ಅಪ್ಪನಿಗೆ ನಮಸ್ಕಾರ ಹೇಳು.", "oLLeyadu. amma appanige namaskaara heeLu.", "Good. Say namaskara to Amma and Appa."],
    ["you", "ಹೇಳ್ತೀನಿ. ಬೇಗ ಬನ್ನಿ ಮಾವ!", "heeLtiini. beega banni maava!", "I will. Come and visit soon, Maava!"],
  ], [["ಮಾವ", "maava", "uncle"], ["ತುಂಬಾ ಧನ್ಯವಾದ", "tumbaa dhanyavaada", "thank you so much"], ["ಮಾವ, ಉಡುಗೊರೆಗೆ ತುಂಬಾ ಧನ್ಯವಾದ.", "maava, uDugorege tumbaa dhanyavaada.", "Maava, thank you so much for the present."]],
  "ಮಾವ is Amma's brother. Appa's brothers are ಚಿಕ್ಕಪ್ಪ (younger) and ದೊಡ್ಡಪ್ಪ (older). Ask who is who in your family!"),
  T("ugadi", "🌿", "Ajji", "Ugadi with Ajji", "ಅಜ್ಜಿ ಜೊತೆ ಯುಗಾದಿ", "Wish Ajji for the Kannada New Year and talk about bevu-bella.", [
    ["them", "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು ಪುಟ್ಟ!", "yugaadi habbada shubhaashayagaLu puTTa!", "Happy Ugadi, little one!"],
    ["you", "ನಿಮಗೂ ಶುಭಾಶಯಗಳು ಅಜ್ಜಿ!", "nimaguu shubhaashayagaLu ajji!", "Happy Ugadi to you too, Ajji!"],
    ["them", "ಬೇವು ಬೆಲ್ಲ ತಿಂದ್ಯಾ?", "beevu bella tindyaa?", "Did you eat bevu-bella?"],
    ["you", "ತಿಂದೆ! ಬೇವು ಕಹಿ, ಬೆಲ್ಲ ಸಿಹಿ.", "tinde! beevu kahi, bella sihi.", "Yes! Neem is bitter, jaggery is sweet."],
    ["them", "ಹೌದು, ಜೀವನದಲ್ಲಿ ಎರಡೂ ಇರುತ್ತೆ.", "houdu, jiivanadalli eraDuu irutte.", "Yes, life has both."],
    ["you", "ಅಮ್ಮ ಹೋಳಿಗೆ ಮಾಡಿದರು. ತುಂಬಾ ರುಚಿ!", "amma hooLige maaDidaru. tumbaa ruchi!", "Amma made holige. So tasty!"],
  ], [["ಬೆಲ್ಲ", "bella", "jaggery"], ["ಬೇವು ಬೆಲ್ಲ", "beevu bella", "neem and jaggery"], ["ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "yugaadi habbada shubhaashayagaLu!", "Happy Ugadi!"]],
  "Taste words: ಸಿಹಿ (sweet), ಕಹಿ (bitter), ಖಾರ (spicy), ಹುಳಿ (sour), ಉಪ್ಪು (salty)."),
];

// Month-end (meet) weeks: show Ajji what you learnt this month.
export const SHOW_TALK = T("show-ajji", "🌟", "Ajji", "Show Ajji what you learnt", "ಅಜ್ಜಿಗೆ ತೋರಿಸು", "Month-end: tell Ajji what you learnt and show her your writing.", [
  ["them", "ಈ ತಿಂಗಳು ಏನು ಕಲಿತೆ?", "ii tingaLu eenu kalite?", "What did you learn this month?"],
  ["you", "ನಾನು ಹೊಸ ಅಕ್ಷರಗಳನ್ನು ಕಲಿತೆ.", "naanu hosa aksharagaLannu kalite.", "I learned new letters."],
  ["them", "ಒಂದು ಅಕ್ಷರ ಬರೆದು ತೋರಿಸು.", "ondu akshara baredu toorisu.", "Write one and show me."],
  ["you", "ನೋಡಿ ಅಜ್ಜಿ, ಇದು ನನ್ನ ಹೆಸರು!", "nooDi ajji, idu nanna hesaru!", "Look Ajji, this is my name!"],
  ["them", "ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಬರೆದಿದ್ದೀಯ!", "eshTu chennaagi barediddiiya!", "How nicely you've written it!"],
  ["you", "ಮುಂದಿನ ತಿಂಗಳು ಇನ್ನೂ ಕಲಿತೀನಿ!", "mundina tingaLu innuu kalitiini!", "Next month I'll learn even more!"],
], [["ಅಕ್ಷರ", "akshara", "letter"], ["ನನ್ನ ಹೆಸರು", "nanna hesaru", "my name"], ["ಅಜ್ಜಿ, ನಾನು ಈ ತಿಂಗಳು ಹೊಸ ಅಕ್ಷರಗಳನ್ನು ಕಲಿತೆ.", "ajji, naanu ii tingaLu hosa aksharagaLannu kalite.", "Ajji, I learned new letters this month."]],
"Month-end is show-off time! Write your name in Kannada on paper too, and show it on your next call.");

// "Know Karnataka": one card a week, to talk about at home.
export const KNOW = [
  ["🟨🟥", "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ", "Karnataka's birthday is 1 November: Kannada Rajyotsava. Families fly the red and yellow Kannada flag."],
  ["🐘", "ಮೈಸೂರು ದಸರಾ", "At Mysuru Dasara, decorated elephants walk through the city and the palace glows with thousands of lights."],
  ["🏛️", "ಹಂಪಿ", "Hampi, with its famous stone chariot, was the capital of the Vijayanagara empire. It's a UNESCO World Heritage Site."],
  ["☕", "ಕಾಫಿ", "Coffee has been grown in the hills of Chikkamagaluru, Karnataka, for hundreds of years. Ask Ajji how she makes filter coffee!"],
  ["🌊", "ಜೋಗ ಜಲಪಾತ", "Jog Falls, in Shivamogga district, is one of the highest waterfalls in India."],
  ["🪵", "ಶ್ರೀಗಂಧ", "Karnataka is famous for sandalwood, ಶ್ರೀಗಂಧ. Mysore sandal soap has been made there for more than 100 years."],
  ["🍬", "ಮೈಸೂರು ಪಾಕ್", "Mysore Pak is a sweet made with gram flour, ghee and sugar. The story says it was first made in the Mysuru palace kitchen."],
  ["🎭", "ಯಕ್ಷಗಾನ", "Yakshagana is Karnataka's night-long theatre, with bright costumes, big crowns, drums and dancing."],
  ["📜", "ಹಳೆಯ ಕನ್ನಡ", "Kannada has been written for more than 1,500 years. The Halmidi stone is one of the oldest Kannada writings."],
  ["🏆", "ಜ್ಞಾನಪೀಠ", "Kannada writers have won the Jnanpith, India's top prize for writers, eight times."],
  ["🌿", "ಯುಗಾದಿ", "Ugadi is the Kannada New Year. Families eat ಬೇವು ಬೆಲ್ಲ: bitter neem and sweet jaggery, for all the days ahead."],
  ["🔤", "ಕನ್ನಡ ಅಕ್ಷರ", "Kannada letters are round like drops of water. Kannada and Telugu scripts are cousins: they grew from the same old script."],
  ["🦜", "ನೀಲಕಂಠ", "Karnataka's state bird is the Indian roller, ನೀಲಕಂಠ, with bright blue wings that flash when it flies."],
  ["🪷", "ಕಮಲ", "Karnataka's state flower is the lotus, ಕಮಲ, which grows in ponds and lakes."],
  ["🐘", "ಆನೆ", "Karnataka's state animal is the elephant, ಆನೆ. More wild elephants live in Karnataka than in any other state of India."],
  ["🗿", "ಗೊಮ್ಮಟೇಶ್ವರ", "At Shravanabelagola stands Gommateshwara (Bahubali): a giant statue carved from a single rock more than 1,000 years ago."],
  ["🎶", "ಪುರಂದರ ದಾಸ", "Purandara Dasa wrote hundreds of songs in Kannada. He is called the father of Carnatic music."],
  ["🏞️", "ಕಾವೇರಿ", "The Kaveri river begins at Talakaveri in Kodagu (Coorg), Karnataka, and flows all the way to the sea."],
];

// One new talk and one Know card for each of the 18 lesson weeks; the meet week (every 4th) is "show Ajji".
const lessonNo = (w) => { w = Math.max(1, w); return w - Math.floor(w / 4); }; // same as plan.js packetNo
export const familyFor = (week) => (Math.max(1, week) % 4 === 0 ? SHOW_TALK : FAMILY_TALKS[(lessonNo(week) - 1) % FAMILY_TALKS.length]);
export const knowFor = (week) => KNOW[(lessonNo(week) - 1) % KNOW.length];
export const ALL_TALKS = [...FAMILY_TALKS, SHOW_TALK];
// Level 1 writes a word, level 2 a short phrase, levels 3 and 4 a whole sentence.
export const writeFor = (talk, level) => talk.write[level <= 1 ? 0 : level === 2 ? 1 : 2];
