// Turkey Run — tuning: every number the game balances on, in one place.

const CONFIG = {
  // Canvas the game is drawn for.
  width: 1280,
  height: 720,
  // The ground line the turkey and the farmer run on.
  groundY: 600,
  // The turkey's fixed horizontal spot; the world scrolls past it.
  turkeyX: 300,
  // Physics.
  gravity: 2600,
  jumpVelocity: -980,
  // The run: metres to the pine forest, where the turkey escapes.
  winDistance: 1000,
  // Lives: stumbles before the farmer catches the turkey.
  maxLives: 3,
  // Speed in pixels per second: starts here, grows with distance, caps here.
  speedStart: 380,
  speedPerMetre: 0.34,
  speedMax: 720,
  // How far behind the turkey the farmer starts, in pixels.
  farmerGapStart: 175,
  // Pixels the farmer gains on each stumble, and recovers per clean second.
  farmerGainOnStumble: 55,
  farmerRecoveryPerSecond: 7,
  // The farmer catches the turkey when the gap closes to this.
  farmerCatchGap: 26,
  // Spawning: seconds between obstacle waves, shrinking as speed grows.
  spawnMin: 0.85,
  spawnMax: 1.45,
  // Points.
  pointsPerMetre: 10,
  cornPoints: 50,
  featherPoints: 150,
  // Pixels per metre of distance, for the world scroll.
  pxPerMetre: 8,
  // Colours.
  colors: {
    skyTop: '#8ec9f2',
    skyMid: '#cfe9fb',
    skyHorizon: '#ffe3b3',
    sun: '#ffd94d',
    hillFar: '#a8c98a',
    hillNear: '#86b364',
    grass: '#69a84f',
    dirt: '#a9713f',
    dirtDark: '#8d5a2f',
    barnRed: '#b3402e',
    barnRoof: '#7e2a1e',
    fence: '#8a5a33',
    hay: '#e0b64f',
    hayDark: '#c79a35',
    ovenBrick: '#9c4526',
    ovenDark: '#6e2f18',
    fire: '#ff7a1a',
    fireCore: '#ffd23e',
    knifeBlade: '#dfe6ee',
    knifeEdge: '#ffffff',
    knifeHandle: '#4a3226',
    turkeyBody: '#8d5a2b',
    turkeyDark: '#6e421d',
    turkeyBelly: '#e8c89a',
    turkeyWattle: '#d43d2a',
    turkeyBeak: '#f2a541',
    farmerShirt: '#3f6fb5',
    farmerOveralls: '#2e4a7a',
    farmerSkin: '#e8b88a',
    farmerHat: '#e8c96a',
    pine: '#2f6b3a',
    pineDark: '#245430',
    panel: 'rgba(43, 26, 18, 0.88)',
    panelLight: 'rgba(255, 248, 235, 0.94)',
    ink: '#2b1a12',
    cream: '#fff3dc',
  },
};
