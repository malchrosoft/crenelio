import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DownloadSimpleIcon, XIcon } from '@phosphor-icons/react';
import { endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { api } from '../../api';
import { Appointment, Quote } from '../../types';
import { ANONYMIZED_NAME } from '../../utils/privacy';

interface BillingExportDialogProps {
  appointments: Appointment[];
  onClose: () => void;
}

/** CSV au format attendu par les tableurs français : séparateur « ; », décimales à virgule, BOM UTF-8. */
function downloadCsv(fileName: string, header: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    const text = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : value;
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = '﻿' + [header, ...rows].map((row) => row.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

const sqlDay = (sql: string) => sql.slice(0, 10);

/**
 * Exports pour la facturation (Item 22, volet B) : clients (import initial dans le logiciel de
 * l'artisan) et interventions terminées d'une période (montants du devis accepté, débours à part).
 * Colonnes génériques, à caler sur les imports des logiciels les plus utilisés avant de les figer.
 */
const BillingExportDialog: React.FC<BillingExportDialogProps> = ({ appointments, onClose }) => {
  const lastMonth = subMonths(new Date(), 1);
  const [start, setStart] = useState(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
  const [end, setEnd] = useState(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    api.listQuotes().then(setQuotes).catch(() => setQuotes([]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const known = appointments.filter((a) => a.client_name !== ANONYMIZED_NAME);
  const done = appointments.filter((a) => a.status === 'completed' && sqlDay(a.start_datetime) >= start && sqlDay(a.start_datetime) <= end);

  function exportClients() {
    // Un client par email (sinon par nom), coordonnées du rendez-vous le plus récent
    const byKey = new Map<string, Appointment>();
    for (const a of [...known].sort((x, y) => x.start_datetime.localeCompare(y.start_datetime))) {
      byKey.set((a.client_email || a.client_name).toLowerCase(), a);
    }
    downloadCsv(
      'clients.csv',
      ['Nom', 'Email', 'Téléphone', 'Adresse', 'Code postal', 'Ville'],
      [...byKey.values()].map((a) => [a.client_name, a.client_email, a.client_phone, a.address, a.postal_code, a.city])
    );
  }

  function exportInterventions() {
    downloadCsv(
      `interventions-${start}-${end}.csv`,
      ['Date', 'Client', 'Email', 'Adresse', 'Code postal', 'Ville', 'Prestation', 'Devis', 'Montant HT', 'TVA', 'Montant TTC', 'Débours (hors CA)'],
      done.map((a) => {
        const quote = quotes.find((q) => q.appointment_id === a.id && q.status === 'accepted');
        const mandate = quote ? Number(quote.debours_mandate) === 1 : false;
        const ttc = quote ? Number(quote.total_ttc) : Number(a.service_price ?? 0) + Number(a.travel_fee ?? 0);
        return [
          format(parseISO(a.start_datetime.replace(' ', 'T')), 'dd/MM/yyyy'),
          a.client_name,
          a.client_email,
          a.address,
          a.postal_code,
          a.city,
          a.service_name ?? '',
          quote?.number ?? '',
          quote ? Number(quote.total_ht) : ttc,
          quote ? Number(quote.total_vat) : 0,
          ttc,
          mandate ? Number(quote!.total_debours) : 0,
        ];
      })
    );
  }

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="billing-export-title" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="billing-export-title">
            Exports pour la facturation
          </h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="admin-modal__body">
          <p className="form-hint">
            Fichiers CSV (séparateur « ; ») à importer dans votre logiciel de facturation. Les débours sont à part : ils n'entrent pas dans
            votre chiffre d'affaires ; leur montant définitif est celui des justificatifs.
          </p>
          <h4>Clients</h4>
          <p>
            {new Set(known.map((a) => (a.client_email || a.client_name).toLowerCase())).size} clients (données effacées exclues).{' '}
            <button type="button" className="btn btn-secondary admin-btn-sm" onClick={exportClients}>
              <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
              Clients
            </button>
          </p>
          <h4>Interventions terminées</h4>
          <div className="billing-export__period">
            <label className="form-label" htmlFor="billing-start">
              Du
            </label>
            <input id="billing-start" type="date" className="form-input" value={start} onChange={(e) => setStart(e.target.value)} />
            <label className="form-label" htmlFor="billing-end">
              au
            </label>
            <input id="billing-end" type="date" className="form-input" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <p>
            {done.length} intervention{done.length > 1 ? 's' : ''} terminée{done.length > 1 ? 's' : ''}.{' '}
            <button type="button" className="btn btn-secondary admin-btn-sm" onClick={exportInterventions} disabled={!done.length}>
              <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
              Interventions
            </button>
          </p>
          <div className="admin-modal__actions">
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

export default BillingExportDialog;
