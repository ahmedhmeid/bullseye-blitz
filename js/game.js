// The target-shooting game loop.
(function () {
  const arena = document.getElementById('arena');
  const screen = document.getElementById('screen-game');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let g = null; // current run

  function config() {
    const w = BB.WORLDS[g.world];
    const d = BB.DIFFICULTIES[g.diff];
    return {
      spawn: w.spawn * d.life,
      max: w.max,
      life: [w.life[0] * d.life, w.life[1] * d.life],
      move: Math.min(0.95, w.move + d.move),
      speed: [w.speed[0] * d.speed, w.speed[1] * d.speed],
      size: w.size,
      trick: Math.min(0.5, w.trick + d.trick),
      patterns: w.patterns,
    };
  }

  BB.startGame = function (world) {
    stop();
    const diff = BB.state.difficulty;
    g = {
      world,
      diff,
      score: 0,
      goal: BB.goalFor(world, diff),
      targets: [],
      spawnIn: 1400,
      running: true,
      paused: false,
      last: performance.now(),
      face: BB.avatarDataUrl(BB.state.avatar),
      raf: 0,
    };
    screen.dataset.world = world + 1;
    BB.showScreen('game');
    updateHud();
    intro();
    g.raf = requestAnimationFrame(frame);
  };

  BB.pauseGame = function () {
    if (!g || !g.running || g.paused) return;
    g.paused = true;
    BB.modal({
      title: 'Paused',
      body: `<p>World ${g.world + 1}: ${BB.WORLDS[g.world].name}<br>Score: <b>${g.score}</b> / ${g.goal}</p>`,
      buttons: [
        { label: 'Resume', primary: true, action: resume },
        { label: 'Quit to home', action: () => { stop(); BB.goHome(); } },
      ],
      dismissable: false,
    });
  };

  function resume() {
    if (g) g.paused = false;
  }

  function stop() {
    if (g) cancelAnimationFrame(g.raf);
    g = null;
    arena.innerHTML = '';
  }

  function intro() {
    const w = BB.WORLDS[g.world];
    const el = document.createElement('div');
    el.className = 'world-intro';
    el.innerHTML = `<small>World ${g.world + 1}</small><b>${w.name}</b><span>Target: ${g.goal} points</span>`;
    arena.appendChild(el);
    setTimeout(() => el.remove(), 1900);
  }

  function frame(now) {
    if (!g) return;
    const dt = Math.min(50, now - g.last);
    g.last = now;
    if (g.running && !g.paused) update(dt);
    if (g) g.raf = requestAnimationFrame(frame);
  }

  function update(dt) {
    const c = config();
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) {
      if (g.targets.length < c.max) spawn(c);
      g.spawnIn = c.spawn * rand(0.7, 1.3);
    }

    const W = arena.clientWidth, H = arena.clientHeight;
    const s = dt / 1000;
    for (const t of g.targets.slice()) {
      t.age += dt;
      if (t.age >= t.life) { remove(t, 'gone'); continue; }

      if (t.type === 'bounce') {
        t.x += t.vx * s; t.y += t.vy * s;
        if (t.x < t.r || t.x > W - t.r) t.vx *= -1;
        if (t.y < t.r || t.y > H - t.r) t.vy *= -1;
      } else if (t.type === 'wave') {
        t.x += t.vx * s;
        if (t.x < t.r || t.x > W - t.r) t.vx *= -1;
        t.y = t.baseY + Math.sin(t.age * t.freq) * t.amp;
      } else if (t.type === 'orbit') {
        t.a += t.av * s;
        t.x = t.cx + Math.cos(t.a) * t.R;
        t.y = t.cy + Math.sin(t.a) * t.R;
      }
      t.x = clamp(t.x, t.r, Math.max(t.r, W - t.r));
      t.y = clamp(t.y, t.r, Math.max(t.r, H - t.r));

      // Shrink and fade during the last quarter of its life.
      const left = 1 - t.age / t.life;
      const fade = left < 0.25 ? left / 0.25 : 1;
      t.el.style.transform = `translate(${t.x - t.r}px, ${t.y - t.r}px) scale(${0.55 + 0.45 * fade})`;
      t.el.style.opacity = 0.3 + 0.7 * fade;
    }
  }

  function spawn(c) {
    const W = arena.clientWidth, H = arena.clientHeight;
    const scale = clamp(Math.min(W, H) / 700, 0.55, 1.15);
    const size = rand(c.size[0], c.size[1]) * scale;
    const r = size / 2;

    let x, y, tries = 0;
    do {
      x = rand(r, W - r);
      y = rand(r, H - r);
      tries++;
    } while (tries < 15 && g.targets.some(o => Math.hypot(o.x - x, o.y - y) < o.r + r + 8));

    const speed = rand(c.speed[0], c.speed[1]) * scale;
    const angle = rand(0, Math.PI * 2);
    const t = {
      x, y, r,
      trick: Math.random() < c.trick,
      type: Math.random() < c.move ? pick(c.patterns) : 'still',
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: rand(c.life[0], c.life[1]),
    };
    t.coin = !t.trick && Math.random() < BB.COIN_CHANCE;

    if (t.type === 'wave') {
      t.amp = rand(25, 70) * scale;
      t.freq = rand(2, 4) / 1000;
      t.baseY = clamp(y, r + t.amp, Math.max(r + t.amp, H - r - t.amp));
      t.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
    } else if (t.type === 'orbit') {
      t.R = rand(35, 90) * scale;
      t.cx = clamp(x, r + t.R, Math.max(r + t.R, W - r - t.R));
      t.cy = clamp(y, r + t.R, Math.max(r + t.R, H - r - t.R));
      t.a = angle;
      t.av = (speed / t.R) * (Math.random() < 0.5 ? -1 : 1);
    }

    const el = document.createElement('div');
    el.className = 'target' + (t.trick ? ' trick' : '') + (t.coin ? ' coin-target' : '');
    el.style.width = el.style.height = size + 'px';
    el.style.transform = `translate(${x - r}px, ${y - r}px)`;
    el.innerHTML = `<div class="target-inner">${t.trick ? `<div class="face"><img src="${g.face}" alt="" draggable="false"></div>` : ''}${t.coin ? '<span class="coin"></span>' : ''}</div>`;
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      hit(t);
    });
    t.el = el;
    arena.appendChild(el);
    g.targets.push(t);
  }

  function remove(t, how) {
    t.dead = true;
    g.targets.splice(g.targets.indexOf(t), 1);
    t.el.firstChild.classList.add(how);
    t.el.style.pointerEvents = 'none';
    setTimeout(() => t.el.remove(), 300);
  }

  function hit(t) {
    if (!g || !g.running || g.paused || t.dead) return;
    remove(t, 'popped');

    if (t.trick) {
      BB.state.stats.tricks++;
      if (g.score <= 0) {
        BB.save();
        lose();
        return;
      }
      g.score--;
      BB.sfx.bad();
      floatText(t.x, t.y, '-1', 'bad');
      arena.classList.remove('shake');
      void arena.offsetWidth; // restart the animation
      arena.classList.add('shake');
    } else {
      // Coin bullseyes are worth the world's bonus, in both points and coins.
      const pts = t.coin ? BB.WORLDS[g.world].bonus : 1;
      g.score += pts;
      BB.state.coins += pts;
      BB.state.stats.hits++;
      if (t.coin) BB.sfx.coin(); else BB.sfx.hit();
      floatText(t.x, t.y, '+' + pts, t.coin ? 'gold' : 'good');
      burst(t.x, t.y, t.coin);
    }
    BB.save();
    updateHud();
    if (g.score >= g.goal) worldComplete();
  }

  function lose() {
    g.running = false;
    BB.sfx.lose();
    stop();
    BB.goHome('You hit a decoy with 0 points, so the run is over. Your unlocked worlds are still saved.');
  }

  function worldComplete() {
    g.running = false;
    const world = g.world, diff = g.diff;
    const reward = BB.WORLDS[world].reward;
    const last = world === BB.WORLDS.length - 1;
    BB.state.coins += reward;
    if (last) BB.state.beaten[diff] = true;
    else BB.state.unlocked[diff] = Math.max(BB.state.unlocked[diff], world + 2);
    BB.save();
    BB.refreshCoins();
    BB.sfx.win();
    g.targets.slice().forEach(t => remove(t, 'gone'));

    const diffLabel = BB.DIFFICULTIES[diff].label;
    if (last) {
      BB.modal({
        title: 'All worlds cleared',
        body: `<p>You cleared all 5 worlds on <b>${diffLabel}</b>.</p><p class="reward">+${reward} coins</p>`,
        buttons: [{ label: 'Home', primary: true, action: () => { stop(); BB.goHome(); } }],
        dismissable: false,
      });
    } else {
      BB.modal({
        title: `World ${world + 1} cleared`,
        body: `<p>Next up: <b>World ${world + 2}: ${BB.WORLDS[world + 1].name}</b><br>Your score starts again from 0.</p><p class="reward">+${reward} coins</p>`,
        buttons: [
          { label: 'Next world', primary: true, action: () => BB.startGame(world + 1) },
          { label: 'Home', action: () => { stop(); BB.goHome(); } },
        ],
        dismissable: false,
      });
    }
  }

  function updateHud() {
    document.getElementById('hud-world-num').textContent = `World ${g.world + 1} · ${BB.DIFFICULTIES[g.diff].label}`;
    document.getElementById('hud-world-name').textContent = BB.WORLDS[g.world].name;
    document.getElementById('hud-score').textContent = `${g.score} / ${g.goal}`;
    document.getElementById('hud-bar').style.width = Math.min(100, (g.score / g.goal) * 100) + '%';
    BB.refreshCoins();
  }

  function floatText(x, y, text, cls) {
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    arena.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function burst(x, y, gold) {
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('div');
      const a = (i / 10) * Math.PI * 2;
      const d = rand(30, 60);
      el.className = 'spark';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.setProperty('--dx', Math.cos(a) * d + 'px');
      el.style.setProperty('--dy', Math.sin(a) * d + 'px');
      el.style.background = gold ? (i % 2 ? '#d4a72c' : '#fff4c7') : (i % 2 ? '#e5484d' : '#f2f2f2');
      arena.appendChild(el);
      setTimeout(() => el.remove(), 600);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) BB.pauseGame();
  });
})();
