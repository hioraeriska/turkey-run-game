// Turkey Run — input: keyboard plus mouse/touch, with edge detection so
// one press is one jump even when the key is held.

const Input = (function buildInput() {
  const held = new Set();
  const pressedQueue = [];
  let clickQueue = [];
  let lastClick = null;

  const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
  const DUCK_KEYS = ['ArrowDown', 'KeyS'];
  const PAUSE_KEYS = ['KeyP', 'Escape'];
  const MUTE_KEYS = ['KeyM'];
  const RESTART_KEYS = ['KeyR', 'Enter'];

  function codeOf(e) {
    return e.code || e.key;
  }

  function onKeyDown(e) {
    const code = codeOf(e);
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(code)) e.preventDefault();
    if (!held.has(code)) {
      held.add(code);
      pressedQueue.push(code);
    }
  }

  function onKeyUp(e) {
    held.delete(codeOf(e));
  }

  function onPointerDown(e) {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CONFIG.width;
    const y = ((e.clientY - rect.top) / rect.height) * CONFIG.height;
    lastClick = { x, y };
    clickQueue.push({ x, y });
    AudioFX.unlock();
  }

  function attach(canvas) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onPointerDown);
  }

  function consumePressed(codes) {
    for (let i = 0; i < pressedQueue.length; i++) {
      if (codes.includes(pressedQueue[i])) {
        pressedQueue.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  return {
    attach,
    isDown(codes) {
      return codes.some((c) => held.has(c));
    },
    jumpPressed() {
      return consumePressed(JUMP_KEYS);
    },
    restartPressed() {
      return consumePressed(RESTART_KEYS);
    },
    pausePressed() {
      return consumePressed(PAUSE_KEYS);
    },
    mutePressed() {
      return consumePressed(MUTE_KEYS);
    },
    duckHeld() {
      return this.isDown(DUCK_KEYS);
    },
    // Clicks since the last frame, as canvas coordinates.
    takeClicks() {
      const out = clickQueue;
      clickQueue = [];
      return out;
    },
    lastClick() {
      return lastClick;
    },
    // Called once per frame: drops presses the game did not use.
    endFrame() {
      pressedQueue.length = 0;
    },
  };
})();
