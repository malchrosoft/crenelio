# Withdrawal: distance contract or contract at the customer's home

*Translation of the French version dated 04/11/2026 — the French version prevails. Official texts are quoted in French.*

*Last check: 04/11/2026 (official texts: [textes/code-consommation.md](../fr/textes/code-consommation.md)). Sources: DGCCRF sheet « Dépannage à domicile » (official); INC;
secondary sources on L221-25. Articles of the Code de la consommation (French Consumer Code) to be re-read in
their consolidated version (see [sources](../sources.md)).*

## Principle

A quote accepted **online** (distance contract, *contrat à distance*) or **signed at the customer's home**
(off-premises contract, *contrat hors établissement*) gives the private customer a **14-day withdrawal
period** (right of withdrawal, *droit de rétractation*) (C. consom. L221-18). The professional must inform
them before the contract is concluded, and give:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Explanation (not an official translation):* a copy of the contract, on paper signed by the parties or, with
the consumer's agreement, on a durable medium; it must come with the standard withdrawal form and contain,
on pain of nullity, the information of articles L111-1 and L111-2.

If the withdrawal information is missing, the period is extended by twelve months (L221-20, confirmed).

## Exception: emergency

No withdrawal for « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (*maintenance or repair work to be carried out urgently at
the consumer's home and expressly requested by them*) (L221-28, 8°, quoted by the INC), **within the limit of
the spare parts and work strictly necessary to respond to the emergency** (DGCCRF sheet). Emergency means
« la nécessité de faire cesser un danger pour la sécurité des personnes ou l'intégrité des locaux » (*the need
to stop a danger to people's safety or to the integrity of the premises*).

Any **additional** work offered on site remains subject to the 14-day period.

## Starting before the end of the period

Under L221-25 (official text above): the professional may only start before the end of the period at the
customer's **express request**; if the customer then withdraws, they owe an amount proportionate to the
service already provided. Without an express request obtained, nothing is owed.

## What the official texts say (checked on 04/11/2026)

Full text: [textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Definitions** (L221-1): **distance** contract = concluded without the simultaneous physical presence of
  the parties, exclusively by means of distance communication up to conclusion; **off-premises** contract =
  concluded in the simultaneous physical presence of the parties away from the usual place of business,
  **including following a request from the consumer** (quote signed at the customer's home), or at a
  distance immediately after a personal solicitation made away from that place. A contract that transfers
  ownership of goods **and** provides a service is **treated as a sale** (II): to be watched for
  « fourniture revendue » (resold supply) lines (period running from receipt of the goods).
- **Period** (L221-18): fourteen days from **the conclusion of the contract** for a service. **Calculation**
  (L221-19): the day of conclusion is not counted; the period expires at the end of the last day; if it falls
  on a Saturday, Sunday or public holiday or non-working day, it is extended to the next working day.
  → `Quote::withdrawalDeadline` (statutory public holidays, Easter calculated).
- **Missing information** (L221-20): period extended by twelve months; reduced to fourteen days from receipt
  of the information if it is provided in the meantime.
- **Early performance** (L221-25): express request obtained « par tout moyen » (*by any means*) at a distance,
  « sur papier ou sur support durable » (*on paper or on a durable medium*) off-premises; the professional
  **asks the consumer to acknowledge** that after full performance they will no longer have the right of
  withdrawal. Without an express request obtained, or without the information of 9° of L221-5, **no sum is
  owed**. → checkbox text completed (page, printable version, acceptance email).
- **Exceptions** (L221-28): 1° service fully performed before the end of the period, with express agreement
  and acknowledgement of loss of the right → `Quote::canWithdraw` refuses withdrawal when the quote's
  appointment is "completed" and early performance had been requested; 8° urgent work expressly requested,
  within the limit of what is strictly necessary.
- **Information** (L221-5, 7° and 10°): conditions, period, terms, standard form and location of the
  withdrawal function; if the right does not exist (emergency), the information that the consumer does not
  benefit from it.
- **Off-premises** (L221-9): dated copy of the contract, signed paper or durable medium, with all the
  information of L221-5 and **accompanied by the standard form**. (L221-10): **no payment or consideration
  before seven days** from conclusion, except urgent work (4°).
- **Online function** (D221-5, created by decree no. 2026-3): labels « renoncer au contrat ici » (*withdraw
  from the contract here*) and « confirmer la rétractation » (*confirm withdrawal*), declaration (first name
  and surname, contract, electronic means for the acknowledgement), acknowledgement of receipt repeating the
  content, date and time. Consistent with the implementation.
- **Standard form** (annex to article R221-1, decree no. 2022-424): reproduced word for word in the printable
  version.

## Exercising the right: article L221-21 (version of 19 June 2026)

*Official text, wording resulting from ordinance (*ordonnance*) no. 2026-2 of 5 January 2026 (art. 26: in
force on 19 June 2026; contracts in progress on that date governed by the previous texts). Reproduced on
02/11/2026 from the text provided by the maintainer.*

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

*Explanation (not an official translation):* the consumer withdraws by sending, before the period expires, the
withdrawal form or any other unambiguous statement. The professional may allow this to be done online on
their website, and must then send an acknowledgement of receipt on a durable medium without delay. For
distance contracts concluded through an online interface, the professional must provide a free function to
withdraw before the period expires. A decree sets how this function is presented and used, to ensure easy,
direct and permanent access.

**Mapping in Crénelio**

| Requirement of L221-21 | Implementation |
|---|---|
| Form or any unambiguous statement | Printable withdrawal form; the company's email and address appear in the information model |
| Sent before the period expires | Online withdrawal accepted up to and including `withdrawal_until`; the date of the declaration is recorded |
| Acknowledgement of receipt without delay, on a durable medium | Email sent upon confirmation (`QuoteNotifier::sendWithdrawal`), logged |
| Free function for a contract concluded via an online interface | « Renoncer au contrat ici » (Withdraw from the contract here) button on the quote page, with no account and no cost |
| Easy, direct and permanent access (decree) | Same link as the acceptance link (email), button visible throughout the period |

## Online withdrawal function (since 19 June 2026)

Ordinance no. 2026-2 and decree no. 2026-3 of 5 January 2026 (transposition of Directive (EU) 2023/2673)
require, for any distance contract concluded **via an online interface**, a free withdrawal function
(**confirmed by article D221-5**, text in [textes/code-consommation.md](../fr/textes/code-consommation.md)):

- identified by the words « **renoncer au contrat ici** » or a similar unambiguous wording;
- visible, directly and easily accessible **throughout** the withdrawal **period**;
- the consumer enters or confirms their **first name and surname**, the **contract** concerned and the
  **electronic means** to receive the acknowledgement, then validates with « **confirmer la rétractation** »;
- **acknowledgement of receipt** on a durable medium, within a reasonable time, repeating the content of the
  declaration and the **date and time** it was sent;
- the pre-contractual information states where this function is located;
- penalty: administrative fine up to €15,000 (natural person) or €75,000 (legal person).

The information model (annex to article R221-3) has been amended accordingly (version in force on 19 June
2026): official text and implementation choices in [retractation-modele.md](retractation-modele.md).

## In Crénelio

- « intervention urgente » (urgent job) box on the quote: no withdrawal period or function.
- Otherwise, to accept, the customer confirms they have read about their right; they may request early
  performance (separate box); the end of the period is recorded (`withdrawal_until`).
- Quote page (`/devis/:token`): information on the period and the location of the function before
  acceptance; after acceptance, « Renoncer au contrat ici » (Withdraw from the contract here) button,
  declaration (name, email for the acknowledgement, contract recalled), « Confirmer la rétractation »
  (Confirm withdrawal) button; status `withdrawn`, declaration kept (`withdrawn_at`, `withdrawal_name`,
  `withdrawal_email`, IP).
- Acknowledgement of receipt by email to the customer (content, date and time) and notice to the tradesperson
  (refund within 14 days); the acceptance email recalls the deadline and the location of the function.
- Timestamps: the MySQL connection is aligned with the application's time zone.
- Quote page: regulatory information model displayed word for word (`src/utils/withdrawalNotice.ts`).
- **Pre-filled online form** (`/devis/:token/retractation`): model of annex R221-1 word for word, sent through
  the withdrawal function; **fillable PDF** attached to the acceptance email; validated declaration
  downloadable as PDF and attached to the acknowledgements. The customer is informed of this facility
  (`ONLINE_FORM_NOTICE` text, outside the regulatory model).
- **Before the contract** (L221-5, 7°, 10/11/2026): the standard form (fillable PDF, without acceptance date or online link, since the online function can only be used after acceptance) is attached to the email sending the quote, except in emergencies; it also remains in the printable version.
- **Copy of the contract** (L221-9): the email sent to the customer after acceptance repeats all the contract
  information, the information model and the standard form (`LegalTexts.php`).
- Printable versions (`/devis/:token/imprimer`): information model in the quote; standard form of the annex
  to article R221-1, **word for word** (confirmed on 04/11/2026).
