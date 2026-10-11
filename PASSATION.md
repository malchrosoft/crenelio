# 📋 Fiche de Passation & Point d'Avancement — Crénelio

**Date :** 11 Octobre 2026
**Dépôt :** `/Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio`
**Dernier commit :** `1c29a47` (`main`, poussé) — *docs(agents) : contraintes connues & dette technique*
**Statut Git :** propre, rien en suspens — tout est poussé sur `origin/main`.

---

## 1. Ce qui est réellement achevé

- **Item 13 (Recherche, filtres, RDV échus & reprogrammation) :** ✅ terminé et commité (`f3a1eb2`).
- **Item 1 (Frais de déplacement hybrides & hors-zone) :** ✅ terminé, commité et poussé (`cb9c0df` / `c1f5e38`).
- **Item 4 (Notifications email, iCal & journal d'envoi) :** ✅ terminé, commité et poussé (`762e94e` / `1372d87`).

### Détail de l'Item 4
- **`api/core/Mailer.php`** : client SMTP natif (socket, STARTTLS 587 ou TLS implicite 465,
  `AUTH LOGIN`), MIME `multipart/mixed` > `multipart/alternative` (texte + HTML) + pièce jointe,
  en-têtes RFC 2047 avec repli des sujets longs (toutes les lignes d'en-tête restent ≤ 78 caractères).
- **`api/core/ICalendar.php`** : `.ics` RFC 5545, créneau élargi du `buffer_minutes` de trajet,
  lieu, coordonnées client et notes d'accès, pliage de lignes à 75 octets sans casser l'UTF-8.
- **`api/core/EmailTemplates.php`** : gabarits responsive (tableaux, styles en ligne — seule mise en
  forme fiable en email) et alternative texte brut pour la délivrabilité.
- **`api/core/Notifier.php`** : journalise en `pending` *avant* l'appel SMTP, bascule en `sent` /
  `failed`, n'émet aucune exception vers le contrôleur.
- **Endpoints** : `GET /appointments/:id/notifications` et `POST /appointments/:id/notifications/resend`.
- **Page publique `/rdv/:token`** (`AppointmentManagePage.tsx`) : cible du lien de gestion envoyé au
  client, réutilise `BookingConfirmation` via la prop `showNewBooking`.
- **IHM Pro** : bouton « Emails » par rendez-vous ouvrant le journal (statut coloré, destinataire,
  sujet, horodatage, motif d'échec) avec relance manuelle par type.
- **Secrets** : `SMTP_*`, `MAIL_FROM*`, `APP_URL`, `APP_TIMEZONE` lus uniquement dans `api/.env`.
  ⚠️ **Ces clés ne sont pas encore renseignées** : en local comme en prod, tant que `SMTP_HOST` est
  vide, les envois sont journalisés en `failed` (« Envoi d'emails non configuré ») sans jamais
  bloquer une réservation. Voir `DEPLOYMENT.md`, étape 4b.

### Détail de l'Item 1
- **Moteur `api/core/TravelFee.php`** : distance géodésique (Haversine) entre `config.default_latitude/longitude`
  et l'adresse BAN du client ; résolution des paliers ; détection du hors-zone.
  Trois modes portés par la prestation : `none`, `fixed`, `distance_tiers`.
- **Endpoint public `POST /api/travel-fee/quote`** (`api/controllers/TravelFeeController.php`) :
  renvoie `{ mode, service_price, travel_fee, total, distance_km, is_out_of_zone, max_km, needs_coordinates, tiers }`.
- **`AppointmentController::store`** recalcule systématiquement le devis côté serveur :
  - `400` si la prestation facture à la distance et que l'adresse n'est pas géocodée ;
  - `422` (`code: out_of_zone`) au-delà de `config.travel_max_km`, avec email et téléphone du pro ;
  - frais figés en base dans `appointments.travel_fee` / `distance_km` / `is_out_of_zone`.
- **Tunnel de réservation** (`BookingForm.tsx`) : devis en direct dès la sélection d'adresse, décomposition
  Prestation + Déplacement (+ distance) = Total estimé, blocage bienveillant hors zone avec `mailto:`
  pré-rempli de demande exceptionnelle et lien `tel:`.
- **Confirmation** (`BookingConfirmation.tsx`) et **vitrine** (`ServicesSection.tsx`) : rappel du détail tarifaire.
- **Espace Pro** (`AdminDashboard.tsx`) : mode et forfait de déplacement en création et édition de prestation,
  badge dédié sur les cartes, nouvel onglet **« Zone & déplacement »** pour les 3 paliers et le rayon maximal.
- **Helpers partagés** : `src/utils/format.ts` (`formatEuro`, `formatKm`).

---

## 2. État exact de la base de données

| Table | Colonnes de l'Item 1 | Statut |
|---|---|---|
| `services` | `travel_fee_mode`, `travel_fee_amount` | ✅ en base **et** dans `sql/schema.sql` |
| `appointments` | `travel_fee`, `distance_km`, `is_out_of_zone` | ✅ en base **et** dans `sql/schema.sql` |
| `config` | `travel_tier_{1,2,3}_max_km`, `travel_tier_{1,2,3}_fee`, `travel_max_km` | ✅ en base **et** dans `sql/seed_init.sql` |
| `appointment_notifications` | table complète (Item 4), `ON DELETE CASCADE` depuis `appointments` | ✅ en base **et** dans `sql/schema.sql` |

- Migrations idempotentes disponibles, déjà appliquées en dev :
  `sql/migrations/2026-10-11_item1_travel_fees.sql` et `sql/migrations/2026-10-11_item4_notifications.sql`.
- Reproductibilité vérifiée : `schema.sql` + `seed_init.sql` + `seed_test_data.sql` rejoués sur une base
  vierge produisent 33 clés de config et les 4 prestations de démo avec leurs modes de déplacement.
- Reproductibilité revérifiée après l'Item 4 : les 6 tables et les 33 clés de config sont recréées
  à l'identique sur une base vierge.

### Écarts corrigés au passage
La base dev avait dérivé des fichiers `sql/` : colonnes `travel_fee_*` présentes en base mais absentes de
`schema.sql`, et clés `vitrine_*` / `legal_*` présentes dans `seed_init.sql` mais absentes de la base.
Les deux sens ont été réalignés.

---

## 3. Prochain chantier prioritaire

### 🎯 Item 12 — Sécurité 2FA Espace Pro (OTP email, appareil de confiance 10 jours)
Le service mail de l'Item 4 est en place, la dépendance est levée.
1. Étape 1 : vérification du mot de passe admin (Bcrypt, déjà en place).
2. Étape 2 : jeton d'appareil signé (`device_token`) valable 10 jours, stocké côté client.
3. Étape 3 : OTP à 6 chiffres (`random_int`), 15 min de validité, 3 tentatives, envoyé à `pro_email`
   via `Notifier` / `Mailer`.

⚠️ L'espace Pro n'est **pas protégé côté serveur** : le token de `ConfigController::login` est
trivial et aucune route `/admin/*` ne le vérifie. La 2FA seule ne corrigerait rien — il faut
embarquer la vérification serveur dans le même chantier.

### Contraintes et reliquats
Consignés dans [`AGENTS.md`](AGENTS.md), section *5. Contraintes Connues & Dette Technique*
(sécurité de l'espace Pro, fichiers `.env` hors de portée des agents, envoi d'emails désactivé
sans SMTP, fuseau horaire, absence de notification à l'annulation).

---

## 4. Rappels et contraintes d'ingénierie (AGENTS.md)
- **Frontend :** React 18 / TypeScript strict. Aucun `style={{...}}`, aucune micro-classe utilitaire ad hoc :
  classes BEM sémantiques dans `src/styles/_components.scss`, couleurs via `_variables.scss`.
- **Icônes :** `@phosphor-icons/react`, imports suffixés `Icon`, `weight="fill"`.
- **Validation avant commit :** `npm run build` **et** `npx tsc --noEmit` — `vite build` ne vérifie pas les types.
- **Schéma :** toute évolution va dans `sql/schema.sql` *et* dans une migration idempotente de `sql/migrations/`.
