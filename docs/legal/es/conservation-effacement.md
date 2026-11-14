# Conservación y supresión de los datos de los clientes

*Traducción de la versión francesa del 14/11/2026; prevalece la versión francesa. Los textos oficiales se citan en francés.*

*Última verificación: 14/11/2026. Base legal: Code de la consommation (Código de Consumo francés), L213-1, D213-1
y D213-2 (conservación de los contratos celebrados por vía electrónica); Code de commerce (Código de Comercio
francés), L123-22 (justificantes); Reglamento (UE) 2016/679 (RGPD), artículos 5, 6 y 17. Textos literales:
[textes/code-consommation.md](../fr/textes/code-consommation.md), [textes/code-commerce.md](../fr/textes/code-commerce.md),
[textes/droit-europeen.md](../fr/textes/droit-europeen.md). Ficha de ayuda, no un asesoramiento jurídico.*

## Lo esencial

| Dato | Se conserva | Después |
|---|---|---|
| Cita (nombre, email, teléfono, dirección, notas) | El plazo configurado (pantalla Cuenta, 36 meses por defecto) tras la intervención | **Suprimida** automáticamente |
| Presupuesto **no aceptado** (borrador, enviado, rechazado, caducado, anulado) | El mismo plazo | **Suprimido** automáticamente |
| Presupuesto **aceptado** (contrato), aunque después haya desistimiento | **Diez años** tras la intervención (o, en su defecto, tras el acuerdo), con la constancia del acuerdo; una vez concluida la intervención, queda **archivado** (filtro « Archivés » (*Archivados*) de la pantalla « Devis » (*Presupuestos*)) | **Suprimido** automáticamente, junto con su cita |

Por qué suprimir en lugar de « anonimizar »: una línea conservada con su fecha, su prestación, su importe y su
municipio puede seguir designando al cliente, por ejemplo cotejándola con una factura. Quitar el nombre no basta
para que un dato sea anónimo: ya no debe ser posible singularizar a una persona, vincular sus datos ni deducir
información sobre ella (Grupo de Trabajo del artículo 29, dictamen 05/2014 sobre técnicas de anonimización, p. 9 y
10). Por eso Crénelio suprime, en lugar de conservar líneas « anonimizadas ».

*Alcance de esta fuente (verificado el 14/11/2026)*: el dictamen 05/2014 es **anterior al RGPD** (adoptado en 2016,
aplicable desde el 25 de mayo de 2018) y no figura en la lista de documentos del Grupo de Trabajo del artículo 29
asumidos por el Comité Europeo de Protección de Datos en su primera sesión; sigue siendo, no obstante, la
referencia citada por la CNIL (autoridad francesa de protección de datos) en su guía de plazos de conservación
(julio de 2020) y en su marco de referencia de gestión comercial (publicado en enero de 2022). El Comité sometió a
consulta unas directrices sobre la seudonimización (01/2025, versión final no confirmada en esa fecha). La
supresión adoptada por Crénelio no depende de estos debates: un dato suprimido ya no tiene que calificarse.

Durante su conservación, un presupuesto aceptado está en **archivo intermedio** en el sentido de la CNIL: solo se
conservan los datos que hacen constar el contrato (se retira el teléfono del cliente), sale de la lista habitual de
presupuestos y solo se consulta si es necesario, por ejemplo por un litigio o una solicitud del cliente (CNIL, guía
de plazos de conservación, julio de 2020, y marco de referencia « gestion des activités commerciales »).

## Por qué diez años para un presupuesto aceptado

- **Contrato celebrado en línea por 120 € o más**: obligación. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » y « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). El importe se fija en 120 euros (D213-1); el plazo, en diez años a contar desde la
  celebración, o desde la ejecución cuando esta es diferida (D213-2). Un presupuesto aceptado desde su página
  en línea entra en este caso.
- **Por debajo de 120 €**: la ley no lo impone en virtud de L213-1. Crénelio aplica **el mismo plazo por
  prudencia**: un presupuesto aceptado es un documento que justifica su factura, y el Code de commerce dispone
  que « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). Este
  texto se dirige ante todo a los comerciantes: su asesor contable le dirá si se aplica a su situación.

## Un contrato bloqueado, y su prueba

El presupuesto queda **bloqueado**:

- **al enviarlo**, los datos de su empresa (nombre, identidad legal, dirección, SIRET, seguro, mediador,
  reclamaciones…) se copian en el presupuesto: si se consulta dentro de ocho años, muestra los que figuraban en el
  presupuesto enviado, aunque usted haya cambiado de dirección o de mediador entretanto;
- **al aceptarlo**, Crénelio calcula una **huella** (hash, SHA-256) de todo lo que constituye el contrato y de la
  constancia del acuerdo. Recalculada a petición, demuestra que nada ha cambiado desde entonces: el editor del
  presupuesto indica « Contrat figé : oui, intact » (*Contrato bloqueado: sí, intacto*).

Esto cumple las condiciones del escrito electrónico (*écrit électronique*), que « a la même force probante que
l'écrit sur support papier, sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit
établi et conservé dans des conditions de nature à en garantir l'intégrité » (C. civ. 1366). La aceptación en línea
es una **firma electrónica simple**: válida, pero su fiabilidad no se presume, a diferencia de una firma
cualificada (C. civ. 1367; décret n° 2017-1416, art. 1); en caso de litigio, le corresponde a usted probar la
identificación y la integridad, de ahí este bloqueo. Los presupuestos aceptados antes del 14/11/2026 no están
bloqueados.

Cada presupuesto informa también al cliente de estas modalidades de conservación y de acceso (C. civ. 1127-1, 4°).

El presupuesto conservado comprende lo que hace constar el contrato: sus líneas y precios, la identidad y la
dirección del cliente, la fecha y la constancia de su acuerdo (dirección IP), sus respuestas (piezas
sustituidas, mandato de gastos suplidos) y, en su caso, su declaración de desistimiento.

## Cuando un cliente pide la supresión

El RGPD le otorga este derecho (artículo 17), salvo cuando la conservación es « nécessaire […] pour respecter
une obligation légale » (artículo 17, apartado 3, b). En concreto, con « Effacer le client » (suprimir al
cliente):

- **se suprimen**: la cita, sus presupuestos no aceptados y el registro de emails correspondiente;
- **queda intacto**: todo presupuesto **aceptado**, hasta el fin de sus diez años; su cita se conserva, reducida a
  su fecha. La ventana de confirmación le indica cuáles; dígaselo al cliente, citando estos textos;
- **cita futura** no anulada: la confirmación le advierte de que ya no podrá contactar con el cliente. Anule
  primero la cita si la intervención ya no va a tener lugar.

La supresión es irreversible. La política de privacidad del sitio informa a los clientes de estos plazos.

## Lo que conserva en otro lugar

Crénelio no sustituye a su programa de facturación ni a su contabilidad: sus facturas, sus libros y los
justificantes de compra (gastos suplidos) se conservan según las reglas que le son propias (ver
[nota y factura](note-facture.md) y el [recordatorio](rappels-artisan.md)).
