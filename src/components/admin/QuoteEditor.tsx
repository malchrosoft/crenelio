import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowSquareOutIcon, DownloadSimpleIcon, PaperPlaneTiltIcon, PlusIcon, PrinterIcon, TrashIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { AppConfig, Quote, QuoteLine, QuoteLineKind, QuoteNotification, QuotePayload, Service } from '../../types';
import ConfirmDialog from './ConfirmDialog';
import FieldHelp from './FieldHelp';
import { FieldHelpKey } from '../../config/fieldHelp';
import {
  DEFAULT_EXECUTION_DAYS,
  DEFAULT_LINE_LABELS,
  EXACT_TIME_COUNTING,
  LINE_KIND_LABELS,
  PART_UNITS,
  PAYMENT_TERMS_OPTIONS,
  QUOTE_STATUS_LABELS,
  billedHours,
  countingConfig,
  duplicateGroups,
  euro,
  evaluate,
  executionDateText,
  executionDelayText,
  fixedUnit,
  isHourly,
  lineAmount,
  newLine,
  parseExecution,
  quoteTotals,
  supplyVatCheck,
  timeCountingOptions,
  timeCountingText,
  vatRates,
} from './quoteRules';

interface QuoteEditorProps {
  /** Devis existant ; `null` : nouveau brouillon (créé au premier enregistrement). */
  quote: Quote | null;
  config: AppConfig;
  onClose: () => void;
  onSaved: (quote: Quote) => void;
  onDeleted: (id: number) => void;
}

const EMPTY: QuotePayload = {
  client_name: '',
  client_email: '',
  client_phone: '',
  client_company: null,
  client_siren: null,
  address: '',
  postal_code: '',
  city: '',
  title: '',
  notes: null,
  validity_days: 30,
  quote_price: null,
  urgent: false,
  builder_works: false,
  debours_budget: null,
  execution_terms: null,
  payment_terms: null,
  time_counting: null,
  lines: [],
};

function toPayload(quote: Quote): QuotePayload {
  return {
    appointment_id: quote.appointment_id,
    client_name: quote.client_name,
    client_email: quote.client_email,
    client_phone: quote.client_phone,
    client_company: quote.client_company,
    client_siren: quote.client_siren,
    address: quote.address,
    postal_code: quote.postal_code,
    city: quote.city,
    title: quote.title,
    notes: quote.notes,
    validity_days: quote.validity_days,
    quote_price: quote.quote_price === null ? null : Number(quote.quote_price),
    urgent: Boolean(Number(quote.urgent)),
    builder_works: Boolean(Number(quote.builder_works)),
    debours_budget: quote.debours_budget === null ? null : Number(quote.debours_budget),
    execution_terms: quote.execution_terms,
    payment_terms: quote.payment_terms,
    time_counting: quote.time_counting,
    lines: (quote.lines ?? []).map((line) => ({ ...line })),
  };
}

const sqlDate = (value: string | null) => (value ? format(parseISO(value.replace(' ', 'T')), 'd MMMM yyyy', { locale: fr }) : '—');

/**
 * Éditeur d'un devis (Item 22) : client, nature des travaux, lignes typées, totaux, conditions.
 * Un devis envoyé n'est plus modifiable : il s'affiche en lecture, avec la réponse du client.
 * Cadre légal et rappels : docs/legal/ (devis, débours, rétractation, achat-revente).
 */
const QuoteEditor: React.FC<QuoteEditorProps> = ({ quote, config, onClose, onSaved, onDeleted }) => {
  const vatMode: 'franchise' | 'vat' = quote?.vat_mode ?? (config.quote_vat_mode === 'vat' ? 'vat' : 'franchise');
  const [form, setForm] = useState<QuotePayload>(() =>
    quote
      ? toPayload(quote)
      : {
          ...EMPTY,
          validity_days: Number(config.quote_validity_days || 30),
          payment_terms: config.quote_payment_terms || null,
          // Hors urgence : après le délai de rétractation (cf. DEFAULT_EXECUTION_DAYS)
          execution_terms: executionDateText(addDays(new Date(), DEFAULT_EXECUTION_DAYS)),
          time_counting: timeCountingText(config) || null,
          quote_price: Number(config.quote_default_price || 0) > 0 ? Number(config.quote_default_price) : null,
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'send' | 'delete' | null>(null);

  const locked = quote !== null && quote.status !== 'draft';
  const allowSupply = config.quote_allow_supply === '1';
  const rates = vatRates(config);
  const totals = useMemo(() => quoteTotals(form.lines, vatMode), [form.lines, vatMode]);
  const supplyVat = useMemo(() => supplyVatCheck(form.lines, vatMode), [form.lines, vatMode]);
  const hasDebours = form.lines.some((line) => line.kind === 'debours');
  // Choix propres au devis : main-d'œuvre facturée ou non (ex. : déplacement et courte investigation),
  // temps arrondi selon le décompte réglé ou exact (le décompte imprimé suit le choix)
  const [labour, setLabour] = useState(() => (quote ? form.lines.some((line) => line.kind === 'labour') : true));
  const [rounded, setRounded] = useState(form.time_counting !== EXACT_TIME_COUNTING);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !confirm && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, confirm]);

  const set = <K extends keyof QuotePayload>(key: K, value: QuotePayload[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const setLine = (index: number, patch: Partial<QuoteLine>) =>
    set(
      'lines',
      form.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  const addLine = (kind: QuoteLineKind) => set('lines', [...form.lines, newLine(kind, config, vatMode)]);
  /** Diagnostic, recherche de panne : main-d'œuvre au temps passé, minimum facturé compris. */
  const addDiagnostic = () =>
    set('lines', [
      ...form.lines,
      { ...newLine('labour', config, vatMode), label: 'Diagnostic et recherche de panne', quantity: billedHours('0h1', countingConfig(config, form.time_counting), rounded) ?? 1 },
    ]);
  // Catalogue : désignation et prix d'un forfait ; prestation de référence pour le déplacement
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    api.listServices().then(setServices).catch(() => setServices([]));
  }, []);
  const serviceNamed = (label: string) => services.find((s) => s.name.trim().toLowerCase() === label.trim().toLowerCase());

  /** Déplacement prérempli : frais de la prestation du devis (catalogue) pour l'adresse d'intervention. */
  async function addTravel() {
    const line = newLine('travel', config, vatMode);
    const service = form.lines.map((l) => (l.kind === 'service' ? serviceNamed(l.label) : undefined)).find(Boolean) ?? services[0];
    set('lines', [...form.lines, line]);
    if (!service) return;
    try {
      const q = encodeURIComponent(`${form.address} ${form.postal_code} ${form.city}`.trim());
      const geo = q ? await fetch(`https://api-adresse.data.gouv.fr/search/?q=${q}&limit=1`).then((r) => r.json()) : null;
      const [lon, lat] = geo?.features?.[0]?.geometry?.coordinates ?? [];
      const fee = await api.quoteTravelFee(service.id, lat !== undefined ? [lat, lon] : null);
      const label = fee.distance_km !== null ? `Frais de déplacement (${String(fee.distance_km).replace('.', ',')} km)` : '';
      setForm((prev) => ({
        ...prev,
        lines: prev.lines.map((l) => (l === line ? { ...l, label, unit_price: fee.travel_fee } : l)),
      }));
    } catch {
      // Frais non calculables (adresse inconnue) : ligne laissée à saisir
    }
  }

  /** Remise saisie en « 10 % » : pourcentage des prestations HT hors remises ; sinon montant. */
  const discountAmount = (input: string) => {
    const percent = /^\s*([\d.,]+)\s*%\s*$/.exec(input);
    if (!percent) return evaluate(input);
    const base = form.lines.filter((l) => l.kind !== 'debours' && l.kind !== 'discount').reduce((sum, l) => sum + lineAmount(l), 0);
    const rate = evaluate(percent[1]);
    return rate === null ? null : Math.round(base * rate) / 100;
  };

  const duplicates = useMemo(() => duplicateGroups(form.lines), [form.lines]);
  /** Fusionne un groupe de doublons (même prix et même taux) : quantités additionnées sur la première ligne. */
  const mergeGroup = (group: number[]) =>
    set(
      'lines',
      form.lines
        .map((line, i) => (i === group[0] ? { ...line, quantity: group.reduce((sum, j) => sum + Number(form.lines[j].quantity), 0) } : line))
        .filter((_, i) => !group.slice(1).includes(i)),
    );
  const dropDuplicates = (group: number[]) => set('lines', form.lines.filter((_, i) => !group.slice(1).includes(i)));

  const toggleLabour = (on: boolean) => {
    setLabour(on);
    if (!on) setForm((prev) => ({ ...prev, lines: prev.lines.filter((line) => line.kind !== 'labour'), time_counting: null }));
    else set('time_counting', rounded ? timeCountingText(config) || null : EXACT_TIME_COUNTING);
  };
  const toggleRounded = (on: boolean) => {
    setRounded(on);
    set('time_counting', on ? timeCountingText(config) || null : EXACT_TIME_COUNTING);
  };

  /** Enregistre le brouillon (création au premier passage) ; renvoie le devis à jour. */
  async function save(): Promise<Quote | null> {
    setBusy(true);
    setError(null);
    try {
      const saved = quote ? await api.updateQuote(quote.id, form) : await api.createQuote(form);
      onSaved(saved);
      return saved;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const [goodsDate, setGoodsDate] = useState(quote?.goods_received_at ?? '');

  async function receiveGoods() {
    if (!quote) return;
    setBusy(true);
    setError(null);
    try {
      onSaved(await api.quoteGoodsReceived(quote.id, goodsDate));
      setInfo('Date de remise enregistrée : fin du délai de rétractation calculée.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setConfirm(null);
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    try {
      const sent = await api.sendQuote(saved.id);
      onSaved(sent);
      setInfo(
        sent.notifications.some((n) => n.status === 'sent')
          ? 'Devis envoyé au client par email, avec le lien pour répondre.'
          : "Devis numéroté, mais l'email n'est pas parti : vérifiez l'envoi des emails (écran Compte)."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setConfirm(null);
    if (!quote) return;
    try {
      await api.deleteQuote(quote.id);
      onDeleted(quote.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  /** Lignes d'une partie : prestations (devis) ou pièces au nom du client (mandat de débours). */
  const renderLines = (debours: boolean) =>
    form.lines.some((line) => (line.kind === 'debours') === debours) && (
      <div className="quote-lines" role="table" aria-label={debours ? 'Pièces au nom du client' : 'Prestations'}>
        <div className="quote-lines__row quote-lines__row--head" role="row">
          <span role="columnheader">Type</span>
          <span role="columnheader">Désignation</span>
          <span role="columnheader">Qté</span>
          <span role="columnheader">Unité</span>
          <span role="columnheader">{vatMode === 'vat' && !debours ? 'PU HT' : 'Prix unitaire'}</span>
          {vatMode === 'vat' && <span role="columnheader">TVA</span>}
          <span role="columnheader">Montant</span>
          <span role="columnheader" aria-label="Actions" />
        </div>
        {form.lines.map((line, index) =>
          (line.kind === 'debours') !== debours ? null : (
            <div className={`quote-lines__row quote-lines__row--${line.kind}`} role="row" key={index}>
              <span className="quote-lines__kind" role="cell">
                {LINE_KIND_LABELS[line.kind]}
              </span>
              <input
                className="form-input"
                aria-label="Désignation"
                // Main-d'œuvre, déplacement, remise : désignation facultative (libellé du type par défaut)
                required={!DEFAULT_LINE_LABELS[line.kind]}
                placeholder={DEFAULT_LINE_LABELS[line.kind] ?? (line.kind === 'debours' ? 'Pièce, référence' : line.kind === 'service' ? 'Prestation du catalogue ou désignation libre' : 'Désignation')}
                list={line.kind === 'service' ? 'quote-catalogue' : undefined}
                value={line.label}
                onChange={(e) => {
                  const service = line.kind === 'service' ? serviceNamed(e.target.value) : undefined;
                  setLine(index, service ? { label: service.name, unit_price: Number(service.price) } : { label: e.target.value });
                }}
              />
              {line.kind === 'labour' && line.unit === 'h' ? (
                // Temps passé : « 1h20 » ou « 80 min », converti en heures arrondies selon le décompte réglé
                <input
                  className="form-input"
                  aria-label="Temps (heures, ou durée : 1h20, 80 min)"
                  title="Heures (1,5) ou durée (1h20, 80 min), arrondie selon le décompte réglé"
                  inputMode="decimal"
                  required
                  value={line.quantity}
                  onChange={(e) => setLine(index, { quantity: e.target.value })}
                  onBlur={(e) => {
                    const hours = billedHours(e.target.value, countingConfig(config, form.time_counting), rounded);
                    if (hours !== null) setLine(index, { quantity: hours });
                  }}
                />
              ) : line.kind === 'discount' ? (
                <span className="quote-lines__na" role="cell">
                  1
                </span>
              ) : (
                <input
                  className="form-input"
                  aria-label="Quantité (calcul possible : 120/3)"
                  title="Nombre ou calcul (120/3, 2*1,5)"
                  inputMode="decimal"
                  required
                  value={line.quantity}
                  onChange={(e) => setLine(index, { quantity: e.target.value })}
                  onBlur={(e) => {
                    const value = evaluate(e.target.value);
                    if (value !== null) setLine(index, { quantity: value });
                  }}
                />
              )}
              {fixedUnit(line.kind, config) ? (
                <span className="quote-lines__unit" role="cell" title={line.unit === 'h' ? "Prix unitaire à l'heure" : undefined}>
                  {line.unit}
                </span>
              ) : (
                <select className="form-input" aria-label="Unité" value={line.unit} onChange={(e) => setLine(index, { unit: e.target.value })}>
                  {[...new Set([...PART_UNITS, line.unit])].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              )}
              <input
                className="form-input"
                aria-label={line.kind === 'discount' ? 'Remise (montant ou pourcentage : 10 %)' : line.unit === 'h' ? 'Prix unitaire à l’heure' : 'Prix unitaire (calcul possible : 120/3)'}
                title={
                  line.kind === 'discount'
                    ? 'Montant déduit (50) ou pourcentage des prestations (10 %)'
                    : line.unit === 'h'
                      ? 'Prix à l’heure ; nombre ou calcul (120/3)'
                      : 'Nombre ou calcul (120/3, 2*45,5)'
                }
                placeholder={line.unit === 'h' ? '€/h' : undefined}
                inputMode="decimal"
                required
                value={line.unit_price}
                onChange={(e) => setLine(index, { unit_price: e.target.value })}
                onBlur={(e) => {
                  const value = line.kind === 'discount' ? discountAmount(e.target.value) : evaluate(e.target.value);
                  if (value !== null) setLine(index, { unit_price: line.kind === 'discount' ? -Math.abs(value) : Math.max(value, 0) });
                }}
              />
              {vatMode === 'vat' &&
                (line.kind === 'debours' ? (
                  <span className="quote-lines__na" role="cell" title="Débours : sans TVA de l'artisan">
                    —
                  </span>
                ) : (
                  <select
                    className="form-input"
                    aria-label="Taux de TVA"
                    value={Number(line.vat_rate)}
                    onChange={(e) => setLine(index, { vat_rate: Number(e.target.value) })}
                  >
                    {rates.map((rate) => (
                      <option key={rate} value={rate}>
                        {String(rate).replace('.', ',')} %
                      </option>
                    ))}
                  </select>
                ))}
              <span className="quote-lines__amount" role="cell">
                {euro(lineAmount(line))}
              </span>
              {!locked && (
                <button
                  type="button"
                  className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                  onClick={() =>
                    set(
                      'lines',
                      form.lines.filter((_, i) => i !== index),
                    )
                  }
                  title="Retirer la ligne"
                  aria-label="Retirer la ligne"
                >
                  <TrashIcon size={14} weight="bold" aria-hidden="true" />
                </button>
              )}
            </div>
          ),
        )}
      </div>
    );

  const title = quote?.number ? `Devis ${quote.number}` : quote ? 'Devis (brouillon)' : 'Nouveau devis';

  return createPortal(
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="quote-editor-title">
      <div className="admin-modal admin-modal--xwide">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title" id="quote-editor-title">
            {title}
            {quote && <span className={`status-badge quote-status--${quote.status}`}>{QUOTE_STATUS_LABELS[quote.status]}</span>}
          </h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <form
          className="admin-modal__body quote-editor"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          {locked && quote && (
            <>
              <QuoteDecision quote={quote} />
              {quote.status === 'accepted' && Number(quote.sale) > 0 && !Number(quote.urgent) && (
                <div className="quote-editor__goods">
                  <label className="form-label" htmlFor="quote-goods-received">
                    Pièces vendues remises au client le
                  </label>
                  <FieldHelp topic="goods_received" />
                  <input
                    id="quote-goods-received"
                    type="date"
                    className="form-input form-input--compact"
                    max={format(new Date(), 'yyyy-MM-dd')}
                    value={goodsDate}
                    onChange={(e) => setGoodsDate(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary admin-btn-sm" disabled={busy || !goodsDate} onClick={receiveGoods}>
                    Enregistrer
                  </button>
                  <p className="form-hint">
                    Devis assimilé à une vente (fourniture revendue, C. consom. L221-1, II) : le délai de rétractation de quatorze jours
                    court de la prise de possession des pièces par le client (L221-18, 2°), en général le jour de la pose.
                  </p>
                </div>
              )}
              {quote.token && (
                <div className="quote-editor__links">
                  <a className="btn btn-secondary admin-btn-sm" href={`/devis/${quote.token}/imprimer`} target="_blank" rel="noopener">
                    <PrinterIcon size={14} weight="bold" aria-hidden="true" />
                    Versions imprimables
                  </a>
                  <a className="btn btn-secondary admin-btn-sm" href={`/api/quotes/token/${quote.token}/devis.pdf`}>
                    <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
                    Devis (PDF)
                  </a>
                  {Number(quote.total_debours) > 0 && (
                    <a className="btn btn-secondary admin-btn-sm" href={`/api/quotes/token/${quote.token}/mandat.pdf`}>
                      <DownloadSimpleIcon size={14} weight="bold" aria-hidden="true" />
                      Mandat (PDF)
                    </a>
                  )}
                  <a className="btn btn-secondary admin-btn-sm" href={`/devis/${quote.token}`} target="_blank" rel="noopener">
                    <ArrowSquareOutIcon size={14} weight="bold" aria-hidden="true" />
                    Page du client
                  </a>
                </div>
              )}
              <QuoteEmails quoteId={quote.id} refreshKey={quote.status} />
            </>
          )}

          <fieldset className="quote-editor__section" disabled={locked}>
            <legend>Client et lieu d'intervention</legend>
            <div className="quote-editor__grid">
              <Field
                id="quote-client-name"
                label="Nom du client"
                required
                value={form.client_name}
                onChange={(v) => set('client_name', v)}
              />
              <Field
                id="quote-client-email"
                label="Email"
                type="email"
                value={form.client_email}
                onChange={(v) => set('client_email', v)}
              />
              <Field
                id="quote-client-phone"
                label="Téléphone"
                type="tel"
                value={form.client_phone}
                onChange={(v) => set('client_phone', v)}
              />
              <Field id="quote-address" label="Adresse" required value={form.address} onChange={(v) => set('address', v)} />
              <Field id="quote-postal-code" label="Code postal" value={form.postal_code} onChange={(v) => set('postal_code', v)} />
              <Field id="quote-city" label="Ville" value={form.city} onChange={(v) => set('city', v)} />
              <Field
                id="quote-client-company"
                label="Entreprise cliente (facultatif)"
                value={form.client_company ?? ''}
                onChange={(v) => set('client_company', v || null)}
              />
              <Field
                id="quote-client-siren"
                help="client_siren"
                label="SIREN ou SIRET du client"
                value={form.client_siren ?? ''}
                onChange={(v) => set('client_siren', v || null)}
                hint="Client professionnel : identification reprise sur la facture."
              />
            </div>
          </fieldset>

          <fieldset className="quote-editor__section" disabled={locked}>
            <legend>Travaux</legend>
            <Field
              id="quote-title"
                help="title"
              label="Nature exacte des travaux"
              value={form.title}
              onChange={(v) => set('title', v)}
              hint="Mention obligatoire du devis : décrivez précisément la réparation ou l'entretien."
            />
            <div className="form-label-row">
              <label className="form-check quote-editor__urgent">
                <input type="checkbox" checked={form.urgent} onChange={(e) => set('urgent', e.target.checked)} />
                <span>Intervention urgente demandée par le client</span>
              </label>
              <FieldHelp topic="urgent" />
            </div>
            <p className="form-hint">
              Danger pour les personnes ou les locaux : pas de délai de rétractation, mais seulement pour les pièces et travaux strictement
              nécessaires. Tout le reste fait l'objet d'un devis séparé.
            </p>
            {config.quote_builder_guarantees === '1' && (
              <>
                <div className="form-label-row">
                  <label className="form-check quote-editor__urgent">
                    <input type="checkbox" checked={form.builder_works} onChange={(e) => set('builder_works', e.target.checked)} />
                    <span>Travaux relevant des garanties des constructeurs</span>
                  </label>
                  <FieldHelp topic="builder_works" />
                </div>
                <p className="form-hint">
                  Ouvrage ou élément d'équipement d'un ouvrage (C. civ. 1792 et suivants) : les garanties sont rappelées sur le devis et
                  votre attestation d'assurance décennale lui est jointe (C. assur. L243-2). Un simple dépannage n'en relève pas en
                  principe.
                </p>
              </>
            )}
          </fieldset>

          <fieldset className="quote-editor__section" disabled={locked}>
            <legend>Prestations</legend>
            {isHourly(config) && (
              <div className="quote-editor__labour-options">
                <label className="form-check">
                  <input type="checkbox" checked={labour} onChange={(e) => toggleLabour(e.target.checked)} />
                  <span>Main-d'œuvre facturée</span>
                </label>
                {labour && (
                  <label className="form-check">
                    <input type="checkbox" checked={rounded} onChange={(e) => toggleRounded(e.target.checked)} />
                    <span>Arrondir le temps ({timeCountingText(config).replace(/^Temps décompté /, '') || 'décompte réglé'})</span>
                  </label>
                )}
              </div>
            )}
            {renderLines(false)}
            {!locked && (
              <div className="quote-editor__add">
                {([...(labour ? ['labour'] : []), 'service', 'travel', ...(allowSupply ? ['supply'] : [])] as QuoteLineKind[]).map((kind) => (
                  <button key={kind} type="button" className="btn btn-secondary admin-btn-sm" onClick={() => (kind === 'travel' ? addTravel() : addLine(kind))}>
                    <PlusIcon size={14} weight="bold" aria-hidden="true" />
                    {LINE_KIND_LABELS[kind]}
                  </button>
                ))}
                {isHourly(config) && labour && (
                  <button type="button" className="btn btn-secondary admin-btn-sm" onClick={addDiagnostic}>
                    <PlusIcon size={14} weight="bold" aria-hidden="true" />
                    Diagnostic
                  </button>
                )}
                <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => addLine('discount')}>
                  <PlusIcon size={14} weight="bold" aria-hidden="true" />
                  {LINE_KIND_LABELS.discount}
                </button>
              </div>
            )}
            <datalist id="quote-catalogue">
              {services.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
            {!locked &&
              duplicates.map((group) => {
                const [first, ...others] = group.map((i) => form.lines[i]);
                const mergeable = others.every((l) => Number(l.unit_price) === Number(first.unit_price) && Number(l.vat_rate) === Number(first.vat_rate) && l.unit === first.unit);
                return (
                  <p className="quote-editor__vat-check" key={group.join('-')}>
                    <WarningIcon size={16} weight="fill" aria-hidden="true" />
                    <span>
                      {group.length} lignes « {LINE_KIND_LABELS[first.kind]} — {first.label || DEFAULT_LINE_LABELS[first.kind]} » en double.{' '}
                      {mergeable ? 'Fusionner additionne les quantités.' : 'Prix, unité ou TVA différents : fusion impossible, gardez une ligne ou modifiez les désignations.'}
                    </span>
                    {mergeable && (
                      <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => mergeGroup(group)}>
                        Fusionner
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => dropDuplicates(group)}>
                      Garder la première
                    </button>
                  </p>
                );
              })}

            {supplyVat && (
              <p className="quote-editor__vat-check">
                <WarningIcon size={16} weight="fill" aria-hidden="true" />
                <span>
                  Fournitures revendues : {supplyVat.share} % du coût total HT.{' '}
                  {supplyVat.followsService
                    ? supplyVat.rateMismatch
                      ? "Jusqu'à 50 %, pièces et fournitures suivent en principe le régime de la prestation : appliquez-leur le même taux de TVA."
                      : "Jusqu'à 50 %, pièces et fournitures suivent le régime de la prestation (même taux de TVA)."
                    : "Au-delà de 50 %, les pièces détachées sont vendues au taux qui leur est propre, la pose à son propre taux, sur des lignes distinctes, sauf pièces adaptées pour être posées (ajustage, découpage, soudure)."}{' '}
                  Comparaison globale admise par l'administration (BOI-TVA-BASE-10-20-40-20, § 150) ; à vérifier avec votre comptable.
                </span>
              </p>
            )}

            <dl className="quote-totals">
              <dt>{vatMode === 'vat' ? 'Total HT' : 'Total prestations'}</dt>
              <dd>{euro(totals.ht)}</dd>
              {vatMode === 'vat' ? (
                <>
                  <dt>TVA</dt>
                  <dd>{euro(totals.vat)}</dd>
                </>
              ) : (
                <dd className="quote-totals__mention">{config.quote_vat_exemption || 'TVA non applicable, article 293 B du CGI'}</dd>
              )}
              <dt className="quote-totals__total">Total du devis TTC</dt>
              <dd className="quote-totals__total">{euro(totals.ttc)}</dd>
            </dl>
          </fieldset>

          <fieldset className="quote-editor__section quote-mandate" disabled={locked}>
            <legend>Mandat de débours (document séparé)</legend>
            <p className="form-hint">
              Pièces achetées <strong>au nom et pour le compte du client</strong>, sur son mandat : hors de votre chiffre d'affaires et sans
              votre TVA. Le client donne ou refuse ce mandat par un accord distinct du devis ; s'il le refuse, il fournit lui-même les
              pièces.
            </p>
            {renderLines(true)}
            {!locked && (
              <div className="quote-editor__add">
                <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => addLine('debours')}>
                  <PlusIcon size={14} weight="bold" aria-hidden="true" />
                  Pièce au nom du client
                </button>
              </div>
            )}
            {hasDebours && (
              <>
                <div className="quote-editor__grid">
                  <Field
                    id="quote-debours-budget"
                help="debours_budget"
                    label="Budget maximum du mandat (€)"
                    type="number"
                    value={form.debours_budget === null ? '' : String(form.debours_budget)}
                    onChange={(v) => set('debours_budget', v === '' ? null : Number(v))}
                    hint={`Vide : montant estimé des pièces (${euro(totals.debours)}). Au-delà du budget, nouvel accord du client.`}
                  />
                </div>
                <dl className="quote-totals">
                  <dt>Pièces estimées (débours)</dt>
                  <dd>{euro(totals.debours)}</dd>
                  <dt className="quote-totals__total">Total estimé à régler (devis + débours)</dt>
                  <dd className="quote-totals__total">{euro(totals.estimated)}</dd>
                </dl>
                <DeboursReminder budget={form.debours_budget ?? totals.debours} />
              </>
            )}
          </fieldset>

          <fieldset className="quote-editor__section" disabled={locked}>
            <legend>Conditions</legend>
            <div className="quote-editor__grid">
              <ExecutionField value={form.execution_terms} urgent={form.urgent} onChange={(v) => set('execution_terms', v)} />
              <ChoiceField
                id="quote-payment"
                help="payment_terms"
                label="Modalités de paiement"
                options={[...new Set([config.quote_payment_terms, ...PAYMENT_TERMS_OPTIONS].filter((o): o is string => Boolean(o)))]}
                value={form.payment_terms ?? ''}
                onChange={(v) => set('payment_terms', v || null)}
                hint="Obligatoire avant l'envoi (R221-2, 4°) : moment et moyens de paiement."
              />
              {form.lines.some((line) => line.kind === 'labour') && (
                <ChoiceField
                  id="quote-time-counting"
                  help="time_counting"
                  label="Décompte du temps estimé"
                  options={timeCountingOptions(config)}
                  value={form.time_counting ?? ''}
                  onChange={(v) => {
                    set('time_counting', v || null);
                    setRounded(v !== EXACT_TIME_COUNTING);
                  }}
                  hint="Arrêté du 24 janvier 2017, art. 2."
                />
              )}
            </div>
            <div className="quote-editor__grid">
              <Field
                id="quote-validity"
                label="Durée de validité (jours)"
                type="number"
                value={String(form.validity_days)}
                onChange={(v) => set('validity_days', Number(v))}
              />
              <Field
                id="quote-price"
                help="quote_price"
                label="Prix du devis (vide : gratuit)"
                type="number"
                value={form.quote_price === null ? '' : String(form.quote_price)}
                onChange={(v) => set('quote_price', v === '' ? null : Number(v))}
                hint="Mention obligatoire : le devis indique s'il est gratuit ou payant."
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="quote-notes">
                Précisions pour le client
              </label>
              <textarea
                id="quote-notes"
                className="form-textarea"
                value={form.notes ?? ''}
                onChange={(e) => set('notes', e.target.value || null)}
              />
            </div>
          </fieldset>

          {error && <p className="form-alert-error">{error}</p>}
          {info && (
            <p className="admin-settings-message" role="status">
              {info}
            </p>
          )}

          <div className="admin-modal__actions">
            {quote && quote.status === 'draft' && (
              <button type="button" className="btn btn-danger" onClick={() => setConfirm('delete')} disabled={busy}>
                <TrashIcon size={16} weight="bold" aria-hidden="true" />
                Supprimer
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Fermer
            </button>
            {!locked && (
              <>
                <button type="submit" className="btn btn-secondary" disabled={busy}>
                  {busy ? 'Enregistrement…' : 'Enregistrer le brouillon'}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setConfirm('send')} disabled={busy || !form.lines.length}>
                  <PaperPlaneTiltIcon size={16} weight="bold" aria-hidden="true" />
                  Envoyer
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {confirm === 'send' && (
        <ConfirmDialog title="Envoyer le devis ?" confirmLabel="Envoyer" onConfirm={send} onCancel={() => setConfirm(null)}>
          <p>Le devis reçoit son numéro et n'est plus modifiable : pour toute correction, vous en créerez un nouveau.</p>
          <p>
            Il est envoyé par email au client avec un lien pour l'accepter ou le refuser, et reste valable {form.validity_days} jours.
          </p>
        </ConfirmDialog>
      )}
      {confirm === 'delete' && (
        <ConfirmDialog title="Supprimer le brouillon ?" confirmLabel="Supprimer" onConfirm={remove} onCancel={() => setConfirm(null)}>
          <p>Ce brouillon n'a jamais été envoyé : il est supprimé définitivement.</p>
        </ConfirmDialog>
      )}
    </div>,
    document.body,
  );
};

/** Lien vers une fiche de la documentation (docs/legal/), ouverte dans un nouvel onglet de l'Espace Artisan. */
const DocLink: React.FC<{ path: string; children: React.ReactNode }> = ({ path, children }) => (
  <a href={`/admin?doc=${encodeURIComponent(path)}`} target="_blank" rel="noopener">
    {children}
  </a>
);

/** Champ de formulaire simple (libellé, aide facultative). */
const Field: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
  /** Aide « ? » (comment, pourquoi, textes), cf. `src/config/fieldHelp.ts`. */
  help?: FieldHelpKey;
}> = ({ id, label, value, onChange, type = 'text', required, hint, help }) => (
  <div className="form-group">
    <div className="form-label-row">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {help && <FieldHelp topic={help} />}
    </div>
    <input id={id} className="form-input" type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    {hint && <p className="form-hint">{hint}</p>}
  </div>
);

/** Liste de formules usuelles, ou « Autre » pour écrire librement (valeur existante hors liste comprise). */
const ChoiceField: React.FC<{
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  help?: FieldHelpKey;
}> = ({ id, label, options, value, onChange, hint, help }) => {
  const [free, setFree] = useState(value !== '' && !options.includes(value));
  return (
    <div className="form-group">
      <div className="form-label-row">
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
        {help && <FieldHelp topic={help} />}
      </div>
      <select
        id={id}
        className="form-input"
        value={free ? '__free' : value}
        onChange={(e) => {
          setFree(e.target.value === '__free');
          if (e.target.value !== '__free') onChange(e.target.value);
        }}
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="__free">Autre (saisie libre)…</option>
      </select>
      {free && <input className="form-input" aria-label={`${label} (saisie libre)`} value={value} onChange={(e) => onChange(e.target.value)} />}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
};

/**
 * Date ou délai d'exécution (L221-5 3°) : une date, ou « sous n jours » à compter de l'acceptation.
 * Urgence : aujourd'hui ; sinon 15 jours, après le délai de rétractation (DEFAULT_EXECUTION_DAYS).
 */
const ExecutionField: React.FC<{ value: string | null; urgent: boolean; onChange: (value: string | null) => void }> = ({ value, urgent, onChange }) => {
  const parsed = parseExecution(value);
  const [mode, setMode] = useState(parsed.mode);
  const defaultDays = urgent ? 0 : DEFAULT_EXECUTION_DAYS;
  const switchTo = (next: typeof mode) => {
    setMode(next);
    if (next === 'date') onChange(executionDateText(addDays(new Date(), defaultDays)));
    if (next === 'delay') onChange(executionDelayText(urgent ? 1 : DEFAULT_EXECUTION_DAYS));
  };
  // L'urgence change la date par défaut tant qu'elle n'a pas été modifiée
  const [lastUrgent, setLastUrgent] = useState(urgent);
  if (lastUrgent !== urgent) {
    setLastUrgent(urgent);
    if (mode === 'date' && value === executionDateText(addDays(new Date(), urgent ? DEFAULT_EXECUTION_DAYS : 0))) {
      onChange(executionDateText(addDays(new Date(), defaultDays)));
    }
  }
  return (
    <div className="form-group">
      <div className="form-label-row">
        <span className="form-label">Date ou délai d'exécution</span>
        <FieldHelp topic="execution_terms" />
      </div>
      <div className="quote-editor__execution" role="group" aria-label="Date ou délai d'exécution">
        <select className="form-input form-input--compact" aria-label="Type" value={mode} onChange={(e) => switchTo(e.target.value as typeof mode)}>
          <option value="date">Date</option>
          <option value="delay">Délai</option>
          <option value="free">Autre</option>
        </select>
        {mode === 'date' && (
          <input
            type="date"
            className="form-input"
            aria-label="Date d'exécution"
            value={parsed.date ?? ''}
            onChange={(e) => onChange(e.target.value ? executionDateText(parseISO(e.target.value)) : null)}
          />
        )}
        {mode === 'delay' && (
          <>
            <span>Sous</span>
            <input
              type="number"
              min="1"
              className="form-input form-input--compact"
              aria-label="Nombre de jours"
              value={parsed.days ?? ''}
              onChange={(e) => onChange(e.target.value ? executionDelayText(Number(e.target.value)) : null)}
            />
            <span>jours à compter de l'acceptation</span>
          </>
        )}
        {mode === 'free' && (
          <input className="form-input" aria-label="Date ou délai (texte libre)" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} />
        )}
      </div>
      <p className="form-hint">
        Obligatoire avant l'envoi (C. consom. L221-5, 3°).{' '}
        {urgent ? 'Intervention urgente : exécution immédiate possible.' : "Hors urgence, 15 jours par défaut : l'exécution ne commence pas pendant le délai de rétractation de 14 jours, sauf demande expresse du client."}
      </p>
    </div>
  );
};

/** Rappels à l'artisan pour les pièces achetées au nom du client (docs/legal/fr/rappels-artisan.md). */
const DeboursReminder: React.FC<{ budget: number }> = ({ budget }) => (
  <aside className="quote-reminder" aria-label="Rappels sur les débours">
    <p className="quote-reminder__title">
      <WarningIcon size={16} weight="fill" aria-hidden="true" />
      Pièces au nom du client : à respecter
    </p>
    <ul>
      <li>N'achetez qu'après le mandat du client (accord distinct du devis), dans la limite de {euro(budget)} ; au-delà, nouvel accord.</li>
      <li>Facture ou ticket du fournisseur au nom du client (nom, adresse ; SIRET et TVA s'il est professionnel).</li>
      <li>Conservez les originaux (contrôle), remettez une copie au client avec votre facture.</li>
      <li>Refacturez le montant exact, sans marge, sur une ligne distincte ; notez « débours » dans votre livre des recettes.</li>
      <li>Jamais de carburant, de frais kilométriques ni d'outillage en débours.</li>
    </ul>
    <p className="quote-reminder__docs">
      En savoir plus : <DocLink path="fr/debours.md">débours et mandat</DocLink> ·{' '}
      <DocLink path="fr/rappels-artisan.md">aide-mémoire de l'artisan</DocLink>
    </p>
  </aside>
);

const EMAIL_LABELS: Record<QuoteNotification['type'], string> = {
  quote_client: 'Devis envoyé au client',
  decision_client: 'Réponse : copie au client',
  decision_pro: 'Réponse : avis à l’artisan',
  withdrawal_client: 'Rétractation : accusé au client',
  withdrawal_pro: 'Rétractation : avis à l’artisan',
};

/** Journal des emails du devis (envoi, réponses, rétractation). */
const QuoteEmails: React.FC<{ quoteId: number; refreshKey: string }> = ({ quoteId, refreshKey }) => {
  const [emails, setEmails] = useState<QuoteNotification[] | null>(null);
  useEffect(() => {
    api.quoteNotifications(quoteId).then(setEmails).catch(() => setEmails([]));
  }, [quoteId, refreshKey]);
  if (!emails?.length) return null;
  return (
    <details className="quote-emails">
      <summary>Emails du devis ({emails.length})</summary>
      <ul>
        {emails.map((email) => (
          <li key={email.id} className={`quote-emails__item quote-emails__item--${email.status}`}>
            {EMAIL_LABELS[email.type]} · {sqlDate(email.sent_at ?? email.created_at)} ·{' '}
            {email.status === 'sent' ? 'envoyé' : email.status === 'failed' ? `échec : ${email.error_message ?? ''}` : 'en cours'}
          </li>
        ))}
      </ul>
    </details>
  );
};

/** Réponse du client sur un devis envoyé (preuve de l'accord). */
const QuoteDecision: React.FC<{ quote: Quote }> = ({ quote }) => (
  <dl className="quote-decision">
    <dt>Envoyé le</dt>
    <dd>{sqlDate(quote.sent_at)}</dd>
    <dt>Valable jusqu'au</dt>
    <dd>{sqlDate(quote.valid_until)}</dd>
    {quote.decided_at && (
      <>
        <dt>{quote.status === 'accepted' ? 'Accepté le' : 'Refusé le'}</dt>
        <dd>{sqlDate(quote.decided_at)}</dd>
      </>
    )}
    {quote.status === 'accepted' && (
      <>
        <dt>Pièces remplacées</dt>
        <dd>{Number(quote.keep_parts) ? 'Le client les conserve' : 'Laissées à l’artisan (décharge)'}</dd>
        {Number(quote.total_debours) > 0 && (
          <>
            <dt>Mandat de débours</dt>
            <dd>
              {quote.debours_mandate === null
                ? 'Sans réponse'
                : Number(quote.debours_mandate)
                  ? `Donné le ${sqlDate(quote.mandate_decided_at)} (${euro(quote.debours_budget ?? quote.total_debours)} maximum)`
                  : 'Refusé : le client fournit les pièces'}
            </dd>
          </>
        )}
        <dt>Rétractation</dt>
        <dd>
          {Number(quote.urgent)
            ? 'Intervention urgente : pas de délai'
            : quote.withdrawal_until
              ? `Jusqu'au ${sqlDate(quote.withdrawal_until)}${Number(quote.early_execution) ? ' (exécution anticipée demandée)' : ''}`
              : 'Vente : ouverte jusqu’à quatorze jours après la remise des pièces (date à saisir)'}
        </dd>
      </>
    )}
    {quote.status === 'withdrawn' && (
      <>
        <dt>Rétracté le</dt>
        <dd>
          {sqlDate(quote.withdrawn_at)} par {quote.withdrawal_name} (accusé de réception : {quote.withdrawal_email})
        </dd>
      </>
    )}
    {quote.refusal_reason && (
      <>
        <dt>Motif du refus</dt>
        <dd>{quote.refusal_reason}</dd>
      </>
    )}
  </dl>
);

export default QuoteEditor;
