
// =====================================================

// frontend/src/pages/NotFound.jsx
import { AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <AlertCircle className="h-24 w-24 text-error mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary gap-2">
          <Home className="h-5 w-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
