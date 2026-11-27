// Turkey Run — entrypoint for the make.fun bounty turkey-run-game-01.
//
// Copies the playable game (game/) and its screenshots (screenshots/) into
// the output directory and writes dossier.json there with the kit's
// buildDossier, so the scorer can compare it byte for byte with the dossier
// it rebuilds from the same files.
//
// Runs on Node 22 standard library only: `node main.ts` with
// MAKEFUN_OUTPUT_DIR set (the grader hands it /output). It never removes
// the output directory itself — it only creates it and copies into it.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Turkey Run entry written to ${outDir} (${dossier.length} byte dossier)`);
