import React, { useEffect, useMemo, useState } from 'react';
import type { CustomCellRendererProps } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { CopyIcon, FolderOpenIcon, PlusIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { AppConfig, Quote } from '../../types';
import DataGrid from './DataGrid';
import QuoteEditor from './QuoteEditor';
import { QUOTE_STATUS_LABELS, euro } from './quoteRules';

const toDate = (sql: string | null) => (sql ? parseISO(sql.replace(' ', 'T')) : null);

const StatusCell: React.FC<CustomCellRendererProps<Quote>> = ({ data }) =>
  data ? <span className={`status-badge quote-status--${data.status}`}>{QUOTE_STATUS_LABELS[data.status]}</span> : null;

interface QuotesGridProps {
  config: AppConfig;
  /** Devis à ouvrir à l'arrivée (ex. créé depuis la fenêtre d'un rendez-vous). */
  openId?: number | null;
  onOpened?: () => void;
}

/**
 * Devis (Item 22) en grille (écran « Devis » du menu Interventions) : création, ouverture dans
 * l'éditeur (lecture seule une fois envoyé), copie en nouveau brouillon après un refus ou une expiration.
 */
const QuotesGrid: React.FC<QuotesGridProps> = ({ config, openId, onOpened }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  // `null` : fermé ; 'new' : nouveau brouillon ; sinon devis complet (avec ses lignes)
  const [editing, setEditing] = useState<Quote | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listQuotes().then(setQuotes).catch(() => setError('Chargement impossible'));
  }, []);

  async function open(id: number) {
    setError(null);
    try {
      setEditing(await api.getQuote(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Devis introuvable');
    }
  }

  useEffect(() => {
    if (openId) {
      open(openId);
      onOpened?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  /** Copie en nouveau brouillon : un devis envoyé ne se modifie pas, il se remplace. */
  async function duplicate(source: Quote) {
    setError(null);
    try {
      const full = await api.getQuote(source.id);
      const copy = await api.createQuote({
        appointment_id: full.appointment_id,
        client_name: full.client_name,
        client_email: full.client_email,
        client_phone: full.client_phone,
        address: full.address,
        postal_code: full.postal_code,
        city: full.city,
        title: full.title,
        notes: full.notes,
        validity_days: full.validity_days,
        quote_price: full.quote_price === null ? null : Number(full.quote_price),
        urgent: Boolean(Number(full.urgent)),
        debours_budget: full.debours_budget === null ? null : Number(full.debours_budget),
        lines: full.lines ?? [],
      });
      upsert(copy);
      setEditing(copy);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Copie impossible');
    }
  }

  function upsert(quote: Quote) {
    setQuotes((prev) => (prev.some((q) => q.id === quote.id) ? prev.map((q) => (q.id === quote.id ? quote : q)) : [quote, ...prev]));
  }

  const columnDefs = useMemo<ColDef<Quote>[]>(
    () => [
      { field: 'number', headerName: 'N°', valueFormatter: (p) => p.value ?? 'Brouillon', width: 150, filter: 'agTextColumnFilter' },
      { field: 'client_name', headerName: 'Client', flex: 1, minWidth: 160, filter: 'agTextColumnFilter' },
      { field: 'title', headerName: 'Travaux', flex: 2, minWidth: 200, filter: 'agTextColumnFilter' },
      {
        colId: 'status',
        headerName: 'Statut',
        valueGetter: (p) => (p.data ? QUOTE_STATUS_LABELS[p.data.status] : ''),
        cellRenderer: StatusCell,
        filter: 'agTextColumnFilter',
        width: 130,
      },
      {
        colId: 'total',
        headerName: 'Total TTC',
        valueGetter: (p) => (p.data ? Number(p.data.total_ttc) : 0),
        valueFormatter: (p) => euro(p.value as number),
        cellDataType: 'number',
        type: 'rightAligned',
        width: 130,
      },
      {
        colId: 'debours',
        headerName: 'Débours (mandat)',
        valueGetter: (p) => (p.data ? Number(p.data.total_debours) : 0),
        valueFormatter: (p) => ((p.value as number) > 0 ? euro(p.value as number) : '—'),
        cellDataType: 'number',
        type: 'rightAligned',
        width: 140,
      },
      {
        colId: 'created',
        headerName: 'Créé le',
        valueGetter: (p) => (p.data ? toDate(p.data.created_at) : null),
        valueFormatter: (p) => (p.value ? format(p.value as Date, 'd MMM yyyy', { locale: fr }) : ''),
        cellDataType: 'date',
        filter: 'agDateColumnFilter',
        sort: 'desc',
        width: 140,
      },
      {
        colId: 'valid_until',
        headerName: "Valable jusqu'au",
        valueGetter: (p) => (p.data ? toDate(p.data.valid_until) : null),
        valueFormatter: (p) => (p.value ? format(p.value as Date, 'd MMM yyyy', { locale: fr }) : '—'),
        cellDataType: 'date',
        filter: 'agDateColumnFilter',
        width: 160,
      },
    ],
    []
  );

  return (
    <>
      {error && <p className="form-alert-error">{error}</p>}
      <DataGrid<Quote>
        gridId="quotes"
        rows={quotes}
        columnDefs={columnDefs}
        getRowId={(q) => String(q.id)}
        entityLabel={['devis', 'devis']}
        emptyMessage="Aucun devis : créez-en un ici ou depuis la fenêtre d'un rendez-vous."
        onRowDoubleClicked={(q) => open(q.id)}
        csvExport={{ fileName: 'devis.csv' }}
        actions={(selected) => (
          <>
            <button type="button" className="btn btn-primary admin-btn-sm" onClick={() => setEditing('new')} title="Nouveau devis">
              <PlusIcon size={16} weight="bold" aria-hidden="true" />
              Nouveau
            </button>
            {selected && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                  onClick={() => open(selected.id)}
                  title={selected.status === 'draft' ? 'Modifier le brouillon' : 'Consulter le devis'}
                  aria-label="Ouvrir"
                >
                  <FolderOpenIcon size={16} weight="bold" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                  onClick={() => duplicate(selected)}
                  title="Copier en nouveau brouillon"
                  aria-label="Copier"
                >
                  <CopyIcon size={16} weight="bold" aria-hidden="true" />
                </button>
              </>
            )}
          </>
        )}
        filters={<p className="data-grid__hint">Un devis envoyé n'est plus modifiable : copiez-le pour le corriger.</p>}
      />

      {editing && (
        <QuoteEditor
          key={editing === 'new' ? 'new' : editing.id}
          quote={editing === 'new' ? null : editing}
          config={config}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            upsert(saved);
            setEditing(saved);
          }}
          onDeleted={(id) => {
            setQuotes((prev) => prev.filter((q) => q.id !== id));
            setEditing(null);
          }}
        />
      )}
    </>
  );
};

export default QuotesGrid;
