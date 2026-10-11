import React, { useState } from 'react';
import clsx from 'clsx';
import { MapPinIcon } from '@phosphor-icons/react';
import { Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../api';
import { formatEuro, formatKm } from '../utils/format';

interface BookingConfirmationProps {
  appointment: Appointment;
  onNewBooking: () => void;
  /** Masqué lorsque la fiche est ouverte depuis le lien de gestion reçu par email. */
  showNewBooking?: boolean;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  onNewBooking,
  showNewBooking = true,
}) => {
  const [isCancelled, setIsCancelled] = useState(appointment.status === 'cancelled');
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  // Détail tarifaire figé au moment de la réservation
  const servicePrice = parseFloat(String(appointment.service_price ?? 0)) || 0;
  const travelFee = parseFloat(String(appointment.travel_fee ?? 0)) || 0;
  const distanceKm =
    appointment.distance_km !== null && appointment.distance_km !== undefined
      ? parseFloat(String(appointment.distance_km))
      : null;

  const startObj = new Date(appointment.start_datetime);
  const endObj = new Date(appointment.end_datetime);
  const formattedDate = format(startObj, 'EEEE d MMMM yyyy', { locale: fr });
  const timeSlot = `${format(startObj, 'HH:mm')} – ${format(endObj, 'HH:mm')}`;

  async function handleCancel() {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    setCancelling(true);
    try {
      await api.cancelAppointmentByToken(appointment.cancel_token, 'Annulé par le client');
      setIsCancelled(true);
      setCancelMessage('Votre rendez-vous a bien été annulé.');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setCancelMessage(`Erreur lors de l'annulation : ${errorMsg}`);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="card confirmation-card">
      <div className="confirmation-header">
        <div
          className={clsx('confirmation-badge-icon', {
            'confirmation-badge-icon--danger': isCancelled,
            'confirmation-badge-icon--success': !isCancelled,
          })}
        >
          {isCancelled ? '✕' : '✓'}
        </div>
        <h2 className="confirmation-title">
          {isCancelled ? 'Rendez-vous annulé' : showNewBooking ? 'Rendez-vous confirmé !' : 'Votre rendez-vous'}
        </h2>
        <p className="confirmation-subtitle">
          {isCancelled
            ? 'Ce créneau a été libéré dans le planning de l’artisan.'
            : showNewBooking
              ? 'Un e-mail récapitulatif a été envoyé avec toutes les informations nécessaires.'
              : 'Retrouvez ici le détail de votre intervention et annulez-la si besoin.'}
        </p>
      </div>

      {cancelMessage && (
        <div
          className={clsx('confirmation-message', {
            'confirmation-message--danger': isCancelled,
            'confirmation-message--success': !isCancelled,
          })}
        >
          {cancelMessage}
        </div>
      )}

      <div className="summary-box">
        <div className="summary-row">
          <span className="summary-label">Numéro d'intervention :</span>
          <span className="summary-value">#{appointment.id}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Prestation :</span>
          <span className="summary-value">{appointment.service_name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Date :</span>
          <span className="summary-value summary-value--capitalized">
            {formattedDate}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Créneau :</span>
          <span className="summary-value">{timeSlot}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Lieu d'intervention :</span>
          <span className="summary-value">
            {appointment.address}, {appointment.postal_code} {appointment.city}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Contact client :</span>
          <span className="summary-value">
            {appointment.client_name} ({appointment.client_phone})
          </span>
        </div>
        {appointment.notes && (
          <div className="summary-row">
            <span className="summary-label">Notes d'accès :</span>
            <span className="summary-value">{appointment.notes}</span>
          </div>
        )}
        <div className="summary-row">
          <span className="summary-label">Prestation :</span>
          <span className="summary-value">{formatEuro(servicePrice)}</span>
        </div>
        {travelFee > 0 && (
          <div className="summary-row">
            <span className="summary-label">Frais de déplacement :</span>
            <span className="summary-value">
              {formatEuro(travelFee)}
              {distanceKm !== null && (
                <span className="summary-distance">
                  <MapPinIcon size={13} weight="fill" aria-hidden="true" />
                  {formatKm(distanceKm)}
                </span>
              )}
            </span>
          </div>
        )}
        <div className="summary-row summary-row--total">
          <span className="summary-label">Total estimé :</span>
          <span className="summary-value">{formatEuro(servicePrice + travelFee)}</span>
        </div>
      </div>

      <div className="confirmation-actions">
        {!isCancelled && (
          <button
            type="button"
            className="btn btn-secondary btn-cancel"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Annulation...' : 'Annuler ce rendez-vous'}
          </button>
        )}
        {showNewBooking && (
          <button
            type="button"
            className="btn btn-primary btn-new-booking"
            onClick={onNewBooking}
          >
            Réserver un autre créneau
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;
