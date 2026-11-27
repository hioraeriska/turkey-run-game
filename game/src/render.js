// Turkey Run — render: every pixel the game shows, drawn with canvas paths.
// No image files: the turkey, the farmer, the oven and the farm are all code.

const Render = (function buildRender() {
  const C = CONFIG.colors;
  let ctx = null;
  let canvas = null;

  function init(c) {
    canvas = c;
    ctx = c.getContext('2d');
  }

  // -- helpers ---------------------------------------------------------------

  function circle(x, y, r, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function ellipse(x, y, rx, ry, fill, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function rect(x, y, w, h, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  function text(str, x, y, size, fill, align, weight) {
    ctx.font = `${weight || 'bold'} ${size}px "Trebuchet MS", Verdana, sans-serif`;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
  }

  function textOutlined(str, x, y, size, fill, outline, align, weight) {
    ctx.font = `${weight || 'bold'} ${size}px "Trebuchet MS", Verdana, sans-serif`;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(3, size / 8);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = outline;
    ctx.strokeText(str, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(str, x, y);
  }

  function pill(x, y, w, h, fill) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  // -- scenery ---------------------------------------------------------------

  function drawSky(state) {
    const g = ctx.createLinearGradient(0, 0, 0, CONFIG.groundY);
    g.addColorStop(0, C.skyTop);
    g.addColorStop(0.55, C.skyMid);
    g.addColorStop(1, C.skyHorizon);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.groundY);
    // Morning sun.
    circle(1080, 110, 52, C.sun);
    circle(1080, 110, 66, 'rgba(255, 217, 77, 0.25)');
    // Clouds drift with the world.
    for (const cl of state.clouds) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ellipse(cl.x, cl.y, 52 * cl.s, 20 * cl.s, 'rgba(255,255,255,0.9)');
      ellipse(cl.x - 34 * cl.s, cl.y + 8 * cl.s, 32 * cl.s, 15 * cl.s, 'rgba(255,255,255,0.9)');
      ellipse(cl.x + 36 * cl.s, cl.y + 8 * cl.s, 34 * cl.s, 16 * cl.s, 'rgba(255,255,255,0.9)');
    }
  }

  function drawHills(scroll) {
    // Far hills.
    ctx.fillStyle = C.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY);
    for (let x = 0; x <= CONFIG.width; x += 40) {
      const h = 60 + 34 * Math.sin((x + scroll * 0.15) * 0.006);
      ctx.lineTo(x, CONFIG.groundY - h);
    }
    ctx.lineTo(CONFIG.width, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
    // Near hills.
    ctx.fillStyle = C.hillNear;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY);
    for (let x = 0; x <= CONFIG.width; x += 40) {
      const h = 26 + 18 * Math.sin((x + scroll * 0.35) * 0.009 + 2);
      ctx.lineTo(x, CONFIG.groundY - h);
    }
    ctx.lineTo(CONFIG.width, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();
  }

  function drawBarn(x, y, s) {
    // The farmhouse barn, a landmark at the start of the run.
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    rect(-70, -90, 140, 90, C.barnRed);
    ctx.beginPath();
    ctx.moveTo(-82, -88);
    ctx.lineTo(0, -140);
    ctx.lineTo(82, -88);
    ctx.closePath();
    ctx.fillStyle = C.barnRoof;
    ctx.fill();
    rect(-70, -90, 140, 8, C.barnRoof);
    // Door and hayloft.
    rect(-24, -52, 48, 52, '#5e2015');
    ctx.beginPath();
    ctx.moveTo(-24, -52);
    ctx.lineTo(0, -28);
    ctx.lineTo(24, -52);
    ctx.closePath();
    ctx.fillStyle = '#5e2015';
    ctx.fill();
    rect(-14, -116, 28, 22, '#3a140c');
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-24, -52);
    ctx.lineTo(24, -52);
    ctx.moveTo(0, -52);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawPine(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    rect(-6, -14, 12, 14, '#5a3a22');
    ctx.fillStyle = C.pine;
    ctx.beginPath();
    ctx.moveTo(0, -110);
    ctx.lineTo(34, -52);
    ctx.lineTo(-34, -52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.pineDark;
    ctx.beginPath();
    ctx.moveTo(0, -84);
    ctx.lineTo(42, -20);
    ctx.lineTo(-42, -20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGround(scroll, state) {
    // Dirt below, grass on top.
    rect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY, C.dirt);
    rect(0, CONFIG.groundY, CONFIG.width, 14, C.grass);
    // Grass tufts and pebbles scrolling past.
    for (let i = 0; i < 26; i++) {
      const wx = i * 97 - (scroll % 97) - 40;
      const gy = CONFIG.groundY + 26 + ((i * 53) % 78);
      ctx.strokeStyle = i % 3 === 0 ? C.grass : '#5d9445';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx, gy);
      ctx.lineTo(wx - 4, gy - 9);
      ctx.moveTo(wx + 5, gy);
      ctx.lineTo(wx + 8, gy - 8);
      ctx.stroke();
      circle(wx + 40, gy + 8, 3, C.dirtDark);
    }
    // Fence posts along the back of the yard.
    for (let i = 0; i < 9; i++) {
      const wx = i * 160 - (scroll % 160) - 20;
      rect(wx, CONFIG.groundY - 52, 10, 52, C.fence);
      rect(wx - 4, CONFIG.groundY - 52, 18, 8, '#6e4525');
    }
    rect(0, CONFIG.groundY - 34, CONFIG.width, 7, C.fence);
    // Pumpkins near the start of the yard.
    for (let i = 0; i < 4; i++) {
      const wx = 900 + i * 260 - (scroll % 1040);
      if (wx < -60 || wx > CONFIG.width + 60) continue;
      ellipse(wx, CONFIG.groundY - 12, 22, 15, '#e07b28');
      ellipse(wx, CONFIG.groundY - 12, 12, 15, '#c96a1e');
      rect(wx - 2, CONFIG.groundY - 30, 4, 10, '#3f7a2e');
    }
    // The pines gather as the turkey nears freedom.
    const nearEnd = Math.max(0, state.distance - 700) / 300;
    if (nearEnd > 0) {
      for (let i = 0; i < 5; i++) {
        const wx = 150 + i * 260 - (scroll * 0.6 % 260);
        drawPine(wx, CONFIG.groundY - 4, 1.1 + nearEnd * 0.4);
      }
    }
  }

  // -- characters ------------------------------------------------------------

  function drawTurkey(x, y, runPhase, ducking, stumbling, scale) {
    const s = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (stumbling) ctx.globalAlpha = 0.55 + 0.25 * Math.sin(runPhase * 14);
    const legSwing = Math.sin(runPhase) * 14;
    const air = y < CONFIG.groundY;
    // Legs.
    ctx.strokeStyle = '#f2a541';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -34);
    ctx.lineTo(-8 + (air ? 10 : legSwing), 0);
    ctx.moveTo(8, -34);
    ctx.lineTo(8 + (air ? -6 : -legSwing), 0);
    ctx.stroke();
    // Tail feathers, fanned.
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(-34, -58);
      ctx.rotate(i * 0.42);
      ellipse(0, -26, 11, 30, i % 2 === 0 ? C.turkeyBody : C.turkeyDark);
      ctx.restore();
    }
    // Body.
    ellipse(0, -52, 34, 30, C.turkeyBody);
    ellipse(6, -46, 22, 18, C.turkeyBelly);
    // Wing.
    const wingY = -52 + (ducking ? 6 : 0);
    ctx.save();
    ctx.translate(-4, wingY);
    ctx.rotate(ducking ? 0.5 : Math.sin(runPhase * 2) * 0.25 - 0.2);
    ellipse(0, 0, 20, 12, C.turkeyDark);
    ctx.restore();
    // Head and neck.
    ellipse(30, -84, 13, 22, C.turkeyBody);
    circle(34, -102, 14, C.turkeyBody);
    // Beak.
    ctx.beginPath();
    ctx.moveTo(44, -106);
    ctx.lineTo(60, -100);
    ctx.lineTo(44, -96);
    ctx.closePath();
    ctx.fillStyle = C.turkeyBeak;
    ctx.fill();
    // Wattle and eye.
    ellipse(40, -92, 5, 9, C.turkeyWattle);
    circle(38, -106, 3.5, '#1c1210');
    circle(39.5, -107.5, 1.2, '#ffffff');
    // A few scared feathers when stumbling.
    if (stumbling) {
      ellipse(-52, -86, 8, 4, '#fff3dc', -0.6);
      ellipse(-58, -70, 7, 3, '#fff3dc', 0.4);
    }
    ctx.restore();
  }

  function drawFarmer(x, y, runPhase, scale) {
    const s = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const swing = Math.sin(runPhase) * 16;
    const air = Math.sin(runPhase) > 0.7;
    // Legs in overalls.
    ctx.strokeStyle = C.farmerOveralls;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -58);
    ctx.lineTo(-6 + swing, air ? -6 : 0);
    ctx.moveTo(8, -58);
    ctx.lineTo(8 - swing, air ? -4 : 0);
    ctx.stroke();
    // Body: shirt and overalls.
    rect(-20, -118, 42, 62, C.farmerShirt);
    rect(-18, -92, 38, 36, C.farmerOveralls);
    rect(-18, -118, 8, 30, C.farmerOveralls);
    rect(12, -118, 8, 30, C.farmerOveralls);
    // Arm reaching forward, carving knife in hand.
    ctx.strokeStyle = C.farmerShirt;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(14, -106);
    ctx.lineTo(44, -88);
    ctx.stroke();
    // The knife.
    ctx.save();
    ctx.translate(52, -84);
    ctx.rotate(0.5);
    rect(-4, -26, 8, 22, C.knifeHandle);
    ctx.beginPath();
    ctx.moveTo(-5, -26);
    ctx.lineTo(5, -26);
    ctx.lineTo(0, -58);
    ctx.closePath();
    ctx.fillStyle = C.knifeBlade;
    ctx.fill();
    ctx.restore();
    // Head: beard, nose, straw hat.
    circle(2, -132, 16, C.farmerSkin);
    ellipse(2, -122, 13, 9, '#e8e0d0');
    circle(18, -134, 4, C.farmerSkin);
    circle(6, -136, 2.5, '#1c1210');
    ellipse(2, -146, 26, 7, C.farmerHat);
    ellipse(2, -152, 15, 9, C.farmerHat);
    ctx.restore();
  }

  // -- obstacles and pickups -------------------------------------------------

  function drawHay(x, y, w, h) {
    ctx.save();
    ctx.translate(x + w / 2, y + h);
    rect(-w / 2, -h, w, h * 0.62, C.hay);
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.62, w / 2, h * 0.38, 0, Math.PI, 0);
    ctx.fillStyle = C.hay;
    ctx.fill();
    ctx.strokeStyle = C.hayDark;
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 13, -h + 8);
      ctx.lineTo(i * 13 + 6, -8);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.62, w / 2 - 6, h * 0.38 - 6, 0, Math.PI, 0);
    ctx.strokeStyle = C.hayDark;
    ctx.stroke();
    ctx.restore();
  }

  function drawOven(x, y, w, h, time) {
    ctx.save();
    ctx.translate(x, y);
    // Brick body.
    rect(0, 0, w, h, C.ovenBrick);
    rect(0, 0, w, 10, C.ovenDark);
    // Brick lines.
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    for (let row = 1; row < 4; row++) {
      ctx.beginPath();
      ctx.moveTo(0, (h * row) / 4);
      ctx.lineTo(w, (h * row) / 4);
      ctx.stroke();
    }
    // Chimney with smoke.
    rect(w - 30, -34, 22, 34, C.ovenDark);
    for (let i = 0; i < 3; i++) {
      const puff = ((time * 0.7 + i * 0.33) % 1);
      circle(w - 19 + Math.sin(puff * 5) * 8, -34 - puff * 46, 6 + puff * 12, `rgba(220,220,220,${0.5 * (1 - puff)})`);
    }
    // Fire mouth.
    const flicker = Math.sin(time * 11) * 4;
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 26, 30, 24 + flicker, 0, 0, Math.PI * 2);
    ctx.fillStyle = C.fire;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 20, 18, 14 + flicker * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = C.fireCore;
    ctx.fill();
    // A roast pan on top, empty — for now.
    ellipse(w / 2, -4, 34, 7, '#5a5a5a');
    ctx.restore();
  }

  function drawKnife(x, y, w, h, spin, flying) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(flying ? 0 : spin);
    // Blade.
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, -7);
    ctx.lineTo(w / 2 - 14, -7);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w / 2 - 14, 7);
    ctx.lineTo(-w / 2 + 8, 7);
    ctx.closePath();
    ctx.fillStyle = C.knifeBlade;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, -7);
    ctx.lineTo(w / 2 - 14, -7);
    ctx.lineTo(w / 2, 0);
    ctx.closePath();
    ctx.fillStyle = C.knifeEdge;
    ctx.fill();
    // Handle.
    rect(-w / 2 - 6, -6, 18, 12, C.knifeHandle);
    circle(-w / 2 - 6, 0, 6, C.knifeHandle);
    // Glint.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 16, -3);
    ctx.lineTo(w / 2 - 22, -3);
    ctx.stroke();
    ctx.restore();
  }

  function drawCorn(x, y, r, time) {
    const bob = Math.sin(time * 4 + x * 0.02) * 3;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(Math.sin(time * 2 + x * 0.01) * 0.15);
    // Husk.
    ctx.fillStyle = '#5d9445';
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(-r - 8, r + 12);
    ctx.lineTo(-r + 4, r + 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(r + 8, r + 12);
    ctx.lineTo(r - 4, r + 4);
    ctx.closePath();
    ctx.fill();
    // Cob.
    ellipse(0, -4, r * 0.75, r, '#f2c14e');
    ctx.strokeStyle = '#d9a52e';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 8, -r + 2);
      ctx.lineTo(i * 8, r - 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFeatherPickup(x, y, r, time) {
    const bob = Math.sin(time * 4 + x * 0.02) * 4;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(Math.sin(time * 3) * 0.3);
    ellipse(0, 0, 8, 18, '#ffd23e');
    ellipse(0, -4, 4, 12, '#fff3dc');
    ctx.strokeStyle = '#d9a52e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 18);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles(state) {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      circle(p.x, p.y, p.size, p.color);
    }
    ctx.globalAlpha = 1;
  }

  // -- HUD -------------------------------------------------------------------

  function drawFeatherIcon(x, y, s, filled) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(0, 0, 7, 14, filled ? '#ffd23e' : 'rgba(255,255,255,0.35)');
    ctx.strokeStyle = filled ? '#d9a52e' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 14);
    ctx.stroke();
    ctx.restore();
  }

  function drawHUD(state) {
    const metres = Math.floor(state.distance);
    const score = Math.floor(state.score);
    // Top bar.
    pill(16, 14, 1240, 64, 'rgba(43, 26, 18, 0.72)');
    text('SCORE', 48, 32, 15, '#ffd23e', 'left');
    text(String(score), 48, 58, 26, '#fff3dc', 'left');
    text('DISTANCE', 330, 32, 15, '#ffd23e', 'left');
    text(`${metres} m`, 330, 58, 26, '#fff3dc', 'left');
    // Progress to the pines.
    const barX = 560;
    const barW = 380;
    pill(barX, 30, barW, 16, 'rgba(255,255,255,0.25)');
    const prog = Math.min(1, state.distance / CONFIG.winDistance);
    pill(barX, 30, Math.max(16, barW * prog), 16, '#69a84f');
    drawPine(barX + barW + 22, 52, 0.42);
    text('PINES', barX + barW + 52, 40, 13, '#fff3dc', 'left');
    // Lives as feathers.
    text('LIVES', 1050, 32, 15, '#ffd23e', 'left');
    for (let i = 0; i < CONFIG.maxLives; i++) {
      drawFeatherIcon(1085 + i * 30, 56, 1, i < state.lives);
    }
    // Toast under the bar.
    if (state.toastTimer > 0) {
      ctx.globalAlpha = Math.min(1, state.toastTimer);
      textOutlined(state.toast, CONFIG.width / 2, 118, 26, '#fff3dc', '#7e2a1e');
      ctx.globalAlpha = 1;
    }
    // Farmer warning when he is close.
    if (state.phase === 'play' && state.farmerGap < 80) {
      const blink = Math.sin(state.time * 10) > 0;
      if (blink) textOutlined('HE IS RIGHT BEHIND YOU!', CONFIG.width / 2, 158, 24, '#ff5a3c', '#2b1a12');
    }
  }

  // -- screens ---------------------------------------------------------------

  function drawTitle(state, scroll) {
    drawSky(state);
    drawHills(scroll);
    drawBarn(180, CONFIG.groundY, 1);
    drawPine(1120, CONFIG.groundY - 4, 1.3);
    drawPine(1200, CONFIG.groundY - 4, 1.0);
    drawGround(scroll, state);
    // The scene: turkey ahead, farmer closing in.
    drawFarmer(150, CONFIG.groundY, state.time * 6, 1);
    drawTurkey(430, CONFIG.groundY, state.time * 6, false, false, 1.15);
    drawKnife(1010, CONFIG.groundY - 190, 86, 26, 0, true);
    drawCorn(880, CONFIG.groundY - 46, 16, state.time);
    // Title panel.
    pill(240, 92, 800, 250, C.panel);
    textOutlined('TURKEY RUN', 640, 168, 92, '#ffd23e', '#7e2a1e');
    text('ESCAPE THANKSGIVING DINNER', 640, 232, 30, '#fff3dc');
    text('One turkey. One farmer. Zero dinners.', 640, 272, 22, '#e8c89a');
    text('Run 1000 m to the pine forest — jump the ovens, duck the knives.', 640, 306, 19, '#e8c89a');
    // Start prompt, blinking.
    if (Math.sin(state.time * 4) > -0.4) {
      pill(430, 372, 420, 58, '#ffd23e');
      text('PRESS SPACE OR CLICK TO RUN', 640, 402, 24, '#2b1a12');
    }
    pill(330, 448, 620, 36, 'rgba(43, 26, 18, 0.55)');
    text('SPACE / CLICK jump      DOWN duck      P pause      M mute', 640, 466, 19, '#fff3dc');
    if (state.best > 0) {
      text(`BEST ESCAPE ATTEMPT: ${state.best} m`, 640, 506, 19, '#ffd23e');
    }
    text('A game by hioraeriska for make.fun', 640, 690, 14, 'rgba(255,255,255,0.7)');
  }

  function drawEnd(state, escaped) {
    // Dim the field behind the panel.
    rect(0, 0, CONFIG.width, CONFIG.height, 'rgba(43, 26, 18, 0.45)');
    pill(290, 130, 700, 420, C.panelLight);
    if (escaped) {
      drawPine(640, 210, 1.4);
      textOutlined('ESCAPED!', 640, 300, 72, '#2f6b3a', '#fff3dc');
      text('You made it to the pine forest.', 640, 352, 24, C.ink);
      text('No Thanksgiving dinner for you, Gus.', 640, 384, 24, C.ink);
    } else {
      drawFarmer(560, 250, 0, 1);
      drawTurkey(700, 250, 0, false, true, 1);
      textOutlined('CAUGHT!', 640, 330, 72, '#b3402e', '#fff3dc');
      text('The farmer got you. Dinner is served...', 640, 382, 24, C.ink);
      text('...unless you run again, faster this time.', 640, 414, 24, C.ink);
    }
    text(`SCORE  ${Math.floor(state.score)}      DISTANCE  ${Math.floor(state.distance)} m`, 640, 448, 24, C.ink);
    if (Math.floor(state.distance) >= state.best && state.distance > 0) {
      text('NEW BEST DISTANCE!', 640, 482, 20, '#b3402e');
    } else {
      text(`BEST  ${state.best} m`, 640, 482, 20, '#8a5a33');
    }
    pill(470, 506, 340, 30, '#ffd23e');
    text('PRESS R OR CLICK TO RUN AGAIN', 640, 522, 17, '#2b1a12');
  }

  function drawPaused(state) {
    rect(0, 0, CONFIG.width, CONFIG.height, 'rgba(43, 26, 18, 0.5)');
    pill(440, 300, 400, 120, C.panel);
    textOutlined('PAUSED', 640, 340, 44, '#ffd23e', '#7e2a1e');
    text('Press P to keep running', 640, 388, 20, '#fff3dc');
  }

  // -- the frame -------------------------------------------------------------

  function draw(state) {
    const scroll = Math.floor(state.distance * CONFIG.pxPerMetre);
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    if (state.phase === 'title') {
      drawTitle(state, scroll);
      return;
    }
    drawSky(state);
    drawHills(scroll);
    // The barn marks the yard you escaped from.
    const barnX = 180 - scroll * 0.5;
    if (barnX > -260 && barnX < CONFIG.width + 260) drawBarn(barnX, CONFIG.groundY, 0.9);
    drawGround(scroll, state);
    // Pickups, then obstacles, then the chase.
    for (const p of state.pickups) {
      if (p.kind === 'corn') drawCorn(p.x, p.y, p.r, state.time);
      else drawFeatherPickup(p.x, p.y, p.r, state.time);
    }
    for (const o of state.obstacles) {
      if (o.kind === 'hay') drawHay(o.x, o.y, o.w, o.h);
      else if (o.kind === 'oven') drawOven(o.x, o.y, o.w, o.h, state.time);
      else if (o.kind === 'knifeSpin') drawKnife(o.x, o.y, o.w, o.h, o.spin, false);
      else drawKnife(o.x, o.y, o.w, o.h, o.spin, true);
    }
    const t = state.turkey;
    const farmerX = t.x - state.farmerGap;
    const blink = t.invulnerableTimer > 0 && Math.floor(state.time * 12) % 2 === 0;
    drawFarmer(farmerX, CONFIG.groundY, state.farmer.runPhase, 1);
    if (!blink) {
      drawTurkey(t.x, t.y, t.runPhase, t.ducking, t.stumbleTimer > 0, 1);
    }
    drawParticles(state);
    drawHUD(state);
    if (state.phase === 'caught') drawEnd(state, false);
    else if (state.phase === 'escaped') drawEnd(state, true);
    else if (state.phase === 'paused') drawPaused(state);
  }

  return { init, draw, drawTurkey, drawFarmer, drawOven, drawHay, drawKnife, drawCorn };
})();
