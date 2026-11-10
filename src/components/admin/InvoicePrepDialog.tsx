import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, CopyIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { AppConfig, Appointment, Quote, QuoteLine } from '../../types';
import { EXACT_TIME_COUNTING, billedHours, countingConfig, euro, lineAmount } from './quoteRules';
import { legalIdentity } from '../../utils/legalIdentity';

interface InvoicePrepDialogProps {
  appointment: Appointment;
  config: AppConfig;
  onClose: () => void;
}

/** Ligne de facture préparée ; un débours porte le montant exact du justificatif et sa référence. */
interface PrepLine {
  label: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  debours: boolean;
  estimate: number;
  reference: string;
  /** Main-d'œuvre au temps : heures estimées au devis, à remplacer par le temps réellement passé. */
  hours?: number;
}

const num = (value: number) => value.toFixed(2).replace('.', ',');
const day = (sql: string) => format(parseISO(sql.replace(' ', 'T')), 'dd/MM/yyyy', { locale: fr });

function fromQuote(lines: QuoteLine[]): PrepLine[] {
  return lines.map((line) => ({
    label: line.label,
    quantity: Number(line.quantity),
    unit: line.unit,
    unitPrice: Number(line.unit_price),
    vatRate: Number(line.vat_rate),
    debours: line.kind === 'debours',
    estimate: lineAmount(line),
    reference: '',
    hours: line.kind === 'labour' && line.unit === 'h' ? Number(line.quantity) : undefined,
  }));
}

function fromAppointment(a: Appointment): PrepLine[] {
  const lines: PrepLine[] = [
    { label: a.service_name ?? 'Prestation', quantity: 1, unit: 'forfait', unitPrice: Number(a.service_price ?? 0), vatRate: 0, debours: false, estimate: 0, reference: '' },
  ];
  if (Number(a.travel_fee) > 0) {
    lines.push({ label: 'Frais de déplacement', quantity: 1, unit: 'forfait', unitPrice: Number(a.travel_fee), vatRate: 0, debours: false, estimate: 0, reference: '' });
  }
  return lines;
}

/**
 * Fiche « Préparer la facture » (Item 22, volet B) : la facture est établie dans l'outil de l'artisan ;
 * Crénelio prépare chaque valeur à copier (une à une ou « Tout copier »), à partir du devis accepté du
 * rendez-vous, sinon de la prestation et du déplacement. Débours : montant exact du justificatif, ligne
 * distincte, hors chiffre d'affaires (docs/legal/fr/debours.md, note-facture.md).
 */
const InvoicePrepDialog: React.FC<InvoicePrepDialogProps> = ({ appointment, config, onClose }) => {
  const [quote, setQuote] = useState<Quote | null | undefined>(undefined);
  const [lines, setLines] = useState<PrepLine[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Devis accepté le plus récent du rendez-vous (le plus récent d'abord dans la liste)
  useEffect(() => {
    api
      .listQuotes()
      .then(async (quotes) => {
        const accepted = quotes.find((q) => q.appointment_id === appointment.id && q.status === 'accepted');
        const full = accepted ? await api.getQuote(accepted.id) : null;
        setQuote(full);
        setLines(full ? fromQuote(full.lines ?? []) : fromAppointment(appointment));
      })
      .catch(() => {
        setQuote(null);
        setLines(fromAppointment(appointment));
      });
  }, [appointment]);

  const vat = quote?.vat_mode === 'vat';
  // Débours repris seulement si le mandat a été donné (sinon le client a fourni les pièces)
  const mandate = quote ? Number(quote.debours_mandate) === 1 : false;
  const shown = lines.filter((line) => !line.debours || mandate);
  const services = shown.filter((line) => !line.debours);
  const debours = shown.filter((line) => line.debours);
  const totals = useMemo(() => {
    const ht = services.reduce((sum, l) => sum + Math.round(l.quantity * l.unitPrice * 100) / 100, 0);
    const tva = vat ? services.reduce((sum, l) => sum + Math.round(l.quantity * l.unitPrice * l.vatRate) / 100, 0) : 0;
    const deb = debours.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    return { ht, tva, ttc: ht + tva, debours: deb, total: ht + tva + deb };
  }, [services, debours, vat]);
  const budget = quote?.debours_budget ? Number(quote.debours_budget) : null;

  const a = appointment;
  const clientAddress = [a.address, `${a.postal_code} ${a.city}`.trim()].filter(Boolean).join(', ');
  const fields: [string, string][] = [
    ['Client', a.client_name],
    // CGI, annexe II, art. 242 nonies A, 1° : client professionnel
    ...(quote?.client_company ? ([['Entreprise cliente', quote.client_company]] as [string, string][]) : []),
    ...(quote?.client_siren ? ([['SIREN/SIRET du client', quote.client_siren]] as [string, string][]) : []),
    ['Adresse du client', clientAddress],
    ['Email', a.client_email],
    ['Date et lieu de la prestation', `${day(a.start_datetime)}, ${clientAddress}`],
    // CGI, annexe II, art. 242 nonies A, 8° bis : nature des opérations facturées
    [
      'Nature des opérations',
      quote?.lines?.some((line) => line.kind === 'supply')
        ? 'Prestations de services et livraisons de biens'
        : 'Exclusivement des prestations de services',
    ],
    ...(quote ? ([['Référence du devis', `Devis ${quote.number} accepté le ${day(quote.decided_at ?? quote.created_at)}`]] as [string, string][]) : []),
  ];

  const lineText = (l: PrepLine) =>
    l.debours
      ? `Débours (au nom et pour le compte du client) : ${l.label}${l.reference ? `, justificatif ${l.reference}` : ''} — ${num(l.unitPrice * l.quantity)} €`
      : `${l.label} — ${String(l.quantity).replace('.', ',')} ${l.unit} × ${num(l.unitPrice)} €${vat ? ` HT, TVA ${String(l.vatRate).replace('.', ',')} %` : ''} = ${num(Math.round(l.quantity * l.unitPrice * 100) / 100)} €`;

  const allText = [
    ...fields.map(([label, value]) => `${label} : ${value}`),
    '',
    ...services.map(lineText),
    vat ? `Total HT : ${num(totals.ht)} € · TVA : ${num(totals.tva)} € · Total TTC : ${num(totals.ttc)} €` : `Total : ${num(totals.ttc)} € — ${config.quote_vat_exemption || 'TVA non applicable, article 293 B du CGI'}`,
    ...(debours.length ? ['', ...debours.map(lineText), `Total débours : ${num(totals.debours)} €`, `Net à payer : ${num(totals.total)} €`] : []),
  ].join('\n');

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((current) => (current === id ? null : current)), 1500);
  }

  const CopyButton: React.FC<{ id: string; text: string }> = ({ id, text }) => (
    <button
      type="button"
      className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
      onClick={() => copy(id, text)}
      title="Copier"
      aria-label="Copier"
    >
      {copied === id ? <CheckIcon size={14} weight="bold" aria-hidden="true" /> : <CopyIcon size={14} weight="bold" aria-hidden="true" />}
    </button>
  );

  const setLine = (index: number, patch: Partial<PrepLine>) => setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="invoice-prep-title" onClick={onClose}>
      <div className="admin-modal admin-modal--xwide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="invoice-prep-title">
            Préparer la facture — {a.client_name}
          </h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="admin-modal__body invoice-prep">
          {quote === undefined ? (
            <p>Chargement…</p>
          ) : (
            <>
              <p className="form-hint">
                Établissez la facture dans votre logiciel : copiez chaque valeur ou l'ensemble. Source :{' '}
                {quote
                  ? `devis ${quote.number} accepté`
                  : 'prestation et déplacement du rendez-vous, aux prix affichés au client (aucun devis accepté)'}
                .
              </p>

              <dl className="invoice-prep__fields">
                <dt>Émetteur</dt>
                <dd>
                  {config.company_name} — {legalIdentity(config)}
                  {config.legal_siret ? ` — SIRET ${config.legal_siret}` : ''}
                  {config.legal_vat_number ? ` — N° TVA ${config.legal_vat_number}` : ''}
                </dd>
                {fields.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt>{label}</dt>
                    <dd>
                      <span>{value || '—'}</span>
                      {value && <CopyButton id={label} text={value} />}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>

              <h4>Prestations</h4>
              <ul className="invoice-prep__lines">
                {lines.map((line, index) =>
                  line.debours ? null : (
                    <li key={`s-${index}`} className={line.hours !== undefined ? 'invoice-prep__timed' : undefined}>
                      <span>{lineText(line)}</span>
                      {line.hours !== undefined && (
                        // Temps réellement passé (« 1h20 », « 80 min » ou heures), arrondi selon le décompte réglé
                        <input
                          className="form-input"
                          inputMode="decimal"
                          aria-label={`Temps réellement passé : ${line.label}`}
                          title="Temps réellement passé : 1h20, 80 min ou heures (1,5)"
                          defaultValue={String(line.quantity).replace('.', ',')}
                          onBlur={(e) => {
                            const hours = billedHours(e.target.value, countingConfig(config, quote?.time_counting ?? null), quote?.time_counting !== EXACT_TIME_COUNTING);
                            if (hours !== null && hours > 0) setLine(index, { quantity: hours });
                            e.target.value = String(hours ?? line.quantity).replace('.', ',');
                          }}
                        />
                      )}
                      <CopyButton id={`s-${index}`} text={lineText(line)} />
                    </li>
                  ),
                )}
              </ul>
              {lines.some((line) => line.hours !== undefined && line.quantity > line.hours) && (
                <p className="form-hint">
                  <WarningIcon size={14} weight="fill" aria-hidden="true" /> Temps passé supérieur au temps estimé sur le devis accepté.
                </p>
              )}
              <p className="invoice-prep__total">
                {vat ? `Total HT ${euro(totals.ht)} · TVA ${euro(totals.tva)} · ` : ''}Total TTC {euro(totals.ttc)}
                {!vat && <span className="form-hint"> — {config.quote_vat_exemption || 'TVA non applicable, article 293 B du CGI'}</span>}
              </p>

              {debours.length > 0 && (
                <>
                  <h4>Débours (ligne distincte, hors chiffre d'affaires)</h4>
                  <p className="form-hint">Saisissez le montant exact de chaque justificatif (ticket ou facture au nom du client).</p>
                  <ul className="invoice-prep__lines">
                    {lines.map((line, index) =>
                      line.debours ? (
                        <li key={`d-${index}`} className="invoice-prep__debours">
                          <span className="invoice-prep__debours-label">
                            {line.label} <small>(estimé {euro(line.estimate)})</small>
                          </span>
                          <input
                            className="form-input"
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`Montant exact : ${line.label}`}
                            value={line.unitPrice * line.quantity}
                            onChange={(e) => setLine(index, { unitPrice: Number(e.target.value), quantity: 1 })}
                          />
                          <input
                            className="form-input"
                            placeholder="Réf. justificatif"
                            aria-label={`Référence du justificatif : ${line.label}`}
                            value={line.reference}
                            onChange={(e) => setLine(index, { reference: e.target.value })}
                          />
                          <CopyButton id={`d-${index}`} text={lineText(line)} />
                        </li>
                      ) : null
                    )}
                  </ul>
                  <p className="invoice-prep__total">
                    Total débours {euro(totals.debours)} · Net à payer {euro(totals.total)}
                  </p>
                  {budget !== null && totals.debours > budget && (
                    <p className="form-alert-error">
                      <WarningIcon size={16} weight="fill" aria-hidden="true" /> Débours au-delà du budget du mandat ({euro(budget)}) : un
                      nouvel accord du client est nécessaire.
                    </p>
                  )}
                </>
              )}
              {quote && quote.debours_mandate !== null && !mandate && (
                <p className="form-hint">Mandat de débours refusé : le client a fourni lui-même les pièces, rien à refacturer.</p>
              )}

              <aside className="quote-reminder" aria-label="Rappels de facturation">
                <p className="quote-reminder__title">
                  <WarningIcon size={16} weight="fill" aria-hidden="true" />
                  Facture : à respecter
                </p>
                <ul>
                  <li>Note (facture) obligatoire dès 25 € TTC, remise dès la prestation rendue et avant tout paiement ; double conservé deux ans.</li>
                  <li>Identité légale « {legalIdentity(config)} », SIRET, date d'émission, numéro unique et chronologique de votre logiciel.</li>
                  <li>Client professionnel : son nom complet, son adresse et son numéro d'identification (SIREN) ; nature des opérations (CGI, annexe II, art. 242 nonies A).</li>
                  <li>Débours : ligne distincte, montant exact, copie du justificatif remise au client ; « débours » dans votre livre des recettes, hors chiffre d'affaires.</li>
                  <li>Conservez les originaux des tickets et factures des pièces avancées.</li>
                  <li>
                    Devis signé au domicile du client (contrat hors établissement) : aucun paiement ni acompte avant sept jours après la
                    signature, sauf travaux d'entretien ou de réparation urgents (C. consom. L221-10).
                  </li>
                </ul>
                <p className="quote-reminder__docs">
                  En savoir plus :{' '}
                  <a href="/admin?doc=fr%2Fnote-facture.md" target="_blank" rel="noopener">
                    note et facture
                  </a>{' '}
                  ·{' '}
                  <a href="/admin?doc=fr%2Fdebours.md" target="_blank" rel="noopener">
                    débours
                  </a>
                </p>
              </aside>

              <div className="admin-modal__actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Fermer
                </button>
                <button type="button" className="btn btn-primary" onClick={() => copy('all', allText)}>
                  {copied === 'all' ? <CheckIcon size={16} weight="bold" aria-hidden="true" /> : <CopyIcon size={16} weight="bold" aria-hidden="true" />}
                  Tout copier
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InvoicePrepDialog;
