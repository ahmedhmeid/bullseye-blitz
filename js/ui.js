// Screens: setup, home, avatar shop, plus the shared modal.
(function () {
  const $ = sel => document.querySelector(sel);
  const S = () => BB.state;

  let selectedWorld = null;
  let shopTab = 'gun';
  let setupGender = null;
  let msgTimer = 0;

  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const coinTag = n => `<span class="price"><span class="coin"></span>${n.toLocaleString()}</span>`;

  BB.showScreen = function (name) {
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === 'screen-' + name));
  };

  BB.refreshCoins = function () {
    document.querySelectorAll('[data-coins]').forEach(el => { el.textContent = S().coins.toLocaleString(); });
  };

  // ---------- Modal ----------
  const modal = $('#modal');
  let modalDismissable = true;

  BB.modal = function ({ title, body, buttons, dismissable }) {
    modalDismissable = dismissable !== false;
    $('#modal-title').innerHTML = title;
    $('#modal-body').innerHTML = body || '';
    const actions = $('#modal-actions');
    actions.innerHTML = '';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (b.primary ? 'primary' : 'secondary');
      btn.textContent = b.label;
      btn.addEventListener('click', () => {
        BB.sfx.click();
        BB.closeModal();
        if (b.action) b.action();
      });
      actions.appendChild(btn);
    });
    modal.hidden = false;
  };

  BB.closeModal = function () { modal.hidden = true; };

  // ---------- Setup ----------
  function openSetup() {
    setupGender = null;
    $('#setup-name').value = '';
    $('#setup-cancel').hidden = !BB.currentPlayerId();
    renderSetup();
    BB.showScreen('setup');
  }

  function renderSetup() {
    $('#prev-male').innerHTML = BB.renderAvatar(BB.defaultAvatar('male'));
    $('#prev-female').innerHTML = BB.renderAvatar(BB.defaultAvatar('female'));
    document.querySelectorAll('.gender-card').forEach(el => el.classList.toggle('selected', el.dataset.gender === setupGender));
    $('#setup-go').disabled = !setupGender;
  }

  function finishSetup() {
    const name = $('#setup-name').value.trim().slice(0, 16) || 'Player';
    BB.createPlayer(name, setupGender);
    selectedWorld = null;
    BB.goHome();
  }

  // ---------- Home ----------
  BB.goHome = function (message) {
    BB.closeModal();
    renderHome();
    BB.showScreen('home');
    const box = $('#home-msg');
    clearTimeout(msgTimer);
    if (message) {
      box.textContent = message;
      box.hidden = false;
      msgTimer = setTimeout(() => { box.hidden = true; }, 6000);
    } else {
      box.hidden = true;
    }
  };

  function renderHome() {
    const st = S();
    const diff = st.difficulty;
    const progress = st.unlocked[diff];
    const unlocked = BB.worldsUnlocked(st, diff);
    if (!selectedWorld || selectedWorld > unlocked) selectedWorld = progress;

    $('#home-avatar').innerHTML = BB.renderAvatar(st.avatar);
    $('#home-name').textContent = st.profile.name;
    $('#btn-mute').textContent = st.muted ? '🔇' : '🔊';

    $('#diff-row').innerHTML = BB.DIFFICULTY_ORDER.map(key => {
      const d = BB.DIFFICULTIES[key];
      return `<button class="diff-btn ${key === diff ? 'active' : ''} diff-${key}" data-diff="${key}">
        <b>${d.label}${st.beaten[key] ? ' <span class="done">✓</span>' : ''}</b><small>${d.blurb}</small></button>`;
    }).join('');

    $('#world-list').innerHTML = BB.WORLDS.map((w, i) => {
      const n = i + 1;
      const locked = n > unlocked;
      const cleared = n < progress || (n === BB.WORLDS.length && st.beaten[diff]);
      return `<button class="world-card w${n} ${locked ? 'locked' : ''} ${n === selectedWorld ? 'active' : ''}" data-world="${n}" ${locked ? 'disabled' : ''}>
        <span class="world-num">${locked ? '—' : cleared ? '✓' : n}</span>
        <span class="world-info"><b>${w.name}</b><small>Goal ${BB.goalFor(i, diff).toLocaleString()} pts · Reward ${BB.rewardFor(i, diff).toLocaleString()} coins</small></span>
      </button>`;
    }).join('');

    BB.refreshCoins();
  }

  function showHelp() {
    const rows = BB.DIFFICULTY_ORDER.map(key => {
      const d = BB.DIFFICULTIES[key];
      return `<tr><th>${d.label}</th>${BB.WORLDS.map((w, i) => `<td>${BB.goalFor(i, key)}</td>`).join('')}</tr>`;
    }).join('');
    BB.modal({
      title: 'How to play',
      body: `
        <div class="help">
          <div class="help-row"><span class="mini-target"></span><p><b>Paintball the bullseyes</b> before they disappear. Each one is <b>+1 point</b> and <b>+1 coin</b>.</p></div>
          <div class="help-row"><span class="mini-target trick"><span class="face"><img src="${BB.avatarDataUrl(S().avatar)}" alt=""></span></span><p><b>Decoys:</b> bullseyes with <b>your avatar's face</b> are tricks, so hitting one is <b>−1 point</b>. If you hit one with <b>0 points</b>, you go back to the home page.</p></div>
          <p><b>Computer:</b> click the world to start aiming, move the mouse to aim, click to shoot, right-click or Space to use the scope, Esc to pause.<br>
          <b>Phone or tablet:</b> drag to aim, tap to shoot, and tap 🔭 to use the scope.</p>
          <p>Reach the goal to clear the world. Your score starts from 0 again in every new world. Clearing a world gives <b>100 coins</b>, and World 5 gives <b>1000</b> (or <b>1,000,000</b> on Impossible).</p>
          <p>Spend coins in the <b>Avatar Shop</b> on new paintball guns and paint colours (5 coins each, or 10,000 for Bronze, Silver and Gold), plus hair, outfits, hats and more.</p>
          <div class="table-wrap"><table><thead><tr><th>Points needed</th>${BB.WORLDS.map((w, i) => `<th>W${i + 1}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        </div>`,
      buttons: [{ label: 'Got it', primary: true }],
    });
  }

  function confirmReset() {
    BB.modal({
      title: `Delete ${escapeHtml(S().profile.name)}?`,
      body: '<p>This deletes this player\'s coins, items, avatar and world progress on this device. Other players aren\'t affected. You can\'t undo it.</p>',
      buttons: [
        { label: 'Keep player', primary: true },
        { label: 'Delete', action: () => {
          selectedWorld = null;
          if (BB.deleteCurrentPlayer()) BB.goHome();
          else openSetup();
        } },
      ],
    });
  }

  // ---------- Players & leaderboard ----------
  function showPlayers() {
    const current = BB.currentPlayerId();
    const ranked = BB.listPlayers().sort((a, b) =>
      (BB.worldsCleared(b.state) - BB.worldsCleared(a.state)) || (b.state.stats.hits - a.state.stats.hits));
    const rows = ranked.map((p, i) => `
      <button class="player-row ${p.id === current ? 'current' : ''}" data-player="${p.id}">
        <span class="rank">${i + 1}</span>
        <span class="player-face"><img src="${BB.avatarDataUrl(p.state.avatar)}" alt=""></span>
        <span class="player-info"><b>${escapeHtml(p.state.profile.name)}</b><small>${p.id === current ? 'Playing now' : 'Tap to switch'}</small></span>
        <span class="player-stat"><b>${BB.worldsCleared(p.state)}</b><small>worlds</small></span>
        <span class="player-stat"><b>${p.state.stats.hits.toLocaleString()}</b><small>hits</small></span>
      </button>`).join('');
    BB.modal({
      title: 'Players',
      body: `<p class="muted">Ranked by worlds cleared across all difficulties, then total bullseyes hit. Everyone here plays on this device.</p><div class="player-list">${rows}</div>`,
      buttons: [
        { label: 'Add player', primary: true, action: openSetup },
        { label: 'Close' },
      ],
    });
    document.querySelectorAll('#modal-body [data-player]').forEach(el => el.addEventListener('click', () => {
      BB.sfx.click();
      BB.switchPlayer(el.dataset.player);
      selectedWorld = null;
      BB.goHome();
    }));
  }

  // ---------- Shop ----------
  function openShop() {
    renderShop();
    BB.showScreen('shop');
  }

  // Guns and paintballs are drawn on their own; everything else on the avatar.
  const isGear = () => BB.CATEGORIES.find(c => c.key === shopTab).view === 'gear';
  const picture = (a, opts) => (isGear() ? BB.renderGear(a, shopTab) : BB.renderAvatar(a, opts));

  function renderShop() {
    const st = S();
    $('#shop-avatar').innerHTML = isGear() ? BB.renderLoadout(st.avatar) : BB.renderAvatar(st.avatar);
    $('#shop-tabs').innerHTML = BB.CATEGORIES.map(c =>
      `<button class="tab ${c.key === shopTab ? 'active' : ''}" data-tab="${c.key}">${c.label}</button>`).join('');

    let group = null;
    $('#shop-grid').innerHTML = BB.ITEMS[shopTab].filter(item => !item.variantOf).map(item => {
      // Items with a `group` (e.g. Clubs / Countries) get a heading where each group starts.
      const heading = item.group && item.group !== group ? `<h3 class="grid-heading">${item.group}</h3>` : '';
      group = item.group || group;
      // An item with colour variants shows the colour being worn, if any.
      const wornVariant = BB.variantsOf(shopTab, item.id).find(v => BB.isWearing(st.avatar, shopTab, v.id));
      return heading + itemCard(item, item.name, wornVariant ? st.avatar : null);
    }).join('');
    BB.refreshCoins();
  }

  function itemCard(item, label, preview) {
    const st = S();
    const cat = BB.CATEGORIES.find(c => c.key === shopTab);
    preview = preview || BB.withItem(st.avatar, shopTab, item.id);
    const owned = BB.isOwned(shopTab, item.id);
    const equipped = preview === st.avatar || BB.isWearing(st.avatar, shopTab, item.id);
    let status;
    if (equipped) status = `<span class="status equipped">${isGear() ? 'Equipped' : 'Wearing'}</span>`;
    else if (owned) status = `<span class="status owned">${item.price === 0 ? 'Free' : 'Owned'}</span>`;
    else status = coinTag(item.price);
    const cls = ['item-card', equipped && 'equipped', !owned && st.coins < item.price && 'cant-afford'].filter(Boolean).join(' ');
    return `<button class="${cls}" data-item="${item.id}">
      <div class="item-preview">${picture(preview, { head: cat.view === 'head' })}</div>
      <b>${label}</b>${status}</button>`;
  }

  // Shows every colour of an item, like the shop grid, to pick one to wear.
  function chooseVariant(item) {
    BB.sfx.click();
    BB.modal({
      title: `${item.name} colours`,
      body: `<div class="item-grid variant-grid">${BB.variantsOf(shopTab, item.id)
        .map(v => itemCard(v, v.colorName || v.name)).join('')}</div>`,
      buttons: [{ label: 'Close' }],
    });
    document.querySelectorAll('#modal-body [data-item]').forEach(el => el.addEventListener('click', () => {
      BB.closeModal();
      chooseItem(el.dataset.item, true);
    }));
  }

  // Pick the name and number to put on a club or country shirt, then wear it.
  function customiseKit(item) {
    const st = S();
    const a = st.avatar;
    const withKit = (name, number) => Object.assign(BB.withItem(a, 'custom', item.id), { kitName: name, kitNumber: number });
    const readName = () => $('#kit-name').value.trim().slice(0, 12);
    const readNumber = () => Math.min(99, Math.max(1, parseInt($('#kit-number').value, 10) || 10));
    const name = a.custom === item.id ? a.kitName : (a.kitName || st.profile.name);
    const number = a.kitNumber || 10;
    BB.sfx.click();
    BB.modal({
      title: `${escapeHtml(item.name)} shirt`,
      body: `<div class="buy-preview" id="kit-preview">${BB.renderAvatar(withKit(name, number))}</div>
        <div class="kit-fields">
          <label class="field"><span>Name on shirt</span><input id="kit-name" maxlength="12" autocomplete="off" value="${escapeHtml(name || '')}"></label>
          <label class="field"><span>Number</span><input id="kit-number" type="number" min="1" max="99" inputmode="numeric" value="${number}"></label>
        </div>`,
      buttons: [
        { label: 'Wear it', primary: true, action: () => {
          st.avatar = withKit(readName(), readNumber());
          BB.save();
          renderShop();
        } },
        { label: 'Cancel' },
      ],
    });
    const update = () => { $('#kit-preview').innerHTML = BB.renderAvatar(withKit(readName(), readNumber())); };
    $('#kit-name').addEventListener('input', update);
    $('#kit-number').addEventListener('input', update);
  }

  function chooseItem(id, picked) {
    const st = S();
    const item = BB.findItem(shopTab, id);
    if (!item) return;

    if (!picked && BB.variantsOf(shopTab, id).length > 1) return chooseVariant(item);
    if (shopTab === 'custom' && id !== 'none') return customiseKit(item);

    if (BB.isOwned(shopTab, id)) {
      st.avatar = BB.toggleItem(st.avatar, shopTab, id);
      BB.save();
      BB.sfx.click();
      renderShop();
      return;
    }

    if (st.coins < item.price) {
      BB.sfx.nope();
      BB.modal({
        title: 'Not enough coins',
        body: `<p><b>${item.name}</b> costs ${coinTag(item.price)}.<br>You need <b>${(item.price - st.coins).toLocaleString()}</b> more coins.</p>`,
        buttons: [{ label: 'OK', primary: true }],
      });
      return;
    }

    BB.modal({
      title: `Buy ${item.name}?`,
      body: `<div class="buy-preview${isGear() ? ' gear' : ''}">${picture(BB.withItem(st.avatar, shopTab, id))}</div>
        <p>Price: ${coinTag(item.price)}<br>You'll have <b>${(st.coins - item.price).toLocaleString()}</b> coins left.</p>`,
      buttons: [
        { label: isGear() ? 'Buy & equip' : 'Buy & wear', primary: true, action: () => {
          st.coins -= item.price;
          st.owned.push(shopTab + ':' + id);
          st.avatar = BB.withItem(st.avatar, shopTab, id);
          BB.save();
          BB.sfx.buy();
          renderShop();
        } },
        { label: 'Cancel' },
      ],
    });
  }

  // ---------- Wiring ----------
  function init() {
    document.querySelectorAll('.gender-card').forEach(el => el.addEventListener('click', () => {
      setupGender = el.dataset.gender;
      BB.sfx.click();
      renderSetup();
    }));
    $('#setup-go').addEventListener('click', finishSetup);
    $('#setup-cancel').addEventListener('click', () => BB.goHome());
    $('#btn-players').addEventListener('click', () => { BB.sfx.click(); showPlayers(); });
    $('#setup-name').addEventListener('keydown', e => { if (e.key === 'Enter' && setupGender) finishSetup(); });

    $('#diff-row').addEventListener('click', e => {
      const btn = e.target.closest('[data-diff]');
      if (!btn) return;
      S().difficulty = btn.dataset.diff;
      selectedWorld = null;
      BB.save();
      BB.sfx.click();
      renderHome();
    });
    $('#world-list').addEventListener('click', e => {
      const btn = e.target.closest('[data-world]');
      if (!btn || btn.disabled) return;
      selectedWorld = Number(btn.dataset.world);
      BB.sfx.click();
      renderHome();
    });
    $('#btn-play').addEventListener('click', () => BB.startGame(selectedWorld - 1));
    $('#btn-shop').addEventListener('click', () => { BB.sfx.click(); openShop(); });
    $('#btn-help').addEventListener('click', showHelp);
    $('#btn-reset').addEventListener('click', confirmReset);
    $('#btn-mute').addEventListener('click', () => {
      S().muted = !S().muted;
      BB.save();
      renderHome();
    });

    $('#btn-pause').addEventListener('click', BB.pauseGame);

    $('#btn-shop-back').addEventListener('click', () => { BB.sfx.click(); BB.goHome(); });
    $('#shop-tabs').addEventListener('click', e => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      shopTab = btn.dataset.tab;
      BB.sfx.click();
      renderShop();
    });
    $('#shop-grid').addEventListener('click', e => {
      const btn = e.target.closest('[data-item]');
      if (btn) chooseItem(btn.dataset.item);
    });

    modal.addEventListener('click', e => {
      if (e.target === modal && modalDismissable) BB.closeModal();
    });
    document.addEventListener('keydown', e => {
      if (!$('#screen-game').classList.contains('active') || !modal.hidden) return;
      if (e.key === 'Escape' || e.key === 'p') BB.pauseGame();
      if (e.key === ' ') {
        e.preventDefault(); // don't also press a focused button
        if (!e.repeat) BB.toggleScope();
      }
    });

    if (S().profile && S().avatar) {
      BB.goHome();
    } else {
      openSetup();
    }
  }

  init();
})();
