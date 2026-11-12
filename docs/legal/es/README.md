# Base documental legal del profesional (*artisan*)

*Traducción de la versión francesa del 05/11/2026; prevalece la versión francesa. Los textos oficiales se citan en francés.*

Textos y referencias en los que se basan los presupuestos de Crénelio (Item 22). Primera forma de la base
documental del Item 40: archivos Markdown, una carpeta por idioma (`fr/` prevalece). Más adelante,
se cargarán en base de datos y se traducirán; los extractos de textos oficiales seguirán citándose en francés,
con una explicación traducida.

Estas fichas también se leen en el Espacio Artesano (menú **Aide › Documentation** (Ayuda › Documentación)): toda ficha añadida
aquí aparece en él; los enlaces entre fichas siguen siendo relativos.

## Traducciones

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` y, por diversión, `fr-chti/` (ch'ti) (05/11/2026) recogen las fichas de `fr/` con el mismo nombre, y `README.md`
para el índice. Los textos oficiales (`fr/textes/`) y `sources.md` no se traducen: se
citan en francés. **Prevalece la versión francesa**; toda modificación de una ficha francesa se
traslada a sus traducciones (o se señalan como desactualizadas). El árabe (`ar/`) se escribe de derecha a izquierda; sus citas oficiales, en francés, se siguen mostrando de izquierda a derecha.

## Reglas

- Cada archivo indica sus **fuentes** (enlace) y la **fecha de la última verificación**.
- Los extractos de textos oficiales (Légifrance, fichas de la administración) se reproducen tal cual, entre
  comillas o como cita; las fuentes privadas (guías, sitios especializados) se **resumen**, nunca
  se copian.
- Presentación de un texto oficial citado (como en Légifrance): un título `### Article …`, luego una
  cita `>` en la que **cada apartado (*alinéa*) es un párrafo** (enumeraciones « 1° », « a) », « II. - » incluidas,
  separados por una línea `>` vacía); la mención de versión (« Modifié par… », « Création… ») como primer
  apartado, y luego « NOTA : » solo en su línea. La pantalla Documentación deriva de ello el formato; el texto
  en sí nunca se modifica.
- Una fuente secundaria no sustituye al texto oficial: se señala como tal y solo sirve para
  encontrar el texto correcto. **Toda regla aplicada en Crénelio debe confirmarse con el texto oficial**,
  para evitar sesgos de interpretación de terceros (despachos, editoriales, blogs).
- En cada cambio normativo (Item 39): actualizar el archivo, su fecha y el código afectado
  (`api/models/Quote.php`, ajustes `quote_*` / `legal_*`).
- Estas fichas son una ayuda, no un asesoramiento jurídico: en caso de duda, el profesional consulta a su
  asesor contable (*expert-comptable*) o a su cámara de oficios (*chambre de métiers*).

## Fichas

| Tema | Ficha |
|---|---|
| Presupuesto (*devis*) de reparación a domicilio (*dépannage*): documento precontractual, menciones, piezas sustituidas | [devis-depannage.md](devis-depannage.md) |
| Contrato a distancia o en el domicilio: desistimiento (*rétractation*), urgencia, ejecución anticipada | [retractation.md](retractation.md) |
| Texto oficial del modelo de información (anexo R221-3, 19 de junio de 2026) y opciones de aplicación | [retractation-modele.md](retractation-modele.md) |
| Piezas compradas a nombre del cliente: condiciones, justificantes, volumen de negocios | [debours.md](debours.md) |
| Reventa de piezas: consecuencias, forma jurídica, alternativa de los gastos suplidos (*débours*) | [achat-revente.md](achat-revente.md) |
| Nota (factura) obligatoria por encima de 25 € IVA incluido (*TTC*) | [note-facture.md](note-facture.md) |
| Mención « EI », SIRET, RM, seguro, mediador, publicidad de los precios | [mentions-entreprise.md](mentions-entreprise.md) |
| Recordatorio del profesional: compras, justificantes, conservación | [rappels-artisan.md](rappels-artisan.md) |
| Anular o cambiar de fecha una cita que tiene presupuesto: oferta anulada, revocación, fuerza mayor | [annulation-devis.md](annulation-devis.md) |
| Conservación y supresión de los datos de los clientes: diez años para un presupuesto aceptado, RGPD | [conservation-effacement.md](conservation-effacement.md) |
| Textos oficiales, palabra por palabra: Code de la consommation (Código de Consumo francés) | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Textos oficiales: Code de commerce (Código de Comercio francés) (EI, sociedades) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Textos oficiales: Code général des impôts (Código General Tributario francés) (gastos suplidos, franquicia) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Textos oficiales: Code de l'artisanat (Código de la Artesanía francés) (condición de *artisan*) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Textos oficiales: órdenes ministeriales (*arrêtés*) de 1983 (nota), 1987 (información sobre los precios) y 2017 (presupuesto de reparación) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Textos oficiales: CGI, anexo II (menciones obligatorias de las facturas) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Textos oficiales: Code de la sécurité sociale (Código de la Seguridad Social francés) (cotizaciones del microempresario) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Textos oficiales: Code des assurances (Código de Seguros francés) (seguro decenal, certificado adjunto a los presupuestos) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Textos oficiales: Code civil (Código Civil francés) (oferta y aceptación, modificación del contrato, fuerza mayor, resolución; constructor, garantías decenal, bienal y de perfecta terminación) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Textos oficiales: Derecho de la Unión (cómputo de plazos: reglamento 1182/71, directiva 2011/83/UE; RGPD: conservación, bases jurídicas, supresión) | [../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md) |
| Textos oficiales: Code de procédure civile (Código de Procedimiento Civil francés) (cómputo de plazos) | [../fr/textes/code-procedure-civile.md](../fr/textes/code-procedure-civile.md) |
| Doctrina fiscal (BOFiP): gastos suplidos, piezas de recambio | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| Lista de las fuentes, naturaleza y fecha de verificación | [../sources.md](../sources.md) |
