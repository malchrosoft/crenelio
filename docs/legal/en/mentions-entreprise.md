# Company details on quotes, invoices and advertising

*Translation of the French version dated 01/11/2026 — the French version prevails. Official texts are quoted in French.*

*Last check: 01/11/2026. Sources: DGCCRF sheet (advertising); Bpifrance Création and other secondary
sources (EI mention); texts to re-read: C. com. R526-27, C. consom. L616-1.*

## Official texts (checked on 04/11/2026)

[textes/code-commerce.md](../fr/textes/code-commerce.md), [textes/code-consommation.md](../fr/textes/code-consommation.md)
and [textes/code-artisanat.md](../fr/textes/code-artisanat.md):

- **EI** (individual entrepreneur, *entrepreneur individuel*) (C. com. (Code de commerce, French Commercial
  Code) R526-27): name or usual name immediately preceded or followed by « entrepreneur individuel » or
  « EI », on business documents and correspondence and on the title of the dedicated bank account.
- **Company** (C. com. R123-238): company name preceded or followed by the legal form (« SARL », « SAS »,
  « SA », « SCA », « SE », « SNC », « SCS »…); **share capital** (*capital social*) mandatory for SARL and
  joint-stock companies (SAS, SA, SCA, SE), not for SNC or SCS. EURL and SASU are single-member SARL and SAS.
- **Registered person** (C. com. R123-237): unique identification number, « RCS » + city of the commercial
  court registry if registered with the RCS, registered office, EI mention; same mentions **on the website**.
- **Consumer information** (C. consom. (Code de la consommation, French Consumer Code) R111-1 and R111-2):
  status and legal form; registration **with the RCS or the Registre national des entreprises** (national
  business register) (crafts sector: the « répertoire des métiers » (trades register) no longer exists);
  **intra-EU VAT number** if VAT-registered; insurance with **insurer's details and geographical cover**;
  general terms and conditions if used; terms of payment, performance and complaint handling; statutory
  guarantees; mediator.
- **Ten-year liability insurance** (*assurance décennale*) (C. assur. (Code des assurances, French Insurance
  Code) L241-1, L243-2 and L243-3, [textes/code-assurances.md](../fr/textes/code-assurances.md)): any person
  whose ten-year liability may be engaged (C. civ. (Code civil, French Civil Code) 1792 et seq.) must be
  insured; proof takes the form of an **insurance certificate attached to quotes and invoices**, following
  a model set by order (*arrêté*). Penalty: six months' imprisonment and a €75,000 fine (L243-3).
  A simple mention is not enough: the certificate itself must accompany the quote.
  - **Scope** (L243-1-1): certain works are excluded (infrastructure, networks, pipes, energy works… unless
    they are ancillary to a covered work) as well as **works existing before the site opened**, unless they
    are fully incorporated into the new work.
  - **Certificate model** (A243-2 to A243-5, order of 5 January 2016): document **issued and signed by the
    insurer**, titled « Attestation d'assurance » and « Assurance de responsabilité décennale
    obligatoire », with the insured (name, address, identification number), the insurer, the contract
    number, the **period of validity**, the date of issue, the activities covered, the geographical scope
    and the required wording on the nature, amount and duration of the cover.
  - **In Crénelio**: the professional declares in the Entreprise (Company) screen that their work may fall
    under the builders' guarantees, then uploads the certificate received from their insurer (PDF) with its
    expiry date (warning 30 days before). On each quote concerned (« Travaux relevant des garanties des
    constructeurs » (Work covered by builders' guarantees) box), the guarantees are recalled and the
    certificate is **attached to the sending email** and can be viewed from the quote; without a valid
    certificate, sending is refused.
- **Statutory guarantees** (C. consom. R111-1, 3°: « ou de toute autre garantie légale applicable » — *or
  any other applicable statutory guarantee*): for work constituting a **construction work** (*ouvrage*)
  ([textes/code-civil.md](../fr/textes/code-civil.md)), the contractor bound to the customer by a contract
  for work (*contrat de louage d'ouvrage*) is « réputé constructeur » (*deemed a builder*) (1792-1) and owes:
  - the **ten-year guarantee** (*garantie décennale*) (1792, 1792-2): damage compromising the soundness of
    the work or making it unfit for its purpose, and equipment that forms « indissociablement corps »
    (*an inseparable whole*) with the work (cannot be removed without damaging the work); ten years from
    acceptance (1792-4-1);
  - the **proper-functioning guarantee** (*garantie de bon fonctionnement*) for other equipment: **at least
    two years** from acceptance (1792-3);
  - the **completion guarantee** (*garantie de parfait achèvement*): **one year** from acceptance, for
    reported defects; excluding normal wear (1792-6).

  Any clause that excludes or limits these guarantees is **deemed unwritten** (*réputée non écrite*)
  (1792-5). **Acceptance** (*réception*) is the act by which the customer accepts the work, with or without
  reservations (1792-6). Equipment whose sole function is the customer's professional activity is excluded
  (1792-7).
  A simple repair or maintenance that does not create a work and does not affect an equipment element of
  the work does not, in principle, fall under this regime: it is up to the professional to qualify their
  work, if necessary with their insurer.
- **Complaints** (C. consom. R111-1, 2°): complaint-handling terms, `legal_complaints` setting shown on
  quotes.
- **Mediator** (C. consom. R616-1): details **and website address** of the mediator, visibly on the
  website, the general terms and conditions or the order forms.
- **The word « artisan »** (C. artisanat (Code de l'artisanat, French Crafts Code) L241-2): €7,500 fine for
  using the word « artisan » or its derivatives in the name, sign, promotion or advertising without holding
  the status of *artisan* (L211-1: diploma, title or experience). Building and fluids activities also
  require a professional qualification (L121-1).
  **In Crénelio**: no text seen by the public uses the word « artisan » (« le professionnel » (the
  professional), company name); the tagline and presentation entered by the professional remain their
  responsibility: do not write « artisan » there without holding that status.

## Individual entrepreneur (« EI »)

Since 15 May 2022 (decree no. 2022-725), the individual entrepreneur, including the micro-entrepreneur,
trades under a name including their surname, **immediately preceded or followed** by « entrepreneur
individuel » or « EI » (C. com. R526-27). Documents concerned: invoices, quotes, price lists, advertising,
correspondence, business cards; the business bank account too.

**In Crénelio**: legal form `legal_form` (« Entreprise individuelle » (sole proprietorship) by default); for
a sole proprietorship, designation `legal_ei_mention`, either « EI » or « Entrepreneur individuel ».

## Company (EURL, SARL, SASU, SAS…)

A company's documents state its name, its **legal form** and the amount of its **share capital**
(`legal_capital`, editable and printed only for EURL, SARL, SASU and SAS; `CAPITAL_FORMS` in
`configSchema.ts`), with the RCS number (to re-read: C. com. R123-237 and R123-238).

## Identification

- SIRET; registration number in the trades register (RM, *répertoire des métiers*) or the RCS (`legal_rm`).
- Professional insurance (`legal_assurance`); ten-year insurance for work that requires it (Item 39).

## Consumer mediator

Any professional dealing with private individuals must allow them to use a mediator free of charge and
provide the mediator's details (C. consom. L616-1). Setting `legal_mediator`.

## Displayed prices (order of 3 December 1987, official text read on 04/11/2026)

[textes/arretes.md](../fr/textes/arretes.md):

- **Art. 1**: any price information, whatever the medium (showcase website, booking), shows the **total
  amount including VAT** actually paid, in euros.
- **Art. 3**: if the advertised price does not include an element **essential** to the service (parts,
  travel costs…), this must be **stated explicitly**.
- **Art. 14**: for a service offered at a distance (online booking is one), the price is stated **precisely,
  by any means providing proof, before the contract is concluded**.

## Advertising of home repair services (DGCCRF sheet)

> « Toute publicité écrite, permettant une commande à distance […], à l'exception des annuaires, doit
> comporter les mentions suivantes :
> - le nom, la raison sociale et l'adresse de l'entreprise ;
> - son numéro d'inscription au registre du commerce ou au répertoire des métiers ;
> - les taux horaires de main-d'œuvre toutes taxes comprises pratiqués pour chaque catégorie de
>   prestation concernée ou les prix unitaires, quelles que soient les unités ;
> - les frais de déplacement, lorsque les entreprises se rendent au domicile du consommateur ;
> - le caractère payant ou non du document précontractuel ;
> - le cas échéant, toute autre condition de rémunération. »

*Explanation (not an official translation):* any written advertising allowing a distance order (except
directories) must state: company name, trade name and address; registration number in the trade register
or trades register; hourly labour rates including VAT for each category of service, or unit prices;
travel costs when visiting the consumer's home; whether the pre-contractual document is charged; any other
remuneration condition.

Crénelio's showcase website allows online booking: to be checked in Item 39.
