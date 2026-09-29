// Tiny sound effects generated with the Web Audio API (no audio files needed).
(function () {
  let ctx = null;

  function tone(freq, dur, type, vol, slide, delay) {
    if (BB.state.muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const t0 = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur);
    } catch (e) { /* audio unavailable */ }
  }

  BB.sfx = {
    click: () => tone(600, 0.06, 'square', 0.05),
    hit:   () => tone(880, 0.12, 'triangle', 0.14, 1.6),
    coin:  () => { tone(1319, 0.08, 'square', 0.08); tone(1976, 0.3, 'square', 0.08, 1, 0.07); },
    bad:   () => tone(240, 0.3, 'sawtooth', 0.1, 0.5),
    buy:   () => { tone(988, 0.1, 'square', 0.07); tone(1319, 0.2, 'square', 0.07, 1, 0.08); },
    nope:  () => tone(160, 0.15, 'square', 0.06),
    lose:  () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.13, 1, i * 0.15)),
    win:   () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.13, 1, i * 0.12)),
  };
})();
