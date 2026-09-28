// Everything is saved in the browser's localStorage. No server, no database.
(function () {
  const KEY = 'bullseyeBlitz.save.v1';

  function perDifficulty(value) {
    const out = {};
    BB.DIFFICULTY_ORDER.forEach(d => { out[d] = value; });
    return out;
  }

  function defaults() {
    return {
      profile: null,            // { name, gender }
      avatar: null,             // see BB.defaultAvatar
      coins: 0,
      owned: [],                // "cat:id" keys of bought items
      difficulty: 'easy',
      unlocked: perDifficulty(1), // how many worlds are unlocked (1-5)
      beaten: perDifficulty(false),
      muted: false,
      stats: { hits: 0, tricks: 0 },
    };
  }

  function load() {
    const base = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base;
      const data = JSON.parse(raw);
      return Object.assign(base, data, {
        unlocked: Object.assign(base.unlocked, data.unlocked),
        beaten: Object.assign(base.beaten, data.beaten),
        stats: Object.assign(base.stats, data.stats),
      });
    } catch (e) {
      return base;
    }
  }

  BB.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(BB.state)); } catch (e) { /* storage unavailable */ }
  };

  BB.resetSave = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    BB.state = defaults();
  };

  BB.isOwned = function (cat, id) {
    const item = BB.findItem(cat, id);
    return !!item && (item.price === 0 || BB.state.owned.includes(cat + ':' + id));
  };

  BB.state = load();

  // Drop anything that no longer exists (e.g. an item removed in an update).
  if (BB.state.avatar) {
    const fallback = BB.defaultAvatar(BB.state.profile && BB.state.profile.gender);
    BB.CATEGORIES.forEach(({ key }) => {
      if (!BB.isOwned(key, BB.state.avatar[key])) BB.state.avatar[key] = fallback[key];
    });
  }
  if (!BB.DIFFICULTIES[BB.state.difficulty]) BB.state.difficulty = 'easy';
})();
