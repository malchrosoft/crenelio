# Modelo de informação sobre o direito de livre resolução (*droit de rétractation*) (anexo ao artigo R221-3)

*Tradução da versão francesa de 02/11/2026; prevalece a versão francesa. Os textos oficiais são citados em francês.*

*Texto oficial (Code de la consommation, Código do Consumo francês), versão em vigor desde 19 de junho de 2026, alterada pelo
décret n.º 2026-3 de 5 de janeiro de 2026, art. 7. Fonte: [Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407).
Reproduzido em 02/11/2026 a partir do texto fornecido pelo responsável pela manutenção.*

## Aplicação no Crénelio (orçamento = contrato de serviço celebrado online)

`src/utils/withdrawalNotice.ts` produz o texto preenchido assim:

| Instrução | Escolha | Motivo |
|---|---|---|
| (1) | a) « de la conclusion du contrat. »; b) « où vous-même […] prend physiquement possession du bien. » se o orçamento incluir um fornecimento revendido (*fourniture revendue*) | Contrato de serviço: o prazo conta-se a partir da aceitação do orçamento. Fornecimento revendido: contrato equiparado a uma venda (L221-1, II), prazo a contar da tomada de posse (L221-18, 2°), data de entrega introduzida pelo profissional |
| (2) | Empresa: nome, morada, telefone, email (`company_name`, `legal_adresse` ou instalações, `pro_phone`, `pro_email`) | Instrução (2) |
| (3) | Primeiro texto (funcionalidade de livre resolução online), com o endereço da página do orçamento | Função obrigatória para um contrato celebrado online |
| (4) | Omitido | Venda: sem objeto, o profissional propõe recolher o bem ((5) a) |
| (5) | Serviço: omitido (peças compradas em nome do cliente, despesas adiantadas por conta do cliente, *débours*). Venda: a) « Nous récupérerons le bien », b) « Nous prendrons en charge les frais de renvoi du bien. », c) texto sobre a depreciação | Escolha mais protetora, adotada por defeito em 05/11/2026; a tornar configurável se um profissional preferir uma devolução pelo cliente |
| (6) | Texto das prestações de serviços (« la prestation de services ») | Execução antecipada mediante pedido expresso |

O parágrafo « Effets de rétractation » (Efeitos da livre resolução) é retomado tal como está, incluindo a menção das despesas de
entrega: o modelo é regulamentar e não é reformulado.

## Texto do anexo

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

*Explicação (não é uma tradução oficial):* o consumidor pode resolver o contrato sem indicar motivo no prazo de catorze dias, contado a partir do dia indicado em (1). Notifica a sua decisão ao profissional (2) por uma declaração inequívoca (carta, email), podendo usar o formulário-tipo (3); basta enviar a comunicação antes do fim do prazo. Em caso de livre resolução, o profissional reembolsa todos os pagamentos recebidos, incluindo as despesas de entrega, sem demora excessiva e no máximo catorze dias após ser informado, pelo mesmo meio de pagamento e sem custos para o consumidor (4). Os pontos (5) e (6) são preenchidos conforme as instruções abaixo.

### Instruções a seguir para preencher as informações

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

*Explicação (não é uma tradução oficial):* (1) indica o ponto de partida do prazo: celebração do contrato para um serviço, tomada de posse física do bem (ou do último bem, lote ou peça, ou do primeiro bem numa entrega regular) para uma venda. (2) identifica o profissional. (3) indica onde se encontra a funcionalidade de livre resolução online e promete um aviso de receção em suporte duradouro. (4) permite diferir o reembolso até à receção do bem, se o profissional não propuser recolhê-lo. (5) regula a devolução do bem, as respetivas despesas e a responsabilidade do consumidor pela depreciação. (6) obriga o consumidor que pediu o início da prestação durante o prazo a pagar um montante proporcional ao que já foi fornecido. Estas disposições entram em vigor a 19 de junho de 2026; os contratos em curso nessa data continuam regidos pelos textos anteriores.
