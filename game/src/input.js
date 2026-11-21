/**
 * input.js — mouse and keyboard for the game.
 *
 * A click inside a panel is translated to panel coordinates and handed to the
 * game; a click on the hint button spends a hint; clicks on an overlay
 * advance, retry or restart. Keyboard: H hint, R restart, N next level,
 * M mute.
 */

import { PANEL_WIDTH, PANEL_HEIGHT } from './config.js';
import { PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_Y, HINT_BUTTON } from './render.js';
import {
  clickAt,
  useHint,
  nextLevel,
  restartLevel,
  newGame,
} from './game.js';
import { ensureAudio, playFound, playMiss, playHint, playLevelDone, playWon, toggleMute } from './audio.js';

/** Which panel a canvas point is in: 0 left, 1 right, or null outside both. */
export function panelAt(canvasX, canvasY) {
  if (canvasY < PANEL_Y || canvasY > PANEL_Y + PANEL_HEIGHT) return null;
  if (canvasX >= PANEL_LEFT_X && canvasX <= PANEL_LEFT_X + PANEL_WIDTH) return 0;
  if (canvasX >= PANEL_RIGHT_X && canvasX <= PANEL_RIGHT_X + PANEL_WIDTH) return 1;
  return null;
}

/** Panel coordinates of a canvas point, given its panel. */
function toPanelCoords(panel, canvasX, canvasY) {
  const originX = panel === 1 ? PANEL_RIGHT_X : PANEL_LEFT_X;
  return { x: canvasX - originX, y: canvasY - PANEL_Y };
}

function insideButton(x, y, button) {
  return x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h;
}

/** Wire the canvas and the keyboard to one game. Returns a detach function. */
export function attachInput(canvas, game, onChange) {
  /** A click on the canvas, in CSS pixels. */
  function onPointerDown(event) {
    ensureAudio();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const nowMs = performance.now();
    handleClick(game, x, y, nowMs);
    onChange();
  }

  /** A key press. */
  function onKeyDown(event) {
    ensureAudio();
    const key = event.key.toLowerCase();
    const nowMs = performance.now();
    if (key === 'h') {
      const pick = useHint(game, nowMs);
      if (pick !== null) playHint();
    } else if (key === 'r') {
      if (game.status === 'won') {
        Object.assign(game, newGame());
      } else {
        restartLevel(game);
      }
    } else if (key === 'n') {
      if (game.status === 'level-done') nextLevel(game);
    } else if (key === 'm') {
      toggleMute();
    }
    onChange();
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);
  return function detach() {
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onKeyDown);
  };
}

/** One click, routed to the right part of the game. */
export function handleClick(game, x, y, nowMs) {
  // The hint button lives in the header.
  if (insideButton(x, y, HINT_BUTTON)) {
    const pick = useHint(game, nowMs);
    if (pick !== null) playHint();
    return;
  }

  // An overlay is showing: a click advances, retries or restarts.
  if (game.status === 'level-done') {
    const wasLast = game.levelIndex + 1 >= 3;
    nextLevel(game);
    if (!wasLast) playLevelDone();
    return;
  }
  if (game.status === 'won') {
    Object.assign(game, newGame());
    return;
  }
  if (game.status === 'time-up') {
    restartLevel(game);
    return;
  }

  // A click inside a panel is a hunt for a difference.
  const panel = panelAt(x, y);
  if (panel === null) return;
  const point = toPanelCoords(panel, x, y);
  const before = game.status;
  const result = clickAt(game, point.x, point.y, nowMs);
  if (result === 'miss' && game.wrongFlash !== null) game.wrongFlash.panel = panel;
  if (result === 'found') playFound();
  if (result === 'miss') playMiss();
  if (game.status === 'level-done' && before === 'playing') playLevelDone();
  if (game.status === 'won' && before === 'playing') playWon();
}
