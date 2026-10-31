import React, { useEffect, useState } from 'react';
import { CalendarDotsIcon, CopyIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api, CalendarFeedInfo } from '../../api';
import ConfirmDialog from './ConfirmDialog';

/**
 * Abonnement d'agenda de l'artisan, optionnel (Item 33) : copie à sens unique du planning de
 * Crénelio dans Google Agenda, Outlook ou Apple Calendar, via une adresse privée et secrète.
 */
const CalendarFeedSettings: React.FC = () => {
  const [feed, setFeed] = useState<CalendarFeedInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState<'regenerate' | 'disable' | null>(null);

  useEffect(() => {
    api.getCalendarFeed().then(setFeed).catch(() => setFeed(null));
  }, []);

  async function run(action: () => Promise<CalendarFeedInfo>, success?: string) {
    setBusy(true);
    setMessage(null);
    try {
      setFeed(await action());
      if (success) setMessage({ ok: true, text: success });
    } catch (err: unknown) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setBusy(false);
    }
  }

  // Adresse complète : même origine que l'espace Pro (domaine du site en production)
  const httpsUrl = feed?.path ? `${window.location.origin}${feed.path}` : null;
  const webcalUrl = httpsUrl?.replace(/^https?:/, 'webcal:') ?? null;

  async function copy() {
    if (!httpsUrl) return;
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setMessage({ ok: true, text: 'Adresse copiée.' });
    } catch {
      setMessage({ ok: false, text: 'Copie impossible : sélectionnez l’adresse et copiez-la.' });
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="config-calendar-feed">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="config-calendar-feed">
          <CalendarDotsIcon size={20} weight="fill" aria-hidden="true" />
          Abonnement d'agenda
        </h3>
      </div>
      <p className="admin-settings-intro">
        Facultatif. Votre planning Crénelio est recopié dans votre agenda (Google, Outlook, iPhone…) via une adresse
        privée. Crénelio reste la référence : une modification faite dans l'agenda ne revient pas ici.
      </p>

      {feed && (
        <>
          <label className="theme-effect">
            <input
              type="checkbox"
              checked={feed.enabled}
              disabled={busy}
              onChange={(e) =>
                e.target.checked
                  ? run(() => api.enableCalendarFeed(feed.include_unavailabilities), 'Abonnement activé.')
                  : setConfirm('disable')
              }
            />
            <span>
              <strong>Activer l'abonnement d'agenda</strong>
              <span className="form-hint">Désactivé, aucune adresse n'existe.</span>
            </span>
          </label>

          {feed.enabled && httpsUrl && webcalUrl && (
            <div className="calendar-feed">
              <div className="form-group">
                <label className="form-label" htmlFor="calendar-feed-url">Adresse privée de votre agenda</label>
                <div className="calendar-feed__url">
                  <input id="calendar-feed-url" className="form-input" readOnly value={httpsUrl} onFocus={(e) => e.target.select()} />
                  <button type="button" className="btn btn-secondary admin-btn-sm" onClick={copy}>
                    <CopyIcon size={14} weight="bold" aria-hidden="true" />
                    Copier
                  </button>
                </div>
                <p className="form-hint">
                  Ne la partagez pas : elle donne accès à vos rendez-vous et aux coordonnées de vos clients. En cas de
                  doute, régénérez-la.
                </p>
              </div>

              <div className="calendar-feed__providers">
                <a
                  className="btn btn-secondary admin-btn-sm"
                  href={`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ajouter à Google Agenda
                </a>
                <a
                  className="btn btn-secondary admin-btn-sm"
                  href={`https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent('Interventions')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ajouter à Outlook
                </a>
                <a className="btn btn-secondary admin-btn-sm" href={webcalUrl}>
                  Ajouter à Apple Calendar
                </a>
              </div>

              <label className="theme-effect">
                <input
                  type="checkbox"
                  checked={feed.include_unavailabilities}
                  disabled={busy}
                  onChange={(e) => run(() => api.updateCalendarFeed(e.target.checked))}
                />
                <span>
                  <strong>Inclure les indisponibilités</strong>
                  <span className="form-hint">Congés et absences saisis dans l'onglet Horaires.</span>
                </span>
              </label>

              <ul className="calendar-feed__notes">
                <li>
                  <strong>Délai de mise à jour</strong>, fixé par chaque agenda et non par Crénelio : Apple Calendar
                  jusqu'à 5 minutes (réglable), Outlook quelques heures, Google Agenda jusqu'à 24 heures. Les emails
                  d'invitation restent la mise à jour immédiate.
                </li>
                <li>
                  Si vous ajoutez aussi les invitations reçues par email à votre agenda principal, un rendez-vous peut
                  apparaître deux fois (une fois par agenda).
                </li>
                <li>
                  Outlook professionnel (Microsoft 365) : copiez l'adresse, puis <em>Ajouter un calendrier</em> →{' '}
                  <em>S'abonner à partir du web</em>.
                </li>
              </ul>

              <p className="form-hint">
                {feed.last_access
                  ? `Dernière lecture par un agenda : ${format(parseISO(feed.last_access.replace(' ', 'T')), "d MMMM yyyy 'à' HH:mm", { locale: fr })}.`
                  : "Aucun agenda n'a encore lu cette adresse."}
              </p>

              <div className="admin-settings-actions">
                <button type="button" className="btn btn-secondary admin-btn-sm" disabled={busy} onClick={() => setConfirm('regenerate')}>
                  <ArrowsClockwiseIcon size={14} weight="bold" aria-hidden="true" />
                  Régénérer l'adresse
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {message && (
        <p className={message.ok ? 'admin-settings-message' : 'admin-settings-message admin-settings-message--error'} role="status">
          {message.text}
        </p>
      )}

      {confirm && feed && (
        <ConfirmDialog
          title={confirm === 'regenerate' ? "Régénérer l'adresse ?" : "Désactiver l'abonnement ?"}
          confirmLabel={confirm === 'regenerate' ? 'Régénérer' : 'Désactiver'}
          onConfirm={() => {
            const kind = confirm;
            setConfirm(null);
            run(
              () => (kind === 'regenerate' ? api.enableCalendarFeed(feed.include_unavailabilities) : api.disableCalendarFeed()),
              kind === 'regenerate' ? 'Nouvelle adresse créée : abonnez-vous de nouveau.' : 'Abonnement désactivé.'
            );
          }}
          onCancel={() => setConfirm(null)}
        >
          {confirm === 'regenerate'
            ? "L'adresse actuelle cessera de fonctionner : les agendas abonnés ne se mettront plus à jour tant que vous ne vous serez pas abonné à la nouvelle."
            : "L'adresse cessera aussitôt de fonctionner. Supprimez aussi l'abonnement dans votre agenda : il garderait la dernière copie reçue."}
        </ConfirmDialog>
      )}
    </section>
  );
};

export default CalendarFeedSettings;
