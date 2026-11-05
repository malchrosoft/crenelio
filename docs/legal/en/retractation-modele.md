# Information model on the right of withdrawal (annex to article R221-3)

*Translation of the French version dated 02/11/2026 — the French version prevails. Official texts are quoted in French.*

*Official text (Code de la consommation, French Consumer Code), version in force since 19 June 2026, amended by
decree no. 2026-3 of 5 January 2026, art. 7. Source: [Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407).
Reproduced on 02/11/2026 from the text provided by the maintainer.*

## Implementation in Crénelio (quote = service contract concluded online)

`src/utils/withdrawalNotice.ts` produces the completed text as follows:

| Instruction | Choice | Reason |
|---|---|---|
| (1) | a) « de la conclusion du contrat. » ; b) « où vous-même […] prend physiquement possession du bien. » if the quote includes a resold supply (*fourniture revendue*) | Service contract: the period runs from acceptance of the quote. Resold supply: contract treated as a sale (L221-1, II), period from taking possession (L221-18, 2°), delivery date entered by the professional |
| (2) | Company: name, address, telephone, email (`company_name`, `legal_adresse` or premises, `pro_phone`, `pro_email`) | Instruction (2) |
| (3) | First text (online withdrawal function), with the address of the quote page | Mandatory function for a contract concluded online |
| (4) | Omitted | Sale: not applicable, the professional offers to collect the goods ((5) a) |
| (5) | Service: omitted (parts bought in the customer's name, disbursements (*débours*)). Sale: a) « Nous récupérerons le bien », b) « Nous prendrons en charge les frais de renvoi du bien. », c) text on depreciation | Most protective choice, adopted by default on 05/11/2026; to be made configurable if a professional prefers the customer to return the goods |
| (6) | Text for services (« la prestation de services ») | Early performance at express request |

The « Effets de rétractation » (Effects of withdrawal) paragraph is reproduced as is, including the mention of
delivery costs: the model is regulatory and is not reworded.

## Text of the annex

> **INFORMATIONS CONCERNANT L'EXERCICE DU DROIT DE RÉTRACTATION**
>
> **Droit de rétractation**
>
> Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de
> quatorze jours.
>
> Le délai de rétractation expire quatorze jours après le jour (1).
>
> Pour exercer le droit de rétractation, vous devez nous notifier (2) votre décision de rétractation du
> présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la
> poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce
> n'est pas obligatoire (3).
>
> Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication
> relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.
>
> **Effets de rétractation**
>
> En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements
> reçus de vous, y compris les frais de livraison (à l'exception des frais supplémentaires découlant du
> fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de
> livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard
> quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent
> contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous
> aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ;
> en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous (4).
>
> (5)
>
> (6)

*Explanation (not an official translation):* the consumer may withdraw from the contract without giving a
reason within fourteen days. The period expires fourteen days after the day stated in (1). To withdraw, the
consumer notifies the professional (2) by an unambiguous statement (e.g. letter or email); using the model
form is optional (3). It is enough to send the notice before the period expires. Effects: the professional
refunds all payments received, including delivery costs (except extra costs for a delivery method other than
the cheapest standard one), without undue delay and at the latest fourteen days after being informed, using
the same means of payment unless expressly agreed otherwise, at no cost to the consumer (4). Paragraphs (5)
and (6) are completed according to the instructions below.

### Instructions for completing the information

> (1) Insérez l'un des passages suivants entre guillemets :
>
> a) S'il s'agit d'un contrat de service ou d'un contrat portant sur la fourniture d'eau, de gaz ou
> d'électricité lorsqu'ils ne sont pas conditionnés dans un volume délimité ou en quantité déterminée,
> de chauffage urbain ou d'un contenu numérique non fourni sur un support matériel : " de la conclusion
> du contrat. " ;
>
> b) S'il s'agit d'un contrat de vente : " où vous-même, ou un tiers autre que le transporteur et
> désigné par vous, prend physiquement possession du bien. " ;
>
> c) S'il s'agit d'un contrat portant sur plusieurs biens commandés par le consommateur au moyen d'une
> seule commande et si ces biens sont livrés séparément : " où vous-même, ou un tiers autre que le
> transporteur et désigné par vous, prend physiquement possession du dernier bien. " ;
>
> d) S'il s'agit d'un contrat portant sur la livraison d'un bien en plusieurs lots ou pièces : " où
> vous-même, ou un tiers autre que le transporteur et désigné par vous, prend physiquement possession du
> dernier lot ou de la dernière pièce. " ;
>
> e) S'il s'agit d'un contrat portant sur la livraison régulière de biens pendant une période de temps
> déterminée : " où vous-même, ou un tiers autre que le transporteur et désigné par vous, prend
> physiquement possession du premier bien. " ;
>
> (2) Insérez votre nom, votre adresse géographique, votre numéro de téléphone et votre adresse
> électronique.
>
> (3) Si vous êtes tenu de prévoir une fonctionnalité permettant au consommateur de se rétracter du
> contrat conclu en ligne, insérez le texte suivant : “Vous pouvez également exercer votre droit de
> rétractation en ligne sur [insérer l'adresse du site internet ou une autre référence adéquate indiquant
> où se trouve la fonctionnalité de rétractation]. Si vous utilisez cette fonctionnalité en ligne, nous
> vous enverrons, dans les meilleurs délais, un accusé de réception de la rétractation sur un support
> durable (par exemple, par courriel), y compris son contenu ainsi que la date et l'heure de sa
> soumission.”. Si vous offrez au consommateur la faculté de remplir et de transmettre électroniquement
> sa rétractation du contrat sur votre site internet, insérez le texte suivant : “Vous pouvez également
> remplir et transmettre le modèle de formulaire de rétractation ou toute autre déclaration dénuée
> d'ambiguïté sur notre site internet [insérer l'adresse du site internet]. Si vous utilisez cette
> option, nous vous enverrons dans les meilleurs délais un accusé de réception de la rétractation sur un
> support durable (par exemple, par courriel).”
>
> (4) S'il s'agit d'un contrat de vente dans le cadre duquel vous n'avez pas proposé de récupérer le
> bien en cas de rétractation, insérez le texte suivant : " Nous pouvons différer le remboursement
> jusqu'à ce que nous ayons reçu le bien ou jusqu'à ce que vous ayez fourni une preuve d'expédition du
> bien, la date retenue étant celle du premier de ces faits. "
>
> (5) Si le consommateur a reçu des biens dans le cadre du contrat :
>
> a) Insérez : " Nous récupérerons le bien " ; ou " Vous devrez renvoyer ou rendre le bien, à
> nous-mêmes ou à ... [insérer le nom et l'adresse géographique, le cas échéant, de la personne habilitée
> par vous à réceptionner le bien] sans retard excessif et, en tout état de cause, au plus tard quatorze
> jours après que vous nous aurez communiqué votre décision de rétractation du présent contrat. Ce délai
> est réputé respecté si vous renvoyez le bien avant l'expiration du délai de quatorze jours. "
>
> b) Insérez : " Nous prendrons en charge les frais de renvoi du bien. " ; " Vous devrez prendre en
> charge les frais directs de renvoi du bien. " ; Si, dans le cas d'un contrat à distance, vous ne
> proposez pas de prendre en charge les frais de renvoi du bien et que le bien, en raison de sa nature,
> ne peut normalement être renvoyé par la poste : " Vous devrez prendre en charge les frais directs de
> renvoi du bien, ... EUR [insérer le montant]. " ; ou, si le coût de renvoi du bien ne peut
> raisonnablement être calculé à l'avance : " Vous devrez prendre en charge les frais directs de renvoi
> du bien. Ces frais sont estimés à un maximum d'environ ... EUR [insérer le montant]. " ; ou Si, dans le
> cas d'un contrat hors établissement, le bien, en raison de sa nature, ne peut normalement être renvoyé
> par la poste et a été livré au domicile du consommateur au moment de la conclusion du contrat : " Nous
> récupérerons le bien à nos propres frais. " et
>
> c) Insérez : " Votre responsabilité n'est engagée qu'à l'égard de la dépréciation du bien résultant de
> manipulations autres que celles nécessaires pour établir la nature, les caractéristiques et le bon
> fonctionnement de ce bien. "
>
> (6) Dans le cas d'un contrat de prestation de services ou de fourniture d'eau, de gaz ou d'électricité
> lorsqu'ils ne sont pas conditionnés dans un volume délimité ou en quantité déterminée, ou de chauffage
> urbain, insérez le texte suivant : " Si vous avez demandé de commencer la prestation de services ou la
> fourniture d'eau/de gaz/d'électricité/de chauffage urbain [supprimer les mentions inutiles] pendant le
> délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni
> jusqu'au moment où vous nous avez informé de votre rétractation du présent contrat, par rapport à
> l'ensemble des prestations prévues par le contrat. "
>
> Conformément au I de l'article 20 du décret n° 2026-3 du 5 janvier 2026, ces dispositions, dans leur
> rédaction issue dudit décret, entrent en vigueur le 19 juin 2026.
>
> Conformément au II du même article, les contrats en cours au 19 juin 2026 restent régis par les
> dispositions pertinentes du code des assurances, du code de la consommation, du code monétaire et
> financier, du code de la mutualité et du code de la sécurité sociale, dans leur rédaction antérieure à
> l'entrée en vigueur du présent décret.

*Explanation (not an official translation):* (1) choose the start of the period: a) service contract (and
certain supplies of water, gas, electricity, district heating, digital content): conclusion of the contract;
b) sale: physical possession of the goods by the consumer or a third party they designate (other than the
carrier); c) several goods delivered separately: the last good; d) delivery in several lots or pieces: the
last lot or piece; e) regular delivery over a period: the first good. (2) the professional's name, address,
telephone and email. (3) text to insert when an online withdrawal function is required (address of the
function, acknowledgement of receipt on a durable medium with content, date and time), or when the
professional allows the form or statement to be submitted on their website. (4) sale where the professional
has not offered to collect the goods: refund may be deferred until the goods or proof of dispatch are
received. (5) if goods were received: a) who collects or returns the goods, and within fourteen days; b) who
bears the return costs (with amount or estimate where required); c) the consumer is only liable for
depreciation caused by handling beyond what is needed to establish the nature, characteristics and
functioning of the goods. (6) services or certain supplies: if the consumer asked for performance to start
during the withdrawal period, they pay an amount proportionate to what was provided until they withdrew.
The last two paragraphs state that these provisions apply from 19 June 2026, and that contracts in progress
on that date remain governed by the previous wording.
