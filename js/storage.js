// Everything is saved in the browser's localStorage. No server, no database.
// Several players can share one device; each has their own save.
(function () {
  const KEY = 'bullseyeBlitz.players.v1';
  const OLD_KEY = 'bullseyeBlitz.save.v1'; // single-player save from before profiles

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

  function normalize(data) {
    const base = defaults();
    const st = Object.assign(base, data, {
      unlocked: Object.assign(base.unlocked, data.unlocked),
      beaten: Object.assign(base.beaten, data.beaten),
      stats: Object.assign(base.stats, data.stats),
    });
    // Drop anything that no longer exists (e.g. an item removed in an update).
    if (st.avatar) {
      const fallback = BB.defaultAvatar(st.profile && st.profile.gender);
      BB.CATEGORIES.forEach(({ key, multi }) => {
        if (multi) st.avatar[key] = BB.wornIn(st.avatar, key).filter(id => isOwnedBy(st, key, id));
        else if (!isOwnedBy(st, key, st.avatar[key])) st.avatar[key] = fallback[key];
      });
    }
    if (!BB.DIFFICULTIES[st.difficulty]) st.difficulty = 'easy';
    return st;
  }

  function isOwnedBy(st, cat, id) {
    const item = BB.findItem(cat, id);
    return !!item && (item.price === 0 || st.owned.includes(cat + ':' + id));
  }

  const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  let db = { current: null, players: {} };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        Object.keys(data.players || {}).forEach(id => {
          const st = normalize(data.players[id]);
          if (st.profile) db.players[id] = st;
        });
        db.current = db.players[data.current] ? data.current : (Object.keys(db.players)[0] || null);
        return;
      }
      const old = localStorage.getItem(OLD_KEY);
      if (old) {
        const st = normalize(JSON.parse(old));
        if (st.profile) {
          const id = newId();
          db.players[id] = st;
          db.current = id;
          write();
          localStorage.removeItem(OLD_KEY);
        }
      }
    } catch (e) { /* storage unavailable or corrupt */ }
  }

  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage unavailable */ }
  }

  BB.save = function () {
    if (db.current) db.players[db.current] = BB.state;
    write();
  };

  BB.isOwned = (cat, id) => isOwnedBy(BB.state, cat, id);

  BB.currentPlayerId = () => db.current;

  BB.listPlayers = () => Object.keys(db.players).map(id => ({ id, state: db.players[id] }));

  // Worlds cleared across every difficulty (0-20), used for the leaderboard.
  BB.worldsCleared = st => BB.DIFFICULTY_ORDER.reduce(
    (sum, d) => sum + (st.beaten[d] ? BB.WORLDS.length : st.unlocked[d] - 1), 0);

  BB.createPlayer = function (name, gender) {
    const st = defaults();
    st.profile = { name, gender };
    st.avatar = BB.defaultAvatar(gender);
    const id = newId();
    db.players[id] = st;
    db.current = id;
    BB.state = st;
    write();
  };

  BB.switchPlayer = function (id) {
    if (!db.players[id]) return;
    db.current = id;
    BB.state = db.players[id];
    write();
  };

  // Deletes the current player. Returns true if another player is left to switch to.
  BB.deleteCurrentPlayer = function () {
    delete db.players[db.current];
    db.current = Object.keys(db.players)[0] || null;
    BB.state = db.current ? db.players[db.current] : defaults();
    write();
    return !!db.current;
  };

  load();
  BB.state = db.current ? db.players[db.current] : defaults();
})();
