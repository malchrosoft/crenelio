import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import InterventionMap from './InterventionMap';
import { Service, Slot, BookingPayload, AddressResult } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookingFormProps {
  service: Service;
  slot: Slot;
  defaultCenter?: [number, number];
  defaultZoom?: number;
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

  const slotDateObj = new Date(slot.start_datetime);
  const formattedDate = format(slotDateObj, 'EEEE d MMMM yyyy', { locale: fr });

  function handleSelectAddress(result: AddressResult) {
    setAddress(result.address);
    setPostalCode(result.postal_code);
    setCity(result.city);
    setCoordinates(result.coordinates);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    });
  }

  return (
    <div className="card">
      <h2 className="card-title">3. Vos coordonnées & Lieu d'intervention</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: 20, fontSize: '0.95rem' }}>
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
          <span className="summary-value" style={{ textTransform: 'capitalize' }}>
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
          <span className="summary-label">Tarif indicatif :</span>
          <span className="summary-value">
            {parseFloat(String(service.price)) > 0
              ? `${parseFloat(String(service.price)).toFixed(2).replace('.', ',')} €`
              : 'Gratuit'}
          </span>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: '0.9rem',
          }}
        >
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
            <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 4 }}>
              ✓ Coordonnées GPS validées pour le déplacement de l'artisan
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

        <div
          style={{
            marginTop: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            ← Modifier le créneau
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Confirmation en cours...' : 'Confirmer le rendez-vous ✓'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
