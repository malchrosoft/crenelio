import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, CheckCircleIcon, DownloadSimpleIcon, XCircleIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { AppConfig, Quote } from '../types';
import BrandMark from '../components/BrandMark';
import { companyAddress, legalIdentity } from '../utils/legalIdentity';
import { attestationUrl, BUILDER_GUARANTEES } from '../utils/builderGuarantees';
import { ONLINE_FORM_NOTICE, withdrawalNotice, WithdrawalNotice } from '../utils/withdrawalNotice';
import { LINE_KIND_LABELS, QUOTE_STATUS_LABELS, euro, lineAmount } from '../components/admin/quoteRules';

interface QuotePageProps {
  config: AppConfig;
}

const longDate = (value: string | null) => (value ? format(parseISO(value.replace(' ', 'T')), 'EEEE d MMMM yyyy', { locale: fr }) : '');
const dateTime = (value: string | null) =>
  value ? format(parseISO(value.replace(' ', 'T')), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }) : '';

/**
 * Page du devis ouverte depuis l'email (/devis/:token), Item 22 : consultation avec les mentions
 * obligatoires, accord du client (pièces remplacées, rétractation), mandat de débours présenté et
 * accepté **séparément**, puis fonction de rétractation en ligne pendant le délai (« Renoncer au
 * contrat ici » → « Confirmer la rétractation », obligatoire depuis le 19 juin 2026).
 * Cadre légal : docs/legal/ ; la réponse n'est jamais prise automatiquement (lien ouvert par un robot).
 */
const QuotePage: React.FC<QuotePageProps> = ({ config }) => {
  const { token = '' } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Réponses du client
  const [keepParts, setKeepParts] = useState<boolean | null>(null);
  const [mandate, setMandate] = useState<boolean | null>(null);
  const [withdrawalAck, setWithdrawalAck] = useState(false);
  const [early, setEarly] = useState(false);
  const [refusing, setRefusing] = useState(false);
  const [reason, setReason] = useState('');

  const load = () =>
    api
      .getQuoteByToken(token)
      .then((q) => {
        setQuote(q);
      })
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  if (!quote) {
    return (
      <QuoteLayout config={config}>
        {error ? <div className="form-alert-error">{error}</div> : <p className="slots-loading">Chargement du devis…</p>}
      </QuoteLayout>
    );
  }

  const lines = quote.lines ?? [];
  const services = lines.filter((line) => line.kind !== 'debours');
  const debours = lines.filter((line) => line.kind === 'debours');
  const vat = quote.vat_mode === 'vat';
  const urgent = Boolean(Number(quote.urgent));
  const company = config.company_name || '';
  const address = companyAddress(config);
  const canAccept = keepParts !== null && (!debours.length || mandate !== null) && (urgent || withdrawalAck);

  return (
    <QuoteLayout config={config}>
      <h2 className="card-title quote-page__title">
        Devis {quote.number}
        <span className={`status-badge quote-status--${quote.status}`}>{QUOTE_STATUS_LABELS[quote.status]}</span>
      </h2>

      <div className="quote-page__parties">
        <section>
          <h3>Entreprise</h3>
          <p>
            <strong>{company}</strong>
            <br />
            {legalIdentity(config)}
            {address && (
              <>
                <br />
                {address}
              </>
            )}
            {config.legal_siret && (
              <>
                <br />
                SIRET {config.legal_siret}
              </>
            )}
            {config.legal_vat_number && (
              <>
                <br />
                N° TVA {config.legal_vat_number}
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
            {(config.pro_phone || config.pro_email) && (
              <>
                <br />
                {[config.pro_phone, config.pro_email].filter(Boolean).join(' · ')}
              </>
            )}
          </p>
        </section>
        <section>
          <h3>Client et lieu d'intervention</h3>
          <p>
            <strong>{quote.client_name}</strong>
            {quote.client_company && <> — {quote.client_company}{quote.client_siren ? ` (SIREN/SIRET ${quote.client_siren})` : ''}</>}
            <br />
            {[quote.address, `${quote.postal_code} ${quote.city}`.trim()].filter(Boolean).join(', ')}
          </p>
          <p className="form-hint">
            Établi le {longDate(quote.sent_at)} · valable jusqu'au {longDate(quote.valid_until)} ·{' '}
            {quote.quote_price === null ? 'devis gratuit' : `devis payant : ${euro(quote.quote_price)}`}
          </p>
        </section>
      </div>

      <section className="quote-page__section">
        <h3>Travaux</h3>
        <p>{quote.title || '—'}</p>
        {quote.notes && <p className="form-hint">{quote.notes}</p>}
        <LinesTable lines={services} vat={vat} />
        {quote.time_counting && services.some((line) => line.kind === 'labour') && (
          <p className="form-hint">{quote.time_counting}</p>
        )}
        <dl className="quote-totals">
          <dt>{vat ? 'Total HT' : 'Total'}</dt>
          <dd>{euro(quote.total_ht)}</dd>
          {vat ? (
            <>
              <dt>TVA</dt>
              <dd>{euro(quote.total_vat)}</dd>
            </>
          ) : (
            <dd className="quote-totals__mention">{config.quote_vat_exemption || 'TVA non applicable, article 293 B du CGI'}</dd>
          )}
          <dt className="quote-totals__total">Total du devis TTC</dt>
          <dd className="quote-totals__total">{euro(quote.total_ttc)}</dd>
        </dl>
        <dl className="quote-page__terms">
          {quote.execution_terms && (
            <>
              <dt>Exécution</dt>
              <dd>{quote.execution_terms}</dd>
            </>
          )}
          {quote.payment_terms && (
            <>
              <dt>Paiement</dt>
              <dd>{quote.payment_terms}</dd>
            </>
          )}
        </dl>
      </section>

      {debours.length > 0 && (
        <section className="quote-page__section quote-mandate">
          <h3>Mandat de débours (document distinct du devis)</h3>
          <p>
            Je soussigné(e) <strong>{quote.client_name}</strong> donne mandat à <strong>{company}</strong> d'acheter,{' '}
            <strong>en mon nom et pour mon compte</strong>, les pièces ci-dessous, dans la limite de{' '}
            <strong>{euro(quote.debours_budget ?? quote.total_debours)}</strong>. La facture du fournisseur est établie à mon nom ; je
            rembourse le montant exact du justificatif, dont une copie m'est remise. Il ne s'agit pas d'une vente par le professionnel.
          </p>
          <LinesTable lines={debours} vat={false} />
          <dl className="quote-totals">
            <dt>Pièces estimées</dt>
            <dd>{euro(quote.total_debours)}</dd>
            <dt className="quote-totals__total">Total estimé (devis + pièces)</dt>
            <dd className="quote-totals__total">{euro(Number(quote.total_ttc) + Number(quote.total_debours))}</dd>
          </dl>
          {quote.status === 'sent' && (
            <fieldset className="quote-page__choice">
              <legend>Votre réponse au mandat</legend>
              <label className="form-check">
                <input type="radio" name="mandate" checked={mandate === true} onChange={() => setMandate(true)} />
                <span>Je donne ce mandat</span>
              </label>
              <label className="form-check">
                <input type="radio" name="mandate" checked={mandate === false} onChange={() => setMandate(false)} />
                <span>Je fournis moi-même les pièces</span>
              </label>
            </fieldset>
          )}
        </section>
      )}

      {quote.status === 'sent' && (
        <section className="quote-page__section">
          <h3>Pièces remplacées</h3>
          {/* Annexe 2 de l'arrêté du 24 janvier 2017 ; la réponse en ligne tient lieu de « Lu et approuvé » */}
          <p>Souhaitez-vous conserver les pièces, éléments ou appareils remplacés ?</p>
          <fieldset className="quote-page__choice" aria-label="Pièces remplacées">
            <label className="form-check">
              <input type="radio" name="keep-parts" checked={keepParts === true} onChange={() => setKeepParts(true)} />
              <span>OUI</span>
            </label>
            <label className="form-check">
              <input type="radio" name="keep-parts" checked={keepParts === false} onChange={() => setKeepParts(false)} />
              <span>NON (je les laisse au professionnel : décharge)</span>
            </label>
          </fieldset>
        </section>
      )}

      {(quote.status === 'sent' || quote.status === 'accepted') && (
        <section className="quote-page__section">
          <h3>Droit de rétractation</h3>
          {urgent ? (
            <p>
              Intervention urgente demandée par vous : pas de délai de rétractation (article L221-28 du Code de la consommation),
              uniquement pour les pièces et travaux strictement nécessaires. Tout autre travail fait l'objet d'un devis distinct.
            </p>
          ) : (
            <>
              <p>
                Ce contrat est conclu à distance : la fonction de rétractation en ligne se trouve sur cette page (bouton « Renoncer
                au contrat ici »), disponible pendant tout le délai après votre acceptation.
              </p>
              <WithdrawalNoticeText
                notice={withdrawalNotice({
                  name: company,
                  address,
                  phone: config.pro_phone || '',
                  email: config.pro_email || '',
                  withdrawalUrl: `${window.location.origin}/devis/${token}`,
                })}
              />
              {quote.status === 'sent' && (
                <>
                  <label className="form-check">
                    <input type="checkbox" checked={withdrawalAck} onChange={(e) => setWithdrawalAck(e.target.checked)} />
                    <span>J'ai pris connaissance de mon droit de rétractation.</span>
                  </label>
                  <label className="form-check">
                    <input type="checkbox" checked={early} onChange={(e) => setEarly(e.target.checked)} />
                    <span>
                      {/* Demande expresse et reconnaissance de la perte du droit après exécution complète (L221-25, L221-28 1°) */}
                      Je demande expressément que l'intervention commence avant la fin du délai de rétractation. Si je me rétracte
                      ensuite, je paierai un montant proportionnel au service déjà fourni. Je reconnais qu'une fois la prestation
                      entièrement exécutée, je ne disposerai plus du droit de rétractation.
                    </span>
                  </label>
                </>
              )}
            </>
          )}
        </section>
      )}

      <p className="quote-page__print quote-page__downloads">
        <a className="btn btn-secondary admin-btn-sm" href={`/api/quotes/token/${token}/devis.pdf`}>
          <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
          Devis (PDF)
        </a>
        {Number(quote.total_debours) > 0 && (
          <a className="btn btn-secondary admin-btn-sm" href={`/api/quotes/token/${token}/mandat.pdf`}>
            <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
            Mandat de débours (PDF)
          </a>
        )}
        <Link to={`/devis/${token}/imprimer`}>Versions imprimables</Link>
      </p>

      {Number(quote.builder_works) === 1 && (
        <section className="quote-page__section">
          <h3>Garanties légales des constructeurs</h3>
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
        </section>
      )}

      {config.legal_complaints && <p className="form-hint quote-page__mediator">Réclamations : {config.legal_complaints}</p>}
      {config.legal_mediator && (
        <p className="form-hint quote-page__mediator">
          Médiation de la consommation : en cas de litige, vous pouvez recourir gratuitement au médiateur {config.legal_mediator}.
        </p>
      )}

      {error && <div className="form-alert-error">{error}</div>}

      {quote.status === 'sent' &&
        (refusing ? (
          <div className="decision-card__actions quote-page__actions">
            <input
              className="form-input"
              placeholder="Motif (facultatif)"
              aria-label="Motif du refus"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setRefusing(false)}>
              Retour
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={() => run(() => api.decideQuote(token, { action: 'refuse', reason }))}
            >
              Confirmer le refus
            </button>
          </div>
        ) : (
          <div className="decision-card__actions quote-page__actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !canAccept}
              onClick={() =>
                run(() =>
                  api.decideQuote(token, {
                    action: 'accept',
                    keep_parts: keepParts ?? undefined,
                    debours_mandate: debours.length ? (mandate ?? undefined) : undefined,
                    withdrawal_ack: withdrawalAck,
                    early_execution: early,
                  })
                )
              }
            >
              <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
              Accepter le devis
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setRefusing(true)}>
              <XCircleIcon size={18} weight="fill" aria-hidden="true" />
              Refuser
            </button>
            {!canAccept && <p className="form-hint">Répondez aux questions ci-dessus pour accepter le devis.</p>}
          </div>
        ))}

      {quote.status === 'accepted' && (
        <div className="decision-card__result decision-card__result--ok">
          <CheckCircleIcon size={22} weight="fill" aria-hidden="true" />
          <span>
            Devis accepté le {dateTime(quote.decided_at)}. Un exemplaire vous a été envoyé par email.
            {!urgent && quote.withdrawal_until && <> Rétractation possible jusqu'au {longDate(quote.withdrawal_until)} inclus.</>}
          </span>
        </div>
      )}
      {quote.status === 'refused' && (
        <p className="decision-card__result">
          <XCircleIcon size={22} weight="fill" aria-hidden="true" />
          Devis refusé le {dateTime(quote.decided_at)}.
        </p>
      )}
      {quote.status === 'expired' && <p className="decision-card__result">Ce devis a expiré : contactez {company} pour un nouveau devis.</p>}
      {quote.status === 'withdrawn' && (
        <p className="decision-card__result">
          <XCircleIcon size={22} weight="fill" aria-hidden="true" />
          Rétractation enregistrée le {dateTime(quote.withdrawn_at)} : le contrat est annulé. Un accusé de réception a été envoyé à{' '}
          {quote.withdrawal_email}.
        </p>
      )}

      {quote.status === 'withdrawn' && (
        <p className="quote-page__print">
          <a href={`/api/quotes/token/${token}/declaration.pdf`}>Télécharger la déclaration de rétractation (PDF)</a>
        </p>
      )}

      {quote.can_withdraw && (
        <section className="quote-page__section quote-withdrawal">
          {/* Information sur le formulaire prérempli (écart 13) ; fonction de rétractation (D221-5) */}
          <p>{ONLINE_FORM_NOTICE}</p>
          <div className="decision-card__actions">
            <Link to={`/devis/${token}/retractation`} className="btn btn-secondary">
              Renoncer au contrat ici
            </Link>
            <a href={`/api/quotes/token/${token}/formulaire.pdf`}>Télécharger le formulaire de rétractation (PDF remplissable)</a>
          </div>
        </section>
      )}
    </QuoteLayout>
  );
};

/** Modèle d'information réglementaire (annexe R221-3), affiché tel quel. */
const WithdrawalNoticeText: React.FC<{ notice: WithdrawalNotice }> = ({ notice }) => (
  <div className="quote-page__notice">
    <p className="quote-page__notice-title">{notice.title}</p>
    {notice.sections.map((section) => (
      <React.Fragment key={section.heading}>
        <p className="quote-page__notice-heading">{section.heading}</p>
        {section.paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </React.Fragment>
    ))}
  </div>
);

/** Lignes en lecture (désignation, quantité, prix, montant). */
const LinesTable: React.FC<{ lines: Quote['lines']; vat: boolean }> = ({ lines = [], vat }) => (
  <table className="quote-page__lines">
    <thead>
      <tr>
        <th scope="col">Désignation</th>
        <th scope="col">Qté</th>
        <th scope="col">{vat ? 'PU HT' : 'Prix unitaire'}</th>
        {vat && <th scope="col">TVA</th>}
        <th scope="col">Montant</th>
      </tr>
    </thead>
    <tbody>
      {lines.map((line, index) => (
        <tr key={index}>
          <td>
            {line.label}
            <span className="quote-page__kind">{LINE_KIND_LABELS[line.kind]}</span>
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

const QuoteLayout: React.FC<{ config: AppConfig; children: React.ReactNode }> = ({ config, children }) => (
  <div>
    <div className="booking-page-header">
      <Link to="/" className="booking-page-header__back">
        <ArrowLeftIcon size={18} weight="bold" />
        Retour à l'accueil
      </Link>
      <span className="booking-page-header__brand">
        <BrandMark config={config} iconSize={22} />
      </span>
    </div>
    <div className="container">
      <div className="card decision-card quote-page">{children}</div>
    </div>
  </div>
);

export default QuotePage;
