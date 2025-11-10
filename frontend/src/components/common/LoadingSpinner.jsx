// =====================================================
// frontend/src/components/common/LoadingSpinner.jsx
export default function LoadingSpinner({
  message = 'Loading...',
  size = 'lg', // 'sm', 'md', 'lg', 'xl'
  variant = 'primary', // 'primary', 'secondary', 'accent', 'neutral'
  fullScreen = false,
  overlay = false,
  className = ''
}) {
  // Size variants
  const sizeStyles = {
    sm: {
      spinner: 'loading-sm',
      text: 'text-sm',
      gap: 'mt-2'
    },
    md: {
      spinner: 'loading-md',
      text: 'text-base',
      gap: 'mt-3'
    },
    lg: {
      spinner: 'loading-lg',
      text: 'text-lg',
      gap: 'mt-4'
    },
    xl: {
      spinner: 'loading-xl',
      text: 'text-xl',
      gap: 'mt-5'
    }
  };

  // Color variants
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    neutral: 'text-neutral'
  };

  const currentSize = sizeStyles[size];
  const currentColor = colorClasses[variant];

  // Container styles based on props
  const containerClasses = `
    flex flex-col items-center justify-center p-4 sm:p-6 md:p-8
    ${fullScreen ? 'min-h-screen w-full' : ''}
    ${overlay ? 'absolute inset-0 bg-base-100/80 backdrop-blur-sm z-50' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses}>
      {/* Spinner */}
      <div className="relative">
        <span
          className={`loading loading-spinner ${currentSize.spinner} ${currentColor}`}
          aria-label="Loading"
        ></span>

        {/* Optional: Pulsing animation effect */}
        <div className={`absolute inset-0 ${currentColor} opacity-20 animate-ping rounded-full`}></div>
      </div>

      {/* Message with responsive typography */}
      {message && (
        <div className={`${currentSize.gap} text-center`}>
          <p className={`${currentSize.text} text-base-content/70 font-medium leading-relaxed`}>
            {message}
          </p>

          {/* Optional: Subtle loading dots animation */}
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-1 h-1 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
