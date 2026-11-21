/**
 * main.js — the bootstrap of "Lantern Night Market".
 *
 * One canvas, one game, one animation loop. In normal play the loop advances
 * the clock and draws every frame; in shot mode (?shot=cover and friends)
 * the clock is frozen at 0 so the screenshot is deterministic.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { newGame, tick } from './game.js';
import { drawFrame } from './render.js';
import { attachInput } from './input.js';
import { readShot, applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = newGame();
const shot = readShot();
const frozen = shot !== null;
if (shot !== null) applyShot(game, shot);

let lastNow = performance.now();

/** One animation frame: advance the clock, then draw. */
function frame(nowMs) {
  if (!frozen) {
    const dt = Math.min(100, Math.max(0, nowMs - lastNow));
    tick(game, dt, nowMs);
  }
  lastNow = nowMs;
  drawFrame(ctx, game, frozen ? 0 : nowMs);
  requestAnimationFrame(frame);
}

attachInput(canvas, game, () => {
  // The next animation frame redraws; nothing else to do on a change.
});
requestAnimationFrame(frame);
