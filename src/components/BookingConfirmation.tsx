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
    <div className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isCancelled ? 'var(--danger-light)' : 'var(--success-light)',
            color: isCancelled ? 'var(--danger)' : 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 16px',
          }}
        >
          {isCancelled ? '✕' : '✓'}
        </div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--gray-900)' }}>
          {isCancelled ? 'Rendez-vous annulé' : 'Rendez-vous confirmé !'}
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginTop: 4 }}>
          {isCancelled
            ? 'Ce créneau a été libéré dans le planning de l’artisan.'
            : 'Un e-mail récapitulatif a été envoyé avec toutes les informations nécessaires.'}
        </p>
      </div>

      {cancelMessage && (
        <div
          style={{
            background: isCancelled ? 'var(--danger-light)' : 'var(--success-light)',
            color: isCancelled ? 'var(--danger)' : 'var(--success)',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
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
          <span className="summary-value" style={{ textTransform: 'capitalize' }}>
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 24,
          alignItems: 'center',
        }}
      >
        {!isCancelled && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ color: 'var(--danger)' }}
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Annulation...' : 'Annuler ce rendez-vous'}
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNewBooking}
          style={{ width: '100%', maxWidth: 320 }}
        >
          Réserver un autre créneau
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
