import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Schedule } from '../../types';
import ResetButton from './ResetButton';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIME_FIELDS = ['morning_start', 'morning_end', 'afternoon_start', 'afternoon_end'] as const;

type TimeField = (typeof TIME_FIELDS)[number];
type DayDraft = { day_of_week: number; is_active: boolean } & Record<TimeField, string>;

/** Ligne éditable : heures en HH:MM, chaîne vide pour une plage non utilisée. */
const toDraft = (s: Schedule): DayDraft => ({
  day_of_week: s.day_of_week,
  is_active: Boolean(Number(s.is_active)),
  ...(Object.fromEntries(TIME_FIELDS.map((f) => [f, s[f]?.slice(0, 5) ?? ''])) as Record<TimeField, string>),
});

/**
 * Horaires de travail hebdomadaires : une plage le matin, une l'après-midi.
 * Les créneaux proposés aux clients en découlent, selon la durée de chaque prestation.
 */
const ScheduleEditor: React.FC = () => {
  const [days, setDays] = useState<DayDraft[]>([]);
  // Valeurs en base, pour « Annuler »
  const [stored, setStored] = useState<DayDraft[]>([]);
  const dirty = JSON.stringify(days) !== JSON.stringify(stored);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getSchedules().then((list) => {
      const drafts = list.map(toDraft).sort((a, b) => a.day_of_week - b.day_of_week);
      setDays(drafts);
      setStored(drafts);
    });
  }, []);

  function update(day: number, patch: Partial<DayDraft>) {
    setDays((prev) => prev.map((d) => (d.day_of_week === day ? { ...d, ...patch } : d)));
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Séquentiel : la première erreur indique le jour concerné
      for (const d of days) {
        await api
          .updateSchedule(d.day_of_week, {
            is_active: d.is_active,
            ...Object.fromEntries(TIME_FIELDS.map((f) => [f, d[f] || null])),
          })
          .catch((err: Error) => {
            throw new Error(`${DAY_NAMES[d.day_of_week - 1]} : ${err.message}`);
          });
      }
      setStored(days);
      setMessage('Horaires enregistrés.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="schedule-title">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="schedule-title">
          Horaires de travail
        </h3>
      </div>
      <p className="admin-settings-intro">
        Les créneaux proposés aux clients tiennent dans ces plages, selon la durée de la prestation, le temps de
        trajet entre deux interventions et les rendez-vous déjà pris. Laissez une plage vide pour ne pas travailler
        le matin ou l'après-midi.
      </p>

      <form className="schedule-editor" onSubmit={handleSubmit}>
        <div className="schedule-editor__grid" role="table" aria-label="Horaires de la semaine">
          <div className="schedule-editor__head" role="row">
            <span role="columnheader">Jour</span>
            <span role="columnheader">Matin</span>
            <span role="columnheader">Après-midi</span>
          </div>
          {days.map((d) => {
            const name = DAY_NAMES[d.day_of_week - 1];
            const timeInput = (field: TimeField, label: string) => (
              <input
                type="time"
                step={300}
                className="form-input"
                aria-label={`${name} ${label}`}
                value={d[field]}
                disabled={!d.is_active}
                onChange={(e) => update(d.day_of_week, { [field]: e.target.value })}
              />
            );
            return (
              <div
                className={d.is_active ? 'schedule-editor__row' : 'schedule-editor__row schedule-editor__row--off'}
                role="row"
                key={d.day_of_week}
              >
                <label className="schedule-editor__day" role="cell">
                  <input
                    type="checkbox"
                    checked={d.is_active}
                    onChange={(e) => update(d.day_of_week, { is_active: e.target.checked })}
                  />
                  {name}
                </label>
                <span className="schedule-editor__range" role="cell">
                  {timeInput('morning_start', 'début du matin')}–{timeInput('morning_end', 'fin du matin')}
                </span>
                <span className="schedule-editor__range" role="cell">
                  {timeInput('afternoon_start', "début de l'après-midi")}–
                  {timeInput('afternoon_end', "fin de l'après-midi")}
                </span>
              </div>
            );
          })}
        </div>

        <div className="admin-settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || days.length === 0}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <ResetButton
            dirty={dirty}
            disabled={saving}
            onReset={() => {
              setDays(stored);
              setMessage(null);
            }}
          />
          {message && <span className="admin-settings-message">{message}</span>}
        </div>
      </form>
    </section>
  );
};

export default ScheduleEditor;
