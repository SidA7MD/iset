
// =====================================================

// frontend/src/layouts/AuthLayout.jsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
