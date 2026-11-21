/**
 * shots.js — deterministic states for the screenshots.
 *
 * A URL like ?shot=cover puts the game into a chosen mid-hunt state with a
 * fixed clock, so a screenshot is a real render of the game's own code in a
 * state a player could reach. The four shots are the cover (level 1, three
 * differences found), a harder level mid-hunt, a hint in use, and a finished
 * level. In shot mode the animation clock is frozen at 0.
 */

import { LEVELS, differencesForLevel, POINTS_PER_FIND, POINTS_PER_SECOND_LEFT } from './config.js';

/** The four screenshot setups, by name. */
export const SHOTS = {
  cover: { level: 0, found: [0, 2, 4], secondsLeft: 151, hint: false },
  hard: { level: 2, found: [1, 5], secondsLeft: 107, hint: false },
  hint: { level: 1, found: [0, 3], secondsLeft: 98, hint: true },
  complete: { level: 0, found: 'all', secondsLeft: 142, hint: false },
};

/**
 * Read the shot from the URL (?shot=cover). Returns null for normal play.
 */
export function readShot() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('shot');
  if (name === null) return null;
  const setup = SHOTS[name];
  if (setup === undefined) return null;
  return { name, ...setup };
}

/**
 * Put a fresh game into the shot's state. The clock is fixed, the hint (if
 * any) points at the first unfound difference, and the complete shot marks
 * the level done with its time bonus already counted.
 */
export function applyShot(game, shot) {
  game.levelIndex = shot.level;
  game.found = new Set();
  const diffs = differencesForLevel(shot.level);
  if (shot.found === 'all') {
    for (const d of diffs) game.found.add(d.id);
  } else {
    for (const index of shot.found) {
      const d = diffs[index];
      if (d !== undefined) game.found.add(d.id);
    }
  }
  game.score = game.found.size * POINTS_PER_FIND;
  game.timeLeftMs = shot.secondsLeft * 1000;
  game.hintsLeft = shot.hint ? 2 : 3;
  game.hintShown = null;
  if (shot.hint) {
    const unfound = diffs.filter((d) => !game.found.has(d.id));
    if (unfound.length > 0) {
      game.hintShown = unfound[0];
      game.hintUntil = Number.POSITIVE_INFINITY;
    }
  }
  if (shot.found === 'all') {
    game.levelBonus = Math.ceil(game.timeLeftMs / 1000) * POINTS_PER_SECOND_LEFT;
    game.score += game.levelBonus;
    game.status = 'level-done';
  } else {
    game.status = 'playing';
  }
  return game;
}

export function levelName(index) {
  return LEVELS[index].name;
}
