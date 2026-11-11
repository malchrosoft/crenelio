import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { AppConfig, Quote } from '../types';
import PoweredBy from '../components/PoweredBy';
import BrandMark from '../components/BrandMark';
import { companyAddress } from '../utils/legalIdentity';

const day = (value: string | null) => (value ? format(parseISO(value.replace(' ', 'T')), 'dd/MM/yyyy') : '');
const moment = (value: string | null) =>
  value ? format(parseISO(value.replace(' ', 'T')), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }) : '';

/**
 * Formulaire de rétractation en ligne (/devis/:token/retractation), Item 22, écart 13 : modèle de
 * l'annexe à l'article R221-1 **mot pour mot**, prérempli avec les références du contrat, transmis par
 * la fonctionnalité de rétractation (L221-21, D221-5 : « confirmer la rétractation », accusé de
 * réception). Après validation, la déclaration se télécharge en PDF.
 */
const QuoteWithdrawalPage: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { token = '' } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const load = () =>
    api
      .getQuoteByToken(token)
      .then((q) => {
        setQuote(q);
        setName(q.client_name);
        setAddress([q.address, `${q.postal_code} ${q.city}`.trim()].filter(Boolean).join(', '));
        setEmail(q.client_email);
      })
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.withdrawQuote(token, name.trim(), email.trim(), address.trim());
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  const to = [config.company_name, companyAddress(config), config.pro_email].filter(Boolean).join(', ');

  return (
    <div>
      <div className="booking-page-header">
        <Link to={`/devis/${token}`} className="booking-page-header__back">
          <ArrowLeftIcon size={18} weight="bold" />
          Retour au devis
        </Link>
        <span className="booking-page-header__brand">
          <BrandMark config={config} iconSize={22} />
        </span>
      </div>
      <div className="container">
        <div className="card decision-card quote-page quote-withdrawal-form">
          {!quote && !error && <p className="slots-loading">Chargement…</p>}
          {error && <div className="form-alert-error">{error}</div>}

          {quote?.status === 'withdrawn' && (
            <>
              <p className="decision-card__result decision-card__result--ok">
                <CheckCircleIcon size={22} weight="fill" aria-hidden="true" />
                <span>
                  Rétractation transmise le {moment(quote.withdrawn_at)}. Un accusé de réception a été envoyé à {quote.withdrawal_email}.
                </span>
              </p>
              <p className="quote-page__print">
                <a className="btn btn-primary" href={`/api/quotes/token/${token}/declaration.pdf`}>
                  Télécharger la déclaration (PDF)
                </a>
              </p>
            </>
          )}

          {quote && quote.status !== 'withdrawn' && !quote.can_withdraw && (
            <p>La rétractation en ligne n'est plus possible pour ce devis (délai dépassé, intervention urgente ou devis non accepté).</p>
          )}

          {quote?.can_withdraw && (
            <form onSubmit={submit}>
              {/* Annexe à l'article R221-1 du Code de la consommation, mot pour mot */}
              <h2 className="card-title">MODÈLE DE FORMULAIRE DE RÉTRACTATION</h2>
              <p>(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)</p>
              <p>A l'attention de {to} :</p>
              <p>
                Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien
                (*)/pour la prestation de services (*) ci-dessous :
              </p>
              <p>
                <strong>
                  Devis n° {quote.number}
                  {quote.title ? ` — ${quote.title}` : ''}
                </strong>
              </p>
              <p>Commandé le (*)/reçu le (*) : {day(quote.decided_at)}</p>
              <div className="form-group">
                <label className="form-label" htmlFor="withdrawal-name">
                  Nom du (des) consommateur(s) :
                </label>
                <input id="withdrawal-name" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="withdrawal-address">
                  Adresse du (des) consommateur(s) :
                </label>
                <textarea id="withdrawal-address" className="form-textarea" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <p>Date : {format(new Date(), 'dd/MM/yyyy')}</p>
              <p className="form-hint">(*) Rayez la mention inutile.</p>

              <div className="form-group">
                <label className="form-label" htmlFor="withdrawal-email">
                  Email pour recevoir l'accusé de réception
                </label>
                <input
                  id="withdrawal-email"
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="form-hint">
                  Un accusé de réception reprenant le contenu de votre déclaration, sa date et son heure vous est envoyé à cette adresse
                  (articles L221-21 et D221-5).
                </p>
              </div>
              <div className="decision-card__actions">
                <Link to={`/devis/${token}`} className="btn btn-secondary">
                  Retour
                </Link>
                <button type="submit" className="btn btn-danger" disabled={busy}>
                  Confirmer la rétractation
                </button>
                <a href={`/api/quotes/token/${token}/formulaire.pdf`}>Version PDF remplissable</a>
              </div>
            </form>
          )}
        </div>
        <p className="quote-page__powered">
          <PoweredBy />
        </p>
      </div>
    </div>
  );
};

export default QuoteWithdrawalPage;
