# Record of personal data processing activities

*Translation of the French version dated 14/11/2026 — the French version prevails. Official texts are quoted in French.*

*Last checked: 14/11/2026. Legal basis: Regulation (EU) 2016/679 (GDPR), article 30. Text word for word:
[textes/droit-europeen.md](../fr/textes/droit-europeen.md). Help sheet, not legal advice.*

## Key points

- **Who keeps it**: you, as the controller of your customers' data. Crénelio is the tool, not the controller.
- **Is it mandatory?** Article 30 exempts businesses with fewer than 250 employees, **unless** the processing « n'est
  pas occasionnel » (*is not occasional*) (paragraph 5). Taking appointments and drawing up quotes all year round is
  not occasional: **keep this record**.
- **In what form?** In writing, « y compris la forme électronique » (*including in electronic form*) (paragraph 3):
  this document, completed and saved (PDF, printout or spreadsheet), is enough.
- **Who do you show it to?** The CNIL (French data protection authority), **on request** (paragraph 4). You do not
  have to publish it: the CNIL describes it as « un document interne et évolutif » (*an internal, evolving
  document*) and states that private organisations « ne sont pas tenus de communiquer le registre au public » (*are
  not required to disclose the record to the public*) ([CNIL, record of processing activities](https://www.cnil.fr/fr/RGDP-le-registre-des-activites-de-traitement)).
  What you owe your customers is information: the site's privacy policy takes care of that.
- **Official template**: the CNIL offers a free simplified record template
  ([registre-traitement-simplifie.ods](https://www.cnil.fr/sites/default/files/atoms/files/registre-traitement-simplifie.ods)).
  You can copy the sheets below into it, or keep this document.

The sheets below describe what **Crénelio** does. Fill in the passages in square brackets and add your other
processing activities (accounting, invoicing, suppliers, employees…): the record covers your whole business, not
just this software. Update it when your settings change.

## Controller (article 30, 1, a)

| | |
|---|---|
| Business | [name or company name, legal form: Entreprise (Company) screen] |
| Address | [business address] |
| Contact | [phone, professional email] |
| Legal representative | [yourself, as a sole trader, or the manager] |
| Data protection officer | [none appointed, or their contact details] |
| Joint controller, representative | [none, except in special cases] |
| Date of creation / of update | [dd/mm/yyyy] |

## Sheet 1: appointments

| Heading (article 30, 1) | Content |
|---|---|
| **Purposes** (b) | Appointment booking online or by the professional, out-of-area requests, organisation of jobs and journeys, calculation of travel costs, confirmations, reminders and management of the appointment by the customer (personal link). |
| Legal basis (art. 6) | Pre-contractual measures and performance of the contract (art. 6, 1, b). |
| **Data subjects** (c) | Customers and prospects (private individuals and businesses). |
| **Data** (c) | Name, email, phone, job address and its position on the map, access details and notes, service, date and time, status, reason for cancellation. |
| **Recipients** (d) | The professional (sole user of the management area); the site's host, as processor ([name: OVHcloud or other]); the host's email sending service; the Base Adresse Nationale (French national address database, run by the French State), which receives the address entered in order to locate it; if you have enabled it, your personal calendar (calendar subscription: [Google, Apple, Microsoft…]). |
| **Transfers outside the EU** (e) | None by Crénelio. [If your calendar or email service is hosted outside the Union, state it here with the safeguards provided by that service.] |
| **Erasure time limit** (f) | [36 months, or the period set in the Account screen] after the job, then automatic deletion. Earlier erasure at the customer's request (« Effacer le client » (*erase the customer*)), except for an appointment linked to an accepted quote (sheet 2). |

## Sheet 2: quotes and proof of agreement

| Heading (article 30, 1) | Content |
|---|---|
| **Purposes** (b) | Drawing up and sending quotes, recording the customer's online agreement (contract), mandate to buy parts (disbursements, *débours*), exercise of the right of withdrawal, proof of the contract. |
| Legal basis (art. 6) | Performance of the contract (art. 6, 1, b); retention of the contract: legal obligation (art. 6, 1, c; C. consom. L213-1). |
| **Data subjects** (c) | Customers (private individuals and businesses). |
| **Data** (c) | Name, contact details and job location; for a business customer, company name and SIREN or SIRET number; lines and prices; date and IP address of the answer; customer's choices (replaced parts, mandate); withdrawal statement (name, address, email, date, IP address). |
| **Recipients** (d) | The professional; the host and its email sending service; [your chartered accountant or your invoicing software, if you send them the exports]. |
| **Transfers outside the EU** (e) | None by Crénelio. |
| **Erasure time limit** (f) | Quote not accepted: same period as the appointment, then deletion. **Accepted** quote: ten years after the job (C. consom. L213-1 and D213-2; C. com. L123-22), in intermediate archiving (phone number removed, out of the current lists), then automatic deletion. See [retention and erasure](conservation-effacement.md). |

## Sheet 3: email log

| Heading (article 30, 1) | Content |
|---|---|
| **Purposes** (b) | Checking that confirmations, quotes and notifications have actually been sent. |
| Legal basis (art. 6) | Performance of the contract (art. 6, 1, b). |
| **Data subjects** (c) | Customers. |
| **Data** (c) | Recipient's address, type of email, date, sending status, reason for failure. |
| **Recipients** (d) | The professional; the host. |
| **Transfers outside the EU** (e) | None by Crénelio. |
| **Erasure time limit** (f) | Deleted together with the appointment or quote it relates to. |

## Sheet 4: protection of forms against abuse

| Heading (article 30, 1) | Content |
|---|---|
| **Purposes** (b) | Limiting the number of submissions of public forms (booking, out-of-area request, answer to and withdrawal from a quote) and the attempts to log in to the management area. |
| Legal basis (art. 6) | Legitimate interest: security of the site and of the sending service (art. 6, 1, f). |
| **Data subjects** (c) | Visitors to the site. |
| **Data** (c) | Fingerprint (hash) of the IP address and attempt counter: the IP address is not stored in clear. |
| **Recipients** (d) | None: file internal to the site, never served. |
| **Transfers outside the EU** (e) | None. |
| **Erasure time limit** (f) | One day at most, then automatic deletion. |

## Security measures (article 30, 1, g)

**Technical, provided by Crénelio:**

- management area protected on the server side: password, six-digit code sent by email on an unknown device,
  limit on failed attempts; `HttpOnly` and `SameSite=Strict` session cookies;
- customer pages (appointment, quote) accessible through a personal link with a random token;
- prepared database queries (protection against injection); sensitive files kept outside the served pages;
- automatic deletion at the end of the retention period, erasure on request;
- contract locked when sent and SHA-256 fingerprint on acceptance (integrity);
- no tracker or advertising cookie.

**Your responsibility:**

- site in **HTTPS** (hosting certificate enabled);
- strong password used only for Crénelio, professional email kept up to date (it receives the login codes);
- computer and phone up to date and locked; do not share access to the management area;
- exports (CSV, PDF) stored in a safe place and deleted when no longer needed;
- [backups: which ones, where, for how long].

## Going further

- A **data protection impact assessment** (DPIA) is required only for processing « susceptible d'engendrer un
  risque élevé » (*likely to result in a high risk*) (GDPR, art. 35); the processing described here does not, a
  priori, fall into that category. [Text of article 35 not yet reproduced in `textes/`: to be checked before relying
  on it.]
- The CNIL publishes a reference framework « gestion des activités commerciales » (*management of commercial
  activities*) (deliberation no. 2021-131, published in the Journal officiel of 10/04/2022, non-binding) that gives
  benchmarks for retention periods and measures.
