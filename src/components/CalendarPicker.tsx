import React, { useState } from 'react';
import clsx from 'clsx';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarPickerProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  maxAdvanceDays?: number;
  /** Jours réservables (YYYY-MM-DD) ; les autres sont grisés. Absent : tous les jours de la fenêtre. */
  availableDates?: Set<string>;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  maxAdvanceDays = 30,
  availableDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const today = startOfDay(new Date());
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + maxAdvanceDays);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          disabled={isBefore(monthStart, startOfMonth(today))}
          type="button"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <h3>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h3>
        <button
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={isBefore(maxDate, addMonths(monthStart, 1))}
          type="button"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {dayNames.map((name) => (
          <div key={name} className="calendar-day-name">
            {name}
          </div>
        ))}

        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(day, today);
          const isTooFar = isBefore(maxDate, day);
          const isUnavailable = availableDates !== undefined && !availableDates.has(format(day, 'yyyy-MM-dd'));
          const isDisabled = !isCurrentMonth || isPast || isTooFar || isUnavailable;
          const isSelected = selectedDateObj && isSameDay(day, selectedDateObj);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isDisabled}
              className={clsx('calendar-day-btn', {
                selected: isSelected,
                today: isToday,
              })}
              onClick={() => {
                if (!isDisabled) {
                  onSelectDate(format(day, 'yyyy-MM-dd'));
                }
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPicker;
