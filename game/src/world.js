// Turkey Run — world: the run's rules. One state object, stepped in fixed
// time slices: title, play, caught, escaped, paused.

const World = (function buildWorld() {
  // Obstacle shapes: width, height, whether to jump or duck, how they look.
  const OBSTACLE_KINDS = {
    hay: { w: 74, h: 64, dodge: 'jump', label: 'hay bale' },
    oven: { w: 120, h: 110, dodge: 'jump', label: 'brick oven' },
    knifeSpin: { w: 60, h: 44, dodge: 'jump', label: 'spinning knife' },
    knifeFly: { w: 86, h: 26, dodge: 'duck', label: 'flying knife' },
  };

  let rng = makeRandom(1);
  let state = null;

  function freshState(seed) {
    rng = makeRandom(seed);
    return {
      phase: 'title', // title | play | caught | escaped | paused
      phaseBeforePause: 'play',
      seed,
      time: 0,
      distance: 0,
      score: 0,
      lives: CONFIG.maxLives,
      speed: CONFIG.speedStart,
      farmerGap: CONFIG.farmerGapStart,
      spawnIn: 1.1,
      turkey: {
        x: CONFIG.turkeyX,
        y: CONFIG.groundY,
        vy: 0,
        grounded: true,
        ducking: false,
        runPhase: 0,
        stumbleTimer: 0,
        invulnerableTimer: 0,
      },
      farmer: { runPhase: 0, puffTimer: 0 },
      obstacles: [],
      pickups: [],
      particles: [],
      clouds: [],
      toast: '',
      toastTimer: 0,
      best: loadBest(),
      runCount: 0,
    };
  }

  function loadBest() {
    try {
      return Number(window.localStorage.getItem('turkey-run-best') || 0) || 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(metres) {
    try {
      window.localStorage.setItem('turkey-run-best', String(metres));
    } catch (e) {
      /* storage is a nicety, never a failure */
    }
  }

  function startRun(seed) {
    const best = state ? state.best : loadBest();
    const runs = state ? state.runCount + 1 : 1;
    state = freshState(seed === undefined ? (Date.now() % 2147483647) : seed);
    state.best = best;
    state.runCount = runs;
    state.phase = 'play';
    seedClouds();
    AudioFX.unlock();
  }

  function seedClouds() {
    state.clouds = [];
    for (let i = 0; i < 6; i++) {
      state.clouds.push({
        x: rng.range(0, CONFIG.width),
        y: rng.range(40, 200),
        s: rng.range(0.6, 1.4),
        v: rng.range(6, 16),
      });
    }
  }

  function toTitle() {
    const best = state ? state.best : loadBest();
    state = freshState((Date.now() % 2147483647) + 1);
    state.best = best;
    state.phase = 'title';
    seedClouds();
  }

  function endRun(escaped) {
    state.phase = escaped ? 'escaped' : 'caught';
    const metres = Math.floor(state.distance);
    if (metres > state.best) {
      state.best = metres;
      saveBest(metres);
    }
    if (escaped) AudioFX.fanfare();
    else AudioFX.caught();
  }

  // -- spawning -------------------------------------------------------------

  function spawnObstacle() {
    const kinds = ['hay', 'hay', 'oven', 'knifeSpin', 'knifeFly'];
    const kind = rng.pick(kinds);
    const def = OBSTACLE_KINDS[kind];
    const x = CONFIG.width + 80;
    if (kind === 'knifeFly') {
      // Flies at head height: the turkey ducks under it.
      state.obstacles.push({
        kind, x, y: CONFIG.groundY - 132, w: def.w, h: def.h,
        spin: rng.range(0, 6.28), passed: false,
      });
    } else {
      state.obstacles.push({
        kind, x, y: CONFIG.groundY - def.h, w: def.w, h: def.h,
        spin: rng.range(0, 6.28), passed: false,
      });
    }
    // Sometimes a corn cob rides just past the obstacle as a reward.
    if (rng.chance(0.55)) {
      const arc = kind === 'knifeFly' ? CONFIG.groundY - 46 : CONFIG.groundY - 190;
      state.pickups.push({
        kind: 'corn', x: x + def.w + 70, y: arc, r: 16, taken: false,
      });
    }
  }

  function spawnPickupRow() {
    const y = rng.pick([CONFIG.groundY - 46, CONFIG.groundY - 130, CONFIG.groundY - 200]);
    for (let i = 0; i < 3; i++) {
      state.pickups.push({
        kind: rng.chance(0.12) ? 'feather' : 'corn',
        x: CONFIG.width + 60 + i * 56, y, r: 16, taken: false,
      });
    }
  }

  // -- particles ------------------------------------------------------------

  function burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x, y,
        vx: rng.range(-speed, speed),
        vy: rng.range(-speed * 1.2, -speed * 0.2),
        life: rng.range(0.4, 0.9),
        maxLife: 0.9,
        size: rng.range(3, 7),
        color,
      });
    }
  }

  // -- the step -------------------------------------------------------------

  function turkeyBox() {
    const t = state.turkey;
    const h = t.ducking ? 52 : 84;
    const w = 78;
    return { x: t.x - w / 2 + 6, y: t.y - h, w: w - 12, h };
  }

  function hit(a, b, shrink) {
    const s = shrink || 0;
    return (
      a.x + s < b.x + b.w - s &&
      a.x + a.w - s > b.x + s &&
      a.y + s < b.y + b.h - s &&
      a.y + a.h - s > b.y + s
    );
  }

  function stumble(obstacle) {
    const t = state.turkey;
    if (t.invulnerableTimer > 0) return;
    state.lives -= 1;
    t.stumbleTimer = 0.55;
    t.invulnerableTimer = 1.4;
    state.farmerGap = Math.max(
      CONFIG.farmerCatchGap,
      state.farmerGap - CONFIG.farmerGainOnStumble,
    );
    state.toast = obstacle ? 'OUCH! The farmer gains on you!' : 'The farmer is closing in!';
    state.toastTimer = 1.6;
    burst(t.x, t.y - 50, '#fff3dc', 14, 160);
    AudioFX.thud();
    if (state.lives <= 0 || state.farmerGap <= CONFIG.farmerCatchGap) {
      endRun(false);
    }
  }

  function stepPlay(dt) {
    const t = state.turkey;
    state.time += dt;

    // Speed grows with distance, and so does the score.
    state.speed = Math.min(
      CONFIG.speedMax,
      CONFIG.speedStart + state.distance * CONFIG.speedPerMetre,
    );
    const metres = (state.speed * dt) / CONFIG.pxPerMetre;
    state.distance += metres;
    state.score += metres * CONFIG.pointsPerMetre;

    // The turkey: gravity, jump, duck, run cycle.
    t.vy += CONFIG.gravity * dt;
    t.y += t.vy * dt;
    if (t.y >= CONFIG.groundY) {
      t.y = CONFIG.groundY;
      t.vy = 0;
      t.grounded = true;
    } else {
      t.grounded = false;
    }
    t.ducking = Input.duckHeld() && t.grounded;
    t.runPhase += dt * (state.speed / 34);
    if (t.stumbleTimer > 0) t.stumbleTimer -= dt;
    if (t.invulnerableTimer > 0) t.invulnerableTimer -= dt;

    // The farmer: gains on every stumble, slowly falls back while clean.
    state.farmer.runPhase += dt * (state.speed / 30);
    if (t.stumbleTimer <= 0 && state.farmerGap < CONFIG.farmerGapStart) {
      state.farmerGap = Math.min(
        CONFIG.farmerGapStart,
        state.farmerGap + CONFIG.farmerRecoveryPerSecond * dt,
      );
    }
    if (state.farmerGap <= CONFIG.farmerCatchGap) {
      endRun(false);
      return;
    }

    // Spawning.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      if (rng.chance(0.72)) spawnObstacle();
      else spawnPickupRow();
      const pressure = Math.min(0.45, state.distance / 2400);
      state.spawnIn = rng.range(CONFIG.spawnMin, CONFIG.spawnMax) * (1 - pressure);
    }

    // Move the world left; cull what has passed.
    const dx = state.speed * dt;
    for (const o of state.obstacles) {
      o.x -= dx;
      if (o.kind === 'knifeSpin' || o.kind === 'knifeFly') o.spin += dt * 9;
    }
    state.obstacles = state.obstacles.filter((o) => o.x + o.w > -120);
    for (const p of state.pickups) p.x -= dx;
    state.pickups = state.pickups.filter((p) => p.x > -60 && !p.taken);

    // Collisions with obstacles.
    const box = turkeyBox();
    for (const o of state.obstacles) {
      if (o.passed) continue;
      if (hit(box, o, 10)) {
        o.passed = true;
        stumble(o);
        if (state.phase !== 'play') return;
      } else if (o.x + o.w < t.x - 40) {
        o.passed = true;
        state.score += 25;
      }
    }

    // Pickups.
    for (const p of state.pickups) {
      if (p.taken) continue;
      const cx = t.x;
      const cy = t.y - (t.ducking ? 26 : 46);
      const ddx = p.x - cx;
      const ddy = p.y - cy;
      if (ddx * ddx + ddy * ddy < (p.r + 30) * (p.r + 30)) {
        p.taken = true;
        state.score += p.kind === 'feather' ? CONFIG.featherPoints : CONFIG.cornPoints;
        burst(p.x, p.y, p.kind === 'feather' ? '#ffd23e' : '#f2a541', 8, 90);
        AudioFX.pickup();
      }
    }

    // Clouds drift; dust kicks up under the turkey's feet.
    for (const c of state.clouds) {
      c.x -= c.v * dt;
      if (c.x < -160) {
        c.x = CONFIG.width + 120;
        c.y = rng.range(40, 200);
      }
    }
    if (t.grounded && Math.floor(state.time * 12) !== Math.floor((state.time - dt) * 12)) {
      state.particles.push({
        x: t.x - 30, y: CONFIG.groundY - 2,
        vx: rng.range(-50, -20), vy: rng.range(-24, -6),
        life: 0.3, maxLife: 0.3, size: rng.range(2, 4), color: '#cbb28a',
      });
    }

    // Particles age.
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    if (state.toastTimer > 0) state.toastTimer -= dt;

    // The pines: 1000 metres and the turkey is free.
    if (state.distance >= CONFIG.winDistance) {
      endRun(true);
    }
  }

  function step(dt) {
    if (!state) return;
    if (state.phase === 'play') stepPlay(dt);
    else if (state.phase === 'title' || state.phase === 'caught' || state.phase === 'escaped') {
      state.time += dt;
      for (const c of state.clouds) {
        c.x -= c.v * dt;
        if (c.x < -160) {
          c.x = CONFIG.width + 120;
          c.y = rng.range(40, 200);
        }
      }
      for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt;
        p.life -= dt;
      }
      state.particles = state.particles.filter((p) => p.life > 0);
    }
  }

  function jump() {
    const t = state.turkey;
    if (state.phase !== 'play' || !t.grounded || t.stumbleTimer > 0) return;
    t.vy = CONFIG.jumpVelocity;
    t.grounded = false;
    t.ducking = false;
    AudioFX.gobble();
  }

  function togglePause() {
    if (state.phase === 'play') {
      state.phaseBeforePause = 'play';
      state.phase = 'paused';
    } else if (state.phase === 'paused') {
      state.phase = state.phaseBeforePause;
    }
  }

  return {
    get() {
      return state;
    },
    OBSTACLE_KINDS,
    toTitle,
    startRun,
    step,
    jump,
    togglePause,
    endRun,
  };
})();
