import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  CalendarCheckIcon,
  HouseIcon,
  SidebarSimpleIcon,
  SignOutIcon,
} from '@phosphor-icons/react';
import AdminNotices, { AdminNotice } from './AdminNotices';

export type AdminTab =
  | 'dashboard'
  | 'appointments'
  | 'calendar'
  | 'unavailabilities'
  | 'services'
  | 'hours'
  | 'booking'
  | 'settings'
  | 'zone'
  | 'company'
  | 'site'
  | 'theme'
  | 'account';

export interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  count?: number;
  /** Catégorie du menu : intitulé affiché avant le premier élément du groupe. */
  group?: string;
}

interface AdminShellProps {
  companyName?: string | null;
  /** Absent avant connexion : ni menu ni déconnexion. */
  nav?: { items: NavItem[]; active: AdminTab; onSelect: (tab: AdminTab) => void };
  onLogout?: () => void;
  /** Avertissements regroupés dans le header (cf. AdminNotices). */
  notices?: AdminNotice[];
  /** Écran de travail en pleine hauteur (liste, grille) : la page ne défile plus. */
  fill?: boolean;
  children: React.ReactNode;
}

const COLLAPSED_KEY = 'crenelio.admin.sidebarCollapsed';

/**
 * Mise en page pleine page de l'espace Artisan : header fixe, menu latéral rétractable.
 * Le site public s'ouvre dans un nouvel onglet pour ne pas quitter la gestion.
 */
const AdminShell: React.FC<AdminShellProps> = ({ companyName, nav, onLogout, notices = [], fill = false, children }) => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1');

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className={clsx('admin-shell', { 'admin-shell--collapsed': collapsed, 'admin-shell--no-nav': !nav })}>
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          {nav && (
            <button
              type="button"
              className="admin-topbar__toggle"
              aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
              aria-expanded={!collapsed}
              aria-controls="admin-sidebar"
              onClick={() => setCollapsed((c) => !c)}
            >
              <SidebarSimpleIcon size={22} weight="fill" aria-hidden="true" />
            </button>
          )}
          <span className="admin-topbar__title">Espace Artisan</span>
          <span className="admin-topbar__company">{companyName || 'Crénelio'}</span>
        </div>

        <nav className="admin-topbar__actions" aria-label="Liens du site">
          <AdminNotices notices={notices} />
          <a className="admin-topbar__link" href="/" target="_blank" rel="noopener">
            <HouseIcon size={18} weight="fill" aria-hidden="true" />
            <span>Accueil</span>
          </a>
          <a className="admin-topbar__link" href="/booking" target="_blank" rel="noopener">
            <CalendarCheckIcon size={18} weight="fill" aria-hidden="true" />
            <span>Espace client</span>
          </a>
          {onLogout && (
            <button type="button" className="btn btn-secondary admin-topbar__logout" onClick={onLogout}>
              <SignOutIcon size={18} weight="fill" aria-hidden="true" />
              <span>Déconnexion</span>
            </button>
          )}
        </nav>
      </header>

      {nav && (
        <aside className="admin-sidebar" id="admin-sidebar">
          <nav aria-label="Gestion">
            <ul className="admin-sidebar__list">
              {nav.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {item.group && item.group !== nav.items[index - 1]?.group && (
                    // Menu replié : seul le trait de séparation reste
                    <li className="admin-sidebar__group" role="presentation">
                      <span className="admin-sidebar__group-label">{item.group}</span>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      className={clsx('admin-sidebar__item', { 'admin-sidebar__item--active': nav.active === item.id })}
                      aria-current={nav.active === item.id ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={() => nav.onSelect(item.id)}
                    >
                      {item.icon}
                      <span className="admin-sidebar__label">{item.label}</span>
                      {item.count !== undefined && <span className="admin-sidebar__count">{item.count}</span>}
                    </button>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <main className={clsx('admin-main', { 'admin-main--fill': fill })}>{children}</main>
    </div>
  );
};

export default AdminShell;
