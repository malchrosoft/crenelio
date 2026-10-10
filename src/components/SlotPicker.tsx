import React, { useEffect, useState } from 'react';
import CalendarPicker from './CalendarPicker';
import { api } from '../api';
import { Service, Slot } from '../types';
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
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  service,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  onBack,
  onNext,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      <p style={{ color: 'var(--gray-500)', marginBottom: 20, fontSize: '0.95rem' }}>
        Prestation : <strong>{service.name}</strong> ({service.duration_minutes} min)
      </p>

      <div className="booking-calendar-layout">
        <div>
          <label className="form-label">Sélectionnez un jour</label>
          <CalendarPicker
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
            <div style={{ padding: '24px 0', color: 'var(--gray-500)' }}>
              Recherche des disponibilités...
            </div>
          ) : error ? (
            <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>
          ) : slots.length === 0 ? (
            <div
              style={{
                background: 'var(--gray-50)',
                border: '1px dashed var(--gray-300)',
                borderRadius: 'var(--radius)',
                padding: 24,
                textAlign: 'center',
                color: 'var(--gray-500)',
                fontSize: '0.9rem',
              }}
            >
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
                    className={`slot-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectSlot(slot)}
                  >
                    {slot.start} – {slot.end}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
