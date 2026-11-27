// Turkey Run — main: the loop, the state machine and the buttons.
// One frame: read input, step the world, draw it. Nothing here talks to
// the network; the game is its own files and the browser alone.

(function main() {
  const canvas = document.getElementById('game');
  const W = CONFIG.width;
  const H = CONFIG.height;
  Render.init(canvas);
  Input.attach(canvas);

  // The title screen's idle world, then any ?shot= scene for screenshots.
  World.toTitle();
  Shots.apply();

  let last = performance.now();
  let firstFrame = true;

  // Clickable buttons, in canvas coordinates, per phase.
  function buttonHit(clicks, box) {
    for (const c of clicks) {
      if (c.x >= box.x && c.x <= box.x + box.w && c.y >= box.y && c.y <= box.y + box.h) {
        return true;
      }
    }
    return false;
  }

  function handleInput() {
    const state = World.get();
    const clicks = Input.takeClicks();

    if (Input.mutePressed()) {
      const muted = AudioFX.toggleMute();
      if (state) state.toast = muted ? 'Sound off' : 'Sound on';
      if (state) state.toastTimer = 1.2;
    }
    if (Input.pausePressed() && state.phase === 'play') {
      World.togglePause();
      AudioFX.click();
      return;
    }
    if (state.phase === 'paused' && Input.pausePressed()) {
      World.togglePause();
      return;
    }

    if (state.phase === 'title') {
      if (Input.jumpPressed() || Input.restartPressed() || clicks.length > 0) {
        AudioFX.click();
        World.startRun();
      }
      return;
    }

    if (state.phase === 'caught' || state.phase === 'escaped') {
      const again = { x: 470, y: 506, w: 340, h: 30 };
      if (Input.restartPressed() || Input.jumpPressed() || buttonHit(clicks, again)) {
        AudioFX.click();
        World.startRun();
      }
      return;
    }

    if (state.phase === 'play') {
      if (Input.jumpPressed()) World.jump();
      else if (clicks.length > 0) World.jump();
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    handleInput();
    const state = World.get();
    if (state.phase === 'play' || state.phase === 'title' ||
        state.phase === 'caught' || state.phase === 'escaped') {
      World.step(dt);
    }
    Render.draw(state);
    Input.endFrame();
    if (firstFrame) {
      firstFrame = false;
      // A hook for screenshot tooling: the first real frame is on screen.
      document.title = 'Turkey Run — Escape Thanksgiving';
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
