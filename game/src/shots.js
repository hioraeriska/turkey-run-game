// Turkey Run — shots: puts the game into a chosen state for a screenshot.
// The screenshots are real renders of the game's own code: a ?shot= URL
// parameter picks the scene and a fixed seed, then the world is stepped
// forward in exact 1/60 slices before the first frame is ever drawn.
//
//   ?shot=title            the title screen
//   ?shot=play&seed=7      mid-run, turkey on the ground, farmer behind
//   ?shot=action&seed=11   mid-jump over the oven, a knife in the air
//   ?shot=caught&seed=5    the caught end screen
//   ?shot=escaped&seed=3   the escaped end screen
// With no ?shot= the game starts on the title screen as normal.

const Shots = (function buildShots() {
  const DT = 1 / 60;

  function params() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return new URLSearchParams('');
    }
  }

  function stepFor(seconds) {
    const steps = Math.round(seconds / DT);
    for (let i = 0; i < steps; i++) World.step(DT);
  }

  function apply() {
    const q = params();
    const shot = q.get('shot');
    if (!shot) return false;
    const seed = Number(q.get('seed') || 7) || 7;
    if (shot === 'title') {
      World.toTitle();
      return true;
    }
    if (shot === 'play') {
      World.startRun(seed);
      stepFor(3.2);
      return true;
    }
    if (shot === 'action') {
      World.startRun(seed);
      stepFor(2.0);
      // Step until an obstacle is just ahead of the turkey, then jump it:
      // the shot shows the turkey clearing something, not jumping at air.
      const s = World.get();
      for (let i = 0; i < 60 * 10; i++) {
        const ahead = s.obstacles.find(
          (o) => o.x > s.turkey.x + 60 && o.x < s.turkey.x + 260,
        );
        if (ahead && s.turkey.grounded) break;
        World.step(DT);
        if (s.phase !== 'play') break;
      }
      const t = World.get().turkey;
      if (t.grounded) {
        t.vy = CONFIG.jumpVelocity;
        t.grounded = false;
      }
      stepFor(0.28);
      return true;
    }
    if (shot === 'caught') {
      World.startRun(seed);
      stepFor(2.0);
      const s = World.get();
      s.lives = 1;
      s.farmerGap = CONFIG.farmerCatchGap + 1;
      stepFor(0.2);
      World.endRun(false);
      return true;
    }
    if (shot === 'escaped') {
      World.startRun(seed);
      const s = World.get();
      s.distance = CONFIG.winDistance;
      World.endRun(true);
      return true;
    }
    return false;
  }

  return { apply };
})();
