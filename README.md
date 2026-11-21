# Lantern Night Market — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Kkajasd/spot-difference-20261121/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Kkajasd/spot-difference-20261121/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a desktop
browser. Two near-identical panels of a lantern night market, drawn
procedurally on canvas — no borrowed art, no network requests.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server). Click a difference in either picture to mark it on both. Find them
all before the clock runs out.

- **3 levels**: Dusk Market (8 differences, 3:00), Lantern Hour (10, 2:30),
  Midnight Rush (12, 2:00) — the street gets busier and darker as you go.
- **Hints**: press H or the Hint button to pulse one unfound difference
  (3 per level). **Wrong clicks** cost 5 seconds and 25 points.
- **Keys**: H hint · R restart level · N next level · M mute.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with `buildDossier`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html` — the page, one canvas.
- `game/src/config.js` — levels, differences and scoring.
- `game/src/scenes.js` — the market street, drawn procedurally.
- `game/src/game.js` — game state: levels, clock, hints, scoring.
- `game/src/render.js` — the header, the panels, the markers, the overlays.
- `game/src/input.js` — mouse and keyboard.
- `game/src/audio.js` — WebAudio chimes, no audio files.
- `game/src/shots.js` — deterministic states for the screenshots
  (`?shot=cover|hard|hint|complete`).
- `screenshots/` — four real renders of the game's own code.
