# Nota (factura) de prestación

*Traducción de la versión francesa del 01/11/2026; prevalece la versión francesa. Los textos oficiales se citan en francés.*

*Última verificación: 01/11/2026. Fuente: ficha DGCCRF (autoridad francesa de consumo y competencia) « Dépannage à domicile » (arrêté n° 83-50/A du
3 octobre 1983 modifié, orden ministerial modificada), ver [fuentes](../sources.md).*

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

*Explicación (no es una traducción oficial):* para toda prestación de más de 25 euros con impuestos (TTC), el profesional entrega un documento (*note*) con: datos del prestador, fecha de redacción, fechas y lugar de la prestación, desglose en cantidad y precio de cada prestación y producto suministrado o vendido, importe total sin y con impuestos, y nombre del cliente salvo que se oponga. Se entrega en cuanto se ha realizado la prestación y, en todo caso, antes del pago.

Por debajo de 25 € con impuestos, la nota se entrega a petición del cliente.

## Texto oficial (verificado el 04/11/2026)

Arrêté n° 83-50/A du 3 octobre 1983, art. 1 a 4, y arrêté du 24 janvier 2017, art. 5:
[textes/arretes.md](../fr/textes/arretes.md). Precisiones respecto a la ficha DGCCRF:

- la nota es obligatoria cuando el precio es **superior o igual a 25 € con impuestos** (y no « au-delà », «por encima»); por
  debajo, a petición del cliente; para la reparación de averías a domicilio, a petición **sea cual sea el importe**,
  entregada **gratuitamente en un soporte duradero**;
- el **desglose detallado** pasa a ser opcional si la prestación ha sido objeto de un presupuesto descriptivo y
  detallado, aceptado y conforme a los trabajos realizados;
- la nota se extiende **por duplicado**: el original para el cliente, la copia conservada **dos años** por
  el prestador, clasificada por fecha.

## Menciones fiscales de la factura (verificado el 04/11/2026)

CGI (Code général des impôts, Código General Tributario francés), anexo II, art. 242 nonies A ([textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
versión del décret n° 2024-1195. Para un artesano (*artisan*):

- nombre completo, **número de identificación** (SIREN) y dirección **del profesional y de su cliente** (1°);
- fecha de emisión (6°) y **número único, cronológico y continuo** (7°);
- para cada prestación: cantidad, denominación precisa, **precio unitario sin impuestos** y tipo de IVA o
  exención (8°); **naturaleza de las operaciones**: exclusivamente prestaciones de servicios, exclusivamente
  entregas de bienes, o ambas (8° bis);
- fecha de la prestación si difiere de la fecha de emisión (10°); total sin impuestos e IVA por tipo
  (11°); rebajas y descuentos (9°);
- en régimen de franquicia (*franchise en base*, exención de IVA para pequeñas empresas), las menciones 2° (número de IVA) y 12° (referencia de la exención) pueden
  omitirse (II), pero la mención « TVA non applicable, article 293 B du CGI » (IVA no aplicable) sigue siendo obligatoria según el artículo
  293 E del CGI.

Las menciones 1° (número del cliente), 7° bis y 8° bis se aplican a las facturas emitidas a partir del
1 de septiembre de 2026, y del **1 de septiembre de 2027** para las microempresas y pymes (calendario de la
facturación electrónica, NOTA del artículo). El número cronológico y continuo lo gestiona el programa
de facturación del artesano.

## En Crénelio

La factura se emite en la herramienta del artesano (Item 22, vertiente B); Crénelio no la emite.

- Ficha **« Préparer la facture »** (Preparar la factura; cita terminada): cliente, dirección, fecha y lugar de la prestación,
  referencia del presupuesto aceptado, líneas detalladas (cantidad, precio, IVA), totales y mención de franquicia,
  cada uno para copiar; **gastos suplidos** (*débours*) en una línea separada, por el **importe exacto del justificante** introducido por
  el artesano con su referencia, y alerta si se supera el presupuesto máximo del mandato.
- **Exportaciones CSV**: clientes (importación inicial) e intervenciones terminadas de un periodo, gastos suplidos aparte.
- Ficha: naturaleza de las operaciones (8° bis) para copiar, recordatorios de las menciones del 1° y del 7°.
- Las menciones fiscales de la factura (numeración continua, menciones de IVA, facturación electrónica)
  corresponden al programa del artesano.
