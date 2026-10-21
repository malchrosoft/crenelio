import React, { useState } from 'react';
import { api } from '../../api';
import { AddressResult, AppConfig } from '../../types';
import AddressAutocomplete from '../AddressAutocomplete';
import { isPremisesOnly, premisesLabel } from '../../utils/zone';
import ResetButton from './ResetButton';

interface TravelSettingsEditorProps {
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
}

/**
 * Mode d'intervention et adresse de l'entreprise (locaux, ou point de départ si identique).
 */
const TravelSettingsEditor: React.FC<TravelSettingsEditorProps> = ({ config, onSaved }) => {
  const [premises, setPremises] = useState(isPremisesOnly(config));
  const [address, setAddress] = useState(config.premises_address ?? '');
  const [picked, setPicked] = useState<AddressResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = premises !== isPremisesOnly(config) || picked !== null || address !== (config.premises_address ?? '');

  function reset() {
    setPremises(isPremisesOnly(config));
    setAddress(config.premises_address ?? '');
    setPicked(null);
    setMessage(null);
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload: Record<string, string> = { travel_mode: premises ? 'premises' : 'onsite' };
    if (picked) {
      Object.assign(payload, {
        premises_address: picked.address,
        premises_postal_code: picked.postal_code,
        premises_city: picked.city,
        premises_latitude: String(picked.coordinates[0]),
        premises_longitude: String(picked.coordinates[1]),
      });
      // Point de départ calé sur l'entreprise : il suit son adresse
      if (config.start_same_as_premises === '1') {
        payload.default_latitude = String(picked.coordinates[0]);
        payload.default_longitude = String(picked.coordinates[1]);
      }
    }
    try {
      const res = await api.updateAdminConfig(payload);
      const moved =
        !premises &&
        (res.config.default_latitude !== config.default_latitude ||
          res.config.default_longitude !== config.default_longitude);
      onSaved(res.config);
      setPicked(null);
      setMessage(moved ? 'Enregistré. Recalculez les communes (menu « Zone d’intervention »).' : 'Enregistré.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  return (
    <section className="admin-config-group zone-editor" aria-labelledby="travel-title">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="travel-title">
          Mode d'intervention
        </h3>
      </div>

      <form className="admin-settings-form" onSubmit={handleSubmit}>
        <fieldset className="zone-editor__modes">
          <legend className="form-label">Mode d'intervention</legend>
          <label className="zone-editor__mode">
            <input type="radio" name="travel_mode" checked={!premises} onChange={() => setPremises(false)} />
            Je me déplace chez mes clients
          </label>
          <label className="zone-editor__mode">
            <input type="radio" name="travel_mode" checked={premises} onChange={() => setPremises(true)} />
            Je reçois mes clients dans mes locaux (pas de déplacement)
          </label>
        </fieldset>

        <div className="form-group">
          <label className="form-label" htmlFor="zone-company-address">
            {premises ? 'Adresse des locaux' : "Adresse de l'entreprise"}
          </label>
          <AddressAutocomplete
            id="zone-company-address"
            required={false}
            value={address}
            onChange={setAddress}
            onSelectAddress={(r) => {
              setPicked(r);
              setAddress(r.label);
            }}
          />
          <p className="form-hint">
            {picked
              ? `Nouvelle adresse : ${picked.label}`
              : premisesLabel(config)
                ? `Adresse enregistrée : ${premisesLabel(config)}`
                : 'Aucune adresse enregistrée : choisissez-la dans les suggestions.'}
            {premises && '. Elle est affichée sur la vitrine et dans les confirmations ; aucune adresse n’est demandée au client.'}
          </p>
        </div>

        <div className="admin-settings-actions">
          <button type="submit" className="btn btn-primary">
            Enregistrer
          </button>
          <ResetButton dirty={dirty} onReset={reset} />
          {message && <span className="admin-settings-message">{message}</span>}
        </div>
      </form>
    </section>
  );
};

export default TravelSettingsEditor;
