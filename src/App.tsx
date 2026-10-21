import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from './api';
import { applyFavicon } from './utils/favicon';
import { applyDocumentTitle } from './utils/documentTitle';
import { Service, AppConfig } from './types';
import VitrinePage from './pages/VitrinePage';
import BookingPage from './pages/BookingPage';
import AppointmentManagePage from './pages/AppointmentManagePage';

/**
 * Composant racine de Crénelio.
 * Charge la config et les services une seule fois au démarrage,
 * puis les distribue aux pages via props.
 *
 * Routes :
 *   /           → Page vitrine (long scroll)
 *   /booking    → Stepper de réservation (3 étapes)
 *   /rdv/:token → Gestion d'un rendez-vous depuis le lien reçu par email
 */
export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({});
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    Promise.all([api.getConfig(), api.listServices()])
      .then(([cfg, servs]) => {
        setConfig(cfg);
        setServices(servs);
        if (cfg.branding_favicon_url) applyFavicon(cfg.branding_favicon_url);
        applyDocumentTitle(cfg.company_name);
      })
      .catch((err: Error) => {
        console.error('Erreur chargement initial:', err);
      });
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={<VitrinePage config={config} services={services} />}
      />
      <Route
        path="/booking"
        element={<BookingPage config={config} services={services} />}
      />
      <Route
        path="/rdv/:token"
        element={<AppointmentManagePage config={config} />}
      />
      {/* Fallback : toute route inconnue → vitrine */}
      <Route
        path="*"
        element={<VitrinePage config={config} services={services} />}
      />
    </Routes>
  );
};

export default App;
