import React, { useState } from 'react';
import { Appointment } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../api';

interface BookingConfirmationProps {
  appointment: Appointment;
  onNewBooking: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  onNewBooking,
}) => {
  const [isCancelled, setIsCancelled] = useState(appointment.status === 'cancelled');
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

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
          className={`confirmation-badge-icon ${
            isCancelled ? 'confirmation-badge-icon--danger' : 'confirmation-badge-icon--success'
          }`}
        >
          {isCancelled ? '✕' : '✓'}
        </div>
        <h2 className="confirmation-title">
          {isCancelled ? 'Rendez-vous annulé' : 'Rendez-vous confirmé !'}
        </h2>
        <p className="confirmation-subtitle">
          {isCancelled
            ? 'Ce créneau a été libéré dans le planning de l’artisan.'
            : 'Un e-mail récapitulatif a été envoyé avec toutes les informations nécessaires.'}
        </p>
      </div>

      {cancelMessage && (
        <div
          className={`confirmation-message ${
            isCancelled ? 'confirmation-message--danger' : 'confirmation-message--success'
          }`}
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
        <button
          type="button"
          className="btn btn-primary btn-new-booking"
          onClick={onNewBooking}
        >
          Réserver un autre créneau
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
