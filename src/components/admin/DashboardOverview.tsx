import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Map, Overlay } from 'pigeon-maps';
import { HouseLineIcon, MapPinIcon, PlusIcon } from '@phosphor-icons/react';
import { addDays, format, getISODay, isToday, isTomorrow, isYesterday, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../api';
import { AppConfig, Appointment, Schedule } from '../../types';
import { formatEuro } from '../../utils/format';
import { boundsOfPoints, fitBounds, LatLng } from '../../utils/serviceArea';
import Panel from '../Panel';
import { STATUS_LABELS } from './AppointmentDialog';

interface DashboardOverviewProps {
  appointments: Appointment[];
  config: AppConfig;
  onOpen: (appointment: Appointment) => void;
  /** Nouveau rendez-vous à la date donnée (AAAA-MM-JJ). */
  onCreate: (date: string) => void;
  /** Rendez-vous localisé après coup : mise à jour de la liste. */
  onLocated: (appointment: Appointment) => void;
}

const DEFAULT_CENTER: LatLng = [48.8, 2.2625];
const MAP_HEIGHT = 420;

const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');
const toDate = (sql: string) => parseISO(sql.replace(' ', 'T'));
const coordinatesOf = (a: Appointment): LatLng | null =>
  a.latitude != null && a.longitude != null ? [Number(a.latitude), Number(a.longitude)] : null;

/**
 * Jours affichés : jour travaillé précédent, aujourd'hui (même non travaillé) et les deux jours
 * travaillés suivants, d'après les horaires hebdomadaires (lundi = 1 … dimanche = 7).
 */
function dashboardDays(schedules: Schedule[]): { date: Date; role: 'previous' | 'today' | 'next' }[] {
  const worked = new Set(schedules.filter((s) => Number(s.is_active)).map((s) => s.day_of_week));
  // Horaires pas encore chargés ou tous fermés : jours calendaires
  const isWorked = (date: Date) => worked.size === 0 || worked.has(getISODay(date));
  const today = startOfDay(new Date());

  let previous = addDays(today, -1);
  for (let i = 0; i < 7 && !isWorked(previous); i++) previous = addDays(previous, -1);

  const next: Date[] = [];
  for (let date = addDays(today, 1), i = 0; next.length < 2 && i < 14; date = addDays(date, 1), i++) {
    if (isWorked(date)) next.push(date);
  }
  return [
    { date: previous, role: 'previous' },
    { date: today, role: 'today' },
    ...next.map((date) => ({ date, role: 'next' as const })),
  ];
}

function dayTitle(date: Date): string {
  const long = format(date, 'EEEE d MMMM', { locale: fr });
  if (isYesterday(date)) return `Hier · ${long}`;
  if (isToday(date)) return `Aujourd'hui · ${long}`;
  if (isTomorrow(date)) return `Demain · ${long}`;
  return long.charAt(0).toUpperCase() + long.slice(1);
}

/**
 * Tableau de bord (Item 35) : la journée de la veille, celle du jour et les deux prochains jours
 * travaillés en cartes, et la carte des interventions d'un jour, numérotées dans l'ordre horaire.
 * Les rendez-vous sans position (antérieurs à leur enregistrement) sont localisés une fois par la
 * Base Adresse Nationale, et la position est enregistrée.
 */
const DashboardOverview: React.FC<DashboardOverviewProps> = ({ appointments, config, onOpen, onCreate, onLocated }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [mapDay, setMapDay] = useState(() => dayKey(new Date()));

  useEffect(() => {
    api.getSchedules().then(setSchedules).catch(() => undefined);
  }, []);

  const days = useMemo(() => dashboardDays(schedules), [schedules]);

  // Interventions de chaque jour (hors annulées), dans l'ordre horaire : numéros de la carte
  const byDay = useMemo(() => {
    const result: Record<string, Appointment[]> = {};
    for (const { date } of days) result[dayKey(date)] = [];
    for (const a of appointments) {
      const key = a.start_datetime.slice(0, 10);
      if (a.status !== 'cancelled' && result[key]) result[key].push(a);
    }
    for (const list of Object.values(result)) list.sort((x, y) => x.start_datetime.localeCompare(y.start_datetime));
    return result;
  }, [appointments, days]);

  useLocateMissing(Object.values(byDay).flat(), onLocated);

  const mapped = byDay[mapDay] ?? [];
  const start: LatLng | null =
    config.default_latitude && config.default_longitude
      ? [Number(config.default_latitude), Number(config.default_longitude)]
      : null;

  return (
    <div className="dashboard">
      <div className="dashboard__days">
        {days.map(({ date, role }) => {
          const key = dayKey(date);
          const list = byDay[key] ?? [];
          const total = list.reduce((sum, a) => sum + Number(a.service_price ?? 0) + Number(a.travel_fee ?? 0), 0);
          return (
            <Panel
              key={key}
              className={clsx('dashboard-day', `dashboard-day--${role}`, { 'dashboard-day--mapped': key === mapDay })}
              title={dayTitle(date)}
              actions={
                <button
                  type="button"
                  className={clsx('btn admin-btn-sm data-grid__icon-btn', key === mapDay ? 'btn-primary' : 'btn-secondary')}
                  onClick={() => setMapDay(key)}
                  aria-pressed={key === mapDay}
                  title="Afficher sur la carte"
                  aria-label={`Afficher le ${format(date, 'd MMMM', { locale: fr })} sur la carte`}
                >
                  <MapPinIcon size={16} weight="fill" aria-hidden="true" />
                </button>
              }
            >
              {list.length === 0 ? (
                <p className="dashboard-day__empty">Aucune intervention.</p>
              ) : (
                <ol className="dashboard-day__list">
                  {list.map((a, index) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        className="dashboard-visit"
                        onClick={() => onOpen(a)}
                        title={`${STATUS_LABELS[a.status]} — ouvrir le rendez-vous`}
                      >
                        <span className={clsx('dashboard-visit__number', `dashboard-visit__number--${a.status}`)}>
                          {index + 1}
                        </span>
                        <span className="dashboard-visit__time">
                          {format(toDate(a.start_datetime), 'HH:mm')}–{format(toDate(a.end_datetime), 'HH:mm')}
                        </span>
                        <span className="dashboard-visit__main">
                          <strong>{a.client_name}</strong>
                          <span>
                            {a.service_name} · {a.city}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              <div className="dashboard-day__footer">
                <span>
                  {list.length} intervention{list.length > 1 ? 's' : ''}
                  {total > 0 && <> · {formatEuro(total)}</>}
                </span>
                {role !== 'previous' && (
                  <button type="button" className="btn btn-secondary admin-btn-sm" onClick={() => onCreate(key)}>
                    <PlusIcon size={14} weight="bold" aria-hidden="true" />
                    Rendez-vous
                  </button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="dashboard-map" title={`Carte · ${dayTitle(parseISO(mapDay))}`}>
        <DayMap appointments={mapped} start={start} startLabel={config.start_address || config.company_name} />
        {mapped.some((a) => !coordinatesOf(a)) && (
          <p className="dashboard-map__missing">
            Non localisé :{' '}
            {mapped
              .map((a, index) => (!coordinatesOf(a) ? `n° ${index + 1} (${a.city || 'adresse effacée'})` : null))
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
      </Panel>
    </div>
  );
};

/** Carte d'une journée : point de départ et interventions numérotées, cadrées automatiquement. */
const DayMap: React.FC<{ appointments: Appointment[]; start: LatLng | null; startLabel?: string }> = ({
  appointments,
  start,
  startLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // Interventions au même endroit (même adresse) : un seul repère « 1, 2 »
  const pins = useMemo(() => {
    const grouped: { at: LatLng; visits: { a: Appointment; number: number }[] }[] = [];
    appointments.forEach((a, index) => {
      const at = coordinatesOf(a);
      if (!at) return;
      const same = grouped.find((g) => Math.abs(g.at[0] - at[0]) < 1e-4 && Math.abs(g.at[1] - at[1]) < 1e-4);
      if (same) same.visits.push({ a, number: index + 1 });
      else grouped.push({ at, visits: [{ a, number: index + 1 }] });
    });
    return grouped;
  }, [appointments]);
  const all = [...pins.map((p) => p.at), ...(start ? [start] : [])];
  const [view, setView] = useState<{ center: LatLng; zoom: number }>({ center: start ?? DEFAULT_CENTER, zoom: 12 });
  const signature = all.map((p) => p.join(',')).join(';');

  // Recadrage à chaque changement de jour ou de position
  useEffect(() => {
    const bounds = boundsOfPoints(all);
    const width = ref.current?.clientWidth ?? 600;
    if (!bounds) return;
    const fitted = fitBounds(bounds, width, MAP_HEIGHT);
    // Marge pour les repères au bord ; un seul point : zoom de quartier plutôt que maximal
    setView({ center: fitted.center, zoom: Math.min(fitted.zoom - 0.5, 15) });
  }, [signature]);

  return (
    <div className="dashboard-map__map" ref={ref}>
      <Map
        height={MAP_HEIGHT}
        center={view.center}
        zoom={view.zoom}
        onBoundsChanged={({ center, zoom }) => setView({ center, zoom })}
        attributionPrefix={false}
      >
        {start && (
          <Overlay anchor={start} offset={[14, 14]}>
            <span className="dashboard-pin dashboard-pin--start" title={startLabel ? `Départ : ${startLabel}` : 'Départ'}>
              <HouseLineIcon size={16} weight="fill" aria-hidden="true" />
            </span>
          </Overlay>
        )}
        {pins.map(({ at, visits }) => (
          <Overlay key={visits[0].a.id} anchor={at} offset={[14, 14]}>
            <span
              className={clsx('dashboard-pin', `dashboard-pin--${visits[0].a.status}`, { 'dashboard-pin--group': visits.length > 1 })}
              title={visits
                .map(({ a, number }) => `${number}. ${format(toDate(a.start_datetime), 'HH:mm')} — ${a.client_name}, ${a.city}`)
                .join('\n')}
            >
              {visits.map((v) => v.number).join(', ')}
            </span>
          </Overlay>
        ))}
      </Map>
    </div>
  );
};

/**
 * Localise une fois les rendez-vous affichés sans position (Base Adresse Nationale, déjà utilisée à la
 * saisie des adresses) et enregistre le résultat ; une adresse effacée n'est pas localisée.
 */
function useLocateMissing(appointments: Appointment[], onLocated: (a: Appointment) => void) {
  const tried = useRef(new Set<number>());

  useEffect(() => {
    const missing = appointments.filter((a) => !coordinatesOf(a) && a.address.trim() !== '' && !tried.current.has(a.id));
    if (!missing.length) return;
    missing.forEach((a) => tried.current.add(a.id));
    (async () => {
      for (const a of missing) {
        try {
          const query = encodeURIComponent(`${a.address} ${a.postal_code} ${a.city}`);
          const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}&limit=1`);
          const feature = (await res.json()).features?.[0];
          if (!feature) continue;
          const [longitude, latitude] = feature.geometry.coordinates as [number, number];
          onLocated(await api.locateAppointment(a.id, latitude, longitude));
        } catch {
          // Service indisponible : nouvel essai au prochain affichage
          tried.current.delete(a.id);
        }
      }
    })();
  }, [appointments, onLocated]);
}

export default DashboardOverview;
