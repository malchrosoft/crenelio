import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import {
  ClockIcon,
  CurrencyEurIcon,
  MagnifyingGlassIcon,
  CalendarBlankIcon,
  XIcon,
  CarIcon,
  WrenchIcon,
  GearSixIcon,
  MapTrifoldIcon,
  CalendarDotsIcon,
} from '@phosphor-icons/react';
import { api, UNAUTHORIZED_EVENT } from '../api';
import {
  Appointment,
  Service,
  AppConfig,
  TravelFeeMode,
  BrandingUrls,
} from '../types';
import { formatEuro } from '../utils/format';
import { CONFIG_GROUPS, buildOtherGroup } from '../config/configSchema';
import ConfigGroupForm from './admin/ConfigGroupForm';
import EngagementsEditor from './admin/EngagementsEditor';
import ScheduleEditor from './admin/ScheduleEditor';
import TravelSettingsEditor from './admin/TravelSettingsEditor';
import ZoneWorkspace from './admin/ZoneWorkspace';
import ResetButton from './admin/ResetButton';
import NewAppointment from './admin/NewAppointment';
import BrandingField from './admin/BrandingField';
import AdminShell, { AdminTab } from './admin/AdminShell';

// Calendrier (FullCalendar) chargé seulement à l'ouverture de son onglet
const AppointmentCalendar = lazy(() => import('./admin/AppointmentCalendar'));
// Liste des interventions (AG Grid Community) chargée à l'ouverture du planning
const InterventionsGrid = lazy(() => import('./admin/InterventionsGrid'));
const UnavailabilitiesGrid = lazy(() => import('./admin/UnavailabilitiesGrid'));
import AdminLogin from './admin/AdminLogin';
import type { AdminNotice } from './admin/AdminNotices';
import AppointmentDialog from './admin/AppointmentDialog';
import NotificationsDialog from './admin/NotificationsDialog';
import ConfirmDialog from './admin/ConfirmDialog';
import ToggleGroup from './admin/ToggleGroup';
import MailStatus from './admin/MailStatus';
import CalendarFeedSettings from './admin/CalendarFeedSettings';
import AppearanceEditor from './admin/AppearanceEditor';
import PasswordChange from './admin/PasswordChange';
import ProEmailField from './admin/ProEmailField';
import { applyFavicon } from '../utils/favicon';
import { applyDocumentTitle } from '../utils/documentTitle';
import { format, isPast, isToday, parseISO } from 'date-fns';

const NAV_ICON = { size: 20, weight: 'fill' as const, 'aria-hidden': true };

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
    'travel_fee_origin',
  ];

  return { ...Object.fromEntries(keys.map((key) => [key, config[key] ?? ''])), travel_fee_origin: config.travel_fee_origin || 'start' };
}

export const AdminDashboard: React.FC = () => {
  // `null` : session en cours de vérification (rechargement de page)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [twoFactor, setTwoFactor] = useState(true);
  // Mot de passe par défaut (admin123) : changement imposé en production, signalé en développement
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState(false);
  // Saisie d'un rendez-vous par l'artisan (formulaires partagés de la réservation)
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  // Date présélectionnée quand le nouveau rendez-vous vient d'un clic dans le calendrier
  const [newAppointmentDate, setNewAppointmentDate] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');

  // Recherche & Filtres planning
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'today' | 'overdue' | 'past'>('all');
  // Jour précis (YYYY-MM-DD), posé notamment par un clic sur un rendez-vous du calendrier
  const [dateFilter, setDateFilter] = useState('');
  // Filtre de date : un jour (dateFilter) ou une plage du dateFilter au dateEndFilter (bornes incluses,
  // chacune facultative)
  const [dateMode, setDateMode] = useState<'day' | 'range'>('day');
  const [dateEndFilter, setDateEndFilter] = useState('');
  // Onglet Horaires : semaine type ou indisponibilités (grille)
  const [hoursView, setHoursView] = useState<'week' | 'unavailabilities'>('week');
  // Rendez-vous ouvert dans la fenêtre de consultation / modification (calendrier ou liste)
  const [openedId, setOpenedId] = useState<number | null>(null);

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

  // Demande d'effacement RGPD en cours de confirmation
  const [anonymizing, setAnonymizing] = useState<Appointment | null>(null);

  // Journal des emails ouvert (depuis la liste, le calendrier ou la fenêtre du rendez-vous)
  const [emailsFor, setEmailsFor] = useState<{ appointment: Appointment; fromDialog: boolean } | null>(null);

  // Paliers kilométriques & rayon maximal d'intervention
  const [travelSettings, setTravelSettings] = useState<Record<string, string>>({});
  const [travelSettingsSaving, setTravelSettingsSaving] = useState(false);
  const [travelSettingsMessage, setTravelSettingsMessage] = useState<string | null>(null);

  // Session déjà ouverte (cookie) ; toute route refusée ensuite ramène à la connexion
  useEffect(() => {
    api
      .adminSession()
      .then((s) => {
        setTwoFactor(s.two_factor);
        setMustChangePassword(s.must_change_password);
        setDefaultPassword(s.default_password);
        setIsAuthenticated(s.authenticated);
      })
      .catch(() => setIsAuthenticated(false));
    const expire = () => setIsAuthenticated(false);
    window.addEventListener(UNAUTHORIZED_EVENT, expire);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, expire);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else if (isAuthenticated === false) {
      // Config publique : nom de l'entreprise dans le header dès l'écran de connexion
      api.getConfig().then(setConfig).catch(() => undefined);
    }
  }, [isAuthenticated]);

  // Fermeture des pop-ups sur Echap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isAddModalOpen]);

  /** Relit l'état de la session (mot de passe par défaut encore actif ?). */
  async function refreshSession() {
    const s = await api.adminSession().catch(() => null);
    if (!s) return;
    setTwoFactor(s.two_factor);
    setMustChangePassword(s.must_change_password);
    setDefaultPassword(s.default_password);
  }

  async function handleAuthenticated(withTwoFactor: boolean) {
    setTwoFactor(withTwoFactor);
    await refreshSession();
    setIsAuthenticated(true);
  }

  async function handleLogout() {
    await api.adminLogout().catch(() => undefined);
    setIsAuthenticated(false);
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

  async function confirmAnonymize() {
    if (!anonymizing) return;
    const target = anonymizing;
    setAnonymizing(null);
    try {
      const res = await api.anonymizeAppointment(target.id);
      setAppointments((prev) => prev.map((a) => (a.id === target.id ? { ...a, ...res.appointment } : a)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'effacement");
    }
  }

  const openNotifications = (appointment: Appointment) => setEmailsFor({ appointment, fromDialog: false });

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

  // Passage en mode « locaux » : le menu Zone d'intervention disparaît, retour sur Déplacement
  useEffect(() => {
    if (config.travel_mode === 'premises' && activeTab === 'zone') setActiveTab('settings');
  }, [config.travel_mode, activeTab]);

  // Titre de l'onglet aligné sur le nom de l'entreprise, y compris juste après son enregistrement
  useEffect(() => {
    if (config.company_name !== undefined) applyDocumentTitle(config.company_name);
  }, [config.company_name]);

  /** Nouvelles URLs de logo / favicon : mises à jour de l'aperçu et de l'onglet du navigateur. */
  function applyBranding(urls: BrandingUrls) {
    setConfig((prev) => ({ ...prev, ...urls }));
    applyFavicon(urls.branding_favicon_url);
  }

  async function handleStatusChange(id: number, newStatus: string) {
    try {
      replaceAppointment(await api.updateAppointmentStatus(id, newStatus));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  /** Rendez-vous modifié (fenêtre, calendrier, liste) : remplacé dans la liste chargée. */
  function replaceAppointment(updated: Appointment) {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
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

      // 3. Jour précis ou plage de dates (comparaison de chaînes AAAA-MM-JJ)
      const day = a.start_datetime.slice(0, 10);
      if (dateMode === 'day') {
        if (dateFilter && day !== dateFilter) return false;
      } else if ((dateFilter && day < dateFilter) || (dateEndFilter && day > dateEndFilter)) {
        return false;
      }

      // 4. Filtre temporel
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
  }, [appointments, searchQuery, statusFilter, timeFilter, dateFilter, dateMode, dateEndFilter]);

  // Nombre de rendez-vous échus non honorés
  const overdueCount = useMemo(() => {
    return appointments.filter((a) => {
      const startDate = parseISO(a.start_datetime);
      return isPast(startDate) && !isToday(startDate) && (a.status === 'confirmed' || a.status === 'pending');
    }).length;
  }, [appointments]);

  // Filtres rapides du planning (boutons à bascule et étiquettes des filtres appliqués)
  const statusOptions: { value: typeof statusFilter; label: string }[] = [
    { value: 'all', label: `Tous (${appointments.length})` },
    { value: 'confirmed', label: 'Confirmés' },
    { value: 'pending', label: 'En attente' },
    { value: 'completed', label: 'Terminés' },
    { value: 'cancelled', label: 'Annulés' },
  ];
  const periodOptions: { value: typeof timeFilter; label: string }[] = [
    { value: 'all', label: 'Toutes dates' },
    { value: 'upcoming', label: 'À venir' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'overdue', label: overdueCount > 0 ? `Échus (${overdueCount})` : 'Échus' },
    { value: 'past', label: 'Passés' },
  ];
  const clearDates = () => {
    setDateFilter('');
    setDateEndFilter('');
  };
  const shortDate = (iso: string) => format(parseISO(iso), 'dd/MM/yyyy');
  const dateLabel =
    dateMode === 'day'
      ? dateFilter && shortDate(dateFilter)
      : dateFilter && dateEndFilter
        ? `Du ${shortDate(dateFilter)} au ${shortDate(dateEndFilter)}`
        : dateFilter
          ? `Depuis le ${shortDate(dateFilter)}`
          : dateEndFilter && `Jusqu'au ${shortDate(dateEndFilter)}`;

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

  if (isAuthenticated === null) {
    return <p className="admin-loading">Chargement de l'espace Artisan…</p>;
  }

  if (!isAuthenticated) {
    return (
      <AdminShell companyName={config.company_name}>
        <AdminLogin onAuthenticated={handleAuthenticated} />
      </AdminShell>
    );
  }

  // Le serveur refuse toute autre route tant que le mot de passe par défaut est actif
  if (mustChangePassword) {
    return (
      <AdminShell companyName={config.company_name} onLogout={handleLogout}>
        <PasswordChange forced onChanged={refreshSession} />
      </AdminShell>
    );
  }

  // Avertissements du header (au lieu de bandeaux en tête de page)
  const notices: AdminNotice[] = [
    ...(defaultPassword
      ? [
          {
            id: 'default-password',
            level: 'warning' as const,
            title: 'Mot de passe par défaut actif',
            text: (
              <>
                <code>admin123</code> est toléré en développement, mais devra être changé avant toute mise en ligne.
              </>
            ),
            action: { label: 'Changer le mot de passe', onClick: () => setActiveTab('config') },
          },
        ]
      : []),
    ...(!twoFactor
      ? [
          {
            id: 'two-factor',
            level: 'warning' as const,
            title: 'Double authentification inactive',
            text: (
              <>
                Renseignez l'email de contact (Configuration) et l'adresse d'expédition des emails (<code>MAIL_FROM</code>{' '}
                dans <code>api/.env</code>). En attendant, le mot de passe seul protège l'espace Artisan.
              </>
            ),
            action: { label: 'Ouvrir la configuration', onClick: () => setActiveTab('config') },
          },
        ]
      : []),
  ];

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'appointments', label: 'Rendez-vous', icon: <CalendarBlankIcon {...NAV_ICON} />, count: appointments.length },
    { id: 'calendar', label: 'Calendrier', icon: <CalendarDotsIcon {...NAV_ICON} /> },
    { id: 'services', label: 'Prestations', icon: <WrenchIcon {...NAV_ICON} />, count: services.length },
    { id: 'hours', label: 'Horaires', icon: <ClockIcon {...NAV_ICON} /> },
    { id: 'settings', label: 'Déplacement', icon: <CarIcon {...NAV_ICON} /> },
    // Zone d'intervention : uniquement si l'artisan se déplace chez ses clients
    ...(config.travel_mode === 'premises'
      ? []
      : [{ id: 'zone' as const, label: "Zone d'intervention", icon: <MapTrifoldIcon {...NAV_ICON} /> }]),
    { id: 'config', label: 'Configuration', icon: <GearSixIcon {...NAV_ICON} /> },
  ];

  return (
    <AdminShell
      companyName={config.company_name}
      onLogout={handleLogout}
      nav={{ items: navItems, active: activeTab, onSelect: setActiveTab }}
      notices={notices}
      fill={!loading && ((activeTab === 'appointments' && !creatingAppointment) || activeTab === 'calendar' || (activeTab === 'hours' && hoursView === 'unavailabilities'))}
    >
      {openedId !== null && appointments.some((a) => a.id === openedId) && (
        <AppointmentDialog
          appointment={appointments.find((a) => a.id === openedId)!}
          onClose={() => setOpenedId(null)}
          onChanged={replaceAppointment}
          // Le journal remplace la fenêtre (pas de fenêtres empilées), avec retour possible
          onEmails={(appointment) => {
            setOpenedId(null);
            setEmailsFor({ appointment, fromDialog: true });
          }}
          onAnonymize={setAnonymizing}
        />
      )}
      {emailsFor && (
        <NotificationsDialog
          appointment={emailsFor.appointment}
          onClose={() => setEmailsFor(null)}
          onBack={
            emailsFor.fromDialog
              ? () => {
                  setOpenedId(emailsFor.appointment.id);
                  setEmailsFor(null);
                }
              : undefined
          }
        />
      )}
      {anonymizing && (
        <ConfirmDialog
          title="Effacer les données du client ?"
          confirmLabel="Effacer définitivement"
          onConfirm={confirmAnonymize}
          onCancel={() => setAnonymizing(null)}
        >
          Le nom, l'email, le téléphone, l'adresse et les notes de <strong>{anonymizing.client_name}</strong> seront
          effacés, ainsi que les adresses du journal des emails. Le rendez-vous reste dans le planning (prestation,
          date, montant, commune). Cette action est irréversible : à utiliser pour une demande d'effacement.
        </ConfirmDialog>
      )}
      {loading ? (
        <p>Chargement des données...</p>
      ) : activeTab === 'appointments' && creatingAppointment ? (
        <NewAppointment
          config={config}
          services={services}
          initialDate={newAppointmentDate}
          onCancel={() => {
            setCreatingAppointment(false);
            setNewAppointmentDate(null);
          }}
          onDone={() => {
            setCreatingAppointment(false);
            setNewAppointmentDate(null);
            loadData();
          }}
        />
      ) : activeTab === 'calendar' ? (
        <Suspense fallback={<p>Chargement du calendrier…</p>}>
          <AppointmentCalendar
            appointments={appointments}
            onChanged={replaceAppointment}
            // Même fenêtre que depuis la liste : on reste sur le calendrier
            onOpen={(appointment) => setOpenedId(appointment.id)}
            onCreate={(date) => {
              setNewAppointmentDate(date);
              setCreatingAppointment(true);
              setActiveTab('appointments');
            }}
          />
        </Suspense>
      ) : activeTab === 'appointments' ? (
        <div className="admin-page">
            <Suspense fallback={<p>Chargement de la liste…</p>}>
              <InterventionsGrid
                appointments={filteredAppointments}
                totalCount={appointments.length}
                onCreate={() => setCreatingAppointment(true)}
                filters={
                  <>
                    <div className="admin-search-wrapper">
                      <MagnifyingGlassIcon size={18} weight="bold" className="admin-search-icon" aria-hidden="true" />
                      <input
                        type="text"
                        className="form-input admin-search-input"
                        placeholder="Rechercher…"
                        title="Client, téléphone, adresse, prestation"
                        aria-label="Rechercher : client, téléphone, adresse, prestation"
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
                  </>
                }
                activeFilters={[
                  ...(statusFilter !== 'all'
                    ? [{ id: 'status', label: statusOptions.find((o) => o.value === statusFilter)!.label, onClear: () => setStatusFilter('all') }]
                    : []),
                  ...(timeFilter !== 'all'
                    ? [{ id: 'period', label: periodOptions.find((o) => o.value === timeFilter)!.label, onClear: () => setTimeFilter('all') }]
                    : []),
                  ...(dateLabel ? [{ id: 'date', label: dateLabel, onClear: clearDates }] : []),
                ]}
                quickFilters={
                  <>
                    <ToggleGroup
                      label="Statut"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={statusOptions}
                    />
                    <ToggleGroup
                      label="Période"
                      value={timeFilter}
                      onChange={setTimeFilter}
                      options={periodOptions}
                    />
                    <div className="toggle-group" role="group" aria-label="Date">
                      <span className="toggle-group__label">Date</span>
                      <div className="admin-date-filter">
                        <div className="admin-filter-pills">
                          {(
                            [
                              ['day', 'Jour'],
                              ['range', 'Du … au …'],
                            ] as const
                          ).map(([mode, label]) => (
                            <button
                              key={mode}
                              type="button"
                              className={clsx('admin-pill-btn', { 'admin-pill-btn--active': dateMode === mode })}
                              aria-pressed={dateMode === mode}
                              onClick={() => {
                                setDateMode(mode);
                                setDateEndFilter('');
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="date"
                          className="admin-time-select"
                          value={dateFilter}
                          max={dateMode === 'range' ? dateEndFilter || undefined : undefined}
                          onChange={(e) => setDateFilter(e.target.value)}
                          aria-label={dateMode === 'day' ? 'Jour précis' : 'Début de la période'}
                        />
                        {dateMode === 'range' && (
                          <input
                            type="date"
                            className="admin-time-select"
                            value={dateEndFilter}
                            min={dateFilter || undefined}
                            onChange={(e) => setDateEndFilter(e.target.value)}
                            aria-label="Fin de la période"
                          />
                        )}
                        {(dateFilter || dateEndFilter) && (
                          <button
                            type="button"
                            className="btn btn-secondary admin-btn-sm data-grid__icon-btn"
                            onClick={clearDates}
                            title="Toutes les dates"
                            aria-label="Retirer le filtre de date"
                          >
                            <XIcon size={16} weight="bold" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                }
                onOpen={(appointment) => setOpenedId(appointment.id)}
                onStatusChange={handleStatusChange}
                onEmails={openNotifications}
                onAnonymize={setAnonymizing}
              />
            </Suspense>

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
      ) : activeTab === 'zone' ? (
        <ZoneWorkspace config={config} onSaved={setConfig} />
      ) : activeTab === 'hours' ? (
        <div className="admin-page">
          {/* Sous-onglets : semaine type, indisponibilités (grille) */}
          <div className="admin-subtabs" role="tablist" aria-label="Horaires">
            {(
              [
                ['week', 'Semaine type'],
                ['unavailabilities', 'Indisponibilités'],
              ] as const
            ).map(([view, label]) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={hoursView === view}
                className={clsx('admin-subtabs__tab', { 'admin-subtabs__tab--active': hoursView === view })}
                onClick={() => setHoursView(view)}
              >
                {label}
              </button>
            ))}
          </div>
          {hoursView === 'week' ? (
            <div className="admin-config">
              <ScheduleEditor />
            </div>
          ) : (
            <Suspense fallback={<p>Chargement…</p>}>
              <UnavailabilitiesGrid />
            </Suspense>
          )}
        </div>
      ) : activeTab === 'config' ? (
        <div className="admin-config">
          {[...CONFIG_GROUPS, buildOtherGroup(config)].map(
            (group) =>
              group && (
                <React.Fragment key={group.id}>
                <ConfigGroupForm key={group.id} group={group} config={config} onSaved={setConfig}>
                  {group.id === 'contact' && <ProEmailField config={config} onSaved={setConfig} />}
                  {group.id === 'identity' && (
                    <div className="admin-settings-form">
                      <BrandingField kind="logo" url={config.branding_logo_url} onChange={applyBranding} />
                      <BrandingField
                        kind="favicon"
                        url={config.branding_favicon_url}
                        logoUrl={config.branding_logo_url}
                        onChange={applyBranding}
                      />
                    </div>
                  )}
                </ConfigGroupForm>
                {group.id === 'identity' && <AppearanceEditor config={config} onSaved={setConfig} />}
                {group.id === 'vitrine' && <EngagementsEditor config={config} onSaved={setConfig} />}
                {group.id === 'contact' && <MailStatus proEmail={config.pro_email} />}
                {group.id === 'contact' && <CalendarFeedSettings />}
                {group.id === 'contact' && <PasswordChange onChanged={refreshSession} />}
                </React.Fragment>
              )
          )}
        </div>
      ) : (
        <div className="admin-config">
          <TravelSettingsEditor config={config} onSaved={setConfig} />
          {config.travel_mode !== 'premises' && (
            <section className="admin-config-group">
              <div className="admin-section-header">
                <h3 className="admin-section-title">Frais de déplacement par paliers</h3>
              </div>
              <p className="admin-settings-intro">
                Ces paliers s'appliquent aux prestations réglées sur « Paliers kilométriques ». La distance est
                calculée à vol d'oiseau jusqu'à l'adresse du client.
              </p>

              <form className="admin-settings-form" onSubmit={handleSaveTravelSettings}>
                <fieldset className="form-group form-fieldset">
                  <legend className="form-label">Distance calculée depuis</legend>
                  <label className="form-fieldset__option">
                    <input
                      type="radio"
                      name="travel_fee_origin"
                      checked={travelSettings.travel_fee_origin !== 'company'}
                      onChange={() => updateTravelSetting('travel_fee_origin', 'start')}
                    />
                    Le point de départ (centre de la zone d'intervention)
                  </label>
                  <label className="form-fieldset__option">
                    <input
                      type="radio"
                      name="travel_fee_origin"
                      checked={travelSettings.travel_fee_origin === 'company'}
                      onChange={() => updateTravelSetting('travel_fee_origin', 'company')}
                    />
                    L'adresse de l'entreprise
                    {!config.premises_latitude && ' (non renseignée : le point de départ est utilisé)'}
                  </label>
                </fieldset>
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

                <div className="admin-settings-actions">
                  <button type="submit" className="btn btn-primary" disabled={travelSettingsSaving}>
                    {travelSettingsSaving ? 'Enregistrement…' : 'Enregistrer les paliers'}
                  </button>
                  <ResetButton
                    dirty={JSON.stringify(travelSettings) !== JSON.stringify(extractTravelSettings(config))}
                    disabled={travelSettingsSaving}
                    onReset={() => {
                      setTravelSettings(extractTravelSettings(config));
                      setTravelSettingsMessage(null);
                    }}
                  />
                  {travelSettingsMessage && (
                    <span className="admin-settings-message">{travelSettingsMessage}</span>
                  )}
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminDashboard;
