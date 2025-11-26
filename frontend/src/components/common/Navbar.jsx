// frontend/src/components/common/Navbar.jsx
import { Activity, Bell, LogOut, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAlerts } from '../../hooks/useAlerts';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const { unacknowledgedCount } = useAlerts();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'operator') return '/operator';
    return '/dashboard';
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="navbar bg-base-100 shadow-lg border-b border-base-300 px-4 sm:px-6 lg:px-8">
      {/* Left Section - Logo & Brand */}
      <div className="flex-1">
        <Link
          to={getDashboardPath()}
          className="btn btn-ghost normal-case text-xl p-2 sm:p-3 hover:bg-base-200 transition-all duration-200"
        >
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">IoT Monitor</span>
          <span className="sm:hidden">IoT</span>
        </Link>
      </div>

      {/* Right Section - Navigation Items */}
      <div className="flex-none gap-1 sm:gap-2 lg:gap-4">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2">
          <div
            className={`badge badge-lg ${connected ? 'badge-success' : 'badge-error'} gap-2 px-3 py-2 transition-all duration-300`}
            title={connected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-white' : 'bg-base-100'}`}></div>
            <span className="hidden lg:inline">{connected ? 'Live' : 'Offline'}</span>
            <span className="lg:hidden">{connected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>

        {/* Mobile Connection Status */}
        <div className="sm:hidden tooltip tooltip-bottom" data-tip={connected ? 'Connected' : 'Disconnected'}>
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success' : 'bg-error'} animate-pulse`}></div>
        </div>

        {/* Notifications */}
        <div className="indicator">
          {unacknowledgedCount > 0 && (
            <span className="indicator-item badge badge-error badge-sm min-w-5 h-5 flex items-center justify-center animate-bounce">
              {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
            </span>
          )}
          <button
            className="btn btn-ghost btn-circle btn-sm sm:btn-md relative group"
            title="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Navigation Links for Larger Screens */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/settings"
            className={`btn btn-ghost btn-sm gap-2 ${isActivePath('/settings') ? 'btn-active' : ''}`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link
            to="/profile"
            className={`btn btn-ghost btn-sm gap-2 ${isActivePath('/profile') ? 'btn-active' : ''}`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </div>

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar placeholder transition-all duration-200 hover:scale-105 focus:scale-105"
            aria-label="User menu"
          >
            <div className="bg-primary text-primary-content rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-primary/20">
              <span className="text-sm sm:text-xl font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </label>

          <ul
            tabIndex={0}
            className="dropdown-content z-[100] mt-3 p-2 shadow-2xl bg-base-100 rounded-box w-72 sm:w-80 border border-base-300 animate-in fade-in-90 zoom-in-95"
          >
            {/* User Info Section */}
            <li className="px-4 py-3 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base-content truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-sm text-base-content/70 truncate">
                    {user?.email || 'No email'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-sm badge-outline capitalize">
                      {user?.role || 'user'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success' : 'bg-error'}`}></div>
                  </div>
                </div>
              </div>
            </li>

            {/* Quick Links */}
            <li className="md:hidden">
              <Link to="/profile" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 transition-colors">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </li>
            <li className="md:hidden">
              <Link to="/settings" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 transition-colors">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </li>

            {/* Logout */}
            <li className="border-t border-base-300 mt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-3 px-4 text-error hover:bg-error/10 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
