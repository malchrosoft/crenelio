import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { AppConfig, Appointment } from '../types';
import BrandMark from '../components/BrandMark';
import { formatEuro, formatKm } from '../utils/format';

interface DecisionPageProps {
  config: AppConfig;
}

/**
 * Page ouverte depuis l'email « Demande hors zone à valider » : l'artisan accepte ou refuse.
 * Le lien mène ici plutôt que d'agir directement, car certaines messageries ouvrent
 * automatiquement les liens des emails (une décision ne doit jamais être prise par un robot).
 */
const DecisionPage: React.FC<DecisionPageProps> = ({ config }) => {
  const { token = '' } = useParams<{ token: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmRefuse, setConfirmRefuse] = useState(false);

  useEffect(() => {
    api
      .getDecision(token)
      .then(setAppointment)
      .catch((err: Error) => setError(err.message));
  }, [token]);

  async function decide(action: 'accept' | 'refuse') {
    setSending(true);
    setError(null);
    try {
      const res = await api.decide(token, action);
      setResult(res.status === 'confirmed' ? 'confirmed' : 'cancelled');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la décision');
    } finally {
      setSending(false);
    }
  }

  const start = appointment ? new Date(appointment.start_datetime.replace(' ', 'T')) : null;

  return (
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
        <div className="card decision-card">
          <h2 className="card-title">Demande d'intervention hors zone</h2>

          {!appointment && !error && <p className="slots-loading">Chargement de la demande…</p>}
          {error && <div className="form-alert-error">{error}</div>}

          {result === 'confirmed' && (
            <p className="decision-card__result decision-card__result--ok">
              <CheckCircleIcon size={22} weight="fill" aria-hidden="true" />
              Rendez-vous confirmé : le client a reçu sa confirmation et vous, la fiche avec le fichier agenda.
            </p>
          )}
          {result === 'cancelled' && (
            <p className="decision-card__result">
              <XCircleIcon size={22} weight="fill" aria-hidden="true" />
              Demande refusée : le client en est informé et le créneau est libéré.
            </p>
          )}

          {appointment && start && !result && (
            <>
              <div className="summary-box">
                <div className="summary-row">
                  <span className="summary-label">Prestation :</span>
                  <span className="summary-value">{appointment.service_name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Date :</span>
                  <span className="summary-value summary-value--capitalized">
                    {format(start, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Client :</span>
                  <span className="summary-value">
                    {appointment.client_name} — {appointment.client_phone} — {appointment.client_email}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Adresse :</span>
                  <span className="summary-value">
                    {appointment.address}, {appointment.postal_code} {appointment.city}
                    {appointment.distance_km !== null && ` (${formatKm(Number(appointment.distance_km))} du point de départ)`}
                  </span>
                </div>
                {Number(appointment.travel_fee) > 0 && (
                  <div className="summary-row">
                    <span className="summary-label">Frais de déplacement :</span>
                    <span className="summary-value">{formatEuro(Number(appointment.travel_fee))}</span>
                  </div>
                )}
                {appointment.notes && (
                  <div className="summary-row">
                    <span className="summary-label">Précisions :</span>
                    <span className="summary-value">{appointment.notes}</span>
                  </div>
                )}
              </div>

              {confirmRefuse ? (
                <div className="decision-card__actions">
                  <p>Refuser la demande ? Le client sera prévenu par email.</p>
                  <button type="button" className="btn btn-secondary" disabled={sending} onClick={() => setConfirmRefuse(false)}>
                    Retour
                  </button>
                  <button type="button" className="btn btn-danger" disabled={sending} onClick={() => decide('refuse')}>
                    Confirmer le refus
                  </button>
                </div>
              ) : (
                <div className="decision-card__actions">
                  <button type="button" className="btn btn-primary" disabled={sending} onClick={() => decide('accept')}>
                    <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
                    Accepter le rendez-vous
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={sending} onClick={() => setConfirmRefuse(true)}>
                    <XCircleIcon size={18} weight="fill" aria-hidden="true" />
                    Refuser
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionPage;
