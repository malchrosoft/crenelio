import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, EnvelopeSimpleIcon, MapPinIcon, PhoneIcon, WarningCircleIcon } from '@phosphor-icons/react';
import AddressAutocomplete from './AddressAutocomplete';
import InterventionMap from './InterventionMap';
import { api } from '../api';
import { Service, Slot, BookingPayload, AddressResult, TravelQuote } from '../types';
import { formatEuro, formatKm } from '../utils/format';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookingFormProps {
  service: Service;
  slot: Slot;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  proPhone?: string;
  /** Adresse des locaux si l'artisan ne se déplace pas : aucune adresse n'est demandée au client. */
  premisesAddress?: string | null;
  onSubmit: (payload: BookingPayload) => Promise<void>;
  /** Espace Artisan : toute saisie est enregistrable (email et adresse facultatifs, hors zone forçable). */
  adminMode?: boolean;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  service,
  slot,
  defaultCenter,
  defaultZoom,
  premisesAddress,
  proPhone,
  onSubmit,
  adminMode = false,
  onBack,
  loading,
  error,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  // Décomposition tarifaire (prestation + déplacement), recalculée par l'API
  const [travelQuote, setTravelQuote] = useState<TravelQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const slotDateObj = new Date(slot.start_datetime);
  const formattedDate = format(slotDateObj, 'EEEE d MMMM yyyy', { locale: fr });

  // Estimation des frais dès que la prestation ou l'adresse géocodée change.
  useEffect(() => {
    let cancelled = false;
    setQuoteLoading(true);

    api
      .quoteTravelFee(service.id, coordinates)
      .then((quote) => {
        if (!cancelled) setTravelQuote(quote);
      })
      .catch(() => {
        if (!cancelled) setTravelQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [service.id, coordinates]);

  const isOutOfZone = travelQuote?.is_out_of_zone ?? false;
  const needsCoordinates = travelQuote?.needs_coordinates ?? false;
  const isBookable = !isOutOfZone && !needsCoordinates;

  function handleSelectAddress(result: AddressResult) {
    setAddress(result.address);
    setPostalCode(result.postal_code);
    setCity(result.city);
    setCoordinates(result.coordinates);
  }

  // Demande exceptionnelle (hors zone, à moins du rayon + 10 %) envoyée par l'application à l'artisan
  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);

  const canRequest = !adminMode && isOutOfZone && (travelQuote?.can_request_exception ?? false);
  // Espace Artisan : envoi des confirmations (client si email, fiche artisan avec .ics)
  const [notify, setNotify] = useState(true);

  // Champs obligatoires déjà contrôlés par le navigateur (soumission du formulaire)
  async function sendExceptionalRequest() {
    setRequestError(null);
    setRequestState('sending');
    try {
      await api.requestException({
        service_id: service.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        address,
        postal_code: postalCode,
        city,
        notes,
        start_datetime: slot.start_datetime,
        latitude: coordinates ? coordinates[0] : undefined,
        longitude: coordinates ? coordinates[1] : undefined,
      });
      setRequestState('sent');
    } catch (err: unknown) {
      setRequestState('idle');
      setRequestError(err instanceof Error ? err.message : "La demande n'a pas pu être envoyée");
    }
  }

  // Nouvelle adresse : la demande éventuellement envoyée concernait la précédente
  useEffect(() => {
    setRequestState('idle');
    setRequestError(null);
  }, [coordinates]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canRequest) {
      if (requestState === 'idle') await sendExceptionalRequest();
      return;
    }
    if (!adminMode && !isBookable) {
      return;
    }
    await onSubmit({
      service_id: service.id,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      // Dans les locaux, le serveur impose l'adresse de l'entreprise
      address: premisesAddress ? '-' : address,
      postal_code: premisesAddress ? '-' : postalCode,
      city: premisesAddress ? '-' : city,
      notes,
      start_datetime: slot.start_datetime,
      latitude: coordinates ? coordinates[0] : undefined,
      longitude: coordinates ? coordinates[1] : undefined,
      ...(adminMode ? { notify } : {}),
    });
  }

  return (
    <div className="card">
      <h2 className="card-title">
        {adminMode
          ? premisesAddress
            ? '3. Coordonnées du client'
            : "3. Client & lieu d'intervention"
          : premisesAddress
            ? '3. Vos coordonnées'
            : "3. Vos coordonnées & Lieu d'intervention"}
      </h2>
      <p className="card-subtitle">
        {adminMode
          ? "Seuls le nom et le téléphone sont obligatoires ; un rendez-vous hors zone reste enregistrable."
          : premisesAddress
          ? 'Renseignez vos coordonnées pour la confirmation du rendez-vous.'
          : "Renseignez l'adresse où le technicien interviendra et vos coordonnées pour la confirmation."}
      </p>

      {/* Récapitulatif du créneau */}
      <div className="summary-box">
        <div className="summary-row">
          <span className="summary-label">Prestation :</span>
          <span className="summary-value">{service.name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Date :</span>
          <span className="summary-value summary-value--capitalized">
            {formattedDate}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Horaire prévu :</span>
          <span className="summary-value">
            {slot.start} – {slot.end} ({service.duration_minutes} min)
          </span>
        </div>
        {premisesAddress && (
          <div className="summary-row">
            <span className="summary-label">Lieu du rendez-vous :</span>
            <span className="summary-value">{premisesAddress}</span>
          </div>
        )}
        <div className="summary-row">
          <span className="summary-label">Tarif de la prestation :</span>
          <span className="summary-value">
            {formatEuro(travelQuote?.service_price ?? parseFloat(String(service.price)))}
          </span>
        </div>

        {/* Transparence tarifaire : le déplacement n'est affiché que s'il est facturé */}
        {travelQuote && travelQuote.mode !== 'none' && (
          <div className="summary-row">
            <span className="summary-label">Frais de déplacement :</span>
            <span className="summary-value">
              {needsCoordinates ? (
                <span className="summary-value--pending">À calculer selon l'adresse</span>
              ) : (
                <>
                  {formatEuro(travelQuote.travel_fee)}
                  {travelQuote.distance_km !== null && (
                    <span className="summary-distance">
                      <MapPinIcon size={13} weight="fill" aria-hidden="true" />
                      {formatKm(travelQuote.distance_km)}
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
        )}

        <div className="summary-row summary-row--total">
          <span className="summary-label">Total estimé :</span>
          <span className="summary-value">
            {quoteLoading && !travelQuote
              ? '…'
              : formatEuro(travelQuote?.total ?? parseFloat(String(service.price)))}
          </span>
        </div>
      </div>

      {error && (
        <div className="form-alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nom et Prénom *</label>
            <input
              type="text"
              className="form-input"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Numéro de téléphone *</label>
            <input
              type="tel"
              className="form-input"
              required
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Ex: 06 12 34 56 78"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            {adminMode ? 'Adresse email (facultative)' : 'Adresse email (pour la confirmation) *'}
          </label>
          <input
            type="email"
            className="form-input"
            required={!adminMode}
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Ex: jean.dupont@example.com"
          />
        </div>

        {/* Adresse d'intervention : inutile si le rendez-vous a lieu dans les locaux */}
        {!premisesAddress && (
          <>
            <div className="form-group">
              <label className="form-label">
                Adresse d'intervention (recherche automatique){adminMode ? '' : ' *'}
              </label>
              <AddressAutocomplete
                required={!adminMode}
                value={address}
                onChange={setAddress}
                onSelectAddress={handleSelectAddress}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Code postal{adminMode ? '' : ' *'}</label>
                <input
                  type="text"
                  className="form-input"
                  required={!adminMode}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Ex: 92140"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ville{adminMode ? '' : ' *'}</label>
                <input
                  type="text"
                  className="form-input"
                  required={!adminMode}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Clamart"
                />
              </div>
            </div>

            {/* Carte OpenStreetMap avec Pigeon Maps */}
            <div className="form-group">
              <label className="form-label">Localisation sur la carte (OpenStreetMap)</label>
              <InterventionMap
                coordinates={coordinates}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                height={200}
              />
              {coordinates && (
                <div className="form-gps-status">
                  ✓ Coordonnées GPS validées pour le déplacement de l'artisan
                </div>
              )}
              {!coordinates && needsCoordinates && (
                <div className="form-gps-hint">
                  <MapPinIcon size={15} weight="fill" aria-hidden="true" />
                  Sélectionnez votre adresse dans les suggestions pour vérifier qu'elle est dans la zone
                  d'intervention et calculer les éventuels frais de déplacement.
                </div>
              )}
            </div>

          </>
        )}

        <div className="form-group">
          <label className="form-label">
            {premisesAddress ? 'Description de votre besoin' : "Précisions d'accès ou description du problème"}
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              premisesAddress
                ? "Marque de l'appareil, panne constatée..."
                : "Digicode, étage, marque de l'appareil, panne constatée..."
            }
          />
        </div>

        {/* Encart hors zone, en fin de formulaire ; demande exceptionnelle à moins du rayon + 10 % */}
        {isOutOfZone && travelQuote && (
          <div className="booking-out-of-zone">
            <div className="booking-out-of-zone__header">
              <WarningCircleIcon size={22} weight="fill" aria-hidden="true" />
              <strong>Adresse hors de la zone d'intervention</strong>
            </div>
            <p className="booking-out-of-zone__text">
              {travelQuote.out_of_zone_reason === 'commune' ? (
                <>
                  Votre commune{city ? <> (<strong>{city}</strong>)</> : null} ne fait pas partie des communes
                  desservies.
                </>
              ) : (
                <>
                  Votre adresse se situe à{' '}
                  <strong>{travelQuote.distance_km !== null ? formatKm(travelQuote.distance_km) : '—'}</strong> du
                  point de départ, au-delà du rayon habituel de{' '}
                  <strong>{travelQuote.max_km !== null ? formatKm(travelQuote.max_km) : '—'}</strong>.
                </>
              )}{' '}
              {adminMode
                ? "Vous pouvez tout de même forcer l'enregistrement de ce rendez-vous."
                : travelQuote.can_request_exception
                ? "La réservation directe n'est pas possible, mais un déplacement exceptionnel reste envisageable : envoyez une demande pour ce créneau, l'artisan l'acceptera ou la refusera."
                : "Cette adresse n'est pas desservie."}
            </p>
            {canRequest && requestState === 'sent' && (
              <p className="booking-out-of-zone__sent">
                <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
                Demande transmise : vous allez recevoir un email de confirmation de la transmission. Le créneau
                est réservé le temps que l'artisan accepte ou refuse votre demande ; vous serez prévenu par email.
              </p>
            )}
            {canRequest && requestState !== 'sent' && proPhone && (
              <p className="booking-out-of-zone__phone">
                <PhoneIcon size={16} weight="fill" aria-hidden="true" />
                Une question ? <a href={`tel:${proPhone.replace(/\s/g, '')}`}>{proPhone}</a>
              </p>
            )}
            {requestError && <p className="booking-out-of-zone__error">{requestError}</p>}
          </div>
        )}

        {adminMode && (
          <label className="booking-form__notify">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Envoyer les confirmations par email (au client si son email est renseigné, et votre fiche avec le
            fichier agenda)
          </label>
        )}

        <div className="form-actions-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            ← Modifier le créneau
          </button>
          {/* Hors zone mais proche : la confirmation devient l'envoi d'une demande à l'artisan */}
          {adminMode ? (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? 'Enregistrement…'
                : isOutOfZone
                  ? "Forcer l'enregistrement (hors zone)"
                  : 'Enregistrer le rendez-vous'}
            </button>
          ) : canRequest ? (
            requestState !== 'sent' && (
              <button type="submit" className="btn btn-primary" disabled={requestState === 'sending'}>
                <EnvelopeSimpleIcon size={16} weight="fill" aria-hidden="true" />
                {requestState === 'sending' ? 'Envoi…' : 'Envoyer une demande exceptionnelle'}
              </button>
            )
          ) : (
            <button type="submit" className="btn btn-primary" disabled={loading || !isBookable}>
              {loading ? 'Confirmation en cours...' : 'Confirmer le rendez-vous ✓'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
