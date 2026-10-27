#!/usr/bin/env node
/**
 * Ouvre l'application locale dans un navigateur installé, dans tous pour comparer le rendu,
 * ou dans le navigateur par défaut (repris du projet siteweb de Malchrosoft).
 *
 *   npm run ouvrir                    → navigateur par défaut, http://localhost:5173/
 *   npm run ouvrir safari admin       → /admin dans Safari
 *   npm run ouvrir tous booking       → /booking dans tous les navigateurs installés
 *   npm run ouvrir liste              → navigateurs détectés
 *   npm start [navigateur] [chemin]   → même chose, une fois l'environnement démarré (cf. start.py)
 *
 * Navigateurs connus : chrome, brave, edge, firefox, safari, opera, vivaldi, chromium
 * (macOS, Windows, Linux). L'adresse de base vient de CRENELIO_URL (port réel de Vite).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = (process.env.CRENELIO_URL || 'http://localhost:5173').replace(/\/$/, '') + '/';

// Nom d'application (macOS), exécutable relatif à Program Files (Windows), commandes (Linux)
const NAVIGATEURS = {
  chrome: { mac: 'Google Chrome', win: 'Google/Chrome/Application/chrome.exe', linux: ['google-chrome', 'google-chrome-stable'] },
  brave: { mac: 'Brave Browser', win: 'BraveSoftware/Brave-Browser/Application/brave.exe', linux: ['brave-browser', 'brave'] },
  edge: { mac: 'Microsoft Edge', win: 'Microsoft/Edge/Application/msedge.exe', linux: ['microsoft-edge'] },
  firefox: { mac: 'Firefox', win: 'Mozilla Firefox/firefox.exe', linux: ['firefox'] },
  safari: { mac: 'Safari' },
  opera: { mac: 'Opera', win: 'Opera/opera.exe', linux: ['opera'] },
  vivaldi: { mac: 'Vivaldi', win: 'Vivaldi/Application/vivaldi.exe', linux: ['vivaldi'] },
  chromium: { mac: 'Chromium', linux: ['chromium', 'chromium-browser'] },
};

/** Commande à lancer pour un navigateur, ou null s'il n'est pas installé. */
function commande(nom) {
  const n = NAVIGATEURS[nom];
  if (process.platform === 'darwin') {
    if (!n.mac) return null;
    const apps = [`/Applications/${n.mac}.app`, `/System/Applications/${n.mac}.app`, join(process.env.HOME ?? '', `Applications/${n.mac}.app`)];
    return apps.some((chemin) => existsSync(chemin)) ? (url) => ['open', ['-a', n.mac, url]] : null;
  }
  if (process.platform === 'win32') {
    if (!n.win) return null;
    const bases = [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA].filter(Boolean);
    const exe = bases.map((base) => join(base, n.win)).find((chemin) => existsSync(chemin));
    return exe ? (url) => [exe, [url]] : null;
  }
  const cmd = (n.linux ?? []).find((c) => spawnSync('which', [c]).status === 0);
  return cmd ? (url) => [cmd, [url]] : null;
}

function navigateurParDefaut(url) {
  if (process.platform === 'darwin') return ['open', [url]];
  if (process.platform === 'win32') return ['cmd', ['/c', 'start', '', url]];
  return ['xdg-open', [url]];
}

function lancer([cmd, args]) {
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
}

const installes = Object.keys(NAVIGATEURS).filter((nom) => commande(nom));
const usage = `Ouvrir : npm start [${[...installes, 'tous', 'aucun'].join('|')}] [chemin] · npm run ouvrir [navigateur|tous] [chemin]`;

const [choix, chemin = ''] = process.argv.slice(2);
const url = SITE + chemin.replace(/^\//, '');

if (choix === 'liste') {
  console.log(usage);
} else if (choix === 'aucun') {
  // npm start aucun : démarrage sans ouvrir de navigateur
} else if (!choix) {
  lancer(navigateurParDefaut(url));
  console.log(`🌐 ${url} (navigateur par défaut)`);
} else if (choix === 'tous') {
  for (const nom of installes) lancer(commande(nom)(url));
  console.log(`🌐 ${url} dans : ${installes.join(', ')}`);
} else if (!NAVIGATEURS[choix]) {
  console.error(`Navigateur inconnu : ${choix}. Installés : ${installes.join(', ')} (ou tous, aucun, liste)`);
  process.exit(1);
} else if (!installes.includes(choix)) {
  console.error(`${choix} n'est pas installé. Installés : ${installes.join(', ')}`);
  process.exit(1);
} else {
  lancer(commande(choix)(url));
  console.log(`🌐 ${url} dans ${choix}`);
}
