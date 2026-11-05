# Livre resolução (*rétractation*): contrato à distância ou no domicílio do cliente

*Tradução da versão francesa de 04/11/2026; prevalece a versão francesa. Os textos oficiais são citados em francês.*

*Última verificação: 04/11/2026 (textos oficiais: [textes/code-consommation.md](../fr/textes/code-consommation.md)). Fontes: ficha DGCCRF « Dépannage à domicile » (oficial); INC;
fontes secundárias sobre L221-25. Artigos do Code de la consommation (Código do Consumo francês) a reler na sua versão
consolidada (ver [fontes](../sources.md)).*

## Princípio

Um orçamento aceite **online** (contrato à distância) ou **assinado no domicílio** do cliente (contrato fora do
estabelecimento, *hors établissement*) abre ao cliente particular um **prazo de livre resolução de 14 dias** (direito de livre resolução, *droit de rétractation*; C. consom.
L221-18). O profissional deve informá-lo antes da celebração e entregar:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Explicação (não é uma tradução oficial):* um exemplar do contrato em papel assinado pelas partes ou, com o acordo do consumidor, em suporte duradouro, acompanhado do formulário-tipo de livre resolução e contendo, sob pena de nulidade, as informações dos artigos L111-1 e L111-2.

Se faltar a informação sobre a livre resolução, o prazo é prorrogado por doze meses (L221-20, confirmado).

## Exceção: a urgência

Não há livre resolução para os « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (*trabalhos de manutenção ou reparação a realizar com urgência no domicílio do consumidor e expressamente solicitados por ele*; L221-28, 8°, citado pelo INC), **no limite das
peças sobresselentes e trabalhos estritamente necessários para responder à situação de urgência** (ficha
DGCCRF). A urgência entende-se como « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux » (*a necessidade de fazer cessar um perigo para a segurança das pessoas ou a integridade das instalações*).

Qualquer trabalho **adicional** proposto no local continua sujeito ao prazo de 14 dias.

## Começar antes do fim do prazo

Segundo L221-25 (texto oficial acima): o profissional só pode começar antes do fim do prazo
mediante **pedido expresso** do cliente; se o cliente resolver o contrato depois, deve um montante proporcional
ao serviço já prestado. Sem pedido expresso obtido, nada é devido.

## O que dizem os textos oficiais (verificado em 04/11/2026)

Texto integral: [textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Definições** (L221-1): contrato **à distância** = celebrado sem presença física simultânea, com
  recurso exclusivo a técnicas de comunicação à distância até à celebração; contrato **fora do
  estabelecimento** = celebrado com presença física simultânea fora do local de atividade habitual, **incluindo na
  sequência de uma solicitação do consumidor** (orçamento assinado no domicílio do cliente), ou à distância
  imediatamente após uma solicitação pessoal feita fora desse local. Um contrato que transfere a
  propriedade de um bem **e** fornece uma prestação é **equiparado a uma venda** (II): a vigiar para
  as linhas « fourniture revendue » (fornecimento revendido; prazo a contar da receção do bem).
- **Prazo** (L221-18): catorze dias a contar **da celebração do contrato** para uma prestação de
  serviços. **Cálculo** (L221-19): o dia da celebração não é contado; o prazo expira no fim do
  último dia; se calhar a um sábado, domingo ou feriado ou dia não útil, é prorrogado até ao
  primeiro dia útil seguinte. → `Quote::withdrawalDeadline` (feriados legais, Páscoa calculada).
- **Informação em falta** (L221-20): prazo prorrogado por doze meses; reduzido a catorze dias a contar
  da receção da informação se esta for fornecida entretanto.
- **Execução antecipada** (L221-25): pedido expresso obtido « par tout moyen » (*por qualquer meio*) à distância, « sur
  papier ou sur support durable » (*em papel ou em suporte duradouro*) fora do estabelecimento; o profissional **pede ao consumidor que
  reconheça** que, após execução completa, deixará de dispor do direito de livre resolução. Sem pedido
  expresso obtido, ou sem a informação do 9° de L221-5, **nenhum montante é devido**.
  → texto da caixa completado (página, versão imprimível, email de acordo).
- **Exceções** (L221-28): 1° serviço plenamente executado antes do fim do prazo, com acordo expresso e
  reconhecimento da perda do direito → `Quote::canWithdraw` recusa a livre resolução quando a marcação
  do orçamento está « terminada » e a execução antecipada tinha sido pedida; 8° trabalhos urgentes
  expressamente solicitados, no limite do estritamente necessário.
- **Informação** (L221-5, 7° e 10°): condições, prazo, modalidades, formulário-tipo e localização da
  função de livre resolução; se o direito não existir (urgência), a informação de que o consumidor não
  beneficia dele.
- **Fora do estabelecimento** (L221-9): exemplar datado do contrato, em papel assinado ou suporte duradouro, com
  todas as informações de L221-5 e **acompanhado do formulário-tipo**. (L221-10): **nenhum pagamento nem
  contrapartida antes de sete dias** a contar da celebração, salvo trabalhos urgentes (4°).
- **Função online** (D221-5, criado pelo décret n.º 2026-3): textos « renoncer au contrat ici » (*renunciar ao contrato aqui*) e
  « confirmer la rétractation » (*confirmar a livre resolução*), declaração (nome e apelido, contrato, meio eletrónico do aviso de receção),
  aviso de receção que retoma o conteúdo, a data e a hora. Conforme à implementação.
- **Formulário-tipo** (anexo ao artigo R221-1, décret n.º 2022-424): reproduzido palavra por palavra na
  versão imprimível.

## Exercício do direito: artigo L221-21 (versão de 19 de junho de 2026)

*Texto oficial, redação resultante da ordonnance n.º 2026-2 de 5 de janeiro de 2026 (art. 26: em vigor a
19 de junho de 2026; contratos em curso nessa data regidos pelos textos anteriores). Reproduzido em 02/11/2026 a
partir do texto fornecido pelo responsável pela manutenção.*

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

*Explicação (não é uma tradução oficial):* o consumidor exerce o direito enviando, antes do fim do prazo, o formulário ou qualquer declaração inequívoca. O profissional pode permitir o preenchimento e envio online; nesse caso envia sem demora um aviso de receção em suporte duradouro. Para contratos celebrados através de uma interface online, o profissional disponibiliza gratuitamente uma funcionalidade de livre resolução. Um decreto fixa as modalidades, para garantir um acesso fácil, direto e permanente.

**Correspondência no Crénelio**

| Exigência de L221-21 | Implementação |
|---|---|
| Formulário ou qualquer declaração inequívoca | Formulário de livre resolução imprimível; o email e a morada da empresa figuram no modelo de informação |
| Envio antes do fim do prazo | Livre resolução online aceite até `withdrawal_until` inclusive; a data da declaração é registada |
| Aviso de receção sem demora, em suporte duradouro | Email enviado logo após a confirmação (`QuoteNotifier::sendWithdrawal`), registado no histórico |
| Funcionalidade gratuita para um contrato celebrado através de uma interface online | Botão « Renoncer au contrat ici » (Renunciar ao contrato aqui) na página do orçamento, sem conta nem custos |
| Acesso fácil, direto e permanente (decreto) | Mesmo link que o do acordo (email), botão visível durante todo o prazo |

## Função de livre resolução online (desde 19 de junho de 2026)

A ordonnance n.º 2026-2 e o décret n.º 2026-3 de 5 de janeiro de 2026 (transposição da diretiva (UE)
2023/2673) impõem, para qualquer contrato à distância celebrado **através de uma interface online**, uma função de
livre resolução gratuita (**confirmado pelo artigo D221-5**, texto em [textes/code-consommation.md](../fr/textes/code-consommation.md)):

- identificada pelas palavras « **renoncer au contrat ici** » ou uma fórmula análoga inequívoca;
- visível, direta e facilmente acessível **durante todo o prazo** de livre resolução;
- o consumidor indica ou confirma o seu **nome e apelido**, o **contrato** em causa e o **meio
  eletrónico** para receber o aviso de receção, e depois valida com « **confirmer la rétractation** »;
- **aviso de receção** em suporte duradouro, num prazo razoável, que retoma o conteúdo da
  declaração e a **data e hora** do seu envio;
- a informação pré-contratual indica onde se encontra esta função;
- sanção: coima administrativa até 15 000 € (pessoa singular) ou 75 000 € (pessoa coletiva).

O modelo de informação (anexo ao artigo R221-3) foi alterado em conformidade (versão em vigor a
19 de junho de 2026): texto oficial e escolhas de aplicação em [retractation-modele.md](retractation-modele.md).

## No Crénelio

- Caixa « intervention urgente » (intervenção urgente) no orçamento: nem prazo nem função de livre resolução.
- Caso contrário, para aceitar, o cliente confirma ter tomado conhecimento do seu direito; pode pedir
  a execução antecipada (caixa distinta); o fim do prazo é registado (`withdrawal_until`).
- Página do orçamento (`/devis/:token`): informação sobre o prazo e a localização da função antes
  do acordo; após o acordo, botão « Renoncer au contrat ici », declaração (nome, email do aviso de receção,
  contrato recordado), botão « Confirmer la rétractation » (Confirmar a livre resolução); estado `withdrawn`, declaração conservada
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Aviso de receção por email ao cliente (conteúdo, data e hora) e aviso ao profissional (reembolso
  em 14 dias); o email de acordo recorda a data-limite e a localização da função.
- Registos de data e hora: a ligação MySQL está alinhada com o fuso horário da aplicação.
- Página do orçamento: modelo de informação regulamentar apresentado palavra por palavra (`src/utils/withdrawalNotice.ts`).
- **Formulário online pré-preenchido** (`/devis/:token/retractation`): modelo do anexo R221-1 palavra por
  palavra, transmitido pela função de livre resolução; **PDF preenchível** anexado ao email de acordo;
  declaração validada descarregável em PDF e anexada aos avisos de receção. O cliente é informado desta
  facilidade (texto `ONLINE_FORM_NOTICE`, fora do modelo regulamentar).
- **Exemplar do contrato** (L221-9): o email enviado ao cliente após o seu acordo retoma todas as
  informações do contrato, o modelo de informação e o formulário-tipo (`LegalTexts.php`).
- Versões imprimíveis (`/devis/:token/imprimer`): modelo de informação no orçamento; formulário-tipo
  do anexo ao artigo R221-1, **palavra por palavra** (confirmado em 04/11/2026).
