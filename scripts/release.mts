#!/usr/bin/env node
// =====================================================
// Release (Item 28) : archive prête à déployer, sans clonage ni compilation chez l'installateur.
// - Refuse un dépôt avec des modifications non commitées et une version absente de CHANGELOG.md.
// - Compile (deploy:build), puis assemble www/ (site), sql/ (schéma, socle, migrations) et la doc.
// - Jamais de .env, de contenu de api/storage/ ni de données de démonstration.
// - Somme de contrôle SHA-256 publiée avec l'archive.
// Node pur ; zip (macOS, Linux) ou tar (Windows 10+).
// Usage : npm run release
// =====================================================
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_FILES, STORAGE_SKELETON } from './package-files.mts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = join(root, 'release');

function fail(message: string): never {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

/** Commande externe ; arrête la release en cas d'échec. */
function run(command: string, args: string[], cwd = root): string {
  const result = spawnSync(command, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'inherit'],
  });
  if (result.error) fail(`« ${command} » introuvable : ${result.error.message}`);
  if (result.status !== 0) fail(`« ${command} ${args.join(' ')} » a échoué.`);
  return result.stdout.toString();
}

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string };
const name = `crenelio-${version}`;

console.log(`==> Release ${version}`);
if (run('git', ['status', '--porcelain']).trim()) fail('modifications non commitées : commitez-les avant la release.');
if (!readFileSync(join(root, 'CHANGELOG.md'), 'utf8').includes(`## [${version}]`)) {
  fail(`CHANGELOG.md ne décrit pas la version ${version} (titre attendu : « ## [${version}] »).`);
}

console.log('\n==> Compilation (deploy:build)…');
run(process.execPath, [join(root, 'scripts', 'build.mts')]);

console.log('\n==> Assemblage…');
const stage = join(releaseDir, name);
rmSync(stage, { recursive: true, force: true });
const copy = (path: string, target = path) => {
  if (!existsSync(join(root, path))) fail(`fichier attendu introuvable : ${path}`);
  cpSync(join(root, path), join(stage, target), { recursive: true });
};
mkdirSync(stage, { recursive: true });
for (const path of [...SITE_FILES, ...STORAGE_SKELETON, 'api/.env.example']) copy(path, join('www', path));
for (const path of ['sql/schema.sql', 'sql/seed_init.sql', 'sql/migrations']) copy(path);
for (const path of ['CHANGELOG.md', 'DEPLOYMENT.md', 'DEPLOYMENT.fr.md', 'LICENSE']) copy(path);

const archive = `${name}.zip`;
const archivePath = join(releaseDir, archive);
rmSync(archivePath, { force: true });
if (process.platform === 'win32') run('tar', ['-a', '-c', '-f', archive, name], releaseDir);
else run('zip', ['-rqX', archive, name], releaseDir);
rmSync(stage, { recursive: true });

console.log("==> Somme de contrôle…");
writeFileSync(`${archivePath}.sha256`, `${createHash('sha256').update(readFileSync(archivePath)).digest('hex')}  ${archive}\n`);

// Notes de version : la section du CHANGELOG, sans son titre
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const section = changelog.slice(changelog.indexOf(`## [${version}]`)).split(/\n(?=## \[)/)[0];
writeFileSync(join(releaseDir, `${name}-notes.md`), section.split('\n').slice(1).join('\n').trim() + '\n');

console.log(`
✅ Release prête dans release/ : ${archive}, ${archive}.sha256 (notes : ${name}-notes.md)

Publication (à lancer vous-même) :
  git tag v${version} && git push origin v${version}
  gh release create v${version} release/${archive} release/${archive}.sha256 \\
    --title "Crénelio ${version}" --notes-file release/${name}-notes.md${version.startsWith('0.') ? ' --prerelease' : ''}
`);
