/**
 * game.js — the state of one play-through of "Lantern Night Market".
 *
 * A game is three levels in order. Each level hides its own set of
 * differences; the player clicks them in either panel. Finding one marks it
 * on both panels. A wrong click costs time, a hint shows one unfound
 * difference for a moment, and the clock running out ends the level.
 */

import {
  LEVELS,
  differencesForLevel,
  POINTS_PER_FIND,
  POINTS_PER_MISTAKE,
  POINTS_PER_SECOND_LEFT,
  TIME_COST_PER_MISTAKE_SECONDS,
  HINTS_PER_LEVEL,
  HINT_HOLD_MS,
} from './config.js';

/** A fresh game: level 0, nothing found, the clock full. */
export function newGame() {
  return {
    levelIndex: 0,
    found: new Set(),
    mistakes: 0,
    score: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintShown: null,
    hintUntil: 0,
    timeLeftMs: LEVELS[0].seconds * 1000,
    status: 'playing',
    wrongFlash: null,
    levelBonus: 0,
    totalTimeLeftMs: 0,
  };
}

/** The differences of the level the game is on. */
export function levelDifferences(game) {
  return differencesForLevel(game.levelIndex);
}

/** How many differences of this level are still unfound. */
export function remainingCount(game) {
  return levelDifferences(game).filter((d) => !game.found.has(d.id)).length;
}

/** Whether every difference of the level has been found. */
export function levelComplete(game) {
  return remainingCount(game) === 0;
}

/** The difference under a point in panel coordinates, or null. */
export function differenceAt(game, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const d of levelDifferences(game)) {
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist <= d.r && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * A click at panel coordinates. Returns 'found', 'already' or 'miss'.
 * A find marks the difference on both panels and adds points; a miss costs
 * time and points and flashes a red cross where the player clicked.
 */
export function clickAt(game, x, y, nowMs) {
  if (game.status !== 'playing') return 'idle';
  const diff = differenceAt(game, x, y);
  if (diff === null) {
    game.mistakes += 1;
    game.score = Math.max(0, game.score - POINTS_PER_MISTAKE);
    game.timeLeftMs = Math.max(0, game.timeLeftMs - TIME_COST_PER_MISTAKE_SECONDS * 1000);
    game.wrongFlash = { x, y, until: nowMs + 450 };
    return 'miss';
  }
  if (game.found.has(diff.id)) return 'already';
  game.found.add(diff.id);
  game.score += POINTS_PER_FIND;
  game.hintShown = null;
  if (levelComplete(game)) {
    const bonus = Math.ceil(game.timeLeftMs / 1000) * POINTS_PER_SECOND_LEFT;
    game.levelBonus = bonus;
    game.score += bonus;
    game.totalTimeLeftMs = game.timeLeftMs;
    game.status = game.levelIndex + 1 >= LEVELS.length ? 'won' : 'level-done';
  }
  return 'found';
}

/** Spend a hint: show one unfound difference for a short while. */
export function useHint(game, nowMs) {
  if (game.status !== 'playing') return null;
  if (game.hintsLeft <= 0) return null;
  const unfound = levelDifferences(game).filter((d) => !game.found.has(d.id));
  if (unfound.length === 0) return null;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  game.hintsLeft -= 1;
  game.hintShown = pick;
  game.hintUntil = nowMs + HINT_HOLD_MS;
  return pick;
}

/** Move to the next level after a level-done screen. */
export function nextLevel(game) {
  if (game.status !== 'level-done') return;
  game.levelIndex += 1;
  game.found = new Set();
  game.hintsLeft = HINTS_PER_LEVEL;
  game.hintShown = null;
  game.timeLeftMs = LEVELS[game.levelIndex].seconds * 1000;
  game.levelBonus = 0;
  game.status = 'playing';
}

/** Restart the current level, keeping the score earned before it. */
export function restartLevel(game) {
  game.found = new Set();
  game.hintsLeft = HINTS_PER_LEVEL;
  game.hintShown = null;
  game.timeLeftMs = LEVELS[game.levelIndex].seconds * 1000;
  game.levelBonus = 0;
  game.status = 'playing';
}

/** Advance the clock by dtMs; the level ends when the clock runs out. */
export function tick(game, dtMs, nowMs) {
  if (game.status !== 'playing') return;
  game.timeLeftMs = Math.max(0, game.timeLeftMs - dtMs);
  if (game.timeLeftMs <= 0) game.status = 'time-up';
  if (game.hintShown !== null && nowMs >= game.hintUntil) game.hintShown = null;
  if (game.wrongFlash !== null && nowMs >= game.wrongFlash.until) game.wrongFlash = null;
}

/** Whole seconds left on the clock, for the header. */
export function secondsLeft(game) {
  return Math.ceil(game.timeLeftMs / 1000);
}

/** "2:31" from a millisecond count. */
export function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
