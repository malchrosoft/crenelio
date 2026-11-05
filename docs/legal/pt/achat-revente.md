# Compra para revenda de fornecimentos (peças revendidas)

*Tradução da versão francesa de 01/11/2026; prevalece a versão francesa. Os textos oficiais são citados em francês.*

*Última verificação: 01/11/2026. Fontes: Portail auto-entrepreneur (despesas adiantadas e despesas refaturadas,
resumo); regras do regime de microempresário (*micro-entrepreneur*) a reler nos sites oficiais (URSSAF, *guichet unique*)
antes de qualquer ativação. Ver [fontes](../sources.md).*

## O que é

O profissional compra a peça **em seu nome** e depois refatura-a ao cliente (com ou sem margem). Trata-se de uma
**venda de mercadorias**, distinta da prestação de serviços. Não confundir com as
despesas adiantadas por conta do cliente (*[débours](debours.md)*), em que a peça é comprada em nome e por conta do cliente.

## Consequências para um empresário em nome individual (microempresa)

- O montante revendido **entra no volume de negócios** (*chiffre d'affaires*; o Portail auto-entrepreneur desaconselha este
  método por esse motivo: aumenta as contribuições sociais).
- A venda de mercadorias tem os seus **próprios limiares** de volume de negócios e a sua **própria taxa** de
  contribuições; com prestações de serviços, a atividade torna-se **mista** e os dois volumes são
  acompanhados separadamente (montantes em vigor: Item 39, a verificar todos os anos).
- A atividade de venda deve ser **declarada** (*guichet unique*) se ainda não o estiver.
- O profissional torna-se **vendedor**: fatura de compra em seu nome, garantias legais devidas ao cliente sobre a
  peça, eventual stock.

## IVA das peças instaladas (profissional sujeito a IVA)

BOI-TVA-BASE-10-20-40-20, § 140 e 150 ([textes/bofip.md](../fr/textes/bofip.md)): os **fornecimentos**
(*fournitures*: materiais transformados ou consumidos) seguem o preço do serviço; as **peças soltas** (*pièces détachées*: objetos
normalizados simplesmente instalados) são uma **venda à taxa que lhes é própria**, salvo se o seu valor for
inferior ao da instalação ou se tiverem sido adaptadas. Simplificação admitida: peças e fornecimentos
seguem o regime da prestação se o seu valor global **não exceder 50 % do custo total**; caso contrário, a
venda das peças é mencionada **de forma distinta** na fatura.

No Crénelio (orçamento com IVA): o editor calcula a parte das linhas « fourniture revendue » (fornecimento revendido) no
custo total sem IVA (*débours* excluídos, fora do volume de negócios) e indica-a sob as linhas: até 50 %, mesma
taxa que a prestação; acima, taxa própria das peças, em linhas distintas (o que o orçamento já faz).
Um orçamento que inclua um fornecimento revendido é equiparado a uma **venda** (C. consom. L221-1, II): o
prazo de livre resolução conta-se a partir da entrega das peças ao cliente (L221-18, 2°), data a introduzir no orçamento
aceite; ver [retractation-modele.md](retractation-modele.md).

O controlo do IVA é **indicativo**: a comparação faz-se, em princípio, peça a peça, e só o
profissional sabe se uma peça foi adaptada. A taxa continua a ser escolha sua, a validar com o seu contabilista.

## Sociedade

A revenda deve fazer parte do **objeto social**; as peças são faturadas com o IVA da sociedade.

## No Crénelio

- Linha « fourniture revendue » recusada pela API enquanto `quote_allow_supply` não estiver ativado.
- Ativação mediante um **aviso** adaptado à forma jurídica (`legal_form`), a aceitar
  explicitamente; recomendação por defeito: o *débours*.
