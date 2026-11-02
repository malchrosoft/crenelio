import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, PrinterIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { AppConfig, Quote, QuoteLine } from '../types';
import { LINE_KIND_LABELS, euro, lineAmount } from '../components/admin/quoteRules';
import { companyAddress, legalIdentity } from '../utils/legalIdentity';
import { withdrawalNotice } from '../utils/withdrawalNotice';

interface QuotePrintPageProps {
  config: AppConfig;
}

type DocId = 'devis' | 'mandat' | 'retractation';

const DOC_LABELS: Record<DocId, string> = {
  devis: 'Devis',
  mandat: 'Mandat de débours',
  retractation: 'Formulaire de rétractation',
};

const day = (value: string | null) => (value ? format(parseISO(value.replace(' ', 'T')), 'd MMMM yyyy', { locale: fr }) : '');
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
        <Link to={`/devis/${token}`} className="booking-page-header__back">
          <ArrowLeftIcon size={18} weight="bold" />
          Retour au devis
        </Link>
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

/** En-tête commun : entreprise (identité légale complète) et titre du document. */
const SheetHeader: React.FC<{ config: AppConfig; title: string; reference: string }> = ({ config, title, reference }) => (
  <header className="quote-print__header">
    <div>
      <strong>{config.company_name}</strong>
      <br />
      {legalIdentity(config)}
      <br />
      {companyAddress(config)}
      {config.legal_siret && (
        <>
          <br />
          SIRET {config.legal_siret}
        </>
      )}
      {config.legal_rm && (
        <>
          <br />
          {config.legal_rm}
        </>
      )}
      {config.legal_assurance && (
        <>
          <br />
          Assurance : {config.legal_assurance}
        </>
      )}
      <br />
      {[config.pro_phone, config.pro_email].filter(Boolean).join(' · ')}
    </div>
    <div className="quote-print__title">
      <h1>{title}</h1>
      <p>{reference}</p>
    </div>
  </header>
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
            {line.label} <small>({LINE_KIND_LABELS[line.kind]})</small>
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
  });

  return (
    <>
      <SheetHeader config={config} title={`Devis n° ${quote.number}`} reference={`Établi le ${day(quote.sent_at)}`} />

      <section className="quote-print__block">
        <p>
          <strong>Client :</strong> {quote.client_name}
          <br />
          <strong>Lieu d'intervention :</strong> {[quote.address, `${quote.postal_code} ${quote.city}`.trim()].filter(Boolean).join(', ')}
        </p>
        <p>
          <strong>Nature des travaux :</strong> {quote.title || '—'}
          {urgent && (
            <>
              <br />
              <strong>Intervention urgente</strong> expressément demandée par le client.
            </>
          )}
        </p>
        {quote.notes && <p>{quote.notes}</p>}
      </section>

      <Lines lines={lines} vat={vat} />
      <dl className="quote-print__totals">
        <dt>{vat ? 'Total HT' : 'Total'}</dt>
        <dd>{euro(quote.total_ht)}</dd>
        {vat && (
          <>
            <dt>TVA</dt>
            <dd>{euro(quote.total_vat)}</dd>
          </>
        )}
        <dt>
          <strong>Total TTC</strong>
        </dt>
        <dd>
          <strong>{euro(quote.total_ttc)}</strong>
        </dd>
      </dl>
      {!vat && <p className="quote-print__mention">{config.quote_vat_exemption || 'TVA non applicable, art. 293 B du CGI'}</p>}
      {Number(quote.total_debours) > 0 && (
        <p className="quote-print__mention">
          Pièces achetées au nom et pour le compte du client : voir le mandat de débours (document distinct), estimées à{' '}
          {euro(quote.total_debours)}, dans la limite de {euro(quote.debours_budget ?? quote.total_debours)}. Non comprises dans le total
          du devis.
        </p>
      )}
      <p className="quote-print__mention">
        Devis valable jusqu'au {day(quote.valid_until)} ({quote.validity_days} jours) ·{' '}
        {quote.quote_price === null ? 'Devis gratuit' : `Devis payant : ${euro(quote.quote_price)}`}
      </p>

      <section className="quote-print__block">
        <h2>Pièces remplacées</h2>
        <p>Le professionnel vous informe que vous pouvez conserver les pièces, éléments ou appareils remplacés.</p>
        {quote.keep_parts !== null ? (
          <p>
            Réponse du client en ligne : {Number(quote.keep_parts) ? 'je les conserve' : "je les laisse au professionnel (décharge)"}, le{' '}
            {moment(quote.decided_at)}.
          </p>
        ) : (
          <p>
            Je souhaite conserver les pièces remplacées : ☐ Oui ☐ Non
            <br />« Lu et approuvé », date et signature du client :
          </p>
        )}
      </section>

      <section className="quote-print__block">
        <h2>Droit de rétractation</h2>
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
                <p>Le client a expressément demandé que l'intervention commence avant la fin du délai de rétractation.</p>
              ) : null
            ) : (
              <p>☐ Je demande expressément que l'intervention commence avant la fin du délai de rétractation.</p>
            )}
          </div>
        )}
      </section>

      {config.legal_mediator && (
        <p className="quote-print__mention">Médiation de la consommation : {config.legal_mediator}</p>
      )}

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
      <SheetHeader config={config} title="Mandat de débours" reference={`Lié au devis n° ${quote.number}`} />
      <section className="quote-print__block">
        <p>
          <strong>Mandant (client) :</strong> {quote.client_name}, {[quote.address, `${quote.postal_code} ${quote.city}`.trim()].filter(Boolean).join(', ')}
          <br />
          <strong>Mandataire :</strong> {config.company_name}, {legalIdentity(config)}
        </p>
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
        <dt>
          <strong>Budget maximum</strong>
        </dt>
        <dd>
          <strong>{budget}</strong>
        </dd>
      </dl>
      <section className="quote-print__block">
        <h2>Conditions</h2>
        <ul>
          <li>Les pièces sont achetées au nom du mandant : la facture ou le ticket du fournisseur est établi à son nom.</li>
          <li>Le mandant rembourse le montant exact figurant sur le justificatif, sans marge ; une copie du justificatif lui est remise.</li>
          <li>Ces sommes sont des débours : elles ne constituent pas une vente par le mandataire et figurent sur une ligne distincte de la facture.</li>
          <li>Toute dépense au-delà du budget maximum nécessite un nouvel accord du mandant.</li>
        </ul>
      </section>
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

/**
 * Formulaire type de rétractation (annexe à l'article R221-1 du Code de la consommation).
 * Texte du modèle européen (directive 2011/83/UE, annexe I B), sans télécopieur (décret n° 2022-424) :
 * À CONFIRMER contre la version en vigueur sur Légifrance (docs/legal/fr/retractation.md).
 */
const WithdrawalFormSheet: React.FC<{ quote: Quote; config: AppConfig }> = ({ quote, config }) => (
  <>
    <SheetHeader config={config} title="Formulaire de rétractation" reference={`Devis n° ${quote.number}`} />
    <section className="quote-print__block quote-print__form">
      <p>
        <strong>Modèle de formulaire de rétractation</strong>
      </p>
      <p>(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)</p>
      <p>
        À l'attention de {config.company_name}, {companyAddress(config)}
        {config.pro_email ? `, ${config.pro_email}` : ''} :
      </p>
      <p>
        Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la
        prestation de services (*) ci-dessous :
      </p>
      <p className="quote-print__field">Devis n° {quote.number}{quote.title ? ` — ${quote.title}` : ''}</p>
      <p className="quote-print__field">Commandé le (*)/reçu le (*) : {quote.decided_at ? day(quote.decided_at) : ''}</p>
      <p className="quote-print__field">Nom du (des) consommateur(s) :</p>
      <p className="quote-print__field">Adresse du (des) consommateur(s) :</p>
      <p className="quote-print__field">Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :</p>
      <p className="quote-print__field">Date :</p>
      <p>(*) Rayez la mention inutile.</p>
    </section>
  </>
);

export default QuotePrintPage;
