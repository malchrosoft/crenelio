#!/usr/bin/env node
// =====================================================
// Build : compile React en fichiers statiques et prépare le paquet de déploiement OVH.
// Node pur, sans dépendance : fonctionne sous Windows, macOS et Linux (remplace build.sh).
// Usage : npm run deploy:build   (ou : node scripts/build.mjs)
// =====================================================
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'api', 'public', 'assets');
// index.html compilé : servi pour toutes les pages par le .htaccess racine
const builtIndex = join(assetsDir, 'index.html');

/** Lance une commande npm ; `shell` est nécessaire sous Windows (npm.cmd). Arrête le build en cas d'échec. */
function run(args) {
  const result = spawnSync('npm', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`ERREUR : « npm ${args.join(' ')} » a échoué.`);
    process.exit(result.status ?? 1);
  }
}

function fail(message) {
  console.error(`ERREUR : ${message}`);
  process.exit(1);
}

console.log('==> Installation des dépendances Node.js…');
run(['install']);

console.log('==> Vérification des types…');
// vite build n'en contrôle aucun (esbuild les efface)
run(['exec', '--', 'tsc', '--noEmit']);

console.log('==> Compilation de la version de production…');
// Vite écrit le JS/CSS dans api/public/assets/ (cf. vite.config.js)
run(['run', 'build']);

console.log('==> Vérification du résultat…');
if (!existsSync(assetsDir)) fail('dossier de sortie introuvable. Vérifiez vite.config.js.');
if (!existsSync(builtIndex)) fail('index.html compilé introuvable dans api/public/assets/.');
if (!/src="\/assets\/index\.js"/.test(readFileSync(builtIndex, 'utf8'))) {
  fail("index.html compilé ne pointe pas vers /assets/index.js : vérifiez « base » dans vite.config.js.");
}

console.log('==> Build terminé !\n');
console.log('Fichiers générés dans : api/public/assets/\n');
for (const name of readdirSync(assetsDir)) {
  const size = statSync(join(assetsDir, name)).size;
  console.log(`  ${name.padEnd(28)} ${(size / 1024).toFixed(1).padStart(8)} ko`);
}
console.log(`
Étapes suivantes :
  1. Envoyer les fichiers dans le dossier www/ OVH par FTP/SFTP
  2. Importer sql/schema.sql puis sql/seed_init.sql dans la base MySQL OVH (phpMyAdmin)
  3. Créer api/.env avec les identifiants de la base et du SMTP
  4. Détails : DEPLOYMENT.fr.md (ou DEPLOYMENT.md)
`);
