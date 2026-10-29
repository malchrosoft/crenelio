import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  ColumnApiModule,
  ColumnState,
  CsvExportModule,
  DateFilterModule,
  GridApi,
  LocaleModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  RowApiModule,
  RowSelectionModule,
  RowStyleModule,
  ScrollApiModule,
  TextFilterModule,
  ValidationModule,
  themeQuartz,
} from 'ag-grid-community';
import { AG_GRID_LOCALE_FR } from '@ag-grid-community/locale';
import {
  ArrowCounterClockwiseIcon,
  CalendarBlankIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  EraserIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api as gridApi } from '../../api';
import { Appointment } from '../../types';
import { formatEuro } from '../../utils/format';
import { ANONYMIZED_NAME } from '../../utils/privacy';

// Édition Community uniquement (licence MIT), et seulement les modules utiles (poids du fichier) :
// liste côté navigateur, état des colonnes (préférences), filtres texte / nombre / date, pagination,
// export CSV, lecture des lignes (nombre affiché, ligne par identifiant), sélection de ligne,
// classes de ligne et de cellule (type « rightAligned »), défilement vers une ligne, traduction ;
// validation des options en développement seulement (c'est elle qui signale un module manquant).
ModuleRegistry.registerModules([
  CellStyleModule,
  ColumnApiModule,
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  PaginationModule,
  CsvExportModule,
  RowApiModule,
  RowSelectionModule,
  RowStyleModule,
  ScrollApiModule,
  LocaleModule,
  ...(import.meta.env.DEV ? [ValidationModule] : []),
]);

const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/** Identifiant de la grille pour ses préférences enregistrées en base (`config.ui_state_<id>`). */
const GRID_ID = 'interventions';
const DEFAULT_PAGE_SIZE = 20;
/** Délai avant enregistrement : une seule écriture pour une rafale de réglages (redimensionnement…). */
const SAVE_DELAY_MS = 800;

/**
 * Préférences enregistrées : disposition des colonnes (ordre, largeur, visibilité, épinglage, tri)
 * et taille de page. Jamais les valeurs de filtre (elles peuvent contenir un nom de client).
 */
interface GridPreferences {
  columns: ColumnState[];
  pageSize: number;
}

/** Actions sur un rendez-vous : mêmes appels que l'ancienne liste du planning. */
export interface InterventionActions {
  onStatusChange: (id: number, status: string) => void;
  onReschedule: (appointment: Appointment) => void;
  onEmails: (appointment: Appointment) => void;
  onAnonymize: (appointment: Appointment) => void;
}

interface InterventionsGridProps extends InterventionActions {
  /** Rendez-vous déjà filtrés par la barre du planning (recherche, statut, période, jour). */
  appointments: Appointment[];
  /** Nombre total de rendez-vous, avant tout filtre (barre d'état). */
  totalCount: number;
  /** Actions générales placées en tête de la barre d'outils (nouveau rendez-vous, recherche…). */
  toolbarStart?: React.ReactNode;
  /** Rendez-vous ouvert depuis le calendrier : sélectionné, mis en évidence et amené à l'écran. */
  highlightedId: number | null;
}

/** Thème AG Grid aligné sur celui de l'application (variables CSS, cf. _theme.scss). */
const gridTheme = themeQuartz.withParams({
  accentColor: 'var(--color-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
  headerFontWeight: 700,
  headerBackgroundColor: 'var(--color-background)',
  borderRadius: 'var(--radius-sm)',
  wrapperBorderRadius: 'var(--radius)',
  rowHeight: 72,
});

const isOverdue = (a: Appointment) => {
  const start = parseISO(a.start_datetime);
  return isPast(start) && !isToday(start) && (a.status === 'confirmed' || a.status === 'pending');
};

const placeLabel = (a: Appointment) => [a.address, `${a.postal_code} ${a.city}`.trim()].filter(Boolean).join(', ');

/**
 * Statut, reprogrammation, emails, effacement : barre de la ligne sélectionnée ou cellule de ligne.
 * Sans rendez-vous (aucune sélection), les mêmes contrôles sont affichés désactivés : la barre garde
 * sa place et la grille ne bouge pas au clic.
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
        onClick={() => appointment && actions.onReschedule(appointment)}
        title="Déplacer ou reprogrammer la date/heure de l'intervention"
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

/**
 * Liste des interventions (Item 21) : AG Grid Community — tri et filtre par colonne, colonnes
 * redimensionnables et déplaçables, pagination, export CSV. Une ligne se sélectionne au clic : ses
 * actions s'affichent au-dessus de la grille ; une option les affiche aussi sur chaque ligne.
 * Le regroupement de lignes est réservé à l'édition Enterprise : remplacé par le tri et les filtres.
 */
const InterventionsGrid: React.FC<InterventionsGridProps> = ({
  appointments,
  totalCount,
  toolbarStart,
  highlightedId,
  ...actions
}) => {
  const apiRef = useRef<GridApi<Appointment> | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(highlightedId);
  // Lignes affichées après les filtres de colonnes de la grille (barre d'état)
  const [displayedCount, setDisplayedCount] = useState(appointments.length);
  // Colonne Actions visible : reflet de l'état de la grille (enregistré avec les autres colonnes)
  const [rowActions, setRowActions] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Pendant la restauration, les événements de colonnes ne doivent pas déclencher d'enregistrement
  const restoring = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  function syncRowActions(api: GridApi<Appointment>) {
    setRowActions(api.getColumnState().some((c) => c.colId === 'actions' && !c.hide));
  }

  /** Enregistre la disposition après une courte pause (après chaque modification de la grille). */
  function scheduleSave() {
    const api = apiRef.current;
    if (!api || restoring.current) return;
    syncRowActions(api);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        await apiSave(api);
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, SAVE_DELAY_MS);
  }

  function apiSave(api: GridApi<Appointment>) {
    return gridApi.saveUiState<GridPreferences>(GRID_ID, {
      columns: api.getColumnState(),
      pageSize: api.paginationGetPageSize(),
    });
  }

  /** Préférences enregistrées appliquées au chargement de la grille. */
  async function restore(api: GridApi<Appointment>) {
    try {
      const { state } = await gridApi.getUiState<GridPreferences>(GRID_ID);
      if (state?.columns?.length) api.applyColumnState({ state: state.columns, applyOrder: true });
      if (state?.pageSize) api.setGridOption('paginationPageSize', state.pageSize);
    } catch {
      // Préférences illisibles : réglages par défaut
    } finally {
      syncRowActions(api);
      restoring.current = false;
    }
  }

  async function resetPreferences() {
    const api = apiRef.current;
    if (!api) return;
    restoring.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    api.resetColumnState();
    api.setGridOption('paginationPageSize', DEFAULT_PAGE_SIZE);
    syncRowActions(api);
    restoring.current = false;
    try {
      await gridApi.resetUiState(GRID_ID);
      setSaveState('idle');
    } catch {
      setSaveState('error');
    }
  }

  // Toujours la version à jour (statut modifié…) ; disparaît si un filtre l'écarte
  const selected = appointments.find((a) => a.id === selectedId) ?? null;

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
      { field: 'service_name', headerName: 'Prestation', filter: 'agTextColumnFilter', minWidth: 160 },
      {
        colId: 'client',
        headerName: 'Client & lieu',
        // Tri sur le nom ; le filtre cherche dans le nom, le téléphone, l'adresse et la commune
        valueGetter: (p) => p.data?.client_name ?? '',
        filterValueGetter: (p) =>
          p.data ? [p.data.client_name, p.data.client_phone, placeLabel(p.data)].join(' ') : '',
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

  // Traduction française, message de liste vide adapté (base vide ou critères trop restrictifs)
  const isEmptyBase = totalCount === 0;
  const localeText = useMemo(
    () => ({
      ...AG_GRID_LOCALE_FR,
      noRowsToShow: isEmptyBase
        ? 'Aucun rendez-vous enregistré pour le moment.'
        : 'Aucun rendez-vous ne correspond aux critères.',
    }),
    [isEmptyBase]
  );

  const defaultColDef = useMemo<ColDef<Appointment>>(() => ({ sortable: true, resizable: true, flex: 1 }), []);

  // Rendez-vous ouvert depuis le calendrier : sélectionné et amené au milieu de la grille
  useEffect(() => {
    const api = apiRef.current;
    if (highlightedId !== null) setSelectedId(highlightedId);
    if (!api || highlightedId === null) return;
    const node = api.getRowNode(String(highlightedId));
    if (node) {
      node.setSelected(true, true);
      api.ensureNodeVisible(node, 'middle');
    }
  }, [highlightedId, appointments]);

  function clearSelection() {
    apiRef.current?.deselectAll();
    setSelectedId(null);
  }

  function exportCsv() {
    apiRef.current?.exportDataAsCsv({
      fileName: `interventions-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      columnSeparator: ';', // séparateur lu nativement par Excel en français
      columnKeys: [
        'date',
        'service_name',
        'client_name',
        'client_phone',
        'client_email',
        'address',
        'commune',
        'travel_fee',
        'status',
      ],
      processCellCallback: (p) => {
        const value = p.value as unknown;
        if (value instanceof Date) return format(value, 'dd/MM/yyyy HH:mm');
        if (p.column.getColId() === 'travel_fee') return String(value ?? '').replace('.', ',');
        return value == null ? '' : String(value);
      },
    });
  }

  return (
    <div className="interventions-grid">
      <div className="interventions-grid__toolbar">
        {toolbarStart && <div className="interventions-grid__start">{toolbarStart}</div>}
        <div className="interventions-grid__options">
          <label className="interventions-grid__toggle">
            <input
              type="checkbox"
              checked={rowActions}
              onChange={(e) => apiRef.current?.setColumnsVisible(['actions'], e.target.checked)}
            />
            Actions sur chaque ligne
          </label>
          <span className="interventions-grid__save" role="status">
            {saveState === 'saving' ? 'Enregistrement…' : saveState === 'saved' ? 'Disposition enregistrée' : saveState === 'error' ? 'Disposition non enregistrée' : ''}
          </span>
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={resetPreferences}>
            <ArrowCounterClockwiseIcon size={14} weight="bold" aria-hidden="true" />
            Réglages par défaut
          </button>
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={exportCsv}>
            <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
            Exporter (CSV)
          </button>
        </div>
      </div>

      {/* Barre d'actions de la ligne sélectionnée : toujours présente, à hauteur fixe */}
      <div
        className={selected ? 'interventions-grid__selection' : 'interventions-grid__selection interventions-grid__selection--empty'}
        role="region"
        aria-label="Rendez-vous sélectionné"
      >
        <span className="interventions-grid__selection-label">
          {selected ? (
            <>
              <strong>{selected.client_name}</strong> —{' '}
              {format(parseISO(selected.start_datetime), 'EEEE d MMMM yyyy, HH:mm', { locale: fr })}
            </>
          ) : (
            'Aucune intervention sélectionnée : cliquez sur une ligne.'
          )}
        </span>
        <AppointmentActions appointment={selected} actions={actions} />
        <button
          type="button"
          className="interventions-grid__deselect"
          onClick={clearSelection}
          disabled={!selected}
          aria-label="Désélectionner"
          title="Désélectionner"
        >
          <XIcon size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <AgGridReact<Appointment>
        theme={gridTheme}
        localeText={localeText}
        rowData={appointments}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(p) => String(p.data.id)}
        context={actions}
        rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
        onSelectionChanged={(e) => setSelectedId(e.api.getSelectedRows()[0]?.id ?? null)}
        rowClassRules={{
          'admin-row-overdue': (p) => (p.data ? isOverdue(p.data) : false),
          'admin-row--highlighted': (p) => p.data?.id === highlightedId,
        }}
        domLayout="autoHeight"
        pagination
        paginationPageSize={DEFAULT_PAGE_SIZE}
        paginationPageSizeSelector={[20, 50, 100]}
        onGridReady={(e) => {
          apiRef.current = e.api;
          restore(e.api);
        }}
        // Toute modification de la disposition est enregistrée en base
        onColumnMoved={(e) => e.finished && scheduleSave()}
        onColumnResized={(e) => e.finished && e.source === 'uiColumnResized' && scheduleSave()}
        onColumnVisible={scheduleSave}
        onColumnPinned={scheduleSave}
        onSortChanged={scheduleSave}
        onPaginationChanged={(e) => e.newPageSize && scheduleSave()}
        onModelUpdated={(e) => setDisplayedCount(e.api.getDisplayedRowCount())}
      />

      {/* Barre d'état, accolée à la grille : le composant natif (StatusBarModule) est réservé à
          l'édition Enterprise (vérifié dans les types d'AG Grid 36.2.0) */}
      <div className="interventions-grid__status" role="status">
        <span>
          <strong>{displayedCount}</strong> intervention{displayedCount > 1 ? 's' : ''} affichée
          {displayedCount > 1 ? 's' : ''}
          {displayedCount !== totalCount && <> sur {totalCount}</>}
        </span>
        {displayedCount !== appointments.length && (
          <span className="interventions-grid__status-note">filtres de colonnes actifs</span>
        )}
      </div>
    </div>
  );
};

export default InterventionsGrid;
