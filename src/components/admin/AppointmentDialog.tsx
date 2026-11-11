import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, EnvelopeSimpleIcon, EraserIcon, FileTextIcon, ReceiptIcon, XIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { Appointment } from '../../types';
import { formatEuro } from '../../utils/format';
import { ANONYMIZED_NAME } from '../../utils/privacy';
import ConfirmDialog from './ConfirmDialog';

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
  /** Fiche « Préparer la facture » (intervention terminée), si l'artisan facture avec son logiciel. */
  onInvoice?: (appointment: Appointment) => void;
  /** Statut proposé à l'ouverture (choisi dans la liste), à valider dans la fenêtre. */
  initialStatus?: Appointment['status'];
}

const toInput = (sql: string) => format(parseISO(sql.replace(' ', 'T')), "yyyy-MM-dd'T'HH:mm");

/**
 * Consultation et modification d'un rendez-vous, commune au calendrier et à la liste : détail,
 * statut, nouvelle date, journal des emails, effacement. Statut et date se modifient d'abord, puis se
 * valident ensemble en bas de la fenêtre (récapitulatif, « Prévenir le client ») ; ne pas prévenir le
 * client d'une annulation ou d'un déplacement demande une confirmation.
 */
const AppointmentDialog: React.FC<AppointmentDialogProps> = ({ appointment, onClose, onChanged, onEmails, onAnonymize, onQuote, quoteError, onInvoice, initialStatus }) => {
  const [datetime, setDatetime] = useState(toInput(appointment.start_datetime));
  const [status, setStatus] = useState<Appointment['status']>(initialStatus ?? appointment.status);
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const [confirmSilent, setConfirmSilent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Rendez-vous mis à jour par ailleurs (ou enregistré) : brouillon resynchronisé
  useEffect(() => setDatetime(toInput(appointment.start_datetime)), [appointment.start_datetime]);
  // (le statut proposé à l'ouverture n'est pas écrasé : seul un changement ultérieur resynchronise)
  const [syncedStatus, setSyncedStatus] = useState(appointment.status);
  if (syncedStatus !== appointment.status) {
    setSyncedStatus(appointment.status);
    setStatus(appointment.status);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !confirmSilent && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, confirmSilent]);

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
  const anonymized = a.client_name === ANONYMIZED_NAME;
  const statusChanged = status !== a.status;
  // Un rendez-vous annulé ne se déplace pas : la date ne compte plus
  const dateChanged = status !== 'cancelled' && datetime !== toInput(a.start_datetime);
  const dirty = statusChanged || dateChanged;
  // Changements dont le client est prévenu (sinon aucun email ne lui part de toute façon)
  const cancelling = statusChanged && status === 'cancelled';
  const clientConcerned = Boolean(a.client_email) && (dateChanged || cancelling || (statusChanged && a.status === 'pending'));
  const when = (value: string) => format(parseISO(value), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });

  const reset = () => {
    setStatus(a.status);
    setDatetime(toInput(a.start_datetime));
    setReason('');
    setNotify(true);
  };

  /** Enregistre les modifications : annulation, sinon déplacement (avec le statut choisi), sinon statut. */
  function validate(silentConfirmed = false) {
    if (clientConcerned && !notify && !silentConfirmed) {
      setConfirmSilent(true);
      return;
    }
    setConfirmSilent(false);
    const notifyClient = !(clientConcerned && !notify);
    run(
      () =>
        cancelling || !dateChanged
          ? api.updateAppointmentStatus(a.id, status, cancelling ? reason.trim() || null : null, notifyClient)
          : api.rescheduleAppointment(a.id, `${datetime.replace('T', ' ')}:00`, status, { notify: notifyClient }),
      cancelling ? 'Rendez-vous annulé.' : dateChanged ? 'Nouvelle date enregistrée.' : 'Statut enregistré.',
    );
  }

  return createPortal(
    <>
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
                  value={status}
                  disabled={busy}
                  onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                >
                  {(Object.keys(STATUS_LABELS) as Appointment['status'][]).map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="appointment-datetime">Date et heure</label>
                <input
                  id="appointment-datetime"
                  type="datetime-local"
                  className="form-input"
                  required
                  disabled={busy || status === 'cancelled'}
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                />
              </div>
              {cancelling && (
                <div className="form-group">
                  <label className="form-label" htmlFor="appointment-reason">Motif d'annulation (facultatif)</label>
                  <input
                    id="appointment-reason"
                    className="form-input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex. : empêchement, pièce indisponible"
                  />
                </div>
              )}
            </div>

            {dirty && (
              <div className="appointment-dialog__review" role="group" aria-label="Modifications à valider">
                <p className="appointment-dialog__review-title">Modifications à valider</p>
                <ul>
                  {statusChanged && (
                    <li>
                      Statut : {STATUS_LABELS[a.status]} → <strong>{STATUS_LABELS[status]}</strong>
                    </li>
                  )}
                  {dateChanged && (
                    <li>
                      Date : {when(a.start_datetime.replace(' ', 'T'))} → <strong>{when(datetime)}</strong>
                    </li>
                  )}
                </ul>
                {clientConcerned && (
                  <label className="theme-effect">
                    <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                    <span>
                      <strong>Prévenir le client par email</strong>
                      <span className="form-hint">Votre propre agenda est mis à jour dans tous les cas.</span>
                    </span>
                  </label>
                )}
                <div className="appointment-dialog__review-actions">
                  <button type="button" className="btn btn-secondary admin-btn-sm" disabled={busy} onClick={reset}>
                    Annuler les modifications
                  </button>
                  <button type="button" className="btn btn-primary admin-btn-sm" disabled={busy} onClick={() => validate()}>
                    <CheckIcon size={14} weight="bold" aria-hidden="true" />
                    Valider
                  </button>
                </div>
              </div>
            )}

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
              {onInvoice && a.status === 'completed' && (
                <button type="button" className="btn btn-secondary" onClick={() => onInvoice(a)}>
                  <ReceiptIcon size={16} weight="bold" aria-hidden="true" />
                  Préparer la facture
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
      </div>
      {/* Hors du fond de la fenêtre : un clic dans la confirmation ne doit pas la fermer */}
      {confirmSilent && (
        <ConfirmDialog
          title="Ne pas prévenir le client ?"
          confirmLabel={cancelling ? 'Annuler sans prévenir' : 'Enregistrer sans prévenir'}
          cancelLabel="Revenir"
          onConfirm={() => validate(true)}
          onCancel={() => setConfirmSilent(false)}
        >
          <p>
            {cancelling
              ? "Le client ne recevra aucun email d'annulation : pensez à le prévenir vous-même (téléphone, message)."
              : 'Le client ne recevra pas la nouvelle date par email : pensez à le prévenir vous-même (téléphone, message).'}
          </p>
        </ConfirmDialog>
      )}
    </>,
    document.body
  );
};

export default AppointmentDialog;
