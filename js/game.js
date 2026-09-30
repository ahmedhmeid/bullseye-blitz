// The 3D paintball sniper game, drawn with Three.js.
// You stand still at the origin looking down -z; bullseyes pop up in front of you.
(function () {
  const arena = document.getElementById('arena');
  const screen = document.getElementById('screen-game');
  const fx = document.getElementById('fx');
  const hint = document.getElementById('aim-hint');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const DEG = Math.PI / 180;
  const FOV = 70;
  const EYE = 1.7;                 // camera height in metres
  const MAX_YAW = 70 * DEG;        // how far you can turn left/right
  const MIN_PITCH = -25 * DEG, MAX_PITCH = 35 * DEG;
  const SPREAD = 50 * DEG;         // targets appear within this angle of straight ahead
  const MAX_SPLATS = 80;

  // Mouse aiming uses pointer lock; touch screens (or if the lock fails) drag to aim instead.
  let canLock = 'requestPointerLock' in arena && !matchMedia('(pointer: coarse)').matches;
  let locked = false;
  let everLocked = false; // once locking has worked, a refusal just means "too soon after Esc"
  screen.classList.toggle('touch', !canLock);

  let g = null; // current run
  let v = null; // the 3D view, created on first play

  function config() {
    const w = BB.WORLDS[g.world];
    const d = BB.DIFFICULTIES[g.diff];
    return {
      spawn: w.spawn * d.life,
      max: w.max,
      life: [60000, 60000], // every target stays up for one minute
      size: w.size,
      trick: Math.min(0.5, w.trick + d.trick),
      // Later worlds put the targets further away.
      near: 14 + g.world * 4,
      far: 35 + g.world * 8,
    };
  }

  // ---------- Setup ----------

  function initView() {
    if (v) return true;
    if (!window.THREE) return false;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    arena.insertBefore(renderer.domElement, arena.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 900);
    camera.rotation.order = 'YXZ';
    camera.position.set(0, EYE, 0);
    scene.add(camera);

    const hemi = new THREE.HemisphereLight('#ffffff', '#444444', 0.9);
    const sun = new THREE.DirectionalLight('#ffffff', 0.7);
    sun.position.set(-30, 60, 20);
    scene.add(hemi, sun);

    const gunHolder = new THREE.Group();
    camera.add(gunHolder);
    const splats = new THREE.Group();
    scene.add(splats);

    const shared = geo => { geo.userData.shared = true; return geo; };
    v = {
      renderer, scene, camera, hemi, sun, gunHolder, splats,
      raycaster: new THREE.Raycaster(),
      size: [0, 0],
      world: null, solid: null, movers: [],
      geo: {
        face: shared(new THREE.CircleGeometry(1, 48).translate(0, 0, 0.061)),
        back: shared(new THREE.CircleGeometry(1, 48).rotateY(Math.PI).translate(0, 0, -0.061)),
        rim: shared(new THREE.CylinderGeometry(1, 1, 0.12, 48, 1, true).rotateX(Math.PI / 2)),
        ring: shared(new THREE.TorusGeometry(1.1, 0.07, 8, 48)),
        post: shared(new THREE.CylinderGeometry(0.06, 0.06, 1, 8).translate(0, 0.5, 0)),
        ball: shared(new THREE.SphereGeometry(1, 12, 10)),
        splat: shared(new THREE.PlaneGeometry(1, 1)),
      },
      tex: { target: bullseyeTexture(), coin: bullseyeTexture('coin'), splat: splatTexture(), trick: null },
    };
    return true;
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h || w;
    return [c, c.getContext('2d')];
  }

  // Same rings as the old 2D bullseye: red / white / red / white / red.
  function drawBullseye(x) {
    ['#e5484d', '#f2f2f2', '#e5484d', '#f2f2f2', '#e5484d'].forEach((col, i) => {
      x.beginPath();
      x.arc(128, 128, 128 * (1 - i * 0.2), 0, Math.PI * 2);
      x.fillStyle = col;
      x.fill();
    });
  }

  function bullseyeTexture(kind) {
    const [c, x] = canvas(256);
    drawBullseye(x);
    if (kind === 'coin') {
      const grad = x.createRadialGradient(110, 110, 4, 128, 128, 62);
      grad.addColorStop(0, '#f1d98a');
      grad.addColorStop(0.5, '#d4a72c');
      grad.addColorStop(1, '#9a7a22');
      x.beginPath();
      x.arc(128, 128, 62, 0, Math.PI * 2);
      x.fillStyle = grad;
      x.fill();
      x.lineWidth = 6;
      x.strokeStyle = '#fff';
      x.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  // Decoy: bullseye with the player's face in the middle. The face loads a moment later.
  function trickTexture(faceUrl) {
    const [c, x] = canvas(256);
    drawBullseye(x);
    const tex = new THREE.CanvasTexture(c);
    const img = new Image();
    img.onload = () => {
      x.save();
      x.beginPath();
      x.arc(128, 128, 74, 0, Math.PI * 2);
      x.fillStyle = '#d6d9de';
      x.fill();
      x.clip();
      x.drawImage(img, 54, 54, 148, 148);
      x.restore();
      x.beginPath();
      x.arc(128, 128, 74, 0, Math.PI * 2);
      x.lineWidth = 5;
      x.strokeStyle = '#e5484d';
      x.stroke();
      tex.needsUpdate = true;
    };
    img.src = faceUrl;
    return tex;
  }

  // A white blob with drips; tinted to the paint colour by its material.
  function splatTexture() {
    const [c, x] = canvas(128);
    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(64, 64, 30, 0, Math.PI * 2);
    x.fill();
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = rand(18, 44);
      x.beginPath();
      x.arc(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, rand(4, 13) * (1 - d / 70), 0, Math.PI * 2);
      x.fill();
    }
    return new THREE.CanvasTexture(c);
  }

  function skyTexture(top, bottom) {
    const [c, x] = canvas(4, 256);
    const grad = x.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    x.fillStyle = grad;
    x.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(c);
  }

  // Tiling canvas texture drawn by `draw(ctx, size)`, repeated `rep` times.
  function patternTexture(size, rep, draw) {
    const [c, x] = canvas(size);
    draw(x, size);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rep, rep);
    return tex;
  }

  function disposeTree(obj) {
    obj.traverse(o => {
      if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      [].concat(o.material || []).forEach(m => {
        // This three.js build has no Texture.userData, so guard the shared check.
        if (m.map && !(m.map.userData && m.map.userData.shared)) m.map.dispose();
        m.dispose();
      });
    });
  }

  // ---------- Worlds ----------

  const lambert = (color, more) => new THREE.MeshLambertMaterial(Object.assign({ color }, more));

  // One entry per world: sky colours, fog, lights, and a build() that adds scenery.
  const SCENES = [
    { // The Hot Sahara
      sky: ['#3a2a4a', '#f0a868'], fog: ['#d89868', 70, 330], light: ['#ffe2c0', '#6a4a30', 0.75, 0.55],
      build(k) {
        k.ground('#b98550');
        for (let i = 0; i < 20; i++) {
          const [x, z] = k.around(90, 280, 160);
          k.ball(1, '#c28a52', x, 0, z).scale.set(rand(25, 55), rand(5, 14), rand(20, 40));
        }
        [[-70, -250, 40], [-15, -290, 52], [65, -260, 34]].forEach(([x, z, s]) =>
          k.cyl(0, s, s * 0.9, '#c99a60', x, 0, z, 4).rotation.y = Math.PI / 4);
        for (let i = 0; i < 14; i++) {
          const [x, z] = k.around(12, 85, 150);
          const h = rand(2, 4.5);
          k.cyl(0.35, 0.42, h, '#4a7a3a', x, 0, z);
          const side = Math.random() < 0.5 ? -1 : 1;
          k.cyl(0.22, 0.22, 1, '#4a7a3a', x + side * 0.7, h * 0.45, z);
          k.box(0.9, 0.4, 0.4, '#4a7a3a', x + side * 0.4, h * 0.42, z);
        }
        for (let i = 0; i < 16; i++) {
          const [x, z] = k.around(10, 120, 160);
          k.rock(rand(0.4, 1.6), '#9a7250', x, z);
        }
        k.glow(new THREE.SphereGeometry(18, 24, 16), '#ffe0b0', 140, 55, -420);
      },
    },
    { // Underwater Adventures
      sky: ['#2a8ab0', '#06202e'], fog: ['#0e4a66', 15, 125], light: ['#a8e4f5', '#1a3a40', 1, 0.5], floating: true,
      build(k) {
        k.ground('#8a7550');
        for (let i = 0; i < 45; i++) {
          const [x, z] = k.around(8, 100, 160);
          const weed = k.cyl(0.1, 0.22, rand(3, 9), pick(['#2f7a4a', '#3d8f3a', '#2a6a55']), x, 0, z, 6);
          weed.rotation.z = rand(-0.2, 0.2);
          weed.userData.sway = rand(0.5, 1.5);
          k.movers.push(weed);
        }
        for (let i = 0; i < 22; i++) {
          const [x, z] = k.around(10, 110, 160);
          k.rock(rand(0.8, 4), '#5a5a64', x, z);
        }
        for (let i = 0; i < 18; i++) {
          const [x, z] = k.around(10, 90, 160);
          const col = pick(['#e0707a', '#f0a050', '#b060c0', '#f07aa0']);
          if (Math.random() < 0.5) k.cyl(0, rand(0.6, 1.2), rand(1, 2.5), col, x, 0, z, 7);
          else k.ball(rand(0.5, 1.1), col, x, 0.3, z);
        }
        const bubbleMat = new THREE.MeshBasicMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.45 });
        for (let i = 0; i < 70; i++) {
          const [x, z] = k.around(5, 80, 160);
          const b = new THREE.Mesh(v.geo.ball, bubbleMat);
          b.scale.setScalar(rand(0.05, 0.2));
          b.position.set(x, rand(0, 30), z);
          b.userData.rise = rand(1, 3);
          k.deco.add(b);
          k.movers.push(b);
        }
      },
    },
    { // Computer Crazies: an office IT room
      sky: ['#20252d', '#20252d'], fog: ['#2a3140', 60, 220], light: ['#ffffff', '#56606e', 1, 0.5],
      build(k) {
        k.ground('#3b4552', patternTexture(64, 500, (x, s) => {
          x.fillStyle = '#3b4552'; x.fillRect(0, 0, s, s);
          x.fillStyle = '#333c48'; x.fillRect(0, 0, s / 2, s / 2); x.fillRect(s / 2, s / 2, s / 2, s / 2);
        }));
        const wall = '#a9b7c4';
        k.box(1, 22, 120, wall, -46, 0, -40);
        k.box(1, 22, 120, wall, 46, 0, -40);
        k.box(92, 22, 1, wall, 0, 0, -98);
        k.box(92, 22, 1, wall, 0, 0, 18);
        k.box(92, 1, 120, '#e8ecf0', 0, 22, -40);
        for (let z = -90; z <= 10; z += 16) for (let x = -30; x <= 30; x += 20) {
          k.glow(new THREE.BoxGeometry(10, 0.2, 3), '#f2f7ff', x, 21.9, z);
        }
        // Whiteboard with scribbles
        k.box(34, 14, 0.3, '#8e98a4', -8, 5, -97.4);
        k.box(33, 13, 0.3, '#f7f9fb', -8, 5.5, -97.1);
        [['#d33a3a', 18, 16], ['#2a6fb8', 24, 14], ['#2e9b5a', 14, 12]].forEach(([c, w, y]) =>
          k.box(w, 0.4, 0.2, c, -8 - (26 - w) / 2, y, -96.8));
        // Server racks with blinking lights down the right wall
        for (let z = -85; z <= -25; z += 6) {
          k.box(3, 9, 4, '#232a34', 43, 0, z);
          for (let y = 1; y < 8.5; y += 0.7) {
            const led = k.glow(new THREE.BoxGeometry(0.1, 0.12, 0.3), pick(['#4dff94', '#ffb84d', '#4dff94']), 41.45, y, z + rand(-1.2, 1.2));
            led.userData.blink = rand(0.5, 3);
            k.movers.push(led);
          }
        }
        // Rows of desks with glowing monitors
        for (let z = -24; z >= -76; z -= 26) for (let x = -34; x <= 26; x += 15) {
          k.box(7, 0.15, 3, '#9a7650', x, 1, z);
          [[-3.2, -1.3], [3.2, -1.3], [-3.2, 1.3], [3.2, 1.3]].forEach(([dx, dz]) => k.box(0.15, 1, 0.15, '#624a33', x + dx, 0, z + dz));
          [-1.6, 1.6].forEach(dx => {
            k.box(0.3, 0.5, 0.3, '#2a313c', x + dx, 1.15, z - 0.8);
            k.box(2.6, 1.6, 0.15, '#1b2028', x + dx, 1.5, z - 0.8);
            k.glow(new THREE.PlaneGeometry(2.3, 1.3), pick(['#4a9eff', '#3dd68c', '#9fc7ff']), x + dx, 2.3, z - 0.71);
          });
        }
      },
    },
    { // Astronomy Adventure: the moon, with a ringed planet in the sky
      sky: ['#05060d', '#110d24'], fog: ['#05060d', 160, 520], light: ['#c8d0ff', '#303040', 0.8, 0.6], floating: true,
      build(k) {
        k.ground('#5d5a66');
        for (let i = 0; i < 30; i++) {
          const [x, z] = k.around(25, 160, 160);
          const r = rand(2, 9);
          const pit = new THREE.Mesh(new THREE.CircleGeometry(r, 24), lambert('#46434e'));
          pit.rotation.x = -Math.PI / 2;
          pit.position.set(x, 0.02, z);
          k.deco.add(pit);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.12, 6, 28), lambert('#6d6a76'));
          rim.rotation.x = -Math.PI / 2;
          rim.scale.z = 0.25; // low, flat rims
          rim.position.set(x, 0, z);
          k.solid.add(rim);
        }
        for (let i = 0; i < 18; i++) {
          const [x, z] = k.around(10, 140, 160);
          k.rock(rand(0.4, 2), '#77737f', x, z);
        }
        const stars = [];
        for (let i = 0; i < 1800; i++) {
          const a = Math.random() * Math.PI * 2, y = rand(0.02, 1);
          const r = Math.sqrt(1 - y * y) * 600;
          stars.push(Math.cos(a) * r, y * 600, Math.sin(a) * r);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
        k.deco.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, fog: false })));
        const planet = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 24), lambert('#c98a5a', { fog: false }));
        planet.position.set(-130, 110, -420);
        const ring = new THREE.Mesh(new THREE.RingGeometry(55, 82, 64), lambert('#d9b88a', { fog: false, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }));
        ring.rotation.set(-1.2, 0.3, 0);
        ring.position.copy(planet.position);
        k.deco.add(ring);
        k.deco.add(planet);
        const earth = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), lambert('#3a7bd5', { fog: false }));
        earth.position.set(170, 150, -380);
        k.deco.add(earth);
      },
    },
    { // Football Fans: a floodlit stadium at night
      sky: ['#070a14', '#1a2440'], fog: ['#101830', 100, 320], light: ['#ffffff', '#2a4a2a', 1, 0.7],
      build(k) {
        k.ground('#2f8c3c', patternTexture(64, 60, (x, s) => {
          x.fillStyle = '#2f8c3c'; x.fillRect(0, 0, s, s);
          x.fillStyle = '#277b33'; x.fillRect(0, 0, s / 2, s);
        }));
        const line = (w, d, x, z) => k.flat(new THREE.PlaneGeometry(w, d), '#f2f2f2', x, z);
        line(90, 0.3, 0, -50);          // halfway line
        line(0.3, 110, -45, -50);       // touchlines
        line(0.3, 110, 45, -50);
        line(90, 0.3, 0, -105);         // goal line
        line(40, 0.3, 0, -88);          // penalty box
        line(0.3, 17, -20, -96.5);
        line(0.3, 17, 20, -96.5);
        k.flat(new THREE.RingGeometry(9, 9.3, 48), '#f2f2f2', 0, -50);
        // Goal
        [-3.7, 3.7].forEach(x => k.cyl(0.08, 0.08, 2.44, '#ffffff', x, 0, -105));
        k.box(7.6, 0.16, 0.16, '#ffffff', 0, 2.36, -105);
        const net = new THREE.Mesh(new THREE.BoxGeometry(7.4, 2.4, 2.2, 14, 6, 5), new THREE.MeshBasicMaterial({ color: '#dddddd', wireframe: true }));
        net.position.set(0, 1.2, -106.2);
        k.deco.add(net);
        // Stands: stepped blocks of red and white seats full of fans
        const crowd = patternTexture(64, 1, (x, s) => {
          x.fillStyle = '#a3141c'; x.fillRect(0, 0, s, s);
          for (let i = 0; i < 160; i++) {
            x.fillStyle = pick(['#f2f2f2', '#f0c8a8', '#8a5a3a', '#ffe14d', '#d8141e', '#1f2a5c']);
            x.fillRect(Math.random() * s, Math.random() * s, 2, 2);
          }
        });
        crowd.repeat.set(12, 1);
        const crowdMat = lambert('#ffffff', { map: crowd });
        const stand = (w, d, x, z, rotY) => {
          for (let i = 0; i < 6; i++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(w, 3, d), i % 3 === 2 ? lambert('#f2f2f2') : crowdMat);
            step.position.set(0, 1.5 + i * 3, -i * d);
            const holder = new THREE.Group();
            holder.position.set(x, 0, z);
            holder.rotation.y = rotY;
            holder.add(step);
            k.solid.add(holder);
          }
        };
        stand(170, 5, 0, -125, 0);
        stand(170, 5, -68, -40, Math.PI / 2);
        stand(170, 5, 68, -40, -Math.PI / 2);
        // Floodlights
        [[-85, -135], [85, -135], [-85, 20], [85, 20]].forEach(([x, z]) => {
          k.cyl(0.6, 0.9, 45, '#8a8f98', x, 0, z);
          const lamp = k.glow(new THREE.BoxGeometry(10, 5, 1), '#ffffe8', x, 46, z);
          lamp.lookAt(0, 0, -50);
        });
      },
    },
  ];

  function buildWorld(n) {
    if (v.world) {
      v.scene.remove(v.world);
      disposeTree(v.world);
    }
    clearSplats();
    const S = SCENES[n];
    const world = new THREE.Group();
    const solid = new THREE.Group(); // things paintballs splat on
    const deco = new THREE.Group();  // things they fly through
    world.add(solid, deco);
    v.world = world;
    v.solid = solid;
    v.movers = [];
    v.floating = !!S.floating;

    const add = (parent, geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    };
    const k = {
      solid, deco, movers: v.movers,
      // y is the bottom of the shape, so things sit on the ground at y = 0.
      box: (w, h, d, c, x, y, z) => add(solid, new THREE.BoxGeometry(w, h, d), lambert(c), x, y + h / 2, z),
      cyl: (r1, r2, h, c, x, y, z, seg) => add(solid, new THREE.CylinderGeometry(r1, r2, h, seg || 12), lambert(c), x, y + h / 2, z),
      ball: (r, c, x, y, z) => add(solid, new THREE.SphereGeometry(r, 18, 12), lambert(c), x, y, z),
      rock: (r, c, x, z) => {
        const m = add(solid, new THREE.DodecahedronGeometry(r), lambert(c, { flatShading: true }), x, r * 0.4, z);
        m.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
        return m;
      },
      glow: (geo, c, x, y, z) => add(deco, geo, new THREE.MeshBasicMaterial({ color: c, fog: false }), x, y, z),
      flat: (geo, c, x, z) => {
        const m = add(deco, geo, new THREE.MeshBasicMaterial({ color: c }), x, 0.02, z);
        m.rotation.x = -Math.PI / 2;
        return m;
      },
      ground: (c, map) => {
        const m = add(solid, new THREE.PlaneGeometry(1600, 1600), lambert(map ? '#ffffff' : c, { map: map || null }), 0, 0, 0);
        m.rotation.x = -Math.PI / 2;
      },
      // A random spot within `spread` degrees of straight ahead, between `near` and `far` metres away.
      around: (near, far, spread) => {
        const yaw = rand(-spread, spread) * DEG, d = rand(near, far);
        return [-Math.sin(yaw) * d, -Math.cos(yaw) * d];
      },
    };
    S.build(k);

    if (v.scene.background) v.scene.background.dispose();
    v.scene.background = skyTexture(S.sky[0], S.sky[1]);
    v.scene.fog = new THREE.Fog(S.fog[0], S.fog[1], S.fog[2]);
    v.hemi.color.set(S.light[0]);
    v.hemi.groundColor.set(S.light[1]);
    v.hemi.intensity = S.light[2];
    v.sun.intensity = S.light[3];
    v.scene.add(world);
  }

  function clearSplats() {
    v.splats.children.slice().forEach(m => v.splats.remove(m));
  }

  // ---------- The gun ----------

  function buildGun() {
    v.gunHolder.children.slice().forEach(c => { v.gunHolder.remove(c); disposeTree(c); });
    const gun = g.gun, p = g.paint;
    const shiny = color => new THREE.MeshPhongMaterial({ color, shininess: gun.metal ? 110 : 30, specular: gun.metal ? '#ffffff' : '#333333' });
    const body = shiny(gun.body), trim = shiny(gun.trim), dark = shiny('#1f2227');
    const grp = new THREE.Group();
    const part = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      grp.add(m);
      return m;
    };
    const L = gun.barrel;
    part(new THREE.BoxGeometry(0.09, 0.12, 0.42), body, 0, 0, 0);
    part(new THREE.CylinderGeometry(0.022, 0.022, L, 12).rotateX(Math.PI / 2), trim, 0, 0.02, -0.21 - L / 2);
    const muzzle = part(new THREE.CylinderGeometry(0.034, 0.034, 0.06, 12).rotateX(Math.PI / 2), body, 0, 0.02, -0.21 - L);
    part(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 14).rotateX(Math.PI / 2), dark, 0, 0.11, -0.12);
    part(new THREE.BoxGeometry(0.02, 0.05, 0.02), dark, 0, 0.07, -0.2);
    part(new THREE.BoxGeometry(0.02, 0.05, 0.02), dark, 0, 0.07, -0.04);
    // Hopper: see-through, full of paint
    const hopper = part(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshPhongMaterial({ color: p.color, transparent: true, opacity: 0.75, shininess: 90 }), 0, 0.1, 0.13);
    hopper.scale.set(1, 1.1, 1.3);
    part(new THREE.BoxGeometry(0.06, 0.16, 0.07), trim, 0, -0.12, 0.08).rotation.x = 0.3;
    part(new THREE.BoxGeometry(0.07, 0.11, 0.26), trim, 0, -0.02, 0.33);
    grp.position.set(0.24, -0.26, -0.72);
    grp.rotation.y = -0.04;
    grp.scale.setScalar(0.75);
    v.gunHolder.add(grp);
    v.gun = grp;
    v.muzzle = muzzle;
  }

  // ---------- Game flow ----------

  BB.startGame = function (world) {
    stop();
    if (!initView()) {
      BB.modal({
        title: '3D not available',
        body: '<p>This game needs a browser with 3D graphics (WebGL) turned on.</p>',
        buttons: [{ label: 'OK', primary: true, action: () => BB.goHome() }],
      });
      return;
    }
    const diff = BB.state.difficulty;
    const a = BB.state.avatar;
    const paint = BB.findItem('paint', a.paint) || BB.ITEMS.paint[0];
    g = {
      world,
      diff,
      score: 0,
      goal: BB.goalFor(world, diff),
      targets: [],
      dying: [],
      balls: [],
      bits: [],
      spawnIn: 1400,
      running: true,
      paused: false,
      last: performance.now(),
      raf: 0,
      gun: BB.findItem('gun', a.gun) || BB.ITEMS.gun[0],
      paint,
      paintMat: new THREE.MeshPhongMaterial({ color: paint.color, shininess: paint.metal ? 120 : 60, specular: paint.metal ? '#ffffff' : '#444444' }),
      splatMat: new THREE.MeshBasicMaterial({ map: v.tex.splat, color: paint.color, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }),
      yaw: 0,
      pitch: 0,
      scoped: false,
      fov: FOV,
      cooldown: 0,
      recoil: 0,
      time: 0,
    };
    if (v.tex.trick) v.tex.trick.dispose();
    v.tex.trick = trickTexture(BB.avatarDataUrl(a));
    screen.dataset.world = world + 1;
    BB.showScreen('game');
    buildWorld(world);
    buildGun();
    updateHud();
    intro();
    updateHint();
    g.raf = requestAnimationFrame(frame);
  };

  BB.pauseGame = function () {
    if (!g || !g.running || g.paused) return;
    g.paused = true;
    setScope(false);
    exitLock();
    updateHint();
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
    if (!g) return;
    g.paused = false;
    g.last = performance.now();
    updateHint();
  }

  function stop() {
    if (g) {
      cancelAnimationFrame(g.raf);
      g.targets.concat(g.dying).forEach(t => { v.scene.remove(t.mesh); t.mats.forEach(m => m.dispose()); });
      g.balls.concat(g.bits).forEach(b => v.scene.remove(b.mesh));
      g.paintMat.dispose();
      g.splatMat.dispose();
    }
    g = null;
    fx.innerHTML = '';
    screen.classList.remove('scoped');
    hint.hidden = true;
    exitLock();
  }

  function intro() {
    const w = BB.WORLDS[g.world];
    const el = document.createElement('div');
    el.className = 'world-intro';
    el.innerHTML = `<small>World ${g.world + 1}</small><b>${w.name}</b><span>Target: ${g.goal} points</span>`;
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1900);
  }

  function frame(now) {
    if (!g) return;
    const dt = Math.min(50, now - g.last);
    g.last = now;
    if (g.running && !g.paused) update(dt);
    if (!g) return; // the run may have just ended
    render(dt / 1000);
    g.raf = requestAnimationFrame(frame);
  }

  function update(dt) {
    const c = config();
    const s = dt / 1000;
    g.time += s;
    g.cooldown = Math.max(0, g.cooldown - s);
    g.recoil = Math.max(0, g.recoil - s * 6);

    g.spawnIn -= dt;
    if (g.spawnIn <= 0) {
      if (g.targets.length < c.max) spawn(c);
      g.spawnIn = c.spawn * rand(0.7, 1.3);
    }

    for (const t of g.targets.slice()) {
      t.age += dt;
      if (t.age >= t.life) { remove(t, 'gone'); continue; }
      // Pop up, then shrink and fade during the last 1.5 seconds of its life.
      const pop = Math.min(1, t.age / 200);
      const left = t.life - t.age;
      const fade = left < 1500 ? left / 1500 : 1;
      t.disc.scale.setScalar(t.r * pop * (0.55 + 0.45 * fade));
      t.mats.forEach(m => { m.opacity = 0.3 + 0.7 * fade; });
      if (t.ring) t.ring.rotation.z += s * 2;
      if (v.floating) t.mesh.position.y = t.y + Math.sin(t.age / 600 + t.phase) * 0.25;
    }

    for (const t of g.dying.slice()) {
      t.dieAge += s;
      const k = Math.min(1, t.dieAge / 0.4);
      if (t.how === 'popped') t.mesh.rotation.x = -k * Math.PI / 2; // knocked over backwards
      else t.disc.scale.setScalar(t.dieScale * (1 - k));
      t.mats.forEach(m => { m.opacity = t.dieOpacity * (1 - k); });
      if (k >= 1) {
        g.dying.splice(g.dying.indexOf(t), 1);
        v.scene.remove(t.mesh);
        t.mats.forEach(m => m.dispose());
      }
    }

    for (const b of g.balls.slice()) {
      b.t += s;
      const k = Math.min(1, b.t / b.dur);
      b.mesh.position.lerpVectors(b.from, b.to, k);
      b.mesh.position.y += Math.sin(k * Math.PI) * b.dist * 0.006; // a slight arc
      if (k >= 1) landed(b);
      if (!g) return; // hitting a decoy at 0 points ends the run
    }

    for (const b of g.bits.slice()) {
      b.life -= s;
      b.vel.y -= 9.8 * s;
      b.mesh.position.addScaledVector(b.vel, s);
      if (b.life <= 0) {
        g.bits.splice(g.bits.indexOf(b), 1);
        v.scene.remove(b.mesh);
      }
    }

    v.movers.forEach(m => {
      const u = m.userData;
      if (u.rise) { m.position.y += u.rise * s; if (m.position.y > 30) m.position.y = 0; }
      if (u.sway) m.rotation.z = Math.sin(g.time * u.sway) * 0.15;
      if (u.blink) m.visible = Math.sin(g.time * u.blink * 4) > -0.3;
    });
  }

  function render(s) {
    resize();
    const cam = v.camera;
    // The scope zooms in smoothly.
    const want = g.scoped ? FOV / g.gun.zoom : FOV;
    g.fov += (want - g.fov) * Math.min(1, s * 14);
    if (Math.abs(cam.fov - g.fov) > 0.01) {
      cam.fov = g.fov;
      cam.updateProjectionMatrix();
    }
    cam.rotation.set(g.pitch + g.recoil * 0.015, g.yaw, 0);
    v.gunHolder.visible = g.fov > FOV * 0.75;
    const bob = g.paused ? 0 : Math.sin(g.time * 2) * 0.004;
    v.gun.position.set(v.gunX, -0.26 + bob - g.recoil * 0.01, -0.72 + g.recoil * 0.07);
    v.gun.rotation.x = g.recoil * 0.12;
    v.renderer.render(v.scene, cam);
  }

  function resize() {
    const w = arena.clientWidth, h = arena.clientHeight;
    if (!w || !h || (w === v.size[0] && h === v.size[1])) return;
    v.size = [w, h];
    v.renderer.setSize(w, h, false);
    v.camera.aspect = w / h;
    v.gunX = clamp(0.1 + 0.08 * w / h, 0.14, 0.24); // keep the gun on screen on tall phones
    v.camera.updateProjectionMatrix();
  }

  // ---------- Targets ----------

  function spawn(c) {
    let yaw, tries = 0;
    do {
      yaw = rand(-SPREAD, SPREAD);
      tries++;
    } while (tries < 15 && g.targets.some(o => Math.abs(o.yaw - yaw) < 0.08));
    const dist = rand(c.near, c.far);
    const r = rand(c.size[0], c.size[1]) / 100 * (0.6 + dist / 60);
    const x = -Math.sin(yaw) * dist, z = -Math.cos(yaw) * dist;
    const y = v.floating ? rand(1.5, 10) : rand(0.4, 2.8) + r;

    const t = {
      yaw, r, y,
      trick: Math.random() < c.trick,
      age: 0,
      life: rand(c.life[0], c.life[1]),
      phase: rand(0, 6),
    };
    t.coin = !t.trick && Math.random() < BB.COIN_CHANCE;

    const faceMat = lambert('#ffffff', { map: t.trick ? v.tex.trick : t.coin ? v.tex.coin : v.tex.target, transparent: true });
    const sideMat = lambert('#d9d9d9', { transparent: true });
    t.mats = [faceMat, sideMat];

    const mesh = new THREE.Group();
    mesh.position.set(x, y, z);
    mesh.rotation.y = yaw; // face the player
    const disc = new THREE.Group();
    [[v.geo.face, faceMat], [v.geo.back, sideMat], [v.geo.rim, sideMat]].forEach(([geo, mat]) => {
      const m = new THREE.Mesh(geo, mat);
      m.userData.target = t;
      disc.add(m);
    });
    if (t.coin) {
      const ringMat = new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true });
      t.ring = new THREE.Mesh(v.geo.ring, ringMat);
      t.ring.raycast = () => {};
      disc.add(t.ring);
      t.mats.push(ringMat);
    }
    disc.scale.setScalar(0.01);
    mesh.add(disc);
    if (!v.floating) {
      const post = new THREE.Mesh(v.geo.post, lambert('#6b5a45', { transparent: true }));
      post.position.y = -y;
      post.scale.y = Math.max(0.01, y - r);
      post.raycast = () => {}; // paintballs only count on the bullseye
      mesh.add(post);
      t.mats.push(post.material);
    }
    t.mesh = mesh;
    t.disc = disc;
    v.scene.add(mesh);
    g.targets.push(t);
  }

  function remove(t, how) {
    t.dead = true;
    g.targets.splice(g.targets.indexOf(t), 1);
    t.how = how;
    t.dieAge = 0;
    t.dieScale = t.disc.scale.x;
    t.dieOpacity = t.mats[0].opacity;
    g.dying.push(t);
  }

  // ---------- Shooting ----------

  const CENTER = { x: 0, y: 0 };

  function fire() {
    if (!g || !g.running || g.paused || g.cooldown > 0) return;
    g.cooldown = 1 / g.gun.rate;
    g.recoil = 1;
    BB.sfx.shoot();

    const cam = v.camera;
    cam.updateMatrixWorld();
    v.raycaster.setFromCamera(CENTER, cam);
    const hits = v.raycaster.intersectObjects(g.targets.map(t => t.disc).concat(v.solid), true);
    const hit = hits[0];
    const from = new THREE.Vector3();
    if (g.scoped) cam.localToWorld(from.set(0.05, -0.12, -0.3));
    else v.muzzle.getWorldPosition(from);
    const to = hit ? hit.point.clone() : v.raycaster.ray.at(300, new THREE.Vector3());

    const mesh = new THREE.Mesh(v.geo.ball, g.paintMat);
    mesh.scale.setScalar(0.06);
    mesh.position.copy(from);
    v.scene.add(mesh);
    const dist = from.distanceTo(to);
    g.balls.push({ mesh, from, to, dist, t: 0, dur: dist / g.gun.speed, hit, target: hit && hit.object.userData.target });
  }

  function landed(b) {
    g.balls.splice(g.balls.indexOf(b), 1);
    v.scene.remove(b.mesh);
    if (!b.hit) return; // flew off into the sky
    const normal = b.hit.face
      ? b.hit.face.normal.clone().transformDirection(b.hit.object.matrixWorld)
      : new THREE.Vector3(0, 1, 0);
    burst(b.to, normal);
    if (b.target) {
      if (!b.target.dead) {
        splatOn(b.target, b.to);
        hit(b.target, b.to);
      }
      return;
    }
    BB.sfx.splat();
    const m = new THREE.Mesh(v.geo.splat, g.splatMat);
    m.position.copy(b.to).addScaledVector(normal, 0.02);
    m.lookAt(m.position.clone().add(normal));
    m.rotateZ(rand(0, Math.PI * 2));
    m.scale.setScalar(rand(0.5, 0.9));
    v.splats.add(m);
    if (v.splats.children.length > MAX_SPLATS) v.splats.remove(v.splats.children[0]);
  }

  // Paint on the bullseye itself, so you can see it as it falls over.
  function splatOn(t, point) {
    const local = t.disc.worldToLocal(point.clone());
    const m = new THREE.Mesh(v.geo.splat, g.splatMat);
    m.position.set(local.x, local.y, 0.07);
    m.scale.setScalar(0.9);
    m.rotation.z = rand(0, Math.PI * 2);
    t.disc.add(m);
  }

  // Droplets of paint flying off where the ball landed.
  function burst(point, normal) {
    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(v.geo.ball, g.paintMat);
      mesh.scale.setScalar(rand(0.03, 0.07));
      mesh.position.copy(point);
      const vel = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(1.5, 4));
      vel.addScaledVector(normal, 2.5);
      v.scene.add(mesh);
      g.bits.push({ mesh, vel, life: rand(0.4, 0.7) });
    }
  }

  function hit(t, point) {
    if (!g || !g.running || t.dead) return;
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
      floatText(point, '-1', 'bad');
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
      floatText(point, '+' + pts, t.coin ? 'gold' : 'good');
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
    setScope(false);
    exitLock();
    updateHint();
    const world = g.world, diff = g.diff;
    const reward = BB.rewardFor(world, diff);
    const last = world === BB.WORLDS.length - 1;
    const unlocksAll = last && diff === 'impossible' && !BB.state.beaten.impossible;
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
        body: `<p>You cleared all 5 worlds on <b>${diffLabel}</b>.</p>${unlocksAll ? '<p>Every world on every difficulty is now unlocked!</p>' : ''}<p class="reward">+${reward.toLocaleString()} coins</p>`,
        buttons: [
          { label: 'Home', primary: true, action: () => { stop(); BB.goHome(); } },
          { label: 'Play again', action: () => BB.startGame(world) },
        ],
        dismissable: false,
      });
    } else {
      BB.modal({
        title: `World ${world + 1} cleared`,
        body: `<p>Next up: <b>World ${world + 2}: ${BB.WORLDS[world + 1].name}</b><br>Your score starts again from 0.</p><p class="reward">+${reward} coins</p>`,
        buttons: [
          { label: 'Next world', primary: true, action: () => BB.startGame(world + 1) },
          { label: 'Play again', action: () => BB.startGame(world) },
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

  function floatText(point, text, cls) {
    const p = point.clone().project(v.camera);
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.textContent = text;
    el.style.left = ((p.x + 1) / 2) * arena.clientWidth + 'px';
    el.style.top = ((1 - p.y) / 2) * arena.clientHeight + 'px';
    fx.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  // ---------- Aiming ----------

  function setScope(on) {
    if (!g) return;
    g.scoped = on;
    screen.classList.toggle('scoped', on);
  }

  BB.toggleScope = function () {
    if (g && g.running && !g.paused) setScope(!g.scoped);
  };

  // Turn by a number of pixels. Zoomed in, the same movement turns less.
  function look(dx, dy, perPixel) {
    const k = perPixel * (g.fov / FOV);
    g.yaw = clamp(g.yaw - dx * k, -MAX_YAW, MAX_YAW);
    g.pitch = clamp(g.pitch - dy * k, MIN_PITCH, MAX_PITCH);
  }

  const playing = () => g && g.running && !g.paused;

  function updateHint() {
    const show = canLock && !locked && g && g.running && !g.paused;
    hint.hidden = !show;
    if (show) hint.innerHTML = '<b>Click to aim</b><span>Mouse to aim · Click to shoot · Right-click or Space to scope · Esc to pause</span>';
  }

  function requestLock() {
    try {
      const p = arena.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* not allowed here */ }
  }

  function exitLock() {
    if (document.pointerLockElement === arena) document.exitPointerLock();
  }

  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === arena;
    everLocked = everLocked || locked;
    if (!locked) {
      if (g) setScope(false);
      BB.pauseGame(); // Esc leaves the lock, so treat it like pause
    }
    updateHint();
  });
  // If the browser won't lock the mouse (e.g. inside a frame), drag to aim instead.
  document.addEventListener('pointerlockerror', () => {
    if (everLocked) return;
    canLock = false;
    screen.classList.add('touch');
    updateHint();
  });

  document.addEventListener('mousemove', e => {
    if (locked && playing()) look(e.movementX, e.movementY, 0.0022);
  });

  let drag = null;
  arena.addEventListener('pointerdown', e => {
    if (!playing() || e.target.closest('.touch-btn')) return;
    e.preventDefault();
    if (e.pointerType === 'mouse' && canLock) {
      if (!locked) return requestLock();
      if (e.button === 0) fire();
      if (e.button === 2) setScope(true);
      return;
    }
    // Drag to aim; a quick tap shoots.
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, at: performance.now() };
  });
  arena.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id || !playing()) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    look(dx, dy, 0.005);
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (e.type === 'pointerup' && drag.moved < 10 && performance.now() - drag.at < 300) fire();
    drag = null;
  };
  arena.addEventListener('pointerup', endDrag);
  arena.addEventListener('pointercancel', endDrag);
  arena.addEventListener('mouseup', e => { if (locked && e.button === 2) setScope(false); });
  arena.addEventListener('contextmenu', e => e.preventDefault());

  const touchBtn = (id, action) => document.getElementById(id).addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    if (playing()) action();
  });
  touchBtn('btn-fire', fire);
  touchBtn('btn-scope', () => setScope(!g.scoped));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) BB.pauseGame();
  });
})();
