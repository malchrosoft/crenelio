import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarBlankIcon, EnvelopeSimpleIcon, EraserIcon, FileTextIcon, XIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { Appointment } from '../../types';
import { formatEuro } from '../../utils/format';
import { ANONYMIZED_NAME } from '../../utils/privacy';

export const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

interface AppointmentDialogProps {
  appointment: Appointment;
  onClose: () => void;
  /** Rendez-vous modifié (statut, date) : mise à jour de la liste et du calendrier. */
  onChanged: (appointment: Appointment) => void;
  onEmails: (appointment: Appointment) => void;
  onAnonymize: (appointment: Appointment) => void;
  /** Devis prérempli depuis ce rendez-vous (prestation, déplacement), ouvert dans l'écran « Devis ». */
  onQuote?: (appointment: Appointment) => void;
  quoteError?: string | null;
}

const toInput = (sql: string) => format(parseISO(sql.replace(' ', 'T')), "yyyy-MM-dd'T'HH:mm");

/**
 * Consultation et modification d'un rendez-vous, commune au calendrier et à la liste : détail,
 * statut, nouvelle date (le client est prévenu sauf choix contraire), journal des emails, effacement.
 */
const AppointmentDialog: React.FC<AppointmentDialogProps> = ({ appointment, onClose, onChanged, onEmails, onAnonymize, onQuote, quoteError }) => {
  const [datetime, setDatetime] = useState(toInput(appointment.start_datetime));
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Rendez-vous mis à jour par ailleurs : date affichée resynchronisée
  useEffect(() => setDatetime(toInput(appointment.start_datetime)), [appointment.start_datetime]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function run(action: () => Promise<Appointment>, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      onChanged(await action());
      setMessage({ ok: true, text: success });
    } catch (err: unknown) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setBusy(false);
    }
  }

  const a = appointment;
  const start = parseISO(a.start_datetime.replace(' ', 'T'));
  const travelFee = Number(a.travel_fee ?? 0);
  const price = Number(a.service_price ?? 0);
  const dateChanged = datetime !== toInput(a.start_datetime);
  const anonymized = a.client_name === ANONYMIZED_NAME;

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="appointment-dialog-title" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="appointment-dialog-title">
            {a.client_name} — {format(start, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="admin-modal__body appointment-dialog">
          <dl className="appointment-dialog__details">
            <dt>Prestation</dt>
            <dd>
              {a.service_name}
              {a.duration_minutes ? ` (${a.duration_minutes} min)` : ''}
            </dd>
            <dt>Montant</dt>
            <dd>
              {formatEuro(price)}
              {travelFee > 0 && <> + déplacement {formatEuro(travelFee)} = {formatEuro(price + travelFee)}</>}
            </dd>
            {!anonymized && (
              <>
                <dt>Téléphone</dt>
                <dd>{a.client_phone ? <a href={`tel:${a.client_phone}`}>{a.client_phone}</a> : '—'}</dd>
                <dt>Email</dt>
                <dd>{a.client_email ? <a href={`mailto:${a.client_email}`}>{a.client_email}</a> : '—'}</dd>
              </>
            )}
            <dt>Lieu</dt>
            <dd>{[a.address, `${a.postal_code} ${a.city}`.trim()].filter(Boolean).join(', ') || '—'}</dd>
            {a.notes && (
              <>
                <dt>Notes d'accès</dt>
                <dd>{a.notes}</dd>
              </>
            )}
            {a.cancellation_reason && (
              <>
                <dt>Motif d'annulation</dt>
                <dd>{a.cancellation_reason}</dd>
              </>
            )}
          </dl>

          <div className="appointment-dialog__edit">
            <div className="form-group">
              <label className="form-label" htmlFor="appointment-status">Statut</label>
              <select
                id="appointment-status"
                className="form-input"
                value={a.status}
                disabled={busy}
                onChange={(e) =>
                  run(() => api.updateAppointmentStatus(a.id, e.target.value), 'Statut enregistré.')
                }
              >
                {(Object.keys(STATUS_LABELS) as Appointment['status'][]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <form
              className="form-group"
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () => api.rescheduleAppointment(a.id, `${datetime.replace('T', ' ')}:00`, 'confirmed', { notify }),
                  'Nouvelle date enregistrée.'
                );
              }}
            >
              <label className="form-label" htmlFor="appointment-datetime">Date et heure</label>
              <div className="appointment-dialog__reschedule">
                <input
                  id="appointment-datetime"
                  type="datetime-local"
                  className="form-input"
                  required
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                />
                <button type="submit" className="btn btn-primary admin-btn-sm" disabled={busy || !dateChanged}>
                  <CalendarBlankIcon size={14} weight="bold" aria-hidden="true" />
                  Déplacer
                </button>
              </div>
              {a.client_email && (
                <label className="theme-effect">
                  <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                  <span>
                    <strong>Prévenir le client par email</strong>
                    <span className="form-hint">Votre propre agenda est mis à jour dans tous les cas.</span>
                  </span>
                </label>
              )}
            </form>
          </div>

          {message && (
            <p className={message.ok ? 'admin-settings-message' : 'admin-settings-message admin-settings-message--error'} role="status">
              {message.text}
            </p>
          )}

          {quoteError && <p className="form-alert-error">{quoteError}</p>}

          <div className="admin-modal__actions">
            {onQuote && !anonymized && (
              <button type="button" className="btn btn-secondary" onClick={() => onQuote(a)}>
                <FileTextIcon size={16} weight="bold" aria-hidden="true" />
                Devis
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => onEmails(a)}>
              <EnvelopeSimpleIcon size={16} weight="bold" aria-hidden="true" />
              Emails
            </button>
            {!anonymized && (
              <button type="button" className="btn btn-secondary" onClick={() => onAnonymize(a)}>
                <EraserIcon size={16} weight="bold" aria-hidden="true" />
                Effacer le client
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AppointmentDialog;
