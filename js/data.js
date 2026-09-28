// Game configuration: worlds, difficulties and avatar shop items.
window.BB = window.BB || {};

BB.GAME_NAME = 'Bullseye Blitz';

// `extra` is added to every world's goal. Easy uses the base goals.
BB.DIFFICULTIES = {
  easy:       { label: 'Easy',       extra: 0,   speed: 1,    life: 1,    move: 0,    trick: 0,    blurb: 'Nice and relaxed' },
  medium:     { label: 'Medium',     extra: 100, speed: 1.15, life: 0.9,  move: 0.05, trick: 0.03, blurb: 'A bit quicker' },
  hard:       { label: 'Hard',       extra: 200, speed: 1.3,  life: 0.8,  move: 0.1,  trick: 0.06, blurb: 'Fast and tricky' },
  impossible: { label: 'Impossible', extra: 300, speed: 1.55, life: 0.68, move: 0.15, trick: 0.1,  blurb: 'Only for pros' },
};
BB.DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'impossible'];

// Score resets at the start of every world; reach `goal` to clear it.
BB.WORLDS = [
  { name: 'Sunny Meadow', goal: 100,  reward: 100,  spawn: 900, max: 4, life: [2600, 3600], move: 0.25, speed: [50, 100],  size: [80, 130], trick: 0.15, patterns: ['bounce'] },
  { name: 'Desert Dunes', goal: 200,  reward: 100,  spawn: 800, max: 5, life: [2300, 3200], move: 0.4,  speed: [70, 130],  size: [70, 120], trick: 0.2,  patterns: ['bounce', 'wave'] },
  { name: 'Deep Ocean',   goal: 300,  reward: 100,  spawn: 700, max: 6, life: [2000, 2900], move: 0.55, speed: [90, 160],  size: [60, 115], trick: 0.25, patterns: ['bounce', 'wave', 'orbit'] },
  { name: 'Frozen Peaks', goal: 400,  reward: 100,  spawn: 620, max: 7, life: [1800, 2600], move: 0.65, speed: [110, 190], size: [52, 105], trick: 0.3,  patterns: ['bounce', 'wave', 'orbit'] },
  { name: 'Outer Space',  goal: 1000, reward: 1000, spawn: 540, max: 8, life: [1600, 2300], move: 0.8,  speed: [130, 240], size: [44, 100], trick: 0.35, patterns: ['bounce', 'wave', 'orbit'] },
];

BB.goalFor = (world, diff) => BB.WORLDS[world].goal + BB.DIFFICULTIES[diff].extra;

// Avatar shop. price 0 = free for everyone.
BB.CATEGORIES = [
  { key: 'hair',      label: 'Hair',       view: 'head' },
  { key: 'hairColor', label: 'Hair Color', view: 'head' },
  { key: 'outfit',    label: 'Outfits',    view: 'body' },
  { key: 'hat',       label: 'Hats',       view: 'head' },
  { key: 'accessory', label: 'Extras',     view: 'head' },
  { key: 'face',      label: 'Faces',      view: 'head' },
  { key: 'skin',      label: 'Skin',       view: 'head' },
];

BB.ITEMS = {
  hair: [
    { id: 'short',    name: 'Short',      price: 0 },
    { id: 'long',     name: 'Long',       price: 0 },
    { id: 'bald',     name: 'Bald',       price: 0 },
    { id: 'curly',    name: 'Curly',      price: 50 },
    { id: 'ponytail', name: 'Ponytail',   price: 75 },
    { id: 'spiky',    name: 'Spiky',      price: 100 },
    { id: 'buns',     name: 'Space Buns', price: 120 },
    { id: 'afro',     name: 'Afro',       price: 150 },
    { id: 'mohawk',   name: 'Mohawk',     price: 200 },
  ],
  hairColor: [
    { id: 'black',  name: 'Black',  price: 0,   color: '#1e1e1e' },
    { id: 'brown',  name: 'Brown',  price: 0,   color: '#6b3e1e' },
    { id: 'blonde', name: 'Blonde', price: 30,  color: '#f4d03f' },
    { id: 'red',    name: 'Ginger', price: 40,  color: '#d35400' },
    { id: 'silver', name: 'Silver', price: 60,  color: '#dfe6e9' },
    { id: 'blue',   name: 'Blue',   price: 80,  color: '#3498db' },
    { id: 'pink',   name: 'Pink',   price: 80,  color: '#ff6fb5' },
    { id: 'green',  name: 'Green',  price: 80,  color: '#2ecc71' },
    { id: 'purple', name: 'Purple', price: 100, color: '#9b59b6' },
  ],
  outfit: [
    { id: 'tee',      name: 'Blitz Tee',      price: 0 },
    { id: 'dress',    name: 'Dress',          price: 0 },
    { id: 'striped',  name: 'Striped Tee',    price: 40 },
    { id: 'hoodie',   name: 'Hoodie',         price: 60 },
    { id: 'overalls', name: 'Overalls',       price: 80 },
    { id: 'jersey',   name: 'Sports Jersey',  price: 120 },
    { id: 'suit',     name: 'Fancy Suit',     price: 300 },
    { id: 'gown',     name: 'Ball Gown',      price: 400 },
    { id: 'hero',     name: 'Superhero',      price: 500 },
    { id: 'space',    name: 'Astronaut',      price: 750 },
  ],
  hat: [
    { id: 'none',     name: 'No Hat',       price: 0 },
    { id: 'headband', name: 'Headband',     price: 0 },
    { id: 'party',    name: 'Party Hat',    price: 40 },
    { id: 'cap',      name: 'Cap',          price: 50 },
    { id: 'beanie',   name: 'Beanie',       price: 60 },
    { id: 'cowboy',   name: 'Cowboy Hat',   price: 150 },
    { id: 'wizard',   name: 'Wizard Hat',   price: 400 },
    { id: 'crown',    name: 'Royal Crown',  price: 1000 },
  ],
  accessory: [
    { id: 'none',       name: 'Nothing',    price: 0 },
    { id: 'glasses',    name: 'Glasses',    price: 40 },
    { id: 'mustache',   name: 'Mustache',   price: 40 },
    { id: 'eyepatch',   name: 'Eye Patch',  price: 60 },
    { id: 'sunglasses', name: 'Shades',     price: 80 },
    { id: 'headphones', name: 'Headphones', price: 120 },
  ],
  face: [
    { id: 'smile',     name: 'Smile',     price: 0 },
    { id: 'grin',      name: 'Big Grin',  price: 20 },
    { id: 'surprised', name: 'Surprised', price: 40 },
    { id: 'wink',      name: 'Wink',      price: 50 },
    { id: 'cool',      name: 'Cool',      price: 60 },
    { id: 'tongue',    name: 'Silly',     price: 70 },
    { id: 'angry',     name: 'Grumpy',    price: 90 },
  ],
  skin: [
    { id: 'skin1', name: 'Tone 1', price: 0, color: '#ffe0bd' },
    { id: 'skin2', name: 'Tone 2', price: 0, color: '#f1c27d' },
    { id: 'skin3', name: 'Tone 3', price: 0, color: '#e0ac69' },
    { id: 'skin4', name: 'Tone 4', price: 0, color: '#c68642' },
    { id: 'skin5', name: 'Tone 5', price: 0, color: '#8d5524' },
    { id: 'skin6', name: 'Tone 6', price: 0, color: '#5c3a21' },
  ],
};

BB.findItem = (cat, id) => (BB.ITEMS[cat] || []).find(i => i.id === id);

BB.defaultAvatar = function (gender) {
  return {
    skin: 'skin2',
    hair: gender === 'female' ? 'long' : 'short',
    hairColor: 'black',
    outfit: gender === 'female' ? 'dress' : 'tee',
    hat: 'none',
    accessory: 'none',
    face: 'smile',
  };
};
