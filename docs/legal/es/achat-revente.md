# Compraventa de suministros (*achat-revente*, piezas revendidas)

*Traducción de la versión francesa del 01/11/2026; prevalece la versión francesa. Los textos oficiales se citan en francés.*

*Última verificación: 01/11/2026. Fuentes: Portail auto-entrepreneur (portal del autónomo; gastos suplidos y gastos refacturados,
resumen); normas del régimen de microempresario (*micro-entrepreneur*) que deben releerse en los sitios oficiales (URSSAF, ventanilla única)
antes de cualquier activación. Ver [fuentes](../sources.md).*

## Qué es

El artesano (*artisan*) compra la pieza **a su nombre** y luego la refactura al cliente (con o sin margen). Es una
**venta de mercancías**, distinta de la prestación de servicios. No debe confundirse con el
[gasto suplido (*débours*)](debours.md), en el que la pieza se compra en nombre y por cuenta del cliente.

## Consecuencias para un empresario individual (microempresa)

- El importe revendido **entra en la cifra de negocios** (el Portail auto-entrepreneur desaconseja este
  método por ese motivo: aumenta las cotizaciones).
- La venta de mercancías tiene sus **propios umbrales** de cifra de negocios y su **propio tipo** de
  cotizaciones; junto con prestaciones de servicios, la actividad pasa a ser **mixta** y ambas cifras se
  siguen por separado (importes vigentes: Item 39, a verificar cada año).
- La actividad de venta debe **declararse** (ventanilla única, *guichet unique*) si no lo está ya.
- El artesano pasa a ser **vendedor**: factura de compra a su nombre, garantías legales debidas al cliente sobre la
  pieza, posible stock.

## IVA de las piezas instaladas (artesano sujeto al IVA)

BOI-TVA-BASE-10-20-40-20, § 140 y 150 ([textes/bofip.md](../fr/textes/bofip.md)): los **suministros**
(*fournitures*: materiales transformados o consumidos) siguen el precio del servicio; las **piezas de recambio** (*pièces détachées*: objetos
normalizados simplemente instalados) son una **venta al tipo que les es propio**, salvo si su valor es
inferior al de la instalación o si han sido adaptadas. Simplificación admitida: piezas y suministros
siguen el régimen de la prestación si su valor global **no excede el 50 % del coste total**; en caso contrario la
venta de las piezas se menciona **por separado** en la factura.

En Crénelio (presupuesto con IVA): el editor calcula la parte de las líneas « fourniture revendue » (suministro revendido) en el
coste total sin impuestos (gastos suplidos excluidos, fuera de la cifra de negocios) y la recuerda bajo las líneas: hasta el 50 %, mismo
tipo que la prestación; por encima, tipo propio de las piezas, en líneas separadas (lo que ya hace el
presupuesto). Un presupuesto que incluye un suministro revendido se asimila a una **venta** (C. consom. L221-1, II, Code de la consommation, Código de Consumo francés): el
plazo de desistimiento corre desde la entrega de las piezas al cliente (L221-18, 2°), fecha que debe introducirse en el presupuesto
aceptado; ver [retractation-modele.md](retractation-modele.md).

El control del IVA es **indicativo**: la comparación se hace en principio pieza por pieza, y solo el
profesional sabe si una pieza ha sido adaptada. El tipo sigue siendo su elección, a validar con su contable.

## Sociedad

La reventa debe entrar en el **objeto social**; las piezas se facturan con el IVA de la sociedad.

## En Crénelio

- Línea « fourniture revendue » rechazada por la API mientras `quote_allow_supply` no esté activado.
- Activación tras una **advertencia** adaptada a la forma jurídica (`legal_form`), que debe aceptarse
  explícitamente; recomendación por defecto: el gasto suplido.
