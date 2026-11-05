# Disbursements (*débours*): parts bought in the customer's name

*Translation of the French version dated 01/11/2026 — the French version prevails. Official texts are quoted in French.*

*Last check: 01/11/2026. Legal basis: CGI art. 267 II 2° (sums reimbursed to intermediaries who incur
expenses in the name and on behalf of their principals). Secondary sources summarised: Portail
auto-entrepreneur, Legifiscal, Dougs (see [sources](../sources.md)). BOFiP doctrine read on 04/11/2026;
validation by a chartered accountant (*expert-comptable*) recommended.*

## Official texts (checked on 04/11/2026)

- **Law**: CGI (Code général des impôts, French General Tax Code), article 267, II, 2°
  ([textes/code-general-impots.md](../fr/textes/code-general-impots.md)).
- **Doctrine**: BOI-TVA-BASE-10-10-30, III, § 200 to 230 and BOI-TVA-BASE-10-20-40-30, § 130
  ([textes/bofip.md](../fr/textes/bofip.md)). The **four cumulative conditions**:
  1. act under a **prior and explicit mandate** (*mandat*) (« et non pas présumé » — *and not presumed*)
     in the name and on behalf of the principal;
  2. **account exactly** to the customer for the commitment and the amount of the expenses;
  3. record these expenses in **transit accounts** (*comptes de passage*) (for those who do not keep
     commercial accounts: « comptes spécifiques » — *specific accounts*, BOI-TVA-BASE-10-20-40-20 § 70);
  4. **justify** the nature or the exact amount of the disbursements (supplier invoices, statements sent to
     the customer…).
- **Acting in the customer's name** (§ 220): the contract with the supplier states that it is concluded in
  the name of another person, or **the invoice is addressed directly to the customer**; if it is addressed
  to the tradesperson, it must show that they act in the name of another person (customer's name and
  address).
- **Excluded** (§ 210, § 230): expenses incurred for one's own business and ordinary operating costs passed
  on to customers.

Crénelio's **separate and prior** mandate, the invoice in the customer's name and the accounting to the
customer (« Préparer la facture » (Prepare the invoice) sheet, copy of the supporting document) meet these
conditions. 

### Micro-entrepreneur: turnover and receipts book (checked on 04/11/2026)

- **Contributions** (C. sécu. soc. (Code de la sécurité sociale, French Social Security Code) L613-7,
  [textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md)): calculated on « le montant de
  leur **chiffre d'affaires** ou de leurs recettes **effectivement réalisés** » (*the amount of their
  turnover or receipts actually earned*) of beneficiaries of the schemes of articles 50-0 and 102 ter of
  the CGI. **No article explicitly mentions disbursements.** Their exclusion follows from the fact that they
  are not the entrepreneur's turnover: sums advanced in the name and on behalf of the customer, under the
  conditions of article 267, II, 2° of the CGI and the doctrine above. A secondary source claiming that it
  is « ancrée dans l'article L613-7 » (*rooted in article L613-7*) goes further than the text.
- **Thresholds** (CGI 50-0, 1, version of 31/10/2026,
  [textes/code-general-impots.md](../fr/textes/code-general-impots.md)): **€83,600** turnover excluding
  tax for services, **€203,100** for sale of goods; updated every three years.
- **Receipts book** (*livre des recettes*) (C. com. (Code de commerce, French Commercial Code) L123-28 and
  CGI 50-0, 5): a book « mentionnant chronologiquement le montant et l'origine des recettes » (*recording
  chronologically the amount and origin of receipts*), « servi au jour le jour » (*kept day by day*),
  **supported by invoices and all other supporting documents**. The texts do not require a « débours »
  mention: recording it separately (or in an annexed register) is a **good practice** to explain the gap
  between amounts collected and declared turnover, to be validated with the chartered accountant.

## Why it matters for a micro-entrepreneur

Buying a part **in one's own name** and then re-invoicing it is **purchase and resale** (*achat-revente*):
the amount is included in turnover (contributions, thresholds), and it is a commercial activity distinct
from the provision of services. The disbursement avoids this: the part is bought **in the name and on
behalf of the customer**, the amount is not included in turnover and bears no contributions.

## Conditions (all required)

1. **Prior written mandate** from the customer: nature of the purchase and **maximum budget**. It serves as
   proof if the customer refuses to reimburse.
2. **Supplier invoice or receipt in the customer's name**, with their full details (for a business:
   SIRET, intra-EU VAT number, head-office address). A purchase in the tradesperson's name cannot be a
   disbursement.
3. **Reimbursement of the exact amount**, without margin; no VAT added by a tradesperson under the VAT
   exemption scheme (*franchise*).
4. **Separate line** on the invoice, apart from the price of the service.
5. **Supporting documents**: keep the originals (audit), give a copy to the customer.
6. In the **receipts book**, write « débours » next to the amount (good practice: the texts require a
   chronological receipts book supported by supporting documents, without requiring this mention).

## What cannot be a disbursement

- Fuel and mileage costs (to be included in the price or in travel costs, which are part of turnover).
- The tradesperson's tools, equipment and software, their own operating costs.

## Business customer registered for VAT

If the tradesperson is under the VAT exemption scheme, it is preferable for the business customer to pay
the supplier directly: they will be able to recover the VAT.

## Mandate: an agreement separate from the quote

The sources require a **prior written agreement** (« mandat de débours » — *disbursement mandate*)
specifying the nature of the purchase and the maximum budget, signed by both parties; none prescribes its
form. Crénelio treats it as a **document separate** from the quote, with its **own agreement**: the mandate
commits the customer to reimburse a purchase made in their name, which is not the purpose of the service
quote, and it serves as its own proof in case of audit (amounts outside turnover). The customer may accept
the quote and **refuse the mandate**: they then supply the parts themselves.

## In Crénelio

- Editor: section « Mandat de débours (document séparé) » (Disbursement mandate (separate document)): parts
  in the customer's name, **maximum budget** (`debours_budget`, at least the estimated amount), reminders
  to the tradesperson.
- Totals: the **quote total** covers only the services; disbursements are totalled separately
  (`total_debours`), with an indicative « total estimé à régler » (estimated total to pay).
- Customer's answer: agreement to the quote **and** a separate answer to the mandate (given or refused),
  each dated (`decided_at`, `mandate_decided_at`) with the IP address.
- Printable version of the mandate, on its own (step 4 of Item 22).
- The « fourniture revendue » (resold supply, purchase and resale) line is disabled by default
  (`quote_allow_supply`).
