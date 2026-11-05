# Rétractation : contrat à distance ou au domicile du client

*Version in ch'ti, pour l'plaisir, d'el fiche française du 04/11/2026 ; ch'est l'version française qui fait foi. Les textes officiels, eux, i restent in français.*

*Dernière vérification : 04/11/2026 (textes officiels : [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)). Sources : fiche DGCCRF « Dépannage à domicile » (officielle) ; INC ;
sources secondaires su L221-25. Articles du Code de la consommation à r'lire dins leu version
consolidée (vir [sources](../sources.md)).*

## L'principe

Un devis accepté **in ligne** (contrat à distance) ou **signé au domicile** du client (contrat hors
établissemint), cha donne au client particulier un **délai d'rétractation d'14 jours** (C. consom.
L221-18). L'professionnel i doit l'in informer avant l'conclusion, et donner :

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

Si l'information su l'rétractation all' manque, l'délai i est prolongé d'douze mos (L221-20, confirmé).

## Exception : l'urgence

Point d'rétractation pour les « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (L221-28, 8°, cité par l'INC), **dins l'limite des
pièces d'rechange et travaux strictemint nécessaires pour répondre à l'situation d'urgence** (fiche
DGCCRF). L'urgence, ch'est « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux ».

Tout travail **in pus** proposé su place, i reste soumis au délai d'14 jours.

## Quemincher avant l'fin du délai

D'après L221-25 (texte officiel ichi au-d'sus) : l'professionnel i peut quemincher avant l'fin du délai
qu'su **demande expresse** du client ; si l'client i s'rétracte après, i doit un montant proportionnel
au service déjà fourni. Sans demande expresse r'cueillie, i doit rin.

## Ch'que dis'tent les textes officiels (vérifié l'04/11/2026)

Texte intégral : [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Définitions** (L221-1) : contrat **à distance** = conclu sans ête physiquemint insanne au même
  momint, rin qu'avec des techniques d'communication à distance jusqu'à l'conclusion ; contrat **hors
  établissemint** = conclu insanne, physiquemint, au même momint, hors du lieu d'activité habituel, **y
  compris à l'suite d'eune sollicitation du consommateur** (devis signé au domicile du client), ou à
  distance tout d'suite après eune sollicitation personnelle faite hors d'ce lieu. Un contrat qui transfère
  l'propriété d'un bien **et** qui fournit eune prestation, i est **assimilé à eune vinte** (II) : à
  surveiller pour les lignes « fourniture revendue » (délai à compter d'el réception du bien).
- **Délai** (L221-18) : quatorze jours à compter **d'el conclusion du contrat** pour eune prestation d'
  services. **Calcul** (L221-19) : l'jour d'el conclusion i compte point ; l'délai i expire à l'fin du
  dernier jour ; s'i tombe un sam'di, un dimanche ou un jour férié ou chômé, i est prorogé jusqu'au
  premier jour ouvrable d'après. → `Quote::withdrawalDeadline` (jours fériés légaux, Pâques calculée).
- **Information qui manque** (L221-20) : délai prolongé d'douze mos ; ramené à quatorze jours à compter
  d'el réception d'l'information si all' est donnée intre-temps.
- **Exécution anticipée** (L221-25) : demande expresse r'cueillie « par tout moyen » à distance, « sur
  papier ou sur support durable » hors établissemint ; l'professionnel **d'mande au consommateur d'
  reconnaîte** qu'après exécution complète i n'aura pus l'droit d'rétractation. Sans demande expresse
  r'cueillie, ou sans l'information du 9° d'L221-5, **i n'doit aucune somme**.
  → texte d'el case complété (page, version imprimable, email d'accord).
- **Exceptions** (L221-28) : 1° service fait in intier avant l'fin du délai, avec accord exprès et
  reconnaissance d'el perte du droit → `Quote::canWithdraw` i r'fuse l'rétractation quand l'rendez-vous
  du devis est « terminé » et qu'l'exécution anticipée all' avot été d'mandée ; 8° travaux urgents
  expressémint sollicités, dins l'limite du strictemint nécessaire.
- **Information** (L221-5, 7° et 10°) : conditions, délai, modalités, formulaire type et emplacemint d'el
  fonction d'rétractation ; si l'droit i existe point (urgence), l'information qu'el consommateur i n'in
  bénéficie point.
- **Hors établissemint** (L221-9) : exemplaire daté du contrat, papier signé ou support durable, avec
  toutes les informations d'L221-5 et **accompagné du formulaire type**. (L221-10) : **aucun paiemint ni
  contrepartie avant sept jours** à compter d'el conclusion, sauf travaux urgents (4°).
- **Fonction in ligne** (D221-5, créé par l'décret n° 2026-3) : libellés « renoncer au contrat ici » et
  « confirmer la rétractation », déclaration (nom et prénom, contrat, moyen électronique d'l'accusé),
  accusé d'réception qui r'prind l'contenu, l'date et l'heure. Conforme à ch'qui est fait dins l'code.
- **Formulaire type** (annexe à l'article R221-1, décret n° 2022-424) : reproduit mot pour mot dins l'
  version imprimable.

## Exercice du droit : article L221-21 (version du 19 juin 2026)

*Texte officiel, rédaction issue d'l'ordonnance n° 2026-2 du 5 janvier 2026 (art. 26 : in vigueur l'
19 juin 2026 ; contrats in cours à cheulle date régis par les textes d'avant). Reproduit l'02/11/2026 à
partir du texte fourni par l'mainteneur.*

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

**Ch'qui correspond dins Crénelio**

| Exigence d'L221-21 | Mise in œuvre |
|---|---|
| Formulaire ou n'importe quelle déclaration sans ambiguïté | Formulaire d'rétractation imprimable ; l'email et l'adresse d'l'intreprise sont dins l'modèle d'information |
| Invoi avant l'fin du délai | Rétractation in ligne acceptée jusqu'à `withdrawal_until` inclus ; l'date d'el déclaration est enregistrée |
| Accusé d'réception sans délai, su support durable | Email invoyé dès l'confirmation (`QuoteNotifier::sendWithdrawal`), journalisé |
| Fonctionnalité gratuite pour un contrat conclu via eune interface in ligne | Bouton « Renoncer au contrat ici » su l'page du devis, sans compte ni frais |
| Accès facile, direct et permanent (décret) | Même lien qu'chti d'l'accord (email), bouton visible pindant tout l'délai |

## Fonction d'rétractation in ligne (depuis l'19 juin 2026)

L'ordonnance n° 2026-2 et l'décret n° 2026-3 du 5 janvier 2026 (transposition d'el directive (UE)
2023/2673) i imposent, pour tout contrat à distance conclu **via eune interface in ligne**, eune fonction d'
rétractation gratuite (**confirmé par l'article D221-5**, texte dins [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)) :

- marquée avec les mots « **renoncer au contrat ici** » ou eune formule du même genre, sans ambiguïté ;
- visible, directemint et facilemint accessible **pindant tout l'délai** d'rétractation ;
- l'consommateur i y met ou i confirme sin **nom et prénom**, l'**contrat** concerné et l'**moyen
  électronique** d'recevoir l'accusé d'réception, pis i valide par « **confirmer la rétractation** » ;
- **accusé d'réception** su support durable, dins un délai raisonnable, qui r'prind l'contenu d'el
  déclaration et l'**date et l'heure** d'sin invoi ;
- l'information précontractuelle all' dit où qu'all' est cheulle fonction ;
- sanction : amende administrative jusqu'à 15 000 € (personne physique) ou 75 000 € (personne morale).

L'modèle d'information (annexe à l'article R221-3) a été modifié in conséquence (version in vigueur au
19 juin 2026) : texte officiel et choix d'application dins [retractation-modele.md](retractation-modele.md).

## Dins Crénelio

- Case « intervention urgente » su l'devis : ni délai ni fonction d'rétractation.
- Sinon, pour accepter, l'client i confirme qu'il a pris connaissance d'sin droit ; i peut d'mander
  l'exécution anticipée (case à part) ; l'fin du délai est enregistrée (`withdrawal_until`).
- Page du devis (`/devis/:token`) : information su l'délai et l'emplacemint d'el fonction avant
  l'accord ; après l'accord, bouton « Renoncer au contrat ici », déclaration (nom, email d'l'accusé,
  contrat rappelé), bouton « Confirmer la rétractation » ; statut `withdrawn`, déclaration gardée
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Accusé d'réception par email au client (contenu, date et heure) et avis à l'artisan (remboursemint
  sous 14 jours) ; l'email d'accord i rappelle l'date limite et l'emplacemint d'el fonction.
- Horodatages : l'connexion MySQL est alignée su l'fuseau d'l'application.
- Page du devis : modèle d'information réglementaire affiché mot pour mot (`src/utils/withdrawalNotice.ts`).
- **Formulaire in ligne prérempli** (`/devis/:token/retractation`) : modèle d'l'annexe R221-1 mot pour
  mot, transmis par l'fonction d'rétractation ; **PDF remplissable** joint à l'email d'accord ;
  déclaration validée téléchargeable in PDF et jointe aux accusés. L'client est informé d'cheulle
  facilité (texte `ONLINE_FORM_NOTICE`, hors du modèle réglementaire).
- **Exemplaire du contrat** (L221-9) : l'email invoyé au client après sin accord i r'prind toutes les
  informations du contrat, l'modèle d'information et l'formulaire type (`LegalTexts.php`).
- Versions imprimables (`/devis/:token/imprimer`) : modèle d'information dins l'devis ; formulaire type
  d'l'annexe à l'article R221-1, **mot pour mot** (confirmé l'04/11/2026).
