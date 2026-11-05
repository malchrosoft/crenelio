# Purchase and resale of supplies (resold parts)

*Translation of the French version dated 01/11/2026 — the French version prevails. Official texts are quoted in French.*

*Last check: 01/11/2026. Sources: Portail auto-entrepreneur (disbursements and re-invoiced costs,
summary); rules of the micro-entrepreneur scheme to be re-read on official websites (URSSAF, single
business window *guichet unique*) before any activation. See [sources](../sources.md).*

## What it is

The tradesperson buys the part **in their own name**, then re-invoices it to the customer (with or without
margin). This is a **sale of goods**, distinct from the provision of services. Not to be confused with the
[disbursement](debours.md) (*débours*), where the part is bought in the name and on behalf of the customer.

## Consequences for an individual entrepreneur (micro-enterprise)

- The resold amount **is included in turnover** (the Portail auto-entrepreneur advises against this method
  for this reason: it increases contributions).
- The sale of goods has its **own** turnover **thresholds** and its **own rate** of contributions; together
  with services, the activity becomes **mixed** and both figures are tracked separately (amounts in force:
  Item 39, to be checked every year).
- The sales activity must be **declared** (*guichet unique*) if it is not already.
- The tradesperson becomes a **seller**: purchase invoice in their name, statutory guarantees owed to the
  customer on the part, possible stock.

## VAT on fitted parts (VAT-registered tradesperson)

BOI-TVA-BASE-10-20-40-20, § 140 and 150 ([textes/bofip.md](../fr/textes/bofip.md)): **supplies**
(*fournitures*: materials transformed or consumed) follow the price of the service; **spare parts**
(*pièces détachées*: standardised items simply fitted) are a **sale at their own rate**, unless their value
is lower than that of the fitting or they have been adapted. Accepted simplification: parts and supplies
follow the regime of the service if their overall value **does not exceed 50% of the total cost**;
otherwise the sale of parts is shown **separately** on the invoice.

In Crénelio (quote with VAT): the editor calculates the share of « fourniture revendue » (resold supply)
lines in the total cost excluding VAT (disbursements excluded, outside turnover) and displays it under the
lines: up to 50%, same rate as the service; above, the parts' own rate, on separate lines (which the quote
already does). A quote that includes a resold supply is treated as a **sale** (C. consom. L221-1, II): the
withdrawal period runs from delivery of the parts to the customer (L221-18, 2°), a date to be entered in
the accepted quote; see [retractation-modele.md](retractation-modele.md).

The VAT check is **indicative**: the comparison is in principle made part by part, and only the
professional knows whether a part has been adapted. The rate remains their choice, to be validated with
their accountant.

## Company

Resale must fall within the **corporate purpose** (*objet social*); parts are invoiced with the company's VAT.

## In Crénelio

- « Fourniture revendue » line rejected by the API as long as `quote_allow_supply` is not enabled.
- Activation behind a **warning** adapted to the legal form (`legal_form`), to be explicitly accepted;
  default recommendation: the disbursement.
