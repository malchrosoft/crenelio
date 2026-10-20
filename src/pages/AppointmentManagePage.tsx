import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { Appointment, AppConfig } from '../types';
import BookingConfirmation from '../components/BookingConfirmation';
import BrandMark from '../components/BrandMark';

interface AppointmentManagePageProps {
  config: AppConfig;
}

/**
 * Page de gestion d'un rendez-vous ouverte depuis le lien reçu par email.
 * Le jeton d'annulation fait office d'identifiant : il est déjà unique et
 * imprévisible, aucune authentification supplémentaire n'est demandée au client.
 */
const AppointmentManagePage: React.FC<AppointmentManagePageProps> = ({ config }) => {
  const { token } = useParams<{ token: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Lien de gestion incomplet.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    api
      .getAppointmentByToken(token)
      .then((data) => {
        if (!cancelled) setAppointment(data);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(
            err.message === 'Rendez-vous non trouvé'
              ? "Ce lien ne correspond à aucun rendez-vous. Il a peut-être expiré ou été saisi partiellement."
              : err.message
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);


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
        {loading && <p className="slots-loading">Chargement de votre rendez-vous…</p>}

        {!loading && error && (
          <div className="card confirmation-card">
            <div className="form-alert-error">{error}</div>
            <p className="manage-page-help">
              Besoin d'aide ? Contactez-nous
              {config.pro_phone && (
                <>
                  {' '}au <a href={`tel:${config.pro_phone.replace(/\s/g, '')}`}>{config.pro_phone}</a>
                </>
              )}
              {config.pro_email && (
                <>
                  {' '}ou à l'adresse <a href={`mailto:${config.pro_email}`}>{config.pro_email}</a>
                </>
              )}
              .
            </p>
          </div>
        )}

        {!loading && appointment && (
          <BookingConfirmation appointment={appointment} onNewBooking={() => undefined} showNewBooking={false} />
        )}
      </div>
    </div>
  );
};

export default AppointmentManagePage;
