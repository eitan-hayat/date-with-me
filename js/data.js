/* ============================================================
   Content: activities, their follow-up questions, and the
   recommendation lists. Everything here is data — the flow
   engine in app.js just walks it.
   ============================================================ */

const ACTIVITIES = [
  { id: 'food',     emoji: '🍝', label: 'Food',          note: 'the undefeated classic' },
  { id: 'drinks',   emoji: '🍸', label: 'Drinks',        note: 'one turns into three' },
  { id: 'bowling',  emoji: '🎳', label: 'Bowling',       note: 'I will lose gracefully' },
  { id: 'karting',  emoji: '🏎️', label: 'Karting',       note: 'I will not lose gracefully' },
  { id: 'escape',   emoji: '🔐', label: 'Escape room',   note: 'locked in together' },
  { id: 'moto',     emoji: '🏍️', label: 'A ride out',    note: 'two wheels and a full tank' },
  { id: 'beach',    emoji: '🏖️', label: 'The beach',     note: 'sand everywhere, worth it' },
  { id: 'picnic',   emoji: '🧺', label: 'Picnic',        note: 'a blanket and no plan' },
  { id: 'trip',     emoji: '🚗', label: 'A trip',        note: 'leave the city behind' },
  { id: 'italy',    emoji: '🇮🇹', label: 'Italy',         note: 'yes, that Italy' },
  { id: 'movie',    emoji: '🎬', label: 'Movie night',   note: 'popcorn negotiations' },
  { id: 'music',    emoji: '🎤', label: 'Live music',    note: 'too loud to argue' },
  { id: 'dancing',  emoji: '💃', label: 'Dancing',       note: 'one of us can' },
  { id: 'museum',   emoji: '🖼️', label: 'Museum',        note: 'strong opinions, quietly' },
  { id: 'games',    emoji: '🎲', label: 'Board games',   note: 'friendship-ending' },
  { id: 'spa',      emoji: '💆', label: 'Spa day',       note: 'silence, finally' },
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
        { id: 'home',   emoji: '🏠', label: 'At home',      note: 'I cook, or we order and lie' },
      ],
    },
  ],

  moto: [
    {
      id: 'where', q: 'Where are we riding?', sub: 'Pick the road. The destination is just where we turn around.',
      options: [
        { id: 'north',  emoji: '🏔️', label: 'North',            note: 'the Galilee, where the roads actually bend' },
        { id: 'carmel', emoji: '🌲', label: 'Up to the Carmel',  note: 'forest the whole way, sea at the end' },
        { id: 'jlm',    emoji: '⛰️', label: 'The Judean hills',  note: 'switchbacks all the way up' },
        { id: 'desert', emoji: '🏜️', label: 'The Dead Sea road', note: 'empty, and very long' },
        { id: 'coast',  emoji: '🌊', label: 'Up the coast',      note: 'slow, salty, no hurry' },
        { id: 'follow', emoji: '🏍️', label: 'You choose',        note: "I'll ride wherever you point" },
      ],
    },
    {
      id: 'when', q: 'When are we leaving?',
      options: [
        { id: 'sunrise', emoji: '🌄', label: 'Early, before the traffic', note: 'ambitious of you' },
        { id: 'golden',  emoji: '🌇', label: 'Afternoon, into golden hour' },
        { id: 'night',   emoji: '🌙', label: 'Night ride', note: 'cold, empty, the best one' },
      ],
    },
    {
      id: 'pace', q: 'And how am I riding?', sub: 'Be honest, I will do exactly what you pick.',
      options: [
        { id: 'slow', emoji: '🐢', label: 'Gently',  note: 'I want to look at things' },
        { id: 'real', emoji: '🏍️', label: 'Properly', note: 'lean it over' },
        { id: 'fast', emoji: '😤', label: 'Do not tell my mother' },
      ],
    },
    {
      id: 'stop', q: 'Stopping anywhere?',
      options: [
        { id: 'coffee', emoji: '☕', label: 'Coffee at a viewpoint' },
        { id: 'food',   emoji: '🍽️', label: 'A proper meal somewhere' },
        { id: 'ice',    emoji: '🍦', label: 'Ice cream. Non-negotiable.' },
        { id: 'no',     emoji: '⛽', label: 'Fuel only. We ride.' },
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

  bowling: [
    {
      id: 'stakes', q: 'What are we playing for?',
      options: [
        { id: 'dinner', emoji: '🍔', label: 'Loser buys dinner' },
        { id: 'fun',    emoji: '😌', label: 'Just for fun' },
        { id: 'bumper', emoji: '🛡️', label: 'Bumpers up, no shame' },
        { id: 'war',    emoji: '😤', label: 'You are going down' },
      ],
    },
    {
      id: 'after', q: 'And afterwards?',
      options: [
        { id: 'arcade', emoji: '🕹️', label: 'The arcade next door' },
        { id: 'drinks', emoji: '🍺', label: 'Drinks' },
        { id: 'food',   emoji: '🍕', label: 'Food, obviously' },
      ],
    },
  ],

  karting: [
    {
      id: 'mode', q: 'How seriously are we taking this?',
      options: [
        { id: 'serious', emoji: '🏁', label: 'Deadly serious' },
        { id: 'friendly', emoji: '🙂', label: 'Friendly laps' },
        { id: 'photo',   emoji: '📸', label: 'I just want the helmet photo' },
        { id: 'drive',   emoji: '🔑', label: 'Loser drives home' },
      ],
    },
    {
      id: 'after', q: 'Then what?',
      options: [
        { id: 'burgers', emoji: '🍔', label: 'Burgers' },
        { id: 'ice',     emoji: '🍦', label: 'Ice cream' },
        { id: 'again',   emoji: '🔁', label: 'A rematch' },
      ],
    },
  ],

  escape: [
    {
      id: 'theme', q: 'Which room?',
      options: [
        { id: 'horror',  emoji: '👻', label: 'Horror' },
        { id: 'heist',   emoji: '💎', label: 'Heist' },
        { id: 'mystery', emoji: '🔍', label: 'Mystery' },
        { id: 'pirate',  emoji: '🏴‍☠️', label: 'Pirates' },
      ],
    },
    {
      id: 'plan', q: 'Honest prediction?',
      options: [
        { id: 'fast',  emoji: '⏱️', label: 'Out in forty minutes' },
        { id: 'hints', emoji: '🆘', label: 'We will need every hint' },
        { id: 'panic', emoji: '😰', label: 'I panic, you solve' },
      ],
    },
  ],

  beach: [
    {
      id: 'when', q: 'When are we going?',
      options: [
        { id: 'morning', emoji: '🌤️', label: 'Morning, empty beach' },
        { id: 'sunset',  emoji: '🌅', label: 'Golden hour' },
        { id: 'late',    emoji: '🌊', label: 'Night swim' },
      ],
    },
    {
      id: 'bring', q: 'What are we bringing?',
      options: [
        { id: 'melon',   emoji: '🍉', label: 'Watermelon' },
        { id: 'speaker', emoji: '🔊', label: 'Speaker and snacks' },
        { id: 'towels',  emoji: '🏖️', label: 'Just towels' },
      ],
    },
  ],

  picnic: [
    {
      id: 'where', q: 'Where are we spreading the blanket?',
      options: [
        { id: 'park',  emoji: '🌳', label: 'A park' },
        { id: 'beach', emoji: '🏖️', label: 'The beach' },
        { id: 'roof',  emoji: '🌆', label: 'A rooftop' },
        { id: 'view',  emoji: '⛰️', label: 'Somewhere with a view' },
      ],
    },
    {
      id: 'food', q: 'What is in the basket?',
      options: [
        { id: 'cheese', emoji: '🧀', label: 'Cheese and bread' },
        { id: 'melon',  emoji: '🍉', label: 'Watermelon and nothing else' },
        { id: 'full',   emoji: '🥗', label: 'A full spread' },
        { id: 'market', emoji: '🛒', label: 'Whatever the market has' },
      ],
    },
  ],

  music: [
    {
      id: 'kind', q: 'What are we listening to?',
      options: [
        { id: 'rock',   emoji: '🎸', label: 'Rock' },
        { id: 'jazz',   emoji: '🎷', label: 'Jazz' },
        { id: 'elec',   emoji: '🎛️', label: 'Electronic' },
        { id: 'israeli', emoji: '🇮🇱', label: 'Something Israeli' },
        { id: 'any',    emoji: '🎶', label: 'Whatever is on' },
      ],
    },
    {
      id: 'where', q: 'How big?',
      options: [
        { id: 'small', emoji: '🕯️', label: 'Small venue, close up' },
        { id: 'big',   emoji: '🎆', label: 'A proper show' },
        { id: 'bar',   emoji: '🍻', label: 'A bar with a band' },
      ],
    },
  ],

  dancing: [
    {
      id: 'where', q: 'Dancing where?',
      options: [
        { id: 'salsa', emoji: '💃', label: 'Salsa night' },
        { id: 'club',  emoji: '🪩', label: 'A club' },
        { id: 'home',  emoji: '🏠', label: 'The kitchen, at home' },
        { id: 'any',   emoji: '🎵', label: 'Wherever there is music' },
      ],
    },
    {
      id: 'skill', q: 'Be honest.',
      options: [
        { id: 'can',   emoji: '🕺', label: 'I can actually dance' },
        { id: 'cant',  emoji: '🤷', label: 'I cannot, and I will anyway' },
      ],
    },
  ],

  museum: [
    {
      id: 'what', q: 'Looking at what?',
      options: [
        { id: 'art',   emoji: '🎨', label: 'Art' },
        { id: 'hist',  emoji: '🏛️', label: 'History' },
        { id: 'photo', emoji: '📷', label: 'Photography' },
        { id: 'weird', emoji: '🦴', label: 'A weird small museum' },
      ],
    },
    {
      id: 'after', q: 'Afterwards?',
      options: [
        { id: 'coffee', emoji: '☕', label: 'Coffee and strong opinions' },
        { id: 'shop',   emoji: '🛍️', label: 'The gift shop' },
        { id: 'walk',   emoji: '🚶', label: 'A long walk' },
      ],
    },
  ],

  games: [
    {
      id: 'which', q: 'Which game?',
      options: [
        { id: 'shesh', emoji: '🎲', label: 'Backgammon' },
        { id: 'catan', emoji: '🏝️', label: 'Catan' },
        { id: 'cards', emoji: '🃏', label: 'Cards' },
        { id: 'new',   emoji: '📦', label: 'Something new' },
      ],
    },
    {
      id: 'stakes', q: 'Stakes?',
      options: [
        { id: 'next',  emoji: '📅', label: 'Winner picks the next date' },
        { id: 'none',  emoji: '🕊️', label: 'No stakes, we stay friends' },
        { id: 'dish',  emoji: '🧽', label: 'Loser does the dishes' },
      ],
    },
  ],

  spa: [
    {
      id: 'what', q: 'What kind of quiet?',
      options: [
        { id: 'massage', emoji: '💆', label: 'Massage' },
        { id: 'springs', emoji: '♨️', label: 'Hot springs' },
        { id: 'sauna',   emoji: '🧖', label: 'Sauna and steam' },
        { id: 'allday',  emoji: '🕯️', label: 'The whole day' },
      ],
    },
    {
      id: 'after', q: 'And after?',
      options: [
        { id: 'nap',    emoji: '😴', label: 'A nap' },
        { id: 'dinner', emoji: '🍽️', label: 'Dinner' },
        { id: 'quiet',  emoji: '🤫', label: 'Nothing. Silence.' },
      ],
    },
  ],

  drinks: [
    {
      id: 'kind', q: 'What are we drinking?',
      options: [
        { id: 'cocktail', emoji: '🍸', label: 'Cocktails' },
        { id: 'wine',     emoji: '🍷', label: 'Wine' },
        { id: 'beer',     emoji: '🍺', label: 'Beer garden' },
        { id: 'roof',     emoji: '🌆', label: 'Rooftop, anything' },
      ],
    },
    {
      id: 'pace', q: 'What are we expecting?',
      options: [
        { id: 'one',   emoji: '🍽️', label: 'One, then dinner' },
        { id: 'few',   emoji: '🥂', label: 'A few' },
        { id: 'close', emoji: '🌙', label: 'Until they close' },
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

    if (vibe === 'home') {
      const words = {
        italian: 'italian', sushi: 'sushi', burgers: 'burger', israeli: 'hummus',
        brunch: 'brunch', steak: 'steak', vegan: 'vegan',
      }[cuisine] || '';
      pushIdea(`${words} delivery near us`.trim(), rt('homeDelivery') || 'The lazy option. The correct option.', `${words} delivery ${city}`);
      pushWeb(rt('cookTitle') || `Cook it ourselves instead`, rt('cookInstead') || 'Ambitious. I support it. Loosely.', `easy ${words} recipe`);
      return out;
    }

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
      pushIdea(`${words} ${mod}`.trim(), rt('liveResults', { city }) || `Live results around ${city}. Tap to browse.`, `${words} ${mod} ${city}`);
      pushIdea(`the highest rated ${words} in ${city}`, rt('topRated') || 'Sorted by people who eat out too much.', `best ${words} ${city}`);
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
    pushIdea('Ice cream on the way', rt('iceOnWay') || 'Mandatory checkpoint.', `ice cream ${city}`);
  }

  if (activity === 'moto') {
    const [route, why] = {
      north:  ['Route 899 and the Galilee panhandle', 'The one everybody rides north for.'],
      carmel: ['Carmel forest road, Route 721',       'Trees the whole way, then the sea.'],
      jlm:    ['Route 386 up to Jerusalem',           'Switchbacks all the way up.'],
      desert: ['Route 90 along the Dead Sea',         'Check the heat before we commit to it.'],
      coast:  ['The old coast road north',            'Slow, salty, no hurry.'],
      follow: ['Motorcycle roads near Tel Aviv',      'Anything with a bend in it.'],
    }[answers.where] || ['Motorcycle roads near Tel Aviv', 'Anything with a bend in it.'];
    // Road numbers are the same in both languages; the reason to ride them is not.
    const heRoute = LANG === 'he' ? HE_ROUTES[answers.where] : null;
    pushIdea(heRoute ? heRoute[0] : route, heRoute ? heRoute[1] : why, `${route} Israel`);
    if (answers.stop === 'coffee') pushIdea(rt('coffeeView') || 'Coffee with a view', rt('coffeeViewNote') || 'Somewhere we can park where we can see the bike.', `cafe with a view ${city}`);
    if (answers.stop === 'food')   pushIdea(rt('eatOnWay') || 'Somewhere to eat on the way', rt('eatOnWayNote') || 'Riding hungry is how arguments start.', `restaurant near route ${city}`);
    if (answers.stop === 'ice')    pushIdea(rt('iceStop') ? 'Ice cream stop' : 'Ice cream stop', rt('iceStop') || 'Earned it.', `ice cream ${city}`);
    pushWeb(rt('helmet') || 'The helmet situation', rt('helmetNote') || "Second helmet, and a jacket that fits you.", 'motorcycle helmet for passenger');
  }

  if (activity === 'pool') {
    const map = {
      hotel: 'hotel day pass pool', roof: 'rooftop pool bar',
      sea: 'best beach', sneak: 'public pool',
    }[answers.where] || 'pool';
    pushIdea(rt('whereSwim') || 'Where to swim', rt('whereSwimNote') || 'Check opening hours, they lie sometimes.', `${map} ${city}`);
    if (answers.plan === 'drink') pushIdea(rt('cocktails') || 'Cocktails nearby', rt('cocktailsNote') || 'For after, or during.', `cocktail bar ${city}`);
  }

  if (activity === 'trip') {
    const map = {
      north: 'waterfalls and hikes northern Israel',
      desert: 'Negev desert viewpoints',
      coast: 'best beaches northern coast Israel',
      jlm: 'things to do Jerusalem',
    }[answers.direction];
    pushIdea(rt('whereWeGo') || 'Where we go', rt('whereWeGoNote') || 'Pick two stops, not six. We always overplan.', map);
    if (answers.length !== 'day') pushIdea(rt('sleep') || 'Somewhere to sleep', rt('sleepNote') || 'Book it before she changes her mind.', `boutique hotel ${answers.direction === 'north' ? 'northern Israel' : 'Israel'}`);
  }

  if (activity === 'italy') {
    const cityIT = { rome: 'Rome', florence: 'Florence', venice: 'Venice', amalfi: 'Amalfi Coast', milan: 'Milan', all: 'Italy' }[answers.city] || 'Italy';
    const focus = { eat: 'best restaurants', wine: 'wine tasting', vespa: 'vespa tour', art: 'museums' }[answers.focus] || 'things to do';
    pushIdea(`${focus} in ${cityIT}`, rt('research') || 'Research phase. Highly enjoyable, mildly dangerous.', `${focus} ${cityIT}`);
    pushWeb(rt('flights', { city: cityIT }) || `Flights to ${cityIT}`, rt('flightsNote') || 'This is genuinely how it starts.', `flights to ${cityIT}`);
  }

  if (activity === 'movie') {
    if (answers.where === 'cinema') pushIdea(rt('cinemas') || 'Cinemas nearby', rt('cinemasNote') || 'Check what is actually playing.', `cinema ${city}`);
    if (answers.snacks && answers.where !== 'cinema') pushIdea(rt('snackRun') || 'Snack run', rt('snackRunNote') || 'Two bags minimum.', `supermarket ${city}`);
  }

  if (activity === 'cook') {
    const dish = { pasta: 'fresh pasta', sushi: 'sushi ingredients', shakshuka: 'shakshuka', steak: 'steak', dessert: 'dessert' }[answers.dish] || 'dinner';
    pushIdea(rt('whereWeShop') || 'Where we shop', rt('whereWeShopNote') || 'Market beats supermarket. Always.', `market ${city}`);
    pushWeb(rt('recipes', { dish: cap(dish) }) || `${cap(dish)} recipes`, rt('recipesNote') || 'One of us reads it. One of us ignores it.', `${dish} recipe`);
  }

  const SEARCHES = {
    bowling: ['bowling alley', 'Book a lane, they fill up on weekends.'],
    karting: ['go kart track', 'Check the age and licence rules before we drive out.'],
    escape:  ['escape room', 'Book ahead. The good rooms go first.'],
    spa:     ['spa day', 'Call rather than book online, they hold better slots.'],
    beach:   ['best beach', 'Parking is the hard part, not the sea.'],
    music:   ['live music venue', 'Check who is actually playing that night.'],
    dancing: ['dance bar salsa club', 'Late start. Nothing happens before 22:00.'],
    museum:  ['museum', 'Check closing time, most shut early.'],
    games:   ['board game cafe', 'They lend you the games. All of them.'],
    picnic:  ['park with grass', 'Shade matters more than the view.'],
    drinks:  ['cocktail bar', 'The good ones are small and hard to find.'],
  };
  if (SEARCHES[activity]) {
    const [term, note] = SEARCHES[activity];
    pushIdea(`${term} in ${city}`, note, `${term} ${city}`);
    if (activity === 'drinks' && answers.kind === 'wine') pushIdea(rt('wineBars', { city }) || `wine bars in ${city}`, rt('wineBarsNote') || 'Somewhere we can hear each other.', `wine bar ${city}`);
    if (activity === 'bowling' && answers.after === 'food') pushIdea(rt('foodNearby') || 'Food nearby', rt('foodNearbyNote') || 'For the loser to pay for.', `restaurants ${city}`);
    if (activity === 'picnic') pushIdea(rt('buyFood') || 'Where to buy the food', rt('buyFoodNote') || 'Market first, park second.', `market ${city}`);
    if (activity === 'beach' && answers.bring === 'melon') pushIdea(rt('watermelon') || 'Watermelon', rt('watermelonNote') || 'Non-negotiable.', `fruit market ${city}`);
  }

  if (activity === 'shopping') {
    const map = { mall: 'shopping mall', vintage: 'vintage clothing store', market: 'market', bed: 'coffee' }[answers.where] || 'shopping';
    pushIdea(rt('whereToGo') || 'Where to go', rt('whereToGoNote') || 'Bring patience and a water bottle.', `${map} ${city}`);
  }

  return out.slice(0, 5);
}

/* ---------- the rest of the copy ---------- */

/* Both lists cycle forever. The No button never gives up and neither
   does she. That's the game. */
const TAUNTS = [
  'nope.',
  'the button disagrees.',
  'try again, slower.',
  'it moved. weird.',
  'you are getting worse at this.',
  'this button is not for you.',
  'seriously?',
  'okay, last chance,',
  'no chance.',
  'it saw you coming.',
  'faster. no, faster than that.',
  'impressive persistence. still no.',
  'the button is enjoying this.',
  'you could just press the other one.',
  'we can do this all night.',
  'this is the longest anyone has tried.',
];

/* Thrown by the activities she is not allowed to choose. Same joke as the
   No button: the option is right there, it simply cannot be caught. */
const DECOY_TAUNTS = [
  'not that one.',
  'he has opinions about this.',
  'try one of the glowing ones.',
  'that one is not on offer.',
  'it moved. weird.',
  'the glowing ones are the real ones.',
  'nice try.',
  'this is a menu, not a democracy.',
  'you can look at it. that is all.',
  'the shortlist is the shortlist.',
  'still no.',
  'he already decided this part.',
];

const NO_LABELS = [
  'No', 'No…', 'Hmm', 'Maybe?', 'Probably', 'Nearly', 'Fine', 'Ok yes',
  'Catch me', 'Nope', 'Try again', 'Almost', 'So close', 'Nah', 'Never',
];

/* ---------- the ride ----------
   What is parked outside. He edits these in setup and adds a photo
   of each one, so she is choosing between his actual vehicles rather
   than a generic list. `img` is either a data URI he cropped in setup
   or a plain image URL he pasted; empty means the card falls back to
   a gradient tile with the emoji on it. */
const DEFAULT_RIDES = [
  { id: 'r1', emoji: '🏍️', label: 'Red Ducati Monster 2026', note: 'loud, red, hard to argue with', img: '' },
  { id: 'r2', emoji: '🏍️', label: 'Ducati Streetfighter V4 S', note: 'stealth black. hold on properly.', img: '' },
  { id: 'r3', emoji: '🚗', label: 'Ford Mustang EcoBoost',    note: 'roof, doors, and a working stereo', img: '' },
];

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

/* Coordinates for the sunset maths. Anywhere not on this list falls back
   to the plain time list — better no number than a wrong one. */
const CITY_COORDS = {
  'tel aviv': [32.0853, 34.7818],
  'jaffa': [32.0533, 34.7509],
  'herzliya': [32.1663, 34.8433],
  'ramat gan': [32.0684, 34.8248],
  'jerusalem': [31.7683, 35.2137],
  'haifa': [32.7940, 34.9896],
  'beer sheva': [31.2518, 34.7913],
  'eilat': [29.5577, 34.9519],
  'netanya': [32.3215, 34.8532],
  'rishon lezion': [31.9730, 34.8066],
};

function coordsFor(city) {
  const key = String(city || '').toLowerCase().replace(/[^a-z ]/g, '').trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  const hit = Object.keys(CITY_COORDS).find((c) => key.includes(c) || c.includes(key));
  return hit ? CITY_COORDS[hit] : null;
}

/* Sunset for a given day and place, via the standard solar equations.
   Returns a Date, or null above the polar circles where the sun is
   too stubborn to set. */
function sunsetFor(date, lat, lon) {
  const rad = Math.PI / 180;
  const DAY = 86400000;
  const n = Math.round((date.getTime() - Date.UTC(2000, 0, 1, 12)) / DAY);
  const jStar = n - lon / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad)
          + 0.0003 * Math.sin(3 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(M * rad)
                 - 0.0069 * Math.sin(2 * lambda * rad);
  const delta = Math.asin(Math.sin(lambda * rad) * Math.sin(23.44 * rad));
  const cosOmega = (Math.sin(-0.83 * rad) - Math.sin(lat * rad) * Math.sin(delta))
                 / (Math.cos(lat * rad) * Math.cos(delta));
  if (cosOmega < -1 || cosOmega > 1) return null;
  const omega = Math.acos(cosOmega) / rad;
  const jSet = jTransit + omega / 360;
  return new Date((jSet - 2440587.5) * DAY);
}

const LOADING_LINES = [
  'Checking his availability…',
  "He's free. He was always free.",
  'Reserving the evening…',
  'Notifying the chef, the weather, and fate…',
  'Confirmed.',
];
