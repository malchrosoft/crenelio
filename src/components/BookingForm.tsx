import React, { useState, useEffect } from 'react';
import { MapPinIcon, WarningCircleIcon, PhoneIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react';
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
  proEmail?: string;
  proPhone?: string;
  onSubmit: (payload: BookingPayload) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  service,
  slot,
  defaultCenter,
  defaultZoom,
  proEmail,
  proPhone,
  onSubmit,
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

  /** Lien mailto pré-rempli pour une demande d'intervention exceptionnelle hors zone. */
  function buildExceptionalRequestLink(): string {
    const subject = `Demande d'intervention hors zone — ${service.name}`;
    const lines = [
      `Bonjour,`,
      ``,
      `Je souhaite une intervention bien que mon adresse se situe hors de votre zone habituelle.`,
      ``,
      `Prestation souhaitée : ${service.name}`,
      `Créneau envisagé : ${formattedDate} à ${slot.start}`,
      `Nom : ${clientName}`,
      `Téléphone : ${clientPhone}`,
      `Email : ${clientEmail}`,
      `Adresse : ${address}, ${postalCode} ${city}`,
      travelQuote?.distance_km !== null && travelQuote?.distance_km !== undefined
        ? `Distance estimée : ${formatKm(travelQuote.distance_km)}`
        : '',
      notes ? `Précisions : ${notes}` : '',
      ``,
      `Merci par avance pour votre retour.`,
    ].filter((line, index, all) => line !== '' || all[index - 1] !== '');

    return `mailto:${proEmail ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBookable) {
      return;
    }
    await onSubmit({
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
  }

  return (
    <div className="card">
      <h2 className="card-title">3. Vos coordonnées & Lieu d'intervention</h2>
      <p className="card-subtitle">
        Renseignez l'adresse où le technicien interviendra et vos coordonnées pour la confirmation.
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

      {/* Blocage bienveillant hors zone d'intervention */}
      {isOutOfZone && travelQuote && (
        <div className="booking-out-of-zone">
          <div className="booking-out-of-zone__header">
            <WarningCircleIcon size={22} weight="fill" aria-hidden="true" />
            <strong>Adresse hors de la zone d'intervention</strong>
          </div>
          <p className="booking-out-of-zone__text">
            Votre adresse se situe à{' '}
            <strong>{travelQuote.distance_km !== null ? formatKm(travelQuote.distance_km) : '—'}</strong> du
            point de départ, au-delà du rayon habituel de{' '}
            <strong>{travelQuote.max_km !== null ? formatKm(travelQuote.max_km) : '—'}</strong>. La réservation
            en ligne n'est pas possible, mais un déplacement exceptionnel reste envisageable : écrivez-nous et
            nous reviendrons vers vous rapidement.
          </p>
          <div className="booking-out-of-zone__actions">
            {proEmail && (
              <a className="btn btn-primary" href={buildExceptionalRequestLink()}>
                <EnvelopeSimpleIcon size={16} weight="fill" aria-hidden="true" />
                Envoyer une demande exceptionnelle
              </a>
            )}
            {proPhone && (
              <a className="btn btn-secondary" href={`tel:${proPhone.replace(/\s/g, '')}`}>
                <PhoneIcon size={16} weight="fill" aria-hidden="true" />
                {proPhone}
              </a>
            )}
          </div>
        </div>
      )}

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
          <label className="form-label">Adresse email (pour la confirmation) *</label>
          <input
            type="email"
            className="form-input"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Ex: jean.dupont@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Adresse d'intervention (recherche automatique) *</label>
          <AddressAutocomplete
            value={address}
            onChange={setAddress}
            onSelectAddress={handleSelectAddress}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Code postal *</label>
            <input
              type="text"
              className="form-input"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Ex: 92140"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ville *</label>
            <input
              type="text"
              className="form-input"
              required
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
              Cette prestation facture le déplacement à la distance : sélectionnez votre adresse dans les
              suggestions pour calculer les frais.
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Précisions d'accès ou description du problème</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Digicode, étage, marque de l'appareil, panne constatée..."
          />
        </div>

        <div className="form-actions-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            ← Modifier le créneau
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || !isBookable}>
            {loading ? 'Confirmation en cours...' : 'Confirmer le rendez-vous ✓'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
