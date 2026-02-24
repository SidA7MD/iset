// frontend/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NotFound() {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 select-none">
      {/* Large monospaced 404 */}
      <p
        className="font-mono font-bold leading-none text-[clamp(80px,18vw,160px)] text-cyan-500/15"
        aria-hidden="true"
      >
        404
      </p>

      {/* Content */}
      <div className="-mt-4 text-center">
        <h1 className="text-base font-semibold text-base-content">Page introuvable</h1>
        <p className="text-sm text-base-content/40 mt-1 mb-6">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to={dashboardPath}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-150"
        >
          ← Retour au Tableau de bord
        </Link>
      </div>
    </div>
  );
}
