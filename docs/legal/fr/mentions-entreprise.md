# Mentions de l'entreprise sur les devis, factures et publicités

*Dernière vérification : 01/11/2026. Sources : fiche DGCCRF (publicité) ; Bpifrance Création et autres
sources secondaires (mention EI) ; textes à relire : C. com. R526-27, C. consom. L616-1.*

## Textes officiels (vérifié le 04/11/2026)

[textes/code-commerce.md](textes/code-commerce.md), [textes/code-consommation.md](textes/code-consommation.md)
et [textes/code-artisanat.md](textes/code-artisanat.md) :

- **EI** (C. com. R526-27) : nom ou nom d'usage précédé ou suivi immédiatement de « entrepreneur
  individuel » ou « EI », sur les documents et correspondances professionnels et l'intitulé du compte
  bancaire dédié.
- **Société** (C. com. R123-238) : dénomination précédée ou suivie de la forme (« SARL », « SAS »,
  « SA », « SCA », « SE », « SNC », « SCS »…) ; **capital social** obligatoire pour SARL et sociétés par
  actions (SAS, SA, SCA, SE), pas pour SNC ni SCS. EURL et SASU sont des SARL et SAS à associé unique.
- **Personne immatriculée** (C. com. R123-237) : numéro unique d'identification, « RCS » + ville du greffe
  si immatriculée au RCS, siège social, mention EI ; mêmes mentions **sur le site internet**.
- **Informations au consommateur** (C. consom. R111-1 et R111-2) : statut et forme juridique ;
  immatriculation **au RCS ou au Registre national des entreprises** (secteur des métiers et de
  l'artisanat : le « répertoire des métiers » n'existe plus) ; **numéro de TVA intracommunautaire** si
  assujetti ; assurance avec **coordonnées de l'assureur et couverture géographique** ; conditions
  générales s'il en utilise ; modalités de paiement, d'exécution et de traitement des réclamations ;
  garanties légales ; médiateur.
- **Médiateur** (C. consom. R616-1) : coordonnées **et adresse du site internet** du médiateur, de manière
  visible sur le site, les conditions générales ou les bons de commande.
- **Mot « artisan »** (C. artisanat L241-2) : amende de 7 500 € pour l'usage du mot « artisan » ou de ses
  dérivés dans l'appellation, l'enseigne, la promotion ou la publicité sans détenir la qualité d'artisan
  (L211-1 : diplôme, titre ou expérience). Les activités de bâtiment et de fluides exigent en outre une
  qualification professionnelle (L121-1).

## Entrepreneur individuel (« EI »)

Depuis le 15 mai 2022 (décret n° 2022-725), l'entrepreneur individuel, y compris micro-entrepreneur,
exerce sous une dénomination comprenant son nom, **immédiatement précédé ou suivi** de « entrepreneur
individuel » ou « EI » (C. com. R526-27). Documents concernés : factures, devis, tarifs, publicités,
correspondances, cartes de visite ; le compte bancaire professionnel aussi.

**Dans Crénelio** : forme juridique `legal_form` (« Entreprise individuelle » par défaut) ; pour une
entreprise individuelle, appellation `legal_ei_mention` au choix « EI » ou « Entrepreneur individuel ».

## Société (EURL, SARL, SASU, SAS…)

Les documents d'une société indiquent sa dénomination, sa **forme juridique** et le montant de son
**capital social** (`legal_capital`, modifiable et imprimé seulement pour EURL, SARL, SASU et SAS ; `CAPITAL_FORMS` dans `configSchema.ts`), avec le numéro RCS (à relire : C. com. R123-237 et R123-238).

## Identification

- SIRET ; numéro d'inscription au répertoire des métiers (RM) ou au RCS (`legal_rm`).
- Assurance professionnelle (`legal_assurance`) ; décennale pour les travaux qui l'exigent (Item 39).

## Médiateur de la consommation

Tout professionnel qui traite avec des particuliers doit leur permettre de recourir gratuitement à un
médiateur et en communiquer les coordonnées (C. consom. L616-1). Réglage `legal_mediator`.

## Publicité du dépannage à domicile (fiche DGCCRF)

> « Toute publicité écrite, permettant une commande à distance […], à l'exception des annuaires, doit
> comporter les mentions suivantes :
> - le nom, la raison sociale et l'adresse de l'entreprise ;
> - son numéro d'inscription au registre du commerce ou au répertoire des métiers ;
> - les taux horaires de main-d'œuvre toutes taxes comprises pratiqués pour chaque catégorie de
>   prestation concernée ou les prix unitaires, quelles que soient les unités ;
> - les frais de déplacement, lorsque les entreprises se rendent au domicile du consommateur ;
> - le caractère payant ou non du document précontractuel ;
> - le cas échéant, toute autre condition de rémunération. »

La vitrine de Crénelio permet la réservation en ligne : à vérifier dans l'Item 39.
