import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  CellStyleModule,
  ClientSideRowModelModule,
  ColDef,
  ColumnApiModule,
  ColumnState,
  CsvExportModule,
  CsvExportParams,
  DateFilterModule,
  GridApi,
  LocaleModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  RowApiModule,
  RowClassRules,
  RowDoubleClickedEvent,
  RowSelectionModule,
  RowStyleModule,
  ScrollApiModule,
  TextFilterModule,
  ValidationModule,
  themeQuartz,
} from 'ag-grid-community';
import { AG_GRID_LOCALE_FR } from '@ag-grid-community/locale';
import { ArrowCounterClockwiseIcon, DownloadSimpleIcon, XIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import { api as appApi } from '../../api';
import { useMediaQuery } from '../../utils/useMediaQuery';

// Édition Community uniquement (licence MIT), et seulement les modules utiles (poids du fichier) :
// liste côté navigateur, état des colonnes (préférences), filtres texte / nombre / date, pagination,
// export CSV, lecture des lignes, sélection, classes de ligne et de cellule (type « rightAligned »),
// défilement vers une ligne, traduction ; validation des options en développement seulement
// (c'est elle qui signale un module manquant, erreur AG Grid #200).
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

/** Thème AG Grid aligné sur celui de l'application (variables CSS, cf. _theme.scss). */
const gridTheme = themeQuartz.withParams({
  accentColor: 'var(--color-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
  headerFontWeight: 700,
  headerBackgroundColor: 'var(--color-background)',
  borderRadius: 'var(--radius-sm)',
  wrapperBorderRadius: 'var(--radius)',
});

/**
 * Hauteur pleine page (la grille remplit l'espace restant, la page ne défile plus) à partir d'un
 * écran de tablette assez haut ; en dessous, la grille prend la hauteur de ses lignes.
 */
const FILL_QUERY = '(min-width: 768px) and (min-height: 600px)';

const DEFAULT_PAGE_SIZE = 20;
/** Délai avant enregistrement : une seule écriture pour une rafale de réglages (redimensionnement…). */
const SAVE_DELAY_MS = 800;

/**
 * Préférences enregistrées en base (`config.ui_state_<gridId>`) : disposition des colonnes (ordre,
 * largeur, visibilité, épinglage, tri) et taille de page. Jamais les valeurs de filtre (elles
 * peuvent contenir un nom de client).
 */
interface GridPreferences {
  columns: ColumnState[];
  pageSize: number;
}

export interface DataGridProps<T> {
  /** Identifiant des préférences enregistrées (`[a-z0-9_]`). */
  gridId: string;
  rows: T[];
  columnDefs: ColDef<T>[];
  getRowId: (row: T) => string;
  /** Libellés singulier / pluriel pour le pied de grille (« intervention », « interventions »). */
  entityLabel: [string, string];
  /** Nombre total avant les filtres extérieurs à la grille (pied de grille « sur N »). */
  totalCount?: number;
  /** Actions générales en tête de barre d'outils (bouton d'ajout, recherche…). */
  toolbarStart?: React.ReactNode;
  /** Options supplémentaires à droite de la barre d'outils. */
  toolbarEnd?: React.ReactNode;
  /** Export CSV (bouton affiché si fourni). */
  csvExport?: CsvExportParams;
  /**
   * Barre d'actions de la ligne sélectionnée, toujours présente à hauteur fixe ; reçoit `null`
   * quand rien n'est sélectionné (afficher alors les contrôles désactivés).
   */
  renderSelection?: (selected: T | null) => React.ReactNode;
  /** Ligne sélectionnée de l'extérieur (ex. après une création). */
  selectedRowId?: string | null;
  onRowDoubleClicked?: (row: T) => void;
  rowClassRules?: RowClassRules<T>;
  rowHeight?: number;
  /** Données transmises aux rendus de cellule (`params.context`). */
  context?: unknown;
  emptyMessage: string;
  /** Appelé quand la colonne `colId` change de visibilité (ex. colonne d'actions optionnelle). */
  onColumnsChanged?: (api: GridApi<T>) => void;
}

/**
 * Liste de l'espace Pro sur AG Grid Community : thème, traduction, modules, préférences enregistrées
 * en base, sélection simple avec barre d'actions, export CSV, hauteur pleine page sur ordinateur et
 * tablette, et nombre de lignes affiché dans le pied de la grille (le module natif de barre d'état
 * est réservé à l'édition Enterprise : surcouche positionnée à gauche de la pagination).
 */
function DataGrid<T>({
  gridId,
  rows,
  columnDefs,
  getRowId,
  entityLabel,
  totalCount,
  toolbarStart,
  toolbarEnd,
  csvExport,
  renderSelection,
  selectedRowId = null,
  onRowDoubleClicked,
  rowClassRules,
  rowHeight,
  context,
  emptyMessage,
  onColumnsChanged,
}: DataGridProps<T>) {
  const gridRef = useRef<GridApi<T> | null>(null);
  const fill = useMediaQuery(FILL_QUERY);
  const [selectedId, setSelectedId] = useState<string | null>(selectedRowId);
  const [displayedCount, setDisplayedCount] = useState(rows.length);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Pendant la restauration et la réinitialisation, les événements de colonnes ne sont pas enregistrés
  const restoring = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  // Toujours la version à jour de la ligne ; disparaît si un filtre extérieur l'écarte
  const selected = selectedId === null ? null : rows.find((row) => getRowId(row) === selectedId) ?? null;

  // Sélection imposée de l'extérieur
  useEffect(() => {
    if (selectedRowId === null) return;
    setSelectedId(selectedRowId);
    const node = gridRef.current?.getRowNode(selectedRowId);
    if (node) {
      node.setSelected(true, true);
      gridRef.current?.ensureNodeVisible(node, 'middle');
    }
  }, [selectedRowId, rows]);

  const releaseLater = () =>
    setTimeout(() => {
      restoring.current = false;
    }, 0);

  function scheduleSave() {
    const grid = gridRef.current;
    if (!grid || restoring.current) return;
    onColumnsChanged?.(grid);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        await appApi.saveUiState<GridPreferences>(gridId, {
          columns: grid.getColumnState(),
          pageSize: grid.paginationGetPageSize(),
        });
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, SAVE_DELAY_MS);
  }

  async function restore(grid: GridApi<T>) {
    try {
      const { state } = await appApi.getUiState<GridPreferences>(gridId);
      if (state?.columns?.length) grid.applyColumnState({ state: state.columns, applyOrder: true });
      if (state?.pageSize) grid.setGridOption('paginationPageSize', state.pageSize);
    } catch {
      // Préférences illisibles : réglages par défaut
    } finally {
      onColumnsChanged?.(grid);
      releaseLater();
    }
  }

  async function resetPreferences() {
    const grid = gridRef.current;
    if (!grid) return;
    restoring.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    grid.resetColumnState();
    grid.setGridOption('paginationPageSize', DEFAULT_PAGE_SIZE);
    onColumnsChanged?.(grid);
    releaseLater();
    try {
      await appApi.resetUiState(gridId);
      setSaveState('idle');
    } catch {
      setSaveState('error');
    }
  }

  function clearSelection() {
    gridRef.current?.deselectAll();
    setSelectedId(null);
  }

  const isEmptyBase = (totalCount ?? rows.length) === 0;
  const localeText = useMemo(
    () => ({ ...AG_GRID_LOCALE_FR, noRowsToShow: isEmptyBase ? emptyMessage : 'Aucune ligne ne correspond aux critères.' }),
    [isEmptyBase, emptyMessage]
  );
  const defaultColDef = useMemo<ColDef<T>>(() => ({ sortable: true, resizable: true, flex: 1 }), []);
  const total = totalCount ?? rows.length;

  return (
    <div className={clsx('data-grid', { 'data-grid--fill': fill })}>
      <div className="data-grid__toolbar">
        {toolbarStart && <div className="data-grid__start">{toolbarStart}</div>}
        <div className="data-grid__options">
          {toolbarEnd}
          <span className="data-grid__save" role="status">
            {saveState === 'saving'
              ? 'Enregistrement…'
              : saveState === 'saved'
                ? 'Disposition enregistrée'
                : saveState === 'error'
                  ? 'Disposition non enregistrée'
                  : ''}
          </span>
          <button type="button" className="btn btn-secondary admin-btn-sm" onClick={resetPreferences}>
            <ArrowCounterClockwiseIcon size={14} weight="bold" aria-hidden="true" />
            Réglages par défaut
          </button>
          {csvExport && (
            <button
              type="button"
              className="btn btn-secondary admin-btn-sm"
              onClick={() => gridRef.current?.exportDataAsCsv(csvExport)}
            >
              <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
              Exporter (CSV)
            </button>
          )}
        </div>
      </div>

      {renderSelection && (
        <div
          className={clsx('data-grid__selection', { 'data-grid__selection--empty': !selected })}
          role="region"
          aria-label="Ligne sélectionnée"
        >
          {renderSelection(selected)}
          <button
            type="button"
            className="data-grid__deselect"
            onClick={clearSelection}
            disabled={!selected}
            aria-label="Désélectionner"
            title="Désélectionner"
          >
            <XIcon size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="data-grid__body">
        <AgGridReact<T>
          theme={rowHeight ? gridTheme.withParams({ rowHeight }) : gridTheme}
          localeText={localeText}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(p) => getRowId(p.data)}
          context={context}
          rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
          onSelectionChanged={(e) => {
            const row = e.api.getSelectedRows()[0];
            setSelectedId(row ? getRowId(row) : null);
          }}
          onRowDoubleClicked={(e: RowDoubleClickedEvent<T>) => e.data && onRowDoubleClicked?.(e.data)}
          rowClassRules={rowClassRules}
          domLayout={fill ? 'normal' : 'autoHeight'}
          pagination
          paginationPageSize={DEFAULT_PAGE_SIZE}
          paginationPageSizeSelector={[20, 50, 100]}
          onGridReady={(e) => {
            gridRef.current = e.api;
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

        {/* Nombre de lignes dans le pied de la grille, à gauche de la pagination (surcouche :
            le composant natif de barre d'état est réservé à l'édition Enterprise) */}
        <div className="data-grid__status" role="status">
          <strong>{displayedCount}</strong>&nbsp;{displayedCount > 1 ? entityLabel[1] : entityLabel[0]}
          {displayedCount !== total && <>&nbsp;sur {total}</>}
          {displayedCount !== rows.length && <span className="data-grid__status-note">filtres de colonnes actifs</span>}
        </div>
      </div>
    </div>
  );
}

export default DataGrid;
