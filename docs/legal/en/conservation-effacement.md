# Retention and erasure of customer data

*Translation of the French version dated 14/11/2026 — the French version prevails. Official texts are quoted in French.*

*Last checked: 14/11/2026. Legal basis: Code de la consommation (French Consumer Code), L213-1, D213-1 and D213-2
(retention of contracts concluded electronically); Code de commerce (French Commercial Code), L123-22 (supporting
documents); Regulation (EU) 2016/679 (GDPR), articles 5, 6 and 17. Texts word for word:
[textes/code-consommation.md](../fr/textes/code-consommation.md), [textes/code-commerce.md](../fr/textes/code-commerce.md),
[textes/droit-europeen.md](../fr/textes/droit-europeen.md). Help sheet, not legal advice.*

## Key points

| Data | Kept for | Then |
|---|---|---|
| Appointment (name, email, phone, address, notes) | The period you set (Account screen, 36 months by default) after the job | **Deleted** automatically |
| Quote **not accepted** (draft, sent, refused, expired, cancelled) | The same period | **Deleted** automatically |
| Quote **accepted** (contract), even if later withdrawn | **Ten years** after the job (or after the agreement, failing that), with the record of the agreement; once the job is over, it is **archived** (« Archivés » (*Archived*) filter of the « Devis » (*Quotes*) screen) | **Deleted** automatically, together with its appointment |

Why delete rather than "anonymise": a row kept with its date, service, amount and town can still identify the
customer, for example by matching it with an invoice. Removing the name is not enough to make data anonymous: it
must no longer be possible to single out a person, link their data or infer information about them (Article 29
Working Party, Opinion 05/2014 on Anonymisation Techniques, pp. 9 and 10). Crénelio therefore deletes, instead of
keeping "anonymised" rows.

*Scope of this source (checked on 14/11/2026)*: Opinion 05/2014 **predates the GDPR** (adopted in 2016, applicable
since 25 May 2018) and is not on the list of Article 29 Working Party documents endorsed by the European Data
Protection Board at its first plenary meeting; it nevertheless remains the reference cited by the CNIL (French data
protection authority) in its guide on retention periods (July 2020) and its reference framework for commercial
management (published in January 2022). The Board has put guidelines on pseudonymisation out for consultation
(01/2025, final version not confirmed at that date). The deletion chosen by Crénelio does not depend on these
debates: deleted data no longer needs to be classified.

While it is kept, an accepted quote is in **intermediate archiving** within the meaning of the CNIL: only the data
that evidence the contract are kept (the customer's phone number is removed), it leaves the current list of quotes
and is consulted only when needed, for example for a dispute or a request from the customer (CNIL, guide on
retention periods, July 2020, and reference framework « gestion des activités commerciales »).

## Why ten years for an accepted quote

- **Contract concluded online for €120 or more**: obligation. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » and « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). The amount is set at 120 euros (D213-1); the period, at ten years from conclusion, or
  from performance when it is deferred (D213-2). A quote accepted from its online page falls within this case.
- **Below €120**: the law does not require it under L213-1. Crénelio applies **the same period as a
  precaution**: an accepted quote is a document supporting your invoice, and the Code de commerce provides that
  « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). This text
  is aimed first at traders (*commerçants*): your chartered accountant will tell you whether it applies to your
  situation.

## A locked contract, and its proof

The quote is **locked**:

- **when it is sent**, your business details (name, legal identity, address, SIRET, insurance, mediator,
  complaints…) are copied onto the quote: if it is consulted in eight years' time, it shows those that appeared on
  the quote sent, even if you have changed address or mediator in the meantime;
- **when it is accepted**, Crénelio computes a **fingerprint** (hash, SHA-256) of everything that makes up the contract
  and of the record of the agreement. Recomputed on request, it shows that nothing has changed since: the quote
  editor shows « Contrat figé : oui, intact » (*Contract locked: yes, intact*).

This meets the conditions for electronic writing (*écrit électronique*), which « a la même force probante que
l'écrit sur support papier, sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit
établi et conservé dans des conditions de nature à en garantir l'intégrité » (C. civ. 1366). Online acceptance is a
**simple electronic signature**: valid, but its reliability is not presumed, unlike a qualified signature
(C. civ. 1367; décret n° 2017-1416, art. 1); in a dispute, it is up to you to prove identification and integrity,
hence this locking. Quotes accepted before 14/11/2026 are not locked.

Each quote also informs the customer of these retention and access arrangements (C. civ. 1127-1, 4°).

The retained quote includes what evidences the contract: your lines and prices, the customer's identity and
address, the date and record of their agreement (IP address), their answers (replaced parts, disbursement
mandate) and, where applicable, their withdrawal statement.

## When a customer asks for erasure

The GDPR gives them this right (article 17), except where retention is « nécessaire […] pour respecter une
obligation légale » (article 17, paragraph 3, b). In practice, with « Effacer le client » (*erase the customer*):

- **deleted**: the appointment, their non-accepted quotes and the related email log;
- **left intact**: any **accepted** quote, until the end of its ten years; its appointment is kept, reduced to its
  date. The confirmation window tells you which ones; tell the customer, citing these texts;
- **upcoming appointment** not cancelled: the confirmation warns you that you will no longer be able to contact
  the customer. Cancel the appointment first if the job is no longer taking place.

Erasure is irreversible. The site's privacy policy informs customers of these periods.

## What you keep elsewhere

Crénelio does not replace your invoicing software or your accounts: your invoices, your books and purchase
receipts (disbursements) are kept according to the rules that apply to you (see
[note and invoice](note-facture.md) and the [checklist](rappels-artisan.md)).
