// Screens: setup, home, avatar shop, plus the shared modal.
(function () {
  const $ = sel => document.querySelector(sel);
  const S = () => BB.state;

  let selectedWorld = null;
  let shopTab = 'hair';
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
  function renderSetup() {
    $('#prev-male').innerHTML = BB.renderAvatar(BB.defaultAvatar('male'));
    $('#prev-female').innerHTML = BB.renderAvatar(BB.defaultAvatar('female'));
    document.querySelectorAll('.gender-card').forEach(el => el.classList.toggle('selected', el.dataset.gender === setupGender));
    $('#setup-go').disabled = !setupGender;
  }

  function finishSetup() {
    const name = $('#setup-name').value.trim().slice(0, 16) || 'Player';
    S().profile = { name, gender: setupGender };
    S().avatar = BB.defaultAvatar(setupGender);
    BB.save();
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
    const unlocked = st.unlocked[diff];
    if (!selectedWorld || selectedWorld > unlocked) selectedWorld = unlocked;

    $('#home-avatar').innerHTML = BB.renderAvatar(st.avatar);
    $('#home-name').textContent = st.profile.name;
    $('#btn-mute').textContent = st.muted ? '🔇' : '🔊';

    $('#diff-row').innerHTML = BB.DIFFICULTY_ORDER.map(key => {
      const d = BB.DIFFICULTIES[key];
      return `<button class="diff-btn ${key === diff ? 'active' : ''} diff-${key}" data-diff="${key}">
        <b>${d.label}${st.beaten[key] ? ' 🏆' : ''}</b><small>${d.blurb}</small></button>`;
    }).join('');

    $('#world-list').innerHTML = BB.WORLDS.map((w, i) => {
      const n = i + 1;
      const locked = n > unlocked;
      const cleared = n < unlocked || (n === BB.WORLDS.length && st.beaten[diff]);
      return `<button class="world-card w${n} ${locked ? 'locked' : ''} ${n === selectedWorld ? 'active' : ''}" data-world="${n}" ${locked ? 'disabled' : ''}>
        <span class="world-num">${locked ? '🔒' : cleared ? '⭐' : n}</span>
        <span class="world-info"><b>${w.name}</b><small>Goal ${BB.goalFor(i, diff).toLocaleString()} pts · Reward ${w.reward.toLocaleString()} coins</small></span>
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
          <div class="help-row"><span class="mini-target"></span><p><b>Tap or click bullseyes</b> before they disappear. Each one is <b>+1 point</b> and <b>+1 coin</b>.</p></div>
          <div class="help-row"><span class="mini-target trick"><span class="face"><img src="${BB.avatarDataUrl(S().avatar)}" alt=""></span></span><p><b>Watch out!</b> Bullseyes with <b>your avatar's face</b> are tricks, so hitting one is <b>−1 point</b>. If you hit one with <b>0 points</b>, you go back to the home page.</p></div>
          <p>Reach the goal to clear the world. Your score starts from 0 again in every new world. Clearing a world gives <b>100 coins</b>, and World 5 gives <b>1000</b>!</p>
          <p>Spend coins in the <b>Avatar Shop</b> on hair, outfits, hats and more.</p>
          <div class="table-wrap"><table><thead><tr><th>Points needed</th>${BB.WORLDS.map((w, i) => `<th>W${i + 1}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        </div>`,
      buttons: [{ label: 'Got it!', primary: true }],
    });
  }

  function confirmReset() {
    BB.modal({
      title: 'Reset everything?',
      body: '<p>This deletes your coins, items, avatar and world progress on this device. You can\'t undo it.</p>',
      buttons: [
        { label: 'Keep my progress', primary: true },
        { label: 'Reset', action: () => { BB.resetSave(); setupGender = null; $('#setup-name').value = ''; renderSetup(); BB.showScreen('setup'); } },
      ],
    });
  }

  // ---------- Shop ----------
  function openShop() {
    renderShop();
    BB.showScreen('shop');
  }

  function renderShop() {
    const st = S();
    $('#shop-avatar').innerHTML = BB.renderAvatar(st.avatar);
    $('#shop-tabs').innerHTML = BB.CATEGORIES.map(c =>
      `<button class="tab ${c.key === shopTab ? 'active' : ''}" data-tab="${c.key}">${c.label}</button>`).join('');

    const cat = BB.CATEGORIES.find(c => c.key === shopTab);
    $('#shop-grid').innerHTML = BB.ITEMS[shopTab].map(item => {
      const preview = Object.assign({}, st.avatar, { [shopTab]: item.id });
      const owned = BB.isOwned(shopTab, item.id);
      const equipped = st.avatar[shopTab] === item.id;
      let status;
      if (equipped) status = '<span class="status equipped">✔ Wearing</span>';
      else if (owned) status = `<span class="status owned">${item.price === 0 ? 'Free' : 'Owned'}</span>`;
      else status = coinTag(item.price);
      const cls = ['item-card', equipped && 'equipped', !owned && st.coins < item.price && 'cant-afford'].filter(Boolean).join(' ');
      return `<button class="${cls}" data-item="${item.id}">
        <div class="item-preview">${BB.renderAvatar(preview, { head: cat.view === 'head' })}</div>
        <b>${item.name}</b>${status}</button>`;
    }).join('');
    BB.refreshCoins();
  }

  function chooseItem(id) {
    const st = S();
    const item = BB.findItem(shopTab, id);
    if (!item) return;

    if (BB.isOwned(shopTab, id)) {
      st.avatar[shopTab] = id;
      BB.save();
      BB.sfx.click();
      renderShop();
      return;
    }

    if (st.coins < item.price) {
      BB.sfx.nope();
      BB.modal({
        title: 'Not enough coins',
        body: `<p><b>${item.name}</b> costs ${coinTag(item.price)}.<br>You need <b>${(item.price - st.coins).toLocaleString()}</b> more coins. Go hit some bullseyes!</p>`,
        buttons: [{ label: 'OK', primary: true }],
      });
      return;
    }

    BB.modal({
      title: `Buy ${item.name}?`,
      body: `<div class="buy-preview">${BB.renderAvatar(Object.assign({}, st.avatar, { [shopTab]: id }))}</div>
        <p>Price: ${coinTag(item.price)}<br>You'll have <b>${(st.coins - item.price).toLocaleString()}</b> coins left.</p>`,
      buttons: [
        { label: 'Buy & wear', primary: true, action: () => {
          st.coins -= item.price;
          st.owned.push(shopTab + ':' + id);
          st.avatar[shopTab] = id;
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
      if (e.key === 'Escape' && $('#screen-game').classList.contains('active') && modal.hidden) BB.pauseGame();
    });

    if (S().profile && S().avatar) {
      BB.goHome();
    } else {
      renderSetup();
      BB.showScreen('setup');
    }
  }

  init();
})();
