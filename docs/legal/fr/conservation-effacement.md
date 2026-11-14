# Conservation et effacement des données des clients

*Dernière vérification : 14/11/2026. Base légale : Code de la consommation, L213-1, D213-1 et D213-2
(conservation des contrats conclus par voie électronique) ; Code de commerce, L123-22 (pièces
justificatives) ; règlement (UE) 2016/679 (RGPD), articles 5, 6 et 17. Textes mot pour mot :
[textes/code-consommation.md](textes/code-consommation.md), [textes/code-commerce.md](textes/code-commerce.md),
[textes/droit-europeen.md](textes/droit-europeen.md). Fiche d'aide, pas un conseil juridique.*

## L'essentiel

| Donnée | Conservée | Puis |
|---|---|---|
| Rendez-vous (nom, email, téléphone, adresse, notes) | La durée réglée (écran Compte, 36 mois par défaut) après l'intervention | **Supprimé** automatiquement |
| Devis **non accepté** (brouillon, envoyé, refusé, expiré, annulé) | La même durée | **Supprimé** automatiquement |
| Devis **accepté** (contrat), même rétracté ensuite | **Dix ans** après l'intervention (ou l'accord, à défaut), avec la trace de l'accord ; au terme de l'intervention, il est **archivé** (filtre « Archivés » de l'écran Devis) | **Supprimé** automatiquement, avec son rendez-vous |

Pourquoi supprimer plutôt qu'« anonymiser » : une ligne gardée avec sa date, sa prestation, son montant et sa commune
peut encore désigner le client, par exemple en la rapprochant d'une facture. Retirer le nom ne suffit pas à rendre une
donnée anonyme : il ne faut plus pouvoir isoler une personne, relier ses données ni déduire une information à son sujet
(groupe de l'article 29, avis 05/2014 sur les techniques d'anonymisation, p. 9 et 10). Crénelio supprime donc, au lieu
de garder des lignes « anonymisées ».

*Portée de cette source (vérifiée le 14/11/2026)* : l'avis 05/2014 est **antérieur au RGPD** (adopté en 2016, applicable
depuis le 25 mai 2018) et ne figure pas dans la liste des documents du groupe de l'article 29 repris par le Comité
européen de la protection des données lors de sa première séance ; il reste toutefois la référence citée par la CNIL
dans son guide des durées de conservation (juillet 2020) et son référentiel de gestion commerciale (délibération
n° 2021-131, publiée au Journal officiel du 10/04/2022). Le Comité a soumis à consultation des lignes directrices sur la pseudonymisation (01/2025, version
finale non confirmée à cette date). La suppression retenue par Crénelio ne dépend pas de ces débats : une donnée
supprimée n'a plus à être qualifiée.

Pendant sa conservation, un devis accepté est en **archivage intermédiaire** au sens de la CNIL : seules les données qui
constatent le contrat sont gardées (le téléphone du client est retiré), il sort de la liste courante des devis et ne se
consulte que si besoin, par exemple pour un litige ou une demande du client (CNIL, guide des durées de conservation,
juillet 2020, et référentiel « gestion des activités commerciales »).

## Pourquoi dix ans pour un devis accepté

- **Contrat conclu en ligne de 120 € ou plus** : obligation. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » et « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). Le montant est fixé à 120 euros (D213-1) ; la durée, à dix ans à compter de la
  conclusion, ou de l'exécution quand elle est différée (D213-2). Un devis accepté depuis sa page en ligne
  entre dans ce cas.
- **En deçà de 120 €** : la loi ne l'impose pas au titre de L213-1. Crénelio applique **la même durée par
  prudence** : un devis accepté est une pièce qui justifie votre facture, et le Code de commerce prévoit que
  « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). Ce
  texte vise d'abord les commerçants : votre expert-comptable vous dira s'il s'applique à votre situation.

## Un contrat figé, et sa preuve

Le devis est **figé** :

- **à l'envoi**, les mentions de votre entreprise (nom, identité légale, adresse, SIRET, assurance, médiateur,
  réclamations…) sont copiées sur le devis : s'il est consulté dans huit ans, il présente celles qui figuraient sur
  le devis envoyé, même si vous avez changé d'adresse ou de médiateur entre-temps ;
- **à l'acceptation**, Crénelio calcule une **empreinte** (SHA-256) de tout ce qui constitue le contrat et de la
  trace de l'accord. Recalculée à la demande, elle montre que rien n'a changé depuis : l'éditeur du devis indique
  « Contrat figé : oui, intact ».

Cela répond aux conditions de l'écrit électronique : il « a la même force probante que l'écrit sur support papier,
sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit établi et conservé dans des
conditions de nature à en garantir l'intégrité » (C. civ. 1366). L'acceptation en ligne est une **signature
électronique simple** : valable, mais sa fiabilité n'est pas présumée, contrairement à une signature qualifiée
(C. civ. 1367 ; décret n° 2017-1416, art. 1) ; en cas de litige, c'est à vous de prouver l'identification et
l'intégrité, d'où ce figement. Les devis acceptés avant le 14/11/2026 ne sont pas figés.

Chaque devis annonce aussi au client ces modalités de conservation et d'accès (C. civ. 1127-1, 4°).

Le devis conservé comprend ce qui constate le contrat : vos lignes et prix, l'identité et l'adresse du client,
la date et la trace de son accord (adresse IP), ses réponses (pièces remplacées, mandat de débours) et, le
cas échéant, sa déclaration de rétractation.

## Quand un client demande l'effacement

Le RGPD lui donne ce droit (article 17), sauf quand la conservation est « nécessaire […] pour respecter une
obligation légale » (article 17, paragraphe 3, b). Concrètement, avec « Effacer le client » :

- **sont supprimés** : le rendez-vous, ses devis non acceptés et leur journal des emails ;
- **reste intact** : tout devis **accepté**, jusqu'à la fin de ses dix ans ; son rendez-vous est gardé, réduit à sa date. La fenêtre de confirmation vous
  indique lesquels ; dites-le au client, en citant ces textes ;
- **rendez-vous à venir** non annulé : la confirmation vous prévient que vous ne pourrez plus joindre le
  client. Annulez d'abord le rendez-vous si l'intervention n'a plus lieu.

L'effacement est irréversible. La politique de confidentialité du site informe les clients de ces durées.

## Ce que vous gardez ailleurs

Crénelio ne remplace pas votre logiciel de facturation ni votre comptabilité : vos factures, vos livres et
les justificatifs d'achat (débours) se conservent selon les règles qui vous sont propres (voir
[note et facture](note-facture.md) et l'[aide-mémoire](rappels-artisan.md)).
