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
import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon, DownloadSimpleIcon, FunnelIcon, GearSixIcon, XIcon } from '@phosphor-icons/react';
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
  // Partagée avec le pied de grille simulé (défilement continu)
  borderColor: 'var(--data-grid-border)',
});

/**
 * Hauteur pleine page (la grille remplit l'espace restant, la page ne défile plus) à partir d'un
 * écran de tablette assez haut ; en dessous, la grille prend la hauteur de ses lignes. Même seuil
 * que `$data-grid-fill` (SCSS), repris par le calendrier.
 */
export const FILL_QUERY = '(min-width: 768px) and (min-height: 600px)';

const DEFAULT_PAGE_SIZE = 20;
/** Délai avant enregistrement : une seule écriture pour une rafale de réglages (redimensionnement…). */
const SAVE_DELAY_MS = 800;

/**
 * Préférences enregistrées en base (`config.ui_state_<gridId>`) : disposition des colonnes (ordre,
 * largeur, visibilité, épinglage, tri), mode de défilement et taille de page. Jamais les valeurs de filtre (elles
 * peuvent contenir un nom de client).
 */
interface GridPreferences {
  columns: ColumnState[];
  pageSize: number;
  /** Pagination plutôt que défilement continu (absent : défilement continu). */
  paged?: boolean;
  /** Filtres rapides affichés dans la barre plutôt que rangés dans le menu « entonnoir ». */
  filtersInline?: boolean;
}

/** Filtre rapide appliqué (étiquette à côté du menu « entonnoir »). */
export interface ActiveFilter {
  id: string;
  label: string;
  onClear: () => void;
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
  /**
   * Actions, en tête de barre et dans l'ordre CRUD : création, puis seulement les actions utiles à
   * la ligne sélectionnée (`null` : aucune). Boutons `.btn admin-btn-sm`, icône seule
   * (`data-grid__icon-btn`, avec `title` et `aria-label`) sauf l'action principale.
   */
  actions?: (selected: T | null) => React.ReactNode;
  /** Recherche (toujours dans la barre), après les actions. */
  filters?: React.ReactNode;
  /**
   * Filtres rapides (`ToggleGroup`…) : dans un menu « entonnoir » (par défaut) ou dans la barre selon
   * le réglage de la grille. `activeFilters` : filtres appliqués, affichés en étiquettes à côté de
   * l'entonnoir (retrait d'un clic) et comptés sur son bouton.
   */
  quickFilters?: React.ReactNode;
  activeFilters?: ActiveFilter[];
  /** Réglages propres à la grille, ajoutés au menu « roue dentée » (`GridSettingToggle`). */
  settings?: React.ReactNode;
  /**
   * Actualisation des données (bouton à côté des filtres) : recharge rendez-vous, calendrier, indisponibilités
   * et devis ; `refreshing` pendant le rechargement.
   */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Export CSV (bouton affiché si fourni). */
  csvExport?: CsvExportParams;
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
 * Liste de l'espace Artisan sur AG Grid Community : thème, traduction, modules, préférences enregistrées
 * en base, barre d'outils (actions contextuelles à la sélection, filtres, export, menu de réglages),
 * export CSV, hauteur pleine page sur ordinateur et
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
  actions,
  filters,
  quickFilters,
  activeFilters = [],
  settings,
  onRefresh,
  refreshing = false,
  csvExport,
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
  // Défilement continu par défaut : le modèle client n'affiche que les lignes visibles. Sans pleine
  // hauteur (mobile), la grille prend la hauteur de ses lignes : pagination imposée.
  const [pagedChoice, setPagedChoice] = useState(false);
  const paged = pagedChoice || !fill;
  // Filtres rapides dans le menu par défaut : la barre reste sur une ligne
  const [filtersInline, setFiltersInline] = useState(false);
  // Valeurs lues par l'enregistrement différé (jamais celles d'un rendu antérieur)
  const pagedRef = useRef(pagedChoice);
  pagedRef.current = pagedChoice;
  const filtersInlineRef = useRef(filtersInline);
  filtersInlineRef.current = filtersInline;
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
          paged: pagedRef.current,
          filtersInline: filtersInlineRef.current,
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
      setPagedChoice(state?.paged === true);
      setFiltersInline(state?.filtersInline === true);
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
    setPagedChoice(false);
    setFiltersInline(false);
    onColumnsChanged?.(grid);
    releaseLater();
    try {
      await appApi.resetUiState(gridId);
      setSaveState('idle');
    } catch {
      setSaveState('error');
    }
  }

  function togglePaged(value: boolean) {
    setPagedChoice(value);
    pagedRef.current = value;
    scheduleSave();
  }

  function toggleFiltersInline(value: boolean) {
    setFiltersInline(value);
    filtersInlineRef.current = value;
    scheduleSave();
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
  // Texte complet des indications, tronquées en mode paginé
  const statusTitle = [
    `${displayedCount} ${displayedCount > 1 ? entityLabel[1] : entityLabel[0]}${displayedCount !== total ? ` sur ${total}` : ''}`,
    displayedCount !== rows.length && 'filtres de colonnes actifs',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={clsx('data-grid', { 'data-grid--fill': fill, 'data-grid--paged': paged })}>
      <div className="data-grid__toolbar">
        {actions && (
          <div className="data-grid__actions" role="group" aria-label="Actions">
            {actions(selected)}
            {selected && (
              <button
                type="button"
                className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                onClick={clearSelection}
                title="Désélectionner"
                aria-label="Désélectionner"
              >
                <XIcon size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        {(filters || quickFilters) && (
          <div className="data-grid__filters">
            {filters}
            {quickFilters && filtersInline && quickFilters}
            {quickFilters && !filtersInline && (
              <div className="data-grid__quick-filters">
                <ToolbarMenu
                  icon={<FunnelIcon size={16} weight="fill" aria-hidden="true" />}
                  label="Filtres rapides"
                  badge={activeFilters.length}
                  panelClassName="data-grid__menu-panel--filters"
                  keepOpen
                >
                  {quickFilters}
                </ToolbarMenu>
                {/* Sélections courantes, visibles sans ouvrir le menu */}
                {activeFilters.map((filter) => (
                  <span key={filter.id} className="data-grid__chip">
                    {filter.label}
                    <button
                      type="button"
                      className="data-grid__chip-clear"
                      onClick={filter.onClear}
                      title={`Retirer le filtre « ${filter.label} »`}
                      aria-label={`Retirer le filtre « ${filter.label} »`}
                    >
                      <XIcon size={12} weight="bold" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="data-grid__tools">
          {onRefresh && (
            <button
              type="button"
              className={`btn btn-secondary admin-btn-sm data-grid__icon-btn${refreshing ? ' data-grid__refresh--busy' : ''}`}
              onClick={onRefresh}
              disabled={refreshing}
              title="Actualiser : recharger les données (aussi automatique au retour sur l'onglet et toutes les 5 minutes)"
              aria-label="Actualiser"
            >
              <ArrowClockwiseIcon size={16} weight="bold" aria-hidden="true" />
            </button>
          )}
          {csvExport && (
            <button
              type="button"
              className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
              onClick={() => gridRef.current?.exportDataAsCsv(csvExport)}
              title="Exporter les lignes affichées (CSV, lisible par Excel)"
              aria-label="Exporter (CSV)"
            >
              <DownloadSimpleIcon size={16} weight="bold" aria-hidden="true" />
            </button>
          )}
          <ToolbarMenu icon={<GearSixIcon size={16} weight="fill" aria-hidden="true" />} label="Réglages de la grille">
            {fill && (
              <GridSettingToggle
                label="Pagination"
                hint="Sinon, défilement continu de toutes les lignes"
                checked={pagedChoice}
                onChange={togglePaged}
              />
            )}
            {quickFilters && (
              <GridSettingToggle
                label="Filtres rapides dans la barre"
                hint="Sinon, rangés sous le bouton « entonnoir », les sélections en cours restant affichées à côté"
                checked={filtersInline}
                onChange={toggleFiltersInline}
              />
            )}
            {settings}
            <button type="button" role="menuitem" className="data-grid__menu-item" onClick={resetPreferences}>
              <ArrowCounterClockwiseIcon size={16} weight="bold" aria-hidden="true" />
              Réglages par défaut
            </button>
          </ToolbarMenu>
        </div>
      </div>

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
          pagination={paged}
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
        <div className="data-grid__status" role="status" title={statusTitle}>
          <span>
            <strong>{displayedCount}</strong> {displayedCount > 1 ? entityLabel[1] : entityLabel[0]}
            {displayedCount !== total && <> sur {total}</>}
          </span>
          {displayedCount !== rows.length && <span className="data-grid__status-note">filtres de colonnes actifs</span>}
          <span className="data-grid__save" role="status">
            {saveState === 'saving'
              ? 'Enregistrement…'
              : saveState === 'saved'
                ? 'Disposition enregistrée'
                : saveState === 'error'
                  ? 'Disposition non enregistrée'
                  : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Menu déroulant de la barre d'outils (réglages, filtres rapides) ; se ferme au clic extérieur et
 * sur Échap, et au choix d'un bouton sauf `keepOpen` (filtres : plusieurs choix d'affilée).
 */
const ToolbarMenu: React.FC<{
  icon: React.ReactNode;
  label: string;
  /** Pastille sur le bouton (ex. nombre de filtres actifs), masquée à 0. */
  badge?: number;
  panelClassName?: string;
  keepOpen?: boolean;
  children: React.ReactNode;
}> = ({ icon, label, badge = 0, panelClassName, keepOpen = false, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="data-grid__menu" ref={ref}>
      <button
        type="button"
        className={clsx('btn btn-secondary admin-btn-sm data-grid__icon-btn', { 'data-grid__icon-btn--active': badge > 0 })}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title={badge > 0 ? `${label} (${badge} actif${badge > 1 ? 's' : ''})` : label}
        aria-label={label}
      >
        {icon}
        {badge > 0 && <span className="data-grid__badge">{badge}</span>}
      </button>
      {open && (
        <div
          className={clsx('data-grid__menu-panel', panelClassName)}
          role="menu"
          aria-label={label}
          onClick={(e) => !keepOpen && (e.target as HTMLElement).closest('button') && setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/** Réglage à bascule du menu de la grille. */
export const GridSettingToggle: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, hint, checked, onChange }) => (
  <label className="data-grid__menu-item" role="menuitemcheckbox" aria-checked={checked} title={hint}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

export default DataGrid;
