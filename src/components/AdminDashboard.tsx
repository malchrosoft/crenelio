import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import {
  ClockIcon,
  CurrencyEurIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
  CalendarBlankIcon,
  XIcon,
  CarIcon,
  EnvelopeSimpleIcon,
  CheckCircleIcon,
  XCircleIcon,
  HourglassIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { api } from '../api';
import {
  Appointment,
  Service,
  AppConfig,
  TravelFeeMode,
  AppointmentNotification,
  NotificationType,
} from '../types';
import { formatEuro } from '../utils/format';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/** Libellés lisibles des emails journalisés. */
const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  client_confirmation: 'Confirmation client',
  pro_confirmation: 'Fiche intervention (artisan)',
};

/** Paliers kilométriques modifiables depuis l'espace Pro (cf. `config.travel_tier_*`). */
const TRAVEL_TIER_INDEXES = [1, 2, 3] as const;

/** Libellés d'aide associés à chaque mode de facturation du déplacement. */
const TRAVEL_MODE_HINTS: Record<TravelFeeMode, string> = {
  none: 'Déplacement inclus : aucun frais ajouté, aucun contrôle de zone.',
  fixed: 'Forfait fixe ajouté au tarif, quelle que soit la distance parcourue.',
  distance_tiers:
    'Paliers kilométriques globaux appliqués selon la distance calculée depuis votre point de départ.',
};

interface TravelFeeFieldsProps {
  mode: TravelFeeMode;
  amount: string;
  onModeChange: (mode: TravelFeeMode) => void;
  onAmountChange: (amount: string) => void;
}

/** Champs de facturation du déplacement, partagés par la création et l'édition. */
const TravelFeeFields: React.FC<TravelFeeFieldsProps> = ({
  mode,
  amount,
  onModeChange,
  onAmountChange,
}) => (
  <div className="service-travel-fields">
    <div className="form-group">
      <label className="form-label">Frais de déplacement</label>
      <select
        className="form-input"
        value={mode}
        onChange={(e) => onModeChange(e.target.value as TravelFeeMode)}
      >
        <option value="none">Inclus (aucun frais)</option>
        <option value="fixed">Forfait fixe</option>
        <option value="distance_tiers">Paliers kilométriques</option>
      </select>
      <p className="form-hint">{TRAVEL_MODE_HINTS[mode]}</p>
    </div>

    {mode === 'fixed' && (
      <div className="form-group">
        <label className="form-label">Montant du forfait</label>
        <div className="form-field-unit">
          <input
            type="number"
            className="form-input form-input--compact"
            min="0"
            step="0.5"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
          <span className="form-unit">€</span>
        </div>
      </div>
    )}
  </div>
);

/** Isole les clés de déplacement de la configuration globale. */
function extractTravelSettings(config: AppConfig): Record<string, string> {
  const keys = [
    ...TRAVEL_TIER_INDEXES.flatMap((index) => [
      `travel_tier_${index}_max_km`,
      `travel_tier_${index}_fee`,
    ]),
    'travel_max_km',
  ];

  return Object.fromEntries(keys.map((key) => [key, config[key] ?? '']));
}

interface AdminDashboardProps {
  onBackToClient: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToClient }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'settings'>('appointments');

  // Recherche & Filtres planning
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'today' | 'overdue' | 'past'>('all');

  // Reprogrammation de rendez-vous (champ datetime-local unique)
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDatetime, setRescheduleDatetime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Nouvelle prestation
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServicePrice, setNewServicePrice] = useState('50.00');
  const [newServiceTravelMode, setNewServiceTravelMode] = useState<TravelFeeMode>('none');
  const [newServiceTravelAmount, setNewServiceTravelAmount] = useState('0.00');

  // Édition inline
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editTravelMode, setEditTravelMode] = useState<TravelFeeMode>('none');
  const [editTravelAmount, setEditTravelAmount] = useState('0.00');

  // Erreurs par prestation (ex: suppression impossible)
  const [serviceErrors, setServiceErrors] = useState<Record<number, string>>({});

  // Journal des notifications email du rendez-vous consulté
  const [notificationsAppointment, setNotificationsAppointment] = useState<Appointment | null>(null);
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [resendingType, setResendingType] = useState<NotificationType | null>(null);

  // Paliers kilométriques & rayon maximal d'intervention
  const [travelSettings, setTravelSettings] = useState<Record<string, string>>({});
  const [travelSettingsSaving, setTravelSettingsSaving] = useState(false);
  const [travelSettingsMessage, setTravelSettingsMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Fermeture des pop-ups sur Echap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (reschedulingAppointment) setReschedulingAppointment(null);
        if (notificationsAppointment) setNotificationsAppointment(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isAddModalOpen, reschedulingAppointment, notificationsAppointment]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await api.adminLogin(password);
      if (res.success) {
        setIsAuthenticated(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setLoginError(msg);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const [apps, servs, cfg] = await Promise.all([
        api.listAppointments(),
        api.listServices(true),
        api.getAdminConfig(),
      ]);
      setAppointments(apps);
      setServices(servs);
      setConfig(cfg);
      setTravelSettings(extractTravelSettings(cfg));
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openNotifications(appointment: Appointment) {
    setNotificationsAppointment(appointment);
    setNotifications([]);
    setNotificationsError(null);
    setNotificationsLoading(true);
    try {
      setNotifications(await api.listNotifications(appointment.id));
    } catch (err: unknown) {
      setNotificationsError(err instanceof Error ? err.message : 'Erreur lors du chargement du journal');
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function handleResendNotification(type: NotificationType) {
    if (!notificationsAppointment) return;
    setResendingType(type);
    setNotificationsError(null);
    try {
      const res = await api.resendNotification(notificationsAppointment.id, type);
      setNotifications(res.notifications);
      if (res.result.status === 'failed') {
        setNotificationsError("L'envoi a de nouveau échoué — le motif figure dans le journal ci-dessous.");
      }
    } catch (err: unknown) {
      setNotificationsError(err instanceof Error ? err.message : "Erreur lors du renvoi");
    } finally {
      setResendingType(null);
    }
  }

  function updateTravelSetting(key: string, value: string) {
    setTravelSettings((prev) => ({ ...prev, [key]: value }));
    setTravelSettingsMessage(null);
  }

  async function handleSaveTravelSettings(e: React.FormEvent) {
    e.preventDefault();
    setTravelSettingsSaving(true);
    setTravelSettingsMessage(null);
    try {
      const res = await api.updateAdminConfig(travelSettings);
      setConfig(res.config);
      setTravelSettings(extractTravelSettings(res.config));
      setTravelSettingsMessage('Paliers enregistrés.');
    } catch (err: unknown) {
      setTravelSettingsMessage(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement des paliers"
      );
    } finally {
      setTravelSettingsSaving(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus as Appointment['status'] } : a))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  function startReschedule(appointment: Appointment) {
    setReschedulingAppointment(appointment);
    const dateObj = new Date(appointment.start_datetime);
    // Format YYYY-MM-DDTHH:mm pour input datetime-local
    setRescheduleDatetime(format(dateObj, "yyyy-MM-dd'T'HH:mm"));
  }

  async function handleRescheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reschedulingAppointment) return;
    setRescheduleLoading(true);
    try {
      // Conversion de YYYY-MM-DDTHH:mm en YYYY-MM-DD HH:mm:00
      const formattedDatetime = rescheduleDatetime.replace('T', ' ') + ':00';
      const updated = await api.rescheduleAppointment(reschedulingAppointment.id, formattedDatetime, 'confirmed');
      setAppointments((prev) =>
        prev.map((a) => (a.id === reschedulingAppointment.id ? { ...a, ...updated } : a))
      );
      setReschedulingAppointment(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors du déplacement du rendez-vous');
    } finally {
      setRescheduleLoading(false);
    }
  }

  // Filtrage et détection des rendez-vous échus
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // 1. Filtre par recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = a.client_name.toLowerCase().includes(q);
        const matchPhone = a.client_phone.toLowerCase().includes(q);
        const matchEmail = a.client_email.toLowerCase().includes(q);
        const matchService = (a.service_name ?? '').toLowerCase().includes(q);
        const matchCity = a.city.toLowerCase().includes(q);
        const matchAddress = a.address.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchService && !matchCity && !matchAddress) {
          return false;
        }
      }

      // 2. Filtre par statut
      if (statusFilter !== 'all' && a.status !== statusFilter) {
        return false;
      }

      // 3. Filtre temporel
      const startDate = parseISO(a.start_datetime);
      const isAppointmentPast = isPast(startDate) && !isToday(startDate);
      const isAppointmentToday = isToday(startDate);
      const isOverdue = isAppointmentPast && (a.status === 'confirmed' || a.status === 'pending');

      if (timeFilter === 'upcoming') {
        if (isAppointmentPast) return false;
      } else if (timeFilter === 'today') {
        if (!isAppointmentToday) return false;
      } else if (timeFilter === 'overdue') {
        if (!isOverdue) return false;
      } else if (timeFilter === 'past') {
        if (!isAppointmentPast) return false;
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, timeFilter]);

  // Nombre de rendez-vous échus non honorés
  const overdueCount = useMemo(() => {
    return appointments.filter((a) => {
      const startDate = parseISO(a.start_datetime);
      return isPast(startDate) && !isToday(startDate) && (a.status === 'confirmed' || a.status === 'pending');
    }).length;
  }, [appointments]);

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createService({
        name: newServiceName,
        description: newServiceDescription || undefined,
        duration_minutes: parseInt(newServiceDuration, 10),
        price: parseFloat(newServicePrice),
        travel_fee_mode: newServiceTravelMode,
        travel_fee_amount: newServiceTravelMode === 'fixed' ? parseFloat(newServiceTravelAmount) : 0,
        is_active: 1,
      });
      setNewServiceName('');
      setNewServiceDescription('');
      setNewServiceDuration('60');
      setNewServicePrice('50.00');
      setNewServiceTravelMode('none');
      setNewServiceTravelAmount('0.00');
      setIsAddModalOpen(false);
      const updated = await api.listServices(true);
      setServices(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  }

  async function handleToggleService(service: Service) {
    try {
      const nextActive = service.is_active ? 0 : 1;
      await api.updateService(service.id, { is_active: nextActive });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: nextActive } : s))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  function startEditing(service: Service) {
    setEditingServiceId(service.id);
    setEditName(service.name);
    setEditDescription(service.description ?? '');
    setEditDuration(String(service.duration_minutes));
    setEditPrice(String(service.price));
    setEditTravelMode(service.travel_fee_mode ?? 'none');
    setEditTravelAmount(String(service.travel_fee_amount ?? '0.00'));
    // Effacer l'éventuelle erreur de suppression affichée
    setServiceErrors((prev) => {
      const next = { ...prev };
      delete next[service.id];
      return next;
    });
  }

  function cancelEditing() {
    setEditingServiceId(null);
  }

  async function handleUpdateService(e: React.FormEvent, id: number) {
    e.preventDefault();
    try {
      const updated = await api.updateService(id, {
        name: editName,
        description: editDescription || undefined,
        duration_minutes: parseInt(editDuration, 10),
        price: parseFloat(editPrice),
        travel_fee_mode: editTravelMode,
        travel_fee_amount: editTravelMode === 'fixed' ? parseFloat(editTravelAmount) : 0,
      });
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
      setEditingServiceId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleDeleteService(id: number) {
    if (!window.confirm('Supprimer définitivement cette prestation ?')) return;
    setServiceErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      await api.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setServiceErrors((prev) => ({ ...prev, [id]: msg }));
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="card admin-login-card">
        <h2 className="card-title">Connexion Espace Pro</h2>
        <p className="admin-login-hint">
          Saisissez votre mot de passe d'administration (par défaut : <code>admin123</code>).
        </p>

        {loginError && (
          <div className="admin-login-error">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="admin-login-actions">
            <button type="button" className="btn btn-secondary" onClick={onBackToClient}>
              ← Retour au site
            </button>
            <button type="submit" className="btn btn-primary">
              Se connecter
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="admin-dashboard-header">
        <div>
          <h2 className="admin-title">Espace Gestion Artisan</h2>
          <div className="admin-company-sub">
            Entreprise : {config.company_name || 'Crénelio'}
          </div>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-secondary" onClick={() => setIsAuthenticated(false)}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={clsx('btn', {
            'btn-primary': activeTab === 'appointments',
            'btn-secondary': activeTab !== 'appointments',
          })}
          onClick={() => setActiveTab('appointments')}
        >
          Planning des rendez-vous ({appointments.length})
        </button>
        <button
          className={clsx('btn', {
            'btn-primary': activeTab === 'services',
            'btn-secondary': activeTab !== 'services',
          })}
          onClick={() => setActiveTab('services')}
        >
          Prestations ({services.length})
        </button>
        <button
          className={clsx('btn', {
            'btn-primary': activeTab === 'settings',
            'btn-secondary': activeTab !== 'settings',
          })}
          onClick={() => setActiveTab('settings')}
        >
          Zone & déplacement
        </button>
      </div>

      {loading ? (
        <p>Chargement des données...</p>
      ) : activeTab === 'appointments' ? (
        <div>
          {/* ── Barre de recherche et filtres multi-critères ── */}
          <div className="admin-filters-bar">
            <div className="admin-search-wrapper">
              <MagnifyingGlassIcon size={18} weight="bold" className="admin-search-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-input admin-search-input"
                placeholder="Rechercher par client, téléphone, email, prestation, adresse, ville…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                >
                  <XIcon size={16} weight="bold" />
                </button>
              )}
            </div>

            <div className="admin-filters-groups">
              <div className="admin-filter-pills" role="radiogroup" aria-label="Filtre de statut">
                <button
                  type="button"
                  className={clsx('admin-pill-btn', { 'admin-pill-btn--active': statusFilter === 'all' })}
                  onClick={() => setStatusFilter('all')}
                >
                  Tous ({appointments.length})
                </button>
                <button
                  type="button"
                  className={clsx('admin-pill-btn', { 'admin-pill-btn--active': statusFilter === 'confirmed' })}
                  onClick={() => setStatusFilter('confirmed')}
                >
                  Confirmés
                </button>
                <button
                  type="button"
                  className={clsx('admin-pill-btn', { 'admin-pill-btn--active': statusFilter === 'pending' })}
                  onClick={() => setStatusFilter('pending')}
                >
                  En attente
                </button>
                <button
                  type="button"
                  className={clsx('admin-pill-btn', { 'admin-pill-btn--active': statusFilter === 'completed' })}
                  onClick={() => setStatusFilter('completed')}
                >
                  Terminés
                </button>
                <button
                  type="button"
                  className={clsx('admin-pill-btn', { 'admin-pill-btn--active': statusFilter === 'cancelled' })}
                  onClick={() => setStatusFilter('cancelled')}
                >
                  Annulés
                </button>
              </div>

              <div>
                <select
                  className="admin-time-select"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
                  aria-label="Filtre temporel"
                >
                  <option value="all">Toutes dates</option>
                  <option value="upcoming">À venir</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="overdue">
                    Échus non clôturés {overdueCount > 0 ? `(${overdueCount})` : ''}
                  </option>
                  <option value="past">Historique passé</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className="admin-empty-state">
              {appointments.length === 0
                ? 'Aucun rendez-vous enregistré pour le moment.'
                : 'Aucun rendez-vous ne correspond aux critères de recherche.'}
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date &amp; Heure</th>
                  <th>Prestation</th>
                  <th>Client</th>
                  <th>Adresse d'intervention</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => {
                  const startObj = parseISO(a.start_datetime);
                  const dateStr = format(startObj, 'dd/MM/yyyy HH:mm', { locale: fr });
                  const isAppointmentPast = isPast(startObj) && !isToday(startObj);
                  const isOverdue = isAppointmentPast && (a.status === 'confirmed' || a.status === 'pending');

                  return (
                    <tr
                      key={a.id}
                      className={clsx({ 'admin-row-overdue': isOverdue })}
                    >
                      <td className="admin-row-date">
                        <div>{dateStr}</div>
                        {isOverdue && (
                          <span className="badge-overdue" title="Rendez-vous arrivé à échéance et non clôturé">
                            <WarningCircleIcon size={13} weight="fill" />
                            Échu à traiter
                          </span>
                        )}
                      </td>
                      <td>{a.service_name}</td>
                      <td>
                        <strong>{a.client_name}</strong>
                        <div className="admin-row-phone">
                          <a href={`tel:${a.client_phone}`} className="admin-contact-link">{a.client_phone}</a>
                        </div>
                        <div className="admin-row-email">
                          <a href={`mailto:${a.client_email}`} className="admin-contact-link">{a.client_email}</a>
                        </div>
                      </td>
                      <td className="admin-row-address">
                        {a.address}, {a.postal_code} {a.city}
                      </td>
                      <td>
                        <span className={`status-badge status-${a.status}`}>{a.status}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <select
                            className="form-input admin-status-select"
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-secondary admin-btn-reschedule"
                            onClick={() => startReschedule(a)}
                            title="Déplacer ou reprogrammer la date/heure de l'intervention"
                          >
                            <CalendarBlankIcon size={14} weight="bold" />
                            Reprogrammer
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary admin-btn-reschedule"
                            onClick={() => openNotifications(a)}
                            title="Consulter le journal des emails envoyés pour ce rendez-vous"
                          >
                            <EnvelopeSimpleIcon size={14} weight="bold" />
                            Emails
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ── Pop-up / Modale de reprogrammation (champ unique datetime-local) ── */}
          {reschedulingAppointment && (
            <div
              className="admin-modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reschedule-modal-title"
              onClick={() => setReschedulingAppointment(null)}
            >
              <div
                className="admin-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-modal__header">
                  <h3 className="admin-modal__title" id="reschedule-modal-title">
                    Reprogrammer l'intervention #{reschedulingAppointment.id}
                  </h3>
                  <button
                    className="admin-modal__close"
                    onClick={() => setReschedulingAppointment(null)}
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleRescheduleSubmit} className="admin-modal__body">
                  <p className="admin-modal-hint">
                    Client : <strong>{reschedulingAppointment.client_name}</strong> ({reschedulingAppointment.service_name})
                  </p>
                  <div className="form-group">
                    <label className="form-label">Nouvelle date et heure d'intervention *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      value={rescheduleDatetime}
                      onChange={(e) => setRescheduleDatetime(e.target.value)}
                    />
                  </div>
                  <div className="admin-modal__actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setReschedulingAppointment(null)}
                      disabled={rescheduleLoading}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={rescheduleLoading}
                    >
                      {rescheduleLoading ? 'Mise à jour…' : 'Enregistrer la nouvelle date'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Journal des notifications email ── */}
          {notificationsAppointment && (
            <div
              className="admin-modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-modal-title"
              onClick={() => setNotificationsAppointment(null)}
            >
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal__header">
                  <h3 className="admin-modal__title" id="notifications-modal-title">
                    Emails du rendez-vous #{notificationsAppointment.id}
                  </h3>
                  <button
                    className="admin-modal__close"
                    onClick={() => setNotificationsAppointment(null)}
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>
                <div className="admin-modal__body">
                  <p className="admin-modal-hint">
                    Client : <strong>{notificationsAppointment.client_name}</strong> (
                    {notificationsAppointment.client_email})
                  </p>

                  {notificationsError && <div className="form-alert-error">{notificationsError}</div>}

                  {notificationsLoading ? (
                    <p className="slots-loading">Chargement du journal…</p>
                  ) : notifications.length === 0 ? (
                    <p className="notification-empty">
                      Aucun email n'a encore été journalisé pour ce rendez-vous.
                    </p>
                  ) : (
                    <ul className="notification-list">
                      {notifications.map((n) => (
                        <li key={n.id} className={clsx('notification-item', `notification-item--${n.status}`)}>
                          <div className="notification-item__head">
                            <span className="notification-item__status" aria-hidden="true">
                              {n.status === 'sent' ? (
                                <CheckCircleIcon size={18} weight="fill" />
                              ) : n.status === 'failed' ? (
                                <XCircleIcon size={18} weight="fill" />
                              ) : (
                                <HourglassIcon size={18} weight="fill" />
                              )}
                            </span>
                            <span className="notification-item__label">{NOTIFICATION_LABELS[n.type]}</span>
                            <span className="notification-item__date">
                              {format(parseISO(n.sent_at ?? n.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </span>
                          </div>
                          <div className="notification-item__recipient">{n.recipient}</div>
                          <div className="notification-item__subject">{n.subject}</div>
                          {n.error_message && (
                            <div className="notification-item__error">{n.error_message}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="notification-resend">
                    <span className="notification-resend__label">Renvoyer :</span>
                    {(Object.keys(NOTIFICATION_LABELS) as NotificationType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="btn btn-secondary admin-btn-sm"
                        onClick={() => handleResendNotification(type)}
                        disabled={resendingType !== null}
                      >
                        <ArrowClockwiseIcon size={14} weight="bold" />
                        {resendingType === type ? 'Envoi…' : NOTIFICATION_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'services' ? (
        <div>
          <div className="admin-section-header">
            <h3 className="admin-section-title">Prestations ({services.length})</h3>
            <button
              className="btn btn-primary admin-btn-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Ajouter une prestation
            </button>
          </div>
          <div className="services-grid admin-services-grid">
            {services.map((s) => (
              <div
                key={s.id}
                className={clsx('service-card', 'admin-service-card', {
                  'admin-service-card--inactive': !s.is_active,
                })}
              >
                {editingServiceId === s.id ? (
                  /* ── Mode édition inline ── */
                  <form
                    className="service-card__edit-form"
                    onSubmit={(e) => handleUpdateService(e, s.id)}
                  >
                    <div className="field-name">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="field-description">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description de la prestation…"
                      />
                    </div>
                    <div className="service-card__edit-row">
                      <div className="field-number">
                        <label className="form-label">Durée (min)</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          min="15"
                          step="15"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                        />
                      </div>
                      <div className="field-number">
                        <label className="form-label">Prix (€)</label>
                        <input
                          type="number"
                          className="form-input"
                          required
                          min="0"
                          step="0.5"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <TravelFeeFields
                      mode={editTravelMode}
                      amount={editTravelAmount}
                      onModeChange={setEditTravelMode}
                      onAmountChange={setEditTravelAmount}
                    />
                    <div className="service-card__actions">
                      <button type="submit" className="btn btn-primary admin-btn-sm">
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary admin-btn-sm"
                        onClick={cancelEditing}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── Mode affichage ── */
                  <>
                    <div>
                      <div className="service-name">{s.name}</div>
                      {s.description && (
                        <div className="service-desc">{s.description}</div>
                      )}
                    </div>
                    <div className="service-meta">
                      <span className="badge badge-duration">
                        <ClockIcon size={14} weight="fill" aria-hidden="true" />
                        {s.duration_minutes} min
                      </span>
                      <span className="badge badge-price">
                        <CurrencyEurIcon size={14} weight="fill" aria-hidden="true" />
                        {s.price} €
                      </span>
                      {s.travel_fee_mode !== 'none' && (
                        <span className="badge badge-travel">
                          <CarIcon size={14} weight="fill" aria-hidden="true" />
                          {s.travel_fee_mode === 'fixed'
                            ? `Forfait ${formatEuro(parseFloat(String(s.travel_fee_amount)))}`
                            : 'Paliers km'}
                        </span>
                      )}
                    </div>
                    <div className="service-card__actions">
                      <button
                        className="btn btn-secondary admin-btn-sm"
                        onClick={() => handleToggleService(s)}
                      >
                        {s.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        className="btn btn-secondary admin-btn-sm"
                        onClick={() => startEditing(s)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-danger admin-btn-sm"
                        onClick={() => handleDeleteService(s.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                    {serviceErrors[s.id] && (
                      <div className="admin-service-error">
                        {serviceErrors[s.id]}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Pop-up / Modal d'ajout de prestation ── */}
          {isAddModalOpen && (
            <div
              className="admin-modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-service-modal-title"
              onClick={() => setIsAddModalOpen(false)}
            >
              <div
                className="admin-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-modal__header">
                  <h3 className="admin-modal__title" id="add-service-modal-title">
                    Ajouter une nouvelle prestation
                  </h3>
                  <button
                    className="admin-modal__close"
                    onClick={() => setIsAddModalOpen(false)}
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddService} className="admin-modal__body">
                  <div className="form-group">
                    <label className="form-label">Nom de la prestation</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Ex: Remplacement robinet"
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description (optionnel)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={newServiceDescription}
                      onChange={(e) => setNewServiceDescription(e.target.value)}
                      placeholder="Détails sur l'intervention…"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Durée (minutes)</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        min="15"
                        step="15"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prix (€)</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        min="0"
                        step="0.5"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <TravelFeeFields
                    mode={newServiceTravelMode}
                    amount={newServiceTravelAmount}
                    onModeChange={setNewServiceTravelMode}
                    onAmountChange={setNewServiceTravelAmount}
                  />
                  <div className="admin-modal__actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Créer la prestation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="admin-section-header">
            <h3 className="admin-section-title">Zone d'intervention & frais de déplacement</h3>
          </div>
          <p className="admin-settings-intro">
            Ces paliers s'appliquent aux prestations réglées sur « Paliers kilométriques ». La distance est
            calculée à vol d'oiseau entre votre point de départ et l'adresse du client.
          </p>

          <form className="admin-settings-form" onSubmit={handleSaveTravelSettings}>
            <div className="admin-tier-grid">
              {TRAVEL_TIER_INDEXES.map((index) => (
                <div className="admin-tier-row" key={index}>
                  <div className="form-group">
                    <label className="form-label">Palier {index} — jusqu'à</label>
                    <div className="form-field-unit">
                      <input
                        type="number"
                        className="form-input form-input--compact"
                        min="0"
                        step="1"
                        value={travelSettings[`travel_tier_${index}_max_km`] ?? ''}
                        onChange={(e) => updateTravelSetting(`travel_tier_${index}_max_km`, e.target.value)}
                      />
                      <span className="form-unit">km</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frais</label>
                    <div className="form-field-unit">
                      <input
                        type="number"
                        className="form-input form-input--compact"
                        min="0"
                        step="0.5"
                        value={travelSettings[`travel_tier_${index}_fee`] ?? ''}
                        onChange={(e) => updateTravelSetting(`travel_tier_${index}_fee`, e.target.value)}
                      />
                      <span className="form-unit">€</span>
                    </div>
                  </div>
                </div>
              ))}
              <p className="form-hint">Laisser la distance d'un palier vide pour le désactiver.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Rayon maximal d'intervention</label>
              <div className="form-field-unit">
                <input
                  type="number"
                  className="form-input form-input--compact"
                  min="0"
                  step="1"
                  value={travelSettings.travel_max_km ?? ''}
                  onChange={(e) => updateTravelSetting('travel_max_km', e.target.value)}
                />
                <span className="form-unit">km</span>
              </div>
              <p className="form-hint">
                Au-delà de ce rayon, la réservation en ligne est bloquée et le client est invité à formuler
                une demande exceptionnelle par email.
              </p>
            </div>

            <div className="admin-settings-actions">
              <button type="submit" className="btn btn-primary" disabled={travelSettingsSaving}>
                {travelSettingsSaving ? 'Enregistrement…' : 'Enregistrer les paliers'}
              </button>
              {travelSettingsMessage && (
                <span className="admin-settings-message">{travelSettingsMessage}</span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
