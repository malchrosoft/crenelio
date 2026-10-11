# 📋 Fiche de Passation & Point d'Avancement — Crénelio

**Date :** 11 Octobre 2026
**Dépôt :** `/Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio`
**Dernier commit de référence :** `f3a1eb2` (`main`) — *Item 13 : recherche, filtres, RDV échus, reprogrammation*
**Travaux en cours (non commités) :** Item 1 — Frais de déplacement hybrides & gestion hors-zone.

---

## 1. Ce qui est réellement achevé

- **Item 13 (Recherche, filtres, RDV échus & reprogrammation) :** ✅ terminé et commité (`f3a1eb2`).
- **Item 1 (Frais de déplacement hybrides & hors-zone) :** ✅ implémenté et vérifié, **pas encore commité**.

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

- Migration idempotente disponible : `sql/migrations/2026-10-11_item1_travel_fees.sql` (déjà appliquée en dev).
- Reproductibilité vérifiée : `schema.sql` + `seed_init.sql` + `seed_test_data.sql` rejoués sur une base
  vierge produisent 33 clés de config et les 4 prestations de démo avec leurs modes de déplacement.
- ⚠️ `appointments` n'a toujours **ni** table `appointment_notifications`, **ni** colonne de statut d'envoi (Item 4).

### Écarts corrigés au passage
La base dev avait dérivé des fichiers `sql/` : colonnes `travel_fee_*` présentes en base mais absentes de
`schema.sql`, et clés `vitrine_*` / `legal_*` présentes dans `seed_init.sql` mais absentes de la base.
Les deux sens ont été réalignés.

---

## 3. Prochain chantier prioritaire

### 🎯 Item 4 — Notifications email, iCal & logs d'envoi IHM
1. Service d'envoi PHP (SMTP STARTTLS/TLS ou API Brevo / Resend / Mailjet), identifiants via `api/.env`.
2. Table `appointment_notifications` (`id`, `appointment_id`, `recipient`, `subject`, `status
   pending|sent|failed`, `sent_at`, `error_message`) — à ajouter dans `schema.sql` **et** en migration.
3. Email client (template HTML responsive, lien de gestion/annulation) et email artisan avec pièce
   jointe `.ics` (adresse, `tel:` cliquable, notes d'accès).
4. Consultation des logs d'envoi par rendez-vous depuis le planning Pro.

Item 12 (2FA email OTP) dépend du service mail de l'Item 4.

---

## 4. Rappels et contraintes d'ingénierie (AGENTS.md)
- **Frontend :** React 18 / TypeScript strict. Aucun `style={{...}}`, aucune micro-classe utilitaire ad hoc :
  classes BEM sémantiques dans `src/styles/_components.scss`, couleurs via `_variables.scss`.
- **Icônes :** `@phosphor-icons/react`, imports suffixés `Icon`, `weight="fill"`.
- **Validation avant commit :** `npm run build` **et** `npx tsc --noEmit` — `vite build` ne vérifie pas les types.
- **Schéma :** toute évolution va dans `sql/schema.sql` *et* dans une migration idempotente de `sql/migrations/`.
