// frontend/src/components/common/Sidebar.jsx
// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
// Design System Implementation:
// - Typography: Uses sidebar-specific type scale (11px labels, 13px nav items)
// - Spacing: 4px grid system, consistent 12px horizontal padding
// - Active State: Left indicator bar (3px) + subtle 8% background
// - Colors: Semantic tokens from CSS custom properties
// - Accessibility: WCAG 2.1 AA compliant contrast, focus-visible states
// ══════════════════════════════════════════════════════════════════════════════

import { HardDrive, Home, Radio, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Sidebar Navigation
 * 
 * @param {boolean} isMobileOpen - Controls mobile drawer visibility
 * @param {function} onClose - Callback to close mobile sidebar
 */
export default function Sidebar({ isMobileOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Navigation configuration
  const adminLinks = [
    { path: '/admin', icon: Home, label: 'Tableau de bord' },
    { path: '/admin/devices', icon: HardDrive, label: 'Appareils' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
  ];

  const userLinks = [
    { path: '/dashboard', icon: Home, label: 'Tableau de bord' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  // Route matching logic
  const isActive = (path) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // User avatar initials
  const initials = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* ── Mobile Backdrop Overlay ───────────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Panel ─────────────────────────────────────────────────────── */}
      <aside
        id="sidebar-nav"
        aria-label="Main navigation"
        className={`sidebar ${isMobileOpen ? 'sidebar--open' : 'sidebar--closed'}`}
      >
        {/* ── Brand Header ──────────────────────────────────────────────────────── */}
        <div className="sidebar-header">
          {/* Logo */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-sm" aria-hidden="true">
            <Radio className="w-4 h-4 text-white" />
          </div>

          {/* Brand Text */}
          <div className="min-w-0 flex-1">
            <p className="sidebar-brand-text">
              ISET<span className="sidebar-brand-badge">+</span>
            </p>
            <p className="sidebar-brand-subtitle">
              {isAdmin ? 'Panneau Admin' : 'Panneau Utilisateur'}
            </p>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────────────────────── */}
        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {/* Section Label */}
          <p className="sidebar-section-label">Navigation</p>

          {/* Navigation Items */}
          <ul className="sidebar-nav-list" role="list">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''}`}
                  >
                    <Icon
                      className={`sidebar-nav-icon ${active ? 'sidebar-nav-icon--active' : 'sidebar-nav-icon--default'}`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── User Profile Footer ───────────────────────────────────────────────── */}
        <div className="sidebar-user">
          <div className="sidebar-user-card">
            {/* Avatar */}
            <div className="sidebar-avatar" aria-hidden="true">
              {initials}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <p className="sidebar-user-name">
                {user?.username || 'User'}
              </p>
              <p className="sidebar-user-role">
                {user?.role || 'user'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
