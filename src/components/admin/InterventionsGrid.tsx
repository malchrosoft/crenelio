import React, { useMemo, useState } from 'react';
import type { CustomCellRendererProps } from 'ag-grid-react';
import type { ColDef, CsvExportParams } from 'ag-grid-community';
import {
  ArrowSquareOutIcon,
  EnvelopeSimpleIcon,
  EraserIcon,
  FileCsvIcon,
  PlusIcon,
  ReceiptIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '../../types';
import { formatEuro, exportFileName } from '../../utils/format';
import { ANONYMIZED_NAME } from '../../utils/privacy';
import DataGrid, { ActiveFilter, GridSettingToggle } from './DataGrid';
import { STATUS_LABELS } from './AppointmentDialog';

/** Actions sur un rendez-vous ; « Reprogrammer » et « Ouvrir » ouvrent la fenêtre du rendez-vous. */
export interface InterventionActions {
  onOpen: (appointment: Appointment) => void;
  onStatusChange: (id: number, status: string) => void;
  onEmails: (appointment: Appointment) => void;
  onAnonymize: (appointment: Appointment) => void;
}

interface InterventionsGridProps extends InterventionActions {
  /** Bouton « Actualiser » de la barre de la grille (`DataGrid`). */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Rendez-vous déjà filtrés par la barre du planning (recherche, statut, période, jour). */
  appointments: Appointment[];
  /** Nombre total de rendez-vous, avant tout filtre (pied de grille). */
  totalCount: number;
  /** Recherche et filtres rapides du planning. */
  filters?: React.ReactNode;
  /** Filtres rapides (statut, période, jour) et filtres appliqués, cf. `DataGrid`. */
  quickFilters?: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onCreate: () => void;
  /** Facturation dans le logiciel de l'artisan (Item 22, volet B) ; absents si l'artisan ne facture pas depuis Crénelio. */
  onInvoice?: (appointment: Appointment) => void;
  onBillingExport?: () => void;
}

const isOverdue = (a: Appointment) => {
  const start = parseISO(a.start_datetime);
  return isPast(start) && !isToday(start) && (a.status === 'confirmed' || a.status === 'pending');
};

const placeLabel = (a: Appointment) => [a.address, `${a.postal_code} ${a.city}`.trim()].filter(Boolean).join(', ');

/**
 * Statut, reprogrammation, emails, effacement : colonne d'actions optionnelle.
 */
const AppointmentActions: React.FC<{ appointment: Appointment; actions: InterventionActions }> = ({
  appointment,
  actions,
}) => {
  return (
    <div className="admin-table-actions">
      <select
        className="form-input admin-status-select"
        value={appointment.status}
        onChange={(e) => actions.onStatusChange(appointment.id, e.target.value)}
        aria-label="Statut"
      >
        {(Object.keys(STATUS_LABELS) as Appointment['status'][]).map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
        onClick={() => actions.onOpen(appointment)}
        title="Ouvrir : consulter, déplacer ou modifier le rendez-vous"
        aria-label="Ouvrir"
      >
        <ArrowSquareOutIcon size={16} weight="bold" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
        onClick={() => actions.onEmails(appointment)}
        title="Journal des emails envoyés pour ce rendez-vous"
        aria-label="Emails"
      >
        <EnvelopeSimpleIcon size={16} weight="bold" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="btn btn-danger admin-btn-sm data-grid__icon-btn"
        disabled={appointment.client_name === ANONYMIZED_NAME}
        onClick={() => actions.onAnonymize(appointment)}
        title="Demande d'effacement (RGPD) : efface le nom, l'email, le téléphone, l'adresse et les notes du client"
        aria-label="Effacer le client"
      >
        <EraserIcon size={16} weight="bold" aria-hidden="true" />
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
 * sélectionnée par la fenêtre du rendez-vous (bouton « Ouvrir » ou double-clic), colonne d'actions
 * optionnelle, export CSV.
 */
const InterventionsGrid: React.FC<InterventionsGridProps> = ({
  appointments,
  totalCount,
  filters,
  quickFilters,
  activeFilters,
  onCreate,
  onInvoice,
  onBillingExport,
  onRefresh,
  refreshing,
  ...actions
}) => {
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
        width: 290,
      },
    ],
    // Définitions figées : les recalculer réinitialiserait la disposition choisie par l'artisan
    []
  );

  return (
    <DataGrid<Appointment>
        onRefresh={onRefresh}
        refreshing={refreshing}
      gridId="interventions"
      rows={appointments}
      columnDefs={columnDefs}
      getRowId={(a) => String(a.id)}
      entityLabel={['intervention', 'interventions']}
      totalCount={totalCount}
      // Création, puis les actions de la ligne sélectionnée ; le statut se change dans sa fenêtre
      actions={(selected) => (
        <>
          <button type="button" className="btn btn-primary admin-btn-sm" onClick={onCreate} title="Nouveau rendez-vous">
            <PlusIcon size={16} weight="bold" aria-hidden="true" />
            Nouveau
          </button>
          {onBillingExport && (
            <button
              type="button"
              className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
              onClick={onBillingExport}
              title="Exports pour la facturation (clients, interventions terminées)"
              aria-label="Exports pour la facturation"
            >
              <FileCsvIcon size={16} weight="bold" aria-hidden="true" />
            </button>
          )}
          {selected && (
            <>
              <button
                type="button"
                className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                onClick={() => actions.onOpen(selected)}
                title="Ouvrir : consulter, changer le statut, déplacer (ou double-clic sur la ligne)"
                aria-label="Ouvrir"
              >
                <ArrowSquareOutIcon size={16} weight="bold" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                onClick={() => actions.onEmails(selected)}
                title="Journal des emails envoyés pour ce rendez-vous"
                aria-label="Emails"
              >
                <EnvelopeSimpleIcon size={16} weight="bold" aria-hidden="true" />
              </button>
              {onInvoice && selected.status === 'completed' && (
                <button
                  type="button"
                  className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                  onClick={() => onInvoice(selected)}
                  title="Préparer la facture (valeurs à copier dans votre logiciel)"
                  aria-label="Préparer la facture"
                >
                  <ReceiptIcon size={16} weight="bold" aria-hidden="true" />
                </button>
              )}
              {selected.client_name !== ANONYMIZED_NAME && (
                <button
                  type="button"
                  className="btn btn-danger admin-btn-sm data-grid__icon-btn"
                  onClick={() => actions.onAnonymize(selected)}
                  title="Effacer les données du client (demande RGPD)"
                  aria-label="Effacer le client"
                >
                  <EraserIcon size={16} weight="bold" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </>
      )}
      filters={filters}
      quickFilters={quickFilters}
      activeFilters={activeFilters}
      settings={<GridSettingToggle label="Actions sur chaque ligne" checked={rowActions} onChange={(v) => toggleActions?.(v)} />}
      csvExport={{ ...CSV_EXPORT, fileName: exportFileName('rendez-vous') }}
      context={actions}
      rowHeight={72}
      emptyMessage="Aucun rendez-vous enregistré pour le moment."
      rowClassRules={{ 'admin-row-overdue': (p) => (p.data ? isOverdue(p.data) : false) }}
      onRowDoubleClicked={actions.onOpen}
      onColumnsChanged={(grid) => {
        setRowActions(grid.getColumnState().some((c) => c.colId === 'actions' && !c.hide));
        setToggleActions(() => (visible: boolean) => grid.setColumnsVisible(['actions'], visible));
      }}
    />
  );
};

export default InterventionsGrid;
