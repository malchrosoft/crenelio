import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import CalendarPicker from './CalendarPicker';
import { api } from '../api';
import { Service, Slot, SlotAvailability } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SlotPickerProps {
  service: Service;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot | null) => void;
  onBack: () => void;
  onNext: () => void;
  /** Espace Artisan : tous les jours ouverts au choix et heure libre possible, hors créneaux proposés. */
  adminMode?: boolean;
}

/** Créneau construit à partir d'une heure libre (HH:MM) et de la durée de la prestation. */
function freeSlot(date: string, time: string, durationMinutes: number): Slot {
  const [h, m] = time.split(':').map(Number);
  const endMinutes = h * 60 + m + durationMinutes;
  const pad = (n: number) => String(n).padStart(2, '0');
  // Au-delà de minuit : borné à 23:59 (cas marginal, saisie libre de l'artisan)
  const end = endMinutes >= 24 * 60 ? '23:59' : `${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`;
  return { start: time, end, start_datetime: `${date} ${time}:00`, end_datetime: `${date} ${end}:00` };
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  service,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  onBack,
  onNext,
  adminMode = false,
}) => {
  const [freeTime, setFreeTime] = useState('');

  // Changement de jour : l'heure libre saisie ne vaut plus
  useEffect(() => setFreeTime(''), [selectedDate]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // undefined : chargement en cours ; null : indisponible (repli sans grisage)
  const [availability, setAvailability] = useState<SlotAvailability | null | undefined>(undefined);

  // Jours réservables pour cette prestation (horaires, durée, planning, indisponibilités)
  useEffect(() => {
    let isMounted = true;
    setAvailability(undefined);
    api
      .getSlotAvailability(service.id)
      .then((res) => isMounted && setAvailability(res))
      .catch(() => isMounted && setAvailability(null));
    return () => {
      isMounted = false;
    };
  }, [service]);

  // Pendant le chargement, aucun jour cliquable : évite de choisir un jour qui sera grisé
  const availableDates = useMemo(
    () =>
      adminMode
        ? undefined
        : availability === undefined
          ? new Set<string>()
          : availability
            ? new Set(availability.dates)
            : undefined,
    [availability, adminMode]
  );

  useEffect(() => {
    if (!selectedDate || !service) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .getSlots(service.id, selectedDate)
      .then((res) => {
        if (isMounted) {
          setSlots(res.slots || []);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setSlots([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, service]);

  const formattedDate = selectedDate
    ? format(new Date(selectedDate + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: fr })
    : '';

  return (
    <div className="card">
      <h2 className="card-title">2. Choisissez la date et le créneau</h2>
      <p className="card-subtitle">
        Prestation : <strong>{service.name}</strong> ({service.duration_minutes} min)
      </p>

      <div className="booking-calendar-layout">
        <div>
          <label className="form-label">Sélectionnez un jour</label>
          <CalendarPicker
            maxAdvanceDays={adminMode ? 365 : availability?.max_advance_days}
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              onSelectDate(d);
              onSelectSlot(null);
            }}
          />
        </div>

        <div className="slots-container">
          <label className="form-label">
            Créneaux disponibles {formattedDate && `pour le ${formattedDate}`}
          </label>

          {loading ? (
            <div className="slots-loading">
              Recherche des disponibilités...
            </div>
          ) : error ? (
            <div className="slots-error">{error}</div>
          ) : slots.length === 0 ? (
            <div className="slots-empty">
              Aucun créneau disponible pour cette journée.
              <br />
              Veuillez sélectionner une autre date.
            </div>
          ) : (
            <div className="slots-grid">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start_datetime === slot.start_datetime;
                return (
                  <button
                    key={slot.start_datetime}
                    type="button"
                    className={clsx('slot-btn', { selected: isSelected })}
                    onClick={() => {
                      setFreeTime('');
                      onSelectSlot(slot);
                    }}
                  >
                    {slot.start} – {slot.end}
                  </button>
                );
              })}
            </div>
          )}
          {adminMode && selectedDate && (
            <div className="slots-free-time">
              <label className="form-label" htmlFor="slot-free-time">
                Ou une heure libre (hors créneaux proposés)
              </label>
              <input
                id="slot-free-time"
                type="time"
                step={300}
                className="form-input form-input--compact"
                value={freeTime}
                onChange={(e) => {
                  setFreeTime(e.target.value);
                  onSelectSlot(e.target.value ? freeSlot(selectedDate, e.target.value, service.duration_minutes) : null);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="form-actions-between">
        <button className="btn btn-secondary" onClick={onBack} type="button">
          ← Retour aux prestations
        </button>
        <button
          className="btn btn-primary"
          disabled={!selectedSlot}
          onClick={onNext}
          type="button"
        >
          Continuer vers vos coordonnées →
        </button>
      </div>
    </div>
  );
};

export default SlotPicker;
