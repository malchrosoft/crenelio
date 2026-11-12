// Fichiers d'un paquet de déploiement, communs à deploy:init (Item 27) et release (Item 28).

/** Fichiers du site, à la même place que sur le serveur (dossier www/ OVH). */
export const SITE_FILES = [
  '.htaccess',
  '.ovhconfig',
  'api/.htaccess',
  'api/index.php',
  'api/config',
  'api/core',
  'api/controllers',
  'api/models',
  'api/routes',
  'api/cron',
  'api/public/assets',
];

/** Premier déploiement seulement : dossiers de stockage vides (jamais leur contenu). */
export const STORAGE_SKELETON = [
  'api/storage/.htaccess',
  'api/storage/branding/.gitkeep',
  'api/storage/insurance/.gitkeep',
  'api/storage/zone/.gitkeep',
  'api/storage/auth/.gitkeep',
  'api/storage/holidays/.gitkeep',
];
