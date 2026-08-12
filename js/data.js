/* ============================================================
   Content: activities, their follow-up questions, and the
   recommendation lists. Everything here is data — the flow
   engine in app.js just walks it.
   ============================================================ */

const ACTIVITIES = [
  { id: 'food',     emoji: '🍝', label: 'Food',          note: 'the undefeated classic' },
  { id: 'bikes',    emoji: '🚲', label: 'Bikes',         note: 'wind, sweat, romance' },
  { id: 'trip',     emoji: '🚗', label: 'A trip',        note: 'leave the city behind' },
  { id: 'italy',    emoji: '🇮🇹', label: 'Italy',         note: 'yes, that Italy' },
  { id: 'movie',    emoji: '🎬', label: 'Movie night',   note: 'popcorn negotiations' },
  { id: 'pool',     emoji: '🏊', label: 'Pool day',      note: 'floating, mostly' },
  { id: 'walk',     emoji: '🚶', label: 'A long walk',   note: 'and talking too much' },
  { id: 'cook',     emoji: '👨‍🍳', label: 'Cooking night', note: 'someone will burn something' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping',      note: 'I will hold the bags' },
  { id: 'surprise', emoji: '🎁', label: 'Surprise me',   note: 'brave choice' },
  { id: 'nothing',  emoji: '🛋️', label: 'Nothing at all', note: 'still counts as a date' },
];

/* Follow-up questions per activity. Each step: { id, q, sub?, options[] } */
const FLOWS = {
  food: [
    {
      id: 'cuisine', q: 'What are we eating?', sub: 'Choose carefully. This is the whole evening.',
      options: [
        { id: 'italian', emoji: '🍝', label: 'Italian' },
        { id: 'sushi',   emoji: '🍣', label: 'Sushi' },
        { id: 'burgers', emoji: '🍔', label: 'Burgers' },
        { id: 'israeli', emoji: '🥙', label: 'Hummus & Israeli' },
        { id: 'brunch',  emoji: '🥑', label: 'Brunch' },
        { id: 'steak',   emoji: '🥩', label: 'Steak' },
        { id: 'vegan',   emoji: '🌱', label: 'Vegan' },
        { id: 'any',     emoji: '🤷', label: 'You decide', note: 'dangerous' },
      ],
    },
    {
      id: 'vibe', q: 'And the vibe?',
      options: [
        { id: 'sunset', emoji: '🌅', label: 'Sunset view',  note: 'obviously the right answer' },
        { id: 'roof',   emoji: '🌃', label: 'Rooftop' },
        { id: 'hole',   emoji: '🍴', label: 'Tiny place, plastic chairs' },
        { id: 'fancy',  emoji: '✨', label: 'Fancy',        note: "I'm dressing up" },
      ],
    },
  ],

  bikes: [
    {
      id: 'where', q: 'Where are we riding?',
      options: [
        { id: 'promenade', emoji: '🌊', label: 'The beach promenade' },
        { id: 'park',      emoji: '🌳', label: 'Park HaYarkon' },
        { id: 'jaffa',     emoji: '🕌', label: 'Down to Old Jaffa' },
        { id: 'follow',    emoji: '🚲', label: "Wherever, I'm following you" },
      ],
    },
    {
      id: 'when', q: 'What time of day?',
      options: [
        { id: 'sunrise', emoji: '🌄', label: 'Sunrise', note: 'ambitious of you' },
        { id: 'golden',  emoji: '🌇', label: 'Golden hour' },
        { id: 'night',   emoji: '🌙', label: 'Night ride' },
      ],
    },
    {
      id: 'stop', q: 'Coffee stop halfway?',
      options: [
        { id: 'yes',  emoji: '☕', label: 'Obviously' },
        { id: 'ice',  emoji: '🍦', label: 'Ice cream instead' },
        { id: 'no',   emoji: '💪', label: 'No. We are athletes.' },
      ],
    },
  ],

  trip: [
    {
      id: 'direction', q: 'Which direction?',
      options: [
        { id: 'north',  emoji: '🏔️', label: 'North', note: 'green, cold, waterfalls' },
        { id: 'desert', emoji: '🏜️', label: 'South & desert' },
        { id: 'coast',  emoji: '🏖️', label: 'Up the coast' },
        { id: 'jlm',    emoji: '🕍', label: 'Jerusalem' },
      ],
    },
    {
      id: 'length', q: 'How long are we disappearing for?',
      options: [
        { id: 'day',   emoji: '☀️', label: 'One day' },
        { id: 'night', emoji: '🌙', label: 'Overnight' },
        { id: 'gone',  emoji: '🤫', label: "Don't tell anyone where we are" },
      ],
    },
  ],

  italy: [
    {
      id: 'city', q: 'Okay. Which part of Italy?', sub: 'You picked the expensive option and I respect it.',
      options: [
        { id: 'rome',     emoji: '🏛️', label: 'Rome' },
        { id: 'florence', emoji: '🎨', label: 'Florence' },
        { id: 'venice',   emoji: '🛶', label: 'Venice' },
        { id: 'amalfi',   emoji: '🍋', label: 'Amalfi Coast' },
        { id: 'milan',    emoji: '👜', label: 'Milan' },
        { id: 'all',      emoji: '🗺️', label: "All of it", note: "we're not coming back" },
      ],
    },
    {
      id: 'focus', q: 'And what do we actually do there?',
      options: [
        { id: 'eat',   emoji: '🍕', label: 'Eat everything' },
        { id: 'wine',  emoji: '🍷', label: 'Wine & vineyards' },
        { id: 'vespa', emoji: '🛵', label: 'Vespa & chaos' },
        { id: 'art',   emoji: '🖼️', label: 'Art', note: 'and pretending to understand it' },
      ],
    },
  ],

  movie: [
    {
      id: 'where', q: 'Where are we watching?',
      options: [
        { id: 'cinema', emoji: '🎟️', label: 'Actual cinema' },
        { id: 'fort',   emoji: '🛋️', label: 'Blanket fort at home' },
        { id: 'roof',   emoji: '📽️', label: 'Projector on the roof' },
        { id: 'car',    emoji: '🚗', label: 'In the car, like teenagers' },
      ],
    },
    {
      id: 'genre', q: 'Genre?',
      options: [
        { id: 'action', emoji: '💥', label: 'Action' },
        { id: 'comedy', emoji: '😂', label: 'Comedy' },
        { id: 'horror', emoji: '👻', label: 'Horror', note: 'so I can protect you' },
        { id: 'romance', emoji: '💘', label: 'Romance' },
        { id: 'doc',    emoji: '🌍', label: 'Documentary' },
        { id: 'sleep',  emoji: '😴', label: "Something we'll fall asleep in" },
      ],
    },
    {
      id: 'snacks', q: 'Snack policy?',
      options: [
        { id: 'sweet',  emoji: '🍫', label: 'Sweet' },
        { id: 'salty',  emoji: '🍿', label: 'Salty' },
        { id: 'both',   emoji: '🤤', label: 'Both. Non-negotiable.' },
      ],
    },
  ],

  pool: [
    {
      id: 'where', q: 'Which water?',
      options: [
        { id: 'hotel', emoji: '🏨', label: 'Hotel pool' },
        { id: 'roof',  emoji: '🌆', label: 'Rooftop pool' },
        { id: 'sea',   emoji: '🌊', label: 'The sea instead' },
        { id: 'sneak', emoji: '😎', label: "Someone's pool we'll pretend to be guests at" },
      ],
    },
    {
      id: 'plan', q: 'And the plan is…',
      options: [
        { id: 'swim',  emoji: '🏊', label: 'Actually swim' },
        { id: 'float', emoji: '🛟', label: 'Float and do nothing' },
        { id: 'drink', emoji: '🍹', label: 'Cocktails by the edge' },
        { id: 'tan',   emoji: '☀️', label: 'Sunbathe and complain about the heat' },
      ],
    },
  ],

  walk: [
    {
      id: 'where', q: 'Walking where?',
      options: [
        { id: 'jaffa',     emoji: '🕌', label: 'Old Jaffa & the port' },
        { id: 'promenade', emoji: '🌊', label: 'The promenade' },
        { id: 'market',    emoji: '🍅', label: 'Carmel Market' },
        { id: 'neve',      emoji: '🏘️', label: 'Neve Tzedek' },
      ],
    },
    {
      id: 'when', q: 'When?',
      options: [
        { id: 'sunset', emoji: '🌅', label: 'Sunset' },
        { id: 'after',  emoji: '🍨', label: 'After dinner' },
        { id: 'late',   emoji: '🌌', label: 'Middle of the night' },
      ],
    },
  ],

  cook: [
    {
      id: 'who', q: 'Who is cooking?',
      options: [
        { id: 'me',    emoji: '👨‍🍳', label: 'I cook, you supervise' },
        { id: 'you',   emoji: '👩‍🍳', label: 'You cook, I supervise' },
        { id: 'both',  emoji: '🤝', label: 'Both of us. Chaos.' },
        { id: 'order', emoji: '📦', label: "We order and never speak of it" },
      ],
    },
    {
      id: 'dish', q: "What's on the menu?",
      options: [
        { id: 'pasta',     emoji: '🍝', label: 'Pasta' },
        { id: 'sushi',     emoji: '🍣', label: 'Homemade sushi', note: 'bold' },
        { id: 'shakshuka', emoji: '🍳', label: 'Shakshuka' },
        { id: 'steak',     emoji: '🥩', label: 'Steak' },
        { id: 'dessert',   emoji: '🍰', label: 'Dessert only' },
      ],
    },
    {
      id: 'drink', q: 'To drink?',
      options: [
        { id: 'red',   emoji: '🍷', label: 'Red wine' },
        { id: 'white', emoji: '🥂', label: 'White / bubbles' },
        { id: 'open',  emoji: '🧃', label: "Whatever's open" },
      ],
    },
  ],

  shopping: [
    {
      id: 'where', q: 'Shopping where?',
      options: [
        { id: 'mall',    emoji: '🏬', label: 'Mall' },
        { id: 'vintage', emoji: '🧥', label: 'Vintage & thrift' },
        { id: 'market',  emoji: '🛒', label: 'The market' },
        { id: 'bed',     emoji: '📱', label: 'Online, in bed', note: 'efficient' },
      ],
    },
    {
      id: 'rule', q: 'House rules?',
      options: [
        { id: 'youpick', emoji: '👗', label: 'You pick something for me' },
        { id: 'ipick',   emoji: '👕', label: 'I pick something for you' },
        { id: 'one',     emoji: '☝️', label: 'One item each' },
        { id: 'none',    emoji: '💸', label: 'No budget', note: 'brave of you' },
      ],
    },
  ],

  nothing: [
    {
      id: 'where', q: 'Doing nothing, but where?',
      options: [
        { id: 'mine',  emoji: '🏠', label: 'My place' },
        { id: 'yours', emoji: '🏡', label: 'Your place' },
        { id: 'beach', emoji: '🏖️', label: 'On the sand' },
        { id: 'bed',   emoji: '🛏️', label: 'Bed. Final answer.' },
      ],
    },
    {
      id: 'with', q: 'Accompanied by?',
      options: [
        { id: 'series', emoji: '📺', label: 'A series we already finished' },
        { id: 'music',  emoji: '🎵', label: 'Music and zero plans' },
        { id: 'talk',   emoji: '💬', label: 'Talking until 3am' },
      ],
    },
  ],

  surprise: [],
};

/* ------------------------------------------------------------
   Recommendations.
   Curated Tel Aviv picks where I have them; everything else
   falls back to a Google Maps search built from her answers.
   Every card links out to Maps so nothing here has to be
   taken on faith.
   ------------------------------------------------------------ */

const TLV_PICKS = {
  italian: [
    { name: 'Pronto',      note: 'Old-school Italian, Nachmani St. Book ahead.' },
    { name: 'Tony Vespa',  note: 'Pizza by weight. Zero ceremony, all joy.' },
    { name: 'Ba Italia',   note: 'Neighborhood pasta, easy to get into.' },
  ],
  sushi: [
    { name: 'Moon',        note: 'Bograshov. The reliable one.' },
    { name: 'Onami',       note: 'Bigger menu, calmer room.' },
    { name: 'Yakimono',    note: 'If we want to over-order.' },
  ],
  burgers: [
    { name: 'Vitrina',     note: 'The one people argue about being the best.' },
    { name: 'Susu & Sons', note: 'Loud, greasy, correct.' },
    { name: 'Moses',       note: 'Safe bet, always open.' },
  ],
  israeli: [
    { name: 'Abu Hassan',  note: 'Jaffa. Hummus religion. Go early, they run out.' },
    { name: 'Miznon',      note: 'Pita chaos, standing room.' },
    { name: 'M25',         note: 'Carmel Market. Meat and wine.' },
  ],
  brunch: [
    { name: 'Benedict',    note: 'Breakfast at any hour, including 2am.' },
    { name: 'Cafe Xoho',   note: 'Small, sunny, good coffee.' },
    { name: 'Bucke',       note: 'Brunch with a queue, which means it is good.' },
  ],
  steak: [
    { name: 'M25',         note: 'Butcher shop energy. Carmel Market.' },
    { name: 'Meating',     note: 'Proper steakhouse, dress up a bit.' },
    { name: 'HaBasta',     note: 'Market-driven, changes daily.' },
  ],
  vegan: [
    { name: 'Meshek Barzilay', note: 'Neve Tzedek. Pretty and plant-based.' },
    { name: 'Anastasia',       note: 'All-day vegan, big portions.' },
    { name: 'Bana',            note: 'Rothschild, vegan comfort food.' },
  ],
};

const SUNSET_PICKS = [
  { name: 'Manta Ray',   note: 'On the sand, sunset is the whole point.' },
  { name: 'La La Land',  note: 'Beach bar. Order late, stay later.' },
  { name: 'Kalamata',    note: 'Port side, water in view.' },
];

/* Build the recommendation set for the answers she gave. */
function buildRecs(activity, answers, city) {
  const isTLV = /tel.?aviv|תל.?אביב|jaffa|יפו/i.test(city || '');
  const q = (s) => `https://www.google.com/maps/search/${encodeURIComponent(s)}`;

  const out = [];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // `place: true` means it's a real venue she can lock in as the location.
  // `place: false` is a "go look at this" card — a search, a route, a recipe.
  const push = (name, note, search) =>
    out.push({ name: cap(name), note, place: true, url: q(search || `${name} ${city}`) });
  const pushIdea = (name, note, search) =>
    out.push({ name: cap(name), note, place: false, url: q(search) });
  const pushWeb = (name, note, search) =>
    out.push({ name, note, place: false, url: `https://www.google.com/search?q=${encodeURIComponent(search)}` });

  if (activity === 'food') {
    const cuisine = answers.cuisine;
    const vibe = answers.vibe;

    if (vibe === 'sunset' && isTLV) {
      SUNSET_PICKS.forEach((p) => push(p.name, p.note));
    }
    if (isTLV && TLV_PICKS[cuisine]) {
      TLV_PICKS[cuisine].forEach((p) => push(p.name, p.note));
    }
    if (!out.length) {
      const words = {
        italian: 'italian restaurant', sushi: 'sushi', burgers: 'burger',
        israeli: 'hummus restaurant', brunch: 'brunch cafe', steak: 'steakhouse',
        vegan: 'vegan restaurant', any: 'best restaurants',
      }[cuisine] || 'restaurant';
      const mod = { sunset: 'with a sunset view', roof: 'rooftop', hole: 'hole in the wall', fancy: 'fine dining' }[vibe] || '';
      pushIdea(`${words} ${mod}`.trim(), `Live results around ${city}. Tap to browse.`, `${words} ${mod} ${city}`);
      pushIdea(`the highest rated ${words} in ${city}`, 'Sorted by people who eat out too much.', `best ${words} ${city}`);
    }
  }

  if (activity === 'walk') {
    const map = {
      jaffa: ['Old Jaffa Port', 'Flea market, then the water. Best at golden hour.'],
      promenade: ['Tel Aviv Promenade', 'Start north, walk south until we are hungry.'],
      market: ['Carmel Market', 'Loud. Buy something we do not need.'],
      neve: ['Neve Tzedek', 'Small streets, expensive windows, good ice cream.'],
    }[answers.where];
    if (map) push(map[0], map[1], `${map[0]} ${city}`);
    pushIdea('Ice cream on the way', 'Mandatory checkpoint.', `ice cream ${city}`);
  }

  if (activity === 'bikes') {
    const map = {
      promenade: 'Tel Aviv beach promenade bike path',
      park: 'Park HaYarkon bike trail',
      jaffa: 'Jaffa port bike route',
      follow: 'bike trails near me',
    }[answers.where];
    pushIdea('The route', 'Open the map before we go, not during.', `${map} ${city}`);
    if (answers.stop === 'yes') pushIdea('Coffee stop', 'Somewhere with a place to lock the bikes.', `cafe with outdoor seating ${city}`);
    if (answers.stop === 'ice') pushIdea('Ice cream stop', 'Earned it.', `ice cream ${city}`);
  }

  if (activity === 'pool') {
    const map = {
      hotel: 'hotel day pass pool', roof: 'rooftop pool bar',
      sea: 'best beach', sneak: 'public pool',
    }[answers.where] || 'pool';
    pushIdea('Where to swim', 'Check opening hours, they lie sometimes.', `${map} ${city}`);
    if (answers.plan === 'drink') pushIdea('Cocktails nearby', 'For after, or during.', `cocktail bar ${city}`);
  }

  if (activity === 'trip') {
    const map = {
      north: 'waterfalls and hikes northern Israel',
      desert: 'Negev desert viewpoints',
      coast: 'best beaches northern coast Israel',
      jlm: 'things to do Jerusalem',
    }[answers.direction];
    pushIdea('Where we go', 'Pick two stops, not six. We always overplan.', map);
    if (answers.length !== 'day') pushIdea('Somewhere to sleep', 'Book it before she changes her mind.', `boutique hotel ${answers.direction === 'north' ? 'northern Israel' : 'Israel'}`);
  }

  if (activity === 'italy') {
    const cityIT = { rome: 'Rome', florence: 'Florence', venice: 'Venice', amalfi: 'Amalfi Coast', milan: 'Milan', all: 'Italy' }[answers.city] || 'Italy';
    const focus = { eat: 'best restaurants', wine: 'wine tasting', vespa: 'vespa tour', art: 'museums' }[answers.focus] || 'things to do';
    pushIdea(`${focus} in ${cityIT}`, 'Research phase. Highly enjoyable, mildly dangerous.', `${focus} ${cityIT}`);
    pushWeb(`Flights to ${cityIT}`, 'This is genuinely how it starts.', `flights to ${cityIT}`);
  }

  if (activity === 'movie') {
    if (answers.where === 'cinema') pushIdea('Cinemas nearby', 'Check what is actually playing.', `cinema ${city}`);
    if (answers.snacks && answers.where !== 'cinema') pushIdea('Snack run', 'Two bags minimum.', `supermarket ${city}`);
  }

  if (activity === 'cook') {
    const dish = { pasta: 'fresh pasta', sushi: 'sushi ingredients', shakshuka: 'shakshuka', steak: 'steak', dessert: 'dessert' }[answers.dish] || 'dinner';
    pushIdea('Where we shop', 'Market beats supermarket. Always.', `market ${city}`);
    pushWeb(`${cap(dish)} recipes`, 'One of us reads it. One of us ignores it.', `${dish} recipe`);
  }

  if (activity === 'shopping') {
    const map = { mall: 'shopping mall', vintage: 'vintage clothing store', market: 'market', bed: 'coffee' }[answers.where] || 'shopping';
    pushIdea('Where to go', 'Bring patience and a water bottle.', `${map} ${city}`);
  }

  return out.slice(0, 5);
}

/* ---------- the rest of the copy ---------- */

const TAUNTS = [
  'nope.',
  'the button disagrees.',
  'try again, slower.',
  'it moved. weird.',
  'you are getting worse at this.',
  'this button is not for you.',
  'seriously?',
  'okay, last chance —',
];

const NO_LABELS = ['No', 'No…', 'Hmm', 'Maybe?', 'Probably', 'Fine', 'Ok yes', 'YES'];

const DRESS = [
  { id: 'casual', emoji: '👕', label: 'Casual',  note: 'jeans and good intentions' },
  { id: 'nice',   emoji: '👗', label: 'Nice',    note: 'the one I like' },
  { id: 'fancy',  emoji: '🤵', label: 'Fancy',   note: 'full production' },
  { id: 'pjs',    emoji: '🩳', label: 'Pyjamas', note: "I'm wearing them either way" },
];

const TIMES = [
  { id: '10:00', emoji: '☕', label: '10:00', note: 'morning people' },
  { id: '13:00', emoji: '🍽️', label: '13:00', note: 'lunch' },
  { id: '16:00', emoji: '🌤️', label: '16:00', note: 'afternoon' },
  { id: '18:30', emoji: '🌅', label: '18:30', note: 'sunset. correct answer.' },
  { id: '20:00', emoji: '🌃', label: '20:00', note: 'classic' },
  { id: '22:00', emoji: '🌙', label: '22:00', note: 'late and interesting' },
];

const TERMS = [
  { text: 'I will not cancel the day before.', locked: false },
  { text: 'Phones stay in pockets for at least one hour.', locked: false },
  { text: 'Whoever picked the place cannot complain about the place.', locked: false },
  { text: 'This date is legally binding.', locked: true, note: 'cannot be unchecked' },
];

const LOADING_LINES = [
  'Checking his availability…',
  "He's free. He was always free.",
  'Reserving the evening…',
  'Notifying the chef, the weather, and fate…',
  'Confirmed.',
];
