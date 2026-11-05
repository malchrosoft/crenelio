# Nota (*note*, fatura) de prestação

*Tradução da versão francesa de 01/11/2026; prevalece a versão francesa. Os textos oficiais são citados em francês.*

*Última verificação: 01/11/2026. Fonte: ficha DGCCRF « Dépannage à domicile » (arrêté n.º 83-50/A de
3 de outubro de 1983, alterado), ver [fontes](../sources.md).*

> « Pour toute prestation d'un montant supérieur à 25 euros TTC, le professionnel est tenu de vous
> remettre un document sur lequel apparaissent :
> - les coordonnées du prestataire ;
> - la date de rédaction de la note ;
> - les dates et lieu d'exécution de la prestation ;
> - le décompte détaillé, en quantité et en prix, de chaque prestation et produit fourni ou vendu
>   (ex : taux horaire et nombre d'heures travaillées) ;
> - la somme totale à payer hors taxes et toutes taxes comprises ;
> - le nom du client, sauf opposition de celui-ci.
>
> La note doit être délivrée dès que la prestation a été rendue, et en tout état de cause avant le
> règlement du prix de la prestation. »

*Explicação (não é uma tradução oficial):* para qualquer prestação superior a 25 € com IVA, o profissional entrega um documento com os seus dados, a data da nota, as datas e o local da prestação, a discriminação em quantidade e preço de cada prestação e produto, o total sem IVA e com IVA e o nome do cliente (salvo oposição deste). A nota é entregue logo que a prestação é realizada e, em qualquer caso, antes do pagamento.

Abaixo de 25 € com IVA, a nota é entregue a pedido do cliente.

## Texto oficial (verificado em 04/11/2026)

Arrêté n.º 83-50/A de 3 de outubro de 1983, art. 1 a 4, e arrêté de 24 de janeiro de 2017, art. 5:
[textes/arretes.md](../fr/textes/arretes.md). Precisões em relação à ficha DGCCRF:

- a nota é obrigatória quando o preço é **superior ou igual a 25 € com IVA** (e não « au-delà », *acima*); abaixo
  desse valor, a pedido do cliente; para a reparação de avarias ao domicílio, a pedido **qualquer que seja o montante**,
  entregue **gratuitamente num suporte duradouro**;
- a **discriminação detalhada** torna-se facultativa se a prestação tiver sido objeto de um orçamento descritivo e
  detalhado, aceite e conforme aos trabalhos executados;
- a nota é emitida **em duplicado**: o original para o cliente, o duplicado conservado **dois anos** pelo
  prestador, arquivado por data.

## Menções fiscais da fatura (verificado em 04/11/2026)

CGI, anexo II, art. 242 nonies A ([textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
versão do décret n.º 2024-1195. Para um profissional:

- nome completo, **número de identificação** (SIREN) e morada **do profissional e do seu cliente** (1°);
- data de emissão (6°) e **número único, cronológico e contínuo** (7°);
- para cada prestação: quantidade, denominação precisa, **preço unitário sem IVA** e taxa de IVA ou
  isenção (8°); **natureza das operações**: exclusivamente prestações de serviços, exclusivamente
  entregas de bens, ou ambas (8° bis);
- data da prestação se diferir da data de emissão (10°); total sem IVA e IVA por taxa
  (11°); abatimentos e descontos (9°);
- em isenção de base (*franchise en base*), as menções 2° (número de IVA) e 12° (referência da isenção) podem ser
  omitidas (II), mas a menção « TVA non applicable, article 293 B du CGI » (*IVA não aplicável, artigo 293 B do CGI*) continua imposta pelo artigo
  293 E do CGI.

As menções 1° (número do cliente), 7° bis e 8° bis aplicam-se às faturas emitidas a partir de
1 de setembro de 2026, e de **1 de setembro de 2027** para as microempresas e PME (calendário da
faturação eletrónica, NOTA do artigo). O número cronológico e contínuo é gerido pelo software de
faturação do profissional.

## No Crénelio

A fatura é emitida na ferramenta do profissional (Item 22, vertente B); o Crénelio não a emite.

- Ficha **« Préparer la facture »** (Preparar a fatura; marcação terminada): cliente, morada, data e local da prestação,
  referência do orçamento aceite, linhas detalhadas (quantidade, preço, IVA), totais e menção de isenção,
  cada um para copiar; **despesas adiantadas** (*débours*) numa linha distinta, pelo **montante exato do comprovativo** introduzido pelo
  profissional com a sua referência, e alerta se o orçamento máximo do mandato for ultrapassado.
- **Exportações CSV**: clientes (importação inicial) e intervenções terminadas de um período, *débours* à parte.
- Ficha: natureza das operações (8° bis) para copiar, lembretes das menções do 1° e do 7°.
- As menções fiscais da fatura (numeração contínua, menções de IVA, faturação eletrónica)
  são da responsabilidade do software do profissional.
