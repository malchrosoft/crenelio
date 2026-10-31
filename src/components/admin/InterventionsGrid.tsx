import React, { useMemo, useState } from 'react';
import type { CustomCellRendererProps } from 'ag-grid-react';
import type { ColDef, CsvExportParams } from 'ag-grid-community';
import {
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  EraserIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { formatEuro } from '../../utils/format';
import { ANONYMIZED_NAME } from '../../utils/privacy';
import DataGrid from './DataGrid';
import { STATUS_LABELS } from './AppointmentDialog';

/** Actions sur un rendez-vous ; « Reprogrammer » et « Ouvrir » ouvrent la fenêtre du rendez-vous. */
export interface InterventionActions {
  onOpen: (appointment: Appointment) => void;
  onStatusChange: (id: number, status: string) => void;
  onEmails: (appointment: Appointment) => void;
  onAnonymize: (appointment: Appointment) => void;
}

interface InterventionsGridProps extends InterventionActions {
  /** Rendez-vous déjà filtrés par la barre du planning (recherche, statut, période, jour). */
  appointments: Appointment[];
  /** Nombre total de rendez-vous, avant tout filtre (pied de grille). */
  totalCount: number;
  /** Actions générales en tête de la barre d'outils (nouveau rendez-vous, recherche…). */
  toolbarStart?: React.ReactNode;
}

const isOverdue = (a: Appointment) => {
  const start = parseISO(a.start_datetime);
  return isPast(start) && !isToday(start) && (a.status === 'confirmed' || a.status === 'pending');
};

const placeLabel = (a: Appointment) => [a.address, `${a.postal_code} ${a.city}`.trim()].filter(Boolean).join(', ');

/**
 * Statut, reprogrammation, emails, effacement : barre de la ligne sélectionnée ou cellule de ligne.
 * Sans rendez-vous (aucune sélection), les mêmes contrôles sont affichés désactivés.
 */
const AppointmentActions: React.FC<{ appointment: Appointment | null; actions: InterventionActions }> = ({
  appointment,
  actions,
}) => {
  const disabled = appointment === null;
  return (
    <div className="admin-table-actions">
      <select
        className="form-input admin-status-select"
        value={appointment?.status ?? ''}
        disabled={disabled}
        onChange={(e) => appointment && actions.onStatusChange(appointment.id, e.target.value)}
        aria-label="Statut"
      >
        {disabled && <option value="">Statut</option>}
        {(Object.keys(STATUS_LABELS) as Appointment['status'][]).map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-secondary admin-btn-reschedule"
        disabled={disabled}
        onClick={() => appointment && actions.onOpen(appointment)}
        title="Consulter, déplacer ou modifier le rendez-vous"
      >
        <CalendarBlankIcon size={14} weight="bold" aria-hidden="true" />
        Reprogrammer
      </button>
      <button
        type="button"
        className="btn btn-secondary admin-btn-reschedule"
        disabled={disabled}
        onClick={() => appointment && actions.onEmails(appointment)}
        title="Consulter le journal des emails envoyés pour ce rendez-vous"
      >
        <EnvelopeSimpleIcon size={14} weight="bold" aria-hidden="true" />
        Emails
      </button>
      <button
        type="button"
        className="btn btn-secondary admin-btn-reschedule"
        disabled={disabled || appointment.client_name === ANONYMIZED_NAME}
        onClick={() => appointment && actions.onAnonymize(appointment)}
        title="Demande d'effacement (RGPD) : efface le nom, l'email, le téléphone, l'adresse et les notes du client"
      >
        <EraserIcon size={14} weight="bold" aria-hidden="true" />
        Effacer
      </button>
    </div>
  );
};

const DateCell: React.FC<CustomCellRendererProps<Appointment>> = ({ data }) =>
  data ? (
    <div className="grid-cell-stack">
      <span>{format(parseISO(data.start_datetime), 'EEE dd/MM/yyyy HH:mm', { locale: fr })}</span>
      {isOverdue(data) && (
        <span className="badge-overdue" title="Rendez-vous arrivé à échéance et non clôturé">
          <WarningCircleIcon size={13} weight="fill" aria-hidden="true" />
          Échu à traiter
        </span>
      )}
    </div>
  ) : null;

/** Client, téléphone et lieu d'intervention réunis dans une seule colonne. */
const ClientCell: React.FC<CustomCellRendererProps<Appointment>> = ({ data }) =>
  data ? (
    <div className="grid-cell-stack">
      <strong>{data.client_name}</strong>
      {data.client_phone && (
        <a href={`tel:${data.client_phone}`} className="admin-contact-link" onClick={(e) => e.stopPropagation()}>
          {data.client_phone}
        </a>
      )}
      <span className="grid-cell-muted">{placeLabel(data)}</span>
    </div>
  ) : null;

const StatusCell: React.FC<CustomCellRendererProps<Appointment>> = ({ data }) =>
  data ? <span className={`status-badge status-${data.status}`}>{STATUS_LABELS[data.status]}</span> : null;

const ActionsCell: React.FC<CustomCellRendererProps<Appointment, unknown, InterventionActions>> = ({ data, context }) =>
  data ? <AppointmentActions appointment={data} actions={context} /> : null;

/** Colonnes de l'export CSV : une information par colonne (colonnes masquées comprises). */
const CSV_EXPORT: CsvExportParams = {
  fileName: `interventions-${format(new Date(), 'yyyy-MM-dd')}.csv`,
  columnSeparator: ';', // séparateur lu nativement par Excel en français
  columnKeys: ['date', 'service_name', 'client_name', 'client_phone', 'client_email', 'address', 'commune', 'travel_fee', 'status'],
  processCellCallback: (p) => {
    const value = p.value as unknown;
    if (value instanceof Date) return format(value, 'dd/MM/yyyy HH:mm');
    if (p.column.getColId() === 'travel_fee') return String(value ?? '').replace('.', ',');
    return value == null ? '' : String(value);
  },
};

/**
 * Liste des interventions (Item 21) sur `DataGrid` : colonnes du planning, actions de la ligne
 * sélectionnée (barre au-dessus de la grille), colonne d'actions optionnelle, export CSV, ouverture
 * de la fenêtre du rendez-vous (bouton « Ouvrir » ou double-clic).
 */
const InterventionsGrid: React.FC<InterventionsGridProps> = ({ appointments, totalCount, toolbarStart, ...actions }) => {
  // Colonne d'actions visible : reflet de la disposition (enregistrée avec les autres colonnes)
  const [rowActions, setRowActions] = useState(false);
  const [toggleActions, setToggleActions] = useState<((visible: boolean) => void) | null>(null);

  const columnDefs = useMemo<ColDef<Appointment>[]>(
    () => [
      {
        colId: 'date',
        headerName: 'Date & heure',
        valueGetter: (p) => (p.data ? parseISO(p.data.start_datetime) : null),
        cellDataType: 'dateTime',
        filter: 'agDateColumnFilter',
        sort: 'asc',
        cellRenderer: DateCell,
        minWidth: 190,
      },
      { field: 'service_name', headerName: 'Prestation', filter: 'agTextColumnFilter', minWidth: 160, cellClass: 'grid-cell-wrap' },
      {
        colId: 'client',
        headerName: 'Client & lieu',
        // Tri sur le nom ; le filtre cherche dans le nom, le téléphone, l'adresse et la commune
        valueGetter: (p) => p.data?.client_name ?? '',
        filterValueGetter: (p) => (p.data ? [p.data.client_name, p.data.client_phone, placeLabel(p.data)].join(' ') : ''),
        filter: 'agTextColumnFilter',
        cellRenderer: ClientCell,
        minWidth: 240,
        flex: 2,
      },
      // Colonnes masquées, utiles à l'export CSV (une information par colonne)
      { colId: 'client_name', field: 'client_name', headerName: 'Client', hide: true },
      { colId: 'client_phone', field: 'client_phone', headerName: 'Téléphone', hide: true },
      { colId: 'client_email', field: 'client_email', headerName: 'Email', hide: true },
      { colId: 'address', field: 'address', headerName: 'Adresse', hide: true },
      {
        colId: 'commune',
        headerName: 'Commune',
        valueGetter: (p) => (p.data ? `${p.data.postal_code} ${p.data.city}`.trim() : ''),
        hide: true,
      },
      {
        colId: 'travel_fee',
        headerName: 'Déplacement',
        valueGetter: (p) => Number(p.data?.travel_fee ?? 0),
        cellDataType: 'number',
        valueFormatter: (p) => formatEuro(Number(p.value ?? 0)),
        filter: 'agNumberColumnFilter',
        type: 'rightAligned',
        width: 130,
      },
      {
        colId: 'status',
        headerName: 'Statut',
        valueGetter: (p) => (p.data ? STATUS_LABELS[p.data.status] : ''),
        filter: 'agTextColumnFilter',
        cellRenderer: StatusCell,
        width: 130,
      },
      {
        colId: 'actions',
        headerName: 'Actions',
        cellRenderer: ActionsCell,
        hide: true,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        width: 470,
      },
    ],
    // Définitions figées : les recalculer réinitialiserait la disposition choisie par l'artisan
    []
  );

  return (
    <DataGrid<Appointment>
      gridId="interventions"
      rows={appointments}
      columnDefs={columnDefs}
      getRowId={(a) => String(a.id)}
      entityLabel={['intervention', 'interventions']}
      totalCount={totalCount}
      toolbarStart={toolbarStart}
      toolbarEnd={
        <label className="data-grid__toggle">
          <input type="checkbox" checked={rowActions} onChange={(e) => toggleActions?.(e.target.checked)} />
          Actions sur chaque ligne
        </label>
      }
      csvExport={CSV_EXPORT}
      context={actions}
      rowHeight={72}
      emptyMessage="Aucun rendez-vous enregistré pour le moment."
      rowClassRules={{ 'admin-row-overdue': (p) => (p.data ? isOverdue(p.data) : false) }}
      onRowDoubleClicked={actions.onOpen}
      onColumnsChanged={(grid) => {
        setRowActions(grid.getColumnState().some((c) => c.colId === 'actions' && !c.hide));
        setToggleActions(() => (visible: boolean) => grid.setColumnsVisible(['actions'], visible));
      }}
      renderSelection={(selected) => (
        <>
          <span className="data-grid__selection-label">
            {selected ? (
              <>
                <strong>{selected.client_name}</strong> —{' '}
                {format(parseISO(selected.start_datetime), 'EEEE d MMMM yyyy, HH:mm', { locale: fr })}
              </>
            ) : (
              'Aucune intervention sélectionnée : cliquez sur une ligne (double-clic pour l’ouvrir).'
            )}
          </span>
          <AppointmentActions appointment={selected} actions={actions} />
          <button
            type="button"
            className="btn btn-primary admin-btn-reschedule"
            disabled={!selected}
            onClick={() => selected && actions.onOpen(selected)}
          >
            <ArrowSquareOutIcon size={14} weight="bold" aria-hidden="true" />
            Ouvrir
          </button>
        </>
      )}
    />
  );
};

export default InterventionsGrid;
