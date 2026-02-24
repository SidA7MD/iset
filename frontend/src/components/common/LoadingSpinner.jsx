// frontend/src/components/common/LoadingSpinner.jsx
/**
 * LoadingSpinner — refined with blue accent and skeleton shimmer option.
 * Props unchanged for backward compatibility.
 */
export default function LoadingSpinner({
  message = 'Chargement...',
  size = 'lg',      // 'sm' | 'md' | 'lg' | 'xl'
  variant = 'primary',
  fullScreen = false,
  overlay = false,
  className = ''
}) {
  const sizeStyles = {
    sm: { spinner: 'loading-sm', text: 'text-xs', gap: 'mt-2' },
    md: { spinner: 'loading-md', text: 'text-sm', gap: 'mt-3' },
    lg: { spinner: 'loading-lg', text: 'text-sm', gap: 'mt-4' },
    xl: { spinner: 'loading-xl', text: 'text-base', gap: 'mt-5' },
  };

  const currentSize = sizeStyles[size] || sizeStyles.lg;

  const containerClasses = [
    'flex flex-col items-center justify-center p-8',
    fullScreen ? 'min-h-screen w-full' : '',
    overlay ? 'absolute inset-0 bg-base-100/80 backdrop-blur-sm z-50' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Spinner — cyan tinted */}
      <span
        className={`loading loading-spinner ${currentSize.spinner} text-cyan-400`}
        aria-label="Loading"
      />

      {/* Message */}
      {message && (
        <div className={currentSize.gap}>
          <p className={`${currentSize.text} text-base-content/40 font-medium text-center`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
