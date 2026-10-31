import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  HourglassIcon,
  XCircleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { Appointment, AppointmentNotification, NotificationType } from '../../types';

/** Libellés lisibles des emails journalisés. */
const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  client_confirmation: 'Confirmation client',
  pro_confirmation: 'Fiche intervention (artisan)',
  exception_client_ack: 'Demande hors zone : accusé de réception client',
  exception_pro_request: 'Demande hors zone : à valider (artisan)',
  exception_client_refused: 'Demande hors zone : refus envoyé au client',
  cancellation_client: 'Annulation (client)',
  cancellation_pro: "Annulation (agenda de l'artisan)",
  reschedule_client: 'Rendez-vous déplacé (client)',
  reschedule_pro: "Rendez-vous déplacé (agenda de l'artisan)",
};

interface NotificationsDialogProps {
  appointment: Appointment;
  onClose: () => void;
  /** Ouvert depuis la fenêtre du rendez-vous : bouton de retour vers celle-ci. */
  onBack?: () => void;
}

/**
 * Journal des emails d'un rendez-vous (une ligne par tentative) et renvoi. Indépendant de l'onglet :
 * s'ouvre par-dessus l'écran d'où il est appelé (liste, calendrier, fenêtre du rendez-vous).
 */
const NotificationsDialog: React.FC<NotificationsDialogProps> = ({ appointment, onClose, onBack }) => {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resendingType, setResendingType] = useState<NotificationType | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .listNotifications(appointment.id)
      .then(setNotifications)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Erreur lors du chargement du journal'))
      .finally(() => setLoading(false));
  }, [appointment.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function resend(type: NotificationType) {
    setResendingType(type);
    setError(null);
    try {
      const res = await api.resendNotification(appointment.id, type);
      setNotifications(res.notifications);
      if (res.result.status === 'failed') {
        setError("L'envoi a de nouveau échoué — le motif figure dans le journal ci-dessous.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du renvoi');
    } finally {
      setResendingType(null);
    }
  }

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="notifications-modal-title" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="notifications-modal-title">
            Emails du rendez-vous #{appointment.id}
          </h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="admin-modal__body">
          <p className="admin-modal-hint">
            Client : <strong>{appointment.client_name}</strong>
            {appointment.client_email && <> ({appointment.client_email})</>}
          </p>

          {error && <div className="form-alert-error">{error}</div>}

          {loading ? (
            <p className="slots-loading">Chargement du journal…</p>
          ) : notifications.length === 0 ? (
            <p className="notification-empty">Aucun email n'a encore été journalisé pour ce rendez-vous.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id} className={clsx('notification-item', `notification-item--${n.status}`)}>
                  <div className="notification-item__head">
                    <span className="notification-item__status" aria-hidden="true">
                      {n.status === 'sent' ? (
                        <CheckCircleIcon size={18} weight="fill" />
                      ) : n.status === 'failed' ? (
                        <XCircleIcon size={18} weight="fill" />
                      ) : (
                        <HourglassIcon size={18} weight="fill" />
                      )}
                    </span>
                    <span className="notification-item__label">{NOTIFICATION_LABELS[n.type]}</span>
                    <span className="notification-item__date">
                      {format(parseISO(n.sent_at ?? n.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div className="notification-item__recipient">{n.recipient}</div>
                  <div className="notification-item__subject">{n.subject}</div>
                  {n.error_message && <div className="notification-item__error">{n.error_message}</div>}
                </li>
              ))}
            </ul>
          )}

          <div className="notification-resend">
            <span className="notification-resend__label">Renvoyer :</span>
            {(Object.keys(NOTIFICATION_LABELS) as NotificationType[]).map((type) => (
              <button
                key={type}
                type="button"
                className="btn btn-secondary admin-btn-sm"
                onClick={() => resend(type)}
                disabled={resendingType !== null}
              >
                <ArrowClockwiseIcon size={14} weight="bold" />
                {resendingType === type ? 'Envoi…' : NOTIFICATION_LABELS[type]}
              </button>
            ))}
          </div>

          {onBack && (
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
                Retour au rendez-vous
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationsDialog;
