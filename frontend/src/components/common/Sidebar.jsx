// frontend/src/components/common/Sidebar.jsx
import { AlertCircle, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: AlertCircle, label: 'Users' },
  ];

  const userLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/alerts', icon: AlertCircle, label: 'Alerts' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn btn-ghost btn-square btn-sm bg-base-200 shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-base-200 min-h-screen p-4 border-r border-base-300
        fixed lg:sticky top-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        h-screen overflow-y-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-base-content">
            IoT Monitor
          </h1>
          <p className="text-sm text-base-content/60 mt-1 capitalize">
            {user?.role || 'User'} Panel
          </p>
        </div>

        {/* Navigation */}
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={closeMobileSidebar}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 font-medium
                    group relative
                    ${active
                      ? 'bg-base-300 text-base-content shadow-inner'
                      : 'text-base-content/80 hover:bg-base-300 hover:text-base-content'
                    }
                  `}
                >
                  {/* Icon */}
                  <Icon className={`
                    h-5 w-5 transition-transform duration-200
                    ${active ? 'scale-110' : 'group-hover:scale-105'}
                  `} />

                  {/* Label */}
                  <span className="flex-1">{link.label}</span>

                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-base-content rounded-full"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Info - Mobile only */}
        <div className="lg:hidden mt-auto pt-6 border-t border-base-300">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-base-300 rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-base-content">
                {user?.username}
              </p>
              <p className="text-xs text-base-content/60 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
