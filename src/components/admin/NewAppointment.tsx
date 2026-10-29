import React, { useState } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { AppConfig, BookingPayload, Service, Slot } from '../../types';
import ServiceSelector from '../ServiceSelector';
import SlotPicker from '../SlotPicker';
import BookingForm from '../BookingForm';
import { isPremisesOnly, premisesLabel } from '../../utils/zone';

interface NewAppointmentProps {
  config: AppConfig;
  services: Service[];
  onDone: () => void;
  onCancel: () => void;
  /** Date présélectionnée (YYYY-MM-DD), depuis un clic dans le calendrier. */
  initialDate?: string | null;
}

/**
 * Saisie d'un rendez-vous par l'artisan, avec les formulaires partagés de la réservation en ligne.
 * Toute saisie est enregistrable : tous les jours et une heure libre, email et adresse facultatifs,
 * hors zone signalé mais forçable.
 */
const NewAppointment: React.FC<NewAppointmentProps> = ({ config, services, onDone, onCancel, initialDate = null }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(initialDate);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = parseFloat(config.default_latitude ?? '');
  const lon = parseFloat(config.default_longitude ?? '');

  async function handleSubmit(payload: BookingPayload) {
    setSaving(true);
    setError(null);
    try {
      await api.createAdminAppointment(payload);
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-new-appointment">
      <div className="admin-section-header">
        <h3 className="admin-section-title">Nouveau rendez-vous</h3>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
          Retour au planning
        </button>
      </div>

      {step === 1 && (
        <ServiceSelector
          services={services.filter((s) => s.is_active)}
          selectedService={service}
          onSelect={setService}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && service && (
        <SlotPicker
          adminMode
          service={service}
          selectedDate={date}
          onSelectDate={setDate}
          selectedSlot={slot}
          onSelectSlot={setSlot}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && service && slot && (
        <BookingForm
          adminMode
          service={service}
          slot={slot}
          defaultCenter={[isNaN(lat) ? 48.8 : lat, isNaN(lon) ? 2.2625 : lon]}
          defaultZoom={parseInt(config.default_zoom ?? '12', 10) || 12}
          proPhone={config.pro_phone}
          premisesAddress={isPremisesOnly(config) ? premisesLabel(config) || null : null}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
          loading={saving}
          error={error}
        />
      )}
    </div>
  );
};

export default NewAppointment;
