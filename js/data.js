// Game configuration: worlds, difficulties and avatar shop items.
window.BB = window.BB || {};

BB.GAME_NAME = 'Bullseye Blitz';

// `extra` is added to every world's goal. Easy uses the base goals.
BB.DIFFICULTIES = {
  easy:       { label: 'Easy',       extra: 0,   speed: 1,    life: 1,    move: 0,    trick: 0,    blurb: 'Warm-up pace' },
  medium:     { label: 'Medium',     extra: 0,   speed: 1.15, life: 0.9,  move: 0.05, trick: 0.03, blurb: 'Quicker targets' },
  hard:       { label: 'Hard',       extra: 0,   speed: 1.3,  life: 0.8,  move: 0.1,  trick: 0.06, blurb: 'Fast, more decoys' },
  impossible: { label: 'Impossible', extra: 0,   speed: 1.55, life: 0.68, move: 0.15, trick: 0.1,  blurb: 'Relentless' },
};
BB.DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'impossible'];

// Score resets at the start of every world; reach `goal` to clear it.
// `bonus` is what a rare coin bullseye is worth (in points and coins).
BB.WORLDS = [
  { name: 'The Hot Sahara',        goal: 1,    reward: 100,  bonus: 2,   spawn: 900, max: 4, life: [2600, 3600], move: 0.25, speed: [50, 100],  size: [80, 130], trick: 0.15, patterns: ['bounce'] },
  { name: 'Underwater Adventures', goal: 1,    reward: 100,  bonus: 5,   spawn: 800, max: 5, life: [2300, 3200], move: 0.4,  speed: [70, 130],  size: [70, 120], trick: 0.2,  patterns: ['bounce', 'wave'] },
  { name: 'Computer Crazies',      goal: 1,    reward: 100,  bonus: 10,  spawn: 700, max: 6, life: [2000, 2900], move: 0.55, speed: [90, 160],  size: [60, 115], trick: 0.25, patterns: ['bounce', 'wave', 'orbit'] },
  { name: 'Astronomy Adventure',   goal: 1,    reward: 100,  bonus: 15,  spawn: 620, max: 7, life: [1800, 2600], move: 0.65, speed: [110, 190], size: [52, 105], trick: 0.3,  patterns: ['bounce', 'wave', 'orbit'] },
  { name: 'Football Fans',         goal: 1,    reward: 1000, bonus: 100, spawn: 540, max: 8, life: [1600, 2300], move: 0.8,  speed: [130, 240], size: [44, 100], trick: 0.35, patterns: ['bounce', 'wave', 'orbit'] },
];

// Chance that a (non-decoy) target spawns as a coin bullseye.
BB.COIN_CHANCE = 0.033;

BB.goalFor = (world, diff) => BB.WORLDS[world].goal + BB.DIFFICULTIES[diff].extra;

// Clearing the final world on Impossible pays a jackpot instead of the normal reward.
BB.IMPOSSIBLE_JACKPOT = 1000000;
BB.rewardFor = (world, diff) =>
  (diff === 'impossible' && world === BB.WORLDS.length - 1 ? BB.IMPOSSIBLE_JACKPOT : BB.WORLDS[world].reward);

// Avatar shop. price 0 = free for everyone.
BB.CATEGORIES = [
  { key: 'gun',       label: 'Guns',        view: 'gear' },
  { key: 'paint',     label: 'Paintballs',  view: 'gear' },
  { key: 'hair',      label: 'Hair',        view: 'head' },
  { key: 'hairColor', label: 'Hair Colour', view: 'head' },
  // outfit, football and custom are all "what you're wearing", so picking one takes off the others.
  { key: 'outfit',    label: 'Outfits',     view: 'body', clears: ['football', 'custom'] },
  { key: 'football',  label: 'Football',    view: 'body', clears: ['custom'] },
  { key: 'custom',    label: 'Customise',   view: 'body', clears: ['football'] },
  { key: 'hat',       label: 'Hats',        view: 'head' },
  { key: 'accessory', label: 'Extras',      view: 'head', multi: true }, // several can be worn at once
  { key: 'face',      label: 'Expression',  view: 'head' },
  { key: 'skin',      label: 'Skin',        view: 'head' },
];

BB.ITEMS = {
  hair: [
    { id: 'short',    name: 'Short',      price: 0 },
    { id: 'long',     name: 'Long',       price: 0 },
    { id: 'bald',     name: 'Shaved',     price: 0 },
    { id: 'curly',    name: 'Curly',      price: 0 },
    { id: 'ponytail', name: 'Ponytail',   price: 75 },
    { id: 'spiky',    name: 'Textured',   price: 100 },
    { id: 'buns',     name: 'Top Knot',   price: 120 },
    { id: 'afro',     name: 'Afro',       price: 150 },
    { id: 'mohawk',   name: 'Mohawk',     price: 200 },
  ],
  hairColor: [
    { id: 'black',  name: 'Black',    price: 0,   color: '#1b1b1b' },
    { id: 'brown',  name: 'Brown',    price: 0,   color: '#5a3a24' },
    { id: 'blonde', name: 'Blonde',   price: 0, color: '#c9a660' },
    { id: 'red',    name: 'Auburn',   price: 40,  color: '#8f4424' },
    { id: 'silver', name: 'Silver',   price: 60,  color: '#b9bcc2' },
    { id: 'blue',   name: 'Navy',     price: 80,  color: '#2f4f7a' },
    { id: 'pink',   name: 'Rose',     price: 80,  color: '#a95e7c' },
    { id: 'green',  name: 'Forest',   price: 80,  color: '#3f6b50' },
    { id: 'purple', name: 'Plum',     price: 100, color: '#5b4077' },
  ],
  outfit: [
    { id: 'tee',      name: 'Blitz Tee',      price: 0 },
    { id: 'dress',    name: 'Dress',          price: 0 },
    { id: 'striped',  name: 'Breton Top',     price: 40 },
    { id: 'hoodie',   name: 'Hoodie',         price: 60 },
    { id: 'overalls', name: 'Utility Jacket', price: 80 },
    { id: 'jersey',   name: 'Sports Jersey',  price: 120 },
    { id: 'suit',     name: 'Suit',           price: 300 },
    { id: 'gown',     name: 'Evening Dress',  price: 400 },
    { id: 'hero',     name: 'Leather Jacket', price: 500 },
    { id: 'space',    name: 'Flight Suit',    price: 750 },
  ],
  hat: [
    { id: 'none',     name: 'No Hat',       price: 0 },
    // Items with `variantOf` are colour choices shown when that item is tapped.
    { id: 'headband',        name: 'Headband', price: 0, color: '#2b2f36', colorName: 'Black' },
    { id: 'headband-red',    name: 'Red',      price: 0, color: '#b8353d', variantOf: 'headband' },
    { id: 'headband-blue',   name: 'Blue',     price: 0, color: '#2f5f9e', variantOf: 'headband' },
    { id: 'headband-green',  name: 'Green',    price: 0, color: '#3a7d4f', variantOf: 'headband' },
    { id: 'headband-yellow', name: 'Yellow',   price: 0, color: '#d9a62e', variantOf: 'headband' },
    { id: 'headband-pink',   name: 'Pink',     price: 0, color: '#c9658f', variantOf: 'headband' },
    { id: 'headband-white',  name: 'White',    price: 0, color: '#ececec', variantOf: 'headband' },
    { id: 'party',    name: 'Trilby',       price: 40 },
    { id: 'cap',      name: 'Cap',          price: 50 },
    { id: 'beanie',   name: 'Beanie',       price: 60 },
    { id: 'cowboy',   name: 'Cowboy Hat',   price: 150 },
    { id: 'wizard',   name: 'Fedora',       price: 400 },
    { id: 'crown',    name: 'Crown',        price: 1000 },
  ],
  accessory: [
    { id: 'none',       name: 'Nothing',    price: 0 },
    // Items sharing a `slot` replace each other; different slots stack.
    { id: 'glasses',    name: 'Glasses',    price: 40,  slot: 'eyes', color: '#1f2227', colorName: 'Black' },
    { id: 'glasses-red',   name: 'Red',   price: 1, slot: 'eyes', color: '#b8353d', variantOf: 'glasses' },
    { id: 'glasses-blue',  name: 'Blue',  price: 1, slot: 'eyes', color: '#2f5f9e', variantOf: 'glasses' },
    { id: 'glasses-green', name: 'Green', price: 1, slot: 'eyes', color: '#3a7d4f', variantOf: 'glasses' },
    { id: 'glasses-gold',  name: 'Gold',  price: 1, slot: 'eyes', color: '#c9a236', variantOf: 'glasses' },
    { id: 'glasses-pink',  name: 'Pink',  price: 1, slot: 'eyes', color: '#c9658f', variantOf: 'glasses' },
    { id: 'glasses-white', name: 'White', price: 1, slot: 'eyes', color: '#ececec', variantOf: 'glasses' },
    { id: 'mustache',   name: 'Moustache',  price: 40,  slot: 'mouth' },
    { id: 'eyepatch',   name: 'Eye Patch',  price: 60,  slot: 'eyes' },
    { id: 'sunglasses', name: 'Shades',     price: 80,  slot: 'eyes' },
    { id: 'headphones', name: 'Headphones', price: 120, slot: 'ears' },
  ],
  face: [
    { id: 'smile',     name: 'Calm',      price: 0 },
    { id: 'grin',      name: 'Grin',      price: 20 },
    { id: 'surprised', name: 'Surprised', price: 40 },
    { id: 'wink',      name: 'Wink',      price: 50 },
    { id: 'cool',      name: 'Cool',      price: 60 },
    { id: 'tongue',    name: 'Smirk',     price: 70 },
    { id: 'angry',     name: 'Stern',     price: 90 },
  ],
  skin: [
    { id: 'skin1', name: 'Tone 1', price: 0, color: '#f3d5b5' },
    { id: 'skin2', name: 'Tone 2', price: 0, color: '#e2b98f' },
    { id: 'skin3', name: 'Tone 3', price: 0, color: '#cf9f6e' },
    { id: 'skin4', name: 'Tone 4', price: 0, color: '#b07a4a' },
    { id: 'skin5', name: 'Tone 5', price: 0, color: '#825432' },
    { id: 'skin6', name: 'Tone 6', price: 0, color: '#573822' },
  ],
};

// Paintball sniper rifles. zoom = scope magnification, rate = shots per second,
// speed = paintball speed (metres per second), barrel = barrel length for the 3D model.
// Bronze, Silver and Gold cost 10,000; every other gun and paint colour costs 5.
BB.ITEMS.gun = [
  { id: 'marker',  name: 'Starter Marker', price: 0,     body: '#3a3f47', trim: '#1f2227', zoom: 3,   rate: 2.5, speed: 90,  barrel: 0.5 },
  { id: 'scout',   name: 'Scout',          price: 5,     body: '#2f5f9e', trim: '#1a3558', zoom: 3,   rate: 4,   speed: 100, barrel: 0.45 },
  { id: 'viper',   name: 'Viper',          price: 5,     body: '#3a7d4f', trim: '#1f4a2c', zoom: 4,   rate: 3,   speed: 110, barrel: 0.6 },
  { id: 'blaze',   name: 'Blaze',          price: 5,     body: '#c8402f', trim: '#2b2f36', zoom: 3.5, rate: 3.5, speed: 105, barrel: 0.55 },
  { id: 'phantom', name: 'Phantom',        price: 5,     body: '#5b4077', trim: '#1c1f24', zoom: 4.5, rate: 3,   speed: 115, barrel: 0.65 },
  { id: 'arctic',  name: 'Arctic',         price: 5,     body: '#e8ecf0', trim: '#7f909f', zoom: 5,   rate: 2.5, speed: 120, barrel: 0.7 },
  { id: 'bronze',  name: 'Bronze Sniper',  price: 10000, body: '#b0703a', trim: '#5e3a1c', zoom: 6,   rate: 4,   speed: 150, barrel: 0.75, metal: true },
  { id: 'silver',  name: 'Silver Sniper',  price: 10000, body: '#c0c4ca', trim: '#5b6068', zoom: 7,   rate: 4.5, speed: 170, barrel: 0.8,  metal: true },
  { id: 'gold',    name: 'Gold Sniper',    price: 10000, body: '#d9a62e', trim: '#7a5a14', zoom: 8,   rate: 5,   speed: 190, barrel: 0.85, metal: true },
];
BB.ITEMS.paint = [
  { id: 'red',    name: 'Red',    price: 0,     color: '#e5343d' },
  { id: 'blue',   name: 'Blue',   price: 5,     color: '#2f6fe0' },
  { id: 'green',  name: 'Green',  price: 5,     color: '#2fbf4f' },
  { id: 'yellow', name: 'Yellow', price: 5,     color: '#f5d020' },
  { id: 'orange', name: 'Orange', price: 5,     color: '#f58a1f' },
  { id: 'pink',   name: 'Pink',   price: 5,     color: '#f062b0' },
  { id: 'purple', name: 'Purple', price: 5,     color: '#8a3fe0' },
  { id: 'cyan',   name: 'Cyan',   price: 5,     color: '#1fd0e0' },
  { id: 'white',  name: 'White',  price: 5,     color: '#f4f4f4' },
  { id: 'black',  name: 'Black',  price: 5,     color: '#26282c' },
  { id: 'bronze', name: 'Bronze', price: 10000, color: '#cd7f32', metal: true },
  { id: 'silver', name: 'Silver', price: 10000, color: '#c9ced6', metal: true },
  { id: 'gold',   name: 'Gold',   price: 10000, color: '#ffc61a', metal: true },
];

// Football kits. pattern: plain | stripes | hoops | sash | halves | check | band (vertical) | hband (horizontal).
// alt = pattern colour, sleeve = sleeve colour if different, text = number/name colour.
const kit = (name, group, shirt, shorts, socks, text, more) =>
  Object.assign({ name, group, shirt, shorts, socks, text, pattern: 'plain' }, more);
BB.TEAMS = {
  arsenal:    kit('Arsenal',          'Clubs', '#db0007', '#ffffff', '#ffffff', '#ffffff', { sleeve: '#ffffff' }),
  astonvilla: kit('Aston Villa',      'Clubs', '#770038', '#ffffff', '#95bfe5', '#ffffff', { sleeve: '#95bfe5' }),
  chelsea:    kit('Chelsea',          'Clubs', '#034694', '#034694', '#ffffff', '#ffffff'),
  everton:    kit('Everton',          'Clubs', '#003399', '#ffffff', '#ffffff', '#ffffff'),
  liverpool:  kit('Liverpool',        'Clubs', '#c8102e', '#c8102e', '#c8102e', '#ffffff'),
  mancity:    kit('Manchester City',  'Clubs', '#6cabdd', '#ffffff', '#6cabdd', '#1c2c5b'),
  manutd:     kit('Manchester United','Clubs', '#da291c', '#ffffff', '#1a1a1a', '#ffffff'),
  newcastle:  kit('Newcastle',        'Clubs', '#ffffff', '#1a1a1a', '#1a1a1a', '#1a1a1a', { pattern: 'stripes', alt: '#1a1a1a', text: '#d9a62e' }),
  tottenham:  kit('Tottenham',        'Clubs', '#ffffff', '#132257', '#ffffff', '#132257'),
  westham:    kit('West Ham',         'Clubs', '#7a263a', '#ffffff', '#ffffff', '#f3d459', { sleeve: '#1bb1e7' }),
  celtic:     kit('Celtic',           'Clubs', '#ffffff', '#ffffff', '#ffffff', '#1a1a1a', { pattern: 'hoops', alt: '#018749' }),
  rangers:    kit('Rangers',          'Clubs', '#1b458f', '#ffffff', '#1a1a1a', '#ffffff'),
  barcelona:  kit('Barcelona',        'Clubs', '#a50044', '#004d98', '#004d98', '#edbb00', { pattern: 'stripes', alt: '#004d98' }),
  realmadrid: kit('Real Madrid',      'Clubs', '#ffffff', '#ffffff', '#ffffff', '#1f2a5c', { trim: '#c9a236' }),
  atletico:   kit('Atlético Madrid',  'Clubs', '#ffffff', '#1f2a5c', '#cb3524', '#1f2a5c', { pattern: 'stripes', alt: '#cb3524' }),
  acmilan:    kit('AC Milan',         'Clubs', '#fb090b', '#ffffff', '#1a1a1a', '#ffffff', { pattern: 'stripes', alt: '#1a1a1a' }),
  intermilan: kit('Inter Milan',      'Clubs', '#0068a8', '#1a1a1a', '#1a1a1a', '#ffffff', { pattern: 'stripes', alt: '#1a1a1a' }),
  juventus:   kit('Juventus',         'Clubs', '#ffffff', '#ffffff', '#ffffff', '#d9a62e', { pattern: 'stripes', alt: '#1a1a1a' }),
  roma:       kit('Roma',             'Clubs', '#8e1f2f', '#ffffff', '#1a1a1a', '#f0bc42'),
  napoli:     kit('Napoli',           'Clubs', '#12a0d7', '#ffffff', '#12a0d7', '#ffffff'),
  bayern:     kit('Bayern Munich',    'Clubs', '#dc052d', '#dc052d', '#dc052d', '#ffffff'),
  dortmund:   kit('Dortmund',         'Clubs', '#fde100', '#1a1a1a', '#fde100', '#1a1a1a'),
  psg:        kit('Paris Saint-Germain','Clubs', '#004170', '#004170', '#004170', '#ffffff', { pattern: 'band', alt: '#da291c' }),
  ajax:       kit('Ajax',             'Clubs', '#ffffff', '#ffffff', '#ffffff', '#1a1a1a', { pattern: 'band', alt: '#d2122e' }),
  benfica:    kit('Benfica',          'Clubs', '#e20e0e', '#ffffff', '#e20e0e', '#ffffff'),
  porto:      kit('Porto',            'Clubs', '#ffffff', '#1f4e9c', '#1f4e9c', '#1a1a1a', { pattern: 'stripes', alt: '#1f4e9c' }),
  galatasaray:kit('Galatasaray',      'Clubs', '#a90432', '#ffffff', '#a90432', '#ffffff', { pattern: 'halves', alt: '#fdb912' }),
  santos:     kit('Santos',           'Clubs', '#ffffff', '#ffffff', '#ffffff', '#1a1a1a'),
  boca:       kit('Boca Juniors',     'Clubs', '#103f79', '#103f79', '#103f79', '#f3b229', { pattern: 'hband', alt: '#f3b229' }),
  riverplate: kit('River Plate',      'Clubs', '#ffffff', '#1a1a1a', '#ffffff', '#1a1a1a', { pattern: 'sash', alt: '#eb192e' }),
  intermiami: kit('Inter Miami',      'Clubs', '#f7b5cd', '#f7b5cd', '#f7b5cd', '#1a1a1a'),
  alnassr:    kit('Al Nassr',         'Clubs', '#fcd116', '#0b3a82', '#fcd116', '#0b3a82', { trim: '#0b3a82' }),
  alhilal:    kit('Al Hilal',         'Clubs', '#0f4ba1', '#ffffff', '#0f4ba1', '#ffffff'),

  algeria:    kit('Algeria',          'Countries', '#ffffff', '#ffffff', '#ffffff', '#006233', { trim: '#006233' }),
  argentina:  kit('Argentina',        'Countries', '#ffffff', '#1a1a1a', '#ffffff', '#1a1a1a', { pattern: 'stripes', alt: '#75aadb' }),
  belgium:    kit('Belgium',          'Countries', '#e30613', '#e30613', '#e30613', '#fdda24'),
  brazil:     kit('Brazil',           'Countries', '#fedf00', '#002776', '#ffffff', '#009b3a', { trim: '#009b3a' }),
  cameroon:   kit('Cameroon',         'Countries', '#007a5e', '#ce1126', '#fcd116', '#fcd116'),
  croatia:    kit('Croatia',          'Countries', '#ffffff', '#1f4e9c', '#1f4e9c', '#1f4e9c', { pattern: 'check', alt: '#e0162b' }),
  egypt:      kit('Egypt',            'Countries', '#ce1126', '#ffffff', '#1a1a1a', '#ffffff'),
  england:    kit('England',          'Countries', '#ffffff', '#1f2a5c', '#ffffff', '#1f2a5c'),
  france:     kit('France',           'Countries', '#21304d', '#ffffff', '#e1000f', '#ffffff'),
  germany:    kit('Germany',          'Countries', '#ffffff', '#1a1a1a', '#ffffff', '#1a1a1a'),
  hungary:    kit('Hungary',          'Countries', '#ce2939', '#ffffff', '#477050', '#ffffff'),
  italy:      kit('Italy',            'Countries', '#0066b2', '#ffffff', '#0066b2', '#ffffff'),
  japan:      kit('Japan',            'Countries', '#1d2088', '#1d2088', '#1d2088', '#ffffff'),
  mexico:     kit('Mexico',           'Countries', '#006847', '#ffffff', '#ce1126', '#ffffff'),
  morocco:    kit('Morocco',          'Countries', '#c1272d', '#006233', '#c1272d', '#ffffff'),
  netherlands:kit('Netherlands',      'Countries', '#f36c21', '#f36c21', '#f36c21', '#1a1a1a'),
  nigeria:    kit('Nigeria',          'Countries', '#008751', '#008751', '#008751', '#ffffff'),
  norway:     kit('Norway',           'Countries', '#ba0c2f', '#ffffff', '#00205b', '#ffffff'),
  poland:     kit('Poland',           'Countries', '#ffffff', '#dc143c', '#ffffff', '#dc143c'),
  portugal:   kit('Portugal',         'Countries', '#9b1b30', '#006600', '#9b1b30', '#e6c34a'),
  qatar:      kit('Qatar',            'Countries', '#8a1538', '#8a1538', '#8a1538', '#ffffff'),
  saudi:      kit('Saudi Arabia',     'Countries', '#ffffff', '#ffffff', '#ffffff', '#006c35', { trim: '#006c35' }),
  scotland:   kit('Scotland',         'Countries', '#1f2a5c', '#ffffff', '#1f2a5c', '#ffffff'),
  senegal:    kit('Senegal',          'Countries', '#ffffff', '#ffffff', '#ffffff', '#00853f', { trim: '#00853f' }),
  southkorea: kit('South Korea',      'Countries', '#c60c30', '#1a1a1a', '#c60c30', '#ffffff'),
  spain:      kit('Spain',            'Countries', '#c60b1e', '#1f2a5c', '#c60b1e', '#ffc400'),
  sweden:     kit('Sweden',           'Countries', '#fecc00', '#006aa7', '#fecc00', '#006aa7'),
  tunisia:    kit('Tunisia',          'Countries', '#e70013', '#ffffff', '#e70013', '#ffffff'),
  uruguay:    kit('Uruguay',          'Countries', '#5cbfeb', '#1a1a1a', '#1a1a1a', '#1a1a1a'),
  usa:        kit('USA',              'Countries', '#ffffff', '#1f2a5c', '#ffffff', '#1f2a5c'),
  wales:      kit('Wales',            'Countries', '#c8102e', '#c8102e', '#c8102e', '#ffffff'),
};

// Footballers: [name, team, number, shirt name, group]. Every one costs 1000 coins.
BB.ITEMS.football = [{ id: 'none', name: 'No Kit', price: 0 }].concat([
  ['Lionel Messi',        'argentina',   10, 'MESSI',       'Stars'],
  ['Cristiano Ronaldo',   'portugal',     7, 'RONALDO',     'Stars'],
  ['Kylian Mbappé',       'france',      10, 'MBAPPÉ',      'Stars'],
  ['Erling Haaland',      'mancity',      9, 'HAALAND',     'Stars'],
  ['Mohamed Salah',       'liverpool',   11, 'SALAH',       'Stars'],
  ['Neymar',              'brazil',      10, 'NEYMAR JR',   'Stars'],
  ['Jude Bellingham',     'realmadrid',   5, 'BELLINGHAM',  'Stars'],
  ['Vinícius Jr',         'realmadrid',   7, 'VINI JR',     'Stars'],
  ['Lamine Yamal',        'barcelona',   10, 'LAMINE YAMAL','Stars'],
  ['Pedri',               'barcelona',    8, 'PEDRI',       'Stars'],
  ['Harry Kane',          'england',      9, 'KANE',        'Stars'],
  ['Bukayo Saka',         'arsenal',      7, 'SAKA',        'Stars'],
  ['Cole Palmer',         'chelsea',     10, 'PALMER',      'Stars'],
  ['Phil Foden',          'mancity',     47, 'FODEN',       'Stars'],
  ['Rodri',               'mancity',     16, 'RODRI',       'Stars'],
  ['Kevin De Bruyne',     'mancity',     17, 'DE BRUYNE',   'Stars'],
  ['Bruno Fernandes',     'manutd',       8, 'B.FERNANDES', 'Stars'],
  ['Marcus Rashford',     'manutd',      10, 'RASHFORD',    'Stars'],
  ['JJ Gabriel',          'manutd',      10, 'GABRIEL',     'Stars'],
  ['Virgil van Dijk',     'liverpool',    4, 'VAN DIJK',    'Stars'],
  ['Son Heung-min',       'tottenham',    7, 'SON',         'Stars'],
  ['Robert Lewandowski',  'bayern',       9, 'LEWANDOWSKI', 'Stars'],
  ['Luka Modrić',         'croatia',     10, 'MODRIĆ',      'Stars'],
  ['Achraf Hakimi',       'morocco',      2, 'HAKIMI',      'Stars'],
  ['Sadio Mané',          'senegal',     10, 'MANÉ',        'Stars'],
  ['Pelé',                'brazil',      10, 'PELÉ',        'Legends'],
  ['Diego Maradona',      'argentina',   10, 'MARADONA',    'Legends'],
  ['Johan Cruyff',        'netherlands', 14, 'CRUYFF',      'Legends'],
  ['Zinedine Zidane',     'france',      10, 'ZIDANE',      'Legends'],
  ['Ronaldo Nazário',     'brazil',       9, 'RONALDO',     'Legends'],
  ['Ronaldinho',          'barcelona',   10, 'RONALDINHO',  'Legends'],
  ['Garrincha',           'brazil',       7, 'GARRINCHA',   'Legends'],
  ['Romário',             'brazil',      11, 'ROMÁRIO',     'Legends'],
  ['Roberto Carlos',      'brazil',       6, 'R.CARLOS',    'Legends'],
  ['Kaká',                'acmilan',     22, 'KAKÁ',        'Legends'],
  ['Franz Beckenbauer',   'germany',      5, 'BECKENBAUER', 'Legends'],
  ['Gerd Müller',         'germany',     13, 'MÜLLER',      'Legends'],
  ['Lothar Matthäus',     'germany',     10, 'MATTHÄUS',    'Legends'],
  ['Toni Kroos',          'germany',      8, 'KROOS',       'Legends'],
  ['Alfredo Di Stéfano',  'realmadrid',   9, 'DI STÉFANO',  'Legends'],
  ['Ferenc Puskás',       'hungary',     10, 'PUSKÁS',      'Legends'],
  ['Eusébio',             'benfica',     10, 'EUSÉBIO',     'Legends'],
  ['Luís Figo',           'realmadrid',  10, 'FIGO',        'Legends'],
  ['Raúl',                'realmadrid',   7, 'RAÚL',        'Legends'],
  ['Sergio Ramos',        'realmadrid',   4, 'SERGIO RAMOS','Legends'],
  ['Karim Benzema',       'realmadrid',   9, 'BENZEMA',     'Legends'],
  ['Xavi',                'barcelona',    6, 'XAVI',        'Legends'],
  ['Andrés Iniesta',      'spain',        6, 'INIESTA',     'Legends'],
  ['Paolo Maldini',       'acmilan',      3, 'MALDINI',     'Legends'],
  ['Marco van Basten',    'acmilan',      9, 'VAN BASTEN',  'Legends'],
  ['George Weah',         'acmilan',      9, 'WEAH',        'Legends'],
  ['Ruud Gullit',         'netherlands', 10, 'GULLIT',      'Legends'],
  ['Roberto Baggio',      'italy',       10, 'BAGGIO',      'Legends'],
  ['Andrea Pirlo',        'italy',       21, 'PIRLO',       'Legends'],
  ['Francesco Totti',     'roma',        10, 'TOTTI',       'Legends'],
  ['Alessandro Del Piero','juventus',    10, 'DEL PIERO',   'Legends'],
  ['Gianluigi Buffon',    'juventus',     1, 'BUFFON',      'Legends'],
  ['Paul Pogba',          'juventus',    10, 'POGBA',       'Legends'],
  ['Michel Platini',      'france',      10, 'PLATINI',     'Legends'],
  ['Thierry Henry',       'arsenal',     14, 'HENRY',       'Legends'],
  ['Dennis Bergkamp',     'arsenal',     10, 'BERGKAMP',    'Legends'],
  ['Patrick Vieira',      'arsenal',      4, 'VIEIRA',      'Legends'],
  ['Antoine Griezmann',   'france',       7, 'GRIEZMANN',   'Legends'],
  ['David Beckham',       'manutd',       7, 'BECKHAM',     'Legends'],
  ['George Best',         'manutd',       7, 'BEST',        'Legends'],
  ['Eric Cantona',        'manutd',       7, 'CANTONA',     'Legends'],
  ['Wayne Rooney',        'manutd',      10, 'ROONEY',      'Legends'],
  ['Bobby Charlton',      'england',      9, 'CHARLTON',    'Legends'],
  ['Gary Lineker',        'england',     10, 'LINEKER',     'Legends'],
  ['Michael Owen',        'england',     10, 'OWEN',        'Legends'],
  ['Alan Shearer',        'newcastle',    9, 'SHEARER',     'Legends'],
  ['Steven Gerrard',      'liverpool',    8, 'GERRARD',     'Legends'],
  ['Kenny Dalglish',      'liverpool',    7, 'DALGLISH',    'Legends'],
  ['Fernando Torres',     'liverpool',    9, 'TORRES',      'Legends'],
  ['Frank Lampard',       'chelsea',      8, 'LAMPARD',     'Legends'],
  ['Didier Drogba',       'chelsea',     11, 'DROGBA',      'Legends'],
  ['Sergio Agüero',       'mancity',     10, 'AGÜERO',      'Legends'],
  ['Yaya Touré',          'mancity',     42, 'Y.TOURÉ',     'Legends'],
  ['Zlatan Ibrahimović',  'sweden',      10, 'IBRAHIMOVIĆ', 'Legends'],
  ['Luis Suárez',         'uruguay',      9, 'SUÁREZ',      'Legends'],
  ['Gareth Bale',         'wales',       11, 'BALE',        'Legends'],
  ["Samuel Eto'o",        'cameroon',     9, "ETO'O",       'Legends'],
  ['Jay-Jay Okocha',      'nigeria',     10, 'OKOCHA',      'Legends'],
  ['Riyad Mahrez',        'algeria',      7, 'MAHREZ',      'Legends'],
].map(([name, team, number, shirtName, group]) => ({
  id: name.normalize('NFD').replace(/[^A-Za-z]+/g, '-').replace(/-$/, '').toLowerCase(),
  name, price: 1000, team, number, shirtName, group,
})));

// Customise: every team's shirt, free, with your own name and number on it.
BB.ITEMS.custom = [{ id: 'none', name: 'No Kit', price: 0 }].concat(
  Object.keys(BB.TEAMS).map(id => ({ id, name: BB.TEAMS[id].name, price: 0, team: id, group: BB.TEAMS[id].group })));

// The football kit being worn, as { team, number, shirtName }, or null.
BB.activeKit = function (a) {
  const star = a.football && a.football !== 'none' && BB.findItem('football', a.football);
  if (star) return star;
  if (a.custom && a.custom !== 'none' && BB.TEAMS[a.custom]) {
    return { team: a.custom, number: a.kitNumber || 10, shirtName: a.kitName || '' };
  }
  return null;
};

BB.findItem = (cat, id) => (BB.ITEMS[cat] || []).find(i => i.id === id);

// The item plus its colour variants, e.g. every headband colour.
BB.variantsOf = (cat, id) => BB.ITEMS[cat].filter(i => i.id === id || i.variantOf === id);

BB.isMulti = cat => !!(BB.CATEGORIES.find(c => c.key === cat) || {}).multi;

// Ids worn in a category as an array ('none' = nothing). Also accepts old single-id saves.
BB.wornIn = (a, cat) => [].concat(a[cat] || []).filter(id => id !== 'none');

BB.isWearing = (a, cat, id) => BB.isMulti(cat)
  ? (id === 'none' ? BB.wornIn(a, cat).length === 0 : BB.wornIn(a, cat).includes(id))
  : (cat === 'outfit' ? a.outfit === id && !BB.activeKit(a) : (a[cat] || 'none') === id);

// Copy of avatar `a` wearing item `id`. In multi categories it's added alongside
// the others, replacing anything in the same slot.
BB.withItem = function (a, cat, id) {
  if (!BB.isMulti(cat)) {
    const out = Object.assign({}, a, { [cat]: id });
    if (id !== 'none') ((BB.CATEGORIES.find(c => c.key === cat) || {}).clears || []).forEach(k => { out[k] = 'none'; });
    return out;
  }
  if (id === 'none') return Object.assign({}, a, { [cat]: [] });
  const slot = BB.findItem(cat, id).slot;
  const kept = BB.wornIn(a, cat).filter(w => w !== id && (!slot || (BB.findItem(cat, w) || {}).slot !== slot));
  return Object.assign({}, a, { [cat]: BB.ITEMS[cat].map(i => i.id).filter(i => i === id || kept.includes(i)) });
};

// Like withItem, but clicking a worn multi-category item takes it off.
BB.toggleItem = (a, cat, id) => BB.isMulti(cat) && id !== 'none' && BB.isWearing(a, cat, id)
  ? Object.assign({}, a, { [cat]: BB.wornIn(a, cat).filter(w => w !== id) })
  : BB.withItem(a, cat, id);

BB.defaultAvatar = function (gender) {
  return {
    skin: 'skin2',
    hair: gender === 'female' ? 'long' : 'short',
    hairColor: 'black',
    outfit: gender === 'female' ? 'dress' : 'tee',
    football: 'none',
    custom: 'none',
    hat: 'none',
    accessory: [],
    face: 'smile',
    gun: 'marker',
    paint: 'red',
  };
};
