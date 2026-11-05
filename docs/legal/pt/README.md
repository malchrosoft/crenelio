# Base documental jurídica do profissional

*Tradução da versão francesa de 05/11/2026; prevalece a versão francesa. Os textos oficiais são citados em francês.*

Textos e referências em que assentam os orçamentos (*devis*) do Crénelio (Item 22). Primeira forma da base
documental do Item 40: ficheiros Markdown, uma pasta por língua (`fr/` faz fé). Mais tarde,
serão carregados na base de dados e traduzidos; os excertos de textos oficiais continuam então citados em francês,
com uma explicação traduzida.

Estas fichas também podem ser lidas no Espace Artisan (Espaço do Profissional; menu **Aide › Documentation** (Ajuda › Documentação)): qualquer ficha adicionada
aqui aparece lá, e as ligações entre fichas permanecem relativas.

## Traduções

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` e, por diversão, `fr-chti/` (ch'ti) (05/11/2026) retomam as fichas de `fr/` com o mesmo nome, e `README.md`
para o sumário. Os textos oficiais (`fr/textes/`) e `sources.md` não são traduzidos: são
citados em francês. **A versão francesa faz fé**; qualquer alteração de uma ficha francesa é
transposta para as suas traduções (ou estas são assinaladas como desatualizadas). O árabe (`ar/`, escrita da direita para
a esquerda) está previsto; o ecrã já gere o sentido da escrita.

## Regras

- Cada ficheiro indica as suas **fontes** (link) e a **data da última verificação**.
- Os excertos de textos oficiais (Légifrance, fichas da administração) são reproduzidos tal como estão, entre
  aspas ou em citação; as fontes privadas (guias, sites especializados) são **resumidas**, nunca
  copiadas.
- Apresentação de um texto oficial citado (como no Légifrance): um título `### Article …`, depois uma
  citação `>` em que **cada alínea é um parágrafo** (enumerações « 1° », « a) », « II. - » incluídas,
  separadas por uma linha `>` vazia); a menção de versão (« Modifié par… », « Création… ») como primeira
  alínea, depois « NOTA : » sozinho na sua linha. O ecrã Documentação tira daí a formatação; o texto
  em si nunca é alterado.
- Uma fonte secundária não substitui o texto oficial: é assinalada como tal e serve apenas para
  encontrar o texto certo. **Qualquer regra aplicada no Crénelio deve ser confirmada pelo texto oficial**,
  para evitar os enviesamentos de interpretação de terceiros (escritórios, editoras, blogues).
- A cada evolução regulamentar (Item 39): atualizar o ficheiro, a sua data, e o código em causa
  (`api/models/Quote.php`, parâmetros `quote_*` / `legal_*`).
- Estas fichas são uma ajuda, não um aconselhamento jurídico: em caso de dúvida, o profissional consulta o seu
  contabilista certificado (*expert-comptable*) ou a sua câmara de ofícios (*chambre de métiers*).

## Fichas

| Assunto | Ficha |
|---|---|
| Orçamento de reparação de avarias ao domicílio: documento pré-contratual, menções, peças substituídas | [devis-depannage.md](devis-depannage.md) |
| Contrato à distância ou no domicílio: livre resolução (*rétractation*), urgência, execução antecipada | [retractation.md](retractation.md) |
| Texto oficial do modelo de informação (anexo R221-3, 19 de junho de 2026) e escolhas de aplicação | [retractation-modele.md](retractation-modele.md) |
| Peças compradas em nome do cliente (*débours*): condições, comprovativos, volume de negócios | [debours.md](debours.md) |
| Revenda de peças: consequências, forma jurídica, alternativa do *débours* | [achat-revente.md](achat-revente.md) |
| Nota (fatura) obrigatória acima de 25 € com IVA | [note-facture.md](note-facture.md) |
| Menção « EI », SIRET, RM, seguro, mediador, publicidade dos preços | [mentions-entreprise.md](mentions-entreprise.md) |
| Lembrete do profissional: compras, comprovativos, conservação | [rappels-artisan.md](rappels-artisan.md) |
| Textos oficiais, palavra por palavra: Code de la consommation (Código do Consumo) | [fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Textos oficiais: Code de commerce (Código Comercial; EI, sociedades) | [fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Textos oficiais: Code général des impôts (Código Geral dos Impostos; *débours*, isenção) | [fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Textos oficiais: Code de l'artisanat (Código do Artesanato; qualidade de artesão) | [fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Textos oficiais: arrêtés (portarias) de 1983 (nota), 1987 (informação sobre os preços) e 2017 (orçamento de reparação de avarias) | [fr/textes/arretes.md](../fr/textes/arretes.md) |
| Textos oficiais: CGI, anexo II (menções obrigatórias das faturas) | [fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Textos oficiais: Code de la sécurité sociale (Código da Segurança Social; contribuições do microempresário) | [fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Textos oficiais: Code des assurances (Código dos Seguros; seguro decenal, certificado anexado aos orçamentos) | [fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Textos oficiais: Code civil (Código Civil; construtor, garantias decenal, bienal, de perfeito acabamento) | [fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Doutrina fiscal (BOFiP): *débours*, peças soltas | [fr/textes/bofip.md](../fr/textes/bofip.md) |
| Lista das fontes, natureza e data de verificação | [sources.md](../sources.md) |
