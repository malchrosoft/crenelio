import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { api } from '../../api';
import { Unavailability } from '../../types';

const toSql = (local: string) => `${local.replace('T', ' ')}:00`;
const display = (sql: string) => format(new Date(sql.replace(' ', 'T')), 'EEE d MMM yyyy à HH:mm', { locale: fr });

/**
 * Indisponibilités ponctuelles (congés, formation…) : aucun créneau n'est proposé pendant ces périodes.
 */
const UnavailabilityEditor: React.FC = () => {
  const [items, setItems] = useState<Unavailability[]>([]);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listUnavailabilities().then(setItems);
  }, []);

  // Périodes en cours ou à venir, chronologiques
  const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const upcoming = items
    .filter((u) => u.end_datetime >= now)
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await api.createUnavailability({
        title: title.trim() || 'Indisponible',
        start_datetime: toSql(start),
        end_datetime: toSql(end),
      });
      setItems((prev) => [...prev, created]);
      setTitle('');
      setStart('');
      setEnd('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await api.deleteUnavailability(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  return (
    <section className="admin-config-group" aria-labelledby="unavailability-title">
      <div className="admin-section-header">
        <h3 className="admin-section-title" id="unavailability-title">
          Indisponibilités
        </h3>
      </div>
      <p className="admin-settings-intro">
        Congés, formation, rendez-vous personnel… Aucun créneau n'est proposé pendant ces périodes.
      </p>

      <div className="admin-settings-form">
        {upcoming.length === 0 ? (
          <p className="unavailability-editor__empty">Aucune indisponibilité à venir.</p>
        ) : (
          <ul className="unavailability-editor__list">
            {upcoming.map((u) => (
              <li key={u.id}>
                <span>
                  <strong>{u.title}</strong> — du {display(u.start_datetime)} au {display(u.end_datetime)}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  aria-label={`Supprimer « ${u.title} »`}
                  onClick={() => handleDelete(u.id)}
                >
                  <TrashIcon size={16} weight="fill" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form className="unavailability-editor__form" onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label" htmlFor="unavail-title">
              Motif
            </label>
            <input
              id="unavail-title"
              className="form-input"
              placeholder="Congés"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="unavail-start">
              Début
            </label>
            <input
              id="unavail-start"
              type="datetime-local"
              className="form-input"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="unavail-end">
              Fin
            </label>
            <input
              id="unavail-end"
              type="datetime-local"
              className="form-input"
              required
              min={start || undefined}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            <PlusIcon size={18} weight="fill" aria-hidden="true" />
            Ajouter
          </button>
        </form>
        {error && <p className="form-alert-error">{error}</p>}
      </div>
    </section>
  );
};

export default UnavailabilityEditor;
