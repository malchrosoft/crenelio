# Rétractation : contrat à distance ou au domicile du client

*Dernière vérification : 02/11/2026. Sources : fiche DGCCRF « Dépannage à domicile » (officielle) ; INC ;
sources secondaires sur L221-25. Articles du Code de la consommation à relire dans leur version
consolidée (voir [sources](../sources.md)).*

## Principe

Un devis accepté **en ligne** (contrat à distance) ou **signé au domicile** du client (contrat hors
établissement) ouvre au client particulier un **délai de rétractation de 14 jours** (C. consom.
L221-18). Le professionnel doit l'en informer avant la conclusion, et remettre :

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

Si l'information sur la rétractation manque, le délai est prolongé (jusqu'à 12 mois selon les sources
secondaires ; à confirmer dans L221-20).

## Exception : l'urgence

Pas de rétractation pour les « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (L221-28, 8°, cité par l'INC), **dans la limite des
pièces de rechange et travaux strictement nécessaires pour répondre à la situation d'urgence** (fiche
DGCCRF). L'urgence s'entend comme « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux ».

Tout travail **supplémentaire** proposé sur place reste soumis au délai de 14 jours.

## Commencer avant la fin du délai

Selon les sources secondaires (L221-25) : le professionnel ne peut commencer avant la fin du délai que
sur **demande expresse** du client ; si le client se rétracte ensuite, il doit un montant proportionnel
au service déjà fourni. Sans demande expresse recueillie, rien n'est dû.

## Exercice du droit : article L221-21 (version du 19 juin 2026)

*Texte officiel, rédaction issue de l'ordonnance n° 2026-2 du 5 janvier 2026 (art. 26 : en vigueur le
19 juin 2026 ; contrats en cours à cette date régis par les textes antérieurs). Reproduit le 02/11/2026 à
partir du texte fourni par le mainteneur.*

> Le consommateur exerce son droit de rétractation en informant le professionnel de sa décision de se
> rétracter par l'envoi, avant l'expiration du délai prévu à l'article L. 221-18, du formulaire de
> rétractation mentionné au 7° de l'article L. 221-5 ou de toute autre déclaration, dénuée d'ambiguïté,
> exprimant sa volonté de se rétracter.
>
> Le professionnel peut également permettre au consommateur de remplir et de transmettre en ligne, sur
> son site internet, le formulaire ou la déclaration prévus au premier alinéa. Dans cette hypothèse, le
> professionnel communique, sans délai, au consommateur un accusé de réception de la rétractation sur un
> support durable.
>
> Pour les contrats conclus à distance au moyen d'une interface en ligne, le professionnel met à la
> disposition du consommateur, sans frais pour ce dernier, une fonctionnalité lui permettant d'exercer
> gratuitement son droit de rétractation avant l'expiration du délai prévu à l'article L. 221-18.
>
> Un décret fixe les modalités de présentation et d'utilisation de cette fonctionnalité, de nature à
> garantir un accès facile, direct et permanent du consommateur à celle-ci.

**Correspondance dans Crénelio**

| Exigence de L221-21 | Mise en œuvre |
|---|---|
| Formulaire ou toute déclaration dénuée d'ambiguïté | Formulaire de rétractation imprimable ; l'email et l'adresse de l'entreprise figurent dans le modèle d'information |
| Envoi avant l'expiration du délai | Rétractation en ligne acceptée jusqu'à `withdrawal_until` inclus ; la date de la déclaration est enregistrée |
| Accusé de réception sans délai, sur support durable | Email envoyé dès la confirmation (`QuoteNotifier::sendWithdrawal`), journalisé |
| Fonctionnalité gratuite pour un contrat conclu via une interface en ligne | Bouton « Renoncer au contrat ici » sur la page du devis, sans compte ni frais |
| Accès facile, direct et permanent (décret) | Même lien que celui de l'accord (email), bouton visible pendant tout le délai |

## Fonction de rétractation en ligne (depuis le 19 juin 2026)

L'ordonnance n° 2026-2 et le décret n° 2026-3 du 5 janvier 2026 (transposition de la directive (UE)
2023/2673) imposent, pour tout contrat à distance conclu **via une interface en ligne**, une fonction de
rétractation gratuite (sources secondaires concordantes, articles à relire sur Légifrance) :

- identifiée par les mots « **renoncer au contrat ici** » ou une formule analogue dénuée d'ambiguïté ;
- visible, directement et facilement accessible **pendant tout le délai** de rétractation ;
- le consommateur y indique ou confirme son **nom et prénom**, le **contrat** concerné et le **moyen
  électronique** de recevoir l'accusé de réception, puis valide par « **confirmer la rétractation** » ;
- **accusé de réception** sur support durable, dans un délai raisonnable, reprenant le contenu de la
  déclaration et la **date et l'heure** de son envoi ;
- l'information précontractuelle indique où se trouve cette fonction ;
- sanction : amende administrative jusqu'à 15 000 € (personne physique) ou 75 000 € (personne morale).

Le modèle d'information (annexe à l'article R221-3) a été modifié en conséquence (version en vigueur au
19 juin 2026) : texte officiel et choix d'application dans [retractation-modele.md](retractation-modele.md).

## Dans Crénelio

- Case « intervention urgente » sur le devis : ni délai ni fonction de rétractation.
- Sinon, pour accepter, le client confirme avoir pris connaissance de son droit ; il peut demander
  l'exécution anticipée (case distincte) ; la fin du délai est enregistrée (`withdrawal_until`).
- Page du devis (`/devis/:token`) : information sur le délai et l'emplacement de la fonction avant
  l'accord ; après l'accord, bouton « Renoncer au contrat ici », déclaration (nom, email de l'accusé,
  contrat rappelé), bouton « Confirmer la rétractation » ; statut `withdrawn`, déclaration conservée
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Accusé de réception par email au client (contenu, date et heure) et avis à l'artisan (remboursement
  sous 14 jours) ; l'email d'accord rappelle la date limite et l'emplacement de la fonction.
- Horodatages : la connexion MySQL est alignée sur le fuseau de l'application.
- Page du devis : modèle d'information réglementaire affiché mot pour mot (`src/utils/withdrawalNotice.ts`).
- Versions imprimables (`/devis/:token/imprimer`) : modèle d'information dans le devis ; **formulaire type**
  (« formulaire de rétractation mentionné au 7° de l'article L. 221-5 ») repris du modèle européen
  (directive 2011/83/UE, annexe I B, sans télécopieur depuis le décret n° 2022-424) : **à confirmer
  contre l'annexe à l'article R221-1 en vigueur** (texte non encore fourni).
