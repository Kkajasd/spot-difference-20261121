/**
 * main.ts — the hand-in program for "Lantern Night Market".
 *
 * It copies game/ and screenshots/ from this repository into the output
 * directory and writes /output/dossier.json with buildDossier from the kit's
 * library. It runs twice in the grader and both runs write the same bytes:
 * the copy is a plain recursive copy and the dossier is deterministic.
 *
 * Only the contents of the output directory are cleared, never the
 * directory itself: in the grader /output is a bind-mount and removing it
 * fails. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function clearContents(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

clearContents(outDir);
cpSync(join(here, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
