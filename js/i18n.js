/* ============================================================
   Hebrew.

   Everything she reads can be in either language. Option *ids* stay
   English throughout — 'sunset', 'moto', 'fancy' — so the flow engine,
   the sunset maths, the scene picker and the recommendations all keep
   working untouched. Only the words change.

   English is the source of truth. A snapshot of it is taken at load and
   applyLang() restores from that snapshot before overlaying Hebrew, so
   the setup page can flip back and forth without losing anything.
   ============================================================ */

let LANG = 'en';
const isRTL = () => LANG === 'he';

/* ---------------- app chrome ---------------- */

const UI = {
  /* the frame */
  resSystem:      { en: 'Reservation system',        he: 'מערכת הזמנות' },
  ref:            { en: 'REF {r}',                   he: 'מס׳ {r}' },
  stepOf:         { en: 'Step {a} of {b}',           he: 'שלב {a} מתוך {b}' },
  back:           { en: '← back',                    he: 'חזרה →' },

  /* envelope */
  envTitle:       { en: 'You have one<br>unopened invitation.',
                    he: 'יש לך הזמנה אחת<br>שלא נפתחה.' },
  envFor:         { en: 'For {to}. From {from}.',    he: 'עבור {to}. מאת {from}.' },
  envOpen:        { en: 'Open it',                   he: 'פתחי אותה' },
  envTap:         { en: 'Tap the envelope. Nothing bad happens.',
                    he: 'אפשר ללחוץ על המעטפה. לא קורה שום דבר רע.' },

  /* the question */
  q01:            { en: 'Question 01 · required',    he: 'שאלה 01 · חובה' },
  askTitle:       { en: '{to}, do you want<br>to go on a date<br>with me?',
                    he: '{to}, בא לך לצאת<br>איתי לדייט?' },
  askSub:         { en: 'Please select one option. Both are equally valid.',
                    he: 'נא לבחור אפשרות אחת. שתיהן תקפות באותה מידה.' },
  yes:            { en: 'Yes',                       he: 'כן' },

  /* celebration */
  answerRecorded: { en: 'Answer recorded',           he: 'התשובה נקלטה' },
  knewIt:         { en: 'I knew it.',                he: 'ידעתי.' },
  triedOther:     { en: 'You went for the other button {n} time{s}. It was never going to work.',
                    he: 'ניסית את הכפתור השני {n} פעמים. זה אף פעם לא היה הולך לעבוד.' },
  noHesitation:   { en: 'No hesitation. Respect.',   he: 'בלי רגע של היסוס. כבוד.' },
  planIt:         { en: "Now let's plan it →",       he: 'עכשיו בואי נתכנן →' },

  /* activity */
  q02:            { en: 'Question 02',               he: 'שאלה 02' },
  actTitle:       { en: 'What do you want<br>to do?', he: 'מה בא לך<br>לעשות?' },
  actSub:         { en: 'Pick one. You can change your mind later, unlike with the last question.',
                    he: 'בחרי אחת. אפשר להתחרט אחר כך, בניגוד לשאלה הקודמת.' },
  actSubGated:    { en: "Pick one. The glowing ones are {from}'s favourites, and — you'll find this out shortly — they are also the only ones that let themselves be pressed.",
                    he: 'בחרי אחת. אלה שזוהרות הן המועדפות של {from}, והן גם — תגלי את זה עוד רגע — היחידות שמסכימות שילחצו עליהן.' },

  /* every question */
  somethingElse:  { en: 'Something else',            he: 'משהו אחר' },
  yourIdea:       { en: 'your idea',                 he: 'הרעיון שלך' },
  thatsTheOne:    { en: "That's the one",            he: 'זה זה' },
  typeItHere:     { en: 'Type it here…',             he: 'כתבי כאן…' },

  /* recommendations */
  suggestions:    { en: 'Suggestions',               he: 'הצעות' },
  homework:       { en: 'I did some homework.',      he: 'עשיתי שיעורי בית.' },
  recsSubPlaces:  { en: 'Tap a place to lock it in, or skip it and we improvise. Every card opens in Maps.',
                    he: 'אפשר ללחוץ על מקום כדי לקבע אותו, או לדלג ונאלתר. כל כרטיס נפתח במפות.' },
  recsSubIdeas:   { en: 'Nothing to decide here, just things to look at. Every card opens in Maps.',
                    he: 'אין כאן מה להחליט, רק דברים להסתכל עליהם. כל כרטיס נפתח במפות.' },
  openMaps:       { en: 'Open ↗',                    he: 'פתחי ↗' },
  somewhereElse:  { en: 'Somewhere else? Name it…',  he: 'מקום אחר? כתבי אותו…' },
  useThis:        { en: 'Use this',                  he: 'קחי את זה' },
  continue:       { en: 'Continue',                  he: 'ממשיכים' },
  surpriseMe:     { en: 'Surprise me instead',       he: 'תפתיע אותי במקום' },

  /* dress */
  dressCode:      { en: 'Dress code',                he: 'קוד לבוש' },
  dressTitle:     { en: 'How are we<br>showing up?', he: 'איך אנחנו<br>מגיעים?' },
  dressPh:        { en: 'Describe the outfit…',      he: 'תארי את הלוק…' },

  /* calendar */
  availability:   { en: 'Availability',              he: 'זמינות' },
  pickTheDay:     { en: 'Pick the day.',             he: 'בחרי את היום.' },
  dateSub:        { en: 'Greyed-out days are ones {from} genuinely cannot do. Everything else is yours.',
                    he: 'הימים המחוקים הם ימים ש{from} באמת לא יכול. כל השאר שלך.' },
  dateSubOnly:    { en: 'These are the days {from} is actually free. Everything else is crossed out because it genuinely cannot happen.',
                    he: 'אלה הימים ש{from} באמת פנוי בהם. כל השאר מחוק כי זה פשוט לא יכול לקרות.' },
  chooseDay:      { en: 'Choose a day',              he: 'בחרי יום' },

  /* time */
  andWhatTime:    { en: 'And what time?',            he: 'ובאיזו שעה?' },
  sunsetTitle:    { en: 'So what time do<br>we meet?', he: 'אז באיזו שעה<br>נפגשות?' },
  sunsetAround:   { en: 'Sunset is around {t}',      he: 'השקיעה בסביבות {t}' },
  sunsetSub:      { en: 'You asked for sunset, so these are built around it. On {d} the sun goes down at about {t} in {city}.',
                    he: 'ביקשת שקיעה, אז אלה נבנו סביבה. ב{d} השמש שוקעת בסביבות {t} ב{city}.' },
  differentHour:  { en: 'a different hour',          he: 'שעה אחרת' },
  pickATime:      { en: 'Pick a time',               he: 'בחרי שעה' },

  /* the pickup */
  thePickup:      { en: 'The pickup',                he: 'האיסוף' },
  rideTitle:      { en: 'How do you want<br>me to pick you up?',
                    he: 'איך בא לך<br>שאאסוף אותך?' },
  rideSub:        { en: 'Everything here is parked and insured. Photos are real, {from} is not exaggerating.',
                    he: 'הכול כאן חונה למטה ומבוטח. התמונות אמיתיות, {from} לא מגזים.' },
  ridePh:         { en: "I'll make my own way there…", he: 'אני אגיע לבד…' },
  rideOther:      { en: 'or tell me where to meet you', he: 'או שתגידי איפה להיפגש' },

  /* fine print */
  termsEyebrow:   { en: 'Terms & conditions',        he: 'תנאים והגבלות' },
  finePrint:      { en: 'The fine print.',           he: 'האותיות הקטנות.' },
  termsSub:       { en: 'Standard stuff. Please read carefully.',
                    he: 'דברים סטנדרטיים. נא לקרוא בעיון.' },
  iAccept:        { en: 'I accept',                  he: 'אני מאשרת' },
  cantUncheck:    { en: 'cannot be unchecked',       he: 'אי אפשר לבטל' },

  /* the big one */
  bookingConfirmed: { en: 'Booking confirmed',       he: 'ההזמנה אושרה' },
  itsOfficial:    { en: "IT'S<br>OFFICIAL.",         he: 'זה<br>רשמי.' },
  pickupLine:     { en: 'Pickup · {x}',              he: 'איסוף · {x}' },
  savePicture:    { en: 'Save the picture',          he: 'שמרי את התמונה' },
  partySub:       { en: '{to} said yes to {from}, picked the plan, and put it in the diary. There is no undo button. There was never even a no button.',
                    he: '{to} אמרה כן ל{from}, בחרה את התוכנית והכניסה אותה ליומן. אין כפתור ביטול. גם כפתור "לא" אף פעם לא באמת היה שם.' },
  oneLastThing:   { en: 'One last thing →',          he: 'עוד דבר אחרון →' },

  /* contact */
  almostDone:     { en: 'Almost done',               he: 'כמעט סיימנו' },
  contactTitle:   { en: 'Where do I send<br>the invite?', he: 'לאן לשלוח<br>את ההזמנה?' },
  contactSub:     { en: "It's booked. Now I just need somewhere to send it so it lands in your calendar and I stop asking whether you remembered.",
                    he: 'זה סגור. עכשיו רק צריך לאן לשלוח, כדי שזה ייכנס לך ליומן ואני אפסיק לשאול אם זכרת.' },
  yourPhone:      { en: 'Your phone',                he: 'הטלפון שלך' },
  yourEmail:      { en: 'Your email, for the calendar invite',
                    he: 'המייל שלך, בשביל ההזמנה ליומן' },
  emailHint:      { en: 'Optional. Nothing is stored anywhere, it goes straight to {from}.',
                    he: 'לא חובה. שום דבר לא נשמר בשום מקום, זה הולך ישר ל{from}.' },
  showTicket:     { en: 'Show me the ticket →',      he: 'תראה לי את הכרטיס →' },

  /* ticket */
  confirmedRes:   { en: 'Confirmed reservation',     he: 'הזמנה מאושרת' },
  itsADate:       { en: "It's a date.",              he: 'יש דייט.' },
  kDate:          { en: 'Date',                      he: 'תאריך' },
  kTime:          { en: 'Time',                      he: 'שעה' },
  kPlan:          { en: 'Plan',                      he: 'תוכנית' },
  kWhere:         { en: 'Where',                     he: 'איפה' },
  kDress:         { en: 'Dress code',                he: 'קוד לבוש' },
  kPickup:        { en: 'Pickup',                    he: 'איסוף' },
  kNote:          { en: 'Note',                      he: 'הערה' },
  noRefunds:      { en: 'NO&nbsp;REFUNDS',           he: 'אין&nbsp;החזרים' },
  sendItTo:       { en: 'Send it to {from}',         he: 'שלחי ל{from}' },
  addToCalendar:  { en: 'Add to calendar',           he: 'הוסיפי ליומן' },
  googleCalendar: { en: 'Google Calendar',           he: 'יומן גוגל' },
  waDidntOpen:    { en: "WhatsApp didn't open?",     he: 'וואטסאפ לא נפתח?' },
  copyInstead:    { en: 'Copy the message instead',  he: 'העתיקי את ההודעה במקום' },
  copiedPaste:    { en: 'Copied — paste it to him ✓', he: 'הועתק — הדביקי לו ✓' },
  copyFailed:     { en: 'Copy failed, screenshot the ticket',
                    he: 'ההעתקה נכשלה, צלמי את הכרטיס' },
  countdown:      { en: 'Countdown:',                he: 'ספירה לאחור:' },
  itsHappening:   { en: "it's happening",            he: 'זה קורה' },
  oneMoreThing:   { en: 'One more thing →',          he: 'עוד דבר אחד →' },
  dDay:           { en: 'd',                         he: ' ימים ' },
  dHour:          { en: 'h',                         he: ' שעות ' },
  dMin:           { en: 'm',                         he: ' דק׳' },

  /* receipt */
  receipt:        { en: 'Receipt',                   he: 'קבלה' },
  forTheRecord:   { en: 'For the record.',           he: 'לפרוטוקול.' },
  receiptSub:     { en: 'The system logs everything. Sorry.',
                    he: 'המערכת מתעדת הכול. סליחה.' },
  rNoAttempts:    { en: 'Attempts to say no',        he: 'ניסיונות להגיד לא' },
  rRanAway:       { en: 'Options that ran away',     he: 'אפשרויות שברחו' },
  rEscapes:       { en: 'Successful escapes',        he: 'בריחות מוצלחות' },
  rAnswered:      { en: 'Questions answered',        he: 'שאלות שנענו' },
  rCancel:        { en: 'Chance of cancellation',    he: 'סיכוי לביטול' },
  rRef:           { en: 'Booking reference',         he: 'מספר הזמנה' },
  seeYou:         { en: "See you {d} at {t}. Don't be late — I will be, but don't be.",
                    he: 'נתראה ב{d} ב{t}. אל תאחרי — אני כן אאחר, אבל את אל.' },
  backToTicket:   { en: 'Back to the ticket',        he: 'חזרה לכרטיס' },
  startOver:      { en: 'Start over',                he: 'להתחיל מהתחלה' },

  /* what gets sent to him */
  waSaidYes:      { en: '✅ {to} said yes.',          he: '✅ {to} אמרה כן.' },
  waWhen:         { en: '📅 {d} at {t}',              he: '📅 {d} בשעה {t}' },
  waPickHerUp:    { en: '🏍️ Pick her up: {x}',        he: '🏍️ לאסוף אותה עם: {x}' },
  waTried:        { en: 'She tried to press "no" {n} times. Ref {r}.',
                    he: 'היא ניסתה ללחוץ "לא" {n} פעמים. מס׳ {r}.' },

  /* calendar entry */
  evTitle:        { en: 'Date with {from} 🌹',        he: 'דייט עם {from} 🌹' },
  evWhere:        { en: 'Where: {x}',                he: 'איפה: {x}' },
  evDress:        { en: 'Dress code: {x}',           he: 'קוד לבוש: {x}' },
  evPickup:       { en: 'Pickup: {x}',               he: 'איסוף: {x}' },
  evRef:          { en: 'Booking ref {r}. No refunds.',
                    he: 'מספר הזמנה {r}. אין החזרים.' },
  evAlarm:        { en: 'Date with {from} in 2 hours',
                    he: 'דייט עם {from} בעוד שעתיים' },
};

function t(key, vars) {
  const row = UI[key];
  let s = row ? (row[LANG] != null ? row[LANG] : row.en) : key;
  if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}

const DOW = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  he: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
};

const LOCALE = { en: 'en-GB', he: 'he-IL' };

/* ---------------- the content ---------------- */

/* [label, note]. A missing note leaves the English one alone; an empty
   string clears it. */
const HE_ACTIVITIES = {
  food:     ['אוכל', 'הקלאסיקה שלא מפסידה'],
  drinks:   ['משהו לשתות', 'אחד הופך לשלושה'],
  bowling:  ['באולינג', 'אני אפסיד בכבוד'],
  karting:  ['קארטינג', 'אני לא אפסיד בכבוד'],
  escape:   ['חדר בריחה', 'נעולים ביחד'],
  moto:     ['נסיעה על האופנוע', 'שני גלגלים ומיכל מלא'],
  beach:    ['הים', 'חול בכל מקום, שווה את זה'],
  picnic:   ['פיקניק', 'שמיכה ובלי תוכניות'],
  trip:     ['טיול', 'לעזוב את העיר'],
  italy:    ['איטליה', 'כן, איטליה איטליה'],
  movie:    ['ערב סרט', 'משא ומתן על הפופקורן'],
  music:    ['הופעה', 'רועש מדי בשביל לריב'],
  dancing:  ['לרקוד', 'אחד מאיתנו יודע'],
  museum:   ['מוזיאון', 'דעות חזקות, בשקט'],
  games:    ['משחקי קופסה', 'סוף של חברויות'],
  spa:      ['יום ספא', 'סוף סוף שקט'],
  pool:     ['יום בבריכה', 'בעיקר לצוף'],
  walk:     ['הליכה ארוכה', 'ולדבר יותר מדי'],
  cook:     ['ערב בישול', 'מישהו ישרוף משהו'],
  shopping: ['שופינג', 'אני אחזיק את השקיות'],
  surprise: ['תפתיע אותי', 'בחירה אמיצה'],
  nothing:  ['כלום', 'עדיין נחשב דייט'],
};

/* { q, sub?, o: { optionId: [label, note?] } } */
const HE_FLOWS = {
  food: {
    cuisine: {
      q: 'מה אנחנו אוכלים?', sub: 'תבחרי בזהירות. זה כל הערב.',
      o: { italian: ['איטלקי'], sushi: ['סושי'], burgers: ['המבורגר'],
           israeli: ['חומוס וישראלי'], brunch: ['בראנץ׳'], steak: ['סטייק'],
           vegan: ['טבעוני'], any: ['שתחליט אתה', 'מסוכן'] },
    },
    vibe: {
      q: 'ואיזה ווייב?',
      o: { sunset: ['נוף לשקיעה', 'ברור שזו התשובה הנכונה'], roof: ['גג'],
           hole: ['מקום קטן עם כיסאות פלסטיק'], fancy: ['מפונפן', 'אני מתלבש יפה'],
           home: ['בבית', 'אני מבשל, או שנזמין ונשקר'] },
    },
  },
  moto: {
    where: {
      q: 'לאן אנחנו נוסעים?', sub: 'תבחרי את הכביש. היעד זה רק המקום שבו מסתובבים חזרה.',
      o: { north: ['צפונה', 'הגליל, שם שהכבישים באמת מתפתלים'],
           carmel: ['לכרמל', 'יער כל הדרך, ים בסוף'],
           jlm: ['הרי יהודה', 'סרפנטינות עד למעלה'],
           desert: ['כביש ים המלח', 'ריק, וארוך מאוד'],
           coast: ['לאורך החוף', 'לאט, מלוח, בלי למהר'],
           follow: ['את מחליטה', 'אני איסע לאן שתגידי'] },
    },
    when: {
      q: 'מתי יוצאים?',
      o: { sunrise: ['מוקדם, לפני הפקקים', 'שאפתנית'],
           golden: ['אחר הצהריים, לתוך שעת הזהב'],
           night: ['נסיעת לילה', 'קר, ריק, הכי טוב'] },
    },
    pace: {
      q: 'ואיך אני נוסע?', sub: 'תהיי כנה, אני אעשה בדיוק מה שתבחרי.',
      o: { slow: ['בעדינות', 'בא לי להסתכל על דברים'],
           real: ['כמו שצריך', 'להטות בסיבובים'],
           fast: ['שלא תספרי לאמא שלי'] },
    },
    stop: {
      q: 'עוצרים איפשהו?',
      o: { coffee: ['קפה בתצפית'], food: ['ארוחה אמיתית איפשהו'],
           ice: ['גלידה. לא נתון למשא ומתן.'], no: ['רק דלק. נוסעים.'] },
    },
  },
  trip: {
    direction: {
      q: 'לאיזה כיוון?',
      o: { north: ['צפון', 'ירוק, קר, מפלים'], desert: ['דרום והמדבר'],
           coast: ['לאורך החוף'], jlm: ['ירושלים'] },
    },
    length: {
      q: 'לכמה זמן אנחנו נעלמים?',
      o: { day: ['יום אחד'], night: ['לילה'], gone: ['שאף אחד לא ידע איפה אנחנו'] },
    },
  },
  italy: {
    city: {
      q: 'טוב. איזה חלק באיטליה?', sub: 'בחרת את האפשרות היקרה ואני מכבד את זה.',
      o: { rome: ['רומא'], florence: ['פירנצה'], venice: ['ונציה'],
           amalfi: ['חוף אמלפי'], milan: ['מילאנו'], all: ['הכול', 'אנחנו לא חוזרים'] },
    },
    focus: {
      q: 'ומה אנחנו באמת עושים שם?',
      o: { eat: ['אוכלים הכול'], wine: ['יין וכרמים'], vespa: ['וספה ובלגן'],
           art: ['אמנות', 'ולהעמיד פנים שאנחנו מבינים'] },
    },
  },
  movie: {
    where: {
      q: 'איפה אנחנו צופים?',
      o: { cinema: ['בקולנוע ממש'], fort: ['מבצר שמיכות בבית'],
           roof: ['מקרן על הגג'], car: ['באוטו, כמו נוער'] },
    },
    genre: {
      q: 'ז׳אנר?',
      o: { action: ['אקשן'], comedy: ['קומדיה'], horror: ['אימה', 'שאוכל להגן עלייך'],
           romance: ['רומנטי'], doc: ['דוקומנטרי'], sleep: ['משהו שנירדם בו'] },
    },
    snacks: {
      q: 'מדיניות חטיפים?',
      o: { sweet: ['מתוק'], salty: ['מלוח'], both: ['שניהם. לא מתפשרים.'] },
    },
  },
  pool: {
    where: {
      q: 'איזה מים?',
      o: { hotel: ['בריכת מלון'], roof: ['בריכה על הגג'], sea: ['הים במקום'],
           sneak: ['בריכה של מישהו שנעמיד פנים שאנחנו אורחים שלו'] },
    },
    plan: {
      q: 'והתוכנית היא…',
      o: { swim: ['לשחות באמת'], float: ['לצוף ולא לעשות כלום'],
           drink: ['קוקטיילים בקצה'], tan: ['להשתזף ולהתלונן על החום'] },
    },
  },
  walk: {
    where: {
      q: 'הולכים איפה?',
      o: { jaffa: ['יפו העתיקה והנמל'], promenade: ['הטיילת'],
           market: ['שוק הכרמל'], neve: ['נווה צדק'] },
    },
    when: {
      q: 'מתי?',
      o: { sunset: ['בשקיעה'], after: ['אחרי ארוחת ערב'], late: ['באמצע הלילה'] },
    },
  },
  cook: {
    who: {
      q: 'מי מבשל?',
      o: { me: ['אני מבשל, את מפקחת'], you: ['את מבשלת, אני מפקח'],
           both: ['שנינו. בלגן.'], order: ['נזמין ולא נדבר על זה יותר'] },
    },
    dish: {
      q: 'מה בתפריט?',
      o: { pasta: ['פסטה'], sushi: ['סושי ביתי', 'אמיץ'], shakshuka: ['שקשוקה'],
           steak: ['סטייק'], dessert: ['רק קינוח'] },
    },
    drink: {
      q: 'ולשתות?',
      o: { red: ['יין אדום'], white: ['לבן או מבעבע'], open: ['מה שפתוח'] },
    },
  },
  shopping: {
    where: {
      q: 'שופינג איפה?',
      o: { mall: ['קניון'], vintage: ['וינטג׳ ויד שנייה'], market: ['בשוק'],
           bed: ['אונליין, במיטה', 'יעיל'] },
    },
    rule: {
      q: 'כללי הבית?',
      o: { youpick: ['את בוחרת לי משהו'], ipick: ['אני בוחר לך משהו'],
           one: ['פריט אחד לכל אחד'], none: ['בלי תקציב', 'אמיץ מצידך'] },
    },
  },
  nothing: {
    where: {
      q: 'לא עושים כלום, אבל איפה?',
      o: { mine: ['אצלי'], yours: ['אצלך'], beach: ['על החול'], bed: ['במיטה. תשובה סופית.'] },
    },
    with: {
      q: 'בליווי?',
      o: { series: ['סדרה שכבר סיימנו'], music: ['מוזיקה ואפס תוכניות'],
           talk: ['לדבר עד שלוש לפנות בוקר'] },
    },
  },
  bowling: {
    stakes: {
      q: 'על מה אנחנו משחקים?',
      o: { dinner: ['המפסיד קונה ארוחה'], fun: ['סתם בכיף'],
           bumper: ['עם מעקות, בלי בושה'], war: ['את הולכת ליפול'] },
    },
    after: {
      q: 'ואחר כך?',
      o: { arcade: ['המשחקייה ליד'], drinks: ['משהו לשתות'], food: ['אוכל, ברור'] },
    },
  },
  karting: {
    mode: {
      q: 'כמה ברצינות אנחנו לוקחים את זה?',
      o: { serious: ['ברצינות קטלנית'], friendly: ['הקפות ידידותיות'],
           photo: ['אני רק רוצה את התמונה עם הקסדה'], drive: ['המפסיד נוהג הביתה'] },
    },
    after: {
      q: 'ואז מה?',
      o: { burgers: ['המבורגרים'], ice: ['גלידה'], again: ['ריטליישן'] },
    },
  },
  escape: {
    theme: {
      q: 'איזה חדר?',
      o: { horror: ['אימה'], heist: ['שוד'], mystery: ['מסתורין'], pirate: ['פיראטים'] },
    },
    plan: {
      q: 'תחזית כנה?',
      o: { fast: ['בחוץ תוך ארבעים דקות'], hints: ['נצטרך כל רמז שיש'],
           panic: ['אני נכנס ללחץ, את פותרת'] },
    },
  },
  beach: {
    when: {
      q: 'מתי אנחנו הולכים?',
      o: { morning: ['בבוקר, ים ריק'], sunset: ['שעת הזהב'], late: ['שחייה בלילה'] },
    },
    bring: {
      q: 'מה אנחנו לוקחים?',
      o: { melon: ['אבטיח'], speaker: ['רמקול וחטיפים'], towels: ['רק מגבות'] },
    },
  },
  picnic: {
    where: {
      q: 'איפה פורסים את השמיכה?',
      o: { park: ['בפארק'], beach: ['בים'], roof: ['על גג'], view: ['איפשהו עם נוף'] },
    },
    food: {
      q: 'מה יש בסל?',
      o: { cheese: ['גבינות ולחם'], melon: ['אבטיח ושום דבר אחר'],
           full: ['מטבח שלם'], market: ['מה שיהיה בשוק'] },
    },
  },
  music: {
    kind: {
      q: 'מה אנחנו הולכים לשמוע?',
      o: { rock: ['רוק'], jazz: ['ג׳אז'], elec: ['אלקטרונית'],
           israeli: ['משהו ישראלי'], any: ['מה שיהיה'] },
    },
    where: {
      q: 'כמה גדול?',
      o: { small: ['מקום קטן, מקרוב'], big: ['הופעה אמיתית'], bar: ['בר עם להקה'] },
    },
  },
  dancing: {
    where: {
      q: 'רוקדים איפה?',
      o: { salsa: ['ערב סלסה'], club: ['מועדון'], home: ['במטבח, בבית'],
           any: ['בכל מקום שיש בו מוזיקה'] },
    },
    skill: {
      q: 'תהיי כנה.',
      o: { can: ['אני באמת יודעת לרקוד'], cant: ['אני לא יודעת, וארקוד בכל זאת'] },
    },
  },
  museum: {
    what: {
      q: 'מסתכלים על מה?',
      o: { art: ['אמנות'], hist: ['היסטוריה'], photo: ['צילום'],
           weird: ['מוזיאון קטן ומוזר'] },
    },
    after: {
      q: 'ואחר כך?',
      o: { coffee: ['קפה ודעות נחרצות'], shop: ['חנות המזכרות'], walk: ['הליכה ארוכה'] },
    },
  },
  games: {
    which: {
      q: 'איזה משחק?',
      o: { shesh: ['שש-בש'], catan: ['קטאן'], cards: ['קלפים'], new: ['משהו חדש'] },
    },
    stakes: {
      q: 'על מה משחקים?',
      o: { next: ['המנצח בוחר את הדייט הבא'], none: ['בלי הימור, נשארים חברים'],
           dish: ['המפסיד שוטף כלים'] },
    },
  },
  spa: {
    what: {
      q: 'איזה סוג של שקט?',
      o: { massage: ['עיסוי'], springs: ['מעיינות חמים'], sauna: ['סאונה ואדים'],
           allday: ['כל היום'] },
    },
    after: {
      q: 'ואחרי?',
      o: { nap: ['שנ״צ'], dinner: ['ארוחת ערב'], quiet: ['כלום. שקט.'] },
    },
  },
  drinks: {
    kind: {
      q: 'מה אנחנו שותים?',
      o: { cocktail: ['קוקטיילים'], wine: ['יין'], beer: ['גן בירה'],
           roof: ['גג, מה שיהיה'] },
    },
    pace: {
      q: 'למה לצפות?',
      o: { one: ['אחד, ואז ארוחה'], few: ['כמה'], close: ['עד שהם סוגרים'] },
    },
  },
};

const HE_DRESS = {
  casual: ['רגיל', 'ג׳ינס וכוונות טובות'],
  nice:   ['יפה', 'זה שאני אוהב'],
  fancy:  ['מפונפן', 'הפקה מלאה'],
  pjs:    ['פיג׳מה', 'אני בכל מקרה בפיג׳מה'],
};

const HE_TIMES = {
  '10:00': ['10:00', 'אנשי בוקר'],
  '13:00': ['13:00', 'צהריים'],
  '16:00': ['16:00', 'אחר הצהריים'],
  '18:30': ['18:30', 'שקיעה. התשובה הנכונה.'],
  '20:00': ['20:00', 'קלאסי'],
  '22:00': ['22:00', 'מאוחר ומעניין'],
};

const HE_SUNSET_NOTES = {
  early: 'מוקדם, בזמן שעוד אור',
  just:  'ממש לפני שהיא יורדת. זו.',
  at:    'בדיוק כשהיא שוקעת',
  after: 'קצת אחרי, כשהשמיים נהיים כחולים',
  dark:  'אחרי שחשך, ישר לארוחה',
};

const HE_TERMS = [
  'אני לא אבטל יום לפני.',
  'הטלפונים נשארים בכיס לפחות שעה.',
  'מי שבחר את המקום לא מתלונן על המקום.',
  'הדייט הזה מחייב מבחינה משפטית.',
];

const HE_TAUNTS = [
  'לא.',
  'הכפתור לא מסכים.',
  'נסי שוב, לאט יותר.',
  'הוא זז. מוזר.',
  'את נעשית גרועה בזה.',
  'הכפתור הזה לא בשבילך.',
  'ברצינות?',
  'טוב, הזדמנות אחרונה,',
  'אין סיכוי.',
  'הוא ראה אותך מגיעה.',
  'מהר יותר. לא, מהר מזה.',
  'התמדה מרשימה. עדיין לא.',
  'הכפתור נהנה מזה.',
  'אפשר פשוט ללחוץ על השני.',
  'אפשר להמשיך ככה כל הלילה.',
  'זה הכי הרבה שמישהי ניסתה.',
];

const HE_NO_LABELS = [
  'לא', 'לא…', 'המממ', 'אולי?', 'כנראה', 'כמעט', 'טוב', 'אוקיי כן',
  'תתפסי אותי', 'לא לא', 'שוב', 'עוד קצת', 'קרוב', 'נו באמת', 'אף פעם',
];

const HE_DECOY_TAUNTS = [
  'לא זו.',
  'יש לו דעה בנושא.',
  'נסי אחת מאלה שזוהרות.',
  'האפשרות הזאת לא על השולחן.',
  'היא זזה. מוזר.',
  'הזוהרות הן האמיתיות.',
  'ניסיון יפה.',
  'זה תפריט, לא דמוקרטיה.',
  'אפשר להסתכל. זה הכול.',
  'הרשימה הקצרה היא הרשימה הקצרה.',
  'עדיין לא.',
  'את החלק הזה הוא כבר החליט.',
];

const HE_LOADING = [
  'בודק את היומן שלו…',
  'הוא פנוי. הוא תמיד היה פנוי.',
  'שומר את הערב…',
  'מעדכן את השף, מזג האוויר והגורל…',
  'אושר.',
];

const HE_RIDE_NOTES = {
  r1: 'רועש, אדום, קשה להתווכח איתו',
  r2: 'שחור מלא. תחזיקי חזק.',
  r3: 'גג, דלתות, ומערכת שמע שעובדת',
};

/* Place names that get printed on the ticket when she never locked in a
   venue. Keyed, not looked up by English string, so nothing drifts. */
const HE_PLACES = {
  home: 'הבית', kitchen: 'המטבח', sofa: 'הספה', findOut: 'תגלי בעצמך',
  mine: 'אצלי', yours: 'אצלך', beach: 'הים', bed: 'המיטה', soft: 'איפשהו רך',
  fort: 'מבצר השמיכות', roof: 'הגג', car: 'האוטו',
  rome: 'רומא', florence: 'פירנצה', venice: 'ונציה', amalfi: 'חוף אמלפי',
  milan: 'מילאנו', italy: 'איטליה',
  north: 'צפון', desert: 'המדבר', coast: 'לאורך החוף', jlm: 'ירושלים',
  galilee: 'הגליל', carmel: 'הכרמל', judean: 'הרי יהודה',
  deadsea: 'כביש ים המלח', openroad: 'הכביש הפתוח',
};

function pl(key, en) {
  return LANG === 'he' && HE_PLACES[key] ? HE_PLACES[key] : en;
}

/* The moto routes: the road numbers are the same in both languages,
   the reason for riding them is not. */
const HE_ROUTES = {
  north:  ['כביש 899 ואצבע הגליל', 'זה מה שנוסעים בשבילו צפונה.'],
  carmel: ['כביש היער בכרמל, 721', 'יער כל הדרך, ואז הים.'],
  jlm:    ['כביש 386 לירושלים', 'סרפנטינות עד למעלה.'],
  desert: ['כביש 90 לאורך ים המלח', 'כדאי לבדוק את החום לפני שמתחייבים.'],
  coast:  ['כביש החוף הישן', 'לאט, מלוח, בלי למהר.'],
  follow: ['כבישי אופנועים ליד תל אביב', 'כל דבר שיש בו סיבוב.'],
};

/* Recommendation copy. Search terms stay English — Google Maps handles
   them better and the results are the same places either way. */
const HE_RECS = {
  homeDelivery:  'האפשרות העצלה. האפשרות הנכונה.',
  cookInstead:   'שאפתני. אני תומך. באופן רופף.',
  cookTitle:     'לבשל את זה בעצמנו במקום',
  liveResults:   'תוצאות חיות סביב {city}. אפשר ללחוץ ולדפדף.',
  topRated:      'ממוין לפי אנשים שאוכלים בחוץ יותר מדי.',
  iceOnWay:      'תחנת חובה.',
  iceStop:       'הגיע לנו.',
  theRoute:      'הכביש',
  helmet:        'עניין הקסדה',
  helmetNote:    'קסדה שנייה, וג׳קט שמתאים לך.',
  coffeeView:    'קפה עם נוף',
  coffeeViewNote:'איפה שאפשר לחנות ולראות את האופנוע.',
  eatOnWay:      'משהו לאכול בדרך',
  eatOnWayNote:  'לנסוע רעבים זה איך שמתחילים ויכוחים.',
  whereSwim:     'איפה שוחים',
  whereSwimNote: 'כדאי לבדוק שעות פתיחה, הן משקרות לפעמים.',
  cocktails:     'קוקטיילים בסביבה',
  cocktailsNote: 'לאחרי, או לבמהלך.',
  whereWeGo:     'לאן נוסעים',
  whereWeGoNote: 'לבחור שתי עצירות, לא שש. אנחנו תמיד מתכננים יותר מדי.',
  sleep:         'איפה לישון',
  sleepNote:     'להזמין לפני שהיא מתחרטת.',
  research:      'שלב המחקר. מהנה מאוד, מסוכן קלות.',
  flights:       'טיסות ל{city}',
  flightsNote:   'ככה זה באמת מתחיל.',
  cinemas:       'בתי קולנוע בסביבה',
  cinemasNote:   'כדאי לבדוק מה בכלל מוקרן.',
  snackRun:      'קניית חטיפים',
  snackRunNote:  'שתי שקיות מינימום.',
  whereWeShop:   'איפה קונים',
  whereWeShopNote: 'שוק מנצח סופר. תמיד.',
  recipes:       'מתכונים ל{dish}',
  recipesNote:   'אחד מאיתנו קורא. אחד מאיתנו מתעלם.',
  whereToGo:     'לאן ללכת',
  whereToGoNote: 'להביא סבלנות ובקבוק מים.',
  watermelon:    'אבטיח',
  watermelonNote:'לא נתון למשא ומתן.',
  foodNearby:    'אוכל בסביבה',
  foodNearbyNote:'שהמפסיד ישלם עליו.',
  buyFood:       'איפה קונים את האוכל',
  buyFoodNote:   'קודם שוק, אחר כך פארק.',
  wineBars:      'ברי יין ב{city}',
  wineBarsNote:  'איפה שאפשר לשמוע אחד את השני.',
};

/* ---------------- applying it ---------------- */

/* English is the source of truth, so keep a clean copy of every field
   the overlay touches. Without this the setup page could go to Hebrew
   but never come back. */
const EN_SNAPSHOT = {
  activities: ACTIVITIES.map((a) => ({ label: a.label, note: a.note })),
  flows: JSON.parse(JSON.stringify(FLOWS)),
  dress: DRESS.map((d) => ({ label: d.label, note: d.note })),
  times: TIMES.map((x) => ({ label: x.label, note: x.note })),
  terms: TERMS.map((x) => x.text),
  termNotes: TERMS.map((x) => x.note),
  taunts: TAUNTS.slice(),
  noLabels: NO_LABELS.slice(),
  decoyTaunts: DECOY_TAUNTS.slice(),
  loading: LOADING_LINES.slice(),
  rideNotes: DEFAULT_RIDES.map((r) => r.note),
};

function pairInto(obj, pair) {
  if (!pair) return;
  if (pair[0] != null) obj.label = pair[0];
  if (pair[1] !== undefined) obj.note = pair[1];
}

function applyLang(lang) {
  LANG = lang === 'he' ? 'he' : 'en';

  // Always restore English first, then overlay.
  ACTIVITIES.forEach((a, i) => { a.label = EN_SNAPSHOT.activities[i].label; a.note = EN_SNAPSHOT.activities[i].note; });
  Object.keys(FLOWS).forEach((k) => FLOWS[k].forEach((step, si) => {
    const src = EN_SNAPSHOT.flows[k][si];
    step.q = src.q;
    if (src.sub !== undefined) step.sub = src.sub;
    step.options.forEach((o, oi) => { o.label = src.options[oi].label; o.note = src.options[oi].note; });
  }));
  DRESS.forEach((d, i) => { d.label = EN_SNAPSHOT.dress[i].label; d.note = EN_SNAPSHOT.dress[i].note; });
  TIMES.forEach((x, i) => { x.label = EN_SNAPSHOT.times[i].label; x.note = EN_SNAPSHOT.times[i].note; });
  TERMS.forEach((x, i) => { x.text = EN_SNAPSHOT.terms[i]; x.note = EN_SNAPSHOT.termNotes[i]; });
  TAUNTS.splice(0, TAUNTS.length, ...EN_SNAPSHOT.taunts);
  NO_LABELS.splice(0, NO_LABELS.length, ...EN_SNAPSHOT.noLabels);
  DECOY_TAUNTS.splice(0, DECOY_TAUNTS.length, ...EN_SNAPSHOT.decoyTaunts);
  LOADING_LINES.splice(0, LOADING_LINES.length, ...EN_SNAPSHOT.loading);
  DEFAULT_RIDES.forEach((r, i) => { r.note = EN_SNAPSHOT.rideNotes[i]; });

  if (LANG !== 'he') return;

  ACTIVITIES.forEach((a) => pairInto(a, HE_ACTIVITIES[a.id]));

  Object.keys(FLOWS).forEach((k) => {
    const tf = HE_FLOWS[k];
    if (!tf) return;
    FLOWS[k].forEach((step) => {
      const ts = tf[step.id];
      if (!ts) return;
      if (ts.q) step.q = ts.q;
      if (ts.sub !== undefined) step.sub = ts.sub;
      step.options.forEach((o) => pairInto(o, ts.o && ts.o[o.id]));
    });
  });

  DRESS.forEach((d) => pairInto(d, HE_DRESS[d.id]));
  TIMES.forEach((x) => pairInto(x, HE_TIMES[x.id]));
  TERMS.forEach((x, i) => {
    if (HE_TERMS[i]) x.text = HE_TERMS[i];
    if (x.note) x.note = t('cantUncheck');
  });
  TAUNTS.splice(0, TAUNTS.length, ...HE_TAUNTS);
  NO_LABELS.splice(0, NO_LABELS.length, ...HE_NO_LABELS);
  DECOY_TAUNTS.splice(0, DECOY_TAUNTS.length, ...HE_DECOY_TAUNTS);
  LOADING_LINES.splice(0, LOADING_LINES.length, ...HE_LOADING);
  DEFAULT_RIDES.forEach((r) => { if (HE_RIDE_NOTES[r.id]) r.note = HE_RIDE_NOTES[r.id]; });
}

/* Recommendation strings, looked up only when Hebrew is on. */
function rt(key, vars) {
  let s = LANG === 'he' && HE_RECS[key] ? HE_RECS[key] : null;
  if (s == null) return null;
  if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}
