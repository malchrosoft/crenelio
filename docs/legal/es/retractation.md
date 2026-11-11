# Desistimiento: contrato a distancia o en el domicilio del cliente

*Traducción de la versión francesa del 04/11/2026; prevalece la versión francesa. Los textos oficiales se citan en francés.*

*Última verificación: 04/11/2026 (textos oficiales: [textes/code-consommation.md](../fr/textes/code-consommation.md)). Fuentes: ficha de la DGCCRF « Dépannage à domicile » (oficial); INC;
fuentes secundarias sobre L221-25. Artículos del Code de la consommation (Código de Consumo francés) que deben releerse en su versión
consolidada (ver [fuentes](../sources.md)).*

## Principio

Un presupuesto (*devis*) aceptado **en línea** (contrato a distancia) o **firmado en el domicilio** del cliente (contrato fuera del
establecimiento, *contrat hors établissement*) abre al cliente particular un **plazo de desistimiento de 14 días** (*délai de rétractation*) (C. consom.
L221-18). El profesional debe informarle antes de la celebración del contrato y entregarle:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Explicación (no es una traducción oficial):* un ejemplar del contrato en papel firmado por las partes o, con acuerdo del consumidor, en soporte duradero, acompañado del formulario tipo de desistimiento y con las informaciones de los artículos L. 111-1 y L. 111-2, bajo pena de nulidad.

Si falta la información sobre el desistimiento, el plazo se prolonga doce meses (L221-20, confirmado).

## Excepción: la urgencia

No hay desistimiento para los « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (L221-28, 8°, citado por el INC) (*explicación:* trabajos de mantenimiento o reparación urgentes en el domicilio, solicitados expresamente por el consumidor), **dentro del límite de las
piezas de recambio y trabajos estrictamente necesarios para responder a la situación de urgencia** (ficha
DGCCRF). La urgencia se entiende como « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux » (*explicación:* la necesidad de poner fin a un peligro para la seguridad de las personas o la integridad del local).

Todo trabajo **adicional** propuesto in situ sigue sujeto al plazo de 14 días.

## Empezar antes del fin del plazo

Según L221-25 (texto oficial más abajo): el profesional solo puede empezar antes del fin del plazo
a **petición expresa** del cliente; si el cliente desiste después, debe un importe proporcional
al servicio ya prestado. Sin petición expresa recabada, no se debe nada.

## Lo que dicen los textos oficiales (verificado el 04/11/2026)

Texto íntegro: [textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Definiciones** (L221-1): contrato **a distancia** = celebrado sin presencia física simultánea, mediante el
  uso exclusivo de técnicas de comunicación a distancia hasta la celebración; contrato **fuera del
  establecimiento** = celebrado con presencia física simultánea fuera del lugar habitual de actividad, **incluso a
  raíz de una solicitud del consumidor** (presupuesto firmado en el domicilio del cliente), o a distancia
  inmediatamente después de un contacto personal realizado fuera de ese lugar. Un contrato que transfiere la
  propiedad de un bien **y** presta un servicio se **asimila a una venta** (II): a vigilar para
  las líneas « fourniture revendue » (suministro revendido) (plazo a contar desde la recepción del bien).
- **Plazo** (L221-18): catorce días a contar **desde la celebración del contrato** para una prestación de
  servicios. **Cálculo** (L221-19): el día de la celebración no se cuenta; el plazo expira al final del
  último día; si cae en sábado, domingo o día festivo o no laborable, se prorroga hasta el
  primer día hábil siguiente. → `Quote::withdrawalDeadline` (festivos legales, Pascua calculada).
- **Información ausente** (L221-20): plazo prolongado doce meses; reducido a catorce días a contar
  desde la recepción de la información si se facilita entretanto.
- **Ejecución anticipada** (L221-25): petición expresa recabada « par tout moyen » (por cualquier medio) a distancia, « sur
  papier ou sur support durable » (en papel o en soporte duradero) fuera del establecimiento; el profesional **pide al consumidor que
  reconozca** que, tras la ejecución completa, ya no tendrá derecho de desistimiento. Sin petición
  expresa recabada, o sin la información del 9° de L221-5, **no se debe ninguna cantidad**.
  → texto de la casilla completado (página, versión imprimible, email de aceptación).
- **Excepciones** (L221-28): 1° servicio plenamente ejecutado antes del fin del plazo, con acuerdo expreso y
  reconocimiento de la pérdida del derecho → `Quote::canWithdraw` rechaza el desistimiento cuando la cita
  del presupuesto está « terminé » (terminada) y se había pedido la ejecución anticipada; 8° trabajos urgentes
  solicitados expresamente, dentro del límite de lo estrictamente necesario.
- **Información** (L221-5, 7° y 10°): condiciones, plazo, modalidades, formulario tipo y ubicación de la
  función de desistimiento; si el derecho no existe (urgencia), la información de que el consumidor no
  goza de él.
- **Fuera del establecimiento** (L221-9): ejemplar fechado del contrato, en papel firmado o soporte duradero, con
  todas las informaciones de L221-5 y **acompañado del formulario tipo**. (L221-10): **ningún pago ni
  contrapartida antes de siete días** a contar desde la celebración, salvo trabajos urgentes (4°).
- **Función en línea** (D221-5, creado por el décret n° 2026-3): textos « renoncer au contrat ici » (renunciar al contrato aquí) y
  « confirmer la rétractation » (confirmar el desistimiento), declaración (nombre y apellidos, contrato, medio electrónico del acuse),
  acuse de recibo que recoge el contenido, la fecha y la hora. Conforme a la implementación.
- **Formulario tipo** (anexo al artículo R221-1, décret n° 2022-424): reproducido palabra por palabra en la
  versión imprimible.

## Ejercicio del derecho: artículo L221-21 (versión del 19 de junio de 2026)

*Texto oficial, redacción resultante de la ordonnance n° 2026-2 du 5 janvier 2026 (art. 26: en vigor el
19 de junio de 2026; contratos en curso en esa fecha regidos por los textos anteriores). Reproducido el 02/11/2026 a
partir del texto facilitado por el mantenedor.*

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

*Explicación (no es una traducción oficial):* el consumidor desiste enviando, antes de que expire el plazo, el formulario de desistimiento o cualquier otra declaración inequívoca. El profesional puede permitir rellenarlo y enviarlo en su sitio web; en ese caso envía sin demora un acuse de recibo en soporte duradero. Para los contratos celebrados mediante una interfaz en línea, debe ofrecer una función gratuita de desistimiento. Un decreto fija sus modalidades para garantizar un acceso fácil, directo y permanente.

**Correspondencia en Crénelio**

| Exigencia de L221-21 | Implementación |
|---|---|
| Formulario o cualquier declaración inequívoca | Formulario de desistimiento imprimible; el email y la dirección de la empresa figuran en el modelo de información |
| Envío antes de que expire el plazo | Desistimiento en línea aceptado hasta `withdrawal_until` inclusive; se registra la fecha de la declaración |
| Acuse de recibo sin demora, en soporte duradero | Email enviado en cuanto se confirma (`QuoteNotifier::sendWithdrawal`), registrado en el historial |
| Función gratuita para un contrato celebrado mediante una interfaz en línea | Botón « Renoncer au contrat ici » (Renunciar al contrato aquí) en la página del presupuesto, sin cuenta ni gastos |
| Acceso fácil, directo y permanente (decreto) | Mismo enlace que el de la aceptación (email), botón visible durante todo el plazo |

## Función de desistimiento en línea (desde el 19 de junio de 2026)

La ordonnance n° 2026-2 y el décret n° 2026-3 du 5 janvier 2026 (transposición de la directiva (UE)
2023/2673) imponen, para todo contrato a distancia celebrado **mediante una interfaz en línea**, una función de
desistimiento gratuita (**confirmado por el artículo D221-5**, texto en [textes/code-consommation.md](../fr/textes/code-consommation.md)):

- identificada con las palabras « **renoncer au contrat ici** » (renunciar al contrato aquí) o una fórmula análoga inequívoca;
- visible, directa y fácilmente accesible **durante todo el plazo** de desistimiento;
- el consumidor indica o confirma su **nombre y apellidos**, el **contrato** afectado y el **medio
  electrónico** para recibir el acuse de recibo, y luego valida con « **confirmer la rétractation** » (confirmar el desistimiento);
- **acuse de recibo** en soporte duradero, en un plazo razonable, que recoge el contenido de la
  declaración y la **fecha y hora** de su envío;
- la información precontractual indica dónde se encuentra esta función;
- sanción: multa administrativa de hasta 15 000 € (persona física) o 75 000 € (persona jurídica).

El modelo de información (anexo al artículo R221-3) se modificó en consecuencia (versión en vigor a
19 de junio de 2026): texto oficial y opciones de aplicación en [retractation-modele.md](retractation-modele.md).

## En Crénelio

- Casilla « intervention urgente » (intervención urgente) en el presupuesto: ni plazo ni función de desistimiento.
- Si no, para aceptar, el cliente confirma haber tomado conocimiento de su derecho; puede pedir
  la ejecución anticipada (casilla distinta); se registra el fin del plazo (`withdrawal_until`).
- Página del presupuesto (`/devis/:token`): información sobre el plazo y la ubicación de la función antes
  de la aceptación; tras la aceptación, botón « Renoncer au contrat ici » (Renunciar al contrato aquí), declaración (nombre, email del acuse,
  contrato recordado), botón « Confirmer la rétractation » (Confirmar el desistimiento); estado `withdrawn`, declaración conservada
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Acuse de recibo por email al cliente (contenido, fecha y hora) y aviso al profesional (reembolso
  en 14 días); el email de aceptación recuerda la fecha límite y la ubicación de la función.
- Marcas de tiempo: la conexión MySQL está alineada con el huso horario de la aplicación.
- Página del presupuesto: modelo de información reglamentario mostrado palabra por palabra (`src/utils/withdrawalNotice.ts`).
- **Formulario en línea prerrellenado** (`/devis/:token/retractation`): modelo del anexo R221-1 palabra por
  palabra, transmitido por la función de desistimiento; **PDF rellenable** adjunto al email de aceptación;
  declaración validada descargable en PDF y adjunta a los acuses. Se informa al cliente de esta
  facilidad (texto `ONLINE_FORM_NOTICE`, fuera del modelo reglamentario).
- **Antes del contrato** (L221-5, 7°, 10/11/2026): el formulario tipo (PDF rellenable, sin fecha de aceptación ni enlace en línea, ya que la función en línea solo puede usarse tras la aceptación) se adjunta al correo de envío del presupuesto, salvo urgencia; también sigue en la versión imprimible.
- **Ejemplar del contrato** (L221-9): el email enviado al cliente tras su aceptación recoge todas las
  informaciones del contrato, el modelo de información y el formulario tipo (`LegalTexts.php`).
- Versiones imprimibles (`/devis/:token/imprimer`): modelo de información en el presupuesto; formulario tipo
  del anexo al artículo R221-1, **palabra por palabra** (confirmado el 04/11/2026).
