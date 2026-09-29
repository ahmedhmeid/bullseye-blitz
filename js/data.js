// Game configuration: worlds, difficulties and avatar shop items.
window.BB = window.BB || {};

BB.GAME_NAME = 'Bullseye Blitz';

// `extra` is added to every world's goal. Easy uses the base goals.
BB.DIFFICULTIES = {
  easy:       { label: 'Easy',       extra: 0,   speed: 1,    life: 1,    move: 0,    trick: 0,    blurb: 'Warm-up pace' },
  medium:     { label: 'Medium',     extra: 100, speed: 1.15, life: 0.9,  move: 0.05, trick: 0.03, blurb: 'Quicker targets' },
  hard:       { label: 'Hard',       extra: 200, speed: 1.3,  life: 0.8,  move: 0.1,  trick: 0.06, blurb: 'Fast, more decoys' },
  impossible: { label: 'Impossible', extra: 300, speed: 1.55, life: 0.68, move: 0.15, trick: 0.1,  blurb: 'Relentless' },
};
BB.DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'impossible'];

// Score resets at the start of every world; reach `goal` to clear it.
// `bonus` is what a rare coin bullseye is worth (in points and coins).
BB.WORLDS = [
  { name: 'The Hot Sahara',        goal: 50,   reward: 100,  bonus: 2,   spawn: 900, max: 4, life: [2600, 3600], move: 0.25, speed: [50, 100],  size: [80, 130], trick: 0.15, patterns: ['bounce'] },
  { name: 'Underwater Adventures', goal: 75,   reward: 100,  bonus: 5,   spawn: 800, max: 5, life: [2300, 3200], move: 0.4,  speed: [70, 130],  size: [70, 120], trick: 0.2,  patterns: ['bounce', 'wave'] },
  { name: 'Computer Crazies',      goal: 100,  reward: 100,  bonus: 10,  spawn: 700, max: 6, life: [2000, 2900], move: 0.55, speed: [90, 160],  size: [60, 115], trick: 0.25, patterns: ['bounce', 'wave', 'orbit'] },
  { name: 'Astronomy Adventure',   goal: 150,  reward: 100,  bonus: 15,  spawn: 620, max: 7, life: [1800, 2600], move: 0.65, speed: [110, 190], size: [52, 105], trick: 0.3,  patterns: ['bounce', 'wave', 'orbit'] },
  { name: 'Football Fans',         goal: 200,  reward: 1000, bonus: 100, spawn: 540, max: 8, life: [1600, 2300], move: 0.8,  speed: [130, 240], size: [44, 100], trick: 0.35, patterns: ['bounce', 'wave', 'orbit'] },
];

// Chance that a (non-decoy) target spawns as a coin bullseye.
BB.COIN_CHANCE = 0.03;

BB.goalFor = (world, diff) => BB.WORLDS[world].goal + BB.DIFFICULTIES[diff].extra;

// Avatar shop. price 0 = free for everyone.
BB.CATEGORIES = [
  { key: 'hair',      label: 'Hair',        view: 'head' },
  { key: 'hairColor', label: 'Hair Colour', view: 'head' },
  { key: 'outfit',    label: 'Outfits',     view: 'body' },
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
    { id: 'headband', name: 'Headband',     price: 0 },
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
    { id: 'glasses',    name: 'Glasses',    price: 40,  slot: 'eyes' },
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

BB.findItem = (cat, id) => (BB.ITEMS[cat] || []).find(i => i.id === id);

BB.isMulti = cat => !!(BB.CATEGORIES.find(c => c.key === cat) || {}).multi;

// Ids worn in a category as an array ('none' = nothing). Also accepts old single-id saves.
BB.wornIn = (a, cat) => [].concat(a[cat] || []).filter(id => id !== 'none');

BB.isWearing = (a, cat, id) => BB.isMulti(cat)
  ? (id === 'none' ? BB.wornIn(a, cat).length === 0 : BB.wornIn(a, cat).includes(id))
  : a[cat] === id;

// Copy of avatar `a` wearing item `id`. In multi categories it's added alongside
// the others, replacing anything in the same slot.
BB.withItem = function (a, cat, id) {
  if (!BB.isMulti(cat)) return Object.assign({}, a, { [cat]: id });
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
    hat: 'none',
    accessory: [],
    face: 'smile',
  };
};
