#!/usr/bin/env node
/**
 * Lance un script Python avec l'interpréteur disponible : `python3` (macOS, Linux),
 * sinon `py` puis `python` (Windows). Remplace `python3 x.py || python x.py`, qui relançait
 * le script avec `python` dès qu'il échouait, masquant la vraie erreur.
 */
import { spawnSync } from 'node:child_process';

const candidates = process.platform === 'win32' ? ['py', 'python', 'python3'] : ['python3', 'python'];
const [script, ...args] = process.argv.slice(2);

for (const bin of candidates) {
  const res = spawnSync(bin, [script, ...args], { stdio: 'inherit' });
  if (res.error?.code === 'ENOENT') continue;
  process.exit(res.status ?? 1);
}

console.error(`❌ Python 3 introuvable (essayé : ${candidates.join(', ')}). Installez-le depuis https://www.python.org/downloads/`);
process.exit(1);
