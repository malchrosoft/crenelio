import React, { useEffect, useMemo, useState } from 'react';
import { CalculatorIcon, CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { AppConfig } from '../../types';
import AddressAutocomplete from '../AddressAutocomplete';
import ResetButton from './ResetButton';
import ConfirmDialog from './ConfirmDialog';
import ZoneMap from '../ZoneMap';
import {
  CommuneCandidate,
  compactFeature,
  computeCommunes,
  distanceToFeature,
  LatLng,
  ZoneFeature,
} from '../../utils/serviceArea';
import { formatKm } from '../../utils/format';

interface ZoneWorkspaceProps {
  config: AppConfig;
  onSaved: (config: AppConfig) => void;
}

const LIST_HIDDEN_KEY = 'crenelio.admin.zoneListHidden';

const REASON_LABELS: Record<CommuneCandidate['reasons'][number], string> = {
  home: 'commune de départ',
  neighbour: 'limitrophe',
  radius: 'dans le rayon',
};

/**
 * Zone d'intervention en pleine page : panneau (rayon, communes) à gauche, carte à droite.
 * Les communes sont calculées (départ, limitrophes, rayon), proposées cochées, puis enregistrées.
 */
const ZoneWorkspace: React.FC<ZoneWorkspaceProps> = ({ config, onSaved }) => {
  const [radius, setRadius] = useState(config.travel_max_km ?? '');
  const [neighbours, setNeighbours] = useState(config.zone_include_neighbours !== '0');
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  // Point de départ : l'adresse de l'entreprise ou une adresse / des coordonnées propres
  const [startSame, setStartSame] = useState(config.start_same_as_premises === '1');
  const [startAddress, setStartAddress] = useState(config.start_address ?? '');
  const [startLat, setStartLat] = useState(config.default_latitude ?? '');
  const [startLon, setStartLon] = useState(config.default_longitude ?? '');
  const companyLat = config.premises_latitude ?? '';
  const companyLon = config.premises_longitude ?? '';
  const effectiveLat = startSame ? companyLat : startLat;
  const effectiveLon = startSame ? companyLon : startLon;

  const [candidates, setCandidates] = useState<CommuneCandidate[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [computing, setComputing] = useState(false);
  const [zoneMessage, setZoneMessage] = useState<string | null>(null);
  const [listHidden, setListHidden] = useState(() => localStorage.getItem(LIST_HIDDEN_KEY) === '1');
  // Zone en base : référence pour « Annuler » et pour savoir si un calcul écraserait une sélection
  const [savedZone, setSavedZone] = useState<ZoneFeature[]>([]);
  const [computed, setComputed] = useState(false);
  const [confirmCompute, setConfirmCompute] = useState(false);

  // Centre suivi en direct : cercle, distances et calcul reflètent le point de départ saisi
  const center = useMemo<LatLng>(
    () => [parseFloat(effectiveLat) || 48.8, parseFloat(effectiveLon) || 2.2625],
    [effectiveLat, effectiveLon]
  );
  // Rayon en cours de saisie : cercle et calcul suivent la valeur affichée
  const radiusKm = parseFloat(radius.replace(',', '.')) || 0;

  useEffect(() => {
    localStorage.setItem(LIST_HIDDEN_KEY, listHidden ? '1' : '0');
  }, [listHidden]);

  /** Liste éditable reprise de la zone enregistrée (raisons inconnues hors calcul). */
  function loadZone(features: ZoneFeature[]) {
    setCandidates(features.map((feature) => ({ feature, reasons: [], distanceKm: 0 })));
    setSelected(new Set(features.map((f) => f.properties.code)));
    setComputed(false);
  }

  useEffect(() => {
    api
      .getZone()
      .then((zone) => {
        setSavedZone(zone.features);
        loadZone(zone.features);
      })
      .catch(() => setCandidates([]));
  }, []);

  // Formulaire du haut : écart avec les valeurs en base
  const settingsDirty =
    radius !== (config.travel_max_km ?? '') ||
    neighbours !== (config.zone_include_neighbours !== '0') ||
    startSame !== (config.start_same_as_premises === '1') ||
    startAddress !== (config.start_address ?? '') ||
    startLat !== (config.default_latitude ?? '') ||
    startLon !== (config.default_longitude ?? '');

  function resetSettings() {
    setRadius(config.travel_max_km ?? '');
    setNeighbours(config.zone_include_neighbours !== '0');
    setStartSame(config.start_same_as_premises === '1');
    setStartAddress(config.start_address ?? '');
    setStartLat(config.default_latitude ?? '');
    setStartLon(config.default_longitude ?? '');
    setSettingsMessage(null);
  }

  // Sélection : nouveau calcul ou cases modifiées par rapport à la zone en base
  const savedCodes = savedZone.map((f) => f.properties.code).sort().join(',');
  const zoneDirty = computed || [...selected].sort().join(',') !== savedCodes;

  /** Un calcul remplace la sélection en cours : confirmation si elle existe. */
  function requestCompute() {
    if (candidates && candidates.length > 0) setConfirmCompute(true);
    else compute();
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsMessage(null);
    const lat = parseFloat(effectiveLat);
    const lon = parseFloat(effectiveLon);
    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      setSettingsMessage('Point de départ invalide : choisissez une adresse ou saisissez des coordonnées GPS.');
      return;
    }
    try {
      const res = await api.updateAdminConfig({
        travel_max_km: radius.trim(),
        zone_include_neighbours: neighbours ? '1' : '0',
        start_same_as_premises: startSame ? '1' : '0',
        start_address: startSame ? '' : startAddress.trim(),
        default_latitude: String(lat),
        default_longitude: String(lon),
      });
      const moved =
        res.config.default_latitude !== config.default_latitude ||
        res.config.default_longitude !== config.default_longitude;
      onSaved(res.config);
      setSettingsMessage(moved ? 'Enregistré. Recalculez les communes depuis le nouveau point de départ.' : 'Enregistré.');
    } catch (err: unknown) {
      setSettingsMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  async function compute() {
    setComputing(true);
    setZoneMessage(null);
    try {
      const list = await computeCommunes(center, radiusKm, neighbours);
      setCandidates(list);
      setSelected(new Set(list.map((c) => c.feature.properties.code)));
      setComputed(true);
      if (!list.length) setZoneMessage('Aucune commune trouvée autour du point de départ.');
    } catch (err: unknown) {
      setZoneMessage(err instanceof Error ? err.message : 'Calcul impossible');
    } finally {
      setComputing(false);
    }
  }

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
    setZoneMessage(null);
  }

  async function saveZone() {
    if (!candidates) return;
    const features = candidates.filter((c) => selected.has(c.feature.properties.code)).map((c) => compactFeature(c.feature));
    try {
      const res = await api.updateZone(features);
      setSavedZone(features);
      loadZone(features);
      setZoneMessage(`${res.count} commune${res.count > 1 ? 's' : ''} enregistrée${res.count > 1 ? 's' : ''}.`);
    } catch (err: unknown) {
      setZoneMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  }

  // Distance de chaque commune au point de départ
  const distances = useMemo(
    () => new Map((candidates ?? []).map((c) => [c.feature.properties.code, distanceToFeature(center, c.feature)])),
    [candidates, center]
  );
  // Toutes les communes proposées restent sur la carte : les décochées y apparaissent en rouge
  const preview = useMemo<ZoneFeature[]>(() => (candidates ?? []).map((c) => c.feature), [candidates]);
  const excluded = useMemo(
    () => new Set((candidates ?? []).map((c) => c.feature.properties.code).filter((code) => !selected.has(code))),
    [candidates, selected]
  );

  return (
    <div className="zone-workspace">
      <aside className="zone-workspace__panel zone-editor">
        <h3 className="admin-section-title">Zone d'intervention</h3>

        <form onSubmit={saveSettings}>
          <fieldset className="form-group zone-editor__start">
            <legend className="form-label">Point de départ (centre du rayon d'intervention)</legend>
            <label className="zone-editor__check">
              <input type="checkbox" checked={startSame} onChange={(e) => setStartSame(e.target.checked)} />
              Identique à l'adresse de l'entreprise
            </label>
            {!startSame && (
              <>
                <AddressAutocomplete
                  required={false}
                  value={startAddress}
                  onChange={setStartAddress}
                  onSelectAddress={(r) => {
                    setStartAddress(r.label);
                    setStartLat(String(r.coordinates[0]));
                    setStartLon(String(r.coordinates[1]));
                  }}
                />
                <div className="zone-editor__gps">
                  <label className="form-label" htmlFor="zone-start-lat">
                    Latitude
                  </label>
                  <input
                    id="zone-start-lat"
                    type="number"
                    step="any"
                    className="form-input"
                    value={startLat}
                    onChange={(e) => setStartLat(e.target.value)}
                  />
                  <label className="form-label" htmlFor="zone-start-lon">
                    Longitude
                  </label>
                  <input
                    id="zone-start-lon"
                    type="number"
                    step="any"
                    className="form-input"
                    value={startLon}
                    onChange={(e) => setStartLon(e.target.value)}
                  />
                </div>
                <p className="form-hint">
                  Choisissez une adresse dans les suggestions, ou saisissez directement des coordonnées GPS (ex. un
                  dépôt sans adresse précise).
                </p>
              </>
            )}
            {startSame && !companyLat && (
              <p className="form-hint">Renseignez d'abord l'adresse de l'entreprise (menu « Déplacement »).</p>
            )}
          </fieldset>
          <div className="form-group">
            <label className="form-label" htmlFor="zone-radius">
              Rayon d'intervention
            </label>
            <div className="form-field-unit">
              <input
                id="zone-radius"
                type="number"
                min="0"
                step="1"
                className="form-input form-input--compact"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
              <span className="form-unit">km</span>
            </div>
            <p className="form-hint">
              Au-delà, la réservation en ligne est bloquée (demande exceptionnelle proposée). Vide : aucune limite.
            </p>
          </div>
          <label className="zone-editor__check">
            <input type="checkbox" checked={neighbours} onChange={(e) => setNeighbours(e.target.checked)} />
            Inclure les communes limitrophes de la commune de départ
          </label>
          <div className="admin-settings-actions">
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
            <ResetButton dirty={settingsDirty} onReset={resetSettings} />
            {settingsMessage && <span className="admin-settings-message">{settingsMessage}</span>}
          </div>
        </form>

        <div className="zone-workspace__communes">
          <p className="admin-settings-intro">
            « Calculer les communes » propose la commune de départ{neighbours ? ', ses limitrophes' : ''}
            {radiusKm > 0 ? ` et les communes au moins partiellement dans le rayon de ${formatKm(radiusKm)}` : ''},
            toutes cochées.
          </p>
          <p className="admin-settings-intro">
            Décochez une commune dans la liste ou faites un clic droit dessus sur la carte : elle passe en rouge. Un
            second clic droit la réintègre. Seules les communes cochées sont enregistrées et affichées sur la vitrine.
          </p>
          <p className="zone-editor__legend-line">
            <span className="zone-editor__legend-title">Légende :</span>
            <span className="zone-editor__legend zone-editor__legend--full">entièrement dans le rayon</span>
            <span className="zone-editor__legend zone-editor__legend--partial">partiellement dans le rayon</span>
            <span className="zone-editor__legend zone-editor__legend--excluded">retirée</span>
          </p>

          <div className="admin-settings-actions">
            <button type="button" className="btn btn-secondary" onClick={requestCompute} disabled={computing}>
              <CalculatorIcon size={18} weight="fill" aria-hidden="true" />
              {computing ? 'Calcul en cours…' : 'Calculer les communes'}
            </button>
            {candidates && candidates.length > 0 && (
              <button type="button" className="btn btn-primary" onClick={saveZone}>
                Enregistrer la zone ({selected.size})
              </button>
            )}
            <ResetButton
              dirty={zoneDirty}
              disabled={computing}
              onReset={() => {
                loadZone(savedZone);
                setZoneMessage(null);
              }}
            />
          </div>
          {zoneMessage && <p className="admin-settings-message">{zoneMessage}</p>}

          {candidates && candidates.length > 0 && (
            <>
              <button
                type="button"
                className="zone-workspace__toggle"
                aria-expanded={!listHidden}
                aria-controls="zone-communes-list"
                onClick={() => setListHidden((h) => !h)}
              >
                {listHidden ? (
                  <CaretDownIcon size={16} weight="fill" aria-hidden="true" />
                ) : (
                  <CaretUpIcon size={16} weight="fill" aria-hidden="true" />
                )}
                {listHidden ? `Afficher la liste (${candidates.length})` : `Masquer la liste (${candidates.length})`}
              </button>

              {!listHidden && (
                <ul className="zone-editor__list" id="zone-communes-list">
                  {candidates.map(({ feature, reasons }) => {
                    const code = feature.properties.code;
                    const distanceKm = distances.get(code) ?? 0;
                    return (
                      <li key={code}>
                        <label>
                          <input type="checkbox" checked={selected.has(code)} onChange={() => toggle(code)} />
                          <span
                            className={`zone-editor__legend zone-editor__legend--${
                              selected.has(code) ? feature.properties.coverage : 'excluded'
                            }`}
                          >
                            {feature.properties.nom}
                          </span>
                          <span className="zone-editor__meta">
                            {distanceKm > 0 ? `à ${formatKm(distanceKm)} du centre` : 'contient le point de départ'}
                            {reasons.length > 0 && ` · ${reasons.map((r) => REASON_LABELS[r]).join(', ')}`}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>

      {confirmCompute && (
        <ConfirmDialog
          title="Remplacer la sélection ?"
          confirmLabel="Recalculer"
          onCancel={() => setConfirmCompute(false)}
          onConfirm={() => {
            setConfirmCompute(false);
            compute();
          }}
        >
          <p>
            Une sélection de {selected.size} commune{selected.size > 1 ? 's' : ''} existe déjà. Le calcul la remplace :
            toutes les communes trouvées seront de nouveau cochées, y compris celles que vous aviez retirées.
          </p>
          <p>Rien n'est enregistré tant que vous ne cliquez pas sur « Enregistrer la zone ».</p>
        </ConfirmDialog>
      )}

      <div className="zone-workspace__map">
        <ZoneMap
          fill
          center={center}
          zoom={11}
          features={preview}
          radiusKm={radiusKm || null}
          autoFit={preview.length > 0}
          excluded={excluded}
          onToggleFeature={toggle}
        />
      </div>
    </div>
  );
};

export default ZoneWorkspace;
