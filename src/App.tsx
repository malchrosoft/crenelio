import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Service, Slot, Appointment, BookingPayload, AppConfig } from './types';
import ServiceSelector from './components/ServiceSelector';
import SlotPicker from './components/SlotPicker';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import AdminDashboard from './components/AdminDashboard';

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({});
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  useEffect(() => {
    // Chargement de la configuration publique et des prestations
    Promise.all([api.getConfig(), api.listServices()])
      .then(([cfg, servs]) => {
        setConfig(cfg);
        setServices(servs);
      })
      .catch((err: Error) => {
        console.error('Erreur chargement initial:', err);
      });
  }, []);

  async function handleBookingSubmit(payload: BookingPayload) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createAppointment(payload);
      setConfirmedAppointment(res.appointment);
      setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue lors de la réservation';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setConfirmedAppointment(null);
    setStep(1);
    setError(null);
  }

  return (
    <div className="container">
      {/* En-tête */}
      <header className="app-header">
        <div>
          <div className="brand-title">
            <span>🗓️</span> {config.company_name || 'Crénelio'}
          </div>
          <div className="brand-subtitle">
            {config.pro_name ? `Artisan : ${config.pro_name}` : 'Prise de rendez-vous en ligne à domicile'}
            {config.pro_phone ? ` • Tél : ${config.pro_phone}` : ''}
          </div>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            onClick={() => setIsAdminView(!isAdminView)}
          >
            {isAdminView ? '← Espace Client' : '🔐 Espace Pro'}
          </button>
        </div>
      </header>

      {/* Vue Admin */}
      {isAdminView ? (
        <AdminDashboard onBackToClient={() => setIsAdminView(false)} />
      ) : (
        <>
          {/* Stepper */}
          {step < 4 && (
            <div className="stepper">
              <div
                className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
              >
                <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                <span>Prestation</span>
              </div>
              <div
                className={`step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
              >
                <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                <span>Date & Heure</span>
              </div>
              <div className={`step-item ${step === 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span>Coordonnées</span>
              </div>
            </div>
          )}

          {/* Étape 1 : Choix de la prestation */}
          {step === 1 && (
            <ServiceSelector
              services={services}
              selectedService={selectedService}
              onSelect={(service) => setSelectedService(service)}
              onNext={() => setStep(2)}
            />
          )}

          {/* Étape 2 : Date & Créneau */}
          {step === 2 && selectedService && (
            <SlotPicker
              service={selectedService}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              selectedSlot={selectedSlot}
              onSelectSlot={(s) => setSelectedSlot(s)}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {/* Étape 3 : Coordonnées & Lieu d'intervention */}
          {step === 3 && selectedService && selectedSlot && (
            <BookingForm
              service={selectedService}
              slot={selectedSlot}
              onSubmit={handleBookingSubmit}
              onBack={() => setStep(2)}
              loading={loading}
              error={error}
            />
          )}

          {/* Étape 4 : Confirmation */}
          {step === 4 && confirmedAppointment && (
            <BookingConfirmation
              appointment={confirmedAppointment}
              onNewBooking={handleReset}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
