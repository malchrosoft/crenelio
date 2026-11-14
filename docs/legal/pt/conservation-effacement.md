# Conservação e apagamento dos dados dos clientes

*Tradução da versão francesa de 14/11/2026; prevalece a versão francesa. Os textos oficiais são citados em francês.*

*Última verificação: 14/11/2026. Base legal: Code de la consommation (Código do Consumo francês), L213-1, D213-1
e D213-2 (conservação dos contratos celebrados por via eletrónica); Code de commerce (Código Comercial francês),
L123-22 (documentos comprovativos); Regulamento (UE) 2016/679 (RGPD), artigos 5, 6 e 17. Textos na íntegra:
[textes/code-consommation.md](../fr/textes/code-consommation.md), [textes/code-commerce.md](../fr/textes/code-commerce.md),
[textes/droit-europeen.md](../fr/textes/droit-europeen.md). Ficha de ajuda, não um parecer jurídico.*

## O essencial

| Dado | Conservado | Depois |
|---|---|---|
| Marcação (nome, email, telefone, morada, notas) | O prazo definido (ecrã Conta, 36 meses por predefinição) após a intervenção | **Eliminada** automaticamente |
| Orçamento **não aceite** (rascunho, enviado, recusado, expirado, anulado) | O mesmo prazo | **Eliminado** automaticamente |
| Orçamento **aceite** (contrato), mesmo que depois resolvido | **Dez anos** após a intervenção (ou, na falta desta, após o acordo), com o registo do acordo; concluída a intervenção, é **arquivado** (filtro « Archivés » (*Arquivados*) do ecrã « Devis » (*Orçamentos*)) | **Eliminado** automaticamente, juntamente com a sua marcação |

Porquê eliminar em vez de « anonimizar »: uma linha conservada com a sua data, prestação, montante e município pode
ainda identificar o cliente, por exemplo cruzando-a com uma fatura. Retirar o nome não basta para tornar um dado
anónimo: não deve ser possível isolar uma pessoa, ligar os seus dados nem deduzir uma informação a seu respeito
(Grupo de Trabalho do artigo 29.º, parecer 05/2014 sobre técnicas de anonimização, p. 9 e 10). Por isso o Crénelio
elimina, em vez de conservar linhas « anonimizadas ».

*Alcance desta fonte (verificado em 14/11/2026)*: o parecer 05/2014 é **anterior ao RGPD** (adotado em 2016,
aplicável desde 25 de maio de 2018) e não consta da lista de documentos do Grupo de Trabalho do artigo 29.º
aprovados pelo Comité Europeu para a Proteção de Dados na sua primeira reunião; continua, contudo, a ser a
referência citada pela CNIL (autoridade francesa de proteção de dados) no seu guia sobre prazos de conservação
(julho de 2020) e no seu referencial de gestão comercial (deliberação n.º 2021-131, publicada no Journal officiel de 10/04/2022). O Comité submeteu a
consulta diretrizes sobre a pseudonimização (01/2025, versão final não confirmada nessa data). A eliminação adotada
pelo Crénelio não depende destes debates: um dado eliminado já não tem de ser qualificado.

Durante a sua conservação, um orçamento aceite está em **arquivo intermédio** na aceção da CNIL: só são conservados
os dados que comprovam o contrato (o telefone do cliente é retirado), sai da lista corrente de orçamentos e só é
consultado se necessário, por exemplo em caso de litígio ou de pedido do cliente (CNIL, guia sobre prazos de
conservação, julho de 2020, e referencial « gestion des activités commerciales »).

## Porquê dez anos para um orçamento aceite

- **Contrato celebrado online de 120 € ou mais**: obrigação. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » e « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). O montante é fixado em 120 euros (D213-1); o prazo, em dez anos a contar da celebração,
  ou da execução quando esta é diferida (D213-2). Um orçamento aceite a partir da sua página online entra neste
  caso.
- **Abaixo de 120 €**: a lei não o impõe ao abrigo de L213-1. O Crénelio aplica **o mesmo prazo por
  prudência**: um orçamento aceite é um documento que justifica a sua fatura, e o Code de commerce prevê que
  « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). Este
  texto visa antes de mais os comerciantes: o seu contabilista dir-lhe-á se se aplica à sua situação.

## Um contrato bloqueado, e a sua prova

O orçamento fica **bloqueado**:

- **no envio**, os dados da sua empresa (nome, identidade legal, morada, SIRET, seguro, mediador,
  reclamações…) são copiados para o orçamento: se for consultado daqui a oito anos, apresenta os que constavam do
  orçamento enviado, mesmo que tenha mudado de morada ou de mediador entretanto;
- **na aceitação**, o Crénelio calcula uma **impressão digital** (hash, SHA-256) de tudo o que constitui o contrato e
  do registo do acordo. Recalculada a pedido, mostra que nada mudou desde então: o editor do orçamento indica
  « Contrat figé : oui, intact » (*Contrato bloqueado: sim, intacto*).

Isto responde às condições do escrito eletrónico (*écrit électronique*), que « a la même force probante que
l'écrit sur support papier, sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit
établi et conservé dans des conditions de nature à en garantir l'intégrité » (C. civ. 1366). A aceitação online é
uma **assinatura eletrónica simples**: válida, mas a sua fiabilidade não se presume, ao contrário de uma
assinatura qualificada (C. civ. 1367; décret n° 2017-1416, art. 1); em caso de litígio, cabe-lhe a si provar a
identificação e a integridade, daí este bloqueio. Os orçamentos aceites antes de 14/11/2026 não estão bloqueados.

Cada orçamento informa também o cliente destas modalidades de conservação e de acesso (C. civ. 1127-1, 4°).

O orçamento conservado inclui o que comprova o contrato: as suas linhas e preços, a identidade e a morada do
cliente, a data e o registo do seu acordo (endereço IP), as suas respostas (peças substituídas, mandato de
*débours*) e, se for o caso, a sua declaração de livre resolução.

## Quando um cliente pede o apagamento

O RGPD confere-lhe este direito (artigo 17), salvo quando a conservação é « nécessaire […] pour respecter une
obligation légale » (artigo 17, n.º 3, alínea b). Na prática, com « Effacer le client » (*apagar o cliente*):

- **são eliminados**: a marcação, os seus orçamentos não aceites e o respetivo registo de emails;
- **fica intacto**: qualquer orçamento **aceite**, até ao fim dos seus dez anos; a sua marcação é conservada,
  reduzida à data. A janela de confirmação indica-lhe quais; diga-o ao cliente, citando estes textos;
- **marcação futura** não anulada: a confirmação avisa-o de que deixará de poder contactar o cliente. Anule
  primeiro a marcação se a intervenção já não se realizar.

O apagamento é irreversível. A política de privacidade do site informa os clientes destes prazos.

## O que conserva noutro lado

O Crénelio não substitui o seu programa de faturação nem a sua contabilidade: as suas faturas, os seus livros e
os comprovativos de compra (*débours*) conservam-se segundo as regras que lhe são próprias (ver
[nota e fatura](note-facture.md) e o [lembrete](rappels-artisan.md)).
