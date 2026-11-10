import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, PrinterIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { AppConfig, Quote, QuoteLine } from '../types';
import { LINE_KIND_LABELS, euro, lineAmount } from '../components/admin/quoteRules';
import { companyAddress, legalIdentity } from '../utils/legalIdentity';
import { attestationUrl, BUILDER_GUARANTEES } from '../utils/builderGuarantees';
import { ONLINE_FORM_NOTICE, withdrawalNotice } from '../utils/withdrawalNotice';

interface QuotePrintPageProps {
  config: AppConfig;
}

type DocId = 'devis' | 'mandat' | 'retractation';

const DOC_LABELS: Record<DocId, string> = {
  devis: 'Devis',
  mandat: 'Mandat de débours',
  retractation: 'Formulaire de rétractation',
};

// Dates au format du PDF (QuotePdf::day)
const day = (value: string | null) => (value ? format(parseISO(value.replace(' ', 'T')), 'dd/MM/yyyy', { locale: fr }) : '');
const moment = (value: string | null) => (value ? format(parseISO(value.replace(' ', 'T')), "d MMMM yyyy 'à' HH:mm", { locale: fr }) : '');

/**
 * Versions imprimables d'un devis (/devis/:token/imprimer?doc=…), Item 22, étape 4 : trois documents
 * distincts, chacun sur sa page : devis (mentions, pièces remplacées, information sur la rétractation,
 * accord), mandat de débours (à signer par les deux parties) et formulaire type de rétractation.
 * Enregistrables en PDF par le navigateur (aucune bibliothèque côté serveur). Cadre : docs/legal/.
 */
const QuotePrintPage: React.FC<QuotePrintPageProps> = ({ config }) => {
  const { token = '' } = useParams<{ token: string }>();
  const [params, setParams] = useSearchParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getQuoteByToken(token)
      .then(setQuote)
      .catch((err: Error) => setError(err.message));
  }, [token]);

  const debours = (quote?.lines ?? []).filter((line) => line.kind === 'debours');
  const urgent = Boolean(Number(quote?.urgent));
  const available: DocId[] = ['devis', ...(debours.length ? (['mandat'] as DocId[]) : []), ...(urgent ? [] : (['retractation'] as DocId[]))];
  const requested = params.get('doc');
  const docs: DocId[] = requested && available.includes(requested as DocId) ? [requested as DocId] : available;

  return (
    <div className="quote-print">
      <div className="quote-print__toolbar">
        {/* Ouverte dans un nouvel onglet (Espace Artisan) : rien à quoi revenir, il suffit de fermer l'onglet */}
        {window.history.length > 1 && (
          <Link to={`/devis/${token}`} className="booking-page-header__back">
            <ArrowLeftIcon size={18} weight="bold" />
            Retour au devis
          </Link>
        )}
        <div className="quote-print__docs" role="group" aria-label="Document à imprimer">
          {[...available, null].map((doc) => (
            <button
              key={doc ?? 'all'}
              type="button"
              className={`btn admin-btn-sm ${(doc === null ? !requested : requested === doc) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setParams(doc ? { doc } : {})}
            >
              {doc ? DOC_LABELS[doc] : 'Tous'}
            </button>
          ))}
        </div>
        {/* PDF générés par le serveur (logo, couleurs du thème) pour le document affiché */}
        {quote && docs.length === 1 && docs[0] !== 'retractation' && (
          <a className="btn btn-secondary" href={`/api/quotes/token/${token}/${docs[0] === 'devis' ? 'devis' : 'mandat'}.pdf`}>
            Télécharger en PDF
          </a>
        )}
        {quote && docs.length === 1 && docs[0] === 'retractation' && (
          <a className="btn btn-secondary" href={`/api/quotes/token/${token}/formulaire.pdf`}>
            Télécharger en PDF
          </a>
        )}
        <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={!quote}>
          <PrinterIcon size={18} weight="fill" aria-hidden="true" />
          Imprimer / PDF
        </button>
      </div>

      {error && <div className="form-alert-error">{error}</div>}
      {!quote && !error && <p className="slots-loading">Chargement…</p>}

      {quote &&
        docs.map((doc) => (
          <article className="quote-print__sheet" key={doc}>
            {doc === 'devis' && <QuoteSheet quote={quote} config={config} token={token} />}
            {doc === 'mandat' && <MandateSheet quote={quote} config={config} lines={debours} />}
            {doc === 'retractation' && <WithdrawalFormSheet quote={quote} config={config} />}
          </article>
        ))}
    </div>
  );
};

/**
 * En-tête commun, calqué sur le PDF (`QuotePdf::documentHeader`, qui fait référence) : logo et entreprise
 * (identité légale complète, `LegalTexts::companyLines`) à gauche, titre en couleur du thème à droite, filet.
 */
const SheetHeader: React.FC<{ config: AppConfig; title: string; meta: string[] }> = ({ config, title, meta }) => (
  <header className="quote-print__header">
    <div className="quote-print__company">
      {config.branding_logo_url && <img className="quote-print__logo" src={config.branding_logo_url} alt="" />}
      <strong>{config.company_name}</strong>
      {[
        legalIdentity(config),
        companyAddress(config),
        config.legal_siret && `SIRET ${config.legal_siret}`,
        config.legal_vat_number && `N° TVA ${config.legal_vat_number}`,
        config.legal_rm,
        config.legal_assurance && `Assurance : ${config.legal_assurance}`,
        [config.pro_phone, config.pro_email].filter(Boolean).join(' · '),
      ]
        .filter(Boolean)
        .map((line) => (
          <span key={line as string}>{line}</span>
        ))}
    </div>
    <div className="quote-print__title">
      <h1>{title}</h1>
      {meta.filter(Boolean).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </header>
);

/** Deux blocs teintés côte à côte (client / intervention, mandant / mandataire), comme `QuotePdf::parties`. */
const Parties: React.FC<{ blocks: [string, (string | null | false | undefined)[]][] }> = ({ blocks }) => (
  <div className="quote-print__parties">
    {blocks.map(([title, lines]) => (
      <div className="quote-print__party" key={title}>
        <p className="quote-print__party-title">{title}</p>
        {lines.filter(Boolean).map((line, i) => (i === 0 ? <strong key={i}>{line}</strong> : <span key={i}>{line}</span>))}
      </div>
    ))}
  </div>
);

/** Titre de section en capitales, couleur du thème et filet (`QuotePdf::section`). */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="quote-print__block">
    <h2>{title}</h2>
    {children}
  </section>
);

const Lines: React.FC<{ lines: QuoteLine[]; vat: boolean }> = ({ lines, vat }) => (
  <table className="quote-print__lines">
    <thead>
      <tr>
        <th scope="col">Désignation</th>
        <th scope="col">Quantité</th>
        <th scope="col">{vat ? 'Prix unitaire HT' : 'Prix unitaire'}</th>
        {vat && <th scope="col">TVA</th>}
        <th scope="col">Montant</th>
      </tr>
    </thead>
    <tbody>
      {lines.map((line, index) => (
        <tr key={index}>
          <td>
            {line.label}
            <small>{LINE_KIND_LABELS[line.kind]}</small>
          </td>
          <td>
            {Number(line.quantity).toLocaleString('fr-FR')} {line.unit}
          </td>
          <td>{euro(line.unit_price)}</td>
          {vat && <td>{Number(line.vat_rate).toLocaleString('fr-FR')} %</td>}
          <td>{euro(lineAmount(line))}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** Cadre de signature (papier), ou trace de l'accord en ligne. */
const Signature: React.FC<{ label: string; online?: string | null }> = ({ label, online }) => (
  <div className="quote-print__signature">
    <p>
      <strong>{label}</strong>
    </p>
    {online ? <p>{online}</p> : <p>Date :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Signature :</p>}
  </div>
);

/** Devis : document précontractuel puis contrat (arrêté du 24 janvier 2017, art. 4 et annexe 2). */
const QuoteSheet: React.FC<{ quote: Quote; config: AppConfig; token: string }> = ({ quote, config, token }) => {
  const vat = quote.vat_mode === 'vat';
  const lines = (quote.lines ?? []).filter((line) => line.kind !== 'debours');
  const urgent = Boolean(Number(quote.urgent));
  const accepted = quote.status === 'accepted' || quote.status === 'withdrawn';
  const notice = withdrawalNotice({
    name: config.company_name || '',
    address: companyAddress(config),
    phone: config.pro_phone || '',
    email: config.pro_email || '',
    withdrawalUrl: `${window.location.origin}/devis/${token}`,
    sale: Boolean(Number(quote.sale)),
  });

  return (
    <>
      <SheetHeader
        config={config}
        title="Devis"
        meta={[`N° ${quote.number}`, quote.sent_at ? `Établi le ${day(quote.sent_at)}` : '', quote.valid_until ? `Valable jusqu'au ${day(quote.valid_until)}` : '']}
      />

      <Parties
        blocks={[
          [
            'Client',
            [
              quote.client_name,
              quote.client_company,
              quote.client_siren && `SIREN/SIRET ${quote.client_siren}`,
              [quote.address, `${quote.postal_code} ${quote.city}`.trim()].filter(Boolean).join(', '),
            ],
          ],
          [
            'Intervention',
            [
              quote.title || 'Travaux',
              quote.execution_terms && `Exécution : ${quote.execution_terms}`,
              urgent && 'Intervention urgente expressément demandée',
            ],
          ],
        ]}
      />
      {quote.notes && <p className="quote-print__mention">{quote.notes}</p>}

      <Lines lines={lines} vat={vat} />
      {quote.time_counting && lines.some((line) => line.kind === 'labour') && (
        <p className="quote-print__mention">{quote.time_counting}</p>
      )}
      <dl className="quote-print__totals">
        {vat && (
          <>
            <dt>Total HT</dt>
            <dd>{euro(quote.total_ht)}</dd>
            <dt>TVA</dt>
            <dd>{euro(quote.total_vat)}</dd>
          </>
        )}
        <dt className="quote-print__total">Total TTC</dt>
        <dd className="quote-print__total">{euro(quote.total_ttc)}</dd>
      </dl>
      {!vat && <p className="quote-print__mention quote-print__mention--right">{config.quote_vat_exemption || 'TVA non applicable, article 293 B du CGI'}</p>}
      {Number(quote.total_debours) > 0 && (
        <p className="quote-print__mention">
          Pièces achetées au nom et pour le compte du client : voir le mandat de débours (document distinct), estimées à{' '}
          {euro(quote.total_debours)}, dans la limite de {euro(quote.debours_budget ?? quote.total_debours)}. Non comprises dans le total
          du devis.
        </p>
      )}

      <Section title="Conditions">
        {quote.payment_terms && <p className="quote-print__mention">Paiement : {quote.payment_terms}</p>}
        <p className="quote-print__mention">
          Devis valable jusqu'au {day(quote.valid_until)} ({quote.validity_days} jours) ·{' '}
          {quote.quote_price === null ? 'Devis gratuit' : `Devis payant : ${euro(quote.quote_price)}`}
        </p>
        {config.legal_complaints && <p className="quote-print__mention">Réclamations : {config.legal_complaints}</p>}
        {config.legal_mediator && <p className="quote-print__mention">Médiation de la consommation : {config.legal_mediator}</p>}
      </Section>

      <Section title="Pièces remplacées">
        {/* Annexe 2 de l'arrêté du 24 janvier 2017, mot pour mot */}
        <p className="quote-print__mention">Souhaitez-vous conserver les pièces, éléments ou appareils remplacés ?</p>
        <p className="quote-print__mention">
          {quote.keep_parts !== null
            ? `Réponse du client en ligne le ${moment(quote.decided_at)} : ${Number(quote.keep_parts) ? 'OUI' : 'NON (décharge)'}.`
            : 'OUI □ NON □   Signature du consommateur précédée de la mention manuscrite " Lu et approuvé ".'}
        </p>
      </Section>

      {Number(quote.builder_works) === 1 && (
        <Section title="Garanties légales des constructeurs">
          <ul>
            {BUILDER_GUARANTEES.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p>
            Attestation d'assurance de responsabilité décennale jointe (Code des assurances, art. L243-2) :{' '}
            <a href={attestationUrl(token)} target="_blank" rel="noopener">
              consulter l'attestation (PDF)
            </a>
          </p>
        </Section>
      )}

      <Section title="Droit de rétractation">
        {urgent ? (
          <p>
            Intervention urgente expressément demandée par le client : pas de droit de rétractation (article L221-28 du Code de la
            consommation), dans la limite des pièces de rechange et travaux strictement nécessaires pour répondre à l'urgence.
          </p>
        ) : (
          <div className="quote-print__notice">
            <p>
              <strong>{notice.title}</strong>
            </p>
            {notice.sections.map((section) => (
              <React.Fragment key={section.heading}>
                <p>
                  <strong>{section.heading}</strong>
                </p>
                {section.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </React.Fragment>
            ))}
            {quote.decided_at ? (
              Number(quote.early_execution) ? (
                <p>
                  Le client a expressément demandé que l'intervention commence avant la fin du délai de rétractation et reconnu qu'une
                  fois la prestation entièrement exécutée, il ne disposera plus du droit de rétractation.
                </p>
              ) : null
            ) : (
              <p>☐ Je demande expressément que l'intervention commence avant la fin du délai de rétractation. Si je me rétracte ensuite, je paierai un montant proportionnel au service déjà fourni. Je reconnais qu'une fois la prestation entièrement exécutée, je ne disposerai plus du droit de rétractation.</p>
            )}
          </div>
        )}
        {!urgent && <p className="quote-print__mention">{ONLINE_FORM_NOTICE}</p>}
      </Section>


      <div className="quote-print__signatures">
        <Signature
          label="Bon pour accord (client)"
          online={accepted ? `Accepté en ligne le ${moment(quote.decided_at)}${urgent ? '' : ` · rétractation possible jusqu'au ${day(quote.withdrawal_until)}`}` : null}
        />
        <Signature label={`Le professionnel : ${config.company_name ?? ''}`} />
      </div>
      {quote.status === 'withdrawn' && (
        <p className="quote-print__mention">
          <strong>Rétractation</strong> déclarée en ligne le {moment(quote.withdrawn_at)} : contrat annulé.
        </p>
      )}
    </>
  );
};

/** Mandat de débours : accord distinct du devis (docs/legal/fr/debours.md). */
const MandateSheet: React.FC<{ quote: Quote; config: AppConfig; lines: QuoteLine[] }> = ({ quote, config, lines }) => {
  const budget = euro(quote.debours_budget ?? quote.total_debours);
  const given = quote.debours_mandate !== null ? Number(quote.debours_mandate) === 1 : null;
  return (
    <>
      <SheetHeader config={config} title="Mandat de débours" meta={[`Lié au devis n° ${quote.number}`]} />
      <Parties
        blocks={[
          ['Mandant (client)', [quote.client_name, [quote.address, `${quote.postal_code} ${quote.city}`.trim()].filter(Boolean).join(', ')]],
          ['Mandataire', [config.company_name, legalIdentity(config)]],
        ]}
      />
      <section className="quote-print__block">
        <p>
          Je soussigné(e) <strong>{quote.client_name}</strong> donne mandat à <strong>{config.company_name}</strong> d'acheter,{' '}
          <strong>en mon nom et pour mon compte</strong>, les pièces désignées ci-dessous, nécessaires aux travaux du devis n°{' '}
          {quote.number}, dans la limite d'un budget maximum de <strong>{budget}</strong>.
        </p>
      </section>
      <Lines lines={lines} vat={false} />
      <dl className="quote-print__totals">
        <dt>Montant estimé</dt>
        <dd>{euro(quote.total_debours)}</dd>
        <dt className="quote-print__total">Budget maximum</dt>
        <dd className="quote-print__total">{budget}</dd>
      </dl>
      <Section title="Conditions">
        <ul>
          <li>Les pièces sont achetées au nom du mandant : la facture ou le ticket du fournisseur est établi à son nom.</li>
          <li>Le mandant rembourse le montant exact figurant sur le justificatif, sans marge ; une copie du justificatif lui est remise.</li>
          <li>Ces sommes sont des débours : elles ne constituent pas une vente par le mandataire et figurent sur une ligne distincte de la facture.</li>
          <li>Toute dépense au-delà du budget maximum nécessite un nouvel accord du mandant.</li>
        </ul>
      </Section>
      <div className="quote-print__signatures">
        <Signature
          label="Bon pour mandat (mandant)"
          online={given === null ? null : given ? `Mandat donné en ligne le ${moment(quote.mandate_decided_at)}` : `Mandat refusé en ligne le ${moment(quote.mandate_decided_at)} : le client fournit les pièces`}
        />
        <Signature label={`Le mandataire : ${config.company_name ?? ''}`} />
      </div>
    </>
  );
};

/** Zone « Commandé le / reçu le » : identique à `LegalTexts::withdrawalFormDates`. */
const withdrawalFormDates = (quote: Quote) =>
  quote.decided_at
    ? `commandé le ${day(quote.decided_at)}${Number(quote.sale) && quote.goods_received_at ? `, reçu le ${day(quote.goods_received_at)}` : ''}`
    : '';

/**
 * Formulaire type de rétractation : annexe à l'article R221-1 du Code de la consommation (modifiée par le
 * décret n° 2022-424), reproduite mot pour mot (docs/legal/fr/textes/code-consommation.md). Seules les
 * zones prévues par le modèle sont complétées : coordonnées du professionnel, contrat visé, dates, nom et
 * adresse du client ; signature et date restent au client.
 */
const WithdrawalFormSheet: React.FC<{ quote: Quote; config: AppConfig }> = ({ quote, config }) => (
  <>
    <SheetHeader config={config} title="Formulaire de rétractation" meta={[`Devis n° ${quote.number}`]} />
    <section className="quote-print__block quote-print__form">
      <p>
        <strong>MODÈLE DE FORMULAIRE DE RÉTRACTATION</strong>
      </p>
      <p>(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)</p>
      <p>
        A l'attention de {config.company_name}, {companyAddress(config)}
        {config.pro_email ? `, ${config.pro_email}` : ''} :
      </p>
      <p>
        Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la
        prestation de services (*) ci-dessous :
      </p>
      <p className="quote-print__field quote-print__field--contract">
        Devis n° {quote.number}
        {quote.title ? ` — ${quote.title}` : ''}
      </p>
      {/* Zones préremplies comme le PDF (QuotePdf::withdrawalForm) : le client vérifie, signe et date */}
      <p className="quote-print__field">Commandé le (*)/reçu le (*) : {withdrawalFormDates(quote)}</p>
      <p className="quote-print__field">Nom du (des) consommateur(s) : {quote.client_name}</p>
      <p className="quote-print__field">
        Adresse du (des) consommateur(s) : {[quote.address, `${quote.postal_code} ${quote.city}`.trim()].filter(Boolean).join(', ')}
      </p>
      <p className="quote-print__field">Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :</p>
      <p className="quote-print__field">Date :</p>
      <p>(*) Rayez la mention inutile.</p>
    </section>
    {/* Information sur le formulaire prérempli en ligne (écart 13), hors du modèle réglementaire ; comme le
        PDF, seulement après l'accord (la fonction en ligne n'est utilisable qu'à partir de là) */}
    {quote.decided_at && <p className="quote-print__mention">{ONLINE_FORM_NOTICE}</p>}
  </>
);

export default QuotePrintPage;
