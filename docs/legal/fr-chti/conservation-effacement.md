# Conservation et effacemint des données des clients

*Version in ch'ti, pour l'plaisir, d'el fiche française du 14/11/2026 ; ch'est l'version française qui fait foi. Les textes officiels, eux, i restent in français.*

*Dernière vérification : 14/11/2026. Base légale : Code de la consommation, L213-1, D213-1 et D213-2
(conservation des contrats conclus par voie électronique) ; Code de commerce, L123-22 (pièces
justificatives) ; règlemint (UE) 2016/679 (RGPD), articles 5, 6 et 17. Textes mot pour mot :
[../fr/textes/code-consommation.md](../fr/textes/code-consommation.md), [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md),
[../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md). Fiche d'aide, point un conseil juridique.*

## L'essintiel

| Donnée | Gardée | Pis |
|---|---|---|
| Rindez-vous (nom, email, téléphone, adresse, notes) | L'durée réglée (écran Compte, 36 mois d'base) après l'intervintion | **Supprimé** tout seu |
| Devis **point accepté** (brouillon, invoyé, refusé, expiré, annulé) | L'même durée | **Supprimé** tout seu |
| Devis **accepté** (contrat), même rétracté après | **Dix ans** après l'intervintion (ou l'accord, sinon), avec l'trace d'l'accord ; à l'fin d'l'intervintion, i est **archivé** (filtre « Archivés » d'l'écran Devis) | **Supprimé** tout seu, avec sin rindez-vous |

Pourquoi supprimer pustôt qu'« anonymiser » : eune ligne gardée avec s'date, s'prestation, sin montant et s'commune
al peut cor désigner l'client, par exempe in l'rapprochant d'eune facture. Ôter l'nom, cha suffit point pour rinde
eune donnée anonyme : i faut pus pouvoir isoler eune personne, relier ses données ni déduire eune information su li
(groupe de l'article 29, avis 05/2014 sur les techniques d'anonymisation, p. 9 et 10). Crénelio i supprime donc, au
lieu d'garder des lignes « anonymisées ».

*Portée d'ech'source (vérifiée l'14/11/2026)* : l'avis 05/2014 il est **d'avant l'RGPD** (adopté in 2016, applicabe
d'pis l'25 mai 2018) et i n'est point dins l'liste des documints du groupe de l'article 29 repris par l'Comité
européen de la protection des données à s'première séance ; mais i reste quand même l'référence citée par l'CNIL
dins sin guide des durées de conservation (juillet 2020) et sin référentiel d'gestion commerciale (délibération
n° 2021-131, publiée au Journal officiel du 10/04/2022). L'Comité il a mis à consultation des lignes directrices su l'pseudonymisation (01/2025, version
finale point confirmée à ch'date-lo). L'suppression qu'Crénelio il a choisie al dépind point d'ches débats-lo :
eune donnée supprimée, al a pus à être qualifiée.

Pindant qu'il est gardé, un devis accepté il est in **archivage intermédiaire** au sens d'el CNIL : i n'y a qu'les
données qui constatent l'contrat qui sont gardées (l'téléphone du client il est ôté), i sort d'el liste courante des
devis et on n'l'consulte qu'si besoin, par exempe pour un litige ou eune demande du client (CNIL, guide des durées
de conservation, juillet 2020, et référentiel « gestion des activités commerciales »).

## Pourquoi dix ans pour un devis accepté

- **Contrat conclu in ligne d'120 € ou pus** : obligation. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » et « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). L'montant il est fixé à 120 euros (D213-1) ; l'durée, à dix ans à compter d'el
  conclusion, ou d'l'exécution quand al est r'tardée (D213-2). Un devis accepté d'pis s'page in ligne
  i rinte dins ch'cas-lo.
- **In d'sous d'120 €** : l'loi al l'impose point au titre d'L213-1. Crénelio i fait **l'même durée par
  prudince** : un devis accepté, ch'est eune pièce qui justifie vo facture, et l'Code de commerce i prévot
  qu'« les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). Ch'
  texte-lo i vise d'abord les commerçants : vo expert-comptabe i vous dira s'i s'applique à vous.

## Un contrat figé, et s'preuve

L'devis il est **figé** :

- **à l'invoi**, les mintions d'vo intreprise (nom, identité légale, adresse, SIRET, assurance, médiateur,
  réclamations…) sont copiées su l'devis : si on l'consulte dins huit ans, i montre cheulles qu'étoient su l'devis
  invoyé, même si vous avez canjé d'adresse ou d'médiateur intre-temps ;
- **à l'acceptation**, Crénelio i calcule eune **impreinte** (hash, SHA-256) d'tout ch'qui fait l'contrat et d'l'trace
  d'l'accord. Recalculée quand on veut, al montre qu'rien n'a bougé d'pis : l'éditeur du devis i marque
  « Contrat figé : oui, intact ».

Cha répond aux conditions d'l'écrit électronique : i « a la même force probante que l'écrit sur support papier,
sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit établi et conservé dans des
conditions de nature à en garantir l'intégrité » (C. civ. 1366). L'acceptation in ligne, ch'est eune **signature
électronique simpe** : valabe, mais s'fiabilité al est point présumée, contrairemint à eune signature
qualifiée (C. civ. 1367 ; décret n° 2017-1416, art. 1) ; s'i y a un litige, ch'est à vous d'prouver
l'identification et l'intégrité, d'où ch'figemint. Les devis acceptés avant l'14/11/2026 i sont point figés.

Chaque devis i annonce aussi au client ches modalités d'conservation et d'accès (C. civ. 1127-1, 4°).

L'devis gardé i comprind ch'qui constate l'contrat : vos lignes et vos prix, l'identité et l'adresse du client,
l'date et l'trace d'sin accord (adresse IP), ses réponses (pièces replacées, mandat d'débours) et, si y a
lieu, s'déclaration d'rétractation.

## Quand un client i d'mande l'effacemint

L'RGPD i li donne ch'droit-lo (article 17), sauf quand l'conservation al est « nécessaire […] pour respecter
une obligation légale » (article 17, paragraphe 3, b). Pour d'vrai, avec « Effacer le client » :

- **ch'est supprimé** : l'rindez-vous, ses devis point acceptés et leu journal des emails ;
- **i reste intact** : tout devis **accepté**, jusqu'à l'fin d'ses dix ans ; sin rindez-vous il est gardé, réduit
  à s'date. L'fernête d'confirmation al vous
  dit lesquels ; dites-l au client, in citant ches textes ;
- **rindez-vous à v'nir** point annulé : l'confirmation al vous prévient qu'vous pourrez pus joinde l'client.
  Annulez d'abord l'rindez-vous si l'intervintion al a pus lieu.

L'effacemint, on peut point r'venir dessus. L'politique d'confidentialité du site al informe les clients
d'ches durées.

## Ch'que vous gardez ailleurs

Crénelio i replace point vo logiciel d'facturation ni vo comptabilité : vos factures, vos lives et les
justificatifs d'acats (débours) i s'gardent selon les règles qui sont les vôtes (vir
[note et facture](note-facture.md) et l'[aide-mémoire](rappels-artisan.md)).
