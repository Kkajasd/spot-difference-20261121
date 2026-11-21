/**
 * config.js — the data of "Lantern Night Market".
 *
 * One scene, three levels. Every level is the same market street drawn with a
 * different palette and a different set of differences; the difficulty rises
 * through more differences, a busier background and less time.
 *
 * A difference is one small, fair change between the two panels: the left
 * panel always shows the base drawing, the right panel shows the changed one.
 * Each difference names the point a click must land near (x, y in panel
 * coordinates, the panel is 560 x 600) and the radius that counts as a hit.
 */

export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 600;
export const PANEL_GAP = 20;
export const HEADER_HEIGHT = 64;
export const FOOTER_HEIGHT = 36;

export const CANVAS_WIDTH = PANEL_WIDTH * 2 + PANEL_GAP + 40;
export const CANVAS_HEIGHT = HEADER_HEIGHT + 20 + PANEL_HEIGHT + FOOTER_HEIGHT;

/** The twelve differences. `levels` says which levels hide each one. */
export const DIFFERENCES = [
  { id: 'moon-crater', name: 'Moon crater', x: 468, y: 74, r: 26, levels: [0, 1, 2] },
  { id: 'lantern-color', name: 'Lantern colour', x: 296, y: 148, r: 24, levels: [0, 1, 2] },
  { id: 'market-cat', name: 'Market cat', x: 428, y: 468, r: 30, levels: [0, 1, 2] },
  { id: 'awning-stripe', name: 'Awning stripe', x: 118, y: 252, r: 26, levels: [0, 1, 2] },
  { id: 'stall-jar', name: 'Stall jar', x: 198, y: 418, r: 22, levels: [0, 1, 2] },
  { id: 'lone-star', name: 'Lone star', x: 92, y: 58, r: 18, levels: [0, 1, 2] },
  { id: 'window-lit', name: 'Lit window', x: 348, y: 298, r: 24, levels: [0, 1, 2] },
  { id: 'sign-symbol', name: 'Sign symbol', x: 488, y: 328, r: 26, levels: [0, 1, 2] },
  { id: 'crate-stack', name: 'Crate stack', x: 88, y: 518, r: 26, levels: [1, 2] },
  { id: 'string-bulb', name: 'String bulb', x: 208, y: 138, r: 16, levels: [1, 2] },
  { id: 'stall-flag', name: 'Stall flag', x: 498, y: 208, r: 22, levels: [2] },
  { id: 'night-bird', name: 'Night bird', x: 158, y: 88, r: 18, levels: [2] },
];

/** The three levels: name, palette, time and which differences they hide. */
export const LEVELS = [
  {
    name: 'Dusk Market',
    subtitle: '8 differences · 3:00 on the clock',
    seconds: 180,
    skyTop: '#241a4e',
    skyMid: '#7a3b63',
    skyBottom: '#e8825a',
    moon: '#ffe9b0',
    roof: '#3a2440',
    wall: '#5a3a52',
    street: '#2c2140',
    stallWood: '#7a4a2e',
    awningA: '#d94f3d',
    awningB: '#f7e8c8',
    lanternGlow: 0.85,
    extraStars: 0,
    extraLanterns: 0,
  },
  {
    name: 'Lantern Hour',
    subtitle: '10 differences · 2:30 on the clock',
    seconds: 150,
    skyTop: '#120f38',
    skyMid: '#3a2560',
    skyBottom: '#8a4a6e',
    moon: '#ffedbe',
    roof: '#241631',
    wall: '#3d2847',
    street: '#1e1633',
    stallWood: '#6b3f26',
    awningA: '#c7432f',
    awningB: '#efe0b8',
    lanternGlow: 1.0,
    extraStars: 14,
    extraLanterns: 2,
  },
  {
    name: 'Midnight Rush',
    subtitle: '12 differences · 2:00 on the clock',
    seconds: 120,
    skyTop: '#070a24',
    skyMid: '#1c1745',
    skyBottom: '#4a2a58',
    moon: '#fff3c8',
    roof: '#180f28',
    wall: '#2c1e3d',
    street: '#150f28',
    stallWood: '#5c3620',
    awningA: '#b23a28',
    awningB: '#e8d5a8',
    lanternGlow: 1.15,
    extraStars: 26,
    extraLanterns: 4,
  },
];

/** The differences a level hides, in the order they are listed above. */
export function differencesForLevel(levelIndex) {
  return DIFFERENCES.filter((d) => d.levels.includes(levelIndex));
}

/** Points for a find, a wrong click and the time bonus at level end. */
export const POINTS_PER_FIND = 100;
export const POINTS_PER_MISTAKE = 25;
export const POINTS_PER_SECOND_LEFT = 5;
export const TIME_COST_PER_MISTAKE_SECONDS = 5;
export const HINTS_PER_LEVEL = 3;
export const HINT_HOLD_MS = 2200;
