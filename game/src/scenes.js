/**
 * scenes.js — the market street, drawn procedurally on a 2D canvas.
 *
 * One function draws one panel: drawScene(ctx, levelIndex, changes, timeMs).
 * `changes` is a Set of difference ids to render in their changed form; the
 * left panel is always drawn with an empty set, the right panel with every
 * difference of the level. Nothing here reads the clock except the lantern
 * sway, which freezes at timeMs = 0 for deterministic screenshots.
 *
 * All decoration that looks random comes from a seeded generator, so the same
 * level always draws the same street.
 */

import { PANEL_WIDTH, PANEL_HEIGHT, LEVELS } from './config.js';

/** A small seeded generator: the same seed always gives the same numbers. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

/** The sky: gradient, stars, the moon and two slow clouds. */
function drawSky(ctx, level, changes, rand) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, level.skyTop);
  sky.addColorStop(0.55, level.skyMid);
  sky.addColorStop(1, level.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_WIDTH, 340);

  // Stars, seeded so every render of a level matches.
  const starCount = 42 + level.extraStars;
  for (let i = 0; i < starCount; i++) {
    const x = 14 + rand() * (PANEL_WIDTH - 28);
    const y = 10 + rand() * 150;
    const r = 0.8 + rand() * 1.4;
    ctx.globalAlpha = 0.35 + rand() * 0.6;
    ctx.fillStyle = '#fff6d8';
    circle(ctx, x, y, r);
  }
  ctx.globalAlpha = 1;
  // The lone star: present in the base panel, gone in the changed one.
  if (!changes.has('lone-star')) {
    ctx.fillStyle = '#fff2b0';
    circle(ctx, 92, 58, 2.6);
    ctx.strokeStyle = 'rgba(255, 242, 176, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(92, 46);
    ctx.lineTo(92, 70);
    ctx.moveTo(80, 58);
    ctx.lineTo(104, 58);
    ctx.stroke();
  }

  // The moon, top right. Its crater is the difference.
  ctx.fillStyle = level.moon;
  circle(ctx, 468, 74, 30);
  if (!changes.has('moon-crater')) {
    ctx.fillStyle = 'rgba(214, 178, 110, 0.85)';
    circle(ctx, 458, 66, 5);
    circle(ctx, 478, 82, 3.5);
    circle(ctx, 470, 58, 2.5);
  }

  // The night bird: a small silhouette, base panel only.
  if (!changes.has('night-bird')) {
    ctx.strokeStyle = '#1a1230';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(146, 88);
    ctx.quadraticCurveTo(152, 80, 158, 88);
    ctx.quadraticCurveTo(164, 80, 170, 88);
    ctx.stroke();
  }

  // Two soft clouds drifting over the rooftops.
  ctx.fillStyle = 'rgba(255, 220, 190, 0.10)';
  ellipse(ctx, 150, 150, 70, 14);
  ellipse(ctx, 420, 120, 58, 11);
}

/** Rooftops and walls behind the stalls, with lit windows. */
function drawBuildings(ctx, level, changes) {
  // Left house.
  ctx.fillStyle = level.wall;
  ctx.fillRect(0, 232, 170, 190);
  ctx.fillStyle = level.roof;
  ctx.beginPath();
  ctx.moveTo(-6, 236);
  ctx.lineTo(85, 188);
  ctx.lineTo(176, 236);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = level.roof;
  ctx.fillRect(0, 232, 170, 10);

  // Centre house, set a little further back.
  ctx.fillStyle = level.wall;
  ctx.fillRect(168, 262, 224, 160);
  ctx.fillStyle = level.roof;
  ctx.beginPath();
  ctx.moveTo(162, 266);
  ctx.lineTo(280, 218);
  ctx.lineTo(398, 266);
  ctx.closePath();
  ctx.fill();

  // Right house.
  ctx.fillStyle = level.wall;
  ctx.fillRect(390, 242, 170, 180);
  ctx.fillStyle = level.roof;
  ctx.beginPath();
  ctx.moveTo(384, 246);
  ctx.lineTo(475, 196);
  ctx.lineTo(566, 246);
  ctx.closePath();
  ctx.fill();

  // Windows: two dark, one lit — the lit one is the difference.
  const windows = [
    { x: 52, y: 272, w: 34, h: 44 },
    { x: 250, y: 300, w: 34, h: 44 },
    { x: 348, y: 298, w: 34, h: 44, lit: true },
    { x: 442, y: 280, w: 34, h: 44 },
  ];
  for (const win of windows) {
    const lit = win.lit ? !changes.has('window-lit') : false;
    ctx.fillStyle = lit ? '#ffd97a' : '#191024';
    ctx.fillRect(win.x, win.y, win.w, win.h);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(win.x, win.y, win.w, win.h);
    ctx.beginPath();
    ctx.moveTo(win.x + win.w / 2, win.y);
    ctx.lineTo(win.x + win.w / 2, win.y + win.h);
    ctx.moveTo(win.x, win.y + win.h / 2);
    ctx.lineTo(win.x + win.w, win.y + win.h / 2);
    ctx.stroke();
    if (lit) {
      ctx.fillStyle = 'rgba(255, 217, 122, 0.16)';
      ellipse(ctx, win.x + win.w / 2, win.y + win.h / 2, 34, 30);
    }
  }
}

/** The string of lights and hanging lanterns across the top of the street. */
function drawLights(ctx, level, changes, timeMs) {
  const sway = timeMs === 0 ? 0 : Math.sin(timeMs / 900) * 2.5;
  ctx.strokeStyle = '#1c1226';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, 108);
  ctx.quadraticCurveTo(280, 168, 552, 104);
  ctx.stroke();

  // Small round bulbs along the string.
  const bulbSpots = [60, 130, 208, 380, 452, 520];
  for (const bx of bulbSpots) {
    const t = (bx - 8) / (552 - 8);
    const by = 108 + (168 - 108) * 2 * t * (1 - t) + 24;
    const missing = bx === 208 && changes.has('string-bulb');
    if (missing) continue;
    ctx.fillStyle = '#ffe9a8';
    circle(ctx, bx, by, 5);
    ctx.fillStyle = 'rgba(255, 233, 168, 0.25)';
    circle(ctx, bx, by, 10);
  }

  // Hanging paper lanterns. The one at x 296 changes colour.
  const lanterns = [
    { x: 96, y: 168, r: 17, colour: '#e8573f' },
    { x: 296, y: 148, r: 19, colour: '#e8573f', special: true },
    { x: 420, y: 158, r: 16, colour: '#f2a541' },
  ];
  const extra = level.extraLanterns;
  if (extra >= 2) lanterns.push({ x: 190, y: 162, r: 14, colour: '#f2a541' });
  if (extra >= 4) lanterns.push({ x: 500, y: 150, r: 14, colour: '#e8573f' });
  for (const lamp of lanterns) {
    const lx = lamp.x + sway;
    ctx.strokeStyle = '#1c1226';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, lamp.y - lamp.r - 16);
    ctx.lineTo(lx, lamp.y - lamp.r);
    ctx.stroke();
    const colour = lamp.special && changes.has('lantern-color') ? '#3fb8a6' : lamp.colour;
    ctx.fillStyle = colour;
    ellipse(ctx, lx, lamp.y, lamp.r, lamp.r * 1.15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ellipse(ctx, lx - lamp.r * 0.35, lamp.y - lamp.r * 0.4, lamp.r * 0.28, lamp.r * 0.4);
    ctx.fillStyle = '#f7e8c8';
    ctx.fillRect(lx - 5, lamp.y - lamp.r - 4, 10, 5);
    ctx.fillRect(lx - 5, lamp.y + lamp.r - 1, 10, 5);
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.22 * level.lanternGlow;
    circle(ctx, lx, lamp.y, lamp.r + 14);
    ctx.globalAlpha = 1;
  }
}

/** The left stall: striped awning, counter, jars and a hanging sign. */
function drawLeftStall(ctx, level, changes) {
  // Awning: six stripes in the base panel, five when changed.
  const stripes = changes.has('awning-stripe') ? 5 : 6;
  const awningX = 36;
  const awningW = 224;
  const stripeW = awningW / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? level.awningA : level.awningB;
    ctx.fillRect(awningX + i * stripeW, 246, stripeW + 1, 34);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(awningX, 276, awningW, 5);
  ctx.strokeStyle = '#2a1a12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(awningX + 6, 280);
  ctx.lineTo(awningX - 2, 306);
  ctx.moveTo(awningX + awningW - 6, 280);
  ctx.lineTo(awningX + awningW + 2, 306);
  ctx.stroke();

  // Counter and legs.
  ctx.fillStyle = level.stallWood;
  ctx.fillRect(44, 400, 208, 22);
  ctx.fillRect(52, 422, 14, 96);
  ctx.fillRect(230, 422, 14, 96);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(44, 400, 208, 5);

  // Jars on the counter. One jar is the difference.
  const jars = [
    { x: 78, y: 372, w: 30, h: 28, colour: '#7fae7a' },
    { x: 122, y: 368, w: 26, h: 32, colour: '#c98a4a' },
    { x: 198, y: 370, w: 28, h: 30, colour: '#a86a9a', special: true },
  ];
  for (const jar of jars) {
    if (jar.special && changes.has('stall-jar')) continue;
    ctx.fillStyle = jar.colour;
    roundRect(ctx, jar.x, jar.y, jar.w, jar.h, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(jar.x + 5, jar.y + 4, 5, jar.h - 10);
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(jar.x + 6, jar.y - 5, jar.w - 12, 6);
  }

  // A bowl of oranges on the counter.
  ctx.fillStyle = '#8a5a30';
  ellipse(ctx, 158, 396, 24, 8);
  ctx.fillStyle = '#f08a2e';
  circle(ctx, 148, 388, 7);
  circle(ctx, 160, 386, 7);
  circle(ctx, 170, 389, 7);
  ctx.fillStyle = '#5a7a3a';
  ellipse(ctx, 160, 379, 6, 3);
}

/** The right stall: crates, a hanging sign and a flag. */
function drawRightStall(ctx, level, changes) {
  // Awning.
  ctx.fillStyle = level.awningA;
  ctx.fillRect(318, 272, 222, 26);
  ctx.fillStyle = level.awningB;
  ctx.fillRect(318, 272, 222, 7);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(318, 294, 222, 5);

  // Flag on a pole above the stall: red and right in the base panel.
  ctx.strokeStyle = '#2a1a12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(500, 208);
  ctx.lineTo(500, 272);
  ctx.stroke();
  ctx.fillStyle = changes.has('stall-flag') ? '#3f7fd0' : '#d94f3d';
  ctx.beginPath();
  if (changes.has('stall-flag')) {
    ctx.moveTo(500, 208);
    ctx.lineTo(472, 216);
    ctx.lineTo(500, 228);
  } else {
    ctx.moveTo(500, 208);
    ctx.lineTo(528, 216);
    ctx.lineTo(500, 228);
  }
  ctx.closePath();
  ctx.fill();

  // Hanging sign: a fish in the base panel, a flower when changed.
  ctx.strokeStyle = '#2a1a12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(488, 298);
  ctx.lineTo(488, 312);
  ctx.stroke();
  ctx.fillStyle = '#f7e8c8';
  roundRect(ctx, 462, 312, 52, 40, 6);
  ctx.strokeStyle = '#2a1a12';
  ctx.strokeRect(462, 312, 52, 40);
  if (changes.has('sign-symbol')) {
    // A flower.
    ctx.fillStyle = '#e86a9a';
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
      circle(ctx, 488 + Math.cos(a) * 8, 330 + Math.sin(a) * 8, 5);
    }
    ctx.fillStyle = '#f2c14e';
    circle(ctx, 488, 330, 5);
  } else {
    // A fish.
    ctx.fillStyle = '#3f7fd0';
    ellipse(ctx, 486, 330, 13, 8);
    ctx.beginPath();
    ctx.moveTo(498, 330);
    ctx.lineTo(508, 322);
    ctx.lineTo(508, 338);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#12233a';
    circle(ctx, 478, 328, 1.8);
  }

  // Counter.
  ctx.fillStyle = level.stallWood;
  ctx.fillRect(326, 400, 206, 22);
  ctx.fillRect(334, 422, 14, 96);
  ctx.fillRect(510, 422, 14, 96);

  // Paper fans on the counter.
  ctx.fillStyle = '#e8d5a8';
  for (let i = 0; i < 3; i++) {
    const fx = 360 + i * 26;
    ctx.beginPath();
    ctx.moveTo(fx, 400);
    ctx.lineTo(fx + 10, 372);
    ctx.lineTo(fx + 20, 400);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#c7432f';
  circle(ctx, 430, 388, 9);
}

/** The street: cobblestones, a puddle, the crate stack and the cat. */
function drawStreet(ctx, level, changes, rand) {
  ctx.fillStyle = level.street;
  ctx.fillRect(0, 518, PANEL_WIDTH, 82);

  // Cobblestones, seeded.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1.5;
  for (let row = 0; row < 3; row++) {
    const y = 536 + row * 22;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL_WIDTH, y);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const x = rand() * PANEL_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 22);
      ctx.stroke();
    }
  }

  // A puddle catching the lantern light.
  ctx.fillStyle = 'rgba(150, 170, 220, 0.30)';
  ellipse(ctx, 300, 566, 62, 12);
  ctx.fillStyle = 'rgba(255, 220, 150, 0.35)';
  ellipse(ctx, 288, 564, 26, 5);

  // Crate stack at the bottom left: three crates, two when changed.
  const crateRows = changes.has('crate-stack') ? 2 : 3;
  ctx.fillStyle = '#8a6a3a';
  ctx.strokeStyle = '#4a3018';
  ctx.lineWidth = 2;
  for (let i = 0; i < crateRows; i++) {
    const cy = 566 - i * 26;
    ctx.fillRect(66, cy - 24, 46, 24);
    ctx.strokeRect(66, cy - 24, 46, 24);
    ctx.beginPath();
    ctx.moveTo(66, cy - 24);
    ctx.lineTo(112, cy);
    ctx.moveTo(112, cy - 24);
    ctx.lineTo(66, cy);
    ctx.stroke();
  }

  // The market cat, sitting on a crate by the right stall.
  if (!changes.has('market-cat')) {
    ctx.fillStyle = '#2e2a33';
    // Body.
    ellipse(ctx, 428, 500, 20, 16);
    // Head.
    circle(ctx, 428, 476, 12);
    // Ears.
    ctx.beginPath();
    ctx.moveTo(418, 468);
    ctx.lineTo(416, 456);
    ctx.lineTo(424, 464);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(438, 468);
    ctx.lineTo(440, 456);
    ctx.lineTo(432, 464);
    ctx.closePath();
    ctx.fill();
    // Tail, curled up.
    ctx.strokeStyle = '#2e2a33';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(446, 502);
    ctx.quadraticCurveTo(462, 496, 458, 478);
    ctx.stroke();
    // Eyes, catching the light.
    ctx.fillStyle = '#ffd97a';
    circle(ctx, 423, 475, 2);
    circle(ctx, 433, 475, 2);
  }
}

/**
 * Draw one panel of the market street.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} levelIndex
 * @param {Set<string>} changes difference ids rendered in changed form
 * @param {number} timeMs animation clock; 0 freezes the scene (screenshots)
 */
export function drawScene(ctx, levelIndex, changes, timeMs) {
  const level = LEVELS[levelIndex];
  const rand = mulberry32(20261121 + levelIndex * 7919);
  ctx.save();
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  drawSky(ctx, level, changes, rand);
  drawBuildings(ctx, level, changes);
  drawLights(ctx, level, changes, timeMs);
  drawLeftStall(ctx, level, changes);
  drawRightStall(ctx, level, changes);
  drawStreet(ctx, level, changes, rand);
  ctx.restore();
}
