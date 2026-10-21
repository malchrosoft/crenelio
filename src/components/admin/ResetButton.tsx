import React from 'react';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';

interface ResetButtonProps {
  /** Vrai si le formulaire diffère des valeurs enregistrées en base. */
  dirty: boolean;
  onReset: () => void;
  disabled?: boolean;
}

/** « Annuler » : rétablit les valeurs enregistrées en base, actif seulement après une modification. */
const ResetButton: React.FC<ResetButtonProps> = ({ dirty, onReset, disabled = false }) => (
  <button
    type="button"
    className="btn btn-secondary"
    disabled={!dirty || disabled}
    title="Rétablir les valeurs enregistrées"
    onClick={onReset}
  >
    <ArrowCounterClockwiseIcon size={18} weight="fill" aria-hidden="true" />
    Annuler
  </button>
);

export default ResetButton;
