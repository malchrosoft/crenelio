import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { LockKeyIcon, ArrowLeftIcon, UserIcon } from '@phosphor-icons/react';
import { api } from '../api';
import { Service, Slot, Appointment, BookingPayload, AppConfig } from '../types';
import ServiceSelector from '../components/ServiceSelector';
import SlotPicker from '../components/SlotPicker';
import BookingForm from '../components/BookingForm';
import BookingConfirmation from '../components/BookingConfirmation';
import BrandMark from '../components/BrandMark';
import AdminDashboard from '../components/AdminDashboard';

interface BookingPageProps {
  config: AppConfig;
  services: Service[];
}

/**
 * Page de réservation — stepper en 3 étapes.
 * Header allégé avec lien retour vers la vitrine.
 * Support de ?service=ID depuis la vitrine (pré-sélection de la prestation).
 */
const BookingPage: React.FC<BookingPageProps> = ({ config, services }) => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service');
  const initialAdmin = searchParams.get('admin') === '1' || searchParams.get('view') === 'admin';

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(initialAdmin);

  // Pré-sélection de la prestation depuis la vitrine (?service=ID)
  useEffect(() => {
    if (preselectedServiceId && services.length > 0) {
      const found = services.find((s) => String(s.id) === preselectedServiceId && s.is_active);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
  }, [preselectedServiceId, services]);

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
    <div>
      {/* Header allégé avec retour vitrine */}
      <div className="booking-page-header">
        <Link to="/" className="booking-page-header__back">
          <ArrowLeftIcon size={18} weight="bold" />
          Retour à l'accueil
        </Link>
        <span className="booking-page-header__brand">
          <BrandMark config={config} iconSize={22} />
        </span>
        <button
          type="button"
          className="btn btn-secondary booking-page-header__admin-btn"
          onClick={() => setIsAdminView(!isAdminView)}
        >
          {isAdminView ? (
            <>
              <UserIcon size={16} weight="fill" />
              Espace Client
            </>
          ) : (
            <>
              <LockKeyIcon size={16} weight="fill" />
              Espace Pro
            </>
          )}
        </button>
      </div>

      <div className="container">
        {/* Vue Admin */}
        {isAdminView ? (
          <AdminDashboard onBackToClient={() => setIsAdminView(false)} />
        ) : (
          <>
            {/* Stepper */}
            {step < 4 && (
              <div className="stepper">
                <div
                  className={clsx('step-item', {
                    active: step === 1,
                    completed: step > 1,
                  })}
                >
                  <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                  <span>Prestation</span>
                </div>
                <div
                  className={clsx('step-item', {
                    active: step === 2,
                    completed: step > 2,
                  })}
                >
                  <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                  <span>Date &amp; Heure</span>
                </div>
                <div
                  className={clsx('step-item', {
                    active: step === 3,
                  })}
                >
                  <div className="step-number">3</div>
                  <span>Coordonnées</span>
                </div>
              </div>
            )}

            {/* Étape 1 */}
            {step === 1 && (
              <ServiceSelector
                services={services}
                selectedService={selectedService}
                onSelect={(service) => setSelectedService(service)}
                onNext={() => setStep(2)}
              />
            )}

            {/* Étape 2 */}
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

            {/* Étape 3 */}
            {step === 3 && selectedService && selectedSlot && (() => {
              const defaultLat = config.default_latitude ? parseFloat(config.default_latitude) : 48.8000;
              const defaultLon = config.default_longitude ? parseFloat(config.default_longitude) : 2.2625;
              const defaultZoom = config.default_zoom ? parseInt(config.default_zoom, 10) : 12;
              const defaultCenter: [number, number] = [
                isNaN(defaultLat) ? 48.8000 : defaultLat,
                isNaN(defaultLon) ? 2.2625 : defaultLon,
              ];
              return (
                <BookingForm
                  service={selectedService}
                  slot={selectedSlot}
                  defaultCenter={defaultCenter}
                  defaultZoom={isNaN(defaultZoom) ? 12 : defaultZoom}
                  proEmail={config.pro_email}
                  proPhone={config.pro_phone}
                  onSubmit={handleBookingSubmit}
                  onBack={() => setStep(2)}
                  loading={loading}
                  error={error}
                />
              );
            })()}

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
    </div>
  );
};

export default BookingPage;
