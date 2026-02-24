// frontend/src/components/common/Navbar.jsx
import { LogOut, Menu, Radio, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Navbar — ultra-slim h-12, hairline bottom border, blue brand accent
 * Props:
 *   onMenuToggle  – callback to open/close the mobile sidebar
 *   isMobileOpen  – current open state of the mobile sidebar (for aria-expanded)
 */
export default function Navbar({ onMenuToggle, isMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout API fails
      navigate('/login', { replace: true });
    }
  };

  const getDashboardPath = () =>
    user?.role === 'admin' ? '/admin' : '/dashboard';

  const initials = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <header
      role="banner"
      className="h-12 flex items-center bg-base-100 border-b border-base-300 px-3 sm:px-5 flex-shrink-0 z-20"
    >
      {/* ── Left: Mobile toggle + Brand ─────────────────────── */}
      <div className="flex-1 flex items-center gap-2">
        {/* Mobile sidebar toggle */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg text-base-content/60
                     hover:text-base-content hover:bg-base-200/80 transition-colors duration-150 lg:hidden"
          onClick={onMenuToggle}
          aria-label={isMobileOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
          aria-expanded={isMobileOpen}
          aria-controls="sidebar-nav"
        >
          {isMobileOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Brand / Home link */}
        <Link
          to={getDashboardPath()}
          className="flex items-center gap-2 text-base-content hover:text-base-content/80 transition-colors duration-150"
          aria-label="ISET⁺ — aller au tableau de bord"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
            <Radio className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="font-semibold text-sm tracking-tight">
            ISET<sup className="text-[10px] align-super ml-px text-cyan-500">+</sup>
          </span>
        </Link>
      </div>

      {/* ── Right: User dropdown ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer
                       ring-2 ring-cyan-500/40 ring-offset-2 ring-offset-base-100
                       bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-semibold text-sm
                       hover:ring-cyan-400 hover:scale-105 transition-all duration-200 shadow-md shadow-cyan-500/20"
            aria-label={`Menu utilisateur pour ${user?.username || 'Utilisateur'}`}
            aria-haspopup="true"
          >
            <span aria-hidden="true">{initials}</span>
          </label>

          <ul
            tabIndex={0}
            className="dropdown-content z-[100] mt-3 p-0 bg-white rounded-2xl w-72
                       border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden"
            role="menu"
          >
            {/* User info header */}
            <li className="bg-gradient-to-br from-cyan-500 to-teal-600 p-4" role="presentation">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full
                                bg-white/20 backdrop-blur-sm text-white font-bold text-lg flex-shrink-0
                                ring-2 ring-white/30">
                  <span aria-hidden="true">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-sm text-white/70 truncate">{user?.email || ''}</p>
                </div>
              </div>
              {/* Role badge */}
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase
                                tracking-wider rounded-full font-semibold
                                ${user?.role === 'admin' 
                                  ? 'bg-amber-400 text-amber-900' 
                                  : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-amber-700' : 'bg-white/60'}`} />
                  {user?.role || 'user'}
                </span>
              </div>
            </li>

            {/* Menu items */}
            <li className="p-2" role="none">
              {/* Dashboard shortcut — mobile only */}
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-600
                           hover:text-gray-900 hover:bg-gray-50 rounded-xl
                           transition-colors duration-150 md:hidden"
                role="menuitem"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                  <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
                </div>
                <span className="font-medium">Tableau de bord</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-2.5 px-3 text-sm text-rose-600
                           hover:bg-rose-50 transition-colors duration-150 w-full text-left rounded-xl
                           group"
                role="menuitem"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 
                              group-hover:bg-rose-200 transition-colors duration-150">
                  <LogOut className="h-4 w-4 text-rose-500" aria-hidden="true" />
                </div>
                <span className="font-medium">Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
