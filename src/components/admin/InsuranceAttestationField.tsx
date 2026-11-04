import React, { useEffect, useState } from 'react';
import { ArrowSquareOutIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { InsuranceAttestationStatus } from '../../types';

/**
 * Attestation d'assurance de responsabilité décennale (C. assur. L243-2) : PDF remis par l'assureur,
 * déposé tel quel avec sa date de fin de validité, joint aux devis de travaux relevant des garanties des
 * constructeurs. Fiche : docs/legal/fr/mentions-entreprise.md.
 */
const InsuranceAttestationField: React.FC<{ onChange?: (status: InsuranceAttestationStatus) => void }> = ({ onChange }) => {
  const [status, setStatus] = useState<InsuranceAttestationStatus | null>(null);
  const [until, setUntil] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = (next: InsuranceAttestationStatus) => {
    setStatus(next);
    setUntil(next.valid_until ?? '');
    onChange?.(next);
  };

  useEffect(() => {
    api.insuranceAttestation().then(apply).catch(() => setStatus(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(action: () => Promise<InsuranceAttestationStatus>, ok: string) {
    setBusy(true);
    setMessage(null);
    try {
      apply(await action());
      setFile(null);
      setMessage({ ok: true, text: ok });
    } catch (err: unknown) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setBusy(false);
    }
  }

  const expired = status?.exists && !status.valid;
  return (
    <div className="insurance-attestation">
      <p className="form-label">Attestation d'assurance décennale (PDF de votre assureur)</p>
      {status?.exists ? (
        <p className={expired ? 'insurance-attestation__state insurance-attestation__state--expired' : 'insurance-attestation__state'}>
          {expired ? 'Échue' : 'Valable'}
          {status.valid_until && ` jusqu'au ${format(parseISO(status.valid_until), 'd MMMM yyyy', { locale: fr })}`}
          {' · '}
          <a href="/api/admin/insurance-attestation/file" target="_blank" rel="noopener">
            <ArrowSquareOutIcon size={14} weight="bold" aria-hidden="true" /> Consulter
          </a>
        </p>
      ) : (
        <p className="form-hint">Aucune attestation : les devis de travaux relevant des garanties des constructeurs ne peuvent pas être envoyés.</p>
      )}
      <div className="insurance-attestation__form">
        <input
          type="file"
          accept="application/pdf"
          aria-label="Fichier PDF de l'attestation"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <label className="form-label" htmlFor="insurance-until">
          Fin de validité
        </label>
        <input id="insurance-until" type="date" className="form-input" value={until} onChange={(e) => setUntil(e.target.value)} />
        <button
          type="button"
          className="btn btn-secondary admin-btn-sm"
          disabled={busy || !until || (!file && !status?.exists)}
          onClick={() => run(() => api.uploadInsuranceAttestation(until, file), 'Attestation enregistrée.')}
        >
          <UploadSimpleIcon size={14} weight="bold" aria-hidden="true" />
          Enregistrer
        </button>
        {status?.exists && (
          <button
            type="button"
            className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
            disabled={busy}
            onClick={() => run(() => api.deleteInsuranceAttestation(), 'Attestation supprimée.')}
            title="Supprimer l'attestation"
            aria-label="Supprimer l'attestation"
          >
            <TrashIcon size={14} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="form-hint">
        Jointe aux devis et factures des travaux qui peuvent engager votre responsabilité décennale (C. assur. L243-2). Déposez le
        document tel que remis par votre assureur, et renouvelez-le avant sa date de fin.
      </p>
      {message && (
        <p className={message.ok ? 'admin-settings-message' : 'admin-settings-message admin-settings-message--error'} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
};

export default InsuranceAttestationField;
