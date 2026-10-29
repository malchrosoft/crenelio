import React, { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import type { BusinessHoursInput, EventDropArg, EventInput } from '@fullcalendar/core';
import { api } from '../../api';
import { Appointment, Schedule, Unavailability } from '../../types';
import ConfirmDialog from './ConfirmDialog';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  /** Rendez-vous déplacé (glisser-déposer) : la liste du planning est mise à jour. */
  onChanged: (appointment: Appointment) => void;
  /** Clic sur un rendez-vous : ouverture de ses actions (statut, emails…). */
  onOpen: (appointment: Appointment) => void;
  /** Clic sur un jour libre : nouveau rendez-vous à cette date (YYYY-MM-DD). */
  onCreate: (date: string) => void;
}

const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/** Format SQL local (les datetimes sont naïfs, cf. APP_TIMEZONE) : pas de conversion UTC. */
function toSql(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Horaires hebdomadaires → plages « ouvertes » de FullCalendar (matin et après-midi). */
function businessHours(schedules: Schedule[]): BusinessHoursInput {
  return schedules
    .filter((s) => s.is_active)
    .flatMap((s) =>
      [
        [s.morning_start, s.morning_end],
        [s.afternoon_start, s.afternoon_end],
      ]
        .filter(([start, end]) => start && end)
        .map(([start, end]) => ({ daysOfWeek: [s.day_of_week % 7], startTime: start!, endTime: end! }))
    );
}

/**
 * Calendrier des interventions (Item 23) : vues mois / semaine / jour / liste, horaires de travail,
 * indisponibilités, glisser-déposer validé par le moteur de créneaux (forçable sur confirmation).
 */
const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments, onChanged, onOpen, onCreate }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Déplacement refusé par le moteur de créneaux, en attente de la décision de l'artisan
  const [refused, setRefused] = useState<{ drop: EventDropArg; message: string } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    Promise.all([api.getSchedules(), api.listUnavailabilities()])
      .then(([s, u]) => {
        setSchedules(s);
        setUnavailabilities(u);
      })
      .catch(() => setError('Horaires ou indisponibilités indisponibles : affichage partiel.'));
  }, []);

  const events = useMemo<EventInput[]>(
    () => [
      ...appointments
        .filter((a) => showCancelled || a.status !== 'cancelled')
        .map((a) => ({
          id: String(a.id),
          title: `${a.client_name}${a.service_name ? ` — ${a.service_name}` : ''}`,
          start: a.start_datetime.replace(' ', 'T'),
          end: a.end_datetime.replace(' ', 'T'),
          classNames: ['calendar-event', `calendar-event--${a.status}`],
          // Seuls les rendez-vous à venir et actifs se déplacent
          editable: a.status === 'pending' || a.status === 'confirmed',
          extendedProps: { appointment: a },
        })),
      ...unavailabilities.map((u) => ({
        id: `u${u.id}`,
        title: u.title,
        start: u.start_datetime.replace(' ', 'T'),
        end: u.end_datetime.replace(' ', 'T'),
        display: 'background',
        classNames: ['calendar-unavailability'],
      })),
    ],
    [appointments, unavailabilities, showCancelled]
  );

  async function move(drop: EventDropArg, force: boolean) {
    const appointment = drop.event.extendedProps.appointment as Appointment;
    try {
      const updated = await api.rescheduleAppointment(appointment.id, toSql(drop.event.start!), undefined, {
        check: true,
        force,
      });
      onChanged(updated);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Déplacement impossible';
      if (!force && /proposable/.test(message)) {
        setRefused({ drop, message });
        return;
      }
      drop.revert();
      setError(message);
    }
  }

  return (
    <div className="appointment-calendar">
      <div className="appointment-calendar__toolbar">
        <label className="appointment-calendar__toggle">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
          Afficher les rendez-vous annulés
        </label>
        <ul className="appointment-calendar__legend" aria-label="Légende">
          {(['confirmed', 'pending', 'completed', 'cancelled'] as const).map((status) => (
            <li key={status} className={`appointment-calendar__legend-item appointment-calendar__legend-item--${status}`}>
              {STATUS_LABELS[status]}
            </li>
          ))}
          <li className="appointment-calendar__legend-item appointment-calendar__legend-item--unavailable">Indisponible</li>
        </ul>
      </div>

      {error && (
        <p className="admin-settings-message admin-settings-message--error" role="alert">
          {error}
        </p>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        locale={frLocale}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
        height="auto"
        nowIndicator
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        businessHours={businessHours(schedules)}
        events={events}
        eventDrop={(drop) => move(drop, false)}
        eventClick={(info) => {
          const appointment = info.event.extendedProps.appointment as Appointment | undefined;
          if (appointment) onOpen(appointment);
        }}
        dateClick={(info) => onCreate(info.dateStr.slice(0, 10))}
      />

      {refused && (
        <ConfirmDialog
          title="Créneau non proposable"
          confirmLabel="Déplacer quand même"
          onConfirm={() => {
            const drop = refused.drop;
            setRefused(null);
            move(drop, true);
          }}
          onCancel={() => {
            refused.drop.revert();
            setRefused(null);
          }}
        >
          {refused.message}. Un client ne pourrait pas réserver ce créneau en ligne : le déplacer quand même ?
        </ConfirmDialog>
      )}
    </div>
  );
};

export default AppointmentCalendar;
