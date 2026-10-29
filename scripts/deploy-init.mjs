#!/usr/bin/env node
// =====================================================
// Déploiement interactif (Item 27) : prépare depuis ce poste le paquet à envoyer sur l'hébergement.
// - Interroge https://<site>/api/health : premier déploiement ou mise à jour ?
// - Premier déploiement : questions (base, emails…) puis api/.env généré dans le paquet.
// - Mise à jour : code seul (jamais de .env ni de api/storage/), migrations SQL en attente listées.
// Node pur, sans dépendance : Windows, macOS et Linux.
// Usage : npm run deploy:init
// =====================================================
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Réponses mémorisées pour le déploiement suivant (sans aucun mot de passe), hors Git
const answersFile = join(root, '.deploy', 'answers.json');
const migrationsDir = join(root, 'sql', 'migrations');

const rl = createInterface({ input: process.stdin, output: process.stdout });

// Entrée non interactive (réponses envoyées d'avance, tests) : les lignes arrivées pendant une
// attente (interrogation du serveur) sont mises en file au lieu d'être perdues.
const queued = [];
const waiting = [];
let inputClosed = false;
if (!process.stdin.isTTY) {
  rl.on('line', (line) => (waiting.length ? waiting.shift()(line) : queued.push(line)));
  rl.on('close', () => {
    inputClosed = true;
    while (waiting.length) waiting.shift()('');
  });
}

/** Une ligne de réponse : interactive (TTY) ou lue dans la file. */
function question(prompt) {
  if (process.stdin.isTTY) return rl.question(prompt);
  process.stdout.write(prompt);
  if (queued.length) return Promise.resolve(queued.shift());
  if (inputClosed) return Promise.resolve('');
  return new Promise((resolve) => waiting.push(resolve));
}

// -----------------------------------------------------------------
// Saisie
// -----------------------------------------------------------------

/** Question avec valeur par défaut (Entrée pour l'accepter) et contrôle facultatif. */
async function ask(label, { def = '', check, secret = false } = {}) {
  for (;;) {
    const suffix = def && !secret ? ` [${def}]` : '';
    const raw = secret ? await askHidden(`${label}${suffix} : `) : await question(`${label}${suffix} : `);
    const value = raw.trim() || def;
    const problem = check?.(value);
    if (!problem) return value;
    console.log(`  ⚠️  ${problem}`);
  }
}

async function confirm(label, def = true) {
  const answer = (await question(`${label} [${def ? 'O/n' : 'o/N'}] : `)).trim().toLowerCase();
  return answer ? answer.startsWith('o') || answer.startsWith('y') : def;
}

/** Saisie masquée (mot de passe) ; en entrée non interactive (tests), lecture normale. */
async function askHidden(prompt) {
  if (!process.stdin.isTTY) return question(prompt);
  const write = rl._writeToOutput;
  rl._writeToOutput = (text) => (text.includes(prompt) ? process.stdout.write(text) : null);
  const value = await rl.question(prompt);
  rl._writeToOutput = write;
  process.stdout.write('\n');
  return value;
}

const required = (value) => (value ? null : 'Valeur obligatoire');
const isEmail = (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Adresse email invalide');

// -----------------------------------------------------------------
// Serveur : déjà installé ?
// -----------------------------------------------------------------

/** État renvoyé par /api/health, ou null si le site ne répond pas (pas encore déployé). */
async function serverState(siteUrl) {
  try {
    const res = await fetch(`${siteUrl}/api/health`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return data?.app === 'crenelio' ? data : null;
  } catch {
    return null;
  }
}

/** Migrations postérieures à la version du serveur (toutes si inconnue : elles sont idempotentes). */
function pendingMigrations(schemaVersion) {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .filter((name) => !schemaVersion || name.replace(/\.sql$/, '') > schemaVersion);
}

// -----------------------------------------------------------------
// Paquet
// -----------------------------------------------------------------

/** Fichiers du site, à la même place que sur le serveur (dossier www/ OVH). */
const SITE_FILES = [
  '.htaccess',
  '.ovhconfig',
  'api/.htaccess',
  'api/index.php',
  'api/config',
  'api/core',
  'api/controllers',
  'api/models',
  'api/routes',
  'api/public/assets',
];

/** Premier déploiement seulement : dossiers de stockage vides (jamais leur contenu). */
const STORAGE_SKELETON = [
  'api/storage/.htaccess',
  'api/storage/branding/.gitkeep',
  'api/storage/zone/.gitkeep',
  'api/storage/auth/.gitkeep',
];

function copyInto(target, paths) {
  for (const path of paths) {
    const source = join(root, path);
    if (!existsSync(source)) throw new Error(`Fichier attendu introuvable : ${path}`);
    cpSync(source, join(target, path), { recursive: true });
  }
}

/** Contenu de api/.env : seules les valeurs utiles sont écrites, les autres gardent leur défaut. */
function envFile(a) {
  const lines = [
    '# Généré par npm run deploy:init — ne jamais versionner ce fichier',
    '',
    '# Base de données (espace client OVHcloud → Bases de données)',
    `DB_HOST=${a.dbHost}`,
    `DB_PORT=${a.dbPort}`,
    `DB_NAME=${a.dbName}`,
    `DB_USER=${a.dbUser}`,
    `DB_PASS=${a.dbPass}`,
    'DB_CHARSET=utf8mb4',
    '',
    '# Application',
    'APP_ENV=production',
    `APP_URL=${a.siteUrl}`,
    `CORS_ORIGIN=${a.siteUrl}`,
    `APP_TIMEZONE=${a.timezone}`,
    '',
    '# Emails : SMTP_HOST vide ⇒ fonction mail() de l’hébergement',
    `MAIL_FROM=${a.mailFrom}`,
    `MAIL_FROM_NAME=${a.mailFromName}`,
  ];
  if (a.smtpHost) {
    lines.push(
      `SMTP_HOST=${a.smtpHost}`,
      `SMTP_PORT=${a.smtpPort}`,
      `SMTP_USER=${a.smtpUser}`,
      `SMTP_PASS=${a.smtpPass}`,
      `SMTP_SECURE=${a.smtpSecure}`
    );
  }
  return lines.join('\n') + '\n';
}

function instructions({ mode, siteUrl, state, migrations, hasEnv }) {
  const steps = [];
  if (mode === 'initial') {
    steps.push(
      "Dans l'espace client OVHcloud, créez la base de données si ce n'est pas fait (offre Starter : une seule base).",
      'Envoyez **tout le contenu de `www/`** dans le dossier racine du site (FTP/SFTP, fichiers cachés compris : `.htaccess`, `.ovhconfig`, `api/.env`).',
      'Dans phpMyAdmin, onglet *SQL* : importez `sql/schema.sql`, puis `sql/seed_init.sql`. **Jamais sur une base qui contient déjà des tables.**',
      'Rendez `api/storage/branding/`, `api/storage/zone/` et `api/storage/auth/` accessibles en écriture par PHP (755, ou 775 si besoin).',
      'Activez HTTPS (certificat SSL gratuit OVHcloud) et DKIM pour le domaine.',
      `Contrôlez ${siteUrl}/api/health : \`"installed": true\`.`,
      `Connectez-vous à ${siteUrl}/admin avec \`admin123\` : choisissez votre mot de passe (imposé), puis *Configuration* → *Envoi des emails* → **Envoyer un email de test avant toute déconnexion**.`
    );
  } else {
    steps.push(
      '**Sauvegardez** la base (export phpMyAdmin ou *Sauvegardes* OVHcloud) et le dossier `api/storage/` du serveur.',
      migrations.length
        ? `Dans phpMyAdmin, onglet *SQL*, appliquez dans l'ordre : ${migrations.map((m) => `\`sql/${m}\``).join(', ')} (idempotentes : les rejouer est sans risque).`
        : 'Aucune migration SQL à appliquer.',
      "Envoyez **le contenu de `www/`** par-dessus le site (FTP/SFTP). Il ne contient ni `api/.env` ni `api/storage/` : la configuration et les fichiers de l'artisan sont préservés.",
      `Contrôlez ${siteUrl}/api/health${migrations.length ? ` : \`schema_version\` doit valoir \`${migrations[migrations.length - 1].replace(/\.sql$/, '')}\`` : ''}.`
    );
  }
  return `# Déploiement Crénelio — ${mode === 'initial' ? 'premier déploiement' : 'mise à jour'}

Site : ${siteUrl}
État constaté : ${state ? `installé (base : ${state.database}, schéma : ${state.schema_version ?? 'inconnu'})` : 'site injoignable ou non installé'}
${hasEnv ? '\n⚠️ `www/api/.env` contient les mots de passe : ne le partagez pas, supprimez ce dossier après envoi.\n' : ''}
${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Détails : DEPLOYMENT.fr.md (ou DEPLOYMENT.md).
`;
}

// -----------------------------------------------------------------
// Déroulé
// -----------------------------------------------------------------

async function main() {
  console.log('\n=== Crénelio — préparation du déploiement ===\n');
  const saved = existsSync(answersFile) ? JSON.parse(readFileSync(answersFile, 'utf8')) : {};

  const siteUrl = (
    await ask('Adresse du site', {
      def: saved.siteUrl ?? 'https://',
      check: (v) => (/^https?:\/\/[^\s/]+\.[^\s/]+/.test(v) ? null : 'Adresse complète attendue, ex. https://www.mon-artisan.fr'),
    })
  ).replace(/\/+$/, '');
  if (siteUrl.startsWith('http://')) console.log('  ⚠️  HTTPS est indispensable en production (cookies sécurisés de l’espace Pro).');

  console.log(`\nInterrogation de ${siteUrl}/api/health…`);
  const state = await serverState(siteUrl);
  let mode;
  if (state?.database === 'ok') {
    console.log(`  ✅ Crénelio est installé (schéma : ${state.schema_version ?? 'inconnu'}) : paquet de mise à jour.`);
    mode = 'update';
  } else if (state) {
    console.log(`  ⚠️  Crénelio répond mais la base est ${state.database === 'empty' ? 'vide' : 'injoignable'}.`);
    console.log('     Un api/.env est peut-être déjà présent sur le serveur (identifiants à vérifier).');
    mode = (await confirm('Préparer un premier déploiement complet (avec un nouveau api/.env) ?', state.database === 'empty'))
      ? 'initial'
      : 'update';
  } else {
    console.log('  ℹ️  Le site ne répond pas encore : premier déploiement.');
    mode = 'initial';
  }

  const answers = { siteUrl };
  if (mode === 'initial') {
    const domain = new URL(siteUrl).hostname.replace(/^www\./, '');
    console.log('\nBase de données (espace client OVHcloud → Web Cloud → Hébergements → Bases de données)');
    answers.dbHost = await ask('  Serveur', { def: saved.dbHost, check: required });
    answers.dbPort = await ask('  Port', { def: saved.dbPort ?? '3306', check: (v) => (/^\d+$/.test(v) ? null : 'Nombre attendu') });
    answers.dbName = await ask('  Nom de la base', { def: saved.dbName, check: required });
    answers.dbUser = await ask('  Utilisateur', { def: saved.dbUser ?? answers.dbName, check: required });
    answers.dbPass = await ask('  Mot de passe (non mémorisé)', { secret: true, check: required });

    console.log("\nEmails (la fonction mail() de l'hébergement suffit chez OVHcloud)");
    answers.mailFrom = await ask('  Adresse d’expédition (domaine attaché à l’hébergement)', {
      def: saved.mailFrom ?? `noreply@${domain}`,
      check: isEmail,
    });
    answers.mailFromName = await ask("  Nom affiché (vide : nom de l'entreprise)", { def: saved.mailFromName ?? '' });
    if (await confirm('  Utiliser plutôt un compte SMTP ?', Boolean(saved.smtpHost))) {
      answers.smtpHost = await ask('    Serveur SMTP', { def: saved.smtpHost ?? 'ssl0.ovh.net', check: required });
      answers.smtpPort = await ask('    Port', { def: saved.smtpPort ?? '587' });
      answers.smtpSecure = await ask('    Chiffrement (starttls | tls | none)', {
        def: saved.smtpSecure ?? 'starttls',
        check: (v) => (['starttls', 'tls', 'none'].includes(v) ? null : 'starttls, tls ou none'),
      });
      answers.smtpUser = await ask('    Identifiant (identique à l’adresse d’expédition chez OVHcloud)', {
        def: saved.smtpUser ?? answers.mailFrom,
        check: isEmail,
      });
      answers.smtpPass = await ask('    Mot de passe (non mémorisé)', { secret: true, check: required });
      if (answers.smtpUser !== answers.mailFrom) {
        console.log('    ⚠️  OVHcloud exige que l’adresse d’expédition soit celle du compte SMTP.');
      }
    }
    answers.timezone = await ask('\nFuseau horaire', { def: saved.timezone ?? 'Europe/Paris' });
  }

  rl.close();

  console.log('\n==> Compilation (npm run deploy:build)…');
  const build = spawnSync(process.execPath, [join(root, 'scripts', 'build.mjs')], { cwd: root, stdio: 'inherit' });
  if (build.status !== 0) throw new Error('La compilation a échoué : paquet non créé.');

  // Horodatage local (AAAAMMJJ-HHMM) : nom de dossier lisible et trié
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const target = join(root, 'deploy', `${stamp}-${mode === 'initial' ? 'premier-deploiement' : 'mise-a-jour'}`);
  const www = join(target, 'www');
  copyInto(www, SITE_FILES);

  const migrations = mode === 'update' ? pendingMigrations(state?.schema_version) : [];
  mkdirSync(join(target, 'sql'), { recursive: true });
  if (mode === 'initial') {
    copyInto(www, STORAGE_SKELETON);
    const envPath = join(www, 'api', '.env');
    writeFileSync(envPath, envFile(answers));
    chmodSync(envPath, 0o600);
    for (const file of ['schema.sql', 'seed_init.sql']) cpSync(join(root, 'sql', file), join(target, 'sql', file));
  } else {
    for (const file of migrations) cpSync(join(migrationsDir, file), join(target, 'sql', file));
  }

  writeFileSync(join(target, 'INSTRUCTIONS.md'), instructions({ mode, siteUrl, state, migrations, hasEnv: mode === 'initial' }));

  // Réponses mémorisées sans aucun mot de passe
  mkdirSync(dirname(answersFile), { recursive: true });
  const { dbPass, smtpPass, ...memo } = { ...saved, ...answers };
  writeFileSync(answersFile, JSON.stringify(memo, null, 2) + '\n', { mode: 0o600 });

  console.log(`\n✅ Paquet prêt : ${target.replace(root + '/', '')}/`);
  console.log('   Suivez INSTRUCTIONS.md (www/ à envoyer, sql/ à appliquer dans phpMyAdmin).\n');
}

main().catch((err) => {
  rl.close();
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
