/**
 * render.js — everything the player sees, drawn on one canvas.
 *
 * Layout (canvas 1160 x 720): a header bar with the title, the level, the
 * found counter, the clock and the hint button; two 560 x 600 panels side
 * by side; a footer line with the controls. Markers for found differences
 * are drawn on both panels, so a screenshot shows the game mid-hunt.
 */

import {
  PANEL_WIDTH,
  PANEL_HEIGHT,
  PANEL_GAP,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  LEVELS,
} from './config.js';
import { drawScene } from './scenes.js';
import { levelDifferences, remainingCount, formatTime, secondsLeft } from './game.js';

export const PANEL_LEFT_X = 20;
export const PANEL_RIGHT_X = PANEL_LEFT_X + PANEL_WIDTH + PANEL_GAP;
export const PANEL_Y = HEADER_HEIGHT + 20;

/** Where the hint button sits, so input can hit-test it. */
export const HINT_BUTTON = { x: 1000, y: 14, w: 140, h: 36 };

function drawHeader(ctx, game) {
  const level = LEVELS[game.levelIndex];
  const total = levelDifferences(game).length;
  const found = total - remainingCount(game);

  ctx.fillStyle = '#160f28';
  ctx.fillRect(0, 0, ctx.canvas.width, HEADER_HEIGHT);
  ctx.fillStyle = 'rgba(255, 217, 122, 0.25)';
  ctx.fillRect(0, HEADER_HEIGHT - 2, ctx.canvas.width, 2);

  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏮 Lantern Night Market', 20, HEADER_HEIGHT / 2 - 2);

  ctx.fillStyle = '#cbb8e8';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Level ${game.levelIndex + 1}: ${level.name}`, 20, HEADER_HEIGHT - 12);

  // Found counter, big and central.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Found ${found} of ${total}  ·  ${remainingCount(game)} remain`, 560, 26);
  ctx.fillStyle = '#cbb8e8';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Score ${game.score}`, 560, 50);

  // The clock, red when it is nearly out.
  const secs = secondsLeft(game);
  ctx.textAlign = 'right';
  ctx.fillStyle = secs <= 30 && game.status === 'playing' ? '#ff6b5e' : '#ffe9b0';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(formatTime(game.timeLeftMs), 980, 28);
  ctx.fillStyle = '#cbb8e8';
  ctx.font = '13px sans-serif';
  ctx.fillText('time left', 980, 50);

  // The hint button.
  ctx.fillStyle = game.hintsLeft > 0 ? '#3f7fd0' : '#4a4460';
  ctx.beginPath();
  ctx.roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Hint (H) · ${game.hintsLeft}`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 19);
}

function drawFooter(ctx) {
  ctx.fillStyle = '#160f28';
  ctx.fillRect(0, ctx.canvas.height - FOOTER_HEIGHT, ctx.canvas.width, FOOTER_HEIGHT);
  ctx.fillStyle = '#cbb8e8';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'Click a difference in either picture  ·  H hint  ·  R restart level  ·  M mute',
    ctx.canvas.width / 2,
    ctx.canvas.height - FOOTER_HEIGHT / 2,
  );
}

/** A green ring and check where a difference was found. */
function drawFoundMark(ctx, x, y, pulse) {
  const r = 24 + pulse * 3;
  ctx.strokeStyle = '#5ee88a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#5ee88a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x - 3, y + 8);
  ctx.lineTo(x + 11, y - 8);
  ctx.stroke();
}

/** A pulsing amber ring where the hint points. */
function drawHintMark(ctx, x, y, nowMs) {
  const pulse = 0.5 + 0.5 * Math.sin(nowMs / 160);
  const r = 22 + pulse * 8;
  ctx.strokeStyle = `rgba(255, 201, 60, ${0.55 + pulse * 0.4})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 201, 60, 0.9)';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x, y - 2);
}

/** A red cross where a wrong click landed. */
function drawWrongMark(ctx, x, y) {
  ctx.strokeStyle = '#ff6b5e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
}

function drawOverlay(ctx, title, lines, action) {
  ctx.fillStyle = 'rgba(10, 6, 22, 0.78)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, ctx.canvas.width / 2, 300);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, ctx.canvas.width / 2, 356 + i * 32);
  });
  ctx.fillStyle = '#5ee88a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(action, ctx.canvas.width / 2, 356 + lines.length * 32 + 24);
}

/** One full frame: header, both panels, markers, footer, overlays. */
export function drawFrame(ctx, game, timeMs) {
  const diffs = levelDifferences(game);
  const changed = new Set(diffs.map((d) => d.id));
  const nowMs = timeMs;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#0e0a1c';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawHeader(ctx, game);

  // Panel tabs.
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#cbb8e8';
  ctx.fillText('Panel A — the original', PANEL_LEFT_X, PANEL_Y - 10);
  ctx.fillText('Panel B — spot the changes', PANEL_RIGHT_X, PANEL_Y - 10);

  // The two panels: left is the base drawing, right has every difference.
  ctx.save();
  ctx.translate(PANEL_LEFT_X, PANEL_Y);
  drawScene(ctx, game.levelIndex, new Set(), nowMs);
  ctx.restore();
  ctx.save();
  ctx.translate(PANEL_RIGHT_X, PANEL_Y);
  drawScene(ctx, game.levelIndex, changed, nowMs);
  ctx.restore();

  // Panel frames.
  ctx.strokeStyle = 'rgba(255, 233, 176, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(PANEL_LEFT_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.strokeRect(PANEL_RIGHT_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);

  // Markers for found differences, on both panels.
  const pulse = 0.5 + 0.5 * Math.sin(nowMs / 400);
  for (const d of diffs) {
    if (!game.found.has(d.id)) continue;
    drawFoundMark(ctx, PANEL_LEFT_X + d.x, PANEL_Y + d.y, pulse);
    drawFoundMark(ctx, PANEL_RIGHT_X + d.x, PANEL_Y + d.y, pulse);
  }

  // The hint pulse, on both panels.
  if (game.hintShown !== null) {
    drawHintMark(ctx, PANEL_LEFT_X + game.hintShown.x, PANEL_Y + game.hintShown.y, nowMs);
    drawHintMark(ctx, PANEL_RIGHT_X + game.hintShown.x, PANEL_Y + game.hintShown.y, nowMs);
  }

  // The wrong-click cross, on the panel it landed in.
  if (game.wrongFlash !== null) {
    const baseX = game.wrongFlash.panel === 1 ? PANEL_RIGHT_X : PANEL_LEFT_X;
    drawWrongMark(ctx, baseX + game.wrongFlash.x, PANEL_Y + game.wrongFlash.y);
  }

  drawFooter(ctx);

  // Overlays for the end of a level or the game.
  if (game.status === 'level-done') {
    drawOverlay(
      ctx,
      `Level ${game.levelIndex + 1} complete!`,
      [
        `All ${diffs.length} differences found.`,
        `Time bonus +${game.levelBonus} points · Score ${game.score}`,
      ],
      'Click or press N for the next level',
    );
  } else if (game.status === 'won') {
    drawOverlay(
      ctx,
      'You found them all!',
      [
        `Three markets cleared · Score ${game.score} · ${game.mistakes} wrong clicks`,
        'Every lantern lit, every cat accounted for.',
      ],
      'Click or press R to play again',
    );
  } else if (game.status === 'time-up') {
    drawOverlay(
      ctx,
      'Time is up!',
      [
        `You found ${diffs.length - remainingCount(game)} of ${diffs.length} differences.`,
        'The market keeps its secrets — this time.',
      ],
      'Click or press R to try the level again',
    );
  }
}
