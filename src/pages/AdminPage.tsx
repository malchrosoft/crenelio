import React, { lazy, Suspense } from 'react';

// Espace Artisan chargé à la demande : il n'alourdit pas le parcours des clients
const AdminDashboard = lazy(() => import('../components/AdminDashboard'));

/** Page `/admin` : espace Artisan en pleine page. */
const AdminPage: React.FC = () => (
  <Suspense fallback={<p className="admin-loading">Chargement de l'espace Artisan…</p>}>
    <AdminDashboard />
  </Suspense>
);

export default AdminPage;
