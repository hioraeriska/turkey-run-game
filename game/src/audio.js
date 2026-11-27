// Turkey Run — sounds: tiny synthesised effects on WebAudio, no files.
// Everything is guarded: a browser with no audio never breaks the game.

const AudioFX = (function buildAudioFX() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      if (ac.state === 'suspended') ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const now = ac.currentTime;
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
      gain.gain.setValueAtTime(vol || 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (e) {
      /* audio is decoration; never break the game */
    }
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    // Two quick descending clucks: the turkey's jump.
    gobble() {
      tone(520, 0.09, 'square', 0.06, 380);
      setTimeout(() => tone(430, 0.1, 'square', 0.06, 300), 70);
    },
    // A bright two-note chime for corn.
    pickup() {
      tone(880, 0.1, 'sine', 0.1);
      setTimeout(() => tone(1318, 0.14, 'sine', 0.1), 80);
    },
    // A low thud for stumbling into something.
    thud() {
      tone(140, 0.18, 'triangle', 0.16, 70);
    },
    // A rising arpeggio for escaping to the pines.
    fanfare() {
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => tone(f, 0.22, 'triangle', 0.12), i * 110),
      );
    },
    // A short descending buzz for being caught.
    caught() {
      tone(320, 0.5, 'sawtooth', 0.08, 110);
    },
    click() {
      tone(660, 0.05, 'sine', 0.07);
    },
  };
})();
