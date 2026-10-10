import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Appointment, Service, AppConfig } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  // Nouvelle prestation
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');
  const [newServicePrice, setNewServicePrice] = useState('50.00');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
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

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createService({
        name: newServiceName,
        duration_minutes: parseInt(newServiceDuration, 10),
        price: parseFloat(newServicePrice),
        is_active: 1,
      });
      setNewServiceName('');
      const updated = await api.listServices(true);
      setServices(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
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

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ maxWidth: 440, margin: '40px auto' }}>
        <h2 className="card-title">Connexion Espace Pro</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 20 }}>
          Saisissez votre mot de passe d'administration (par défaut : <code>admin123</code>).
        </p>

        {loginError && (
          <div
            style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: 10,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: '0.85rem',
            }}
          >
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--gray-200)',
          paddingBottom: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--gray-900)' }}>Espace Gestion Artisan</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            Entreprise : {config.company_name || 'Crénelio'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onBackToClient}>
            Voir l'espace client
          </button>
          <button className="btn btn-secondary" onClick={() => setIsAuthenticated(false)}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('appointments')}
        >
          Planning des rendez-vous ({appointments.length})
        </button>
        <button
          className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('services')}
        >
          Prestations ({services.length})
        </button>
      </div>

      {loading ? (
        <p>Chargement des données...</p>
      ) : activeTab === 'appointments' ? (
        <div>
          {appointments.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', padding: '24px 0', textAlign: 'center' }}>
              Aucun rendez-vous enregistré pour le moment.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Prestation</th>
                  <th>Client</th>
                  <th>Adresse d'intervention</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => {
                  const startObj = new Date(a.start_datetime);
                  const dateStr = format(startObj, 'dd/MM/yyyy HH:mm', { locale: fr });
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{dateStr}</td>
                      <td>{a.service_name}</td>
                      <td>
                        <strong>{a.client_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                          {a.client_phone}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {a.address}, {a.postal_code} {a.city}
                      </td>
                      <td>
                        <span className={`status-badge status-${a.status}`}>{a.status}</span>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="completed">Terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Prestations actives</h3>
          <div className="services-grid" style={{ marginBottom: 28 }}>
            {services.map((s) => (
              <div
                key={s.id}
                className="service-card"
                style={{ opacity: s.is_active ? 1 : 0.6 }}
              >
                <div>
                  <div className="service-name">{s.name}</div>
                  <div className="service-desc">{s.description}</div>
                </div>
                <div className="service-meta">
                  <span className="badge badge-duration">⏱ {s.duration_minutes} min</span>
                  <span className="badge badge-price">💶 {s.price} €</span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleToggleService(s)}
                  >
                    {s.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Ajouter une nouvelle prestation</h3>
          <form
            onSubmit={handleAddService}
            style={{
              background: 'var(--gray-50)',
              padding: 16,
              borderRadius: 'var(--radius)',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: '2 1 200px' }}>
              <label className="form-label">Nom de la prestation</label>
              <input
                type="text"
                className="form-input"
                required
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Ex: Remplacement robinet"
              />
            </div>
            <div style={{ flex: '1 1 100px' }}>
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
            <div style={{ flex: '1 1 100px' }}>
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
            <button type="submit" className="btn btn-primary">
              + Ajouter
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
