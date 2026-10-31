import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CustomCellRendererProps } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { differenceInMinutes, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { Unavailability } from '../../types';
import DataGrid from './DataGrid';
import ConfirmDialog from './ConfirmDialog';

const toDate = (sql: string) => parseISO(sql.replace(' ', 'T'));
const toSql = (local: string) => `${local.replace('T', ' ')}:00`;

type Period = 'past' | 'current' | 'upcoming';
const PERIOD_LABELS: Record<Period, string> = { past: 'Passée', current: 'En cours', upcoming: 'À venir' };

function periodOf(u: Unavailability, now = new Date()): Period {
  if (toDate(u.end_datetime) < now) return 'past';
  return toDate(u.start_datetime) <= now ? 'current' : 'upcoming';
}

/** Durée lisible : « 3 j 4 h », « 2 h 30 »… */
function durationLabel(u: Unavailability): string {
  const minutes = differenceInMinutes(toDate(u.end_datetime), toDate(u.start_datetime));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  return [days && `${days} j`, hours && `${hours} h`, rest && `${rest} min`].filter(Boolean).join(' ') || '0 min';
}

const PeriodCell: React.FC<CustomCellRendererProps<Unavailability>> = ({ data }) =>
  data ? <span className={`status-badge unavailability-period--${periodOf(data)}`}>{PERIOD_LABELS[periodOf(data)]}</span> : null;

/**
 * Indisponibilités (congés, formation…) en grille (sous-onglet de « Horaires ») : tri, filtres,
 * ajout dans une fenêtre, suppression de la ligne sélectionnée. Aucun créneau n'est proposé pendant
 * ces périodes.
 */
const UnavailabilitiesGrid: React.FC = () => {
  const [items, setItems] = useState<Unavailability[]>([]);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Unavailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listUnavailabilities().then(setItems).catch(() => setError('Chargement impossible'));
  }, []);

  const columnDefs = useMemo<ColDef<Unavailability>[]>(
    () => [
      { field: 'title', headerName: 'Motif', filter: 'agTextColumnFilter', flex: 2, minWidth: 180 },
      {
        colId: 'start',
        headerName: 'Début',
        valueGetter: (p) => (p.data ? toDate(p.data.start_datetime) : null),
        valueFormatter: (p) => (p.value ? format(p.value as Date, "EEE d MMM yyyy 'à' HH:mm", { locale: fr }) : ''),
        cellDataType: 'dateTime',
        filter: 'agDateColumnFilter',
        sort: 'desc',
        minWidth: 200,
      },
      {
        colId: 'end',
        headerName: 'Fin',
        valueGetter: (p) => (p.data ? toDate(p.data.end_datetime) : null),
        valueFormatter: (p) => (p.value ? format(p.value as Date, "EEE d MMM yyyy 'à' HH:mm", { locale: fr }) : ''),
        cellDataType: 'dateTime',
        filter: 'agDateColumnFilter',
        minWidth: 200,
      },
      {
        colId: 'duration',
        headerName: 'Durée',
        valueGetter: (p) => (p.data ? differenceInMinutes(toDate(p.data.end_datetime), toDate(p.data.start_datetime)) : 0),
        valueFormatter: (p) => (p.data ? durationLabel(p.data) : ''),
        cellDataType: 'number',
        filter: false,
        width: 130,
      },
      {
        colId: 'period',
        headerName: 'Période',
        valueGetter: (p) => (p.data ? PERIOD_LABELS[periodOf(p.data)] : ''),
        filter: 'agTextColumnFilter',
        cellRenderer: PeriodCell,
        width: 140,
      },
    ],
    []
  );

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    setError(null);
    try {
      await api.deleteUnavailability(target.id);
      setItems((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  return (
    <>
      {error && <p className="form-alert-error">{error}</p>}
      <DataGrid<Unavailability>
        gridId="unavailabilities"
        rows={items}
        columnDefs={columnDefs}
        getRowId={(u) => String(u.id)}
        entityLabel={['indisponibilité', 'indisponibilités']}
        emptyMessage="Aucune indisponibilité : tous les créneaux des horaires de travail sont proposés."
        actions={(selected) => (
          <>
            <button type="button" className="btn btn-primary admin-btn-sm" onClick={() => setAdding(true)} title="Nouvelle indisponibilité">
              <PlusIcon size={16} weight="bold" aria-hidden="true" />
              Nouvelle
            </button>
            {selected && (
              <button
                type="button"
                className="btn btn-danger admin-btn-sm data-grid__icon-btn"
                onClick={() => setDeleting(selected)}
                title={`Supprimer « ${selected.title} »`}
                aria-label="Supprimer"
              >
                <TrashIcon size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </>
        )}
        filters={<p className="data-grid__hint">Congés, formation, rendez-vous personnel… aucun créneau n'est proposé pendant ces périodes.</p>}
      />

      {adding && (
        <UnavailabilityForm
          onClose={() => setAdding(false)}
          onCreated={(created) => {
            setItems((prev) => [...prev, created]);
            setAdding(false);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Supprimer l'indisponibilité ?"
          confirmLabel="Supprimer"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        >
          « {deleting.title} » sera supprimée : les créneaux de cette période redeviendront réservables en ligne.
        </ConfirmDialog>
      )}
    </>
  );
};

/** Fenêtre d'ajout d'une indisponibilité. */
const UnavailabilityForm: React.FC<{ onClose: () => void; onCreated: (u: Unavailability) => void }> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onCreated(
        await api.createUnavailability({ title: title.trim() || 'Indisponible', start_datetime: toSql(start), end_datetime: toSql(end) })
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="unavailability-form-title" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="unavailability-form-title">Nouvelle indisponibilité</h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <form className="admin-modal__body" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label" htmlFor="unavail-title">Motif</label>
            <input id="unavail-title" className="form-input" placeholder="Congés" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="unavail-start">Début</label>
            <input id="unavail-start" type="datetime-local" className="form-input" required value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="unavail-end">Fin</label>
            <input
              id="unavail-end"
              type="datetime-local"
              className="form-input"
              required
              min={start || undefined}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          {error && <p className="form-alert-error">{error}</p>}
          <div className="admin-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Enregistrement…' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UnavailabilitiesGrid;
